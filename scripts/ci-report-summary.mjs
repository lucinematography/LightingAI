import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Export counts only. Never copy XML messages, test names, system-out/err, paths or HTML.
export function summarizeXml(xml, kind) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('XML declarations are forbidden');
  if (kind === 'lint') {
    const result = {kind, errors: 0, fatal: 0, warnings: 0};
    for (const tag of xml.match(/<issue\b[^>]*>/g) || []) {
      const severity = tag.match(/\bseverity="(Error|Fatal|Warning)"/)?.[1];
      if (severity) result[{Error: 'errors', Fatal: 'fatal', Warning: 'warnings'}[severity]]++;
    }
    if (!/<issues\b/.test(xml)) throw new Error('Not a lint report');
    return result;
  }
  if (!/<testsuite\b/.test(xml)) throw new Error('Not a JUnit report');
  // Gradle writes one suite per XML file. Count actual elements, not untrusted text content.
  const tags = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    .replace(/<system-(?:out|err)\b[^>]*>[\s\S]*?<\/system-(?:out|err)>/g, '');
  return {kind: 'unit-tests', tests: (tags.match(/<testcase\b/g) || []).length,
    failures: (tags.match(/<failure\b/g) || []).length,
    errors: (tags.match(/<error\b/g) || []).length,
    skipped: (tags.match(/<skipped\b/g) || []).length};
}

export function collectReports(root, output, identity) {
  if (!/^[1-9]\d*$/.test(identity.runId) || !/^[a-f0-9]{40}$/.test(identity.headSha)
    || !/^[1-9]\d*$/.test(identity.attempt)) throw new Error('Missing CI run identity');
  const reports = [];
  const omissions = {unreadableOrInvalid: 0, oversized: 0};
  function read(file, kind) {
    try {
      const stat = fs.lstatSync(file);
      if (!stat.isFile()) return;
      if (stat.size > 16 * 1024 * 1024) { omissions.oversized++; return; }
      reports.push(summarizeXml(fs.readFileSync(file, 'utf8'), kind));
    } catch { omissions.unreadableOrInvalid++; }
  }
  const lint = path.join(root, 'app/build/reports/lint-results-debug.xml');
  if (fs.existsSync(lint)) read(lint, 'lint');
  const unit = path.join(root, 'app/build/test-results/testDebugUnitTest');
  if (fs.existsSync(unit) && !fs.lstatSync(unit).isSymbolicLink()) {
    for (const name of fs.readdirSync(unit)) {
      if (/^TEST-[A-Za-z0-9_.-]+\.xml$/.test(name)) read(path.join(unit, name), 'unit-tests');
    }
  }
  const checks = [];
  for (const alias of ['backend-check', 'project5-safety', 'project5-base', 'project52-release', 'backup', 'ci-autofix']) {
    const file = path.join(root, '.ci-check-results', alias + '.json');
    if (!fs.existsSync(file)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (Number.isInteger(data.exitCode) && data.exitCode >= 0 && data.exitCode <= 255) {
        checks.push({check: alias, exitCode: data.exitCode, passed: data.exitCode === 0});
      } else omissions.unreadableOrInvalid++;
    } catch { omissions.unreadableOrInvalid++; }
  }
  const result = {schemaVersion: 1, runId: identity.runId, headSha: identity.headSha,
    attempt: identity.attempt, reports, checks, omissions};
  // The upload step points only here, never to raw reports or the checkout.
  fs.mkdirSync(output, {recursive: true});
  fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  collectReports(root, path.join(root, '.ci-safe-reports'), {
    runId: process.env.GITHUB_RUN_ID || '',
    // On a PR build GITHUB_SHA is the synthetic merge commit; retain the actual PR head SHA.
    headSha: process.env.CI_HEAD_SHA || '', attempt: process.env.GITHUB_RUN_ATTEMPT || '',
  });
}
