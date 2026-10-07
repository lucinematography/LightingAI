// VELVET EVO exact-model Bluetooth/Wi-Fi coverage.
// First-party VELVET product/support sources only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  evo:'https://www.velvetlight.tv/velvet-evo/',
  series:'https://www.velvetlight.tv/serie/evo/',
  support:'https://www.velvetlight.tv/support/'
};

function control({bluetooth,wifi,note}){
  const wireless=[];
  if(bluetooth) wireless.push('Bluetooth via VELVET GOYA App');
  if(wifi) wireless.push('Wi-Fi Art-Net via VELVET GOYA App');
  const verification={};
  if(bluetooth){
    verification.bluetooth={
      verified:true,
      family:'VELVET EVO Bluetooth / GOYA',
      scope:'transport-capability-only',
      sourceUrls:[SRC.evo,SRC.series,SRC.support],
      note:'First-party VELVET documentation explicitly confirms Bluetooth for this exact EVO model. LightingAI proprietary command semantics remain locked.'
    };
  }
  if(wifi){
    verification.wifi={
      verified:true,
      family:'VELVET EVO Wi-Fi Art-Net / GOYA',
      scope:'transport-capability-only',
      sourceUrls:[SRC.evo,SRC.series,SRC.support],
      note:'First-party VELVET documentation explicitly confirms Wi-Fi Art-Net for this exact EVO model. LightingAI proprietary session semantics remain locked.'
    };
  }
  return {
    wired:[],
    wireless,
    builtInBluetooth:Boolean(bluetooth),
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      note || 'VELVET documents wireless transport, but LightingAI proprietary command/session semantics are not production-verified'
    ],
    sourceUrls:[SRC.evo,SRC.series,SRC.support],
    wirelessVerification:verification
  };
}

function fixture(id,model,bluetooth,wifi,powerDrawW){
  return {
    id,
    manufacturer:'VELVET',
    model,
    family:'EVO',
    category:'Light',
    sourceType:'R+G+B+W+CW LED Soft Panel',
    formFactor:'Panel',
    cctK:{min:2500,max:10000},
    colorMode:'R+G+B+W+CW Full Color',
    powerDrawW,
    control:control({
      bluetooth,
      wifi,
      note: bluetooth
        ? 'VELVET documents Bluetooth and Wi-Fi Art-Net transport, but LightingAI proprietary command/session semantics are not production-verified'
        : 'Exact VELVET Studio specification verifies Wi-Fi Art-Net; Bluetooth is not claimed for this model in this catalog checkpoint'
    }),
    sourceUrl:SRC.evo
  };
}

export const VELVET_EVO_WIRELESS_FIXTURES=[
  fixture('velvet-evo-1-ip54','EVO 1 IP54',true,true,112),
  fixture('velvet-evo-1-studio','EVO 1 Studio',false,true,112),
  fixture('velvet-evo-2-ip54','EVO 2 IP54',true,true,225),
  fixture('velvet-evo-2-studio','EVO 2 Studio',false,true,225),
  fixture('velvet-evo-2x2-ip54','EVO 2x2 IP54',true,true,403),
  fixture('velvet-evo-2x2-studio','EVO 2x2 Studio',true,true,403)
];
