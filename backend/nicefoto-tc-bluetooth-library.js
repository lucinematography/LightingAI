// NiceFoto exact-model Bluetooth coverage.
// First-party NiceFoto APP and manual/download evidence only.
// The app page identifies TC-series lights as Bluetooth Mesh controlled.
// Proprietary command/session semantics remain fail-closed.
const SRC={
  app:'https://nicefoto.cn/app',
  manuals:'https://nicefoto.cn/shuomingshu'
};

function bluetoothControl(){
  return {
    wired:[],
    wireless:['Bluetooth Mesh via NiceFoto APP'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'NiceFoto documents Bluetooth Mesh app transport for TC-series lights, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[SRC.app,SRC.manuals],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'NiceFoto TC Bluetooth Mesh',
        scope:'transport-capability-only',
        sourceUrls:[SRC.app,SRC.manuals],
        note:'NiceFoto first-party documentation states that the NiceFoto APP uses standard Mesh Bluetooth for TC-series multi-color lights. This checkpoint includes only TC models explicitly listed in the NiceFoto manual/download center. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,formFactor){
  return {
    id,
    manufacturer:'NiceFoto',
    model,
    family:'TC Series',
    category:'Light',
    sourceType:'Multi-color LED',
    formFactor,
    colorMode:'Multi-color / CCT / HSI',
    control:bluetoothControl(),
    sourceUrl:SRC.manuals
  };
}

export const NICEFOTO_TC_BLUETOOTH_FIXTURES=[
  fixture('nicefoto-tc-768ii','TC-768 II','Panel'),
  fixture('nicefoto-tc-668ii','TC-668 II','Panel'),
  fixture('nicefoto-tc-368','TC-368','Panel'),
  fixture('nicefoto-tc-168','TC-168','Panel'),
  fixture('nicefoto-tc-288','TC-288','Tube / Handheld'),
  fixture('nicefoto-tc-600rgbw','TC-600RGB.W','Panel'),
  fixture('nicefoto-tc-210rgbw','TC-210RGB.W','Pocket / Magnetic Bar'),
  fixture('nicefoto-tc-158rgbw','TC-158RGB.W','Pocket Light')
];
