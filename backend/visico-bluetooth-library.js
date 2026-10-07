// VISICO exact-model Bluetooth fixture coverage.
// First-party VISICO product, app and support evidence only.
// Bluetooth transport is exact-model scoped; proprietary BLE/GATT/session semantics remain fail-closed.
const SRC={
  p70r:'https://www.visico.com/255.htm',
  p60rii:'https://www.visico.com/140.htm',
  kd2rx:'https://www.visico.com/474.htm',
  kd2rxProduct:'https://www.visico.com/479.htm',
  app:'https://www.visico.com/250.htm',
  faq:'https://www.visico.com/faq_39/'
};

function bluetoothControl(sourceUrls,capabilities){
  return {
    wired:[],
    wireless:['Bluetooth via VISICO LIGHT App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'VISICO documents exact-model mobile app control and its first-party app support requires Bluetooth for device connection, but LightingAI BLE discovery, service/characteristic UUIDs, pairing, session and private payload semantics are not production-verified',
      'Do not infer command equivalence between VISICO models without physical capture/replay evidence'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'VISICO LIGHT direct Bluetooth app control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party VISICO exact-model app-control evidence plus VISICO support guidance confirm Bluetooth is required for app-to-device connection. LightingAI proprietary BLE/GATT semantics remain locked.'
      }
    },
    capabilityVerification:capabilities
  };
}

const commonRgbCaps=(sourceUrls)=>({
  dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'VISICO documents 0-100 brightness control for this exact model.'},
  cct:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'VISICO documents 2700K-6500K variable CCT for this exact model.'},
  color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'VISICO documents HSI/RGB control for this exact model.'},
  fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'VISICO documents built-in FX modes for this exact model.'}
});

const p70Sources=[SRC.p70r,SRC.app,SRC.faq];
const p60Sources=[SRC.p60rii,SRC.app,SRC.faq];
const kdSources=[SRC.kd2rx,SRC.kd2rxProduct,SRC.app,SRC.faq];

export const VISICO_BLUETOOTH_FIXTURES=[
  {
    id:'visico-p70r',
    manufacturer:'VISICO',
    model:'P-70R',
    family:'P RGB LED Stick',
    category:'Light',
    sourceType:'RGB LED Stick',
    formFactor:'Tube',
    colorMode:'RGB / HSI / CCT',
    powerDrawW:20,
    cctK:{min:2700,max:6500},
    cri:95,
    tlci:98,
    control:bluetoothControl(p70Sources,commonRgbCaps(p70Sources)),
    sourceUrl:SRC.p70r
  },
  {
    id:'visico-p60rii',
    manufacturer:'VISICO',
    model:'P60R II',
    family:'P RGB LED Stick',
    category:'Light',
    sourceType:'RGB LED Stick',
    formFactor:'Tube',
    colorMode:'RGB / HSI / CCT',
    powerDrawW:12,
    cctK:{min:2700,max:6500},
    cri:95,
    tlci:98,
    control:bluetoothControl(p60Sources,commonRgbCaps(p60Sources)),
    sourceUrl:SRC.p60rii
  },
  {
    id:'visico-kd-2rx',
    manufacturer:'VISICO',
    model:'KD-2RX',
    family:'KD Pixel',
    category:'Light',
    sourceType:'Pixel Fill Light',
    formFactor:'Pocket / Handheld',
    colorMode:'Variable CCT / Pixel FX',
    cctK:{min:2700,max:10000},
    cri:96,
    tlci:97,
    control:bluetoothControl(kdSources,{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls:kdSources,note:'VISICO documents 0-100 brightness adjustment for KD-2RX.'},
      cct:{verified:true,scope:'official-product-capability-only',sourceUrls:kdSources,note:'VISICO documents 2700K-10000K variable CCT for KD-2RX.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls:kdSources,note:'VISICO documents five pixel zones, 12 pixel effects and 15 FX effects for KD-2RX.'}
    }),
    sourceUrl:SRC.kd2rx
  }
];
