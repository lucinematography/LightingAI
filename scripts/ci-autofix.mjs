import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const REPOSITORY = 'lucinematography/LightingAI';
export const BRANCH = 'feature/ai-scene-planner-mvp';
const WORKFLOW = 'Build Android APK';
const knownSteps = new Set([
  'Install backend dependencies', 'Audit backend dependencies for high/critical vulnerabilities',
  'Validate complete LightingAI equipment catalog', 'Validate Android WebView JavaScript syntax',
  'Guard Project 5 Equipment layout', 'Validate Project 5 feature safety invariants',
  'Validate Project 5 stable build 510 base', 'Validate Project 5.2 release gate',
  'Validate Project Backup data and exclusions', 'Collect Android lint report',
  'Enforce Android lint on changed app files', 'Android unit tests', 'Build debug APK',
  'Verify packaged Project 5 APK', 'CI autofix regression tests',
]);

function requireMatch(condition, reason) {
  if (!condition) throw new Error(reason);
}

// Deliberately accepts metadata only: raw logs, stdout and environment are never exported.
export function diagnose(run, jobs, expected) {
  requireMatch(/^[1-9]\d*$/.test(String(expected.runId)), 'Invalid run ID');
  requireMatch(/^[a-f0-9]{40}$/.test(expected.sha), 'Expected a complete head SHA');
  requireMatch(Number.isSafeInteger(expected.attempt) && expected.attempt > 0, 'Invalid run attempt');
  requireMatch(String(run.id) === String(expected.runId), 'Run ID mismatch');
  requireMatch(run.head_sha === expected.sha, 'Head SHA mismatch');
  requireMatch(run.run_attempt === expected.attempt, 'Run attempt mismatch');
  requireMatch(run.repository?.full_name === REPOSITORY, 'Repository mismatch');
  requireMatch(run.head_repository?.full_name === REPOSITORY, 'Fork runs are not supported');
  requireMatch(run.head_branch === BRANCH && run.name === WORKFLOW, 'Branch/workflow mismatch');
  requireMatch(['push', 'pull_request', 'workflow_dispatch'].includes(run.event), 'Unsupported event');
  let state = 'ignored';
  if (run.status !== 'completed') state = 'pending';
  else if (run.conclusion === 'failure') state = 'failure';
  else if (run.conclusion === 'success') state = 'success';
  else if (run.conclusion === 'cancelled') state = 'cancelled';
  const failed = [];
  for (const job of jobs) {
    requireMatch(String(job.run_id) === String(expected.runId) && job.head_sha === expected.sha,
      'Job run ID/head SHA mismatch');
    requireMatch(job.run_attempt === expected.attempt, 'Job run attempt mismatch');
    if (state !== 'failure' || job.conclusion !== 'failure') continue;
    for (const step of job.steps || []) {
      if (step.conclusion !== 'failure') continue;
      requireMatch(Number.isSafeInteger(job.id) && Number.isSafeInteger(step.number), 'Invalid job/step identity');
      failed.push({jobId: job.id, stepNumber: step.number,
        step: knownSteps.has(step.name) ? step.name : 'Unrecognized CI step'});
    }
  }
  return {repository: REPOSITORY, branch: BRANCH, runId: String(run.id), headSha: expected.sha,
    attempt: expected.attempt, state, repairEligible: state === 'failure' && failed.length > 0,
    failedSteps: failed, runUrl: `https://github.com/${REPOSITORY}/actions/runs/${run.id}`};
}

const git = (root, args) => execFileSync('git', ['-C', root, ...args],
  {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024});

function safePath(rel) {
  return typeof rel === 'string' && /^[a-zA-Z0-9_./-]+$/.test(rel)
    && !path.posix.isAbsolute(rel) && !rel.split('/').some(p => p === '..' || p === '.' || p === '')
    && /^(backend\/|app\/src\/main\/)/.test(rel)
    && !/(test|selftest|safety|gate|package(?:-lock)?\.json)/i.test(rel);
}

