import { execFileSync } from 'node:child_process';

const STABLE_BASE = '77462ab3cf80c48c5ca0c903486e59919a3bf747';
const PHONE_TESTED_BASE = 'a2913dedf00d8ddf18930e56d6bf2e862993f92c';
const MAIN686_BASE = '9fb1cb24cabf41d45baed2fb6e9cf6c4a737f1a7';
const PROJECT54_PHONE_BASE = '3827f81400ff8abd1e83e6b8e416f8ee628fce94';
const PROJECT55_DP_BASE = 'a79fdeca7db3ddf0c153589b58639a84b5b65628';
const PROJECT55_BACKUP_BASE = '64e8d99ee15f94a34da35fcd1eb9f416372ba36c';
const PROJECT55_VOICE_BASE = '3e61ba6bbebf381c3b376af090aa385ac7e7d332';
const PROJECT56_PDF_BASE = '6c4e2a644d2ff55dc7cf1e005a7c5d1892c6d0b1';
const PROJECT57_MULTI_BASE = '48f497e26f882b2ff618667832dcb938e4750ba9';
const PROJECT58_SUN_BASE = '0c13256a49160ba5c48fd3aa92c406f834f7e531';
const PROJECT59_DMX_BASE = '3d112dd60da64fc66b42e61072ff2f012dfb6995';
const PROJECT510_QA_BASE = '5bf13f433454c048a7e87cf515e19aa92d8199ba';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function fail(message) {
  throw new Error(`Project 5.4 main-686 guard failed: ${message}`);
}

for (const [label, sha] of [
  ['stable build 510', STABLE_BASE],
  ['phone-tested build 655', PHONE_TESTED_BASE],
  ['phone-verified Planner build 686', MAIN686_BASE],
  ['phone-tested Project 5.4 build 701', PROJECT54_PHONE_BASE],
  ['Project 5.5 DP main build 713', PROJECT55_DP_BASE],
  ['Project 5.5 backup Downloads main build 721', PROJECT55_BACKUP_BASE],
  ['Project 5.5 DP voice main build 727', PROJECT55_VOICE_BASE],
  ['Project 5.6 professional PDF main build 739', PROJECT56_PDF_BASE],
  ['Project 5.7 multi-subject main build 746', PROJECT57_MULTI_BASE],
  ['Project 5.8 SUNCE main build 753', PROJECT58_SUN_BASE],
  ['Project 5.9 DMX main build 762', PROJECT59_DMX_BASE],
  ['Project 5.10 final QA main build 767', PROJECT510_QA_BASE]
]) {
  try { git(['cat-file', '-e', `${sha}^{commit}`]); }
  catch { fail(`${label} commit ${sha} is unavailable; CI checkout must include full history`); }
}

// Preserve the exact historical Project 5 safety marker for build-510 ancestry.
try {
  git(['merge-base', '--is-ancestor', STABLE_BASE, 'HEAD']);
} catch {
  fail('feature branch no longer descends from stable build 510');
}

for (const [label, sha] of [
  ['phone-tested build 655', PHONE_TESTED_BASE],
  ['phone-verified Planner build 686', MAIN686_BASE],
  ['phone-tested Project 5.4 build 701', PROJECT54_PHONE_BASE],
  ['Project 5.5 DP main build 713', PROJECT55_DP_BASE],
  ['Project 5.5 backup Downloads main build 721', PROJECT55_BACKUP_BASE],
  ['Project 5.5 DP voice main build 727', PROJECT55_VOICE_BASE],
  ['Project 5.6 professional PDF main build 739', PROJECT56_PDF_BASE],
  ['Project 5.7 multi-subject main build 746', PROJECT57_MULTI_BASE],
  ['Project 5.8 SUNCE main build 753', PROJECT58_SUN_BASE],
  ['Project 5.9 DMX main build 762', PROJECT59_DMX_BASE],
  ['Project 5.10 final QA main build 767', PROJECT510_QA_BASE]
]) {
  try { git(['merge-base', '--is-ancestor', sha, 'HEAD']); }
  catch { fail(`feature branch no longer descends from ${label}`); }
}

const changedLegacy = git(['diff', '--name-only', `${STABLE_BASE}...HEAD`])
  .split('\n').map((x) => x.trim()).filter(Boolean);
const changed = git(['diff', '--name-only', `${PROJECT510_QA_BASE}...HEAD`])
  .split('\n').map((x) => x.trim()).filter(Boolean);

