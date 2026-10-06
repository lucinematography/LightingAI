// amaran exact-model Sidus Bluetooth coverage.
// First-party amaran help/product sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  s60:'https://help.amarancreators.com/en/amaran-60ds-60xs/sidus-link-control',
  s100200:'https://help.amarancreators.com/en/amaran-100ds-200ds/control-options-faq',
  c150300:'https://help.amarancreators.com/en/amaran-150c-300c/sidus-link-control',
  p60:'https://help.amarancreators.com/en/amaran-p60c-p60x/photometrics-and-technical-specifications',
  flex:'https://help.amarancreators.com/en/amaran-flexible-lights/light-configuration-settings',
  tube:'https://help.amarancreators.com/en/amaran-tube/menu-options',
  pixelTube:'https://help.amarancreators.com/en/amaran-pixel-tubes/light-configuration-settings',
  sm5c:'https://help.amarancreators.com/en/sm5c-pixel-tape/control-options',
  sm5cFaq:'https://help.amarancreators.com/en/sm5c-pixel-tape/control-options-faq',
  pano60c:'https://amarancreators.com/pages/amaran-pano-60c',
  pano120c:'https://amarancreators.com/pages/amaran-pano-120c',
  verge:'https://amarancreators.com/pages/amaran-verge/',
  vergeMax:'https://amarancreators.com/pages/amaran-verge-max/',
  go:'https://eu.amarancreators.com/pages/amaran-go',
  ace25c:'https://amarancreators.com/pages/amaran-ace-25c',
  ace25x:'https://amarancreators.com/pages/amaran-ace-25x',
  ray60c:'https://amarancreators.com/pages/amaran-ray-60c',
  ray120c:'https://amarancreators.com/pages/amaran-ray-120c',
  ray360c:'https://amarancreators.com/pages/amaran-ray-360c',
  ray660c:'https://amarancreators.com/pages/amaran-ray-660c'
};

function btControl(sourceUrl,{wifi=false,fullColor=false,cct=true,fx=true,wired=[],external=[],nfc=false}={}){
  const wireless=['Bluetooth via Sidus Link / amaran App'];
  if(wifi) wireless.push('WiFi via Tuya Smart');
  const wirelessVerification={
    bluetooth:{
      verified:true,
      family:'amaran Sidus Bluetooth',
      scope:'transport-capability-only',
      sourceUrls:[sourceUrl],
      note:'amaran first-party documentation identifies Bluetooth transport and app control for this exact model or exact model family. This verifies transport capability only; LightingAI command semantics remain locked.'
    }
  };
  if(wifi) wirelessVerification.wifi={
    verified:true,
    family:'amaran SM5c Tuya Wi-Fi',
    scope:'transport-capability-only',
    sourceUrls:[SRC.sm5c,SRC.sm5cFaq],
    note:'amaran documents direct Wi-Fi reset and Tuya Smart control for SM5c. This verifies transport capability only; proprietary IP/session semantics remain locked.'
  };
  return {
    wired,
    wireless,
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:external,
    ...(nfc?{nfcPairing:true}:{}),
    unavailableDirectProtocols:[
      'amaran documents app transport and operator control, but LightingAI proprietary command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,...(wifi?[SRC.sm5cFaq]:[])],
    wirelessVerification,
    capabilityVerification:{
      dim:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:[sourceUrl],
        note:'amaran documents app intensity control for this fixture family. This proves operator capability only.'
      },
      ...(cct?{cct:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:[sourceUrl],
        note:'amaran documents app CCT control for this fixture family. This proves operator capability only.'
      }}:{}),
      ...(fullColor?{color:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:[sourceUrl],
        note:'amaran documents HSI/RGB/full-color app control for this fixture family. This proves operator capability only.'
      }}:{}),
      ...(fx?{fx:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:[sourceUrl],
        note:'amaran documents app lighting-effect control for this fixture family. This proves operator capability only.'
      }}:{})
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,options={}){
  return {
    id,manufacturer:'amaran',model,family,category:'Light',
    sourceType,formFactor,
    ...(options.cctK?{cctK:options.cctK}:{}),
    colorMode:options.fullColor?'Full Color':options.daylight?'Daylight':'Bi-Color',
    control:btControl(sourceUrl,{wifi:!!options.wifi,fullColor:!!options.fullColor,cct:!options.daylight,fx:options.fx!==false,wired:options.wired||[],external:options.external||[],nfc:!!options.nfc}),
    sourceUrl
  };
}

