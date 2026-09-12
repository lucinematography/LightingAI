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
  'aputure-ls-600x-pro':['aputure-space-light-90'], 'aputure-ls-600c-pro-ii':['aputure-space-light-90'],
  'aputure-ls-1200d-pro':['aputure-bowens-standard-reflector','aputure-f10-fresnel','aputure-sidus-one','aputure-sidus-four'],
  'aputure-storm-80c':['aputure-spotlight-mini','aputure-quick-dome-40'],
  'aputure-storm-400x':['aputure-cf7-fresnel','aputure-quick-dome-60','aputure-quick-dome-90','aputure-space-light-90'],
  'aputure-storm-700x':['aputure-cf10-fresnel','aputure-quick-dome-90','aputure-space-light-90'],
  'aputure-storm-1000c':['aputure-storm-1000c-1200x-cf12-fresnel','aputure-quick-dome-60','aputure-quick-dome-90','aputure-space-light-90'],
  'aputure-storm-1200x':['aputure-storm-1000c-1200x-cf12-fresnel','aputure-quick-dome-60','aputure-quick-dome-90','aputure-space-light-90'],
  'aputure-storm-cs32':['aputure-motorized-cf16-fresnel','aputure-storm-parallel-beam-70','aputure-mount-light-dome-150','aputure-mount-lantern-120','aputure-mount-lantern-180'],
  'aputure-storm-xt52':['aputure-motorized-cf16-fresnel','aputure-storm-parallel-beam-70','aputure-mount-light-dome-150','aputure-mount-lantern-120','aputure-mount-lantern-180'],
  'aputure-electro-storm-cs15':['aputure-electro-storm-f14-fresnel','aputure-electro-storm-motorized-yoke','aputure-electro-storm-reflector-20','aputure-electro-storm-reflector-35','aputure-electro-storm-reflector-50','aputure-electro-storm-flight-case','aputure-storm-parallel-beam-70','aputure-light-dome-150','aputure-lantern-90','aputure-spotlight-max','aputure-sidus-one','aputure-sidus-four'],
  'aputure-electro-storm-xt26':['aputure-electro-storm-f14-fresnel','aputure-electro-storm-motorized-yoke','aputure-electro-storm-reflector-20','aputure-electro-storm-reflector-35','aputure-electro-storm-reflector-50','aputure-electro-storm-flight-case','aputure-electro-storm-xt26-lp28-bates-40a-cable','aputure-storm-parallel-beam-70','aputure-light-dome-150','aputure-lantern-90','aputure-spotlight-max','aputure-quick-dome-90','aputure-space-light-90','aputure-sidus-one','aputure-sidus-four']
};
for (const [fixtureId, ids] of Object.entries(requiredReachability)) {
  const reachable=new Set(buildAccessoryTree(fixtureId,RUNTIME_CATALOG).map(x=>x.id));
  for (const id of ids) if (!reachable.has(id)) errors.push(`${fixtureId} cannot reach completion-critical accessory ${id}`);
}

