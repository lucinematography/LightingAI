// Kenro exact-model direct-Bluetooth lighting coverage.
// First-party Kenro product evidence only.
// Transport and operator capabilities are model-scoped; proprietary Bluetooth command/session semantics remain fail-closed.
const SRC={
  kslp102:'https://www.kenro.ie/products/kenro-smart-lite-rgb-compact-led-video-light',
  kslp103:'https://www.kenro.ie/products/kenro-smart-lite-rgb-video-light-panel',
  kslr101:'https://www.kenro.ie/products/kenro-smart-lite-19-rgb-ring-light-kit-9'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Kenro documents LightSystem app brightness control for this exact model. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Kenro documents LightSystem app color-temperature control for this exact model. This proves operator capability only.'},
    color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Kenro documents LightSystem app RGB/saturation control for this exact model. This proves operator capability only.'},
    fx:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Kenro documents LightSystem app special-effect control for this exact model. This proves operator capability only.'}
  };
}

function bluetoothControl(sourceUrl,model){
  const sourceUrls=[sourceUrl];
  return {
    wired:[],
    wireless:['Bluetooth via Kenro LightSystem app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Kenro documents Bluetooth LightSystem app control for '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Kenro LightSystem Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Kenro exact-model documentation explicitly confirms Bluetooth smartphone-app control. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

export const KENRO_BLUETOOTH_FIXTURES=[
  {
    id:'kenro-kslp102',
    manufacturer:'Kenro',
    model:'KSLP102',
    family:'Smart Lite',
    category:'Light',
    sourceType:'RGB Compact LED Video Light',
    formFactor:'Pocket / On-Camera Light',
    colorMode:'RGB / CCT / FX',
    powerDrawW:10,
    cctK:{min:3200,max:7500},
    cri:96,
    control:bluetoothControl(SRC.kslp102,'KSLP102'),
    sourceUrl:SRC.kslp102
  },
  {
    id:'kenro-kslp103',
    manufacturer:'Kenro',
    model:'KSLP103',
    family:'Smart Lite',
    category:'Light',
    sourceType:'RGB LED Video Light Panel',
    formFactor:'Panel',
    colorMode:'RGB / CCT / FX',
    powerDrawW:60,
    cctK:{min:3200,max:7500},
    cri:96,
    control:bluetoothControl(SRC.kslp103,'KSLP103'),
    sourceUrl:SRC.kslp103
  },
  {
    id:'kenro-kslr101',
    manufacturer:'Kenro',
    model:'KSLR101',
    family:'Smart Lite',
    category:'Light',
    sourceType:'RGB Ring Light',
    formFactor:'Ring Light',
    colorMode:'RGB / CCT / FX',
    powerDrawW:60,
    cctK:{min:3200,max:7500},
    cri:96,
    control:bluetoothControl(SRC.kslr101,'KSLR101'),
    sourceUrl:SRC.kslr101
  }
];
