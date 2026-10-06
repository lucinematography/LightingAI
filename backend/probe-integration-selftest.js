import { execFileSync } from 'node:child_process';

const CONTROL_BASE='94f275f579399b26f8bd1c882b2a32a59bc4684a';

function git(args){return execFileSync('git',args,{encoding:'utf8'}).trim();}
function fail(message){throw new Error('Light AI Proba integration guard failed: '+message);}
function existsAt(ref,path){
  try{execFileSync('git',['cat-file','-e',`${ref}:${path}`],{stdio:'ignore'});return true;}
  catch{return false;}
}

try{git(['cat-file','-e',`${CONTROL_BASE}^{commit}`]);}
catch{fail('verified CONTROL base is unavailable; checkout must include full history');}
try{git(['merge-base','--is-ancestor',CONTROL_BASE,'HEAD']);}
catch{fail('Probe no longer descends from verified CONTROL base');}

const allowed=new Set([
  '.github/workflows/build-light-ai-probe.yml',
  '.github/light-ai-probe-test-keystore.b64',
  'app/build.gradle',
  'app/src/main/AndroidManifest.xml',
  'app/src/main/assets/catalog.js',
  'app/src/main/assets/index.html',
  'backend/control-system-drivers-selftest.js',
  'backend/build-equipment-catalog-snapshot.js',
  'backend/catalog-runtime.js',
  'backend/creamsource-vortex-library.js',
  'backend/rotolight-app-wireless-library.js',
  'backend/luxli-orchestra-bluetooth-library.js',
  'backend/quasar-rainbow-wireless-library.js',
  'backend/kelvin-narrator-bluetooth-library.js',
  'backend/smallrig-ble-library.js',
  'backend/amaran-sidus-wireless-library.js',
  'backend/neewer-bluetooth-library.js',
  'backend/gvm-wireless-library.js',
  'backend/litepanels-wireless-library.js',
  'backend/dmg-mix-wireless-library.js',
  'backend/zhiyun-bluetooth-library.js',
  'backend/prolycht-orion-wireless-library.js',
  'backend/colbor-bluetooth-library.js',
  'backend/sirui-bluetooth-library.js',
  'backend/fiilex-matrix-wifi-library.js',
  'backend/harlowe-bluetooth-library.js',
  'backend/swit-bluetooth-library.js',
  'backend/dracast-bluetooth-library.js',
  'backend/hive-bluetooth-library.js',
  'backend/kinotehnik-practilite-bluetooth-library.js',
  'backend/velvet-evo-wireless-library.js',
  'backend/viltrox-bluetooth-library.js',
  'backend/phottix-bluetooth-library.js',
  'backend/yongnuo-bluetooth-library.js',
  'backend/pixel-bluetooth-library.js',
  'backend/falcon-eyes-bluetooth-library.js',
  'backend/lishuai-lightreel-bluetooth-library.js',
  'backend/nicefoto-tc-bluetooth-library.js',
  'backend/ulanzi-connect-bluetooth-library.js',
  'backend/came-tv-wifi-library.js',
  'backend/soonwell-g900-bluetooth-library.js',
  'backend/tolifo-gk2016-wifi-library.js',
  'backend/moman-pc8-bluetooth-library.js',
  'backend/ikan-idc150-bluetooth-library.js',
  'backend/jinbei-bluetooth-library.js',
  'backend/lume-cube-bluetooth-library.js',
  'backend/chauvet-dj-bluetooth-library.js',
  'backend/fotodiox-prizmo-bluetooth-library.js',
  'backend/broncolor-led-f160-wifi-library.js',
  'backend/genaray-rgb-bluetooth-library.js',
  'backend/elgato-wifi-library.js',
  'backend/westcott-studiolink-bluetooth-library.js',
  'app/src/main/assets/gel-filter-catalog.js',
  'backend/gel-filter-catalog-builder.js',
  'backend/gel-filter-integration-selftest.js',
  'backend/gel-filter-selftest.js',
  'backend/package.json',
  'backend/package-lock.json',
  'backend/project5-stable-base-selftest.js',
  'backend/probe-integration-selftest.js',
  'backend/nanlite-alien-current-library.js',
  'backend/nanlite-catalog-selftest.js',
  'backend/nanlite-compac-current-library.js',
  'backend/nanlite-compac-daylight-legacy-library.js',
  'backend/nanlite-creator-compact-library.js',
  'backend/nanlite-creator-handheld-library.js',
  'backend/nanlite-fc-720-library.js',
  'backend/nanlite-fc-high-output-library.js',
  'backend/nanlite-fm-current-library.js',
  'backend/nanlite-forza-150b-legacy-library.js',
  'backend/nanlite-forza-60-legacy-library.js',
  'backend/nanlite-forza-720b-library.js',
  'backend/nanlite-forza-bowens-legacy-library.js',
  'backend/nanlite-forza-daylight-library.js',
  'backend/nanlite-forza-ii-library.js',
  'backend/nanlite-fs-current-library.js',
  'backend/nanlite-fs-legacy-library.js',
  'backend/nanlite-halo-legacy-library.js',
  'backend/nanlite-litolite-early-legacy-library.js',
  'backend/nanlite-litolite-legacy-library.js',
  'backend/nanlite-lumipad-current-library.js',
  'backend/nanlite-miro-current-library.js',
  'backend/nanlite-mixpad-library.js',
  'backend/nanlite-mixpanel-legacy-library.js',
  'backend/nanlite-pavobulb-current-library.js',
  'backend/nanlite-pavoslim-60-120-library.js',
  'backend/nanlite-pavoslim-extended-library.js',
  'backend/nanlite-pavotube-10-current-library.js',
  'backend/nanlite-pavotube-ii-c-library.js',
  'backend/nanlite-pavotube-ii-xr-library.js',
  'backend/nanlite-pavotube-t8-7x-library.js',
  'backend/nanlite-pavotube-x-legacy-library.js',
  'backend/nanlite-sa-legacy-library.js',
  'backend/nanlite-tk-legacy-library.js',
  'app/src/main/assets/control-bootstrap.js',
  'app/src/main/assets/control-routing.js',
  'app/src/main/assets/control-dashboard.js',
  'app/src/main/assets/control-system-drivers.js',
  'backend/control-production-selftest.js',
  'backend/control-operator-desk-selftest.js',
  'backend/full-app-critical-selftest.js',
  'backend/control-wireless-catalog-audit.js',
  'backend/aputure-wireless-verification.js',
  'backend/aputure-control-verification.js',
  'backend/godox-control-verification.js',
  'backend/arri-wireless-verification.js',
  'backend/aladdin-control-verification.js',
  'backend/nanlite-wireless-verification.js',
  'backend/evlight-wireless-verification.js',
  'backend/astera-wireless-verification.js',
  'backend/astera-ax9-powerpar-library.js',
  'backend/astera-hyperiontube-library.js',
  'backend/astera-ax1-pixeltube-library.js',
  'backend/astera-ax2-pixelbar-library.js',
  'backend/astera-ax5-triplepar-library.js',
  'backend/vendor-wireless-protocol-status.js',
  'backend/vendor-wireless-protocol-status-selftest.js',
  'backend/vendor-wireless-capture-plans.js',
  'backend/vendor-wireless-capture-plans-selftest.js',
  'backend/vendor-wireless-coverage-selftest.js',
  'backend/vendor-wireless-readiness-report.js',
  'backend/vendor-wireless-readiness-report-selftest.js',
  'backend/fixture-control-capabilities.js',
  'backend/fixture-control-capabilities-selftest.js',
  'backend/operator-control-planning-report.js',
  'backend/operator-control-planning-report-selftest.js',
  'backend/wireless-control-capability-gap-report.js',
  'backend/wireless-control-capability-gap-report-selftest.js',
  'backend/wireless-fixture-class-coverage-report.js',
  'backend/wireless-fixture-class-coverage-selftest.js',
  'backend/wireless-route-classification.js',
  'backend/wireless-route-classification-selftest.js',
  'backend/fixture-structural-classification.js',
  'backend/fixture-structural-classification-selftest.js',
  '.github/workflows/build-apk.yml',
  'backend/aputure-wireless-verification-selftest.js',
  'backend/aladdin-wireless-verification-selftest.js',
  'backend/arri-wireless-verification-selftest.js',
]);

