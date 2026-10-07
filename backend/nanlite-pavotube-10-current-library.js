// Nanlite current 10-inch PavoTube II 6C / 6CP family.
// Official Nanlite US sources only. 6C and 6CP are current products in the 2026 PavoTube collection.

const SRC={
  c6:'https://nanliteus.com/products/pavotube-ii-6c-rgbww-led-tube-light',
  cp6:'https://nanliteus.com/products/pavotube-ii-6cp-10-inch-nebula-c4-led-tube-light',
  compare:'https://nanliteus.com/blogs/learn/whats-the-difference-between-the-pavotube-ii-6c-6cp-6xr',
  coupler:'https://nanliteus.com/nanlite-pavotube-ii-6c-coupler/',
  collection:'https://nanliteus.com/collections/pavotube'
};

function control6C(){
  return {
    wired:[],
    wireless:['Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,
    builtInCRMX:false,
    nfcPairing:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'No DMX/RDM control is listed for PavoTube II 6C',
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}
function control6CP(){
  return {
    wired:[],
    wireless:['Bluetooth / NANLINK app','NFC pairing'],
    builtInBluetooth:true,
    builtInCRMX:false,
    nfcPairing:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'No DMX/RDM control is listed for PavoTube II 6CP',
      'NANLINK Bluetooth control protocol is not publicly documented for third-party direct control'
    ]
  };
}

export const NANLITE_PAVOTUBE_10_CURRENT_FIXTURES=[
  {
    id:'nanlite-pavotube-ii-6c',manufacturer:'Nanlite',model:'PavoTube II 6C',
    family:'PavoTube II 10-inch',category:'Light',discontinued:false,
    sourceType:'RGBWW LED Tube',formFactor:'10-inch T12 tube',
    cctK:{min:2700,max:7500},colorMode:'RGBWW',powerDrawW:6,
    builtInBattery:true,batteryMah:2200,cri:95,tlci:97,
    powerOptions:['Internal battery','USB-C charging','USB power bank','AC via USB-C source'],
    control:control6C(),sourceUrl:SRC.c6
  },
  {
    id:'nanlite-pavotube-ii-6cp',manufacturer:'Nanlite',model:'PavoTube II 6CP',
    family:'PavoTube II 10-inch',category:'Light',discontinued:false,
    sourceType:'Nebula C4 RGBW LED Tube',formFactor:'10-inch T12 tube',
    cctK:{min:2400,max:12000},colorMode:'RGBW',powerDrawW:10,
    builtInBattery:true,batteryMah:3200,cri:95,tlci:95,
    powerOptions:['Internal battery','USB-C charging'],
    control:control6CP(),sourceUrl:SRC.cp6
  }
];

function included(id,model,category,target,sourceUrl){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl
  };
}

export const NANLITE_PAVOTUBE_10_CURRENT_ACCESSORIES=[
  {
    id:'nanlite-as-cp-1-4',manufacturer:'Nanlite',model:'AS-CP-1/4 PavoTube II 6C Coupler',
    category:'Mount',mount:'1/4-20 male-to-male',compatibleWith:['nanlite-pavotube-ii-6c'],
    compatibilityStatus:'Designed For',
    conditions:['Designed to connect multiple PavoTube II 6C fixtures end-to-end'],
    sourceUrl:SRC.coupler
  },
  included('nanlite-pavotube-ii-6c-usbc-cable','PavoTube II 6C USB-C to USB-A Cable','Cable','nanlite-pavotube-ii-6c',SRC.c6),
  included('nanlite-pavotube-ii-6c-iron-plates','PavoTube II 6C Iron Mounting Plates (set of 3)','Mount','nanlite-pavotube-ii-6c',SRC.c6),
  included('nanlite-pavotube-ii-6c-wrist-strap','PavoTube II 6C Wrist Strap','Mount','nanlite-pavotube-ii-6c',SRC.c6),
  included('nanlite-pavotube-ii-6c-case','PavoTube II 6C Carrying Bag','Case','nanlite-pavotube-ii-6c',SRC.c6),

  included('nanlite-pavotube-ii-6cp-usbc-cable','PavoTube II 6CP USB-C to USB-A Cable','Cable','nanlite-pavotube-ii-6cp',SRC.cp6),
  included('nanlite-pavotube-ii-6cp-iron-plates','PavoTube II 6CP Iron Mounting Plates (set of 3)','Mount','nanlite-pavotube-ii-6cp',SRC.cp6),
  included('nanlite-pavotube-ii-6cp-case','PavoTube II 6CP Carrying Bag','Case','nanlite-pavotube-ii-6cp',SRC.cp6),

  {
    id:'nanlite-ccsptii6c',manufacturer:'Nanlite',model:'CCSPTII6C Carrying Case for Six 10-Inch PavoTubes',
    category:'Case',compatibleWith:['nanlite-pavotube-ii-6c','nanlite-pavotube-ii-6cp','nanlite-pavotube-ii-6xr'],
    compatibilityStatus:'Compatible',sourceUrl:SRC.compare
  }
];
