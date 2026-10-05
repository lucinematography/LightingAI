// Falcon Eyes exact-model Bluetooth coverage.
// First-party Falcon Eyes product pages only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  ds812:'https://www.falconeyeshk.com/product-page/ds812',
  ds300cpro:'https://www.falconeyeshk.com/product-page/ds-300c-pro',
  dm2:'https://www.falconeyeshk.com/zh/product-page/dm2',
  dm4:'https://www.falconeyeshk.com/zh/product-page/dm4',
  app:'https://www.falconeyeshk.com/app-bluetooth'
};

function bluetoothControl(sourceUrl){
  return {
    wired:['DMX512'],
    wireless:['Bluetooth via Falcon Eyes DESAL App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Falcon Eyes documents Bluetooth app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,SRC.app],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Falcon Eyes DESAL Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.app],
        note:'First-party Falcon Eyes documentation explicitly confirms Bluetooth app control for this exact model. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,powerDrawW,beamAngle){
  return {
    id,
    manufacturer:'Falcon Eyes',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    cctK:{min:2800,max:10000},
    colorMode:'RGBW / HSI / CCT',
    powerDrawW,
    beamAngle,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const FALCON_EYES_BLUETOOTH_FIXTURES=[
  fixture('falcon-eyes-d-s812','D-S812','DESAL 8','RGBW LED Soft Panel','Panel',SRC.ds812,400,64),
  fixture('falcon-eyes-ds-300c-pro','DS-300C Pro','DESAL 8','RGBW COB LED','COB / Monolight',SRC.ds300cpro,300,27),
  fixture('falcon-eyes-dm2','DM2','DESAL 8','RGBW LED Fresnel','Fresnel',SRC.dm2,200,{min:28,max:53}),
  fixture('falcon-eyes-dm4','DM4','DESAL 8','RGBW LED Fresnel','Fresnel',SRC.dm4,400,{min:28,max:54})
];
