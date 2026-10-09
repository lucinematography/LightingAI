#!/usr/bin/env node
'use strict';

import assert from 'node:assert';
import {
  endpointIdentity,
  byteConsensus,
  buildConsensus,
  parseArgs
} from './astera-att-consensus.js';

function candidate(valueHex, handle = 0x25, attributeUuid = '12345678-1234-5678-9abc-def012345678') {
  return {
    count:1,
    sample:{
      direction:'host_to_controller',
      opcodeName:'WRITE_COMMAND',
      serviceUuid:'0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65',
      attributeUuid,
      handle,
      valueHex
    }
  };
}

function diff(rows, peerAddress='11:22:33:44:55:66') {
  return {
    kind:'LightingAI-Astera-ATT-diff',
    captureIdentity:{
      peerAddress,
      verifiedMatch:true,
      warning:''
    },
    candidateParameterSpecificWrites:rows,
    interpretation:{confidence:'candidate_only'}
  };
}

const run1 = diff([
  candidate('AA10CC01', 0x25),
  candidate('9988', 0x40, 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
]);
const run2 = diff([
  candidate('AA20CC02', 0x41)
]);
const run3 = diff([
  candidate('AA30CC03', 0x57)
]);

const result = buildConsensus([run1, run2, run3]);

assert.strictEqual(result.kind, 'LightingAI-Astera-ATT-consensus');
assert.strictEqual(result.captureIdentity.peerAddress,'11:22:33:44:55:66');
assert.strictEqual(result.captureIdentity.verifiedAcrossRuns,true);
assert.strictEqual(result.captureIdentity.warning,'');
assert.strictEqual(result.minimumRuns, 3);
assert.strictEqual(result.analyzedRuns, 3);
assert.strictEqual(result.summary.repeatableCandidateEndpoints, 1);
assert.strictEqual(result.summary.partialCandidateEndpoints, 1);
assert.strictEqual(result.interpretation.confidence, 'candidate_only');

const repeatable = result.repeatableCandidates[0];
assert.strictEqual(repeatable.presentRuns, 3);
assert.strictEqual(repeatable.presentInEveryRun, true);
assert.deepStrictEqual(repeatable.payloads, ['AA10CC01','AA20CC02','AA30CC03']);
assert.strictEqual(repeatable.byteConsensus.payloadLength, 4);
assert.deepStrictEqual(repeatable.byteConsensus.stableBytes, [
  {index:0,hex:'AA'},
  {index:2,hex:'CC'}
]);
assert.deepStrictEqual(repeatable.byteConsensus.variableByteIndexes, [1,3]);
assert.strictEqual(repeatable.byteConsensus.exactPayloadRepeat, false);

const partial = result.partialCandidates[0];
assert.strictEqual(partial.presentRuns, 1);
assert.strictEqual(partial.presentInEveryRun, false);

const sameLogicalEndpointA = endpointIdentity(candidate('ABCD', 0x20).sample);
const sameLogicalEndpointB = endpointIdentity(candidate('ABCD', 0x77).sample);
assert.strictEqual(sameLogicalEndpointA, sameLogicalEndpointB);

const exact = byteConsensus(['AABB','AABB','AABB']);
assert.strictEqual(exact.exactPayloadRepeat, true);
assert.deepStrictEqual(exact.variableByteIndexes, []);

const mixedLength = byteConsensus(['AA','AABB','AABBCC']);
assert.strictEqual(mixedLength.payloadLength, null);
assert.deepStrictEqual(mixedLength.observedLengths, [1,2,3]);

assert.throws(
  () => buildConsensus([run1,run2]),
  /at_least_3_diff_captures_required/
);
assert.throws(
  () => buildConsensus([
    run1,
    run2,
    diff([candidate('AA30CC03')],'AA:BB:CC:DD:EE:FF')
  ]),
  /peer_address_mismatch_across_diff_captures/
);

const unverifiedRun=diff([candidate('AA30CC03')]);
unverifiedRun.captureIdentity.verifiedMatch=false;
assert.throws(
  () => buildConsensus([run1,run2,unverifiedRun]),
  /unverified_fixture_identity_in_diff_capture/
);

const missingIdentityRun={
  kind:'LightingAI-Astera-ATT-diff',
  candidateParameterSpecificWrites:[candidate('AA30CC03')],
  interpretation:{confidence:'candidate_only'}
};
assert.throws(
  () => buildConsensus([run1,run2,missingIdentityRun]),
  /capture_identity_missing_in_some_diff_captures/
);
assert.throws(
  () => parseArgs(['node','astera-att-consensus.js','a.json','b.json']),
  /usage:/
);
assert.strictEqual(
  parseArgs(['node','astera-att-consensus.js','a.json','b.json','c.json']).inputs.length,
  3
);

process.stdout.write(JSON.stringify({
  ok:true,
  repeatableCandidateEndpoints:result.repeatableCandidates.length,
  partialCandidateEndpoints:result.partialCandidates.length,
  stableBytes:repeatable.byteConsensus.stableBytes,
  variableByteIndexes:repeatable.byteConsensus.variableByteIndexes,
  peerAddress:result.captureIdentity.peerAddress
}, null, 2) + '\n');
