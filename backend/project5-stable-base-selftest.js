import { execFileSync } from 'node:child_process';

const STABLE_BASE = '77462ab3cf80c48c5ca0c903486e59919a3bf747';
const PHONE_TESTED_BASE = 'a2913dedf00d8ddf18930e56d6bf2e862993f92c';
const MAIN686_BASE = '9fb1cb24cabf41d45baed2fb6e9cf6c4a737f1a7';
const PROJECT54_PHONE_BASE = '3827f81400ff8abd1e83e6b8e416f8ee628fce94';
const PROJECT55_DP_BASE = 'a79fdeca7db3ddf0c153589b58639a84b5b65628';
const PROJECT55_BACKUP_BASE = '64e8d99ee15f94a34da35fcd1eb9f416372ba36c';
const PROJECT55_VOICE_BASE = '3e61ba6bbebf381c3b376af090aa385ac7e7d332';
const PROJECT56_PDF_BASE = '6c4e2a644d2ff55dc7cf1e005a7c5d1892c6d0b1';

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
  ['Project 5.6 professional PDF main build 739', PROJECT56_PDF_BASE]
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
  ['Project 5.6 professional PDF main build 739', PROJECT56_PDF_BASE]
]) {
  try { git(['merge-base', '--is-ancestor', sha, 'HEAD']); }
  catch { fail(`feature branch no longer descends from ${label}`); }
}

const changedLegacy = git(['diff', '--name-only', `${STABLE_BASE}...HEAD`])
  .split('\n').map((x) => x.trim()).filter(Boolean);
const changed = git(['diff', '--name-only', `${PROJECT56_PDF_BASE}...HEAD`])
  .split('\n').map((x) => x.trim()).filter(Boolean);

const measurePath = 'app/src/main/java/com/lightingai/app/MeasureActivity.java';
const aiPlanPath = 'app/src/main/assets/ai-visual-scene-plan.js';
const backupPath = 'app/src/main/assets/project-backup-export.js';
const mainActivityPath = 'app/src/main/java/com/lightingai/app/MainActivity.java';
const imageBridgePath = 'app/src/main/java/com/lightingai/app/AIVisualImageBridge.java';
const serverPath = 'backend/server.js';
const exactAllowed = new Set([
  aiPlanPath,
  imageBridgePath,
  serverPath,
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
  'app/src/main/assets/ai-visual-preview-refinements.js',
  'app/src/main/assets/ai-visual-phone-diagnostics.js',
  'app/src/main/assets/ai-visual-image-actions.js',
  'app/src/main/java/com/lightingai/app/DeviceCapabilities.java',
  'app/src/main/AndroidManifest.xml',
  'backend/visual-preview.js'
]) {
  const stable = git(['show', `${PROJECT56_PDF_BASE}:${protectedPath}`]);
  const current = git(['show', `HEAD:${protectedPath}`]);
  if (stable !== current) fail(`build 739 protected file changed unexpectedly: ${protectedPath}`);
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
  "multiSubjectVersion:'0.8-multi-subject-ai'"
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
  'openCreateDocumentFallback',
  'RecognizerIntent.ACTION_RECOGNIZE_SPEECH',
  '@JavascriptInterface public void startSpeechInput',
  'window.LightingAIVoiceInputResult',
  'SPEECH_INPUT = 506',
  'notifyAIVisualPdfResult'
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
  '"targets":["S1"]'
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
  stableBuilds: [510, 655, 686, 701, 713, 721, 727, 739],
  legacyChangedFiles: changedLegacy,
  changedFiles: changed,
  protectedByDefault: 'build 739 PDF/voice/backup/Planner/catalog/SUNCE and phone-tested build 701 camera measurement remain protected; only AI multi-subject plan UI, PDF AI map, lighting-plan backend and this guard may change',
  featureSurface: 'Project 5.7 multiple actors from Planner Set Sketch drive AI lighting targets, setup map, preview context and professional PDF'
}, null, 2));
