import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {diagnose, prepareProposal, REPOSITORY, BRANCH} from './ci-autofix.mjs';
import {summarizeXml, collectReports} from './ci-report-summary.mjs';

const sha = 'a'.repeat(40);
const expected = {runId: '1234', sha, attempt: 2};
const run = {id: 1234, head_sha: sha, run_attempt: 2, repository: {full_name: REPOSITORY},
  head_repository: {full_name: REPOSITORY}, head_branch: BRANCH, name: 'Build Android APK',
  event: 'pull_request', status: 'completed', conclusion: 'failure'};
const job = {id: 5678, run_id: 1234, head_sha: sha, run_attempt: 2, conclusion: 'failure',
  steps: [{number: 11, name: 'Validate Project 5 stable build 510 base', conclusion: 'failure'}]};

test('failure binds exact run ID, full head SHA and attempt', () => {
  const result = diagnose(run, [job], expected);
  assert.equal(result.repairEligible, true);
  assert.equal(result.failedSteps[0].stepNumber, 11);
  assert.equal(result.runId, '1234');
  assert.equal(result.headSha, sha);
});
for (const conclusion of ['success', 'cancelled', 'skipped', 'timed_out']) {
  test(`${conclusion} never proposes a repair, including concurrency cancellation`, () => {
    const result = diagnose({...run, conclusion}, [job], expected);
    assert.equal(result.repairEligible, false);
    assert.deepEqual(result.failedSteps, []);
  });
}
test('pending or failure without failed steps is not repair eligible', () => {
  assert.equal(diagnose({...run, status: 'in_progress'}, [], expected).state, 'pending');
  assert.equal(diagnose(run, [], expected).repairEligible, false);
});
for (const [label, changed] of [
  ['SHA', {head_sha: 'b'.repeat(40)}], ['run ID', {id: 4321}], ['attempt', {run_attempt: 1}],
  ['repository', {repository: {full_name: 'other/repo'}}], ['branch', {head_branch: 'main'}],
  ['fork', {head_repository: {full_name: 'fork/LightingAI'}}],
]) {
  test(`reject ${label} mismatch before preparing anything`, () => {
    assert.throws(() => diagnose({...run, ...changed}, [job], expected));
  });
}
test('reject mismatched job SHA, run ID and attempt', () => {
  for (const change of [{head_sha: 'b'.repeat(40)}, {run_id: 4321}, {run_attempt: 1}]) {
    assert.throws(() => diagnose(run, [{...job, ...change}], expected));
  }
});
test('raw logs and unknown step names do not escape into diagnosis', () => {
  const secret = 'DO_NOT_EXPORT_THIS_CREDENTIAL';
  const result = diagnose({...run, logs: secret}, [{...job, steps: [
    {number: 1, name: secret, conclusion: 'failure', output: secret},
  ]}], expected);
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test('prepare and validate patch in isolation without applying or changing source Git state', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lightingai-ci-test-'));
  const source = path.join(temp, 'source');
  const git = (...args) => execFileSync('git', ['-C', source, ...args], {encoding: 'utf8', stdio: 'pipe'});
  try {
    fs.mkdirSync(source);
    git('init', '--quiet', '-b', BRANCH);
    fs.mkdirSync(path.join(source, 'backend'));
    const file = path.join(source, 'backend/example.js');
    fs.writeFileSync(file, 'export const value = 1;\n');
    git('add', '.');
    git('-c', 'user.name=CI Test', '-c', 'user.email=ci@example.invalid', 'commit', '--quiet', '-m', 'fixture');
    const head = git('rev-parse', 'HEAD').trim();
    const diagnosis = diagnose({...run, head_sha: head}, [{...job, head_sha: head}], {...expected, sha: head});
    const patch = 'diff --git a/backend/example.js b/backend/example.js\n--- a/backend/example.js\n+++ b/backend/example.js\n@@ -1 +1 @@\n-export const value = 1;\n+export const value = 2;\n';
    // Local edits must not influence validation against the failed commit or be overwritten.
    fs.writeFileSync(file, 'export const value = 7;\n');
    const before = git('status', '--porcelain');
    const result = prepareProposal({root: source, out: path.join(temp, 'proposal'), diagnosis,
      patch, allowed: ['backend/example.js']});
    assert.equal(result.patchStatus, 'applies-cleanly-not-executed');
    assert.equal(result.testsExecutedOnPatch, false);
    assert.equal(fs.readFileSync(file, 'utf8'), 'export const value = 7;\n');
    assert.equal(git('status', '--porcelain'), before);
    assert.equal(git('rev-parse', 'HEAD').trim(), head);
    assert.equal(git('branch', '--show-current').trim(), BRANCH);
    assert.equal(fs.readFileSync(path.join(temp, 'proposal/proposal.patch'), 'utf8'), patch);
    assert.throws(() => prepareProposal({root: source, out: path.join(source, 'proposal'), diagnosis}));
    assert.throws(() => prepareProposal({root: source, out: path.join(temp, 'bad-test'), diagnosis,
      patch, allowed: ['backend/catalog-selftest.js']}));
    assert.throws(() => prepareProposal({root: source, out: path.join(temp, 'bad-safety'), diagnosis,
      patch, allowed: ['backend/staging-safety.js']}));
    assert.throws(() => prepareProposal({root: source, out: path.join(temp, 'bad-patch'), diagnosis,
      patch: patch.replace('value = 1', 'value = 99'), allowed: ['backend/example.js']}));
    assert.equal(fs.existsSync(path.join(temp, 'bad-patch')), false);
    assert.throws(() => prepareProposal({root: source, out: path.join(temp, 'success'),
      diagnosis: {...diagnosis, state: 'success', repairEligible: false}}));
    assert.throws(() => prepareProposal({root: source, out: path.join(temp, 'cancelled'),
      diagnosis: {...diagnosis, state: 'cancelled', repairEligible: false}}));
    const link = path.join(temp, 'source-junction');
    fs.symlinkSync(source, link, process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => prepareProposal({root: source, out: path.join(link, 'proposal'), diagnosis}));
    const prepared = prepareProposal({root: source, out: path.join(temp, 'request'), diagnosis});
    assert.equal(prepared.patchStatus, 'awaiting-human-patch');
    assert.equal(git('status', '--porcelain'), before);
  } finally { fs.rmSync(temp, {recursive: true, force: true}); }
});

test('artifact summaries omit all XML output, messages, paths and credentials', () => {
  const secret = 'sk-' + 'Z'.repeat(30);
  const lint = `<issues><issue severity="Error" message="${secret}"><location file="${secret}"/></issue></issues>`;
  const junit = `<testsuite name="${secret}"><testcase name="${secret}"><failure message="${secret}"/></testcase><system-out><![CDATA[${secret}]]></system-out></testsuite>`;
  assert.deepEqual(summarizeXml(lint, 'lint'), {kind: 'lint', errors: 1, fatal: 0, warnings: 0});
  assert.deepEqual(summarizeXml(junit, 'unit-tests'), {kind: 'unit-tests', tests: 1, failures: 1, errors: 0, skipped: 0});
  assert.equal(JSON.stringify(summarizeXml(junit, 'unit-tests')).includes(secret), false);
  assert.throws(() => summarizeXml('<!DOCTYPE issues><issues/>', 'lint'));
});
test('collect available reports after failure; missing reports are acceptable', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lightingai-report-test-'));
  const identity = {runId: '1234', headSha: sha, attempt: '2'};
  try {
    const empty = collectReports(temp, path.join(temp, 'empty'), identity);
    assert.deepEqual(empty.reports, []);
    fs.mkdirSync(path.join(temp, 'app/build/reports'), {recursive: true});
    fs.writeFileSync(path.join(temp, 'app/build/reports/lint-results-debug.xml'), '<issues><issue severity="Fatal"/></issues>');
    fs.mkdirSync(path.join(temp, '.ci-check-results'));
    fs.writeFileSync(path.join(temp, '.ci-check-results/backend-check.json'), '{"exitCode":1,"secret":"NEVER_COPY"}');
    const result = collectReports(temp, path.join(temp, 'safe'), identity);
    assert.equal(result.reports[0].fatal, 1);
    assert.equal(result.checks[0].passed, false);
    assert.equal(fs.readFileSync(path.join(temp, 'safe/summary.json'), 'utf8').includes('NEVER_COPY'), false);
  } finally { fs.rmSync(temp, {recursive: true, force: true}); }
});

