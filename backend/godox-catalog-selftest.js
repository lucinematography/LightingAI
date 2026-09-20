import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='Godox');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='Godox');
const ids=new Set(fixtures.map(x=>x.id));
const expected=[
  'godox-m300r','godox-m600r','godox-m1000r','godox-m600bi-pro',
  'godox-la600r','godox-la600bi','godox-p600r-hard','godox-p1200r-hard',
  'godox-f200bi','godox-f400bi','godox-f600bi','godox-tp2r','godox-tp4r','godox-tp8r',
  'godox-mg1200bi','godox-mg2400bi','godox-mg1200r','godox-mg2400r','godox-ms60bi','godox-ms60r',
  'godox-m200d','godox-m300d','godox-m200bi','godox-m300bi','godox-p300r','godox-p600r',
  'godox-f100r','godox-f200r','godox-f200sr','godox-f400r','godox-f800r',
  'godox-c5r','godox-c7r','godox-c10r','godox-la150r','godox-la200r','godox-la300r','godox-la300bi',
  'godox-lp400r','godox-lp600r','godox-lp1200r','godox-lp400bi','godox-lp600bi','godox-lp1200bi',
  'godox-lc500r','godox-lc500bi','godox-lc500mini','godox-lc500rmini','godox-lc1000bi','godox-lc1000r',
  'godox-ldp8d','godox-ldp18d','godox-ldp8bi','godox-ldp18bi','godox-ldx50r','godox-ldx100r','godox-ldx50bi','godox-ldx100bi',
  'godox-ml100bi','godox-ml100r',
  'godox-sl60iid','godox-sl60iibi','godox-sl100d','godox-sl100bi','godox-sl150iii','godox-sl200iii','godox-sl300iii','godox-sl150iiibi','godox-sl200iiibi','godox-sl300iiibi',
  'godox-tl30','godox-tl60','godox-tl120','godox-tl180'
];
const failures=[];
const duplicateFixtureIds=fixtures.map(x=>x.id).filter((id,i,a)=>a.indexOf(id)!==i);
const duplicateAccessoryIds=accessories.map(x=>x.id).filter((id,i,a)=>a.indexOf(id)!==i);
if(duplicateFixtureIds.length) failures.push('Duplicate Godox fixture IDs: '+[...new Set(duplicateFixtureIds)].join(', '));
if(duplicateAccessoryIds.length) failures.push('Duplicate Godox accessory IDs: '+[...new Set(duplicateAccessoryIds)].join(', '));
if(fixtures.length!==expected.length) failures.push(`Unexpected Godox fixture count: ${fixtures.length}; expected ${expected.length}`);
for(const id of expected) if(!ids.has(id)) failures.push('Missing required Godox fixture: '+id);
for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?godox\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official Godox fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked Godox accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?godox\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official Godox accessory source: '+a.id);
  if(!(a.compatibleWith||[]).length) failures.push('Godox accessory without compatibility targets: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('godox-')) failures.push('Broken Godox compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}
