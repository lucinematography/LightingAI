import { RUNTIME_CATALOG } from './catalog-runtime.js';
import { buildAccessoryTree } from './accessory-graph.js';

const REQUIRED = {
  'aputure-storm-80c': [
    'aputure-storm-80c-hyper-reflector-35','aputure-storm-80c-mini-lantern-diffuser','aputure-cf4-fresnel','aputure-cf4-barn-doors','aputure-light-dome-40','aputure-quick-dome-40','aputure-lantern-30','aputure-storm-80c-bowens-adapter','aputure-storm-80c-light-dome-mini-iii','aputure-spotlight-mini','aputure-spotlight-mini-lens-19','aputure-spotlight-mini-lens-36','aputure-spotlight-mini-gobo-holder-m-size','aputure-spotlight-mini-gobo-kit-m-size','aputure-spotlight-mini-iris-m-size','aputure-storm-80c-dtap-power-cable','aputure-storm-80c-dc-extension-3m','aputure-storm-80c-handheld-bracket','aputure-storm-80c-vmount-power-bank-bracket','aputure-universal-magic-arm','aputure-super-clamp','aputure-sidus-one','aputure-sidus-four','aputure-sidus-one-dmx-2-way-splitter'
  ],
  'aputure-storm-400x': ['aputure-storm-400x-hyper-reflector-35','aputure-cf7-fresnel','aputure-cf7-barn-doors','aputure-quick-dome-60','aputure-quick-dome-90','aputure-spotlight-mount-ii','aputure-quick-release-clamp','aputure-storm-400x-head-cable-7-5m','aputure-space-light-90','aputure-sidus-one','aputure-sidus-four'],
  'aputure-storm-700x': ['aputure-storm-700x-reflector-35','aputure-storm-700x-reflector-25','aputure-cf10-fresnel','aputure-cf10-barn-doors','aputure-storm-700x-skid','aputure-quick-dome-90','aputure-spotlight-mount-ii','aputure-quick-release-clamp','aputure-storm-700x-head-cable-15m','aputure-space-light-90','aputure-sidus-one','aputure-sidus-four'],
  'aputure-storm-1000c': ['aputure-storm-1000c-1200x-cf12-fresnel','aputure-cf12-barn-doors','aputure-storm-1000c-1200x-barn-doors-adapter','aputure-storm-1000c-1200x-reflector-15','aputure-storm-1000c-1200x-reflector-30','aputure-storm-1000c-1200x-reflector-45','aputure-storm-1000c-1200x-skid','aputure-quick-dome-60','aputure-quick-dome-90','aputure-space-light-90','aputure-quick-release-clamp','aputure-neutrik-power-cable-1200-series-6m','aputure-sidus-one','aputure-sidus-four'],
  'aputure-storm-1200x': ['aputure-storm-1000c-1200x-cf12-fresnel','aputure-cf12-barn-doors','aputure-storm-1000c-1200x-barn-doors-adapter','aputure-storm-1000c-1200x-reflector-15','aputure-storm-1000c-1200x-reflector-30','aputure-storm-1000c-1200x-reflector-45','aputure-storm-1000c-1200x-skid','aputure-quick-dome-90','aputure-space-light-90','aputure-quick-release-clamp','aputure-neutrik-power-cable-1200-series-6m','aputure-ls1200d-four-light-bracket','aputure-sidus-one','aputure-sidus-four']
};

const errors=[]; const report={};
for(const [fixtureId,requiredIds] of Object.entries(REQUIRED)){
  if(!RUNTIME_CATALOG.fixtureById.has(fixtureId)){errors.push(`Missing STORM fixture: ${fixtureId}`);continue;}
  const reachable=new Set(buildAccessoryTree(fixtureId,RUNTIME_CATALOG).map(x=>x.id));
  const missing=requiredIds.filter(id=>!reachable.has(id));
  report[fixtureId]={required:requiredIds.length,reachable:reachable.size,missing};
  for(const id of missing) errors.push(`${fixtureId} cannot reach required accessory ${id}`);
}

const storm80=new Set(buildAccessoryTree('aputure-storm-80c',RUNTIME_CATALOG).map(x=>x.id));
if(storm80.has('aputure-f10-fresnel')) errors.push('STORM 80c must not expose F10 Fresnel');
const storm1200=new Set(buildAccessoryTree('aputure-storm-1200x',RUNTIME_CATALOG).map(x=>x.id));
if(storm1200.has('aputure-f10-fresnel')) errors.push('STORM 1200x must not expose F10 Fresnel');
if(storm1200.has('aputure-spotlight-mount-ii')) errors.push('STORM 1200x must not expose Spotlight Mount II (800W maximum)');

console.log(JSON.stringify({ok:errors.length===0,fixtures:report,protectedAccessoryLinks:Object.values(REQUIRED).reduce((n,x)=>n+x.length,0),errors},null,2));
if(errors.length)process.exit(1);
