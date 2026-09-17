import { execFileSync } from 'node:child_process';

const STABLE_BASE = '77462ab3cf80c48c5ca0c903486e59919a3bf747';
const PHONE_TESTED_BASE = 'a2913dedf00d8ddf18930e56d6bf2e862993f92c';
const MAIN686_BASE = '9fb1cb24cabf41d45baed2fb6e9cf6c4a737f1a7';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function fail(message) {
  throw new Error(`Project 5.4 main-686 guard failed: ${message}`);
}

for (const [label, sha] of [
  ['stable build 510', STABLE_BASE],
  ['phone-tested build 655', PHONE_TESTED_BASE],
  ['phone-verified Planner build 686', MAIN686_BASE]
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
  ['phone-verified Planner build 686', MAIN686_BASE]
]) {
  try { git(['merge-base', '--is-ancestor', sha, 'HEAD']); }
  catch { fail(`feature branch no longer descends from ${label}`); }
}

const changedLegacy = git(['diff', '--name-only', `${STABLE_BASE}...HEAD`])
  .split('\n').map((x) => x.trim()).filter(Boolean);
const changed = git(['diff', '--name-only', `${MAIN686_BASE}...HEAD`])
  .split('\n').map((x) => x.trim()).filter(Boolean);

const measurePath = 'app/src/main/java/com/lightingai/app/MeasureActivity.java';
const exactAllowed = new Set([
  measurePath,
  'backend/project5-stable-base-selftest.js'
]);
const unexpected = changed.filter((path) => !exactAllowed.has(path));
if (unexpected.length) fail(`files changed outside the isolated Project 5.4 camera-distance surface: ${unexpected.join(', ')}`);

for (const protectedPath of [
  'app/src/main/assets/catalog.js',
  'app/src/main/assets/scene-measure.js',
  'app/src/main/assets/light-calculator.js',
  'app/src/main/assets/project-backup-export.js',
  'app/src/main/assets/ai-visual-scene-launcher.js',
  'app/src/main/assets/ai-visual-scene-plan.js',
  'app/src/main/assets/ai-visual-preview-refinements.js',
  'app/src/main/assets/ai-visual-phone-diagnostics.js',
  'app/src/main/java/com/lightingai/app/MainActivity.java',
  'app/src/main/java/com/lightingai/app/DeviceCapabilities.java',
  'app/src/main/AndroidManifest.xml',
  'backend/server.js',
  'backend/visual-preview.js'
]) {
  const stable = git(['show', `${MAIN686_BASE}:${protectedPath}`]);
  const current = git(['show', `HEAD:${protectedPath}`]);
  if (stable !== current) fail(`build 686 protected file changed unexpectedly: ${protectedPath}`);
}

// Preserve the historical non-destructive catalog contract required by Project 5 safety.
const catalogPath = 'app/src/main/assets/catalog.js';
const stableCatalog = git(['show', `${STABLE_BASE}:${catalogPath}`]);
const currentCatalog = git(['show', `HEAD:${catalogPath}`]);
if (!currentCatalog.includes("file:///android_asset/ai-visual-scene-launcher.js")) {
  fail('catalog.js may not delete stable build 510 code or the isolated AI visual launcher');
}
if (!stableCatalog.trim()) fail('catalog.js may not delete stable build 510 code');

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
  if (!measure.includes(marker)) fail(`DEPTH/fallback marker missing: ${marker}`);
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
  stableBuilds: [510, 655, 686],
  legacyChangedFiles: changedLegacy,
  changedFiles: changed,
  protectedByDefault: 'phone-verified Planner order, catalog, AI visual flow, backup, MainActivity, SUNCE and backend remain byte-for-byte on build 686',
  featureSurface: 'Camera distance: DEPTH16 when supported, tilt geometry fallback otherwise'
}, null, 2));
