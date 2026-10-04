import { buildWirelessFixtureClassCoverageReport } from './wireless-fixture-class-coverage-report.js';
import { buildWirelessReadinessReport } from './vendor-wireless-readiness-report.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
const report=buildWirelessFixtureClassCoverageReport();
const readiness=buildWirelessReadinessReport();
const readinessBluetooth=readiness.vendors.reduce((n,row)=>n+row.bluetoothFixtures,0);
const readinessWifi=readiness.vendors.reduce((n,row)=>n+row.wifiFixtures,0);
const readinessMakers=new Set(readiness.vendors.map(row=>row.manufacturer));
const classMakers=new Set(Object.keys(report.byManufacturer));

expect(report.fixtureCount===539,'fixture total changed from verified catalog');
expect(report.wirelessFixtureCount>0,'wireless fixture coverage unexpectedly empty');
expect(report.bluetoothRoutes>0,'Bluetooth route coverage unexpectedly empty');
expect(report.wifiRoutes>0,'Wi-Fi route coverage unexpectedly empty');
expect(report.wirelessFixtureCount===readiness.totalWirelessFixtureRows,'class coverage wireless fixture total diverges from readiness report');
expect(report.bluetoothRoutes===readinessBluetooth,'class coverage Bluetooth route total diverges from readiness report');
expect(report.wifiRoutes===readinessWifi,'class coverage Wi-Fi route total diverges from readiness report');
expect(classMakers.size===readinessMakers.size&&[...classMakers].every(m=>readinessMakers.has(m)),'class coverage manufacturer set diverges from readiness report');
const matrixMakers=new Set(Object.keys(report.byManufacturerClassSignature).map(key=>key.split(' :: ')[0]));
expect(matrixMakers.size===readinessMakers.size&&[...matrixMakers].every(m=>readinessMakers.has(m)),'manufacturer-class matrix manufacturer set diverges from readiness report');
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
const familyFixtureTotal=Object.values(report.byFamily).reduce((n,row)=>n+row.fixtureCount,0);
const sourceTypeFixtureTotal=Object.values(report.bySourceType).reduce((n,row)=>n+row.fixtureCount,0);
const formFactorFixtureTotal=Object.values(report.byFormFactor).reduce((n,row)=>n+row.fixtureCount,0);
expect(familyFixtureTotal===report.wirelessFixtureCount,'family coverage must enumerate every wireless fixture exactly once');
expect(sourceTypeFixtureTotal===report.wirelessFixtureCount,'sourceType coverage must enumerate every wireless fixture exactly once');
expect(formFactorFixtureTotal===report.wirelessFixtureCount,'formFactor coverage must enumerate every wireless fixture exactly once');
const signatureFixtureTotal=Object.values(report.byClassSignature).reduce((n,row)=>n+row.fixtureCount,0);
expect(signatureFixtureTotal===report.wirelessFixtureCount,'classSignature coverage must enumerate every wireless fixture exactly once');
expect(Object.keys(report.byClassSignature).length>=Math.max(familyKeys.length,sourceTypeKeys.length,formFactorKeys.length),
  'composite class signatures are unexpectedly coarser than individual class dimensions');
expect(classRows.every(row=>row.fixtureCount>0),'wireless class report contains empty class');
expect(classRows.every(row=>row.manufacturers.length>0),'wireless class report contains class without manufacturer');
const signatureRows=Object.values(report.byClassSignature);
expect(signatureRows.every(row=>row.fixtureCount>0),'class signature report contains empty class');
expect(signatureRows.every(row=>row.manufacturers.length>0),'class signature rows must include manufacturer provenance');
const manufacturerClassRows=Object.entries(report.byManufacturerClassSignature);
const manufacturerClassFixtureTotal=manufacturerClassRows.reduce((n,[,row])=>n+row.fixtureCount,0);
expect(manufacturerClassFixtureTotal===report.wirelessFixtureCount,'manufacturer-class matrix must enumerate every wireless fixture exactly once');
expect(manufacturerClassRows.length>=Object.keys(report.byManufacturer).length,'manufacturer-class matrix is unexpectedly narrower than manufacturer coverage');
expect(manufacturerClassRows.every(([key,row])=>key.includes(' :: ')&&row.fixtureCount>0),'manufacturer-class matrix contains malformed or empty row');
expect(manufacturerClassRows.every(([,row])=>row.manufacturers.length===1),'manufacturer-class row must belong to exactly one manufacturer');

console.log(JSON.stringify({ok:failures.length===0,report,failures},null,2));
if(failures.length)process.exit(1);
