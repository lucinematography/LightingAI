// Moman exact-model Bluetooth coverage.
// First-party Moman PC8 product and editorial evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  pc8:'https://momanx.com/products/led-light-for-dslr-camera-moman-pc8',
  app:'https://momanx.com/ja/pages/moman-lighting-app',
  bluetoothEvidence:'https://momanx.com/it/blogs/moman-ideas/best-lighting-equipment-for-youtube-videos-for-any-budget'
};

function bluetoothControl(){
  const sources=[SRC.pc8,SRC.app,SRC.bluetoothEvidence];
  return {
    wired:[],
    wireless:['Bluetooth via Moman Light APP'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Moman documents PC8 app/Bluetooth control, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Moman Light Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'Moman first-party documentation confirms remote app control for PC8, and first-party editorial documentation explicitly identifies Bluetooth control. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

export const MOMAN_PC8_BLUETOOTH_FIXTURES=[
  {
    id:'moman-pc8',
    manufacturer:'Moman',
    model:'PC8',
    family:'PC Series',
    category:'Light',
    sourceType:'RGB LED Pocket Light',
    formFactor:'Pocket Light',
    cctK:{min:2500,max:9000},
    colorMode:'RGB / HSI / CCT',
    powerDrawW:8,
    control:bluetoothControl(),
    sourceUrl:SRC.pc8
  }
];