const measurePath = 'app/src/main/java/com/lightingai/app/MeasureActivity.java';
const aiPlanPath = 'app/src/main/assets/ai-visual-scene-plan.js';
const backupPath = 'app/src/main/assets/project-backup-export.js';
const mainActivityPath = 'app/src/main/java/com/lightingai/app/MainActivity.java';
const imageBridgePath = 'app/src/main/java/com/lightingai/app/AIVisualImageBridge.java';
const serverPath = 'backend/server.js';
const exactAllowed = new Set([
  aiPlanPath,
  mainActivityPath,
  imageBridgePath,
  'app/build.gradle',
  '.github/workflows/build-apk.yml',
  '.github/workflows/release-apk.yml',
  'app/src/main/assets/index.html',
  'app/src/main/assets/sun-native-bridge.js',
  'app/src/main/assets/planner-layout-lock.js',
  'app/src/main/assets/catalog.js',
  'backend/catalog-runtime.js',
  'backend/fixture-library.js',
  'backend/arri-l-series-plus-library.js',
  'backend/arri-skypanel-classic-s360-library.js',
  'backend/arri-skypanel-classic-s120-library.js',
  'backend/arri-skypanel-classic-s60-library.js',
  'backend/arri-skypanel-classic-s30-library.js',
  'backend/arri-skypanel-x-library.js',
  'backend/astera-titantube-library.js',
  'backend/astera-ax5-triplepar-library.js',
  'backend/astera-ax10-spotmax-library.js',
  'backend/astera-plutofresnel-library.js',
  'backend/astera-leofresnel-library.js',
  'backend/astera-ax9-powerpar-library.js',
  'backend/astera-pixelbrick-library.js',
  'backend/astera-nyx-bulb-library.js',
  'backend/astera-quikspot-library.js',
  'backend/astera-solabulb-library.js',
  'backend/astera-ax1-pixeltube-library.js',
  'backend/astera-lunabulb-library.js',
  'backend/astera-quikbeam-library.js',
  'backend/astera-quikpunch-library.js',
  'backend/astera-heliostube-library.js',
  'backend/astera-ax2-pixelbar-library.js',
  'backend/astera-ax7-spotlite-library.js',
  'backend/astera-ax3-lightdrop-library.js',
  'backend/astera-hydrapanel-library.js',
  'backend/astera-hyperiontube-library.js',
  'backend/catalog-selftest.js',
  'backend/desisti-super-led-f47-library.js',
  'backend/desisti-led-fresnel-series-library.js',
  'backend/desisti-piccoletto-library.js',
  'backend/desisti-softled-library.js',
  'backend/desisti-giotto-led-library.js',
  'backend/desisti-galileo-softnel-library.js',
  'backend/desisti-spacelight-library.js',
  'backend/desisti-lite-series-library.js',
  'backend/desisti-softled-vwc-library.js',
  'backend/desisti-muses-library.js',
  'backend/desisti-tungsten-library.js',
  'backend/desisti-tungsten-soft-broad-library.js',
  'backend/desisti-hmi-library.js',
  'backend/desisti-conventional-extra-library.js',
  'backend/desisti-catalog-selftest.js',
  'backend/godox-continuous-library.js',
  'backend/godox-catalog-selftest.js',
  'backend/aladdin-mosaic-library.js',
  'backend/aladdin-fabric-lite-library.js',
  'backend/aladdin-bi-flex-library.js',
  'backend/aladdin-all-in-library.js',
  'backend/aladdin-base-lite-library.js',
  'backend/aladdin-onboard-library.js',
  'backend/aladdin-bi-fabric-library.js',
  'backend/aladdin-catalog-selftest.js',
  'backend/litegear-litemat-spectrum-g2-library.js',
  'backend/litegear-litemat-plus-library.js',
  'backend/litegear-litemat-spectrum-2019-library.js',
  'backend/litegear-litemat-s2-library.js',
  'backend/litegear-litemat-catalog-selftest.js',
  'backend/evlight-gem-gemx-library.js',
  'backend/evlight-fresnel-library.js',
  'backend/evlight-gemx-hard-library.js',
  'backend/evlight-profile-library.js',
  'backend/evlight-gemx-large-library.js',
  'backend/evlight-catalog-selftest.js',
  'backend/kinoflo-current-library.js',
  'backend/kinoflo-freestyle-air-library.js',
  'backend/kinoflo-celeb-led-library.js',
  'backend/kinoflo-diva-lite-led-library.js',
  'backend/kinoflo-image-select-led-library.js',
  'backend/kinoflo-4bank-tegra-library.js',
  'backend/kinoflo-parabeam-parazip-library.js',
  'backend/kinoflo-vistabeam-wallolite-library.js',
  'backend/kinoflo-diva-barfly-library.js',
  'backend/kinoflo-imara-library.js',
  'backend/kinoflo-micro-mini-library.js',
  'backend/kinoflo-blanket-flathead-library.js',
  'backend/kinoflo-image-87-47-library.js',
  'backend/kinoflo-catalog-selftest.js',
  'backend/package.json',
  'automation/tasks.json',
  'docs/OVERNIGHT_API_RUNNER.md',
  'scripts/overnight_runner.py',
  'automation/git_tasks.json',
  'scripts/overnight_git_runner.py',
  'app/src/main/assets/artnet-control.js',
  'app/src/main/java/com/lightingai/app/ArtNetSender.java',
  'app/src/main/java/com/lightingai/app/ArtNetLiveEngine.java',
  'app/src/main/java/com/lightingai/app/ArtNetDiscovery.java',
  'app/src/main/java/com/lightingai/app/SacnSender.java',
  'app/src/main/java/com/lightingai/app/SacnLiveEngine.java',
  'app/src/main/java/com/lightingai/app/BleDeviceScanner.java',
  'app/src/main/java/com/lightingai/app/NetworkInterfaceInspector.java',
  'app/src/main/assets/ble-control.js',
  'app/src/main/AndroidManifest.xml',
  'app/src/test/java/com/lightingai/app/ArtNetProtocolTest.java',
  'app/src/test/java/com/lightingai/app/SacnProtocolTest.java',
  'backend/project5-stable-base-selftest.js',
  'backend/project-backup-selftest.js',
  'backend/blocking-designer-selftest.js',
  'backend/project5-feature-selftest.js',
  'backend/project52-release-gate-selftest.js',
  'app/src/main/assets/ai-visual-scene-launcher.js',
  'app/src/main/assets/ai-control-bridge.js',
  'app/src/main/assets/control-dashboard.js',
  'app/src/main/assets/device-capabilities.js',
  'app/src/main/assets/shot-setup-report.js',
  'app/src/main/assets/set-sketch.js',
  'app/src/main/assets/set-sketch-camera-fov.js',
  'app/src/main/assets/blocking-camera-designer.js',
  'app/src/main/assets/blocking-sun-integration.js',
  'app/src/main/assets/blocking-ai-integration.js',
  'app/src/main/assets/set-sketch-sun.js',
  'app/src/main/assets/shot-list-planner.js',
  'app/src/main/assets/camera-setup-snapshots.js',
  'app/src/main/assets/lightai-intro.jpg',
  'app/src/main/java/com/lightingai/app/AIVisualImageProvider.java',
  'app/src/main/res/values/styles.xml'
]);
const unexpected = changed.filter((path) => !exactAllowed.has(path));
if (unexpected.length) fail(`files changed outside the isolated Project 5.4 camera-distance surface: ${unexpected.join(', ')}`);

