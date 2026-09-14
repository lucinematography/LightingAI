import fs from 'node:fs';
import path from 'node:path';
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

const launcher = read('app/src/main/assets/ai-visual-scene-launcher.js');
const moduleJs = read('app/src/main/assets/ai-visual-scene-plan.js');
const simulation = read('app/src/main/assets/ai-visual-local-simulation.js');
const polish = read('app/src/main/assets/ai-visual-result-polish.js');
const previewServer = read('backend/preview-test-server.js');
const bootstrap = read('backend/render-bootstrap.js');
const workflow = read('.github/workflows/build-apk.yml');

requireText(launcher, "var PROD_API='https://lightingai.onrender.com';", 'production API anchor missing');
requireText(launcher, "var PREVIEW_TEST_API='https://lightingai-ai-preview-test.onrender.com';", 'isolated preview API missing');
requireText(launcher, "data.environment==='isolated-test'", 'preview capability must require isolated-test identity');
requireText(launcher, "method!=='GET'&&!previewCapabilityVerified", 'unverified preview POST must remain blocked');
requireText(launcher, "'/api/lighting-plan'", 'lighting-plan routing hook missing');
requireText(launcher, "file:///android_asset/ai-visual-local-simulation.js", 'local simulation loader missing');
requireText(launcher, "file:///android_asset/ai-visual-result-polish.js", 'result polish loader missing');
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

requireText(previewServer, "environment: 'isolated-test'", 'test backend identity missing');
requireText(previewServer, 'previewConfigured', 'test backend configured-state guard missing');
requireText(bootstrap, 'LIGHTINGAI_PREVIEW_TEST', 'isolated Render bootstrap flag missing');
requireText(workflow, 'Embed Project 5 build identity', 'CI build identity step missing');
requireText(workflow, 'GITHUB_RUN_NUMBER', 'CI run number must be embedded in test APK');
requireText(workflow, 'feature-build-info.js', 'CI generated build metadata asset missing');

forbidText(launcher, "PREVIEW_TEST_API+'/api/lighting-plan'", 'lighting-plan must never route to isolated preview service');

console.log(JSON.stringify({
  ok: true,
  suite: 'LightingAI Project 5 feature safety',
  protected: [
    'stable production lighting-plan route',
    'isolated real-photo preview route',
    'fail-closed preview POST guard',
    'camera capture',
    'look presets and intensity control',
    'conceptual-preview disclaimer',
    'result polish layer',
    'visible build identity diagnostics'
  ]
}, null, 2));
