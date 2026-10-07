#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function normalizePeerAddress(value) {
  return String(value || '').trim().replace(/-/g, ':').toUpperCase();
}

function capturePeerAddress(capture) {
  if (!capture || typeof capture !== 'object') return '';
  if (capture.filter && capture.filter.address) {
    return normalizePeerAddress(capture.filter.address);
  }
  const addresses = new Set();
  for (const row of Array.isArray(capture.connections) ? capture.connections : []) {
    const address = normalizePeerAddress(row && (row.peerAddress || row.address));
    if (address) addresses.add(address);
  }
  if (addresses.size > 1) throw new Error('capture_contains_multiple_peer_addresses');
  return addresses.size === 1 ? [...addresses][0] : '';
}

function endpointIdentity(event) {
  const attribute = event && event.attributeUuid
    ? 'uuid:' + String(event.attributeUuid).toLowerCase()
    : 'handle:' + (event && event.handle != null ? String(event.handle) : '');
  return [
    String(event && event.direction || ''),
    String(event && event.opcodeName || ''),
    String(event && event.serviceUuid || '').toLowerCase(),
    attribute
  ].join('|');
}

function payloadBytes(value) {
  const hex = String(value || '').trim().toUpperCase();
  if (!hex || hex.length % 2 !== 0 || !/^[0-9A-F]+$/.test(hex)) return null;
  return Buffer.from(hex,'hex');
}

function matchesPayloadConsensus(valueHex, consensus, samples=[]) {
  if (!consensus || typeof consensus !== 'object') return false;
  const bytes = payloadBytes(valueHex);
  if (!bytes) return false;

  if (Number.isInteger(consensus.payloadLength) &&
      bytes.length !== consensus.payloadLength) {
    return false;
  }

  const stable = Array.isArray(consensus.stableBytes)
    ? consensus.stableBytes
    : [];

  for (const row of stable) {
    if (!row || !Number.isInteger(row.index) ||
        !/^[0-9A-Fa-f]{2}$/.test(String(row.hex || ''))) {
      return false;
    }
    if (row.index < 0 || row.index >= bytes.length) return false;
    if (bytes[row.index] !== parseInt(row.hex,16)) return false;
  }

  if (consensus.exactPayloadRepeat === true) {
    const exact = Array.isArray(samples)
      ? samples.find(row => row && row.valueHex)
      : null;
    if (!exact) return stable.length > 0;
    return String(exact.valueHex).toUpperCase() === String(valueHex).toUpperCase();
  }

  return stable.length > 0;
}

function startupPrefix(sessionConsensus) {
  if (!sessionConsensus || typeof sessionConsensus !== 'object') {
    throw new Error('invalid_session_consensus');
  }
  const prefix = Array.isArray(sessionConsensus.commonEndpointPrefix)
    ? sessionConsensus.commonEndpointPrefix
    : [];
  if (!prefix.length) throw new Error('session_consensus_missing_common_prefix');

  const periodicEndpoints = new Set(
    (Array.isArray(sessionConsensus.periodicEndpointCandidates)
      ? sessionConsensus.periodicEndpointCandidates
      : []
    ).map(row => String(row && row.endpoint || '')).filter(Boolean)
  );

  const out = [];
  for (const row of prefix) {
    if (periodicEndpoints.has(String(row && row.endpoint || ''))) break;
    out.push(row);
  }
  if (!out.length) throw new Error('session_consensus_startup_prefix_empty');
  return out;
}

