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
expect(main.includes('artNetLiveEpoch')&&main.includes('sacnLiveEpoch'),'Native live epoch guards missing');
expect(main.includes('artNetDiscoveryEpoch')&&main.includes('if (epoch != artNetDiscoveryEpoch.get()) return;'),'Native Art-Net discovery must ignore stale sessions by epoch');
expect(main.includes('networkDmxSendEpoch')&&main.includes('networkDmxSendLock'),'Native direct-send epoch guard missing');
expect(main.includes('parseFullDmxFrame')&&main.includes('values.length() != 512')&&main.includes('raw instanceof Number')&&main.includes('value != Math.rint(value)'),'Native DMX bridge must reject short/coerced/malformed frames instead of normalizing them');
expect(main.includes('Stale Art-Net direct send ignored')&&main.includes('Stale sACN direct send ignored'),'Native stale direct-send rejection missing');
expect(main.includes('Stale Art-Net live update ignored')&&main.includes('Stale sACN live update ignored'),'Native stale live-update rejection missing');
const artNetLive=read('app/src/main/java/com/lightingai/app/ArtNetLiveEngine.java');
const sacnLive=read('app/src/main/java/com/lightingai/app/SacnLiveEngine.java');
expect(artNetLive.includes('stopAll();')&&artNetLive.includes('return;')&&artNetLive.includes('NetworkInterfaceInspector.signature()'),'Art-Net live engine must fail fast and recheck network route per frame');
expect(artNetLive.includes('if (frames.isEmpty()) lastError = "";'),'New Art-Net live session must clear stale prior error state');
expect(sacnLive.includes('if (frames.isEmpty()) lastError = "";'),'New sACN live session must clear stale prior error state');
expect(sacnLive.includes('abortAll();')&&sacnLive.includes('return;')&&sacnLive.includes('NetworkInterfaceInspector.signature()'),'sACN live engine must fail fast and recheck network route per frame');
expect(main.includes('synchronized (sacnLiveControlLock)')&&main.includes('requireNetworkDmxArmedRoute();'),'sACN live update must recheck network signature inside live lock');
expect(main.includes('synchronized (artNetLiveControlLock)')&&main.includes('requireNetworkDmxArmedRoute();'),'Art-Net live update must recheck network signature inside live lock');
expect(!artNetLive.includes('tickFailed')&&!artNetLive.includes('tickError'),'Art-Net live engine must not continue after a packet failure');
expect(!sacnLive.includes('tickFailed')&&!sacnLive.includes('tickError'),'sACN live engine must not continue after a packet failure');
expect(sacnLive.includes('terminationFailed')&&sacnLive.includes('terminationError'),'sACN termination failure aggregation missing');
expect(sacnLive.includes('public boolean stopAll()')&&sacnLive.includes('return lastError == null || lastError.isEmpty();'),'sACN live stop must report termination failure');
expect(main.includes('ok = sacnLiveEngine.stopAll();')&&main.includes('notifyArtNetResult(id, ok, message);'),'sACN live stop bridge must propagate termination failure');
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
expect(bleScanner.includes('scanEpoch')&&bleScanner.includes('thisScanEpoch')&&bleScanner.includes('callbackEpoch != scanEpoch'),'BLE scan callbacks must be isolated by scan epoch');
expect(bleScanner.includes('ble_scan_failed_'),'BLE scan failure code propagation missing');

