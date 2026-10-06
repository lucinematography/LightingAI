// broncolor exact-model Wi-Fi coverage.
// First-party broncolor product/app/software evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  ledF160:'https://broncolor.swiss/products/led-f160',
  sirosS:'https://broncolor.swiss/products/siros-s',
  sirosL:'https://broncolor.swiss/products/siros-l',
  app:'https://broncolor.swiss/products/broncontrol-1?variant=1421',
  software:'https://broncolor.swiss/software'
};

function wifiControl(sourceUrl){
  const sources=[sourceUrl,SRC.app,SRC.software];
  return {
    wired:[],
    wireless:['Wi-Fi via bronControl'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'broncolor documents Wi-Fi/bronControl operation for this exact model, but LightingAI network command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'broncolor Wi-Fi / bronControl',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party broncolor documentation explicitly confirms Wi-Fi/bronControl operation for this exact model. LightingAI proprietary network command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,power){
  const row={
    id,
    manufacturer:'broncolor',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    control:wifiControl(sourceUrl),
    sourceUrl
  };
  if(power) row.flashEnergyJ=power;
  return row;
}

export const BRONCOLOR_LED_F160_WIFI_FIXTURES=[
  fixture('broncolor-led-f160','LED F160','LED F160','Variable-CCT LED Spotlight','Spotlight / Monolight',SRC.ledF160),
  fixture('broncolor-siros-400-s-wifi','Siros 400 S WiFi / RFS 2','Siros S','Studio Flash Monolight','Monolight',SRC.sirosS,400),
  fixture('broncolor-siros-800-s-wifi','Siros 800 S WiFi / RFS 2','Siros S','Studio Flash Monolight','Monolight',SRC.sirosS,800),
  fixture('broncolor-siros-400-l-wifi','Siros 400 L WiFi / RFS 2','Siros L','Battery Studio Flash Monolight','Monolight',SRC.sirosL,400),
  fixture('broncolor-siros-800-l-wifi','Siros 800 L WiFi / RFS 2','Siros L','Battery Studio Flash Monolight','Monolight',SRC.sirosL,800)
];
