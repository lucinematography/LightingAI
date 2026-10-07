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
const snapshotJson=JSON.stringify(payload);
const wirelessVerificationMarkers={
  any:snapshotJson.includes('"wirelessVerification"'),
  aputure:snapshotJson.includes('"family":"Sidus Bluetooth Mesh"'),
  arri:snapshotJson.includes('"family":"ARRI LiCo Bluetooth 5.0"')
};
fs.writeFileSync(out,'window.LightingAIEmbeddedCatalog='+snapshotJson+';\n','utf8');
console.log(JSON.stringify({output:out,fixtures:payload.fixtures.length,accessories:payload.accessories.length,kits:payload.kits.length,nanliteFixtures,nanliteAccessories,wirelessVerificationMarkers}));
if(nanliteFixtures<1||nanliteAccessories<1||!wirelessVerificationMarkers.any||!wirelessVerificationMarkers.aputure||!wirelessVerificationMarkers.arri) process.exit(1);
