// ColorKey exact-model Wi-Fi fixture coverage.
// First-party ColorKey product and app evidence only.
// Wi-Fi app transport is exact-model scoped; W-DMX and proprietary app/session semantics remain separate and fail-closed.
const SRC={
  pro6:'https://www.colorkeyled.com/product/mobilepar-pro-hex-6/',
  mini4:'https://www.colorkeyled.com/product/mobilepar-mini-hex-4-mkii/',
  hex5:'https://www.colorkeyled.com/product/mobilepar-hex-5/',
  app:'https://play.google.com/store/apps/details?id=com.colorkeyled.color_key'
};

function wifiControl(sourceUrls,model){
  return {
    wired:['DMX512'],
    wireless:['Wi-Fi via ColorKey App','2.4 GHz W-DMX'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'ColorKey documents direct mobile-app Wi-Fi control for '+model+', but LightingAI private app discovery, pairing/session and payload semantics are not production-verified',
      'The built-in 2.4 GHz W-DMX transceiver is a separate wireless-DMX path and must not be interpreted as Wi-Fi app transport'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'ColorKey App direct Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party ColorKey app and exact-model product documentation confirm direct app pairing to these fixtures over Wi-Fi. LightingAI proprietary app/session semantics remain locked.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'ColorKey documents 0-100% dimming for this exact model.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'ColorKey documents RGBWA-UV color control for this exact model.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'ColorKey documents strobe, fades and other built-in programs for this exact model.'}
    }
  };
}

function fixture(id,model,sourceUrl,powerDrawW){
  return {
    id,
    manufacturer:'ColorKey',
    model,
    family:'MobilePar',
    category:'Light',
    sourceType:'RGBWA-UV LED Uplight',
    formFactor:'PAR / Point Light',
    colorMode:'RGBWA+UV',
    powerDrawW,
    control:wifiControl([sourceUrl,SRC.app],model),
    sourceUrl
  };
}

export const COLORKEY_WIFI_FIXTURES=[
  fixture('colorkey-mobilepar-pro-hex-6','MobilePar Pro HEX 6',SRC.pro6,72),
  fixture('colorkey-mobilepar-mini-hex-4-mkii','MobilePar Mini HEX 4 MKII',SRC.mini4,48),
  fixture('colorkey-mobilepar-hex-5','MobilePar HEX 5',SRC.hex5,20.5)
];
