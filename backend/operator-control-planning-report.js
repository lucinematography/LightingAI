import { buildRuntimeCatalog } from './catalog-runtime.js';
import { deriveFixtureControlCapabilities, deriveVerifiedControlCapabilities } from './fixture-control-capabilities.js';
import { VENDOR_WIRELESS_PROTOCOL_STATUS, vendorWideCommandProductionReady } from './vendor-wireless-protocol-status.js';
import { VENDOR_WIRELESS_CAPTURE_PLANS } from './vendor-wireless-capture-plans.js';

function list(v){return Array.isArray(v)?v.map(String):[]}
function wirelessFlags(f){
  const c=f?.control;
  if(!c||Array.isArray(c)||typeof c!=='object') return {bluetooth:false,wifi:false};
  return {
    bluetooth:c?.wirelessVerification?.bluetooth?.verified===true,
    wifi:c?.wirelessVerification?.wifi?.verified===true
  };
}
function catalogWirelessFlags(f){
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
  const requiredFixtureIdsByMaker=new Map();
  const requiredTransportsByMaker=new Map();
  for(const fixture of fixtures){
    const flags=catalogWirelessFlags(fixture);
    if(!flags.bluetooth&&!flags.wifi) continue;
    const maker=fixture?.manufacturer||'Unknown';
    if(!requiredFixtureIdsByMaker.has(maker)) requiredFixtureIdsByMaker.set(maker,[]);
    if(!requiredTransportsByMaker.has(maker)) requiredTransportsByMaker.set(maker,new Set());
    if(fixture?.id) requiredFixtureIdsByMaker.get(maker).push(String(fixture.id));
    if(flags.bluetooth) requiredTransportsByMaker.get(maker).add('bluetooth');
    if(flags.wifi) requiredTransportsByMaker.get(maker).add('wifi');
  }

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
      fxCapable:0,
      dimControlVerified:0,
      cctControlVerified:0,
      colorControlVerified:0,
      fxControlVerified:0
    });
    const row=by.get(maker);
    const caps=deriveFixtureControlCapabilities(fixture);
    const verified=deriveVerifiedControlCapabilities(fixture);
    row.wirelessFixtures++;
    if(flags.bluetooth) row.bluetoothFixtures++;
    if(flags.wifi) row.wifiFixtures++;
    if(caps.dim.supported) row.dimCapable++;
    if(caps.cct.supported) row.cctCapable++;
    if(caps.color.supported) row.colorCapable++;
    if(caps.fx.supported) row.fxCapable++;
    if(verified.dim.supported) row.dimControlVerified++;
    if(verified.cct.supported) row.cctControlVerified++;
    if(verified.color.supported) row.colorControlVerified++;
    if(verified.fx.supported) row.fxControlVerified++;
  }

  const vendors=[...by.values()].map(row=>{
    const status=VENDOR_WIRELESS_PROTOCOL_STATUS[row.manufacturer]||null;
    const plan=VENDOR_WIRELESS_CAPTURE_PLANS[row.manufacturer]||null;
    return {
      ...row,
      commandReady:vendorWideCommandProductionReady(
        row.manufacturer,
        [...(requiredTransportsByMaker.get(row.manufacturer)||new Set())],
        requiredFixtureIdsByMaker.get(row.manufacturer)||[]
      ),
      requiredProductionTransports:[...(requiredTransportsByMaker.get(row.manufacturer)||new Set())],
      requiredProductionFixtureIds:requiredFixtureIdsByMaker.get(row.manufacturer)||[],
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
      fxCapable:vendors.reduce((n,v)=>n+v.fxCapable,0),
      dimControlVerified:vendors.reduce((n,v)=>n+v.dimControlVerified,0),
      cctControlVerified:vendors.reduce((n,v)=>n+v.cctControlVerified,0),
      colorControlVerified:vendors.reduce((n,v)=>n+v.colorControlVerified,0),
      fxControlVerified:vendors.reduce((n,v)=>n+v.fxControlVerified,0)
    },
    vendors
  };
}

if(import.meta.url===`file://${process.argv[1]}`){
  console.log(JSON.stringify(buildOperatorControlPlanningReport(),null,2));
}
