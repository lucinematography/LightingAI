import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='De Sisti');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='De Sisti');
const fixtureIds=new Set(fixtures.map(x=>x.id));
const expected=[
  'desisti-super-led-f47-t','desisti-super-led-f47-d','desisti-super-led-f47-vw','desisti-super-led-f47-vwc',
  'desisti-super-led-f6-t','desisti-super-led-f6-d','desisti-super-led-f6-vw',
  'desisti-super-led-f7-t','desisti-super-led-f7-d','desisti-super-led-f7-vw','desisti-super-led-f7-vwc',
  'desisti-super-led-f10-t','desisti-super-led-f10-d','desisti-super-led-f10-vw','desisti-super-led-f10-vwc',
  'desisti-super-led-f10hp-t','desisti-super-led-f10hp-d','desisti-super-led-f10hp-vw',
  'desisti-super-led-f10shp-t','desisti-super-led-f10shp-d','desisti-super-led-f10shp-vw',
  'desisti-super-led-f14-t','desisti-super-led-f14-d',
  'desisti-super-led-f14hp-t','desisti-super-led-f14hp-d','desisti-super-led-f14hp-vw',
  'desisti-super-led-f20-t','desisti-super-led-f20-d',
  'desisti-piccoletto-f-t','desisti-piccoletto-f-d','desisti-piccoletto-fa-t','desisti-piccoletto-fa-d',
  'desisti-piccoletto-dim-t','desisti-piccoletto-dim-d','desisti-piccoletto-vw','desisti-piccoletto-c',
  'desisti-softled-1-t','desisti-softled-1-d','desisti-softled-1-vw',
  'desisti-softled-2-t','desisti-softled-2-d','desisti-softled-2-vw',
  'desisti-softled-4-t','desisti-softled-4-d','desisti-softled-4-vw',
  'desisti-softled-8-t','desisti-softled-8-d','desisti-softled-8-vw',
  'desisti-softled-1xl-vw','desisti-softled-2xl-t','desisti-softled-2xl-d','desisti-softled-2xl-vw',
  'desisti-softled-8xl-t','desisti-softled-8xl-d','desisti-softled-8xl-vw',
  'desisti-giotto-linear-vw','desisti-giotto-linear-vwc','desisti-galileo-softnel','desisti-spacelight-vw',
  'desisti-f47-lite-t','desisti-f47-lite-d','desisti-f47-lite-vw',
  'desisti-f6-lite-t','desisti-f6-lite-d','desisti-f6-lite-vw',
  'desisti-softled-1-lite-t','desisti-softled-1-lite-d','desisti-softled-1-lite-vw','desisti-softled-1-lite-vwrgb',
  'desisti-softled-2-lite-t','desisti-softled-2-lite-d','desisti-softled-2-lite-vw',
  'desisti-softled-4-vwc','desisti-softled-8-vwc','desisti-softled-12-vwc','desisti-softled-2xl-vwc','desisti-softled-8xl-vwc',
  'desisti-muse-melpomene','desisti-muse-tersicore','desisti-muse-clio','desisti-muse-clio-medium',
  'desisti-muse-polymnia','desisti-muse-erato','desisti-muse-euterpe','desisti-muse-talia',
  'desisti-muse-aurea','desisti-muse-aurea-small',
  'desisti-magis-300','desisti-magis-500','desisti-magis-650','desisti-leonardo-1kw','desisti-leonardo-2kw','desisti-leonardo-multipower','desisti-leonardo-5kw','desisti-leonardo-piccolo-10-12kw','desisti-super-leo-10-12kw','desisti-super-leo-20-24kw',
  'desisti-botticelli-1kw','desisti-botticelli-2kw','desisti-botticelli-5kw','desisti-renoir-300','desisti-renoir-500','desisti-renoir-650','desisti-renoir-2kw','desisti-renoir-5kw',
  'desisti-goya-400w','desisti-goya-575w','desisti-goya-1200w','desisti-goya-2-5-4kw','desisti-goya-6-12kw','desisti-giotto-mk2-tungsten',
  'desisti-rembrandt-200w-mk2','desisti-rembrandt-575w-mk2','desisti-rembrandt-piccolo-1200w','desisti-rembrandt-1-2-2-5kw','desisti-rembrandt-2-5-4kw','desisti-rembrandt-piccolo-6kw','desisti-rembrandt-piccolo-6-12kw-mk2','desisti-rembrandt-12-18kw-mk2',
  'desisti-remington-575w','desisti-remington-1200w','desisti-remington-2-5-4kw','desisti-remington-6kw','desisti-remington-6-12kw'
];

