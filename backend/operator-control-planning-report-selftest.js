import { buildOperatorControlPlanningReport } from './operator-control-planning-report.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
const report=buildOperatorControlPlanningReport();
const by=Object.fromEntries(report.vendors.map(v=>[v.manufacturer,v]));

expect(report.fixtureCount===822,'fixture total changed from verified catalog');
expect(report.wirelessManufacturers===61,'wireless manufacturer count must remain 61');
expect(report.commandReadyManufacturers===0,'no vendor command driver may be production-ready');
expect(report.totals.wirelessFixtures>0,'wireless planning report unexpectedly empty');
expect(report.totals.dimControlVerified<=report.totals.dimCapable,'verified control totals must be bounded by physical DIM capability');
expect(report.totals.cctControlVerified<=report.totals.cctCapable,'verified CCT control total exceeds physical capability');
expect(report.totals.colorControlVerified<=report.totals.colorCapable,'verified COLOR control total exceeds physical capability');
expect(report.totals.fxControlVerified<=report.totals.fxCapable,'verified FX control total exceeds physical capability');

for(const maker of ['Godox','Nanlite','Aputure','Astera','ARRI','Aladdin','EV Light','Creamsource','Rotolight','Luxli','Quasar Science','Kelvin','SmallRig','amaran','NEEWER','GVM','Litepanels','DMG Lumiere','ZHIYUN','PROLYCHT','COLBOR','SIRUI','Fiilex','Harlowe','SWIT','Dracast','Hive Lighting','Kinotehnik','VELVET','VILTROX','Phottix','YONGNUO','PIXEL','Falcon Eyes','Lishuai','NiceFoto','Ulanzi','CAME-TV','SOONWELL','Tolifo','Moman','Ikan','Jinbei','Lume Cube','CHAUVET DJ','Fotodiox','broncolor','Genaray','Elgato','Westcott','Logitech G','Rollei','Razer','NANLUX','Mettle','PiXAPRO','Ape Labs','Pilotfly','LUXCEO','Yidoblo','FEELWORLD']){
  const row=by[maker];
  expect(!!row,maker+' planning row missing');
  if(!row) continue;
  if(row.bluetoothFixtures>0) expect(!!row.bluetoothPlanId,maker+' Bluetooth plan missing from planning report');
  if(row.wifiFixtures>0) expect(!!row.wifiPlanId,maker+' Wi-Fi plan missing from planning report');
  expect(row.commandReady===false,maker+' commandReady must remain false');
  expect(Array.isArray(row.requiredProductionFixtureIds)&&row.requiredProductionFixtureIds.length>=row.wirelessFixtures,maker+' required production fixture IDs must cover every planning fixture');
  expect(new Set(row.requiredProductionFixtureIds).size===row.requiredProductionFixtureIds.length,maker+' required production fixture IDs must be unique');
  expect(Array.isArray(row.requiredProductionTransports)&&row.requiredProductionTransports.length>0,maker+' required production transports missing');
  expect(Array.isArray(row.requiredProductionRoutes)&&row.requiredProductionRoutes.length>=row.bluetoothFixtures+row.wifiFixtures,maker+' required production routes must cover verified planning routes');
  const routeKeys=row.requiredProductionRoutes.map(r=>String(r?.fixtureId||'')+'::'+String(r?.transport||'').toLowerCase());
  expect(new Set(routeKeys).size===routeKeys.length,maker+' required production routes must be unique');
  expect(row.requiredProductionRoutes.every(r=>row.requiredProductionFixtureIds.includes(String(r?.fixtureId||''))),maker+' production route references fixture outside required scope');
  expect(row.dimCapable<=row.wirelessFixtures,maker+' DIM capability count exceeds wireless fixtures');
  expect(row.cctCapable<=row.wirelessFixtures,maker+' CCT capability count exceeds wireless fixtures');
  expect(row.colorCapable<=row.wirelessFixtures,maker+' COLOR capability count exceeds wireless fixtures');
  expect(row.fxCapable<=row.wirelessFixtures,maker+' FX capability count exceeds wireless fixtures');
  expect(row.dimControlVerified<=row.dimCapable,maker+' verified DIM control exceeds fixture DIM capability');
  expect(row.cctControlVerified<=row.cctCapable,maker+' verified CCT control exceeds fixture CCT capability');
  expect(row.colorControlVerified<=row.colorCapable,maker+' verified COLOR control exceeds fixture COLOR capability');
  expect(row.fxControlVerified<=row.fxCapable,maker+' verified FX control exceeds fixture FX capability');
}

