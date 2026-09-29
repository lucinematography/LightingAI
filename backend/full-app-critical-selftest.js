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
const artNetDiscovery=read('app/src/main/java/com/lightingai/app/ArtNetDiscovery.java');
const artNetSender=read('app/src/main/java/com/lightingai/app/ArtNetSender.java');
const artNetSocketManager=read('app/src/main/java/com/lightingai/app/ArtNetSocketManager.java');
const artNetSequenceTracker=read('app/src/main/java/com/lightingai/app/ArtNetSequenceTracker.java');
const sacnSender=read('app/src/main/java/com/lightingai/app/SacnSender.java');
const sacnLive=read('app/src/main/java/com/lightingai/app/SacnLiveEngine.java');
const networkInspector=read('app/src/main/java/com/lightingai/app/NetworkInterfaceInspector.java');
const sacnSequenceTracker=read('app/src/main/java/com/lightingai/app/SacnSequenceTracker.java');
expect(artNetLive.includes('stopAll();')&&artNetLive.includes('return;')&&artNetLive.includes('NetworkInterfaceInspector.signature()'),'Art-Net live engine must fail fast and recheck network route per frame');
expect(artNetLive.includes('if (frames.isEmpty()) lastError = "";'),'New Art-Net live session must clear stale prior error state');
expect(sacnLive.includes('if (frames.isEmpty()) lastError = "";'),'New sACN live session must clear stale prior error state');
expect(sacnLive.includes('abortAll();')&&sacnLive.includes('return;')&&sacnLive.includes('NetworkInterfaceInspector.sacnSignature(ipMode)'),'sACN live engine must fail fast and recheck the selected IPv4/IPv6/Dual route per frame');
expect(artNetLive.includes('ArtNetSender.validateFullFrame(channels);')&&artNetLive.includes('Arrays.copyOf(channels, 512)'),'Art-Net live engine must reject malformed frames before mutating live state');
expect(sacnLive.includes('SacnSender.validateFullFrame(channels);')&&sacnLive.includes('Arrays.copyOf(channels, 512)'),'sACN live engine must reject malformed frames before mutating live state');
expect(sacnLive.includes('terminationRouteSafe')&&sacnLive.includes('Network changed; sACN termination suppressed'),'sACN stream termination must be suppressed after a network-route change');
expect(sacnSequenceTracker.includes('ConcurrentHashMap<Integer, AtomicInteger>')&&sacnSequenceTracker.includes('computeIfAbsent(u')&&sacnLive.includes('nextSequence(frame.universe)')&&main.includes('sacnSequenceTracker.next(u)')&&main.includes('new SacnLiveEngine(sacnCid, "LightingAI", sacnSequenceTracker)'),'sACN sequence numbers must be maintained independently per universe and shared across direct/live sends');
expect(networkInspector.includes('requireSingleMulticastIpv4Interface')&&networkInspector.includes('multicastIpv4InterfaceCount')&&main.includes('multicastInterfaceCount'),'Native sACN preflight must expose the exact safe multicast interface count');
expect(networkInspector.includes('multicastIpv6Interfaces')&&networkInspector.includes('dualStackMulticastInterfaces')&&networkInspector.includes('sacnSignature(String mode)'),'Native sACN routing must distinguish IPv4, IPv6 and dual-stack multicast routes');
expect(sacnSender.includes('multicastAddressIpv6')&&sacnSender.includes('"ff18::83:0:%x:%x"')&&sacnSender.includes('multicastAddresses(int universe, String mode)'),'sACN sender must implement the E1.31 IPv6 multicast universe mapping');
expect(sacnSender.includes('universe == DISCOVERY_UNIVERSE ? DISCOVERY_UNIVERSE : validateUniverse(universe)'),'IPv6 Universe Discovery must use reserved universe 64214 without widening the normal 1-63999 DMX universe range');
expect(sacnLive.includes('setIpMode(String mode)')&&sacnLive.includes('NetworkInterfaceInspector.sacnSignature(ipMode)')&&sacnLive.includes('SacnSender.openMulticastSocket(ipMode)'),'sACN live/keepalive must bind and validate the selected IPv4/IPv6/dual transport');
expect(main.includes('sacnSetIpMode')&&main.includes('sacnNetworkSignature')&&main.includes('SacnSender.sendDmx(u, channels, seq, sacnCid, "LightingAI", sacnPriority.get(), sacnIpMode)'),'Android bridge must expose and apply the selected sACN IP transport');
expect(main.includes('sacnLiveEngine.setIpMode(normalized);\n            sacnIpMode = normalized;'),'sACN bridge must commit its global IP mode only after the live engine accepts the transport change');
expect(main.includes('"sacn:" + sacnSignature')&&main.includes('expected.startsWith("sacn:")'),'sACN ARM signatures must be protocol-qualified before native fail-closed route comparison');
expect(sacnSender.includes('openMulticastSocket(String mode)')&&sacnSender.includes('requireSingleSacnMulticastInterface(mode)')&&sacnSender.includes('socket.setNetworkInterface(route)')&&sacnLive.includes('SacnSender.openMulticastSocket(ipMode)'),'sACN direct/live output must explicitly bind multicast to the single approved interface for the selected IP mode');
expect(sacnSender.includes('DISCOVERY_UNIVERSE = 64214')&&sacnSender.includes('DISCOVERY_MULTICAST_ADDRESS = "239.255.250.214"')&&sacnSender.includes('buildUniverseDiscoveryPackets')&&sacnSender.includes('VECTOR_UNIVERSE_DISCOVERY_UNIVERSE_LIST')===false,'sACN Universe Discovery constants and packet builder must be present without relying on symbolic runtime constants');
expect(sacnSender.includes('writeInt(packet, 18, 0x00000008)')&&sacnSender.includes('writeInt(packet, 40, 0x00000002)')&&sacnSender.includes('writeInt(packet, 114, 0x00000001)'),'sACN Universe Discovery packet must use E1.31 extended/discovery/universe-list vectors');
expect(sacnLive.includes('DISCOVERY_PERIOD_MS = 10000L')&&sacnLive.includes('scheduleAtFixedRate(this::sendUniverseDiscovery, 0L, DISCOVERY_PERIOD_MS')&&sacnLive.includes('SacnSender.sendUniverseDiscovery(activeSocket, activeUniverses, cid, sourceName, ipMode)'),'Active sACN output must advertise its universe list every 10 seconds over the selected IP transport');
expect(artNetLive.includes('KEEPALIVE_PERIOD_MS = 900L')&&artNetLive.includes('LIVE_PERIOD_MS = 33L')&&artNetLive.includes('setKeepaliveFrame')&&artNetLive.includes('setKeepaliveRate'),'Art-Net must maintain standards keepalive while ARM is active and reserve 30 Hz for LIVE mode');
expect(artNetLive.includes('long initialDelay = liveRate ? 0L : KEEPALIVE_PERIOD_MS')&&sacnLive.includes('long initialDelay = liveRate ? 0L : KEEPALIVE_PERIOD_MS'),'Keepalive scheduling must wait one keepalive interval after the immediate data transmission');
expect(sacnLive.includes('KEEPALIVE_PERIOD_MS = 900L')&&sacnLive.includes('LIVE_PERIOD_MS = 33L')&&sacnLive.includes('setKeepaliveFrame')&&sacnLive.includes('setKeepaliveRate'),'sACN must maintain standards keepalive while ARM is active and reserve 30 Hz for LIVE mode');
expect(main.includes('artNetLiveEngine.setKeepaliveFrame(ip, u, channels)')&&main.includes('sacnLiveEngine.setKeepaliveFrame(u, channels)')&&main.includes('artNetSetKeepalive')&&main.includes('sacnSetKeepalive'),'Direct network DMX sends must enter native keepalive mode');
expect(main.includes('for (int repeat = 0; repeat < 3; repeat++)')&&main.includes('SacnSender.sendDmx(u, channels, seq, sacnCid, "LightingAI", sacnPriority.get(), sacnIpMode)'),'Changed sACN data must be transmitted three times over the selected IP transport before suppression to keepalive cadence');
expect(main.includes('synchronized (sacnLiveControlLock)')&&main.includes('requireNetworkDmxArmedRoute();'),'sACN live update must recheck network signature inside live lock');
expect(main.includes('synchronized (artNetLiveControlLock)')&&main.includes('requireNetworkDmxArmedRoute();'),'Art-Net live update must recheck network signature inside live lock');
expect(artNetDiscovery.includes('subscriptions')&&artNetDiscovery.includes('data[186 + i]')&&artNetDiscovery.includes('data[190 + i]'),'ArtPollReply ArtDmx subscriptions must include universes listed in either SwIn or SwOut');
expect(artNetDiscovery.includes('mergeNode(existing, node)')&&artNetDiscovery.includes('merged.addAll(incoming.subscriptions)'),'Multiple ArtPollReply packets from one IP must merge subscription universes instead of overwriting them');
expect(artNetDiscovery.includes('return directedBroadcastTargets();')&&!artNetDiscovery.includes('targets.add(InetAddress.getByName("255.255.255.255"))'),'ArtPoll discovery must use directed broadcast only and never limited broadcast');
expect(artNetDiscovery.includes('REPLY_MIN_LENGTH = 207'),'ArtPollReply parser must reject packets shorter than the current 207-byte minimum');
expect(artNetDiscovery.includes('incoming.getPort() != ArtNetSender.ARTNET_PORT'),'ArtPollReply discovery must reject packets not sourced from the Art-Net UDP port 6454');
expect(artNetDiscovery.includes('isUsableNodeIp(packetIp)')&&artNetDiscovery.includes('isUsableNodeIp(sourceIp)')&&artNetDiscovery.includes('if (ip.isEmpty()) return null'),'ArtPollReply node targets must fail closed unless packet or source IP is a usable unicast IPv4 address');
expect(main.includes('item.put("subscriptions", subscriptions)')&&main.includes('subscriptionDataPresent'),'Native Art-Net discovery must expose subscriber universe data to the control layer');
expect(artNetSender.includes('Art-Net AUTO must resolve to subscriber unicast targets')&&!artNetSender.includes('socket.setBroadcast(true)'),'Native ArtDmx sender must never use AUTO/broadcast for DMX data');
expect(artNetSocketManager.includes('created.bind(new InetSocketAddress(ArtNetSender.ARTNET_PORT))')&&artNetSocketManager.includes('created.setReuseAddress(true)')&&artNetSender.includes('ArtNetSocketManager.socket()')&&artNetLive.includes('ArtNetSocketManager.socket()')&&artNetDiscovery.includes('ArtNetSocketManager.socket()'),'Art-Net discovery/direct/live must share UDP source/destination port 6454 through one process socket');
expect(artNetSocketManager.includes('static void close()')&&(main.match(/ArtNetSocketManager\.close\(\);/g)||[]).length>=3,'Lifecycle transitions must release the shared Art-Net UDP 6454 socket');
expect(artNetSequenceTracker.includes('ConcurrentHashMap<String, AtomicInteger>')&&artNetLive.includes('sequenceTracker.next(frame.targetIp, frame.portAddress)')&&main.includes('artNetSequenceTracker.next(ip, u)')&&main.includes('new ArtNetLiveEngine(artNetSequenceTracker)'),'ArtDmx sequence must be independent per unicast target/Port-Address and shared across direct/live sends');
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
const dmxExport=read('app/src/main/assets/dmx-export.js');
expect(patch.includes('invalid-universe')&&patch.includes('invalid-start')&&patch.includes('invalid-channels'),'DMX patch fail-closed validation missing');
expect(dmxExport.includes("if(u==null||u<1||u>999)flags[key].push('invalid-universe');"),'DMX snapshot must reject universes outside planner range');
expect(patch.includes("function integerOrNull(value){return typeof value==='number'")&&dmxExport.includes("function integerOrNull(value){return typeof value==='number'"),'DMX planner/snapshot must reject numeric strings instead of coercing imported patch values');
expect(patch.includes("const u=integerOrNull(r&&r.universe),start=integerOrNull(r&&r.start),count=integerOrNull(r&&r.channels);")&&patch.includes("if(u==null||u<1||u>999||start==null||start<1||start>512||count==null||count<=0||count>512||start+count-1>512)return;"),'Free-slot search must ignore invalid patch rows instead of normalizing them');
expect(patch.includes("function autoPatch(){let u=1,a=1;state.rows.forEach(r=>{const c=integerOrNull(r&&r.channels);if(c==null||c<=0||c>512)return;"),'AUTO PATCH must ignore invalid/string footprint rows instead of coercing them');

