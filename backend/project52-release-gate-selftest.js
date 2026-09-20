import fs from 'fs';
import path from 'path';
import assert from 'assert';

const root = path.resolve(process.cwd(), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const workflow = read('.github/workflows/build-apk.yml');
const launcher = read('app/src/main/assets/ai-visual-scene-launcher.js');
const plan = read('app/src/main/assets/ai-visual-scene-plan.js');
const diagnostics = read('app/src/main/assets/ai-visual-phone-diagnostics.js');

assert.match(workflow, /pull_request:\s*[\s\S]*branches:\s*\[\s*["']main["']\s*\]/, 'Android workflow must run on PRs targeting main');
assert.match(workflow, /Validate Project 5\.2 release gate/, 'Android workflow must execute the Project 5.2 release gate');

const timeoutMatch = launcher.match(/PLAN_TIMEOUT_MS\s*=\s*(\d+)/);
assert.ok(timeoutMatch, 'AI plan must define an explicit timeout');
const timeoutMs = Number(timeoutMatch[1]);
assert.ok(timeoutMs >= 10000 && timeoutMs <= 120000, `AI plan timeout must be bounded and realistic; got ${timeoutMs}ms`);
assert.match(launcher, /AbortController/, 'AI plan request must be abortable');
assert.match(launcher, /diagnosticPlanRequest/, 'AI plan must use the guarded request wrapper');
assert.match(launcher, /isExactApi\(url,'\/api\/lighting-plan'\)/, 'Lighting-plan requests must pass through the guarded request path');
assert.match(launcher, /installPreviewApiRouter\(\)/, 'AI request router must be installed before opening the module');
assert.doesNotMatch(launcher, /lightingai-project5-diagnostic|P5 TEST • BUILD|function diagnosticShell\(|function renderDiagnostic\(/, 'Release launcher must not construct the old Project 5 diagnostic UI');
assert.doesNotMatch(launcher, /LightingAIProject5Diagnostics\.mount\(/, 'Release launcher must not mount Project 5 diagnostics into normal user mode');

assert.match(plan, /SCENE_MEASURE_KEY='lighting_scene_measurements_v1'/, 'Planner measurement bridge must keep its storage key');
assert.match(plan, /useMeasurements/, 'AI plan must expose the Planner measurement opt-in');
assert.match(plan, /\/api\/lighting-plan/, 'AI plan must keep the lighting-plan backend path');
assert.match(plan, /\/api\/visual-preview/, 'AI photo-preview path must remain present');

const previewTimeoutMatch = diagnostics.match(/PREVIEW_TIMEOUT_MS\s*=\s*(\d+)/);
assert.ok(previewTimeoutMatch, 'AI photo-preview must define an explicit timeout');
const previewTimeoutMs = Number(previewTimeoutMatch[1]);
assert.ok(previewTimeoutMs >= 30000 && previewTimeoutMs <= 180000, `AI photo-preview timeout must be bounded and realistic; got ${previewTimeoutMs}ms`);
assert.match(diagnostics, /__lightingAIVisualPreviewTimeoutGuard/, 'AI photo-preview timeout guard must be installed');
assert.match(diagnostics, /lightingai-project5-diagnostic/, 'Release cleanup must explicitly target the old Project 5 diagnostic container');
assert.match(diagnostics, /lightingai-project5-phone-test/, 'Release cleanup must explicitly target the phone-test panel');
assert.match(diagnostics, /version:'1\.0-release-hidden'/, 'Release diagnostics shim must stay hidden in normal user mode');

const assetDir = path.join(root, 'app/src/main/assets');
for (const name of fs.readdirSync(assetDir).filter((x) => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(assetDir, name), 'utf8');
  assert.ok(!/sk-[A-Za-z0-9_-]{20,}/.test(src), `Potential OpenAI secret found in ${name}`);
}

console.log(`Project 5.2 release gate passed (AI plan timeout ${timeoutMs / 1000}s, photo-preview timeout ${previewTimeoutMs / 1000}s, test UI hidden)`);
