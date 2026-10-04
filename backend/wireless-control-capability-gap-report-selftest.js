import { buildWirelessCapabilityGapReport } from './wireless-control-capability-gap-report.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
const report=buildWirelessCapabilityGapReport();

expect(report.fixtureCount===539,'fixture total changed from verified catalog');
expect(report.wirelessFixtures===185,'wireless fixture total changed unexpectedly');
expect(report.fixturesWithAnyGap>0,'capability-gap audit unexpectedly empty');

const by=report.byManufacturer;
for(const maker of ['Godox','Nanlite','Aputure','Astera','ARRI','Aladdin','EV Light']){
  expect(!!by[maker],maker+' capability-gap row missing');
}

expect(by.Godox?.wirelessFixtures===68,'Godox wireless count changed');
expect(by.Nanlite?.wirelessFixtures===66,'Nanlite wireless count changed');
expect(by.Godox?.missingDim===67,'Godox DIM gap baseline changed');
expect(by.Nanlite?.missingDim===66,'Nanlite DIM gap baseline changed');
expect(by.Aputure?.missingDim===3,'Aputure DIM gap baseline changed');
expect(by.Astera?.missingCct===17,'Astera CCT gap baseline changed');
expect(by.Aladdin?.missingFx===2,'Aladdin FX gap baseline changed');

console.log(JSON.stringify({ok:failures.length===0,summary:{
  fixtureCount:report.fixtureCount,
  wirelessFixtures:report.wirelessFixtures,
  fixturesWithAnyGap:report.fixturesWithAnyGap,
  byManufacturer:report.byManufacturer
},failures},null,2));
if(failures.length)process.exit(1);