test('CI reporting wrapper preserves successful and failed check exit codes', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lightingai-wrapper-test-'));
  try {
    fs.mkdirSync(path.join(temp, 'scripts'));
    fs.mkdirSync(path.join(temp, 'backend'));
    const wrapper = path.join(temp, 'scripts/run-ci-check.mjs');
    fs.copyFileSync(new URL('./run-ci-check.mjs', import.meta.url), wrapper);
    for (const exitCode of [0, 7]) {
      fs.writeFileSync(path.join(temp, 'backend/package.json'), JSON.stringify({scripts: {
        check: `node -e "process.exit(${exitCode})"`,
      }}));
      const result = spawnSync(process.execPath, [wrapper, 'backend-check', '--', 'npm', 'run', 'check'], {
        encoding: 'utf8', env: {...process.env, PATH: path.dirname(process.execPath) + path.delimiter + process.env.PATH},
      });
      assert.equal(result.status, exitCode, result.stderr);
      assert.equal(JSON.parse(fs.readFileSync(path.join(temp, '.ci-check-results/backend-check.json'), 'utf8')).exitCode, exitCode);
    }
    const rejected = spawnSync(process.execPath, [wrapper, 'backend-check', '--', 'npm', 'run', 'start']);
    assert.notEqual(rejected.status, 0);
  } finally { fs.rmSync(temp, {recursive: true, force: true}); }
});

