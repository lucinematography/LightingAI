// NiceFoto exact-model Bluetooth coverage.
// First-party NiceFoto APP, product, and manual/download evidence only.
// The app page identifies TC-series lights as Bluetooth Mesh controlled.
// Proprietary command/session semantics remain fail-closed.
const SRC={
  app:'https://nicefoto.cn/app',
  manuals:'https://nicefoto.cn/shuomingshu',
  stickSeries:'https://nicefoto.cn/product-category/bxpbw/%E6%A3%92%E7%81%AF/',
  liveSeries:'https://nicefoto.cn/product-category/yingshizhibo',
  tc298:'https://nicefoto.cn/product/%E6%89%8B%E6%8C%81%E5%85%A8%E5%BD%A9%E6%A3%92%E7%81%AFtc-298rgb-w',
  tc209:'https://nicefoto.cn/product/tc-209rgb-w'
};

function bluetoothControl(sourceUrl,note){
  const sourceUrls=[SRC.app,SRC.manuals,sourceUrl].filter((v,i,a)=>a.indexOf(v)===i);
  return {
    wired:[],
    wireless:['Bluetooth Mesh via NiceFoto APP'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'NiceFoto documents Bluetooth Mesh app transport for TC-series lights, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'NiceFoto TC Bluetooth Mesh',
        scope:'transport-capability-only',
        sourceUrls,
        note
      }
    }
  };
}

function fixture(id,model,formFactor,sourceUrl=SRC.manuals){
  return {
    id,
    manufacturer:'NiceFoto',
    model,
    family:'TC Series',
    category:'Light',
    sourceType:'Multi-color LED',
    formFactor,
    colorMode:'Multi-color / CCT / HSI',
    control:bluetoothControl(
      sourceUrl,
      'NiceFoto first-party APP documentation states that TC-series multi-color lights use standard Mesh Bluetooth. This fixture is included only because the exact model is independently present in NiceFoto first-party product/manual material. LightingAI proprietary command/session semantics remain locked.'
    ),
    sourceUrl
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
  fixture('nicefoto-tc-158rgbw','TC-158RGB.W','Pocket Light'),
  fixture('nicefoto-tc-298rgbw','TC-298RGB.W','Tube / Handheld',SRC.tc298),
  fixture('nicefoto-tc-209rgbw','TC-209RGB.W','Tube / Handheld',SRC.tc209),
  fixture('nicefoto-tc-313rgbw','TC-313RGB.W','Live / Multi-color Light',SRC.liveSeries),
  fixture('nicefoto-tc-318rgbw','TC-318RGB.W','Live / Multi-color Light',SRC.liveSeries)
];
