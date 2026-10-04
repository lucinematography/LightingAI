import { NANLITE_FM_CURRENT_FIXTURES, NANLITE_FM_CURRENT_ACCESSORIES } from './nanlite-fm-current-library.js';
import { NANLITE_FORZA_II_FIXTURES, NANLITE_FORZA_II_ACCESSORIES } from './nanlite-forza-ii-library.js';
import { NANLITE_FC_720_FIXTURES, NANLITE_FC_720_ACCESSORIES } from './nanlite-fc-720-library.js';
import { NANLITE_PAVOSLIM_60_120_FIXTURES, NANLITE_PAVOSLIM_60_120_ACCESSORIES } from './nanlite-pavoslim-60-120-library.js';
import { NANLITE_PAVOTUBE_II_XR_FIXTURES, NANLITE_PAVOTUBE_II_XR_ACCESSORIES } from './nanlite-pavotube-ii-xr-library.js';
import { NANLITE_PAVOTUBE_II_C_FIXTURES, NANLITE_PAVOTUBE_II_C_ACCESSORIES } from './nanlite-pavotube-ii-c-library.js';
import { NANLITE_COMPAC_CURRENT_FIXTURES, NANLITE_COMPAC_CURRENT_ACCESSORIES } from './nanlite-compac-current-library.js';
import { NANLITE_PAVOTUBE_10_CURRENT_FIXTURES, NANLITE_PAVOTUBE_10_CURRENT_ACCESSORIES } from './nanlite-pavotube-10-current-library.js';
import { NANLITE_PAVOTUBE_X_LEGACY_FIXTURES, NANLITE_PAVOTUBE_X_LEGACY_ACCESSORIES } from './nanlite-pavotube-x-legacy-library.js';
import { NANLITE_FC_HIGH_OUTPUT_FIXTURES, NANLITE_FC_HIGH_OUTPUT_ACCESSORIES } from './nanlite-fc-high-output-library.js';
import { NANLITE_FORZA_720B_FIXTURES, NANLITE_FORZA_720B_ACCESSORIES } from './nanlite-forza-720b-library.js';
import { NANLITE_ALIEN_CURRENT_FIXTURES, NANLITE_ALIEN_CURRENT_ACCESSORIES } from './nanlite-alien-current-library.js';
import { NANLITE_PAVOSLIM_EXTENDED_FIXTURES, NANLITE_PAVOSLIM_EXTENDED_ACCESSORIES } from './nanlite-pavoslim-extended-library.js';
import { NANLITE_PAVOTUBE_T8_7X_FIXTURES, NANLITE_PAVOTUBE_T8_7X_ACCESSORIES } from './nanlite-pavotube-t8-7x-library.js';
import { NANLITE_PAVOBULB_CURRENT_FIXTURES, NANLITE_PAVOBULB_CURRENT_ACCESSORIES } from './nanlite-pavobulb-current-library.js';
import { NANLITE_FS_CURRENT_FIXTURES, NANLITE_FS_CURRENT_ACCESSORIES } from './nanlite-fs-current-library.js';
import { NANLITE_LUMIPAD_CURRENT_FIXTURES, NANLITE_LUMIPAD_CURRENT_ACCESSORIES } from './nanlite-lumipad-current-library.js';
import { NANLITE_MIRO_CURRENT_FIXTURES, NANLITE_MIRO_CURRENT_ACCESSORIES } from './nanlite-miro-current-library.js';
import { NANLITE_CREATOR_HANDHELD_FIXTURES, NANLITE_CREATOR_HANDHELD_ACCESSORIES } from './nanlite-creator-handheld-library.js';
import { NANLITE_CREATOR_COMPACT_FIXTURES, NANLITE_CREATOR_COMPACT_ACCESSORIES } from './nanlite-creator-compact-library.js';
import { NANLITE_FORZA_150B_LEGACY_FIXTURES, NANLITE_FORZA_150B_LEGACY_ACCESSORIES } from './nanlite-forza-150b-legacy-library.js';
import { NANLITE_FORZA_DAYLIGHT_FIXTURES, NANLITE_FORZA_DAYLIGHT_ACCESSORIES } from './nanlite-forza-daylight-library.js';