for (const protectedPath of [
  'app/src/main/assets/scene-measure.js',
  'app/src/main/assets/light-calculator.js',
  'app/src/main/assets/project-backup-export.js',
  'app/src/main/assets/ai-visual-preview-refinements.js',
  'app/src/main/assets/ai-visual-phone-diagnostics.js',
  'app/src/main/assets/ai-visual-image-actions.js',
  'backend/visual-preview.js'
]) {
  const stable = git(['show', `${PROJECT510_QA_BASE}:${protectedPath}`]);
  const current = git(['show', `HEAD:${protectedPath}`]);
  if (stable !== current) fail(`build 767 protected file changed unexpectedly: ${protectedPath}`);
}

const setSketch = git(['show', 'HEAD:app/src/main/assets/set-sketch.js']);
for (const marker of [
  "window.LightingAISetSketch={version:'1.2-blocking-lighting'",
  'setPreview:setPreview',
  'clearPreview:clearPreview',
  'addAllEquipmentLights:addAllEquipmentLights',
  'getLightingSnapshot:lightingSnapshot',
  "new CustomEvent('lightingai:set-sketch-rendered')"
]) {
  if (!setSketch.includes(marker)) fail(`Blocking Set Sketch preview marker missing: ${marker}`);
}

const blockingDesigner = git(['show', 'HEAD:app/src/main/assets/blocking-camera-designer.js']);
for (const marker of [
  "window.LightingAIBlocking={version:'0.3-preserve-framing'",
  'requestAnimationFrame(tick)',
  'function addPoint()',
  'function pointerMove(ev)',
  'function trackingRotation(cameraPos,targetPos)',
  'function captureTrackingOffset(cam,target)',
  "b.trackFramingMode==='preserve'",
  'prepareTrackingOffsets()',
  "renderControls();pathMarkup()",
  'a.setPreview(buildPreview'
]) {
  if (!blockingDesigner.includes(marker)) fail(`Blocking Camera Designer marker missing: ${marker}`);
}

const setSketchFov = git(['show', 'HEAD:app/src/main/assets/set-sketch-camera-fov.js']);
for (const marker of [
  "window.LightingAISetSketch&&typeof window.LightingAISetSketch.getVisualObject==='function'",
  "svg.addEventListener('lightingai:set-sketch-rendered'",
  "window.LightingAICameraFov={version:'1.1-framing-metrics'",
  'edgeMargin:margin',
  'centerOffset:offset'
]) {
  if (!setSketchFov.includes(marker)) fail(`Blocking Camera FOV integration marker missing: ${marker}`);
}

const shotListBlocking = git(['show', 'HEAD:app/src/main/assets/shot-list-planner.js']);
for (const marker of [
  "window.LightingAIShotList={version:'1.2-shot-restore'",
  'referenceImage:null',
  'horizontalFovDeg:cam?hfov:null',
  'framing:framing?JSON.parse(JSON.stringify(framing)):null',
  'function restoreSetup(rowId)',
  'restoreSetup:restoreSetup',
  'blocking:cam&&cam.blocking'
]) {
  if (!shotListBlocking.includes(marker)) fail(`Blocking Shot List marker missing: ${marker}`);
}

const shotSetupBlocking = git(['show', 'HEAD:app/src/main/assets/shot-setup-report.js']);
for (const marker of [
  "schema:'lightingai-shot-setup-v3-blocking-designer'",
  'blocking:{motion:blockingMotion(scene),lighting:blockingLighting(),framing:cameraFraming(),sunCamera:blockingSun(),ai:blockingAi()}',
  'function blockingMotion(scene)',
  'function cameraFraming()',
  'function blockingSun()',
  'function blockingAi()',
  "documentType:'shot_setup'",
  'function savePdf()',
  'function sharePdf()',
  "['shotSetupBlockingLightsTile','BLOCKING LIGHT MAP']"
]) {
  if (!shotSetupBlocking.includes(marker)) fail(`Blocking Shot Setup marker missing: ${marker}`);
}

const imageBridgeBlocking = git(['show', 'HEAD:app/src/main/java/com/lightingai/app/AIVisualImageBridge.java']);
for (const marker of [
  'if ("shot_setup".equals(payload.optString("documentType", ""))) return renderShotSetup();',
  'private byte[] renderShotSetup() throws Exception',
  'BLOCKING / CAMERA DESIGNER — SHOT SETUP',
  'AI BLOCKING PROPOSALS — NOT APPLIED AUTOMATICALLY'
]) {
  if (!imageBridgeBlocking.includes(marker)) fail(`Blocking Shot Setup PDF marker missing: ${marker}`);
}

