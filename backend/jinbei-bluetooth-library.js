// Jinbei exact-model Bluetooth coverage.
// First-party Jinbei product/app evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  app:'https://www.jinbei-deutschland.de/en/blogs/jinbeisphotobox/creative-light-management-made-easy-the-jinbei-studio-app',
  ef80bi:'https://www.jinbei-deutschland.de/en/products/b-ware-ef-80bi-led-continuouslight',
  ef120c:'https://www.jinbei-deutschland.de/en/products/ef-120c-rgb-led-dauerlicht',
  ef200x:'https://www.jinbei-deutschland.de/en/products/ef-200x-led-dauerlicht',
  eft220:'https://www.jinbei-deutschland.de/en/collections/sale/products/eft-220-rgb-stick-light-2478',
  eft360iii:'https://www.jinbei-deutschland.de/en/collections/neuheiten-1/products/0_template-for-article-installation-35',
  eft560bi:'https://www.jinbei-deutschland.de/en/collections/neuheiten-1/products/0_template-for-article-installation-33',
  jl160220bi:'https://www.jinbei-deutschland.de/en/collections/led-continuous-light-studio-and-mobile/products/0_template-for-article-installation-29',
  jl300bi:'https://www.jinbei-deutschland.de/en/products/jl-300bi-led-continuous-light-2568',
  jl300c:'https://www.jinbei-deutschland.de/en/collections/all/products/jl-300c-rgb-led-continuous-light',
  jl500bi:'https://www.jinbei-deutschland.de/en/products/0_template-for-article-installation-39',
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
  const row={
    id,
    manufacturer:'Jinbei',
    model,
    family:'Jinbei Studio',
    category:'Light',
    sourceType,
    formFactor,
    colorMode,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
  if(Number.isFinite(powerDrawW)) row.powerDrawW=powerDrawW;
  if(cctK) row.cctK=cctK;
  return row;
}

export const JINBEI_BLUETOOTH_FIXTURES=[
  fixture('jinbei-ef-80bi','EF-80Bi','Bi-Color LED Continuous Light','COB / Monolight','Bi-Color',80,SRC.ef80bi,{min:2700,max:6500}),
  fixture('jinbei-ef-120c','EF-120C','RGB LED Continuous Light','COB / Monolight','RGB / HSI / CCT',120,SRC.ef120c,{min:2000,max:10000}),
  fixture('jinbei-ef-200x','EF-200X','Bi-Color LED Continuous Light','COB / Monolight','Bi-Color',200,SRC.ef200x,{min:2700,max:6500}),
  fixture('jinbei-eft-220','EFT-220','RGB LED Stick','Tube / Light Stick','RGB / HSI / CCT',null,SRC.eft220,{min:2000,max:7500}),
  fixture('jinbei-eft-360iii','EFT-360III','RGB LED Stick','Tube / Light Stick','RGB / HSI / CCT',23,SRC.eft360iii,{min:2700,max:7500}),
  fixture('jinbei-eft-560bi','EFT-560Bi','Bi-Color LED Stick','Tube / Light Stick','Bi-Color',23,SRC.eft560bi,{min:2700,max:7500}),
  fixture('jinbei-jl-160bi','JL-160Bi','Bi-Color LED Continuous Light','COB / Monolight','Bi-Color',160,SRC.jl160220bi),
  fixture('jinbei-jl-220bi','JL-220Bi','Bi-Color LED Continuous Light','COB / Monolight','Bi-Color',220,SRC.jl160220bi),
  fixture('jinbei-jl-300bi','JL-300Bi','Bi-Color LED Continuous Light','COB / Monolight','Bi-Color',300,SRC.jl300bi,{min:2700,max:6500}),
  fixture('jinbei-jl-300c','JL-300C','RGB LED Continuous Light','COB / Monolight','RGB / HSI / CCT',300,SRC.jl300c,{min:2700,max:10000}),
  fixture('jinbei-jl-500bi','JL-500Bi','Bi-Color LED Continuous Light','COB / Monolight','Bi-Color',500,SRC.jl500bi,{min:2700,max:6500}),
  fixture('jinbei-jl-600rgb','JL-600RGB','RGB LED Continuous Light','COB / Monolight','RGB / HSI / CCT',580,SRC.jl600rgb,{min:2000,max:10000})
];
