// Photoolex exact-model Bluetooth lighting coverage.
// First-party Photoolex product/app evidence plus Phottix x Photoolex compatibility evidence.
// Bluetooth transport is exact-model scoped; proprietary BLE/GATT/session semantics remain fail-closed.
const SRC={
  q40c:'https://photoolex.com/products/photoolex-q40c-40w-rgb-led-video-light',
  q100c:'https://photoolex.com/products/photoolex-q100c-100w-rgb-cob-light',
  app:'https://photoolex.com/pages/app-download',
  phottixJoint:'https://www.phottix.com/phottix-x-photoolex-app-download/'
};

function bluetoothControl(sourceUrls,model){
  return {
    wired:[],
    wireless:['Bluetooth via PHOTOOLEX / Phottix x Photoolex App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Photoolex app control and first-party Phottix x Photoolex Bluetooth compatibility are documented for '+model+', but LightingAI BLE discovery, service/characteristic UUIDs, pairing and private payload/session semantics are not production-verified',
      'Do not infer command equivalence between Q40C and Q100C without physical capture and replay evidence'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Photoolex direct Bluetooth app control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'Photoolex product/app pages plus the first-party Phottix x Photoolex compatibility page verify app control and direct Bluetooth connection for this exact model. LightingAI proprietary BLE/GATT semantics remain locked.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Photoolex documents brightness adjustment for this exact model.'},
      cct:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Photoolex documents variable CCT control for this exact model.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Photoolex documents RGB/HSI color control for this exact model.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Photoolex documents built-in effects and app effect control for this exact model.'}
    }
  };
}

export const PHOTOOLEX_BLUETOOTH_FIXTURES=[
  {
    id:'photoolex-q40c',
    manufacturer:'Photoolex',
    model:'Q40C',
    family:'Quantum',
    category:'Light',
    sourceType:'RGB LED Spotlight',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGB / HSI / CCT',
    powerDrawW:40,
    cctK:{min:2700,max:6500},
    control:bluetoothControl([SRC.q40c,SRC.app,SRC.phottixJoint],'Q40C'),
    sourceUrl:SRC.q40c
  },
  {
    id:'photoolex-q100c',
    manufacturer:'Photoolex',
    model:'Q100C',
    family:'Quantum',
    category:'Light',
    sourceType:'RGB COB Spotlight',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGB / HSI / CCT',
    powerDrawW:100,
    cctK:{min:2700,max:6500},
    control:bluetoothControl([SRC.q100c,SRC.app,SRC.phottixJoint],'Q100C'),
    sourceUrl:SRC.q100c
  }
];
