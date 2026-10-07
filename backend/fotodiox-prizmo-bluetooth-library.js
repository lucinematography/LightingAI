// Fotodiox exact-model Bluetooth coverage.
// First-party Fotodiox product/blog evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  product:'https://fotodioxpro.com/products/pzm-st512',
  blog:'https://fotodioxpro.com/blogs/news/the-prizmo-stick-512-our-most-compact-tube-light'
};

function bluetoothControl(){
  return {
    wired:[],
    wireless:['Bluetooth via Fotodiox Lighting Control App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Fotodiox documents Bluetooth app control for Prizmo Stick 512, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[SRC.product,SRC.blog],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Fotodiox Prizmo Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[SRC.product,SRC.blog],
        note:'First-party Fotodiox documentation explicitly states Prizmo Stick 512 can be controlled from the phone through a Bluetooth app. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

export const FOTODIOX_PRIZMO_BLUETOOTH_FIXTURES=[
  {
    id:'fotodiox-prizmo-stick-512',
    manufacturer:'Fotodiox',
    model:'Prizmo Stick 512',
    family:'Prizmo',
    category:'Light',
    sourceType:'RGBW+T LED Tube Light',
    formFactor:'Tube',
    cctK:{min:2700,max:6500},
    colorMode:'RGB / HSI / CCT',
    powerDrawW:14,
    control:bluetoothControl(),
    sourceUrl:SRC.product
  }
];
