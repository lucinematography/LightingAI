// Aladdin BI-FLEX flexible bi-color lighting catalog.
// Sources: official Aladdin product catalog, specification chart, manuals, and accessory chart.
const BI_FLEX_CATALOG='https://aladdin-lights.com/wp-content/uploads/2022/05/Aladdin_Katalog_2022_high_res.pdf';
const BI_FLEX_SPEC='https://aladdin-lights.com/wp-content/uploads/2019/06/Aladdin-lights-specifications.pdf';
const M7_MANUAL='https://aladdin-lights.com/wp-content/uploads/2023/06/BI-FLEX-M7-Manual-.pdf';
const M7_ACCESSORIES='https://aladdin-lights.com/wp-content/uploads/2024/12/Accessory-Chart-BI-FLEX-M7-1.pdf';
const BI_FLEX_DMX='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
const BI_FLEX_200W_DIMMER='https://aladdin-lights.com/wp-content/uploads/2022/08/DIMMER-UNIT-200W-Manual-SINGLE-PAGE.pdf';

function fixture(id,model,powerW,cctMin,cctMax,sourceUrl,extra={}){
  return {
    id,manufacturer:'Aladdin',model,family:'BI-FLEX',category:'Light',
    sourceType:'Flexible LED Panel',cctK:{min:cctMin,max:cctMax},
    colorMode:'Bi-Color',powerW,sourceUrl,
    cri:98,tlci:98,beamAngleDeg:140,
    cooling:'Passive',
    ...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'Aladdin',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const ALADDIN_BI_FLEX_FIXTURES=[
  fixture('aladdin-bi-flex-m3','BI-FLEX M3',30,2900,5600,BI_FLEX_CATALOG,{formFactor:'30 x 12.5 cm flexible LED panel',control:['On-board Dimmer','Optional DMX Module'],dmxModes:[{name:'2ch Dimmer + CCT',channels:2,verified:true,sourceUrl:BI_FLEX_DMX,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},{key:'cct',label:'CCT',channel:2,type:'cct-linear',min:2900,max:5600,dmxMin:0,dmxMax:255}]}],powerSupply:'100-240V AC / 12-30V DC battery'}),
  fixture('aladdin-bi-flex-m7','BI-FLEX M7',70,2900,5600,M7_MANUAL,{formFactor:'30 x 30 cm flexible LED panel',control:['On-board Dimmer','Optional DMX Module'],dmxModes:[{name:'2ch Dimmer + CCT',channels:2,verified:true,sourceUrl:BI_FLEX_DMX,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},{key:'cct',label:'CCT',channel:2,type:'cct-linear',min:2900,max:5600,dmxMin:0,dmxMax:255}]}],powerSupply:'100-240V AC / 12-30V DC battery'}),
  fixture('aladdin-bi-flex-1','BI-FLEX 1',50,2900,6100,BI_FLEX_SPEC,{formFactor:'30 x 30 cm flexible LED panel',control:['On-board Dimmer']}),
  // The official 200W dimmer manual explicitly maps BI-FABRIC 2 = BI-FLEX 2 and BI-FABRIC 4 = BI-FLEX 4 sheet types.
  // Combined with Aladdin's published BI-FABRIC DMX protocol, this verifies the same 2ch dimmer + CCT control path for BI-FLEX 2/4.
  fixture('aladdin-bi-flex-2','BI-FLEX 2',100,2900,6000,BI_FLEX_SPEC,{formFactor:'56 x 30 cm flexible LED panel',control:['DMX512','LumenRadio','On-board Dimmer'],dmxModes:[{name:'2ch Dimmer + CCT',channels:2,verified:true,sourceUrl:BI_FLEX_200W_DIMMER,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},{key:'cct',label:'CCT',channel:2,type:'cct-linear',min:2900,max:6000,dmxMin:0,dmxMax:255}]}],powerSupply:'100-240V AC / 12-30V DC battery'}),
  fixture('aladdin-bi-flex-4','BI-FLEX 4',200,2900,6000,BI_FLEX_SPEC,{formFactor:'108 x 30 cm flexible LED panel',control:['DMX512','LumenRadio','On-board Dimmer'],dmxModes:[{name:'2ch Dimmer + CCT',channels:2,verified:true,sourceUrl:BI_FLEX_200W_DIMMER,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},{key:'cct',label:'CCT',channel:2,type:'cct-linear',min:2900,max:6000,dmxMin:0,dmxMax:255}]}],powerSupply:'90-260V AC / 12-30V DC battery'})
];

