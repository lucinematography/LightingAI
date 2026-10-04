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
import { NANLITE_FORZA_60_LEGACY_FIXTURES, NANLITE_FORZA_60_LEGACY_ACCESSORIES } from './nanlite-forza-60-legacy-library.js';
import { NANLITE_FORZA_BOWENS_LEGACY_FIXTURES, NANLITE_FORZA_BOWENS_LEGACY_ACCESSORIES } from './nanlite-forza-bowens-legacy-library.js';
import { NANLITE_FORZA_150B_LEGACY_FIXTURES, NANLITE_FORZA_150B_LEGACY_ACCESSORIES } from './nanlite-forza-150b-legacy-library.js';
import { NANLITE_FORZA_DAYLIGHT_FIXTURES, NANLITE_FORZA_DAYLIGHT_ACCESSORIES } from './nanlite-forza-daylight-library.js';
import { NANLITE_FS_LEGACY_FIXTURES, NANLITE_FS_LEGACY_ACCESSORIES } from './nanlite-fs-legacy-library.js';
import { NANLITE_COMPAC_DAYLIGHT_LEGACY_FIXTURES, NANLITE_COMPAC_DAYLIGHT_LEGACY_ACCESSORIES } from './nanlite-compac-daylight-legacy-library.js';
import { NANLITE_MIXPANEL_LEGACY_FIXTURES, NANLITE_MIXPANEL_LEGACY_ACCESSORIES } from './nanlite-mixpanel-legacy-library.js';
import { NANLITE_MIXPAD_FIXTURES, NANLITE_MIXPAD_ACCESSORIES } from './nanlite-mixpad-library.js';
import { NANLITE_LITOLITE_LEGACY_FIXTURES, NANLITE_LITOLITE_LEGACY_ACCESSORIES } from './nanlite-litolite-legacy-library.js';
import { NANLITE_HALO_LEGACY_FIXTURES, NANLITE_HALO_LEGACY_ACCESSORIES } from './nanlite-halo-legacy-library.js';
import { NANLITE_LITOLITE_EARLY_LEGACY_FIXTURES, NANLITE_LITOLITE_EARLY_LEGACY_ACCESSORIES } from './nanlite-litolite-early-legacy-library.js';
import { NANLITE_SA_LEGACY_FIXTURES, NANLITE_SA_LEGACY_ACCESSORIES } from './nanlite-sa-legacy-library.js';
import { NANLITE_TK_LEGACY_FIXTURES, NANLITE_TK_LEGACY_ACCESSORIES } from './nanlite-tk-legacy-library.js';

const failures=[];
const currentFixtures=[...NANLITE_FM_CURRENT_FIXTURES,...NANLITE_FORZA_II_FIXTURES,...NANLITE_FORZA_DAYLIGHT_FIXTURES,...NANLITE_FC_720_FIXTURES,...NANLITE_PAVOSLIM_60_120_FIXTURES,...NANLITE_PAVOSLIM_EXTENDED_FIXTURES,...NANLITE_PAVOTUBE_II_XR_FIXTURES,...NANLITE_PAVOTUBE_II_C_FIXTURES,...NANLITE_COMPAC_CURRENT_FIXTURES,...NANLITE_PAVOTUBE_10_CURRENT_FIXTURES,...NANLITE_PAVOTUBE_T8_7X_FIXTURES,...NANLITE_PAVOBULB_CURRENT_FIXTURES,...NANLITE_FS_CURRENT_FIXTURES,...NANLITE_LUMIPAD_CURRENT_FIXTURES,...NANLITE_MIRO_CURRENT_FIXTURES,...NANLITE_CREATOR_HANDHELD_FIXTURES,...NANLITE_CREATOR_COMPACT_FIXTURES,...NANLITE_FC_HIGH_OUTPUT_FIXTURES,...NANLITE_FORZA_720B_FIXTURES,...NANLITE_ALIEN_CURRENT_FIXTURES];
const legacyFixtures=[...NANLITE_PAVOTUBE_X_LEGACY_FIXTURES,...NANLITE_FORZA_60_LEGACY_FIXTURES,...NANLITE_FORZA_BOWENS_LEGACY_FIXTURES,...NANLITE_FORZA_150B_LEGACY_FIXTURES,...NANLITE_FS_LEGACY_FIXTURES,...NANLITE_COMPAC_DAYLIGHT_LEGACY_FIXTURES,...NANLITE_MIXPANEL_LEGACY_FIXTURES,...NANLITE_MIXPAD_FIXTURES,...NANLITE_LITOLITE_LEGACY_FIXTURES,...NANLITE_HALO_LEGACY_FIXTURES,...NANLITE_LITOLITE_EARLY_LEGACY_FIXTURES,...NANLITE_SA_LEGACY_FIXTURES,...NANLITE_TK_LEGACY_FIXTURES];
const fixtures=[...currentFixtures,...legacyFixtures];
const accessories=[...NANLITE_FM_CURRENT_ACCESSORIES,...NANLITE_FORZA_II_ACCESSORIES,...NANLITE_FORZA_DAYLIGHT_ACCESSORIES,...NANLITE_FC_720_ACCESSORIES,...NANLITE_PAVOSLIM_60_120_ACCESSORIES,...NANLITE_PAVOSLIM_EXTENDED_ACCESSORIES,...NANLITE_PAVOTUBE_II_XR_ACCESSORIES,...NANLITE_PAVOTUBE_II_C_ACCESSORIES,...NANLITE_COMPAC_CURRENT_ACCESSORIES,...NANLITE_COMPAC_DAYLIGHT_LEGACY_ACCESSORIES,...NANLITE_MIXPANEL_LEGACY_ACCESSORIES,...NANLITE_MIXPAD_ACCESSORIES,...NANLITE_LITOLITE_LEGACY_ACCESSORIES,...NANLITE_HALO_LEGACY_ACCESSORIES,...NANLITE_LITOLITE_EARLY_LEGACY_ACCESSORIES,...NANLITE_SA_LEGACY_ACCESSORIES,...NANLITE_TK_LEGACY_ACCESSORIES,...NANLITE_PAVOTUBE_10_CURRENT_ACCESSORIES,...NANLITE_PAVOTUBE_T8_7X_ACCESSORIES,...NANLITE_PAVOBULB_CURRENT_ACCESSORIES,...NANLITE_FS_CURRENT_ACCESSORIES,...NANLITE_FS_LEGACY_ACCESSORIES,...NANLITE_LUMIPAD_CURRENT_ACCESSORIES,...NANLITE_MIRO_CURRENT_ACCESSORIES,...NANLITE_CREATOR_HANDHELD_ACCESSORIES,...NANLITE_CREATOR_COMPACT_ACCESSORIES,...NANLITE_PAVOTUBE_X_LEGACY_ACCESSORIES,...NANLITE_FORZA_60_LEGACY_ACCESSORIES,...NANLITE_FORZA_BOWENS_LEGACY_ACCESSORIES,...NANLITE_FORZA_150B_LEGACY_ACCESSORIES,...NANLITE_FC_HIGH_OUTPUT_ACCESSORIES,...NANLITE_FORZA_720B_ACCESSORIES,...NANLITE_ALIEN_CURRENT_ACCESSORIES];
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
  'nanlite-forza-60-ii','nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-forza-60cr',
  'nanlite-fc-60b','nanlite-fc-120b','nanlite-fc-120c','nanlite-fs-60b'
];
for(const id of expected) if(!fixtureIds.has(id)) failures.push('Missing Nanlite fixture: '+id);
const f60ii=fixtures.find(x=>x.id==='nanlite-forza-60-ii');
if(f60ii?.powerDrawW!==72) failures.push('Forza 60 II rated power must remain 72W');
if(f60ii?.cri!==95) failures.push('Forza 60 II CRI must remain 95');
if(f60ii?.tlci!==98) failures.push('Forza 60 II TLCI must remain 98');
if(f60ii?.cctK?.min!==5600||f60ii?.cctK?.max!==5600) failures.push('Forza 60 II must remain fixed 5600K daylight');

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
for(const target of ['nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-forza-60cr','nanlite-fc-60b'])
  if(!npf?.includedWithFixtures?.includes(target)) failures.push('BT-BG-FZ60 included relation missing '+target);
