// SUMOLIGHT exact-model Wi-Fi lighting coverage.
// First-party SUMOLIGHT product evidence only.
// SUMOSPACE+ documents standard Art-Net/sACN over LAN/Wi-Fi; exact-hardware replay remains required before LightingAI production readiness.
const SRC={
  sumospace:'https://sumolight.com/sumospace'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'SUMOLIGHT documents a 0-100% dimming range for SUMOSPACE+ together with Wi-Fi network control. This proves operator capability only; exact LightingAI hardware replay is still pending.'},
    cct:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'SUMOLIGHT documents 2800K-6500K bi-color control for SUMOSPACE+ together with Wi-Fi network control. This proves operator capability only.'}
  };
}

function wifiControl(sourceUrls){
  return {
    wired:['DMX512','RDM','Ethernet / LAN (Art-Net / sACN)'],
    wireless:['Wi-Fi (Art-Net / sACN)'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'SUMOLIGHT documents Wi-Fi plus Art-Net and sACN for SUMOSPACE+, but exact-model LightingAI network discovery, configuration and physical replay are not production-verified',
      'Do not infer undocumented vendor-specific discovery, authentication or configuration messages beyond the documented standard Art-Net/sACN transport'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'SUMOLIGHT SUMOSPACE+ Wi-Fi Art-Net/sACN',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party SUMOLIGHT documentation explicitly lists Ethernet/Wifi and Control: DMX, RDM, LAN, Wi-Fi; Art-Net, sACN for SUMOSPACE+. Standard protocol availability is verified; exact-hardware LightingAI replay remains locked pending physical evidence.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

export const SUMOLIGHT_WIFI_FIXTURES=[
  {
    id:'sumolight-sumospace-plus',
    manufacturer:'SUMOLIGHT',
    model:'SUMOSPACE+',
    family:'SUMOSPACE',
    category:'Light',
    sourceType:'Bi-Color LED Soft Light',
    formFactor:'Panel / Spacelight',
    colorMode:'Bi-Color / CCT',
    cctK:{min:2800,max:6500},
    cri:95,
    tlci:99,
    control:wifiControl([SRC.sumospace]),
    sourceUrl:SRC.sumospace
  }
];
