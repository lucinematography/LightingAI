#!/usr/bin/env node
'use strict';

import assert from 'node:assert';
import { analyzeSessionCaptures } from './astera-att-session-consensus.js';
import {
  startupPrefix,
  filterSessionBaseline,
  parseArgs
} from './astera-att-session-filter.js';

const address='11:22:33:44:55:66';
const service='0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65';
const authUuid='12345678-1234-5678-9abc-def012345678';
const setupUuid='aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const keepaliveUuid='99999999-8888-7777-6666-555555555555';
const dimUuid='22222222-3333-4444-5555-666666666666';

function write(attributeUuid,valueHex,elapsedMs,recordIndex){
  return {
    direction:'host_to_controller',
    opcodeName:'WRITE_COMMAND',
    serviceUuid:service,
    attributeUuid,
    handle:0x25,
    valueHex,
    elapsedMs,
    recordIndex
  };
}

function connectOnly(sessionPayload, peerAddress=address){
  return {
    filter:{address:peerAddress},
    analysisCoverage:{mappingWarning:''},
    candidateAsteraSessionWrites:[
      write(authUuid,sessionPayload,100,1),
      write(setupUuid,'DEAD',200,2),
      write(keepaliveUuid,'55AA',1000,3),
      write(keepaliveUuid,'55AA',2000,4),
      write(keepaliveUuid,'55AA',3000,5)
    ],
    attEvents:[]
  };
}

const session=analyzeSessionCaptures([
  connectOnly('AA10CC01'),
  connectOnly('AA20CC02'),
  connectOnly('AA30CC03')
]);

const prefix=startupPrefix(session);
assert.strictEqual(prefix.length,2);
assert.ok(prefix[0].endpoint.includes(authUuid));
assert.ok(prefix[1].endpoint.includes(setupUuid));

const parameterCapture={
  filter:{address},
  analysisCoverage:{mappingWarning:''},
  candidateAsteraSessionWrites:[
    write(authUuid,'AA44CC99',100,1),
    write(setupUuid,'DEAD',200,2),
    write(dimUuid,'BEEF',500,3),
    write(keepaliveUuid,'55AA',1000,4),
    write(keepaliveUuid,'55AA',2000,5),
    write(keepaliveUuid,'55AA',3000,6)
  ],
  attEvents:[]
};

const filtered=filterSessionBaseline(parameterCapture,session);
assert.strictEqual(filtered.kind,'LightingAI-Astera-session-filtered-capture');
assert.strictEqual(filtered.sessionBaselineFilter.verifiedSamePeer,true);
assert.strictEqual(filtered.sessionBaselineFilter.startupPrefixWritesRemoved,2);
assert.strictEqual(filtered.sessionBaselineFilter.originalCandidateWriteCount,6);
assert.strictEqual(filtered.sessionBaselineFilter.remainingCandidateWriteCount,4);
assert.strictEqual(filtered.sessionBaselineFilter.periodicEndpointCandidatesPreserved,1);
assert.strictEqual(filtered.sessionBaselineWrites[0].valueHex,'AA44CC99');
assert.strictEqual(filtered.sessionBaselineWrites[1].valueHex,'DEAD');
assert.strictEqual(filtered.candidateAsteraSessionWrites[0].attributeUuid,dimUuid);
assert.strictEqual(filtered.candidateAsteraSessionWrites[0].valueHex,'BEEF');
assert.strictEqual(
  filtered.candidateAsteraSessionWrites.filter(x=>x.attributeUuid===keepaliveUuid).length,
  3
);

const wrongPeer={
  ...parameterCapture,
  filter:{address:'AA:BB:CC:DD:EE:FF'}
};
assert.throws(
  ()=>filterSessionBaseline(wrongPeer,session),
  /session_baseline_peer_address_mismatch/
);

const wrongFraming={
  ...parameterCapture,
  candidateAsteraSessionWrites:[
    write(authUuid,'AB44CC99',100,1),
    ...parameterCapture.candidateAsteraSessionWrites.slice(1)
  ]
};
assert.throws(
  ()=>filterSessionBaseline(wrongFraming,session),
  /session_baseline_payload_mismatch_position_0/
);

const wrongEndpoint={
  ...parameterCapture,
  candidateAsteraSessionWrites:[
    write('ffffffff-eeee-dddd-cccc-bbbbbbbbbbbb','AA44CC99',100,1),
    ...parameterCapture.candidateAsteraSessionWrites.slice(1)
  ]
};
assert.throws(
  ()=>filterSessionBaseline(wrongEndpoint,session),
  /session_baseline_endpoint_mismatch_position_0/
);

const incomplete={
  ...parameterCapture,
  analysisCoverage:{
    mappingWarning:'gatt_mapping_incomplete_capture_may_use_cached_handles'
  }
};
assert.throws(
  ()=>filterSessionBaseline(incomplete,session),
  /capture_gatt_mapping_incomplete/
);

const unverifiedSession={
  ...session,
  captureIdentity:{
    ...session.captureIdentity,
    verifiedAcrossRuns:false
  }
};
assert.throws(
  ()=>filterSessionBaseline(parameterCapture,unverifiedSession),
  /session_consensus_fixture_identity_not_verified/
);

assert.throws(
  ()=>parseArgs(['node','astera-att-session-filter.js','capture.json']),
  /usage:/
);
assert.strictEqual(
  parseArgs([
    'node','astera-att-session-filter.js',
    'capture.json','session.json'
  ]).session,
  'session.json'
);

process.stdout.write(JSON.stringify({
  ok:true,
  startupPrefixWritesRemoved:filtered.sessionBaselineFilter.startupPrefixWritesRemoved,
  remainingCandidateWriteCount:filtered.sessionBaselineFilter.remainingCandidateWriteCount,
  firstRemainingCandidate:filtered.candidateAsteraSessionWrites[0].valueHex,
  periodicEndpointCandidatesPreserved:filtered.sessionBaselineFilter.periodicEndpointCandidatesPreserved
},null,2)+'\n');
