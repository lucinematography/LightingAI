// Litepanels exact-model Bluetooth/Wi-Fi coverage.
// First-party Litepanels product/help sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  astraIpHalf:'https://www.litepanels.com/en/product/astra-ip-half-bi-color-led-panel-standard-yoke-eu-power-cable/',
  astraIp1x1:'https://www.litepanels.com/en/product/astra-ip-1x1-bi-color-led-panel-standard-yoke-eu-power-cable/',
  astraIp2x1:'https://www.litepanels.com/en/product/astra-ip-2x1-bi-color-led-panel-standard-yoke-eu-power-cable/',
  astraIpHelp:'https://help.litepanels.com/en/basic-operation.html',
  astra6xD:'https://www.litepanels.com/en/product/astra-6x-daylight-led-panel/',
  astra6xB:'https://www.litepanels.com/en/product/astra-6x-bi-color-led-panel/',
  astra3xD:'https://www.litepanels.com/en/product/astra-3x-daylight-led-panel/',
  astra3xB:'https://www.litepanels.com/en/product/astra-3x-bi-color-led-panel/',
  astraSoft:'https://www.litepanels.com/en/product/astra-soft-bi-color-led-panel/',
  astraBiFocus:'https://www.litepanels.com/en/product/astra-bi-focus-daylight-led-panel/',
  astraBtModule:'https://www.litepanels.com/en/product/astra-bluetooth-communications-module/',
  geminiBt:'https://help.litepanels.com/en/gemini-and-bluetooth.html'
};

function directAstraIpControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth LE (integrated)','WiFi (integrated)'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Litepanels documents native Bluetooth/Wi-Fi transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,SRC.astraIpHelp],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Litepanels Astra IP native Bluetooth LE',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.astraIpHelp],
        note:'Litepanels documents native Bluetooth LE in Astra IP. LightingAI command semantics remain locked.'
      },
      wifi:{
        verified:true,
        family:'Litepanels Astra IP native Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.astraIpHelp],
        note:'Litepanels documents native 802.11b/g/n Wi-Fi in Astra IP. LightingAI IP/session semantics remain locked.'
      }
    }
  };
}

function assistedAstraControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via Litepanels Bluetooth Communications Module'],
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:['Litepanels Bluetooth Communications Module 900-3519'],
    unavailableDirectProtocols:[
      'Bluetooth requires the external Litepanels communications module; LightingAI command semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,SRC.astraBtModule],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Litepanels Astra Bluetooth Communications Module',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.astraBtModule],
        note:'Litepanels documents optional Bluetooth control through Communications Module 900-3519. This is adapter-assisted Bluetooth; LightingAI command semantics remain locked.'
      }
    }
  };
}

function assistedGeminiControl(){
  return {
    wired:[],
    wireless:['Bluetooth LE via optional Litepanels/LumenRadio dongle'],
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:['Litepanels Bluetooth Dongle or LumenRadio Wireless DMX Dongle with BLE'],
    unavailableDirectProtocols:[
      'Gemini Bluetooth requires an optional dongle; LightingAI command semantics are not production-verified'
    ],
    sourceUrls:[SRC.geminiBt],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Litepanels Gemini optional BLE dongle',
        scope:'transport-capability-only',
        sourceUrls:[SRC.geminiBt],
        note:'Litepanels documents Bluetooth LE through optional Litepanels or LumenRadio dongles for Gemini. This is adapter-assisted Bluetooth; LightingAI command semantics remain locked.'
      }
    }
  };
}

function panel(id,model,family,sourceType,sourceUrl,control,extra={}){
  return {
    id,manufacturer:'Litepanels',model,family,category:'Light',
    sourceType,formFactor:'Panel',
    ...extra,
    control,sourceUrl
  };
}

export const LITEPANELS_WIRELESS_FIXTURES=[
  panel('litepanels-astra-ip-half','Astra IP Half','Astra IP','Bi-Color LED Panel',SRC.astraIpHalf,directAstraIpControl(SRC.astraIpHalf),{cctK:{min:2700,max:6500},colorMode:'Bi-Color',ipRating:'IP65'}),
  panel('litepanels-astra-ip-1x1','Astra IP 1x1','Astra IP','Bi-Color LED Panel',SRC.astraIp1x1,directAstraIpControl(SRC.astraIp1x1),{cctK:{min:2700,max:6500},colorMode:'Bi-Color',ipRating:'IP65'}),
  panel('litepanels-astra-ip-2x1','Astra IP 2x1','Astra IP','Bi-Color LED Panel',SRC.astraIp2x1,directAstraIpControl(SRC.astraIp2x1),{cctK:{min:2700,max:6500},colorMode:'Bi-Color',ipRating:'IP65'}),
  panel('litepanels-astra-6x-daylight','Astra 6X Daylight','Astra','Daylight LED Panel',SRC.astra6xD,assistedAstraControl(SRC.astra6xD),{colorMode:'Daylight',powerDrawW:105}),
  panel('litepanels-astra-6x-bi-color','Astra 6X Bi-Color','Astra','Bi-Color LED Panel',SRC.astra6xB,assistedAstraControl(SRC.astra6xB),{cctK:{min:3200,max:5600},colorMode:'Bi-Color',powerDrawW:105}),
  panel('litepanels-astra-3x-daylight','Astra 3X Daylight','Astra','Daylight LED Panel',SRC.astra3xD,assistedAstraControl(SRC.astra3xD),{colorMode:'Daylight',powerDrawW:55}),
  panel('litepanels-astra-3x-bi-color','Astra 3X Bi-Color','Astra','Bi-Color LED Panel',SRC.astra3xB,assistedAstraControl(SRC.astra3xB),{cctK:{min:3200,max:5600},colorMode:'Bi-Color',powerDrawW:55}),
  panel('litepanels-astra-soft-bi-color','Astra Soft Bi-Color','Astra','Bi-Color Soft LED Panel',SRC.astraSoft,assistedAstraControl(SRC.astraSoft),{cctK:{min:3200,max:5600},colorMode:'Bi-Color',powerDrawW:105}),
  panel('litepanels-astra-bi-focus-daylight','Astra Bi-Focus Daylight','Astra','Focusable Daylight LED Panel',SRC.astraBiFocus,assistedAstraControl(SRC.astraBiFocus),{colorMode:'Daylight',powerDrawW:105}),
  panel('litepanels-gemini-1x1-hard','Gemini 1x1 Hard','Gemini','RGBWW Hard LED Panel',SRC.geminiBt,assistedGeminiControl(),{colorMode:'RGBWW Full Color'}),
  panel('litepanels-gemini-1x1-soft','Gemini 1x1 Soft','Gemini','RGBWW Soft LED Panel',SRC.geminiBt,assistedGeminiControl(),{colorMode:'RGBWW Full Color'}),
  panel('litepanels-gemini-2x1-hard','Gemini 2x1 Hard','Gemini','RGBWW Hard LED Panel',SRC.geminiBt,assistedGeminiControl(),{colorMode:'RGBWW Full Color'}),
  panel('litepanels-gemini-2x1-soft','Gemini 2x1 Soft','Gemini','RGBWW Soft LED Panel',SRC.geminiBt,assistedGeminiControl(),{colorMode:'RGBWW Full Color'})
];