const control=read('app/src/main/assets/artnet-control.js');
expect(networkInspector.includes('item.put("ipv6", stripIpv6Scope(address.getHostAddress()))')&&control.includes("ip=item.ipv4||item.ipv6||'—'"),'Network diagnostics must expose IPv6 addresses without changing Art-Net IPv4 routing semantics');
expect(control.includes('SACN_IP_MODE_KEY')&&control.includes('setSacnIpMode:function(mode)')&&control.includes("id=\"sacnIpMode\"")&&control.includes("value=\"dual\"")&&control.includes('native.sacnMulticastInterfaceCount'),'sACN UI must expose IPv4/IPv6/Dual selection and preflight the selected multicast route');
expect(!control.includes("else if(!interfaces.length)failure=t().preflightNoNetwork")&&control.includes("if(!interfaces.length){failure=t().preflightNoNetwork}"),'IPv6-only sACN must not be rejected by the Art-Net IPv4 interface guard');
expect(control.includes("version:'0.66-sacn-ipv6-dual'"),'sACN IPv6/Dual control version missing');
expect(control.includes('setKeepalive:function(request)')&&control.includes("networkdmx_keepalive_g")&&control.includes('(expectedLiveFrames>0&&(liveFrames===0||!!liveError))'),'LIVE off must downgrade to keepalive and health checks must monitor keepalive failures');
expect(control.includes("networkdmx_disarm_stop_g")&&control.includes("transport.stopLive({id:stopId,protocol:stopProtocol})")&&control.includes("liveEnabled=false"),'Every DISARM must stop native Art-Net/sACN output even when only keepalive mode is active');
expect(control.includes('pendingArmDiscoveryId')&&control.includes('activeArtNetRefreshDiscoveryId')&&control.includes("if(resultId!==activeDiscoveryRequestId)return")&&control.includes("Number(match[1])!==armGeneration||!outputArmed"),'Art-Net discovery must ignore stale manual, ARM and AUTO-refresh callbacks by their active request/generation guards');
expect(control.includes('controlContextSignature')&&control.includes('contextStorageKey'),'Project-scoped control storage missing');
expect(control.includes('legacyContextStorageKey')&&control.includes('::ctxv2_')&&control.includes('item.contextSignature===signature'),'Control storage must verify the exact project/scene context and migrate legacy hashed keys safely');
expect(control.includes("version:'0.66-sacn-ipv6-dual'"),'Known-frame-required control version missing');
expect(control.includes('armedPatchSignature')&&control.includes('patchSignature()!==armedPatchSignature'),'ARM patch signature guard missing');
expect(control.includes("function artNetTargetIsAuto(value)")&&control.includes("target==='255.255.255.255'")&&control.includes("const auto=artNetTargetIsAuto(target);")&&control.includes("const autoTarget=protocol==='artnet'&&artNetTargetIsAuto(rawTarget)")&&control.includes("targets=autoTarget?artNetTargetsForPortAddress(artNetPortAddress):[rawTarget]")&&artNetSender.includes('Art-Net AUTO must resolve to subscriber unicast targets before native send'),'Art-Net AUTO must use identical preflight semantics and resolve to subscriber unicast before native send');
expect(control.includes('u!=null&&u>=1&&u<=999')&&control.includes('start+channels-1<=512'),'Control layer must independently revalidate patch universe/start/footprint');
expect(control.includes("function rawPatchNumber(value){")&&control.includes("typeof value==='number'&&Number.isFinite(value)&&Number.isInteger(value)?value:null"),'Control layer must reject numeric strings in patch snapshots instead of coercing them');
expect(control.includes('function profileAddressMetadataIsSafe(profile)')&&control.includes("typeof channels!=='number'")&&control.includes("typeof ctrl.channel!=='number'"),'Verified profile address metadata must remain strict numeric data');
expect(control.includes("if(profileForRow(r)!==profile||!controlsInclude(profile,ctrl)")&&control.includes("!rows().some(row=>rowKey(row)===rowKey(r))"),'Every verified control send must revalidate current profile/control/Patch identity, not only enum controls');
expect(control.includes('fadePatchSignature!==patchSignature()'),'Fade patch-change abort guard missing');
expect(control.includes('armedContextSignature')&&control.includes('controlContextSignature()!==armedContextSignature'),'ARM project/scene context guard missing');
expect(control.includes("const id='networkdmx_stop_g'+armGeneration")&&control.includes('armGeneration++;'),'LIVE callback generation isolation missing');
expect(control.includes("if(!armedNetworkSignature||typeof transport.setArmSignature!=='function'||!transport.setArmSignature(armedNetworkSignature))"),'LIVE transition must invalidate stale native direct-send epochs');
expect(control.includes('frames[String(u)]=staged'),'Transactional single-write frame commit missing');
expect(control.includes("const u=validUniverseForProtocol(Number(r.universe),selectedProtocol());")&&control.includes("if(u==null||!bridgeUniverseAllowed(u,selectedProtocol())"),'AI staged apply must fail closed on invalid universe/bridge route');
expect(control.includes("const current=frames[String(u)];")&&control.includes("if(!isFullDmxFrame(current)){status(t().frameUnknown,false);return false}")&&control.includes("if(!sendFrame(target.slice(),u)){setOutputArmed(false,true);status(t().error,false);return false}")&&control.includes("frames[String(u)]=target;"),'AI staged apply must require a strict full known universe baseline and commit only after accepted send');
expect(control.includes('stagedFrameForUniverse')&&control.includes('commitStagedUniverseFrames'),'Transactional MASTER frame staging missing');
expect(control.includes("if(!isFullDmxFrame(known))return null;"),'MASTER partial writes must reject non-full known universe baseline');
expect(control.includes("if(!isFullDmxFrame(current)){status(t().frameUnknown,false);return}")&&control.includes("if(!isFullDmxFrame(current)){status(t().frameUnknown,false);return false}"),'Single/verified/AI partial writes must reject malformed or incomplete known universe baselines');
expect(control.includes("if(universes.some(u=>!isFullDmxFrame(frames[u]))){status(t().frameUnknown,false);return false}"),'Scene fade must require a strict full known start frame for every universe');
expect(!control.includes("next[u]||new Array(512).fill(0)"),'Scene fade must never invent a zero target for a universe missing from the scene');
expect(!control.includes("oldUniverses.filter(u=>!next[u])"),'Scene recall must not blackout universes the scene does not own');
expect(!control.includes('function frame(universe)'),'Legacy unknown-universe-to-zero frame helper must not exist');
expect(control.includes('const universes=Object.keys(next);')&&control.includes('const sceneUniverses=Object.keys(next),wasLive=liveEnabled;'),'Scene recall/fade must operate only on universes explicitly owned by the scene');
expect(control.includes('if(!accepted){setOutputArmed(false,true);status(t().error,false);return}'),'Transactional blackout failure disarm missing');
expect(control.includes('const restoreIsExact=universes.every(u=>isFullDmxFrame(frames[String(u)]));')&&control.includes('panicDoneNoRestore'),'Global blackout restore must require strict full known prior state for every universe');
expect(control.includes('function applyScene(index)')&&control.includes('if(!accepted){')&&control.includes('setOutputArmed(false,true);')&&control.includes('return false;'),'Transactional scene failure disarm missing');
expect(control.includes('function sceneUniverseSetIsSafe(values)')&&control.includes('if(!sceneUniverseSetIsSafe(universes))')&&control.includes('if(!sceneUniverseSetIsSafe(sceneUniverses))'),'Scene/fade must preflight every scene-owned universe before any multi-universe send');
expect(control.includes("source.length!==512")&&control.includes("!Number.isInteger(value)||value<0||value>255")&&control.includes("if(!next){setOutputArmed(false,true);status(t().error,false);return false}"),'Imported CONTROL scenes must reject malformed or incomplete 512-channel frames');
expect(control.includes("typeof value!=='number'||!Number.isInteger(value)||value<0||value>255"),'Imported CONTROL scene frame values must already be numeric integers and must not rely on JS coercion');
expect(control.includes("if(!/^\\d+$/.test(u))return null;")&&control.includes("String(universe)!==u"),'Imported CONTROL scenes must reject noncanonical universe keys');
expect(control.includes('function bridgeUniverseSetAllowed(values,protocol)')&&control.includes('function operationUniverseSetIsSafe(values,protocolOverride)'),'Bridge universe-set validation helper missing');
expect(!control.includes("else if(Number.isFinite(limit)&&limit>0&&universes.length>limit)failure=t().preflightBridgeMulti"),'ARM preflight must not treat all patched universes as simultaneously active');
expect(control.includes('if(!operationUniverseSetIsSafe(keys))')&&control.includes('if(!operationUniverseSetIsSafe(universes))'),'Operation-time multi-universe limits must remain fail-closed');
expect(control.includes('if(!operationUniverseSetIsSafe(keys))')&&control.includes('if(!operationUniverseSetIsSafe(universes))'),'Multi-universe operations must preflight their complete universe set');
expect(control.includes('if(u==null||!bridgeUniverseAllowed(u,protocol))'),'Single-frame send must validate its own universe without treating cached history as active output');
expect(control.includes("id:'aputure-sidus-four'")&&control.includes('artNetUniverseMax:32768')&&control.includes('sacnUniverseMax:63999')&&control.includes('maxActiveUniverses:4')&&control.includes('artNetPortAddressOffset:-1'),'Sidus Four verified bridge must map LightingAI U1-U32768 to Art-Net Port-Address 0-32767');
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
expect(control.includes('function invalidateRouteBoundOutputState()')&&control.includes("version:'0.66-sacn-ipv6-dual'"),'Route changes must invalidate only route-bound runtime output state');
expect(control.includes('function buildArtNetSubscriberMap(nodes)')&&control.includes('artNetAutoHasRequiredSubscribers')&&control.includes('artNetAutoTargetsHaveUniqueRoutes'),'AUTO Art-Net must resolve current ArtPollReply subscribers and fail closed when routing is ambiguous');
expect(control.includes('artNetTargetIsLocalBroadcast(target,interfaces)')&&control.includes('preflightBroadcastTarget'),'Manual ArtDmx broadcast targets must be rejected');
expect(control.includes("targets=autoTarget?artNetTargetsForPortAddress(artNetPortAddress):[rawTarget]")&&control.includes("request={id:id+'_t'+(index+1),targetIp:target"),'AUTO Art-Net must fan out ArtDmx only as per-subscriber unicast');
expect(control.includes("artnet_auto_refresh_g")&&control.includes('Date.now()-lastArtNetAutoPollStartedAt>=2500')&&control.includes('timeoutMs:2800')&&control.includes('lastArtNetAutoPollStartedAt=Date.now()'),'Armed AUTO Art-Net must poll on the Art-Net controller cadence and fail closed on subscription changes');
expect(control.includes('function isFullDmxFrame(channels)')&&control.includes("channels.length===512")&&control.includes("typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=255")&&control.includes("if(!isFullDmxFrame(channels)){status(t().error,false);return false}"),'JS network transport must reject malformed or partial DMX frames before native dispatch');
expect(control.includes("typeof channel!=='number'||!Number.isInteger(channel)||channel<1")&&control.includes("typeof value!=='number'||!Number.isInteger(value)||value<0||value>255"),'Verified profile requiredChannels metadata must be strict numeric integers without JS coercion');
expect(control.includes("typeof start!=='number'||!Number.isInteger(start)||start<1"),'Direct control frame writes must reject coerced or invalid DMX addresses');
expect(control.includes("if(universes.some(u=>!isFullDmxFrame(frames[String(u)])))"),'LIVE must preflight every cached universe as a strict full frame before first send');
expect(control.includes("if(Object.keys(saved).some(u=>!isFullDmxFrame(saved[u])))"),'BLACKOUT restore snapshot must reject malformed stored frames');
expect(control.includes("if(!current){setOutputArmed(false,true);status(t().error,false);return}"),'Scene save must reject corrupt runtime frame state instead of normalizing it');
expect(!control.includes("while(staged.length<512)staged.push(0)")&&!control.includes("while(target.length<512)target.push(0)")&&!control.includes("while(start[u].length<512)start[u].push(0)"),'Known-frame baselines must never be padded with invented zero channels');
expect(control.includes('stagedFrameForUniverse')&&control.includes('commitStagedUniverseFrames'),'Transactional MASTER frame staging missing');
for(const marker of ['ARM OUTPUT','globalBlackout','restoreBeforeBlackout','fadeToScene','setLiveEnabled','armGeneration']){
 expect(control.includes(marker),'Control critical contract missing: '+marker);
}


