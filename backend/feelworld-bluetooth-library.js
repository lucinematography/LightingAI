// FEELWORLD exact-model direct-Bluetooth lighting coverage.
// First-party FEELWORLD product/manual evidence only.
// Transport and operator capabilities are model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  fl125b:'https://www.feelworld.cn/feelworld-fl125b-125w-bi-color-point-source-video-light-bluetooth-app-control/',
  fl125d:'https://www.feelworld.cn/feelworld-fl125d-125w-daylight-point-source-video-light-bluetooth-app-control/',
  fl225b:'https://www.feelworld.cn/feelworld-fl225b-225w-bi-color-point-source-video-light-bluetooth-app-control/',
  fl225d:'https://www.feelworld.cn/feelworld-fl225d-225w-daylight-point-source-video-light-bluetooth-app-control/',
  mt2:'https://www.feelworld.cn/feelworld-mt2-rgbww-mini-pixel-tube-light-handheld-built-in-3000mah-battery-bluetooth-app-control/',
  mt2Manual:'https://www.feelworld.cn/UpLoadFiles/EN_Product_YSD/2024/9/MT2-user-manual.pdf'
};

function capabilityVerification(sourceUrls,{cct=false,color=false,fx=true}={}){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'FEELWORLD documents app brightness/dimming control for this exact model. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    ...(cct?{cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'FEELWORLD documents app CCT control for this exact variable-CCT model. This proves operator capability only.'}}:{}),
    ...(color?{color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'FEELWORLD documents HSI/color control for this exact model. This proves operator capability only.'}}:{}),
    ...(fx?{fx:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'FEELWORLD documents app-selectable lighting effects for this exact model. This proves operator capability only.'}}:{})
  };
}

function bluetoothControl(sourceUrls,model,capabilities){
  return {
    wired:[],
    wireless:['Bluetooth via FEELWORLD Light app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'FEELWORLD documents Bluetooth app control for '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'FEELWORLD Light Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party FEELWORLD documentation explicitly confirms Bluetooth app control for this exact model. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,capabilities)
  };
}

export const FEELWORLD_BLUETOOTH_FIXTURES=[
  {
    id:'feelworld-fl125b',
    manufacturer:'FEELWORLD',
    model:'FL125B',
    family:'FL Point Source',
    category:'Light',
    sourceType:'Bi-Color COB LED Video Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'Bi-Color / Effects',
    powerDrawW:125,
    cctK:{min:2700,max:6500},
    cri:96,
    tlci:98,
    control:bluetoothControl([SRC.fl125b],'FL125B',{cct:true,color:false,fx:true}),
    sourceUrl:SRC.fl125b
  },
  {
    id:'feelworld-fl125d',
    manufacturer:'FEELWORLD',
    model:'FL125D',
    family:'FL Point Source',
    category:'Light',
    sourceType:'Daylight COB LED Video Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'Daylight / Effects',
    powerDrawW:125,
    cctK:{min:5600,max:5600},
    cri:96,
    tlci:98,
    control:bluetoothControl([SRC.fl125d],'FL125D',{cct:false,color:false,fx:true}),
    sourceUrl:SRC.fl125d
  },
  {
    id:'feelworld-fl225b',
    manufacturer:'FEELWORLD',
    model:'FL225B',
    family:'FL Point Source',
    category:'Light',
    sourceType:'Bi-Color COB LED Video Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'Bi-Color / Effects',
    powerDrawW:225,
    cctK:{min:2700,max:6500},
    control:bluetoothControl([SRC.fl225b],'FL225B',{cct:true,color:false,fx:true}),
    sourceUrl:SRC.fl225b
  },
  {
    id:'feelworld-fl225d',
    manufacturer:'FEELWORLD',
    model:'FL225D',
    family:'FL Point Source',
    category:'Light',
    sourceType:'Daylight COB LED Video Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'Daylight / Effects',
    powerDrawW:225,
    cctK:{min:5600,max:5600},
    cri:96,
    tlci:98,
    control:bluetoothControl([SRC.fl225d],'FL225D',{cct:false,color:false,fx:true}),
    sourceUrl:SRC.fl225d
  },
  {
    id:'feelworld-mt2',
    manufacturer:'FEELWORLD',
    model:'MT2',
    family:'MT Pixel Tube',
    category:'Light',
    sourceType:'RGBWW Mini Pixel Tube Light',
    formFactor:'Tube',
    colorMode:'RGBWW / CCT / HSI / FX / BGM',
    powerDrawW:8,
    cctK:{min:2600,max:6000},
    cri:96,
    tlci:97,
    pixelZones:24,
    control:bluetoothControl([SRC.mt2,SRC.mt2Manual],'MT2',{cct:true,color:true,fx:true}),
    sourceUrl:SRC.mt2
  }
];
