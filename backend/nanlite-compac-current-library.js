// Nanlite current Compac bi-color panel family.
// Official Nanlite US sources only. Compatibility is explicit and model-size specific.

const SRC={
  c68:'https://nanliteus.com/products/nanlite-compac-68b-adjustable-bicolor-slim-soft-light-studio-led-panel',
  c100:'https://nanliteus.com/products/nanlite-compac-100b-adjustable-bicolor-slim-soft-light-studio-led-panel',
  c200:'https://nanliteus.com/products/nanlite-compac-200b-adjustable-bicolor-slim-soft-light-studio-led-panel',
  collection:'https://nanliteus.com/collections/compac',
  guide:'https://nanliteus.com/blogs/learn/nanlite-compac-series-a-deeper-look',
  lantern100:'https://nanliteus.com/products/compac-100-and-100b-rapid-fold-collapsible-lantern-softbox'
};

function localControl(){
  return {
    wired:[],
    wireless:[],
    builtInBluetooth:false,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:['No remote control protocol is listed on the official product page']
  };
}
function wirelessControl200(){
  return {
    wired:[],
    wireless:['Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}
function fixture(id,model,powerDrawW,cri,tlci,sourceUrl,control){
  return {
    id,manufacturer:'Nanlite',model,family:'Compac',category:'Light',discontinued:false,
    sourceType:'Bi-Color LED Panel',cctK:{min:3200,max:5600},colorMode:'Bi-Color',
    powerDrawW,cri,tlci,powerMode:'AC only',batteryPowered:false,control,sourceUrl
  };
}

export const NANLITE_COMPAC_CURRENT_FIXTURES=[
  fixture('nanlite-compac-68b','Compac 68B',68,95,93,SRC.c68,localControl()),
  fixture('nanlite-compac-100b','Compac 100B',100,95,93,SRC.c100,localControl()),
  fixture('nanlite-compac-200b','Compac 200B',200,98,95,SRC.c200,wirelessControl200())
];

function accessory(id,model,category,compatibleWith,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith,
    compatibilityStatus:'Designed For',sourceUrl,...extra
  };
}
function included(id,model,category,target,sourceUrl){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl
  };
}

export const NANLITE_COMPAC_CURRENT_ACCESSORIES=[
  accessory(
    'nanlite-compac-68-softbox',
    'Compac 68 / 68B Rapid-Fold Collapsible Softbox',
    'Softbox',['nanlite-compac-68b'],SRC.guide
  ),
  accessory(
    'nanlite-compac-68-lantern',
    'Compac 68 / 68B Rapid-Fold Collapsible Lantern Softbox',
    'Lantern',['nanlite-compac-68b'],SRC.guide
  ),
  accessory(
    'nanlite-compac-100-softbox',
    'Compac 100 / 100B Rapid-Fold Collapsible Softbox',
    'Softbox',['nanlite-compac-100b','nanlite-compac-100'],SRC.guide
  ),
  accessory(
    'nanlite-compac-100-lantern',
    'Compac 100 / 100B Rapid-Fold Collapsible Lantern Softbox',
    'Lantern',['nanlite-compac-100b','nanlite-compac-100'],SRC.lantern100,
    {beamAngleDeg:270}
  ),
  accessory(
    'nanlite-compac-200-softbox',
    'Compac 200 / 200B Rapid-Fold Collapsible Softbox',
    'Softbox',['nanlite-compac-200b','nanlite-compac-200'],SRC.guide
  ),
  accessory(
    'nanlite-compac-200-lantern',
    'Compac 200 / 200B Rapid-Fold Collapsible Lantern Softbox',
    'Lantern',['nanlite-compac-200b','nanlite-compac-200'],SRC.guide
  ),
  included('nanlite-compac-68b-power-cable','Compac 68B Power Cable','Cable','nanlite-compac-68b',SRC.c68),
  included('nanlite-compac-100b-power-cable','Compac 100B Power Cable','Cable','nanlite-compac-100b',SRC.c100),
  included('nanlite-compac-200b-power-cable','Compac 200B Power Cable','Cable','nanlite-compac-200b',SRC.c200)
];
