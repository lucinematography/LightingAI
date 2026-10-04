import { buildRuntimeCatalog } from './catalog-runtime.js';
import { wirelessTransportFlags, wirelessRouteKind } from './wireless-route-classification.js';
import { deriveFixtureStructuralClass } from './fixture-structural-classification.js';

function list(v){return Array.isArray(v)?v.map(String):[]}
function wirelessFlags(f){return wirelessTransportFlags(f)}
function externalFor(fixture,transport){return wirelessRouteKind(fixture,transport)==='assisted'}
function clean(v){
  const s=String(v??'').trim();
  return s||null;
}
function classSignature(fixture){
  return [
    clean(fixture?.family)||'Unspecified family',
    clean(fixture?.sourceType)||'Unspecified sourceType',
    clean(fixture?.formFactor)||'Unspecified formFactor'
  ].join(' | ');
}
function manufacturerClassSignature(fixture){
  return [
    clean(fixture?.manufacturer)||'Unknown',
    classSignature(fixture)
  ].join(' :: ');
}
function bucket(map,key){
  if(!map.has(key)) map.set(key,{
    fixtures:new Set(),
    manufacturers:new Set(),
    bluetoothRoutes:0,
    wifiRoutes:0,
    directBluetoothRoutes:0,
    assistedBluetoothRoutes:0,
    directWifiRoutes:0,
    assistedWifiRoutes:0
  });
  return map.get(key);
}
function add(map,key,fixture,flags){
  if(!key) return;
  const row=bucket(map,key);
  row.fixtures.add(String(fixture.id));
  row.manufacturers.add(String(fixture.manufacturer||'Unknown'));
  if(flags.bluetooth){
    row.bluetoothRoutes++;
    if(externalFor(fixture,'bluetooth')) row.assistedBluetoothRoutes++;
    else row.directBluetoothRoutes++;
  }
  if(flags.wifi){
    row.wifiRoutes++;
    if(externalFor(fixture,'wifi')) row.assistedWifiRoutes++;
    else row.directWifiRoutes++;
  }
}
function serialize(map){
  return Object.fromEntries(
    [...map.entries()]
      .sort((a,b)=>a[0].localeCompare(b[0]))
      .map(([key,row])=>[key,{
        fixtureCount:row.fixtures.size,
        bluetoothRoutes:row.bluetoothRoutes,
        wifiRoutes:row.wifiRoutes,
        directBluetoothRoutes:row.directBluetoothRoutes,
        assistedBluetoothRoutes:row.assistedBluetoothRoutes,
        directWifiRoutes:row.directWifiRoutes,
        assistedWifiRoutes:row.assistedWifiRoutes,
        manufacturers:[...row.manufacturers].sort()
      }])
  );
}

export function buildWirelessFixtureClassCoverageReport(){
  const {fixtures}=buildRuntimeCatalog();
  const byCategory=new Map();
  const byFamily=new Map();
  const bySourceType=new Map();
  const byFormFactor=new Map();
  const byClassSignature=new Map();
  const byStructuralClass=new Map();
  const byManufacturerStructuralClass=new Map();
  const byManufacturerClassSignature=new Map();
  const byManufacturer=new Map();
  const wirelessFixtureIds=[];
  const unclassifiedFixtureIds=[];
  const structurallyUnclassifiedFixtureIds=[];
  let bluetoothRoutes=0;
  let wifiRoutes=0;
  let bothFixtures=0;

  for(const fixture of fixtures){
    const flags=wirelessFlags(fixture);
    if(!flags.bluetooth&&!flags.wifi) continue;
    const id=String(fixture?.id||'').trim();
    if(!id) continue;

    wirelessFixtureIds.push(id);
    if(flags.bluetooth) bluetoothRoutes++;
    if(flags.wifi) wifiRoutes++;
    if(flags.bluetooth&&flags.wifi) bothFixtures++;

    const category=clean(fixture.category);
    const family=clean(fixture.family);
    const sourceType=clean(fixture.sourceType);
    const formFactor=clean(fixture.formFactor);
    const structuralClass=deriveFixtureStructuralClass(fixture);
    if(!family&&!sourceType&&!formFactor) unclassifiedFixtureIds.push(id);
    if(!structuralClass) structurallyUnclassifiedFixtureIds.push(id);

    add(byCategory,category||'Uncategorized',fixture,flags);
    add(byFamily,family||'Unspecified family',fixture,flags);
    add(bySourceType,sourceType||'Unspecified sourceType',fixture,flags);
    add(byFormFactor,formFactor||'Unspecified formFactor',fixture,flags);
    add(byClassSignature,classSignature(fixture),fixture,flags);
    add(byStructuralClass,structuralClass||'Unspecified structural class',fixture,flags);
    add(byManufacturerStructuralClass,(clean(fixture.manufacturer)||'Unknown')+' :: '+(structuralClass||'Unspecified structural class'),fixture,flags);
    add(byManufacturerClassSignature,manufacturerClassSignature(fixture),fixture,flags);
    add(byManufacturer,clean(fixture.manufacturer)||'Unknown',fixture,flags);
  }

  return {
    kind:'LightingAI-wireless-fixture-class-coverage-report',
    fixtureCount:fixtures.length,
    wirelessFixtureCount:new Set(wirelessFixtureIds).size,
    bluetoothRoutes,
    wifiRoutes,
    bothFixtures,
    unclassifiedFixtureIds:[...new Set(unclassifiedFixtureIds)].sort(),
    structurallyUnclassifiedFixtureIds:[...new Set(structurallyUnclassifiedFixtureIds)].sort(),
    byCategory:serialize(byCategory),
    byFamily:serialize(byFamily),
    bySourceType:serialize(bySourceType),
    byFormFactor:serialize(byFormFactor),
    byClassSignature:serialize(byClassSignature),
    byStructuralClass:serialize(byStructuralClass),
    byManufacturerStructuralClass:serialize(byManufacturerStructuralClass),
    byManufacturerClassSignature:serialize(byManufacturerClassSignature),
    byManufacturer:serialize(byManufacturer)
  };
}

if(import.meta.url===`file://${process.argv[1]}`){
  console.log(JSON.stringify(buildWirelessFixtureClassCoverageReport(),null,2));
}