const bleUi=read('app/src/main/assets/ble-control.js');
expect(bleUi.includes("version:'0.5-serialized-ble-diagnostics'"),'BLE Mesh/GATT diagnostic UI missing');
expect(bleUi.includes('bleInspectGatt')&&bleUi.includes('LightingAIBleGattInspectionResult'),'BLE GATT inspection bridge missing');
expect(bleUi.includes('00001827-0000-1000-8000-00805f9b34fb'),'Bluetooth Mesh provisioning service detection missing');
expect(bleUi.includes('00001828-0000-1000-8000-00805f9b34fb'),'Bluetooth Mesh proxy service detection missing');
expect(bleUi.includes('0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65'),'Astera private GATT research service detection missing');
expect(bleUi.includes("version:'0.5-serialized-ble-diagnostics'"),'Serialized BLE diagnostic UI version missing');
expect(bleUi.includes('gattActive')&&bleUi.includes('scanActive||gattActive'),'BLE scan/GATT serialization guard missing');
const bleGatt=read('app/src/main/java/com/lightingai/app/BleGattInspector.java');
expect(bleGatt.includes('discoverServices()'),'BLE GATT service discovery missing');
expect(!bleGatt.includes('writeCharacteristic')&&!bleGatt.includes('writeDescriptor')&&!bleGatt.includes('setCharacteristicNotification'),'Read-only BLE GATT inspector must not write or subscribe');
expect(bleGatt.includes('connectGatt')&&bleGatt.includes('closeGattOnlyLocked'),'BLE GATT lifecycle close missing');
expect(bleGatt.includes('MAX_ATTEMPTS = 3')&&bleGatt.includes('retryOrFailLocked'),'BLE GATT retry protection missing');
expect(bleGatt.includes('inspectionEpoch')&&bleGatt.includes('thisInspectionEpoch')&&bleGatt.includes('retryEpoch != inspectionEpoch'),'BLE GATT timeout/retry callbacks must be isolated by inspection epoch');
expect(bleGatt.includes('PROPERTY_READ')&&bleGatt.includes('readCharacteristic'),'BLE GATT read-only snapshot missing');
expect(!bleGatt.includes('createBond'),'BLE GATT diagnostics must not use Android bonding');
expect(bleUi.includes('scanCooldownUntil')&&bleUi.includes('scanActive'),'BLE scan spam guard missing');
expect(bleUi.includes("activeScanRequestId")&&bleUi.includes("activeGattRequestId")&&bleUi.includes("String(id||'')!==activeScanRequestId")&&bleUi.includes("String(id||'')!==activeGattRequestId"),'BLE UI must ignore stale discovery/GATT callbacks by request id');
expect(bleUi.includes('ble_scan_failed_6')&&bleUi.includes('tooFrequent'),'BLE frequent-scan error handling missing');
expect(main.includes('@Override protected void onPause()')&&main.includes('@Override protected void onDestroy()')&&main.includes('pendingBleDiscoveryRequestId = null;'),'Pending BLE permission scan must be invalidated on pause/destroy');
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
expect(read('app/src/main/assets/dmx-export.js').includes("if(u==null||u<1||u>999)flags[key].push('invalid-universe');"),'DMX snapshot must reject universes outside planner range');
expect(patch.includes("const u=integerOrNull(r&&r.universe),start=integerOrNull(r&&r.start),count=integerOrNull(r&&r.channels);")&&patch.includes("if(u==null||u<1||u>999||start==null||start<1||start>512||count==null||count<=0||count>512||start+count-1>512)return;"),'Free-slot search must ignore invalid patch rows instead of normalizing them');

