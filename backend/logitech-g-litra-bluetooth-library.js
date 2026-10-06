// Logitech G Litra exact-model Bluetooth coverage.
// First-party Logitech G product evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  beam:'https://www.logitechg.com/en-us/shop/p/litra-beam-streaming-light',
  beamLx:'https://www.logitechg.com/en-us/shop/p/litra-beam-lx-led-light.946-000013'
};

function bluetoothControl(sourceUrl,note){
  return {
    wired:['USB'],
    wireless:['Bluetooth via Logitech G HUB'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Logitech G documents Bluetooth/G HUB control for this exact Litra model, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Logitech G Litra Bluetooth / G HUB',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl],
        note:note+' LightingAI proprietary Bluetooth command semantics remain locked.'
      }
    }
  };
}

export const LOGITECH_G_LITRA_BLUETOOTH_FIXTURES=[
  {
    id:'logitech-g-litra-beam',
    manufacturer:'Logitech G',
    model:'Litra Beam',
    family:'Litra',
    category:'Light',
    sourceType:'Bi-Color LED Streaming Key Light',
    formFactor:'Linear Key Light',
    cctK:{min:2700,max:6500},
    colorMode:'Bi-Color',
    control:bluetoothControl(SRC.beam,'First-party Logitech G documentation explicitly confirms G HUB control through USB or Bluetooth for Litra Beam.'),
    sourceUrl:SRC.beam
  },
  {
    id:'logitech-g-litra-beam-lx',
    manufacturer:'Logitech G',
    model:'Litra Beam LX',
    family:'Litra',
    category:'Light',
    sourceType:'Dual-Sided RGB / Bi-Color LED Streaming Key Light',
    formFactor:'Linear Key Light',
    cctK:{min:2700,max:6500},
    colorMode:'Bi-Color / RGB / LIGHTSYNC',
    powerDrawW:13.5,
    control:bluetoothControl(SRC.beamLx,'First-party Logitech G documentation explicitly confirms Bluetooth or USB control through G HUB for Litra Beam LX.'),
    sourceUrl:SRC.beamLx
  }
];
