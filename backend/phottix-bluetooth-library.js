// Phottix exact-model Bluetooth / Phottix Lighting Control coverage.
// First-party Phottix product/app evidence only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  app:'https://www.phottix.com/phottix-app-download/',
  c60a:'https://www.phottix.com/product/phottix-nuada-c60a-curved-led-light/',
  s3a:'https://www.phottix.com/product/phottix-nuada-s3a-led-light/',
  r3a:'https://www.phottix.com/product/phottix-nuada-r3a-led-light/',
  kali50ra:'https://www.phottix.com/product/phottix-kali50ra-rgb-led-light/'
};

function bluetoothControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via Phottix Lighting Control App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Phottix documents Bluetooth app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[SRC.app,sourceUrl],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Phottix Lighting Control Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[SRC.app,sourceUrl],
        note:'First-party Phottix documentation explicitly confirms Bluetooth control for this exact model. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,powerDrawW,colorMode){
  return {
    id,
    manufacturer:'Phottix',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    cctK:{min:2500,max:8500},
    colorMode,
    powerDrawW,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const PHOTTIX_BLUETOOTH_FIXTURES=[
  fixture('phottix-nuada-c60a','Nuada C60a','Nuada','Bi-Color LED Curved Panel','Panel',SRC.c60a,50,'Bi-Color'),
  fixture('phottix-nuada-s3a','Nuada S3a','Nuada','Bi-Color LED Panel','Panel',SRC.s3a,40,'Bi-Color'),
  fixture('phottix-nuada-r3a','Nuada R3a','Nuada','Bi-Color LED Round Panel','Panel',SRC.r3a,50,'Bi-Color'),
  fixture('phottix-kali50ra','Kali50Ra','Kali','RGB Bi-Color LED Panel','Panel',SRC.kali50ra,50,'RGB / HSI / CCT')
];