const failures=[];
const currentFixtures=[...NANLITE_FM_CURRENT_FIXTURES,...NANLITE_FORZA_II_FIXTURES,...NANLITE_FORZA_DAYLIGHT_FIXTURES,...NANLITE_FC_720_FIXTURES,...NANLITE_PAVOSLIM_60_120_FIXTURES,...NANLITE_PAVOSLIM_EXTENDED_FIXTURES,...NANLITE_PAVOTUBE_II_XR_FIXTURES,...NANLITE_PAVOTUBE_II_C_FIXTURES,...NANLITE_COMPAC_CURRENT_FIXTURES,...NANLITE_PAVOTUBE_10_CURRENT_FIXTURES,...NANLITE_PAVOTUBE_T8_7X_FIXTURES,...NANLITE_PAVOBULB_CURRENT_FIXTURES,...NANLITE_FS_CURRENT_FIXTURES,...NANLITE_LUMIPAD_CURRENT_FIXTURES,...NANLITE_MIRO_CURRENT_FIXTURES,...NANLITE_CREATOR_HANDHELD_FIXTURES,...NANLITE_CREATOR_COMPACT_FIXTURES,...NANLITE_FC_HIGH_OUTPUT_FIXTURES,...NANLITE_FORZA_720B_FIXTURES,...NANLITE_ALIEN_CURRENT_FIXTURES];
const legacyFixtures=[...NANLITE_PAVOTUBE_X_LEGACY_FIXTURES,...NANLITE_FORZA_150B_LEGACY_FIXTURES];
const fixtures=[...currentFixtures,...legacyFixtures];
const accessories=[...NANLITE_FM_CURRENT_ACCESSORIES,...NANLITE_FORZA_II_ACCESSORIES,...NANLITE_FORZA_DAYLIGHT_ACCESSORIES,...NANLITE_FC_720_ACCESSORIES,...NANLITE_PAVOSLIM_60_120_ACCESSORIES,...NANLITE_PAVOSLIM_EXTENDED_ACCESSORIES,...NANLITE_PAVOTUBE_II_XR_ACCESSORIES,...NANLITE_PAVOTUBE_II_C_ACCESSORIES,...NANLITE_COMPAC_CURRENT_ACCESSORIES,...NANLITE_PAVOTUBE_10_CURRENT_ACCESSORIES,...NANLITE_PAVOTUBE_T8_7X_ACCESSORIES,...NANLITE_PAVOBULB_CURRENT_ACCESSORIES,...NANLITE_FS_CURRENT_ACCESSORIES,...NANLITE_LUMIPAD_CURRENT_ACCESSORIES,...NANLITE_MIRO_CURRENT_ACCESSORIES,...NANLITE_CREATOR_HANDHELD_ACCESSORIES,...NANLITE_CREATOR_COMPACT_ACCESSORIES,...NANLITE_PAVOTUBE_X_LEGACY_ACCESSORIES,...NANLITE_FORZA_150B_LEGACY_ACCESSORIES,...NANLITE_FC_HIGH_OUTPUT_ACCESSORIES,...NANLITE_FORZA_720B_ACCESSORIES,...NANLITE_ALIEN_CURRENT_ACCESSORIES];
const fixtureIds=new Set(fixtures.map(x=>x.id));
const accessoryById=new Map(accessories.map(x=>[x.id,x]));
const accessoryModels=new Map();
for(const a of accessories){
  // Included kit components often have generic labels (for example "Power Cable 3 m")
  // without a unique Nanlite part number. Do not treat those labels as proof of one
  // shared physical SKU. Dedupe only standalone catalog accessories.
  if(a.includedWithFixture===true) continue;
  const key=(a.model||'').trim().toLowerCase();
  if(!key) continue;
  const prev=accessoryModels.get(key);
  if(prev&&prev!==a.id) failures.push(`Duplicate Nanlite physical accessory model: ${a.model} -> ${prev}, ${a.id}`);
  else accessoryModels.set(key,a.id);
}

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
for(const f of fixtures) if(!f.sourceUrl) failures.push('Missing Nanlite fixture source: '+f.id);
for(const f of currentFixtures) if(f.discontinued!==false) failures.push('Current Nanlite fixture not explicitly current: '+f.id);
for(const f of legacyFixtures) if(f.discontinued!==true) failures.push('Legacy Nanlite fixture not explicitly discontinued: '+f.id);
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
for(const id of ['nanlite-pavotube-ii-6xr','nanlite-pavotube-ii-15xr','nanlite-pavotube-ii-30xr','nanlite-pavotube-ii-60xr']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing Nanlite PavoTube II XR fixture: '+id);
  else if(!f.control?.builtInCRMX) failures.push('PavoTube II XR must have built-in CRMX: '+id);
}
const xr6=fixtures.find(x=>x.id==='nanlite-pavotube-ii-6xr');
if(xr6?.control?.dmxConnection!=='USB-C via CB-DMX-USBC-1/3II adapter') failures.push('6XR DMX path must be USB-C adapter');
for(const id of ['nanlite-pavotube-ii-15xr','nanlite-pavotube-ii-30xr','nanlite-pavotube-ii-60xr']){
  const f=fixtures.find(x=>x.id===id);
  if(f?.control?.dmxConnection!=='Locking metal DMX/RDM port') failures.push(id+' must use locking DMX/RDM port');
}
const usbDmx=accessoryById.get('nanlite-cb-dmx-usbc-1-3ii');
if(!usbDmx?.compatibleWith?.includes('nanlite-pavotube-ii-6xr')) failures.push('6XR USB-C DMX adapter link missing');
for(const id of ['nanlite-pavotube-ii-15xr','nanlite-pavotube-ii-30xr','nanlite-pavotube-ii-60xr']){
  if(usbDmx?.compatibleWith?.includes(id)) failures.push('USB-C DMX adapter must not be inferred for '+id);
}
const lockDmx=accessoryById.get('nanlite-cb-dmx-acp-1-2');
for(const id of ['nanlite-pavotube-ii-15xr','nanlite-pavotube-ii-30xr','nanlite-pavotube-ii-60xr']) if(!lockDmx?.compatibleWith?.includes(id)) failures.push('Locking DMX adapter missing '+id);
if(lockDmx?.compatibleWith?.includes('nanlite-pavotube-ii-6xr')) failures.push('Locking DMX adapter must not be linked to 6XR');
for(const id of ['nanlite-pavotube-ii-15c','nanlite-pavotube-ii-30c']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing Nanlite PavoTube II C fixture: '+id);
  else {
    if(f.discontinued!==false) failures.push('Current PavoTube II C not marked current: '+id);
    if(f.control?.builtInCRMX) failures.push('PavoTube II C must not claim built-in CRMX: '+id);
    if(f.control?.dmxConnection!=='Locking 3.5mm DMX/RDM port') failures.push('PavoTube II C locking 3.5mm DMX path missing: '+id);
  }
}
for(const id of ['nanlite-pavotube-t12-clip-1-4','nanlite-pavotube-t12-clip-magnet','nanlite-pavotube-single-holder-swivel','nanlite-pavotube-single-holder-5-8','nanlite-pavotube-t12-clip-baby-pin']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing shared PavoTube II C accessory: '+id);
  else for(const target of ['nanlite-pavotube-ii-15c','nanlite-pavotube-ii-30c']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}

const cDmx=accessoryById.get('nanlite-cb-dmx-3-5c-1-2');
for(const id of ['nanlite-pavotube-ii-15c','nanlite-pavotube-ii-30c']) if(!cDmx?.compatibleWith?.includes(id)) failures.push('PavoTube II C 3.5mm DMX adapter missing '+id);
for(const id of ['nanlite-pavotube-ii-15c','nanlite-pavotube-ii-30c']) if(lockDmx?.compatibleWith?.includes(id)) failures.push('XR aviation DMX adapter must not be linked to '+id);
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing shared NANLINK accessory for PavoTube II C: '+id);
  else for(const target of ['nanlite-pavotube-ii-15c','nanlite-pavotube-ii-30c']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
for(const id of ['nanlite-compac-68b','nanlite-compac-100b','nanlite-compac-200b']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing Nanlite Compac fixture: '+id);
  else if(f.discontinued!==false) failures.push('Current Nanlite Compac not marked current: '+id);
}
for(const id of ['nanlite-compac-68b','nanlite-compac-100b']){
  const f=fixtures.find(x=>x.id===id);
  if((f?.control?.wireless||[]).length) failures.push(id+' must not claim wireless control');
}
const compac200=fixtures.find(x=>x.id==='nanlite-compac-200b');
for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(compac200?.control?.wireless||[]).includes(p)) failures.push('Compac 200B missing '+p);
for(const [fixtureId,softboxId,lanternId] of [
  ['nanlite-compac-68b','nanlite-compac-68-softbox','nanlite-compac-68-lantern'],
  ['nanlite-compac-100b','nanlite-compac-100-softbox','nanlite-compac-100-lantern'],
  ['nanlite-compac-200b','nanlite-compac-200-softbox','nanlite-compac-200-lantern']
]){
  for(const id of [softboxId,lanternId]){
    const a=accessoryById.get(id);
    if(!a) failures.push('Missing Compac modifier: '+id);
    else if(!(a.compatibleWith||[]).includes(fixtureId)) failures.push(id+' missing '+fixtureId);
  }
}
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id);
  if(!a?.compatibleWith?.includes('nanlite-compac-200b')) failures.push(id+' missing Compac 200B');
  if(a?.compatibleWith?.includes('nanlite-compac-68b')||a?.compatibleWith?.includes('nanlite-compac-100b')) failures.push(id+' must not be inferred for Compac 68B/100B');
}
for(const id of ['nanlite-pavotube-ii-6c','nanlite-pavotube-ii-6cp']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing current Nanlite 10-inch PavoTube: '+id);
  else if(f.discontinued!==false) failures.push('Current 10-inch PavoTube not marked current: '+id);
}
const sixC=fixtures.find(x=>x.id==='nanlite-pavotube-ii-6c');
if(!(sixC?.control?.wireless||[]).includes('2.4G')) failures.push('PavoTube II 6C must include 2.4G control');
if((sixC?.control?.wired||[]).length) failures.push('PavoTube II 6C must not claim wired DMX/RDM');
if(sixC?.control?.builtInCRMX) failures.push('PavoTube II 6C must not claim CRMX');
const sixCP=fixtures.find(x=>x.id==='nanlite-pavotube-ii-6cp');
if((sixCP?.control?.wired||[]).length) failures.push('PavoTube II 6CP must not claim wired DMX/RDM');
if((sixCP?.control?.wireless||[]).includes('2.4G')) failures.push('PavoTube II 6CP must not infer 2.4G');
if(!sixCP?.control?.nfcPairing) failures.push('PavoTube II 6CP NFC pairing missing');
if(sixCP?.control?.builtInCRMX) failures.push('PavoTube II 6CP must not claim CRMX');
for(const id of ['nanlite-ec-ptii6c','nanlite-as-wb-ptii6c','nanlite-pavotube-t12-clip-1-4','nanlite-pavotube-t12-clip-magnet']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing shared 10-inch PavoTube accessory: '+id);
  else for(const target of ['nanlite-pavotube-ii-6c','nanlite-pavotube-ii-6cp','nanlite-pavotube-ii-6xr']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
const usb6=accessoryById.get('nanlite-cb-dmx-usbc-1-3ii');
for(const id of ['nanlite-pavotube-ii-6c','nanlite-pavotube-ii-6cp']) if(usb6?.compatibleWith?.includes(id)) failures.push('USB-C DMX adapter must not be inferred for '+id);
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id);
  if(!a?.compatibleWith?.includes('nanlite-pavotube-ii-6c')) failures.push(id+' missing PavoTube II 6C');
  if(a?.compatibleWith?.includes('nanlite-pavotube-ii-6cp')) failures.push(id+' must not be inferred for PavoTube II 6CP');
}
for(const id of ['nanlite-pavotube-ii-15x','nanlite-pavotube-ii-30x','nanlite-pavotube-ii-60x']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing legacy PavoTube II X fixture: '+id);
  else {
    if(f.discontinued!==true) failures.push('Legacy PavoTube II X must be discontinued: '+id);
    if(f.control?.builtInCRMX) failures.push('Legacy PavoTube II X must not claim CRMX: '+id);
    if(f.control?.dmxConnection!=='Locking aviation DMX/RDM port via CB-DMX-ACP-1/2') failures.push('Legacy PavoTube II X DMX path mismatch: '+id);
  }
}
const xDmx=accessoryById.get('nanlite-cb-dmx-acp-1-2');
for(const id of ['nanlite-pavotube-ii-15x','nanlite-pavotube-ii-30x','nanlite-pavotube-ii-60x']) if(!xDmx?.compatibleWith?.includes(id)) failures.push('ACP DMX adapter missing legacy X '+id);
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-pavotube-ii-15x','nanlite-pavotube-ii-30x','nanlite-pavotube-ii-60x']) if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing legacy '+target);
}
for(const id of ['nanlite-fc-300b','nanlite-fc-500b','nanlite-fc-500c','nanlite-fc-1200b','nanlite-fc-1200c']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing current FC high-output fixture: '+id);
  else if(f.discontinued!==false) failures.push('Current FC high-output fixture not marked current: '+id);
}
const powerCtrl=accessoryById.get('nanlite-fc-powercontroller');
for(const id of ['nanlite-fc-300b','nanlite-fc-500b','nanlite-fc-500c']) if(!powerCtrl?.compatibleWith?.includes(id)) failures.push('FC PowerController missing '+id);
for(const id of ['nanlite-fc-1200b','nanlite-fc-1200c']) if(powerCtrl?.compatibleWith?.includes(id)) failures.push('FC PowerController must not be linked to '+id);
for(const id of ['nanlite-fc-1200b','nanlite-fc-1200c']){
  const f=fixtures.find(x=>x.id===id);
  if(f?.batteryPowered!==false) failures.push(id+' must remain AC-only');
}
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-fc-300b','nanlite-fc-500b','nanlite-fc-500c','nanlite-fc-1200b','nanlite-fc-1200c'])
    if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
