// Nanoleaf Lines exact-model Wi-Fi practical-light coverage.
// First-party Nanoleaf product evidence only.
// Wi-Fi is the production app-control transport; Bluetooth is setup-only and is not counted as a lighting-control transport.
const SRC={
  lines:'https://nanoleaf.me/en-us/products/nanoleaf-lines'
};

function wifiControl(sourceUrl){
  const sourceUrls=[sourceUrl];
  return {
    wired:[],
    wireless:['Wi-Fi via Nanoleaf App'],
    builtInWifi:true,
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Nanoleaf documents Wi-Fi app control for Lines and explicitly identifies Bluetooth as required for setup; Bluetooth must not be promoted to production light-control transport',
      'LightingAI exact local API discovery, authentication/session handling and private payload semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'Nanoleaf Lines Wi-Fi app control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Nanoleaf Lines tech specs explicitly confirm 2.4 GHz Wi-Fi connectivity and Nanoleaf App control. Bluetooth is setup-only. LightingAI proprietary network/session semantics remain locked.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Nanoleaf Lines officially supports brightness control.'},
      cct:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Nanoleaf Lines officially supports white control from 1200K to 6500K.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Nanoleaf Lines officially supports RGBW color control with 16M+ colors.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Nanoleaf Lines officially supports scenes, dynamic scenes, rhythm scenes and screen/music sync.'}
    }
  };
}

export const NANOLEAF_LINES_WIFI_FIXTURES=[
  {
    id:'nanoleaf-lines',
    manufacturer:'Nanoleaf',
    model:'Lines',
    family:'Nanoleaf Lines',
    category:'Light',
    sourceType:'RGBW Smart Light Bars',
    formFactor:'Linear Light Bar',
    colorMode:'RGBW / CCT',
    cctK:{min:1200,max:6500},
    cri:80,
    control:wifiControl(SRC.lines),
    sourceUrl:SRC.lines
  }
];
