// Nanlite legacy daylight Compac panels.
// Official Nanlite US sources only.

const SRC={
  guide:'https://nanliteus.com/blogs/learn/nanlite-compac-series-a-deeper-look',
  current:'https://nanliteus.com/collections/compac'
};

function localOnly(){
  return {
    wired:[],wireless:[],builtInBluetooth:false,builtInCRMX:false,
    directLightingAI:[],externalInterfaceRequired:[],
    unavailableDirectProtocols:['No remote-control protocol is documented for this legacy fixture']
  };
}
function w2Control(){
  return {
    wired:[],wireless:['Wi-Fi via Nanlite W-2 adapter / NANLINK app'],
    builtInBluetooth:false,builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:['Nanlite W-2 Wi-Fi adapter'],
    unavailableDirectProtocols:['W-2/NANLINK Wi-Fi protocol is not publicly documented for third-party direct control']
  };
}

export const NANLITE_COMPAC_DAYLIGHT_LEGACY_FIXTURES=[
  {
    id:'nanlite-compac-100',manufacturer:'Nanlite',model:'Compac 100',
    family:'Compac',category:'Light',discontinued:true,lifecycleStatus:'legacy/discontinued',
    lifecycleEvidenceUrl:SRC.current,
    sourceType:'Daylight LED Panel',cctK:{fixed:5600},colorMode:'Daylight',
    batteryPowered:false,powerMode:'AC only',control:localOnly(),sourceUrl:SRC.guide
  },
  {
    id:'nanlite-compac-200',manufacturer:'Nanlite',model:'Compac 200',
    family:'Compac',category:'Light',discontinued:true,lifecycleStatus:'legacy/discontinued',
    lifecycleEvidenceUrl:SRC.current,
    sourceType:'Daylight LED Panel',cctK:{fixed:5600},colorMode:'Daylight',
    batteryPowered:false,powerMode:'AC only',control:w2Control(),sourceUrl:SRC.guide
  }
];

export const NANLITE_COMPAC_DAYLIGHT_LEGACY_ACCESSORIES=[
  {
    id:'nanlite-w-2-wifi-adapter',manufacturer:'Nanlite',model:'W-2 Wi-Fi Adapter',
    category:'Control',compatibleWith:['nanlite-compac-200','nanlite-compac-200b','nanlite-mixpanel-60'],
    compatibilityStatus:'Compatible',
    conditions:['Enables documented Wi-Fi control on supported legacy Nanlite fixtures'],
    sourceUrl:SRC.guide
  }
];
