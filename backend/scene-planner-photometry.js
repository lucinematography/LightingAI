// Manufacturer-published photometric reference data; never a measured scene lux value.
// Official Aputure product photometric tables; no raw book/PDF payloads.
const PROFILES=Object.freeze({
  'aputure-ls-60d':{
    manufacturer:'Aputure',model:'LS 60d',sourceUrl:'https://aputure.com/EN-US/products/ls-60d',
    cctK:5600,outputPct:100,samples:[
      {beamAngleDeg:15,distanceM:1,lux:54300},{beamAngleDeg:15,distanceM:3,lux:7602},
      {beamAngleDeg:15,distanceM:5,lux:2715},{beamAngleDeg:45,distanceM:1,lux:9014},
      {beamAngleDeg:45,distanceM:3,lux:1096},{beamAngleDeg:45,distanceM:5,lux:402}
    ]},
  'aputure-ls-60x':{
    manufacturer:'Aputure',model:'LS 60x',sourceUrl:'https://aputure.com/en-US/products/ls-60x',
    cctK:5600,outputPct:100,samples:[
      {beamAngleDeg:15,distanceM:1,lux:33480},{beamAngleDeg:15,distanceM:3,lux:4241},
      {beamAngleDeg:15,distanceM:5,lux:1451},{beamAngleDeg:45,distanceM:1,lux:5803},
      {beamAngleDeg:45,distanceM:3,lux:703},{beamAngleDeg:45,distanceM:5,lux:268}
    ]}
});
const BOOK_LINK_IDS=new Set(['PHY-005','EQ-001','EQ-002','EXP-001','META-002']);
function profileForFixture(fixture){
  if(!fixture||!Object.prototype.hasOwnProperty.call(PROFILES,fixture.id))return null;
  const p=PROFILES[fixture.id];
  // A matching inventory id is insufficient without matching canonical maker, model and source.
  if(fixture.manufacturer!==p.manufacturer||fixture.model!==p.model||fixture.sourceUrl!==p.sourceUrl)return null;
  return p;
}
export function getManufacturerPhotometricReferences(req,catalog){
  if(req?.mode!=='own'||!Array.isArray(req.equipment)||!Array.isArray(catalog))return [];
  const byId=new Map(catalog.map(f=>[f.id,f])),seen=new Set(),out=[];
  for(const item of req.equipment){
    const id=item.fixtureId||item.id,p=profileForFixture(byId.get(id));
    if(!item.specVerified||!p||seen.has(id))continue;
    seen.add(id);
    out.push({fixtureId:id,manufacturer:p.manufacturer,model:p.model,
      sourceUrl:p.sourceUrl,sourceType:'MANUFACTURER_PUBLISHED_REFERENCE',
      cctK:p.cctK,outputPct:p.outputPct,samples:p.samples.map(s=>({...s}))});
    if(out.length===8)break;
  }
  return out;
}
export function buildPhotometricBasis(req,plan,catalog,knowledgeCards=[]){
  const refs=new Map(getManufacturerPhotometricReferences(req,catalog).map(x=>[x.fixtureId,x]));
  const measured=!!(req.dimensionsMeasured&&req.roomWidthM&&req.roomDepthM);
  const bookIds=[...new Set(knowledgeCards.map(c=>c.id).filter(id=>BOOK_LINK_IDS.has(id)))];
  const entries=[];
  for(const light of plan.lights||[]){
    const ref=refs.get(light.fixtureId);
    if(!light.available||!ref)continue;
    // Even matching manufacturer settings cannot establish AI-estimated distances as measured.
    const matches=light.intensityPct===100&&light.kelvin===ref.cctK&&
      (light.beamAngleDeg===15||light.beamAngleDeg===45)&&!light.modifier;
    entries.push({lightId:light.id,fixtureId:light.fixtureId,sourceUrl:ref.sourceUrl,
      sourceType:'MANUFACTURER_PUBLISHED_REFERENCE',cctK:ref.cctK,outputPct:ref.outputPct,
      samples:ref.samples.map(s=>({...s})),configurationMatchesReference:matches,
      estimatedXMetres:measured?Number((req.roomWidthM*light.x/100).toFixed(2)):null,
      estimatedYMetres:measured?Number((req.roomDepthM*light.y/100).toFixed(2)):null,
      bookCardIds:bookIds,measuredDistanceM:null,onSetLux:null});
  }
  return {status:'MANUFACTURER_REFERENCE_NOT_SCENE_MEASUREMENT',
    geometry:{widthM:req.roomWidthM??null,depthM:req.roomDepthM??null,
      userMarkedMeasured:measured,plotPositionsEstimated:true},entries:entries.slice(0,8)};
}
