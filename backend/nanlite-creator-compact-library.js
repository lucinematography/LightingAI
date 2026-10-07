// Nanlite current compact creator-light family: cookie, cookie-s, lumo.
// Official Nanlite US sources only.

const SRC={
  cookie:'https://nanliteus.com/products/cookie-usb-c-plug-in-round-led-light-cyan-blue',
  cookieS:'https://nanliteus.com/products/cookie-s-usb-c-plug-in-square-led-light-coral-pink',
  lumo:'https://nanliteus.com/products/lumo-phone-ring-light-mint-blue-magsafe-compatible'
};

function localOnly(){
  return {
    wired:[],wireless:[],builtInBluetooth:false,builtInCRMX:false,
    directLightingAI:[],externalInterfaceRequired:[],
    unavailableDirectProtocols:['No remote-control protocol is listed for this creator light']
  };
}

export const NANLITE_CREATOR_COMPACT_FIXTURES=[
  {
    id:'nanlite-cookie',manufacturer:'Nanlite',model:'cookie USB-C Plug-In Round LED Light',
    family:'Creator Lights',category:'Light',discontinued:false,
    sourceType:'Dual-Sided USB-C LED Light',colorMode:'White presets',
    cri:95,tlci:98,batteryPowered:false,powerMode:'Powered directly by USB-C host device',
    control:localOnly(),sourceUrl:SRC.cookie
  },
  {
    id:'nanlite-cookie-s',manufacturer:'Nanlite',model:'cookie-s USB-C Plug-In Square LED Light',
    family:'Creator Lights',category:'Light',discontinued:false,
    sourceType:'Dual-Sided USB-C LED Light',colorMode:'White presets',
    cri:95,tlci:98,batteryPowered:false,powerMode:'Powered directly by USB-C host device',
    control:localOnly(),sourceUrl:SRC.cookieS
  },
  {
    id:'nanlite-lumo',manufacturer:'Nanlite',model:'lumo Phone Ring Light',
    family:'Creator Lights',category:'Light',discontinued:false,
    sourceType:'WW Phone Ring Light',colorMode:'3 CCT presets',
    cctK:{presets:[3200,4300,5600]},beamAngleDeg:120,cri:97,tlci:98,
    batteryPowered:true,batteryMah:145,
    powerOptions:['Built-in 3.7V 145mAh battery','USB 5V/1A charging'],
    mount:'MagSafe / included stick-on magnetic ring',
    control:localOnly(),sourceUrl:SRC.lumo
  }
];

function included(id,model,category,target,sourceUrl,extra={}){
  return {id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl,...extra};
}

export const NANLITE_CREATOR_COMPACT_ACCESSORIES=[
  included('nanlite-cookie-case','cookie Carrying Case','Case','nanlite-cookie',SRC.cookie),
  included('nanlite-cookie-s-case','cookie-s Carrying Case','Case','nanlite-cookie-s',SRC.cookieS),
  included('nanlite-lumo-magnetic-ring','lumo Stick-On Magnetic Ring','Mount','nanlite-lumo',SRC.lumo)
];