const paFz60=accessoryById.get('nanlite-pa-15v6a-fz60');
if(!paFz60) failures.push('Missing PA-15V6A-FZ60 power adapter');
else {
  for(const target of ['nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-forza-60cr']){
    if(!paFz60.compatibleWith?.includes(target)) failures.push('PA-15V6A-FZ60 missing '+target);
    if(!paFz60.includedWithFixtures?.includes(target)) failures.push('PA-15V6A-FZ60 included relation missing '+target);
  }
  if(paFz60.output!=='15V / 6A') failures.push('PA-15V6A-FZ60 electrical output must remain 15V / 6A');
  if(paFz60.builtInVMountPlate!==true) failures.push('PA-15V6A-FZ60 built-in V-Mount plate missing');
}
for(const duplicateId of ['nanlite-ps-forza-60b-ii','nanlite-ps-forza-60c','nanlite-ps-forza-60cr'])
  if(accessoryById.has(duplicateId)) failures.push('Duplicate model-scoped PA-15V6A-FZ60 record must stay removed: '+duplicateId);
for(const id of ['nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-forza-60cr']){
  const f=fixtures.find(x=>x.id===id);
  if(f?.batteryPowered!==true) failures.push(id+' battery power profile missing');
  if(!f?.powerOptions?.some(x=>x.includes('AC'))) failures.push(id+' AC power option missing');
  if(!f?.powerOptions?.some(x=>x.includes('NP-F'))) failures.push(id+' NP-F power option missing');
}
for(const id of ['nanlite-forza-60b-ii','nanlite-forza-60c'])
  if(!fixtures.find(x=>x.id===id)?.powerOptions?.some(x=>x.includes('BT-BG-V'))) failures.push(id+' optional BT-BG-V power option missing');
const f60cr=fixtures.find(x=>x.id==='nanlite-forza-60cr');
if(f60cr?.powerOptions?.some(x=>x.includes('BT-BG-V'))) failures.push('Forza 60CR must not infer BT-BG-V support');
if(!f60cr?.powerOptions?.some(x=>x.includes('V-Mount plate'))) failures.push('Forza 60CR included V-Mount plate power path missing');
for(const id of ['nanlite-fc-60b','nanlite-fc-120b','nanlite-fc-120c']){
  const f=fixtures.find(x=>x.id===id);
  if(f?.batteryPowered!==true) failures.push(id+' battery power profile missing');
  if(!f?.powerOptions?.some(x=>x.includes('AC'))) failures.push(id+' AC power option missing');
  if(!f?.powerOptions?.some(x=>x.includes('USB-C PD'))) failures.push(id+' USB-C PD power option missing');
}
if(!fixtures.find(x=>x.id==='nanlite-fc-60b')?.powerOptions?.some(x=>x.includes('NP-F'))) failures.push('FC-60B NP-F power option missing');
for(const id of ['nanlite-fc-120b','nanlite-fc-120c'])
  if(!fixtures.find(x=>x.id===id)?.powerOptions?.some(x=>x.includes('V-Mount'))) failures.push(id+' V-Mount power option missing');
const xlr=accessoryById.get('nanlite-bt-bg-xlr4-ii');
for(const id of ['nanlite-fc-120b','nanlite-fc-120c']) if(!xlr?.compatibleWith?.includes(id)) failures.push('XLR V-Mount grip missing '+id);
if(accessoryById.get('nanlite-bt-bg-v')?.compatibleWith?.includes('nanlite-forza-60cr')) failures.push('Do not infer BT-BG-V compatibility with Forza 60CR');
const vm98=accessoryById.get('nanlite-bt-v-14-4v98');
if(!vm98) failures.push('Missing Nanlite BT-V-14.4V98 battery');
else {
  for(const grip of ['nanlite-bt-bg-v','nanlite-bt-bg-xlr4-ii']) if(!vm98.compatibleWith?.includes(grip)) failures.push('BT-V-14.4V98 missing grip '+grip);
  for(const target of ['nanlite-forza-60c','nanlite-forza-60b-ii','nanlite-fc-60b','nanlite-forza-150b','nanlite-fc-120b','nanlite-fc-120c'])
    if(!vm98.fixtureUseCases?.includes(target)) failures.push('BT-V-14.4V98 missing fixture use case '+target);
  if(vm98.voltageV!==14.4||vm98.capacityWh!==98) failures.push('BT-V-14.4V98 electrical identity must remain 14.4V / 98Wh');
  if(!vm98.sourceConflictNote) failures.push('BT-V-14.4V98 FC-60C/FC-60B source conflict note missing');
}
if(fixtureIds.has('nanlite-fc-60c')) failures.push('Do not create FC-60C fixture from Nanlite battery-page typo');
const pjTargets=['nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-forza-60cr','nanlite-forza-150b','nanlite-fc-60b','nanlite-fc-120b','nanlite-fc-120c','nanlite-fs-60b'];
for(const id of ['nanlite-pj-fmm-19','nanlite-pj-fmm-36','nanlite-pj-fmm-18-36']){
  const a=accessoryById.get(id);
  if(!a) failures.push('Missing current PJ-FMM projection attachment: '+id);
  else {
    for(const target of pjTargets) if(!a.compatibleWith?.includes(target)) failures.push(id+' missing documented target '+target);
    for(const forbidden of ['nanlite-forza-60-ii','nanlite-forza-60','nanlite-forza-60b','nanlite-forza-150'])
      if(a.compatibleWith?.includes(forbidden)) failures.push(id+' must not infer undocumented target '+forbidden);
  }
}
const pjZoom=accessoryById.get('nanlite-pj-fmm-18-36');
if(pjZoom?.beamAngleDeg?.min!==18||pjZoom?.beamAngleDeg?.max!==36||pjZoom?.rotationDeg!==360)
  failures.push('PJ-FMM-18-36 zoom/rotation identity mismatch');
