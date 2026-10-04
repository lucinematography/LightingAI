// Nanlite current extended PavoSlim family.
// Official Nanlite US sources only. Compatibility is explicit and model scoped.

const SRC={
  p60cl:'https://nanliteus.com/products/pavoslim-60cl-2x-5-rgbww-led-panel-light-with-crmx',
  pavoslimFamily:'https://nanliteus.com/pages/pavoslim',
  p60clDmx:'https://cdn-aliyun.nanlite.com/release/1713318978534-782112-1124121241519342-PavoSlim_60C_60CL_120C_240C_DMX_REFERENCE_GUIDE_EN.pdf',
  p240b:'https://nanliteus.com/products/pavoslim-240b-2x2-bi-color-led-panel-light',
  p240c:'https://nanliteus.com/products/pavoslim-240c-2x2-rgbww-led-panel-light-with-crmx',
  p240cl:'https://nanliteus.com/products/pavoslim-240cl-4x1-rgbww-led-panel-light-with-crmx',
  p360c:'https://nanliteus.com/products/pavoslim-360c-4x2-led-rgbww-panel-light',
  cb240:'https://nanliteus.com/products/head-cable-for-pavoslim-240cl-led-panel-light',
  coupler240cl:'https://nanliteus.com/products/pavoslim-240cl-multi-panel-coupler-and-softbox-kit',
  coupler360:'https://nanliteus.com/products/dual-panel-coupler-for-pavoslim-360c',
  swivel240cb:'https://nanliteus.com/products/swivel-holder-for-pavoslim-240b-c',
  baby240cb:'https://nanliteus.com/products/5-8-baby-pin-holder-for-pavoslim-240c-b',
  baby240cl:'https://nanliteus.com/products/5-8-baby-pin-holder-for-pavoslim-240cl'
};

