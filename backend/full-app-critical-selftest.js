import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

const requiredAssets=[
 'app/src/main/assets/project-backup-export.js',
 'app/src/main/assets/scene-measure.js',
 'app/src/main/assets/sun.js',
 'app/src/main/assets/sun-native-bridge.js',
 'app/src/main/assets/set-sketch.js',
 'app/src/main/assets/shot-list-planner.js',
 'app/src/main/assets/lighting-cue-planner.js',
 'app/src/main/assets/dof-planner.js',
 'app/src/main/assets/flicker-shutter-planner.js',
 'app/src/main/assets/camera-setup-report.js',
 'app/src/main/assets/dmx-patch-planner.js',
 'app/src/main/assets/dmx-export.js',
 'app/src/main/assets/control-bootstrap.js',
 'app/src/main/assets/artnet-control.js'
];
for(const p of requiredAssets){
 expect(fs.existsSync(path.join(root,p)), 'Missing critical asset: '+p);
}

const main=read('app/src/main/java/com/lightingai/app/MainActivity.java');
for(const marker of [
 'openImagePicker','startSceneMeasure','startSpeechInput',
 'requestNativeSunLocation','startNativeSunCompass',
 'networkDmxDiagnostics','artNetSendDmx','sacnSendDmx'
]){
 expect(main.includes(marker),'MainActivity critical bridge missing: '+marker);
}
expect(main.includes('if (sacnLiveEngine != null) sacnLiveEngine.stopAll();'),'sACN lifecycle shutdown missing');
expect(main.includes('LightingAINetworkDmxLifecyclePause'),'Network DMX pause fail-safe missing');
expect(main.includes('LightingAINetworkDmxLifecycleResume'),'Network DMX resume fail-safe missing');
expect(main.includes("file:///android_asset/control-bootstrap.js"),'Deterministic control bootstrap injection missing');
expect(main.includes('isBleLocationServiceReady'),'BLE Android 11-and-older Location/GPS service guard missing');
expect(main.includes('Manifest.permission.ACCESS_FINE_LOCATION'),'Exhaustive BLE location permission check missing');
const manifest=read('app/src/main/AndroidManifest.xml');
expect(manifest.includes('android.permission.BLUETOOTH_SCAN'),'BLE scan manifest permission missing');
expect(!manifest.includes('usesPermissionFlags="neverForLocation"'),'BLE scan must not filter devices with neverForLocation');
expect(main.includes('ble_location_disabled'),'BLE Location/GPS disabled result missing');

const bleScanner=read('app/src/main/java/com/lightingai/app/BleDeviceScanner.java');
expect(bleScanner.includes('SCAN_MODE_LOW_LATENCY'),'Manual BLE scan must use low-latency mode');
expect(bleScanner.includes('ble_scan_failed_'),'BLE scan failure code propagation missing');

const bleUi=read('app/src/main/assets/ble-control.js');
expect(bleUi.includes("version:'0.3-ble-readonly-gatt'"),'Read-only BLE GATT inspection UI missing');
expect(bleUi.includes('bleInspectGatt')&&bleUi.includes('LightingAIBleGattInspectionResult'),'BLE GATT inspection bridge missing');
expect(bleUi.includes('00001827-0000-1000-8000-00805f9b34fb'),'Bluetooth Mesh provisioning service detection missing');
expect(bleUi.includes('00001828-0000-1000-8000-00805f9b34fb'),'Bluetooth Mesh proxy service detection missing');
expect(bleUi.includes('0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65'),'Astera private GATT research service detection missing');
expect(bleUi.includes("version:'0.4-ble-mesh-diagnostics'"),'BLE mesh diagnostic UI version missing');
const bleGatt=read('app/src/main/java/com/lightingai/app/BleGattInspector.java');
expect(bleGatt.includes('discoverServices()'),'BLE GATT service discovery missing');
expect(!bleGatt.includes('writeCharacteristic')&&!bleGatt.includes('writeDescriptor')&&!bleGatt.includes('setCharacteristicNotification'),'Read-only BLE GATT inspector must not write or subscribe');
expect(bleGatt.includes('connectGatt')&&bleGatt.includes('closeGattLocked'),'BLE GATT lifecycle close missing');
expect(bleUi.includes('scanCooldownUntil')&&bleUi.includes('scanActive'),'BLE scan spam guard missing');
expect(bleUi.includes('ble_scan_failed_6')&&bleUi.includes('tooFrequent'),'BLE frequent-scan error handling missing');
expect(!main.includes("file:///android_asset/control-system-drivers.js"),'MainActivity must not directly race-load control driver assets');

const bootstrap=read('app/src/main/assets/control-bootstrap.js');
const order=['dmx-patch-planner.js','dmx-export.js','control-system-drivers.js','control-routing.js','artnet-control.js','ble-control.js','control-dashboard.js','ai-control-bridge.js'];
let last=-1;
for(const name of order){
 const next=bootstrap.indexOf(name);
 expect(next>last,'Control bootstrap order invalid at '+name);
 last=next;
}
expect(bootstrap.includes('await loadOne(item)'),'Control bootstrap must await each dependency');

const backup=read('app/src/main/assets/project-backup-export.js');
for(const marker of ['LightingAIProjectBackupSnapshot','LightingAIProjectBackupImport',"if(!/^lighting_/i.test(k)","restoreAllowed(k,allowSun)"]){
 expect(backup.includes(marker),'Backup critical contract missing: '+marker);
}
expect(!/dmx|measure/i.test((backup.match(/const BLOCK=([^;]+)/)||[])[1]||''),'Backup deny-list must not block DMX or measurement planner data');

const measure=read('app/src/main/assets/scene-measure.js');
expect(measure.includes('LightingAISceneMeasureNativeResult'),'Scene measurement native result hook missing');

const sunBridge=read('app/src/main/assets/sun-native-bridge.js');
expect(sunBridge.includes('LightingAINativeSunLocation'),'SUNCE native location hook missing');

const patch=read('app/src/main/assets/dmx-patch-planner.js');
expect(patch.includes('invalid-universe')&&patch.includes('invalid-start')&&patch.includes('invalid-channels'),'DMX patch fail-closed validation missing');

const control=read('app/src/main/assets/artnet-control.js');
for(const marker of ['ARM OUTPUT','globalBlackout','restoreBeforeBlackout','fadeToScene','setLiveEnabled','armGeneration']){
 expect(control.includes(marker),'Control critical contract missing: '+marker);
}

console.log(JSON.stringify({ok:failures.length===0,failures},null,2));
if(failures.length)process.exit(1);