const cameraSetupsBlocking = git(['show', 'HEAD:app/src/main/assets/camera-setup-snapshots.js']);
for (const marker of [
  "window.LightingAICameraSetups={version:'1.1-blocking-link'",
  'selectedSketchCameraId()',
  'saveCurrentToSlot:function(slot,id)'
]) {
  if (!cameraSetupsBlocking.includes(marker)) fail(`Blocking Camera Setup marker missing: ${marker}`);
}

const blockingAi = git(['show', 'HEAD:app/src/main/assets/blocking-ai-integration.js']);
for (const marker of [
  "window.LightingAIBlockingAI={version:'1.0-confirmed-proposals'",
  'function applyProposal(id,quiet)',
  'if(!confirm(t().confirmAll))return',
  "window.addEventListener('lightingai-visual-plan-ready'"
]) {
  if (!blockingAi.includes(marker)) fail(`Blocking AI marker missing: ${marker}`);
}

const blockingSun = git(['show', 'HEAD:app/src/main/assets/blocking-sun-integration.js']);
for (const marker of [
  "window.LightingAIBlockingSun={version:'1.0'",
  'function shiftTime(delta)',
  'cameraHeadingDeg:cameraHeading',
  'relativeAngleDeg:relative'
]) {
  if (!blockingSun.includes(marker)) fail(`Blocking SUNCE marker missing: ${marker}`);
}

const blockingLoader = git(['show', `HEAD:${mainActivityPath}`]);
if (!blockingLoader.includes("blocking-camera-designer.js")) {
  fail('Blocking Camera Designer loader missing from MainActivity');
}
if (!blockingLoader.includes("set-sketch-sun.js") || !blockingLoader.includes("blocking-sun-integration.js")) {
  fail('Blocking SUNCE loaders missing from MainActivity');
}
if (!blockingLoader.includes("blocking-ai-integration.js")) {
  fail('Blocking AI loader missing from MainActivity');
}

const manifestPath = 'app/src/main/AndroidManifest.xml';
const stableManifest = git(['show', `${PROJECT510_QA_BASE}:${manifestPath}`]);
const currentManifest = git(['show', `HEAD:${manifestPath}`]);
const manifestWithoutBle = currentManifest
  .split('\n')
  .filter((line) => !line.includes('android.permission.BLUETOOTH') && !line.includes('android.hardware.bluetooth_le') && !line.includes('android.permission.RECORD_AUDIO'))
  .join('\n');
if (manifestWithoutBle !== stableManifest) fail('AndroidManifest changed outside the isolated BLE permission/feature additions');
for (const marker of [
  'android.permission.BLUETOOTH" android:maxSdkVersion="30"',
  'android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30"',
  'android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation"',
  'android.permission.BLUETOOTH_CONNECT',
  'android.hardware.bluetooth_le" android:required="false"'
]) {
  if (!currentManifest.includes(marker)) fail(`BLE manifest marker missing: ${marker}`);
}
const allowedPermissions = new Set([
  'android.permission.INTERNET',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.CAMERA',
  'android.permission.RECORD_AUDIO',
  'android.permission.BLUETOOTH',
  'android.permission.BLUETOOTH_ADMIN',
  'android.permission.BLUETOOTH_SCAN',
  'android.permission.BLUETOOTH_CONNECT'
]);
for (const match of currentManifest.matchAll(/android:name="(android\.permission\.[A-Z_]+)"/g)) {
  if (!allowedPermissions.has(match[1])) fail(`unexpected Android permission added: ${match[1]}`);
}

// Preserve the historical non-destructive catalog contract required by Project 5 safety.
const catalogPath = 'app/src/main/assets/catalog.js';
const stableCatalog = git(['show', `${STABLE_BASE}:${catalogPath}`]);
const currentCatalog = git(['show', `HEAD:${catalogPath}`]);
if (!currentCatalog.includes("file:///android_asset/ai-visual-scene-launcher.js")) {
  fail('catalog.js may not delete stable build 510 code or the isolated AI visual launcher');
}
if (!stableCatalog.trim()) fail('catalog.js may not delete stable build 510 code');

const stableMeasure = git(['show', `${PROJECT54_PHONE_BASE}:${measurePath}`]);
const measure = git(['show', `HEAD:${measurePath}`]);
if (stableMeasure !== measure) fail('phone-tested Project 5.4 camera measurement changed unexpectedly');
for (const marker of [
  'ImageFormat.DEPTH16',
  'CameraCharacteristics.REQUEST_AVAILABLE_CAPABILITIES_DEPTH_OUTPUT',
  'ImageReader.newInstance',
  'packed & 0x1fff',
  'depthIsFresh()',
  'depthIsStable()',
  'measurementMethod = "depth"',
  'data.putExtra("method",measurementMethod)',
  'createPreview(false)',
  'distanceForAngle',
  'Sensor.TYPE_ROTATION_VECTOR'
]) {
  if (!measure.includes(marker)) fail(`DEPTH/fallback marker missing: ${marker}`);
}

