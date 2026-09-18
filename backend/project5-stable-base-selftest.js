import { execFileSync } from 'node:child_process';

const STABLE_BASE = '77462ab3cf80c48c5ca0c903486e59919a3bf747';
const PHONE_TESTED_BASE = 'a2913dedf00d8ddf18930e56d6bf2e862993f92c';
const MAIN686_BASE = '9fb1cb24cabf41d45baed2fb6e9cf6c4a737f1a7';
const PROJECT54_PHONE_BASE = '3827f81400ff8abd1e83e6b8e416f8ee628fce94';
const PROJECT55_DP_BASE = 'a79fdeca7db3ddf0c153589b58639a84b5b65628';

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
  ['Project 5.5 DP main build 713', PROJECT55_DP_BASE]
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
  ['Project 5.5 DP main build 713', PROJECT55_DP_BASE]
]) {
  try { git(['merge-base', '--is-ancestor', sha, 'HEAD']); }
  catch { fail(`feature branch no longer descends from ${label}`); }
}

const changedLegacy = git(['diff', '--name-only', `${STABLE_BASE}...HEAD`])
  .split('\n').map((x) => x.trim()).filter(Boolean);
const changed = git(['diff', '--name-only', `${PROJECT55_DP_BASE}...HEAD`])
  .split('\n').map((x) => x.trim()).filter(Boolean);

const measurePath = 'app/src/main/java/com/lightingai/app/MeasureActivity.java';
const aiPlanPath = 'app/src/main/assets/ai-visual-scene-plan.js';
const backupPath = 'app/src/main/assets/project-backup-export.js';
const mainActivityPath = 'app/src/main/java/com/lightingai/app/MainActivity.java';
const exactAllowed = new Set([
  backupPath,
  mainActivityPath,
  'backend/project5-stable-base-selftest.js'
]);
const unexpected = changed.filter((path) => !exactAllowed.has(path));
if (unexpected.length) fail(`files changed outside the isolated Project 5.4 camera-distance surface: ${unexpected.join(', ')}`);

for (const protectedPath of [
  'app/src/main/assets/catalog.js',
  'app/src/main/assets/scene-measure.js',
  'app/src/main/assets/light-calculator.js',
  'app/src/main/assets/ai-visual-scene-launcher.js',
  'app/src/main/assets/ai-visual-preview-refinements.js',
  'app/src/main/assets/ai-visual-phone-diagnostics.js',
  'app/src/main/java/com/lightingai/app/DeviceCapabilities.java',
  'app/src/main/AndroidManifest.xml',
  'backend/server.js',
  'backend/visual-preview.js'
]) {
  const stable = git(['show', `${PROJECT55_DP_BASE}:${protectedPath}`]);
  const current = git(['show', `HEAD:${protectedPath}`]);
  if (stable !== current) fail(`build 713 protected file changed unexpectedly: ${protectedPath}`);
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
  "dpRequestVersion:'0.5-dp-request'"
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

const mainActivity = git(['show', `HEAD:${mainActivityPath}`]);
for (const marker of [
  'MediaStore.Downloads.EXTERNAL_CONTENT_URI',
  'Environment.DIRECTORY_DOWNLOADS',
  'saveTextDirectlyToDownloads',
  'openCreateDocumentFallback'
]) {
  if (!mainActivity.includes(marker)) fail(`direct Downloads save marker missing: ${marker}`);
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
  stableBuilds: [510, 655, 686, 701, 713],
  legacyChangedFiles: changedLegacy,
  changedFiles: changed,
  protectedByDefault: 'build 713 AI/Planner/catalog/SUNCE/backend and phone-tested build 701 camera measurement remain protected; only backup export text and MainActivity Downloads save path may change',
  featureSurface: 'Project Backup saves directly into Android Downloads / Preuzimanja with picker fallback on older Android'
}, null, 2));