function filterSessionBaseline(capture, sessionConsensus) {
  if (!capture || typeof capture !== 'object') {
    throw new Error('invalid_capture_json');
  }
  const mappingWarning = capture.analysisCoverage &&
    typeof capture.analysisCoverage.mappingWarning === 'string'
      ? capture.analysisCoverage.mappingWarning
      : '';
  if (mappingWarning) {
    throw new Error('capture_gatt_mapping_incomplete_' + mappingWarning);
  }

  if (!sessionConsensus || typeof sessionConsensus !== 'object') {
    throw new Error('invalid_session_consensus');
  }
  const identity = sessionConsensus.captureIdentity;
  if (!identity || identity.verifiedAcrossRuns !== true ||
      identity.warning || !identity.peerAddress) {
    throw new Error('session_consensus_fixture_identity_not_verified');
  }

  const captureAddress = capturePeerAddress(capture);
  const sessionAddress = normalizePeerAddress(identity.peerAddress);
  if (!captureAddress) throw new Error('capture_peer_address_missing');
  if (captureAddress !== sessionAddress) {
    throw new Error(
      'session_baseline_peer_address_mismatch_' +
      sessionAddress + '_vs_' + captureAddress
    );
  }

  const prefix = startupPrefix(sessionConsensus);
  const writes = Array.isArray(capture.candidateAsteraSessionWrites)
    ? capture.candidateAsteraSessionWrites.slice()
    : [];
  writes.sort((a,b) =>
    Number(a && a.elapsedMs || 0) - Number(b && b.elapsedMs || 0) ||
    Number(a && a.recordIndex || 0) - Number(b && b.recordIndex || 0)
  );

  if (writes.length < prefix.length) {
    throw new Error('capture_shorter_than_verified_session_startup_prefix');
  }

  const baselineWrites = [];
  for (let index=0; index<prefix.length; index++) {
    const expected = prefix[index];
    const event = writes[index];
    if (Number(expected && expected.position) !== index) {
      throw new Error('session_consensus_prefix_position_invalid_' + index);
    }
    if (endpointIdentity(event) !== String(expected.endpoint || '')) {
      throw new Error('session_baseline_endpoint_mismatch_position_' + index);
    }
    if (!matchesPayloadConsensus(
      event && event.valueHex,
      expected.payloadConsensus,
      expected.samples
    )) {
      throw new Error('session_baseline_payload_mismatch_position_' + index);
    }
    baselineWrites.push(event);
  }

  const remainingWrites = writes.slice(prefix.length);

  return {
    ...capture,
    kind:'LightingAI-Astera-session-filtered-capture',
    candidateAsteraSessionWrites:remainingWrites,
    sessionBaselineWrites:baselineWrites,
    sessionBaselineFilter:{
      peerAddress:captureAddress,
      verifiedSamePeer:true,
      startupPrefixWritesRemoved:baselineWrites.length,
      originalCandidateWriteCount:writes.length,
      remainingCandidateWriteCount:remainingWrites.length,
      periodicEndpointCandidatesPreserved:Array.isArray(
        sessionConsensus.periodicEndpointCandidates
      ) ? sessionConsensus.periodicEndpointCandidates.length : 0,
      note:'Only the verified connect-only startup prefix before the first periodic endpoint was removed. Periodic traffic remains visible for later differential analysis.'
    }
  };
}

function parseArgs(argv) {
  const rest=argv.slice(2);
  const args={capture:'',session:'',json:''};
  while(rest.length){
    const token=rest.shift();
    if(token==='--json') args.json=rest.shift()||'';
    else if(!args.capture) args.capture=token;
    else if(!args.session) args.session=token;
    else throw new Error('unknown_argument_'+token);
  }
  if(!args.capture || !args.session){
    throw new Error(
      'usage: node backend/astera-att-session-filter.js <capture.json> <session-consensus.json> [--json out.json]'
    );
  }
  return args;
}

function main(){
  const args=parseArgs(process.argv);
  const capture=JSON.parse(fs.readFileSync(args.capture,'utf8'));
  const session=JSON.parse(fs.readFileSync(args.session,'utf8'));
  const result=filterSessionBaseline(capture,session);
  const body=JSON.stringify(result,null,2)+'\n';
  if(args.json) fs.writeFileSync(args.json,body);
  else process.stdout.write(body);
}

const currentFile=fileURLToPath(import.meta.url);
const invokedFile=process.argv[1]?path.resolve(process.argv[1]):'';
if(invokedFile && path.resolve(currentFile)===invokedFile){
  try{main();}
  catch(error){
    process.stderr.write(String(error&&error.message?error.message:error)+'\n');
    process.exit(1);
  }
}

export {
  normalizePeerAddress,
  capturePeerAddress,
  endpointIdentity,
  payloadBytes,
  matchesPayloadConsensus,
  startupPrefix,
  filterSessionBaseline,
  parseArgs
};
