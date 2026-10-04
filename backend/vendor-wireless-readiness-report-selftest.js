import { buildWirelessReadinessReport } from './vendor-wireless-readiness-report.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
const report=buildWirelessReadinessReport();

expect(report.fixtureCount===561,'fixture count changed from verified catalog total');
expect(report.coveredManufacturers===10,'wireless manufacturer coverage must remain 10');
expect(report.commandReadyManufacturers===0,'no proprietary wireless command driver may be production-ready yet');

const by=Object.fromEntries(report.vendors.map(v=>[v.manufacturer,v]));
for(const maker of ['Godox','Nanlite','Aputure','Astera','ARRI','Aladdin','EV Light','Creamsource','Rotolight','Luxli']){
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

console.log(JSON.stringify({ok:failures.length===0,report,failures},null,2));
if(failures.length)process.exit(1);
