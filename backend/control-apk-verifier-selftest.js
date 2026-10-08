import assert from 'node:assert/strict';
import { verifyIdentity, verifyBuildInfo } from './control-apk-verifier.js';
const cert = 'ab'.repeat(32);
const signature = 'Signer #1 certificate SHA-256 digest: ' + cert;
const manifest = "package: name='com.lightingai.app.control13' versionCode='100749' versionName='2.2-control'\ntargetSdkVersion:'35'";
verifyIdentity(manifest, signature, 100749, cert);
for (const [badging, signer, version, fingerprint] of [
  [manifest.replace('.control13', '.control749'), signature, 100749, cert],
  [manifest, signature, 100748, cert],
  [manifest.replace('100749', '749'), signature, 749, cert],
  [manifest.replace('35', '34'), signature, 100749, cert],
  [manifest + '\napplication-debuggable', signature, 100749, cert],
  [manifest, signature, 100749, 'cd'.repeat(32)],
  [manifest, '', 100749, cert],
  [manifest, signature + '\nSigner #2 certificate SHA-256 digest: ' + cert, 100749, cert]
]) assert.throws(() => verifyIdentity(badging, signer, version, fingerprint));
const build = 'window.LightingAIFeatureBuild={sha:"abcdef0",run:"749",branch:"feature/production-control-routing",lab:"control"};';
verifyBuildInfo(build, 'abcdef012345', 749);
assert.throws(() => verifyBuildInfo(build, '1234567', 749));
assert.throws(() => verifyBuildInfo(build, 'abcdef012345', 750));
assert.throws(() => verifyBuildInfo(build.replace('feature/production-control-routing', 'main'), 'abcdef012345', 749));
console.log('Control APK identity/signing/build verifier: 13 rejection/success scenarios passed');
