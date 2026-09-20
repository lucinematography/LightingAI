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

const spectrum1=fixtures.find(x=>x.id==='litegear-litemat-spectrum-g2-1');
if(!spectrum1) failures.push('Missing LiteMat Spectrum 1 Gen 2 control-route fixture');
else{
  const control=spectrum1.control||{};
  if(control.fixtureNative?.dmx512!==false) failures.push('LiteMat Spectrum 1 head must not claim native DMX512');
  if(control.fixtureNative?.rdm!==false) failures.push('LiteMat Spectrum 1 head must not claim native RDM');
  if(control.fixtureNative?.artNet!==false) failures.push('LiteMat Spectrum 1 head must not claim native Art-Net');
  if(control.fixtureNative?.sacn!==false) failures.push('LiteMat Spectrum 1 head must not claim native sACN');
  if(control.fixtureNative?.crmx!==false) failures.push('LiteMat Spectrum 1 head must not claim native CRMX');
  if(control.fixtureNative?.bluetooth!==false) failures.push('LiteMat Spectrum 1 head must not claim Bluetooth');
  if(control.fixtureNative?.wifi!==false) failures.push('LiteMat Spectrum 1 head must not claim Wi-Fi');
  if(control.controller?.model!=='LiteDimmer Spectrum AC/DC 200') failures.push('LiteMat Spectrum 1 controller must be LiteDimmer Spectrum AC/DC 200');
  for(const item of ['DMX512','RDM','Art-Net 4','sACN (E1.31)']) if(!control.controller?.wired?.includes(item)) failures.push('LiteMat Spectrum 1 dimmer wired control path missing: '+item);
  if(!control.controller?.wireless?.includes('CRMX')) failures.push('LiteMat Spectrum 1 dimmer CRMX path missing');
  if(control.controller?.bluetooth!==false) failures.push('LiteMat Spectrum 1 dimmer must not claim Bluetooth');
  if(control.controller?.wifi!==false) failures.push('LiteMat Spectrum 1 dimmer must not claim Wi-Fi');
  if(control.dmx?.profileAppliesAt!=='LiteDimmer Spectrum AC/DC 200 running Spectrum OS 3.1') failures.push('LiteMat Spectrum 1 DMX profile ownership/version missing');
  if(!String(control.dmx?.officialProfileTable||'').includes('rdm-dmx-profile-tables-spectrum-os-3-1.pdf')) failures.push('LiteMat Spectrum 1 official Spectrum OS 3.1 RDM-DMX table missing');
}


const spectrum2=fixtures.find(x=>x.id==='litegear-litemat-spectrum-g2-2');
if(!spectrum2) failures.push('Missing LiteMat Spectrum 2 Gen 2 control-route fixture');
else{
  const control=spectrum2.control||{};
  if(control.fixtureNative?.dmx512!==false) failures.push('LiteMat Spectrum 2 head must not claim native DMX512');
  if(control.fixtureNative?.rdm!==false) failures.push('LiteMat Spectrum 2 head must not claim native RDM');
  if(control.fixtureNative?.artNet!==false) failures.push('LiteMat Spectrum 2 head must not claim native Art-Net');
  if(control.fixtureNative?.sacn!==false) failures.push('LiteMat Spectrum 2 head must not claim native sACN');
  if(control.fixtureNative?.crmx!==false) failures.push('LiteMat Spectrum 2 head must not claim native CRMX');
  if(control.fixtureNative?.bluetooth!==false) failures.push('LiteMat Spectrum 2 head must not claim Bluetooth');
  if(control.fixtureNative?.wifi!==false) failures.push('LiteMat Spectrum 2 head must not claim Wi-Fi');
  if(control.controller?.model!=='LiteDimmer Spectrum AC/DC 200') failures.push('LiteMat Spectrum 2 controller must be LiteDimmer Spectrum AC/DC 200');
  for(const item of ['DMX512','RDM','Art-Net 4','sACN (E1.31)']) if(!control.controller?.wired?.includes(item)) failures.push('LiteMat Spectrum 2 dimmer wired control path missing: '+item);
  if(!control.controller?.wireless?.includes('CRMX')) failures.push('LiteMat Spectrum 2 dimmer CRMX path missing');
  if(control.controller?.bluetooth!==false) failures.push('LiteMat Spectrum 2 dimmer must not claim Bluetooth');
  if(control.controller?.wifi!==false) failures.push('LiteMat Spectrum 2 dimmer must not claim Wi-Fi');
  if(control.dmx?.profileAppliesAt!=='LiteDimmer Spectrum AC/DC 200 running Spectrum OS 3.1') failures.push('LiteMat Spectrum 2 DMX profile ownership/version missing');
  if(control.dmx?.pixelCount!==2) failures.push('LiteMat Spectrum 2 DMX pixel count must be 2');
  if(!String(control.dmx?.officialProfileTable||'').includes('rdm-dmx-profile-tables-spectrum-os-3-1.pdf')) failures.push('LiteMat Spectrum 2 official Spectrum OS 3.1 RDM-DMX table missing');
}


