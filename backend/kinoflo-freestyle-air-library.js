// Kino Flo FreeStyle Air family.
// Official product pages and manuals remain available in Kino Flo's archive.
const MINI='https://kinoflo.com/freestyle-air-mini/';
const AIR='https://kinoflo.com/freestyle-air/';
const MAX='https://kinoflo.com/freestyle-air-max/';
const TRUE_MATCH_6_DMX_SRC='https://kinoflo.com/wp-content/uploads/2025/07/TrueMatch-Firmware-6.0-RDM-DMX-Personalities-June-2025-Rev-E.pdf';
const TRUE_MATCH_6_DMX_MODES=[
  {name:'TM6 P1 CCT 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P2 CCT/Gel/HS 8-bit',channels:6,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P3 CCT/RGB 8-bit',channels:6,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P4 CCT 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P5 CIE xy 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P6 CCT 16-bit',channels:4,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P7 CCT/Gel/HS 16-bit',channels:7,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P8 CCT/RGB 16-bit',channels:7,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P9 CCT 16-bit',channels:4,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P10 CIE xy 16-bit',channels:4,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P11 CCT 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P12 CCT 16-bit',channels:5,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P13 Gel 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P14 Gel 16-bit',channels:5,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P15 HS 8-bit',channels:4,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P16 HS 16-bit',channels:8,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P17 RGB 8-bit',channels:5,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P18 RGB 16-bit',channels:10,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P19 CIE xy 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P20 CIE xy 16-bit',channels:6,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P21 CCT 8-bit',channels:3,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P22 CCT 16-bit',channels:5,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P23 xfade CCT & HS 8-bit',channels:7,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P24 xfade CCT & HS 16-bit',channels:13,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P25 xfade CCT & RGB 8-bit',channels:8,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P26 xfade CCT & RGB 16-bit',channels:15,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P27 xfade CIE xy1 & xy2 8-bit',channels:6,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P28 xfade CIE xy1 & xy2 16-bit',channels:12,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P29 xfade CCT & TDRGB 8-bit',channels:9,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC},
  {name:'TM6 P30 xfade CCT & TDRGB 16-bit',channels:15,verified:true,sourceUrl:TRUE_MATCH_6_DMX_SRC}
];

function fixture(id,model,sourceUrl,dimensionsCm,weightKg){
  return {
    id,manufacturer:'Kino Flo',model,family:'FreeStyle Air',category:'Light',
    sourceType:'Remote LED Soft Panel',sourceUrl,status:'Legacy / Archive',
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',
    cri:96,tlci:96,tm30:{rf:95,rg:103},
    dimming:'100%-1%',controller:'FreeStyle 140 LED DMX Controller',
    controllerPowerW:150,input:'100-240VAC or 18-36VDC',
    control:['Onboard','DMX512','LumenRadio wireless DMX'],
    dmxControllerModel:'LED-140X',dmxFirmware:'True Match 6.0 DFS',
    dmxModes:TRUE_MATCH_6_DMX_MODES.map((mode)=>({...mode})),
    cooling:'Passive / quiet operation',dimensionsCm,weightKg
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {id,manufacturer:'Kino Flo',model,family:'FreeStyle Air',category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra};
}

export const KINOFLO_FREESTYLE_AIR_FIXTURES=[
  fixture('kinoflo-freestyle-air-mini','FreeStyle Air Mini',MINI,{width:53,height:33,depth:5},1),
  fixture('kinoflo-freestyle-air','FreeStyle Air',AIR,{width:100,height:33,depth:5},2),
  fixture('kinoflo-freestyle-air-max','FreeStyle Air Max',MAX,{width:100,height:56,depth:5},3)
];

export const KINOFLO_FREESTYLE_AIR_ACCESSORIES=[
  acc('kinoflo-fam-snapbox','FreeStyle Air Mini SnapBox w/ 2 x Diffusion','Diffusion',['kinoflo-freestyle-air-mini'],MINI,'Softens and enlarges the apparent source.',{orderCode:'DFS-FAM'}),
  acc('kinoflo-famini-snapgrid-40','FreeStyle Air Mini SnapGrid 40°','Grid',['kinoflo-freestyle-air-mini'],MINI,'Controls spill and narrows off-axis output.',{orderCode:'LVR-FAM40'}),
  acc('kinoflo-fa-snapbox','FreeStyle Air SnapBox w/ 2 x Diffusion','Diffusion',['kinoflo-freestyle-air'],AIR,'Softens and enlarges the apparent source.',{orderCode:'DFS-FA'}),
  acc('kinoflo-fa-snapgrid-40','FreeStyle Air SnapGrid 40°','Grid',['kinoflo-freestyle-air'],AIR,'Controls spill and narrows off-axis output.',{orderCode:'LVR-FA40'}),
  acc('kinoflo-famax-snapbox','FreeStyle Air Max SnapBox w/ 2 x Diffusion','Diffusion',['kinoflo-freestyle-air-max'],MAX,'Softens and enlarges the apparent source.',{orderCode:'DFS-FAMX'}),
  acc('kinoflo-freestyle-140-controller','FreeStyle 140 LED DMX Controller','Control',['kinoflo-freestyle-air-mini','kinoflo-freestyle-air','kinoflo-freestyle-air-max'],MAX,null,{orderCode:'LED-140X-120U/230U'}),
  acc('kinoflo-freestyle-extension-25','FreeStyle/4 Extension 25ft','Cable',['kinoflo-freestyle-air-mini','kinoflo-freestyle-air','kinoflo-freestyle-air-max'],MAX,null,{orderCode:'X12-F425'}),
  acc('kinoflo-kinogrip-41k-baby','KinoGrip 41K Mount w/ Baby Receiver','Mounting',['kinoflo-freestyle-air-mini','kinoflo-freestyle-air','kinoflo-freestyle-air-max'],MAX,null,{orderCode:'MTP-BG41'})
];
