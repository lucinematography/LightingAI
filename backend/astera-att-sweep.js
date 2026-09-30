#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function stableByteMap(candidate) {
  const out = new Map();
  const rows = candidate && candidate.byteConsensus &&
    Array.isArray(candidate.byteConsensus.stableBytes)
      ? candidate.byteConsensus.stableBytes
      : [];
  for (const row of rows) {
    if (row && Number.isInteger(row.index) && /^[0-9A-Fa-f]{2}$/.test(String(row.hex || ''))) {
      out.set(row.index, String(row.hex).toUpperCase());
    }
  }
  return out;
}

function analyzeNumericEncoding(rows, decodedValues, metadata = {}) {
  if (!Array.isArray(rows) || rows.length < 4 ||
      !Array.isArray(decodedValues) || decodedValues.length !== rows.length) {
    return null;
  }

  const points = rows.map((row,index) => ({
    label:row.label,
    value:Number(row.value),
    decoded:Number(decodedValues[index])
  }));

  if (points.some(p => !Number.isFinite(p.value) || !Number.isFinite(p.decoded))) {
    return null;
  }

  const distinctSetpoints = new Set(points.map(p => p.value));
  const distinctDecoded = new Set(points.map(p => p.decoded));
  if (distinctSetpoints.size < 4 || distinctDecoded.size < 4) return null;

  const ordered = points.slice().sort((a,b) => a.value - b.value);
  let increasing = true;
  let decreasing = true;
  for (let i = 1; i < ordered.length; i++) {
    if (!(ordered[i].decoded > ordered[i - 1].decoded)) increasing = false;
    if (!(ordered[i].decoded < ordered[i - 1].decoded)) decreasing = false;
  }
  if (!increasing && !decreasing) return null;

  const meanX = ordered.reduce((n,p) => n + p.value,0) / ordered.length;
  const meanY = ordered.reduce((n,p) => n + p.decoded,0) / ordered.length;
  let covariance = 0;
  let varianceX = 0;
  for (const p of ordered) {
    covariance += (p.value - meanX) * (p.decoded - meanY);
    varianceX += (p.value - meanX) ** 2;
  }
  if (varianceX === 0) return null;

  const slope = covariance / varianceX;
  const intercept = meanY - slope * meanX;
  let ssResidual = 0;
  let ssTotal = 0;
  let maxAbsResidual = 0;
  for (const p of ordered) {
    const predicted = slope * p.value + intercept;
    const residual = p.decoded - predicted;
    ssResidual += residual ** 2;
    ssTotal += (p.decoded - meanY) ** 2;
    maxAbsResidual = Math.max(maxAbsResidual, Math.abs(residual));
  }
  const rSquared = ssTotal === 0 ? 1 : 1 - (ssResidual / ssTotal);
  const linear = rSquared >= 0.999;

  return {
    ...metadata,
    relation:linear ? 'affine_linear' : 'strict_monotonic',
    direction:increasing ? 'increasing' : 'decreasing',
    slope:Number(slope.toFixed(8)),
    intercept:Number(intercept.toFixed(8)),
    rSquared:Number(rSquared.toFixed(8)),
    maxAbsResidual:Number(maxAbsResidual.toFixed(8)),
    series:ordered,
    interpretation:{
      confidence:'candidate_only',
      note:linear
        ? 'The decoded field is monotonic and fits an affine relation across at least four isolated setpoints. This is still not a verified command field until physical replay proves causality.'
        : 'The decoded field is strictly monotonic across at least four isolated setpoints but is not sufficiently linear. It may be a transformed parameter, checksum or other correlated field.'
    }
  };
}