const spectrum2l=fixtures.find(x=>x.id==='litegear-litemat-spectrum-g2-2l');
if(!spectrum2l) failures.push('Missing LiteMat Spectrum 2L Gen 2 control-route fixture');
else{
  const control=spectrum2l.control||{};
  if(control.fixtureNative?.dmx512!==false) failures.push('LiteMat Spectrum 2L head must not claim native DMX512');
  if(control.fixtureNative?.rdm!==false) failures.push('LiteMat Spectrum 2L head must not claim native RDM');
  if(control.fixtureNative?.artNet!==false) failures.push('LiteMat Spectrum 2L head must not claim native Art-Net');
  if(control.fixtureNative?.sacn!==false) failures.push('LiteMat Spectrum 2L head must not claim native sACN');
  if(control.fixtureNative?.crmx!==false) failures.push('LiteMat Spectrum 2L head must not claim native CRMX');
  if(control.fixtureNative?.bluetooth!==false) failures.push('LiteMat Spectrum 2L head must not claim Bluetooth');
  if(control.fixtureNative?.wifi!==false) failures.push('LiteMat Spectrum 2L head must not claim Wi-Fi');
  if(control.controller?.model!=='LiteDimmer Spectrum AC/DC 200') failures.push('LiteMat Spectrum 2L controller must be LiteDimmer Spectrum AC/DC 200');
  for(const item of ['DMX512','RDM','Art-Net 4','sACN (E1.31)']) if(!control.controller?.wired?.includes(item)) failures.push('LiteMat Spectrum 2L dimmer wired control path missing: '+item);
  if(!control.controller?.wireless?.includes('CRMX')) failures.push('LiteMat Spectrum 2L dimmer CRMX path missing');
  if(control.controller?.bluetooth!==false) failures.push('LiteMat Spectrum 2L dimmer must not claim Bluetooth');
  if(control.controller?.wifi!==false) failures.push('LiteMat Spectrum 2L dimmer must not claim Wi-Fi');
  if(control.dmx?.profileAppliesAt!=='LiteDimmer Spectrum AC/DC 200 running Spectrum OS 3.1') failures.push('LiteMat Spectrum 2L DMX profile ownership/version missing');
  if(control.dmx?.pixelCount!==2) failures.push('LiteMat Spectrum 2L DMX pixel count must be 2');
  if(!String(control.dmx?.officialProfileTable||'').includes('rdm-dmx-profile-tables-spectrum-os-3-1.pdf')) failures.push('LiteMat Spectrum 2L official Spectrum OS 3.1 RDM-DMX table missing');
}


