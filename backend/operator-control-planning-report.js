import { buildRuntimeCatalog } from './catalog-runtime.js';
import { deriveFixtureControlCapabilities } from './fixture-control-capabilities.js';
import { VENDOR_WIRELESS_PROTOCOL_STATUS } from './vendor-wireless-protocol-status.js';
import { VENDOR_WIRELESS_CAPTURE_PLANS } from './vendor-wireless-capture-plans.js';

function list(v){return Array.isArray(v)?v.map(String):[]}
function wirelessFlags(f){
  const c=f?.control;
  const values=Array.isArray(c)?list(c):[...list(c?.wireless),...list(c?.directLightingAI)];
  return {
    bluetooth:values.some(v=>/(^|[^a-z0-9])(bluetooth|ble)([^a-z0-9]|$)/i.test(v)),
    wifi:values.some(v=>/(^|[^a-z0-9])(wi-?fi|wifi|wlan)([^a-z0-9]|$)/i.test(v))
  };
}
function planFor(plan,transport){
  if(!plan) return null;
  if(plan.transport===transport) return plan.id||null;
  return (plan.secondaryPlans||[]).find(x=>x?.transport===transport)?.id||null;
}

export function buildOperatorControlPlanningReport(){
  const {fixtures}=buildRuntimeCatalog();
  const by=new Map();

  for(const fixture of fixtures){
    const flags=wirelessFlags(fixture);
    if(!flags.bluetooth&&!flags.wifi) continue;
    const maker=fixture?.manufacturer||'Unknown';
    if(!by.has(maker)) by.set(maker,{
      manufacturer:maker,
      wirelessFixtures:0,
      bluetoothFixtures:0,
      wifiFixtures:0,
      dimCapable:0,
      cctCapable:0,
      colorCapable:0,
      fxCapable:0
    });
    const row=by.get(maker);
    const caps=deriveFixtureControlCapabilities(fixture);
    row.wirelessFixtures++;
    if(flags.bluetooth) row.bluetoothFixtures++;
    if(flags.wifi) row.wifiFixtures++;
    if(caps.dim.supported) row.dimCapable++;
    if(caps.cct.supported) row.cctCapable++;
    if(caps.color.supported) row.colorCapable++;
    if(caps.fx.supported) row.fxCapable++;
  }

  const vendors=[...by.values()].map(row=>{
    const status=VENDOR_WIRELESS_PROTOCOL_STATUS[row.manufacturer]||null;
    const plan=VENDOR_WIRELESS_CAPTURE_PLANS[row.manufacturer]||null;
    return {
      ...row,
      commandReady:status?.commandSpec==='production_verified',
      bluetoothPlanId:row.bluetoothFixtures?planFor(plan,'bluetooth'):null,
      wifiPlanId:row.wifiFixtures?planFor(plan,'wifi'):null,
      nextStep:status?.nextStep||'status-missing'
    };
  }).sort((a,b)=>
    b.wirelessFixtures-a.wirelessFixtures ||
    b.dimCapable-a.dimCapable ||
    b.cctCapable-a.cctCapable ||
    a.manufacturer.localeCompare(b.manufacturer)
  );

  return {
    kind:'LightingAI-operator-control-planning-report',
    fixtureCount:fixtures.length,
    wirelessManufacturers:vendors.length,
    commandReadyManufacturers:vendors.filter(v=>v.commandReady).length,
    totals:{
      wirelessFixtures:vendors.reduce((n,v)=>n+v.wirelessFixtures,0),
      dimCapable:vendors.reduce((n,v)=>n+v.dimCapable,0),
      cctCapable:vendors.reduce((n,v)=>n+v.cctCapable,0),
      colorCapable:vendors.reduce((n,v)=>n+v.colorCapable,0),
      fxCapable:vendors.reduce((n,v)=>n+v.fxCapable,0)
    },
    vendors
  };
}

if(import.meta.url===`file://${process.argv[1]}`){
  console.log(JSON.stringify(buildOperatorControlPlanningReport(),null,2));
}
