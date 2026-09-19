import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='EV Light');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='EV Light');
const expected=[
  'evlight-gem1x1bi',
  'evlight-gem1x1fc',
  'evlight-gem2x1bi',
  'evlight-gem2x1st',
  'evlight-gemx21-hard'
];
const ids=new Set(fixtures.map(x=>x.id));
const failures=[];
for(const id of expected) if(!ids.has(id)) failures.push('Missing required EV Light fixture: '+id);
for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?evlight(?:professional|pro)\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official EV Light fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked EV Light accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?evlight(?:professional|pro)\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official EV Light accessory source: '+a.id);
  if(!(a.compatibleWith||[]).length) failures.push('EV Light accessory without compatibility targets: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('evlight-')) failures.push('Broken EV Light compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}
const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'EV Light',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,failures:unique},null,2));
if(unique.length) process.exit(1);
