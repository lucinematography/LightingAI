import { buildRuntimeCatalog } from './catalog-runtime.js';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='Aladdin');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='Aladdin');
const expected=['aladdin-mosaic-2x4','aladdin-mosaic-4x4','aladdin-mosaic-3x6','aladdin-fabric-lite-20','aladdin-fabric-lite-35','aladdin-bi-flex-m3','aladdin-bi-flex-m7','aladdin-bi-flex-1','aladdin-bi-flex-2','aladdin-bi-flex-4','aladdin-all-in-one','aladdin-all-in-two','aladdin-base-lite-100','aladdin-base-lite-200','aladdin-a-lite','aladdin-eye-lite','aladdin-bi-fabric-2','aladdin-bi-fabric-4'];
const ids=new Set(fixtures.map(x=>x.id));
const failures=[];
const duplicateFixtureIds=fixtures.map(x=>x.id).filter((id,i,a)=>a.indexOf(id)!==i);
const duplicateAccessoryIds=accessories.map(x=>x.id).filter((id,i,a)=>a.indexOf(id)!==i);
if(duplicateFixtureIds.length) failures.push('Duplicate Aladdin fixture IDs: '+[...new Set(duplicateFixtureIds)].join(', '));
if(duplicateAccessoryIds.length) failures.push('Duplicate Aladdin accessory IDs: '+[...new Set(duplicateAccessoryIds)].join(', '));
if(fixtures.length!==expected.length) failures.push(`Unexpected Aladdin fixture count: ${fixtures.length}; expected ${expected.length}`);
for(const id of expected) if(!ids.has(id)) failures.push('Missing required Aladdin fixture: '+id);
for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?aladdin-lights\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official Aladdin fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked Aladdin accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?aladdin-lights\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official Aladdin accessory source: '+a.id);
  if(!(a.compatibleWith||[]).length) failures.push('Aladdin accessory without compatibility targets: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('aladdin-')) failures.push('Broken Aladdin compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}

// BASE-LITE 100/200: official Aladdin DMX map defines exactly two channels:
// CH1 dimmer 0-255 / 0-100%, CH2 linear CCT 2900-6400 K.
const baseLiteDmxSource='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
for(const id of ['aladdin-base-lite-100','aladdin-base-lite-200']){
  const fixture=fixtures.find(item=>item.id===id);
  const mode=fixture?.dmxModes?.find(item=>item?.name==='2ch Dimmer + CCT');
  if(!mode||fixture.dmxModes.length!==1||mode.channels!==2||mode.verified!==true||mode.sourceUrl!==baseLiteDmxSource){
    failures.push('Incorrect verified Aladdin BASE-LITE DMX mode/source: '+id);
    continue;
  }
  const dimmer=mode.controls?.find(item=>item?.key==='dimmer');
  const cct=mode.controls?.find(item=>item?.key==='cct');
  if(!dimmer||dimmer.channel!==1||dimmer.type!=='percent'||dimmer.min!==0||dimmer.max!==100||dimmer.dmxMin!==0||dimmer.dmxMax!==255){
    failures.push('Incorrect Aladdin BASE-LITE dimmer mapping: '+id);
  }
  if(!cct||cct.channel!==2||cct.type!=='cct-linear'||cct.min!==2900||cct.max!==6400||cct.dmxMin!==0||cct.dmxMax!==255){
    failures.push('Incorrect Aladdin BASE-LITE CCT mapping: '+id);
  }
  if(mode.controls?.length!==2||mode.requiredChannels?.length){
    failures.push('Unexpected Aladdin BASE-LITE extra DMX mapping data: '+id);
  }
}


