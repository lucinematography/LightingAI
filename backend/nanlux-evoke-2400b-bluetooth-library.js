// NANLUX exact-model Bluetooth lighting coverage.
// First-party NANLUX/NANLINK product/app evidence only.
// Transport evidence is model-scoped; proprietary Bluetooth command/session semantics remain fail-closed.
const SRC={
  product:'https://nanlite.jp/products/nanlux-evoke-2400b',
  nanlink:'https://www.nanlink.com/en/h-col-215.html'
};

function bluetoothControl(){
  const sources=[SRC.product,SRC.nanlink];
  return {
    wired:['DMX/RDM','Art-Net/sACN'],
    wireless:['Bluetooth via NANLINK App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'NANLUX documents direct Bluetooth/NANLINK app control for Evoke 2400B, but LightingAI proprietary Bluetooth command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'NANLUX NANLINK direct Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'First-party NANLUX regional product documentation explicitly lists Bluetooth and provides an exact NANLINK Via Bluetooth connection procedure for Evoke 2400B. LightingAI proprietary Bluetooth command semantics remain locked.'
      }
    }
  };
}

export const NANLUX_EVOKE_2400B_BLUETOOTH_FIXTURES=[
  {
    id:'nanlux-evoke-2400b',
    manufacturer:'NANLUX',
    model:'Evoke 2400B',
    family:'Evoke',
    category:'Light',
    sourceType:'Bi-Color LED Spot Light',
    formFactor:'COB / Spot',
    cctK:{min:2700,max:6500},
    colorMode:'Bi-Color',
    powerDrawW:2400,
    control:bluetoothControl(),
    sourceUrl:SRC.product
  }
];
