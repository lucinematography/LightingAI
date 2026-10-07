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
const scanner=fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/BleDeviceScanner.java'),'utf8');
const bondManager=fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/AsteraBtbBondManager.java'),'utf8');

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

for(const marker of [
  'controlOpenBluetooth',
  "version:'0.30-vendor-wireless-control'",
  "window.LightingAIControlBootstrapMode='vendor-wireless'",
  "version:'0.30-astera-firmware-observations'"
]) expect(dashboard.includes(marker)||bootstrap.includes(marker)||ble.includes(marker),'Vendor-wireless CONTROL marker missing: '+marker);

expect(dashboard.includes('PRONAĐI BLUETOOTH / BLE RASVETU')&&dashboard.includes('DISCOVER BLUETOOTH / BLE FIXTURES'),'Primary CONTROL CTA must expose real BLE discovery');
expect(dashboard.includes('Bluetooth/BLE i direktni vendor Wi-Fi')&&dashboard.includes('Bluetooth/BLE and direct vendor Wi-Fi'),'Primary CONTROL copy must describe Bluetooth + direct vendor Wi-Fi');
expect(dashboard.includes('Wi-Fi se ne skenira generički')&&dashboard.includes('Wi-Fi kontrola ostaje zaključana')&&dashboard.includes('Wi-Fi is not scanned generically')&&dashboard.includes('Wi-Fi control stays locked'),'Wi-Fi discovery safety copy must state that unverified vendor Wi-Fi remains locked');
expect(dashboard.includes('BLUETOOTH / BLE')&&dashboard.includes('WI-FI'),'Transport status badges missing');
expect(dashboard.includes('SVI PRIKAZANI TRANSPORTI POTVRĐENI')&&dashboard.includes('ALL LISTED TRANSPORTS VERIFIED'),'Dashboard must distinguish fully verified transport coverage');
expect(dashboard.includes('DEO TRANSPORTA POTVRĐEN')&&dashboard.includes('PARTIAL TRANSPORT VERIFICATION'),'Dashboard must distinguish partial transport verification');
expect(!dashboard.includes('controlLoadAdvanced')&&!dashboard.includes('DMX')&&!dashboard.includes('Art-Net')&&!dashboard.includes('sACN'),'Primary CONTROL dashboard must not expose Art-Net/sACN/DMX controls');
expect(!bootstrap.includes('artnet-control.js')&&!bootstrap.includes('dmx-patch-planner.js')&&!bootstrap.includes('dmx-export.js'),'CONTROL bootstrap must not load network/DMX assets');
expect(bootstrap.includes("window.LightingAIControlBootstrapMode='vendor-wireless'"),'CONTROL bootstrap mode must be vendor-wireless');
expect(bootstrap.indexOf('control-system-drivers.js')<bootstrap.indexOf('ble-control.js'),'Vendor driver registry must load before Bluetooth UI');
expect(bootstrap.indexOf('ble-control.js')<bootstrap.indexOf('control-dashboard.js'),'Bluetooth UI must load before dashboard');
expect(ble.includes('renderQuickControlShell')&&ble.includes("'DIM'")&&ble.includes("'CCT'")&&ble.includes("'FX'"),'Fast Bluetooth control surface missing');
expect(ble.includes('vendorForDevice')&&ble.includes('signalLabel')&&ble.includes('POVEŽI ASTERA'),'Fast Bluetooth fixture discovery UI missing');
expect(ble.includes("ASTERA_BTB_PRIVATE_SERVICE='0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65'")&&ble.includes('transport fingerprint only'),'Astera BTB private LE fingerprint must remain passive diagnostic evidence only');
expect(ble.includes('PASIVNO ASTERA BTB PRAĆENJE')&&ble.includes('PASSIVE ASTERA BTB OBSERVATION'),'Astera passive observation UI missing');
expect(gatt.includes('inspectAstera(')&&gatt.includes('CCCD_UUID')&&gatt.includes('proprietaryCharacteristicWrites')&&gatt.includes('notificationValues'),'Astera passive GATT observer missing');
expect(gatt.includes('eventTimeline')&&gatt.includes('connection_state')&&gatt.includes('services_discovered')&&gatt.includes('cccd_write_result')&&gatt.includes('notification'),'Astera passive GATT timeline missing');
expect(gatt.includes('inspection_error')&&gatt.includes('failureCode')&&gatt.includes('onError(JSONObject result, String code)'),'Astera GATT failures must preserve structured diagnostics');
expect(gatt.includes('deepCopyJson(')&&gatt.includes('JSONObject snapshot'),'BLE diagnostic arrays must be snapshotted before native cleanup');
expect(gatt.includes('attemptHistory')&&gatt.includes('appendAttemptSnapshot(code)'),'Astera GATT retries must preserve per-attempt diagnostics');
expect(gatt.includes('isAuthenticationStatus')&&gatt.includes('status == 5 || status == 15')&&gatt.includes('astera_bond_required'),'Astera must map only standard GATT auth/encryption failures to bonding');
expect(gatt.includes('ble_gatt_service_discovery_status_')&&gatt.includes('appendAttemptSnapshot("astera_bond_required")'),'Astera auth failure during service discovery must route to bonding instead of blind retry');
expect(ble.includes("error==='astera_bond_required'")&&ble.includes('ble-astera-bond')&&ble.includes('bondAstera(address,bondButton)'),'Astera bonding action must appear only after standardized auth failure');
expect(ble.includes('drži POWER oko 3 s dok ne blinka plavo')&&ble.includes('Hold POWER on the light for about 3 s until it flashes blue'),'Astera bonding UI must include the official BlueMode preflight instruction');
expect(ble.includes('pre_5_14_61_bonding_memory')&&ble.includes('5_12_67_app_connection_bug')&&ble.includes('5_15_14_btb_led_lag'),'Astera diagnostics must expose documented firmware compatibility observations');
expect(ble.includes('firmwareObservations:firmwareObservations'),'Astera exported diagnostics must include firmware observations');
expect(bondManager.includes('eventTimeline')&&bondManager.includes('pairing_request')&&bondManager.includes('bond_state')&&bondManager.includes('create_bond')&&bondManager.includes('bond_error'),'Astera Android bonding must preserve a structured event timeline');
expect(bondManager.includes('onError(JSONObject result, String code)'),'Astera bonding failures must return structured diagnostics');
expect(ble.includes('LightingAI-Astera-BTB-bond-diagnostic')&&ble.includes('Bonding timeline captured'),'Astera bonding failure timeline must be exportable');
expect(ble.includes('Android Bluetooth bonding je uspeo. Astera session / Radio PIN još nisu verifikovani.')&&ble.includes('Android Bluetooth bonding succeeded. The Astera session / Radio PIN is still unverified.'),'Astera UI must not equate Android bonding with an authenticated Astera session');
expect(ble.includes('preserveBond=!!(bondActive&&activeBondRequestId)')&&ble.includes('btn.disabled=preserveBond'),'System pairing UI lifecycle must preserve active Astera bonding state');
expect(ble.includes('blePagePaused')&&ble.includes('pendingAsteraGattAfterResume')&&ble.includes('LightingAIBleLifecycleResume=function()'),'Post-bond Astera GATT must wait for Activity resume when system pairing UI pauses the app');
expect(gatt.includes('remote_user_terminated_connection')&&gatt.includes('android_gatt_error_0x85')&&gatt.includes('status == 19')&&gatt.includes('status == 133'),'Titan GATT 19/133 outcomes must be classified explicitly');
expect(gatt.includes('delay = 1800L')&&gatt.includes('delay = 2200L')&&gatt.includes('retry_scheduled'),'Titan GATT 19/133 retries must use controlled backoff');
expect(gatt.includes('connect_target')&&gatt.includes('bondState')&&gatt.includes('deviceName'),'Every Astera GATT attempt must record target bond state before connection');
expect(gatt.includes('DEVICE_INFORMATION_SERVICE')&&gatt.includes('standardDeviceInformationReadEnabled'),'Astera diagnostics must read only the standard Device Information service in addition to the verified BTB service');
expect(gatt.includes('DIS_FIRMWARE_REVISION')&&gatt.includes('DIS_HARDWARE_REVISION')&&gatt.includes('DIS_MANUFACTURER_NAME')&&gatt.includes('deviceInformation'),'Astera diagnostics must decode standard Device Information fields');
expect(ble.includes('STANDARD DEVICE INFORMATION')&&ble.includes('firmwareRevision')&&ble.includes('hardwareRevision'),'Astera diagnostic UI must show decoded standard device information');
expect(gatt.includes('astera_btb_private_service_missing')&&gatt.includes('astera_service_missing'),'Astera diagnostics must flag a missing previously observed BTB private service');
expect(!mainActivity.includes('if (asteraBtbBondManager != null) asteraBtbBondManager.cancel();\n        if (asteraBtbClassicInspector != null) asteraBtbClassicInspector.cancel();\n        super.onPause();'),'MainActivity onPause must not cancel an active Astera bond during system pairing UI');
expect(gatt.includes('passiveNotifyServiceUuid.isEmpty() ||')&&gatt.includes('passiveServiceMatch'),'Astera passive observer must restrict characteristic READs to the verified BTB service');
expect(mainActivity.includes('bleGattInspector.inspectAstera(target'),'Astera bridge must use the passive Astera GATT observer');
expect(!ble.includes('setTimeout(()=>inspectAsteraClassic(address),250)'),'Primary Astera connect flow must not auto-route through Classic/SDP');
expect(!gatt.includes('writeCharacteristic('),'Astera diagnostic observer must not send proprietary characteristic writes');
expect(!mainActivity.includes('writeCharacteristic('),'Android bridge must not expose a proprietary GATT characteristic write path before physical proof');
expect((gatt.match(/writeDescriptor\s*\(/g)||[]).length===1,'Astera passive observer must have exactly one descriptor write path');
expect(gatt.includes('gatt.writeDescriptor(cccd)'),'The only Astera descriptor write must be the standard CCCD subscription');
expect(ble.includes("type=\"button\" disabled")&&ble.includes("WAITING FOR VERIFIED DRIVER"),'Quick Bluetooth controls must remain disabled until a vendor driver is physically verified');
expect(ble.includes('LightingAI-Astera-BTB-diagnostic')&&ble.includes('SAČUVAJ DIJAGNOSTIKU')&&ble.includes('Android.saveText(filename,body)'),'Astera diagnostic export to Downloads missing');
expect(ble.includes("failed:true")&&ble.includes('Failure timeline captured'),'Failed Astera GATT sessions must remain exportable');
expect(ble.includes('latestScanDevicesByAddress')&&ble.includes('advertisement:address&&latestScanDevicesByAddress[address]'),'Astera diagnostic export must include the matching BLE advertisement snapshot');
expect(ble.includes('helios|hyperion|hydra|nyx|pixelbrick|ax[0-9]|quik|luna|pluto|leo'),'Astera family detection must not be limited to Titan only');
expect(scanner.includes('MAX_ADVERTISEMENT_SNAPSHOTS')&&scanner.includes('advertisements')&&scanner.includes('sightings')&&scanner.includes('appendAdvertisementSnapshot'),'BLE scanner must preserve multiple distinct advertisement snapshots per device');
expect(scanner.includes('manufacturerData')&&scanner.includes('serviceData')&&scanner.includes('rawAdvertisementHex'),'BLE advertisement snapshots must preserve raw, manufacturer and service data');

console.log(JSON.stringify({ok:failures.length===0,controlPrimary:'vendor-wireless-bluetooth-wifi',failures},null,2));
if(failures.length)process.exit(1);
