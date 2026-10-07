import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
for(const required of [
 'app/src/main/assets/control-bootstrap.js','app/src/main/assets/control-dashboard.js','app/src/main/assets/ble-control.js','app/src/main/assets/ai-control-bridge.js',
 'app/src/main/java/com/lightingai/app/MainActivity.java','app/src/main/java/com/lightingai/app/BleDeviceScanner.java',
 'app/src/main/java/com/lightingai/app/BleGattInspector.java','app/src/main/java/com/lightingai/app/AsteraBtbBondManager.java'
])expect(exists(required),'missing Bluetooth CONTROL asset: '+required);
const bootstrap=read('app/src/main/assets/control-bootstrap.js');
const dashboard=read('app/src/main/assets/control-dashboard.js');
const ble=read('app/src/main/assets/ble-control.js');
const aiBridge=read('app/src/main/assets/ai-control-bridge.js');
const classic=read('app/src/main/java/com/lightingai/app/AsteraBtbClassicInspector.java');
const bond=read('app/src/main/java/com/lightingai/app/AsteraBtbBondManager.java');
const main=read('app/src/main/java/com/lightingai/app/MainActivity.java');
expect(bootstrap.includes("window.LightingAIControlBootstrapMode='vendor-wireless'"),'CONTROL bootstrap is not vendor-wireless');
for(const text of [bootstrap,dashboard,main])for(const forbidden of ['artnet-control.js','dmx-patch-planner.js','dmx-export.js','artNetSendDmx','sacnSendDmx','networkDmxDiagnostics'])expect(!text.includes(forbidden),'network CONTROL marker remains: '+forbidden);
expect(dashboard.includes('Bluetooth/BLE i direktni vendor Wi-Fi')&&dashboard.includes('Bluetooth/BLE and direct vendor Wi-Fi'),'Bluetooth + vendor Wi-Fi operator copy missing');
expect(ble.includes('ASTERA_BTB_PRIVATE_SERVICE')&&ble.includes('transport fingerprint only'),'Astera Bluetooth diagnostics must remain passive');
expect(aiBridge.includes("version:'0.6-bluetooth-verification-only'"),'AI control bridge must remain in verification-only mode');
expect(aiBridge.includes('lighting_ai_control_draft_v1')&&aiBridge.includes('window.__lightingAIControlDraft'),'AI control bridge must remain draft-only');
for(const forbidden of [
  'Android.','window.webkit.messageHandlers','bleDiscover(','bleInspectGatt(','asteraBtbInspectGatt(',
  'writeCharacteristic(','productionReady(','semanticReady=true','transportReady=true'
]) expect(!aiBridge.includes(forbidden),'AI control bridge may not directly invoke CONTROL transport/output: '+forbidden);

expect(!read('app/src/main/java/com/lightingai/app/BleGattInspector.java').includes('writeCharacteristic('),'BLE diagnostics may not send proprietary writes');
for(const removed of ['app/src/main/assets/artnet-control.js','app/src/main/assets/dmx-patch-planner.js','app/src/main/assets/dmx-export.js'])expect(!exists(removed),'removed network asset still present: '+removed);
const failClosedRuntime=[
  ['control-bootstrap.js',bootstrap],
  ['control-system-drivers.js',read('app/src/main/assets/control-system-drivers.js')],
  ['control-routing.js',read('app/src/main/assets/control-routing.js')],
  ['control-dashboard.js',dashboard],
  ['ble-control.js',ble],
  ['ai-control-bridge.js',aiBridge]
];
for(const [name,text] of failClosedRuntime){
  for(const forbidden of [
    /production\s*[:=]\s*true/,
    /productionReady\s*[:=]\s*true/,
    /vendorDirectReady\s*[:=]\s*true/,
    /status\s*[:=]\s*['"]production['"]/,
    /semanticReady\s*[:=]\s*true/,
    /transportReady\s*[:=]\s*true/
  ]) expect(!forbidden.test(text),'CONTROL runtime must remain fail-closed until physical driver verification: '+name+' matched '+String(forbidden));
}
for(const nativePath of [
  'app/src/main/java/com/lightingai/app/MainActivity.java',
  'app/src/main/java/com/lightingai/app/BleGattInspector.java'
]){
  expect(!read(nativePath).includes('writeCharacteristic('),'Native CONTROL bridge may not expose proprietary characteristic writes before physical verification: '+nativePath);
}
for(const [name,text] of [
  ['AsteraBtbClassicInspector.java',classic],
  ['AsteraBtbBondManager.java',bond]
]){
  for(const forbidden of ['BluetoothSocket','createRfcommSocket','getOutputStream(','.write(']){
    expect(!text.includes(forbidden),'Astera Classic/bond diagnostics may not open an output stream before physical verification: '+name+' matched '+forbidden);
  }
}
console.log(JSON.stringify({ok:failures.length===0,controlPrimary:'vendor-wireless-bluetooth-wifi',failures},null,2));
if(failures.length)process.exit(1);
