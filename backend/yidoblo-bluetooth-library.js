// Yidoblo exact-model direct-Bluetooth lighting coverage.
// First-party Yidoblo / MEIDIKE product evidence only.
// Transport and operator capabilities are model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  ze150bi:'https://www.yidobloled.com/sale-44067604-yidoblo-new-design-150w-cob-pocket-fill-light-bi-color-lighting-led-studio-light-2700-7500k.html',
  zd300ii:'https://www.yidobloled.com/sale-49797900-yidoblo-300w-studio-video-light-stage-effect-lighting-with-remote-controller-photography-equipment.html',
  zc60c:'https://www.yidobloled.com/sale-43853152-wholesale-portable-led-video-light-zc-60rgb-full-colors-rgb-with-cct-2700-7500k-app-lighting-for-con.html',
  zr300bi:'https://www.yidobloled.com/sale-53851987-yidoblo-300w-soft-led-video-light-photo-studio-lamp-professional-studio-light-led-film-lighting-zr-3.html'
};

function capabilityVerification(sourceUrl,{color=false,fx=true}={}){
  const sources=[sourceUrl];
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls:sources,note:'Yidoblo documents brightness/dimming control for this exact model. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls:sources,note:'Yidoblo documents adjustable CCT for this exact model together with app control. This proves operator capability only.'},
    ...(color?{color:{verified:true,scope:'official-app-capability-only',sourceUrls:sources,note:'Yidoblo documents RGB/HSI color capability for this exact model together with app control. This proves operator capability only.'}}:{}),
    ...(fx?{fx:{verified:true,scope:'official-app-capability-only',sourceUrls:sources,note:'Yidoblo documents preset effect capability for this exact model. This proves operator capability only.'}}:{})
  };
}

function bluetoothControl(sourceUrl,model,capabilities){
  const sources=[sourceUrl];
  return {
    wired:[],
    wireless:['Bluetooth via Yidoblo mobile app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Yidoblo documents Bluetooth mobile-app control for '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Yidoblo Bluetooth mobile-app control',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party Yidoblo/MEIDIKE documentation explicitly confirms Wireless Bluetooth mobile-app or Bluetooth-app control for this exact model. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrl,capabilities)
  };
}

export const YIDOBLO_BLUETOOTH_FIXTURES=[
  {
    id:'yidoblo-ze-150bi',
    manufacturer:'Yidoblo',
    model:'ZE-150Bi',
    family:'ZE Series',
    category:'Light',
    sourceType:'Bi-Color COB LED Video Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'Bi-Color / Effects',
    powerDrawW:150,
    cctK:{min:2700,max:7500},
    control:bluetoothControl(SRC.ze150bi,'ZE-150Bi',{color:false,fx:true}),
    sourceUrl:SRC.ze150bi
  },
  {
    id:'yidoblo-zd-300ii',
    manufacturer:'Yidoblo',
    model:'ZD-300II',
    family:'ZD Series',
    category:'Light',
    sourceType:'RGB COB LED Video Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGB / HSI / CCT / Effects',
    powerDrawW:300,
    cctK:{min:2700,max:7500},
    control:bluetoothControl(SRC.zd300ii,'ZD-300II',{color:true,fx:true}),
    sourceUrl:SRC.zd300ii
  },
  {
    id:'yidoblo-zc-60c',
    manufacturer:'Yidoblo',
    model:'ZC-60C',
    family:'ZC Series',
    category:'Light',
    sourceType:'RGBWW COB LED Video Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGBWW / CCT / Effects',
    powerDrawW:60,
    cctK:{min:2700,max:7500},
    cri:95,
    control:bluetoothControl(SRC.zc60c,'ZC-60C',{color:true,fx:true}),
    sourceUrl:SRC.zc60c
  },
  {
    id:'yidoblo-zr-300bi',
    manufacturer:'Yidoblo',
    model:'ZR-300BI',
    family:'ZR Series',
    category:'Light',
    sourceType:'Bi-Color LED Studio Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'Bi-Color / Effects',
    powerDrawW:300,
    cctK:{min:2700,max:6500},
    control:bluetoothControl(SRC.zr300bi,'ZR-300BI',{color:false,fx:true}),
    sourceUrl:SRC.zr300bi
  }
];