function control(crmx){
  return {
    wired:['DMX512','RDM'],
    wireless:[...(crmx?['LumenRadio CRMX']:[]),'Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,builtInCRMX:crmx,
    directLightingAI:[],
    externalInterfaceRequired:[
      'Wired DMX interface for DMX512 control',
      ...(crmx?['CRMX transmitter for CRMX control']:[])
    ],
    unavailableDirectProtocols:['NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control']
  };
}
function fixture(id,model,formFactor,cctMin,cctMax,powerDrawW,colorMode,cri,tlci,sourceUrl,crmx,batteryOptions,extra={}){
  return {
    id,manufacturer:'Nanlite',model,family:'PavoSlim Extended',category:'Light',discontinued:false,
    sourceType:'LED Panel',formFactor,cctK:{min:cctMin,max:cctMax},powerDrawW,colorMode,cri,tlci,
    batteryPowered:true,batteryOptions,control:control(crmx),sourceUrl,...extra
  };
}

export const NANLITE_PAVOSLIM_EXTENDED_FIXTURES=[
  fixture('nanlite-pavoslim-60cl','PavoSlim 60CL','2x0.5 panel',2700,7500,72,'RGBWW',96,97,SRC.p60cl,true,
    ['2x NP-F via Control Unit','1x V-Mount via Control Unit','AC mains'],{
      officialSourceConflict:true,
      conflictNote:'Nanlite 60CL product copy, photometrics and official DMX guide support 2700K-7500K; the product specifications table and PavoSlim family comparison currently show 2700K-6500K. Catalog uses 7500K because the DMX technical guide and measured 7500K photometrics corroborate it.',
      conflictSources:[SRC.p60cl,SRC.p60clDmx,SRC.pavoslimFamily]
    }),
  fixture('nanlite-pavoslim-240b','PavoSlim 240B','2x2 folding panel',2700,7500,260,'Bi-Color',95,97,SRC.p240b,false,
    ['V-Mount via Control Unit','AC mains']),
  fixture('nanlite-pavoslim-240c','PavoSlim 240C','2x2 folding panel',2700,7500,260,'RGBWW',96,97,SRC.p240c,true,
    ['V-Mount via Control Unit','AC mains']),
  fixture('nanlite-pavoslim-240cl','PavoSlim 240CL','4x1 panel',2700,7500,260,'RGBWW',96,97,SRC.p240cl,true,
    ['2x V-Mount via Control Unit','AC mains','External 48V DC']),
  fixture('nanlite-pavoslim-360c','PavoSlim 360C','4x2 panel',2400,12000,370,'RGBWW',96,97,SRC.p360c,true,
    ['2x V-Mount via Control Unit','AC mains','External 48V DC'])
];

function included(id,model,category,target,sourceUrl,extra={}){
  return {id,manufacturer:'Nanlite',model,category,compatibleWith:[target],compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl,...extra};
}

const P240=['nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl'];

export const NANLITE_PAVOSLIM_EXTENDED_ACCESSORIES=[
  {
    id:'nanlite-cbps5m',manufacturer:'Nanlite',model:'CBPS5M Head Cable 5 m for PavoSlim 240',
    category:'Cable',compatibleWith:P240,compatibilityStatus:'Designed For',sourceUrl:SRC.cb240
  },
  {
    id:'nanlite-asuhps-2x2',manufacturer:'Nanlite',model:'ASUHPS-2x2 PavoSlim 240 Swivel Holder',
    category:'Mount',compatibleWith:['nanlite-pavoslim-240b','nanlite-pavoslim-240c'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.swivel240cb
  },
  {
    id:'nanlite-asbphps-2x2',manufacturer:'Nanlite',model:'ASBPHPS-2x2 PavoSlim 240 Baby-Pin Holder',
    category:'Mount',mount:'5/8 in baby pin',
    compatibleWith:['nanlite-pavoslim-240b','nanlite-pavoslim-240c'],
    compatibilityStatus:'Designed For',
    includedWithFixtures:['nanlite-pavoslim-240c'],
    sourceUrl:SRC.baby240cb
  },
  {
    id:'nanlite-asbphpsl',manufacturer:'Nanlite',model:'ASBPHPSL PavoSlim 240CL Baby-Pin Holder',
    category:'Mount',mount:'5/8 in baby pin',
    compatibleWith:['nanlite-pavoslim-240cl'],
    compatibilityStatus:'Designed For',
    includedWithFixtures:['nanlite-pavoslim-240cl'],
    sourceUrl:SRC.baby240cl
  },
  {
    id:'nanlite-asmpcps240clkit',manufacturer:'Nanlite',model:'ASMPCPS240CLKIT Multi-Panel Coupler and Softbox Kit',
    category:'Bracket',compatibleWith:['nanlite-pavoslim-240cl'],compatibilityStatus:'Designed For',
    bundledComponents:['2 coupling brackets','Folding softbox','2 diffusion sets','2 eggcrate grids','Carrying bag'],
    sourceUrl:SRC.coupler240cl
  },
  {
    id:'nanlite-asdpcps360',manufacturer:'Nanlite',model:'ASDPCPS360 Dual-Panel Coupler',
    category:'Bracket',compatibleWith:['nanlite-pavoslim-360c'],compatibilityStatus:'Designed For',
    conditions:['Joins two PavoSlim 360C panels into one 4x4 source'],sourceUrl:SRC.coupler360
  },
  {
    id:'nanlite-cbps360-5m',manufacturer:'Nanlite',model:'PavoSlim 360C Head Cable 5 m',
    category:'Cable',compatibleWith:['nanlite-pavoslim-360c'],compatibilityStatus:'Designed For',sourceUrl:SRC.p360c
  },

  included('nanlite-pavoslim-60cl-control-unit','PavoSlim 60CL Control Unit with 2 NP-F and 1 V-Mount Plates','Power','nanlite-pavoslim-60cl',SRC.p60cl),
  included('nanlite-pavoslim-60cl-swivel','PavoSlim 60CL Swivel Holder','Mount','nanlite-pavoslim-60cl',SRC.p60cl),
  included('nanlite-pavoslim-60cl-dc-cable','PavoSlim 60CL DC Connection Cable 2.6 m','Cable','nanlite-pavoslim-60cl',SRC.p60cl),
  included('nanlite-pavoslim-60cl-ac-cable','PavoSlim 60CL AC Power Cable 4.5 m','Cable','nanlite-pavoslim-60cl',SRC.p60cl),
  included('nanlite-pavoslim-60cl-softbox','PavoSlim 60CL Pop-Up Softbox','Softbox','nanlite-pavoslim-60cl',SRC.p60cl),
  included('nanlite-pavoslim-60cl-diffusers','PavoSlim 60CL 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-pavoslim-60cl',SRC.p60cl),
  included('nanlite-pavoslim-60cl-grid','PavoSlim 60CL Eggcrate Grid','Grid','nanlite-pavoslim-60cl',SRC.p60cl),
  included('nanlite-pavoslim-60cl-case','PavoSlim 60CL Carrying Bag','Case','nanlite-pavoslim-60cl',SRC.p60cl),

  included('nanlite-pavoslim-240b-control-unit','PavoSlim 240B Control Unit with 2 V-Mount Plates','Power','nanlite-pavoslim-240b',SRC.p240b),
  included('nanlite-pavoslim-240b-swivel','PavoSlim 240B Swivel Holder','Mount','nanlite-pavoslim-240b',SRC.p240b),
  included('nanlite-pavoslim-240b-dc-cable','PavoSlim 240B DC Connection Cable 5 m','Cable','nanlite-pavoslim-240b',SRC.p240b),
  included('nanlite-pavoslim-240b-ac-cable','PavoSlim 240B AC Power Cable 4.5 m','Cable','nanlite-pavoslim-240b',SRC.p240b),
  included('nanlite-pavoslim-240b-softbox','PavoSlim 240B Folding Softbox','Softbox','nanlite-pavoslim-240b',SRC.p240b),
  included('nanlite-pavoslim-240b-diffusers','PavoSlim 240B 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-pavoslim-240b',SRC.p240b),
  included('nanlite-pavoslim-240b-grid','PavoSlim 240B Eggcrate Grid','Grid','nanlite-pavoslim-240b',SRC.p240b),
  included('nanlite-pavoslim-240b-case','PavoSlim 240B Padded Carrying Bag','Case','nanlite-pavoslim-240b',SRC.p240b),

  included('nanlite-pavoslim-240c-control-unit','PavoSlim 240C Control Unit with 2 V-Mount Plates','Power','nanlite-pavoslim-240c',SRC.p240c),
  included('nanlite-pavoslim-240c-swivel','PavoSlim 240C Swivel Holder','Mount','nanlite-pavoslim-240c',SRC.p240c),
  included('nanlite-pavoslim-240c-dc-cable','PavoSlim 240C DC Connection Cable 5 m','Cable','nanlite-pavoslim-240c',SRC.p240c),
  included('nanlite-pavoslim-240c-ac-cable','PavoSlim 240C AC Power Cable 4.5 m','Cable','nanlite-pavoslim-240c',SRC.p240c),
  included('nanlite-pavoslim-240c-softbox','PavoSlim 240C Folding Softbox','Softbox','nanlite-pavoslim-240c',SRC.p240c),
  included('nanlite-pavoslim-240c-diffusers','PavoSlim 240C 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-pavoslim-240c',SRC.p240c),
  included('nanlite-pavoslim-240c-grid','PavoSlim 240C Eggcrate Grid','Grid','nanlite-pavoslim-240c',SRC.p240c),
  included('nanlite-pavoslim-240c-case','PavoSlim 240C Padded Carrying Bag','Case','nanlite-pavoslim-240c',SRC.p240c),

  included('nanlite-pavoslim-240cl-control-unit','PavoSlim 240CL Control Unit with 2 V-Mount Plates','Power','nanlite-pavoslim-240cl',SRC.p240cl),
  included('nanlite-pavoslim-240cl-swivel','PavoSlim 240CL Swivel Holder','Mount','nanlite-pavoslim-240cl',SRC.p240cl),
  included('nanlite-pavoslim-240cl-dc-cable','PavoSlim 240CL DC Connection Cable 5 m','Cable','nanlite-pavoslim-240cl',SRC.p240cl),
  included('nanlite-pavoslim-240cl-ac-cable','PavoSlim 240CL AC Power Cable 4.5 m','Cable','nanlite-pavoslim-240cl',SRC.p240cl),
  included('nanlite-pavoslim-240cl-softbox','PavoSlim 240CL Pop-Up Softbox','Softbox','nanlite-pavoslim-240cl',SRC.p240cl),
  included('nanlite-pavoslim-240cl-diffusers','PavoSlim 240CL 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-pavoslim-240cl',SRC.p240cl),
  included('nanlite-pavoslim-240cl-grid','PavoSlim 240CL Eggcrate Grid','Grid','nanlite-pavoslim-240cl',SRC.p240cl),
  included('nanlite-pavoslim-240cl-case','PavoSlim 240CL Padded Carrying Case','Case','nanlite-pavoslim-240cl',SRC.p240cl),

  included('nanlite-pavoslim-360c-control-unit','PavoSlim 360C Control Unit with 2 V-Mount Plates','Power','nanlite-pavoslim-360c',SRC.p360c),
  included('nanlite-pavoslim-360c-holder','PavoSlim 360C Universal Holder with 5/8in Baby-Pin','Mount','nanlite-pavoslim-360c',SRC.p360c),
  included('nanlite-pavoslim-360c-dc-cable','PavoSlim 360C DC Connection Cable 7.5 m','Cable','nanlite-pavoslim-360c',SRC.p360c),
  included('nanlite-pavoslim-360c-ac-cable','PavoSlim 360C AC Power Cable 4.5 m','Cable','nanlite-pavoslim-360c',SRC.p360c),
  included('nanlite-pavoslim-360c-softbox','PavoSlim 360C Pop-Up Softbox','Softbox','nanlite-pavoslim-360c',SRC.p360c),
  included('nanlite-pavoslim-360c-diffusers','PavoSlim 360C 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-pavoslim-360c',SRC.p360c),
  included('nanlite-pavoslim-360c-grid','PavoSlim 360C Eggcrate Grid','Grid','nanlite-pavoslim-360c',SRC.p360c),
  included('nanlite-pavoslim-360c-case','PavoSlim 360C Padded Carrying Bag','Case','nanlite-pavoslim-360c',SRC.p360c)
];
