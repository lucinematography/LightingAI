// CineLight exact-model Bluetooth lighting coverage.
// First-party CineLight / CINEART product evidence only.
// CineCOB HUE X15 is direct Bluetooth; CineFLEX 400/700 use the required external controller with Bluetooth module.
// Proprietary BLE/GATT and app/session command semantics remain fail-closed.
const SRC={
  cinecobX15:'https://cinelight.com/fr/led-spotlights/cinecob-hue-x15-rgbw',
  cineflex400:'https://cinelight.com/en/module/producttopdf/view?id_product=761',
  cineflex700:'https://cinelight.com/en/module/producttopdf/view?id_product=762'
};

function capabilityVerification(sourceUrls,{cct=true,color=false}={}){
  const out={
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'CineLight documents Bluetooth app control together with electronic dimming for this exact model. This proves operator capability only, not LightingAI BLE command encoding.'}
  };
  if(cct){
    out.cct={verified:true,scope:'official-app-capability-only',sourceUrls,note:'CineLight documents tunable CCT together with Bluetooth app control for this exact model. This proves operator capability only.'};
  }
  if(color){
    out.color={verified:true,scope:'official-app-capability-only',sourceUrls,note:'CineLight documents RGB/HSI color control together with Bluetooth app control for this exact model. This proves operator capability only.'};
  }
  return out;
}

function directBluetoothControl(sourceUrls,model,opts={}){
  return {
    wired:[],
    wireless:['Bluetooth via LinkLite App (Android & iOS)','2.4 GHz radio remote'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'CineLight documents direct Bluetooth app control for '+model+', but LightingAI proprietary BLE/GATT discovery, pairing, service/characteristic UUIDs and command/session semantics are not production-verified',
      'The separate 2.4 GHz radio remote is not classified as Bluetooth/Wi-Fi in this checkpoint'
    ],
    sourceUrls,
    wirelessVerification:{bluetooth:{verified:true,family:'CineLight LinkLite Bluetooth',scope:'transport-capability-only',sourceUrls,note:'First-party CineLight documentation explicitly confirms Bluetooth app control for this exact monoblock. LightingAI proprietary BLE/GATT semantics remain locked.'}},
    capabilityVerification:capabilityVerification(sourceUrls,opts)
  };
}

function assistedBluetoothControl(sourceUrls,model,powerW,cctMin,cctMax){
  return {
    wired:['DMX512'],
    wireless:['Bluetooth via Desal Lite+ App','Wireless DMX'],
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:['CineFLEX external controller with Bluetooth module'],
    unavailableDirectProtocols:[
      'CineLight documents Bluetooth app control for '+model+' through its required external controller; direct Bluetooth in the flexible mat is not claimed',
      'LightingAI proprietary BLE/GATT discovery, pairing, service/characteristic UUIDs and command/session semantics are not production-verified',
      'Wireless DMX is a separate control path and is not treated as Bluetooth app transport'
    ],
    sourceUrls,
    wirelessVerification:{bluetooth:{verified:true,family:'CineLight CineFLEX controller Bluetooth',scope:'transport-capability-only',sourceUrls,note:'First-party CineLight documentation explicitly states that CineFLEX 400/700 controllers include a Bluetooth module for Desal Lite+ app control. This is assisted Bluetooth at the light-system level.'}},
    capabilityVerification:capabilityVerification(sourceUrls,{cct:true}),
    documentedPowerW:powerW,
    documentedCctK:{min:cctMin,max:cctMax}
  };
}

export const CINELIGHT_BLUETOOTH_FIXTURES=[
  {
    id:'cinelight-cinecob-hue-x15',
    manufacturer:'CineLight',
    model:'CineCOB HUE X15',
    family:'CineCOB HUE',
    category:'Light',
    sourceType:'RGBW COB Spotlight',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGBW / HSI / CCT',
    powerDrawW:150,
    cctK:{min:2700,max:6500},
    cri:98,
    tlci:99,
    control:directBluetoothControl([SRC.cinecobX15],'CineCOB HUE X15',{cct:true,color:true}),
    sourceUrl:SRC.cinecobX15
  },
  {
    id:'cinelight-cineflex-400-bicolor',
    manufacturer:'CineLight',
    model:'CineFLEX 400 Bi-Color',
    family:'CineFLEX',
    category:'Light',
    sourceType:'Bi-Color Flexible LED Mat',
    formFactor:'Flexible Mat / Panel',
    colorMode:'Bi-Color / CCT',
    powerDrawW:360,
    cctK:{min:3000,max:5600},
    cri:98,
    tlci:99,
    control:assistedBluetoothControl([SRC.cineflex400],'CineFLEX 400 Bi-Color',360,3000,5600),
    sourceUrl:SRC.cineflex400
  },
  {
    id:'cinelight-cineflex-700-bicolor',
    manufacturer:'CineLight',
    model:'CineFLEX 700 Bi-Color',
    family:'CineFLEX',
    category:'Light',
    sourceType:'Bi-Color Flexible LED Mat',
    formFactor:'Flexible Mat / Panel',
    colorMode:'Bi-Color / CCT',
    powerDrawW:680,
    cctK:{min:3000,max:5600},
    cri:98,
    tlci:99,
    control:assistedBluetoothControl([SRC.cineflex700],'CineFLEX 700 Bi-Color',680,3000,5600),
    sourceUrl:SRC.cineflex700
  }
];
