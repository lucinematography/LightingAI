import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const ui=read('app/src/main/assets/ai-visual-scene-plan.js');
const draftSource=read('app/src/main/assets/ai-visual-draft.js');
const control=read('app/src/main/assets/ai-control-bridge.js');
const clone=v=>JSON.parse(JSON.stringify(v));
let groups=0;async function check(name,fn){if(process.argv.includes('--step56-only')&&!name.startsWith('STEP56'))return;await fn();groups++;console.log('PASS '+name);}
const photo='data:image/jpeg;base64,YWJjZA==';
const record=()=>({version:1,photo,description:'Scene ČĆŠŽĐ',dpRequest:'Only selected lamps',selectedIds:['test'],settings:{useMeasurements:false,useSun:false,useDmx:false,look:'Cinematic'}});
function nativeStore(){
 const disk=new Map();let active='legacy',writes=0;
 const window={LightingAIScenePlannerDraft:{activeSceneId:()=>active},Android:{loadAIVisualDraft:id=>disk.get(id)||'',saveAIVisualDraft:(id,data)=>{disk.set(id,data);writes++;return true;}}};
 Object.defineProperty(window,'localStorage',{get(){throw new Error('Photos must never use localStorage');}});
 vm.runInNewContext(draftSource,{window});
 return {window,disk,setScene:id=>{active=id;},get writes(){return writes;}};
}
await check('real language action synchronizes lexical/global language and emits only actual changes',()=>{
 const html=read('app/src/main/assets/index.html'),start=html.indexOf('function setLanguage('),end=html.indexOf('function ',start+10);
 const nodes=new Map(),events=[],storage=new Map();
 const ctx={currentLang:'sr',window:{dispatchEvent:e=>events.push(e)},T:{sr:{},en:{}},LS:{lang:'lang'},localStorage:{setItem:(k,v)=>storage.set(k,v)},E:id=>{if(!nodes.has(id))nodes.set(id,{classList:{toggle(){}}});return nodes.get(id);},opts(){},setTimeout(){},organizeTools(){},renderEquipment(){},renderProjects(){},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}};
 vm.runInNewContext(html.slice(start,end),ctx);
 ctx.setLanguage('en');assert.equal(ctx.currentLang,'en');assert.equal(ctx.window.currentLang,'en');assert.equal(storage.get('lang'),'en');assert.equal(events[0].type,'lightingai-language-changed');
 ctx.setLanguage('en');assert.equal(events.length,1);ctx.setLanguage('sr');assert.equal(ctx.window.currentLang,'sr');ctx.setLanguage('bad');assert.equal(ctx.window.currentLang,'sr');
});
await check('launcher loads both private draft support and Control bridge before opening module',()=>{
 const source=read('app/src/main/assets/ai-visual-scene-launcher.js'),calls=[];
 const ctx={window:{},ensureScript:(id,url,ready,next)=>{calls.push(url);if(url.includes('draft'))ctx.window.LightingAIVisualDraft={};else ctx.window.LightingAIAIControlBridge={};next();}};
 vm.runInNewContext(source.split(/\r?\n/).find(x=>x.startsWith('function ensureVisualDependencies(')),ctx);
 let ready=false;ctx.ensureVisualDependencies(()=>{ready=true;});assert.equal(ready,true);assert.equal(calls.length,2);assert.ok(calls[0].endsWith('/ai-visual-draft.js'));assert.ok(calls[1].endsWith('/ai-control-bridge.js'));
});
await check('private per-scene draft stores one photo, skips duplicate writes and never stores a plan',()=>{
 const env=nativeStore(),store=env.window.LightingAIVisualDraft.open();assert.equal(store.load(),null);
 assert.equal(store.save(record()),true);assert.equal(store.save(record()),true);assert.equal(env.writes,1);
 const restored=env.window.LightingAIVisualDraft.open().load();assert.deepEqual(clone(restored),record());
 assert.equal((env.disk.get('legacy').match(/data:image/g)||[]).length,1);
 assert.equal(store.save({...record(),plan:{summary:'must not persist'}}),false);assert.equal(env.writes,1);
});
await check('draft corruption and scene changes preserve prior records and fail closed',()=>{
 const env=nativeStore();env.disk.set('legacy','broken');const corrupt=env.window.LightingAIVisualDraft.open();assert.equal(corrupt.load(),null);assert.equal(corrupt.save(record()),false);assert.equal(env.disk.get('legacy'),'broken');
 env.setScene('s-abcdefgh');const first=env.window.LightingAIVisualDraft.open();assert.equal(first.save(record()),true);env.setScene('s-ijklmnop');assert.equal(first.save(record()),false);
 const second=env.window.LightingAIVisualDraft.open();assert.equal(second.load(),null);assert.equal(second.save({...record(),description:'Other scene'}),true);env.setScene('s-abcdefgh');assert.equal(env.window.LightingAIVisualDraft.open().load().description,record().description);
});
await check('Control requires a current verified plan, preserves dimmer zero/CCT and clears stale transferred data',()=>{
 const events=new Map(),storage=new Map();let current=null;
 const window={currentLang:'en',LightingAIVisualPlanCurrent:()=>current,addEventListener:(n,f)=>events.set(n,f)};
 const ctx={window,document:{getElementById:()=>null},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setInterval(){return 1;},setTimeout(){},clearInterval(){}};
 vm.runInNewContext(control,ctx);
 window.__lightingAIVisualLastPlan={lighting_diagram:{lights:[{fixture:'forged'}]}};assert.equal(window.LightingAIAIControlBridge.transferLatest(),false);
 current={lighting_diagram:{lights:[{id:'L1',fixture:'Test fixture',dimmerPercent:0,cctK:5600}]}};assert.equal(window.LightingAIAIControlBridge.transferLatest(),true);
 assert.equal(window.__lightingAIControlDraft.lights[0].intensity,0);assert.equal(window.__lightingAIControlDraft.lights[0].cct,5600);
 current=null;events.get('lightingai-visual-inputs-changed')();assert.equal(storage.size,0);assert.equal(window.__lightingAIControlDraft,null);assert.equal(window.LightingAIAIControlBridge.transferLatest(),false);
 delete window.LightingAIVisualPlanCurrent;assert.equal(window.LightingAIAIControlBridge.transferLatest(),false);
});

