import { NANLITE_FM_CURRENT_FIXTURES, NANLITE_FM_CURRENT_ACCESSORIES } from './nanlite-fm-current-library.js';
import { NANLITE_FORZA_II_FIXTURES, NANLITE_FORZA_II_ACCESSORIES } from './nanlite-forza-ii-library.js';
import { NANLITE_FC_720_FIXTURES, NANLITE_FC_720_ACCESSORIES } from './nanlite-fc-720-library.js';
import { NANLITE_PAVOSLIM_60_120_FIXTURES, NANLITE_PAVOSLIM_60_120_ACCESSORIES } from './nanlite-pavoslim-60-120-library.js';

const failures=[];
const fixtures=[...NANLITE_FM_CURRENT_FIXTURES,...NANLITE_FORZA_II_FIXTURES,...NANLITE_FC_720_FIXTURES,...NANLITE_PAVOSLIM_60_120_FIXTURES];
const accessories=[...NANLITE_FM_CURRENT_ACCESSORIES,...NANLITE_FORZA_II_ACCESSORIES,...NANLITE_FC_720_ACCESSORIES,...NANLITE_PAVOSLIM_60_120_ACCESSORIES];
const fixtureIds=new Set(fixtures.map(x=>x.id));
const accessoryById=new Map(accessories.map(x=>[x.id,x]));

const expected=[
  'nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-forza-60cr',
  'nanlite-fc-60b','nanlite-fc-120b','nanlite-fc-120c','nanlite-fs-60b'
];
for(const id of expected) if(!fixtureIds.has(id)) failures.push('Missing Nanlite fixture: '+id);

for(const a of accessories){
  for(const target of a.compatibleWith||[]){
    if(!fixtureIds.has(target)&&!accessoryById.has(target)) failures.push(`Broken Nanlite link: ${a.id} -> ${target}`);
  }
  if(!a.sourceUrl) failures.push('Missing Nanlite accessory source: '+a.id);
}
for(const f of fixtures){
  if(!f.sourceUrl) failures.push('Missing Nanlite fixture source: '+f.id);
  if(f.discontinued!==false) failures.push('Current Nanlite fixture not explicitly current: '+f.id);
}
for(const id of ['nanlite-as-ba-fmm','nanlite-fl-11','nanlite-pj-fmm-19','nanlite-pj-fmm-36','nanlite-sb-fmm-o-40','nanlite-sb-fmm-o-60']){
  const a=accessoryById.get(id);
  if(!a) failures.push('Missing Nanlite shared FM accessory: '+id);
  else for(const target of expected) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing verified target ${target}`);
}
const npf=accessoryById.get('nanlite-bt-bg-fz60');
for(const id of ['nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-forza-60cr','nanlite-fc-60b']) if(!npf?.compatibleWith?.includes(id)) failures.push('NP-F grip missing '+id);
const xlr=accessoryById.get('nanlite-bt-bg-xlr4-ii');
for(const id of ['nanlite-fc-120b','nanlite-fc-120c']) if(!xlr?.compatibleWith?.includes(id)) failures.push('XLR V-Mount grip missing '+id);
if(accessoryById.get('nanlite-bt-bg-v')?.compatibleWith?.includes('nanlite-forza-60cr')) failures.push('Do not infer BT-BG-V compatibility with Forza 60CR');
for(const id of ['nanlite-forza-300b-ii','nanlite-forza-500b-ii']) if(!fixtureIds.has(id)) failures.push('Missing Nanlite Forza II fixture: '+id);
for(const id of ['nanlite-fc-720b','nanlite-fc-720c']) if(!fixtureIds.has(id)) failures.push('Missing Nanlite FC-720 fixture: '+id);
for(const id of ['nanlite-fl-20g','nanlite-ccsfz300ii','nanlite-rf-bm-55-forza-ii']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing Nanlite Forza II accessory: '+id);
  else for(const target of ['nanlite-forza-300b-ii','nanlite-forza-500b-ii']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
for(const id of ['nanlite-fl-20g','nanlite-pj-bm-25-45']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing shared Nanlite Bowens accessory: '+id);
  else for(const target of ['nanlite-fc-720b','nanlite-fc-720c']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing consolidated Nanlite control accessory: '+id);
  else for(const target of ['nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-fc-720b','nanlite-fc-720c']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
for(const id of ['nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-120b','nanlite-pavoslim-120c']) if(!fixtureIds.has(id)) failures.push('Missing Nanlite PavoSlim fixture: '+id);
for(const id of ['nanlite-pavoslim-60b','nanlite-pavoslim-120b']) if(fixtures.find(f=>f.id===id)?.control?.builtInCRMX) failures.push('Bi-color PavoSlim must not claim built-in CRMX: '+id);
for(const id of ['nanlite-pavoslim-60c','nanlite-pavoslim-120c']) if(!fixtures.find(f=>f.id===id)?.control?.builtInCRMX) failures.push('Color PavoSlim CRMX missing: '+id);
for(const id of ['nanlite-cbps-2-6m','nanlite-cbps-7-5m','nanlite-as-mba-1-4-set','nanlite-asuhps']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing shared PavoSlim accessory: '+id);
  else for(const target of ['nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-120b','nanlite-pavoslim-120c']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
for(const id of ['nanlite-sbps120f','nanlite-asdpc120k']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing PavoSlim 120 accessory: '+id);
  else for(const target of ['nanlite-pavoslim-120b','nanlite-pavoslim-120c']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1','nanlite-ascpqrfz']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing consolidated Nanlite accessory: '+id);
  else for(const target of ['nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-120b','nanlite-pavoslim-120c']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`Nanlite catalog self-test passed: ${fixtures.length} fixtures, ${accessories.length} accessories.`);
