// Tolifo exact-model Wi-Fi coverage.
// First-party Tolifo product/catalog and GK-2016 PRO feature article only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  article:'https://www.tolifo.com/news/835-cn.html',
  catalog:'https://us.tolifo.com/product/product.php?class2=41',
  s2016:'https://us.tolifo.com/product/showproduct.php?id=80'
};

function wifiControl(){
  const sources=[SRC.article,SRC.catalog];
  return {
    wired:['DMX512'],
    wireless:['Wi-Fi via Tolifo mobile APP','2.4G'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Tolifo documents Wi-Fi app transport for GK-2016 PRO, but LightingAI Wi-Fi command/session semantics are not production-verified',
      'Tolifo 2.4G wireless control remains a separate non-Wi-Fi route'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'Tolifo GK-2016 PRO Wi-Fi APP',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'Tolifo first-party documentation explicitly states that GK-2016 PRO supports mobile APP control over a Wi-Fi network. This checkpoint is restricted to the named GK-2016B PRO and GK-2016S PRO variants. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

export const TOLIFO_GK2016_WIFI_FIXTURES=[
  {
    id:'tolifo-gk-2016b-pro',
    manufacturer:'Tolifo',
    model:'GK-2016B PRO',
    family:'GK-2016 PRO',
    category:'Light',
    sourceType:'Bi-Color LED Panel',
    formFactor:'Panel',
    cctK:{min:3200,max:5600},
    colorMode:'Bi-Color',
    control:wifiControl(),
    sourceUrl:SRC.article
  },
  {
    id:'tolifo-gk-2016s-pro',
    manufacturer:'Tolifo',
    model:'GK-2016S PRO',
    family:'GK-2016 PRO',
    category:'Light',
    sourceType:'Daylight LED Panel',
    formFactor:'Panel',
    cctK:{min:5600,max:5600},
    colorMode:'Daylight',
    powerDrawW:120,
    control:wifiControl(),
    sourceUrl:SRC.s2016
  }
];
