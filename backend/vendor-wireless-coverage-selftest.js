import { buildRuntimeCatalog } from './catalog-runtime.js';
import { VENDOR_WIRELESS_PROTOCOL_STATUS } from './vendor-wireless-protocol-status.js';
import { VENDOR_WIRELESS_CAPTURE_PLANS } from './vendor-wireless-capture-plans.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

function list(v){return Array.isArray(v)?v.map(String):[]}
function hasBt(f){
  const c=f?.control;
  const values=Array.isArray(c)?list(c):[...list(c?.wireless),...list(c?.directLightingAI)];
  return values.some(v=>/(^|[^a-z0-9])(bluetooth|ble)([^a-z0-9]|$)/i.test(v));
}
function hasWifi(f){
  const c=f?.control;
  const values=Array.isArray(c)?list(c):[...list(c?.wireless),...list(c?.directLightingAI)];
  return values.some(v=>/(^|[^a-z0-9])(wi-?fi|wifi|wlan)([^a-z0-9]|$)/i.test(v));
}
function planIds(plan){
  return new Set([
    plan?.id,
    ...((plan?.secondaryPlans||[]).map(x=>x?.id))
  ].filter(Boolean));
}

const {fixtures}=buildRuntimeCatalog();
const coverage={};

for(const fixture of fixtures){
  const maker=fixture?.manufacturer||'Unknown';
  const bt=hasBt(fixture), wifi=hasWifi(fixture);
  if(!bt&&!wifi) continue;
  if(!coverage[maker]) coverage[maker]={bluetooth:0,wifi:0,fixtureIds:[],routes:[]};
  if(fixture?.id) coverage[maker].fixtureIds.push(String(fixture.id));
  if(bt){
    coverage[maker].bluetooth++;
    if(fixture?.id) coverage[maker].routes.push({fixtureId:String(fixture.id),transport:'bluetooth'});
  }
  if(wifi){
    coverage[maker].wifi++;
    if(fixture?.id) coverage[maker].routes.push({fixtureId:String(fixture.id),transport:'wifi'});
  }
}

for(const [maker,row] of Object.entries(coverage)){
  const status=VENDOR_WIRELESS_PROTOCOL_STATUS[maker];
  expect(!!status,maker+' wireless protocol status missing');
  if(!status) continue;

  const plan=VENDOR_WIRELESS_CAPTURE_PLANS[maker];
  const ids=planIds(plan);

  if(row.bluetooth>0){
    const primaryId=status.capturePlanId;
    expect(!!primaryId && ids.has(primaryId),
      maker+' Bluetooth coverage must retain a linked capture plan even after production promotion');
  }

  if(row.wifi>0){
    const secondary=Array.isArray(status.secondaryCapturePlanIds)?status.secondaryCapturePlanIds:[];
    const linkedWifi=secondary.some(id=>ids.has(id) && (plan?.secondaryPlans||[]).some(x=>x?.id===id&&x?.transport==='wifi'));
    const primaryWifi=plan?.transport==='wifi' && status.capturePlanId===plan?.id;
    expect(primaryWifi || linkedWifi,
      maker+' Wi-Fi coverage must retain a linked Wi-Fi capture plan even after production promotion');
  }
}

for(const maker of ['Kino Flo','De Sisti','LiteGear']){
  expect(!coverage[maker],maker+' unexpectedly entered Bluetooth/Wi-Fi coverage');
}

console.log(JSON.stringify({
  ok:failures.length===0,
  fixtureCount:fixtures.length,
  coveredManufacturers:Object.keys(coverage).length,
  coverage,
  failures
},null,2));
if(failures.length)process.exit(1);
