import { RUNTIME_CATALOG } from './catalog-runtime.js';
import { buildAccessoryTree } from './accessory-graph.js';

const FIXTURES=['aputure-electro-storm-cs15','aputure-electro-storm-xt26'];
const REQUIRED=[
  'aputure-electro-storm-head-cable','aputure-electro-storm-motorized-yoke','aputure-electro-storm-f14-fresnel',
  'aputure-electro-storm-f14-skid','aputure-electro-storm-reflector-20','aputure-electro-storm-reflector-35',
  'aputure-electro-storm-reflector-50','aputure-electro-storm-reflector-barn-doors','aputure-spotlight-max',
  'aputure-quick-dome-90','aputure-mount-light-dome-150','aputure-mount-lantern-120','aputure-mount-lantern-180',
  'aputure-sidus-one','aputure-sidus-four','aputure-electro-storm-flight-case'
];
const errors=[]; const report={};
for(const fixtureId of FIXTURES){
  const reachable=new Set(buildAccessoryTree(fixtureId,RUNTIME_CATALOG).map(x=>x.id));
  const missing=REQUIRED.filter(id=>!reachable.has(id));
  report[fixtureId]={required:REQUIRED.length,reachable:reachable.size,missing};
  for(const id of missing) errors.push(`${fixtureId} cannot reach ${id}`);
}
const cs15=new Set(buildAccessoryTree('aputure-electro-storm-cs15',RUNTIME_CATALOG).map(x=>x.id));
const xt26=new Set(buildAccessoryTree('aputure-electro-storm-xt26',RUNTIME_CATALOG).map(x=>x.id));
if(!cs15.has('aputure-electro-storm-cs15-ac-cable-20a-6m')) errors.push('CS15 missing official 20A 6m AC cable');
for(const id of ['aputure-electro-storm-xt26-ac-cable-15a-6m','aputure-electro-storm-xt26-ac-cable-40a-bare-ends','aputure-electro-storm-xt26-lp28-bates-40a-cable']) if(!xt26.has(id)) errors.push(`XT26 missing official power accessory ${id}`);
const bates=RUNTIME_CATALOG.accessoryById.get('aputure-electro-storm-xt26-lp28-bates-40a-cable');
if(!bates || bates.lengthM!==6) errors.push('XT26 LP-28 to Bates 40A cable must retain official 6m length');
const f14=RUNTIME_CATALOG.accessoryById.get('aputure-electro-storm-f14-fresnel');
if(!f14 || f14.beamAngleDeg?.min!==18 || f14.beamAngleDeg?.max!==50) errors.push('F14 must retain current official 18-50 degree range');
const yoke=RUNTIME_CATALOG.accessoryById.get('aputure-electro-storm-motorized-yoke');
if(!yoke || yoke.panRangeDeg!==540 || yoke.tiltRangeDeg!==270 || yoke.weightKg!==20) errors.push('Electro Storm motorized yoke facts changed');
for(const [id,angle,weight] of [['aputure-electro-storm-reflector-20',20,3.8],['aputure-electro-storm-reflector-35',35,1.5],['aputure-electro-storm-reflector-50',50,1.2]]){
  const a=RUNTIME_CATALOG.accessoryById.get(id); if(!a || a.beamAngleDeg?.min!==angle || a.beamAngleDeg?.max!==angle || a.weightKg!==weight) errors.push(`${id} technical facts changed`);
}
console.log(JSON.stringify({ok:errors.length===0,fixtures:report,protectedAccessoryLinks:FIXTURES.length*REQUIRED.length,errors},null,2));
if(errors.length) process.exit(1);
