// Dracast exact-model Bluetooth / Palette V2 coverage.
// First-party Draco Broadcast / Dracast product sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  palette4000:'https://dracobroadcast.com/product/dracast-palette-series-ii-led4000-rgbw-soft-panel/',
  fresnel500:'https://dracobroadcast.com/product/dracast-fresnel-pro-series-ii-led500-bi-color-light/'
};

function bluetoothControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via Dracast Palette V2 App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Dracast documents Bluetooth app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Dracast Palette V2 Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl],
        note:'First-party Dracast documentation explicitly confirms Bluetooth control via Palette V2 App. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,cctK,colorMode,powerDrawW){
  return {
    id,
    manufacturer:'Dracast',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    cctK,
    colorMode,
    powerDrawW,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const DRACAST_BLUETOOTH_FIXTURES=[
  fixture('dracast-palette-ii-led4000-rgbw','Palette Series II LED4000 RGBW','Palette Series II','RGBW LED Soft Panel','Panel',SRC.palette4000,{min:2500,max:9999},'RGBW Full Color',400),
  fixture('dracast-fresnel-pro-ii-led500-bicolor','Fresnel Pro Series II LED500 Bi-Color','Fresnel Pro Series II','Bi-Color COB LED Fresnel','Fresnel',SRC.fresnel500,{min:2500,max:9999},'Bi-Color',500)
];
