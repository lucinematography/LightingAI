// GVM exact-model Bluetooth/Wi-Fi lighting coverage.
// First-party GVM product pages and manuals only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  rgb20w:'https://shop.gvmled.com/products/gvm-rgb20w-on-camera-rgb-led-video-light-with-bluetooth-app-control',
  sevenSm:'https://gvmled.com/75m-exp/',
  fa200c:'https://gvmled.com/gvm-fa200c-aio/',
  sd200r:'https://gvmled.com/gvm-sd200r/',
  sd200rManual:'https://gvmled.com/wp-content/uploads/2024/12/%E5%B0%84%E7%81%AFGVM-SD200R-%E8%AF%B4%E6%98%8E%E4%B9%A6%E3%80%90%E8%8B%B1%E6%96%87%E3%80%91V0.pdf',
  d800iii:'https://gvmled.com/gvm-800d-iii-dl/',
  yu150r:'https://gvmled.com/gvm-pro-yu150r/',
  bd25r:'https://gvmled.com/gvm-bd25r/',
  bd25rManual:'https://gvmled.com/wp-content/uploads/2022/11/GVM-BD25R-User-Manual.pdf',
  wand:'https://gvmled.com/wand/',
  bd60bd100Manual:'https://gvmled.com/wp-content/uploads/2026/03/%E6%A3%92%E7%81%AFGVM-BD100-BD60-%E8%AF%B4%E6%98%8E%E4%B9%A6%E3%80%90%E8%8B%B1%E6%96%87%E3%80%91V1.pdf',
  rgb10s:'https://gvmled.com/rgb-10s-exp/'
};

function bluetoothControl(sourceUrls){
  return {
    wired:[],
    wireless:['Bluetooth Mesh via GVM LED App'],
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'GVM documents Bluetooth/Bluetooth Mesh app transport for this exact model, but LightingAI proprietary command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'GVM LED App Bluetooth Mesh',
        scope:'transport-capability-only',
        sourceUrls,
        note:'GVM first-party sources explicitly document Bluetooth/Bluetooth Mesh app control for this exact model. LightingAI command semantics remain locked.'
      }
    }
  };
}

function wifiControl(sourceUrls){
  return {
    wired:[],
    wireless:['WiFi via GVM smartphone app'],
    builtInBluetooth:false,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'GVM documents Wi-Fi app transport for this exact model, but LightingAI proprietary IP/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'GVM legacy app Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls,
        note:'GVM first-party sources explicitly document smartphone app control over Wi-Fi for this exact model. LightingAI IP/session semantics remain locked.'
      }
    }
  };
}

export const GVM_WIRELESS_FIXTURES=[
  {
    id:'gvm-rgb20w',manufacturer:'GVM',model:'RGB20W',family:'On-Camera RGB',category:'Light',
    sourceType:'RGB LED On-Camera Light',formFactor:'Pocket / Handheld on-camera light',
    cctK:{min:2700,max:10000},colorMode:'RGB Full Color',cri:97,
    control:bluetoothControl([SRC.rgb20w]),sourceUrl:SRC.rgb20w
  },
  {
    id:'gvm-7sm',manufacturer:'GVM',model:'7SM',family:'On-Camera RGB',category:'Light',
    sourceType:'RGB LED On-Camera Light',formFactor:'Pocket / Handheld on-camera light',
    colorMode:'RGB Full Color',
    control:bluetoothControl([SRC.sevenSm]),sourceUrl:SRC.sevenSm
  },
  {
    id:'gvm-fa200c',manufacturer:'GVM',model:'FA200C AIO',family:'AIO COB',category:'Light',
    sourceType:'RGB COB LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:2000,max:10000},colorMode:'RGB Full Color',powerDrawW:200,
    control:bluetoothControl([SRC.fa200c]),sourceUrl:SRC.fa200c
  },
  {
    id:'gvm-sd200r',manufacturer:'GVM',model:'SD200R',family:'SD Monolight',category:'Light',
    sourceType:'RGB COB LED Monolight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:7500},colorMode:'RGB Full Color',cri:97,
    control:bluetoothControl([SRC.sd200r,SRC.sd200rManual]),sourceUrl:SRC.sd200r
  },
  {
    id:'gvm-800d-iii',manufacturer:'GVM',model:'800D III',family:'800D Panel',category:'Light',
    sourceType:'RGB LED Panel',formFactor:'Panel',
    cctK:{min:3200,max:5600},colorMode:'RGB Full Color',powerDrawW:40,cri:97,beamAngleDeg:120,
    control:bluetoothControl([SRC.d800iii]),sourceUrl:SRC.d800iii
  },
  {
    id:'gvm-pro-yu150r',manufacturer:'GVM',model:'PRO YU150R',family:'PRO Soft Panel',category:'Light',
    sourceType:'RGB LED Soft Panel',formFactor:'Panel',
    cctK:{min:2000,max:10000},colorMode:'RGB Full Color',powerDrawW:150,cri:97,
    control:bluetoothControl([SRC.yu150r]),sourceUrl:SRC.yu150r
  },
  {
    id:'gvm-pro-bd25r',manufacturer:'GVM',model:'PRO BD25R',family:'BD Wand',category:'Light',
    sourceType:'RGB LED Light Wand',formFactor:'Pixel Bar / Light Wand',
    cctK:{min:2700,max:10000},colorMode:'RGB Full Color',powerDrawW:25,cri:97,
    control:bluetoothControl([SRC.bd25r,SRC.bd25rManual]),sourceUrl:SRC.bd25r
  },
  {
    id:'gvm-pro-bd45r',manufacturer:'GVM',model:'PRO BD45R',family:'BD Wand',category:'Light',
    sourceType:'RGB LED Light Wand',formFactor:'Pixel Bar / Light Wand',
    colorMode:'RGB Full Color',
    control:bluetoothControl([SRC.wand,SRC.bd25rManual]),sourceUrl:SRC.wand
  },
  {
    id:'gvm-bd60',manufacturer:'GVM',model:'BD60',family:'BD Handheld',category:'Light',
    sourceType:'Bi-Color LED Handheld Light',formFactor:'Pixel Bar / Handheld Light Bar',
    cctK:{min:3200,max:5600},colorMode:'Bi-Color',powerDrawW:15,cri:97,batteryPowered:true,
    control:bluetoothControl([SRC.bd60bd100Manual]),sourceUrl:SRC.bd60bd100Manual
  },
  {
    id:'gvm-bd100',manufacturer:'GVM',model:'BD100',family:'BD Handheld',category:'Light',
    sourceType:'Bi-Color LED Handheld Light',formFactor:'Pixel Bar / Handheld Light Bar',
    cctK:{min:3200,max:5600},colorMode:'Bi-Color',powerDrawW:30,cri:97,batteryPowered:true,
    control:bluetoothControl([SRC.bd60bd100Manual]),sourceUrl:SRC.bd60bd100Manual
  },
  {
    id:'gvm-rgb-10s',manufacturer:'GVM',model:'RGB-10S',family:'Legacy On-Camera Wi-Fi',category:'Light',
    sourceType:'RGB LED On-Camera Panel',formFactor:'Panel',
    colorMode:'RGB Full Color',cri:97,
    control:wifiControl([SRC.rgb10s]),sourceUrl:SRC.rgb10s
  }
];
