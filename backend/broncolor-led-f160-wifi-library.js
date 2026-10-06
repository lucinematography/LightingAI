// broncolor exact-model Wi-Fi coverage.
// First-party broncolor product/app/software evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  product:'https://broncolor.swiss/products/led-f160',
  app:'https://broncolor.swiss/products/broncontrol-1?variant=1421',
  software:'https://broncolor.swiss/software'
};

function wifiControl(){
  const sources=[SRC.product,SRC.app,SRC.software];
  return {
    wired:[],
    wireless:['Wi-Fi via bronControl'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'broncolor documents Wi-Fi/bronControl operation for LED F160, but LightingAI network command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'broncolor LED F160 Wi-Fi / bronControl',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party broncolor documentation explicitly confirms Wi-Fi and bronControl app operation for the exact LED F160 lamp. LightingAI proprietary network command semantics remain locked.'
      }
    }
  };
}

export const BRONCOLOR_LED_F160_WIFI_FIXTURES=[
  {
    id:'broncolor-led-f160',
    manufacturer:'broncolor',
    model:'LED F160',
    family:'LED F160',
    category:'Light',
    sourceType:'Variable-CCT LED Spotlight',
    formFactor:'Spotlight / Monolight',
    cctK:{min:2800,max:6800},
    colorMode:'CCT / Green-Magenta',
    control:wifiControl(),
    sourceUrl:SRC.product
  }
];
