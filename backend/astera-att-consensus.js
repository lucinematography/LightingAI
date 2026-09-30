#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function endpointIdentity(row) {
  if (row && row.endpoint) return String(row.endpoint);
  const e = row && row.sample ? row.sample : {};
  const attribute = e.attributeUuid
    ? 'uuid:' + String(e.attributeUuid).toLowerCase()
    : 'handle:' + (e.handle != null ? String(e.handle) : '');
  return [
    String(e.direction || ''),
    String(e.opcodeName || ''),
    String(e.serviceUuid || '').toLowerCase(),
    attribute
  ].join('|');
}

function candidateRows(diff) {
  if (!diff || typeof diff !== 'object') {
    throw new Error('invalid_diff_json');
  }
  const rows = Array.isArray(diff.candidateParameterSpecificWrites)
    ? diff.candidateParameterSpecificWrites
    : Array.isArray(diff.onlyInTest)
      ? diff.onlyInTest
      : [];
  return rows.map(row => ({
    endpoint:endpointIdentity(row),
    count:Math.max(0, Number(row && row.count || 0)),
    sample:row && row.sample ? row.sample : {}
  })).filter(row => row.endpoint && row.count > 0);
}

function payloadBytes(value) {
  const hex = String(value || '').trim().toUpperCase();
  if (!hex || hex.length % 2 !== 0 || !/^[0-9A-F]+$/.test(hex)) return null;
  return Buffer.from(hex, 'hex');
}

function byteConsensus(payloads) {
  const normalized = payloads
    .map(v => String(v || '').trim().toUpperCase())
    .filter(Boolean);
  const buffers = normalized.map(payloadBytes).filter(Boolean);

  if (!buffers.length) {
    return {
      payloadLength:null,
      observedLengths:[],
      stableBytes:[],
      variableByteIndexes:[],
      exactPayloadRepeat:false
    };
  }

  const lengths = [...new Set(buffers.map(b => b.length))].sort((a,b)=>a-b);
  if (lengths.length !== 1) {
    return {
      payloadLength:null,
      observedLengths:lengths,
      stableBytes:[],
      variableByteIndexes:[],
      exactPayloadRepeat:new Set(normalized).size === 1
    };
  }

  const length = lengths[0];
  const stableBytes = [];
  const variableByteIndexes = [];

  for (let i = 0; i < length; i++) {
    const values = [...new Set(buffers.map(b => b[i]))];
    if (values.length === 1) {
      stableBytes.push({
        index:i,
        hex:values[0].toString(16).padStart(2, '0').toUpperCase()
      });
    } else {
      variableByteIndexes.push(i);
    }
  }

  return {
    payloadLength:length,
    observedLengths:lengths,
    stableBytes,
    variableByteIndexes,
    exactPayloadRepeat:new Set(normalized).size === 1
  };
}

function buildConsensus(diffInputs, options = {}) {
  const minimumRuns = Math.max(3, Number(options.minimumRuns || 3));
  if (!Array.isArray(diffInputs) || diffInputs.length < minimumRuns) {
    throw new Error('at_least_' + minimumRuns + '_diff_captures_required');
  }

  const buckets = new Map();

  diffInputs.forEach((diff, runIndex) => {
    const seenThisRun = new Set();
    for (const row of candidateRows(diff)) {
      if (!buckets.has(row.endpoint)) {
        buckets.set(row.endpoint, {
          endpoint:row.endpoint,
          presentRuns:new Set(),
          rows:[]
        });
      }
      const bucket = buckets.get(row.endpoint);
      if (!seenThisRun.has(row.endpoint)) {
        bucket.presentRuns.add(runIndex);
        seenThisRun.add(row.endpoint);
      }
      bucket.rows.push({
        runIndex,
        count:row.count,
        sample:row.sample
      });
    }
  });

  const repeatableCandidates = [];
  const partialCandidates = [];

  for (const bucket of buckets.values()) {
    const payloads = bucket.rows
      .map(row => row.sample && row.sample.valueHex ? String(row.sample.valueHex).toUpperCase() : '')
      .filter(Boolean);

    const item = {
      endpoint:bucket.endpoint,
      presentRuns:bucket.presentRuns.size,
      totalRuns:diffInputs.length,
      presentInEveryRun:bucket.presentRuns.size === diffInputs.length,
      totalCandidateCount:bucket.rows.reduce((n,row)=>n+row.count,0),
      payloads,
      byteConsensus:byteConsensus(payloads),
      samples:bucket.rows
    };

    if (item.presentInEveryRun && item.totalRuns >= minimumRuns) {
      repeatableCandidates.push(item);
    } else {
      partialCandidates.push(item);
    }
  }

  const sortRows = rows => rows.sort((a,b) =>
    b.presentRuns - a.presentRuns ||
    b.totalCandidateCount - a.totalCandidateCount ||
    a.endpoint.localeCompare(b.endpoint)
  );
  sortRows(repeatableCandidates);
  sortRows(partialCandidates);

  return {
    kind:'LightingAI-Astera-ATT-consensus',
    minimumRuns,
    analyzedRuns:diffInputs.length,
    summary:{
      repeatableCandidateEndpoints:repeatableCandidates.length,
      partialCandidateEndpoints:partialCandidates.length
    },
    repeatableCandidates,
    partialCandidates,
    interpretation:{
      confidence:'candidate_only',
      note:'A repeatable endpoint or byte pattern is protocol evidence only. It is not a verified DIM/CCT/COLOR/FX command until a later physical replay reproduces only the intended fixture change.'
    }
  };
}

function parseArgs(argv) {
  const rest = argv.slice(2);
  const args = {inputs:[], json:'', minimumRuns:3};
  while (rest.length) {
    const token = rest.shift();
    if (token === '--json') args.json = rest.shift() || '';
    else if (token === '--minimum-runs') args.minimumRuns = Number(rest.shift() || 3);
    else if (token.startsWith('--')) throw new Error('unknown_argument_' + token);
    else args.inputs.push(token);
  }
  if (args.inputs.length < Math.max(3, args.minimumRuns)) {
    throw new Error(
      'usage: node backend/astera-att-consensus.js <run1-diff.json> <run2-diff.json> <run3-diff.json> [...] [--minimum-runs 3] [--json out.json]'
    );
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const diffs = args.inputs.map(file => JSON.parse(fs.readFileSync(file, 'utf8')));
  const result = buildConsensus(diffs, {minimumRuns:args.minimumRuns});
  const body = JSON.stringify(result, null, 2) + '\n';
  if (args.json) fs.writeFileSync(args.json, body);
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
  endpointIdentity,
  candidateRows,
  byteConsensus,
  buildConsensus,
  parseArgs
};
