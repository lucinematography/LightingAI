import { buildWirelessCapabilityGapReport, expectedCapabilities, verifiedWirelessTransport } from './wireless-control-capability-gap-report.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
const report=buildWirelessCapabilityGapReport();

const rawOnlyFixture={
  id:'synthetic-raw-bluetooth-only',
  manufacturer:'Synthetic',
  category:'Light',
  colorMode:'Daylight',
  cctK:{min:5600,max:5600},
  control:{wireless:['Bluetooth']}
};
expect(!rawOnlyFixture.control?.wirelessVerification?.bluetooth?.verified,
  'Synthetic raw Bluetooth label must remain unverified');
expect(verifiedWirelessTransport(rawOnlyFixture).any===false,
  'Raw Bluetooth catalog label without verified transport evidence must be excluded from wireless gap scope');
expect(verifiedWirelessTransport({
  ...rawOnlyFixture,
  control:{
    wireless:['Bluetooth'],
    wirelessVerification:{bluetooth:{verified:true}}
  }
}).bluetooth===true,
  'Verified Bluetooth transport evidence must enter wireless gap scope');

expect(report.fixtureCount===782,'fixture total changed from verified catalog');
expect(report.wirelessFixtures===445,'verified wireless fixture total changed unexpectedly');
expect(report.fixturesWithAnyGap>0,'capability-gap audit unexpectedly empty');

const by=report.byManufacturer;
for(const maker of ['Godox','Nanlite','Aputure','Astera','ARRI','Aladdin','EV Light','Creamsource','Rotolight','Luxli','Quasar Science','Kelvin','SmallRig','amaran','NEEWER','GVM','Litepanels','DMG Lumiere','ZHIYUN','PROLYCHT','COLBOR','SIRUI','Fiilex','Harlowe','SWIT','Dracast','Hive Lighting','Kinotehnik','VELVET','VILTROX','Phottix','YONGNUO','PIXEL','Falcon Eyes','Lishuai','NiceFoto','Ulanzi','CAME-TV','SOONWELL','Tolifo','Moman','Ikan','Jinbei','Lume Cube','CHAUVET DJ','Fotodiox','broncolor','Genaray','Elgato','Westcott']){
  expect(!!by[maker],maker+' capability-gap row missing');
}

expect(by.Godox?.wirelessFixtures===68,'Godox wireless count changed');
expect(by.Nanlite?.wirelessFixtures===77,'Nanlite wireless count changed');
expect(by.Godox?.missingDim===0,'Godox DIM official-app capability coverage changed');
expect(by.Nanlite?.missingDim===0,'Nanlite DIM official-app capability coverage changed');
expect(by.Aputure?.missingDim===0,'Aputure DIM official-app capability coverage changed');
expect(by.Aputure?.missingFx===0,'Aputure FX official-app capability coverage changed');
const daylight=expectedCapabilities({category:'Light',colorMode:'Daylight',cctK:{min:5600,max:5600}});
expect(daylight.dim===true,'Daylight light should still expect DIM verification');
expect(daylight.cct===false,'Fixed-daylight fixture must not be treated as a missing CCT-control gap');
expect(daylight.color===false,'Daylight fixture must not be treated as a missing COLOR-control gap');
expect(daylight.fx===false,'Fixture without independent FX declaration must not be treated as a missing FX gap');

const bicolor=expectedCapabilities({category:'Light',colorMode:'Bi-Color',cctK:{min:2700,max:6500}});
expect(bicolor.cct===true,'Variable-CCT fixture must expect CCT capability evidence');
expect(bicolor.color===false,'Bi-Color fixture must not be treated as RGB/full-color');

const rgb=expectedCapabilities({category:'Light',colorMode:'RGBWW',cctK:{min:2000,max:10000}});
expect(rgb.color===true,'RGBWW fixture must expect COLOR capability evidence');

const fx=expectedCapabilities({category:'Light',colorMode:'Daylight',cctK:{min:5600,max:5600},dmxModes:[{name:'Lighting & Effects 6ch'}]});
expect(fx.fx===true,'Explicit Effects mode must make FX an expected capability');

console.log(JSON.stringify({ok:failures.length===0,summary:{
  fixtureCount:report.fixtureCount,
  wirelessFixtures:report.wirelessFixtures,
  fixturesWithAnyGap:report.fixturesWithAnyGap,
  byManufacturer:report.byManufacturer
},failures},null,2));
if(failures.length)process.exit(1);
