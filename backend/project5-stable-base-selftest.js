import { execFileSync } from 'node:child_process';

const STABLE_BASE = '77462ab3cf80c48c5ca0c903486e59919a3bf747';
const PHONE_TESTED_BASE = 'a2913dedf00d8ddf18930e56d6bf2e862993f92c';
const PROJECT54_BASE = 'bf4b619ec96dfe24d979b65088ea428b3217c7d6';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function fail(message) {
  throw new Error(`Project 5.4 stable-base guard failed: ${message}`);
}

for (const [label, sha] of [
  ['stable build 510', STABLE_BASE],
  ['phone-tested build 655', PHONE_TESTED_BASE],
  ['Project 5.3 main build 665', PROJECT54_BASE]
]) {
  try {
    git(['cat-file', '-e', `${sha}^{commit}`]);
  } catch {
    fail(`${label} commit ${sha} is unavailable; CI checkout must include full history`);
  }
}

// Keep this explicit historical check because Project 5 safety verifies the build-510 contract textually.
try {
  git(['merge-base', '--is-ancestor', STABLE_BASE, 'HEAD']);
} catch {
  fail('feature branch no longer descends from the stable build 510 anchor');
}

for (const [label, sha] of [
  ['phone-tested build 655', PHONE_TESTED_BASE],
  ['Project 5.3 main build 665', PROJECT54_BASE]
]) {
  try {
    git(['merge-base', '--is-ancestor', sha, 'HEAD']);
  } catch {
    fail(`feature branch no longer descends from the ${label} anchor`);
  }
}

const changedLegacy = git(['diff', '--name-only', `${STABLE_BASE}...HEAD`])
  .split('\n')
  .map((x) => x.trim())
  .filter(Boolean);

const changed = git(['diff', '--name-only', `${PROJECT54_BASE}...HEAD`])
  .split('\n')
  .map((x) => x.trim())
  .filter(Boolean);

const exactAllowed = new Set([
  'app/src/main/java/com/lightingai/app/MeasureActivity.java',
  'app/src/main/assets/catalog.js',
  'backend/project5-stable-base-selftest.js'
]);

const unexpected = changed.filter((path) => !exactAllowed.has(path));
if (unexpected.length) {
  fail(`files changed outside the isolated Project 5.4 camera-distance/catalog-retry surface: ${unexpected.join(', ')}`);
}

for (const protectedPath of [
  'app/src/main/assets/ai-visual-scene-launcher.js',
  'app/src/main/assets/ai-visual-scene-plan.js',
  'app/src/main/assets/ai-visual-preview-refinements.js',
  'app/src/main/assets/ai-visual-phone-diagnostics.js',
  'app/src/main/assets/scene-measure.js',
  'app/src/main/assets/project-backup-export.js',
  'app/src/main/java/com/lightingai/app/MainActivity.java',
  'app/src/main/java/com/lightingai/app/DeviceCapabilities.java',
  'app/src/main/AndroidManifest.xml',
  'backend/server.js',
  'backend/visual-preview.js'
]) {
  const stable = git(['show', `${PROJECT54_BASE}:${protectedPath}`]);
  const current = git(['show', `HEAD:${protectedPath}`]);
  if (stable !== current) fail(`Project 5.3 build 665 file changed unexpectedly: ${protectedPath}`);
}

const catalogPath = 'app/src/main/assets/catalog.js';
const stableCatalog = git(['show', `${STABLE_BASE}:${catalogPath}`]);
const currentCatalog = git(['show', `HEAD:${catalogPath}`]);
if (!currentCatalog.includes("file:///android_asset/ai-visual-scene-launcher.js")) {
  fail('catalog.js may not delete stable build 510 code or the isolated AI visual launcher');
}
if (!stableCatalog.trim()) {
  fail('catalog.js may not delete stable build 510 code');
}
for (const marker of [
  'window.loadLightingAICatalog=function(attempt)',
  "fetch(url,{cache:'no-store'})",
  'setTimeout(function(){window.loadLightingAICatalog(attempt+1);},delay)',
  'PONOVO UČITAJ KATALOG',
  "window.addEventListener('online'"
]) {
  if (!currentCatalog.includes(marker)) fail(`catalog retry marker missing: ${marker}`);
}

const backupPath = 'app/src/main/assets/project-backup-export.js';
const backup = git(['show', `HEAD:${backupPath}`]);
for (const marker of [
  "schema:'lightingai-project-backup-v1'",
  "restoreSupported:true",
  "version:'2.0-safe-two-step-import'",
  'validateImportObject',
  'stageImportText',
  'applyImport',
  "k==='lighting_language_v1'",
  'BLOCK.test(k)',
  'MAX_IMPORT_CHARS',
  'MAX_IMPORT_KEYS'
]) {
  if (!backup.includes(marker)) fail(`safe backup import marker missing: ${marker}`);
}

const measurePath = 'app/src/main/java/com/lightingai/app/MeasureActivity.java';
const measure = git(['show', `HEAD:${measurePath}`]);
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
  if (!measure.includes(marker)) fail(`Project 5.4 DEPTH/fallback marker missing: ${marker}`);
}

const textFiles = changed.filter((path) => /\.(?:js|json|yml|yaml|html|md|java)$/i.test(path));
for (const path of textFiles) {
  if (path === 'backend/project5-stable-base-selftest.js') continue;
  let content = '';
  try { content = git(['show', `HEAD:${path}`]); } catch { continue; }
  if (/\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/.test(content)) fail(`literal OpenAI API key detected in ${path}`);
  if (/OPENAI_API_KEY\s*[:=]\s*['"][^'"]{8,}['"]/.test(content)) fail(`direct OPENAI_API_KEY value detected in ${path}`);
}

console.log(JSON.stringify({
  ok: true,
  suite: 'LightingAI Project 5.4 stable-base guard',
  legacyStableBase: STABLE_BASE,
  phoneTestedBase: PHONE_TESTED_BASE,
  project54Base: PROJECT54_BASE,
  stableBuilds: [510, 655, 665],
  legacyChangedFiles: changedLegacy,
  changedFiles: changed,
  protectedByDefault: 'AI visual flow, Planner bridge, Project Backup, MainActivity, device capabilities, SUNCE and backend remain byte-for-byte on the merged build 665 baseline',
  featureSurface: 'Camera distance: DEPTH16 when supported, tilt geometry fallback otherwise; equipment catalog adds bounded retry for Render cold starts'
}, null, 2));