const failures=[];
for(const id of expected) if(!fixtureIds.has(id)) failures.push('Missing required De Sisti fixture: '+id);
if(fixtures.length<expected.length) failures.push('De Sisti fixture count below locked baseline: '+fixtures.length+' < '+expected.length);
if(accessories.length<175) failures.push('De Sisti accessory count below locked baseline: '+accessories.length+' < 175');

for(const f of fixtures){
  if(!/^https:\/\/(?:www\.)?desisti\.it\//i.test(f.sourceUrl||'')) failures.push('Non-official De Sisti fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked De Sisti accessory: '+f.id);
}
for(const a of accessories){
  if(!/^https:\/\/(?:www\.)?desisti\.it\//i.test(a.sourceUrl||'')) failures.push('Non-official De Sisti accessory source: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('desisti-')) failures.push('Broken De Sisti compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}

// Each model's official datasheet, page 3, documents widths but not channel order.
// Keep the existing application mode names; do not infer individual controls.
const remainingMusesSources=[
  ['desisti-muse-euterpe','https://www.desisti.it/wp/wp-content/uploads/2022/07/Euterpe-DS.pdf'],
  ['desisti-muse-talia','https://www.desisti.it/wp/wp-content/uploads/2022/06/Talia-DS.pdf'],
  ['desisti-muse-aurea','https://www.desisti.it/wp/wp-content/uploads/2022/06/Aurea-DS.pdf'],
  ['desisti-muse-aurea-small','https://www.desisti.it/wp/wp-content/uploads/2022/06/Aurea-Small.pdf']
];
const remainingMusesWidths=[
  ['Simple 8-bit',2],['Simple 16-bit',3],
  ['8-bit base',7],['8-bit with mode/fan',9],['8-bit extended',39],
  ['16-bit base',8],['16-bit with mode/fan',10],['16-bit extended',40]
];
for(const [id,sourceUrl] of remainingMusesSources){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture){
    failures.push('Missing verified Muses DMX fixture: '+id);
    continue;
  }
  if(!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==remainingMusesWidths.length){
    failures.push('Unexpected verified Muses DMX mode count: '+id);
  }
  for(const [name,channels] of remainingMusesWidths){
    const mode=fixture.dmxModes?.find(item=>item.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true){
      failures.push('Missing verified Muses DMX width: '+id+' / '+name+' / '+channels+'ch');
    }
    if(mode?.sourceUrl!==sourceUrl){
      failures.push('Incorrect model-specific Muses DMX source: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Muses DMX controls and required values must remain hidden until channel order is sourced: '+id+' / '+name);
    }
  }
}

// LITE Vari-White: verify only the model-specific 2ch/3ch DMX footprints.
const liteVwSources=[
  ['desisti-f47-lite-vw','https://www.desisti.it/wp/wp-content/uploads/2026/04/FRESNEL-LED-F4.7-Lite-VW-04-26-.pdf'],
  ['desisti-f6-lite-vw','https://www.desisti.it/wp/wp-content/uploads/2026/04/FRESNEL-LED-F6-Lite-VW-04-26-.pdf'],
  ['desisti-softled-1-lite-vw','https://www.desisti.it/wp/wp-content/uploads/2026/04/SOFTLED-1Lite-VW-020426.pdf'],
  ['desisti-softled-2-lite-vw','https://www.desisti.it/wp/wp-content/uploads/2024/02/SOFTLED-2Lite-VW-02224.pdf']
];
const liteVwWidths=[['8-bit Vari-White',2],['16-bit Vari-White',3]];
for(const [id,sourceUrl] of liteVwSources){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||!Array.isArray(fixture.dmxModes)){
    failures.push('Missing LITE Vari-White DMX modes: '+id);
    continue;
  }
  if(fixture.dmxModes.length!==liteVwWidths.length){
    failures.push('Unexpected LITE Vari-White DMX mode count: '+id);
  }
  for(const [name,channels] of liteVwWidths){
    const matches=fixture.dmxModes.filter(item=>item?.name===name);
    const mode=matches[0];
    if(matches.length!==1||mode.channels!==channels||mode.verified!==true){
      failures.push('Incorrect verified LITE Vari-White DMX width: '+id+' / '+name);
    }
    if(mode?.sourceUrl!==sourceUrl){
      failures.push('Incorrect model-specific LITE Vari-White DMX source: '+id+' / '+name);
    }
    for(const key of ['controls','requiredChannels']){
      if(mode?.[key]!=null&&(!Array.isArray(mode[key])||mode[key].length)){
        failures.push('LITE Vari-White channel controls and required values need a sourced channel map: '+id+' / '+name+' / '+key);
      }
    }
  }
}
// The RGB datasheet provides only a 2-20 channel range, not exact personalities.
const liteRgb=fixtures.find(item=>item.id==='desisti-softled-1-lite-vwrgb');
if(liteRgb?.dmxModes?.some(mode=>mode.verified===true||mode.controls?.length||mode.requiredChannels?.length)){
  failures.push('Soft LED 1 Lite VW+RGB exact DMX modes must remain unverified until a channel map is sourced');
}

// F4.7 Lite T/D: only the documented one-channel 8-bit dimmer may be controlled.
const f47LiteDimmerSource='https://www.desisti.it/wp/wp-content/uploads/2026/04/FRESNEL-LED-F4.7-Lite-D-T-0426.pdf';
for(const id of ['desisti-f47-lite-t','desisti-f47-lite-d']){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||!Array.isArray(fixture.dmxModes)){
    failures.push('Missing F4.7 Lite fixed-white DMX modes: '+id);
    continue;
  }
  if(fixture.dmxModes.length!==2){
    failures.push('Unexpected F4.7 Lite fixed-white DMX mode count: '+id);
  }
  const modes8=fixture.dmxModes.filter(mode=>mode?.name==='8-bit dimmer');
  const modes16=fixture.dmxModes.filter(mode=>mode?.name==='16-bit dimmer');
  const mode8=modes8[0],mode16=modes16[0];
  if(modes8.length!==1||mode8?.channels!==1||mode8?.verified!==true||mode8?.sourceUrl!==f47LiteDimmerSource){
    failures.push('Incorrect verified F4.7 Lite 8-bit dimmer mode/source: '+id);
  }
  const dimmer=Array.isArray(mode8?.controls)?mode8.controls[0]:null;
  if(!Array.isArray(mode8?.controls)||mode8.controls.length!==1||
     dimmer?.key!=='dimmer'||dimmer?.label!=='Dimmer'||dimmer?.channel!==1||dimmer?.type!=='percent'||
     dimmer?.bits!==8||dimmer?.min!==0||dimmer?.max!==100||dimmer?.dmxMin!==0||dimmer?.dmxMax!==255){
    failures.push('F4.7 Lite requires exactly one CH1 8-bit 0-100% dimmer: '+id);
  }
  if(modes16.length!==1||mode16?.channels!==2||mode16?.verified===true){
    failures.push('F4.7 Lite 16-bit mode must remain unverified until coarse/fine order is sourced: '+id);
  }
  for(const [mode,keys] of [[mode8,['requiredChannels']],[mode16,['controls','requiredChannels']]]){
    for(const key of keys){
      if(mode?.[key]!=null&&(!Array.isArray(mode[key])||mode[key].length)){
        failures.push('Unsourced F4.7 Lite DMX controls or required values: '+id+' / '+(mode?.name||'missing')+' / '+key);
      }
    }
  }
}

    