const spectrum3=fixtures.find(x=>x.id==='litegear-litemat-spectrum-g2-3');
if(!spectrum3) failures.push('Missing LiteMat Spectrum 3 Gen 2 control-route fixture');
else{
  const control=spectrum3.control||{};
  if(control.fixtureNative?.dmx512!==false) failures.push('LiteMat Spectrum 3 head must not claim native DMX512');
  if(control.fixtureNative?.rdm!==false) failures.push('LiteMat Spectrum 3 head must not claim native RDM');
  if(control.fixtureNative?.artNet!==false) failures.push('LiteMat Spectrum 3 head must not claim native Art-Net');
  if(control.fixtureNative?.sacn!==false) failures.push('LiteMat Spectrum 3 head must not claim native sACN');
  if(control.fixtureNative?.crmx!==false) failures.push('LiteMat Spectrum 3 head must not claim native CRMX');
  if(control.fixtureNative?.bluetooth!==false) failures.push('LiteMat Spectrum 3 head must not claim Bluetooth');
  if(control.fixtureNative?.wifi!==false) failures.push('LiteMat Spectrum 3 head must not claim Wi-Fi');
  if(control.controller?.model!=='LiteDimmer Spectrum AC/DC 200') failures.push('LiteMat Spectrum 3 controller must be LiteDimmer Spectrum AC/DC 200');
  for(const item of ['DMX512','RDM','Art-Net 4','sACN (E1.31)']) if(!control.controller?.wired?.includes(item)) failures.push('LiteMat Spectrum 3 dimmer wired control path missing: '+item);
  if(!control.controller?.wireless?.includes('CRMX')) failures.push('LiteMat Spectrum 3 dimmer CRMX path missing');
  if(control.controller?.bluetooth!==false) failures.push('LiteMat Spectrum 3 dimmer must not claim Bluetooth');
  if(control.controller?.wifi!==false) failures.push('LiteMat Spectrum 3 dimmer must not claim Wi-Fi');
  if(control.dmx?.profileAppliesAt!=='LiteDimmer Spectrum AC/DC 200 running Spectrum OS 3.1') failures.push('LiteMat Spectrum 3 DMX profile ownership/version missing');
  if(control.dmx?.pixelCount!==3) failures.push('LiteMat Spectrum 3 DMX pixel count must be 3');
  if(!String(control.dmx?.officialProfileTable||'').includes('rdm-dmx-profile-tables-spectrum-os-3-1.pdf')) failures.push('LiteMat Spectrum 3 official Spectrum OS 3.1 RDM-DMX table missing');
}


const spectrum4=fixtures.find(x=>x.id==='litegear-litemat-spectrum-g2-4');
if(!spectrum4) failures.push('Missing LiteMat Spectrum 4 Gen 2 control-route fixture');
else{
  const control=spectrum4.control||{};
  if(control.fixtureNative?.dmx512!==false) failures.push('LiteMat Spectrum 4 head must not claim native DMX512');
  if(control.fixtureNative?.rdm!==false) failures.push('LiteMat Spectrum 4 head must not claim native RDM');
  if(control.fixtureNative?.artNet!==false) failures.push('LiteMat Spectrum 4 head must not claim native Art-Net');
  if(control.fixtureNative?.sacn!==false) failures.push('LiteMat Spectrum 4 head must not claim native sACN');
  if(control.fixtureNative?.crmx!==false) failures.push('LiteMat Spectrum 4 head must not claim native CRMX');
  if(control.fixtureNative?.bluetooth!==false) failures.push('LiteMat Spectrum 4 head must not claim Bluetooth');
  if(control.fixtureNative?.wifi!==false) failures.push('LiteMat Spectrum 4 head must not claim Wi-Fi');
  if(control.controller?.model!=='LiteDimmer Spectrum AC/DC 200') failures.push('LiteMat Spectrum 4 controller must be LiteDimmer Spectrum AC/DC 200');
  for(const item of ['DMX512','RDM','Art-Net 4','sACN (E1.31)']) if(!control.controller?.wired?.includes(item)) failures.push('LiteMat Spectrum 4 dimmer wired control path missing: '+item);
  if(!control.controller?.wireless?.includes('CRMX')) failures.push('LiteMat Spectrum 4 dimmer CRMX path missing');
  if(control.controller?.bluetooth!==false) failures.push('LiteMat Spectrum 4 dimmer must not claim Bluetooth');
  if(control.controller?.wifi!==false) failures.push('LiteMat Spectrum 4 dimmer must not claim Wi-Fi');
  if(control.dmx?.profileAppliesAt!=='LiteDimmer Spectrum AC/DC 200 running Spectrum OS 3.1') failures.push('LiteMat Spectrum 4 DMX profile ownership/version missing');
  if(control.dmx?.pixelCount!==4) failures.push('LiteMat Spectrum 4 DMX pixel count must be 4');
  if(!String(control.dmx?.officialProfileTable||'').includes('rdm-dmx-profile-tables-spectrum-os-3-1.pdf')) failures.push('LiteMat Spectrum 4 official Spectrum OS 3.1 RDM-DMX table missing');
}


