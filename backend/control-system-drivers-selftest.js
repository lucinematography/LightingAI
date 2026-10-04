import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
const src=read('app/src/main/assets/control-system-drivers.js');
const routingSrc=read('app/src/main/assets/control-routing.js');

for(const forbidden of ['standards-native-network','standards-dmx-gateway','Art-Net/sACN → DMX/CRMX'])expect(!src.includes(forbidden),'network/DMX driver remains: '+forbidden);
expect(src.includes("version:'3.0-vendor-wireless'"),'vendor-wireless driver revision missing');

const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(src,sandbox);
const api=sandbox.window.LightingAIControlSystemDrivers;
expect(!!api,'vendor wireless driver API missing');

const astera=api?.resolve({manufacturer:'Astera',control:{wireless:['AsteraApp via Bluetooth']}});
expect(astera?.vendorDrivers?.some(x=>x.id==='vendor-astera-wireless'&&x.transport==='bluetooth'),'Astera Bluetooth candidate missing');
expect(astera?.productionReady===false&&astera?.vendorDirectReady===false,'Astera output must remain locked without physical verification');


const aputureSidus=api?.resolve({manufacturer:'Aputure',control:{wireless:['Sidus Link','Sidus Bluetooth Mesh']}});
expect(aputureSidus?.candidateTransports?.bluetooth===true,'Aputure Sidus Bluetooth Mesh candidate not classified');
expect(aputureSidus?.productionReady===false,'Aputure Sidus candidate must remain fail-closed until protocol verification');

const nanliteBoth=api?.resolve({manufacturer:'Nanlite',control:{wireless:['NANLINK Bluetooth','NANLINK Wi-Fi']}});
expect(nanliteBoth?.candidateTransports?.bluetooth===true&&nanliteBoth?.candidateTransports?.wifi===true,'Nanlite Bluetooth + Wi-Fi candidates not classified');


const nanliteDirect=api?.resolve({manufacturer:'Nanlite',control:{wireless:['NANLINK Bluetooth']}});
expect(nanliteDirect?.candidateTransports?.bluetooth===true,'Nanlite NANLINK Bluetooth candidate not classified');
expect(nanliteDirect?.productionReady===false,'Nanlite Bluetooth candidate must remain fail-closed until protocol verification');
const nanlite24g=api?.resolve({manufacturer:'Nanlite',control:{wireless:['NANLINK 2.4GHz via WS-TB-1']}});
expect(nanlite24g?.vendorDrivers?.length===0,'Nanlite 2.4GHz via WS-TB-1 must not be inferred as direct Bluetooth/Wi-Fi');

const wifiOnly=api?.resolve({manufacturer:'Kino Flo',control:{wireless:['Vendor Wi-Fi app control']}});
expect(wifiOnly?.candidateTransports?.wifi===true&&wifiOnly?.candidateTransports?.bluetooth===false,'Wi-Fi-only candidate not classified');

const assistedWifi=api?.resolve({manufacturer:'Nanlite',control:{wireless:['Wi-Fi via Nanlite W-2 adapter'],externalInterfaceRequired:['Nanlite W-2 Wi-Fi adapter']}});
const assistedWifiDriver=assistedWifi?.vendorDrivers?.find(x=>x.transport==='wifi');
expect(assistedWifiDriver?.requiresExternalInterface===true&&assistedWifiDriver?.direct===false,'adapter-assisted Wi-Fi candidate not marked');

const assistedBt=api?.resolve({manufacturer:'ARRI',control:{wireless:['ARRI LiCo Bluetooth 5.0 via supported USB dongle'],externalInterfaceRequired:['Supported Bluetooth 5.0 USB dongle']}});
const assistedBtDriver=assistedBt?.vendorDrivers?.find(x=>x.transport==='bluetooth');
expect(assistedBtDriver?.requiresExternalInterface===true&&assistedBtDriver?.direct===false,'adapter-assisted Bluetooth candidate not marked');


const evBluetooth=api?.resolve({manufacturer:'EV Light',control:{wireless:['Bluetooth App Control']}});
expect(evBluetooth?.candidateTransports?.bluetooth===true,'EV Light Bluetooth candidate not classified');
expect(evBluetooth?.productionReady===false,'EV Light Bluetooth candidate must remain fail-closed');

const evWifi=api?.resolve({manufacturer:'EV Light',control:{wireless:['WiFi-DMX','App control']}});
expect(evWifi?.candidateTransports?.wifi===true,'EV Light Wi-Fi candidate not classified');
expect(evWifi?.productionReady===false,'EV Light Wi-Fi candidate must remain fail-closed');

const evWirelessDmx=api?.resolve({manufacturer:'EV Light',control:{wireless:['Wireless DMX']}});
expect(evWirelessDmx?.vendorDrivers?.length===0,'EV Light Wireless DMX must not be inferred as Bluetooth/Wi-Fi');

const radioOnly=api?.resolve({manufacturer:'Godox',control:{wireless:['2.4 GHz wireless control']}});
expect(radioOnly?.vendorDrivers?.length===0,'2.4 GHz radio metadata must not be guessed as Bluetooth/Wi-Fi');

const dmxOnly=api?.resolve({manufacturer:'Astera',control:{wired:['DMX512']},dmxModes:[{verified:true,channels:4}]});
expect(dmxOnly?.vendorDrivers?.length===0&&dmxOnly?.productionReady===false,'DMX metadata must never create a fast CONTROL route');

const routeSandbox={window:{LightingAIControlSystemDrivers:api}};vm.createContext(routeSandbox);vm.runInContext(routingSrc,routeSandbox);
const btRoute=routeSandbox.window.LightingAIControlRouting.classify({manufacturer:'Aputure',control:{wireless:['Sidus Mesh Bluetooth']}});
expect(btRoute?.route==='vendor-wireless'&&btRoute?.bluetooth===true&&btRoute?.wifi===false&&btRoute?.semanticReady===false,'Aputure Bluetooth candidate classification failed');

const wifiRoute=routeSandbox.window.LightingAIControlRouting.classify({manufacturer:'ARRI',control:{wireless:['ARRI Wi-Fi control']}});
expect(wifiRoute?.route==='vendor-wireless'&&wifiRoute?.wifi===true&&wifiRoute?.transportReady===false,'Wi-Fi candidate must remain fail-closed');

expect(!routingSrc.includes('native-network')&&!routingSrc.includes('gateway'),'Art-Net/sACN/DMX routes remain in fast CONTROL router');

console.log(JSON.stringify({ok:failures.length===0,controlPrimary:'vendor-wireless-bluetooth-wifi',failures},null,2));
if(failures.length)process.exit(1);
