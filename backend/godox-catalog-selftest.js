import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='Godox');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='Godox');
const ids=new Set(fixtures.map(x=>x.id));
const expected=[
  'godox-m300r','godox-m600r','godox-m1000r','godox-m600bi-pro',
  'godox-la600r','godox-la600bi'
];
const failures=[];
for(const id of expected) if(!ids.has(id)) failures.push('Missing required Godox fixture: '+id);
for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?godox\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official Godox fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked Godox accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?godox\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official Godox accessory source: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('godox-')) failures.push('Broken Godox compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}
const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'Godox',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,failures:unique},null,2));
if(unique.length)process.exit(1);
