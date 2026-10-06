// Falcon Eyes exact-model Bluetooth coverage.
// First-party Falcon Eyes product pages only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  ds812:'https://www.falconeyeshk.com/product-page/ds812',
  ds300cpro:'https://www.falconeyeshk.com/product-page/ds-300c-pro',
  dm2:'https://www.falconeyeshk.com/zh/product-page/dm2',
  dm4:'https://www.falconeyeshk.com/zh/product-page/dm4',
  m300:'https://www.falconeyeshk.com/product-page/m-300',
  m500:'https://www.falconeyeshk.com/product-page/m500',
  m1200:'https://www.falconeyeshk.com/product-page/m1200',
  mc180c:'https://www.falconeyeshk.com/product-page/mc-180c',
  mc400:'https://www.falconeyeshk.com/product-page/mc-400',
  irisa1:'https://www.falconeyeshk.com/product-page/irisa-1',
  irisa2:'https://www.falconeyeshk.com/product-page/irisa-2',
  irisa4:'https://www.falconeyeshk.com/product-page/irisa-4',
  ds200pro:'https://www.falconeyeshk.com/product-page/d-s200pro',
  tank80b:'https://www.falconeyeshk.com/product-page/tank-80b',
  app:'https://www.falconeyeshk.com/app-bluetooth'
};

function bluetoothControl(sourceUrl,{wired=['DMX512']}={}){
  return {
    wired,
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
  fixture('falcon-eyes-dm4','DM4','DESAL 8','RGBW LED Fresnel','Fresnel',SRC.dm4,400,{min:28,max:54}),
  {id:'falcon-eyes-m300',manufacturer:'Falcon Eyes',model:'M300',family:'M Series',category:'Light',sourceType:'Bi-Color LED Fresnel',formFactor:'Fresnel',cctK:{min:2500,max:9999},colorMode:'Bi-Color',powerDrawW:300,cri:95,control:bluetoothControl(SRC.m300,{wired:[]}),sourceUrl:SRC.m300},
  {id:'falcon-eyes-m500',manufacturer:'Falcon Eyes',model:'M500',family:'M Series',category:'Light',sourceType:'Bi-Color LED Fresnel',formFactor:'Fresnel',cctK:{min:2500,max:9999},colorMode:'Bi-Color',powerDrawW:500,cri:95,control:bluetoothControl(SRC.m500,{wired:[]}),sourceUrl:SRC.m500},
  {id:'falcon-eyes-m1200',manufacturer:'Falcon Eyes',model:'M1200',family:'M Series',category:'Light',sourceType:'Bi-Color LED Fresnel',formFactor:'Fresnel',cctK:{min:2500,max:9999},colorMode:'Bi-Color',powerDrawW:1200,cri:95,control:bluetoothControl(SRC.m1200,{wired:[]}),sourceUrl:SRC.m1200},
  {id:'falcon-eyes-mc-180c',manufacturer:'Falcon Eyes',model:'MC-180C',family:'MC Series',category:'Light',sourceType:'RGB LED Round Panel',formFactor:'Panel',colorMode:'RGB / HSI / CCT / FX',powerDrawW:18,cri:95,control:bluetoothControl(SRC.mc180c,{wired:[]}),sourceUrl:SRC.mc180c},
  {id:'falcon-eyes-mc-400',manufacturer:'Falcon Eyes',model:'MC-400',family:'MC Series',category:'Light',sourceType:'Bi-Color LED Round Panel',formFactor:'Panel',cctK:{min:3000,max:5600},colorMode:'Bi-Color',powerDrawW:40,cri:95,control:bluetoothControl(SRC.mc400,{wired:[]}),sourceUrl:SRC.mc400},
  {id:'falcon-eyes-irisa-1',manufacturer:'Falcon Eyes',model:'IRISA 1',family:'IRISA',category:'Light',sourceType:'RGB LED Stick',formFactor:'Tube / Light Stick',cctK:{min:2500,max:9999},colorMode:'RGB / HSI / CCT / FX',powerDrawW:13,cri:96,control:bluetoothControl(SRC.irisa1),sourceUrl:SRC.irisa1},
  {id:'falcon-eyes-irisa-2',manufacturer:'Falcon Eyes',model:'IRISA 2',family:'IRISA',category:'Light',sourceType:'RGB LED Stick',formFactor:'Tube / Light Stick',cctK:{min:2500,max:9999},colorMode:'RGB / HSI / CCT / FX',powerDrawW:25,cri:96,control:bluetoothControl(SRC.irisa2),sourceUrl:SRC.irisa2},
  {id:'falcon-eyes-irisa-4',manufacturer:'Falcon Eyes',model:'IRISA 4',family:'IRISA',category:'Light',sourceType:'RGB LED Stick',formFactor:'Tube / Light Stick',cctK:{min:2500,max:9999},colorMode:'RGB / HSI / CCT / FX',powerDrawW:50,cri:96,control:bluetoothControl(SRC.irisa4),sourceUrl:SRC.irisa4},
  {id:'falcon-eyes-d-s200pro',manufacturer:'Falcon Eyes',model:'D-S200Pro',family:'DESAL',category:'Light',sourceType:'Bi-Color LED Panel',formFactor:'Panel',cctK:{min:2500,max:9999},colorMode:'Bi-Color / FX',powerDrawW:200,cri:95,control:bluetoothControl(SRC.ds200pro),sourceUrl:SRC.ds200pro},
  {id:'falcon-eyes-tank-80b',manufacturer:'Falcon Eyes',model:'Tank 80B',family:'Tank',category:'Light',sourceType:'Bi-Color COB LED Light',formFactor:'COB / Monolight',cctK:{min:2500,max:9999},colorMode:'Bi-Color / FX',powerDrawW:80,cri:96,control:bluetoothControl(SRC.tank80b,{wired:[]}),sourceUrl:SRC.tank80b}
];