// Soft LED 2 Lite T/D: official datasheet confirms 1ch 8-bit and 2ch 16-bit footprints.
// Only the 8-bit CH1 dimmer control is sourced; 16-bit channel order stays hidden.
const s2LiteDimmerSource='https://www.desisti.it/wp/wp-content/uploads/2024/02/SOFTLED-2Lite-T-D-0224.pdf';
for(const id of ['desisti-softled-2-lite-t','desisti-softled-2-lite-d']){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||!Array.isArray(fixture.dmxModes)){
    failures.push('Missing Soft LED 2 Lite fixed-white DMX modes: '+id);
    continue;
  }
  if(fixture.dmxModes.length!==2){
    failures.push('Unexpected Soft LED 2 Lite fixed-white DMX mode count: '+id);
  }
  const mode8=fixture.dmxModes.find(mode=>mode?.name==='8-bit dimmer');
  const mode16=fixture.dmxModes.find(mode=>mode?.name==='16-bit dimmer');
  if(mode8?.channels!==1||mode8?.verified!==true||mode8?.sourceUrl!==s2LiteDimmerSource){
    failures.push('Incorrect verified Soft LED 2 Lite 8-bit dimmer mode/source: '+id);
  }
  if(mode16?.channels!==2||mode16?.verified!==true||mode16?.sourceUrl!==s2LiteDimmerSource){
    failures.push('Incorrect verified Soft LED 2 Lite 16-bit width/source: '+id);
  }
  for(const key of ['controls','requiredChannels']){
    if(mode16?.[key]!=null&&(!Array.isArray(mode16[key])||mode16[key].length)){
      failures.push('Soft LED 2 Lite 16-bit channel order must remain hidden until sourced: '+id+' / '+key);
    }
  }
}