// UI/language regression lock.
// These checks intentionally cover the phone regressions that previously slipped past
// the broader CONTROL audit: missing Guide Me/simple/advanced UI and partial SR/EN switching.
const uiRegressionAssets=[
 'app/src/main/assets/index.html',
 'app/src/main/assets/simple-mode-ui.js',
 'app/src/main/assets/tools-compact-ui.js',
 'app/src/main/assets/catalog.js',
 'app/src/main/assets/control-dashboard.js',
 'app/src/main/assets/ai-control-bridge.js',
 'app/src/main/assets/ai-visual-scene-launcher.js',
 'app/src/main/assets/ai-visual-scene-plan.js',
 'app/src/main/assets/gel-filter-catalog.js',
 'app/src/main/assets/gel-filter-ui.js',
 'app/src/main/assets/sun-ui.js',
 'app/src/main/assets/sun-native-bridge.js'
];
for(const p of uiRegressionAssets){
 expect(fs.existsSync(path.join(root,p)), 'Missing UI/language regression asset: '+p);
}
const uiIndex=read('app/src/main/assets/index.html');
const uiSimple=read('app/src/main/assets/simple-mode-ui.js');
const uiCatalog=read('app/src/main/assets/catalog.js');
const uiControl=read('app/src/main/assets/control-dashboard.js');
const uiAiBridge=read('app/src/main/assets/ai-control-bridge.js');
const uiAiLauncher=read('app/src/main/assets/ai-visual-scene-launcher.js');
const uiAiScenePlan=read('app/src/main/assets/ai-visual-scene-plan.js');
const uiGelCatalog=read('app/src/main/assets/gel-filter-catalog.js');
const uiGelUi=read('app/src/main/assets/gel-filter-ui.js');
const uiServer=read('backend/server.js');
const uiSun=read('app/src/main/assets/sun-ui.js');
const uiSunNative=read('app/src/main/assets/sun-native-bridge.js');

