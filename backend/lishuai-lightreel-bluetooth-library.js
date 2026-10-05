// Lishuai exact-model Bluetooth coverage.
// First-party Lishuai manual/download references only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  manual:'https://www.lishuai.com.cn/lishuai/2023/12/19/coolcamp60gp120gshuomingshu.pdf',
  downloads:'https://www.lishuai.com.cn/service/zi-liao-xia-zai/',
  lightReel:'https://www.lishuai.com.cn/'
};

function bluetoothControl(){
  return {
    wired:[],
    wireless:['Bluetooth via Lishuai Light Reel APP'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Lishuai documents Bluetooth Light Reel app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[SRC.manual,SRC.downloads,SRC.lightReel],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Lishuai Light Reel Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[SRC.manual,SRC.downloads,SRC.lightReel],
        note:'The Lishuai P60G/P120G manual explicitly documents Bluetooth reset before Light Reel app control. Separate 2.4G remote control is not treated as the Bluetooth route. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,powerDrawW){
  return {
    id,
    manufacturer:'Lishuai',
    model,
    family:'COOLCAM',
    category:'Light',
    sourceType:'Bi-Color LED Panel',
    formFactor:'Panel',
    cctK:{min:2700,max:6500},
    colorMode:'Bi-Color CCT',
    powerDrawW,
    beamAngle:120,
    control:bluetoothControl(),
    sourceUrl:SRC.manual
  };
}

export const LISHUAI_LIGHTREEL_BLUETOOTH_FIXTURES=[
  fixture('lishuai-coolcam-p60g','COOLCAM P60G',60),
  fixture('lishuai-coolcam-p120g','COOLCAM P120G',120)
];
