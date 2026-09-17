import fs from 'fs';
import path from 'path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(process.cwd(), '..');
const report = path.join(root, 'app/build/reports/lint-results-debug.xml');

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

if (!fs.existsSync(report)) {
  throw new Error(`Android lint XML report is missing: ${report}`);
}

let changedText = '';
try {
  changedText = git(['diff', '--name-only', 'origin/main...HEAD']);
} catch {
  changedText = '';
}
if (!changedText && process.env.GITHUB_REF_NAME === 'main') {
  try { changedText = git(['diff', '--name-only', 'HEAD^', 'HEAD']); } catch { changedText = ''; }
}

const changed = changedText.split('\n').map((x) => x.trim()).filter(Boolean);
const androidChanged = changed.filter((x) => x.startsWith('app/'));
const xml = fs.readFileSync(report, 'utf8');
const issueBlocks = xml.match(/<issue\b[\s\S]*?<\/issue>/g) || [];
const errors = [];

function repoPath(value) {
  const decoded = String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\\/g, '/');
  const normalizedRoot = root.replace(/\\/g, '/') + '/';
  if (decoded.startsWith(normalizedRoot)) return decoded.slice(normalizedRoot.length);
  const appIndex = decoded.indexOf('/app/');
  if (appIndex >= 0) return decoded.slice(appIndex + 1);
  return decoded.replace(/^\.\//, '');
}

for (const block of issueBlocks) {
  const severity = (block.match(/severity="([^"]+)"/) || [])[1] || '';
  if (severity !== 'Error' && severity !== 'Fatal') continue;
  const id = (block.match(/id="([^"]+)"/) || [])[1] || 'unknown';
  const message = (block.match(/message="([^"]+)"/) || [])[1] || '';
  const locations = [...block.matchAll(/<location\b[^>]*file="([^"]+)"[^>]*>/g)].map((m) => repoPath(m[1]));
  const matched = locations.find((loc) => androidChanged.some((file) => loc === file || loc.endsWith('/' + file)));
  if (matched) errors.push({ id, file: matched, message });
}

if (errors.length) {
  console.error('Android lint found blocking errors in files changed by this branch:');
  for (const e of errors) console.error(`- ${e.file}: [${e.id}] ${e.message}`);
  process.exit(1);
}

console.log(`Android lint changed-file gate passed: ${androidChanged.length} changed app file(s), no new blocking lint errors.`);
