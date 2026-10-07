// SIRUI exact-model Bluetooth / SIRUI Light coverage.
// First-party SIRUI product/manual sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  e30b:'https://store.sirui.com/products/ultra-slim-led-video-panel-light-e30',
  e30bManual:'https://s2.sirui.com/upload/manual/2022/0620/5zPcrkXX4y.pdf',
  c60Manual:'https://s2.sirui.com/upload/manual/2022/0620/5SY5ERzGYn.pdf',
  t120:'https://store.sirui.com/products/t120-tube-light',
  t120Manual:'https://s2.sirui.com/upload/manual/2024/0325/rS8iij8WSZ.pdf',
  cs100:'https://store.sirui.com/products/sirui-100w-series-led-monolight',
  c300x2:'https://store.sirui.com/products/sirui-c300x-ii',
  b25r:'https://store.sirui.com/products/sirui-dragon-series-curvy-rgb-panel-light-b25r',
  c150x:'https://store.sirui.com/products/sirui-c150x-150w-handheld-pocket-light',
  c60x:'https://store.sirui.com/products/sirui-c60x',
  t60x:'https://store.sirui.com/products/sirui-t60x-telescopic-60w-rgb-pixel-tube-light-ll',
  c300Colorful:'https://s2.sirui.com/upload/manual/2024/0223/x4dxexzKcZ.pdf'
};

function bluetoothControl(sourceUrls,family='SIRUI Light Bluetooth'){
  return {
    wired:[],
    wireless:['Bluetooth via SIRUI Light App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'SIRUI documents Bluetooth/app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family,
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party SIRUI documentation confirms Bluetooth app control. LightingAI command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrls,extra={}){
  return {
    id,
    manufacturer:'SIRUI',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    ...extra,
    control:bluetoothControl(sourceUrls),
    sourceUrl:sourceUrls[0]
  };
}

export const SIRUI_BLUETOOTH_FIXTURES=[
  fixture('sirui-e30b','E30B','E Series','Bi-Color LED Panel','Panel',[SRC.e30b,SRC.e30bManual],{cctK:{min:2800,max:7000},colorMode:'Bi-Color',powerDrawW:30}),
  fixture('sirui-c60','C60','C Series','Daylight COB LED Light','Spotlight / Monolight',[SRC.c60Manual],{cctK:{min:5600,max:5600},colorMode:'Daylight',powerDrawW:60}),
  fixture('sirui-t120','T120','T Series','RGB Tube Light','Tube',[SRC.t120,SRC.t120Manual],{cctK:{min:2500,max:8000},colorMode:'RGB Full Color'}),
  fixture('sirui-cs100','CS100','CS Series','Daylight LED Monolight','Spotlight / Monolight',[SRC.cs100],{colorMode:'Daylight',powerDrawW:100}),
  fixture('sirui-cs100b','CS100B','CS Series','Bi-Color LED Monolight','Spotlight / Monolight',[SRC.cs100],{colorMode:'Bi-Color',powerDrawW:100}),
  fixture('sirui-c300x-ii','C300X II','C Series','Bi-Color COB LED Light','Spotlight / Monolight',[SRC.c300x2],{cctK:{min:2700,max:6500},colorMode:'Bi-Color',powerDrawW:300}),
  fixture('sirui-b25r','B25R','Dragon Series','RGB Bendable LED Panel','Panel',[SRC.b25r],{cctK:{min:2700,max:8500},colorMode:'RGB Full Color'}),
  fixture('sirui-c150x','C150X','C Series','Bi-Color COB LED Light','Spotlight / Monolight',[SRC.c150x],{cctK:{min:2800,max:6500},colorMode:'Bi-Color',powerDrawW:150}),
  fixture('sirui-c60x','C60X','C Series','Bi-Color COB LED Light','Spotlight / Monolight',[SRC.c60x],{cctK:{min:2500,max:6500},colorMode:'Bi-Color',powerDrawW:60}),
  fixture('sirui-t60x','T60X','T Series','RGB Pixel Tube Light','Tube',[SRC.t60x],{cctK:{min:2500,max:10000},colorMode:'RGB Full Color',powerDrawW:20}),
  {
    id:'sirui-c300-colorful',manufacturer:'SIRUI',model:'C300 Colorful',family:'C Series',category:'Light',
    sourceType:'6-Color Full-Spectrum Point Source Light',formFactor:'Spotlight / Monolight',
    cctK:{min:2000,max:20000},colorMode:'RGB Full Color',powerDrawW:300,cri:98,tlci:99,
    control:{
      ...bluetoothControl([SRC.c300Colorful]),
      wired:['DMX512'],
      wireless:['Bluetooth via SIRUI Light App','Wireless DMX'],
      externalInterfaceRequired:['Compatible wireless DMX transmitter for the documented Wireless DMX path']
    },
    dmxProfileVerification:{
      status:'HOLD',
      reason:'SIRUI documents DMX control for C300 Colorful, but LightingAI has not encoded and independently verified a manufacturer-published per-channel profile for production control.',
      sourceUrls:[SRC.c300Colorful]
    },
    sourceUrl:SRC.c300Colorful
  }
];
