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
function fixture(id,model,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,family:'Forza Daylight',category:'Light',discontinued:false,
    sourceType:'Daylight LED Spotlight',mount:'Bowens',cctK:{fixed:5600},colorMode:'Daylight',
    control:control(),sourceUrl,...extra
  };
}

export const NANLITE_FORZA_DAYLIGHT_FIXTURES=[
  fixture('nanlite-forza-300-ii','Forza 300 II',SRC.f300,{
    cri:96,tlci:97,batteryPowered:true,
    batteryOptions:['1x or 2x V-Mount via Control Unit','AC mains']
  }),
  fixture('nanlite-forza-500-ii','Forza 500 II',SRC.f500,{
    batteryPowered:true,batteryOptions:['1x or 2x V-Mount via Control Unit','AC mains'],
    sourceNote:'Nanlite Forza 500B II page explicitly identifies the daylight-only Forza 500 II as the companion model'
  }),
  fixture('nanlite-forza-720','Forza 720',SRC.f720,{
    batteryPowered:true,batteryOptions:['2x V-Mount via Control Unit','AC mains']
  })
];

export const NANLITE_FORZA_DAYLIGHT_ACCESSORIES=[];
