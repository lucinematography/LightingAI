#!/usr/bin/env node
'use strict';

import assert from 'node:assert';
import {
  stableByteMap,
  analyzeSweep,
  parseArgs
} from './astera-att-sweep.js';

const endpoint='host_to_controller|WRITE_COMMAND|0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65|uuid:12345678-1234-5678-9abc-def012345678';

function consensus(stableBytes, variableByteIndexes=[3], peerAddress='11:22:33:44:55:66') {
  return {
    kind:'LightingAI-Astera-ATT-consensus',
    captureIdentity:{
      peerAddress,
      verifiedAcrossRuns:true,
      warning:''
    },
    repeatableCandidates:[{
      endpoint,
      byteConsensus:{
        payloadLength:4,
        stableBytes,
        variableByteIndexes,
        exactPayloadRepeat:false
      }
    }]
  };
}

const input={
  parameter:'DIM',
  cases:[
    {
      label:'DIM 10',
      value:10,
      consensus:consensus([
        {index:0,hex:'AA'},
        {index:1,hex:'10'},
        {index:2,hex:'CC'}
      ])
    },
    {
      label:'DIM 50',
      value:50,
      consensus:consensus([
        {index:0,hex:'AA'},
        {index:1,hex:'50'},
        {index:2,hex:'CC'}
      ])
    },
    {
      label:'DIM 90',
      value:90,
      consensus:consensus([
        {index:0,hex:'AA'},
        {index:1,hex:'90'},
        {index:2,hex:'CC'}
      ])
    },
    {
      label:'DIM 100',
      value:100,
      consensus:consensus([
        {index:0,hex:'AA'},
        {index:1,hex:'A0'},
        {index:2,hex:'CC'}
      ])
    }
  ]
};

const result=analyzeSweep(input);

assert.strictEqual(result.kind,'LightingAI-Astera-ATT-sweep');
assert.strictEqual(result.captureIdentity.peerAddress,'11:22:33:44:55:66');
assert.strictEqual(result.captureIdentity.verifiedAcrossSetpoints,true);
assert.strictEqual(result.captureIdentity.warning,'');
assert.strictEqual(result.parameter,'DIM');
assert.strictEqual(result.caseCount,4);
assert.strictEqual(result.summary.sharedRepeatableEndpoints,1);
assert.strictEqual(result.summary.comparableEndpoints,1);
assert.strictEqual(result.summary.endpointsWithParameterCandidateBytes,1);
assert.strictEqual(result.summary.endpointsWithEncodingCandidates,1);
assert.strictEqual(result.interpretation.confidence,'candidate_only');

const row=result.endpoints[0];
assert.strictEqual(row.endpoint,endpoint);
assert.strictEqual(row.comparable,true);
assert.strictEqual(row.payloadLength,4);
assert.deepStrictEqual(row.constantFramingByteIndexes,[
  {index:0,hex:'AA'},
  {index:2,hex:'CC'}
]);
assert.deepStrictEqual(row.unstableByteIndexes,[3]);
assert.strictEqual(row.parameterCandidateByteIndexes.length,1);
assert.strictEqual(row.parameterCandidateByteIndexes[0].index,1);
assert.deepStrictEqual(
  row.parameterCandidateByteIndexes[0].series.map(x=>x.hex),
  ['10','50','90','A0']
);

const dim8=row.candidateEncodings.find(x =>
  x.widthBits===8 &&
  x.byteIndexes.length===1 &&
  x.byteIndexes[0]===1 &&
  x.relation==='affine_linear'
);
assert.ok(dim8,'8-bit DIM encoding candidate missing');
assert.strictEqual(dim8.direction,'increasing');
assert.strictEqual(dim8.slope,1.6);
assert.strictEqual(dim8.intercept,0);
assert.strictEqual(dim8.rSquared,1);
assert.strictEqual(dim8.interpretation.confidence,'candidate_only');

const leEndpoint='host_to_controller|WRITE_COMMAND|0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65|uuid:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
function leConsensus(low,high, peerAddress='11:22:33:44:55:66'){
  return {
    kind:'LightingAI-Astera-ATT-consensus',
    captureIdentity:{
      peerAddress,
      verifiedAcrossRuns:true,
      warning:''
    },
    repeatableCandidates:[{
      endpoint:leEndpoint,
      byteConsensus:{
        payloadLength:4,
        stableBytes:[
          {index:0,hex:'AA'},
          {index:1,hex:low},
          {index:2,hex:high},
          {index:3,hex:'CC'}
        ],
        variableByteIndexes:[],
        exactPayloadRepeat:true
      }
    }]
  };
}

