// Blizzard Lighting exact-model Wi-Fi fixture coverage.
// First-party Blizzard product evidence only.
// Wi-Fi / Art-Net / sACN transport is exact-model scoped; undocumented app/session semantics remain fail-closed.
const SRC={
  hemisphere:'https://www.blizzardpro.com/products/hemisphere',
  announcement:'https://www.blizzardpro.com/news/new-wireless-battery-par-uncovered-hemisphere-tm-with-at-full-tm-app-wireless-dmx-control'
};

function wifiControl(sourceUrls){
  return {
    wired:['DMX512'],
    wireless:['Wi-Fi via Blizzard At Full app','Art-Net over Wi-Fi','sACN over Wi-Fi'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Blizzard documents direct Wi-Fi, At Full, Art-Net and sACN control for Hemisphere, but LightingAI exact network discovery, addressing, DMX profile selection and physical replay are not production-verified',
      'Do not infer undocumented private At Full payload/session semantics from the documented standard Art-Net/sACN transport'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'Blizzard At Full / Art-Net / sACN over Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Blizzard Hemisphere documentation explicitly confirms Wi-Fi connectivity with At Full, Art-Net and sACN. LightingAI exact fixture replay and any undocumented app/session semantics remain locked.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Hemisphere first-party documentation explicitly lists smooth dimming.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Hemisphere first-party documentation explicitly lists RGBW color mixing and a virtual color wheel.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Hemisphere first-party documentation explicitly lists strobe plus built-in chase/fade presets.'}
    }
  };
}

export const BLIZZARD_HEMISPHERE_WIFI_FIXTURES=[
  {
    id:'blizzard-hemisphere',
    manufacturer:'Blizzard Lighting',
    model:'Hemisphere',
    family:'Hemisphere',
    category:'Light',
    sourceType:'RGBW LED PAR / Effect Light',
    formFactor:'PAR / Point Light',
    colorMode:'RGBW',
    powerDrawW:15,
    control:wifiControl([SRC.hemisphere,SRC.announcement]),
    sourceUrl:SRC.hemisphere
  }
];
