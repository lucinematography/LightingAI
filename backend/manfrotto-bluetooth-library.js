// Manfrotto exact-product Bluetooth lighting coverage.
// First-party Manfrotto product/collection/app-control evidence only.
// Transport evidence is model-scoped; proprietary Bluetooth/GATT command semantics remain fail-closed.
const SRC={
  lykosDaylight:'https://www.manfrotto.com/ie-en/led-light-lykos-daylight-mll1500-d/',
  studioSystems:'https://www.manfrotto.com/nl-en/products/studio-lighting-systems/',
  lykosCollection:'https://www.manfrotto.com/ch-de/kollektionen/beleuchtung/lykos/',
  digitalDirector:'https://www.manfrotto.com/global-en/digital-director-for-ipad-mini-3-and-ipad-mini-2-mvddm23/',
  lumimuseGuide:'https://www.manfrotto.com/global-uk/stories/food-photography-guide/'
};

function assistedLykosDaylightControl(){
  const sourceUrls=[SRC.lykosDaylight,SRC.lykosCollection,SRC.digitalDirector];
  return {
    wired:[],
    wireless:['Bluetooth via optional Manfrotto LYKOS Bluetooth Dongle'],
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:['Manfrotto LYKOS Bluetooth Dongle'],
    unavailableDirectProtocols:[
      'Manfrotto documents Bluetooth control for LYKOS Daylight MLL1500-D only through the optional LYKOS Bluetooth dongle; LightingAI proprietary Bluetooth/GATT discovery, pairing, services, characteristics and command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Manfrotto LYKOS Bluetooth Dongle',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Manfrotto documentation identifies MLL1500-D as Bluetooth-ready and remotely controllable with the optional LYKOS Bluetooth dongle through the dedicated iPhone/Digital Director app path. This is adapter-assisted Bluetooth; LightingAI command semantics remain locked.'
      }
    }
  };
}

function directLykos2Control(){
  const sourceUrls=[SRC.studioSystems];
  return {
    wired:[],
    wireless:['Bluetooth (integrated)'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Manfrotto lists the exact Lykos 2.0 2 in 1 water-resistant product as Bluetooth-equipped, but this checkpoint does not infer controller-app identity, GATT services, UUIDs, characteristics, pairing/session state, packet framing or command encoding'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Manfrotto Lykos 2.0 integrated Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Manfrotto studio-lighting catalog explicitly lists the exact Lykos 2.0 2 in 1 water-resistant model with Bluetooth. LightingAI proprietary command/session semantics remain locked.'
      }
    }
  };
}

function directLumimuseControl(){
  const sourceUrls=[SRC.studioSystems,SRC.lumimuseGuide];
  return {
    wired:[],
    wireless:['Bluetooth via Lumimuse App (iOS documented path)'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Manfrotto documents built-in Bluetooth and Lumimuse iOS app control for Lumimuse8 Bluetooth, but LightingAI proprietary Bluetooth/GATT discovery, pairing, services, characteristics and command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Manfrotto Lumimuse8 Bluetooth',
        scope:'transport-capability-only-ios',
        sourceUrls,
        note:'First-party Manfrotto documentation explicitly identifies Lumimuse8 with Bluetooth wireless technology and iOS remote control. No Android control path is asserted in this checkpoint.'
      }
    },
    capabilityVerification:{
      dim:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls,
        note:'Manfrotto documents remote Lumimuse8 brightness control through the iOS app. This proves operator capability only, not LightingAI Bluetooth command encoding.'
      }
    }
  };
}

export const MANFROTTO_BLUETOOTH_FIXTURES=[
  {
    id:'manfrotto-lykos-daylight-mll1500-d',
    manufacturer:'Manfrotto',
    model:'LYKOS Daylight MLL1500-D',
    family:'LYKOS',
    category:'Light',
    sourceType:'Daylight LED Panel',
    formFactor:'Panel',
    colorMode:'Daylight',
    cctK:{min:5600,max:5600},
    cri:93,
    control:assistedLykosDaylightControl(),
    sourceUrl:SRC.lykosDaylight
  },
  {
    id:'manfrotto-lykos-2-0-2-in-1',
    manufacturer:'Manfrotto',
    model:'Lykos 2.0, 2 in 1 water-resistant with Bluetooth',
    family:'LYKOS 2.0',
    category:'Light',
    sourceType:'Water-Resistant LED Light',
    formFactor:'Panel',
    control:directLykos2Control(),
    sourceUrl:SRC.studioSystems
  },
  {
    id:'manfrotto-lumimuse8-bluetooth',
    manufacturer:'Manfrotto',
    model:'Lumimuse8 LED with Bluetooth Wireless Technology',
    family:'Lumimuse',
    category:'Light',
    sourceType:'On-Camera LED Light',
    formFactor:'Pocket / Handheld / On-Camera',
    colorMode:'Daylight',
    cctK:{min:5600,max:5600},
    cri:92,
    control:directLumimuseControl(),
    sourceUrl:SRC.studioSystems
  }
];