// Reuse only the existing fixture; the previously completed suite is not run.
const earlier=read('backend/lighting-plan-request-selftest.js'),lines=ui.split(/\r?\n/);
const scope={fs,vm,URL,ui,generateLine:lines.find(x=>x.startsWith("document.getElementById('aiv-generate').onclick=")),payloadLine:lines.find(x=>x.startsWith('function pdfPayload(')),pdfLine:lines.find(x=>x.startsWith("document.getElementById('aiv-pdf-export').onclick="))};
const start=earlier.indexOf('function uiFor('),end=earlier.indexOf('\nawait check(',start);
vm.runInNewContext(earlier.slice(start,end).replaceAll('import.meta.url',JSON.stringify(pathToFileURL(path.join(root,'backend/lighting-plan-request-selftest.js')).href)),scope);
const plan={summary:'Local test',lighting_diagram:{lights:[{id:'L1',fixture:'Test fixture'}]}};
await check('photo and equipment changes still reject late answers and block Control/PDF',async()=>{
 for(const mutate of [s=>s.ctx.setPhoto('changed'),s=>{s.ctx.chosenEquipment=()=>[{id:'test',qty:2}];s.ctx.watchPlanInputs();}]){
  let release;const pending=new Promise(r=>{release=r;});const s=scope.uiFor(async()=>{await pending;return {ok:true,json:async()=>clone(plan)};});
  const call=s.document.getElementById('aiv-generate').onclick();mutate(s);release();await call;
  assert.equal(s.state.plan,null);assert.equal(s.ctx.window.__lightingAIVisualLastPlan,null);assert.equal(s.ctx.transferLatest(),false);
  s.document.getElementById('aiv-pdf-export').onclick();assert.equal(s.saved.length,0);
 }
});
await check('actual module save/restore restores inputs and selection without restoring an AI result',()=>{
 const s=scope.uiFor(async()=>{}),env=nativeStore();
 Object.assign(s.ctx,{visualDraft:env.window.LightingAIVisualDraft.open(),restoringDraft:false,draftTimer:null,clearTimeout(){},setTimeout(){return 1;}});
 s.state.equipment=[{id:'test',qty:1}];
 const checkbox={checked:true,getAttribute:()=>0};s.document.querySelectorAll=()=>[checkbox];
 vm.runInContext(lines.filter(x=>x.startsWith('function saveVisualDraft(')||x.startsWith('function restoreVisualDraft(')).join('\n'),s.ctx);
 s.state.photo=photo;s.document.getElementById('aiv-desc').value='Saved description';s.document.getElementById('aiv-dp-request').value='Saved DP';
 assert.equal(s.ctx.saveVisualDraft(),true);
 s.state.photo='';s.document.getElementById('aiv-desc').value='';s.document.getElementById('aiv-dp-request').value='';s.state.plan=plan;s.ctx.window.__lightingAIVisualLastPlan=plan;
 s.ctx.restoreVisualDraft();assert.equal(s.state.photo,photo);assert.equal(s.document.getElementById('aiv-desc').value,'Saved description');assert.equal(s.document.getElementById('aiv-dp-request').value,'Saved DP');assert.equal(checkbox.checked,true);assert.equal(s.state.plan,null);assert.equal(s.ctx.window.__lightingAIVisualLastPlan,null);
});
await check('STEP56 immediate input checkpoint does not depend on a timer or pagehide',()=>{
 let writes=0;const ctx={restoringDraft:false,saveVisualDraft(){writes++;}};
 vm.runInNewContext(lines.find(x=>x.startsWith('function queueVisualDraftSave(')),ctx);ctx.queueVisualDraftSave();assert.equal(writes,1);ctx.restoringDraft=true;ctx.queueVisualDraftSave();assert.equal(writes,1);
 const java=read('app/src/main/java/com/lightingai/app/MainActivity.java');assert.ok(java.includes('if(window.LightingAIVisualFlush)window.LightingAIVisualFlush()'));assert.match(java, /onPause\(\)\s*\{\s*checkpointScenePlanner\(\)/);
});
await check('STEP56 large photo is sent once; text uses only small metadata; failed save remains retryable',()=>{
 let photoWrites=0,metadataWrites=0,fail=false;let saved=null;
 const window={Android:{loadAIVisualDraft(){return saved?JSON.stringify(saved):'';},saveAIVisualDraft(id,data){if(fail)return false;photoWrites++;saved=JSON.parse(data);return true;},saveAIVisualDraftMetadata(id,data){if(fail)return false;assert.ok(data.length<1500);metadataWrites++;saved={...JSON.parse(data),photo:saved.photo};return true;}}};
 vm.runInNewContext(draftSource,{window});const store=window.LightingAIVisualDraft.open(),big={...record(),photo:'data:image/jpeg;base64,'+'A'.repeat(2300100)};assert.equal(store.save(big),true);
 assert.equal(store.save({...big,description:'Next input'}),true);assert.equal(photoWrites,1);assert.equal(metadataWrites,1);assert.equal(saved.photo,big.photo);
 fail=true;assert.equal(store.save({...big,description:'Not saved'}),false);assert.equal(saved.description,'Next input');fail=false;assert.equal(store.save({...big,description:'Not saved'}),true);
 assert.equal(store.save({...big,photo:'data:image/jpeg;base64,'+'A'.repeat(12000000)}),false);
});
const recoverySource=read('backend/scene-planner-recovery-selftest.js'),harness={source:read('app/src/main/assets/scene-planner-draft.js'),core:null,vm,setTimeout,clearTimeout,setImmediate};
const coreModule={exports:{}};vm.runInNewContext(read('app/src/main/assets/scene-planner-core.js'),{module:coreModule});harness.core=coreModule.exports;
vm.runInNewContext(recoverySource.slice(recoverySource.indexOf('function events()'),recoverySource.indexOf('async function test(')),harness);
function sceneFixture(){const files=new Map(),c=harness.context(new Map(),new Map(),{nativeFiles:files,scenes:true,noDb:true});c.document.getElementById=()=>null;c.attach('test');c.nodes.get('sp-description').value='Planner draft';c.overlay.emit('input',c.nodes.get('sp-description'));vm.runInNewContext(draftSource,{window:c.root});c.root.Android.loadAIVisualDraft=()=>JSON.stringify(record());return {c,files};}
let exported;
await check('STEP56 scene v2 includes AI draft, rejects unauthenticated import and invalid fields',async()=>{
 const {c}=sceneFixture();exported=await c.api.exportSceneBackup();const x=JSON.parse(exported);assert.equal(x.version,2);assert.deepEqual(x.payload.aiVisual,record());assert.throws(()=>c.api.previewSceneBackup(exported));assert.equal(c.api.previewSceneBackup(exported,true).name,'Postojeća scena');
 const tampered=JSON.parse(exported);tampered.payload.aiVisual.description='tampered';assert.throws(()=>c.api.previewSceneBackup(JSON.stringify(tampered),true));
 tampered.payload.aiVisual.plan={};tampered.integrity.digest=harness.core.sha256(harness.core.canonicalJson(tampered.payload));assert.throws(()=>c.api.previewSceneBackup(JSON.stringify(tampered),true));c.api.detach();
});
await check('STEP56 old v1 backups remain readable and failed import preserves original scene',()=>{
 const {c,files}=sceneFixture(),x=JSON.parse(exported);delete x.payload.aiVisual;x.version=1;x.integrity.digest=harness.core.sha256(harness.core.canonicalJson(x.payload));assert.equal(c.api.previewSceneBackup(JSON.stringify(x)).name,'Postojeća scena');
 const before=JSON.stringify([...files]);c.api.previewSceneBackup(exported,true);c.root.Android.importScenePlannerBackupWithVisual=()=>'';assert.throws(()=>c.api.importSceneBackup(true));assert.equal(JSON.stringify([...files]),before);c.api.detach();
});
await check('STEP56 restored scene passes only draft data to atomic import and invalidates global result',()=>{
 const {c}=sceneFixture();let imported,disposed=0;c.root.Android.importScenePlannerBackupWithVisual=(name,workspace,photo,index,visual)=>{imported=JSON.parse(visual);return 's-abcdefgh12345678';};c.root.__lightingAIVisualDispose=()=>{disposed++;};
 c.api.previewSceneBackup(exported,true);assert.equal(c.api.importSceneBackup(true).id,'s-abcdefgh12345678');assert.deepEqual(imported,record());assert.equal(disposed,1);assert.equal(imported.plan,undefined);c.api.detach();
});
await check('STEP56 backup policy covers pre31, cloud and device transfer, including legacy temporary files',()=>{
 const manifest=read('app/src/main/AndroidManifest.xml');assert.ok(manifest.includes('android:fullBackupContent="@xml/private_backup_rules"'));assert.ok(manifest.includes('android:dataExtractionRules="@xml/private_data_extraction_rules"'));
 const legacy=read('app/src/main/res/xml/private_backup_rules.xml'),modern=read('app/src/main/res/xml/private_data_extraction_rules.xml');
 for(const section of [legacy,modern.split('<cloud-backup>')[1].split('</cloud-backup>')[0],modern.split('<device-transfer>')[1].split('</device-transfer>')[0]]){assert.ok(section.includes('<exclude domain="file" path="."'));assert.ok(section.includes('<exclude domain="root" path="app_webview"'));}
 assert.ok(read('app/src/main/java/com/lightingai/app/MainActivity.java').includes('getNoBackupFilesDir()'));assert.ok(!legacy.includes('domain="sharedpref"'));
});
console.log(JSON.stringify({passed:true,groups,realAiCalls:0,portableRepositoryPaths:true}));