function encodingCandidates(rows, maps, payloadLength) {
  if (!Array.isArray(rows) || rows.length < 4 ||
      !Array.isArray(maps) || maps.length !== rows.length ||
      !Number.isInteger(payloadLength) || payloadLength <= 0) {
    return [];
  }

  const out = [];

  for (let index = 0; index < payloadLength; index++) {
    const bytes = maps.map(m => m.get(index));
    if (bytes.some(v => !v)) continue;
    const decoded = bytes.map(v => parseInt(v,16));
    const candidate = analyzeNumericEncoding(rows,decoded,{
      widthBits:8,
      byteIndexes:[index],
      byteOrder:'single_byte'
    });
    if (candidate) out.push(candidate);
  }

  for (let index = 0; index + 1 < payloadLength; index++) {
    const low = maps.map(m => m.get(index));
    const high = maps.map(m => m.get(index + 1));
    if (low.some(v => !v) || high.some(v => !v)) continue;

    const le = low.map((v,i) => parseInt(v,16) | (parseInt(high[i],16) << 8));
    const be = low.map((v,i) => (parseInt(v,16) << 8) | parseInt(high[i],16));

    const leCandidate = analyzeNumericEncoding(rows,le,{
      widthBits:16,
      byteIndexes:[index,index + 1],
      byteOrder:'little_endian'
    });
    if (leCandidate) out.push(leCandidate);

    const beCandidate = analyzeNumericEncoding(rows,be,{
      widthBits:16,
      byteIndexes:[index,index + 1],
      byteOrder:'big_endian'
    });
    if (beCandidate) out.push(beCandidate);
  }

  return out.sort((a,b) =>
    (a.relation === 'affine_linear' ? 0 : 1) -
      (b.relation === 'affine_linear' ? 0 : 1) ||
    b.rSquared - a.rSquared ||
    a.widthBits - b.widthBits ||
    a.byteIndexes[0] - b.byteIndexes[0]
  );
}

function candidateByEndpoint(consensus) {
  if (!consensus || typeof consensus !== 'object') {
    throw new Error('invalid_consensus_json');
  }
  const rows = Array.isArray(consensus.repeatableCandidates)
    ? consensus.repeatableCandidates
    : [];
  const map = new Map();
  for (const row of rows) {
    if (!row || !row.endpoint) continue;
    map.set(String(row.endpoint), row);
  }
  return map;
}

function analyzeEndpoint(endpoint, cases) {
  const rows = cases.map(c => ({
    label:c.label,
    value:c.value,
    candidate:c.candidates.get(endpoint)
  }));

  if (rows.some(r => !r.candidate)) return null;

  const lengths = rows.map(r => {
    const n = r.candidate && r.candidate.byteConsensus
      ? r.candidate.byteConsensus.payloadLength
      : null;
    return Number.isInteger(n) ? n : null;
  });

  const distinctLengths = [...new Set(lengths.filter(v => v != null))];
  if (distinctLengths.length !== 1 || lengths.some(v => v == null)) {
    return {
      endpoint,
      comparable:false,
      reason:'payload_length_not_stable_across_setpoints',
      cases:rows.map(r => ({label:r.label,value:r.value,payloadLength:r.candidate?.byteConsensus?.payloadLength ?? null}))
    };
  }

  const length = distinctLengths[0];
  const maps = rows.map(r => stableByteMap(r.candidate));
  const parameterCandidateByteIndexes = [];
  const constantFramingByteIndexes = [];
  const unstableByteIndexes = [];

  for (let index = 0; index < length; index++) {
    const values = maps.map(m => m.get(index));
    if (values.some(v => !v)) {
      unstableByteIndexes.push(index);
      continue;
    }
    const unique = [...new Set(values)];
    if (unique.length === 1) {
      constantFramingByteIndexes.push({
        index,
        hex:unique[0]
      });
    } else {
      parameterCandidateByteIndexes.push({
        index,
        series:rows.map((r,i) => ({
          label:r.label,
          value:r.value,
          hex:values[i],
          decimal:parseInt(values[i],16)
        }))
      });
    }
  }

  const candidateEncodings = encodingCandidates(rows,maps,length);

  return {
    endpoint,
    comparable:true,
    payloadLength:length,
    parameterCandidateByteIndexes,
    constantFramingByteIndexes,
    unstableByteIndexes,
    candidateEncodings,
    interpretation:{
      confidence:'candidate_only',
      note:'A byte that is stable within each repeated setpoint but changes between setpoints is only a parameter candidate. Encoding and command semantics require separate physical replay proof.'
    }
  };
}

