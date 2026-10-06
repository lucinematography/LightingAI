// Phottix exact-model Bluetooth / Phottix Lighting Control coverage.
// First-party Phottix product/app evidence only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  app:'https://www.phottix.com/phottix-app-download/',
  c60a:'https://www.phottix.com/product/phottix-nuada-c60a-curved-led-light/',
  s3a:'https://www.phottix.com/product/phottix-nuada-s3a-led-light/',
  r3a:'https://www.phottix.com/product/phottix-nuada-r3a-led-light/',
  kali50ra:'https://www.phottix.com/product/phottix-kali50ra-rgb-led-light/',
  photoolexApp:'https://www.phottix.com/phottix-x-photoolex-app-download/',
  theiaQ100c:'https://www.phottix.com/product/phottix-x-photoolex-theia-q100c-cob-rgb-led-light/',
  theiaQ40c:'https://www.phottix.com/product/phottix-x-photoolex-theia-q40c-cob-rgb-led-light/',
  helios2077:'https://www.phottix.com/product/phottix-x-photoolex-helios2077-rgb-led-light-kit/'
};

function bluetoothControl(sourceUrl,{appUrl=SRC.app}={}){
  return {
    wired:[],
    wireless:[appUrl===SRC.photoolexApp?'Bluetooth via Phottix x Photoolex App':'Bluetooth via Phottix Lighting Control App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Phottix documents Bluetooth app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[appUrl,sourceUrl],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:appUrl===SRC.photoolexApp?'Phottix x Photoolex Bluetooth':'Phottix Lighting Control Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[appUrl,sourceUrl],
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
  fixture('phottix-kali50ra','Kali50Ra','Kali','RGB Bi-Color LED Panel','Panel',SRC.kali50ra,50,'RGB / HSI / CCT'),
  {
    id:'phottix-theia-q100c',manufacturer:'Phottix',model:'Theia Q100C',family:'Phottix x Photoolex Theia',category:'Light',
    sourceType:'RGB COB LED Light',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6500},colorMode:'RGB / HSI / CCT / FX',powerDrawW:100,cri:96,tlci:95,
    control:bluetoothControl(SRC.theiaQ100c,{appUrl:SRC.photoolexApp}),sourceUrl:SRC.theiaQ100c
  },
  {
    id:'phottix-theia-q40c',manufacturer:'Phottix',model:'Theia Q40C',family:'Phottix x Photoolex Theia',category:'Light',
    sourceType:'RGB COB LED Light',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6500},colorMode:'RGB / HSI / CCT / FX',powerDrawW:45,cri:96,tlci:95,
    control:bluetoothControl(SRC.theiaQ40c,{appUrl:SRC.photoolexApp}),sourceUrl:SRC.theiaQ40c
  },
  {
    id:'phottix-helios-2077',manufacturer:'Phottix',model:'Helios 2077',family:'Phottix x Photoolex Helios',category:'Light',
    sourceType:'RGB LED Light',formFactor:'Panel',
    cctK:{min:2500,max:9900},colorMode:'RGB / HSI / CCT / FX',powerDrawW:15,cri:96,tlci:98,
    control:bluetoothControl(SRC.helios2077,{appUrl:SRC.photoolexApp}),sourceUrl:SRC.helios2077
  }
];
