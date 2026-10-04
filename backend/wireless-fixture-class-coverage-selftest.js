import { buildWirelessFixtureClassCoverageReport } from './wireless-fixture-class-coverage-report.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
const report=buildWirelessFixtureClassCoverageReport();

expect(report.fixtureCount===539,'fixture total changed from verified catalog');
expect(report.wirelessFixtureCount>0,'wireless fixture coverage unexpectedly empty');
expect(report.bluetoothRoutes>0,'Bluetooth route coverage unexpectedly empty');
expect(report.wifiRoutes>0,'Wi-Fi route coverage unexpectedly empty');
expect(report.unclassifiedFixtureIds.length===0,'wireless fixtures missing family/sourceType/formFactor classification: '+report.unclassifiedFixtureIds.join(', '));

for(const maker of ['Godox','Nanlite','Aputure','Astera','ARRI','Aladdin','EV Light']){
  expect(!!report.byManufacturer[maker],maker+' missing from wireless class coverage');
}
for(const maker of ['Kino Flo','De Sisti','LiteGear']){
  expect(!report.byManufacturer[maker],maker+' unexpectedly entered direct Bluetooth/Wi-Fi class coverage');
}

const familyKeys=Object.keys(report.byFamily);
const sourceTypeKeys=Object.keys(report.bySourceType);
const formFactorKeys=Object.keys(report.byFormFactor);
expect(familyKeys.length>7,'wireless family coverage is too narrow');
expect(sourceTypeKeys.length>7,'wireless sourceType coverage is too narrow');
expect(formFactorKeys.length>7,'wireless formFactor coverage is too narrow');

const classRows=[
  ...Object.values(report.byFamily),
  ...Object.values(report.bySourceType),
  ...Object.values(report.byFormFactor)
];
expect(classRows.every(row=>row.fixtureCount>0),'wireless class report contains empty class');
expect(classRows.every(row=>row.manufacturers.length>0),'wireless class report contains class without manufacturer');

console.log(JSON.stringify({ok:failures.length===0,report,failures},null,2));
if(failures.length)process.exit(1);