const aiPlan = git(['show', `HEAD:${aiPlanPath}`]);
for (const marker of [
  "dpRequest:'ZAHTEV DP-a / TRAŽENA RASVETA'",
  'id="aiv-dp-request"',
  "'Obavezan zahtev DP-a: '",
  'description:descriptionWithMeasurements()',
  "dpRequestVersion:'0.5-dp-request'",
  'id="aiv-dp-voice"',
  'Android.startSpeechInput',
  'window.LightingAIVoiceInputResult',
  "voiceInputVersion:'0.6-dp-voice'",
  'id="aiv-pdf-export"',
  'LightingAIImages.savePlanPdf',
  "pdfExportVersion:'0.7-professional-pdf'",
  "setSketch:readLocal('lighting_set_sketch_v1',{})",
  'subjects:subjectLayout',
  'function setSketchSubjects()',
  'subjectNodes=subjects.map',
  "multiSubjectVersion:'0.8-multi-subject-ai'",
  'id="aiv-use-sun"',
  'function activeSunContext()',
  'sun:sunContext||undefined',
  "sunIntegrationVersion:'0.9-sun-ai'",
  'id="aiv-use-dmx"',
  'function activeDmxContext()',
  'dmx:dmxContext||undefined',
  "dmxIntegrationVersion:'1.0-dmx-ai'",
  'function latestMeasurementByTarget(items,target){for(var i=0;i<items.length;i++)',
  'id="aiv-desc-voice"',
  "Android.startSpeechInput(currentLanguage(),'aiv-desc')",
  "sceneVoiceVersion:'1.1-scene-voice'"
]) {
  if (!aiPlan.includes(marker)) fail(`DP request marker missing: ${marker}`);
}

const backupExport = git(['show', `HEAD:${backupPath}`]);
for (const marker of [
  'Preuzimanja (Downloads)',
  'LightingAI_Project_Backup_',
  'Android.saveText(name,v)'
]) {
  if (!backupExport.includes(marker)) fail(`backup Downloads marker missing: ${marker}`);
}

const artNetControl = git(['show', 'HEAD:app/src/main/assets/artnet-control.js']);
for (const marker of [
  'function controlTransport()',
  "platform:androidReady?'android':(iosReady?'ios':'none')",
  'Android.artNetSendDmx',
  'window.webkit.messageHandlers.LightingAIControl',
  "version:'0.29-ai-explicit-apply'",
  'function fadeChannelValue(from,to,progress,snap)',
  'function fadeSnapChannels()',
  'function controlFromDmx(ctrl,raw)',
  'if(profileForRow(r)!==profile||!controlsInclude(profile,ctrl)||',
  'controlToDmx(ctrl,value)==null)return;',
  'function discoverNodes()',
  'LightingAIArtNetDiscoveryResult',
  "networkDmxProtocol",
  "protocol:'MREŽNI PROTOKOL'",
  "protocol:'NETWORK PROTOCOL'",
  "sendSacnDmx",
  "setSacnLiveDmx",
  "protocolUniverseLimit(protocol)",
  "const PROTOCOL_KEY='lighting_network_dmx_protocol_v1'",
  'function sacnMulticastAddress(universe)',
  "artnetDiscoveredNodes').addEventListener('change'",
  'if(liveEnabled)setLiveEnabled(false)',
  'function patchSignature()',
  'function saveScene()',
  'function applyScene(index)',
  "const SCENES_KEY='lighting_artnet_scenes_v1'",
  "const FADE_KEY='lighting_control_fade_seconds_v1'",
  'function normalizedSceneFrames(scene)',
  'function fadeToScene(index,secondsOverride)',
  'function cancelSceneFade(showStatus)',
  "sendFrame(out.slice(),Number(u),'fade')",
  "resultId.indexOf('fade_')===0",
  "sceneFade:'PRELAZ'",
  "sceneFade:'FADE'",
  "const CUES_KEY='lighting_control_cues_v1'",
  'function readCues()',
  'function writeCues(items)',
  'function addCue()',
  'function goCue(index)',
  'function previousCue()',
  'function renderCueStack()',
  "cueTitle:'CUE LISTA'",
  "cueTitle:'CUE LIST'",
  'function knownUniverseNumbers()',
  'function globalBlackout()',
  'function restoreBeforeBlackout()',
  'function clearBlackoutRestore()',
  "sendFrame(frames[String(u)].slice(),u,'panic')",
  "sendFrame(frames[String(u)].slice(),Number(u),'restore')",
  "panicTitle:'GLOBAL BLACKOUT'",
  "panicRestore:'VRATI PRE BLACKOUTA'",
  "panicRestore:'RESTORE BEFORE BLACKOUT'",
  'function requireOutputArmed()',
  'function setOutputArmed(enabled,quiet)',
  'if(!outputArmed){status(t().armRequired,false);return false}',
  "armLabel:'ARM OUTPUT'",
  "armRequired:'Prvo uključi ARM OUTPUT.'",
  "armRequired:'Arm DMX output first.'",
  'function validIpv4(value)',
  'function finishArmPreflight(id,payload,error)',
  "const id='network_arm_'+Date.now()+'_'+(++seq)",
  "preflightNoBroadcast:'AUTO Art-Net nema dostupnu directed broadcast adresu.'",
  "preflightNoMulticast:'The active network does not support multicast required by sACN.'",
  'function renderArtNetRoutes(interfaces)',
  "artnetRoute:'ART-NET MREŽNA RUTA'",
  "artnetRoute:'ART-NET NETWORK ROUTE'",
  "preflightMultipleRoutes:'Otkriveno je više Art-Net mrežnih ruta.",
  "artnetRouteSelect').addEventListener('change'",
  'setTimeout(requestDiagnostics,250)',
  "const BRIDGE_KEY='lighting_network_dmx_bridge_v1'",
  'const VERIFIED_BRIDGES=[',
  "id:'aputure-sidus-one'",
  "id:'astera-fp3-datalink'",
  'function selectedBridge()',
  'function renderBridge()',
  "bridgeTitle:'VERIFIKOVANI MREŽNI BRIDŽ'",
  "bridgeTitle:'VERIFIED NETWORK BRIDGE'",
  "artnetOutputArm').addEventListener('change'",
  "const GROUPS_KEY='lighting_control_groups_v1'",
  'function rowKey(r)',
  'function readGroups()',
  'function writeGroups(items)',
  'function groupEligibleRows()',
  'function saveControlGroup()',
  'function applyControlGroup(index)',
  'function renderControlGroups()',
  "groupTitle:'CONTROL GRUPE'",
  "groupTitle:'CONTROL GROUPS'",
  'function requestDiagnostics()',
  'function renderDiagnostics(nativePayload,error)',
  'window.LightingAINetworkDmxDiagnosticsResult',
  "action:'networkDmxDiagnostics'",
  "diagTitle:'DIJAGNOSTIKA KONTROLE'",
  "diagTitle:'CONTROL DIAGNOSTICS'",
  "const SACN_PRIORITY_KEY='lighting_sacn_priority_v1'",
  'function sacnPriority()',
  'function applySacnPriority()',
  'setSacnPriority:function(priority)',
  "action:'sacnSetPriority'",
  "sacnPriority:'sACN PRIORITET'",
  "sacnPriority:'sACN PRIORITY'",
  "diagInterfaces:'LOKALNE MREŽE'",
  "diagInterfaces:'LOCAL NETWORKS'",
  "diagBroadcast:'BROADCAST'",
  "diagMulticast:'MULTICAST'",
  'native&&Array.isArray(native.interfaces)',
  "artnetAutoHint:'AUTO koristi directed broadcast",
  "artnetAutoHint:'AUTO uses active IPv4 directed broadcast routes.",
  "const rawTarget=(E('artnetTarget')&&E('artnetTarget').value||'AUTO').trim()",
  "saved==='255.255.255.255'?'AUTO':saved",
  'function setLiveEnabled(enabled)',
  'function stopLiveForBackground()',
  'artnetSetLiveDmx',
  'networkDmxStopLive',
  'sacnStopLive',
  'function verifiedDimmerEntries()',
  'function applyMasterDimmer(value)',
  'function verifiedCctEntries()',
  'function applyMasterCct(value)',
  'function cctBounds(entries)',
  'function verifiedRgbEntries()',
  'function applyMasterRgb(redValue,greenValue,blueValue)',
  'function controlBitDepth(ctrl)',
  'function writeControlToFrame(targetFrame,address,ctrl,value)',
  'targetFrame[start-1]=(dmx>>8)&255',
  'targetFrame[start]=dmx&255',
  'function applyProfileRequirements(targetFrame,fixtureStart,profile)',
  'profile&&Array.isArray(profile.requiredChannels)'
]) {
  if (!artNetControl.includes(marker)) fail(`cross-platform Art-Net transport marker missing: ${marker}`);
}

