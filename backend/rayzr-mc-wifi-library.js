// RAYZR exact-model Wi-Fi fixture coverage.
// First-party RAYZR product/specification evidence only.
// Built-in Wi-Fi transport is exact-model scoped; RTctrl-1 Art-Net integration remains a separate assisted network path.
const SRC={
  mc:'https://rayzrlight.com/mc-panel',
  spec:'https://rayzrlight.com/mc-specification',
  mc400:'https://rayzrlight.com/mc-max',
  home:'https://rayzrlight.com/'
};

function wifiControl(sourceUrls,model){
  return {
    wired:['DMX512'],
    wireless:['Built-in Wi-Fi'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:['RAYZR RTctrl-1 router for documented Art-Net network integration'],
    unavailableDirectProtocols:[
      'RAYZR documents built-in Wi-Fi for '+model+', but LightingAI exact discovery, addressing, session handling and any private wireless payload semantics are not production-verified',
      'RTctrl-1 Art-Net integration is a separate assisted network path and must not be treated as proof of undocumented direct fixture Art-Net/session semantics'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'RAYZR MC built-in Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party RAYZR MC documentation explicitly states Wi-Fi is built in for the MC series. LightingAI exact network/session semantics and physical replay remain locked.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'RAYZR documents dimming curves and fixture-level output control.'},
      cct:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'RAYZR documents variable CCT from 2400K to 9900K for the MC series.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'RAYZR documents RGBWW, HSI, x/y, gel and RGBWW color modes for the MC series.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'RAYZR documents built-in adjustable lighting effects for the MC series.'}
    }
  };
}

function fixture(id,model,powerDrawW,sourceUrl=SRC.mc){
  const sourceUrls=[sourceUrl,SRC.spec,SRC.home];
  return {
    id,
    manufacturer:'RAYZR',
    model,
    family:'MC',
    category:'Light',
    sourceType:'RGBWW LED Soft Panel',
    formFactor:'Panel',
    colorMode:'RGBWW / HSI / CCT',
    powerDrawW,
    cctK:{min:2400,max:9900},
    cri:96,
    tlci:98,
    control:wifiControl(sourceUrls,model),
    sourceUrl
  };
}

export const RAYZR_MC_WIFI_FIXTURES=[
  fixture('rayzr-mc-100','MC 100',98),
  fixture('rayzr-mc-120','MC 120',118),
  fixture('rayzr-mc-200','MC 200',190),
  fixture('rayzr-mc-400-max','MC 400 Max',400,SRC.mc400)
];
