// PIXEL exact-model Bluetooth coverage.
// First-party PIXEL product/manual evidence only.
// Ambiguous K80/G1S variants are intentionally excluded from this checkpoint.
// Proprietary command/session semantics remain fail-closed.
const SRC={
  liber:'https://www.pixelhk.com/en/product/liber-3',
  liberManual:'https://cdn.pixelhk.com/storage/product/download/manual/liber-3/Liber-RGB-Povket-Video-Light_%2B~.pdf',
  p80:'https://www.pixelhk.com/en/product/p80-Metal-Light-3',
  p80Manual:'https://cdn.pixelhk.com/storage/product/download/manual/p80-Metal-Light-3/P80_Manual.pdf'
};

function bluetoothControl(sourceUrls,family){
  return {
    wired:[],
    wireless:['Bluetooth via PIXEL app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'PIXEL documents Bluetooth app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family,
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party PIXEL documentation explicitly confirms Bluetooth app control for this exact model. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

export const PIXEL_BLUETOOTH_FIXTURES=[
  {
    id:'pixel-liber-rgb',
    manufacturer:'PIXEL',
    model:'Liber',
    family:'Liber',
    category:'Light',
    sourceType:'RGB LED',
    formFactor:'Pocket Light',
    cctK:{min:2500,max:8500},
    colorMode:'RGB / HSI / CCT',
    powerDrawW:7,
    control:bluetoothControl([SRC.liber,SRC.liberManual],'PIXEL Link Bluetooth'),
    sourceUrl:SRC.liber
  },
  {
    id:'pixel-p80-rgb',
    manufacturer:'PIXEL',
    model:'P80 RGB',
    family:'P80',
    category:'Light',
    sourceType:'RGBW LED',
    formFactor:'Panel',
    cctK:{min:2500,max:10000},
    colorMode:'RGBW / HSI / CCT',
    powerDrawW:60,
    control:bluetoothControl([SRC.p80,SRC.p80Manual],'PIXEL LCS Bluetooth'),
    sourceUrl:SRC.p80
  }
];