for(const target of ['nanlite-fc-300b','nanlite-fc-500b','nanlite-fc-500c','nanlite-fc-720b','nanlite-fc-720c']){
  if(!accessoryById.get('nanlite-fl-20g')?.compatibleWith?.includes(target)) failures.push('Canonical FL-20G missing '+target);
}
for(const target of ['nanlite-fc-500b','nanlite-fc-500c','nanlite-fc-720b','nanlite-fc-720c','nanlite-forza-300b-ii','nanlite-forza-500b-ii']){
  if(!accessoryById.get('nanlite-pj-bm-25-45')?.compatibleWith?.includes(target)) failures.push('Canonical PJ-BM-25-45 missing '+target);
}
for(const duplicateId of ['nanlite-fl-20g-fc','nanlite-pj-bm-25-45-fc']) if(accessoryById.has(duplicateId)) failures.push('Duplicate Nanlite accessory ID must be removed: '+duplicateId);
const forza720=fixtures.find(x=>x.id==='nanlite-forza-720b');
if(!forza720) failures.push('Missing current Nanlite Forza 720B');
else {
  if(forza720.discontinued!==false) failures.push('Forza 720B must be current');
  if(forza720.control?.builtInCRMX) failures.push('Forza 720B must not claim built-in CRMX');
  for(const p of ['DMX512','RDM']) if(!(forza720.control?.wired||[]).includes(p)) failures.push('Forza 720B missing '+p);
  for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(forza720.control?.wireless||[]).includes(p)) failures.push('Forza 720B missing '+p);
}
for(const id of ['nanlite-fl-20g','nanlite-pj-bm-19','nanlite-pj-bm-25-45','nanlite-ascpqrfz','nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id);
  if(!a?.compatibleWith?.includes('nanlite-forza-720b')) failures.push(id+' missing Forza 720B');
}
for(const duplicateId of ['nanlite-fl-20g-fc','nanlite-pj-bm-25-45-fc']) if(accessoryById.has(duplicateId)) failures.push('Duplicate Nanlite accessory ID must stay removed: '+duplicateId);
for(const id of ['nanlite-alien-150c','nanlite-alien-300c']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing current Nanlite Alien fixture: '+id);
  else {
    if(f.discontinued!==false) failures.push('Alien fixture must be current: '+id);
    if(!f.control?.builtInCRMX) failures.push('Alien fixture CRMX missing: '+id);
    for(const p of ['DMX512','RDM']) if(!(f.control?.wired||[]).includes(p)) failures.push(id+' missing '+p);
    for(const p of ['Bluetooth / NANLINK app','2.4G','LumenRadio CRMX']) if(!(f.control?.wireless||[]).includes(p)) failures.push(id+' missing '+p);
  }
}
if(!fixtures.find(x=>x.id==='nanlite-alien-300c')?.batteryOptions?.some(x=>x.includes('45%'))) failures.push('Alien 300C single low-voltage V-Mount limit missing');
for(const [fixtureId,barndoorsId] of [['nanlite-alien-150c','nanlite-bd-al150'],['nanlite-alien-300c','nanlite-bd-al300']]){
  const a=accessoryById.get(barndoorsId);
  if(!a?.compatibleWith?.includes(fixtureId)) failures.push(barndoorsId+' missing '+fixtureId);
}
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1','nanlite-ascpqrfz']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-alien-150c','nanlite-alien-300c']) if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
for(const id of ['nanlite-pavoslim-60cl','nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing extended PavoSlim fixture: '+id);
  else if(f.discontinued!==false) failures.push('Extended PavoSlim must be current: '+id);
}
if(fixtures.find(x=>x.id==='nanlite-pavoslim-240b')?.control?.builtInCRMX) failures.push('PavoSlim 240B must not claim CRMX');
for(const id of ['nanlite-pavoslim-60cl','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c']){
  if(!fixtures.find(x=>x.id===id)?.control?.builtInCRMX) failures.push(id+' CRMX missing');
}
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1','nanlite-ascpqrfz']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-pavoslim-60cl','nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c'])
    if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
