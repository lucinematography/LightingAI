// Yeelight exact-model Wi-Fi lightstrip coverage.
// First-party Yeelight evidence only.
// Public LAN protocol exists, but LightingAI production writes remain locked until exact-model physical replay.
const SRC={
  oneS:'https://en.yeelight.com/product/led-light-strip-1s/',
  pro:'https://en.yeelight.com/product/led-light-strip-pro/',
  brochure:'https://en.yeelight.com/wp-content/uploads/sites/4/2023/08/Yeelight-home.pdf',
  developer:'https://www.yeelight.com/en_US/developer'
};

function wifiControl(sourceUrls,model){
  return {
    wired:[],
    wireless:['Wi-Fi via Yeelight App'],
    builtInWifi:true,
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Yeelight publishes a first-party LAN control protocol for Wi-Fi lighting products, but LightingAI exact-model physical replay for '+model+' is not complete',
      'Do not promote public LAN semantics to a production driver until discovery, commands, limits and recovery are replay-verified on this exact model'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'Yeelight 2.4 GHz Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Yeelight evidence verifies Wi-Fi/app control for this exact model. Yeelight also publishes a LAN protocol; exact-model LightingAI production replay remains pending.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'First-party Yeelight evidence confirms app dimming for this exact model.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'First-party Yeelight evidence confirms multicolor control for this exact model.'}
    }
  };
}

export const YEELIGHT_WIFI_FIXTURES=[
  {
    id:'yeelight-led-lightstrip-1s-yldd05yl',
    manufacturer:'Yeelight',
    model:'LED Lightstrip 1S (YLDD05YL)',
    family:'LED Lightstrip 1S',
    category:'Light',
    sourceType:'RGB LED Lightstrip',
    formFactor:'Linear Wash / Bar',
    colorMode:'RGB',
    control:wifiControl([SRC.oneS,SRC.brochure,SRC.developer],'LED Lightstrip 1S (YLDD05YL)'),
    sourceUrl:SRC.oneS
  },
  {
    id:'yeelight-led-lightstrip-pro-yldd005',
    manufacturer:'Yeelight',
    model:'LED Lightstrip Pro (YLDD005)',
    family:'LED Lightstrip Pro',
    category:'Light',
    sourceType:'Addressable RGB LED Lightstrip',
    formFactor:'Linear Wash / Bar',
    colorMode:'RGB',
    control:wifiControl([SRC.pro,SRC.developer],'LED Lightstrip Pro (YLDD005)'),
    sourceUrl:SRC.pro
  }
];