const spectrum8=fixtures.find(x=>x.id==='litegear-litemat-spectrum-g2-8');
if(!spectrum8) failures.push('Missing LiteMat Spectrum 8 Gen 2 control-route fixture');
else{
  const control=spectrum8.control||{};
  if(control.fixtureNative?.dmx512!==false) failures.push('LiteMat Spectrum 8 head must not claim native DMX512');
  if(control.fixtureNative?.rdm!==false) failures.push('LiteMat Spectrum 8 head must not claim native RDM');
  if(control.fixtureNative?.artNet!==false) failures.push('LiteMat Spectrum 8 head must not claim native Art-Net');
  if(control.fixtureNative?.sacn!==false) failures.push('LiteMat Spectrum 8 head must not claim native sACN');
  if(control.fixtureNative?.crmx!==false) failures.push('LiteMat Spectrum 8 head must not claim native CRMX');
  if(control.fixtureNative?.bluetooth!==false) failures.push('LiteMat Spectrum 8 head must not claim Bluetooth');
  if(control.fixtureNative?.wifi!==false) failures.push('LiteMat Spectrum 8 head must not claim Wi-Fi');
  if(control.controller?.model!=='LiteDimmer Spectrum AC/DC 400') failures.push('LiteMat Spectrum 8 controller must be LiteDimmer Spectrum AC/DC 400');
  for(const item of ['DMX512','RDM','Art-Net 4','sACN (E1.31)']) if(!control.controller?.wired?.includes(item)) failures.push('LiteMat Spectrum 8 dimmer wired control path missing: '+item);
  if(!control.controller?.wireless?.includes('CRMX')) failures.push('LiteMat Spectrum 8 dimmer CRMX path missing');
  if(control.controller?.bluetooth!==false) failures.push('LiteMat Spectrum 8 dimmer must not claim Bluetooth');
  if(control.controller?.wifi!==false) failures.push('LiteMat Spectrum 8 dimmer must not claim Wi-Fi');
  if(control.dmx?.profileAppliesAt!=='LiteDimmer Spectrum AC/DC 400 running Spectrum OS 3.1') failures.push('LiteMat Spectrum 8 DMX profile ownership/version missing');
  if(control.dmx?.pixelCount!==8) failures.push('LiteMat Spectrum 8 DMX pixel count must be 8');
  if(!String(control.dmx?.officialProfileTable||'').includes('rdm-dmx-profile-tables-spectrum-os-3-1.pdf')) failures.push('LiteMat Spectrum 8 official Spectrum OS 3.1 RDM-DMX table missing');
}


const plus1=fixtures.find(x=>x.id==='litegear-litemat-plus-1');
if(!plus1) failures.push('Missing LiteMat Plus 1 control-route fixture');
else{
  const control=plus1.control||{};
  if(control.fixtureNative?.dmx512!==false) failures.push('LiteMat Plus 1 head must not claim native DMX512');
  if(control.fixtureNative?.rdm!==false) failures.push('LiteMat Plus 1 head must not claim native RDM');
  if(control.fixtureNative?.artNet!==false) failures.push('LiteMat Plus 1 head must not claim native Art-Net');
  if(control.fixtureNative?.sacn!==false) failures.push('LiteMat Plus 1 head must not claim native sACN');
  if(control.fixtureNative?.crmx!==false) failures.push('LiteMat Plus 1 head must not claim native CRMX');
  if(control.controller?.model!=='LiteDimmer Plus DC200 DMX Duo') failures.push('LiteMat Plus 1 controller must be LiteDimmer Plus DC200 DMX Duo');
  if(control.controller?.local!==true) failures.push('LiteMat Plus 1 Duo controller must expose local control');
  if(control.controller?.dmx512!==true) failures.push('LiteMat Plus 1 Duo controller DMX512 path missing');
  if(control.controller?.rdm!==false) failures.push('LiteMat Plus 1 Duo controller must not claim RDM');
  if(control.controller?.artNet!==false) failures.push('LiteMat Plus 1 Duo controller must not claim Art-Net');
  if(control.controller?.sacn!==false) failures.push('LiteMat Plus 1 Duo controller must not claim sACN');
  if(control.controller?.crmx!==false) failures.push('LiteMat Plus 1 Duo controller must not claim CRMX without explicit manufacturer protocol identification');
  if(control.controller?.bluetooth!==false) failures.push('LiteMat Plus 1 Duo controller must not claim Bluetooth');
  if(control.controller?.wifi!==false) failures.push('LiteMat Plus 1 Duo controller must not claim Wi-Fi');
  if(!String(control.controller?.wireless||'').includes('does not identify the radio protocol as CRMX/LumenRadio')) failures.push('LiteMat Plus 1 wireless protocol limitation missing');
  if(control.dmx?.profileAppliesAt!=='LiteDimmer Plus DC200 DMX Duo') failures.push('LiteMat Plus 1 DMX profile ownership missing');
  if(control.dmx?.publicChannelTable!==null) failures.push('LiteMat Plus 1 must not invent a public DMX channel table');
}


