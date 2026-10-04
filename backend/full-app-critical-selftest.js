import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
for(const required of [
 'app/src/main/assets/control-bootstrap.js','app/src/main/assets/control-dashboard.js','app/src/main/assets/ble-control.js',
 'app/src/main/java/com/lightingai/app/MainActivity.java','app/src/main/java/com/lightingai/app/BleDeviceScanner.java',
 'app/src/main/java/com/lightingai/app/BleGattInspector.java','app/src/main/java/com/lightingai/app/AsteraBtbBondManager.java'
])expect(exists(required),'missing Bluetooth CONTROL asset: '+required);
const bootstrap=read('app/src/main/assets/control-bootstrap.js');
const dashboard=read('app/src/main/assets/control-dashboard.js');
const ble=read('app/src/main/assets/ble-control.js');
const main=read('app/src/main/java/com/lightingai/app/MainActivity.java');
expect(bootstrap.includes("window.LightingAIControlBootstrapMode='vendor-wireless'"),'CONTROL bootstrap is not vendor-wireless');
for(const text of [bootstrap,dashboard,main])for(const forbidden of ['artnet-control.js','dmx-patch-planner.js','dmx-export.js','artNetSendDmx','sacnSendDmx','networkDmxDiagnostics'])expect(!text.includes(forbidden),'network CONTROL marker remains: '+forbidden);
expect(dashboard.includes('Bluetooth/BLE i direktni vendor Wi-Fi')&&dashboard.includes('Bluetooth/BLE and direct vendor Wi-Fi'),'Bluetooth + vendor Wi-Fi operator copy missing');
expect(ble.includes('ASTERA_BTB_PRIVATE_SERVICE')&&ble.includes('transport fingerprint only'),'Astera Bluetooth diagnostics must remain passive');
expect(!read('app/src/main/java/com/lightingai/app/BleGattInspector.java').includes('writeCharacteristic('),'BLE diagnostics may not send proprietary writes');
for(const removed of ['app/src/main/assets/artnet-control.js','app/src/main/assets/dmx-patch-planner.js','app/src/main/assets/dmx-export.js'])expect(!exists(removed),'removed network asset still present: '+removed);
console.log(JSON.stringify({ok:failures.length===0,controlPrimary:'vendor-wireless-bluetooth-wifi',failures},null,2));
if(failures.length)process.exit(1);