// BI-FABRIC 2/4: official Aladdin DMX map defines CH1 dimmer and CH2 linear CCT 2900-6000 K.
const biFabricDmxSource='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
for(const id of ['aladdin-bi-fabric-2','aladdin-bi-fabric-4']){
  const fixture=fixtures.find(item=>item.id===id);
  const mode=fixture?.dmxModes?.find(item=>item?.name==='2ch Dimmer + CCT');
  if(!mode||fixture.dmxModes.length!==1||mode.channels!==2||mode.verified!==true||mode.sourceUrl!==biFabricDmxSource){
    failures.push('Incorrect verified Aladdin BI-FABRIC DMX mode/source: '+id);
    continue;
  }
  const dimmer=mode.controls?.find(item=>item?.key==='dimmer');
  const cct=mode.controls?.find(item=>item?.key==='cct');
  if(!dimmer||dimmer.channel!==1||dimmer.type!=='percent'||dimmer.min!==0||dimmer.max!==100||dimmer.dmxMin!==0||dimmer.dmxMax!==255){
    failures.push('Incorrect Aladdin BI-FABRIC dimmer mapping: '+id);
  }
  if(!cct||cct.channel!==2||cct.type!=='cct-linear'||cct.min!==2900||cct.max!==6000||cct.dmxMin!==0||cct.dmxMax!==255){
    failures.push('Incorrect Aladdin BI-FABRIC CCT mapping: '+id);
  }
  if(mode.controls?.length!==2||mode.requiredChannels?.length){
    failures.push('Unexpected Aladdin BI-FABRIC extra DMX mapping data: '+id);
  }
}


// FABRIC-LITE 20/35: official Aladdin DMX map defines CH1 dimmer and CH2 linear CCT 2900-6000 K.
const fabricLiteDmxSource='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
for(const id of ['aladdin-fabric-lite-20','aladdin-fabric-lite-35']){
  const fixture=fixtures.find(item=>item.id===id);
  const mode=fixture?.dmxModes?.find(item=>item?.name==='2ch Dimmer + CCT');
  if(!mode||fixture.dmxModes.length!==1||mode.channels!==2||mode.verified!==true||mode.sourceUrl!==fabricLiteDmxSource){
    failures.push('Incorrect verified Aladdin FABRIC-LITE DMX mode/source: '+id);
    continue;
  }
  const dimmer=mode.controls?.find(item=>item?.key==='dimmer');
  const cct=mode.controls?.find(item=>item?.key==='cct');
  if(!dimmer||dimmer.channel!==1||dimmer.type!=='percent'||dimmer.min!==0||dimmer.max!==100||dimmer.dmxMin!==0||dimmer.dmxMax!==255){
    failures.push('Incorrect Aladdin FABRIC-LITE dimmer mapping: '+id);
  }
  if(!cct||cct.channel!==2||cct.type!=='cct-linear'||cct.min!==2900||cct.max!==6000||cct.dmxMin!==0||cct.dmxMax!==255){
    failures.push('Incorrect Aladdin FABRIC-LITE CCT mapping: '+id);
  }
  if(mode.controls?.length!==2||mode.requiredChannels?.length){
    failures.push('Unexpected Aladdin FABRIC-LITE extra DMX mapping data: '+id);
  }
}