const plus2=fixtures.find(x=>x.id==='litegear-litemat-plus-2');
if(!plus2) failures.push('Missing LiteMat Plus 2 control-route fixture');
else{
  const control=plus2.control||{};
  if(plus2.powerW!==100) failures.push('LiteMat Plus 2 power must be 100W');
  if(plus2.inputVoltage!=='24V DC') failures.push('LiteMat Plus 2 input voltage must be 24V DC');
  if(plus2.ledQuantity!==1152) failures.push('LiteMat Plus 2 LED quantity must be 1152');
  if(control.fixtureNative?.dmx512!==false) failures.push('LiteMat Plus 2 head must not claim native DMX512');
  if(control.fixtureNative?.rdm!==false) failures.push('LiteMat Plus 2 head must not claim native RDM');
  if(control.fixtureNative?.artNet!==false) failures.push('LiteMat Plus 2 head must not claim native Art-Net');
  if(control.fixtureNative?.sacn!==false) failures.push('LiteMat Plus 2 head must not claim native sACN');
  if(control.fixtureNative?.crmx!==false) failures.push('LiteMat Plus 2 head must not claim native CRMX');
  if(control.controller?.model!=='LiteDimmer Plus DC200 DMX Duo') failures.push('LiteMat Plus 2 controller must be LiteDimmer Plus DC200 DMX Duo');
  if(control.controller?.local!==true) failures.push('LiteMat Plus 2 Duo controller must expose local control');
  if(control.controller?.dmx512!==true) failures.push('LiteMat Plus 2 Duo controller DMX512 path missing');
  if(control.controller?.rdm!==false) failures.push('LiteMat Plus 2 Duo controller must not claim RDM');
  if(control.controller?.artNet!==false) failures.push('LiteMat Plus 2 Duo controller must not claim Art-Net');
  if(control.controller?.sacn!==false) failures.push('LiteMat Plus 2 Duo controller must not claim sACN');
  if(control.controller?.crmx!==false) failures.push('LiteMat Plus 2 Duo controller must not claim CRMX without explicit manufacturer protocol identification');
  if(control.controller?.bluetooth!==false) failures.push('LiteMat Plus 2 Duo controller must not claim Bluetooth');
  if(control.controller?.wifi!==false) failures.push('LiteMat Plus 2 Duo controller must not claim Wi-Fi');
  if(!String(control.controller?.wireless||'').includes('does not identify the radio protocol as CRMX/LumenRadio')) failures.push('LiteMat Plus 2 wireless protocol limitation missing');
  if(control.dmx?.profileAppliesAt!=='LiteDimmer Plus DC200 DMX Duo') failures.push('LiteMat Plus 2 DMX profile ownership missing');
  if(control.dmx?.publicChannelTable!==null) failures.push('LiteMat Plus 2 must not invent a public DMX channel table');
}


