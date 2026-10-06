// ZOLAR exact-model Bluetooth + Wi-Fi lighting coverage.
// First-party Z CAM / ZOLAR product evidence only.
// Transport capabilities are exact-model scoped; proprietary app/BLE/session semantics remain fail-closed.
const SRC={
  blade60c:'https://www.z-cam.com/products/led-light-panels/zolar-blade-60c/',
  toliman30c:'https://www.z-cam.com/products/led-light-panels/zolar-toliman-30c/',
  vega30c:'https://www.z-cam.com/products/led-light-panels/zolar-vega-30c/',
  lineup:'https://www.z-cam.com/products/led-light-panels/zolar/'
};

function capabilityVerification(sourceUrls,{color=false}={}){
  const out={
    dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'ZOLAR documents 0-100% dimming together with Bluetooth/Wi-Fi control for this exact model. This proves operator capability only, not LightingAI proprietary app command encoding.'},
    cct:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'ZOLAR documents tunable CCT together with Bluetooth/Wi-Fi control for this exact model. This proves operator capability only.'}
  };
  if(color){
    out.color={verified:true,scope:'official-product-capability-only',sourceUrls,note:'ZOLAR documents full RGBAW color control together with Bluetooth/Wi-Fi control for this exact model. This proves operator capability only.'};
  }
  return out;
}

function wirelessControl(sourceUrls,model,{color=false}={}){
  return {
    wired:['DMX512','RDM','Ethernet / Art-Net 4 / sACN'],
    wireless:['Bluetooth via ZOLAR Mobile App','Wi-Fi via ZOLAR Mobile App','Wi-Fi / Art-Net 4 / sACN','ZolarLink wireless sync'],
    builtInBluetooth:true,
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'ZOLAR documents Bluetooth and Wi-Fi control for '+model+', but LightingAI proprietary BLE/GATT discovery, pairing, service/characteristic UUIDs, app session flow and private payload semantics are not production-verified',
      'Art-Net 4 and sACN availability is documented, but exact-model network configuration, addressing and physical LightingAI replay remain required before production readiness',
      'Do not infer undocumented equivalence between Bluetooth app, Wi-Fi app, ZolarLink and Art-Net/sACN command paths'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'ZOLAR Mobile App Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party ZOLAR exact-model documentation explicitly confirms Bluetooth mobile-app control. LightingAI proprietary BLE/GATT semantics remain locked.'
      },
      wifi:{
        verified:true,
        family:'ZOLAR Mobile App / Art-Net 4 / sACN over Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party ZOLAR exact-model documentation explicitly confirms Wi-Fi control and Art-Net 4/sACN support. Exact LightingAI hardware replay and undocumented app/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,{color})
  };
}

export const ZOLAR_WIRELESS_FIXTURES=[
  {
    id:'zolar-blade-60c',
    manufacturer:'ZOLAR',
    model:'Blade 60C',
    family:'Blade',
    category:'Light',
    sourceType:'Full RGBAW LED Panel',
    formFactor:'Panel',
    colorMode:'RGBAW / HSI / CCT',
    powerDrawW:140,
    cctK:{min:2000,max:20000},
    cri:97,
    tlci:98,
    control:wirelessControl([SRC.blade60c,SRC.lineup],'Blade 60C',{color:true}),
    sourceUrl:SRC.blade60c
  },
  {
    id:'zolar-toliman-30c',
    manufacturer:'ZOLAR',
    model:'Toliman 30C',
    family:'Toliman',
    category:'Light',
    sourceType:'Bi-Color Full-Spectrum LED Panel',
    formFactor:'Panel',
    colorMode:'Bi-Color / CCT',
    cctK:{min:3200,max:5600},
    cri:98,
    tlci:98,
    control:wirelessControl([SRC.toliman30c,SRC.lineup],'Toliman 30C'),
    sourceUrl:SRC.toliman30c
  },
  {
    id:'zolar-vega-30c',
    manufacturer:'ZOLAR',
    model:'Vega 30C',
    family:'Vega',
    category:'Light',
    sourceType:'Full RGBAW LED Panel',
    formFactor:'Panel',
    colorMode:'RGBAW / HSI / CCT',
    powerDrawW:250,
    cctK:{min:2000,max:20000},
    cri:97,
    tlci:98,
    control:wirelessControl([SRC.vega30c,SRC.lineup],'Vega 30C',{color:true}),
    sourceUrl:SRC.vega30c
  }
];
