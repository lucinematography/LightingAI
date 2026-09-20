import { buildRuntimeCatalog } from './catalog-runtime.js';

const catalog=buildRuntimeCatalog();
const fixtures=catalog.fixtures.filter(x=>x.manufacturer==='Kino Flo');
const accessories=catalog.accessories.filter(x=>x.manufacturer==='Kino Flo');
const expected=[
  'kinoflo-celeb-ikon-6',
  'kinoflo-celeb-ikon-12',
  'kinoflo-diva-lux-4',
  'kinoflo-mimik-120',
  'kinoflo-freestyle-air-mini',
  'kinoflo-freestyle-air',
  'kinoflo-freestyle-air-max',
  'kinoflo-celeb-250-led-dmx',
  'kinoflo-celeb-450-led-dmx',
  'kinoflo-celeb-450q-led-dmx',
  'kinoflo-celeb-850-led-dmx',
  'kinoflo-diva-lite-20-led',
  'kinoflo-diva-lite-30-led',
  'kinoflo-diva-lite-21-led',
  'kinoflo-diva-lite-31-led',
  'kinoflo-diva-lite-41-led',
  'kinoflo-image-l40-led',
  'kinoflo-image-l80-led',
  'kinoflo-select-led-20',
  'kinoflo-select-led-30',
  'kinoflo-2ft-4bank',
  'kinoflo-4ft-4bank',
  'kinoflo-tegra-4bank-dmx',
  'kinoflo-parabeam-200-dmx',
  'kinoflo-parabeam-210-dmx',
  'kinoflo-parabeam-400-dmx',
  'kinoflo-parabeam-410-dmx',
  'kinoflo-parazip-200-dmx',
  'kinoflo-parazip-215-dmx',
  'kinoflo-parazip-400-dmx',
  'kinoflo-parazip-415-dmx',
  'kinoflo-vistabeam-300-dmx',
  'kinoflo-vistabeam-600-dmx',
  'kinoflo-wall-o-lite-dmx',
  'kinoflo-diva-lite-201',
  'kinoflo-diva-lite-400',
  'kinoflo-diva-lite-401',
  'kinoflo-diva-lite-415',
  'kinoflo-barfly-100',
  'kinoflo-barfly-200',
  'kinoflo-barfly-400',
  'kinoflo-barfly-450-dmx',
  'kinoflo-imara-s6-dmx',
  'kinoflo-imara-s10-dmx',
  'kinoflo-imara-s60-dmx',
  'kinoflo-imara-s100-dmx',
  'kinoflo-micro-flo-100mm',
  'kinoflo-micro-flo-150mm',
  'kinoflo-mini-flo-9',
  'kinoflo-mini-flo-12',
  'kinoflo-blanket-lite-6x6',
  'kinoflo-flathead-80',
  'kinoflo-image-47-dmx',
  'kinoflo-image-87-dmx'
];
const ids=new Set(fixtures.map(x=>x.id));
const failures=[];

