// Ape Labs exact-model assisted-Bluetooth lighting coverage.
// First-party Ape Labs product/control evidence only.
// Bluetooth is smartphone/tablet-to-CONNECT assisted transport; fixture-side 2.4 GHz semantics remain fail-closed.
const SRC={
  mini:'https://apelabs.com/en/produkt/apelight-mini-tn-2/',
  maxi:'https://apelabs.com/en/produkt/variabler-artikel/',
  lightCan:'https://apelabs.com/en/produkt/apelight-lightcan-tn/',
  tableLight:'https://apelabs.com/en/produkt/apelight-tablelight-tn/',
  apeCoin:'https://apelabs.com/en/apelight-apecoin/',
  apeCoinGu10:'https://apelabs.com/en/produkt/apelight-apecoin-gu10-tn/',
  apeStickL:'https://apelabs.com/en/produkt/apelight-apestick-tn/',
  apeStickXl:'https://apelabs.com/en/produkt/apelight-apestick-xl-tn/',
  control:'https://apelabs.com/en/manual/connect/control.html'
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
      'Ape Labs documents smartphone/tablet control through CONNECT; direct fixture Bluetooth light-control semantics are not claimed',
      'Fixture-side 2.4 GHz radio and proprietary command/session semantics are not production-verified by LightingAI'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Ape Labs CONNECT assisted Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party Ape Labs documentation states that smartphone/tablet app control requires CONNECT and a Bluetooth-capable iOS/Android device, while the fixture-side radio remains 2.4 GHz. This is assisted Bluetooth only; direct fixture BLE light-control semantics are not claimed.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,powerDrawW,colorMode='RGBW'){
  const row={
    id,
    manufacturer:'Ape Labs',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    colorMode,
    control:assistedBluetoothControl(sourceUrl),
    sourceUrl
  };
  if(Number.isFinite(powerDrawW)) row.powerDrawW=powerDrawW;
  return row;
}

export const APE_LABS_ASSISTED_BLUETOOTH_FIXTURES=[
  fixture('ape-labs-apelight-mini-v2','ApeLight Mini V2','ApeLight V2','RGBW LED Uplight','PAR / Point Light',SRC.mini,15),
  fixture('ape-labs-apelight-maxi-v2','ApeLight Maxi V2','ApeLight V2','RGBW LED Uplight','PAR / Point Light',SRC.maxi,45),
  fixture('ape-labs-lightcan-v2','LightCan V2','LightCan','RGBWW Battery Uplight','Compact Uplight / Point Light',SRC.lightCan,15,'RGBWW'),
  fixture('ape-labs-tablelight-v2','TableLight V2','TableLight','RGBWW Battery Practical Light','Table / Practical Light',SRC.tableLight,15,'RGBWW'),
  fixture('ape-labs-apecoin-v2','ApeCoin V2','ApeCoin','RGBWW Compact Accent Light','Compact Uplight / Point Light',SRC.apeCoin,15,'RGBWW'),
  fixture('ape-labs-apecoin-gu10','ApeCoin GU10','ApeCoin','RGBWW GU10 Practical Lamp','Bulb / GU10',SRC.apeCoinGu10,3,'RGBWW'),
  fixture('ape-labs-apestick-l','ApeStick L','ApeStick','RGBW Battery LED Bar','Tube / Bar',SRC.apeStickL,36),
  fixture('ape-labs-apestick-xl','ApeStick XL','ApeStick','RGBW Battery LED Bar','Tube / Bar',SRC.apeStickXl,55)
];
