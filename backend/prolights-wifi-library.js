// PROLIGHTS exact-model direct-Wi-Fi lighting coverage.
// First-party PROLIGHTS product/control evidence only.
// Vendor pages document built-in Wi-Fi/SmartColors control; undocumented network/session semantics remain fail-closed.
const SRC={
  smartbatip:'https://www.prolights.it/en/product/SMARTBATIP',
  smarttube32:'https://www.prolights.it/en/product/SMARTTUBE32',
  smartbattenq:'https://www.prolights.it/en/product/SMARTBATTENQ',
  wifibox:'https://www.prolights.it/en/product/WIFIBOX'
};

function capabilityVerification(sourceUrls,opts={}){
  const out={
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'PROLIGHTS documents 0-100% electronic dimming together with Wi-Fi/SmartColors control for this exact model. This proves operator capability only, not LightingAI network command encoding.'},
    color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'PROLIGHTS documents RGB/RGBW colour control together with Wi-Fi/SmartColors operation for this exact model. This proves operator capability only.'}
  };
  if(opts.cct) out.cct={verified:true,scope:'official-app-capability-only',sourceUrls,note:'PROLIGHTS documents white presets/CCT-capable RGBW operation for this exact model together with Wi-Fi/SmartColors control. This proves operator capability only.'};
  return out;
}

function wifiControl(sourceUrls,model,opts={}){
  return {
    wired:['DMX512'],
    wireless:['Wi-Fi / SmartColors app','PROLIGHTS integrated WIBOX/WDBOX proprietary wireless path'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'PROLIGHTS documents built-in Wi-Fi and SmartColors control for '+model+', but LightingAI discovery, pairing/session flow, addressing and proprietary payload semantics are not production-verified',
      'Do not infer standard IP packet format, UDP/TCP ports, authentication, channel mapping or cross-model command compatibility from the vendor Wi-Fi wording alone'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'PROLIGHTS SmartColors / integrated Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party PROLIGHTS exact-model documentation explicitly states built-in Wi-Fi and SmartColors control. LightingAI proprietary network/session semantics remain locked pending physical capture/replay.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,opts)
  };
}

export const PROLIGHTS_WIFI_FIXTURES=[
  {
    id:'prolights-smartbatip',
    manufacturer:'PROLIGHTS',
    model:'SMARTBATIP',
    family:'SMARTBAT',
    category:'Light',
    sourceType:'RGBW Battery LED PAR',
    formFactor:'PAR / Uplight',
    colorMode:'RGBW / CCT presets',
    powerDrawW:43,
    cctK:{min:3200,max:10000},
    control:wifiControl([SRC.smartbatip,SRC.wifibox],'SMARTBATIP',{cct:true}),
    sourceUrl:SRC.smartbatip
  },
  {
    id:'prolights-smarttube32',
    manufacturer:'PROLIGHTS',
    model:'SMARTTUBE32',
    family:'SMARTTUBE',
    category:'Light',
    sourceType:'RGB Pixel LED Tube',
    formFactor:'Tube',
    colorMode:'RGB / Pixel',
    powerDrawW:32,
    pixelZones:32,
    control:wifiControl([SRC.smarttube32,SRC.wifibox],'SMARTTUBE32'),
    sourceUrl:SRC.smarttube32
  },
  {
    id:'prolights-smartbattenq',
    manufacturer:'PROLIGHTS',
    model:'SMARTBATTENQ',
    family:'SMARTBATTEN',
    category:'Light',
    sourceType:'RGBW Battery LED Bar',
    formFactor:'Linear Wash / Bar',
    colorMode:'RGBW / CCT presets',
    powerDrawW:32,
    cctK:{min:3200,max:10000},
    status:'Discontinued',
    control:wifiControl([SRC.smartbattenq,SRC.wifibox],'SMARTBATTENQ',{cct:true}),
    sourceUrl:SRC.smartbattenq
  }
];