for(const [id,angle] of [['nanlite-pj-fmm-lens-10',10],['nanlite-pj-fmm-lens-19',19],['nanlite-pj-fmm-lens-36',36],['nanlite-pj-fmm-lens-50',50]]){
  const a=accessoryById.get(id);
  if(!a) failures.push('Missing PJ-FMM interchangeable lens: '+id);
  else {
    if(a.beamAngleDeg!==angle) failures.push(id+' beam angle mismatch');
    for(const host of ['nanlite-pj-fmm-19','nanlite-pj-fmm-36']) if(!a.compatibleWith?.includes(host)) failures.push(id+' missing PJ-FMM host '+host);
    if(a.compatibleWith?.includes('nanlite-pj-fmm-18-36')) failures.push(id+' must not be linked to self-contained zoom attachment');
  }
}
const pjIris=accessoryById.get('nanlite-pjfmm-ai');
if(!pjIris||pjIris.bladeCount!==18) failures.push('PJFMMAI 18-blade iris missing');
else for(const host of ['nanlite-pj-fmm-19','nanlite-pj-fmm-36','nanlite-pj-fmm-18-36','nanlite-pj-bm-25-45'])
  if(!pjIris.compatibleWith?.includes(host)) failures.push('PJFMMAI missing documented host '+host);
for(const id of ['nanlite-asgbfmmset1','nanlite-asgbfmmset2']){
  const a=accessoryById.get(id);
  if(!a||a.goboCount!==10) failures.push(id+' 10-disc gobo set missing');
  else for(const host of ['nanlite-pj-fmm-19','nanlite-pj-fmm-36','nanlite-pj-fmm-18-36'])
    if(!a.compatibleWith?.includes(host)) failures.push(id+' missing documented host '+host);
}
const ps240Swivel=accessoryById.get('nanlite-asuhps-2x2');
if(!ps240Swivel) failures.push('Missing ASUHPS-2x2 PavoSlim 240 swivel holder');
else {
  for(const target of ['nanlite-pavoslim-240b','nanlite-pavoslim-240c']) if(!ps240Swivel.compatibleWith?.includes(target)) failures.push('ASUHPS-2x2 missing '+target);
  if(ps240Swivel.compatibleWith?.includes('nanlite-pavoslim-240cl')) failures.push('ASUHPS-2x2 must not be linked to PavoSlim 240CL');
}
for(const id of ['nanlite-forza-300b-ii','nanlite-forza-500b-ii']) if(!fixtureIds.has(id)) failures.push('Missing Nanlite Forza II fixture: '+id);
for(const id of ['nanlite-fc-720b','nanlite-fc-720c']) if(!fixtureIds.has(id)) failures.push('Missing Nanlite FC-720 fixture: '+id);
for(const id of ['nanlite-fl-20g','nanlite-ccsfz300ii','nanlite-rf-bm-55-forza-ii']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing Nanlite Forza II accessory: '+id);
  else for(const target of ['nanlite-forza-300b-ii','nanlite-forza-500b-ii']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
for(const [id,lengthM] of [['nanlite-cb-fz-7-5m',7.5],['nanlite-cb-fz-12m',12]]){
  const a=accessoryById.get(id);
  if(!a) failures.push('Missing shared Forza II head cable: '+id);
  else {
    if(a.lengthM!==lengthM) failures.push(id+' length identity mismatch');
    for(const target of ['nanlite-forza-300-ii','nanlite-forza-300b-ii','nanlite-forza-500-ii','nanlite-forza-500b-ii','nanlite-forza-720','nanlite-forza-720b'])
      if(!(a.compatibleWith||[]).includes(target)) failures.push(id+' missing documented target '+target);
  }
}
for(const id of ['nanlite-forza-300-ii-control-unit','nanlite-forza-300-ii-head-cable','nanlite-forza-300-ii-power-cable']){
  const a=accessoryById.get(id);
  if(!a) failures.push('Missing documented Forza 300 II kit component: '+id);
  else {
    if(!a.compatibleWith?.includes('nanlite-forza-300-ii')) failures.push(id+' missing Forza 300 II target');
    if(a.includedWithFixture!==true) failures.push(id+' must remain included with Forza 300 II');
  }
}
if(accessoryById.get('nanlite-forza-300-ii-head-cable')?.lengthM!==3) failures.push('Forza 300 II included head cable must remain 3 m');
if(accessoryById.get('nanlite-forza-300-ii-power-cable')?.lengthM!==6) failures.push('Forza 300 II included power cable must remain 6 m');
const capBwB=accessoryById.get('nanlite-as-cap-bw-b');
if(!capBwB) failures.push('Missing canonical AS-CAP-BW-B COB cap');
else {
  for(const target of ['nanlite-forza-300-ii','nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-forza-720','nanlite-forza-720b'])
    if(!capBwB.compatibleWith?.includes(target)) failures.push('AS-CAP-BW-B missing compatible target '+target);
  if(capBwB.compatibleWith?.includes('nanlite-forza-500-ii')) failures.push('AS-CAP-BW-B must not infer Forza 500 II compatibility without direct first-party evidence');
  for(const target of ['nanlite-forza-300-ii','nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-forza-720b'])
    if(!capBwB.includedWithFixtures?.includes(target)) failures.push('AS-CAP-BW-B verified inclusion missing '+target);
  if(!capBwB.sourceUrl?.includes('replacement-cob-cap')) failures.push('AS-CAP-BW-B canonical source missing');
  if(!capBwB.officialSourceConflict) failures.push('AS-CAP-BW-B FAQ/current-product source conflict must remain documented');
  if((capBwB.conflictSources||[]).length<5) failures.push('AS-CAP-BW-B conflict sources missing');
}
for(const duplicateId of ['nanlite-forza-300-ii-cob-cap','nanlite-forza-720b-cob-cap'])
  if(accessoryById.has(duplicateId)) failures.push('Duplicate model-scoped AS-CAP-BW-B record must stay removed: '+duplicateId);
for(const id of ['nanlite-fl-20g','nanlite-pj-bm-25-45']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing shared Nanlite Bowens accessory: '+id);
  else for(const target of ['nanlite-fc-720b','nanlite-fc-720c']) if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id); if(!a) failures.push('Missing consolidated Nanlite control accessory: '+id);
  else for(const target of ['nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-fc-720b','nanlite-fc-720c'])
    if(!(a.compatibleWith||[]).includes(target)) failures.push(`${id} missing ${target}`);
}
for(const id of ['nanlite-fc-720b','nanlite-fc-720c']){
  const f=fixtures.find(x=>x.id===id);
  for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(f?.control?.wireless||[]).includes(p)) failures.push(id+' missing '+p);
  if(!f?.control?.nfcPairing) failures.push(id+' NFC pairing missing');
  if(!f?.control?.sourceEvidenceNote) failures.push(id+' FC-720 control evidence note missing');
}
for(const id of ['nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-120b','nanlite-pavoslim-120c']) if(!fixtureIds.has(id)) failures.push('Missing Nanlite PavoSlim fixture: '+id);
for(const [id,sku] of [
  ['nanlite-pavoslim-60b','PS60BQR'],
  ['nanlite-pavoslim-60c','PS60C'],
  ['nanlite-pavoslim-120b','PS120BQR'],
  ['nanlite-pavoslim-120c','PS120C']
]){
  if(fixtures.find(f=>f.id===id)?.sku!==sku) failures.push(id+' SKU must remain '+sku);
}
for(const forbiddenId of ['nanlite-pavoslim-60bqr','nanlite-pavoslim-120bqr'])
  if(fixtureIds.has(forbiddenId)) failures.push('QR SKU must not create duplicate PavoSlim fixture: '+forbiddenId);
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
const qrClamp=accessoryById.get('nanlite-ascpqrfz');
if(qrClamp?.includedWithFixture===true) failures.push('ASCPQRFZ must not use generic includedWithFixture flag');
for(const target of ['nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-forza-300-ii','nanlite-forza-500-ii','nanlite-forza-720b','nanlite-forza-720','nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-60cl','nanlite-pavoslim-120b','nanlite-pavoslim-120c','nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c','nanlite-alien-150c','nanlite-alien-300c'])
  if(!qrClamp?.includedWithFixtures?.includes(target)) failures.push('ASCPQRFZ verified inclusion missing '+target);