const mag=accessoryById.get('nanlite-as-mba-1-4-set');
for(const target of ['nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-120b','nanlite-pavoslim-120c'])
  if(!mag?.compatibleWith?.includes(target)) failures.push('Documented PavoSlim magnetic adapter target missing '+target);
for(const target of ['nanlite-pavoslim-60cl','nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c'])
  if(mag?.compatibleWith?.includes(target)) failures.push('Do not infer PavoSlim magnetic adapter compatibility for '+target);
const sw=accessoryById.get('nanlite-asuhps');
if(!sw?.compatibleWith?.includes('nanlite-pavoslim-60cl')) failures.push('PavoSlim 60CL shared swivel holder missing');
const dmx35=accessoryById.get('nanlite-cb-dmx-3-5c-1-2');
if(!dmx35?.compatibleWith?.includes('nanlite-pavoslim-360c')) failures.push('PavoSlim 360C 3.5mm DMX adapter missing');
for(const target of ['nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl'])
  if(!accessoryById.get('nanlite-cbps5m')?.compatibleWith?.includes(target)) failures.push('CBPS5M missing '+target);
if(!accessoryById.get('nanlite-asmpcps240clkit')?.compatibleWith?.includes('nanlite-pavoslim-240cl')) failures.push('240CL coupler kit missing');
if(!accessoryById.get('nanlite-asdpcps360')?.compatibleWith?.includes('nanlite-pavoslim-360c')) failures.push('360C dual-panel coupler missing');
const t87=fixtures.find(x=>x.id==='nanlite-pavotube-t8-7x');
if(!t87) failures.push('Missing current Nanlite PavoTube T8-7X');
else {
  if(t87.discontinued!==false) failures.push('PavoTube T8-7X must be current');
  if(t87.control?.builtInCRMX) failures.push('PavoTube T8-7X must not claim CRMX');
  if((t87.control?.wireless||[]).includes('2.4G')) failures.push('PavoTube T8-7X must not infer 2.4G');
  for(const p of ['DMX512','RDM']) if(!(t87.control?.wired||[]).includes(p)) failures.push('PavoTube T8-7X missing '+p);
}
const t8Dmx=accessoryById.get('nanlite-cb-dmx-usbc-1-3ii');
if(!t8Dmx?.compatibleWith?.includes('nanlite-pavotube-t8-7x')) failures.push('PavoTube T8-7X USB-C DMX adapter link missing');
for(const id of ['nanlite-hd-t8-1-c','nanlite-lsflt8','nanlite-wc-usbc-c1','nanlite-aseb-eyebolt']){
  const a=accessoryById.get(id);
  if(!a?.compatibleWith?.includes('nanlite-pavotube-t8-7x')) failures.push(id+' missing PavoTube T8-7X');
}
const bulb=fixtures.find(x=>x.id==='nanlite-pavobulb-10c');
if(!bulb) failures.push('Missing current Nanlite PavoBulb 10C');
else {
  if(bulb.discontinued!==false) failures.push('PavoBulb 10C must be current');
  if(bulb.control?.builtInCRMX) failures.push('PavoBulb 10C must not claim CRMX');
  for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(bulb.control?.wireless||[]).includes(p)) failures.push('PavoBulb 10C missing '+p);
  for(const p of ['DMX512','RDM']) if(!(bulb.control?.wired||[]).includes(p)) failures.push('PavoBulb 10C missing '+p);
}
for(const id of ['nanlite-cb-dmx-usbc-1-3ii','nanlite-ws-rc-c2','nanlite-ws-tb-1','nanlite-wc-usbc-c1']){
  const a=accessoryById.get(id);
  if(!a?.compatibleWith?.includes('nanlite-pavobulb-10c')) failures.push(id+' missing PavoBulb 10C');
}
for(const id of ['nanlite-as-mba-e27-v2','nanlite-bt-ba-snp-e27','nanlite-as-bsc']){
  const a=accessoryById.get(id);
  if(!a?.compatibleWith?.includes('nanlite-pavobulb-10c')) failures.push(id+' missing PavoBulb 10C');
}
for(const id of ['nanlite-fs-150b','nanlite-fs-300b','nanlite-fs-300c']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing current Nanlite FS fixture: '+id);
  else {
    if(f.discontinued!==false) failures.push('FS fixture must be current: '+id);
    if(f.batteryPowered!==false) failures.push('FS fixture must remain AC-only: '+id);
    if((f.control?.wired||[]).length) failures.push('FS fixture must not claim DMX/RDM: '+id);
    if(f.control?.builtInCRMX) failures.push('FS fixture must not claim CRMX: '+id);
    for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(f.control?.wireless||[]).includes(p)) failures.push(id+' missing '+p);
  }
}
for(const id of ['nanlite-fl-20g','nanlite-pj-bm-25-45','nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-fs-150b','nanlite-fs-300b','nanlite-fs-300c'])
    if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