const fixtureIdCounts=new Map();
const accessoryIdCounts=new Map();
for(const f of fixtures) fixtureIdCounts.set(f.id,(fixtureIdCounts.get(f.id)||0)+1);
for(const a of accessories) accessoryIdCounts.set(a.id,(accessoryIdCounts.get(a.id)||0)+1);
for(const [id,count] of fixtureIdCounts) if(count!==1) failures.push('Duplicate Kino Flo fixture id: '+id);
for(const [id,count] of accessoryIdCounts) if(count!==1) failures.push('Duplicate Kino Flo accessory id: '+id);
if(fixtures.length!==expected.length) failures.push('Unexpected Kino Flo fixture count: '+fixtures.length+' expected '+expected.length);
for(const id of expected) if(!ids.has(id)) failures.push('Missing required Kino Flo fixture: '+id);
for(const f of fixtures){
  if(!f.id||!f.model||!f.family) failures.push('Incomplete Kino Flo fixture identity: '+(f.id||'(missing id)'));
  if(f.manufacturer!=='Kino Flo') failures.push('Unexpected Kino Flo manufacturer label: '+f.id);
  if(!/^https:\/\/(?:www\.)?kinoflo\.com\//i.test(f.sourceUrl||'')) failures.push('Non-official Kino Flo fixture source: '+f.id);
  const direct=accessories.filter(a=>(a.compatibleWith||[]).includes(f.id));
  if(!direct.length) failures.push('No directly linked Kino Flo accessory: '+f.id);
}
for(const a of accessories){
  if(!a.id||!a.model||!a.family) failures.push('Incomplete Kino Flo accessory identity: '+(a.id||'(missing id)'));
  if(a.manufacturer!=='Kino Flo') failures.push('Unexpected Kino Flo accessory manufacturer label: '+a.id);
  if(!/^https:\/\/(?:www\.)?kinoflo\.com\//i.test(a.sourceUrl||'')) failures.push('Non-official Kino Flo accessory source: '+a.id);
  if(!(a.compatibleWith||[]).length) failures.push('Kino Flo accessory without compatibility targets: '+a.id);
}
for(const broken of catalog.integrity?.missingAccessoryFixtureIds||[]){
  if(String(broken.accessoryId||'').startsWith('kinoflo-')) failures.push('Broken Kino Flo compatibility link: '+broken.accessoryId+' -> '+broken.fixtureId);
}

// Celeb 250/450/450Q/850 True Match 5.0 RDM: official Kino Flo protocol lists P1-P30 and exact footprint widths.
// This pass intentionally locks widths only; channel functions remain unmodeled until a separate mapping review.
const celebTrueMatch5Source='https://kinoflo.com/wp-content/uploads/2022/07/True-Match-Firmware-5.0-RDM-DMX-Personalities-May-2021.pdf';
const celebTrueMatch5Widths=[
  ['P1 CCT 8-bit',3],
  ['P2 GEL 8-bit',6],
  ['P3 RGB 8-bit',6],
  ['P4 FX 8-bit',8],
  ['P5 CIE xy 8-bit',3],
  ['P6 CCT 16-bit',4],
  ['P7 GEL 16-bit',7],
  ['P8 RGB 16-bit',7],
  ['P9 FX 16-bit',9],
  ['P10 CIE xy 16-bit',4],
  ['P11 CCT 8-bit',3],
  ['P12 CCT 16-bit',5],
  ['P13 Gel 8-bit',3],
  ['P14 Gel 16-bit',5],
  ['P15 HS 8-bit',4],
  ['P16 HS 16-bit',8],
  ['P17 RGB 8-bit',5],
  ['P18 RGB 16-bit',10],
  ['P19 CIE xy 8-bit',3],
  ['P20 CIE xy 16-bit',6],
  ['P21 FX 8-bit',8],
  ['P22 FX 16-bit',10],
  ['P23 CCT & HS 8-bit',7],
  ['P24 CCT & HS 16-bit',13],
  ['P25 CCT & RGB 8-bit',8],
  ['P26 CCT & RGB 16-bit',15],
  ['P27 xy1 & xy2 8-bit',6],
  ['P28 xy1 & xy2 16-bit',12],
  ['P29 CCT & TDRGB 8-bit',9],
  ['P30 CCT & TDRGB 16-bit',15]
];
for(const id of ["kinoflo-celeb-250-led-dmx","kinoflo-celeb-450-led-dmx","kinoflo-celeb-450q-led-dmx","kinoflo-celeb-850-led-dmx"]){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||!Array.isArray(fixture.dmxModes)){
    failures.push('Missing Kino Flo Celeb True Match 5.0 DMX modes: '+id);
    continue;
  }
  if(fixture.dmxModes.length!==celebTrueMatch5Widths.length){
    failures.push('Unexpected Kino Flo Celeb True Match 5.0 mode count: '+id);
  }
  for(const [name,channels] of celebTrueMatch5Widths){
    const matches=fixture.dmxModes.filter(mode=>mode?.name===name);
    const mode=matches[0];
    if(matches.length!==1||mode?.channels!==channels||mode?.verified!==true||mode?.sourceUrl!==celebTrueMatch5Source){
      failures.push('Incorrect verified Kino Flo Celeb DMX width/source: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo Celeb channel mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Diva-Lite 20/30/21/31/41 True Match 5.0 RDM: official Kino Flo protocol lists P1-P30 and exact footprint widths.
// Width-only pass; channel functions remain intentionally unmodeled here.
const divaTrueMatch5Source='https://kinoflo.com/wp-content/uploads/2022/07/True-Match-Firmware-5.0-RDM-DMX-Personalities-May-2021.pdf';
const divaTrueMatch5Widths=[
  ['P1 CCT 8-bit',3],
  ['P2 GEL 8-bit',6],
  ['P3 RGB 8-bit',6],
  ['P4 FX 8-bit',8],
  ['P5 CIE xy 8-bit',3],
  ['P6 CCT 16-bit',4],
  ['P7 GEL 16-bit',7],
  ['P8 RGB 16-bit',7],
  ['P9 FX 16-bit',9],
  ['P10 CIE xy 16-bit',4],
  ['P11 CCT 8-bit',3],
  ['P12 CCT 16-bit',5],
  ['P13 Gel 8-bit',3],
  ['P14 Gel 16-bit',5],
  ['P15 HS 8-bit',4],
  ['P16 HS 16-bit',8],
  ['P17 RGB 8-bit',5],
  ['P18 RGB 16-bit',10],
  ['P19 CIE xy 8-bit',3],
  ['P20 CIE xy 16-bit',6],
  ['P21 FX 8-bit',8],
  ['P22 FX 16-bit',10],
  ['P23 CCT & HS 8-bit',7],
  ['P24 CCT & HS 16-bit',13],
  ['P25 CCT & RGB 8-bit',8],
  ['P26 CCT & RGB 16-bit',15],
  ['P27 xy1 & xy2 8-bit',6],
  ['P28 xy1 & xy2 16-bit',12],
  ['P29 CCT & TDRGB 8-bit',9],
  ['P30 CCT & TDRGB 16-bit',15]
];
for(const id of ["kinoflo-diva-lite-20-led","kinoflo-diva-lite-30-led","kinoflo-diva-lite-21-led","kinoflo-diva-lite-31-led","kinoflo-diva-lite-41-led"]){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||!Array.isArray(fixture.dmxModes)){
    failures.push('Missing Kino Flo Diva-Lite True Match 5.0 DMX modes: '+id);
    continue;
  }
  if(fixture.dmxModes.length!==divaTrueMatch5Widths.length){
    failures.push('Unexpected Kino Flo Diva-Lite True Match 5.0 mode count: '+id);
  }
  for(const [name,channels] of divaTrueMatch5Widths){
    const matches=fixture.dmxModes.filter(mode=>mode?.name===name);
    const mode=matches[0];
    if(matches.length!==1||mode?.channels!==channels||mode?.verified!==true||mode?.sourceUrl!==divaTrueMatch5Source){
      failures.push('Incorrect verified Kino Flo Diva-Lite DMX width/source: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo Diva-Lite channel mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Image L40/L80 True Match 5.0 RDM: official Kino Flo protocol lists both model IDs and P1-P30 widths.
// Width-only pass; channel functions remain intentionally unmodeled here.
const imageTrueMatch5Source='https://kinoflo.com/wp-content/uploads/2022/07/True-Match-Firmware-5.0-RDM-DMX-Personalities-May-2021.pdf';
const imageTrueMatch5Widths=[
  ['P1 CCT 8-bit',3],
  ['P2 GEL 8-bit',6],
  ['P3 RGB 8-bit',6],
  ['P4 FX 8-bit',8],
  ['P5 CIE xy 8-bit',3],
  ['P6 CCT 16-bit',4],
  ['P7 GEL 16-bit',7],
  ['P8 RGB 16-bit',7],
  ['P9 FX 16-bit',9],
  ['P10 CIE xy 16-bit',4],
  ['P11 CCT 8-bit',3],
  ['P12 CCT 16-bit',5],
  ['P13 Gel 8-bit',3],
  ['P14 Gel 16-bit',5],
  ['P15 HS 8-bit',4],
  ['P16 HS 16-bit',8],
  ['P17 RGB 8-bit',5],
  ['P18 RGB 16-bit',10],
  ['P19 CIE xy 8-bit',3],
  ['P20 CIE xy 16-bit',6],
  ['P21 FX 8-bit',8],
  ['P22 FX 16-bit',10],
  ['P23 CCT & HS 8-bit',7],
  ['P24 CCT & HS 16-bit',13],
  ['P25 CCT & RGB 8-bit',8],
  ['P26 CCT & RGB 16-bit',15],
  ['P27 xy1 & xy2 8-bit',6],
  ['P28 xy1 & xy2 16-bit',12],
  ['P29 CCT & TDRGB 8-bit',9],
  ['P30 CCT & TDRGB 16-bit',15]
];
for(const id of ["kinoflo-image-l40-led","kinoflo-image-l80-led"]){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||!Array.isArray(fixture.dmxModes)){
    failures.push('Missing Kino Flo Image LED True Match 5.0 DMX modes: '+id);
    continue;
  }
  if(fixture.dmxModes.length!==imageTrueMatch5Widths.length){
    failures.push('Unexpected Kino Flo Image LED True Match 5.0 mode count: '+id);
  }
  for(const [name,channels] of imageTrueMatch5Widths){
    const matches=fixture.dmxModes.filter(mode=>mode?.name===name);
    const mode=matches[0];
    if(matches.length!==1||mode?.channels!==channels||mode?.verified!==true||mode?.sourceUrl!==imageTrueMatch5Source){
      failures.push('Incorrect verified Kino Flo Image LED DMX width/source: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo Image LED channel mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Select LED 20/30 use the LED-150X controller; Kino Flo's current True Match page assigns Select controllers to 6.0 DFS.
// The official 6.0 RDM document lists LED-150X and exact P1-P30 footprint widths.
const selectTm6Source='https://kinoflo.com/wp-content/uploads/2025/07/TrueMatch-Firmware-6.0-RDM-DMX-Personalities-June-2025-Rev-E.pdf';
const selectTm6Manual='https://kinoflo.com/wp-content/uploads/2022/08/3100088-Rev-A-Select-150X-LED-Controller-04-07-2016-1.pdf';
const selectTm6Widths=[
  ['TM6 P1 CCT 8-bit',3],
  ['TM6 P2 CCT/Gel/HS 8-bit',6],
  ['TM6 P3 CCT/RGB 8-bit',6],
  ['TM6 P4 CCT 8-bit',3],
  ['TM6 P5 CIE xy 8-bit',3],
  ['TM6 P6 CCT 16-bit',4],
  ['TM6 P7 CCT/Gel/HS 16-bit',7],
  ['TM6 P8 CCT/RGB 16-bit',7],
  ['TM6 P9 CCT 16-bit',4],
  ['TM6 P10 CIE xy 16-bit',4],
  ['TM6 P11 CCT 8-bit',3],
  ['TM6 P12 CCT 16-bit',5],
  ['TM6 P13 Gel 8-bit',3],
  ['TM6 P14 Gel 16-bit',5],
  ['TM6 P15 HS 8-bit',4],
  ['TM6 P16 HS 16-bit',8],
  ['TM6 P17 RGB 8-bit',5],
  ['TM6 P18 RGB 16-bit',10],
  ['TM6 P19 CIE xy 8-bit',3],
  ['TM6 P20 CIE xy 16-bit',6],
  ['TM6 P21 CCT 8-bit',3],
  ['TM6 P22 CCT 16-bit',5],
  ['TM6 P23 xfade CCT & HS 8-bit',7],
  ['TM6 P24 xfade CCT & HS 16-bit',13],
  ['TM6 P25 xfade CCT & RGB 8-bit',8],
  ['TM6 P26 xfade CCT & RGB 16-bit',15],
  ['TM6 P27 xfade CIE xy1 & xy2 8-bit',6],
  ['TM6 P28 xfade CIE xy1 & xy2 16-bit',12],
  ['TM6 P29 xfade CCT & TDRGB 8-bit',9],
  ['TM6 P30 xfade CCT & TDRGB 16-bit',15]
];
for(const id of ["kinoflo-select-led-20","kinoflo-select-led-30"]){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||fixture.dmxControllerModel!=='LED-150X'||fixture.dmxFirmware!=='True Match 6.0 DFS'||
     fixture.dmxApplicabilitySourceUrl!==selectTm6Manual||!Array.isArray(fixture.dmxModes)){
    failures.push('Missing Kino Flo Select 20/30 LED-150X True Match 6.0 metadata: '+id);
    continue;
  }
  if(fixture.dmxModes.length!==selectTm6Widths.length){
    failures.push('Unexpected Kino Flo Select True Match 6.0 mode count: '+id);
  }
  for(const [name,channels] of selectTm6Widths){
    const matches=fixture.dmxModes.filter(mode=>mode?.name===name);
    const mode=matches[0];
    if(matches.length!==1||mode?.channels!==channels||mode?.verified!==true||mode?.sourceUrl!==selectTm6Source){
      failures.push('Incorrect verified Kino Flo Select TM6 DMX width/source: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo Select TM6 channel mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// FreeStyle Air Mini/Air/Max use LED-140X; Kino Flo assigns FreeStyle LED Controllers to True Match 6.0 DFS.
// The official 6.0 RDM document lists LED-140X and exact P1-P30 footprint widths.
const freeStyleAirTm6Source='https://kinoflo.com/wp-content/uploads/2025/07/TrueMatch-Firmware-6.0-RDM-DMX-Personalities-June-2025-Rev-E.pdf';
const freeStyleAirTm6Widths=[
  ['TM6 P1 CCT 8-bit',3],
  ['TM6 P2 CCT/Gel/HS 8-bit',6],
  ['TM6 P3 CCT/RGB 8-bit',6],
  ['TM6 P4 CCT 8-bit',3],
  ['TM6 P5 CIE xy 8-bit',3],
  ['TM6 P6 CCT 16-bit',4],
  ['TM6 P7 CCT/Gel/HS 16-bit',7],
  ['TM6 P8 CCT/RGB 16-bit',7],
  ['TM6 P9 CCT 16-bit',4],
  ['TM6 P10 CIE xy 16-bit',4],
  ['TM6 P11 CCT 8-bit',3],
  ['TM6 P12 CCT 16-bit',5],
  ['TM6 P13 Gel 8-bit',3],
  ['TM6 P14 Gel 16-bit',5],
  ['TM6 P15 HS 8-bit',4],
  ['TM6 P16 HS 16-bit',8],
  ['TM6 P17 RGB 8-bit',5],
  ['TM6 P18 RGB 16-bit',10],
  ['TM6 P19 CIE xy 8-bit',3],
  ['TM6 P20 CIE xy 16-bit',6],
  ['TM6 P21 CCT 8-bit',3],
  ['TM6 P22 CCT 16-bit',5],
  ['TM6 P23 xfade CCT & HS 8-bit',7],
  ['TM6 P24 xfade CCT & HS 16-bit',13],
  ['TM6 P25 xfade CCT & RGB 8-bit',8],
  ['TM6 P26 xfade CCT & RGB 16-bit',15],
  ['TM6 P27 xfade CIE xy1 & xy2 8-bit',6],
  ['TM6 P28 xfade CIE xy1 & xy2 16-bit',12],
  ['TM6 P29 xfade CCT & TDRGB 8-bit',9],
  ['TM6 P30 xfade CCT & TDRGB 16-bit',15]
];
for(const id of ["kinoflo-freestyle-air-mini","kinoflo-freestyle-air","kinoflo-freestyle-air-max"]){
  const fixture=fixtures.find(item=>item.id===id);
  if(!fixture||fixture.dmxControllerModel!=='LED-140X'||fixture.dmxFirmware!=='True Match 6.0 DFS'||!Array.isArray(fixture.dmxModes)){
    failures.push('Missing Kino Flo FreeStyle Air LED-140X True Match 6.0 metadata: '+id);
    continue;
  }
  if(fixture.dmxModes.length!==freeStyleAirTm6Widths.length){
    failures.push('Unexpected Kino Flo FreeStyle Air True Match 6.0 mode count: '+id);
  }
  for(const [name,channels] of freeStyleAirTm6Widths){
    const matches=fixture.dmxModes.filter(mode=>mode?.name===name);
    const mode=matches[0];
    if(matches.length!==1||mode?.channels!==channels||mode?.verified!==true||mode?.sourceUrl!==freeStyleAirTm6Source){
      failures.push('Incorrect verified Kino Flo FreeStyle Air TM6 DMX width/source: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo FreeStyle Air TM6 channel mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}

const unique=[...new Set(failures)];
console.log(JSON.stringify({ok:unique.length===0,manufacturer:'Kino Flo',fixtureCount:fixtures.length,accessoryCount:accessories.length,requiredFixtures:expected.length,finalAudit:true,failures:unique},null,2));
if(unique.length) process.exit(1);
