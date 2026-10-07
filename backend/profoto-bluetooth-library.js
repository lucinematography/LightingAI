// Profoto exact-model direct-Bluetooth continuous-light coverage.
// First-party Profoto support/product evidence only.
// Transport and operator capabilities are model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  b10Support:'https://support.profoto.com/support/solutions/articles/79000071121-does-the-b10-b10-plus-have-bluetooth-and-is-the-b10-b10-plus-compatible-with-the-profoto-app-',
  b10Guide:'https://profoto.com/globalassets/support/user-guides/b10-and-b10-plus/profoto-b10--b10-plus-user-guide-english.pdf',
  b10xProduct:'https://www.profoto.com/int/en/shop/products/lights/monolights/battery-powered/profoto-b10x-and-b10x-plus/',
  b10xGuide:'https://profoto.com/globalassets/support/user-guides/b10x-and-b10x-plus/profoto-b10x--b10x-plus-user-guide-english.pdf',
  continuousControl:'https://support.profoto.com/support/solutions/articles/79000117433-how-do-i-activate-and-adjust-the-continuous-light-on-my-profoto-device-',
  b20b30:'https://www.profoto.com/cy/en/still-photography/experience/profoto-b20-b30',
  l1600d:'https://www.profoto.com/us/en/cinema/experience/profoto-l1600d/',
  l600d:'https://profoto.com/int/en/shop/products/lights/monoled/profoto-l600d-int/',
  l600c:'https://www.profoto.com/int/en/shop/products/lights/monoled/profoto-l600c/'
};