if(!qrClamp?.sourceUrl?.includes('quick-release-super-clamp')) failures.push('ASCPQRFZ must use its canonical product page as source');
if(!qrClamp?.inclusionEvidenceNote) failures.push('ASCPQRFZ conservative inclusion evidence note missing');
for(const id of ['nanlite-pavotube-ii-6xr','nanlite-pavotube-ii-15xr','nanlite-pavotube-ii-30xr','nanlite-pavotube-ii-60xr']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing Nanlite PavoTube II XR fixture: '+id);
  else if(!f.control?.builtInCRMX) failures.push('PavoTube II XR must have built-in CRMX: '+id);
}
const xr6=fixtures.find(x=>x.id==='nanlite-pavotube-ii-6xr');
if(xr6?.control?.dmxConnection!=='USB-C via CB-DMX-USBC-1/3II adapter') failures.push('6XR DMX path must be USB-C adapter');
if(!xr6?.control?.nfcPairing) failures.push('PavoTube II 6XR NFC pairing missing');
if((xr6?.control?.wireless||[]).includes('2.4G')) failures.push('PavoTube II 6XR must not claim 2.4G');
if(xr6?.cctK?.min!==2700||xr6?.cctK?.max!==12000) failures.push('PavoTube II 6XR product-facing CCT range must remain 2700K-12000K');
if(!xr6?.officialSourceConflict) failures.push('PavoTube II 6XR CCT source conflict must remain documented');
if((xr6?.conflictSources||[]).length<3) failures.push('PavoTube II 6XR conflict sources missing');
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
  if((f?.control?.wireless||[]).includes('2.4G')) failures.push(id+' must not claim 2.4G');
  if(!(f?.control?.wireless||[]).includes('Bluetooth / NANLINK app')) failures.push(id+' Bluetooth/NANLINK missing');
  if(!f?.control?.nfcPairing) failures.push(id+' NFC pairing missing');
}
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-fc-300b','nanlite-fc-500b','nanlite-fc-500c'])
    if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
  for(const target of ['nanlite-fc-1200b','nanlite-fc-1200c'])
    if(a?.compatibleWith?.includes(target)) failures.push(id+' must not infer 2.4G compatibility for '+target);
}
for(const target of ['nanlite-fc-300b','nanlite-fc-500b','nanlite-fc-500c','nanlite-fc-720b','nanlite-fc-720c','nanlite-fs-150b','nanlite-fs-200b','nanlite-fs-300','nanlite-fs-300b','nanlite-fs-300c']){
  if(!accessoryById.get('nanlite-fl-20g')?.compatibleWith?.includes(target)) failures.push('Canonical FL-20G missing '+target);
}
if(!accessoryById.get('nanlite-fl-20g')?.compatibilityEvidenceNote) failures.push('Canonical FL-20G compatibility evidence note missing');
for(const target of ['nanlite-fc-500b','nanlite-fc-500c','nanlite-fc-720b','nanlite-fc-720c','nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-forza-720','nanlite-forza-720b']){
  if(!accessoryById.get('nanlite-pj-bm-25-45')?.compatibleWith?.includes(target)) failures.push('Canonical PJ-BM-25-45 missing '+target);
}
if(!accessoryById.get('nanlite-pj-bm-25-45')?.compatibilityEvidenceNote) failures.push('Canonical PJ-BM-25-45 compatibility evidence note missing');
for(const duplicateId of ['nanlite-fl-20g-fc','nanlite-pj-bm-25-45-fc']) if(accessoryById.has(duplicateId)) failures.push('Duplicate Nanlite accessory ID must be removed: '+duplicateId);
const forza300day=fixtures.find(x=>x.id==='nanlite-forza-300-ii');
if(!forza300day) failures.push('Missing Nanlite Forza 300 II daylight');
else {
  if(forza300day.cctK?.fixed!==5600) failures.push('Forza 300 II must remain fixed 5600K daylight');
  if(forza300day.powerDrawW!==350) failures.push('Forza 300 II max power must remain 350W');
  if(forza300day.cri!==96) failures.push('Forza 300 II CRI must remain 96');
  if(forza300day.tlci!==97) failures.push('Forza 300 II TLCI must remain 97');
  if(forza300day.beamAngleDeg!==120) failures.push('Forza 300 II native beam angle must remain 120 degrees');
}
const forza720day=fixtures.find(x=>x.id==='nanlite-forza-720');
if(!forza720day) failures.push('Missing current Nanlite Forza 720 daylight');
else {
  if(forza720day.cctK?.fixed!==5600) failures.push('Forza 720 must remain fixed 5600K daylight');
  if(forza720day.powerDrawW!==800) failures.push('Forza 720 rated power must remain 800W');
  if(forza720day.cri!==95) failures.push('Forza 720 CRI must remain 95');
  if(forza720day.tlci!==96) failures.push('Forza 720 TLCI must remain 96');
  if(forza720day.beamAngleDeg!==120) failures.push('Forza 720 beam angle must remain 120 degrees');
  if(!forza720day.specSourceUrl) failures.push('Forza 720 technical spec source missing');
}
const forza720=fixtures.find(x=>x.id==='nanlite-forza-720b');
if(!forza720) failures.push('Missing current Nanlite Forza 720B');
else {
  if(forza720.discontinued!==false) failures.push('Forza 720B must be current');
  if(forza720.control?.builtInCRMX) failures.push('Forza 720B must not claim built-in CRMX');
  for(const p of ['DMX512','RDM']) if(!(forza720.control?.wired||[]).includes(p)) failures.push('Forza 720B missing '+p);
  for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(forza720.control?.wireless||[]).includes(p)) failures.push('Forza 720B missing '+p);
  if(forza720.cri!==96) failures.push('Forza 720B CRI must remain 96');
  if(forza720.tlci!==97) failures.push('Forza 720B TLCI must remain 97');
}
for(const id of ['nanlite-fl-20g','nanlite-pj-bm-19','nanlite-pj-bm-25-45','nanlite-ascpqrfz','nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id);
  if(!a?.compatibleWith?.includes('nanlite-forza-720b')) failures.push(id+' missing Forza 720B');
}
const f720Head=accessoryById.get('nanlite-forza-720b-head-cable');
for(const target of ['nanlite-forza-720','nanlite-forza-720b']){
  if(!f720Head?.compatibleWith?.includes(target)) failures.push('Forza 720 shared 5 m head cable missing '+target);
  if(!f720Head?.includedWithFixtures?.includes(target)) failures.push('Forza 720 shared 5 m included relation missing '+target);
}
if(f720Head?.model!=='Forza 720 / 720B Head Cable 5 m') failures.push('Forza 720 shared 5 m head cable identity mismatch');
if(!f720Head?.evidenceNote) failures.push('Forza 720 shared 5 m head cable evidence note missing');
const f720Case=accessoryById.get('nanlite-cc-st-fz720');
if(f720Case?.includedWithFixture===true) failures.push('Forza 720 rolling case must not use generic includedWithFixture flag');
for(const target of ['nanlite-forza-720','nanlite-forza-720b']){
  if(!f720Case?.compatibleWith?.includes(target)) failures.push('Forza 720 rolling case compatibility missing '+target);
  if(!f720Case?.includedWithFixtures?.includes(target)) failures.push('Forza 720 rolling case inclusion missing '+target);
}
if(!f720Case?.inclusionEvidenceNote) failures.push('Forza 720 rolling case inclusion evidence note missing');
if(!f720Case?.officialSourceConflict) failures.push('Forza 720 rolling case packaging conflict must remain documented');
if((f720Case?.conflictSources||[]).length<3) failures.push('Forza 720 rolling case conflict sources missing');
for(const duplicateId of ['nanlite-fl-20g-fc','nanlite-pj-bm-25-45-fc']) if(accessoryById.has(duplicateId)) failures.push('Duplicate Nanlite accessory ID must stay removed: '+duplicateId);
for(const id of ['nanlite-pj-bm-19','nanlite-pj-bm-36']){
  const a=accessoryById.get(id);
  if(!a) failures.push('Missing canonical PJ-BM accessory: '+id);
  else {
    for(const target of ["nanlite-forza-300-ii","nanlite-forza-300b-ii","nanlite-forza-500-ii","nanlite-forza-500b-ii","nanlite-forza-720","nanlite-forza-720b","nanlite-fs-150b","nanlite-fs-200b","nanlite-fs-300","nanlite-fs-300b","nanlite-fs-300c","nanlite-fc-500b","nanlite-fc-500c"])
      if(!a.compatibleWith?.includes(target)) failures.push(id+' missing documented target '+target);
    if(!a.compatibilityEvidenceNote) failures.push(id+' compatibility evidence note missing');
  }
}
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
const p60cl=fixtures.find(x=>x.id==='nanlite-pavoslim-60cl');
if(p60cl?.cctK?.min!==2700||p60cl?.cctK?.max!==7500) failures.push('PavoSlim 60CL technical CCT range must remain 2700K-7500K');
if(!p60cl?.officialSourceConflict) failures.push('PavoSlim 60CL official-source CCT conflict must remain documented');
if((p60cl?.conflictSources||[]).length<3) failures.push('PavoSlim 60CL conflict sources missing');
for(const id of ['nanlite-ws-rc-c2','nanlite-ws-tb-1','nanlite-ascpqrfz']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-pavoslim-60cl','nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c'])
    if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
const mag=accessoryById.get('nanlite-as-mba-1-4-set');
for(const target of ['nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-60cl','nanlite-pavoslim-120b','nanlite-pavoslim-120c','nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c'])
  if(!mag?.compatibleWith?.includes(target)) failures.push('Documented PavoSlim magnetic adapter target missing '+target);
const sw=accessoryById.get('nanlite-asuhps');
if(!sw?.compatibleWith?.includes('nanlite-pavoslim-60cl')) failures.push('PavoSlim 60CL shared swivel holder missing');
const baby60cl=accessoryById.get('nanlite-asbhpps');
if(!baby60cl?.compatibleWith?.includes('nanlite-pavoslim-60cl')) failures.push('PavoSlim 60CL shared baby-pin holder missing');
if(!baby60cl?.includedWithFixtures?.includes('nanlite-pavoslim-60cl')) failures.push('PavoSlim 60CL included baby-pin holder relation missing');
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
  if(!(bulb.control?.wired||[]).includes('DMX512')) failures.push('PavoBulb 10C DMX512 missing');
  if((bulb.control?.wired||[]).includes('RDM')) failures.push('PavoBulb 10C must not infer RDM without explicit first-party evidence');
  if(bulb.control?.dmxConnection!=='USB-C via CB-DMX-USBC-1/3 adapter') failures.push('PavoBulb 10C legacy USB-C DMX adapter path missing');
  if(!bulb.control?.controlEvidenceNote) failures.push('PavoBulb 10C control evidence note missing');
}
for(const id of ['nanlite-cb-dmx-usbc-1-3','nanlite-ws-rc-c2','nanlite-ws-tb-1','nanlite-wc-usbc-c1']){
  const a=accessoryById.get(id);
  if(!a?.compatibleWith?.includes('nanlite-pavobulb-10c')) failures.push(id+' missing PavoBulb 10C');
}
if(accessoryById.get('nanlite-cb-dmx-usbc-1-3ii')?.compatibleWith?.includes('nanlite-pavobulb-10c'))
  failures.push('CB-DMX-USBC-1/3II must not be inferred for PavoBulb 10C');
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
for(const id of ['nanlite-bt-npf750','nanlite-bt-npf970','nanlite-as-pbh-npf']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-miro-30c','nanlite-miro-60c'])
    if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
const npfCharger=accessoryById.get('nanlite-bt-cg-npf-2');
for(const target of ['nanlite-bt-npf750','nanlite-bt-npf970'])
  if(!npfCharger?.compatibleWith?.includes(target)) failures.push('BT-CG-NPF-2 missing battery '+target);
for(const target of ['nanlite-miro-30c','nanlite-miro-60c','nanlite-wand'])
  if(npfCharger?.compatibleWith?.includes(target)) failures.push('BT-CG-NPF-2 must link to batteries, not directly to fixture '+target);
for(const legacyId of ['nanlite-bt-npf750-miro','nanlite-bt-npf970-miro'])
  if(accessoryById.has(legacyId)) failures.push('Legacy miro-scoped NP-F accessory ID must stay removed: '+legacyId);
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
for(const id of ['nanlite-bt-npf750','nanlite-bt-npf970']){
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
const legacyBowensForzaIds=['nanlite-forza-200','nanlite-forza-300','nanlite-forza-300b','nanlite-forza-500'];
for(const id of legacyBowensForzaIds){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing first-generation Bowens Forza fixture: '+id);
  else {
    if(f.discontinued!==true) failures.push(id+' must be legacy/discontinued');
    if(f.mount!=='Bowens') failures.push(id+' must remain Bowens mount');
  }
}
const legacyF200=fixtures.find(x=>x.id==='nanlite-forza-200');
if(legacyF200?.cctK?.fixed!==5600||legacyF200?.powerDrawW!==200||legacyF200?.cri!==98||legacyF200?.tlci!==97)
  failures.push('Forza 200 documented 5600K / 200W / CRI98 / TLCI97 identity mismatch');
const legacyF300=fixtures.find(x=>x.id==='nanlite-forza-300');
if(legacyF300?.cctK?.fixed!==5600) failures.push('Original Forza 300 daylight 5600K identity missing');
if(legacyF300?.control?.builtInBluetooth!==false) failures.push('Original Forza 300 must not claim built-in Bluetooth');
const legacyF300b=fixtures.find(x=>x.id==='nanlite-forza-300b');
if(legacyF300b?.colorMode!=='Bi-Color') failures.push('Original Forza 300B bi-color identity missing');
const legacyF500=fixtures.find(x=>x.id==='nanlite-forza-500');
if(legacyF500?.cctK?.fixed!==5600) failures.push('Original Forza 500 daylight 5600K identity missing');
if(!legacyF500?.control?.wireless?.includes('2.4G via NANLINK WS-TB-1')) failures.push('Original Forza 500 documented WS-TB-1 path missing');
for(const id of ['nanlite-cb-fz-2-5','nanlite-cb-fz-5m-legacy']){
  const a=accessoryById.get(id);
  if(!a) failures.push('Missing first-generation Forza head cable: '+id);
  else for(const target of legacyBowensForzaIds) if(!a.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
if(accessoryById.get('nanlite-cb-fz-2-5')?.lengthM!==2.5) failures.push('CB-FZ-2.5 cable length must remain 2.5 m');
if(accessoryById.get('nanlite-cb-fz-5m-legacy')?.lengthM!==5) failures.push('Legacy Forza extension cable length must remain 5 m');
if(!accessoryById.get('nanlite-pa-48v84a-fz300')?.compatibleWith?.includes('nanlite-forza-300')) failures.push('PA-48V84A-FZ300 missing Forza 300');
for(const target of legacyBowensForzaIds){
  if(!accessoryById.get('nanlite-fl-20g')?.compatibleWith?.includes(target)) failures.push('FL-20G missing first-generation '+target);
  if(!accessoryById.get('nanlite-bd-bm-rf45')?.compatibleWith?.includes(target)) failures.push('BD-BM-RF45 missing first-generation '+target);
}
for(const target of ['nanlite-forza-200','nanlite-forza-300b'])
  if(!accessoryById.get('nanlite-as-cap-bw-b')?.compatibleWith?.includes(target)) failures.push('AS-CAP-BW-B missing first-generation '+target);
if(!accessoryById.get('nanlite-ws-tb-1')?.compatibleWith?.includes('nanlite-forza-500')) failures.push('WS-TB-1 missing first-generation Forza 500');
if(accessoryById.get('nanlite-ws-rc-c2')?.compatibleWith?.includes('nanlite-forza-500')) failures.push('WS-RC-C2 must not be inferred for first-generation Forza 500 without direct evidence');
const legacyForza60=fixtures.find(x=>x.id==='nanlite-forza-60');
if(!legacyForza60) failures.push('Missing legacy Nanlite Forza 60');
else {
  if(legacyForza60.discontinued!==true) failures.push('Forza 60 must be legacy/discontinued');
  if(legacyForza60.cctK?.fixed!==5600) failures.push('Forza 60 daylight 5600K profile missing');
  if(legacyForza60.control?.builtInBluetooth!==false) failures.push('Original Forza 60 must not claim built-in Bluetooth');
  if((legacyForza60.control?.wired||[]).length) failures.push('Original Forza 60 must not infer wired DMX/RDM');
  if(!(legacyForza60.control?.wireless||[]).includes('2.4G via NANLINK WS-TB-1')) failures.push('Original Forza 60 documented WS-TB-1 path missing');
}
const legacyForza60b=fixtures.find(x=>x.id==='nanlite-forza-60b');
if(!legacyForza60b) failures.push('Missing legacy Nanlite Forza 60B');
else {
  if(legacyForza60b.discontinued!==true) failures.push('Forza 60B must be legacy/discontinued');
  if(legacyForza60b.cctK?.min!==2700||legacyForza60b.cctK?.max!==6500) failures.push('Forza 60B CCT range must remain 2700K-6500K');
  if(legacyForza60b.cri!==96||legacyForza60b.tlci!==98) failures.push('Forza 60B color-rendering identity mismatch');
  if(legacyForza60b.control?.builtInBluetooth!==true) failures.push('Original Forza 60B Bluetooth support missing');
  if(legacyForza60b.control?.bluetoothRequiresFirmware!=='V1.00.17 or later') failures.push('Forza 60B Bluetooth firmware requirement missing');
  if((legacyForza60b.control?.wired||[]).length) failures.push('Original Forza 60B must not infer wired DMX/RDM');
}
for(const target of ['nanlite-forza-60','nanlite-forza-60b']){
  for(const id of ['nanlite-as-ba-fmm','nanlite-fl-11','nanlite-pj-fmm-19','nanlite-pj-fmm-36','nanlite-sb-fmm-o-40','nanlite-sb-fmm-o-60'])
    if(!accessoryById.get(id)?.compatibleWith?.includes(target)) failures.push(id+' missing legacy '+target);
  if(!accessoryById.get('nanlite-pa-15v6a-fz60')?.compatibleWith?.includes(target)) failures.push('PA-15V6A-FZ60 missing legacy '+target);
}
for(const target of ['nanlite-forza-60','nanlite-forza-60b']){
  if(accessoryById.get('nanlite-ws-rc-c2')?.compatibleWith?.includes(target)) failures.push('WS-RC-C2 must not be inferred for legacy '+target);
}
const forza150day=fixtures.find(x=>x.id==='nanlite-forza-150');
if(!forza150day) failures.push('Missing legacy Nanlite Forza 150');
else {
  if(forza150day.discontinued!==true) failures.push('Forza 150 must be legacy/discontinued');
  if(forza150day.cctK?.fixed!==5600) failures.push('Forza 150 daylight 5600K profile missing');
  if((forza150day.control?.wired||[]).includes('RDM')) failures.push('Forza 150 must not infer RDM from DMX-only first-party evidence');
  if(!(forza150day.control?.wired||[]).includes('DMX512')) failures.push('Forza 150 DMX512 missing');
  for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(forza150day.control?.wireless||[]).includes(p)) failures.push('Forza 150 missing '+p);
}
for(const id of ['nanlite-as-ba-fmm','nanlite-fl-11','nanlite-pj-fmm-19','nanlite-pj-fmm-36','nanlite-sb-fmm-o-40','nanlite-sb-fmm-o-60','nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-forza-150')) failures.push(id+' missing Forza 150');
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
for(const id of ['nanlite-fs-200b','nanlite-fs-300']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing legacy Nanlite FS fixture: '+id);
  else {
    if(f.discontinued!==true) failures.push('Legacy FS fixture must be discontinued: '+id);
    if((f.control?.wired||[]).length) failures.push('Legacy FS fixture must not claim DMX/RDM: '+id);
    if(f.control?.builtInCRMX) failures.push('Legacy FS fixture must not claim CRMX: '+id);
    for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(f.control?.wireless||[]).includes(p)) failures.push(id+' missing '+p);
  }
}
for(const id of ['nanlite-cc-s-fs','nanlite-bd-bm-rf45','nanlite-ws-rc-c2','nanlite-ws-tb-1']){
  const a=accessoryById.get(id);
  for(const target of ['nanlite-fs-200b','nanlite-fs-300']) if(!a?.compatibleWith?.includes(target)) failures.push(id+' missing '+target);
}
const bdRf45=accessoryById.get('nanlite-bd-bm-rf45');
for(const target of ['nanlite-fs-150b','nanlite-fs-200b','nanlite-fs-300','nanlite-fs-300b','nanlite-fs-300c','nanlite-forza-720','nanlite-forza-720b','nanlite-fc-500b','nanlite-fc-500c'])
  if(!bdRf45?.compatibleWith?.includes(target)) failures.push('BD-BM-RF45 missing documented target '+target);
if(!bdRf45?.compatibilityEvidenceNote) failures.push('BD-BM-RF45 compatibility evidence note missing');
for(const id of ['nanlite-compac-100','nanlite-compac-200']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing legacy Nanlite Compac daylight fixture: '+id);
  else if(f.discontinued!==true) failures.push('Legacy Compac daylight fixture must be discontinued: '+id);
}
for(const id of ['nanlite-compac-100-softbox','nanlite-compac-100-lantern']){
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-compac-100')) failures.push(id+' missing Compac 100');
}
for(const id of ['nanlite-compac-200-softbox','nanlite-compac-200-lantern']){
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-compac-200')) failures.push(id+' missing Compac 200');
}
const w2=accessoryById.get('nanlite-w-2-wifi-adapter');
for(const id of ['nanlite-compac-200','nanlite-compac-200b']) if(!w2?.compatibleWith?.includes(id)) failures.push('W-2 missing '+id);
if(w2?.compatibleWith?.includes('nanlite-compac-100')) failures.push('W-2 must not be inferred for Compac 100');
for(const id of ['nanlite-mixpanel-60','nanlite-mixpanel-150']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing legacy Nanlite MixPanel fixture: '+id);
  else if(f.discontinued!==true) failures.push('MixPanel must be legacy/open-box-only: '+id);
}
const mp60=fixtures.find(x=>x.id==='nanlite-mixpanel-60');
if(!(mp60?.control?.wired||[]).includes('DMX512')) failures.push('MixPanel 60 DMX512 missing');
for(const p of ['2.4G','Wi-Fi via Nanlite W-2 adapter / NANLINK app']) if(!(mp60?.control?.wireless||[]).includes(p)) failures.push('MixPanel 60 missing '+p);
const mp150=fixtures.find(x=>x.id==='nanlite-mixpanel-150');
if((mp150?.control?.wired||[]).length) failures.push('MixPanel 150 must not claim DMX until first-party evidence is resolved');
if(!mp150?.control?.controlEvidenceIncomplete) failures.push('MixPanel 150 incomplete control evidence flag missing');
for(const id of ['nanlite-sb-mp60','nanlite-rc-1-mixpanel60']){
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-mixpanel-60')) failures.push(id+' missing MixPanel 60');
}
for(const id of ['nanlite-sb-mp150','nanlite-sbmp150o','nanlite-bt-v-26v270']){
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-mixpanel-150')) failures.push(id+' missing MixPanel 150');
}
const mixTb=accessoryById.get('nanlite-ws-tb-1');
for(const target of ['nanlite-mixpanel-60','nanlite-mixpanel-150']) if(!mixTb?.compatibleWith?.includes(target)) failures.push('WS-TB-1 missing '+target);
const mixRc=accessoryById.get('nanlite-ws-rc-c2');
for(const target of ['nanlite-mixpanel-60','nanlite-mixpanel-150']) if(mixRc?.compatibleWith?.includes(target)) failures.push('WS-RC-C2 must not be inferred for '+target);
if(!accessoryById.get('nanlite-w-2-wifi-adapter')?.compatibleWith?.includes('nanlite-mixpanel-60')) failures.push('W-2 missing MixPanel 60');
for(const id of ['nanlite-mixpad-27','nanlite-mixpad-ii-11c']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing Nanlite MixPad fixture: '+id);
  else if(f.discontinued!==true) failures.push('MixPad fixture must be legacy/collection-only: '+id);
}
const mp27=fixtures.find(x=>x.id==='nanlite-mixpad-27');
if((mp27?.control?.wired||[]).length) failures.push('MixPad 27 must not claim DMX');
for(const p of ['2.4G','Wi-Fi via Nanlite W-2 adapter']) if(!(mp27?.control?.wireless||[]).includes(p)) failures.push('MixPad 27 missing '+p);
if(!accessoryById.get('nanlite-w-2-wifi-adapter')?.compatibleWith?.includes('nanlite-mixpad-27')) failures.push('W-2 missing MixPad 27');
if(!accessoryById.get('nanlite-rc-1-mixpad27')?.compatibleWith?.includes('nanlite-mixpad-27')) failures.push('RC-1 missing MixPad 27');
const mp11=fixtures.find(x=>x.id==='nanlite-mixpad-ii-11c');
if(!mp11?.control?.controlEvidenceIncomplete) failures.push('MixPad II 11C incomplete control evidence flag missing');
if((mp11?.control?.wired||[]).length||(mp11?.control?.wireless||[]).length) failures.push('MixPad II 11C control must remain unasserted');
if(accessoryById.get('nanlite-w-2-wifi-adapter')?.compatibleWith?.includes('nanlite-mixpad-ii-11c')) failures.push('W-2 must not be inferred for MixPad II 11C');
const lito=fixtures.find(x=>x.id==='nanlite-litolite-5c');
if(!lito) failures.push('Missing legacy Nanlite LitoLite 5C');
else {
  if(lito.discontinued!==true) failures.push('LitoLite 5C must be legacy/out-of-stock');
  if((lito.control?.wired||[]).length) failures.push('LitoLite 5C must not claim DMX');
  if(lito.control?.builtInCRMX) failures.push('LitoLite 5C must not claim CRMX');
  if(!lito.control?.controlEvidenceIncomplete) failures.push('LitoLite 5C wireless evidence guard missing');
}
for(const id of ['nanlite-as-mt-hg-1-4','nanlite-as-bh-1-4','nanlite-as-csa-1-4']){
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-litolite-5c')) failures.push(id+' missing LitoLite 5C');
}
for(const id of ['nanlite-halo-10b','nanlite-halo-14','nanlite-halo-14u','nanlite-halo-16','nanlite-halo-16c','nanlite-halo-18']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing legacy Nanlite Halo fixture: '+id);
  else if(f.discontinued!==true) failures.push('Halo fixture must be legacy: '+id);
}
for(const id of ['nanlite-halo-10b','nanlite-halo-18']){
  const f=fixtures.find(x=>x.id===id);
  if((f?.control?.wired||[]).length||(f?.control?.wireless||[]).length) failures.push(id+' must stay local-only');
}
for(const id of ['nanlite-halo-16','nanlite-halo-16c']){
  const f=fixtures.find(x=>x.id===id);
  for(const p of ['2.4G','Wi-Fi via Nanlite W-2 adapter']) if(!(f?.control?.wireless||[]).includes(p)) failures.push(id+' missing '+p);
  if(!accessoryById.get('nanlite-w-2-wifi-adapter')?.compatibleWith?.includes(id)) failures.push('W-2 missing '+id);
}
for(const id of ['nanlite-halo-14','nanlite-halo-14u']){
  if(!fixtures.find(x=>x.id===id)?.control?.controlEvidenceIncomplete) failures.push(id+' incomplete control evidence flag missing');
}
const haloBracket=accessoryById.get('nanlite-as-bracket-c');
for(const target of ['nanlite-halo-10b','nanlite-halo-14','nanlite-halo-14u','nanlite-halo-16','nanlite-halo-16c','nanlite-halo-18'])
  if(!haloBracket?.compatibleWith?.includes(target)) failures.push('Halo camera bracket missing '+target);
const haloMirror=accessoryById.get('nanlite-as-mirror-8');
for(const target of ['nanlite-halo-16','nanlite-halo-16c','nanlite-halo-18'])
  if(!haloMirror?.compatibleWith?.includes(target)) failures.push('Halo mirror missing '+target);
for(const id of ['nanlite-litolite-8f','nanlite-litolite-28f','nanlite-litolite-10fb']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing early legacy Nanlite LitoLite fixture: '+id);
  else {
    if(f.discontinued!==true) failures.push('Early LitoLite fixture must be legacy: '+id);
    if((f.control?.wired||[]).length||(f.control?.wireless||[]).length) failures.push('Early LitoLite must remain local-only: '+id);
  }
}
const forza60ii=fixtures.find(x=>x.id==='nanlite-forza-60-ii');
if(!forza60ii) failures.push('Missing current Nanlite Forza 60 II');
else {
  if(forza60ii.discontinued!==false) failures.push('Forza 60 II must be current');
  if(forza60ii.cctK?.fixed!==5600 && !(forza60ii.cctK?.min===5600 && forza60ii.cctK?.max===5600)) failures.push('Forza 60 II daylight 5600K profile missing');
  for(const p of ['DMX512','RDM']) if(!(forza60ii.control?.wired||[]).includes(p)) failures.push('Forza 60 II missing '+p);
  for(const p of ['Bluetooth / NANLINK app','2.4G']) if(!(forza60ii.control?.wireless||[]).includes(p)) failures.push('Forza 60 II missing '+p);
}
for(const id of ['nanlite-as-ba-fmm','nanlite-fl-11','nanlite-pj-fmm-19','nanlite-pj-fmm-36','nanlite-sb-fmm-o-40','nanlite-sb-fmm-o-60','nanlite-bt-bg-fz60','nanlite-bt-bg-v','nanlite-rf-fmm-45-s','nanlite-ws-rc-c2','nanlite-ws-tb-1','nanlite-ccsfz60ii']){
  if(!accessoryById.get(id)?.compatibleWith?.includes('nanlite-forza-60-ii')) failures.push(id+' missing Forza 60 II');
}
if(accessoryById.has('nanlite-case-forza-60b-ii')) failures.push('Generic Forza 60B II case duplicate must stay removed');
for(const id of ['nanlite-600sa','nanlite-600csa','nanlite-600dsa','nanlite-900sa','nanlite-900csa','nanlite-900dsa','nanlite-1200sa','nanlite-1200csa','nanlite-1200dsa']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing legacy Nanlite SA-Series fixture: '+id);
  else if(f.discontinued!==true) failures.push('SA-Series fixture must be legacy: '+id);
}
for(const id of ['nanlite-600dsa','nanlite-900dsa','nanlite-1200dsa']){
  const f=fixtures.find(x=>x.id===id);
  if(!(f?.control?.wired||[]).includes('DMX512')) failures.push(id+' DMX512 missing');
}
for(const id of ['nanlite-600sa','nanlite-600csa','nanlite-900sa','nanlite-900csa','nanlite-1200sa','nanlite-1200csa']){
  const f=fixtures.find(x=>x.id===id);
  if((f?.control?.wired||[]).length) failures.push(id+' must not infer DMX');
}
for(const [softbox,targets] of [
  ['nanlite-sb-600sa',['nanlite-600sa','nanlite-600csa','nanlite-600dsa']],
  ['nanlite-sb-900sa',['nanlite-900sa','nanlite-900csa','nanlite-900dsa']],
  ['nanlite-sb-1200sa',['nanlite-1200sa','nanlite-1200csa','nanlite-1200dsa']]
]){
  const a=accessoryById.get(softbox);
  for(const target of targets) if(!a?.compatibleWith?.includes(target)) failures.push(softbox+' missing '+target);
}
for(const target of ['nanlite-600csa','nanlite-1200csa'])
  if(!accessoryById.get('nanlite-w-2-wifi-adapter')?.compatibleWith?.includes(target)) failures.push('W-2 missing '+target);
for(const id of ['nanlite-tk-140b','nanlite-tk-280b','nanlite-tk-200','nanlite-tk-450']){
  const f=fixtures.find(x=>x.id===id);
  if(!f) failures.push('Missing legacy Nanlite TK fixture: '+id);
  else {
    if(f.discontinued!==true) failures.push('TK fixture must be legacy: '+id);
    if((f.control?.wired||[]).length) failures.push('TK fixture must not infer DMX: '+id);
    if(!f.control?.controlEvidenceIncomplete) failures.push('TK control evidence guard missing: '+id);
    if(!(f.control?.wireless||[]).includes('2.4G via NANLINK WS-TB-1')) failures.push('TK WS-TB-1 control missing: '+id);
  }
}
const tkTb=accessoryById.get('nanlite-ws-tb-1');
for(const target of ['nanlite-tk-140b','nanlite-tk-280b','nanlite-tk-200','nanlite-tk-450'])
  if(!tkTb?.compatibleWith?.includes(target)) failures.push('WS-TB-1 missing '+target);
const tkRc=accessoryById.get('nanlite-ws-rc-c2');
for(const target of ['nanlite-tk-140b','nanlite-tk-280b','nanlite-tk-200','nanlite-tk-450'])
  if(tkRc?.compatibleWith?.includes(target)) failures.push('WS-RC-C2 must not be inferred for '+target);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`Nanlite catalog self-test passed: ${fixtures.length} fixtures, ${accessories.length} accessories.`);
