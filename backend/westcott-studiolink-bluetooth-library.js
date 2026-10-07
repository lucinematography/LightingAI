// Westcott exact-model Bluetooth coverage.
// First-party Westcott product/support evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  app:'https://help.fjwestcott.com/en-US/using-the-westcott-studio-link-app-3574014',
  lSeries:'https://help.fjwestcott.com/en-US/connecting-the-l60-b-and-l120-b-to-the-westcott-studiolink-app-1024676',
  l60:'https://www.fjwestcott.com/products/l60-b-bi-color-cob-led-60w',
  l120:'https://www.fjwestcott.com/products/l120-b-bi-color-cob-led-120w',
  ice3Support:'https://help.fjwestcott.com/en-US/how-do-i-connect-my-ice-light-3-to-the-studiolink-mobile-app-1810587',
  ice3Bi:'https://www.fjwestcott.com/products/ice-light-3-bi-color-led-kit-with-ac-power',
  ice3Rgb:'https://www.fjwestcott.com/products/ice-light-3-rgbww-led-kit-with-ac-power'
};

function bluetoothControl(sourceUrl,note){
  const sources=[sourceUrl,SRC.app];
  return {
    wired:[],
    wireless:['Bluetooth via Westcott StudioLink'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Westcott documents Bluetooth/StudioLink control for this exact model, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Westcott StudioLink Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:note+' LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

export const WESTCOTT_BLUETOOTH_FIXTURES=[
  {
    id:'westcott-l60-b',
    manufacturer:'Westcott',
    model:'L60-B',
    family:'L Series',
    category:'Light',
    sourceType:'Bi-Color COB LED',
    formFactor:'COB / Monolight',
    cctK:{min:2700,max:6500},
    colorMode:'Bi-Color',
    powerDrawW:60,
    control:bluetoothControl(SRC.l60,'First-party Westcott documentation explicitly confirms Bluetooth control through StudioLink for L60-B.'),
    sourceUrl:SRC.l60
  },
  {
    id:'westcott-l120-b',
    manufacturer:'Westcott',
    model:'L120-B',
    family:'L Series',
    category:'Light',
    sourceType:'Bi-Color COB LED',
    formFactor:'COB / Monolight',
    cctK:{min:2700,max:6500},
    colorMode:'Bi-Color',
    powerDrawW:120,
    control:bluetoothControl(SRC.l120,'First-party Westcott documentation explicitly confirms Bluetooth control through StudioLink for L120-B.'),
    sourceUrl:SRC.l120
  },
  {
    id:'westcott-ice-light-3-bi-color',
    manufacturer:'Westcott',
    model:'Ice Light 3 Bi-Color',
    family:'Ice Light 3',
    category:'Light',
    sourceType:'Bi-Color LED Wand',
    formFactor:'Tube',
    cctK:{min:2700,max:6500},
    colorMode:'Bi-Color',
    control:bluetoothControl(SRC.ice3Bi,'First-party Westcott product/support documentation explicitly confirms Bluetooth full wireless control through StudioLink for Ice Light 3 Bi-Color.'),
    sourceUrl:SRC.ice3Bi
  },
  {
    id:'westcott-ice-light-3-rgbww',
    manufacturer:'Westcott',
    model:'Ice Light 3 RGBWW',
    family:'Ice Light 3',
    category:'Light',
    sourceType:'RGBWW LED Wand',
    formFactor:'Tube',
    cctK:{min:2700,max:6500},
    colorMode:'RGBWW / HSI / CCT / FX',
    control:bluetoothControl(SRC.ice3Rgb,'First-party Westcott product/support documentation explicitly confirms Bluetooth full wireless control through StudioLink for Ice Light 3 RGBWW.'),
    sourceUrl:SRC.ice3Rgb
  }
];
