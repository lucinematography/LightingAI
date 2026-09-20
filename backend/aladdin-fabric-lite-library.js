// Aladdin FABRIC-LITE flexible bi-color lighting catalog.
// Sources: official Aladdin FABRIC-LITE manuals/catalog and dimmer manuals.
const FABRIC20='https://aladdin-lights.com/wp-content/uploads/2022/08/FABRIC-LITE-20-Manual-SINGLE-PAGE.pdf';
const FABRIC35='https://aladdin-lights.com/wp-content/uploads/2018/03/Aladdin-Cat2018.pdf';
const DIM200='https://aladdin-lights.com/wp-content/uploads/2022/08/DIMMER-UNIT-200W-Manual-SINGLE-PAGE.pdf';
const DIM350='https://aladdin-lights.com/wp-content/uploads/2022/08/DIMMER-UNIT-350W-Manual-SINGLE-PAGE.pdf';
const FABRIC_DMX='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';

function fixture(id,model,cctMin,cctMax,powerW,sourceUrl,extra={}){
  return {
    id,manufacturer:'Aladdin',model,family:'FABRIC-LITE',category:'Light',
    sourceType:'Flexible LED Panel',cctK:{min:cctMin,max:cctMax},
    colorMode:'Bi-Color',powerW,sourceUrl,
    cri:98,tlci:98,beamAngleDeg:140,
    control:['DMX512','LumenRadio','On-board Dimmer'],
    dmxModes:[{name:'2ch Dimmer + CCT',channels:2,verified:true,sourceUrl:FABRIC_DMX,controls:[
      {key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},
      {key:'cct',label:'CCT',channel:2,type:'cct-linear',min:2900,max:6000,dmxMin:0,dmxMax:255}
    ]}],
    ...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'Aladdin',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const ALADDIN_FABRIC_LITE_FIXTURES=[
  fixture('aladdin-fabric-lite-20','FABRIC-LITE 20',2850,6098,200,FABRIC20,{formFactor:'Foldable fabric LED panel',ipRating:'IP32',dimming:'0.5-100%'}),
  fixture('aladdin-fabric-lite-35','FABRIC-LITE 35',2900,6300,350,FABRIC35,{formFactor:'Foldable 3x3 ft fabric LED panel',dimming:'1-100%'})
];

export const ALADDIN_FABRIC_LITE_ACCESSORIES=[
  acc('aladdin-fabric-200w-dimmer','200W Dimmer Unit','Dimmer',['aladdin-fabric-lite-20'],DIM200,'Adds physical dimming, DMX in/out, LumenRadio and battery-plate power input.'),
  acc('aladdin-fabric-350w-dimmer','350W Dimmer Unit','Dimmer',['aladdin-fabric-lite-35'],DIM350,'Adds physical dimming, DMX in/out and LumenRadio control.'),
  acc('aladdin-fabric-20-extension','FABRIC-LITE 20 Extension Cable','Power Cable',['aladdin-fabric-lite-20'],FABRIC20),
  acc('aladdin-fabric-35-extension','FABRIC-LITE 35 Extension Cable','Power Cable',['aladdin-fabric-lite-35'],FABRIC35),
  acc('aladdin-fabric-20-diffuser','FABRIC-LITE 20 Diffuser','Diffusion',['aladdin-fabric-lite-20'],FABRIC20,'Softens the fabric-panel output.'),
  acc('aladdin-fabric-35-diffuser','FABRIC-LITE 35 Diffuser','Diffusion',['aladdin-fabric-lite-35'],FABRIC35,'Softens the 3x3 fabric-panel output.'),
  acc('aladdin-fabric-20-ac','FABRIC-LITE 20 AC Power Supply','Power',['aladdin-fabric-lite-20'],FABRIC20),
  acc('aladdin-fabric-35-ac','FABRIC-LITE 35 AC Power Supply','Power',['aladdin-fabric-lite-35'],FABRIC35)
];
