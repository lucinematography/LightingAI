import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='EV Light');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='EV Light');
const expected=[
  'evlight-gem1x1bi',
  'evlight-gem1x1fc',
  'evlight-gem2x1bi',
  'evlight-gem2x1st',
  'evlight-gemx21-hard',
  'evlight-sp150bi',
  'evlight-sp150fc',
  'evlight-sp350',
  'evlight-sp350bi',
  'evlight-sp350fc',
  'evlight-sp500bi',
  'evlight-sp600',
  'evlight-gemx12',
  'evlight-gemx21-st',
  'evlight-gemx24-hard',
  'evlight-epro100',
  'evlight-epro200z',
  'evlight-ev-sp300z',
  'evlight-epro300z',
  'evlight-epro400rgblac-z',
  'evlight-epro400fc',
  'evlight-epro350fc',
  'evlight-gemx24-st',
  'evlight-gemx28-hard'
];
const ids=new Set(fixtures.map(x=>x.id));
const failures=[];
const EXPECTED_FIXTURE_COUNT=expected.length;
const fixtureIds=fixtures.map(x=>x.id);
const accessoryIds=accessories.map(x=>x.id);
if(fixtures.length!==EXPECTED_FIXTURE_COUNT) failures.push('Unexpected EV Light fixture count: '+fixtures.length+' (expected '+EXPECTED_FIXTURE_COUNT+')');
for(const dup of fixtureIds.filter((id,i,a)=>a.indexOf(id)!==i)) failures.push('Duplicate EV Light fixture id: '+dup);
for(const dup of accessoryIds.filter((id,i,a)=>a.indexOf(id)!==i)) failures.push('Duplicate EV Light accessory id: '+dup);
if(!fixtures.some(x=>x.family==='GEM')) failures.push('Missing EV Light GEM family');
if(!fixtures.some(x=>x.family==='GEMX')) failures.push('Missing EV Light GEMX family');
if(!fixtures.some(x=>x.family==='Fresnel')) failures.push('Missing EV Light Fresnel family');
if(!fixtures.some(x=>x.family==='Profile Spot')) failures.push('Missing EV Light Profile Spot family');
for(const id of expected) if(!ids.has(id)) failures.push('Missing required EV Light fixture: '+id);
for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?evlight(?:professional|pro)\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official EV Light fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked EV Light accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?evlight(?:professional|pro)\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official EV Light accessory source: '+a.id);
  if(!(a.compatibleWith||[]).length) failures.push('EV Light accessory without compatibility targets: '+a.id);
  for(const target of (a.compatibleWith||[])){
    if(!ids.has(target)) failures.push('EV Light accessory targets missing fixture: '+a.id+' -> '+target);
  }
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('evlight-')) failures.push('Broken EV Light compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}
const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'EV Light',fixtureCount:fixtures.length,accessoryCount:accessories.length,lockedFixtureCount:EXPECTED_FIXTURE_COUNT,requiredFixtures:expected.length,families:[...new Set(fixtures.map(x=>x.family))].sort(),failures:unique},null,2));
if(unique.length) process.exit(1);