for(const fixtureId of ['godox-m300r','godox-m600r','godox-m1000r','godox-m600bi-pro']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  for(const item of ['DMX512','RDM','Ethernet Art-Net','Ethernet sACN']) if(!control.wired?.includes(item)) failures.push('Godox KNOWLED M wired control path missing: '+fixtureId+' '+item);
  for(const item of ['CRMX','Bluetooth/App']) if(!control.wireless?.includes(item)) failures.push('Godox KNOWLED M wireless control path missing: '+fixtureId+' '+item);
  if(!control.builtInCRMX) failures.push('Godox KNOWLED M built-in CRMX flag missing: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox KNOWLED M built-in Bluetooth flag missing: '+fixtureId);
  for(const item of ['Art-Net','sACN']) if(!control.directLightingAI?.includes(item)) failures.push('Godox KNOWLED M LightingAI network path missing: '+fixtureId+' '+item);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512 control')) failures.push('Godox KNOWLED M wired DMX interface requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Godox KNOWLED M CRMX transmitter requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox KNOWLED M Bluetooth protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-la600r','godox-la600bi']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('Godox LA600 wired control path missing: '+fixtureId+' '+item);
  for(const item of ['Bluetooth/App','CRMX via TimoLink RX']) if(!control.wireless?.includes(item)) failures.push('Godox LA600 wireless control path missing: '+fixtureId+' '+item);
  if(control.builtInCRMX) failures.push('Godox LA600 must not claim built-in CRMX: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox LA600 built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox LA600 must not claim direct LightingAI network transport: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512 control')) failures.push('Godox LA600 wired DMX interface requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('CRMX transmitter plus Godox TimoLink RX for CRMX control')) failures.push('Godox LA600 CRMX/TimoLink requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox LA600 Bluetooth protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-p600r-hard','godox-p1200r-hard']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('Godox P Hard wired control path missing: '+fixtureId+' '+item);
  for(const item of ['CRMX','Bluetooth/App']) if(!control.wireless?.includes(item)) failures.push('Godox P Hard wireless control path missing: '+fixtureId+' '+item);
  if(!control.builtInCRMX) failures.push('Godox P Hard built-in CRMX flag missing: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox P Hard built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox P Hard must not claim direct LightingAI network transport: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512 control')) failures.push('Godox P Hard wired DMX interface requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Godox P Hard CRMX transmitter requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox P Hard Bluetooth protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-f200bi','godox-f400bi','godox-f600bi']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  if(!control.wired?.includes('DMX512')) failures.push('Godox flexible Bi wired DMX path missing: '+fixtureId);
  for(const item of ['2.4G Remote','Bluetooth/App','CRMX via optional TimoLink RX']) if(!control.wireless?.includes(item)) failures.push('Godox flexible Bi wireless path missing: '+fixtureId+' '+item);
  if(control.builtInCRMX) failures.push('Godox flexible Bi must not claim built-in CRMX: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox flexible Bi built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox flexible Bi must not claim direct LightingAI network transport: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512 control')) failures.push('Godox flexible Bi wired DMX interface requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('CRMX transmitter plus Godox TimoLink RX for CRMX control')) failures.push('Godox flexible Bi CRMX/TimoLink requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox flexible Bi public-protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-tp2r','godox-tp4r','godox-tp8r']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  for(const item of ['DMX512 via DMX-C1','RDM via DMX-C1']) if(!control.wired?.includes(item)) failures.push('Godox TP wired control path missing: '+fixtureId+' '+item);
  for(const item of ['CRMX','Bluetooth/App','2.4G Remote']) if(!control.wireless?.includes(item)) failures.push('Godox TP wireless control path missing: '+fixtureId+' '+item);
  if(!control.builtInCRMX) failures.push('Godox TP built-in CRMX flag missing: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox TP built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox TP must not claim direct LightingAI network transport: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface plus Godox DMX-C1 adapter cable for DMX512/RDM control')) failures.push('Godox TP DMX-C1 requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Godox TP CRMX transmitter requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Compatible Godox 2.4GHz remote for 2.4GHz remote control')) failures.push('Godox TP 2.4GHz remote requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox TP public-protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-mg1200bi','godox-mg2400bi','godox-mg1200r','godox-mg2400r']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  for(const item of ['DMX512','RDM','Ethernet Art-Net','Ethernet sACN']) if(!control.wired?.includes(item)) failures.push('Godox MG wired control path missing: '+fixtureId+' '+item);
  for(const item of ['CRMX','Bluetooth/App']) if(!control.wireless?.includes(item)) failures.push('Godox MG wireless control path missing: '+fixtureId+' '+item);
  if(!control.builtInCRMX) failures.push('Godox MG built-in CRMX flag missing: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox MG built-in Bluetooth flag missing: '+fixtureId);
  for(const item of ['Art-Net','sACN']) if(!control.directLightingAI?.includes(item)) failures.push('Godox MG LightingAI network path missing: '+fixtureId+' '+item);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512/RDM control')) failures.push('Godox MG wired DMX interface requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Godox MG CRMX transmitter requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox MG public-protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-mg1200bi','godox-mg2400bi']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  if(!control.wireless?.includes('2.4G Remote')) failures.push('Godox MG Bi 2.4GHz path missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Compatible Godox 2.4GHz remote for 2.4GHz remote control')) failures.push('Godox MG Bi 2.4GHz remote requirement missing: '+fixtureId);
}
for(const fixtureId of ['godox-ms60bi','godox-ms60r']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('Godox MS60 wired control path missing: '+fixtureId+' '+item);
  for(const item of ['CRMX','Bluetooth/App']) if(!control.wireless?.includes(item)) failures.push('Godox MS60 wireless control path missing: '+fixtureId+' '+item);
  if(!control.builtInCRMX) failures.push('Godox MS60 built-in CRMX flag missing: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox MS60 built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox MS60 must not claim direct LightingAI network transport: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512/RDM control')) failures.push('Godox MS60 wired DMX interface requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Godox MS60 CRMX transmitter requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox MS60 Bluetooth protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-m200d','godox-m300d','godox-m200bi','godox-m300bi']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  if(!control.wired?.includes('DMX512')) failures.push('Godox M200/M300 DMX path missing: '+fixtureId);
  for(const item of ['2.4G Remote','Bluetooth/App']) if(!control.wireless?.includes(item)) failures.push('Godox M200/M300 wireless path missing: '+fixtureId+' '+item);
  if(control.builtInCRMX) failures.push('Godox M200/M300 must not claim built-in CRMX: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox M200/M300 built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox M200/M300 must not claim direct LightingAI network transport: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512 control')) failures.push('Godox M200/M300 wired DMX interface requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Compatible Godox 2.4GHz remote for 2.4GHz remote control')) failures.push('Godox M200/M300 2.4GHz remote requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox M200/M300 public-protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-p300r','godox-p600r']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  for(const item of ['DMX512','RDM','Ethernet Art-Net','Ethernet sACN']) if(!control.wired?.includes(item)) failures.push('Godox P300R/P600R wired control path missing: '+fixtureId+' '+item);
  for(const item of ['CRMX','Bluetooth/App']) if(!control.wireless?.includes(item)) failures.push('Godox P300R/P600R wireless control path missing: '+fixtureId+' '+item);
  if(!control.builtInCRMX) failures.push('Godox P300R/P600R built-in CRMX flag missing: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox P300R/P600R built-in Bluetooth flag missing: '+fixtureId);
  for(const item of ['Art-Net','sACN']) if(!control.directLightingAI?.includes(item)) failures.push('Godox P300R/P600R LightingAI network path missing: '+fixtureId+' '+item);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512/RDM control')) failures.push('Godox P300R/P600R wired DMX interface requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Godox P300R/P600R CRMX transmitter requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox P300R/P600R Bluetooth protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-f100r','godox-f200r','godox-f200sr']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  for(const item of ['DMX512','RDM']) if(!control.wired?.includes(item)) failures.push('Godox F100/F200 wired path missing: '+fixtureId+' '+item);
  for(const item of ['CRMX','Bluetooth/App']) if(!control.wireless?.includes(item)) failures.push('Godox F100/F200 wireless path missing: '+fixtureId+' '+item);
  if(!control.builtInCRMX) failures.push('Godox F100/F200 built-in CRMX flag missing: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox F100/F200 built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox F100/F200 must not claim direct LightingAI network transport: '+fixtureId);
}
for(const fixtureId of ['godox-f400r','godox-f800r']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  for(const item of ['DMX512','RDM','Ethernet Art-Net','Ethernet sACN']) if(!control.wired?.includes(item)) failures.push('Godox F400/F800 wired path missing: '+fixtureId+' '+item);
  for(const item of ['CRMX','Bluetooth/App']) if(!control.wireless?.includes(item)) failures.push('Godox F400/F800 wireless path missing: '+fixtureId+' '+item);
  if(!control.builtInCRMX) failures.push('Godox F400/F800 built-in CRMX flag missing: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox F400/F800 built-in Bluetooth flag missing: '+fixtureId);
  for(const item of ['Art-Net','sACN']) if(!control.directLightingAI?.includes(item)) failures.push('Godox F400/F800 LightingAI network path missing: '+fixtureId+' '+item);
}
for(const fixtureId of ['godox-f100r','godox-f200r','godox-f200sr','godox-f400r','godox-f800r']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512/RDM control')) failures.push('Godox full-color mat wired DMX requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Godox full-color mat CRMX requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox full-color mat Bluetooth protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-c5r','godox-c7r','godox-c10r']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  if(control.wired?.length) failures.push('Godox C-series must not claim wired control: '+fixtureId);
  if(!control.wireless?.includes('Bluetooth/App')) failures.push('Godox C-series Bluetooth/App path missing: '+fixtureId);
  if(control.builtInCRMX) failures.push('Godox C-series must not claim built-in CRMX: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox C-series built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox C-series must not claim direct LightingAI transport: '+fixtureId);
  if(control.externalInterfaceRequired?.length) failures.push('Godox C-series should not require DMX/CRMX interface: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox C-series Bluetooth protocol limitation missing: '+fixtureId);
}
for(const fixtureId of ['godox-la150r','godox-la200r']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  if(control.wired?.length) failures.push('Godox LA150/LA200 must not claim wired control: '+fixtureId);
  if(!control.wireless?.includes('Bluetooth/App')) failures.push('Godox LA150/LA200 Bluetooth/App path missing: '+fixtureId);
  if(control.builtInCRMX) failures.push('Godox LA150/LA200 must not claim built-in CRMX: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox LA150/LA200 built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox LA150/LA200 must not claim direct LightingAI transport: '+fixtureId);
}
for(const fixtureId of ['godox-la300r','godox-la300bi']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  if(!control.wired?.includes('DMX512 via DMX-TRS1')) failures.push('Godox LA300 DMX-TRS1 path missing: '+fixtureId);
  if(!control.wireless?.includes('Bluetooth/App')) failures.push('Godox LA300 Bluetooth/App path missing: '+fixtureId);
  if(control.builtInCRMX) failures.push('Godox LA300 must not claim built-in CRMX: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox LA300 built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox LA300 must not claim direct LightingAI network transport: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface plus Godox DMX-TRS1 adapter cable for DMX512 control')) failures.push('Godox LA300 DMX-TRS1 requirement missing: '+fixtureId);
}
for(const fixtureId of ['godox-la150r','godox-la200r','godox-la300r','godox-la300bi']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox LA Bluetooth protocol limitation missing: '+fixtureId);
}
{
  const fixture=fixtures.find(x=>x.id==='godox-tl30');
  const control=fixture?.control||{};
  if(control.wired?.length) failures.push('Godox TL30 must not claim wired control');
  if(!control.wireless?.includes('Bluetooth/App')) failures.push('Godox TL30 Bluetooth/App path missing');
  if(control.builtInCRMX) failures.push('Godox TL30 must not claim built-in CRMX');
  if(!control.builtInBluetooth) failures.push('Godox TL30 built-in Bluetooth flag missing');
  if(control.directLightingAI?.length) failures.push('Godox TL30 must not claim direct LightingAI transport');
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox TL30 Bluetooth protocol limitation missing');
}
for(const fixtureId of ['godox-tl60','godox-tl120','godox-tl180']){
  const fixture=fixtures.find(x=>x.id===fixtureId);
  const control=fixture?.control||{};
  if(!control.wired?.includes('DMX512')) failures.push('Godox TL DMX512 path missing: '+fixtureId);
  for(const item of ['2.4G Remote','Bluetooth/App']) if(!control.wireless?.includes(item)) failures.push('Godox TL wireless path missing: '+fixtureId+' '+item);
  if(control.builtInCRMX) failures.push('Godox TL must not claim built-in CRMX: '+fixtureId);
  if(!control.builtInBluetooth) failures.push('Godox TL built-in Bluetooth flag missing: '+fixtureId);
  if(control.directLightingAI?.length) failures.push('Godox TL must not claim direct LightingAI network transport: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX512 control')) failures.push('Godox TL wired DMX requirement missing: '+fixtureId);
  if(!control.externalInterfaceRequired?.includes('Compatible Godox 2.4GHz remote for 2.4GHz remote control')) failures.push('Godox TL 2.4GHz remote requirement missing: '+fixtureId);
  if(!control.unavailableDirectProtocols?.some(x=>String(x).includes('not publicly documented'))) failures.push('Godox TL public-protocol limitation missing: '+fixtureId);
}
const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'Godox',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,failures:unique},null,2));
if(unique.length)process.exit(1);
