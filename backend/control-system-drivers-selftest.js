import fs from 'node:fs';
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
  "version:'1.0-system-families'"
]) expect(src.includes(marker),'driver registry missing '+marker);

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