expect(uiIndex.includes('window.currentLang=currentLang;'),
 'Initial language must be published through window.currentLang');
expect(uiIndex.includes('currentLang=l;window.currentLang=l;localStorage.setItem(LS.lang,l);'),
 'setLanguage must keep local and global language state synchronized');
expect(uiIndex.includes('window.LightingAIVisualSceneLauncher&&window.LightingAIVisualSceneLauncher.install&&window.LightingAIVisualSceneLauncher.install()'),
 'Language switch must refresh the localized AI visual launcher');

const catalogScriptPos=uiIndex.indexOf('id="lightingai-catalog-script" src="catalog.js"');
const simpleScriptPos=uiIndex.indexOf('id="lightingai-simple-mode-ui-script" src="simple-mode-ui.js"');
const toolsScriptPos=uiIndex.indexOf('id="lightingai-tools-compact-ui-script" src="tools-compact-ui.js"');
expect(catalogScriptPos>=0&&simpleScriptPos>catalogScriptPos&&toolsScriptPos>simpleScriptPos,
 'Catalog, simple-mode and compact-tools scripts must remain included in deterministic order');

for(const marker of ['JEDNOSTAVNO','NAPREDNO','VODI ME','SIMPLE','ADVANCED','GUIDE ME']){
 expect(uiSimple.includes(marker),'Simple/advanced/guide localization missing: '+marker);
}
expect(uiSimple.includes("localStorage.getItem('lighting_language_v1')")&&uiSimple.includes("setTimeout(refreshText,0)"),
 'Simple-mode UI must reread the selected language and refresh after language-button clicks');

