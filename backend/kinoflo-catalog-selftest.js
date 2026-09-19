import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='Kino Flo');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='Kino Flo');
const expected=[
  'kinoflo-celeb-ikon-6',
  'kinoflo-celeb-ikon-12',
  'kinoflo-diva-lux-4',
  'kinoflo-mimik-120',
  'kinoflo-freestyle-air-mini',
  'kinoflo-freestyle-air',
  'kinoflo-freestyle-air-max',
  'kinoflo-celeb-250-led-dmx',
  'kinoflo-celeb-450-led-dmx',
  'kinoflo-celeb-450q-led-dmx',
  'kinoflo-celeb-850-led-dmx'
];
const ids=new Set(fixtures.map(x=>x.id));
const failures=[];
for(const id of expected) if(!ids.has(id)) failures.push('Missing required Kino Flo fixture: '+id);
for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?kinoflo\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official Kino Flo fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked Kino Flo accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?kinoflo\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official Kino Flo accessory source: '+a.id);
  if(!(a.compatibleWith||[]).length) failures.push('Kino Flo accessory without compatibility targets: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('kinoflo-')) failures.push('Broken Kino Flo compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}
const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'Kino Flo',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,failures:unique},null,2));
if(unique.length) process.exit(1);
