// Twinkly exact-model Wi-Fi practical/linear-light coverage.
// First-party Twinkly product/help evidence only.
// Bluetooth is setup-only; Wi-Fi is the production/app-control transport.
const SRC={
  line:'https://twinkly.com/en-eu/products/line',
  flex:'https://twinkly.com/products/flex',
  wifiHelp:'https://help.twinkly.com/hc/en-gb/articles/18277787964573-how-do-i-connect-my-twinkly-to-my-wi-fi-network',
  setupHelp:'https://help.twinkly.com/hc/article_attachments/19461074718877'
};

function wifiControl(sourceUrls,model){
  return {
    wired:[],
    wireless:['Wi-Fi via Twinkly App'],
    builtInWifi:true,
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Twinkly documents Wi-Fi app control for '+model+' and states Bluetooth is used only for setup; Bluetooth must not be promoted to production lighting-control transport',
      'LightingAI exact local discovery, authentication/session state and private payload semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'Twinkly direct Wi-Fi app control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Twinkly exact-model documentation confirms Wi-Fi app control; Twinkly support explicitly states Bluetooth is setup-only. LightingAI proprietary network/session semantics remain locked.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Twinkly documents app dimming for this exact model.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Twinkly documents RGB color control with 16M+ colors for this exact model.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Twinkly documents personalized/dynamic effects and grouped effects for this exact model.'}
    }
  };
}

export const TWINKLY_WIFI_FIXTURES=[
  {
    id:'twinkly-line',
    manufacturer:'Twinkly',
    model:'Line',
    family:'Line',
    category:'Light',
    sourceType:'RGB LED Lightstrip',
    formFactor:'Linear Wash / Bar',
    colorMode:'RGB',
    control:wifiControl([SRC.line,SRC.wifiHelp,SRC.setupHelp],'Line'),
    sourceUrl:SRC.line
  },
  {
    id:'twinkly-flex',
    manufacturer:'Twinkly',
    model:'Flex',
    family:'Flex',
    category:'Light',
    sourceType:'RGB Flexible LED Tube',
    formFactor:'Tube',
    colorMode:'RGB',
    powerDrawW:15,
    control:wifiControl([SRC.flex,SRC.wifiHelp,SRC.setupHelp],'Flex'),
    sourceUrl:SRC.flex
  }
];