expect(uiCatalog.includes("(window.currentLang||'sr')==='sr'"),
 'Equipment catalog must read the shared global language');
for(const marker of ['RASVETA I OPREMA','LIGHTING & EQUIPMENT','PRIBOR ZA RASVETU','LIGHTING ACCESSORIES','DIMERI','DIMMERS','STATIVI','STANDS']){
 expect(uiCatalog.includes(marker),'Catalog bilingual marker missing: '+marker);
}

expect(uiControl.includes("(window.currentLang||'sr')!=='en'")&&uiControl.includes('KONTROLA RASVETE')&&uiControl.includes('LIGHTING CONTROL'),
 'CONTROL dashboard must remain bound to the shared SR/EN language state');
expect(uiAiBridge.includes("(window.currentLang||'sr')!=='en'")&&uiAiBridge.includes('AI → KONTROLA')&&uiAiBridge.includes('AI → CONTROL'),
 'AI-to-CONTROL bridge must remain bound to the shared SR/EN language state');
expect(uiAiLauncher.includes("window.currentLang==='en'?'AI VISUAL PLAN':'AI VIZUELNI PLAN'"),
 'AI visual launcher must remain bound to the shared SR/EN language state');

expect(uiAiScenePlan.includes('id="aiv-gallery" type="file" accept="image/*" hidden onchange="window.LightingAIHandleScenePhoto&&window.LightingAIHandleScenePhoto(event)"')&&
 uiAiScenePlan.includes('id="aiv-camera" type="file" accept="image/*" capture="environment" hidden onchange="window.LightingAIHandleScenePhoto&&window.LightingAIHandleScenePhoto(event)"'),
 'AI visual plan must keep Planner-style hidden gallery and camera file inputs with direct onchange handling');
