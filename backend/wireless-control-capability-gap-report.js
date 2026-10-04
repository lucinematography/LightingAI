import { buildRuntimeCatalog } from './catalog-runtime.js';
import { deriveFixtureControlCapabilities, validCctRange, declaredColorEngine } from './fixture-control-capabilities.js';

function list(v){return Array.isArray(v)?v.map(String):[]}
function wireless(f){
  const c=f?.control;
  if(!c||Array.isArray(c)||typeof c!=='object') return {bluetooth:false,wifi:false,any:false};
  const bluetooth=c?.wirelessVerification?.bluetooth?.verified===true;
  const wifi=c?.wirelessVerification?.wifi?.verified===true;
  return {bluetooth,wifi,any:bluetooth||wifi};
}
function declaredFx(f){
  const direct=[
    ...(Array.isArray(f?.effects)?f.effects:[]),
    ...(Array.isArray(f?.fx)?f.fx:[]),
    ...(Array.isArray(f?.effectModes)?f.effectModes:[])
  ];
  if(direct.length) return true;
  if(Array.isArray(f?.dmxModes) && f.dmxModes.some(mode=>/\b(?:fx|effect|effects)\b/i.test(String(mode?.name||'')))) return true;
  return /\b(?:fx|effect|effects)\b/i.test(String(f?.controlNotes||''));
}
export function expectedCapabilities(f){
  return {
    dim:String(f?.category||'').toLowerCase()==='light',
    cct:validCctRange(f),
    color:declaredColorEngine(f),
    fx:declaredFx(f)
  };
}
function gapRow(f){
  const flags=wireless(f);
  if(!flags.any) return null;
  const caps=deriveFixtureControlCapabilities(f);
  const expected=expectedCapabilities(f);
  const missing=[];
  const notApplicable=[];
  for(const key of ['dim','cct','color','fx']){
    if(!expected[key]){
      notApplicable.push(key);
      continue;
    }
    if(!caps[key].supported) missing.push(key);
  }
  return {
    id:f?.id||'',
    manufacturer:f?.manufacturer||'Unknown',
    model:f?.model||'',
    bluetooth:flags.bluetooth,
    wifi:flags.wifi,
    missing,
    notApplicable,
    expected,
    capabilities:caps,
    sourceUrl:f?.sourceUrl||''
  };
}

export function buildWirelessCapabilityGapReport(){
  const {fixtures}=buildRuntimeCatalog();
  const rows=fixtures.map(gapRow).filter(Boolean);
  const gaps=rows.filter(r=>r.missing.length>0);
  const byManufacturer={};
  for(const row of rows){
    if(!byManufacturer[row.manufacturer]) byManufacturer[row.manufacturer]={
      wirelessFixtures:0,
      missingDim:0,
      missingCct:0,
      missingColor:0,
      missingFx:0,
      completeCapabilityRows:0,
      sampleMissingDim:[],
      sampleMissingCct:[],
      sampleMissingColor:[],
      sampleMissingFx:[]
    };
    const b=byManufacturer[row.manufacturer];
    b.wirelessFixtures++;
    if(row.missing.length===0) b.completeCapabilityRows++;
    for(const key of row.missing){
      const field='missing'+key[0].toUpperCase()+key.slice(1);
      b[field]++;
      const sample='sampleMissing'+key[0].toUpperCase()+key.slice(1);
      if(b[sample].length<12) b[sample].push(row.id);
    }
  }
  return {
    kind:'LightingAI-wireless-control-capability-gap-report',
    fixtureCount:fixtures.length,
    wirelessFixtures:rows.length,
    fixturesWithAnyGap:gaps.length,
    byManufacturer:Object.fromEntries(Object.entries(byManufacturer).sort((a,b)=>a[0].localeCompare(b[0]))),
    gaps
  };
}

if(import.meta.url===`file://${process.argv[1]}`){
  const report=buildWirelessCapabilityGapReport();
  console.log(JSON.stringify({
    kind:report.kind,
    fixtureCount:report.fixtureCount,
    wirelessFixtures:report.wirelessFixtures,
    fixturesWithAnyGap:report.fixturesWithAnyGap,
    byManufacturer:report.byManufacturer
  },null,2));
}