const control=read('app/src/main/assets/artnet-control.js');
expect(control.includes('activeDiscoveryRequestId')&&control.includes("String(id||'')!==activeDiscoveryRequestId"),'Art-Net discovery must ignore stale callbacks by request id');
expect(control.includes('controlContextSignature')&&control.includes('contextStorageKey'),'Project-scoped control storage missing');
expect(control.includes('legacyContextStorageKey')&&control.includes('::ctxv2_')&&control.includes('item.contextSignature===signature'),'Control storage must verify the exact project/scene context and migrate legacy hashed keys safely');
expect(control.includes("version:'0.53-artnet-route-fail-closed'"),'Known-frame-required control version missing');
expect(control.includes('armedPatchSignature')&&control.includes('patchSignature()!==armedPatchSignature'),'ARM patch signature guard missing');
expect(control.includes("function artNetTargetIsAuto(value)")&&control.includes("target==='255.255.255.255'")&&control.includes("const auto=artNetTargetIsAuto(target);")&&control.includes("const ip=artNetTargetIsAuto(rawTarget)?'AUTO':rawTarget;"),'Art-Net preflight and sender must use identical AUTO target semantics');
expect(control.includes('u!=null&&u>=1&&u<=999')&&control.includes('start+channels-1<=512'),'Control layer must independently revalidate patch universe/start/footprint');
expect(control.includes('fadePatchSignature!==patchSignature()'),'Fade patch-change abort guard missing');
expect(control.includes('armedContextSignature')&&control.includes('controlContextSignature()!==armedContextSignature'),'ARM project/scene context guard missing');
expect(control.includes("const id='networkdmx_stop_g'+armGeneration")&&control.includes('armGeneration++;'),'LIVE callback generation isolation missing');
expect(control.includes("if(!armedNetworkSignature||typeof transport.setArmSignature!=='function'||!transport.setArmSignature(armedNetworkSignature))"),'LIVE transition must invalidate stale native direct-send epochs');
expect(control.includes('frames[String(u)]=staged'),'Transactional single-write frame commit missing');
expect(control.includes("const u=validUniverseForProtocol(Number(r.universe),selectedProtocol());")&&control.includes("if(u==null||!bridgeUniverseAllowed(u,selectedProtocol())"),'AI staged apply must fail closed on invalid universe/bridge route');
expect(control.includes("const current=frames[String(u)];")&&control.includes("if(!Array.isArray(current)){status(t().frameUnknown,false);return false}")&&control.includes("if(!sendFrame(target.slice(),u)){setOutputArmed(false,true);status(t().error,false);return false}")&&control.includes("frames[String(u)]=target;"),'AI staged apply must require a known universe baseline and commit only after accepted send');
expect(control.includes('stagedFrameForUniverse')&&control.includes('commitStagedUniverseFrames'),'Transactional MASTER frame staging missing');
expect(control.includes("if(!Array.isArray(known))return null;"),'MASTER partial writes must reject unknown universe baseline');
expect(control.includes("if(!Array.isArray(current)){status(t().frameUnknown,false);return}")&&control.includes("if(!Array.isArray(current)){status(t().frameUnknown,false);return false}"),'Single/verified/AI partial writes must reject unknown universe baseline');
expect(control.includes("if(universes.some(u=>!Array.isArray(frames[u]))){status(t().frameUnknown,false);return false}"),'Scene fade must require known start frame for every universe');
expect(control.includes('if(!accepted){setOutputArmed(false,true);status(t().error,false);return}'),'Transactional blackout failure disarm missing');
expect(control.includes('const restoreIsExact=universes.every(u=>Array.isArray(frames[String(u)]));')&&control.includes('panicDoneNoRestore'),'Global blackout restore must require exact known prior state for every universe');
expect(control.includes('function applyScene(index)')&&control.includes('if(!accepted){')&&control.includes('setOutputArmed(false,true);')&&control.includes('return false;'),'Transactional scene failure disarm missing');
expect(control.includes('function sceneUniverseSetIsSafe(values)')&&control.includes('if(!sceneUniverseSetIsSafe(Array.from(universeSet)))')&&control.includes('if(!sceneUniverseSetIsSafe(sceneUniverses))'),'Scene/fade must preflight every universe before any multi-universe send');
expect(control.includes("source.length!==512")&&control.includes("!Number.isInteger(value)||value<0||value>255")&&control.includes("if(!next){setOutputArmed(false,true);status(t().error,false);return false}"),'Imported CONTROL scenes must reject malformed or incomplete 512-channel frames');
expect(control.includes("typeof value!=='number'||!Number.isInteger(value)||value<0||value>255"),'Imported CONTROL scene frame values must already be numeric integers and must not rely on JS coercion');
expect(control.includes("if(!/^\\d+$/.test(u))return null;")&&control.includes("String(universe)!==u"),'Imported CONTROL scenes must reject noncanonical universe keys');
expect(control.includes('function bridgeUniverseSetAllowed(values,protocol)')&&control.includes('function operationUniverseSetIsSafe(values,protocolOverride)'),'Bridge universe-set validation helper missing');
expect(!control.includes("else if(Number.isFinite(limit)&&limit>0&&universes.length>limit)failure=t().preflightBridgeMulti"),'ARM preflight must not treat all patched universes as simultaneously active');
expect(control.includes('if(!operationUniverseSetIsSafe(keys))')&&control.includes('if(!operationUniverseSetIsSafe(universes))'),'Operation-time multi-universe limits must remain fail-closed');
expect(control.includes('if(!operationUniverseSetIsSafe(keys))')&&control.includes('if(!operationUniverseSetIsSafe(universes))'),'Multi-universe operations must preflight their complete universe set');
expect(control.includes('if(u==null||!bridgeUniverseAllowed(u,protocol))'),'Single-frame send must validate its own universe without treating cached history as active output');
expect(control.includes("id:'aputure-sidus-four'")&&control.includes('artNetUniverseMax:32767')&&control.includes('sacnUniverseMax:63999')&&control.includes('maxActiveUniverses:4'),'Sidus Four verified bridge model missing protocol-specific limits/capacity');
expect(control.includes('protocolSwitchRequiresReset:true')&&control.includes('avoidMixedProtocolsOnUnmanagedNetwork:true')&&control.includes('protocolNote'),'Sidus protocol-switch safety metadata/UI missing');
expect(control.includes("id:'astera-fp3-datalink'")&&control.includes('maxActiveUniverses:1'),'Astera FP3 DataLink must remain a one-universe network gateway');
expect(control.includes("id:'astera-fp1-powerbox'")&&control.includes("id:'astera-pwb-2-86'"),'Astera PowerBox bridge profiles missing');
expect(control.includes("id:'astera-fp1-powerbox'")&&control.includes('artNetUniverseMax:32767')&&control.includes('sacnUniverseMax:63999'),'Astera FP1 PowerBox protocol universe bounds missing');
expect(control.includes("id:'astera-pwb-2-86'")&&control.includes('artNetUniverseMax:32767')&&control.includes('sacnUniverseMax:63999'),'Astera PWB-2-86 protocol universe bounds missing');
expect(control.includes("id:'astera-fp3-datalink'")&&control.includes('artNetUniverseMax:32767')&&control.includes('sacnUniverseMax:63999'),'Astera FP3 protocol universe bounds missing');
expect(control.includes("id:'astera-fp3-datalink'")&&control.includes("artNetPortAddressOffset:0"),'Astera FP3 Art-Net universe mapping must use Astera Universe ID semantics');
expect(control.includes('if(!accepted){cancelSceneFade(false);setOutputArmed(false,true);status(t().error,false);return}'),'Transactional fade failure disarm missing');
expect(control.includes('function forceLifecycleDisarm()')&&control.includes('cancelSceneFade(false);'),'Lifecycle disarm must cancel the active scene fade timer');
expect(control.includes('function forceLifecycleDisarm()')&&control.includes('invalidateCachedOutputState();'),'Lifecycle disarm must invalidate runtime DMX output state');
expect(control.includes('function invalidateCachedOutputState()')&&control.includes('Object.keys(frames).forEach(key=>delete frames[key]);')&&control.includes('invalidateCachedOutputState();')&&control.includes('setOutputArmed(false,true);'),'Async transport failure must invalidate cached DMX state before disarm');
expect(control.includes('function invalidateRouteBoundOutputState()')&&control.includes("version:'0.53-artnet-route-fail-closed'"),'Route changes must invalidate only route-bound runtime output state');
expect(control.includes("selectedBroadcastRoutes")&&control.includes("!auto&&interfaces.length>1&&selectedBroadcastRoutes.length!==1"),'Manual Art-Net targets must fail closed on ambiguous multi-interface routing unless an exact broadcast route is selected');
expect(control.includes('stagedFrameForUniverse')&&control.includes('commitStagedUniverseFrames'),'Transactional MASTER frame staging missing');
for(const marker of ['ARM OUTPUT','globalBlackout','restoreBeforeBlackout','fadeToScene','setLiveEnabled','armGeneration']){
 expect(control.includes(marker),'Control critical contract missing: '+marker);
}

console.log(JSON.stringify({ok:failures.length===0,failures},null,2));
if(failures.length)process.exit(1);
