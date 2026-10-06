// NEEWER exact-model Bluetooth lighting coverage.
// First-party NEEWER product/FAQ/Control Center compatibility sources only.
// Bluetooth evidence is transport-capability-only; proprietary command semantics remain fail-closed.
const FAQ='https://neewer.com/pages/faq';
const BT_PC='https://eu.neewer.com/collections/all-products/products/neewer-nt-bt-bluetooth-usb-transmitter-for-pc-mac-66605690';
const SRC={
  rgb660:'https://neewer.com/products/neewer-cri-97-50w-660-prorgb-led-light-66600136',
  rgb1200:'https://neewer.com/collections/all-led-lights/products/neewer-rgb1200-app-control-rgb-light-66601606',
  cb60b:'https://neewer.com/products/neewer-cb60b-bi-color-70w-led-video-light-66602613',
  cb60rgb:'https://neewer.com/products/neewer-led-video-light-66601007',
  gl25c:'https://neewer.com/collections/three-best-selling-collections/products/neewer-gl25c-led-rgb-streaming-key-light-66606309',
  hs60b:'https://neewer.com/collections/three-best-selling-collections/products/neewer-hs60b-60w-bi-color-mini-cob-led-video-light-66605117',
  sl90:'https://eu.neewer.com/collections/all-lights/products/neewer-sl90-12w-on-camera-rgb-panel-video-light-66600927',
  rgb1200:'https://neewer.com/collections/all-product/products/neewer-rgb1200-app-control-rgb-light-66601606',
  cb200b:'https://neewer.com/collections/continuous-lights/products/neewer-cb200b-200w-led-video-light-support-2-4g-app-remote-control-66602646',
  tl40:'https://uk.neewer.com/products/neewer-tl40-led-streaming-light-bar-light-66605046',
  tl60:'https://neewer.com/products/neewer-tl60-rgb-tube-rgbww-light-stick-66602907',
  gr18c:'https://neewer.com/products/neewer-gr18c-18-led-round-panel-video-light-66604592',
  as600b:'https://neewer.com/products/neewer-as600b-600w-cob-led-continuous-output-video-light-66605306',
  rl45b:'https://uk.neewer.com/products/neewer-rl45b-45w-18-slim-edge-lit-ring-light-kit-66603973',
  rp19h:'https://eu.neewer.com/products/neewer-rp18h-ring-light-66600898',
  vl67b:'https://neewer.com/products/neewer-vl67b-bi-color-led-fill-light-with-app-control-66606228',
  vl67c:'https://eu.neewer.com/products/neewer-vl67c-phone-selfie-light-with-app-control-clips-cold-shoe-mount-66604308',
  rp18bPro:'https://neewer.com/products/neewer-rp18b-pro-ring-light-kit-66603484',
  rgb480:'https://neewer.com/collections/rgb-panel-lights/products/neewer-led-light-66600787'
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
  const wireless=['Bluetooth via NEEWER App'];
  if(options.wifi) wireless.push('Wi-Fi via NEEWER Control Center');
  const wirelessVerification={
    bluetooth:{
      verified:true,
      family:'NEEWER App Bluetooth',
      scope:'transport-capability-only',
      sourceUrls:[sourceUrl,FAQ,BT_PC],
      note:'NEEWER first-party sources identify this exact model as Bluetooth/app compatible. This verifies transport capability only; LightingAI command semantics remain locked.'
    }
  };
  if(options.wifi) wirelessVerification.wifi={
    verified:true,
    family:'NEEWER Control Center Wi-Fi',
    scope:'transport-capability-only',
    sourceUrls:[sourceUrl],
    note:'NEEWER first-party documentation identifies Wi-Fi computer control for this exact model. This verifies transport capability only; proprietary session semantics remain locked.'
  };
  return {
    wired:[],
    wireless,
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'NEEWER documents Bluetooth app transport for this exact model, but LightingAI proprietary command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,FAQ,BT_PC],
    wirelessVerification,
    capabilityVerification:options.capabilities===false?{}:capabilityVerification(sourceUrl,options)
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
  },
  {
    id:'neewer-gl25c',manufacturer:'NEEWER',model:'GL25C',family:'Streaming Key Light',category:'Light',
    sourceType:'RGB Streaming Key Light',formFactor:'Linear Key Light',
    cctK:{min:2900,max:7000},colorMode:'RGB Full Color',powerDrawW:25,cri:95,tlci:97,
    control:control(SRC.gl25c,{fullColor:true,wifi:true}),sourceUrl:SRC.gl25c
  },
  {
    id:'neewer-hs60b',manufacturer:'NEEWER',model:'HS60B',family:'HS Mini COB',category:'Light',
    sourceType:'Bi-Color COB LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',powerDrawW:60,cri:97,tlci:97,
    control:control(SRC.hs60b),sourceUrl:SRC.hs60b
  },
  {
    id:'neewer-sl90',manufacturer:'NEEWER',model:'SL90',family:'SL RGB Panel',category:'Light',
    sourceType:'RGB LED Panel',formFactor:'Panel',
    cctK:{min:2500,max:10000},colorMode:'RGB Full Color',powerDrawW:12,cri:97,tlci:97,
    control:control(SRC.sl90,{fullColor:true}),sourceUrl:SRC.sl90
  },
  {
    id:'neewer-rgb1200',manufacturer:'NEEWER',model:'RGB1200',family:'RGB Panel',category:'Light',
    sourceType:'RGB LED Panel',formFactor:'Panel',
    cctK:{min:2500,max:8500},colorMode:'RGB Full Color',powerDrawW:60,cri:97,tlci:98,
    control:control(SRC.rgb1200,{fullColor:true}),sourceUrl:SRC.rgb1200
  },
  {
    id:'neewer-cb200b',manufacturer:'NEEWER',model:'CB200B',family:'CB COB',category:'Light',
    sourceType:'Bi-Color COB LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',powerDrawW:210,cri:97,tlci:97,
    control:control(SRC.cb200b),sourceUrl:SRC.cb200b
  },
  {
    id:'neewer-tl40',manufacturer:'NEEWER',model:'TL40',family:'TL Streaming',category:'Light',
    sourceType:'Bi-Color LED Streaming Light Bar',formFactor:'Linear Key Light',
    cctK:{min:2900,max:7000},colorMode:'Bi-Color',powerDrawW:8,cri:95,tlci:97,
    control:control(SRC.tl40),sourceUrl:SRC.tl40
  },
  {
    id:'neewer-tl60',manufacturer:'NEEWER',model:'TL60 RGB',family:'TL RGB Tube',category:'Light',
    sourceType:'RGBWW Pixel Tube',formFactor:'Tube',
    cctK:{min:2500,max:10000},colorMode:'RGB Full Color',powerDrawW:20,cri:97,tlci:98,
    control:control(SRC.tl60,{fullColor:true}),sourceUrl:SRC.tl60
  },
  {
    id:'neewer-gr18c',manufacturer:'NEEWER',model:'GR18C',family:'GR Round Panel',category:'Light',
    sourceType:'RGB LED Round Panel',formFactor:'Panel',
    cctK:{min:2500,max:8500},colorMode:'RGB Full Color',powerDrawW:65,cri:97,tlci:97,
    control:control(SRC.gr18c,{fullColor:true}),sourceUrl:SRC.gr18c
  },
  {
    id:'neewer-as600b',manufacturer:'NEEWER',model:'AS600B',family:'AS COB',category:'Light',
    sourceType:'Bi-Color COB LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',powerDrawW:600,cri:96,tlci:98,
    control:control(SRC.as600b),sourceUrl:SRC.as600b
  },
  {
    id:'neewer-rl45b',manufacturer:'NEEWER',model:'RL45B',family:'RL Ring Light',category:'Light',
    sourceType:'Bi-Color LED Ring Light',formFactor:'Ring Light',
    cctK:{min:2900,max:7000},colorMode:'Bi-Color',powerDrawW:45,cri:97,
    control:control(SRC.rl45b),sourceUrl:SRC.rl45b
  },
  {
    id:'neewer-rp19h',manufacturer:'NEEWER',model:'RP19H',family:'RP Ring Light',category:'Light',
    sourceType:'Bi-Color LED Ring Light',formFactor:'Ring Light',
    cctK:{min:3200,max:5600},colorMode:'Bi-Color',cri:97,tlci:98,
    control:control(BT_PC,{capabilities:false}),sourceUrl:SRC.rp19h
  },
  {
    id:'neewer-vl67b',manufacturer:'NEEWER',model:'VL67B',family:'VL Phone Light',category:'Light',
    sourceType:'Bi-Color Phone Selfie Light',formFactor:'Pocket / Handheld',
    colorMode:'Bi-Color',control:control(SRC.vl67b,{cct:false}),sourceUrl:SRC.vl67b
  },
  {
    id:'neewer-vl67c',manufacturer:'NEEWER',model:'VL67C',family:'VL Phone Light',category:'Light',
    sourceType:'RGB Phone Selfie Light',formFactor:'Pocket / Handheld',
    colorMode:'RGB Full Color',control:control(SRC.vl67c,{fullColor:true,cct:false}),sourceUrl:SRC.vl67c
  },
  {
    id:'neewer-rp18b-pro',manufacturer:'NEEWER',model:'RP18B Pro',family:'RP Ring Light',category:'Light',
    sourceType:'Bi-Color LED Ring Light',formFactor:'Ring Light',
    cctK:{min:2900,max:7000},colorMode:'Bi-Color',cri:97,tlci:98,
    control:control(SRC.rp18bPro),sourceUrl:SRC.rp18bPro
  },
  {
    id:'neewer-rgb480',manufacturer:'NEEWER',model:'RGB480',family:'RGB Panel',category:'Light',
    sourceType:'RGB LED Panel',formFactor:'Panel',
    cctK:{min:3200,max:5600},colorMode:'RGB Full Color',powerDrawW:28,cri:95,
    control:control(SRC.rgb480,{fullColor:true}),sourceUrl:SRC.rgb480
  }
];
