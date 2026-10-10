import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = {
  'backend-check': ['npm', ['run', 'check']],
  'project5-safety': ['npm', ['run', 'test:project5-safety']],
  'project5-base': ['npm', ['run', 'test:project5-base']],
  'project52-release': ['npm', ['run', 'test:project52-release']],
  backup: [process.execPath, [path.join(root, 'backend/project-backup-selftest.js')]],
  'ci-autofix': [process.execPath, ['--test', path.join(root, 'scripts/ci-autofix-selftest.mjs')]],
};
const alias = process.argv[2];
if (!Object.hasOwn(checks, alias)) throw new Error('Unknown CI check');
const [command, args] = checks[alias];
const supplied = process.argv.slice(3);
if (supplied.length && JSON.stringify(supplied) !== JSON.stringify(['--', command, ...args])) {
  throw new Error('CI command does not match the approved check');
}
// Invoke npm's JavaScript entry point on Windows; never use a shell for supplied arguments.
const npmCli = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
const windowsNpm = process.platform === 'win32' && command === 'npm';
const result = spawnSync(windowsNpm ? process.execPath : command,
  windowsNpm ? [npmCli, ...args] : args, {cwd: path.join(root, 'backend'), stdio: 'inherit'});
const exitCode = result.status ?? 1;
fs.mkdirSync(path.join(root, '.ci-check-results'), {recursive: true});
fs.writeFileSync(path.join(root, '.ci-check-results', alias + '.json'), JSON.stringify({exitCode}) + '\n');
process.exitCode = exitCode;
