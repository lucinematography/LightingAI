// Lishuai exact-model Bluetooth coverage.
// First-party Lishuai manual/download references only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  manualPanel:'https://www.lishuai.com.cn/lishuai/2023/12/19/coolcamp60gp120gshuomingshu.pdf',
  manualCob:'https://www.lishuai.com.cn/lishuai/2023/12/19/coolcam300dg300xgshuomingshu.pdf',
  manual120200:'https://www.lishuai.com.cn/lishuai/2023/12/19/coolcam120xg200dg200xgshuomingshu.pdf',
  downloads:'https://www.lishuai.com.cn/service/zi-liao-xia-zai/',
  products:'https://www.lishuai.com.cn/product/coolcam-gu-jin-xi-lie/',
  lightReel:'https://www.lishuai.com.cn/product/light-reel-app/'
};

function bluetoothControl(sourceUrl,note){
  const sourceUrls=[sourceUrl,SRC.downloads,SRC.products,SRC.lightReel];
  return {
    wired:[],
    wireless:['Bluetooth via Lishuai Light Reel APP'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Lishuai documents Bluetooth Light Reel app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Lishuai Light Reel Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note
      }
    }
  };
}

function panelFixture(id,model,powerDrawW){
  const note='The first-party Lishuai P60G/P120G manual explicitly documents Bluetooth reset before Light Reel app control. Separate 2.4G remote control is not treated as the Bluetooth route. LightingAI proprietary command semantics remain locked.';
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
    control:bluetoothControl(SRC.manualPanel,note),
    sourceUrl:SRC.manualPanel
  };
}

function cobFixture(id,model,sourceUrl){
  const note='First-party Lishuai COOLCAM product and manual evidence is exact-model scoped to this G variant and documents the Light Reel wireless app route. Bluetooth transport is cataloged only for the verified G variant; proprietary command/session semantics remain locked.';
  return {
    id,
    manufacturer:'Lishuai',
    model,
    family:'COOLCAM',
    category:'Light',
    sourceType:'Bi-Color LED Spotlight',
    formFactor:'COB / Monolight',
    colorMode:'Bi-Color CCT',
    control:bluetoothControl(sourceUrl,note),
    sourceUrl
  };
}

export const LISHUAI_LIGHTREEL_BLUETOOTH_FIXTURES=[
  panelFixture('lishuai-coolcam-p60g','COOLCAM P60G',60),
  panelFixture('lishuai-coolcam-p120g','COOLCAM P120G',120),
  cobFixture('lishuai-coolcam-200xg','COOLCAM 200X(G)',SRC.manual120200),
  cobFixture('lishuai-coolcam-300xg','COOLCAM 300X(G)',SRC.manualCob)
];