expect(uiAiScenePlan.includes('onclick="document.getElementById(&quot;aiv-gallery&quot;).click();return false;"')&&
 uiAiScenePlan.includes('onclick="document.getElementById(&quot;aiv-camera&quot;).click();return false;"'),
 'AI visual photo buttons must directly click their file inputs exactly like Planner');
expect(uiAiScenePlan.includes('window.LightingAIHandleScenePhoto=receiveFile;'),
 'AI visual file inputs must feed the shared scene-photo handler');
expect(!uiAiScenePlan.includes('Android.openImagePicker(mode)')&&!uiAiScenePlan.includes('LightingAIOpenSceneImage'),
 'AI visual photo buttons must not use a separate picker wrapper or bypass the working Planner file-input path');
expect(uiAiScenePlan.includes('onclick="return window.LightingAIRemoveScenePhoto?window.LightingAIRemoveScenePhoto():false;"')&&
 uiAiScenePlan.includes('window.LightingAIRemoveScenePhoto=function(){')&&
 uiAiScenePlan.includes("if(gallery)gallery.value='';")&&uiAiScenePlan.includes("if(camera)camera.value='';"),
 'AI visual remove-photo action must be direct, clear the photo, and reset both file inputs');
expect(!uiAiScenePlan.includes("document.getElementById('aiv-remove').onclick"),
 'AI visual remove-photo action must not depend on late onclick binding');

