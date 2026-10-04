// Nanlite current LumiPad panel family.
// Official Nanlite US sources only.
// NOTE: Nanlite's LumiPad 25 product page claims 2.4G/WS-RC-C2/WS-TB-1 support,
// while the current WS-TB-1 compatibility page explicitly says LumiPad 25 has no 2.4G.
// We preserve that conflict instead of guessing.

const SRC={
  lp11:'https://nanliteus.com/products/nanlite-lumipad-11-dimmable-adjustable-bicolor-slim-soft-light-ac-battery-powered-led-panel',
  lp25:'https://nanliteus.com/products/nanlite-lumipad-25-high-output-dimmable-adjustable-bicolor-slim-soft-light-ac-battery-powered-led-panel',
  collection:'https://nanliteus.com/collections/lumipad',
  wsTb:'https://nanliteus.com/products/nanlink-ws-tb-1-transmitter-box',
  pa11:'https://nanliteus.com/products/power-adapter-7-5v-2a'
};

export const NANLITE_LUMIPAD_CURRENT_FIXTURES=[
  {
    id:'nanlite-lumipad-11',manufacturer:'Nanlite',model:'LumiPad 11',
    family:'LumiPad',category:'Light',discontinued:false,
    sourceType:'Bi-Color LED Panel',cctK:{min:3200,max:5600},
    colorMode:'Bi-Color',powerDrawW:11.5,cri:95,tlci:93,
    batteryPowered:true,powerOptions:['NP-F battery','7.2-15V DC','AC adapter'],
    control:{
      wired:[],wireless:['2.4G'],builtInBluetooth:false,builtInCRMX:false,
      directLightingAI:[],externalInterfaceRequired:[],
      unavailableDirectProtocols:['2.4G control protocol is not publicly documented for third-party direct control']
    },
    sourceUrl:SRC.lp11
  },
  {
    id:'nanlite-lumipad-25',manufacturer:'Nanlite',model:'LumiPad 25',
    family:'LumiPad',category:'Light',discontinued:false,
    sourceType:'Bi-Color LED Panel',cctK:{min:3200,max:5600},
    colorMode:'Bi-Color',powerDrawW:25.6,cri:95,tlci:93,
    batteryPowered:true,powerOptions:['NP-F battery','15V/2A DC','AC adapter','D-Tap DC cable'],
    control:{
      wired:[],wireless:[],builtInBluetooth:false,builtInCRMX:false,
      directLightingAI:[],externalInterfaceRequired:[],
      officialSourceConflict:true,
      conflictNote:'LumiPad 25 product page lists 2.4G/WS-RC-C2/WS-TB-1, but current WS-TB-1 page explicitly says LumiPad 25 has no 2.4G and is not compatible. No wireless accessory link is activated until resolved.',
      conflictSources:[SRC.lp25,SRC.wsTb]
    },
    sourceUrl:SRC.lp25
  }
];

export const NANLITE_LUMIPAD_CURRENT_ACCESSORIES=[
  {
    id:'nanlite-pa-7-5v2a',manufacturer:'Nanlite',model:'PA-7.5V2A Power Adapter',
    category:'Power',compatibleWith:['nanlite-lumipad-11'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.pa11
  },
  {
    id:'nanlite-lumipad-25-ac-adapter',manufacturer:'Nanlite',model:'LumiPad 25 15V/2A AC Adapter with Stand Strap',
    category:'Power',compatibleWith:['nanlite-lumipad-25'],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl:SRC.lp25
  }
];
