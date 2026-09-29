import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const dashboard=fs.readFileSync(path.join(root,'app/src/main/assets/control-dashboard.js'),'utf8');
const bootstrap=fs.readFileSync(path.join(root,'app/src/main/assets/control-bootstrap.js'),'utf8');
const ble=fs.readFileSync(path.join(root,'app/src/main/assets/ble-control.js'),'utf8');
const gatt=fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/BleGattInspector.java'),'utf8');
const mainActivity=fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/MainActivity.java'),'utf8');

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

for(const marker of [
  'controlOpenBluetooth',
  "version:'0.20-bluetooth-only-control'",
  "window.LightingAIControlBootstrapMode='bluetooth-only'",
  "version:'0.17-astera-event-timeline'"
]) expect(dashboard.includes(marker)||bootstrap.includes(marker)||ble.includes(marker),'Bluetooth-only CONTROL marker missing: '+marker);

expect(dashboard.includes('PRONAĐI I POVEŽI RASVETU')&&dashboard.includes('DISCOVER & CONNECT FIXTURES'),'Primary CONTROL CTA must be direct Bluetooth discovery');
expect(dashboard.includes('Bluetooth je glavni i direktni put')&&dashboard.includes('Bluetooth is the primary direct path'),'Primary CONTROL copy must be Bluetooth-only');
expect(!dashboard.includes('controlLoadAdvanced')&&!dashboard.includes('DMX')&&!dashboard.includes('Art-Net')&&!dashboard.includes('sACN'),'Primary CONTROL dashboard must not expose network/DMX controls');
expect(!bootstrap.includes('artnet-control.js')&&!bootstrap.includes('dmx-patch-planner.js')&&!bootstrap.includes('dmx-export.js'),'CONTROL bootstrap must not load network/DMX assets');
expect(bootstrap.includes("window.LightingAIControlBootstrapMode='bluetooth-only'"),'CONTROL bootstrap mode must be bluetooth-only');
expect(bootstrap.indexOf('control-system-drivers.js')<bootstrap.indexOf('ble-control.js'),'Vendor driver registry must load before Bluetooth UI');
expect(bootstrap.indexOf('ble-control.js')<bootstrap.indexOf('control-dashboard.js'),'Bluetooth UI must load before dashboard');
expect(ble.includes('renderQuickControlShell')&&ble.includes("'DIM'")&&ble.includes("'CCT'")&&ble.includes("'FX'"),'Fast Bluetooth control surface missing');
expect(ble.includes('vendorForDevice')&&ble.includes('signalLabel')&&ble.includes('POVEŽI ASTERA'),'Fast Bluetooth fixture discovery UI missing');
expect(ble.includes("ASTERA_BTB_PRIVATE_SERVICE='0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65'")&&ble.includes('transport fingerprint only'),'Astera BTB private LE fingerprint must remain passive diagnostic evidence only');
expect(ble.includes('PASIVNO ASTERA BTB PRAĆENJE')&&ble.includes('PASSIVE ASTERA BTB OBSERVATION'),'Astera passive observation UI missing');
expect(gatt.includes('inspectAstera(')&&gatt.includes('CCCD_UUID')&&gatt.includes('proprietaryCharacteristicWrites')&&gatt.includes('notificationValues'),'Astera passive GATT observer missing');
expect(gatt.includes('eventTimeline')&&gatt.includes('connection_state')&&gatt.includes('services_discovered')&&gatt.includes('cccd_write_result')&&gatt.includes('notification'),'Astera passive GATT timeline missing');
expect(mainActivity.includes('bleGattInspector.inspectAstera(target'),'Astera bridge must use the passive Astera GATT observer');
expect(!ble.includes('setTimeout(()=>inspectAsteraClassic(address),250)'),'Primary Astera connect flow must not auto-route through Classic/SDP');
expect(!gatt.includes('writeCharacteristic('),'Astera diagnostic observer must not send proprietary characteristic writes');
expect(ble.includes('LightingAI-Astera-BTB-diagnostic')&&ble.includes('SAČUVAJ DIJAGNOSTIKU')&&ble.includes('Android.saveText(filename,body)'),'Astera diagnostic export to Downloads missing');
expect(ble.includes('latestScanDevicesByAddress')&&ble.includes('advertisement:address&&latestScanDevicesByAddress[address]'),'Astera diagnostic export must include the matching BLE advertisement snapshot');

console.log(JSON.stringify({ok:failures.length===0,controlPrimary:'bluetooth-only',failures},null,2));
if(failures.length)process.exit(1);
