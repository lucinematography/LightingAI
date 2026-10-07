// LIFX exact-model Wi-Fi linear/practical-light coverage.
// First-party LIFX product evidence only.
// Wi-Fi transport is exact-model scoped; proprietary local-network/session semantics remain fail-closed.
const SRC={
  beam:'https://www.lifx.com/products/lifx-beam-6pc-kit',
  strip80:'https://www.lifx.com/products/lightstrip-80-kit',
  app:'https://www.lifx.com/pages/app'
};

function wifiControl(sourceUrls,model){
  return {
    wired:[],
    wireless:['Wi-Fi via LIFX App'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'LIFX documents direct 2.4 GHz Wi-Fi app control for '+model+', but LightingAI local discovery, authentication/session state and private payload semantics are not production-verified',
      'Do not infer command equivalence between Beam and Lightstrip families without physical capture/replay evidence'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'LIFX direct Wi-Fi app control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party LIFX exact-model documentation confirms direct Wi-Fi app control with no separate hub. LightingAI proprietary local-network/session semantics remain locked.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'LIFX documents software/app dimming for this exact model.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'LIFX documents multicolor/Polychrome control for this exact model.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'LIFX documents app scenes/effects for this exact model.'}
    }
  };
}

export const LIFX_WIFI_FIXTURES=[
  {
    id:'lifx-supercolor-magnetic-beam-6-piece-kit',
    manufacturer:'LIFX',
    model:'SuperColor Magnetic Beam 6 Piece Kit',
    family:'Beam',
    category:'Light',
    sourceType:'Polychrome LED Beam',
    formFactor:'Linear Light Bar',
    colorMode:'Polychrome / Tunable White',
    powerDrawW:33,
    cctK:{min:1500,max:9000},
    cri:80,
    control:wifiControl([SRC.beam,SRC.app],'SuperColor Magnetic Beam 6 Piece Kit'),
    sourceUrl:SRC.beam
  },
  {
    id:'lifx-supercolor-80-lightstrip-kit',
    manufacturer:'LIFX',
    model:'SuperColor 80" Lightstrip Kit',
    family:'SuperColor Lightstrip',
    category:'Light',
    sourceType:'Polychrome LED Lightstrip',
    formFactor:'Linear Wash / Bar',
    colorMode:'Polychrome / Tunable White',
    control:wifiControl([SRC.strip80,SRC.app],'SuperColor 80" Lightstrip Kit'),
    sourceUrl:SRC.strip80
  }
];