expect(!uiSun.includes('Europe/Belgrade')&&!uiSun.includes('DEFAULT_BELGRADE'),
 'SUNCE must not hard-code a city or timezone');
expect(uiSun.includes('function syncDeviceNow(emit)')&&
 uiSun.includes('function refreshCurrentLocationIfAllowed()')&&
 uiSun.includes('syncDeviceNow(false);refreshCurrentLocationIfAllowed();updateSun()'),
 'SUNCE must refresh the device-local date/time and current location whenever the SUNCE page is opened');
expect(uiSun.includes('value=""')&&uiSun.includes('id="sunLat"')&&uiSun.includes('id="sunLon"'),
 'SUNCE must not ship fixed city coordinates as the default location');
expect(uiSun.includes('window.LightingAISunSyncCurrentTime=function(){syncDeviceNow(true);return false}'),
 'SUNCE must expose a shared device-local current-time sync hook for native location updates');
expect(uiSunNative.includes("window.LightingAISunSyncCurrentTime==='function'")&&
 uiSunNative.includes('window.LightingAISunSyncCurrentTime()'),
 'Native SUNCE location bridge must refresh the current device-local time after location updates');

expect(uiIndex.includes('id="gelFilterFolder"')&&uiIndex.includes('id="lightingai-gel-catalog-script" src="gel-filter-catalog.js"')&&uiIndex.includes('id="lightingai-gel-ui-script" src="gel-filter-ui.js"'),
 'FILTERI/GEL must remain a separate collapsed Equipment catalog');
