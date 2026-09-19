import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='LiteGear' && String(x.family||'').startsWith('LiteMat'));
const accessories=catalog.accessories.filter(x=>x.manufacturer==='LiteGear' && String(x.family||'').startsWith('LiteMat'));
const expected=[
  'litegear-litemat-spectrum-g2-1',
  'litegear-litemat-spectrum-g2-2',
  'litegear-litemat-spectrum-g2-2l',
  'litegear-litemat-spectrum-g2-3',
  'litegear-litemat-spectrum-g2-4',
  'litegear-litemat-spectrum-g2-8',
  'litegear-litemat-plus-1',
  'litegear-litemat-plus-2',
  'litegear-litemat-plus-2l',
  'litegear-litemat-plus-3',
  'litegear-litemat-plus-4',
  'litegear-litemat-plus-8',
  'litegear-litemat-spectrum-2019-2',
  'litegear-litemat-spectrum-2019-4',
  'litegear-litemat-s2-1',
  'litegear-litemat-s2-2',
  'litegear-litemat-s2-2l',
  'litegear-litemat-s2-3',
  'litegear-litemat-s2-4'
];
const ids=new Set(fixtures.map(x=>x.id));
const failures=[];
const duplicateFixtureIds=fixtures.map(x=>x.id).filter((id,i,a)=>a.indexOf(id)!==i);
const duplicateAccessoryIds=accessories.map(x=>x.id).filter((id,i,a)=>a.indexOf(id)!==i);
if(duplicateFixtureIds.length) failures.push('Duplicate LiteMat fixture IDs: '+[...new Set(duplicateFixtureIds)].join(', '));
if(duplicateAccessoryIds.length) failures.push('Duplicate LiteMat accessory IDs: '+[...new Set(duplicateAccessoryIds)].join(', '));
if(fixtures.length!==expected.length) failures.push(`Unexpected LiteMat fixture count: ${fixtures.length}; expected ${expected.length}`);
for(const id of expected) if(!ids.has(id)) failures.push('Missing required LiteMat fixture: '+id);
for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?litegear\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official LiteGear fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked LiteMat accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?litegear\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official LiteGear accessory source: '+a.id);
  if(!(a.compatibleWith||[]).length) failures.push('LiteMat accessory without compatibility targets: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('litegear-')) failures.push('Broken LiteGear compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}
const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'LiteGear',family:'LiteMat',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,failures:unique},null,2));
if(unique.length) process.exit(1);
