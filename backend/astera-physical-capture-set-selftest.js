#!/usr/bin/env node
'use strict';

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeCaptureSet } from './astera-physical-capture-set.js';

const address='AA:BB:CC:DD:EE:FF';
const service='0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65';
const startupUuid='11111111-2222-3333-4444-555555555555';
const controlUuid='aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

function write(uuid,valueHex,elapsedMs){
  return {
    direction:'host_to_controller',
    opcode:0x52,
    opcodeName:'WRITE_COMMAND',
    serviceUuid:service,
    attributeUuid:uuid,
    handle:uuid===startupUuid?16:18,
    valueHex,
    elapsedMs
  };
}

function capture(extraWrite,addressOverride=address){
  const writes=[write(startupUuid,'10203040',100)];
  if(extraWrite) writes.push(extraWrite);
  return {
    filter:{address:addressOverride},
    analysisCoverage:{
      mappingWarning:'',
      asteraPrivateServiceMapped:true,
      attributeUuidMappings:2,
      mappingSource:'capture'
    },
    connections:[{peerAddress:addressOverride}],
    candidateAsteraSessionWrites:writes,
    attEvents:[]
  };
}

const connectOnly=[capture(),capture(),capture()];
const dim=[capture(write(controlUuid,'AA10',500)),capture(write(controlUuid,'AA10',510)),capture(write(controlUuid,'AA10',520))];
const cct=[capture(write(controlUuid,'BB20',500)),capture(write(controlUuid,'BB20',510)),capture(write(controlUuid,'BB20',520))];

const result=analyzeCaptureSet({connectOnly,dim,cct});
assert.strictEqual(result.captureIdentity.verifiedAcrossRuns,true);
assert.strictEqual(result.summary.connectOnlyRuns,3);
assert.strictEqual(result.summary.dimRuns,3);
assert.strictEqual(result.summary.cctRuns,3);
assert.strictEqual(result.summary.dimRepeatableCandidateEndpoints,1);
assert.strictEqual(result.summary.cctRepeatableCandidateEndpoints,1);
assert.strictEqual(result.dim.consensus.repeatableCandidates[0].payloads[0],'AA10');
assert.strictEqual(result.cct.consensus.repeatableCandidates[0].payloads[0],'BB20');
assert.strictEqual(result.interpretation.confidence,'candidate_only');

assert.throws(
  ()=>analyzeCaptureSet({
    connectOnly,
    dim:[capture(write(controlUuid,'AA10',500),'11:22:33:44:55:66'),...dim.slice(1)],
    cct
  }),
  /peer_address_mismatch|session_baseline_peer_address_mismatch/
);

assert.throws(
  ()=>analyzeCaptureSet({connectOnly:connectOnly.slice(0,2),dim,cct}),
  /requires_at_least_3_captures/
);

const noCoverage=capture();
delete noCoverage.analysisCoverage;
assert.throws(
  ()=>analyzeCaptureSet({connectOnly:[noCoverage,...connectOnly.slice(1)],dim,cct}),
  /analysis_coverage_missing/
);

const incompleteMapping=capture();
incompleteMapping.analysisCoverage.mappingWarning='gatt_mapping_incomplete_capture_may_use_cached_handles';
assert.throws(
  ()=>analyzeCaptureSet({connectOnly:[incompleteMapping,...connectOnly.slice(1)],dim,cct}),
  /gatt_mapping_incomplete/
);

const privateServiceMissing=capture();
privateServiceMissing.analysisCoverage.asteraPrivateServiceMapped=false;
assert.throws(
  ()=>analyzeCaptureSet({connectOnly:[privateServiceMissing,...connectOnly.slice(1)],dim,cct}),
  /astera_private_service_not_mapped/
);

const mappingSourceMissing=capture();
mappingSourceMissing.analysisCoverage.mappingSource='none';
assert.throws(
  ()=>analyzeCaptureSet({connectOnly:[mappingSourceMissing,...connectOnly.slice(1)],dim,cct}),
  /mapping_source_unverified/
);

const currentFile=fileURLToPath(import.meta.url);
const templatePath=path.join(
  path.dirname(currentFile),
  'astera-physical-capture-set.example.json'
);
const template=JSON.parse(fs.readFileSync(templatePath,'utf8'));
assert.strictEqual(template.kind,'LightingAI-Astera-physical-capture-set-manifest');
assert.deepStrictEqual(template.connectOnly,[
  'titan-connect-01.json',
  'titan-connect-02.json',
  'titan-connect-03.json'
]);
assert.deepStrictEqual(template.dim,[
  'titan-dim-01.json',
  'titan-dim-02.json',
  'titan-dim-03.json'
]);
assert.deepStrictEqual(template.cct,[
  'titan-cct-01.json',
  'titan-cct-02.json',
  'titan-cct-03.json'
]);

process.stdout.write(JSON.stringify({
  ok:true,
  dimRepeatableCandidateEndpoints:result.summary.dimRepeatableCandidateEndpoints,
  cctRepeatableCandidateEndpoints:result.summary.cctRepeatableCandidateEndpoints,
  peerAddress:result.captureIdentity.peerAddress
},null,2)+'\n');
