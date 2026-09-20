// Aladdin BI-FABRIC flexible bi-color lighting catalog.
// Sources: official Aladdin 2022 product catalog and BI-FABRIC manuals.
const BI_FABRIC_CATALOG='https://aladdin-lights.com/wp-content/uploads/2022/05/Aladdin_Katalog_2022_high_res.pdf';
const BI_FABRIC_2_MANUAL='https://aladdin-lights.com/wp-content/uploads/2022/08/BI-FABRIC-2-Manual-SINGLE-PAGE.pdf';
const BI_FABRIC_4_MANUAL='https://aladdin-lights.com/wp-content/uploads/2022/08/BI-FABRIC-4-Manual-SINGLE-PAGE.pdf';
const BI_FABRIC_DMX='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';

function fixture(id,model,powerW,sourceUrl,extra={}){
  return {
    id,manufacturer:'Aladdin',model,family:'BI-FABRIC',category:'Light',
    sourceType:'Flexible LED Panel',cctK:{min:2900,max:6400},
    colorMode:'Bi-Color',powerW,sourceUrl,
    cri:97,tlci:98,beamAngleDeg:140,dimming:'1-100%',
    cooling:'Passive',
    control:['DMX512','LumenRadio','On-board Dimmer'],
    dmxModes:[{name:'2ch Dimmer + CCT',channels:2,verified:true,sourceUrl:BI_FABRIC_DMX,controls:[
      {key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},
      {key:'cct',label:'CCT',channel:2,type:'cct-linear',min:2900,max:6000,dmxMin:0,dmxMax:255}
    ]}],
    powerSupply:'90-260V AC / 12-30V DC battery',
    ...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'Aladdin',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const ALADDIN_BI_FABRIC_FIXTURES=[
  fixture('aladdin-bi-fabric-2','BI-FABRIC 2',100,BI_FABRIC_2_MANUAL,{formFactor:'60 x 30 cm flexible LED panel',weightG:450}),
  fixture('aladdin-bi-fabric-4','BI-FABRIC 4',200,BI_FABRIC_4_MANUAL,{formFactor:'120 x 30 cm flexible LED panel'})
];

const both=['aladdin-bi-fabric-2','aladdin-bi-fabric-4'];

export const ALADDIN_BI_FABRIC_ACCESSORIES=[
  acc('aladdin-bi-fabric-dimmer','BI-FABRIC Dimmer Unit','Dimmer',both,BI_FABRIC_CATALOG,'Provides dimming, CCT control, DMX512 and LumenRadio.'),
  acc('aladdin-bi-fabric-vmount','BI-FABRIC V-Mount Dimmer/Battery Plate','Power',both,BI_FABRIC_CATALOG),
  acc('aladdin-bi-fabric-goldmount','BI-FABRIC Gold-Mount Dimmer/Battery Plate','Power',both,BI_FABRIC_CATALOG),
  acc('aladdin-bi-fabric-extension','BI-FABRIC Extension Cable 5m','Power Cable',both,BI_FABRIC_CATALOG),
  acc('aladdin-bi-fabric-diffuser','BI-FABRIC Diffuser','Diffusion',both,BI_FABRIC_CATALOG,'Softens the flexible panel output.'),
  acc('aladdin-bi-fabric-grid','BI-FABRIC Grid','Grid',both,BI_FABRIC_CATALOG,'Reduces spill and increases directionality.'),
  acc('aladdin-bi-fabric-xbend','BI-FABRIC X-Bend Holder','Frame',both,BI_FABRIC_CATALOG,'Supports the flexible panel on a stand or clamp.'),
  acc('aladdin-bi-fabric-ballhead','BI-FABRIC Ballhead','Mounting',both,BI_FABRIC_CATALOG)
];
