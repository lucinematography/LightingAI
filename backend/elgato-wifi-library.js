// Elgato exact-model Wi-Fi coverage.
// First-party Elgato product/manual evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  keyLight:'https://www.elgato.com/us/en/p/key-light',
  keyLightGuide:'https://www.elgato.com/us/en/explorer/products/lighting/elgato-key-light-quick-start-guide/',
  keyLightMk2:'https://help.elgato.com/hc/en-us/articles/20934004416269-Elgato-Key-Light-MK-2-Technical-Specifications',
  keyLightIdentify:'https://help.elgato.com/hc/en-us/articles/20935383021965-Elgato-Key-Light-How-to-Identify-if-You-Have-a-Key-Light-or-Key-Light-MK-2',
  keyLightAir:'https://help.elgato.com/hc/en-us/article_attachments/360081486532',
  keyLightAirMk2:'https://www.elgato.com/us/en/explorer/products/lighting/key-light-air-mk2-quick-start-guide/',
  keyLightNeo:'https://www.elgato.com/ww/en/s/user-manual/key-light-neo',
  ringLight:'https://help.elgato.com/hc/en-us/article_attachments/360081559211'
};

function wifiControl(sourceUrl,note){
  const sources=[sourceUrl];
  return {
    wired:[],
    wireless:['Wi-Fi via Elgato Control Center'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Elgato documents Wi-Fi/Control Center operation for this exact model, but LightingAI network command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'Elgato Control Center Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:note+' LightingAI proprietary network command semantics remain locked.'
      }
    }
  };
}

function panel(id,model,sourceUrl,powerDrawW,cctK,note){
  const row={
    id,
    manufacturer:'Elgato',
    model,
    family:'Key Light',
    category:'Light',
    sourceType:'Bi-Color LED Panel',
    formFactor:'Panel',
    cctK,
    colorMode:'Bi-Color',
    control:wifiControl(sourceUrl,note),
    sourceUrl
  };
  if(Number.isFinite(powerDrawW)) row.powerDrawW=powerDrawW;
  return row;
}

export const ELGATO_WIFI_FIXTURES=[
  panel('elgato-key-light','Key Light',SRC.keyLight,45,{min:2900,max:7000},'First-party Elgato product and setup documentation explicitly confirm Wi-Fi and Control Center control for Key Light.'),
  panel('elgato-key-light-mk2','Key Light MK.2',SRC.keyLightMk2,45,{min:2900,max:7000},'First-party Elgato documentation identifies Key Light MK.2 as model 20GAK9902, distinct from original Key Light model 20GAK9901, and explicitly confirms 2.4/5 GHz Wi-Fi plus Control Center support.'),
  panel('elgato-key-light-air','Key Light Air',SRC.keyLightAir,null,{min:2900,max:7000},'First-party Elgato setup documentation explicitly confirms Wi-Fi and Control Center control for Key Light Air.'),
  panel('elgato-key-light-air-mk2','Key Light Air MK.2',SRC.keyLightAirMk2,30,{min:2900,max:7000},'First-party Elgato documentation explicitly confirms Wi-Fi and Control Center control for Key Light Air MK.2. Bluetooth is used for initial Wi-Fi pairing only and is not treated as a production-control transport.'),
  panel('elgato-key-light-neo','Key Light Neo',SRC.keyLightNeo,15,{min:2900,max:7000},'First-party Elgato manual explicitly confirms Wi-Fi and Control Center control for Key Light Neo.'),
  {
    id:'elgato-ring-light',
    manufacturer:'Elgato',
    model:'Ring Light',
    family:'Ring Light',
    category:'Light',
    sourceType:'Bi-Color LED Ring Light',
    formFactor:'Ring Light',
    colorMode:'Bi-Color',
    control:wifiControl(SRC.ringLight,'First-party Elgato setup documentation explicitly confirms Wi-Fi and Control Center control for Ring Light.'),
    sourceUrl:SRC.ringLight
  }
];
