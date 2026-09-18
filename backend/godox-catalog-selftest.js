import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='Godox');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='Godox');
const ids=new Set(fixtures.map(x=>x.id));
const expected=[
  'godox-m300r','godox-m600r','godox-m1000r','godox-m600bi-pro',
  'godox-la600r','godox-la600bi','godox-p600r-hard','godox-p1200r-hard',
  'godox-f200bi','godox-f400bi','godox-f600bi','godox-tp2r','godox-tp4r','godox-tp8r',
  'godox-mg1200bi','godox-mg2400bi','godox-mg1200r','godox-mg2400r','godox-ms60bi','godox-ms60r',
  'godox-m200d','godox-m300d','godox-m200bi','godox-m300bi','godox-p300r','godox-p600r',
  'godox-f100r','godox-f200r','godox-f200sr','godox-f400r','godox-f800r',
  'godox-c5r','godox-c7r','godox-c10r','godox-la150r','godox-la200r','godox-la300r','godox-la300bi',
  'godox-tl30','godox-tl60','godox-tl120','godox-tl180'
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