const artNetSender = git(['show', 'HEAD:app/src/main/java/com/lightingai/app/ArtNetSender.java']);
for (const marker of [
  'public static final String AUTO_TARGET = "AUTO"',
  'static String normalizeTarget(String targetIp)',
  'static boolean isAutoTarget(String targetIp)',
  'ArtNetDiscovery.directedBroadcastTargets()',
  'No directed IPv4 broadcast target is available'
]) {
  if (!artNetSender.includes(marker)) fail(`Art-Net directed-broadcast sender marker missing: ${marker}`);
}

const artNetLiveEngine = git(['show', 'HEAD:app/src/main/java/com/lightingai/app/ArtNetLiveEngine.java']);
for (const marker of [
  'private static final long PERIOD_MS = 33L',
  'scheduleAtFixedRate(this::tick, 0L, PERIOD_MS, TimeUnit.MILLISECONDS)',
  'ArtNetSender.sendDmx(activeSocket',
  'public void stopAll()',
  'public long packetsSent()',
  'public long packetsFailed()',
  'public long lastSendAtMs()',
  'public String lastError()',
  'return ArtNetSender.normalizeTarget(targetIp)'
]) {
  if (!artNetLiveEngine.includes(marker)) fail(`Art-Net live engine marker missing: ${marker}`);
}

const artNetDiscovery = git(['show', 'HEAD:app/src/main/java/com/lightingai/app/ArtNetDiscovery.java']);
for (const marker of [
  'static byte[] buildPollPacket()',
  'packet[9] = 0x20',
  'static Node parseReply',
  '(data[9] & 0xff) != 0x21',
  'socket.bind(new InetSocketAddress(ArtNetSender.ARTNET_PORT))',
  'static List<InetAddress> broadcastTargets()',
  'static List<InetAddress> directedBroadcastTargets()',
  'address.getBroadcast()',
  '!"255.255.255.255".equals(broadcast.getHostAddress())'
]) {
  if (!artNetDiscovery.includes(marker)) fail(`Art-Net discovery marker missing: ${marker}`);
}

