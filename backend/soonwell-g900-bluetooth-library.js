// SOONWELL exact-model Bluetooth coverage.
// First-party SOONWELL product evidence plus the G900 manufacturer user manual hosted in the FCC filing.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  g900:'https://www.soonwell.com/product-page/soonwell-element-series-g900-bi-color-bowens-mount-led-spotlight',
  app:'https://www.soonwell.com/soonwell-app',
  fccManual:'https://fcc.report/FCC-ID/2a6flg900/5962642.pdf'
};

function bluetoothControl(){
  const sources=[SRC.g900,SRC.app,SRC.fccManual];
  return {
    wired:['DMX512'],
    wireless:['Bluetooth via SOONWELL Sensei Link APP','2.4G'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'SOONWELL documents Bluetooth app transport for G900, but LightingAI command/session semantics are not production-verified',
      'SOONWELL 2.4G control is kept separate from the Bluetooth route'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'SOONWELL Sensei Link Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'The official SOONWELL G900 page lists APP control, while the G900 manufacturer user manual in the FCC filing explicitly labels Bluetooth (APP) Control with Sensei Link. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

export const SOONWELL_G900_BLUETOOTH_FIXTURES=[
  {
    id:'soonwell-g900',
    manufacturer:'SOONWELL',
    model:'G900',
    family:'Element Series',
    category:'Light',
    sourceType:'Bi-Color LED Spotlight',
    formFactor:'COB / Monolight',
    cctK:{min:2600,max:6000},
    colorMode:'Bi-Color',
    powerDrawW:900,
    control:bluetoothControl(),
    sourceUrl:SRC.g900
  }
];
