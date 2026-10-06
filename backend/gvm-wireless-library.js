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
  rgb10s:'https://gvmled.com/rgb-10s-exp/',
  sd200s:'https://shop.gvmled.com/products/gvm-sd200s-200w-led-video-light',
  r500r:'https://gvmled.com/r500r-exp/',
  sd300bAio:'https://gvmled.com/gvm-sd300b-aio/',
  proSd200b:'https://shop.gvmled.com/collections/video-lighting/products/gvm-pro-sd200b-200w-bi-color-mesh-bluetooth-monolight',
  proSd300b:'https://gvmled.com/gvm-pro-sd300b/',
  proSd500b:'https://shop.gvmled.com/collections/on-location/products/gvm-pro-sd500b-500w-bi-color-monolightv-mount-mesh-bluetooth',
  proSd650b:'https://gvmled.com/gvm-pro-sd650b/',
  fa500cAio:'https://gvmled.com/gvm-fa500c-aio-dl/',
  cl100b:'https://gvmled.com/wp-content/uploads/2025/06/%E7%9B%B8%E6%9C%BA%E7%81%AFGVM-CL100B%E8%AF%B4%E6%98%8E%E4%B9%A6%E3%80%90%E8%8B%B1%E6%96%87%E3%80%91V0.pdf',
  fh400b:'https://gvmled.com/wp-content/uploads/2025/11/%E5%B9%B3%E5%A4%B4%E7%81%AFGVM-FH400B%E4%BB%85%E8%93%9D%E7%89%99-%E8%AF%B4%E6%98%8E%E4%B9%A6%E3%80%90%E8%8B%B1%E6%96%87%E3%80%91V1.2.pdf',
  f300bAio:'https://gvmled.com/wp-content/uploads/2026/04/%E5%B9%B3%E5%A4%B4%E7%81%AFGVM-F300B-AIO-%E8%AF%B4%E6%98%8E%E4%B9%A6%E3%80%90%E8%8B%B1%E6%96%87%E3%80%91V1.pdf',
  r1200b:'https://gvmled.com/wp-content/uploads/2025/11/%E5%B0%84%E7%81%AFGVM-R1200B-%E8%AF%B4%E6%98%8E%E4%B9%A6%E3%80%90%E8%8B%B1%E6%96%87%E3%80%91V0.2.pdf',
  st300r:'https://shop.gvmled.com/products/gvm-st300r-300w-led-video-light-rgbbi-color-double-sided-daylight-balanced-cob-light'
};