// BI-FLEX M3/M7: official Aladdin DMX map defines CH1 dimmer and CH2 linear CCT 2900-5600 K.
const biFlexMxDmxSource='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
for(const id of ['aladdin-bi-flex-m3','aladdin-bi-flex-m7']){
  const fixture=fixtures.find(item=>item.id===id);
  const mode=fixture?.dmxModes?.find(item=>item?.name==='2ch Dimmer + CCT');
  if(!mode||fixture.dmxModes.length!==1||mode.channels!==2||mode.verified!==true||mode.sourceUrl!==biFlexMxDmxSource){
    failures.push('Incorrect verified Aladdin BI-FLEX M3/M7 DMX mode/source: '+id);
    continue;
  }
  const dimmer=mode.controls?.find(item=>item?.key==='dimmer');
  const cct=mode.controls?.find(item=>item?.key==='cct');
  if(!dimmer||dimmer.channel!==1||dimmer.type!=='percent'||dimmer.min!==0||dimmer.max!==100||dimmer.dmxMin!==0||dimmer.dmxMax!==255){
    failures.push('Incorrect Aladdin BI-FLEX M3/M7 dimmer mapping: '+id);
  }
  if(!cct||cct.channel!==2||cct.type!=='cct-linear'||cct.min!==2900||cct.max!==5600||cct.dmxMin!==0||cct.dmxMax!==255){
    failures.push('Incorrect Aladdin BI-FLEX M3/M7 CCT mapping: '+id);
  }
  if(mode.controls?.length!==2||mode.requiredChannels?.length){
    failures.push('Unexpected Aladdin BI-FLEX M3/M7 extra DMX mapping data: '+id);
  }
}
for(const id of ['aladdin-bi-flex-2','aladdin-bi-flex-4']){
  const fixture=fixtures.find(item=>item.id===id);
  const mode=fixture?.dmxModes?.find(item=>item?.name==='2ch Dimmer + CCT');
  const source='https://aladdin-lights.com/wp-content/uploads/2022/08/DIMMER-UNIT-200W-Manual-SINGLE-PAGE.pdf';
  if(!mode||fixture.dmxModes.length!==1||mode.channels!==2||mode.verified!==true||mode.sourceUrl!==source){failures.push('Incorrect verified legacy BI-FLEX 2/4 DMX mode/source: '+id);continue;}
  const dimmer=mode.controls?.find(item=>item?.key==='dimmer'),cct=mode.controls?.find(item=>item?.key==='cct');
  if(!dimmer||dimmer.channel!==1||dimmer.type!=='percent'||dimmer.min!==0||dimmer.max!==100||dimmer.dmxMin!==0||dimmer.dmxMax!==255) failures.push('Incorrect legacy BI-FLEX 2/4 dimmer mapping: '+id);
  if(!cct||cct.channel!==2||cct.type!=='cct-linear'||cct.min!==2900||cct.max!==6000||cct.dmxMin!==0||cct.dmxMax!==255) failures.push('Incorrect legacy BI-FLEX 2/4 CCT mapping: '+id);
  if(mode.controls?.length!==2||mode.requiredChannels?.length) failures.push('Unexpected legacy BI-FLEX 2/4 extra DMX mapping data: '+id);
  if(!fixture.control?.wireless?.includes('LumenRadio')) failures.push('Legacy BI-FLEX 2/4 LumenRadio path missing: '+id);
}
{
  const fixture=fixtures.find(item=>item.id==='aladdin-bi-flex-1');
  if(fixture?.dmxModes?.length) failures.push('BI-FLEX 1 must remain non-DMX: aladdin-bi-flex-1');
}

// Network-DMX encoder/runtime checks were removed with the transport. Catalog data remains audited.
const mosaicControls={ok:true,reason:'network_dmx_control_removed'};

// ALL-IN ONE/TWO: official 2024 controller manual documents two DMX personalities and the function order.
// We intentionally keep CCT normalized because no official Kelvin-vs-DMX transfer curve is published.
const allInController='https://aladdin-lights.com/wp-content/uploads/2024/02/ALL-IN-DIMMER-UNIT-Manual-05.02.2024.pdf';
for(const id of ['aladdin-all-in-one','aladdin-all-in-two']){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==2){failures.push('Missing Aladdin ALL-IN DMX modes: '+id);continue;}
  if(!fixture.control?.wired?.includes('Optional DMX512')||!fixture.control?.wireless?.includes('LumenRadio via ALL-WDIM')) failures.push('Missing ALL-IN verified remote-control path: '+id);
  if(!String(fixture.controlNotes||'').includes('Bluetooth app access')) failures.push('Missing ALL-IN Bluetooth/controller exclusivity note: '+id);
  const bi=fixture.dmxModes.find(mode=>mode?.name==='2ch White Bi-Color (optional DMX)');
  const rgb=fixture.dmxModes.find(mode=>mode?.name==='3ch RGB (optional DMX)');
  if(!bi||bi.channels!==2||bi.verified!==true||bi.sourceUrl!==allInController||bi.controlScope!=='documented-functions-normalized-cct') failures.push('Incorrect ALL-IN 2ch profile: '+id);
  if(!rgb||rgb.channels!==3||rgb.verified!==true||rgb.sourceUrl!==allInController||rgb.controlScope!=='documented-functions') failures.push('Incorrect ALL-IN 3ch profile: '+id);
  const expectedBi=[['dimmer',1],['cctPosition',2]],expectedRgb=[['red',1],['green',2],['blue',3]];
  for(const [mode,expected] of [[bi,expectedBi],[rgb,expectedRgb]]){
    if(!mode) continue;
    if(mode.controls?.length!==expected.length||mode.requiredChannels?.length) failures.push('Unexpected ALL-IN control count/requirements: '+id+' / '+mode.name);
    for(const [key,channel] of expected){
      const control=mode.controls?.find(item=>item?.key===key);
      if(!control||control.channel!==channel||control.type!=='percent'||control.bits!==8||control.min!==0||control.max!==100||control.dmxMin!==0||control.dmxMax!==255){failures.push('Incorrect ALL-IN control mapping: '+id+' / '+mode.name+' / '+key);}
    }
  }
  if(bi?.controls?.some(control=>control.key==='cct'||control.type==='cct-linear')) failures.push('ALL-IN must not invent an undocumented Kelvin transfer: '+id);
  for(const accessoryId of ['aladdin-all-wdim','aladdin-all-dmxat']){
    const accessory=accessories.find(item=>item.id===accessoryId);
    if(!accessory?.compatibleWith?.includes(id)) failures.push('Missing ALL-IN control accessory link: '+id+' / '+accessoryId);
  }
}

