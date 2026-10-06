// Ape Labs exact-model assisted-Bluetooth lighting coverage.
// First-party Ape Labs product/control evidence only.
// Bluetooth is phone-to-CONNECT assisted transport; fixture radio semantics remain fail-closed.
const SRC={
  mini:'https://apelabs.com/en/apelight-mini',
  maxi:'https://apelabs.com/en/apelight-maxi',
  control:'https://apelabs.com/en/faq'
};

function assistedBluetoothControl(sourceUrl){
  const sources=[sourceUrl,SRC.control];
  return {
    wired:[],
    wireless:['Bluetooth via Ape Labs CONNECT to 2.4 GHz fixture radio'],
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:['Ape Labs CONNECT Bluetooth / wireless DMX gateway'],
    unavailableDirectProtocols:[
      'Ape Labs documents app control through CONNECT; direct fixture Bluetooth is not established and LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Ape Labs CONNECT assisted Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party Ape Labs documentation states app control for these exact fixtures in conjunction with CONNECT, with smartphone-to-CONNECT communication over Bluetooth. This is assisted Bluetooth; direct fixture BLE semantics are not claimed.'
      }
    }
  };
}

function fixture(id,model,sourceUrl,powerDrawW){
  return {
    id,
    manufacturer:'Ape Labs',
    model,
    family:'ApeLight V2',
    category:'Light',
    sourceType:'RGBW LED Uplight',
    formFactor:'PAR / Point Light',
    colorMode:'RGBW',
    powerDrawW,
    control:assistedBluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const APE_LABS_ASSISTED_BLUETOOTH_FIXTURES=[
  fixture('ape-labs-apelight-mini-v2','ApeLight Mini V2',SRC.mini,15),
  fixture('ape-labs-apelight-maxi-v2','ApeLight Maxi V2',SRC.maxi,45)
];
