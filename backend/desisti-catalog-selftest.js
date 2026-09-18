import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='De Sisti');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='De Sisti');
const fixtureIds=new Set(fixtures.map(x=>x.id));
const expected=[
  'desisti-super-led-f47-t','desisti-super-led-f47-d','desisti-super-led-f47-vw','desisti-super-led-f47-vwc',
  'desisti-super-led-f6-t','desisti-super-led-f6-d','desisti-super-led-f6-vw',
  'desisti-super-led-f7-t','desisti-super-led-f7-d','desisti-super-led-f7-vw','desisti-super-led-f7-vwc',
  'desisti-super-led-f10-t','desisti-super-led-f10-d','desisti-super-led-f10-vw','desisti-super-led-f10-vwc',
  'desisti-super-led-f10hp-t','desisti-super-led-f10hp-d','desisti-super-led-f10hp-vw',
  'desisti-super-led-f10shp-t','desisti-super-led-f10shp-d','desisti-super-led-f10shp-vw',
  'desisti-super-led-f14-t','desisti-super-led-f14-d',
  'desisti-super-led-f14hp-t','desisti-super-led-f14hp-d','desisti-super-led-f14hp-vw',
  'desisti-super-led-f20-t','desisti-super-led-f20-d',
  'desisti-piccoletto-f-t','desisti-piccoletto-f-d','desisti-piccoletto-fa-t','desisti-piccoletto-fa-d',
  'desisti-piccoletto-dim-t','desisti-piccoletto-dim-d','desisti-piccoletto-vw','desisti-piccoletto-c',
  'desisti-softled-1-t','desisti-softled-1-d','desisti-softled-1-vw',
  'desisti-softled-2-t','desisti-softled-2-d','desisti-softled-2-vw',
  'desisti-softled-4-t','desisti-softled-4-d','desisti-softled-4-vw',
  'desisti-softled-8-t','desisti-softled-8-d','desisti-softled-8-vw',
  'desisti-softled-1xl-vw','desisti-softled-2xl-t','desisti-softled-2xl-d','desisti-softled-2xl-vw',
  'desisti-softled-8xl-t','desisti-softled-8xl-d','desisti-softled-8xl-vw',
  'desisti-giotto-linear-vw','desisti-giotto-linear-vwc','desisti-galileo-softnel','desisti-spacelight-vw',
  'desisti-f47-lite-t','desisti-f47-lite-d','desisti-f47-lite-vw',
  'desisti-f6-lite-t','desisti-f6-lite-d','desisti-f6-lite-vw',
  'desisti-softled-1-lite-t','desisti-softled-1-lite-d','desisti-softled-1-lite-vw','desisti-softled-1-lite-vwrgb',
  'desisti-softled-2-lite-t','desisti-softled-2-lite-d','desisti-softled-2-lite-vw',
  'desisti-softled-4-vwc','desisti-softled-8-vwc','desisti-softled-12-vwc','desisti-softled-2xl-vwc','desisti-softled-8xl-vwc',
  'desisti-muse-melpomene','desisti-muse-tersicore','desisti-muse-clio','desisti-muse-clio-medium',
  'desisti-muse-polymnia','desisti-muse-erato','desisti-muse-euterpe','desisti-muse-talia',
  'desisti-muse-aurea','desisti-muse-aurea-small',
  'desisti-magis-300','desisti-magis-500','desisti-magis-650','desisti-leonardo-1kw','desisti-leonardo-2kw','desisti-leonardo-multipower','desisti-leonardo-5kw','desisti-leonardo-piccolo-10-12kw','desisti-super-leo-10-12kw','desisti-super-leo-20-24kw',
  'desisti-botticelli-1kw','desisti-botticelli-2kw','desisti-botticelli-5kw','desisti-renoir-300','desisti-renoir-500','desisti-renoir-650','desisti-renoir-2kw','desisti-renoir-5kw',
  'desisti-goya-400w','desisti-goya-575w','desisti-goya-1200w','desisti-goya-2-5-4kw','desisti-goya-6-12kw','desisti-giotto-mk2-tungsten',
  'desisti-rembrandt-200w-mk2','desisti-rembrandt-575w-mk2','desisti-rembrandt-piccolo-1200w','desisti-rembrandt-1-2-2-5kw','desisti-rembrandt-2-5-4kw','desisti-rembrandt-piccolo-6kw','desisti-rembrandt-piccolo-6-12kw-mk2','desisti-rembrandt-12-18kw-mk2',
  'desisti-remington-575w','desisti-remington-1200w','desisti-remington-2-5-4kw','desisti-remington-6kw','desisti-remington-6-12kw'
];

const failures=[];
for(const id of expected) if(!fixtureIds.has(id)) failures.push('Missing required De Sisti fixture: '+id);
if(fixtures.length<expected.length) failures.push('De Sisti fixture count below locked baseline: '+fixtures.length+' < '+expected.length);
if(accessories.length<175) failures.push('De Sisti accessory count below locked baseline: '+accessories.length+' < 175');

for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?desisti\.it\//i.test(f.sourceUrl||'')) failures.push('Non-official De Sisti fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked De Sisti accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?desisti\.it\//i.test(a.sourceUrl||'')) failures.push('Non-official De Sisti accessory source: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('desisti-')) failures.push('Broken De Sisti compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}

const unique=[...new Set(failures)];
console.log(JSON.stringify({
  ok:unique.length===0,
  manufacturer:'De Sisti',
  fixtureCount:fixtures.length,
  accessoryCount:accessories.length,
  lockedRequiredFixtures:expected.length,
  failures:unique
},null,2));
if(unique.length)process.exit(1);
