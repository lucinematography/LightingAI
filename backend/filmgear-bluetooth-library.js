// Filmgear exact-model Bluetooth lighting coverage.
// First-party Filmgear HTML product evidence only.
// Bluetooth/FG App transport is model-scoped; proprietary BLE/GATT command/session semantics remain fail-closed.
const SRC={
  zenith900c:'https://www.filmgear.net/index.php?product_id=1137&route=product%2Fproduct',
  zenith2000c:'https://www.filmgear.net/index.php?product_id=1132&route=product%2Fproduct',
  mega1200c:'https://www.filmgear.net/index.php?product_id=1127&route=product%2Fproduct',
  aurora700c:'https://www.filmgear.net/index.php?path=521_195_555&product_id=1133&route=product%2Fproduct',
  aurora1200c:'https://www.filmgear.net/index.php?manufacturer_id=15&product_id=1134&route=product%2Fproduct'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Filmgear documents 0-100% dimming together with Bluetooth/FG App control for this exact model. This proves operator capability only, not LightingAI BLE command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Filmgear documents tunable CCT together with Bluetooth/FG App control for this exact model. This proves operator capability only.'},
    color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Filmgear documents RGB/RGBW or RGBWW color mixing together with Bluetooth/FG App control for this exact model. This proves operator capability only.'}
  };
}

function bluetoothControl(sourceUrls,model){
  return {
    wired:['DMX512','Ethernet'],
    wireless:['Bluetooth via FG App','CRMX / Wireless DMX'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Filmgear documents Bluetooth/FG App control for '+model+', but LightingAI proprietary BLE/GATT discovery, pairing, service/characteristic UUIDs and command/session semantics are not production-verified',
      'Ethernet is documented separately and is not treated as Wi-Fi in this checkpoint',
      'CRMX/Wireless DMX is a separate wireless-DMX path and is not treated as Bluetooth app transport'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Filmgear FG App Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Filmgear exact-model HTML pages explicitly list Bluetooth and FG App access. LightingAI proprietary BLE/GATT command/session semantics remain locked pending physical capture/replay.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

function fixture(id,model,family,powerDrawW,cctMin,cctMax,cri,tlci,sourceUrl,formFactor){
  return {
    id,
    manufacturer:'Filmgear',
    model,
    family,
    category:'Light',
    sourceType:'Full-Color LED',
    formFactor,
    colorMode:'RGB / Multi-White / CCT',
    powerDrawW,
    cctK:{min:cctMin,max:cctMax},
    cri,
    tlci,
    control:bluetoothControl([sourceUrl],model),
    sourceUrl
  };
}

export const FILMGEAR_BLUETOOTH_FIXTURES=[
  fixture('filmgear-zenith-900c-plus','Zenith 900C Plus','Zenith Plus',900,2000,15000,96,95,SRC.zenith900c,'High-Power LED Panel'),
  fixture('filmgear-zenith-2000c-plus','Zenith 2000C Plus','Zenith Plus',2000,2000,15000,96,95,SRC.zenith2000c,'High-Power LED Panel'),
  fixture('filmgear-mega-1200c','MEGA 1200C','MEGA',1200,2000,15000,96,95,SRC.mega1200c,'Megabrute / Multi-Head Wash System'),
  fixture('filmgear-aurora-a700c','Aurora A700C','Aurora',750,1800,15000,95,95,SRC.aurora700c,'LED Panel'),
  fixture('filmgear-aurora-a1200c','Aurora A1200C','Aurora',1500,1800,15000,95,95,SRC.aurora1200c,'LED Panel')
];
