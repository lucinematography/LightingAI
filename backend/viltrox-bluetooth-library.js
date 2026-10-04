// VILTROX exact-model Bluetooth / Weeylite Pro coverage.
// First-party Viltrox product evidence only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  ninja30:'https://viltrox.com/products/viltrox-ninja-30-30b'
};

function bluetoothControl(sourceUrl){
  return {
    wired:['DMX'],
    wireless:['Bluetooth via Weeylite Pro App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'VILTROX documents Bluetooth app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'VILTROX / Weeylite Pro Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl],
        note:'First-party VILTROX documentation explicitly confirms mobile APP / Bluetooth control. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,cctK,colorMode){
  return {
    id,
    manufacturer:'VILTROX',
    model,
    family:'Ninja 30',
    category:'Light',
    sourceType:'COB LED',
    formFactor:'COB / Monolight',
    cctK,
    colorMode,
    powerDrawW:300,
    control:bluetoothControl(SRC.ninja30),
    sourceUrl:SRC.ninja30
  };
}

export const VILTROX_BLUETOOTH_FIXTURES=[
  fixture('viltrox-ninja-30','Ninja 30',{min:5600,max:5600},'Daylight'),
  fixture('viltrox-ninja-30b','Ninja 30B',{min:2800,max:6800},'Bi-Color')
];
