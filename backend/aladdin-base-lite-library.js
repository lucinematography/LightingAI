// Aladdin BASE-LITE hard-shell bi-color panel catalog.
// Sources: official Aladdin catalog, specification chart, and DMX protocol map.
const BASE_CATALOG='https://aladdin-lights.com/wp-content/uploads/2018/03/Aladdin-Cat2018.pdf';
const BASE_SPEC='https://aladdin-lights.com/wp-content/uploads/2019/06/Aladdin-lights-specifications.pdf';
const BASE_DMX='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';

function fixture(id,model,powerW,dimensions,weightG){
  return {
    id,manufacturer:'Aladdin',model,family:'BASE-LITE',category:'Light',
    sourceType:'LED Soft Panel',cctK:{min:2900,max:6400},
    colorMode:'Bi-Color',powerW,sourceUrl:BASE_SPEC,
    cri:98,beamAngleDeg:140,dimming:'1-100%',
    cooling:'Passive',formFactor:'Hard-shell LED soft panel',
    dimensions,weightG,
    control:['DMX512','On-board'],
    dmxModes:[{name:'2ch Dimmer + CCT',channels:2,verified:true,sourceUrl:BASE_DMX,controls:[
      {key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},
      {key:'cct',label:'CCT',channel:2,type:'cct-linear',min:2900,max:6400,dmxMin:0,dmxMax:255}
    ]}],
    powerSupply:'90-260V AC / 12-30V DC battery'
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'Aladdin',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const ALADDIN_BASE_LITE_FIXTURES=[
  fixture('aladdin-base-lite-100','BASE-LITE 100',100,'430 x 300 x 80 mm',2300),
  fixture('aladdin-base-lite-200','BASE-LITE 200',200,'500 x 400 x 100 mm',3800)
];

const both=['aladdin-base-lite-100','aladdin-base-lite-200'];

export const ALADDIN_BASE_LITE_ACCESSORIES=[
  acc('aladdin-base-lite-barndoors','BASE-LITE Barn Doors','Barn Door',both,BASE_CATALOG,'Shapes the soft-panel beam and controls spill.'),
  acc('aladdin-base-lite-honeycomb','BASE-LITE Honeycomb Grid','Grid',both,BASE_CATALOG,'Narrows spill while preserving the broad soft source.'),
  acc('aladdin-base-lite-diffuser','BASE-LITE Removable Diffuser','Diffusion',both,BASE_CATALOG,'Creates the standard soft, evenly distributed BASE-LITE field.'),
  acc('aladdin-base-lite-vlock','BASE-LITE V-Lock Battery Plate','Power',both,BASE_CATALOG),
  acc('aladdin-base-lite-goldmount','BASE-LITE Gold Mount Battery Plate','Power',both,BASE_CATALOG),
  acc('aladdin-base-lite-dmx','BASE-LITE Built-in DMX Control','Control',both,BASE_DMX,'Provides 2-channel dimmer and CCT control over DMX512.')
];
