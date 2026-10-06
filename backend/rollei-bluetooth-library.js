// Rollei exact-model Bluetooth coverage.
// First-party Rollei product/app evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  candela100:'https://www.rollei.de/en/products/candela-100-bi-color-20119',
  candela220Bi:'https://www.rollei.de/en/products/candela-220-bi-color-20120',
  candela220Rgb:'https://www.rollei.de/en/products/candela-220-rgb-20167',
  candela200Bi:'https://www.rollei.de/en/products/candela-200-studio-bi-color-28936',
  candela200Rgb:'https://www.rollei.de/en/products/candela-200-studio-rgb-28938',
  candela300Bi:'https://www.rollei.de/en/products/candela-300-studio-bi-color-28942',
  candela300Rgb:'https://www.rollei.de/products/candela-300-studio-rgb',
  candela600Bi:'https://www.rollei.de/en/collections/led-dauerlicht/products/candela-600-pro-bi-color-20186',
  lux:'https://www.rollei.de/en/products/lux-bi-color',
  vibe200:'https://www.rollei.de/en/products/vibe-studio-200-bi-color-28880',
  vibe900:'https://www.rollei.de/products/vibe-panel-900-rgb-28643',
  apps:'https://www.rollei.de/en/pages/rollei-apps'
};

function bluetoothControl(sourceUrl,app,family,note){
  return {
    wired:[],
    wireless:['Bluetooth via '+app],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Rollei documents Bluetooth/app control for this exact model, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,SRC.apps],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family,
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.apps],
        note:note+' LightingAI proprietary Bluetooth command semantics remain locked.'
      }
    }
  };
}

function candela(id,model,sourceUrl,powerDrawW,colorMode){
  return {
    id,
    manufacturer:'Rollei',
    model,
    family:'Candela',
    category:'Light',
    sourceType:(/RGB/.test(model)?'RGB LED COB Continuous Light':'Bi-Color LED COB Continuous Light'),
    formFactor:'COB / Monolight',
    cctK:{min:2700,max:6500},
    colorMode,
    powerDrawW,
    control:bluetoothControl(sourceUrl,'Rollei Candela | LUX LED App','Rollei Candela Bluetooth','First-party Rollei documentation explicitly describes Bluetooth pairing and app control for this exact Candela model.'),
    sourceUrl
  };
}

export const ROLLEI_BLUETOOTH_FIXTURES=[
  candela('rollei-candela-100-bi-color','Candela 100 Bi-Color',SRC.candela100,100,'Bi-Color'),
  candela('rollei-candela-220-bi-color','Candela 220 Bi-Color',SRC.candela220Bi,220,'Bi-Color'),
  candela('rollei-candela-220-rgb','Candela 220 RGB',SRC.candela220Rgb,220,'RGB / HSI / CCT'),
  candela('rollei-candela-200-studio-bi-color','Candela 200 Studio Bi-Color',SRC.candela200Bi,200,'Bi-Color'),
  candela('rollei-candela-200-studio-rgb','Candela 200 Studio RGB',SRC.candela200Rgb,200,'RGB / HSI / CCT'),
  candela('rollei-candela-300-studio-bi-color','Candela 300 Studio Bi-Color',SRC.candela300Bi,300,'Bi-Color'),
  candela('rollei-candela-300-studio-rgb','Candela 300 Studio RGB',SRC.candela300Rgb,300,'RGB / HSI / CCT'),
  candela('rollei-candela-600-pro-bi-color','Candela 600 Pro Bi-Color',SRC.candela600Bi,600,'Bi-Color'),
  {
    id:'rollei-lux-60-bi-color',
    manufacturer:'Rollei',
    model:'LUX 60 Bi-Color',
    family:'LUX',
    category:'Light',
    sourceType:'Bi-Color LED COB Continuous Light',
    formFactor:'COB / Monolight',
    cctK:{min:2700,max:6500},
    colorMode:'Bi-Color',
    powerDrawW:60,
    control:bluetoothControl(SRC.lux,'Rollei Candela | LUX LED App','Rollei LUX Bluetooth','First-party Rollei LUX documentation explicitly instructs enabling Bluetooth on the smartphone and using app-control mode.'),
    sourceUrl:SRC.lux
  },
  {
    id:'rollei-lux-100-bi-color',
    manufacturer:'Rollei',
    model:'LUX 100 Bi-Color',
    family:'LUX',
    category:'Light',
    sourceType:'Bi-Color LED COB Continuous Light',
    formFactor:'COB / Monolight',
    cctK:{min:2700,max:6500},
    colorMode:'Bi-Color',
    powerDrawW:100,
    control:bluetoothControl(SRC.lux,'Rollei Candela | LUX LED App','Rollei LUX Bluetooth','First-party Rollei LUX documentation explicitly instructs enabling Bluetooth on the smartphone and using app-control mode.'),
    sourceUrl:SRC.lux
  },
  {
    id:'rollei-vibe-studio-200-bi-color',
    manufacturer:'Rollei',
    model:'VIBE Studio 200 Bi-Color',
    family:'VIBE',
    category:'Light',
    sourceType:'Bi-Color COB LED Continuous Light',
    formFactor:'COB / Monolight',
    cctK:{min:2700,max:6500},
    colorMode:'Bi-Color',
    powerDrawW:200,
    control:bluetoothControl(SRC.vibe200,'Rollei VIBE LED App','Rollei VIBE Bluetooth','First-party Rollei technical data explicitly lists the VIBE LED app and Bluetooth 5.0 for this exact model.'),
    sourceUrl:SRC.vibe200
  },
  {
    id:'rollei-vibe-panel-900-rgb',
    manufacturer:'Rollei',
    model:'VIBE Panel 900 RGB',
    family:'VIBE',
    category:'Light',
    sourceType:'RGB LED Panel',
    formFactor:'Panel',
    cctK:{min:2700,max:10000},
    colorMode:'RGB / HSI / CCT',
    powerDrawW:60,
    control:bluetoothControl(SRC.vibe900,'Rollei VIBE LED App','Rollei VIBE Bluetooth','First-party Rollei technical data explicitly lists app remote control and Bluetooth 5.0 for this exact model.'),
    sourceUrl:SRC.vibe900
  }
];
