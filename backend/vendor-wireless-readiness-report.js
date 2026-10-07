import { buildRuntimeCatalog } from './catalog-runtime.js';
import { VENDOR_WIRELESS_PROTOCOL_STATUS, vendorWideCommandProductionReady } from './vendor-wireless-protocol-status.js';
import { VENDOR_WIRELESS_CAPTURE_PLANS } from './vendor-wireless-capture-plans.js';
import { wirelessTransportFlags, wirelessRouteKind } from './wireless-route-classification.js';

function list(v){return Array.isArray(v)?v.map(String):[]}
function hasBt(f){return wirelessTransportFlags(f).bluetooth}
function hasWifi(f){return wirelessTransportFlags(f).wifi}
function verification(f,t){
  const c=f?.control;
  if(!c||Array.isArray(c)||typeof c!=='object') return false;
  return c?.wirelessVerification?.[t]?.verified===true;
}
function externalFor(f,t){return wirelessRouteKind(f,t)==='assisted'}
function planIds(plan){
  return [
    plan?.id,
    ...((plan?.secondaryPlans||[]).map(x=>x?.id))
  ].filter(Boolean);
}
function transportPlan(plan,t){
  if(!plan) return null;
  if(plan.transport===t) return {id:plan.id,transport:t,kind:'primary'};
  const secondary=(plan.secondaryPlans||[]).find(x=>x?.transport===t);
  return secondary?{id:secondary.id,transport:t,kind:'secondary'}:null;
}

export function buildWirelessReadinessReport(){
  const {fixtures}=buildRuntimeCatalog();
  const map=new Map();
  for(const f of fixtures){
    const maker=f?.manufacturer||'Unknown';
    const bt=hasBt(f), wifi=hasWifi(f);
    if(!bt&&!wifi) continue;
    if(!map.has(maker)) map.set(maker,{
      manufacturer:maker,totalWirelessFixtures:0,bluetoothFixtures:0,wifiFixtures:0,bothFixtures:0,
      verifiedBluetoothEvidence:0,verifiedWifiEvidence:0,assistedBluetooth:0,assistedWifi:0,
      fixtureIds:[],requiredProductionRoutes:[]
    });
    const row=map.get(maker);
    row.totalWirelessFixtures++;
    if(f?.id) row.fixtureIds.push(String(f.id));
    if(bt) {
      row.bluetoothFixtures++;
      if(f?.id) row.requiredProductionRoutes.push({fixtureId:String(f.id),transport:'bluetooth'});
    }
    if(wifi) {
      row.wifiFixtures++;
      if(f?.id) row.requiredProductionRoutes.push({fixtureId:String(f.id),transport:'wifi'});
    }
    if(bt&&wifi) row.bothFixtures++;
    if(bt&&verification(f,'bluetooth')) row.verifiedBluetoothEvidence++;
    if(wifi&&verification(f,'wifi')) row.verifiedWifiEvidence++;
    if(bt&&externalFor(f,'bluetooth')) row.assistedBluetooth++;
    if(wifi&&externalFor(f,'wifi')) row.assistedWifi++;
  }

  const vendors=[...map.values()].map(row=>{
    const status=VENDOR_WIRELESS_PROTOCOL_STATUS[row.manufacturer]||null;
    const plan=VENDOR_WIRELESS_CAPTURE_PLANS[row.manufacturer]||null;
    const bluetoothPlan=transportPlan(plan,'bluetooth');
    const wifiPlan=transportPlan(plan,'wifi');
    const requiredTransports=[
      ...(row.bluetoothFixtures>0?['bluetooth']:[]),
      ...(row.wifiFixtures>0?['wifi']:[])
    ];
    const commandReady=vendorWideCommandProductionReady(row.manufacturer,requiredTransports,row.fixtureIds,row.requiredProductionRoutes);
    return {
      ...row,
      transportEvidenceComplete:
        row.verifiedBluetoothEvidence===row.bluetoothFixtures &&
        row.verifiedWifiEvidence===row.wifiFixtures,
      commandReady,
      bluetoothPlan:row.bluetoothFixtures?bluetoothPlan:null,
      wifiPlan:row.wifiFixtures?wifiPlan:null,
      capturePlanIds:planIds(plan),
      nextStep:commandReady?'production-driver-available':status?.nextStep||'status-missing'
    };
  }).sort((a,b)=>
    b.totalWirelessFixtures-a.totalWirelessFixtures ||
    b.bluetoothFixtures-a.bluetoothFixtures ||
    b.wifiFixtures-a.wifiFixtures ||
    a.manufacturer.localeCompare(b.manufacturer)
  );

  return {
    kind:'LightingAI-vendor-wireless-readiness-report',
    fixtureCount:fixtures.length,
    coveredManufacturers:vendors.length,
    totalWirelessFixtureRows:vendors.reduce((n,v)=>n+v.totalWirelessFixtures,0),
    commandReadyManufacturers:vendors.filter(v=>v.commandReady).length,
    vendors
  };
}

if(import.meta.url===`file://${process.argv[1]}`){
  console.log(JSON.stringify(buildWirelessReadinessReport(),null,2));
}
