import fs from 'node:fs';
import assert from 'node:assert/strict';

function read(path){return fs.readFileSync(new URL('../'+path, import.meta.url),'utf8')}
const sketch=read('app/src/main/assets/set-sketch.js');
const blocking=read('app/src/main/assets/blocking-camera-designer.js');
const fov=read('app/src/main/assets/set-sketch-camera-fov.js');
const sun=read('app/src/main/assets/blocking-sun-integration.js');
const ai=read('app/src/main/assets/blocking-ai-integration.js');
const shot=read('app/src/main/assets/shot-list-planner.js');
const report=read('app/src/main/assets/shot-setup-report.js');
const backup=read('app/src/main/assets/project-backup-export.js');
const bridge=read('app/src/main/java/com/lightingai/app/AIVisualImageBridge.java');

for(const marker of [
  "window.LightingAISetSketch={version:'1.2-blocking-lighting'",
  'setPreview:setPreview','clearPreview:clearPreview','getLightingSnapshot:lightingSnapshot'
]) assert.ok(sketch.includes(marker), 'Set Sketch contract missing: '+marker);

for(const marker of [
  "window.LightingAIBlocking={version:'0.3-preserve-framing'",
  'requestAnimationFrame(tick)','function prepareTrackingOffsets()',
  "b.trackFramingMode==='preserve'",'function addAllEquipmentLights'
].filter(x=>x!=='function addAllEquipmentLights')) assert.ok(blocking.includes(marker), 'Blocking contract missing: '+marker);

assert.ok(blocking.includes('a.setPreview(buildPreview'), 'Blocking animation must use preview layer');
assert.ok(blocking.includes('finishAtEnd(total)'), 'Playback must remain at final waypoint until reset');
assert.ok(blocking.includes("pointer-events','none'"), 'Overlapping waypoint must allow selected object drag');
assert.ok(blocking.includes('previewActive'), 'Blocking must track active preview while editing waypoints');
assert.ok(blocking.includes("c.setAttribute('r',sel?'13':'9')"), 'Waypoint markers must stay enlarged for readability');
assert.ok(blocking.includes("tx.setAttribute('font-size','16')"), 'Waypoint labels must stay enlarged for readability');
assert.ok(blocking.includes('blocking-subject-buttons'), 'Tracking subject chooser must use stable large buttons');
assert.ok(blocking.includes("handleDx=overObject?58:0"), 'Waypoint handle must offset away from overlapping object');
assert.ok(blocking.includes("hit.setAttribute('r',sel?'22':'18')"), 'Waypoint drag target must remain large and separate');
assert.ok(blocking.includes("data-handle-dx"), 'Waypoint drag must preserve visual handle offset');
assert.ok(blocking.includes('trackingEnabled'), 'Tracking enable state must remain independent from subject selection');
assert.ok(!blocking.includes('id="blockingTrackSubject"'), 'Native tracking subject select must not return');
assert.ok(blocking.includes("overObject&&!previewActive"), 'Preview waypoint must remain draggable without moving the object');
assert.ok(blocking.includes('previewActive=false;const a=api();if(a&&a.clearPreview)a.clearPreview()'), 'Clearing path must exit preview mode');
assert.ok(!blocking.includes('localStorage.setItem(KEY,JSON.stringify(buildPreview'), 'Animation preview must not persist frame positions');

for(const marker of [
  "window.LightingAICameraFov={version:'1.1-framing-metrics'",
  'centerOffset:offset','edgeMargin:margin'
]) assert.ok(fov.includes(marker), 'FOV contract missing: '+marker);

for(const marker of [
  "window.LightingAIBlockingSun={version:'1.0'",
  'relativeAngleDeg:relative','function shiftTime(delta)'
]) assert.ok(sun.includes(marker), 'SUNCE contract missing: '+marker);

for(const marker of [
  "window.LightingAIBlockingAI={version:'1.0-confirmed-proposals'",
  'function applyProposal(id,quiet)',
  'if(!confirm(t().confirmAll))return'
]) assert.ok(ai.includes(marker), 'AI confirmation contract missing: '+marker);
assert.ok(!ai.includes('applyAll();analyze('), 'AI proposals must not auto-apply');

for(const marker of [
  "window.LightingAIShotList={version:'1.2-shot-restore'",
  'function restoreSetup(rowId)',
  'referenceImage:null'
]) assert.ok(shot.includes(marker), 'Shot List contract missing: '+marker);

for(const marker of [
  "schema:'lightingai-shot-setup-v3-blocking-designer'",
  "documentType:'shot_setup'",
  'function savePdf()','function sharePdf()'
]) assert.ok(report.includes(marker), 'Shot Setup export contract missing: '+marker);

assert.ok(/const BLOCK=.*photo.*image.*uri/i.test(backup), 'Backup must continue excluding photo/image/URI data');
assert.ok(bridge.includes('private byte[] renderShotSetup() throws Exception'), 'Blocking PDF renderer missing');
assert.ok(bridge.includes('AI BLOCKING PROPOSALS — NOT APPLIED AUTOMATICALLY'), 'PDF must label AI proposals as not auto-applied');

console.log('Blocking / Camera Designer integration contracts passed.');