expect(report.vendors[0]?.manufacturer==='Nanlite','Nanlite should lead current wireless fixture coverage after verified WS-TB-1 assisted routes');
expect(by.Godox?.wirelessFixtures===68,'Godox wireless fixture count changed unexpectedly');
expect(by.Nanlite?.wirelessFixtures===77,'Nanlite unique wireless fixture count changed unexpectedly');
expect(by.Aputure?.wirelessFixtures===19,'Aputure wireless fixture count changed unexpectedly');
expect(by.Astera?.wirelessFixtures===23,'Astera unique wireless fixture count changed unexpectedly');
expect(by['DMG Lumiere']?.wirelessFixtures===3,'DMG Lumiere wireless fixture count changed unexpectedly');
expect(by.ZHIYUN?.wirelessFixtures===16,'ZHIYUN wireless fixture count changed unexpectedly');
expect(by.PROLYCHT?.wirelessFixtures===2,'PROLYCHT wireless fixture count changed unexpectedly');
expect(by.COLBOR?.wirelessFixtures===2,'COLBOR wireless fixture count changed unexpectedly');
expect(by.SIRUI?.wirelessFixtures===10,'SIRUI wireless fixture count changed unexpectedly');
expect(by.Fiilex?.wirelessFixtures===1,'Fiilex wireless fixture count changed unexpectedly');
expect(by.Harlowe?.wirelessFixtures===11,'Harlowe wireless fixture count changed unexpectedly');
expect(by.SWIT?.wirelessFixtures===7,'SWIT wireless fixture count changed unexpectedly');
expect(by.Dracast?.wirelessFixtures===2,'Dracast wireless fixture count changed unexpectedly');
expect(by['Hive Lighting']?.wirelessFixtures===7,'Hive Lighting wireless fixture count changed unexpectedly');
expect(by.Kinotehnik?.wirelessFixtures===2,'Kinotehnik wireless fixture count changed unexpectedly');
expect(by.VELVET?.wirelessFixtures===6,'VELVET wireless fixture count changed unexpectedly');
expect(by.VILTROX?.wirelessFixtures===2,'VILTROX wireless fixture count changed unexpectedly');
expect(by.Phottix?.wirelessFixtures===4,'Phottix wireless fixture count changed unexpectedly');
expect(by.YONGNUO?.wirelessFixtures===4,'YONGNUO wireless fixture count changed unexpectedly');
expect(by.PIXEL?.wirelessFixtures===2,'PIXEL wireless fixture count changed unexpectedly');
expect(by['Falcon Eyes']?.wirelessFixtures===4,'Falcon Eyes wireless fixture count changed unexpectedly');
expect(by.Lishuai?.wirelessFixtures===2,'Lishuai wireless fixture count changed unexpectedly');
expect(by.NiceFoto?.wirelessFixtures===8,'NiceFoto wireless fixture count changed unexpectedly');
expect(by.Ulanzi?.wirelessFixtures===5,'Ulanzi wireless fixture count changed unexpectedly');
expect(by['CAME-TV']?.wirelessFixtures===8,'CAME-TV wireless fixture count changed unexpectedly');
expect(by.SOONWELL?.wirelessFixtures===1,'SOONWELL wireless fixture count changed unexpectedly');
expect(by.Tolifo?.wirelessFixtures===2,'Tolifo wireless fixture count changed unexpectedly');
expect(by.Moman?.wirelessFixtures===1,'Moman wireless fixture count changed unexpectedly');
expect(by.Ikan?.wirelessFixtures===1,'Ikan wireless fixture count changed unexpectedly');
expect(by.Jinbei?.wirelessFixtures===3,'Jinbei wireless fixture count changed unexpectedly');
expect(by['Lume Cube']?.wirelessFixtures===4,'Lume Cube wireless fixture count changed unexpectedly');
expect(by['CHAUVET DJ']?.wirelessFixtures===21,'CHAUVET DJ wireless fixture count changed unexpectedly');
expect(by.Fotodiox?.wirelessFixtures===1,'Fotodiox wireless fixture count changed unexpectedly');
expect(by.broncolor?.wirelessFixtures===1,'broncolor wireless fixture count changed unexpectedly');
expect(by.Genaray?.wirelessFixtures===7,'Genaray wireless fixture count changed unexpectedly');
expect(by.Elgato?.wirelessFixtures===5,'Elgato wireless fixture count changed unexpectedly');
expect(by.Westcott?.wirelessFixtures===4,'Westcott wireless fixture count changed unexpectedly');
expect(by['Logitech G']?.wirelessFixtures===2,'Logitech G wireless fixture count changed unexpectedly');
expect(by.Rollei?.wirelessFixtures===12,'Rollei wireless fixture count changed unexpectedly');
expect(by.Razer?.wirelessFixtures===1,'Razer wireless fixture count changed unexpectedly');
expect(by.NANLUX?.wirelessFixtures===1,'NANLUX wireless fixture count changed unexpectedly');
expect(by.Mettle?.wirelessFixtures===3,'Mettle wireless fixture count changed unexpectedly');
expect(by.PiXAPRO?.wirelessFixtures===2,'PiXAPRO wireless fixture count changed unexpectedly');
expect(by['Ape Labs']?.wirelessFixtures===2,'Ape Labs wireless fixture count changed unexpectedly');
expect(by.Pilotfly?.wirelessFixtures===4,'Pilotfly wireless fixture count changed unexpectedly');
expect(by.LUXCEO?.wirelessFixtures===4,'LUXCEO wireless fixture count changed unexpectedly');
expect(by.Yidoblo?.wirelessFixtures===4,'Yidoblo wireless fixture count changed unexpectedly');
expect(by.FEELWORLD?.wirelessFixtures===5,'FEELWORLD wireless fixture count changed unexpectedly');

for(const maker of ['Nanlite','Astera','ARRI','EV Light','Rotolight','Quasar Science','amaran','GVM','Litepanels','DMG Lumiere','PROLYCHT']){
  const transports=new Set(by[maker]?.requiredProductionTransports||[]);
  expect(transports.has('bluetooth')&&transports.has('wifi'),maker+' dual-transport production scope must require Bluetooth and Wi-Fi');
}
for(const maker of ['Godox','Aputure','Aladdin','Creamsource','Luxli','Kelvin','SmallRig','NEEWER','ZHIYUN','COLBOR','SIRUI','Harlowe','SWIT','Dracast','Hive Lighting','Kinotehnik','Pilotfly','LUXCEO','Yidoblo','FEELWORLD']){
  const transports=by[maker]?.requiredProductionTransports||[];
  expect(transports.length===1&&transports[0]==='bluetooth',maker+' current production scope should require Bluetooth only');
}

{
  const transports=by.Fiilex?.requiredProductionTransports||[];
  expect(transports.length===1&&transports[0]==='wifi','Fiilex current production scope should require Wi-Fi only');
}

console.log(JSON.stringify({ok:failures.length===0,report,failures},null,2));
if(failures.length)process.exit(1);
