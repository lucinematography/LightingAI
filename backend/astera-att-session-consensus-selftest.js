#!/usr/bin/env node
'use strict';

import assert from 'node:assert';
import {
  byteConsensus,
  intervalStats,
  analyzeSessionCaptures,
  parseArgs
} from './astera-att-session-consensus.js';

const address='11:22:33:44:55:66';
const service='0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65';

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

function notify(attributeUuid,valueHex,elapsedMs,recordIndex){
  return {
    direction:'controller_to_host',
    opcodeName:'HANDLE_VALUE_NOTIFICATION',
    serviceUuid:service,
    attributeUuid,
    handle:0x35,
    valueHex,
    elapsedMs,
    recordIndex
  };
}

function capture(sessionPayload, peerAddress=address){
  const authUuid='12345678-1234-5678-9abc-def012345678';
  const setupUuid='aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const keepaliveUuid='99999999-8888-7777-6666-555555555555';
  const responseUuid='77777777-6666-5555-4444-333333333333';
  const responsePayload='90'+sessionPayload.slice(-2);
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
    attEvents:[
      notify(responseUuid,responsePayload,140,10)
    ]
  };
}

const run1=capture('AA10CC01');
const run2=capture('AA20CC02');
const run3=capture('AA30CC03');

const result=analyzeSessionCaptures([run1,run2,run3]);

assert.strictEqual(result.kind,'LightingAI-Astera-ATT-session-consensus');
assert.strictEqual(result.analyzedRuns,3);
assert.strictEqual(result.captureIdentity.peerAddress,address);
assert.strictEqual(result.captureIdentity.verifiedAcrossRuns,true);
assert.strictEqual(result.summary.commonEndpointPrefixLength,5);
assert.strictEqual(result.summary.repeatableWriteResponseCandidates,1);
assert.strictEqual(result.summary.repeatablePeriodicEndpointCandidates,1);
assert.strictEqual(result.interpretation.confidence,'candidate_only');

const first=result.commonEndpointPrefix[0];
assert.strictEqual(first.position,0);
assert.strictEqual(first.payloadConsensus.payloadLength,4);
assert.deepStrictEqual(first.payloadConsensus.stableBytes,[
  {index:0,hex:'AA'},
  {index:2,hex:'CC'}
]);
assert.deepStrictEqual(first.payloadConsensus.variableByteIndexes,[1,3]);
assert.strictEqual(first.payloadConsensus.exactPayloadRepeat,false);

const second=result.commonEndpointPrefix[1];
assert.strictEqual(second.payloadConsensus.exactPayloadRepeat,true);
assert.deepStrictEqual(second.payloadConsensus.variableByteIndexes,[]);

const response=result.repeatableWriteResponsePairs[0];
assert.strictEqual(response.writePosition,0);
assert.strictEqual(response.responseLatencyMs.min,40);
assert.strictEqual(response.responseLatencyMs.max,40);
assert.strictEqual(response.responseLatencyMs.median,40);
assert.strictEqual(response.responsePayloadConsensus.payloadLength,2);
assert.deepStrictEqual(response.responsePayloadConsensus.stableBytes,[
  {index:0,hex:'90'}
]);
assert.deepStrictEqual(response.responsePayloadConsensus.variableByteIndexes,[1]);
assert.strictEqual(response.interpretation.confidence,'candidate_only');

const periodic=result.periodicEndpointCandidates[0];
assert.strictEqual(periodic.presentRuns,3);
assert.strictEqual(periodic.medianIntervalMs,1000);
assert.strictEqual(periodic.intervalSpreadRatio,1);
assert.strictEqual(periodic.payloadConsensus.exactPayloadRepeat,true);
assert.strictEqual(periodic.interpretation.confidence,'candidate_only');

const stats=intervalStats([
  {elapsedMs:1000},
  {elapsedMs:2000},
  {elapsedMs:3000},
  {elapsedMs:4000}
]);
assert.strictEqual(stats.stablePeriodic,true);
assert.strictEqual(stats.medianIntervalMs,1000);
assert.strictEqual(stats.coefficientOfVariation,0);

const bytes=byteConsensus(['AABB','AACC','AAFF']);
assert.deepStrictEqual(bytes.stableBytes,[{index:0,hex:'AA'}]);
assert.deepStrictEqual(bytes.variableByteIndexes,[1]);

assert.throws(
  ()=>analyzeSessionCaptures([run1,run2]),
  /at_least_3_connect_only_captures_required/
);
assert.throws(
  ()=>analyzeSessionCaptures([
    run1,
    run2,
    capture('AA30CC03','AA:BB:CC:DD:EE:FF')
  ]),
  /peer_address_mismatch_across_connect_only_captures/
);

const incomplete=capture('AA30CC03');
incomplete.analysisCoverage.mappingWarning='gatt_mapping_incomplete_capture_may_use_cached_handles';
assert.throws(
  ()=>analyzeSessionCaptures([run1,run2,incomplete]),
  /capture_2_gatt_mapping_incomplete/
);

assert.throws(
  ()=>parseArgs(['node','astera-att-session-consensus.js','a.json','b.json']),
  /usage:/
);
assert.strictEqual(
  parseArgs([
    'node','astera-att-session-consensus.js',
    'a.json','b.json','c.json'
  ]).inputs.length,
  3
);

process.stdout.write(JSON.stringify({
  ok:true,
  commonEndpointPrefixLength:result.summary.commonEndpointPrefixLength,
  repeatableWriteResponseCandidates:result.summary.repeatableWriteResponseCandidates,
  repeatablePeriodicEndpointCandidates:result.summary.repeatablePeriodicEndpointCandidates,
  variableStartupByteIndexes:first.payloadConsensus.variableByteIndexes,
  peerAddress:result.captureIdentity.peerAddress
},null,2)+'\n');
