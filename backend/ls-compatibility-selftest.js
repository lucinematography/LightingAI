import { RUNTIME_CATALOG } from './catalog-runtime.js';
import { buildAccessoryTree } from './accessory-graph.js';

const REQUIRED = {
  'aputure-ls-60d': ['aputure-ls-60-softbox','aputure-spotlight-mini-zoom','aputure-light-dome-mini-ii','aputure-light-dome-se','aputure-light-box-45x45'],
  'aputure-ls-60x': ['aputure-ls-60-softbox','aputure-spotlight-mini-zoom','aputure-light-dome-mini-ii','aputure-light-dome-se','aputure-light-box-45x45'],
  'aputure-ls-300d-ii': ['aputure-bowens-standard-reflector','aputure-300-series-hyper-reflector','aputure-fresnel-2x','aputure-barndoors-fresnel-2x','aputure-light-dome-iii','aputure-quick-dome-90','aputure-spotlight-max'],
  'aputure-ls-300x': ['aputure-bowens-standard-reflector','aputure-300-series-hyper-reflector','aputure-fresnel-2x','aputure-barndoors-fresnel-2x','aputure-light-dome-iii','aputure-quick-dome-90','aputure-spotlight-max','aputure-lantern-90'],
  'aputure-ls-600d': ['aputure-bowens-standard-reflector','aputure-ls-600-series-hyper-reflector','aputure-light-dome-iii','aputure-quick-dome-90','aputure-spotlight-max','aputure-lantern-90'],
  'aputure-ls-600d-pro': ['aputure-bowens-standard-reflector','aputure-ls-600-series-hyper-reflector','aputure-light-dome-iii','aputure-f10-fresnel','aputure-f10-barn-doors','aputure-spotlight-max','aputure-spotlight-mount','aputure-lantern-90','aputure-sidus-one','aputure-sidus-four'],
  'aputure-ls-600x-pro': ['aputure-bowens-standard-reflector','aputure-ls-600-series-hyper-reflector','aputure-light-dome-iii','aputure-f10-fresnel','aputure-f10-barn-doors','aputure-cf10-fresnel','aputure-spotlight-max','aputure-spotlight-mount','aputure-lantern-90','aputure-space-light-90','aputure-sidus-one','aputure-sidus-four'],
  'aputure-ls-600c-pro-ii': ['aputure-light-dome-iii','aputure-quick-dome-90','aputure-cf10-fresnel','aputure-spotlight-max','aputure-lantern-90','aputure-space-light-90','aputure-sidus-one','aputure-sidus-four'],
  'aputure-ls-1200d-pro': ['aputure-bowens-standard-reflector','aputure-light-dome-se','aputure-light-dome-ii','aputure-light-dome-150','aputure-light-octadome-120','aputure-light-box-60x90','aputure-light-box-30x120','aputure-lantern','aputure-lantern-90','aputure-space-light','aputure-f10-fresnel','aputure-f10-barn-doors','aputure-sidus-one','aputure-sidus-four']
};

const errors=[]; const report={};
for (const [fixtureId,requiredIds] of Object.entries(REQUIRED)) {
  if (!RUNTIME_CATALOG.fixtureById.has(fixtureId)) { errors.push(`Missing LS fixture: ${fixtureId}`); continue; }
  const reachable=new Set(buildAccessoryTree(fixtureId,RUNTIME_CATALOG).map(x=>x.id));
  const missing=requiredIds.filter(id=>!reachable.has(id));
  report[fixtureId]={required:requiredIds.length,reachable:reachable.size,missing};
  for (const id of missing) errors.push(`${fixtureId} cannot reach required accessory ${id}`);
}

const ls1200=new Set(buildAccessoryTree('aputure-ls-1200d-pro',RUNTIME_CATALOG).map(x=>x.id));
if (ls1200.has('aputure-spotlight-mount-ii')) errors.push('LS 1200d Pro must not expose Spotlight Mount II (800W maximum)');
const ls60d=new Set(buildAccessoryTree('aputure-ls-60d',RUNTIME_CATALOG).map(x=>x.id));
const ls60x=new Set(buildAccessoryTree('aputure-ls-60x',RUNTIME_CATALOG).map(x=>x.id));
for (const id of ['aputure-f10-fresnel','aputure-cf10-fresnel','aputure-fresnel-2x']) {
  if (ls60d.has(id)) errors.push(`LS 60d must not expose ${id}`);
  if (ls60x.has(id)) errors.push(`LS 60x must not expose ${id}`);
}

console.log(JSON.stringify({ok:errors.length===0,fixtures:report,protectedAccessoryLinks:Object.values(REQUIRED).reduce((n,x)=>n+x.length,0),errors},null,2));
if(errors.length) process.exit(1);
