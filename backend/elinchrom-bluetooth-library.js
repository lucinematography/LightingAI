// Elinchrom exact-model direct-Bluetooth monolight coverage.
// First-party Elinchrom product/support evidence only.
// Built-in Bluetooth app transport is model-scoped; proprietary BLE/GATT and bridge/session semantics remain fail-closed.
const SRC={
  one:'https://dev.elinchrom.com/products/elinchrom-one/',
  onePr:'https://www.elinchrom.com/news/press-release/elinchrom-one-pr/',
  three:'https://dev.elinchrom.com/news/press-release/elinchrom-three-pr/',
  five:'https://dev.elinchrom.com/news/press-release/elinchrom-five-pr/',
  battery:'https://elinchrom.com/en/Home/Shop/Flashes___Lights/Battery_Flash',
  studio:'https://elinchrom.com/enSG/Home/Shop/Software/Elinchrom_Studio_App?id=EL-0001'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Elinchrom documents app/software remote control together with a dimmable LED modeling light for this exact monolight. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Elinchrom documents a variable 2700-6500 K LED modeling light together with built-in Bluetooth app/software control for this exact monolight. This proves operator capability only.'}
  };
}

function bluetoothControl(sourceUrls,model){
  return {
    wired:['USB-C service / charging'],
    wireless:['Bluetooth via Elinchrom Studio App / Software','Elinchrom Skyport radio'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Elinchrom documents built-in Bluetooth app/software control for '+model+', but LightingAI proprietary BLE/GATT discovery, pairing, service/characteristic UUIDs, bridge/session state and command payload semantics are not production-verified',
      'Elinchrom Skyport is a separate proprietary radio path and is not classified as Bluetooth or Wi-Fi in this checkpoint',
      'Internal WLAN/IoT update capability, where documented, is not treated as user lighting-control Wi-Fi without exact first-party control evidence'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Elinchrom Studio built-in Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Elinchrom exact-model documentation confirms built-in Bluetooth and Elinchrom Studio app/software control. LightingAI proprietary BLE/GATT and bridge/session semantics remain locked pending physical capture/replay.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

function fixture(id,model,flashWs,ledPowerW,sourceUrls){
  return {
    id,
    manufacturer:'Elinchrom',
    model,
    family:'Battery Monolight',
    category:'Light',
    sourceType:'Battery Flash Monolight with Bi-Color LED Modeling Light',
    formFactor:'Monolight',
    colorMode:'Bi-Color Modeling LED',
    flashEnergyWs:flashWs,
    modelingLedPowerW:ledPowerW,
    cctK:{min:2700,max:6500},
    control:bluetoothControl(sourceUrls,model),
    sourceUrl:sourceUrls[0]
  };
}

export const ELINCHROM_BLUETOOTH_FIXTURES=[
  fixture('elinchrom-one','ONE',131,20,[SRC.one,SRC.onePr,SRC.studio]),
  fixture('elinchrom-three','THREE',261,20,[SRC.three,SRC.studio]),
  fixture('elinchrom-five','FIVE',522,26,[SRC.five,SRC.battery,SRC.studio])
];
