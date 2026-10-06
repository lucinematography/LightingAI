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

expect(report.fixtureCount===925,'fixture total changed from verified catalog');
expect(report.wirelessFixtures===588,'verified wireless fixture total changed unexpectedly');
expect(report.fixturesWithAnyGap>0,'capability-gap audit unexpectedly empty');

const by=report.byManufacturer;
for(const maker of ['Godox','Nanlite','Aputure','Astera','ARRI','Aladdin','EV Light','Creamsource','Rotolight','Luxli','Quasar Science','Kelvin','SmallRig','amaran','NEEWER','GVM','Litepanels','DMG Lumiere','ZHIYUN','PROLYCHT','COLBOR','SIRUI','Fiilex','Harlowe','SWIT','Dracast','Hive Lighting','Kinotehnik','VELVET','VILTROX','Phottix','YONGNUO','PIXEL','Falcon Eyes','Lishuai','NiceFoto','Ulanzi','CAME-TV','SOONWELL','Tolifo','Moman','Ikan','Jinbei','Lume Cube','CHAUVET DJ','Fotodiox','broncolor','Genaray','Elgato','Westcott','Logitech G','Rollei','Razer','NANLUX','Mettle','PiXAPRO','Ape Labs','Pilotfly','LUXCEO','Yidoblo','FEELWORLD','SUTEFOTO','YC Onion','K&F Concept','Profoto','SHEHDS','Weeylite','IMRELAX','Kenro','Selens','Fomex','BB&S Lighting','SUMOLIGHT','PROLIGHTS','Lightstar Lights','Mole-Richardson','ZOLAR','Filmgear','Rosco','dedolight','ADJ Lighting','Elinchrom','CineLight','ROXX','iFootage','Cineroid','Sokani','FotorGear','BRESSER','Digitek','Manfrotto']){
  expect(!!by[maker],maker+' capability-gap row missing');
}

expect(by.Godox?.wirelessFixtures===68,'Godox wireless count changed');
expect(by.Nanlite?.wirelessFixtures===77,'Nanlite wireless count changed');
expect(by.Pilotfly?.wirelessFixtures===4,'Pilotfly wireless count changed');
expect(by.LUXCEO?.wirelessFixtures===4,'LUXCEO wireless count changed');
expect(by.Yidoblo?.wirelessFixtures===4,'Yidoblo wireless count changed');
expect(by.FEELWORLD?.wirelessFixtures===5,'FEELWORLD wireless count changed');
expect(by.SUTEFOTO?.wirelessFixtures===2,'SUTEFOTO wireless count changed');
expect(by['YC Onion']?.wirelessFixtures===1,'YC Onion wireless count changed');
expect(by['K&F Concept']?.wirelessFixtures===1,'K&F Concept wireless count changed');
expect(by.Profoto?.wirelessFixtures===4,'Profoto wireless count changed');
expect(by.SHEHDS?.wirelessFixtures===2,'SHEHDS wireless count changed');
expect(by.Weeylite?.wirelessFixtures===6,'Weeylite wireless count changed');
expect(by.IMRELAX?.wirelessFixtures===1,'IMRELAX wireless count changed');
expect(by.Kenro?.wirelessFixtures===3,'Kenro wireless count changed');
expect(by.Selens?.wirelessFixtures===2,'Selens wireless count changed');
expect(by.Fomex?.wirelessFixtures===2,'Fomex wireless count changed');
expect(by['BB&S Lighting']?.wirelessFixtures===2,'BB&S Lighting wireless count changed');
expect(by.SUMOLIGHT?.wirelessFixtures===1,'SUMOLIGHT wireless count changed');
expect(by.PROLIGHTS?.wirelessFixtures===3,'PROLIGHTS wireless count changed');
expect(by['Lightstar Lights']?.wirelessFixtures===9,'Lightstar Lights wireless count changed');
expect(by['Mole-Richardson']?.wirelessFixtures===13,'Mole-Richardson wireless count changed');
expect(by.ZOLAR?.wirelessFixtures===3,'ZOLAR wireless count changed');
expect(by.Filmgear?.wirelessFixtures===5,'Filmgear wireless count changed');
expect(by.Rosco?.wirelessFixtures===4,'Rosco wireless count changed');
expect(by.dedolight?.wirelessFixtures===4,'dedolight wireless count changed');
expect(by['ADJ Lighting']?.wirelessFixtures===3,'ADJ Lighting wireless count changed');
expect(by.Elinchrom?.wirelessFixtures===3,'Elinchrom wireless count changed');
expect(by.CineLight?.wirelessFixtures===3,'CineLight wireless count changed');
expect(by.ROXX?.wirelessFixtures===4,'ROXX wireless count changed');
expect(by.iFootage?.wirelessFixtures===10,'iFootage wireless count changed');
expect(by.Cineroid?.wirelessFixtures===1,'Cineroid wireless count changed');
expect(by.Sokani?.wirelessFixtures===1,'Sokani wireless count changed');
expect(by.FotorGear?.wirelessFixtures===1,'FotorGear wireless count changed');
expect(by.BRESSER?.wirelessFixtures===5,'BRESSER wireless count changed');
expect(by.Digitek?.wirelessFixtures===1,'Digitek wireless count changed');
expect(by.Manfrotto?.wirelessFixtures===3,'Manfrotto wireless count changed');
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
