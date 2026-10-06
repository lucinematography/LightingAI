// Cineo exact-model StageLynx Wi-Fi/IP lighting coverage.
// First-party Cineo product and StageLynx app evidence only.
// Standard sACN transport is documented; proprietary discovery/session semantics remain fail-closed.
const SRC={
  r10White:'https://cineolighting.com/news/cineo-lighting-unveils-new-reflex-r10-at-2024-bsc-expo',
  r10Color:'https://cineolighting.com/news/cineo-reflex-r10-color-tower-now-available',
  stageLynx:'https://cineolighting.com/stagelynx',
  app:'https://play.google.com/store/apps/details?id=com.cineolighting.stagelynx'
};

function wifiControl(sourceUrls,model){
  return {
    wired:['Ethernet / sACN'],
    wireless:['Wi-Fi via Cineo StageLynx','sACN over wireless IP network'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Cineo documents StageLynx control for '+model+' over Ethernet/Wi-Fi and sACN over wired/wireless IP networks, but LightingAI exact discovery, addressing, session handling and physical replay are not production-verified',
      'Do not infer a proprietary StageLynx API, private payload encoding, Bluetooth route or undocumented command semantics from the documented Wi-Fi/sACN transport'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'Cineo StageLynx / sACN over Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Cineo StageLynx documentation and the vendor-published StageLynx app identify R10 support and control over Ethernet or Wi-Fi using sACN. LightingAI proprietary discovery/session semantics and exact-hardware replay remain locked.'
      }
    }
  };
}

export const CINEO_STAGELYNX_WIFI_FIXTURES=[
  {
    id:'cineo-reflex-r10-white-tower',
    manufacturer:'Cineo',
    model:'Reflex R10 White Tower',
    family:'Reflex R10',
    category:'Light',
    sourceType:'Bi-Color LED Hard Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'Bi-Color / CCT',
    control:wifiControl([SRC.r10White,SRC.stageLynx,SRC.app],'Reflex R10 White Tower'),
    sourceUrl:SRC.r10White
  },
  {
    id:'cineo-reflex-r10-color-tower',
    manufacturer:'Cineo',
    model:'Reflex R10 Color Tower',
    family:'Reflex R10',
    category:'Light',
    sourceType:'RGBWW LED Hard Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGBWW / CCT',
    cctK:{min:2700,max:10000},
    control:wifiControl([SRC.r10Color,SRC.stageLynx,SRC.app],'Reflex R10 Color Tower'),
    sourceUrl:SRC.r10Color
  }
];