for(const id of ['nanlite-cc-s-fs','nanlite-bd-bm-rf45']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-fs-150b','nanlite-fs-300b','nanlite-fs-300c'])
    if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
for(const id of ['nanlite-lumipad-11','nanlite-lumipad-25']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing current Nanlite LumiPad fixture: '+id);
  else {
    if(f.discontinued!==false) failures.push('LumiPad fixture must be current: '+id);
    if(f.control?.builtInCRMX) failures.push('LumiPad fixture must not claim CRMX: '+id);
    if((f.control?.wired||[]).length) failures.push('LumiPad fixture must not claim wired DMX/RDM: '+id);
  }
}
const lp11=fixtures.find(x=>x.id==='nanlite-lumipad-11');
if(!(lp11?.control?.wireless||[]).includes('2.4G')) failures.push('LumiPad 11 2.4G control missing');
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id);
  if(!a?.compatibleWith?.includes('nanlite-lumipad-11')) failures.push(id+' missing LumiPad 11');
  if(a?.compatibleWith?.includes('nanlite-lumipad-25')) failures.push(id+' must not be activated for LumiPad 25 while official-source conflict remains');
}
const lp25=fixtures.find(x=>x.id==='nanlite-lumipad-25');
if(!lp25?.control?.officialSourceConflict) failures.push('LumiPad 25 official-source control conflict must be preserved');
if((lp25?.control?.wireless||[]).length) failures.push('LumiPad 25 wireless relation must stay inactive until official conflict is resolved');
if(!accessoryById.get('nanlite-pa-7-5v2a')?.compatibleWith?.includes('nanlite-lumipad-11')) failures.push('LumiPad 11 PA-7.5V2A link missing');
if(!accessoryById.get('nanlite-lumipad-25-ac-adapter')?.compatibleWith?.includes('nanlite-lumipad-25')) failures.push('LumiPad 25 AC adapter link missing');
for(const id of ['nanlite-miro-30c','nanlite-miro-60c']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing current Nanlite miro fixture: '+id);
  else {
    if(f.discontinued!==false) failures.push('miro fixture must be current: '+id);
    if((f.control?.wired||[]).length) failures.push('miro fixture must not claim wired DMX/RDM: '+id);
    if(f.control?.builtInCRMX) failures.push('miro fixture must not claim CRMX: '+id);
    if((f.control?.wireless||[]).includes('2.4G')) failures.push('miro fixture must not infer 2.4G: '+id);
    if(!(f.control?.wireless||[]).includes('Bluetooth / NANLINK app')) failures.push('miro Bluetooth/NANLINK missing: '+id);
  }
}
for(const id of ['nanlite-bt-npf750-miro','nanlite-bt-npf970-miro','nanlite-bt-cg-npf-2','nanlite-as-pbh-npf']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-miro-30c','nanlite-miro-60c'])
    if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
for(const id of ['nanlite-wand','nanlite-pico']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing current Nanlite creator fixture: '+id);
  else {
    if(f.discontinued!==false) failures.push('Creator fixture must be current: '+id);
    if((f.control?.wired||[]).length) failures.push('Creator fixture must not claim DMX/RDM: '+id);
    if(f.control?.builtInCRMX) failures.push('Creator fixture must not claim CRMX: '+id);
    if((f.control?.wireless||[]).includes('2.4G')) failures.push('Creator fixture must not infer 2.4G: '+id);
    if(!(f.control?.wireless||[]).includes('Bluetooth / NANLINK app')) failures.push('Creator Bluetooth/NANLINK missing: '+id);
  }
}
for(const id of ['nanlite-bt-npf750-miro','nanlite-bt-npf970-miro']){
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-wand')) failures.push(id+' missing wand');
}
for(const id of ['nanlite-wand-barndoors','nanlite-wand-diffuser','nanlite-wand-case']){
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-wand')) failures.push(id+' missing wand');
}
for(const id of ['nanlite-pico-magnetic-diffuser','nanlite-pico-cold-shoe-adapter','nanlite-ec-pico']){
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-pico')) failures.push(id+' missing pico');
}
for(const id of ['nanlite-cookie','nanlite-cookie-s','nanlite-lumo']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing current Nanlite compact creator fixture: '+id);
  else {
    if(f.discontinued!==false) failures.push('Compact creator fixture must be current: '+id);
    if((f.control?.wired||[]).length) failures.push('Compact creator fixture must not claim DMX/RDM: '+id);
    if((f.control?.wireless||[]).length) failures.push('Compact creator fixture must not claim wireless control: '+id);
    if(f.control?.builtInCRMX) failures.push('Compact creator fixture must not claim CRMX: '+id);
  }
}
for(const [fixtureId,accessoryId] of [
  ['nanlite-cookie','nanlite-cookie-case'],
  ['nanlite-cookie-s','nanlite-cookie-s-case'],
  ['nanlite-lumo','nanlite-lumo-magnetic-ring']
]){
  if(!accessoryById.get(accessoryId)?.compatibleWith?.includes(fixtureId)) failures.push(accessoryId+' missing '+fixtureId);
}
const forza150=fixtures.find(x=>x.id==='nanlite-forza-150b');
if(!forza150) failures.push('Missing legacy Nanlite Forza 150B');
else {
  if(forza150.discontinued!==true) failures.push('Forza 150B must be legacy/discontinued');
  if(forza150.control?.builtInCRMX) failures.push('Forza 150B must not claim CRMX');
  for(const p of ['DMX512','RDM']) if(!(forza150.control?.wired||[]).includes(p)) failures.push('Forza 150B missing '+p);
  for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(forza150.control?.wireless||[]).includes(p)) failures.push('Forza 150B missing '+p);
}
for(const id of ['nanlite-as-ba-fmm','nanlite-fl-11','nanlite-pj-fmm-19','nanlite-pj-fmm-36','nanlite-sb-fmm-o-40','nanlite-sb-fmm-o-60','nanlite-bt-bg-xlr4-ii','nanlite-ws-rc-c2','nanlite-ws-tb-1','nanlite-rf-fmm-45','nanlite-cb-dmx-3-5c-1-2']){
  const a=accessoryById.get(id);
  if(!a?.compatibleWith?.includes('nanlite-forza-150b')) failures.push(id+' missing Forza 150B');
}
for(const id of ['nanlite-forza-300-ii','nanlite-forza-500-ii','nanlite-forza-720']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing daylight Nanlite Forza fixture: '+id);
  else {
    if(f.discontinued!==false) failures.push('Daylight Forza must be current: '+id);
    if(f.control?.builtInCRMX) failures.push('Daylight Forza must not claim CRMX: '+id);
    for(const p of ['DMX512','RDM']) if(!(f.control?.wired||[]).includes(p)) failures.push(id+' missing '+p);
    for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(f.control?.wireless||[]).includes(p)) failures.push(id+' missing '+p);
  }
}
for(const target of ['nanlite-forza-300-ii','nanlite-forza-500-ii']){
  for(const id of ['nanlite-fl-20g','nanlite-ccsfz300ii','nanlite-rf-bm-55-forza-ii','nanlite-ascpqrfz','nanlite-ws-rc-c2','nanlite-ws-tb-1'])
    if(!accessoryById.get(id)?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
for(const id of ['nanlite-fl-20g','nanlite-cc-st-fz720','nanlite-ascpqrfz','nanlite-pj-bm-36','nanlite-ws-rc-c2','nanlite-ws-tb-1'])
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-forza-720')) failures.push(id+' missing nanlite-forza-720');
if(accessoryById.has('nanlite-ccsfz300ii-daylight')||accessoryById.has('nanlite-cc-st-fz720-daylight')) failures.push('Daylight Forza case duplicates must stay removed');
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`Nanlite catalog self-test passed: ${fixtures.length} fixtures, ${accessories.length} accessories.`);
