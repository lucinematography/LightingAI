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
  'kinoflo-barfly-450-dmx',
  'kinoflo-imara-s6-dmx',
  'kinoflo-imara-s10-dmx',
  'kinoflo-imara-s60-dmx',
  'kinoflo-imara-s100-dmx',
  'kinoflo-micro-flo-100mm',
  'kinoflo-micro-flo-150mm',
  'kinoflo-mini-flo-9',
  'kinoflo-mini-flo-12',
  'kinoflo-blanket-lite-6x6',
  'kinoflo-flathead-80',
  'kinoflo-image-47-dmx',
  'kinoflo-image-87-dmx'
];
const ids=new Set(fixtures.map(x=>x.id));
const failures=[];

const fixtureIdCounts=new Map();
const accessoryIdCounts=new Map();
for(const f of fixtures) fixtureIdCounts.set(f.id,(fixtureIdCounts.get(f.id)||0)+1);
for(const a of accessories) accessoryIdCounts.set(a.id,(accessoryIdCounts.get(a.id)||0)+1);
for(const [id,count] of fixtureIdCounts) if(count!==1) failures.push('Duplicate Kino Flo fixture id: '+id);
for(const [id,count] of accessoryIdCounts) if(count!==1) failures.push('Duplicate Kino Flo accessory id: '+id);
if(fixtures.length!==expected.length) failures.push('Unexpected Kino Flo fixture count: '+fixtures.length+' expected '+expected.length);
for(const id of expected) if(!ids.has(id)) failures.push('Missing required Kino Flo fixture: '+id);
for(const f of fixtures){
  if(!f.id||!f.model||!f.family) failures.push('Incomplete Kino Flo fixture identity: '+(f.id||'(missing id)'));
  if(f.manufacturer!=='Kino Flo') failures.push('Unexpected Kino Flo manufacturer label: '+f.id);
  if(!/^https:\/\/(?:www\.)?kinoflo\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official Kino Flo fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked Kino Flo accessory: '+f.id);
}
for(const a of accessories){
  if(!a.id||!a.model||!a.family) failures.push('Incomplete Kino Flo accessory identity: '+(a.id||'(missing id)'));
  if(a.manufacturer!=='Kino Flo') failures.push('Unexpected Kino Flo accessory manufacturer label: '+a.id);
  if(!/^https:\/\/(?:www\.)?kinoflo\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official Kino Flo accessory source: '+a.id);
  if(!(a.compatibleWith||[]).length) failures.push('Kino Flo accessory without compatibility targets: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('kinoflo-')) failures.push('Broken Kino Flo compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}
const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'Kino Flo',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,finalAudit:true,failures:unique},null,2));
if(unique.length) process.exit(1);
