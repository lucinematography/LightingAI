// SUTEFOTO exact-model direct-Bluetooth lighting coverage.
// First-party SUTEFOTO product/manual evidence only.
// Transport and operator capabilities are model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  p100:'https://www.sutefoto.com/en/P100-RGB-Full-Color-Video-Light-PG9481126',
  p100Manual:'https://sutefoto.com/DownLoad/90452.html?a=download',
  t18:'https://sutefoto.com/en/T18APP-Led-Light-Panel-PG9524128',
  t18Manual:'https://sutefoto.com/DownLoad/109538.html?a=download'
};

function capabilityVerification(sourceUrls,{cct=false,color=false,fx=false}={}){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'SUTEFOTO documents app brightness/group dimming for this exact model. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    ...(cct?{cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'SUTEFOTO documents variable CCT for this exact model together with Bluetooth-app control. This proves operator capability only.'}}:{}),
    ...(color?{color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'SUTEFOTO documents HSI/RGBCW color control for this exact model together with Bluetooth-app control. This proves operator capability only.'}}:{}),
    ...(fx?{fx:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'SUTEFOTO documents FX control for this exact model. This proves operator capability only.'}}:{})
  };
}

function bluetoothControl(sourceUrls,model,capabilities){
  return {
    wired:[],
    wireless:['Bluetooth via SS LED Video Light app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'SUTEFOTO documents Mobile Bluetooth APP control for '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'SUTEFOTO SS LED Video Light Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party SUTEFOTO exact-model documentation explicitly confirms mobile Bluetooth app control. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,capabilities)
  };
}

export const SUTEFOTO_BLUETOOTH_FIXTURES=[
  {
    id:'sutefoto-p100-rgb',
    manufacturer:'SUTEFOTO',
    model:'P100 RGB',
    family:'P Series',
    category:'Light',
    sourceType:'RGB Full-Color COB LED Video Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGB / HSI / RGBCW / CCT / FX',
    powerDrawW:100,
    cctK:{min:2800,max:10000},
    cri:96,
    tlci:95,
    control:bluetoothControl([SRC.p100,SRC.p100Manual],'P100 RGB',{cct:true,color:true,fx:true}),
    sourceUrl:SRC.p100
  },
  {
    id:'sutefoto-t18-app',
    manufacturer:'SUTEFOTO',
    model:'T18 APP',
    family:'T18',
    category:'Light',
    sourceType:'Bi-Color LED Panel',
    formFactor:'Panel',
    colorMode:'Bi-Color / FX',
    powerDrawW:18,
    cctK:{min:2800,max:10000},
    cri:96,
    tlci:95,
    control:bluetoothControl([SRC.t18,SRC.t18Manual],'T18 APP',{cct:true,color:false,fx:true}),
    sourceUrl:SRC.t18
  }
];
