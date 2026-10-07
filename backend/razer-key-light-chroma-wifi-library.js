// Razer exact-model Wi-Fi lighting coverage.
// First-party Razer product/support evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  product:'https://www.razer.com/streaming-accessories/razer-key-light-chroma',
  customize:'https://mysupport.razer.com/app/answers/detail/a_id/5911/~/how-to-customize-the-razer-key-light-chroma',
  wifi:'https://mysupport.razer.com/app/answers/detail/a_id/6194/~/how-to-add-wi-fi-devices-on-razer-synapse-3',
  support:'https://mysupport.razer.com/app/answers/detail/a_id/5907/kw/Synapse%2B3%2BMac%2BOS'
};

function wifiControl(){
  const sources=[SRC.product,SRC.customize,SRC.wifi,SRC.support];
  return {
    wired:[],
    wireless:['2.4 GHz Wi-Fi via Razer Streaming App / Razer Synapse'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Razer documents Wi-Fi app control for Key Light Chroma, but LightingAI network command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'Razer Key Light Chroma Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party Razer product/support documentation explicitly confirms 2.4 GHz Wi-Fi control via Razer Streaming App or Razer Synapse for exact model RZ19-0412. LightingAI proprietary network command semantics remain locked.'
      }
    }
  };
}

export const RAZER_KEY_LIGHT_CHROMA_WIFI_FIXTURES=[
  {
    id:'razer-key-light-chroma-rz19-0412',
    manufacturer:'Razer',
    model:'Key Light Chroma (RZ19-0412)',
    family:'Key Light Chroma',
    category:'Light',
    sourceType:'RGB LED Streaming Key Light',
    formFactor:'Panel',
    cctK:{min:3000,max:7000},
    colorMode:'RGB / CCT / Chroma FX',
    control:wifiControl(),
    sourceUrl:SRC.product
  }
];
