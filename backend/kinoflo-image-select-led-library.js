// Kino Flo Image LED + Select LED legacy studio family.
// Sources: official Kino Flo product pages and archive material.
const IMAGE40='https://kinoflo.com/image-l40-led/';
const IMAGE80='https://kinoflo.com/image-l80-led/';
const SELECT='https://kinoflo.com/select-led/';
const SELECT_ARCHIVE='https://kinoflo.com/wp-content/uploads/2022/08/Select-3020-LED-DMX-1.pdf';
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

function fixture(id,model,family,sourceUrl,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category:'Light',
    sourceType:'LED Studio Softlight',status:'Legacy / Archive',sourceUrl,...extra
  };
}
function acc(id,model,family,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_IMAGE_SELECT_FIXTURES=[
  fixture('kinoflo-image-l40-led','Image L40 LED','Image LED',IMAGE40,{
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',cri:96,tlci:96,
    tm30:{rf:95,rg:103},voltage:'100-240VAC',currentA120V:2,
    dimensionsCm:{width:137,height:43,depth:16.5},weightKg:11.5,
    control:['Onboard','DMX512','LumenRadio wireless DMX'],
    dimming:'Full-range onboard and DMX',
    dmxModes:TRUE_MATCH_5_DMX_MODES.map((mode)=>({...mode}))
  }),
  fixture('kinoflo-image-l80-led','Image L80 LED','Image LED',IMAGE80,{
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',
    voltage:'100-240VAC',currentA120V:4,
    dimensionsCm:{width:137,height:71,depth:16.5},weightKg:19,
    control:['Onboard','DMX512','LumenRadio wireless DMX'],
    dimming:'Full-range onboard and DMX',
    dmxModes:TRUE_MATCH_5_DMX_MODES.map((mode)=>({...mode}))
  }),
  fixture('kinoflo-select-led-20','Select LED 20','Select LED',SELECT,{
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',
    voltage:'100-240VAC or 24VDC',control:['Onboard','DMX512','LumenRadio wireless DMX'],
    archiveSourceUrl:SELECT_ARCHIVE,discontinued:'2018-03'
  }),
  fixture('kinoflo-select-led-30','Select LED 30','Select LED',SELECT,{
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',
    voltage:'100-240VAC or 24VDC',control:['Onboard','DMX512','LumenRadio wireless DMX'],
    archiveSourceUrl:SELECT_ARCHIVE,discontinued:'2018-03'
  })
];

export const KINOFLO_IMAGE_SELECT_ACCESSORIES=[
  acc('kinoflo-image-l40-gel-frame','Image L40 Gel Frame','Image LED','Filter Holder',['kinoflo-image-l40-led'],IMAGE40,'Holds gel or diffusion media.',{orderCode:'GFR-I40',included:true}),
  acc('kinoflo-image-l40-louver','Image L40 Louver Silver','Image LED','Grid',['kinoflo-image-l40-led'],IMAGE40,'Controls spill and reduces off-axis output.',{orderCode:'LVR-I40-S',included:true}),
  acc('kinoflo-image-l40-barndoors','Image L40 Barndoors','Image LED','Barn Doors',['kinoflo-image-l40-led'],IMAGE40,'Shapes and cuts the beam.',{orderCode:'BRD-I40'}),
  acc('kinoflo-image-l80-gel-frame','Image L80 Gel Frame','Image LED','Filter Holder',['kinoflo-image-l80-led'],IMAGE80,'Holds gel or diffusion media.',{orderCode:'GFR-I80',included:true}),
  acc('kinoflo-image-l80-louver','Image L80 Louver Silver','Image LED','Grid',['kinoflo-image-l80-led'],IMAGE80,'Controls spill and reduces off-axis output.',{orderCode:'LVR-I80-S',included:true}),
  acc('kinoflo-image-l80-snapgrid-40','Image L80 SnapGrid 40 deg','Image LED','Grid',['kinoflo-image-l80-led'],IMAGE80,'Narrows and controls the softlight field.',{orderCode:'LVR-CE840-S'}),
  acc('kinoflo-select20-controller','Select LED 150 DMX Controller','Select LED','Control',['kinoflo-select-led-20'],SELECT,null,{orderCode:'LED-150X-120U/230U'}),
  acc('kinoflo-select20-diffuser','Select LED 20 Diffuser','Select LED','Diffusion',['kinoflo-select-led-20'],SELECT,'Softens the LED panel output.',{orderCode:'5340003'}),
  acc('kinoflo-select30-controller','Select LED 150 DMX Controller','Select LED','Control',['kinoflo-select-led-30'],SELECT,null,{orderCode:'LED-150X-120U/230U'}),
  acc('kinoflo-select30-louver-90','Select 30 Louver 90 deg','Select LED','Grid',['kinoflo-select-led-30'],SELECT,'Controls spill from the Select LED 30.',{orderCode:'LVR-SL390-P'})
];
