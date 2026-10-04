// Nanlite current PavoTube T8-7X.
// Official Nanlite US sources only.

const SRC={
  fixture:'https://nanliteus.com/products/pavotube-t8-7x',
  clip:'https://nanliteus.com/products/transparent-led-tube-mounting-clip-for-pavotube-t8-7x',
  stand:'https://nanliteus.com/products/foldable-floor-stand-for-pavotube-t8-7x-led-tube-light',
  controlBank:'https://nanliteus.com/products/control-bank',
  eyebolt:'https://nanliteus.com/products/20-eyebolts-for-pavotube-ii-led-pixel-tubes'
};

export const NANLITE_PAVOTUBE_T8_7X_FIXTURES=[
  {
    id:'nanlite-pavotube-t8-7x',manufacturer:'Nanlite',model:'PavoTube T8-7X',
    family:'PavoTube T8',category:'Light',discontinued:false,
    sourceType:'RGBWW LED Pixel Tube',formFactor:'3-foot T8 tube',
    cctK:{min:2700,max:7500},colorMode:'RGBWW',powerDrawW:8,
    builtInBattery:true,batteryMah:2200,cri:96,tlci:97,
    pixelCount:16,
    powerOptions:['Internal battery','USB-C 5V/2A','External USB power bank'],
    control:{
      wired:['DMX512','RDM'],
      wireless:['Bluetooth / NANLINK app'],
      builtInBluetooth:true,builtInCRMX:false,
      dmxConnection:'USB-C via CB-DMX-USBC-1/3II adapter',
      directLightingAI:[],
      externalInterfaceRequired:['CB-DMX-USBC-1/3II adapter plus wired DMX interface'],
      unavailableDirectProtocols:['NANLINK Bluetooth protocol is not publicly documented for third-party direct control']
    },
    sourceUrl:SRC.fixture
  }
];

export const NANLITE_PAVOTUBE_T8_7X_ACCESSORIES=[
  {
    id:'nanlite-hd-t8-1-c',manufacturer:'Nanlite',model:'HD-T8-1-C Clear Mounting Clip',
    category:'Mount',mount:'1/4-20 receiver',compatibleWith:['nanlite-pavotube-t8-7x'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.clip
  },
  {
    id:'nanlite-lsflt8',manufacturer:'Nanlite',model:'LSFLT8 Foldable Floor Stand',
    category:'Stand',mount:'1/4-20',compatibleWith:['nanlite-pavotube-t8-7x','nanlite-pavotube-ii-6c'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.stand
  },
  {
    id:'nanlite-wc-usbc-c1',manufacturer:'Nanlite',model:'WC-USBC-C1 Control Bank',
    category:'Control',compatibleWith:['nanlite-pavotube-t8-7x'],
    compatibilityStatus:'Designed For',
    conditions:['Adds external battery power, display and four control buttons'],
    sourceUrl:SRC.controlBank
  },
  {
    id:'nanlite-aseb-eyebolt',manufacturer:'Nanlite',model:'ASEB 1/4-20 Eyebolts',
    category:'Mount',compatibleWith:[
      'nanlite-pavotube-t8-7x','nanlite-pavotube-ii-6xr',
      'nanlite-pavotube-ii-15xr','nanlite-pavotube-ii-30xr','nanlite-pavotube-ii-60xr'
    ],
    compatibilityStatus:'Compatible',sourceUrl:SRC.eyebolt
  },
  {
    id:'nanlite-pavotube-t8-7x-usbc-cable',manufacturer:'Nanlite',model:'PavoTube T8-7X USB-C Cable',
    category:'Cable',compatibleWith:['nanlite-pavotube-t8-7x'],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl:SRC.fixture
  }
];
