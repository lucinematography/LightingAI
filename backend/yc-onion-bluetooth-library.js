// YC Onion exact-model direct-Bluetooth lighting coverage.
// First-party YC Onion support/manual evidence only.
// Transport and operator capabilities are model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  puddingV2:'https://app.yconion.com/userManual/fillInSeries/PUDDINGV2.pdf',
  appSupport:'https://app.yconion.com/',
  faq:'https://www.yconion.com/pages/product-faqs'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'YC Onion documents 0-100% brightness control for PUDDING V2. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'YC Onion documents PUDDING V2 CCT control from 3200K to 6200K. This proves operator capability only.'},
    color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'YC Onion documents RGB/HSI-style full-color control for PUDDING V2. This proves operator capability only.'},
    fx:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'YC Onion documents multiple CCT/RGB special-effect modes for PUDDING V2. This proves operator capability only.'}
  };
}

function bluetoothControl(sourceUrls){
  return {
    wired:[],
    wireless:['Bluetooth via YC Onion app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'YC Onion documents app control for PUDDING V2 with phone Bluetooth enabled, but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'YC Onion app Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party YC Onion PUDDING V2 documentation requires Bluetooth for app control. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

export const YC_ONION_BLUETOOTH_FIXTURES=[
  {
    id:'yc-onion-pudding-v2',
    manufacturer:'YC Onion',
    model:'PUDDING V2',
    family:'PUDDING',
    category:'Light',
    sourceType:'RGB LED Fill Light',
    formFactor:'Pocket / On-Camera Light',
    colorMode:'RGB / CCT / FX',
    cctK:{min:3200,max:6200},
    control:bluetoothControl([SRC.puddingV2,SRC.appSupport,SRC.faq]),
    sourceUrl:SRC.puddingV2
  }
];