// F6 Lite T/D: official datasheet confirms 1ch 8-bit and 2ch 16-bit footprints.
// Only the 8-bit CH1 dimmer control is sourced; 16-bit channel order stays hidden.
const f6LiteDimmerSource='https://www.desisti.it/wp/wp-content/uploads/2026/04/FRESNEL-LED-F6-Lite-D-T-0426.pdf';
for(const id of ['desisti-f6-lite-t','desisti-f6-lite-d']){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||!Array.isArray(fixture.dmxModes)){
    failures.push('Missing F6 Lite fixed-white DMX modes: '+id);
    continue;
  }
  if(fixture.dmxModes.length!==2){
    failures.push('Unexpected F6 Lite fixed-white DMX mode count: '+id);
  }
  const mode8=fixture.dmxModes.find(mode=>mode?.name==='8-bit dimmer');
  const mode16=fixture.dmxModes.find(mode=>mode?.name==='16-bit dimmer');
  if(mode8?.channels!==1||mode8?.verified!==true||mode8?.sourceUrl!==f6LiteDimmerSource){
    failures.push('Incorrect verified F6 Lite 8-bit dimmer mode/source: '+id);
  }
  if(mode16?.channels!==2||mode16?.verified!==true||mode16?.sourceUrl!==f6LiteDimmerSource){
    failures.push('Incorrect verified F6 Lite 16-bit width/source: '+id);
  }
  for(const key of ['controls','requiredChannels']){
    if(mode16?.[key]!=null&&(!Array.isArray(mode16[key])||mode16[key].length)){
      failures.push('F6 Lite 16-bit channel order must remain hidden until sourced: '+id+' / '+key);
    }
  }
}

// Galileo SoftNel: the official product page confirms only the 6ch 8-bit and 8ch 16-bit footprints.
// No channel-by-channel map is published here, so controls and required values must remain hidden.
const galileoSource='https://www.desisti.it/galileo-softnel/';
const galileo=fixtures.find(item=>item.id==='desisti-galileo-softnel');
const galileoWidths=[['8-bit',6],['16-bit',8]];
if(!galileo||!Array.isArray(galileo.dmxModes)){
  failures.push('Missing Galileo SoftNel DMX modes');
}else{
  if(galileo.dmxModes.length!==galileoWidths.length){
    failures.push('Unexpected Galileo SoftNel DMX mode count');
  }
  for(const [name,channels] of galileoWidths){
    const matches=galileo.dmxModes.filter(mode=>mode?.name===name);
    const mode=matches[0];
    if(matches.length!==1||mode?.channels!==channels||mode?.verified!==true){
      failures.push('Incorrect verified Galileo SoftNel DMX width: '+name+' / '+channels+'ch');
    }
    if(mode?.sourceUrl!==galileoSource){
      failures.push('Incorrect Galileo SoftNel DMX source: '+name);
    }
    for(const key of ['controls','requiredChannels']){
      if(mode?.[key]!=null&&(!Array.isArray(mode[key])||mode[key].length)){
        failures.push('Galileo SoftNel controls and required values must remain hidden until channel order is sourced: '+name+' / '+key);
      }
    }
  }
}

const unique=[...new Set(failures)];
console.log(JSON.stringify({
  ok:unique.length===0,
  manufacturer:'De Sisti',
  fixtureCount:fixtures.length,
  accessoryCount:accessories.length,
  lockedRequiredFixtures:expected.length,
  failures:unique
},null,2));
if(unique.length)process.exit(1);