const expectStatus=(accessoryId,fixtureId,status)=>{
  const a=RUNTIME_CATALOG.accessoryById.get(accessoryId);
  if(!a) errors.push(`Missing ${accessoryId}`);
  else if(a.compatibility?.[fixtureId]?.status!==status) errors.push(`${accessoryId} must be ${status} for ${fixtureId}`);
};
expectStatus('aputure-quick-dome-60','aputure-storm-400x','Designed For');
expectStatus('aputure-quick-dome-90','aputure-storm-400x','Designed For');
expectStatus('aputure-quick-dome-90','aputure-storm-700x','Designed For');
expectStatus('aputure-cf10-fresnel','aputure-storm-700x','Designed For');
for(const f of ['aputure-storm-1000c','aputure-storm-1200x']){
  expectStatus('aputure-storm-1000c-1200x-cf12-fresnel',f,'Designed For');
  expectStatus('aputure-storm-1000c-1200x-barn-doors-adapter',f,'Designed For');
  for(const id of ['aputure-storm-1000c-1200x-reflector-15','aputure-storm-1000c-1200x-reflector-30','aputure-storm-1000c-1200x-reflector-45','aputure-storm-1000c-1200x-skid']) expectStatus(id,f,'Designed For');
}
expectStatus('aputure-ls1200d-four-light-bracket','aputure-storm-1200x','Designed For');
expectStatus('aputure-ls1200d-four-light-bracket','aputure-storm-1000c','Compatible');
for(const f of ['aputure-storm-cs32','aputure-storm-xt52']){
  expectStatus('aputure-storm-parallel-beam-70',f,'Designed For');
  expectStatus('aputure-mount-lantern-120',f,'Designed For');
  expectStatus('aputure-mount-lantern-180',f,'Designed For');
}
for(const f of ['aputure-electro-storm-cs15','aputure-electro-storm-xt26']){
  expectStatus('aputure-storm-parallel-beam-70',f,'Compatible');
  for(const id of ['aputure-electro-storm-f14-fresnel','aputure-electro-storm-motorized-yoke','aputure-electro-storm-reflector-20','aputure-electro-storm-reflector-35','aputure-electro-storm-reflector-50']) expectStatus(id,f,'Designed For');
  for(const id of ['aputure-light-dome-150','aputure-lantern-90','aputure-spotlight-max']) expectStatus(id,f,'Compatible');
}
expectStatus('aputure-quick-dome-90','aputure-electro-storm-xt26','Compatible');
expectStatus('aputure-space-light-90','aputure-electro-storm-xt26','Compatible');
const f14=RUNTIME_CATALOG.accessoryById.get('aputure-electro-storm-f14-fresnel');
if(!f14 || f14.beamAngleDeg?.min!==18 || f14.beamAngleDeg?.max!==50 || f14.weightKg!==13 || f14.diameterCm!==35) errors.push('Electro Storm F14 Fresnel specification regression');
const motorYoke=RUNTIME_CATALOG.accessoryById.get('aputure-electro-storm-motorized-yoke');
if(!motorYoke || motorYoke.panRangeDeg!==540 || motorYoke.tiltRangeDeg!==270 || motorYoke.weightKg!==20) errors.push('Electro Storm Motorized Yoke specification regression');
const reflectorWeights={'aputure-electro-storm-reflector-20':3.8,'aputure-electro-storm-reflector-35':1.5,'aputure-electro-storm-reflector-50':1.2};
for(const [id,w] of Object.entries(reflectorWeights)) if(RUNTIME_CATALOG.accessoryById.get(id)?.weightKg!==w) errors.push(`${id} weight regression`);

const pb70=RUNTIME_CATALOG.accessoryById.get('aputure-storm-parallel-beam-70');
if(!pb70 || pb70.weightKg!==10.70 || pb70.diameterCm!==70 || pb70.beamAngleDeg?.min!==5 || pb70.beamAngleDeg?.max!==5) errors.push('Parallel Beam 70 physical/beam specification regression');
const lantern180=RUNTIME_CATALOG.accessoryById.get('aputure-mount-lantern-180');
if(!lantern180 || lantern180.diameterCm!==180 || lantern180.weightKg!==8.15 || lantern180.weightWithSkirtKg!==9.60) errors.push('Aputure Mount Lantern 180 specification regression');
const spaceLight90=RUNTIME_CATALOG.accessoryById.get('aputure-space-light-90');
if(!spaceLight90) errors.push('Missing Space Light 90');
else {
  if(spaceLight90.diameterCm!==90) errors.push('Space Light 90 diameter must be 90cm');
  for(const f of ['aputure-storm-400x','aputure-storm-700x','aputure-storm-1000c','aputure-storm-1200x','aputure-ls-600x-pro','aputure-ls-600c-pro-ii']) if(spaceLight90.compatibility?.[f]?.status!=='Compatible') errors.push(`Space Light 90 must be Compatible with ${f}`);
}
const forbidden={'aputure-ls-1200d-pro':['aputure-spotlight-mount-ii'],'aputure-storm-1200x':['aputure-spotlight-mount-ii'],'aputure-storm-80c':['aputure-f10-fresnel'],'aputure-storm-xt52':['aputure-electro-storm-f14-fresnel']};
for(const [fixtureId,ids] of Object.entries(forbidden)){
  const reachable=new Set(buildAccessoryTree(fixtureId,RUNTIME_CATALOG).map(x=>x.id));
  for(const id of ids) if(reachable.has(id)) errors.push(`${fixtureId} must not reach ${id}`);
}
console.log(JSON.stringify({ok:errors.length===0,aputureFixtures:EXPECTED_FIXTURES.length,completionCriticalLinks:Object.values(requiredReachability).reduce((n,x)=>n+x.length,0),errors},null,2));
if(errors.length) process.exit(1);
