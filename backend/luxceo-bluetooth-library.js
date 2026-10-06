// LUXCEO exact-model direct-Bluetooth lighting coverage.
// First-party LUXCEO product/app evidence only.
// Transport and operator capabilities are verified; proprietary command/session semantics remain fail-closed.
const SRC={
  p6:'https://www.luxceo.com/en/rgb-fill-light/13',
  p200:'https://www.luxceo.com/en/shoot/107',
  p120:'https://www.luxceo.com/index.php/en/shoot/112',
  p7rgbPro:'https://www.luxceo.com/en/shoot/111',
  p120s:'https://www.luxceo.com/en/products/51',
  p120sManual:'https://www.luxceo.com/storage/files/1735e97eed7bd45220531d97e29720f4.pdf'
};

function capabilityVerification(sourceUrl){
  const sources=Array.isArray(sourceUrl)?sourceUrl:[sourceUrl];
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls:sources,note:'LUXCEO documents app brightness control for this exact model. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls:sources,note:'LUXCEO documents adjustable color temperature through the official app path for this exact model. This proves operator capability only.'},
    color:{verified:true,scope:'official-app-capability-only',sourceUrls:sources,note:'LUXCEO documents RGB/color-palette app control for this exact model. This proves operator capability only.'},
    fx:{verified:true,scope:'official-app-capability-only',sourceUrls:sources,note:'LUXCEO documents app-selectable scene/effect modes for this exact model. This proves operator capability only.'}
  };
}

function bluetoothControl(sourceUrl,model){
  const sources=Array.isArray(sourceUrl)?sourceUrl:[sourceUrl];
  return {
    wired:[],
    wireless:['Bluetooth via LUXCEO documented smartphone APP'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'LUXCEO documents direct Bluetooth/app control for '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'LUXCEO direct Bluetooth APP control',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party LUXCEO documentation explicitly confirms direct phone-to-light Bluetooth app control for this exact model. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrl)
  };
}

export const LUXCEO_BLUETOOTH_FIXTURES=[
  {
    id:'luxceo-p6',
    manufacturer:'LUXCEO',
    model:'P6',
    family:'RGB Photography Fill Light',
    category:'Light',
    sourceType:'RGB LED Handheld Light Wand',
    formFactor:'Pocket / Handheld',
    colorMode:'RGB / CCT / Effects',
    cctK:{min:2500,max:6500},
    cri:95,
    control:bluetoothControl(SRC.p6,'P6'),
    sourceUrl:SRC.p6
  },
  {
    id:'luxceo-p200',
    manufacturer:'LUXCEO',
    model:'P200',
    family:'RGB Video Light Wand',
    category:'Light',
    sourceType:'RGB LED Video Light Wand',
    formFactor:'Pocket / Handheld',
    colorMode:'RGB / CCT / Effects',
    cctK:{min:3000,max:6000},
    cri:95,
    control:bluetoothControl(SRC.p200,'P200'),
    sourceUrl:SRC.p200
  },
  {
    id:'luxceo-p120',
    manufacturer:'LUXCEO',
    model:'P120',
    family:'RGB Handheld Photography Light',
    category:'Light',
    sourceType:'RGB LED Video Light Wand',
    formFactor:'Pocket / Handheld',
    colorMode:'RGB / CCT / Effects',
    cctK:{min:3000,max:5750},
    cri:95,
    control:bluetoothControl(SRC.p120,'P120'),
    sourceUrl:SRC.p120
  },
  {
    id:'luxceo-p7rgb-pro',
    manufacturer:'LUXCEO',
    model:'P7RGB Pro',
    family:'RGB Handheld Photography Light',
    category:'Light',
    sourceType:'RGBW LED Video Light Wand',
    formFactor:'Pocket / Handheld',
    colorMode:'RGBW / CCT / Effects',
    cctK:{min:3000,max:5750},
    cri:95,
    control:bluetoothControl(SRC.p7rgbPro,'P7RGB Pro'),
    sourceUrl:SRC.p7rgbPro
  },
  {
    id:'luxceo-p120s',
    manufacturer:'LUXCEO',
    model:'P120S',
    family:'RGB Full Color Video Light',
    category:'Light',
    sourceType:'RGB Full Color Video Light Stick',
    formFactor:'Tube',
    colorMode:'RGBCW / CCT / HSI / x-y / Gel / FX',
    cctK:{min:2000,max:10000},
    powerDrawW:30,
    cri:95,
    control:{...bluetoothControl([SRC.p120s,SRC.p120sManual],'P120S'),wired:['DMX512']},
    sourceUrl:SRC.p120s
  }
];
