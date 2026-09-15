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
const imageActions = read('app/src/main/assets/ai-visual-image-actions.js');
const refinements = read('app/src/main/assets/ai-visual-preview-refinements.js');
const imageBridge = read('app/src/main/java/com/lightingai/app/AIVisualImageBridge.java');
const imageProvider = read('app/src/main/java/com/lightingai/app/AIVisualImageProvider.java');
const mainActivity = read('app/src/main/java/com/lightingai/app/MainActivity.java');
const manifest = read('app/src/main/AndroidManifest.xml');
const phoneDiagnostics = read('app/src/main/assets/ai-visual-phone-diagnostics.js');
const phoneTest = read('app/src/main/assets/ai-visual-phone-test.js');
const previewServer = read('backend/preview-test-server.js');
const bootstrap = read('backend/render-bootstrap.js');
const stableBaseGuard = read('backend/project5-stable-base-selftest.js');
const packageJson = read('backend/package.json');
const workflow = read('.github/workflows/build-apk.yml');

requireText(launcher, "var PROD_API='https://lightingai.onrender.com';", 'production API anchor missing');
requireText(launcher, "var PREVIEW_TEST_API='https://lightingai-ai-preview-test.onrender.com';", 'isolated preview fallback API missing');
requireText(launcher, 'previewGet(nativeFetch,PROD_API)', 'production preview must be probed first');
requireText(launcher, 'previewGet(nativeFetch,PREVIEW_TEST_API)', 'isolated preview fallback probe missing');
requireText(launcher, "data.environment==='isolated-test'", 'isolated fallback must require isolated-test identity');
requireText(launcher, "if(!previewCapabilityVerified||!previewActiveApi)", 'unverified preview POST must remain blocked');
requireText(launcher, 'activeApi:function(){return previewActiveApi;}', 'active preview endpoint diagnostic hook missing');
requireText(launcher, "'/api/lighting-plan'", 'lighting-plan routing hook missing');
requireText(launcher, "file:///android_asset/ai-visual-local-simulation.js", 'local simulation loader missing');
requireText(launcher, "file:///android_asset/ai-visual-result-polish.js", 'result polish loader missing');
requireText(launcher, "file:///android_asset/ai-visual-image-actions.js", 'image action loader missing');
requireText(launcher, "file:///android_asset/ai-visual-preview-refinements.js", 'preview refinement loader missing');
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
for (const action of ['SAČUVAJ AI FOTO-PREVIEW','PODELI AI FOTO-PREVIEW','SAČUVAJ PRE / POSLE','PODELI PRE / POSLE']) {
  requireText(imageActions, action, `image action missing: ${action}`);
}
requireText(imageActions, "canvas.toDataURL('image/jpeg',.92)", 'before/after export must create one JPEG image');
requireText(imageActions, "drawCover(ctx,original", 'before/after export must contain original scene');
requireText(imageActions, "drawCover(ctx,ai", 'before/after export must contain AI preview');
requireText(imageActions, "window.LightingAIImages", 'native image bridge hook missing');
requireText(imageBridge, '@JavascriptInterface public void saveImage', 'native save-image action missing');
requireText(imageBridge, '@JavascriptInterface public void shareImage', 'native share-image action missing');
requireText(imageBridge, 'Environment.DIRECTORY_PICTURES + "/LightingAI"', 'saved images must use Pictures/LightingAI');
requireText(imageBridge, 'MAX_IMAGE_BYTES = 20 * 1024 * 1024', 'native image bridge must enforce a size limit');
requireText(imageProvider, 'ParcelFileDescriptor.MODE_READ_ONLY', 'shared image provider must remain read-only');
requireText(imageProvider, 'file.getParentFile().equals(root)', 'shared image provider must reject path traversal');
requireText(mainActivity, 'new AIVisualImageBridge(this), "LightingAIImages"', 'native image bridge registration missing');
requireText(manifest, 'android:name=".AIVisualImageProvider"', 'AI image share provider missing');

for (const action of ['SVETLIJE','TAMNIJE','TOPLIJE','HLADNIJE','MEKŠE','VIŠE KONTRASTA','NAPRAVI MOJU VERZIJU']) {
  requireText(refinements, action, `preview refinement missing: ${action}`);
}
requireText(refinements, "button.click()", 'preview refinement must reuse the tested preview action');
requireText(refinements, "cleanDescription", 'preview refinement must replace the previous refinement instead of accumulating it');
forbidText(refinements, '/api/visual-preview', 'refinement controls must not create a second preview network route');

requireText(phoneDiagnostics, 'OTVORI DIJAGNOSTIKU', 'phone diagnostics button missing');
requireText(phoneDiagnostics, "getAttribute('capture')", 'camera diagnostic missing');
requireText(phoneDiagnostics, "getAttribute('accept')", 'gallery diagnostic missing');
requireText(phoneDiagnostics, 'LightingAILocalLightSimulation', 'simulation diagnostic missing');
requireText(phoneDiagnostics, 'LightingAIVisualResultPolish', 'result polish diagnostic missing');
requireText(phoneDiagnostics, 'KOPIRAJ IZVEŠTAJ', 'copy diagnostics report action missing');
requireText(phoneDiagnostics, "PREVIEW_API+'/api/visual-preview'", 'preview diagnostic probe missing');
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
forbidText(workflow, 'Probe isolated AI preview backend', 'temporary isolated preview CI probe must be removed before release candidate');

