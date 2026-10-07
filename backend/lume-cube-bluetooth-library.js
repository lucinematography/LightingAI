// Lume Cube exact-model Bluetooth coverage.
// First-party Lume Cube product/support evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  support:'https://help.lumecube.com/en-US/what-apps-can-i-use-with-my-lume-cube-products-321666',
  appSupport:'https://help.lumecube.com/en-US/where-can-i-find-app-support-321667',
  app:'https://lumecube.com/pages/lume-control-app',
  panelPro2:'https://lumecube.com/products/panel-pro',
  tubeMini:'https://lumecube.com/products/tube-light-mini',
  tubeXL:'https://lumecube.com/products/tube-light-xl',
  tubeLarge:'https://lumecube.com/products/lume-cube-rgb-tube-light-l',
  cubeXL:'https://lumecube.com/products/lume-cube-xl-60w-rgb-mini-cob-led-light'
};

function bluetoothControl(sourceUrl,note){
  const sources=[sourceUrl,SRC.support,SRC.appSupport,SRC.app];
  return {
    wired:[],
    wireless:['Bluetooth via Lume Control App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Lume Cube documents Bluetooth/app control for this exact model, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Lume Control Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:note+' LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

export const LUME_CUBE_BLUETOOTH_FIXTURES=[
  {
    id:'lume-cube-panel-pro-2',
    manufacturer:'Lume Cube',
    model:'RGB Panel Pro 2.0',
    family:'Panel Pro',
    category:'Light',
    sourceType:'RGB LED Panel',
    formFactor:'Panel',
    cctK:{min:2700,max:7500},
    colorMode:'RGB / HSI / CCT',
    control:bluetoothControl(SRC.panelPro2,'First-party product and support documentation explicitly confirm Bluetooth control through Lume Control for Panel Pro 2.0.'),
    sourceUrl:SRC.panelPro2
  },
  {
    id:'lume-cube-tube-light-mini',
    manufacturer:'Lume Cube',
    model:'RGB Tube Light Mini',
    family:'Tube Light',
    category:'Light',
    sourceType:'RGB LED Tube',
    formFactor:'Tube',
    cctK:{min:2700,max:7500},
    colorMode:'RGB / HSI / CCT',
    control:bluetoothControl(SRC.tubeMini,'First-party product and support documentation explicitly confirm Bluetooth control through Lume Control for Tube Light Mini.'),
    sourceUrl:SRC.tubeMini
  },
  {
    id:'lume-cube-tube-light-xl',
    manufacturer:'Lume Cube',
    model:'RGB Tube Light XL',
    family:'Tube Light',
    category:'Light',
    sourceType:'RGB LED Tube',
    formFactor:'Tube',
    cctK:{min:2700,max:7500},
    colorMode:'RGB / HSI / CCT',
    control:bluetoothControl(SRC.tubeXL,'First-party product and support documentation explicitly confirm Bluetooth control through Lume Control for Tube Light XL.'),
    sourceUrl:SRC.tubeXL
  },
  {
    id:'lume-cube-tube-light-large',
    manufacturer:'Lume Cube',
    model:'RGB Tube Light Large (2 ft)',
    family:'Tube Light',
    category:'Light',
    sourceType:'RGB LED Tube',
    formFactor:'Tube',
    cctK:{min:2700,max:7500},
    colorMode:'RGB / HSI / CCT',
    cri:96,
    control:bluetoothControl(SRC.tubeLarge,'First-party product documentation explicitly confirms Bluetooth app control through Lume Control for the 2 ft Tube Light Large.'),
    sourceUrl:SRC.tubeLarge
  },
  {
    id:'lume-cube-xl',
    manufacturer:'Lume Cube',
    model:'Lume Cube XL',
    family:'Lume Cube XL',
    category:'Light',
    sourceType:'RGB COB LED Light',
    formFactor:'COB / Monolight',
    cctK:{min:2700,max:7500},
    colorMode:'RGB / HSI / CCT',
    powerDrawW:60,
    control:bluetoothControl(SRC.cubeXL,'First-party product documentation explicitly confirms Bluetooth Mesh control through Lume Control for Lume Cube XL.'),
    sourceUrl:SRC.cubeXL
  }
];
