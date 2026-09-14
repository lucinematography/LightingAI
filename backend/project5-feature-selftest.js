import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) throw new Error(`Project 5 safety check failed: ${label}`);
};
const forbidText = (text, needle, label) => {
  if (text.includes(needle)) throw new Error(`Project 5 safety check failed: ${label}`);
};
const assert = (condition, label) => {
  if (!condition) throw new Error(`Project 5 runtime routing check failed: ${label}`);
};

const launcher = read('app/src/main/assets/ai-visual-scene-launcher.js');
const moduleJs = read('app/src/main/assets/ai-visual-scene-plan.js');
const simulation = read('app/src/main/assets/ai-visual-local-simulation.js');
const polish = read('app/src/main/assets/ai-visual-result-polish.js');
const phoneDiagnostics = read('app/src/main/assets/ai-visual-phone-diagnostics.js');
const phoneTest = read('app/src/main/assets/ai-visual-phone-test.js');
const previewServer = read('backend/preview-test-server.js');
const bootstrap = read('backend/render-bootstrap.js');
const stableBaseGuard = read('backend/project5-stable-base-selftest.js');
const packageJson = read('backend/package.json');
const workflow = read('.github/workflows/build-apk.yml');

requireText(launcher, "var PROD_API='https://lightingai.onrender.com';", 'production API anchor missing');
requireText(launcher, "var PREVIEW_TEST_API='https://lightingai-ai-preview-test.onrender.com';", 'isolated preview API missing');
requireText(launcher, "data.environment==='isolated-test'", 'preview capability must require isolated-test identity');
requireText(launcher, "method!=='GET'&&!previewCapabilityVerified", 'unverified preview POST must remain blocked');
requireText(launcher, "'/api/lighting-plan'", 'lighting-plan routing hook missing');
requireText(launcher, "file:///android_asset/ai-visual-local-simulation.js", 'local simulation loader missing');
requireText(launcher, "file:///android_asset/ai-visual-result-polish.js", 'result polish loader missing');
requireText(launcher, "file:///android_asset/ai-visual-phone-diagnostics.js", 'phone diagnostics loader missing');
requireText(launcher, "file:///android_asset/feature-build-info.js", 'embedded build identity loader missing');
requireText(launcher, 'P5 TEST • BUILD ', 'visible Project 5 build diagnostic missing');
requireText(launcher, 'LightingAIFeatureBuild', 'feature build metadata hook missing');

requireText(moduleJs, "var API_BASE='https://lightingai.onrender.com';", 'AI plan must keep production API base');
requireText(moduleJs, "capture=\"environment\"", 'direct scene camera capture missing');
requireText(moduleJs, "visualPreviewAvailable:false", 'real photo preview must default to unavailable');

for (const preset of ['Natural','Cinematic','Moody','High Contrast','Soft Commercial','Day for Night']) {
  requireText(simulation, `'${preset}'`, `look preset missing: ${preset}`);
}
requireText(simulation, 'max="150"', 'simulation intensity maximum must remain 150%');
requireText(simulation, 'Nije fotometrijsko merenje', 'conceptual simulation disclaimer missing');
requireText(polish, 'KOPIRAJ AI PLAN', 'copy-plan action missing');

requireText(phoneDiagnostics, 'OTVORI DIJAGNOSTIKU', 'phone diagnostics button missing');
requireText(phoneDiagnostics, "getAttribute('capture')", 'camera diagnostic missing');
requireText(phoneDiagnostics, "getAttribute('accept')", 'gallery diagnostic missing');
requireText(phoneDiagnostics, 'LightingAILocalLightSimulation', 'simulation diagnostic missing');
requireText(phoneDiagnostics, 'LightingAIVisualResultPolish', 'result polish diagnostic missing');
requireText(phoneDiagnostics, 'KOPIRAJ IZVEŠTAJ', 'copy diagnostics report action missing');
requireText(phoneDiagnostics, "PREVIEW_API+'/api/visual-preview'", 'isolated preview diagnostic probe missing');
requireText(phoneDiagnostics, "file:///android_asset/ai-visual-phone-test.js", 'guided phone test loader missing');
forbidText(phoneDiagnostics, '/api/lighting-plan', 'phone diagnostics must never call the lighting plan API');

requireText(phoneTest, 'POKRENI TEST TELEFONA', 'guided phone test button missing');
requireText(phoneTest, 'KOPIRAJ TEST IZVEŠTAJ', 'copy phone test report action missing');
requireText(phoneTest, 'localStorage', 'phone test results must persist per build');
requireText(phoneTest, "STORAGE_PREFIX='lightingai:p5-phone-test:'", 'phone test build-scoped storage key missing');
requireText(phoneTest, 'GENERIŠI AI VIZUELNI PLAN', 'AI-plan manual test step missing');
requireText(phoneTest, 'SLIKAJ SCENU', 'camera manual test step missing');
requireText(phoneTest, 'AI simulacija ON/OFF', 'simulation manual test step missing');
forbidText(phoneTest, '/api/lighting-plan', 'guided phone test must never call the lighting plan API');
forbidText(phoneTest, '/api/visual-preview', 'guided phone test must never call the visual preview API');

requireText(previewServer, "environment: 'isolated-test'", 'test backend identity missing');
requireText(previewServer, 'previewConfigured', 'test backend configured-state guard missing');
requireText(bootstrap, 'LIGHTINGAI_PREVIEW_TEST', 'isolated Render bootstrap flag missing');

