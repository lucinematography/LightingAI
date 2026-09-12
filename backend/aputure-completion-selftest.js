import { RUNTIME_CATALOG } from './catalog-runtime.js';
import { buildAccessoryTree } from './accessory-graph.js';

const EXPECTED_FIXTURES = [
  'aputure-ls-60d','aputure-ls-60x','aputure-ls-300d-ii','aputure-ls-300x','aputure-ls-600d','aputure-ls-600d-pro','aputure-ls-600c-pro-ii','aputure-ls-600x-pro','aputure-ls-1200d-pro',
  'aputure-storm-80c','aputure-storm-400x','aputure-storm-700x','aputure-storm-1000c','aputure-storm-1200x','aputure-storm-cs32','aputure-storm-xt52','aputure-electro-storm-cs15','aputure-electro-storm-xt26'
];

const errors=[];
for (const id of EXPECTED_FIXTURES) if (!RUNTIME_CATALOG.fixtureById.has(id)) errors.push(`Missing Aputure fixture ${id}`);
if (EXPECTED_FIXTURES.length !== 18) errors.push('Completion gate fixture manifest must contain exactly 18 Aputure fixtures');

const requiredReachability = {
  'aputure-ls-1200d-pro':['aputure-ls-1200-series-7-pin-weatherproof-head-cable','aputure-sidus-one','aputure-sidus-four'],
  'aputure-storm-80c':['aputure-spotlight-mini','aputure-quick-dome-40'],
  'aputure-storm-400x':['aputure-cf7-fresnel','aputure-quick-dome-60','aputure-quick-dome-90'],
  'aputure-storm-700x':['aputure-cf10-fresnel','aputure-quick-dome-90'],
  'aputure-storm-1000c':['aputure-cf12-fresnel','aputure-quick-dome-60','aputure-quick-dome-90'],
  'aputure-storm-1200x':['aputure-cf12-fresnel','aputure-quick-dome-60','aputure-quick-dome-90'],
  'aputure-storm-cs32':['aputure-mount-cf16-fresnel','aputure-mount-parallel-beam-70','aputure-mount-light-dome-150'],
  'aputure-storm-xt52':['aputure-mount-cf16-fresnel','aputure-mount-parallel-beam-70','aputure-mount-light-dome-150'],
  'aputure-electro-storm-cs15':['aputure-electro-storm-f14-fresnel','aputure-electro-storm-flight-case','aputure-sidus-one','aputure-sidus-four'],
  'aputure-electro-storm-xt26':['aputure-electro-storm-f14-fresnel','aputure-electro-storm-flight-case','aputure-electro-storm-xt26-lp28-bates-40a-cable','aputure-sidus-one','aputure-sidus-four']
};
for (const [fixtureId, ids] of Object.entries(requiredReachability)) {
  const reachable=new Set(buildAccessoryTree(fixtureId,RUNTIME_CATALOG).map(x=>x.id));
  for (const id of ids) if (!reachable.has(id)) errors.push(`${fixtureId} cannot reach completion-critical accessory ${id}`);
}

const forbidden = {
  'aputure-ls-1200d-pro':['aputure-spotlight-mount-ii'],
  'aputure-ls-600d':['aputure-ls-1200-series-7-pin-weatherproof-head-cable'],
  'aputure-ls-600d-pro':['aputure-ls-1200-series-7-pin-weatherproof-head-cable'],
  'aputure-ls-600x-pro':['aputure-ls-1200-series-7-pin-weatherproof-head-cable']
};
for (const [fixtureId, ids] of Object.entries(forbidden)) {
  const reachable=new Set(buildAccessoryTree(fixtureId,RUNTIME_CATALOG).map(x=>x.id));
  for (const id of ids) if (reachable.has(id)) errors.push(`${fixtureId} must not reach ${id}`);
}

console.log(JSON.stringify({ok:errors.length===0,aputureFixtures:EXPECTED_FIXTURES.length,completionCriticalLinks:Object.values(requiredReachability).reduce((n,x)=>n+x.length,0),errors},null,2));
if(errors.length) process.exit(1);
