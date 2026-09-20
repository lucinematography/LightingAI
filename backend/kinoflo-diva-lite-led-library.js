// Kino Flo Diva-Lite LED family.
// Sources: official Kino Flo product pages and archive downloads.
const D2030='https://kinoflo.com/diva-lite-20-30-led/';
const D21='https://kinoflo.com/diva-lite-21-led/';
const D31='https://kinoflo.com/diva-lite-31-led/';
const D41='https://kinoflo.com/diva-lite-41-led/';
const TRUE_MATCH_5_DMX_SRC='https://kinoflo.com/wp-content/uploads/2022/07/True-Match-Firmware-5.0-RDM-DMX-Personalities-May-2021.pdf';
const TRUE_MATCH_5_DMX_MODES=[
  {name:'P1 CCT 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P2 GEL 8-bit',channels:6,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P3 RGB 8-bit',channels:6,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P4 FX 8-bit',channels:8,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P5 CIE xy 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P6 CCT 16-bit',channels:4,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P7 GEL 16-bit',channels:7,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P8 RGB 16-bit',channels:7,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P9 FX 16-bit',channels:9,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P10 CIE xy 16-bit',channels:4,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P11 CCT 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P12 CCT 16-bit',channels:5,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P13 Gel 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P14 Gel 16-bit',channels:5,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P15 HS 8-bit',channels:4,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P16 HS 16-bit',channels:8,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P17 RGB 8-bit',channels:5,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P18 RGB 16-bit',channels:10,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P19 CIE xy 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P20 CIE xy 16-bit',channels:6,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P21 FX 8-bit',channels:8,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P22 FX 16-bit',channels:10,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P23 CCT & HS 8-bit',channels:7,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P24 CCT & HS 16-bit',channels:13,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P25 CCT & RGB 8-bit',channels:8,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P26 CCT & RGB 16-bit',channels:15,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P27 xy1 & xy2 8-bit',channels:6,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P28 xy1 & xy2 16-bit',channels:12,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P29 CCT & TDRGB 8-bit',channels:9,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC},
  {name:'P30 CCT & TDRGB 16-bit',channels:15,verified:true,sourceUrl:TRUE_MATCH_5_DMX_SRC}
];

function fixture(id,model,sourceUrl){
  return {
    id,manufacturer:'Kino Flo',model,family:'Diva-Lite LED',category:'Light',
    sourceType:'LED Softlight',status:'Legacy / Archive',sourceUrl,
    control:['Onboard','DMX512','LumenRadio wireless DMX'],
    dmxModes:TRUE_MATCH_5_DMX_MODES.map((mode)=>({...mode}))
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family:'Diva-Lite LED',category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_DIVA_LITE_LED_FIXTURES=[
  fixture('kinoflo-diva-lite-20-led','Diva-Lite 20 LED DMX',D2030),
  fixture('kinoflo-diva-lite-30-led','Diva-Lite 30 LED DMX',D2030),
  fixture('kinoflo-diva-lite-21-led','Diva-Lite 21 LED DMX',D21),
  fixture('kinoflo-diva-lite-31-led','Diva-Lite 31 LED DMX',D31),
  fixture('kinoflo-diva-lite-41-led','Diva-Lite 41 LED DMX',D41)
];

export const KINOFLO_DIVA_LITE_LED_ACCESSORIES=[
  acc('kinoflo-diva20-snapbag','Diva-Lite 20 SnapBag w/ 2 x Diffusion','Diffusion',['kinoflo-diva-lite-20-led'],D2030,'Softens and enlarges the apparent source.',{orderCode:'DFS-FS21-S'}),
  acc('kinoflo-diva20-snapgrid-40','Diva-Lite 20 SnapGrid 40 deg','Grid',['kinoflo-diva-lite-20-led'],D2030,'Controls spill and narrows off-axis output.',{orderCode:'LVR-FS240-S'}),
  acc('kinoflo-diva30-snapbag','Diva-Lite 30 SnapBag w/ 2 x Diffusion','Diffusion',['kinoflo-diva-lite-30-led'],D2030,'Softens and enlarges the apparent source.',{orderCode:'DFS-FS31-S'}),
  acc('kinoflo-diva30-snapgrid-40','Diva-Lite 30 SnapGrid 40 deg','Grid',['kinoflo-diva-lite-30-led'],D2030,'Controls spill and narrows off-axis output.',{orderCode:'LVR-FS340-S'}),
  acc('kinoflo-diva21-louver','Diva-Lite 21 Louver','Grid',['kinoflo-diva-lite-21-led'],D21,'Controls spill from the fixture face.'),
  acc('kinoflo-diva31-louver','Diva-Lite 31 Louver','Grid',['kinoflo-diva-lite-31-led'],D31,'Controls spill from the fixture face.'),
  acc('kinoflo-diva41-snapbag','Diva-Lite 41 SnapBag w/ 2 x Diffusion','Diffusion',['kinoflo-diva-lite-41-led'],D41,'Softens and enlarges the apparent source.',{orderCode:'DFS-FS41-S'}),
  acc('kinoflo-diva41-snapgrid-40','Diva-Lite 41 SnapGrid 40 deg','Grid',['kinoflo-diva-lite-41-led'],D41,'Controls spill and narrows off-axis output.',{orderCode:'LVR-FS440-S'}),
  acc('kinoflo-diva41-barndoors','Diva-Lite 41 Barndoors (Set of 2)','Barn Doors',['kinoflo-diva-lite-41-led'],D41,'Shapes and cuts the softlight beam.',{orderCode:'BRD-D41'})
];
