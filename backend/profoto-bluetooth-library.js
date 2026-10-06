// Profoto exact-model direct-Bluetooth continuous-light coverage.
// First-party Profoto support/product evidence only.
// Transport and operator capabilities are model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  b10Support:'https://support.profoto.com/support/solutions/articles/79000071121-does-the-b10-b10-plus-have-bluetooth-and-is-the-b10-b10-plus-compatible-with-the-profoto-app-',
  b10Guide:'https://profoto.com/globalassets/support/user-guides/b10-and-b10-plus/profoto-b10--b10-plus-user-guide-english.pdf',
  b10xProduct:'https://www.profoto.com/int/en/shop/products/lights/monolights/battery-powered/profoto-b10x-and-b10x-plus/',
  b10xGuide:'https://profoto.com/globalassets/support/user-guides/b10x-and-b10x-plus/profoto-b10x--b10x-plus-user-guide-english.pdf',
  continuousControl:'https://support.profoto.com/support/solutions/articles/79000117433-how-do-i-activate-and-adjust-the-continuous-light-on-my-profoto-device-'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Profoto documents smartphone/app brightness control of the continuous/modeling light for this exact B-series scope. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Profoto documents app-adjustable continuous-light color temperature for this exact B-series scope. This proves operator capability only.'}
  };
}

function bluetoothControl(sourceUrls,model){
  return {
    wired:[],
    wireless:['Bluetooth via Profoto app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Profoto documents direct Bluetooth app control for '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified',
      'Profoto Air/AirX radio functionality is not classified as Wi-Fi in this Bluetooth/Wi-Fi catalog checkpoint'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Profoto app Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Profoto documentation explicitly confirms Bluetooth connectivity with Profoto Camera/Control for this exact B-series model scope. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

export const PROFOTO_BLUETOOTH_FIXTURES=[
  {
    id:'profoto-b10',
    manufacturer:'Profoto',
    model:'B10',
    family:'B Series',
    category:'Light',
    sourceType:'Battery Monolight with Tunable Continuous LED',
    formFactor:'Monolight',
    colorMode:'Bi-Color',
    cctK:{min:3000,max:6500},
    cri:90,
    control:bluetoothControl([SRC.b10Support,SRC.b10Guide,SRC.continuousControl],'B10'),
    sourceUrl:SRC.b10Guide
  },
  {
    id:'profoto-b10-plus',
    manufacturer:'Profoto',
    model:'B10 Plus',
    family:'B Series',
    category:'Light',
    sourceType:'Battery Monolight with Tunable Continuous LED',
    formFactor:'Monolight',
    colorMode:'Bi-Color',
    cctK:{min:3000,max:6500},
    cri:90,
    control:bluetoothControl([SRC.b10Support,SRC.b10Guide,SRC.continuousControl],'B10 Plus'),
    sourceUrl:SRC.b10Guide
  },
  {
    id:'profoto-b10x',
    manufacturer:'Profoto',
    model:'B10X',
    family:'B Series',
    category:'Light',
    sourceType:'Battery Monolight with Tunable Continuous LED',
    formFactor:'Monolight',
    colorMode:'Bi-Color',
    cctK:{min:3000,max:6500},
    cri:90,
    control:bluetoothControl([SRC.b10xProduct,SRC.b10xGuide,SRC.continuousControl],'B10X'),
    sourceUrl:SRC.b10xProduct
  },
  {
    id:'profoto-b10x-plus',
    manufacturer:'Profoto',
    model:'B10X Plus',
    family:'B Series',
    category:'Light',
    sourceType:'Battery Monolight with Tunable Continuous LED',
    formFactor:'Monolight',
    colorMode:'Bi-Color',
    cctK:{min:3000,max:6500},
    cri:90,
    control:bluetoothControl([SRC.b10xProduct,SRC.b10xGuide,SRC.continuousControl],'B10X Plus'),
    sourceUrl:SRC.b10xProduct
  }
];
