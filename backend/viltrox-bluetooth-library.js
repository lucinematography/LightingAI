// VILTROX exact-model Bluetooth / Weeylite Pro coverage.
// First-party Viltrox product evidence only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  ninja30:'https://viltrox.com/products/viltrox-ninja-30-30b',
  ninja20:'https://viltrox.com/products/weeylite-200w-5600k-app-control-professional-cob-sudio-light'
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

function fixture(id,model,cctK,colorMode,sourceUrl=SRC.ninja30,powerDrawW=300){
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
    powerDrawW,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const VILTROX_BLUETOOTH_FIXTURES=[
  fixture('viltrox-ninja-30','Ninja 30',{min:5600,max:5600},'Daylight'),
  fixture('viltrox-ninja-30b','Ninja 30B',{min:2800,max:6800},'Bi-Color'),
  {
    ...fixture('viltrox-ninja-20','Ninja 20',{min:5600,max:5600},'Daylight',SRC.ninja20,200),
    dmxProfileVerification:{
      status:'HOLD',
      reason:'VILTROX documents DMX control for Ninja 20, but LightingAI has not encoded and independently verified a manufacturer-published per-channel profile.',
      sourceUrls:[SRC.ninja20]
    }
  },
  {
    ...fixture('viltrox-ninja-20b','Ninja 20B',{min:2800,max:6800},'Bi-Color',SRC.ninja20,200),
    dmxProfileVerification:{
      status:'HOLD',
      reason:'VILTROX documents DMX control for Ninja 20B, but LightingAI has not encoded and independently verified a manufacturer-published per-channel profile.',
      sourceUrls:[SRC.ninja20]
    }
  }
];