test('stable-base guard validates future committed content and blocks regressions', async (t) => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const sourceGit = (...args) => execFileSync('git', ['-C', root, ...args], {encoding: 'utf8', stdio: 'pipe'}).trim();
  // Actions PR checkouts can be detached with no local main branch.
  const mainRef = () => sourceGit('for-each-ref', '--format=%(objectname)', 'refs/heads/main');
  const remoteMainRef = () => sourceGit('for-each-ref', '--format=%(objectname)', 'refs/remotes/origin/main');
  const before = {head: sourceGit('rev-parse', 'HEAD'), main: mainRef(), remoteMain: remoteMainRef(),
    branch: sourceGit('branch', '--show-current'), status: sourceGit('status', '--porcelain')};
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'lightingai-committed-guard-test-'));
  const snapshot = path.join(temporary, 'snapshot');
  const hooks = path.join(temporary, 'empty-hooks');
  fs.mkdirSync(hooks);
  const git = (...args) => execFileSync('git', ['-C', snapshot, '-c', `core.hooksPath=${hooks}`,
    '-c', 'commit.gpgsign=false', ...args], {encoding: 'utf8', stdio: 'pipe'}).trim();
  const commit = message => git('-c', 'user.name=CI Fixture', '-c', 'user.email=ci@example.invalid',
    'commit', '--quiet', '-m', message);
  const guard = () => spawnSync(process.execPath, ['project5-stable-base-selftest.js'], {
    cwd: path.join(snapshot, 'backend'), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  });
  try {
    execFileSync('git', ['-c', `core.hooksPath=${hooks}`, 'clone', '--quiet', '--no-hardlinks',
      '--no-checkout', '--', root, snapshot], {stdio: 'pipe'});
    git('checkout', '--quiet', '--detach', before.head);
    const files = ['.github/workflows/build-apk.yml', '.github/workflows/release-apk.yml', '.gitignore',
      'docs/CI_AUTOFIX_PHASE1.md', 'scripts/ci-autofix.mjs', 'scripts/ci-autofix-selftest.mjs',
      'scripts/ci-report-summary.mjs', 'scripts/run-ci-check.mjs', 'backend/project5-stable-base-selftest.js',
      // Include the complete phase-2/3A candidate in the isolated future-commit check.
      'app/src/main/assets/scene-planner-core.js', 'backend/scene-planner-service.js',
      'backend/scene-planner-revisions-selftest.js', 'docs/SCENE_PLANNER_PHASE3A.md',
      'backend/scene-planner-temporal.js', 'backend/scene-planner-temporal-selftest.js',
      'backend/scene-planner-video-ingestion.js', 'backend/scene-planner-video-ingestion-selftest.js',
      'backend/scene-planner-video-visual.js', 'backend/scene-planner-video-visual-selftest.js',
      'backend/scene-planner-video-calibration.js', 'backend/scene-planner-video-calibration-selftest.js',
      'docs/SCENE_PLANNER_PHASE3B.md',
      'backend/scene-planner-video.js', 'backend/scene-planner-video-selftest.js',
      'backend/scene-planner-job-store.js', 'backend/scene-planner-media.js',
      'backend/scene-planner-video-test-support.js', 'backend/scene-planner-video-phase2-selftest.js',
      'backend/scene-planner-postgres-selftest.js', 'backend/scene-planner-postgres-worker.js',
      'backend/staging-safety-selftest.js', 'backend/package.json', 'backend/package-lock.json',
      'app/src/main/assets/scene-planner.js', 'app/src/main/java/com/lightingai/app/MainActivity.java',
      'app/src/main/java/com/lightingai/app/ScenePlannerCaptureCleanup.java',
      'app/src/test/java/com/lightingai/app/ScenePlannerCaptureCleanupTest.java',
      'docs/SCENE_PLANNER_VIDEO_PHASE2.md'];
    for (const file of files) {
      fs.mkdirSync(path.dirname(path.join(snapshot, file)), {recursive: true});
      fs.copyFileSync(path.join(root, file), path.join(snapshot, file));
    }
    git('add', '--', ...files);
    if (git('diff', '--cached', '--name-only')) commit('Isolated Scene Planner phase-2 candidate');
    const candidate = git('rev-parse', 'HEAD');
    await t.test('complete future committed candidate passes unchanged historical protections', () => {
      const result = guard();
      assert.equal(result.status, 0, result.stderr);
      const report = JSON.parse(result.stdout);
      assert.equal(report.ok, true);
      for (const file of files) assert.ok(report.changedFiles.includes(file), `Candidate omits ${file}`);
    });
    await t.test('unknown CI path remains blocked after commit', () => {
      const file = 'scripts/unapproved-ci-change.mjs';
      fs.writeFileSync(path.join(snapshot, file), '// unauthorized\n');
      git('add', '--', file);
      commit('Negative fixture: unapproved path');
      const result = guard();
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /files changed outside.*scripts\/unapproved-ci-change\.mjs/);
      git('checkout', '--quiet', '--detach', candidate);
    });
    await t.test('protected file equality remains blocking even if a candidate admits its path', () => {
      // Simulate an adversarial allowlist expansion in this throwaway fixture only.
      // The independent content protection must still reject the changed protected file.
      const protectedFile = 'backend/visual-preview.js';
      const guardFile = path.join(snapshot, 'backend/project5-stable-base-selftest.js');
      const source = fs.readFileSync(guardFile, 'utf8');
      fs.writeFileSync(guardFile, source.replace('const exactAllowed = new Set([',
        `const exactAllowed = new Set([\n  '${protectedFile}',`));
      fs.appendFileSync(path.join(snapshot, protectedFile), '\n// unauthorized protected-file change\n');
      git('add', '--', protectedFile, 'backend/project5-stable-base-selftest.js');
      commit('Negative fixture: protected content');
      const result = guard();
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /build 767 protected file changed unexpectedly: backend\/visual-preview\.js/);
      git('checkout', '--quiet', '--detach', candidate);
    });
    await t.test('unauthorized manifest permission remains blocked after commit', () => {
      const file = 'app/src/main/AndroidManifest.xml';
      const content = fs.readFileSync(path.join(snapshot, file), 'utf8');
      fs.writeFileSync(path.join(snapshot, file), content.replace('</manifest>',
        '    <uses-permission android:name="android.permission.READ_CONTACTS"/>\n</manifest>'));
      git('add', '--', file);
      commit('Negative fixture: unauthorized permission');
      const result = guard();
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /AndroidManifest changed outside|unexpected Android permission/);
    });
  } finally {
    // Delete only the absolute mkdtemp directory owned by this test.
    assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()));
    fs.rmSync(temporary, {recursive: true, force: true});
    assert.equal(fs.existsSync(temporary), false);
    assert.deepEqual({head: sourceGit('rev-parse', 'HEAD'), main: mainRef(), remoteMain: remoteMainRef(),
      branch: sourceGit('branch', '--show-current'), status: sourceGit('status', '--porcelain')}, before);
  }
});
