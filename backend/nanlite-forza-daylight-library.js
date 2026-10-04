// Nanlite daylight Forza current/active catalog block.
// Official Nanlite US sources only.

const SRC={
  f300:'https://nanliteus.com/nanlite-forza-300-ii-led-spotlight-2-light-kit/',
  f500:'https://nanliteus.com/products/forza-500b-ii-led-spotlight',
  f720:'https://nanliteus.com/shop/by-collection/monolight-style/forza-720-720b/',
  case300500:'https://nanliteus.com/products/padded-carrying-case-for-forza-300-ii-and-500-ii',
  case720:'https://nanliteus.com/products/rolling-padded-case-for-forza-720-720b'
};

function control(){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:['Wired DMX interface for DMX512 control'],
    unavailableDirectProtocols:['NANLINK Bluetooth/2.4G protocol is not publicly documented for third-party direct control']
  };
}
function fixture(id,model,powerDrawW,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,family:'Forza Daylight',category:'Light',discontinued:false,
    sourceType:'Daylight LED Spotlight',mount:'Bowens',cctK:{fixed:5600},colorMode:'Daylight',
    powerDrawW,control:control(),sourceUrl,...extra
  };
}

export const NANLITE_FORZA_DAYLIGHT_FIXTURES=[
  fixture('nanlite-forza-300-ii','Forza 300 II',350,SRC.f300,{
    cri:96,tlci:97,batteryPowered:true,
    batteryOptions:['1x or 2x V-Mount via Control Unit','AC mains']
  }),
  fixture('nanlite-forza-500-ii','Forza 500 II',520,SRC.f500,{
    batteryPowered:true,batteryOptions:['1x or 2x V-Mount via Control Unit','AC mains'],
    sourceNote:'Nanlite Forza 500B II page explicitly identifies the daylight-only Forza 500 II as the companion model'
  }),
  fixture('nanlite-forza-720','Forza 720',800,SRC.f720,{
    batteryPowered:true,batteryOptions:['2x V-Mount via Control Unit','AC mains']
  })
];

export const NANLITE_FORZA_DAYLIGHT_ACCESSORIES=[
  {
    id:'nanlite-ccsfz300ii-daylight',manufacturer:'Nanlite',model:'CCSFZ300II Padded Carrying Case',
    category:'Case',compatibleWith:['nanlite-forza-300-ii','nanlite-forza-500-ii'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.case300500
  },
  {
    id:'nanlite-cc-st-fz720-daylight',manufacturer:'Nanlite',model:'CC-ST-FZ720 Rolling Padded Case',
    category:'Case',compatibleWith:['nanlite-forza-720'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.case720
  }
];
