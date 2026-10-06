// Mettle exact-model Bluetooth lighting coverage.
// First-party Mettle product/manual evidence only.
// Transport evidence is model-scoped; proprietary Bluetooth command/session semantics remain fail-closed.
const SRC={
  tube:'https://en.mettlecorp.cn/LED/TubeLightX4'
};

function bluetoothControl(model){
  const sources=[SRC.tube];
  return {
    wired: model==='Tube Light X1' ? [] : ['DMX'],
    wireless:['Bluetooth via Mettle App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Mettle documents Bluetooth app control for Tube Light X1/X2/X4, but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Mettle Tube Light Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party Mettle documentation explicitly lists Wireless Control: BT, 99 Channels and APP control for Tube Light X1, X2 and X4. LightingAI proprietary Bluetooth command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,powerDrawW){
  return {
    id,
    manufacturer:'Mettle',
    model,
    family:'Tube Light X',
    category:'Light',
    sourceType:'RGBWW LED Tube Light',
    formFactor:'Tube',
    cctK:{min:2800,max:8000},
    colorMode:'RGBWW / HSI / CCT / GEL / EFX',
    powerDrawW,
    control:bluetoothControl(model),
    sourceUrl:SRC.tube
  };
}

export const METTLE_TUBE_X_BLUETOOTH_FIXTURES=[
  fixture('mettle-tube-light-x1','Tube Light X1',6),
  fixture('mettle-tube-light-x2','Tube Light X2',18),
  fixture('mettle-tube-light-x4','Tube Light X4',36)
];
