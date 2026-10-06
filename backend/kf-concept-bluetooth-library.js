// K&F Concept exact-model direct-Bluetooth lighting coverage.
// First-party K&F Concept product evidence only.
// Transport and operator capabilities are model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  pl60b:'https://www.kfconcept.com/KF34.045_pl-60b-60w-bi-color-cob-light'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'K&F Concept documents Linklite app brightness control for PL-60B. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'K&F Concept documents Linklite app color-temperature control for PL-60B. This proves operator capability only.'},
    fx:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'K&F Concept documents app-accessible lighting effects for PL-60B. This proves operator capability only.'}
  };
}

function bluetoothControl(sourceUrls){
  return {
    wired:[],
    wireless:['Bluetooth via Linklite app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'K&F Concept documents Bluetooth Linklite app control for PL-60B, but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'K&F Concept Linklite Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party K&F Concept PL-60B documentation explicitly says to connect via Bluetooth to the Linklite app. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

export const KF_CONCEPT_BLUETOOTH_FIXTURES=[
  {
    id:'kf-concept-pl-60b',
    manufacturer:'K&F Concept',
    model:'PL-60B',
    family:'PL Series',
    category:'Light',
    sourceType:'Bi-Color COB LED Video Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'Bi-Color / Effects',
    powerDrawW:60,
    cctK:{min:2700,max:6500},
    cri:97,
    tlci:98,
    control:bluetoothControl([SRC.pl60b]),
    sourceUrl:SRC.pl60b
  }
];
