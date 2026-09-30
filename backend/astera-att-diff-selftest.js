#!/usr/bin/env node
'use strict';

import assert from 'node:assert';
import { compareCaptures } from './astera-att-diff.js';

function write(valueHex, handle = 0x25) {
  return {
    direction:'host_to_controller',
    opcodeName:'WRITE_COMMAND',
    serviceUuid:'0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65',
    attributeUuid:'12345678-1234-5678-9abc-def012345678',
    handle,
    valueHex
  };
}

function notify(valueHex, handle = 0x25) {
  return {
    direction:'controller_to_host',
    opcodeName:'HANDLE_VALUE_NOTIFICATION',
    serviceUuid:'0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65',
    attributeUuid:'12345678-1234-5678-9abc-def012345678',
    handle,
    valueHex
  };
}

const reference = {
  candidateAsteraSessionWrites:[
    write('AA01'),
    write('BB02')
  ],
  attEvents:[
    notify('1000')
  ]
};

const test = {
  candidateAsteraSessionWrites:[
    write('AA01'),
    write('BB02'),
    write('CC03')
  ],
  attEvents:[
    notify('1000'),
    notify('2000')
  ]
};

const result = compareCaptures(reference, test, {
  reference:'connect-only',
  test:'dim-change'
});

assert.strictEqual(result.kind, 'LightingAI-Astera-ATT-diff');
assert.strictEqual(result.summary.referenceCandidateWrites, 2);
assert.strictEqual(result.summary.testCandidateWrites, 3);
assert.strictEqual(result.summary.commonCandidateWrites, 2);
assert.strictEqual(result.summary.referenceOnlyCandidateWrites, 0);
assert.strictEqual(result.summary.testOnlyCandidateWrites, 1);
assert.strictEqual(result.candidateParameterSpecificWrites.length, 1);
assert.strictEqual(result.candidateParameterSpecificWrites[0].sample.valueHex, 'CC03');
assert.strictEqual(result.interpretation.confidence, 'candidate_only');
assert.strictEqual(result.notificationOnlyInTest.length, 1);
assert.strictEqual(result.notificationOnlyInTest[0].sample.valueHex, '2000');

const duplicateTest = {
  candidateAsteraSessionWrites:[
    write('AA01'),
    write('AA01'),
    write('BB02')
  ],
  attEvents:[]
};
const duplicateReference = {
  candidateAsteraSessionWrites:[
    write('AA01'),
    write('BB02')
  ],
  attEvents:[]
};
const duplicateDiff = compareCaptures(duplicateReference, duplicateTest);
assert.strictEqual(duplicateDiff.summary.testOnlyCandidateWrites, 1);
assert.strictEqual(duplicateDiff.onlyInTest[0].count, 1);
assert.strictEqual(duplicateDiff.onlyInTest[0].sample.valueHex, 'AA01');

// HCI handles may change across reconnects. With a known characteristic UUID,
// the same logical write must still compare as common.
const handleChangedReference = {
  candidateAsteraSessionWrites:[write('ABCD', 0x25)],
  attEvents:[]
};
const handleChangedTest = {
  candidateAsteraSessionWrites:[write('ABCD', 0x41)],
  attEvents:[]
};
const handleChangedDiff = compareCaptures(handleChangedReference, handleChangedTest);
assert.strictEqual(handleChangedDiff.summary.commonCandidateWrites, 1);
assert.strictEqual(handleChangedDiff.summary.testOnlyCandidateWrites, 0);

// A payload change on the same endpoint is interesting, but remains only a candidate
// until repeated controlled physical captures isolate the operator parameter.
const payloadChangedReference = {
  candidateAsteraSessionWrites:[write('1000')],
  attEvents:[notify('0100')]
};
const payloadChangedTest = {
  candidateAsteraSessionWrites:[write('2000')],
  attEvents:[notify('0200')]
};
const payloadChangedDiff = compareCaptures(payloadChangedReference, payloadChangedTest);
assert.strictEqual(payloadChangedDiff.summary.changedWritePayloadEndpoints, 1);
assert.strictEqual(payloadChangedDiff.changedWritePayloadEndpoints.length, 1);
assert.deepStrictEqual(payloadChangedDiff.changedWritePayloadEndpoints[0].referencePayloads, ['1000']);
assert.deepStrictEqual(payloadChangedDiff.changedWritePayloadEndpoints[0].testPayloads, ['2000']);
assert.strictEqual(payloadChangedDiff.summary.changedNotificationPayloadEndpoints, 1);
assert.strictEqual(payloadChangedDiff.interpretation.confidence, 'candidate_only');

process.stdout.write(JSON.stringify({
  ok:true,
  candidateParameterSpecificWrites:result.candidateParameterSpecificWrites.length,
  changedWritePayloadEndpoints:payloadChangedDiff.changedWritePayloadEndpoints.length,
  notificationOnlyInTest:result.notificationOnlyInTest.length
}, null, 2) + '\n');