forbidText(launcher, "PREVIEW_TEST_API+'/api/lighting-plan'", 'lighting-plan must never route to isolated preview service');

// Runtime routing contract. Execute the real launcher with a fake DOM/network layer.
const calls = [];
const PROD_API = 'https://lightingai.onrender.com';
const PREVIEW_TEST_API = 'https://lightingai-ai-preview-test.onrender.com';
const fakeNativeFetch = async (input, init) => {
  const url = typeof input === 'string' ? input : String(input?.url || '');
  calls.push({ url, init: init ? { ...init } : undefined });
  if (url === PROD_API + '/api/visual-preview') {
    return new Response(JSON.stringify({ ok: false, error: 'not deployed yet' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }
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
  LightingAIVisualImageActions: {},
  LightingAIVisualPreviewRefinements: {},
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
assert(capability.ok === true, 'preview capability GET must succeed through production-first fallback');
assert(calls.length === 2, 'preview capability GET must try production then isolated fallback');
assert(calls[0].url === PROD_API + '/api/visual-preview', 'production preview endpoint must be probed first');
assert(calls[1].url === PREVIEW_TEST_API + '/api/visual-preview', 'isolated preview backend must be second-line fallback');
assert(runtimeWindow.__lightingAIVisualPreviewFetchRouter.isVerified() === true, 'verified fallback must set capability state');
assert(runtimeWindow.__lightingAIVisualPreviewFetchRouter.activeApi() === PREVIEW_TEST_API, 'fallback test endpoint must become active only when production is unavailable');

calls.length = 0;
await runtimeWindow.fetch(PROD_API + '/api/visual-preview', {
  method: 'POST',
  body: JSON.stringify({ scenePhoto: 'data:image/jpeg;base64,AA==' }),
});
assert(calls.length === 1 && calls[0].url === PREVIEW_TEST_API + '/api/visual-preview', 'verified preview POST must use the active fallback endpoint');

// Execute the real image action layer with a small fake canvas. This verifies that
// PRE/POSLE becomes one JPEG and that both source images are rendered into it.
const canvasDraws = [];
const fakeCanvasContext = {
  fillStyle: '', font: '', textBaseline: '',
  fillRect: () => {}, save: () => {}, restore: () => {}, beginPath: () => {}, rect: () => {}, clip: () => {},
  drawImage: (...args) => canvasDraws.push(args),
  measureText: (value) => ({ width: String(value).length * 10 }),
  fillText: () => {},
};
const fakeCanvas = { width: 0, height: 0, getContext: () => fakeCanvasContext, toDataURL: (type, quality) => `data:${type};quality=${quality}` };
class FakeImage {
  constructor() { this.naturalWidth = 1600; this.naturalHeight = 900; this.width = 1600; this.height = 900; }
  set src(value) { this._src = value; if (this.onload) this.onload(); }
  get src() { return this._src; }
}
const imageActionWindow = { currentLang: 'sr', fetch: null };
const imageActionDocument = {
  getElementById: () => null,
  createElement: (tag) => tag === 'canvas' ? fakeCanvas : ({ style: {}, dataset: {}, appendChild: () => {}, remove: () => {}, click: () => {} }),
  addEventListener: () => {},
  body: { appendChild: () => {} },
};
vm.runInNewContext(imageActions, {
  window: imageActionWindow,
  document: imageActionDocument,
  navigator: {},
  Image: FakeImage,
  Promise,
  Date,
  String,
  Number,
  Math,
  setTimeout: () => 0,
}, { filename: 'ai-visual-image-actions.js' });
const composed = await imageActionWindow.LightingAIVisualImageActions.buildBeforeAfterDataUrl('data:image/jpeg;base64,AA==', 'data:image/jpeg;base64,BB==');
assert(composed === 'data:image/jpeg;quality=0.92', 'before/after export must return one high-quality JPEG');
assert(canvasDraws.length === 2, 'before/after export must draw original and AI images exactly once');

console.log(JSON.stringify({
  ok: true,
  suite: 'LightingAI Project 5 feature safety',
  protected: [
    'stable production lighting-plan route',
    'production-first real-photo preview routing',
    'isolated preview fallback only when production is unavailable',
    'fail-closed preview POST guard',
    'runtime pass-through for unrelated fetch calls',
    'runtime preset injection into production lighting-plan',
    'runtime fallback identity verification before preview POST',
    'camera capture',
    'look presets and intensity control',
    'conceptual-preview disclaimer',
    'result polish layer',
    'visible build identity diagnostics',
    'phone diagnostics and copyable report',
    'guided build-scoped phone test checklist',
    'native save/share actions and one-image before/after composition',
    'isolated AI preview refinement controls that reuse the tested preview action',
    'build 510 ancestry and stable-file diff guard'
  ]
}, null, 2));
