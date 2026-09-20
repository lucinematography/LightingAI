import { buildRuntimeCatalog } from './catalog-runtime.js';

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
for(const id of ['aladdin-bi-flex-1','aladdin-bi-flex-2','aladdin-bi-flex-4']){
  const fixture=fixtures.find(item=>item.id===id);
  if(fixture?.dmxModes?.length) failures.push('Legacy BI-FLEX exact DMX map must remain unchanged until separately sourced: '+id);
}

const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'Aladdin',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,failures:unique},null,2));
if(unique.length) process.exit(1);