function analyzeSweep(input) {
  if (!input || typeof input !== 'object') throw new Error('invalid_sweep_manifest');
  const rawCases = Array.isArray(input.cases) ? input.cases : [];
  if (rawCases.length < 3) throw new Error('at_least_3_setpoints_required');

  const cases = rawCases.map((row,index) => {
    if (!row || row.consensus == null) {
      throw new Error('case_' + index + '_missing_consensus');
    }
    return {
      label:String(row.label || ('case-' + (index + 1))),
      value:row.value,
      candidates:candidateByEndpoint(row.consensus)
    };
  });

  const endpointCounts = new Map();
  for (const row of cases) {
    for (const endpoint of row.candidates.keys()) {
      endpointCounts.set(endpoint, (endpointCounts.get(endpoint) || 0) + 1);
    }
  }

  const sharedEndpoints = [...endpointCounts.entries()]
    .filter(([,count]) => count === cases.length)
    .map(([endpoint]) => endpoint)
    .sort();

  const endpoints = sharedEndpoints
    .map(endpoint => analyzeEndpoint(endpoint, cases))
    .filter(Boolean);

  return {
    kind:'LightingAI-Astera-ATT-sweep',
    parameter:String(input.parameter || 'unknown'),
    caseCount:cases.length,
    cases:rawCases.map((row,index) => ({
      label:String(row.label || ('case-' + (index + 1))),
      value:row.value
    })),
    summary:{
      sharedRepeatableEndpoints:sharedEndpoints.length,
      comparableEndpoints:endpoints.filter(e=>e.comparable).length,
      endpointsWithParameterCandidateBytes:endpoints.filter(e =>
        e.comparable && e.parameterCandidateByteIndexes.length > 0
      ).length,
      endpointsWithEncodingCandidates:endpoints.filter(e =>
        e.comparable && Array.isArray(e.candidateEncodings) &&
        e.candidateEncodings.length > 0
      ).length
    },
    endpoints,
    interpretation:{
      confidence:'candidate_only',
      note:'This analysis never proves a DIM/CCT/COLOR/FX command. It only identifies byte positions and possible 8-bit/16-bit numeric encodings correlated with isolated setpoint changes after within-setpoint repeatability has already been established.'
    }
  };
}

function loadManifest(file) {
  const manifestPath = path.resolve(file);
  const baseDir = path.dirname(manifestPath);
  const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const cases = Array.isArray(manifest.cases) ? manifest.cases : [];
  return {
    parameter:manifest.parameter,
    cases:cases.map(row => {
      if (!row || !row.file) throw new Error('manifest_case_missing_file');
      const consensusPath = path.resolve(baseDir, String(row.file));
      return {
        label:row.label,
        value:row.value,
        consensus:JSON.parse(fs.readFileSync(consensusPath,'utf8'))
      };
    })
  };
}

function parseArgs(argv) {
  const rest = argv.slice(2);
  const args = {manifest:'',json:''};
  while (rest.length) {
    const token = rest.shift();
    if (token === '--json') args.json = rest.shift() || '';
    else if (!args.manifest) args.manifest = token;
    else throw new Error('unknown_argument_' + token);
  }
  if (!args.manifest) {
    throw new Error('usage: node backend/astera-att-sweep.js <manifest.json> [--json out.json]');
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const result = analyzeSweep(loadManifest(args.manifest));
  const body = JSON.stringify(result,null,2) + '\n';
  if (args.json) fs.writeFileSync(args.json,body);
  else process.stdout.write(body);
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedFile && path.resolve(currentFile) === invokedFile) {
  try {
    main();
  } catch (error) {
    process.stderr.write(String(error && error.message ? error.message : error) + '\n');
    process.exit(1);
  }
}

export {
  stableByteMap,
  analyzeNumericEncoding,
  encodingCandidates,
  candidateByEndpoint,
  analyzeEndpoint,
  analyzeSweep,
  loadManifest,
  parseArgs
};
