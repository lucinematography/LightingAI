// Weeylite exact-model direct-Bluetooth lighting coverage.
// First-party Viltrox/Weeylite official product evidence only.
// Transport and operator capabilities are model-scoped; proprietary Bluetooth command/session semantics remain fail-closed.
const SRC={
  s03:'https://viltrox.com/products/weeylite-s03-4w-colorful-pocket-rgb-light',
  s05:'https://viltrox.com/products/weeylite-s05-2800-6800k-pocket-rgb-led-video-light-with-360-full-color-oled-display-app-control-26-fx-effects-1',
  k21:'https://viltrox.com/products/weeylite-k21-handheld-2500k-8500k-rgb-led-light-stick',
  wp35:'https://viltrox.com/en-gb/products/weeylite-wp-35-full-color-rgb-led-panel-with-2800k-6800k-bi-color-ra-95-tlci-97-26fx-lighting-effects-app-control',
  rb9:'https://viltrox.com/products/weeylite-rb9-rgbw-compact-led-light',
  ninja200:'https://viltrox.com/products/weeylite-ninja-200-portable-bi-color-cob-led-light'
};

function capabilityVerification(sourceUrls,{cct=false,color=false,fx=false}={}){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Viltrox/Weeylite documents app or Bluetooth brightness control for this exact model. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    ...(cct?{cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Viltrox/Weeylite documents adjustable color temperature for this exact model together with Bluetooth/app control. This proves operator capability only.'}}:{}),
    ...(color?{color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Viltrox/Weeylite documents RGB/HSI/full-color control for this exact model together with Bluetooth/app control. This proves operator capability only.'}}:{}),
    ...(fx?{fx:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Viltrox/Weeylite documents scene/effect control for this exact model. This proves operator capability only.'}}:{})
  };
}

function bluetoothControl(sourceUrl,model,capabilities){
  const sourceUrls=[sourceUrl];
  return {
    wired:[],
    wireless:['Bluetooth via Weeylite / WeeylitePro app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Viltrox/Weeylite documents Bluetooth/app control for '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Weeylite Bluetooth app control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Viltrox/Weeylite official product documentation explicitly confirms Bluetooth/mobile-app control for this exact model. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,capabilities)
  };
}

export const WEEYLITE_BLUETOOTH_FIXTURES=[
  {
    id:'weeylite-s03',
    manufacturer:'Weeylite',
    model:'S03',
    family:'S Series',
    category:'Light',
    sourceType:'RGB Pocket LED Light',
    formFactor:'Pocket / On-Camera Light',
    colorMode:'RGB / CCT',
    powerDrawW:4,
    control:bluetoothControl(SRC.s03,'S03',{cct:true,color:true,fx:false}),
    sourceUrl:SRC.s03
  },
  {
    id:'weeylite-s05',
    manufacturer:'Weeylite',
    model:'S05',
    family:'S Series',
    category:'Light',
    sourceType:'RGB Pocket LED Video Light',
    formFactor:'Pocket / On-Camera Light',
    colorMode:'RGB / CCT / FX',
    powerDrawW:5,
    cctK:{min:2800,max:6800},
    cri:95,
    tlci:97,
    control:bluetoothControl(SRC.s05,'S05',{cct:true,color:true,fx:true}),
    sourceUrl:SRC.s05
  },
  {
    id:'weeylite-k21',
    manufacturer:'Weeylite',
    model:'K21',
    family:'K Series',
    category:'Light',
    sourceType:'RGB LED Light Stick',
    formFactor:'Light Stick',
    colorMode:'RGBW / CCT / FX',
    cctK:{min:2500,max:8500},
    control:bluetoothControl(SRC.k21,'K21',{cct:true,color:true,fx:true}),
    sourceUrl:SRC.k21
  },
  {
    id:'weeylite-wp35',
    manufacturer:'Weeylite',
    model:'WP35',
    family:'WP Series',
    category:'Light',
    sourceType:'Full-Color RGB LED Panel',
    formFactor:'Panel',
    colorMode:'RGB / CCT / FX',
    powerDrawW:30,
    cctK:{min:2800,max:6800},
    cri:95,
    tlci:97,
    control:bluetoothControl(SRC.wp35,'WP35',{cct:true,color:true,fx:true}),
    sourceUrl:SRC.wp35
  },
  {
    id:'weeylite-rb9',
    manufacturer:'Weeylite',
    model:'RB9',
    family:'RB Series',
    category:'Light',
    sourceType:'RGBW Portable LED Light',
    formFactor:'Pocket / On-Camera Light',
    colorMode:'RGBW / CCT',
    powerDrawW:12,
    cctK:{min:2500,max:8500},
    cri:95,
    tlci:97,
    control:bluetoothControl(SRC.rb9,'RB9',{cct:true,color:true,fx:false}),
    sourceUrl:SRC.rb9
  },
  {
    id:'weeylite-ninja-200',
    manufacturer:'Weeylite',
    model:'Ninja 200',
    family:'Ninja',
    category:'Light',
    sourceType:'Bi-Color COB LED Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'Bi-Color',
    powerDrawW:60,
    cctK:{min:2800,max:6800},
    cri:95,
    tlci:95,
    control:bluetoothControl(SRC.ninja200,'Ninja 200',{cct:true,color:false,fx:false}),
    sourceUrl:SRC.ninja200
  }
];