export function prepareProposal({root, out, diagnosis, patch, allowed = []}) {
  requireMatch(diagnosis.repairEligible && diagnosis.state === 'failure', 'No actionable failed CI step');
  // Resolve existing ancestors so a junction/symlink cannot redirect output into the source tree.
  let ancestor = path.resolve(out);
  const suffix = [];
  while (!fs.existsSync(ancestor)) {
    suffix.unshift(path.basename(ancestor));
    ancestor = path.dirname(ancestor);
  }
  const resolvedOutput = path.join(fs.realpathSync(ancestor), ...suffix);
  const relative = path.relative(fs.realpathSync(root), resolvedOutput);
  requireMatch(relative.startsWith('..' + path.sep) || path.isAbsolute(relative),
    'Proposal output must be outside the source repository');
  requireMatch(!fs.existsSync(out), 'Output already exists; refusing to overwrite');
  requireMatch(allowed.every(safePath), 'Tests, safety checks and non-application paths are protected');
  requireMatch(git(root, ['branch', '--show-current']).trim() === BRANCH, 'Source branch mismatch');
  // Verify the exact commit locally; no fetch, branch switch, reset or source-tree write.
  requireMatch(git(root, ['rev-parse', `${diagnosis.headSha}^{commit}`]).trim() === diagnosis.headSha,
    'Exact failed commit is unavailable locally');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'lightingai-ci-proposal-'));
  try {
    const snapshot = path.join(temporary, 'snapshot');
    const hooks = path.join(temporary, 'empty-hooks');
    fs.mkdirSync(hooks);
    execFileSync('git', ['-c', `core.hooksPath=${hooks}`, 'clone', '--no-hardlinks', '--no-checkout',
      '--quiet', '--', path.resolve(root), snapshot], {stdio: 'pipe'});
    git(snapshot, ['-c', `core.hooksPath=${hooks}`, 'checkout', '--quiet', '--detach', diagnosis.headSha]);
    let patchStatus = 'awaiting-human-patch';
    if (patch !== undefined) {
      requireMatch(allowed.length > 0, 'An explicit application-file allowlist is required');
      requireMatch(typeof patch === 'string' && !/GIT binary patch|^(?:old|new) mode |^new file mode |^deleted file mode |^rename |^copy /m.test(patch),
        'Binary, mode, creation, deletion and rename patches are forbidden');
      requireMatch(!/sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|Bearer\s+\S+|(?:api[_-]?key|password|secret|token)\s*[:=]\s*["'][^"']{12,}/i.test(patch),
        'Patch may contain confidential data');
      const patchFile = path.join(temporary, 'proposal.patch');
      fs.writeFileSync(patchFile, patch);
      const stats = git(snapshot, ['apply', '--numstat', '-z', patchFile]).split('\0').filter(Boolean);
      requireMatch(stats.length > 0, 'Empty patch');
      for (const entry of stats) {
        const match = entry.match(/^\d+\t\d+\t(.+)$/);
        const rel = match?.[1];
        requireMatch(rel && safePath(rel) && allowed.includes(rel), 'Patch changes a protected/non-allowed file');
        requireMatch(fs.lstatSync(path.join(snapshot, rel)).isFile(), 'Patch target is not a regular file');
      }
      git(snapshot, ['apply', '--check', '--index', patchFile]); // Never apply the patch, even in the snapshot.
      requireMatch(git(snapshot, ['status', '--porcelain']).trim() === '', 'Snapshot unexpectedly changed');
      patchStatus = 'applies-cleanly-not-executed';
    }
    const proposal = {diagnosis, patchStatus, allowedPaths: allowed,
      investigation: diagnosis.failedSteps.map(step => ({...step,
        suggestion: step.step.includes('lint') ? 'Inspect the lint rule at the failed commit; preserve the existing lint gate.'
          : step.step.includes('APK') ? 'Reproduce packaging at the failed commit; preserve required assets and secret checks.'
            : 'Reproduce this failed check at the exact commit and add a regression test before proposing an application change.'})),
      constraints: ['No paid API calls', 'No automatic patch application', 'No commit/push/merge',
        'Preserve all tests and safety checks', 'Do not modify main or PRs 408/413/414'],
      validationRequired: ['Reproduce failed step', 'Backend check and safety/base/release/backup tests',
        'WebView JavaScript syntax', 'Android lint gate, unit tests and debug APK verification'],
      testsExecutedOnPatch: false};
    fs.mkdirSync(out, {recursive: true});
    fs.writeFileSync(path.join(out, 'proposal.json'), JSON.stringify(proposal, null, 2) + '\n');
    if (patch !== undefined) fs.writeFileSync(path.join(out, 'proposal.patch'), patch);
    return proposal;
  } finally {
    fs.rmSync(temporary, {recursive: true, force: true});
  }
}

function readGitHub(runId, attempt) {
  const endpoint = `repos/${REPOSITORY}/actions/runs/${runId}/attempts/${attempt}`;
  const get = endpoint => JSON.parse(execFileSync('gh', ['api', '--method', 'GET', endpoint],
    {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024}));
  const run = get(endpoint);
  const jobs = [];
  for (let page = 1; ; page++) {
    const result = get(`${endpoint}/jobs?per_page=100&page=${page}`);
    jobs.push(...result.jobs);
    if (jobs.length >= result.total_count || result.jobs.length === 0) break;
  }
  return {run, jobs};
}

export function main(args) {
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    requireMatch(['--run-id', '--head-sha', '--attempt', '--metadata', '--out', '--patch', '--allow'].includes(args[i])
      && args[i + 1] && !args[i + 1].startsWith('--'), 'Unknown/missing CLI argument');
    requireMatch(!(args[i] in opts), 'Duplicate CLI argument');
    opts[args[i]] = args[i + 1];
  }
  const expected = {runId: opts['--run-id'], sha: opts['--head-sha'], attempt: Number(opts['--attempt'])};
  requireMatch(!(opts['--patch'] || opts['--allow']) || opts['--out'], 'Patch/allowlist require proposal output');
  requireMatch(/^[1-9]\d*$/.test(String(expected.runId)) && /^[a-f0-9]{40}$/.test(expected.sha)
    && Number.isSafeInteger(expected.attempt) && expected.attempt > 0, 'Run ID, full head SHA and attempt are required');
  const metadata = opts['--metadata'] ? JSON.parse(fs.readFileSync(opts['--metadata'], 'utf8'))
    : readGitHub(expected.runId, expected.attempt);
  const diagnosis = diagnose(metadata.run, metadata.jobs, expected);
  if (opts['--out'] && diagnosis.repairEligible) {
    prepareProposal({root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
      out: path.resolve(opts['--out']), diagnosis,
      patch: opts['--patch'] ? fs.readFileSync(opts['--patch'], 'utf8') : undefined,
      allowed: opts['--allow'] ? opts['--allow'].split(',') : []});
  }
  console.log(JSON.stringify(diagnosis, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) {
    // Do not echo subprocess stderr, raw logs, supplied patches or credentials.
    console.error(error.status !== undefined ? 'Read-only Git/GitHub operation failed' : error.message);
    process.exitCode = 1;
  }
}
