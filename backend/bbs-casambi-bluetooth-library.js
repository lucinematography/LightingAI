// BB&S Lighting exact-model Casambi Bluetooth Low Energy mesh track-light coverage.
// First-party Brother, Brother & Sons / BB&S Lighting product evidence only.
// The exact catalog entries include the Casambi LED track driver; proprietary GATT/Casambi mesh command/session semantics remain fail-closed.
const SRC={
  cblTrack:'https://www.brothers-sons.dk/da_DK/shop/compact-beamlight-1-incl-eutrac-track-mount-and-led-driver-9521',
  cbl:'https://brothers-sonsamerica.com/products/compact/compact-beamlight/',
  cflTrack:'https://brothers-sonsamerica.com/products/track-lighting/compact-fresnel-light-bi-color-incl-eutrac-track-mount-and-led-driver/',
  track:'https://www.brothers-sons.dk/track-lights'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'BB&S documents Casambi smartphone/tablet brightness control for its track-lighting system and a Casambi track-driver option for these exact configurations. This proves operator capability only, not LightingAI BLE/Casambi command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'BB&S documents Casambi color-temperature control for track lighting, and the exact Bi-Color configurations are tunable-CCT products. This proves operator capability only.'}
  };
}

function casambiControl(sourceUrls,model,wired){
  return {
    wired,
    wireless:['Bluetooth Low Energy mesh via Casambi track driver'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'BB&S documents Casambi BLE-mesh control for '+model+', but LightingAI proprietary GATT/Casambi mesh command and session semantics are not production-verified',
      'Do not infer fixture-body GATT UUIDs, Casambi mesh payloads, commissioning keys or packet formats from the documented Casambi capability'
    ],
    sourceUrls,
    wirelessVerification:{bluetooth:{verified:true,family:'BB&S Casambi BLE mesh track driver',scope:'transport-capability-only',sourceUrls,note:'First-party BB&S documentation verifies the Casambi BLE-mesh track-driver option and smartphone/tablet control. builtInBluetooth is scoped to this sold track-light configuration including its Casambi driver, not to the bare lamp head. LightingAI command semantics remain locked.'}},
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

export const BBS_CASAMBI_BLUETOOTH_FIXTURES=[
  {id:'bbs-compact-beamlight-1-bicolor-casambi-track',manufacturer:'BB&S Lighting',model:'Compact Beamlight 1 Bi-Color incl. Eutrac Track Mount and LED Driver (Casambi)',family:'Compact Beamlight 1',category:'Light',sourceType:'Bi-Color LED Beam Light',formFactor:'Track-Mounted Spotlight / Beam Light',colorMode:'Bi-Color / CCT',powerDrawW:40,cctK:{min:2700,max:5600},tlci:98,control:casambiControl([SRC.cblTrack,SRC.cbl,SRC.track],'Compact Beamlight 1 Bi-Color Casambi track configuration',['DMX512 / RDM track-driver option']),sourceUrl:SRC.cblTrack},
  {id:'bbs-compact-fresnel-bicolor-casambi-track',manufacturer:'BB&S Lighting',model:'Compact Fresnel Light Bi-Color incl. Eutrac Track Mount and LED Driver (Casambi)',family:'Compact Fresnel Light',category:'Light',sourceType:'Bi-Color LED Fresnel',formFactor:'Track-Mounted Fresnel',colorMode:'Bi-Color / CCT',powerDrawW:40,cctK:{min:2700,max:5600},tlci:96,control:casambiControl([SRC.cflTrack,SRC.track],'Compact Fresnel Light Bi-Color Casambi track configuration',['DMX512 / RDM track-driver option','DALI track-driver option']),sourceUrl:SRC.cflTrack}
];
