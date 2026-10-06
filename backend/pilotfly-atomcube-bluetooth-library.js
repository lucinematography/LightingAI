// Pilotfly AtomCUBE exact-model Bluetooth Mesh lighting coverage.
// First-party Pilotfly product evidence only.
// Transport capability is verified; proprietary Bluetooth command/session semantics remain fail-closed.
const SRC={
  rx1:'https://pilotfly.com/home/20-pilotfly-atomcube-rx1-video-light.html',
  rx7:'https://pilotfly.com/pocket-led-lights/59-atomcube-rx7-pocket-rgbww-leg-light.html',
  rx7Lite:'https://pilotfly.com/home/80-atomcuben-rx7lite-pocket-rgbww-led-light.html',
  rx50:'https://pilotfly.com/home/62-atomcube-rx50-10-portable-rgbww-led-light-panel-lite-version.html'
};
function bluetoothMeshControl(sourceUrl,model){
  const sources=[sourceUrl];
  return {
    wired:[],
    wireless:['Bluetooth Mesh via CUBERSYNC app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:['Pilotfly documents Bluetooth Mesh/CUBERSYNC control for '+model+', but LightingAI proprietary Bluetooth command/session semantics are not production-verified'],
    sourceUrls:sources,
    wirelessVerification:{bluetooth:{verified:true,family:'Pilotfly AtomCUBE Bluetooth Mesh',scope:'transport-capability-only',sourceUrls:sources,note:'First-party Pilotfly documentation explicitly confirms Bluetooth Mesh and official app control for this exact AtomCUBE model. LightingAI proprietary Bluetooth command/session semantics remain locked.'}}
  };
}
export const PILOTFLY_ATOMCUBE_BLUETOOTH_FIXTURES=[
  {id:'pilotfly-atomcube-rx1',manufacturer:'Pilotfly',model:'AtomCUBE RX1',family:'AtomCUBE',category:'Light',sourceType:'RGBCW LED Pocket Video Light',formFactor:'Pocket / On-Camera Light',colorMode:'RGBCW',control:bluetoothMeshControl(SRC.rx1,'AtomCUBE RX1'),sourceUrl:SRC.rx1},
  {id:'pilotfly-atomcube-rx7',manufacturer:'Pilotfly',model:'AtomCUBE RX7',family:'AtomCUBE',category:'Light',sourceType:'RGBWW LED Pocket Panel',formFactor:'Pocket / On-Camera Light',colorMode:'RGBWW / CCT / HSI',powerDrawW:18,cctK:{min:2500,max:8500},cri:95,tlci:99,control:bluetoothMeshControl(SRC.rx7,'AtomCUBE RX7'),sourceUrl:SRC.rx7},
  {id:'pilotfly-atomcube-rx7-lite',manufacturer:'Pilotfly',model:'AtomCUBE RX7 Lite',family:'AtomCUBE',category:'Light',sourceType:'RGBWW LED Pocket Panel',formFactor:'Pocket / On-Camera Light',colorMode:'RGBWW / CCT / HSI',powerDrawW:18,cctK:{min:2500,max:8500},cri:95,tlci:99,control:bluetoothMeshControl(SRC.rx7Lite,'AtomCUBE RX7 Lite'),sourceUrl:SRC.rx7Lite},
  {id:'pilotfly-atomcube-rx50',manufacturer:'Pilotfly',model:'AtomCUBE RX50',family:'AtomCUBE',category:'Light',sourceType:'RGBWW LED Panel',formFactor:'Panel',colorMode:'RGBWW / CCT / HSI',powerDrawW:60,cctK:{min:2500,max:8500},cri:95,tlci:99,control:bluetoothMeshControl(SRC.rx50,'AtomCUBE RX50'),sourceUrl:SRC.rx50}
];
