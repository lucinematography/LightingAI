// Hive Lighting exact-model Bluetooth / Hive SHOT coverage.
// First-party Hive Lighting product/control sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  control:'https://hivelighting.com/is-control/',
  bumble25cx:'https://hivelighting.com/bb-25-cx/',
  bee50c:'https://hivelighting.com/products/bee-50-c-open-face-omni-color-led-light/',
  wasp100c:'https://hivelighting.com/products/wasp-100-c-led-spot/',
  wasp100cx:'https://hivelighting.com/products/wasp-100-cx/',
  hornet200c:'https://hivelighting.com/products/hornet-200-c-open-face-omni-color-led-light/',
  hornet200cx:'https://hivelighting.com/products/hornet-200-cx/',
  hornet575c:'https://hivelighting.com/575-c-vs/'
};

function bluetoothControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via Hive SHOT App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Hive documents Bluetooth app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,SRC.control],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Hive SHOT Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.control],
        note:'First-party Hive documentation confirms Bluetooth app control. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceUrl,powerDrawW){
  return {
    id,
    manufacturer:'Hive Lighting',
    model,
    family,
    category:'Light',
    sourceType:'Omni-Color LED',
    formFactor:'Spotlight / Monolight',
    cctK:{min:1650,max:8000},
    colorMode:'Omni-Color Full Color',
    powerDrawW,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const HIVE_BLUETOOTH_FIXTURES=[
  fixture('hive-bumble-bee-25-cx','Bumble Bee 25-CX','CX Series',SRC.bumble25cx,25),
  fixture('hive-bee-50-c','Bee 50-C','C Series',SRC.bee50c,40),
  fixture('hive-wasp-100-c','Wasp 100-C','C Series',SRC.wasp100c,75),
  fixture('hive-wasp-100-cx','Wasp 100-CX','CX Series',SRC.wasp100cx,75),
  fixture('hive-hornet-200-c','Hornet 200-C','C Series',SRC.hornet200c,150),
  fixture('hive-hornet-200-cx','Hornet 200-CX','CX Series',SRC.hornet200cx,150),
  fixture('hive-super-hornet-575-c','Super Hornet 575-C','C Series',SRC.hornet575c,500)
];
