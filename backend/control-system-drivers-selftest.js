import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRuntimeCatalog } from './catalog-runtime.js';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'app/src/main/assets/control-system-drivers.js'),'utf8');
const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

for(const marker of [
  "standards-native-network",
  "standards-dmx-gateway",
  "vendor-astera-wireless",
  "vendor-aputure-sidus",
  "vendor-godox-app",
  "vendor-aladdin-app",
  "version:'1.1-conservative-system-families'"
]) expect(src.includes(marker),'driver registry missing '+marker);

const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(src,sandbox);
const api=sandbox.window.LightingAIControlSystemDrivers;
expect(!!api,'driver registry API missing');
const verifiedMode={name:'Test 1ch',channels:1,verified:true,sourceUrl:'https://example.invalid/dmx.pdf',controls:[{key:'dimmer',channel:1,type:'percent'}]};
const native=api&&api.resolve({control:{directLightingAI:['Art-Net']},dmxModes:[verifiedMode]});
expect(native?.productionDriver?.id==='standards-native-network','explicit direct Art-Net must resolve native-network');
const etherOnly=api&&api.resolve({control:{wired:['EtherCON']},dmxModes:[verifiedMode]});
expect(etherOnly?.productionReady===false,'EtherCON connector alone must not become production network control');
const unavailableOnly=api&&api.resolve({control:{unavailableDirectProtocols:['DMX not available']},dmxModes:[verifiedMode]});
expect(unavailableOnly?.productionReady===false,'unavailable protocol text must not create a production route');
const researchOnly=api&&api.resolve({manufacturer:'Astera',control:{wireless:['AsteraApp via Bluetooth']},dmxModes:[]});
expect(researchOnly?.vendorResearchOnly===true&&researchOnly?.productionReady===false,'Astera proprietary wireless must remain research-only without a standard route');
const noSource=api&&api.resolve({control:{wired:['DMX512']},dmxModes:[{name:'Unsafe',channels:1,verified:true}]});
expect(noSource?.productionReady===false,'verified DMX mode without source URL must fail closed');

const {fixtures}=buildRuntimeCatalog();
const manufacturers=new Set(fixtures.map(f=>f.manufacturer).filter(Boolean));
for(const maker of ['Astera','Aputure','ARRI','Godox','Aladdin']) expect(manufacturers.has(maker),'catalog missing '+maker);

const astera=fixtures.filter(f=>f.manufacturer==='Astera');
const aputure=fixtures.filter(f=>f.manufacturer==='Aputure');
expect(astera.length>0,'Astera catalog empty');
expect(aputure.length>0,'Aputure catalog empty');
expect(astera.some(f=>Array.isArray(f.dmxModes)&&f.dmxModes.some(m=>m?.verified===true)),'No verified Astera DMX profile');
expect(aputure.some(f=>Array.isArray(f.dmxModes)&&f.dmxModes.some(m=>m?.verified===true)),'No verified Aputure DMX profile');

console.log(JSON.stringify({ok:failures.length===0,fixtures:fixtures.length,manufacturers:[...manufacturers].sort(),failures},null,2));
if(failures.length)process.exit(1);
