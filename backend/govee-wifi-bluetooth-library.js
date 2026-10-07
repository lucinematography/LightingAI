// Govee exact-model direct Wi-Fi + Bluetooth light-bar coverage.
// First-party Govee product evidence only.
// Transport capability is exact-model scoped; proprietary app/session/protocol semantics remain fail-closed.
const SRC={
  h6056:'https://eu.govee.com/products/govee-rgbicww-wifi-bluetooth-flow-plus-light-bars',
  h6047:'https://eu.govee.com/products/govee-rgbic-wi-fi-gaming-light-bars-with-smart-controller'
};

function control(sourceUrl,model,{cct=false}={}){
  const sourceUrls=[sourceUrl];
  const capabilityVerification={
    dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Govee documents app-based brightness/light control for this exact model.'},
    color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Govee documents RGBIC/RGBICWW color customization for this exact model.'},
    fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Govee documents scene/effect modes for this exact model.'}
  };
  if(cct) capabilityVerification.cct={verified:true,scope:'official-product-capability-only',sourceUrls,note:'Govee documents tunable warm-to-cool white for H6056.'};
  return {
    wired:[],
    wireless:['Bluetooth via Govee Home App','Wi-Fi via Govee Home App'],
    builtInBluetooth:true,
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Govee documents direct Wi-Fi/Bluetooth app control for '+model+', but LightingAI BLE/GATT, local Wi-Fi API, discovery, pairing/session and private payload semantics are not production-verified',
      'Do not infer command compatibility between H6056 and H6047 without physical capture/replay evidence'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Govee Home direct Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Govee exact-model documentation confirms direct Bluetooth app control. LightingAI proprietary semantics remain locked.'
      },
      wifi:{
        verified:true,
        family:'Govee Home direct Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Govee exact-model documentation confirms direct Wi-Fi app control without a hub. LightingAI proprietary semantics remain locked.'
      }
    },
    capabilityVerification
  };
}

export const GOVEE_WIFI_BLUETOOTH_FIXTURES=[
  {
    id:'govee-h6056-flow-plus-light-bars',
    manufacturer:'Govee',
    model:'H6056 Flow Plus Light Bars',
    family:'Flow Plus',
    category:'Light',
    sourceType:'RGBICWW Smart Light Bar',
    formFactor:'Linear Light Bar',
    colorMode:'RGBICWW / CCT',
    control:control(SRC.h6056,'H6056',{cct:true}),
    sourceUrl:SRC.h6056
  },
  {
    id:'govee-h6047-rgbic-gaming-light-bars',
    manufacturer:'Govee',
    model:'H6047 RGBIC Wi-Fi Gaming Light Bars',
    family:'Gaming Light Bars',
    category:'Light',
    sourceType:'RGBIC Smart Light Bar',
    formFactor:'Linear Light Bar',
    colorMode:'RGBIC',
    control:control(SRC.h6047,'H6047'),
    sourceUrl:SRC.h6047
  }
];
