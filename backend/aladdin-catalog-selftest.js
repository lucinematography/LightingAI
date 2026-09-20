import { buildRuntimeCatalog } from './catalog-runtime.js';
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
for(const id of ['aladdin-bi-flex-1','aladdin-bi-flex-2','aladdin-bi-flex-4']){
  const fixture=fixtures.find(item=>item.id===id);
  if(fixture?.dmxModes?.length) failures.push('Legacy BI-FLEX exact DMX map must remain unchanged until separately sourced: '+id);
}

// MOSAIC 2X4/4X4/3X6: static direct controls, official DMX map 2023 pp. 1-2.
// Reconfirmed against ALADDIN_DMX_MAP-12.2025.pdf pp. 25-26.
const mosaicDmxSource='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
const mosaicDmxWidths=[['Simple CCT Crossfade RGBW',8],['Expert CCT Crossfade RGBW + Effects',11]];
const mosaicControls=[['dimmer',1,'percent',0,100],['cct',2,'cct-linear',2200,12000],['crossfade',4,'percent',0,100],['red',5,'percent',0,100],['green',6,'percent',0,100],['blue',7,'percent',0,100],['white',8,'percent',0,100]];
for(const id of ['aladdin-mosaic-2x4','aladdin-mosaic-4x4','aladdin-mosaic-3x6']){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||!Array.isArray(fixture.dmxModes)){
    failures.push('Missing Aladdin MOSAIC DMX modes: '+id);
    continue;
  }
  if(fixture.dmxModes.length!==mosaicDmxWidths.length){
    failures.push('Unexpected Aladdin MOSAIC DMX mode count: '+id);
  }
  for(const [name,channels] of mosaicDmxWidths){
    const matches=fixture.dmxModes.filter(mode=>mode?.name===name);
    const mode=matches[0];
    if(matches.length!==1||mode?.channels!==channels||mode?.verified!==true||mode?.sourceUrl!==mosaicDmxSource){
      failures.push('Incorrect verified Aladdin MOSAIC DMX width/source: '+id+' / '+name);
    }
    if(mode?.controlScope!=='static-light'||!Array.isArray(mode?.controls)||mode.controls.length!==mosaicControls.length){
      failures.push('Incorrect Aladdin MOSAIC static control set: '+id+' / '+name);
      continue;
    }
    for(const [key,channel,type,min,max] of mosaicControls){
      const controls=mode.controls.filter(control=>control?.key===key);
      const control=controls[0];
      if(controls.length!==1||control?.channel!==channel||control?.type!==type||control?.bits!==8||control?.min!==min||control?.max!==max||control?.dmxMin!==0||control?.dmxMax!==255){
        failures.push('Incorrect Aladdin MOSAIC control mapping: '+id+' / '+name+' / '+key);
      }
    }
    const requirements=channels===11?[[3,0],[9,0]]:[[3,0]];
    if(!Array.isArray(mode.requiredChannels)||mode.requiredChannels.length!==requirements.length){
      failures.push('Incorrect Aladdin MOSAIC static safety requirements: '+id+' / '+name);
    }else{
      for(const [channel,value] of requirements){
        const values=mode.requiredChannels.filter(item=>item?.channel===channel);
        if(values.length!==1||values[0]?.value!==value){
          failures.push('MOSAIC static controls must neutralize green correction and disable Expert FX: '+id+' / '+name+' / CH'+channel);
        }
      }
    }
  }
}