const leSweep=analyzeSweep({
  parameter:'CCT-candidate',
  cases:[
    {label:'250',value:250,consensus:leConsensus('FA','00')},
    {label:'260',value:260,consensus:leConsensus('04','01')},
    {label:'510',value:510,consensus:leConsensus('FE','01')},
    {label:'520',value:520,consensus:leConsensus('08','02')}
  ]
});
const leRow=leSweep.endpoints.find(x=>x.endpoint===leEndpoint);
assert.ok(leRow,'16-bit LE endpoint missing');
const le16=leRow.candidateEncodings.find(x =>
  x.widthBits===16 &&
  x.byteOrder==='little_endian' &&
  x.byteIndexes[0]===1 &&
  x.byteIndexes[1]===2
);
assert.ok(le16,'16-bit LE encoding candidate missing');
assert.strictEqual(le16.relation,'affine_linear');
assert.strictEqual(le16.direction,'increasing');
assert.strictEqual(le16.slope,1);
assert.strictEqual(le16.intercept,0);
assert.strictEqual(le16.rSquared,1);
assert.strictEqual(
  leRow.candidateEncodings.some(x =>
    x.widthBits===8 &&
    x.byteIndexes.length===1 &&
    x.byteIndexes[0]===1
  ),
  false
);

const stableMap=stableByteMap({
  byteConsensus:{
    stableBytes:[
      {index:0,hex:'aa'},
      {index:2,hex:'cc'}
    ]
  }
});
assert.strictEqual(stableMap.get(0),'AA');
assert.strictEqual(stableMap.get(2),'CC');

assert.throws(
  ()=>analyzeSweep({
    parameter:'DIM',
    cases:input.cases.slice(0,2)
  }),
  /at_least_3_setpoints_required/
);

const mixedLength={
  parameter:'DIM',
  cases:[
    input.cases[0],
    input.cases[1],
    {
      label:'DIM 90',
      value:90,
      consensus:{
        captureIdentity:{
          peerAddress:'11:22:33:44:55:66',
          verifiedAcrossRuns:true,
          warning:''
        },
        repeatableCandidates:[{
          endpoint,
          byteConsensus:{
            payloadLength:5,
            stableBytes:[{index:0,hex:'AA'}],
            variableByteIndexes:[1,2,3,4]
          }
        }]
      }
    }
  ]
};
assert.throws(
  ()=>analyzeSweep({
    parameter:'DIM',
    cases:[
      input.cases[0],
      input.cases[1],
      {
        ...input.cases[2],
        consensus:consensus([
          {index:0,hex:'AA'},
          {index:1,hex:'90'},
          {index:2,hex:'CC'}
        ],[3],'AA:BB:CC:DD:EE:FF')
      }
    ]
  }),
  /peer_address_mismatch_across_sweep_setpoints/
);

const unverifiedConsensus=consensus([
  {index:0,hex:'AA'},
  {index:1,hex:'90'},
  {index:2,hex:'CC'}
]);
unverifiedConsensus.captureIdentity.verifiedAcrossRuns=false;
assert.throws(
  ()=>analyzeSweep({
    parameter:'DIM',
    cases:[
      input.cases[0],
      input.cases[1],
      {...input.cases[2],consensus:unverifiedConsensus}
    ]
  }),
  /unverified_fixture_identity_in_sweep_setpoint/
);

const consensusWithoutIdentity={
  kind:'LightingAI-Astera-ATT-consensus',
  repeatableCandidates:input.cases[2].consensus.repeatableCandidates
};
assert.throws(
  ()=>analyzeSweep({
    parameter:'DIM',
    cases:[
      input.cases[0],
      input.cases[1],
      {...input.cases[2],consensus:consensusWithoutIdentity}
    ]
  }),
  /capture_identity_missing_in_some_sweep_setpoints/
);

const mixed=analyzeSweep(mixedLength);
assert.strictEqual(mixed.endpoints[0].comparable,false);
assert.strictEqual(mixed.endpoints[0].reason,'payload_length_not_stable_across_setpoints');

assert.throws(
  ()=>parseArgs(['node','astera-att-sweep.js']),
  /usage:/
);
assert.strictEqual(
  parseArgs(['node','astera-att-sweep.js','dim-sweep.json']).manifest,
  'dim-sweep.json'
);

process.stdout.write(JSON.stringify({
  ok:true,
  parameterCandidateByteIndexes:row.parameterCandidateByteIndexes.map(x=>x.index),
  constantFramingByteIndexes:row.constantFramingByteIndexes.map(x=>x.index),
  unstableByteIndexes:row.unstableByteIndexes,
  dim8Candidate:{
    slope:dim8.slope,
    rSquared:dim8.rSquared
  },
  le16Candidate:{
    byteIndexes:le16.byteIndexes,
    slope:le16.slope,
    rSquared:le16.rSquared
  },
  peerAddress:result.captureIdentity.peerAddress
},null,2)+'\n');
