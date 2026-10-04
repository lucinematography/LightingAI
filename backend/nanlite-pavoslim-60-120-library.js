// Nanlite current PavoSlim 60/120 panel family.
// Official Nanlite US sources only. Compatibility is explicit; do not infer across PavoSlim sizes.

const SRC={
  p60b:'https://nanliteus.com/products/pavoslim-60b-1x1-bi-color-led-panel-light',
  p60c:'https://nanliteus.com/products/pavoslim-60c-1x1-rgbww-led-panel-light-with-crmx',
  p120b:'https://nanliteus.com/products/pavoslim-120b-2x1-bi-color-led-panel-light-with-pop-up-softbox',
  p120c:'https://nanliteus.com/products/pavoslim-120c-2x1-rgbww-led-panel-light-with-crmx',
  clamp:'https://nanliteus.com/products/quick-release-super-clamp-for-forza-720-500-300-and-pavoslim',
  cable26:'https://nanliteus.com/products/replacement-extension-head-cable-for-pavoslim-led-panel-lights',
  cable75:'https://nanliteus.com/products/longer-7-5m-head-cable-for-pavoslim-led-panel-lights',
  magnets:'https://nanliteus.com/products/magnetic-mounting-adapters-for-pavoslim',
  swivel:'https://nanliteus.com/products/universal-swivel-holder-for-pavoslim-60-and-120',
  baby:'https://nanliteus.com/products/baby-pin-holder-for-pavoslim-60-and-120',
  soft120:'https://nanliteus.com/products/folding-softbox-and-grid-for-the-pavoslim-120c-and-120b-1',
  dual120:'https://nanliteus.com/products/dual-panel-coupler-and-softbox-kit-for-pavoslim-120'
};