const plus2l=fixtures.find(x=>x.id==='litegear-litemat-plus-2l');
if(!plus2l) failures.push('Missing LiteMat Plus 2L control-route fixture');
else{
  const control=plus2l.control||{};
  if(plus2l.powerW!==100) failures.push('LiteMat Plus 2L power must be 100W');
  if(plus2l.inputVoltage!=='24V DC') failures.push('LiteMat Plus 2L input voltage must be 24V DC');
  if(plus2l.ledQuantity!==1152) failures.push('LiteMat Plus 2L LED quantity must be 1152');
  if(control.fixtureNative?.dmx512!==false) failures.push('LiteMat Plus 2L head must not claim native DMX512');
  if(control.fixtureNative?.rdm!==false) failures.push('LiteMat Plus 2L head must not claim native RDM');
  if(control.fixtureNative?.artNet!==false) failures.push('LiteMat Plus 2L head must not claim native Art-Net');
  if(control.fixtureNative?.sacn!==false) failures.push('LiteMat Plus 2L head must not claim native sACN');
  if(control.fixtureNative?.crmx!==false) failures.push('LiteMat Plus 2L head must not claim native CRMX');
  if(control.controller?.model!=='LiteDimmer Plus DC200 DMX Duo') failures.push('LiteMat Plus 2L controller must be LiteDimmer Plus DC200 DMX Duo');
  if(control.controller?.local!==true) failures.push('LiteMat Plus 2L Duo controller must expose local control');
  if(control.controller?.dmx512!==true) failures.push('LiteMat Plus 2L Duo controller DMX512 path missing');
  if(control.controller?.rdm!==false) failures.push('LiteMat Plus 2L Duo controller must not claim RDM');
  if(control.controller?.artNet!==false) failures.push('LiteMat Plus 2L Duo controller must not claim Art-Net');
  if(control.controller?.sacn!==false) failures.push('LiteMat Plus 2L Duo controller must not claim sACN');
  if(control.controller?.crmx!==false) failures.push('LiteMat Plus 2L Duo controller must not claim CRMX without explicit manufacturer protocol identification');
  if(control.controller?.bluetooth!==false) failures.push('LiteMat Plus 2L Duo controller must not claim Bluetooth');
  if(control.controller?.wifi!==false) failures.push('LiteMat Plus 2L Duo controller must not claim Wi-Fi');
  if(!String(control.controller?.wireless||'').includes('does not identify the radio protocol as CRMX/LumenRadio')) failures.push('LiteMat Plus 2L wireless protocol limitation missing');
  if(control.dmx?.profileAppliesAt!=='LiteDimmer Plus DC200 DMX Duo') failures.push('LiteMat Plus 2L DMX profile ownership missing');
  if(control.dmx?.publicChannelTable!==null) failures.push('LiteMat Plus 2L must not invent a public DMX channel table');
}


const plus3=fixtures.find(x=>x.id==='litegear-litemat-plus-3');
if(!plus3) failures.push('Missing LiteMat Plus 3 control-route fixture');
else{
  const control=plus3.control||{};
  if(plus3.powerW!==150) failures.push('LiteMat Plus 3 power must be 150W');
  if(plus3.inputVoltage!=='24V DC') failures.push('LiteMat Plus 3 input voltage must be 24V DC');
  if(plus3.ledQuantity!==1728) failures.push('LiteMat Plus 3 LED quantity must be 1728');
  if(control.fixtureNative?.dmx512!==false) failures.push('LiteMat Plus 3 head must not claim native DMX512');
  if(control.fixtureNative?.rdm!==false) failures.push('LiteMat Plus 3 head must not claim native RDM');
  if(control.fixtureNative?.artNet!==false) failures.push('LiteMat Plus 3 head must not claim native Art-Net');
  if(control.fixtureNative?.sacn!==false) failures.push('LiteMat Plus 3 head must not claim native sACN');
  if(control.fixtureNative?.crmx!==false) failures.push('LiteMat Plus 3 head must not claim native CRMX');
  if(control.controller?.model!=='LiteDimmer Plus DC200 DMX Duo') failures.push('LiteMat Plus 3 controller must be LiteDimmer Plus DC200 DMX Duo');
  if(control.controller?.local!==true) failures.push('LiteMat Plus 3 Duo controller must expose local control');
  if(control.controller?.dmx512!==true) failures.push('LiteMat Plus 3 Duo controller DMX512 path missing');
  if(control.controller?.rdm!==false) failures.push('LiteMat Plus 3 Duo controller must not claim RDM');
  if(control.controller?.artNet!==false) failures.push('LiteMat Plus 3 Duo controller must not claim Art-Net');
  if(control.controller?.sacn!==false) failures.push('LiteMat Plus 3 Duo controller must not claim sACN');
  if(control.controller?.crmx!==false) failures.push('LiteMat Plus 3 Duo controller must not claim CRMX without explicit manufacturer protocol identification');
  if(control.controller?.bluetooth!==false) failures.push('LiteMat Plus 3 Duo controller must not claim Bluetooth');
  if(control.controller?.wifi!==false) failures.push('LiteMat Plus 3 Duo controller must not claim Wi-Fi');
  if(!String(control.controller?.wireless||'').includes('does not identify the radio protocol as CRMX/LumenRadio')) failures.push('LiteMat Plus 3 wireless protocol limitation missing');
  if(control.dmx?.profileAppliesAt!=='LiteDimmer Plus DC200 DMX Duo') failures.push('LiteMat Plus 3 DMX profile ownership missing');
  if(control.dmx?.publicChannelTable!==null) failures.push('LiteMat Plus 3 must not invent a public DMX channel table');
}

const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'LiteGear',family:'LiteMat',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,failures:unique},null,2));
if(unique.length) process.exit(1);
