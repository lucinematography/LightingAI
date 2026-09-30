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

  return {
    endpoint,
    comparable:true,
    payloadLength:length,
    parameterCandidateByteIndexes,
    constantFramingByteIndexes,
    unstableByteIndexes,
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
      ).length
    },
    endpoints,
    interpretation:{
      confidence:'candidate_only',
      note:'This analysis never proves a DIM/CCT/COLOR/FX command. It only identifies byte positions correlated with isolated setpoint changes after within-setpoint repeatability has already been established.'
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
  candidateByEndpoint,
  analyzeEndpoint,
  analyzeSweep,
  loadManifest,
  parseArgs
};
