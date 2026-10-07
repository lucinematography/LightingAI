import { normalizeArriWirelessControl } from './arri-wireless-verification.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

const fixtures=[
  {id:'arri-skypanel-x21',manufacturer:'ARRI',sourceUrl:'https://www.arri.com/',control:{wireless:[]}},
  {id:'arri-skypanel-s60-pro',manufacturer:'ARRI',sourceUrl:'https://www.arri.com/',control:{wireless:[]}},
  {id:'arri-orbiter',manufacturer:'ARRI',sourceUrl:'https://www.arri.com/',control:{wireless:[]}},
  {id:'arri-omnibar-2',manufacturer:'ARRI',sourceUrl:'https://www.arri.com/en/lighting/led-linear-lights/omnibar',control:{wireless:['CRMX']}},
  {id:'arri-omnibar-4',manufacturer:'ARRI',sourceUrl:'https://www.arri.com/en/lighting/led-linear-lights/omnibar',control:{wireless:['CRMX']}}
];
normalizeArriWirelessControl(fixtures);

for(const fixture of fixtures){
  expect(fixture.control?.wirelessVerification?.bluetooth?.verified===true,fixture.id+' Bluetooth transport evidence missing');
  expect(fixture.control?.capabilityVerification?.dim?.verified===true,fixture.id+' DIM capability evidence missing');
  expect(fixture.control?.capabilityVerification?.color?.verified===true,fixture.id+' COLOR capability evidence missing');
  expect(fixture.control?.capabilityVerification?.fx?.verified===true,fixture.id+' FX capability evidence missing');
  for(const key of ['dim','color','fx']){
    expect(fixture.control.capabilityVerification[key].scope==='official-app-capability-only',fixture.id+' '+key+' capability scope must remain app-only');
  }
}
expect(fixtures.find(x=>x.id==='arri-orbiter')?.control?.externalInterfaceRequired?.includes('Supported Bluetooth 5.0 USB dongle')===true,'Orbiter Bluetooth dongle requirement missing');
expect(fixtures.find(x=>x.id==='arri-skypanel-s60-pro')?.control?.wirelessVerification?.wifi?.verified===true,'S60 Pro Wi-Fi evidence missing');
for(const id of ['arri-omnibar-2','arri-omnibar-4']){
  const fixture=fixtures.find(x=>x.id===id);
  expect(fixture?.control?.wirelessVerification?.bluetooth?.family==='ARRI Omnibar Bluetooth Mesh',id+' Omnibar Bluetooth Mesh family missing');
  expect(fixture?.control?.capabilityVerification?.cct?.verified===true,id+' CCT app capability evidence missing');
}

console.log(JSON.stringify({ok:failures.length===0,fixtures:fixtures.length,productionCommandReady:false,failures},null,2));
if(failures.length)process.exit(1);