function control(crmx=false){
  return {
    wired:['DMX512','RDM'],
    wireless:[...(crmx?['LumenRadio CRMX']:[]),'Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,
    builtInCRMX:crmx,
    directLightingAI:[],
    externalInterfaceRequired:[
      'Wired DMX interface for DMX512 control',
      ...(crmx?['CRMX transmitter for CRMX control']:[])
    ],
    unavailableDirectProtocols:[
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}
function fixture(id,model,cctMin,cctMax,powerDrawW,colorMode,cri,tlci,sourceUrl,crmx,batteryOptions){
  return {
    id,manufacturer:'Nanlite',model,family:'PavoSlim 60/120',category:'Light',discontinued:false,
    sourceType:'LED Panel',formFactor:model.startsWith('PavoSlim 60')?'1x1 panel':'2x1 panel',
    cctK:{min:cctMin,max:cctMax},powerDrawW,colorMode,cri,tlci,batteryPowered:true,
    batteryOptions,control:control(crmx),sourceUrl
  };
}

export const NANLITE_PAVOSLIM_60_120_FIXTURES=[
  fixture('nanlite-pavoslim-60b','PavoSlim 60B',2700,6500,72,'Bi-Color',95,97,SRC.p60b,false,
    ['2x NP-F via Control Unit','V-Mount via Control Unit','AC mains']),
  fixture('nanlite-pavoslim-60c','PavoSlim 60C',2700,7500,72,'RGBWW',96,97,SRC.p60c,true,
    ['2x NP-F via Control Unit','V-Mount via Control Unit','AC mains']),
  fixture('nanlite-pavoslim-120b','PavoSlim 120B',2700,6500,150,'Bi-Color',95,97,SRC.p120b,false,
    ['V-Mount via Control Unit','AC mains']),
  fixture('nanlite-pavoslim-120c','PavoSlim 120C',2700,7500,150,'RGBWW',96,97,SRC.p120c,true,
    ['V-Mount via Control Unit','AC mains'])
];

const ALL=['nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-60cl','nanlite-pavoslim-120b','nanlite-pavoslim-120c','nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c'];
const P120=['nanlite-pavoslim-120b','nanlite-pavoslim-120c'];

function included(id,model,category,target,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl,...extra
  };
}

export const NANLITE_PAVOSLIM_60_120_ACCESSORIES=[
  {
    id:'nanlite-cbps-2-6m',manufacturer:'Nanlite',model:'CBPS2.6M PavoSlim Head Cable 2.6 m',
    category:'Cable',compatibleWith:ALL,compatibilityStatus:'Designed For',
    includedWithFixtures:ALL,sourceUrl:SRC.cable26
  },
  {
    id:'nanlite-cbps-7-5m',manufacturer:'Nanlite',model:'CBPS7.5M Longer PavoSlim Head Cable 7.5 m',
    category:'Cable',compatibleWith:ALL,compatibilityStatus:'Designed For',sourceUrl:SRC.cable75
  },
  {
    id:'nanlite-as-mba-1-4-set',manufacturer:'Nanlite',model:'AS-MBA-1/4-SET Magnetic Mounting Adapters',
    category:'Mount Adapter',mount:'1/4-20 magnetic',compatibleWith:ALL,
    compatibilityStatus:'Designed For',sourceUrl:SRC.magnets
  },
  {
    id:'nanlite-asuhps',manufacturer:'Nanlite',model:'ASUHPS Swivel Holder for PavoSlim 60/120',
    category:'Mount',compatibleWith:['nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-60cl','nanlite-pavoslim-120b','nanlite-pavoslim-120c'],compatibilityStatus:'Designed For',
    includedWithFixtures:['nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-60cl','nanlite-pavoslim-120b','nanlite-pavoslim-120c'],sourceUrl:SRC.swivel
  },
  {
    id:'nanlite-asbhpps',manufacturer:'Nanlite',model:'ASBHPPS Baby-Pin Holder for PavoSlim 60/120',
    category:'Mount',mount:'5/8 in baby pin',compatibleWith:ALL,
    compatibilityStatus:'Designed For',
    includedWithFixtures:['nanlite-pavoslim-60c','nanlite-pavoslim-120b','nanlite-pavoslim-120c'],
    sourceUrl:SRC.baby
  },
  {
    id:'nanlite-sbps120f',manufacturer:'Nanlite',model:'SBPS120F Folding Softbox and Grid for PavoSlim 120B/120C',
    category:'Softbox',compatibleWith:P120,compatibilityStatus:'Designed For',
    bundledComponents:['1.5-stop diffuser','2.5-stop diffuser','Eggcrate grid','Carrying case'],
    sourceUrl:SRC.soft120
  },
  {
    id:'nanlite-asdpc120k',manufacturer:'Nanlite',model:'ASDPC120K Dual-Panel Coupler and Softbox Kit',
    category:'Bracket',compatibleWith:P120,compatibilityStatus:'Designed For',
    bundledComponents:['2x2 coupler','1x4 coupler','Folding softbox','Diffusers','Eggcrate grids','Carrying bag'],
    sourceUrl:SRC.dual120
  },

  included('nanlite-pavoslim-60b-control-unit','PavoSlim 60B Control Unit with 2 NP-F and 1 V-Mount Plates','Power','nanlite-pavoslim-60b',SRC.p60b),
  included('nanlite-pavoslim-60c-control-unit','PavoSlim 60C Control Unit with 2 NP-F and 1 V-Mount Plates','Power','nanlite-pavoslim-60c',SRC.p60c),
  included('nanlite-pavoslim-120b-control-unit','PavoSlim 120B Control Unit with V-Mount Plate','Power','nanlite-pavoslim-120b',SRC.p120b),
  included('nanlite-pavoslim-120c-control-unit','PavoSlim 120C Control Unit with V-Mount Plate','Power','nanlite-pavoslim-120c',SRC.p120c),

  included('nanlite-pavoslim-60b-softbox','PavoSlim 60B Pop-Up Softbox','Softbox','nanlite-pavoslim-60b',SRC.p60b),
  included('nanlite-pavoslim-60c-softbox','PavoSlim 60C Pop-Up Softbox','Softbox','nanlite-pavoslim-60c',SRC.p60c),
  included('nanlite-pavoslim-120b-softbox','PavoSlim 120B Pop-Up Softbox','Softbox','nanlite-pavoslim-120b',SRC.p120b),
  included('nanlite-pavoslim-120c-softbox','PavoSlim 120C Pop-Up Softbox','Softbox','nanlite-pavoslim-120c',SRC.p120c),

  included('nanlite-pavoslim-60b-grid','PavoSlim 60B Eggcrate Grid','Grid','nanlite-pavoslim-60b',SRC.p60b),
  included('nanlite-pavoslim-60c-grid','PavoSlim 60C Eggcrate Grid','Grid','nanlite-pavoslim-60c',SRC.p60c),
  included('nanlite-pavoslim-120b-grid','PavoSlim 120B Eggcrate Grid','Grid','nanlite-pavoslim-120b',SRC.p120b),
  included('nanlite-pavoslim-120c-grid','PavoSlim 120C Eggcrate Grid','Grid','nanlite-pavoslim-120c',SRC.p120c),

  included('nanlite-pavoslim-60b-diffusers','PavoSlim 60B 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-pavoslim-60b',SRC.p60b),
  included('nanlite-pavoslim-60c-diffusers','PavoSlim 60C 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-pavoslim-60c',SRC.p60c),
  included('nanlite-pavoslim-120b-diffusers','PavoSlim 120B 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-pavoslim-120b',SRC.p120b),
  included('nanlite-pavoslim-120c-diffusers','PavoSlim 120C 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-pavoslim-120c',SRC.p120c),

  included('nanlite-pavoslim-60b-case','PavoSlim 60B Padded Carrying Bag','Case','nanlite-pavoslim-60b',SRC.p60b),
  included('nanlite-pavoslim-60c-case','PavoSlim 60C Padded Carrying Bag','Case','nanlite-pavoslim-60c',SRC.p60c),
  included('nanlite-pavoslim-120b-case','PavoSlim 120B Padded Carrying Bag','Case','nanlite-pavoslim-120b',SRC.p120b),
  included('nanlite-pavoslim-120c-case','PavoSlim 120C Padded Carrying Bag','Case','nanlite-pavoslim-120c',SRC.p120c)
];
