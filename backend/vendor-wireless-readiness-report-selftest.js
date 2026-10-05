import { buildWirelessReadinessReport } from './vendor-wireless-readiness-report.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
const report=buildWirelessReadinessReport();

expect(report.fixtureCount===702,'fixture count changed from verified catalog total');
expect(report.coveredManufacturers===32,'wireless manufacturer coverage must remain 32');
expect(report.commandReadyManufacturers===0,'no proprietary wireless command driver may be production-ready yet');

const by=Object.fromEntries(report.vendors.map(v=>[v.manufacturer,v]));
for(const maker of ['Godox','Nanlite','Aputure','Astera','ARRI','Aladdin','EV Light','Creamsource','Rotolight','Luxli','Quasar Science','Kelvin','SmallRig','amaran','NEEWER','GVM','Litepanels','DMG Lumiere','ZHIYUN','PROLYCHT','COLBOR','SIRUI','Fiilex','Harlowe','SWIT','Dracast','Hive Lighting','Kinotehnik','VELVET','VILTROX','Phottix','YONGNUO']){
  const row=by[maker];
  expect(!!row,maker+' readiness row missing');
  if(!row) continue;
  expect(row.transportEvidenceComplete===true,maker+' transport evidence is incomplete');
  expect(Array.isArray(row.fixtureIds)&&row.fixtureIds.length===row.totalWirelessFixtures,maker+' fixtureIds must enumerate every current wireless fixture');
  expect(new Set(row.fixtureIds).size===row.fixtureIds.length,maker+' fixtureIds must not contain duplicates');
  expect(Array.isArray(row.requiredProductionRoutes)&&row.requiredProductionRoutes.length===row.bluetoothFixtures+row.wifiFixtures,maker+' required production route matrix must cover every catalog transport');
  const routeKeys=row.requiredProductionRoutes.map(r=>String(r?.fixtureId||'')+'::'+String(r?.transport||'').toLowerCase());
  expect(new Set(routeKeys).size===routeKeys.length,maker+' required production routes must be unique');
  expect(row.requiredProductionRoutes.every(r=>row.fixtureIds.includes(String(r?.fixtureId||''))),maker+' required production route references unknown fixture');
  expect(row.requiredProductionRoutes.every(r=>['bluetooth','wifi'].includes(String(r?.transport||'').toLowerCase())),maker+' required production route has unsupported transport');
  if(row.bluetoothFixtures>0) expect(!!row.bluetoothPlan,maker+' Bluetooth capture plan missing');
  if(row.wifiFixtures>0) expect(!!row.wifiPlan,maker+' Wi-Fi capture plan missing');
  expect(row.commandReady===false,maker+' command driver must remain fail-closed');
}
for(const maker of ['Kino Flo','De Sisti','LiteGear']){
  expect(!by[maker],maker+' unexpectedly entered direct Bluetooth/Wi-Fi readiness');
}
expect(report.vendors[0]?.manufacturer==='Nanlite','Nanlite should lead current wireless-coverage vendor count after verified WS-TB-1 assisted routes');
expect(by.Godox?.bluetoothFixtures===68,'Godox Bluetooth count changed unexpectedly');
expect(by.Nanlite?.bluetoothFixtures===70,'Nanlite Bluetooth count changed unexpectedly');
expect(by.Nanlite?.wifiFixtures===8,'Nanlite Wi-Fi count changed unexpectedly');
expect(by.Astera?.bluetoothFixtures===23&&by.Astera?.wifiFixtures===19,'Astera wireless counts changed unexpectedly');
expect(by.Aputure?.bluetoothFixtures===19,'Aputure Bluetooth count changed unexpectedly');
expect(by.Creamsource?.bluetoothFixtures===8&&by.Creamsource?.wifiFixtures===0,'Creamsource Vortex wireless counts changed unexpectedly');
expect(by.Rotolight?.bluetoothFixtures===7&&by.Rotolight?.wifiFixtures===5&&by.Rotolight?.bothFixtures===5,'Rotolight wireless counts changed unexpectedly');
expect(by.Luxli?.bluetoothFixtures===7&&by.Luxli?.wifiFixtures===0,'Luxli wireless counts changed unexpectedly');
expect(by['Quasar Science']?.bluetoothFixtures===4&&by['Quasar Science']?.wifiFixtures===4&&by['Quasar Science']?.bothFixtures===4,'Quasar Science wireless counts changed unexpectedly');
expect(by.Kelvin?.bluetoothFixtures===6&&by.Kelvin?.wifiFixtures===0,'Kelvin wireless counts changed unexpectedly');
expect(by.SmallRig?.bluetoothFixtures===4&&by.SmallRig?.wifiFixtures===0,'SmallRig wireless counts changed unexpectedly');
expect(by.amaran?.bluetoothFixtures===20&&by.amaran?.wifiFixtures===1&&by.amaran?.bothFixtures===1,'amaran wireless counts changed unexpectedly');
expect(by.NEEWER?.bluetoothFixtures===4&&by.NEEWER?.wifiFixtures===0,'NEEWER wireless counts changed unexpectedly');
expect(by.GVM?.bluetoothFixtures===10&&by.GVM?.wifiFixtures===1&&by.GVM?.bothFixtures===0,'GVM wireless counts changed unexpectedly');
expect(by.Litepanels?.bluetoothFixtures===13&&by.Litepanels?.wifiFixtures===3&&by.Litepanels?.bothFixtures===3,'Litepanels wireless counts changed unexpectedly');
expect(by.Litepanels?.assistedBluetooth===10,'Litepanels assisted Bluetooth count changed unexpectedly');
expect(by['DMG Lumiere']?.bluetoothFixtures===3&&by['DMG Lumiere']?.wifiFixtures===3&&by['DMG Lumiere']?.bothFixtures===3,'DMG Lumiere wireless counts changed unexpectedly');
expect(by['DMG Lumiere']?.assistedBluetooth===2&&by['DMG Lumiere']?.assistedWifi===2,'DMG Lumiere assisted route counts changed unexpectedly');
expect(by.ZHIYUN?.bluetoothFixtures===16&&by.ZHIYUN?.wifiFixtures===0&&by.ZHIYUN?.bothFixtures===0,'ZHIYUN wireless counts changed unexpectedly');
expect(by.PROLYCHT?.bluetoothFixtures===2&&by.PROLYCHT?.wifiFixtures===2&&by.PROLYCHT?.bothFixtures===2,'PROLYCHT wireless counts changed unexpectedly');
expect(by.COLBOR?.bluetoothFixtures===2&&by.COLBOR?.wifiFixtures===0&&by.COLBOR?.bothFixtures===0,'COLBOR wireless counts changed unexpectedly');
expect(by.SIRUI?.bluetoothFixtures===10&&by.SIRUI?.wifiFixtures===0&&by.SIRUI?.bothFixtures===0,'SIRUI wireless counts changed unexpectedly');
expect(by.Fiilex?.bluetoothFixtures===0&&by.Fiilex?.wifiFixtures===1&&by.Fiilex?.bothFixtures===0,'Fiilex wireless counts changed unexpectedly');
expect(by.Harlowe?.bluetoothFixtures===11&&by.Harlowe?.wifiFixtures===0&&by.Harlowe?.bothFixtures===0,'Harlowe wireless counts changed unexpectedly');
expect(by.SWIT?.bluetoothFixtures===7&&by.SWIT?.wifiFixtures===0&&by.SWIT?.bothFixtures===0,'SWIT wireless counts changed unexpectedly');
expect(by.Dracast?.bluetoothFixtures===2&&by.Dracast?.wifiFixtures===0&&by.Dracast?.bothFixtures===0,'Dracast wireless counts changed unexpectedly');
expect(by['Hive Lighting']?.bluetoothFixtures===7&&by['Hive Lighting']?.wifiFixtures===0&&by['Hive Lighting']?.bothFixtures===0,'Hive Lighting wireless counts changed unexpectedly');
expect(by.Kinotehnik?.bluetoothFixtures===2&&by.Kinotehnik?.wifiFixtures===0&&by.Kinotehnik?.bothFixtures===0,'Kinotehnik wireless counts changed unexpectedly');
expect(by.VELVET?.bluetoothFixtures===4&&by.VELVET?.wifiFixtures===6&&by.VELVET?.bothFixtures===4,'VELVET wireless counts changed unexpectedly');
expect(by.VILTROX?.bluetoothFixtures===2&&by.VILTROX?.wifiFixtures===0&&by.VILTROX?.bothFixtures===0,'VILTROX wireless counts changed unexpectedly');
expect(by.Phottix?.bluetoothFixtures===4&&by.Phottix?.wifiFixtures===0&&by.Phottix?.bothFixtures===0,'Phottix wireless counts changed unexpectedly');
expect(by.YONGNUO?.bluetoothFixtures===4&&by.YONGNUO?.wifiFixtures===0&&by.YONGNUO?.bothFixtures===0,'YONGNUO wireless counts changed unexpectedly');

console.log(JSON.stringify({ok:failures.length===0,report,failures},null,2));
if(failures.length)process.exit(1);
