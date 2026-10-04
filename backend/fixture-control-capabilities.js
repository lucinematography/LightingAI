import { buildRuntimeCatalog } from './catalog-runtime.js';

function verifiedModes(fixture){
  return Array.isArray(fixture?.dmxModes)
    ? fixture.dmxModes.filter(mode=>mode?.verified===true)
    : [];
}
function verifiedControls(fixture){
  return verifiedModes(fixture).flatMap(mode=>Array.isArray(mode?.controls)?mode.controls:[]);
}
function keySet(fixture){
  return new Set(verifiedControls(fixture).map(c=>String(c?.key||'').trim().toLowerCase()).filter(Boolean));
}
function validCctRange(fixture){
  const c=fixture?.cctK;
  return !!(c&&Number.isFinite(Number(c.min))&&Number.isFinite(Number(c.max))&&Number(c.max)>Number(c.min));
}
function declaredColorEngine(fixture){
  const mode=String(fixture?.colorMode||'').trim().toLowerCase();
  if(!mode) return false;
  if(/bi[- ]?color|bicolor|daylight|tungsten|white only|variable white|vari[- ]?white/.test(mode) &&
     !/rgb|full spectrum|full-spectrum|mint|amber|cyan|lime|rgba|rgbw|rgbww|rgbacl|hsi|cie\s*xy/.test(mode)) return false;
  return /rgb|full spectrum|full-spectrum|mint|amber|cyan|lime|rgba|rgbw|rgbww|rgbacl|hsi|cie\s*xy/.test(mode);
}
function hasAny(keys,names){
  return names.some(name=>keys.has(name));
}
function capabilityVerification(fixture,key){
  const c=fixture?.control;
  if(!c||Array.isArray(c)||typeof c!=='object') return null;
  const row=c.capabilityVerification?.[key];
  return row&&row.verified===true?row:null;
}
function deriveVerifiedControlCapabilities(fixture){
  const keys=keySet(fixture);
  const evidenceFor=(key,names,extraMatch)=> {
    const evidence=[];
    if(hasAny(keys,names) || (typeof extraMatch==='function' && extraMatch(keys))) evidence.push('verified-dmx-control');
    if(capabilityVerification(fixture,key)) evidence.push('verified-official-app-capability');
    return {supported:evidence.length>0,evidence:[...new Set(evidence)]};
  };
  return {
    dim:evidenceFor('dim',['dimmer','intensity','masterdimmer','master_dimmer']),
    cct:evidenceFor('cct',['cct','kelvin','temperature','color_temperature']),
    color:evidenceFor('color',['red','green','blue','white','amber','lime','cyan','hue','saturation','x','y','xy','crossfade']),
    fx:evidenceFor('fx',[],keys=>[...keys].some(key=>key==='effect'||key==='effects'||key.startsWith('fx'))),
    verifiedDmxModes:verifiedModes(fixture).length
  };
}

function deriveFixtureControlCapabilities(fixture){
  const keys=keySet(fixture);
  const dimEvidence=[];
  const cctEvidence=[];
  const colorEvidence=[];
  const fxEvidence=[];

  if(hasAny(keys,['dimmer','intensity','masterdimmer','master_dimmer'])) dimEvidence.push('verified-dmx-control');
  if(capabilityVerification(fixture,'dim')) dimEvidence.push('verified-official-app-capability');
  if(validCctRange(fixture)) cctEvidence.push('catalog-cct-range');
  if(hasAny(keys,['cct','kelvin','temperature','color_temperature'])) cctEvidence.push('verified-dmx-control');
  if(capabilityVerification(fixture,'cct')) cctEvidence.push('verified-official-app-capability');

  if(declaredColorEngine(fixture)) colorEvidence.push('catalog-color-engine');
  if(capabilityVerification(fixture,'color')) colorEvidence.push('verified-official-app-capability');
  if(hasAny(keys,['red','green','blue','white','amber','lime','cyan','hue','saturation','x','y','xy','crossfade'])) {
    colorEvidence.push('verified-dmx-control');
  }

  if([...keys].some(key=>key==='effect'||key==='effects'||key.startsWith('fx'))) fxEvidence.push('verified-dmx-control');
  if(capabilityVerification(fixture,'fx')) fxEvidence.push('verified-official-app-capability');

  return {
    dim:{supported:dimEvidence.length>0,evidence:[...new Set(dimEvidence)]},
    cct:{supported:cctEvidence.length>0,evidence:[...new Set(cctEvidence)]},
    color:{supported:colorEvidence.length>0,evidence:[...new Set(colorEvidence)]},
    fx:{supported:fxEvidence.length>0,evidence:[...new Set(fxEvidence)]},
    verifiedDmxModes:verifiedModes(fixture).length
  };
}

function buildFixtureControlCapabilityReport(){
  const {fixtures}=buildRuntimeCatalog();
  const byManufacturer={};
  const rows=fixtures.map(fixture=>{
    const capabilities=deriveFixtureControlCapabilities(fixture);
    const maker=fixture?.manufacturer||'Unknown';
    if(!byManufacturer[maker]) byManufacturer[maker]={fixtures:0,dim:0,cct:0,color:0,fx:0};
    const b=byManufacturer[maker];
    b.fixtures++;
    for(const key of ['dim','cct','color','fx']) if(capabilities[key].supported) b[key]++;
    return {
      id:fixture?.id||'',
      manufacturer:maker,
      model:fixture?.model||'',
      capabilities
    };
  });
  const totals={
    fixtures:rows.length,
    dim:rows.filter(r=>r.capabilities.dim.supported).length,
    cct:rows.filter(r=>r.capabilities.cct.supported).length,
    color:rows.filter(r=>r.capabilities.color.supported).length,
    fx:rows.filter(r=>r.capabilities.fx.supported).length
  };
  return {
    kind:'LightingAI-fixture-control-capability-report',
    totals,
    byManufacturer:Object.fromEntries(Object.entries(byManufacturer).sort((a,b)=>a[0].localeCompare(b[0]))),
    rows
  };
}

if(import.meta.url===`file://${process.argv[1]}`){
  const report=buildFixtureControlCapabilityReport();
  console.log(JSON.stringify({
    kind:report.kind,
    totals:report.totals,
    byManufacturer:report.byManufacturer
  },null,2));
}

export { verifiedModes, verifiedControls, validCctRange, declaredColorEngine, capabilityVerification, deriveVerifiedControlCapabilities, deriveFixtureControlCapabilities, buildFixtureControlCapabilityReport };