const changed=git(['diff','--name-only',`${CONTROL_BASE}...HEAD`]).split('\n').map(x=>x.trim()).filter(Boolean);
const unexpected=changed.filter(p=>!allowed.has(p));
if(unexpected.length) fail('unexpected files changed after verified CONTROL base: '+unexpected.join(', '));

const mustRemainIdentical=[
  'app/src/main/assets/ble-control.js',
  'app/src/main/java/com/lightingai/app/BleDeviceScanner.java',
  'app/src/main/java/com/lightingai/app/BleGattInspector.java',
  'app/src/main/java/com/lightingai/app/AsteraBtbBondManager.java',
  'app/src/main/java/com/lightingai/app/AsteraBtbClassicInspector.java',
  'backend/astera-btsnoop-analyzer.js',
  'backend/astera-att-diff.js',
  'backend/astera-att-consensus.js',
  'backend/astera-att-session-consensus.js',
  'backend/astera-att-session-filter.js',
  'backend/astera-att-sweep.js',
  'backend/astera-physical-capture-set.js',
  'backend/control-catalog-audit.js'
]
for(const path of mustRemainIdentical){
  if(!existsAt(CONTROL_BASE,path)||!existsAt('HEAD',path)) fail('required CONTROL file missing: '+path);
  if(git(['show',`${CONTROL_BASE}:${path}`])!==git(['show',`HEAD:${path}`])) fail('verified CONTROL file changed in Probe: '+path);
}

