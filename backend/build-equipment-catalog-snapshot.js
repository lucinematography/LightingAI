import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRuntimeCatalog } from './catalog-runtime.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.resolve(here,'../app/src/main/assets/equipment-catalog-snapshot.js');
const catalog=buildRuntimeCatalog();
const payload={fixtures:catalog.fixtures,accessories:catalog.accessories,kits:catalog.kits};
const nanliteFixtures=payload.fixtures.filter(x=>String(x.manufacturer||'').toLowerCase()==='nanlite').length;
const nanliteAccessories=payload.accessories.filter(x=>String(x.manufacturer||'').toLowerCase()==='nanlite').length;
fs.writeFileSync(out,'window.LightingAIEmbeddedCatalog='+JSON.stringify(payload)+';\n','utf8');
console.log(JSON.stringify({output:out,fixtures:payload.fixtures.length,accessories:payload.accessories.length,kits:payload.kits.length,nanliteFixtures,nanliteAccessories}));
if(nanliteFixtures<1||nanliteAccessories<1) process.exit(1);
