#!/usr/bin/env node
'use strict';

import assert from 'node:assert';
import {
  stableByteMap,
  analyzeSweep,
  parseArgs
} from './astera-att-sweep.js';

const endpoint='host_to_controller|WRITE_COMMAND|0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65|uuid:12345678-1234-5678-9abc-def012345678';

function consensus(stableBytes, variableByteIndexes=[3]) {
  return {
    kind:'LightingAI-Astera-ATT-consensus',
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
    }
  ]
};

const result=analyzeSweep(input);

assert.strictEqual(result.kind,'LightingAI-Astera-ATT-sweep');
assert.strictEqual(result.parameter,'DIM');
assert.strictEqual(result.caseCount,3);
assert.strictEqual(result.summary.sharedRepeatableEndpoints,1);
assert.strictEqual(result.summary.comparableEndpoints,1);
assert.strictEqual(result.summary.endpointsWithParameterCandidateBytes,1);
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
  ['10','50','90']
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
  unstableByteIndexes:row.unstableByteIndexes
},null,2)+'\n');