const controlDrivers=git(['show','HEAD:app/src/main/assets/control-system-drivers.js']);
for(const marker of ["version:'3.0-vendor-wireless'","transport:'bluetooth'","transport:'wifi'"])
  if(!controlDrivers.includes(marker)) fail('vendor-wireless driver marker missing: '+marker);

const controlRouting=git(['show','HEAD:app/src/main/assets/control-routing.js']);
for(const marker of ["version:'3.0-vendor-wireless'","vendor-wireless","NO VERIFIED BLUETOOTH / WI-FI ROUTE"])
  if(!controlRouting.includes(marker)) fail('vendor-wireless routing marker missing: '+marker);

const controlDashboard=git(['show','HEAD:app/src/main/assets/control-dashboard.js']);
for(const marker of ["version:'0.30-vendor-wireless-control'","BLUETOOTH / BLE","WI-FI","Wi-Fi se ne skenira generički"])
  if(!controlDashboard.includes(marker)) fail('vendor-wireless dashboard marker missing: '+marker);

const controlBootstrap=git(['show','HEAD:app/src/main/assets/control-bootstrap.js']);
if(!controlBootstrap.includes("window.LightingAIControlBootstrapMode='vendor-wireless'"))
  fail('Probe CONTROL bootstrap is not vendor-wireless');
for(const forbidden of ['artnet-control.js','dmx-patch-planner.js','dmx-export.js'])
  if(controlBootstrap.includes(forbidden)) fail('removed network/DMX asset returned to bootstrap: '+forbidden);

for(const removed of [
  'app/src/main/assets/artnet-control.js',
  'app/src/main/assets/dmx-patch-planner.js',
  'app/src/main/assets/dmx-export.js',
  'app/src/main/java/com/lightingai/app/ArtNetSender.java',
  'app/src/main/java/com/lightingai/app/ArtNetLiveEngine.java',
  'app/src/main/java/com/lightingai/app/ArtNetDiscovery.java',
  'app/src/main/java/com/lightingai/app/SacnSender.java',
  'app/src/main/java/com/lightingai/app/SacnLiveEngine.java'
]){
  if(existsAt('HEAD',removed)) fail('removed network/DMX runtime was resurrected: '+removed);
}

const gradle=git(['show','HEAD:app/build.gradle']);
for(const marker of [
  "applicationId 'com.lightingai.probe'",
  "probeAppLabel = String.valueOf(project.findProperty('probeAppLabel') ?: 'Light AI Proba')",
  "resValue 'string', 'app_name', probeAppLabel"
]) if(!gradle.includes(marker)) fail('Probe Gradle identity marker missing: '+marker);

const manifest=git(['show','HEAD:app/src/main/AndroidManifest.xml']);
const controlManifest=git(['show',`${CONTROL_BASE}:app/src/main/AndroidManifest.xml`]);
if(!manifest.includes('android:label="@string/app_name"')) fail('Probe manifest app label missing');
if(manifest.replace('android:label="@string/app_name"','android:label="LIGHTING AI"')!==controlManifest)
  fail('Probe manifest changed outside app label');

const index=git(['show','HEAD:app/src/main/assets/index.html']);
if(!index.includes('equipment-catalog-snapshot.js')) fail('embedded equipment catalog script is not loaded');

const catalog=git(['show','HEAD:app/src/main/assets/catalog.js']);
for(const marker of ["maker(x)==='nanlite'","window.LightingAIEmbeddedCatalog","setCatalogManufacturer(\\'nanlite\\')"])
  if(!catalog.includes(marker)) fail('Nanlite/embedded catalog marker missing: '+marker);

const runtime=git(['show','HEAD:backend/catalog-runtime.js']);
for(const marker of [
  "NANLITE_FM_CURRENT_FIXTURES",
  "NANLITE_PAVOTUBE_II_XR_FIXTURES",
  "normalizeDeSistiControl(fixtures)",
  "normalizeGodoxControl(fixtures)",
  "normalizeAladdinControl(fixtures)",
  "qualifyLiteGearSpectrumG2Profiles(fixtures)",
  "normalizeKinoFloControl(fixtures)"
]) if(!runtime.includes(marker)) fail('merged runtime marker missing: '+marker);

console.log(JSON.stringify({
  ok:true,
  suite:'Light AI Proba integration guard',
  controlBase:CONTROL_BASE,
  changedFiles:changed.length,
  protectedControlFiles:mustRemainIdentical.length,
  controlMode:'vendor-wireless-bluetooth-wifi',
  networkRuntime:'absent-as-verified',
  applicationId:'com.lightingai.probe',
  appLabel:'Light AI Proba'
},null,2));
