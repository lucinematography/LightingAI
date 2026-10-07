// Newell exact-model Bluetooth fixture coverage.
// First-party Newell product evidence only.
// Bluetooth transport is exact-model scoped; proprietary BLE/GATT/session semantics remain fail-closed.
const SRC={
  pravaha:'https://uk.newell.pro/products/newell-pravaha-max-135-rgb-led-light',
  zora:'https://newell.pro/product/newell-zora-mini-40-rgb-led-light/'
};

function bluetoothControl(sourceUrl,model){
  const sourceUrls=[sourceUrl];
  return {
    wired:[],
    wireless:['Bluetooth via Newell smartphone app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Newell documents Bluetooth smartphone-app control for '+model+', but LightingAI BLE discovery, service/characteristic UUIDs, pairing, session and private payload semantics are not production-verified',
      'Do not infer command compatibility across Newell fixtures without exact-model physical capture/replay evidence'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Newell direct Bluetooth app control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Newell exact-model product documentation explicitly confirms Bluetooth smartphone-app control. LightingAI proprietary BLE/GATT semantics remain locked.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Newell documents app-based brightness control for this exact model.'},
      cct:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Newell documents variable CCT control for this exact model.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Newell documents RGB/HSI color control for this exact model.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Newell documents app-configurable special effects for this exact model.'}
    }
  };
}

export const NEWELL_BLUETOOTH_FIXTURES=[
  {
    id:'newell-pravaha-max-135-rgb',
    manufacturer:'Newell',
    model:'Pravaha Max 135 RGB',
    family:'Pravaha',
    category:'Light',
    sourceType:'RGB LED Spotlight',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGB / HSI / CCT',
    powerDrawW:135,
    cctK:{min:2700,max:6500},
    cri:97,
    control:bluetoothControl(SRC.pravaha,'Pravaha Max 135 RGB'),
    sourceUrl:SRC.pravaha
  },
  {
    id:'newell-zora-mini-40-rgb',
    manufacturer:'Newell',
    model:'Zora Mini 40 RGB',
    family:'Zora',
    category:'Light',
    sourceType:'RGBWW COB LED Light',
    formFactor:'Pocket / Handheld',
    colorMode:'RGBWW / HSI / CCT',
    powerDrawW:40,
    cctK:{min:2700,max:6500},
    cri:96,
    control:bluetoothControl(SRC.zora,'Zora Mini 40 RGB'),
    sourceUrl:SRC.zora
  }
];
