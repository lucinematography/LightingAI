// PiXAPRO exact-model Bluetooth practical-light coverage.
// First-party EssentialPhoto/PiXAPRO evidence only.
// Transport evidence is model-scoped; proprietary Bluetooth command/session semantics remain fail-closed.
const SRC={
  rope:'https://www.essentialphoto.co.uk/products/neon-rgb-flex-ip67-waterproof-rgb-led-light-rope-with-bluetooth-functionality',
  strips:'https://www.essentialphoto.co.uk/products/neon-rgb-strips-rgb-led-light-rope-with-bluetooth-functionality',
  brand:'https://www.essentialphoto.co.uk/pages/about-us'
};

function bluetoothControl(sourceUrl,model){
  const sources=[sourceUrl,SRC.brand];
  return {
    wired:[],
    wireless:['Bluetooth via smartphone app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'PiXAPRO documents Bluetooth smartphone-app control for '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'PiXAPRO NEON Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party EssentialPhoto/PiXAPRO documentation explicitly confirms Bluetooth smartphone-app control for this exact PiXAPRO model. LightingAI proprietary Bluetooth command semantics remain locked.'
      }
    }
  };
}

export const PIXAPRO_NEON_BLUETOOTH_FIXTURES=[
  {
    id:'pixapro-neon-rgb-flex-c130602',
    manufacturer:'PiXAPRO',
    model:'3m NEON RGB Flex IP67 (C-130602)',
    family:'NEON RGB',
    category:'Light',
    sourceType:'RGBIC LED Practical Rope Light',
    formFactor:'Flexible Rope',
    colorMode:'RGBIC / Effects',
    control:bluetoothControl(SRC.rope,'3m NEON RGB Flex IP67 C-130602'),
    sourceUrl:SRC.rope
  },
  {
    id:'pixapro-neon-rgb-strips-c130601',
    manufacturer:'PiXAPRO',
    model:'NEON RGB Strips (C-130601)',
    family:'NEON RGB',
    category:'Light',
    sourceType:'RGBIC LED Practical Strip Light',
    formFactor:'Modular Light Strips',
    colorMode:'RGBIC / Effects',
    powerDrawW:{min:12,max:24},
    control:bluetoothControl(SRC.strips,'NEON RGB Strips C-130601'),
    sourceUrl:SRC.strips
  }
];
