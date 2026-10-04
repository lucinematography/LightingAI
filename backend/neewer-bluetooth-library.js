// NEEWER exact-model Bluetooth lighting coverage.
// First-party NEEWER product/FAQ/Control Center compatibility sources only.
// Bluetooth evidence is transport-capability-only; proprietary command semantics remain fail-closed.
const FAQ='https://neewer.com/pages/faq';
const BT_PC='https://eu.neewer.com/collections/all-products/products/neewer-nt-bt-bluetooth-usb-transmitter-for-pc-mac-66605690';
const SRC={
  rgb660:'https://neewer.com/products/neewer-cri-97-50w-660-prorgb-led-light-66600136',
  rgb1200:'https://neewer.com/collections/all-led-lights/products/neewer-rgb1200-app-control-rgb-light-66601606',
  cb60b:'https://neewer.com/products/neewer-cb60b-bi-color-70w-led-video-light-66602613',
  cb60rgb:'https://neewer.com/products/neewer-led-video-light-66601007'
};

function capabilityVerification(sourceUrl,{fullColor=false,cct=true}={}){
  return {
    dim:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl],
      note:'NEEWER documents app brightness control for this exact model. This proves operator capability only.'
    },
    ...(cct?{cct:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl],
      note:'NEEWER documents app color-temperature control for this exact model. This proves operator capability only.'
    }}:{}),
    ...(fullColor?{color:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl],
      note:'NEEWER documents app HSI/RGB color control for this exact model. This proves operator capability only.'
    }}:{}),
    fx:{
      verified:true,scope:'official-app-capability-only',sourceUrls:[sourceUrl],
      note:'NEEWER documents app scene/effect control for this exact model. This proves operator capability only.'
    }
  };
}

function control(sourceUrl,options={}){
  return {
    wired:[],
    wireless:['Bluetooth via NEEWER App'],
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'NEEWER documents Bluetooth app transport for this exact model, but LightingAI proprietary command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,FAQ,BT_PC],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'NEEWER App Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,FAQ,BT_PC],
        note:'NEEWER first-party sources identify this exact model as Bluetooth/app compatible. This verifies transport capability only; LightingAI command semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrl,options)
  };
}

export const NEEWER_BLUETOOTH_FIXTURES=[
  {
    id:'neewer-rgb660-pro-ii',manufacturer:'NEEWER',model:'RGB660 PRO II',family:'RGB Panel',category:'Light',
    sourceType:'RGB LED Panel',formFactor:'Panel',
    cctK:{min:3200,max:5600},colorMode:'RGB Full Color',powerDrawW:50,cri:97,
    control:control(SRC.rgb660,{fullColor:true}),sourceUrl:SRC.rgb660
  },
  {
    id:'neewer-rgb1200',manufacturer:'NEEWER',model:'RGB1200',family:'RGB Panel',category:'Light',
    sourceType:'RGB LED Panel',formFactor:'Panel',
    cctK:{min:2500,max:8500},colorMode:'RGB Full Color',powerDrawW:60,cri:97,tlci:98,
    control:control(SRC.rgb1200,{fullColor:true}),sourceUrl:SRC.rgb1200
  },
  {
    id:'neewer-cb60b',manufacturer:'NEEWER',model:'CB60B',family:'CB COB',category:'Light',
    sourceType:'Bi-Color COB LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',powerDrawW:70,cri:97,tlci:98,
    control:control(SRC.cb60b,{fullColor:false}),sourceUrl:SRC.cb60b
  },
  {
    id:'neewer-cb60-rgb',manufacturer:'NEEWER',model:'CB60 RGB',family:'CB COB',category:'Light',
    sourceType:'RGB COB LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6500},colorMode:'RGB Full Color',powerDrawW:70,cri:97,tlci:98,
    control:control(SRC.cb60rgb,{fullColor:true}),sourceUrl:SRC.cb60rgb
  }
];
