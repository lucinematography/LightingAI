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

const nanliteBoth=api?.resolve({manufacturer:'Nanlite',control:{wireless:['NANLINK Bluetooth','NANLINK Wi-Fi']}});
expect(nanliteBoth?.candidateTransports?.bluetooth===true&&nanliteBoth?.candidateTransports?.wifi===true,'Nanlite Bluetooth + Wi-Fi candidates not classified');

const wifiOnly=api?.resolve({manufacturer:'Kino Flo',control:{wireless:['Vendor Wi-Fi app control']}});
expect(wifiOnly?.candidateTransports?.wifi===true&&wifiOnly?.candidateTransports?.bluetooth===false,'Wi-Fi-only candidate not classified');

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
