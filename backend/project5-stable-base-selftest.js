import { execFileSync } from 'node:child_process';

const STABLE_BASE = '77462ab3cf80c48c5ca0c903486e59919a3bf747';
const PROJECT53_BASE = 'a2913dedf00d8ddf18930e56d6bf2e862993f92c';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function fail(message) {
  throw new Error(`Project 5.3 stable-base guard failed: ${message}`);
}

for (const [label, sha] of [['stable build 510', STABLE_BASE], ['phone-tested build 655', PROJECT53_BASE]]) {
  try {
    git(['cat-file', '-e', `${sha}^{commit}`]);
  } catch {
    fail(`${label} commit ${sha} is unavailable; CI checkout must include full history`);
  }
}

try {
  git(['merge-base', '--is-ancestor', STABLE_BASE, 'HEAD']);
} catch {
  fail('feature branch no longer descends from the stable build 510 anchor');
}

try {
  git(['merge-base', '--is-ancestor', PROJECT53_BASE, 'HEAD']);
} catch {
  fail('feature branch no longer descends from the phone-tested build 655 anchor');
}

// Preserve the original Project 5 ancestry contract for the safety self-test.
const changedLegacy = git(['diff', '--name-only', `${STABLE_BASE}...HEAD`])
  .split('\n')
  .map((x) => x.trim())
  .filter(Boolean);

// Project 5.3 itself is much stricter: only the backup-import surface may differ from build 655.
const changed = git(['diff', '--name-only', `${PROJECT53_BASE}...HEAD`])
  .split('\n')
  .map((x) => x.trim())
  .filter(Boolean);

const exactAllowed = new Set([
  'app/src/main/assets/project-backup-export.js',
  'backend/project-backup-selftest.js',
  'backend/project5-stable-base-selftest.js'
]);

const unexpected = changed.filter((path) => !exactAllowed.has(path));
if (unexpected.length) {
  fail(`files changed outside the isolated Project 5.3 backup-import surface: ${unexpected.join(', ')}`);
}

for (const protectedPath of [
  'app/src/main/assets/catalog.js',
  'app/src/main/assets/ai-visual-scene-launcher.js',
  'app/src/main/assets/ai-visual-scene-plan.js',
  'app/src/main/assets/ai-visual-preview-refinements.js',
  'app/src/main/assets/ai-visual-phone-diagnostics.js',
  'app/src/main/java/com/lightingai/app/MainActivity.java',
  'app/src/main/java/com/lightingai/app/MeasureActivity.java',
  'app/src/main/AndroidManifest.xml',
  'backend/server.js',
  'backend/visual-preview.js'
]) {
  const stable = git(['show', `${PROJECT53_BASE}:${protectedPath}`]);
  const current = git(['show', `HEAD:${protectedPath}`]);
  if (stable !== current) fail(`phone-tested build 655 file changed unexpectedly: ${protectedPath}`);
}

// Keep the historical non-destructive catalog contract visible to the Project 5 safety suite.
const catalogPath = 'app/src/main/assets/catalog.js';
const stableCatalog = git(['show', `${STABLE_BASE}:${catalogPath}`]);
const currentCatalog = git(['show', `HEAD:${catalogPath}`]);
if (!currentCatalog.includes("file:///android_asset/ai-visual-scene-launcher.js")) {
  fail('catalog.js may not delete stable build 510 code or the isolated AI visual launcher');
}
if (!stableCatalog.trim()) {
  fail('catalog.js may not delete stable build 510 code');
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

const textFiles = changed.filter((path) => /\.(?:js|json|yml|yaml|html|md)$/i.test(path));
for (const path of textFiles) {
  if (path === 'backend/project5-stable-base-selftest.js') continue;
  let content = '';
  try { content = git(['show', `HEAD:${path}`]); } catch { continue; }
  if (/\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/.test(content)) fail(`literal OpenAI API key detected in ${path}`);
  if (/OPENAI_API_KEY\s*[:=]\s*['"][^'"]{8,}['"]/.test(content)) fail(`direct OPENAI_API_KEY value detected in ${path}`);
}

console.log(JSON.stringify({
  ok: true,
  suite: 'LightingAI Project 5.3 stable-base guard',
  legacyStableBase: STABLE_BASE,
  project53Base: PROJECT53_BASE,
  stableBuild: 655,
  legacyChangedFiles: changedLegacy,
  changedFiles: changed,
  protectedByDefault: 'catalog, AI visual flow, Android camera/gallery, Planner measurement, SUNCE and backend remain byte-for-byte on the phone-tested build 655 side',
  featureSurface: 'Project Backup safe two-step import only'
}, null, 2));