export const AMARAN_SIDUS_WIRELESS_FIXTURES=[
  fixture('amaran-60d-s','60d S','COB S','Daylight COB LED Spotlight','Spotlight / Monolight',SRC.s60,{daylight:true}),
  fixture('amaran-60x-s','60x S','COB S','Bi-Color COB LED Spotlight','Spotlight / Monolight',SRC.s60,{cctK:{min:2700,max:6500}}),
  fixture('amaran-100d-s','100d S','COB S','Daylight COB LED Spotlight','Spotlight / Monolight',SRC.s100200,{daylight:true}),
  fixture('amaran-100x-s','100x S','COB S','Bi-Color COB LED Spotlight','Spotlight / Monolight',SRC.s100200,{cctK:{min:2700,max:6500}}),
  fixture('amaran-200d-s','200d S','COB S','Daylight COB LED Spotlight','Spotlight / Monolight',SRC.s100200,{daylight:true}),
  fixture('amaran-200x-s','200x S','COB S','Bi-Color COB LED Spotlight','Spotlight / Monolight',SRC.s100200,{cctK:{min:2700,max:6500}}),
  fixture('amaran-150c','150c','Color COB','Full-Color COB LED Spotlight','Spotlight / Monolight',SRC.c150300,{fullColor:true,cctK:{min:2500,max:7500}}),
  fixture('amaran-300c','300c','Color COB','Full-Color COB LED Spotlight','Spotlight / Monolight',SRC.c150300,{fullColor:true,cctK:{min:2500,max:7500}}),
  fixture('amaran-p60c','P60c','P60','RGBWW LED Panel','Panel',SRC.p60,{fullColor:true,cctK:{min:2500,max:7500}}),
  fixture('amaran-p60x','P60x','P60','Bi-Color LED Panel','Panel',SRC.p60,{cctK:{min:3200,max:6500}}),
  fixture('amaran-f21x','F21x','Flexible Light','Bi-Color Flexible LED Mat','Flexible Panel / Mat',SRC.flex,{cctK:{min:2500,max:7500}}),
  fixture('amaran-f22x','F22x','Flexible Light','Bi-Color Flexible LED Mat','Flexible Panel / Mat',SRC.flex,{cctK:{min:2500,max:7500}}),
  fixture('amaran-f21c','F21c','Flexible Light','Full-Color Flexible LED Mat','Flexible Panel / Mat',SRC.flex,{fullColor:true,cctK:{min:2500,max:7500}}),
  fixture('amaran-f22c','F22c','Flexible Light','Full-Color Flexible LED Mat','Flexible Panel / Mat',SRC.flex,{fullColor:true,cctK:{min:2500,max:7500}}),
  fixture('amaran-t2c','T2c','T Tube','Full-Color LED Tube','Tube',SRC.tube,{fullColor:true}),
  fixture('amaran-t4c','T4c','T Tube','Full-Color LED Tube','Tube',SRC.tube,{fullColor:true}),
  fixture('amaran-pt1c','PT1c','PT Pixel Tube','Full-Color Pixel LED Tube','Tube',SRC.pixelTube,{fullColor:true}),
  fixture('amaran-pt2c','PT2c','PT Pixel Tube','Full-Color Pixel LED Tube','Tube',SRC.pixelTube,{fullColor:true}),
  fixture('amaran-pt4c','PT4c','PT Pixel Tube','Full-Color Pixel LED Tube','Tube',SRC.pixelTube,{fullColor:true}),
  fixture('amaran-sm5c','SM5c','Pixel Tape','Full-Color Pixel LED Tape','Flexible Panel / Mat',SRC.sm5c,{wifi:true,fullColor:true}),
  fixture('amaran-pano-60c','Pano 60c','Pano','RGBWW LED Panel','Panel',SRC.pano60c,{fullColor:true,cctK:{min:2300,max:10000},fx:false}),
  fixture('amaran-pano-120c','Pano 120c','Pano','RGBWW LED Panel','Panel',SRC.pano120c,{fullColor:true,cctK:{min:2300,max:10000},fx:false}),
  fixture('amaran-verge','Verge','Verge','Bi-Color LED Panel','Panel',SRC.verge,{cctK:{min:2700,max:6500},fx:false}),
  fixture('amaran-verge-max','Verge Max','Verge','Bi-Color LED Panel','Panel',SRC.vergeMax,{cctK:{min:2700,max:6500},fx:false}),
  fixture('amaran-go','Go','Go','Bi-Color Pocket LED Light','Pocket / Handheld',SRC.go,{cctK:{min:2700,max:6500},fx:false}),
  fixture('amaran-ace-25c','Ace 25c','Ace','RGBWW Pocket LED Light','Pocket / Handheld',SRC.ace25c,{fullColor:true,cctK:{min:2300,max:10000}}),
  fixture('amaran-ace-25x','Ace 25x','Ace','Bi-Color Pocket LED Light','Pocket / Handheld',SRC.ace25x,{cctK:{min:2700,max:6500}}),
  fixture('amaran-ray-60c','Ray 60c','Ray','OmniColor COB LED Light','Spotlight / Monolight',SRC.ray60c,{fullColor:true,cctK:{min:2300,max:10000},nfc:true}),
  fixture('amaran-ray-120c','Ray 120c','Ray','OmniColor COB LED Light','Spotlight / Monolight',SRC.ray120c,{fullColor:true,cctK:{min:2300,max:10000},nfc:true}),
  fixture('amaran-ray-360c','Ray 360c','Ray','OmniColor COB LED Light','Spotlight / Monolight',SRC.ray360c,{fullColor:true,cctK:{min:2300,max:10000},nfc:true,wired:['DMX512 via USB-C adapter'],external:['amaran USB-C to 5-Pin DMX In & Out Adapter for wired DMX512 control']}),
  fixture('amaran-ray-660c','Ray 660c','Ray','OmniColor COB LED Light','Spotlight / Monolight',SRC.ray660c,{fullColor:true,cctK:{min:2300,max:10000},nfc:true,wired:['DMX512 via USB-C adapter'],external:['amaran USB-C to 5-Pin DMX In & Out Adapter for wired DMX512 control']})
];
