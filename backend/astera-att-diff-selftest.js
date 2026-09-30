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
assert.strictEqual(result.likelyParameterSpecificWrites.length, 1);
assert.strictEqual(result.likelyParameterSpecificWrites[0].sample.valueHex, 'CC03');
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

process.stdout.write(JSON.stringify({
  ok:true,
  likelyParameterSpecificWrites:result.likelyParameterSpecificWrites.length,
  notificationOnlyInTest:result.notificationOnlyInTest.length
}, null, 2) + '\n');
