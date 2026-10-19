import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateStudioIdentity,validateStudioUpdate} from '../scripts/studio-update-identity.mjs';
const valid={applicationId:'com.lightingai.app.studio',debuggable:false,versionCode:10001,
  certificateSha256:'a'.repeat(64),apkSha256:'b'.repeat(64)};
assert.equal(validateStudioUpdate(valid,{...valid,versionCode:10002,apkSha256:'c'.repeat(64)}).status,'PUBLIC_METADATA_COMPATIBLE');
for(const patch of [{applicationId:'com.lightingai.app.review13'},{debuggable:true},
  {versionCode:0},{versionCode:2100000001},{versionCode:1.5},{certificateSha256:''},{apkSha256:'invalid'}])
  assert.throws(()=>validateStudioIdentity({...valid,...patch}));
for(const patch of [{certificateSha256:'d'.repeat(64),versionCode:10002},{versionCode:10001},{versionCode:10000}])
  assert.throws(()=>validateStudioUpdate(valid,{...valid,...patch}));
console.log('PASS public update preflight rejects legacy package, debug builds, missing certificate, rollback and changed signer');
const root=new URL('../',import.meta.url),read=path=>fs.readFileSync(new URL(path,root),'utf8');
const gradle=read('app/build.gradle');
assert.match(gradle,/studio\s*\{[\s\S]*applicationIdSuffix '\.studio'[\s\S]*debuggable false[\s\S]*signingConfig = null/);
assert.ok(gradle.includes("applicationIdSuffix '.review13'"));
const overlay=read('app/src/studio/AndroidManifest.xml');
assert.ok(overlay.includes('android:label="LightingAI Studio"'));
assert.ok(!overlay.includes('uses-permission')&&!overlay.includes('provider')&&!overlay.includes('sharedUserId'));
const manifest=read('app/src/main/AndroidManifest.xml');
assert.ok(manifest.includes('android:authorities="${applicationId}.ai.preview"'));
const releaseWorkflow=read('.github/workflows/release-apk.yml');
assert.ok(!releaseWorkflow.includes('secrets.')&&!releaseWorkflow.includes('KEYSTORE')&&!releaseWorkflow.includes('assembleRelease'));
assert.ok(releaseWorkflow.includes('assembleStudio')&&releaseWorkflow.includes('UNSIGNED'));
console.log('PASS Studio identity is isolated, provider follows applicationId, and CI has no permanent signing credentials');