const sacnSender = git(['show', 'HEAD:app/src/main/java/com/lightingai/app/SacnSender.java']);
for (const marker of [
  'public static final int SACN_PORT = 5568',
  'static byte[] buildDmxPacket',
  'writeFlagsAndLength(packet, 16',
  'packet[117] = 0x02',
  'packet[118] = (byte) 0xa1',
  'static String multicastAddress',
  'public static final int DEFAULT_PRIORITY = 100',
  'public static final int MAX_PRIORITY = 200',
  'static int normalizePriority(int priority)',
  'packet[108] = (byte) normalizePriority(priority)'
]) {
  if (!sacnSender.includes(marker)) fail(`sACN sender marker missing: ${marker}`);
}

const sacnLiveEngine = git(['show', 'HEAD:app/src/main/java/com/lightingai/app/SacnLiveEngine.java']);
for (const marker of [
  'private static final long PERIOD_MS = 33L',
  'SacnSender.sendDmx(activeSocket',
  'scheduleAtFixedRate(this::tick, 0L, PERIOD_MS, TimeUnit.MILLISECONDS)',
  'public void stopAll()',
  'SacnSender.sendTermination(',
  'for (int repeat = 0; repeat < 3; repeat++)',
  'public long packetsSent()',
  'public long packetsFailed()',
  'public long lastSendAtMs()',
  'public String lastError()',
  'public void setPriority(int value)',
  'public int priority()',
  'priority.get()'
]) {
  if (!sacnLiveEngine.includes(marker)) fail(`sACN live engine marker missing: ${marker}`);
}

const sacnProtocolTest = git(['show', 'HEAD:app/src/test/java/com/lightingai/app/SacnProtocolTest.java']);
for (const marker of [
  'sacnPacketUsesE131LayersAndDmxStartCode',
  'sacnUsesBigEndianUniverseAndExpectedMulticastAddress',
  'sacnPropertyCountIncludesStartCode',
  'sacnUniverseIsClampedToStandardRange',
  'streamTerminationSetsOptionsBit',
  'sacnPriorityIsEncodedAndClamped'
]) {
  if (!sacnProtocolTest.includes(marker)) fail(`sACN protocol test marker missing: ${marker}`);
}

const artNetProtocolTest = git(['show', 'HEAD:app/src/test/java/com/lightingai/app/ArtNetProtocolTest.java']);
for (const marker of [
  'dmxPacketUsesArtNetHeaderUniverseAndEvenLength',
  'dmxPacketMapsOneBasedUiUniverseToPortAddress',
  'artPollPacketHasCorrectOpcodeAndProtocolVersion',
  'artPollReplyParsesIpAndNames',
  'artPollReplyFallsBackToPacketSourceWhenReplyIpIsZero',
  'invalidReplyIsRejected',
  'automaticDmxTargetMigratesLimitedBroadcastToAuto'
]) {
  if (!artNetProtocolTest.includes(marker)) fail(`Art-Net protocol unit-test marker missing: ${marker}`);
}

const bleControl = git(['show', 'HEAD:app/src/main/assets/ble-control.js']);
for (const marker of [
  "version:'0.1-ble-discovery'",
  'function startScan()',
  'Android.bleDiscover',
  'window.LightingAIBleDiscoveryResult',
  "action:'bleDiscover'",
  'verified official protocol / SDK'
]) {
  if (!bleControl.includes(marker)) fail(`BLE control marker missing: ${marker}`);
}

const bleScanner = git(['show', 'HEAD:app/src/main/java/com/lightingai/app/BleDeviceScanner.java']);
for (const marker of [
  'BluetoothLeScanner',
  'activeScanner.startScan(activeCallback)',
  'activeScanner.stopScan(activeCallback)',
  'result.getRssi()',
  'record.getServiceUuids()',
  'ble_scan_cancelled'
]) {
  if (!bleScanner.includes(marker)) fail(`BLE scanner marker missing: ${marker}`);
}

const networkInterfaceInspector = git(['show', 'HEAD:app/src/main/java/com/lightingai/app/NetworkInterfaceInspector.java']);
for (const marker of [
  'NetworkInterface.getNetworkInterfaces()',
  'network.supportsMulticast()',
  'address instanceof Inet4Address',
  'interfaceAddress.getBroadcast()',
  'item.put("prefixLength"',
  'item.put("multicast", multicast)'
]) {
  if (!networkInterfaceInspector.includes(marker)) fail(`Network DMX interface inspector marker missing: ${marker}`);
}

const plannerLayout = git(['show', 'HEAD:app/src/main/assets/planner-layout-lock.js']);
for (const marker of [
  "const VERSION='1.0-stable-planner-layout'",
  "'setSketchCard'",
  "'sceneMeasureCard'",
  "'projectBackupCard'",
  'window.LightingAIPlannerLayout'
]) {
  if (!plannerLayout.includes(marker)) fail(`planner layout lock marker missing: ${marker}`);
}
const sunNativeBridge = git(['show', 'HEAD:app/src/main/assets/sun-native-bridge.js']);
if (!sunNativeBridge.includes("file:///android_asset/planner-layout-lock.js")) fail('stable Planner layout loader missing');

