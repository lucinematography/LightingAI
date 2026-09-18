import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='Aladdin');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='Aladdin');
const expected=['aladdin-mosaic-2x4','aladdin-mosaic-4x4','aladdin-mosaic-3x6','aladdin-fabric-lite-20','aladdin-fabric-lite-35','aladdin-bi-flex-m3','aladdin-bi-flex-m7','aladdin-bi-flex-1','aladdin-bi-flex-2','aladdin-bi-flex-4','aladdin-all-in-one','aladdin-all-in-two','aladdin-base-lite-100','aladdin-base-lite-200'];
const ids=new Set(fixtures.map(x=>x.id));
const failures=[];
for(const id of expected) if(!ids.has(id)) failures.push('Missing required Aladdin fixture: '+id);
for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?aladdin-lights\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official Aladdin fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked Aladdin accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?aladdin-lights\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official Aladdin accessory source: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('aladdin-')) failures.push('Broken Aladdin compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}
const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'Aladdin',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,failures:unique},null,2));
if(unique.length) process.exit(1);
