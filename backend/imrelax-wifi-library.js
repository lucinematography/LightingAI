// IMRELAX exact-model Wi-Fi lighting coverage.
// First-party IMRELAX official store evidence only.
// Transport and operator capabilities are model-scoped; proprietary network command/session semantics remain fail-closed.
const SRC={
  imBtwp1218:'https://shop.imrelax.com/products/12x18w-ip65-battery-wireless-led-par-light'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'IMRELAX documents 0-100% smooth dimming for IM-BTWP1218 together with Wi-Fi app control. This proves operator capability only, not LightingAI network command encoding.'},
    color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'IMRELAX documents RGBWA+UV color mixing for IM-BTWP1218 together with Wi-Fi app control. This proves operator capability only.'}
  };
}

function wifiControl(sourceUrls){
  return {
    wired:['DMX512'],
    wireless:['Wi-Fi via vendor-documented iOS/Android app','2.4 GHz wireless DMX'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'IMRELAX documents Wi-Fi app control for IM-BTWP1218, but LightingAI proprietary network discovery, session and command semantics are not production-verified',
      'The separate 2.4 GHz wireless DMX path is not treated as Wi-Fi or as a verified direct LightingAI protocol in this checkpoint'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'IMRELAX Wi-Fi app control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party IMRELAX documentation explicitly confirms Wi-Fi app control via iOS and Android for exact SKU IM-BTWP1218. LightingAI proprietary network command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

export const IMRELAX_WIFI_FIXTURES=[
  {
    id:'imrelax-im-btwp1218',
    manufacturer:'IMRELAX',
    model:'IM-BTWP1218',
    family:'Battery Wireless LED Par',
    category:'Light',
    sourceType:'RGBWA+UV Battery Wireless LED PAR',
    formFactor:'PAR / Uplight',
    colorMode:'RGBWA+UV',
    control:wifiControl([SRC.imBtwp1218]),
    sourceUrl:SRC.imBtwp1218
  }
];
