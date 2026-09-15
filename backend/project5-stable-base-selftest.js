import { execFileSync } from 'node:child_process';

const STABLE_BASE = '77462ab3cf80c48c5ca0c903486e59919a3bf747';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function fail(message) {
  throw new Error(`Project 5 stable-base guard failed: ${message}`);
}

try {
  git(['cat-file', '-e', `${STABLE_BASE}^{commit}`]);
} catch {
  fail(`stable build 510 commit ${STABLE_BASE} is unavailable; CI checkout must include full history`);
}

try {
  git(['merge-base', '--is-ancestor', STABLE_BASE, 'HEAD']);
} catch {
  fail('feature branch no longer descends from the phone-tested build 510 anchor');
}

const changed = git(['diff', '--name-only', `${STABLE_BASE}...HEAD`])
  .split('\n')
  .map((x) => x.trim())
  .filter(Boolean);

const exactAllowed = new Set([
  '.github/workflows/build-apk.yml',
  'app/src/main/assets/catalog.js',
  'app/src/main/AndroidManifest.xml',
  'app/src/main/java/com/lightingai/app/AIVisualImageBridge.java',
  'app/src/main/java/com/lightingai/app/AIVisualImageProvider.java',
  'app/src/main/java/com/lightingai/app/MainActivity.java',
  'app/src/main/java/com/lightingai/app/MeasureActivity.java',
  'backend/package.json',
  'backend/preview-test-server.js',
  'backend/project5-feature-selftest.js',
  'backend/project5-stable-base-selftest.js',
  'backend/render-bootstrap.js',
  'backend/server.js',
  'backend/visual-preview-selftest.js',
  'backend/visual-preview.js'
]);

function allowed(path) {
  if (exactAllowed.has(path)) return true;
  return /^app\/src\/main\/assets\/ai-visual-[^/]+\.js$/.test(path);
}

const unexpected = changed.filter((path) => !allowed(path));
if (unexpected.length) {
  fail(`stable files changed outside the isolated Project 5 surface: ${unexpected.join(', ')}`);
}

const catalogPath = 'app/src/main/assets/catalog.js';
const expectedLauncherLine = "if(!document.getElementById('lightingai-ai-visual-launcher-script')){var av=document.createElement('script');av.id='lightingai-ai-visual-launcher-script';av.src='file:///android_asset/ai-visual-scene-launcher.js';document.body.appendChild(av);}";
const stableCatalog = git(['show', `${STABLE_BASE}:${catalogPath}`]);
const currentCatalog = git(['show', `HEAD:${catalogPath}`]);
const currentLines = currentCatalog.split('\n');
const launcherCount = currentLines.filter((line) => line === expectedLauncherLine).length;

if (launcherCount !== 1) {
  fail('catalog.js must contain exactly one isolated AI visual launcher loader');
}

const catalogWithoutLauncher = currentLines
  .filter((line) => line !== expectedLauncherLine)
  .join('\n')
  .trim();

if (catalogWithoutLauncher !== stableCatalog.trim()) {
  fail('catalog.js may not delete stable build 510 code or alter it beyond the isolated launcher line');
}

const mainActivityPath = 'app/src/main/java/com/lightingai/app/MainActivity.java';
const imageBridgeLine = '        webView.addJavascriptInterface(new AIVisualImageBridge(this), "LightingAIImages");';
const imageCallbackBlock = `
    void notifyAIVisualImageResult(String quotedAction, boolean ok) {
        if (webView == null) return;
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIVisualImageResult&&window.LightingAIVisualImageResult(" + quotedAction + "," + (ok ? "true" : "false") + ");",
            null));
    }
`;
const stableMainActivity = git(['show', `${STABLE_BASE}:${mainActivityPath}`]);
const currentMainActivity = git(['show', `HEAD:${mainActivityPath}`]);
const mainWithoutImageBridge = currentMainActivity.replace(imageBridgeLine + '\n', '').replace(imageCallbackBlock, '');
if (mainWithoutImageBridge.trim() !== stableMainActivity.trim()) {
  fail('MainActivity may only add the isolated AI image bridge and result callback');
}

const manifestPath = 'app/src/main/AndroidManifest.xml';
const imageProviderLine = '        <provider android:name=".AIVisualImageProvider" android:authorities="${applicationId}.ai.preview" android:exported="false" android:grantUriPermissions="true"/>';
const stableManifest = git(['show', `${STABLE_BASE}:${manifestPath}`]);
const currentManifest = git(['show', `HEAD:${manifestPath}`]);
if (currentManifest.replace(imageProviderLine + '\n', '').trim() !== stableManifest.trim()) {
  fail('AndroidManifest may only add the isolated AI image sharing provider');
}

const measureActivityPath = 'app/src/main/java/com/lightingai/app/MeasureActivity.java';
const measureActivity = git(['show', `HEAD:${measureActivityPath}`]);
for (const marker of [
  'private boolean cameraOpening = false;',
  'startCameraThread();',
  'if (cameraDevice != null || cameraOpening) return;',
  'cameraOpening = true;',
  'cameraOpening = false;',
  'int rotation = (displayDegrees - sensorOrientation + 360) % 360;'
]) {
  if (!measureActivity.includes(marker)) fail(`PRO camera lifecycle protection missing: ${marker}`);
}

// Secret guard: scan changed Project 5 text files for literal credentials.
const textFiles = changed.filter((path) => /\.(?:js|json|yml|yaml|html|md)$/i.test(path));
for (const path of textFiles) {
  if (path === 'backend/project5-stable-base-selftest.js') continue;
  let content = '';
  try {
    content = git(['show', `HEAD:${path}`]);
  } catch {
    continue;
  }
  if (/\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/.test(content)) {
    fail(`literal OpenAI API key detected in ${path}`);
  }
  if (/OPENAI_API_KEY\s*[:=]\s*['"][^'"]{8,}['"]/.test(content)) {
    fail(`direct OPENAI_API_KEY value detected in ${path}; credentials must remain environment-only`);
  }
}

console.log(JSON.stringify({
  ok: true,
  suite: 'LightingAI Project 5 stable-base guard',
  stableBase: STABLE_BASE,
  changedFiles: changed,
  catalogProtection: 'feature catalog becomes byte-identical to build 510 when the one allowed launcher line is removed',
  secretProtection: 'changed Project 5 text files reject literal OpenAI API keys and direct OPENAI_API_KEY assignments',
  protectedByDefault: 'all files not explicitly allowlisted remain byte-for-byte on the build 510 side of the branch diff'
}, null, 2));