// Exercise the actual app's pure DMX encoder; no network/native sender is executed.
{
  const appSource=readFileSync(new URL('../app/src/main/assets/artnet-control.js',import.meta.url),'utf8');
  const start=appSource.indexOf('function controlBitDepth(ctrl){');
  const end=appSource.indexOf('function renderMasterControl(){',start);
  if(start<0||end<=start){
    failures.push('Cannot locate the app DMX encoder for the Aladdin integration test');
  }else{
    const codec=runInNewContext(appSource.slice(start,end)+';({controlToDmx,writeControlToFrame,applyProfileRequirements})',{}, {timeout:1000});
    for(const fixture of fixtures.filter(item=>item.family==='MOSAIC')){
      for(const mode of fixture.dmxModes||[]){
        for(const control of mode.controls||[]){
          for(let value=0;value<=255;value++){
            const input=control.min+(control.max-control.min)*value/255;
            if(codec.controlToDmx(control,input)!==value){
              failures.push('Aladdin MOSAIC DMX quantization mismatch: '+fixture.id+' / '+mode.name+' / '+control.key);
              break;
            }
          }
          for(const fixtureStart of [1,513-mode.channels]){
            const frame=new Array(512).fill(77);
            const address=fixtureStart+control.channel-1;
            if(!codec.applyProfileRequirements(frame,fixtureStart,mode)||!codec.writeControlToFrame(frame,address,control,control.max)||frame[address-1]!==255){
              failures.push('Aladdin MOSAIC app frame write failed: '+fixture.id+' / '+mode.name+' / '+control.key);
            }
            const written=new Set([address-1,...(mode.requiredChannels||[]).map(item=>fixtureStart+item.channel-2)]);
            for(let index=0;index<512;index++){
              if(!written.has(index)&&frame[index]!==77){
                failures.push('Aladdin MOSAIC frame write changed an unrelated channel: '+fixture.id);
                break;
              }
            }
            for(const requirement of mode.requiredChannels||[]){
              if(frame[fixtureStart+requirement.channel-2]!==requirement.value){
                failures.push('Aladdin MOSAIC frame requirement was not applied: '+fixture.id);
              }
            }
          }
          if(codec.controlToDmx(control,control.min-100)!==0||codec.controlToDmx(control,control.max+100)!==255){
            failures.push('Aladdin MOSAIC input clamping failed: '+fixture.id+' / '+control.key);
          }
        }
      }
    }
  }
}

// ALL-IN ONE/TWO: model-specific manuals dated 2024-02-05, technical specifications (printed p. 5).
// Requires optional ALL-DMXAT attachment or ALL-WDIM controller. Do not reuse ALL-IN COLOR / MOSAIC modes.
const allInDmxWidths=[['2ch White Bi-Color (optional DMX)',2],['3ch RGB (optional DMX)',3]];
for(const [id,sourceUrl] of [
  ['aladdin-all-in-one','https://aladdin-lights.com/wp-content/uploads/2024/02/ALL-IN-ONE-Manual-corrected-version-05.02.2024.pdf'],
  ['aladdin-all-in-two','https://aladdin-lights.com/wp-content/uploads/2024/02/ALL-IN-TWO-Manual-corrected-version-05.02.2024.pdf']
]){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==allInDmxWidths.length){
    failures.push('Missing or unexpected Aladdin ALL-IN DMX mode set: '+id);
    continue;
  }
  if(!Array.isArray(fixture.control)||!fixture.control.includes('Optional DMX512')){
    failures.push('Aladdin ALL-IN must retain the optional DMX hardware requirement: '+id);
  }
  for(const [name,channels] of allInDmxWidths){
    const matches=fixture.dmxModes.filter(mode=>mode?.name===name);
    const mode=matches[0];
    if(matches.length!==1||mode?.channels!==channels||mode?.verified!==true||mode?.sourceUrl!==sourceUrl){
      failures.push('Incorrect verified Aladdin ALL-IN DMX width/source: '+id+' / '+name);
    }
    for(const key of ['controls','requiredChannels']){
      if(mode?.[key]!=null&&(!Array.isArray(mode[key])||mode[key].length)){
        failures.push('Aladdin ALL-IN DMX mapping must remain width-only in this pass: '+id+' / '+name+' / '+key);
      }
    }
  }
  for(const accessoryId of ['aladdin-all-wdim','aladdin-all-dmxat']){
    const accessory=accessories.find(item=>item.id===accessoryId);
    if(!Array.isArray(accessory?.compatibleWith)||!accessory.compatibleWith.includes(id)){
      failures.push('Missing Aladdin ALL-IN optional DMX accessory link: '+id+' / '+accessoryId);
    }
  }
}

const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'Aladdin',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,failures:unique},null,2));
if(unique.length) process.exit(1);