const m3=['aladdin-bi-flex-m3'];
const m7=['aladdin-bi-flex-m7'];
const legacy=['aladdin-bi-flex-1','aladdin-bi-flex-2','aladdin-bi-flex-4'];
const all=[...m3,...m7,...legacy];

export const ALADDIN_BI_FLEX_ACCESSORIES=[
  acc('aladdin-bi-flex-universal-dimmer','BI-FLEX Universal Dimmer','Dimmer',['aladdin-bi-flex-m3','aladdin-bi-flex-m7'],BI_FLEX_CATALOG,'Controls intensity and color temperature and accepts AC or battery power.'),
  acc('aladdin-bi-flex-dmx-module','BI-FLEX DMX Module','Control', ['aladdin-bi-flex-m3','aladdin-bi-flex-m7'],BI_FLEX_CATALOG,'Adds DMX512 remote control to the universal dimmer.'),
  acc('aladdin-bi-flex-m3-diffuser','BI-FLEX M3 Diffuser','Diffusion',m3,BI_FLEX_CATALOG,'Softens the M3 output.'),
  acc('aladdin-bi-flex-m3-extension','BI-FLEX M3 Extension Cable','Power Cable',m3,BI_FLEX_CATALOG),
  acc('aladdin-bi-flex-m7-xbender','BI-FLEX M7 X-Bender','Frame',m7,M7_ACCESSORIES,'Adds a foldable support frame and stand-mounting structure.'),
  acc('aladdin-bi-flex-m7-softbox','BI-FLEX M7 Softbox','Softbox',m7,M7_ACCESSORIES,'Creates a larger, softer source.'),
  acc('aladdin-bi-flex-m7-grid','BI-FLEX M7 Softbox Grid','Grid',m7,M7_ACCESSORIES,'Reduces spill from the softbox.'),
  acc('aladdin-bi-flex-m7-diffuser','BI-FLEX M7 Diffuser','Diffusion',m7,M7_ACCESSORIES,'Softens the M7 output.'),
  acc('aladdin-bi-flex-m7-frame-kit','BI-FLEX M7 Frame Kit','Frame',m7,M7_ACCESSORIES,'Provides a rigid frame option for production use.'),
  acc('aladdin-bi-flex-m7-magnetic-holder','BI-FLEX M7 Magnetic Holder','Mounting',m7,M7_ACCESSORIES),
  acc('aladdin-bi-flex-legacy-dimmer','BI-FLEX Dimmer Unit','Dimmer',legacy,BI_FLEX_SPEC,'Controls intensity and color temperature for BI-FLEX 1/2/4.'),
  acc('aladdin-bi-flex-legacy-diffuser','BI-FLEX Diffuser','Diffusion',legacy,BI_FLEX_SPEC,'Softens BI-FLEX panel output.'),
  acc('aladdin-bi-flex-legacy-extension','BI-FLEX Extension Cable','Power Cable',legacy,BI_FLEX_SPEC),
  acc('aladdin-bi-flex-legacy-frame','BI-FLEX Frame','Frame',legacy,BI_FLEX_SPEC,'Adds rigid support for the flexible panel.'),
  acc('aladdin-bi-flex-legacy-grid','BI-FLEX Grid','Grid',legacy,BI_FLEX_SPEC,'Controls spill from the BI-FLEX panel.'),
  acc('aladdin-bi-flex-4-4x4-frame','BI-FLEX 4 4x4 Frame','Frame',['aladdin-bi-flex-4'],BI_FLEX_SPEC,'Combines four BI-FLEX 4 panels into a large 4x4-foot soft-light configuration.'),
  acc('aladdin-bi-flex-4-4x4-diffusion','BI-FLEX 4 4x4 Diffusion','Diffusion',['aladdin-bi-flex-4'],BI_FLEX_SPEC,'Creates an even large-area soft source for the 4x4 frame configuration.'),
  acc('aladdin-bi-flex-4-4x4-grid','BI-FLEX 4 4x4 Grid','Grid',['aladdin-bi-flex-4'],BI_FLEX_SPEC,'Controls spill from the assembled 4x4 BI-FLEX source.')
];
