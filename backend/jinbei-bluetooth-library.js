// Jinbei exact-model Bluetooth coverage.
// First-party Jinbei product/app evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  app:'https://www.jinbei-deutschland.de/en/blogs/jinbeisphotobox/creative-light-management-made-easy-the-jinbei-studio-app',
  ef120c:'https://www.jinbei-deutschland.de/en/products/ef-120c-rgb-led-dauerlicht',
  ef200x:'https://www.jinbei-deutschland.de/en/products/ef-200x-led-dauerlicht',
  jl600rgb:'https://www.jinbei-deutschland.de/en/products/jl-600c-rgb-led-dauerlicht'
};

function bluetoothControl(sourceUrl){
  const sources=[sourceUrl,SRC.app];
  return {
    wired:[],
    wireless:['Bluetooth 5.0 via Jinbei Studio/Jinbei APP'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Jinbei documents Bluetooth 5.0 app control for this exact model, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Jinbei Studio Bluetooth 5.0',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party Jinbei documentation explicitly lists Bluetooth 5.0 and app remote control for this exact model. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,sourceType,formFactor,colorMode,powerDrawW,sourceUrl,cctK){
  return {
    id,
    manufacturer:'Jinbei',
    model,
    family:'Jinbei Studio',
    category:'Light',
    sourceType,
    formFactor,
    colorMode,
    powerDrawW,
    cctK,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const JINBEI_BLUETOOTH_FIXTURES=[
  fixture('jinbei-ef-120c','EF-120C','RGB LED Continuous Light','COB / Monolight','RGB / HSI / CCT',120,SRC.ef120c,{min:2000,max:10000}),
  fixture('jinbei-ef-200x','EF-200X','Bi-Color LED Continuous Light','COB / Monolight','Bi-Color',200,SRC.ef200x,{min:2700,max:6500}),
  fixture('jinbei-jl-600rgb','JL-600RGB','RGB LED Continuous Light','COB / Monolight','RGB / HSI / CCT',580,SRC.jl600rgb,{min:2000,max:10000})
];