function capabilityVerification(sourceUrls,{cct=true,color=false}={}){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Profoto documents app brightness control of the continuous light for this exact model scope. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    ...(cct?{cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Profoto documents app-adjustable continuous-light color temperature for this exact model scope. This proves operator capability only.'}}:{}),
    ...(color?{color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Profoto documents app control of full-color light modes for this exact model. This proves operator capability only.'}}:{})
  };
}

function bluetoothControl(sourceUrls,model,options={}){
  return {
    wired:options.wired||[],
    wireless:['Bluetooth via Profoto app',...(options.wirelessExtra||[])],
    builtInBluetooth:true,
    builtInCRMX:!!options.builtInCRMX,
    directLightingAI:[],
    externalInterfaceRequired:options.external||[],
    unavailableDirectProtocols:[
      'Profoto documents direct Bluetooth app control for '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified',
      'Profoto Air/AirX radio functionality is not classified as Wi-Fi in this Bluetooth/Wi-Fi catalog checkpoint'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Profoto app Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Profoto documentation explicitly confirms Bluetooth connectivity with Profoto Camera/Control for this exact B-series model scope. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,{cct:options.cct!==false,color:!!options.color})
  };
}

export const PROFOTO_BLUETOOTH_FIXTURES=[
  {
    id:'profoto-b10',
    manufacturer:'Profoto',
    model:'B10',
    family:'B Series',
    category:'Light',
    sourceType:'Battery Monolight with Tunable Continuous LED',
    formFactor:'Monolight',
    colorMode:'Bi-Color',
    cctK:{min:3000,max:6500},
    cri:90,
    control:bluetoothControl([SRC.b10Support,SRC.b10Guide,SRC.continuousControl],'B10'),
    sourceUrl:SRC.b10Guide
  },
  {
    id:'profoto-b10-plus',
    manufacturer:'Profoto',
    model:'B10 Plus',
    family:'B Series',
    category:'Light',
    sourceType:'Battery Monolight with Tunable Continuous LED',
    formFactor:'Monolight',
    colorMode:'Bi-Color',
    cctK:{min:3000,max:6500},
    cri:90,
    control:bluetoothControl([SRC.b10Support,SRC.b10Guide,SRC.continuousControl],'B10 Plus'),
    sourceUrl:SRC.b10Guide
  },
  {
    id:'profoto-b10x',
    manufacturer:'Profoto',
    model:'B10X',
    family:'B Series',
    category:'Light',
    sourceType:'Battery Monolight with Tunable Continuous LED',
    formFactor:'Monolight',
    colorMode:'Bi-Color',
    cctK:{min:3000,max:6500},
    cri:90,
    control:bluetoothControl([SRC.b10xProduct,SRC.b10xGuide,SRC.continuousControl],'B10X'),
    sourceUrl:SRC.b10xProduct
  },
  {
    id:'profoto-b10x-plus',
    manufacturer:'Profoto',
    model:'B10X Plus',
    family:'B Series',
    category:'Light',
    sourceType:'Battery Monolight with Tunable Continuous LED',
    formFactor:'Monolight',
    colorMode:'Bi-Color',
    cctK:{min:3000,max:6500},
    cri:90,
    control:bluetoothControl([SRC.b10xProduct,SRC.b10xGuide,SRC.continuousControl],'B10X Plus'),
    sourceUrl:SRC.b10xProduct
  },
  {
    id:'profoto-b20',manufacturer:'Profoto',model:'B20',family:'B Series',category:'Light',
    sourceType:'Battery Monolight with 40W Bi-Color Continuous LED',formFactor:'Monolight',
    colorMode:'Bi-Color',cctK:{min:2800,max:7000},cri:94,powerDrawW:40,
    control:bluetoothControl([SRC.b20b30,SRC.continuousControl],'B20'),sourceUrl:SRC.b20b30
  },
  {
    id:'profoto-b30',manufacturer:'Profoto',model:'B30',family:'B Series',category:'Light',
    sourceType:'Battery Monolight with 40W Bi-Color Continuous LED',formFactor:'Monolight',
    colorMode:'Bi-Color',cctK:{min:2800,max:7000},cri:94,powerDrawW:40,
    control:bluetoothControl([SRC.b20b30,SRC.continuousControl],'B30'),sourceUrl:SRC.b20b30
  },
  {
    id:'profoto-l1600d',manufacturer:'Profoto',model:'L1600D',family:'L Series',category:'Light',
    sourceType:'Daylight LED MonoLED',formFactor:'Spotlight / Monolight',
    colorMode:'Daylight',cctK:{min:5600,max:5600},cri:95,tlci:97,powerDrawW:1600,
    control:bluetoothControl([SRC.l1600d],'L1600D',{cct:false,wired:['DMX512','RDM'],wirelessExtra:['CRMX','Profoto Air'],builtInCRMX:true,external:['CRMX transmitter for CRMX control']}),
    sourceUrl:SRC.l1600d
  },
  {
    id:'profoto-l600d',manufacturer:'Profoto',model:'L600D',family:'L Series',category:'Light',
    sourceType:'Daylight LED MonoLED',formFactor:'Spotlight / Monolight',
    colorMode:'Daylight',cctK:{min:5600,max:5600},cri:97,tlci:99,powerDrawW:600,
    control:bluetoothControl([SRC.l600d],'L600D',{cct:false,wired:['DMX512','RDM'],wirelessExtra:['CRMX','Profoto Air'],builtInCRMX:true,external:['CRMX transmitter for CRMX control']}),
    sourceUrl:SRC.l600d
  },
  {
    id:'profoto-l600c',manufacturer:'Profoto',model:'L600C',family:'L Series',category:'Light',
    sourceType:'RGBWWW LED MonoLED',formFactor:'Spotlight / Monolight',
    colorMode:'Full Color',cctK:{min:2000,max:15000},cri:96,tlci:99,powerDrawW:600,
    control:bluetoothControl([SRC.l600c],'L600C',{color:true,wired:['DMX512','RDM'],wirelessExtra:['CRMX','Profoto Air'],builtInCRMX:true,external:['CRMX transmitter for CRMX control']}),
    sourceUrl:SRC.l600c
  }
];
