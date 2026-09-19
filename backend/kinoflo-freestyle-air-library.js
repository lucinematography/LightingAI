// Kino Flo FreeStyle Air family.
// Official product pages and manuals remain available in Kino Flo's archive.
const MINI='https://kinoflo.com/freestyle-air-mini/';
const AIR='https://kinoflo.com/freestyle-air/';
const MAX='https://kinoflo.com/freestyle-air-max/';

function fixture(id,model,sourceUrl,dimensionsCm,weightKg){
  return {
    id,manufacturer:'Kino Flo',model,family:'FreeStyle Air',category:'Light',
    sourceType:'Remote LED Soft Panel',sourceUrl,status:'Legacy / Archive',
    cctK:{min:2500,max:9900},colorMode:'RGB Full Color',
    cri:96,tlci:96,tm30:{rf:95,rg:103},
    dimming:'100%-1%',controller:'FreeStyle 140 LED DMX Controller',
    controllerPowerW:150,input:'100-240VAC or 18-36VDC',
    control:['Onboard','DMX512','LumenRadio wireless DMX'],
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