const structuredControlFixtures=fixtures.filter(fixture=>fixture.control && !Array.isArray(fixture.control));
const verifiedDmxFixtures=fixtures.filter(fixture=>(fixture.dmxModes||[]).some(mode=>mode?.verified===true));
const verifiedModes=fixtures.flatMap(fixture=>(fixture.dmxModes||[]).filter(mode=>mode?.verified===true));
const dmxProfileHolds=fixtures.filter(fixture=>fixture.dmxProfileVerification?.status==='HOLD');
if(fixtures.some(fixture=>Array.isArray(fixture.control))) failures.push('Aladdin runtime fixture must not retain legacy control array');
if(structuredControlFixtures.length!==16) failures.push('Aladdin structured control fixture count must remain 16, got '+structuredControlFixtures.length);
if(verifiedDmxFixtures.length!==15) failures.push('Aladdin verified DMX fixture count must remain 15, got '+verifiedDmxFixtures.length);
if(verifiedModes.length!==20) failures.push('Aladdin verified DMX mode count must remain 20, got '+verifiedModes.length);
if(dmxProfileHolds.length!==0) failures.push('Aladdin verified DMX catalog must not gain profile HOLDs unexpectedly: '+dmxProfileHolds.map(fixture=>fixture.id).join(', '));
for(const fixture of structuredControlFixtures){
  for(const key of ['local','wired','wireless','directLightingAI','externalInterfaceRequired','sourceUrls','legacyLabels']){
    if(!Array.isArray(fixture.control?.[key])) failures.push('Aladdin structured control array missing: '+fixture.id+' '+key);
  }
  const transport=[...(fixture.control?.wired||[]),...(fixture.control?.wireless||[])].join(' ').toLowerCase();
  const hasDmx=/(^|[^a-z0-9])dmx(?:-?512a?|512)?([^a-z0-9]|$)/.test(transport)||transport.includes('lumenradio');
  const fixtureVerified=(fixture.dmxModes||[]).filter(mode=>mode?.verified===true);
  const hold=fixture.dmxProfileVerification?.status==='HOLD';
  if(hasDmx&&!fixtureVerified.length&&!hold) failures.push('Aladdin standard control transport requires verified DMX mode or explicit HOLD: '+fixture.id);
  if(fixtureVerified.length&&fixture.dmxProfileVerification) failures.push('Aladdin verified DMX mode must not coexist with profile HOLD: '+fixture.id);
}
{
  const fixture=fixtures.find(item=>item.id==='aladdin-bi-flex-1');
  if(fixture?.control?.wired?.length||fixture?.control?.wireless?.length) failures.push('BI-FLEX 1 must remain local-only after control normalization');
}
const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'Aladdin',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,structuredControlFixtures:structuredControlFixtures.length,verifiedDmxFixtures:verifiedDmxFixtures.length,verifiedModes:verifiedModes.length,dmxProfileHolds:dmxProfileHolds.length,mosaicControls,failures:unique},null,2));
if(unique.length) process.exit(1);

// Only test-local instrumentation exposes closure functions. No sender, network or native bridge runs.