function bluetoothControl(sourceUrls,options={}){
  const wireless=['Bluetooth Mesh via GVM LED App',...(options.wirelessExtra||[])];
  return {
    wired:options.wired||[],
    wireless,
    builtInBluetooth:options.builtInBluetooth!==false,
    builtInCRMX:!!options.builtInCRMX,
    directLightingAI:options.direct||[],
    externalInterfaceRequired:options.external||[],
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

function dmxHold(sourceUrls,reason='GVM documents a standards-based DMX/Art-Net/CRMX transport for this exact model, but LightingAI has not encoded and verified a manufacturer-published per-channel mode for this fixture. Transport metadata is retained while channel semantics remain fail-closed.'){
  return {status:'HOLD',reason,sourceUrls};
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
  },
  {
    id:'gvm-sd200s',manufacturer:'GVM',model:'SD200S',family:'SD Monolight',category:'Light',
    sourceType:'Daylight COB LED Monolight',formFactor:'Spotlight / Monolight',
    cctK:{min:5600,max:5600},colorMode:'Daylight',powerDrawW:200,cri:97,tlci:98,
    control:bluetoothControl([SRC.sd200s],{wired:['DMX512']}),
    dmxProfileVerification:dmxHold([SRC.sd200s]),sourceUrl:SRC.sd200s
  },
  {
    id:'gvm-r500r',manufacturer:'GVM',model:'R500R',family:'R RGB Panel',category:'Light',
    sourceType:'RGB LED Panel',formFactor:'Panel',
    cctK:{min:3200,max:5600},colorMode:'RGB Full Color',
    control:bluetoothControl([SRC.r500r]),sourceUrl:SRC.r500r
  },
  {
    id:'gvm-sd300b-aio',manufacturer:'GVM',model:'SD300B AIO',family:'AIO COB',category:'Light',
    sourceType:'Bi-Color COB LED Monolight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6800},colorMode:'Bi-Color',powerDrawW:300,cri:97,tlci:97,
    control:bluetoothControl([SRC.sd300bAio]),sourceUrl:SRC.sd300bAio
  },
  {
    id:'gvm-pro-sd200b',manufacturer:'GVM',model:'PRO-SD200B',family:'PRO Monolight',category:'Light',
    sourceType:'Bi-Color COB LED Monolight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6800},colorMode:'Bi-Color',powerDrawW:200,cri:97,tlci:97,
    control:bluetoothControl([SRC.proSd200b],{wired:['DMX512','RDM']}),
    dmxProfileVerification:dmxHold([SRC.proSd200b]),sourceUrl:SRC.proSd200b
  },
  {
    id:'gvm-pro-sd300b',manufacturer:'GVM',model:'PRO-SD300B',family:'PRO Monolight',category:'Light',
    sourceType:'Bi-Color COB LED Monolight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6800},colorMode:'Bi-Color',powerDrawW:300,cri:97,tlci:97,
    control:bluetoothControl([SRC.proSd300b],{wired:['DMX512']}),
    dmxProfileVerification:dmxHold([SRC.proSd300b]),sourceUrl:SRC.proSd300b
  },
  {
    id:'gvm-pro-sd500b',manufacturer:'GVM',model:'PRO-SD500B',family:'PRO Monolight',category:'Light',
    sourceType:'Bi-Color COB LED Monolight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6800},colorMode:'Bi-Color',powerDrawW:500,cri:97,tlci:97,
    control:bluetoothControl([SRC.proSd500b],{wired:['DMX512','RDM']}),
    dmxProfileVerification:dmxHold([SRC.proSd500b]),sourceUrl:SRC.proSd500b
  },
  {
    id:'gvm-pro-sd650b',manufacturer:'GVM',model:'PRO-SD650B',family:'PRO Monolight',category:'Light',
    sourceType:'Bi-Color COB LED Monolight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6800},colorMode:'Bi-Color',powerDrawW:650,cri:97,tlci:97,
    control:bluetoothControl([SRC.proSd650b],{wired:['DMX512']}),
    dmxProfileVerification:dmxHold([SRC.proSd650b]),sourceUrl:SRC.proSd650b
  },
  {
    id:'gvm-fa500c-aio',manufacturer:'GVM',model:'FA500C AIO',family:'FA AIO',category:'Light',
    sourceType:'COB LED Light',formFactor:'Spotlight / Monolight',
    cctK:{min:2000,max:10000},colorMode:'Variable CCT',powerDrawW:500,cri:97,
    control:bluetoothControl([SRC.fa500cAio]),sourceUrl:SRC.fa500cAio
  },
  {
    id:'gvm-cl100b',manufacturer:'GVM',model:'CL100B',family:'CL Compact COB',category:'Light',
    sourceType:'Bi-Color COB LED Light',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6800},colorMode:'Bi-Color',powerDrawW:100,cri:97,
    control:bluetoothControl([SRC.cl100b]),sourceUrl:SRC.cl100b
  },
  {
    id:'gvm-fh400b',manufacturer:'GVM',model:'FH400B',family:'FLATHEAD',category:'Light',
    sourceType:'Bi-Color COB LED Light',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6800},colorMode:'Bi-Color',powerDrawW:400,cri:97,
    control:bluetoothControl([SRC.fh400b],{
      builtInBluetooth:false,
      wired:['DMX512','RDM'],
      wirelessExtra:['CRMX via optional CCM-XLR5 module'],
      external:['BCM-NA Bluetooth module (standard configuration)','Optional XLR5 control module for DMX/RDM','Optional CCM-XLR5 module for CRMX']
    }),
    dmxProfileVerification:dmxHold([SRC.fh400b]),sourceUrl:SRC.fh400b
  },
  {
    id:'gvm-f300b-aio',manufacturer:'GVM',model:'F300B AIO',family:'FLATHEAD AIO',category:'Light',
    sourceType:'Bi-Color COB LED Light',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6800},colorMode:'Bi-Color',powerDrawW:300,cri:97,tlci:97,
    control:bluetoothControl([SRC.f300bAio],{
      wired:['DMX512','RDM','Ethernet Art-Net via LCB-RJ45'],
      wirelessExtra:['CRMX via CCB-XLR5'],
      direct:['Art-Net'],
      external:['DCB-XLR5 for DMX/RDM','CCB-XLR5 for CRMX/RDM','LCB-RJ45 for Ethernet Art-Net']
    }),
    dmxProfileVerification:dmxHold([SRC.f300bAio]),sourceUrl:SRC.f300bAio
  },
  {
    id:'gvm-r1200b',manufacturer:'GVM',model:'R1200B',family:'REIGN',category:'Light',
    sourceType:'Bi-Color COB Point Source Light',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6800},colorMode:'Bi-Color',powerDrawW:1200,cri:97,
    control:bluetoothControl([SRC.r1200b],{
      wired:['DMX512','RDM','Ethernet Art-Net'],
      wirelessExtra:['LumenRadio CRMX'],
      builtInCRMX:true,
      direct:['Art-Net'],
      external:['Wired DMX interface for DMX512 control','CRMX transmitter for CRMX control']
    }),
    dmxProfileVerification:dmxHold([SRC.r1200b]),sourceUrl:SRC.r1200b
  },
  {
    id:'gvm-st300r',manufacturer:'GVM',model:'ST300R',family:'ST Full Color',category:'Light',
    sourceType:'RGBWY LED Video Light',formFactor:'Panel',
    cctK:{min:2700,max:7500},colorMode:'RGB Full Color',powerDrawW:300,cri:97,tlci:97,
    control:bluetoothControl([SRC.st300r],{wired:['DMX512']}),
    dmxProfileVerification:dmxHold([SRC.st300r]),sourceUrl:SRC.st300r
  }
];
