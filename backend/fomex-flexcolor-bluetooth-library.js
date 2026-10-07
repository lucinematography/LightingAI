// Fomex Flexcolor exact-model direct-Bluetooth lighting coverage.
// First-party Fomex product/flyer evidence only.
// Transport and operator capabilities are model-scoped; proprietary Bluetooth command/session semantics remain fail-closed.
const SRC={
  fc600:'https://www.fomex.com/product/fc600/',
  fc1200:'https://www.fomex.com/product/fc1200/',
  flyer:'https://www.fomex.com/wp-content/uploads/kboard_thumbnails/4/manual/flexcolor%204p%20flyer_EN%28VER.202302%29.pdf'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Fomex Flexcolor documentation specifies 0-100% dimmer control for FC600/FC1200. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Fomex Flexcolor documentation specifies 2000K-10000K CCT control for FC600/FC1200. This proves operator capability only.'},
    color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Fomex Flexcolor documentation specifies RGB/HSI/GEL/X-Y color control for FC600/FC1200. This proves operator capability only.'},
    fx:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Fomex Flexcolor documentation lists Effects among available control modes. This proves operator capability only.'}
  };
}

function bluetoothControl(sourceUrl,model){
  const sourceUrls=[sourceUrl,SRC.flyer];
  return {
    wired:['DMX512 / RDM'],
    wireless:['Bluetooth via integrated Timo Two control path','CRMX wireless DMX'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Fomex documents Timo Two Bluetooth control for Flexcolor '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified',
      'CRMX is a separate wireless-DMX route and is not classified as Wi-Fi in this checkpoint'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Fomex Flexcolor Timo Two Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Fomex Flexcolor documentation for FC600/FC1200 identifies the Timo Two Bluetooth module and portable-device Bluetooth control. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

export const FOMEX_FLEXCOLOR_BLUETOOTH_FIXTURES=[
  {
    id:'fomex-flexcolor-fc600',
    manufacturer:'Fomex',
    model:'Flexcolor FC600',
    family:'Flexcolor',
    category:'Light',
    sourceType:'RGBWW Flexible LED Mat',
    formFactor:'Flexible Panel / Mat',
    colorMode:'RGBWW / CCT / HSI / GEL / X-Y / FX',
    powerDrawW:60,
    cctK:{min:2000,max:10000},
    cri:95,
    tlci:95,
    control:bluetoothControl(SRC.fc600,'FC600'),
    sourceUrl:SRC.fc600
  },
  {
    id:'fomex-flexcolor-fc1200',
    manufacturer:'Fomex',
    model:'Flexcolor FC1200',
    family:'Flexcolor',
    category:'Light',
    sourceType:'RGBWW Flexible LED Mat',
    formFactor:'Flexible Panel / Mat',
    colorMode:'RGBWW / CCT / HSI / GEL / X-Y / FX',
    powerDrawW:120,
    cctK:{min:2000,max:10000},
    cri:95,
    tlci:95,
    control:bluetoothControl(SRC.fc1200,'FC1200'),
    sourceUrl:SRC.fc1200
  }
];