const mainActivity = git(['show', `HEAD:${mainActivityPath}`]);
for (const marker of [
  'MediaStore.Downloads.EXTERNAL_CONTENT_URI',
  'Environment.DIRECTORY_DOWNLOADS',
  'saveTextDirectlyToDownloads',
  'openCreateDocumentFallback',
  'RecognizerIntent.ACTION_RECOGNIZE_SPEECH',
  '@JavascriptInterface public void startSpeechInput',
  'window.LightingAIVoiceInputResult',
  'SPEECH_INPUT = 506',
  'boolean sceneDescription = "aiv-desc".equals(target) || "planner-description".equals(target);',
  'Opiši scenu',
  'notifyAIVisualPdfResult',
  '@JavascriptInterface public void artNetSetLiveDmx',
  '@JavascriptInterface public void artNetStopLive',
  'artNetLiveEngine.stopAll()',
  '@JavascriptInterface public void artNetDiscover',
  'window.LightingAIArtNetDiscoveryResult',
  '@JavascriptInterface public void sacnSendDmx',
  '@JavascriptInterface public void sacnSetLiveDmx',
  '@JavascriptInterface public void sacnStopLive',
  'loadOrCreateSacnCid()',
  'sacnLiveEngine.stopAll()',
  '@JavascriptInterface public void bleDiscover',
  'window.LightingAIBleDiscoveryResult',
  'Manifest.permission.BLUETOOTH_SCAN',
  'BLE_PERMISSION = 507',
  "file:///android_asset/ble-control.js",
  '@JavascriptInterface public String networkDmxDiagnostics()',
  'artNet.put("livePacketsSent", artNetLiveEngine.packetsSent())',
  'sacn.put("livePacketsSent", sacnLiveEngine == null ? 0 : sacnLiveEngine.packetsSent())',
  'artNetDirectSent.incrementAndGet()',
  'sacnDirectSent.incrementAndGet()',
  '@JavascriptInterface public void sacnSetPriority(int priority)',
  'sacnPriority.set(value)',
  'sacnLiveEngine.setPriority(value)',
  'SacnSender.sendDmx(u, channels, seq, sacnCid, "LightingAI", sacnPriority.get())',
  'sacn.put("priority", sacnPriority.get())',
  'out.put("interfaces", NetworkInterfaceInspector.snapshot())'
]) {
  if (!mainActivity.includes(marker)) fail(`direct Downloads save marker missing: ${marker}`);
}

const imageBridge = git(['show', `HEAD:${imageBridgePath}`]);
for (const marker of [
  '@JavascriptInterface public void savePlanPdf',
  'MediaStore.Downloads.EXTERNAL_CONTENT_URI',
  'PdfDocument',
  'AI PREDLOG POSTAVKE RASVETE',
  'drawSetupMap',
  'drawPlannerSetSketch',
  'SKICA SETA IZ PLANERA',
  'subjectPoints',
  'GLUMCI / SUBJEKTI',
  'SUNCE / PRIRODNO SVETLO',
  'double screenAz =',
  'DMX / KONTROLA',
  'Patch warnings:',
  'notifyPdfResult'
]) {
  if (!imageBridge.includes(marker)) fail(`professional PDF marker missing: ${marker}`);
}

const server = git(['show', `HEAD:${serverPath}`]);
for (const marker of [
  'const normalizedSubjects=',
  'authoritative subject layout from the Planner Set Sketch',
  'lighting_diagram.subjects=normalizedSubjects',
  'validSubjectIds',
  '"targets":["S1"]',
  'Natural Sun context from LightingAI',
  '"sun_notes":""',
  'DMX patch from LightingAI',
  '"dmx_notes":""'
]) {
  if (!server.includes(marker)) fail(`multi-subject backend marker missing: ${marker}`);
}

for (const path of changed.filter((p) => /\.(?:js|json|yml|yaml|html|md|java)$/i.test(p))) {
  if (path === 'backend/project5-stable-base-selftest.js') continue;
  let content = '';
  try { content = git(['show', `HEAD:${path}`]); } catch { continue; }
  if (/\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/.test(content)) fail(`literal OpenAI API key detected in ${path}`);
  if (/OPENAI_API_KEY\s*[:=]\s*['"][^'"]{8,}['"]/.test(content)) fail(`direct OPENAI_API_KEY value detected in ${path}`);
}

console.log(JSON.stringify({
  ok: true,
  suite: 'LightingAI Project 5.4 main-686 stable-base guard',
  legacyStableBase: STABLE_BASE,
  phoneTestedBase: PHONE_TESTED_BASE,
  project54Base: MAIN686_BASE,
  project55Base: PROJECT54_PHONE_BASE,
  backupDownloadsBase: PROJECT55_DP_BASE,
  dpVoiceBase: PROJECT55_BACKUP_BASE,
  professionalPdfBase: PROJECT55_VOICE_BASE,
  multiSubjectBase: PROJECT56_PDF_BASE,
  sunAiBase: PROJECT57_MULTI_BASE,
  dmxAiBase: PROJECT58_SUN_BASE,
  finalQaBase: PROJECT59_DMX_BASE,
  releasePrepBase: PROJECT510_QA_BASE,
  stableBuilds: [510, 655, 686, 701, 713, 721, 727, 739, 746, 753, 762, 767],
  legacyChangedFiles: changedLegacy,
  changedFiles: changed,
  protectedByDefault: 'build 767 final QA feature set remains protected; only scene voice input, release signing configuration/workflow and this guard may change',
  featureSurface: 'Project 5.2 redesign with Planner / Equipment / Control / AI / Tools, safe AI-to-Control staging, verified DMX patch mapping, and explicit confirmation before physical Art-Net/sACN output'
}, null, 2));
