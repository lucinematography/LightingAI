import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function verifyIdentity(badging, signatures, version, certificate) {
  assert.match(badging, /package: name='com\.lightingai\.app\.control13'/, 'Wrong Android package');
  assert.match(badging, new RegExp("versionCode='" + Number(version) + "'"), 'Wrong update version');
  assert.ok(Number.isInteger(Number(version)) && Number(version) > 100000, 'Control version must exceed all previous lab builds');
  assert.match(badging, /versionName='2\.2-control'/, 'Wrong Control version name');
  assert.match(badging, /targetSdkVersion:'35'/, 'Android 15 target required');
  assert.doesNotMatch(badging, /application-debuggable/, 'Published Control APK must not be debuggable');
  const signers = [...signatures.matchAll(/Signer #\d+ certificate SHA-256 digest: ([0-9a-f]+)/gi)];
  assert.equal(signers.length, 1, 'Exactly one APK signer is required');
  assert.match(certificate, /^[0-9a-f]{64}$/i, 'Persistent certificate fingerprint is required');
  assert.equal(signers[0][1].toLowerCase(), certificate.toLowerCase(), 'APK signer differs from persistent keystore');
}

export function verifyBuildInfo(info, sha, run) {
  const context = { window: {} };
  vm.runInNewContext(info, context, { timeout: 1000 });
  const build = context.window.LightingAIFeatureBuild;
  assert.equal(build?.sha, sha.slice(0, 7), 'Wrong source revision');
  assert.equal(build?.run, String(run), 'Wrong CI build');
  assert.equal(build?.branch, 'feature/production-control-routing', 'Wrong source branch');
  assert.equal(build?.lab, 'control', 'Wrong build identity');
}

export function verifyApk(apk, version, sha, run, certificate) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const invoke = (tool, args) => execFileSync(tool, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  // apksigner must verify the actual APK (exit status), not just a JAR certificate.
  const signatures = invoke('apksigner', ['verify', '--verbose', '--print-certs', apk]);
  assert.equal(certificate.toLowerCase(), fs.readFileSync(path.join(root, 'CONTROL-SIGNER-SHA256.txt'), 'utf8').trim().toLowerCase(), 'Signing secret changed: certificate differs from pinned Control identity');
  verifyIdentity(invoke('aapt', ['dump', 'badging', apk]), signatures, version, certificate);
  for (const asset of ['control-bootstrap.js', 'control-routing.js', 'control-dashboard.js', 'control-system-drivers.js', 'ble-control.js', 'feature-build-info.js', 'catalog.js', 'gel-filter-catalog.js', 'gel-filter-ui.js']) {
    const packaged = execFileSync('unzip', ['-p', apk, 'assets/' + asset], { maxBuffer: 16 * 1024 * 1024 });
    assert.ok(packaged.equals(fs.readFileSync(path.join(root, 'app/src/main/assets', asset))), 'Packaged asset differs: ' + asset);
  }
  verifyBuildInfo(invoke('unzip', ['-p', apk, 'assets/feature-build-info.js']), sha, run);
  const context = { window: {} };
  vm.runInNewContext(invoke('unzip', ['-p', apk, 'assets/gel-filter-catalog.js']), context, { timeout: 1000 });
  const catalog = context.window.LightingAIGelCatalog;
  assert.equal(catalog?.filters?.length, 977, 'Incomplete gel catalog');
  assert.equal(catalog?.sourceMode, 'official-build');
  assert.deepEqual(Object.fromEntries(catalog.sources.map(s => [s.key, s.count])), {'lee-lighting-filters':333,'rosco-supergel':144,'rosco-ecolour-plus':312,'rosco-cinegel':188});
  const report = { packageId: 'com.lightingai.app.control13', versionCode: Number(version), versionName: '2.2-control', commit: sha, run: String(run), sha256: crypto.createHash('sha256').update(fs.readFileSync(apk)).digest('hex'), certificateSha256: certificate, softwareChecks: 'passed', physicalControlVerified: false, asteraSessionVerified: false };
  fs.writeFileSync(path.join(path.dirname(apk), 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 7, 'Usage: control-apk-verifier.js APK VERSION SHA RUN CERT_SHA256');
  verifyApk(...process.argv.slice(2));
}
