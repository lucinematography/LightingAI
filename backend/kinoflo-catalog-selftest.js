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
  'kinoflo-celeb-850-led-dmx',
  'kinoflo-diva-lite-20-led',
  'kinoflo-diva-lite-30-led',
  'kinoflo-diva-lite-21-led',
  'kinoflo-diva-lite-31-led',
  'kinoflo-diva-lite-41-led',
  'kinoflo-image-l40-led',
  'kinoflo-image-l80-led',
  'kinoflo-select-led-20',
  'kinoflo-select-led-30',
  'kinoflo-2ft-4bank',
  'kinoflo-4ft-4bank',
  'kinoflo-tegra-4bank-dmx',
  'kinoflo-parabeam-200-dmx',
  'kinoflo-parabeam-210-dmx',
  'kinoflo-parabeam-400-dmx',
  'kinoflo-parabeam-410-dmx',
  'kinoflo-parazip-200-dmx',
  'kinoflo-parazip-215-dmx',
  'kinoflo-parazip-400-dmx',
  'kinoflo-parazip-415-dmx',
  'kinoflo-vistabeam-300-dmx',
  'kinoflo-vistabeam-600-dmx',
  'kinoflo-wall-o-lite-dmx',
  'kinoflo-diva-lite-201',
  'kinoflo-diva-lite-400',
  'kinoflo-diva-lite-401',
  'kinoflo-diva-lite-415',
  'kinoflo-barfly-100',
  'kinoflo-barfly-200',
  'kinoflo-barfly-400',
  'kinoflo-barfly-450-dmx'
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