requireText(stableBaseGuard, "const STABLE_BASE = '77462ab3cf80c48c5ca0c903486e59919a3bf747';", 'build 510 stable anchor missing from guard');
requireText(stableBaseGuard, "git(['merge-base', '--is-ancestor', STABLE_BASE, 'HEAD'])", 'stable-base ancestry check missing');
requireText(stableBaseGuard, "git(['diff', '--name-only', `${STABLE_BASE}...HEAD`])", 'stable-base changed-file guard missing');
requireText(stableBaseGuard, 'catalog.js may not delete stable build 510 code', 'catalog non-destructive guard missing');
requireText(packageJson, '"test:project5-base":"node project5-stable-base-selftest.js"', 'stable-base npm test command missing');

requireText(workflow, 'Embed Project 5 build identity', 'CI build identity step missing');
requireText(workflow, 'GITHUB_RUN_NUMBER', 'CI run number must be embedded in test APK');
requireText(workflow, 'feature-build-info.js', 'CI generated build metadata asset missing');
requireText(workflow, 'fetch-depth: 0', 'CI must fetch history for stable-base verification');
requireText(workflow, 'Validate Project 5 stable build 510 base', 'CI stable-base guard step missing');
requireText(workflow, 'npm run test:project5-base', 'CI must execute stable-base guard');

forbidText(launcher, "PREVIEW_TEST_API+'/api/lighting-plan'", 'lighting-plan must never route to isolated preview service');

// Runtime routing contract. Execute the real launcher with a fake DOM/network layer.
const calls = [];
const PROD_API = 'https://lightingai.onrender.com';
const PREVIEW_TEST_API = 'https://lightingai-ai-preview-test.onrender.com';
const fakeNativeFetch = async (input, init) => {
  const url = typeof input === 'string' ? input : String(input?.url || '');
  calls.push({ url, init: init ? { ...init } : undefined });
  if (url === PREVIEW_TEST_API + '/api/visual-preview') {
    return new Response(JSON.stringify({ ok: true, environment: 'isolated-test' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
const runtimeWindow = {
  fetch: fakeNativeFetch,
  currentLang: 'sr',
  LightingAIFeatureBuild: { run: 'test', sha: 'runtime', branch: 'feature/ai-visual-scene-plan' },
  LightingAILocalLightSimulation: { getPreset: () => 'Moody' },
  LightingAIVisualResultPolish: {},
  LightingAIProject5Diagnostics: {},
  LightingAIVisualScenePlan: { open: () => {} },
};
const runtimeDocument = {
  readyState: 'loading',
  addEventListener: () => {},
  getElementById: () => null,
  body: { appendChild: () => {} },
};
const context = {
  window: runtimeWindow,
  document: runtimeDocument,
  console,
  Response,
  Request,
  Promise,
  JSON,
  Object,
  String,
  Array,
  setTimeout: () => 0,
  clearTimeout: () => {},
};
vm.runInNewContext(launcher, context, { filename: 'ai-visual-scene-launcher.js' });
runtimeWindow.LightingAIVisualSceneLauncher.open();

calls.length = 0;
await runtimeWindow.fetch('https://example.com/untouched', { method: 'GET' });
assert(calls.length === 1 && calls[0].url === 'https://example.com/untouched', 'unrelated fetch must pass through unchanged');

calls.length = 0;
await runtimeWindow.fetch(PROD_API + '/api/lighting-plan', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ scenePhoto: 'data:image/jpeg;base64,AA==' }),
});
assert(calls.length === 1 && calls[0].url === PROD_API + '/api/lighting-plan', 'lighting-plan must remain on production API');
const routedPlanBody = JSON.parse(calls[0].init.body);
assert(routedPlanBody.look === 'Moody', 'selected look preset must be injected into lighting-plan payload');

calls.length = 0;
const blocked = await runtimeWindow.fetch(PROD_API + '/api/visual-preview', {
  method: 'POST',
  body: JSON.stringify({ scenePhoto: 'data:image/jpeg;base64,AA==' }),
});
assert(blocked && blocked.ok === false && blocked.status === 503, 'preview POST must fail closed before capability verification');
assert(calls.length === 0, 'blocked preview POST must not reach any network endpoint');

calls.length = 0;
const capability = await runtimeWindow.fetch(PROD_API + '/api/visual-preview', { method: 'GET' });
assert(capability.ok === true, 'verified preview capability GET must succeed');
assert(calls.length === 1 && calls[0].url === PREVIEW_TEST_API + '/api/visual-preview', 'preview capability GET must route only to isolated test backend');
assert(runtimeWindow.__lightingAIVisualPreviewFetchRouter.isVerified() === true, 'isolated-test identity must set verified capability state');

calls.length = 0;
await runtimeWindow.fetch(PROD_API + '/api/visual-preview', {
  method: 'POST',
  body: JSON.stringify({ scenePhoto: 'data:image/jpeg;base64,AA==' }),
});
assert(calls.length === 1 && calls[0].url === PREVIEW_TEST_API + '/api/visual-preview', 'verified preview POST must route to isolated test backend');

console.log(JSON.stringify({
  ok: true,
  suite: 'LightingAI Project 5 feature safety',
  protected: [
    'stable production lighting-plan route',
    'isolated real-photo preview route',
    'fail-closed preview POST guard',
    'runtime pass-through for unrelated fetch calls',
    'runtime preset injection into production lighting-plan',
    'runtime isolated-test identity verification before preview POST',
    'camera capture',
    'look presets and intensity control',
    'conceptual-preview disclaimer',
    'result polish layer',
    'visible build identity diagnostics',
    'phone diagnostics and copyable report',
    'guided build-scoped phone test checklist',
    'build 510 ancestry and stable-file diff guard'
  ]
}, null, 2));
