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
  sm5cFaq:'https://help.amarancreators.com/en/sm5c-pixel-tape/control-options-faq'
};

function btControl(sourceUrl,{wifi=false,fullColor=false,cct=true}={}){
  const wireless=['Bluetooth via Sidus Link / amaran App'];
  if(wifi) wireless.push('WiFi via Tuya Smart');
  const wirelessVerification={
    bluetooth:{
      verified:true,
      family:'amaran Sidus Bluetooth',
      scope:'transport-capability-only',
      sourceUrls:[sourceUrl],
      note:'amaran documents Bluetooth reset/pairing and app control for this exact model. This verifies transport capability only; LightingAI command semantics remain locked.'
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
    wired:[],
    wireless,
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
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
      fx:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:[sourceUrl],
        note:'amaran documents app lighting-effect control for this fixture family. This proves operator capability only.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,options={}){
  return {
    id,manufacturer:'amaran',model,family,category:'Light',
    sourceType,formFactor,
    ...(options.cctK?{cctK:options.cctK}:{}),
    colorMode:options.fullColor?'Full Color':options.daylight?'Daylight':'Bi-Color',
    control:btControl(sourceUrl,{wifi:!!options.wifi,fullColor:!!options.fullColor,cct:!options.daylight}),
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
  fixture('amaran-sm5c','SM5c','Pixel Tape','Full-Color Pixel LED Tape','Flexible Panel / Mat',SRC.sm5c,{wifi:true,fullColor:true})
];