const gelCatalogScriptPos=uiIndex.indexOf('id="lightingai-gel-catalog-script" src="gel-filter-catalog.js"');
const mainCatalogScriptPos=uiIndex.indexOf('id="lightingai-catalog-script" src="catalog.js"');
const gelUiScriptPos=uiIndex.indexOf('id="lightingai-gel-ui-script" src="gel-filter-ui.js"');
expect(gelCatalogScriptPos>=0&&mainCatalogScriptPos>gelCatalogScriptPos&&gelUiScriptPos>mainCatalogScriptPos,
 'FILTERI/GEL catalog, fixture catalog and gel UI scripts must load in deterministic order');
expect(uiGelUi.includes('FILTERI / GEL')&&uiGelUi.includes('folderOpen=false')&&uiGelUi.includes("equipmentType:'gel'"),
 'FILTERI/GEL UI must start collapsed and keep selected filters typed as gel modifiers');
expect((uiGelCatalog.match(/"equipmentType":"gel"/g)||[]).length===977&&uiGelCatalog.includes('"count":333')&&uiGelCatalog.includes('"count":144')&&uiGelCatalog.includes('"count":312')&&uiGelCatalog.includes('"count":188'),
 'FILTERI/GEL generated catalog must contain exactly 977 filters across the four verified source lines');
expect(uiAiScenePlan.includes('gel_recommendations')&&uiAiScenePlan.includes('LightingAIGelCatalog')&&uiAiScenePlan.includes('gelCatalog:gelCatalog'),
 'AI Visual Plan must receive the FILTERI/GEL catalog and render gel recommendations');
expect(uiServer.includes('formatGelCatalogForAI')&&uiServer.includes('GEL/FILTER RULES: filters and gels are modifiers, never fixtures')&&uiServer.includes('never invent a gel code or product'),
 'Backend AI contract must preserve exact FILTERI/GEL products and keep gels separate from fixtures');

console.log(JSON.stringify({ok:failures.length===0,failures},null,2));
if(failures.length)process.exit(1);
