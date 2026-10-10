import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
import {canonicalInventory} from './scene-planner-service.js';

const require=createRequire(import.meta.url);
const core=require('../app/src/main/assets/scene-planner-core.js');
let passed=0;
function test(name,run){run();passed++;console.log('PASS '+name);}
const hash=s=>createHash('sha256').update(s,'utf8').digest('hex');
const input={description:'Day for Night: žena hoda',captureLighting:'day',look:'Day for Night',
  roomWidthM:8,roomDepthM:6,dimensionsMeasured:true,
  sceneLatitude:44.8,sceneLongitude:20.4,sceneCoordsVerified:true,
  cameraOverrides:{aperture:4,iso:400},dopRequest:'Hladnija kontra; očuvaj senke'};
const raw={lights:[{id:'L1',fixtureId:'led-a',fixtureName:'LED A',role:'key',x:20,y:30,
  heightM:2.2,distanceM:3,angleDeg:45,intensityPct:50,kelvin:4300,
  verticalTiltDeg:-25,beamAngleDeg:60,modifier:'Diffusion',color:'',coverageStages:[0,1],positionNote:'Left'},
  {id:'L2',fixtureId:'led-b',fixtureName:'LED B',role:'backlight',x:75,y:20}],
  actors:[{label:'Žena',path:[{x:40,y:50,timeSec:0},{x:60,y:50,timeSec:2}]}],
  cameraSettings:{fps:25,shutterAngle:180,iso:800,aperture:2.8,focalLengthMm:35}};
const first=core.createRevision(raw,input,'ai',null,'scene-test');
const before=core.canonicalJson(first);

test('SHA-256 independent UTF-8 and padding vectors',()=>{
  for(const s of ['', 'abc','žena 🎬','\ud800','x'.repeat(55),'x'.repeat(56),'x'.repeat(64),'x'.repeat(1000)])
    assert.equal(core.sha256(s),hash(s));
});
test('canonical order and strict JSON validation',()=>{
  assert.equal(core.canonicalJson({b:2,a:{y:3,x:1}}),core.canonicalJson({a:{x:1,y:3},b:2}));
  assert.notEqual(core.planHash([1,2]),core.planHash([2,1]));
  for(const invalid of [undefined,NaN,Infinity,{bad:undefined},[undefined],new Date()])
    assert.throws(()=>core.canonicalJson(invalid));
  const cyclic={};cyclic.self=cyclic;assert.throws(()=>core.canonicalJson(cyclic),/Cyclic/);
});
test('deterministic validated plan and revision hashes',()=>{
  const reordered=Object.fromEntries(Object.entries(raw).reverse());
  assert.deepEqual(core.createRevision(reordered,input,'ai',null,'scene-test'),first);
  assert.equal(first.planHash,hash(core.canonicalJson(first.plan)));
  assert.notEqual(core.createRevision(raw,input,'ai',null,'scene-other').revisionId,first.revisionId);
  assert.equal(core.createRevision({...raw,unused:'not validated'},input,'ai',null,'scene-test').planHash,first.planHash);
});
test('deep immutability, no aliasing, and complete settings',()=>{
  assert.throws(()=>{first.plan.lights[0].x=90;},TypeError);
  assert.throws(()=>{first.plan.actors[0].path.push({x:1});},TypeError);
  const copy=structuredClone(raw),r=core.createRevision(copy,input,'ai',null,'scene-copy');
  copy.lights[0].heightM=9;assert.equal(r.plan.lights[0].heightM,2.2);
  assert.equal(first.plan.lights[0].verticalTiltDeg,-25);
  assert.equal(first.plan.lights[0].beamAngleDeg,60);
  assert.deepEqual(first.plan.lights[0].coverageStages,[0,1]);
  assert.equal(first.plan.cameraSettings.aperture,4);
  assert.equal(first.plan.dopRequest,input.dopRequest);
  assert.equal(first.plan.dataStatus.cameraSettings.aperture,'dop-specified');
  assert.equal(first.plan.dataStatus.cameraSettings.fps,'estimated');
  assert.equal(first.plan.dataStatus.geometry,'confirmed-by-user');
  assert.equal(first.plan.dataStatus.location,'confirmed-by-user');
  assert.equal(first.plan.dataStatus.exposure,'unconfirmed');
});
const second=core.createRevision({...raw,lights:[{...raw.lights[1],intensityPct:25},
  {...raw.lights[0],x:30}]},{...input,dopRequest:'Smanji kontru'},'ai',first);
test('parent chain and unchanged prior revision',()=>{
  assert.equal(second.parentRevisionId,first.revisionId);
  assert.equal(second.sequence,2);assert.equal(second.sceneId,first.sceneId);
  assert.notEqual(second.revisionId,first.revisionId);
  assert.notEqual(second.lightPlotRevisionId,first.lightPlotRevisionId);
  assert.notEqual(second.planHash,first.planHash);
  assert.equal(core.canonicalJson(first),before);
  assert.throws(()=>core.createRevision(raw,input,'ai',first,'another'),/scene identity/);
});
test('fixture instance identity survives reordering and role change',()=>{
  assert.equal(second.plan.lights[0].id,'L2');assert.equal(second.plan.lights[1].id,'L1');
  const changed=core.createRevision({...raw,lights:[{...raw.lights[0],role:'fill'}]},input,'ai',second);
  assert.equal(changed.plan.lights[0].id,'L1');
  const implicit=core.createRevision({lights:[{...raw.lights[1],id:undefined},
    {...raw.lights[0],id:undefined}]},input,'ai',first);
  assert.deepEqual(implicit.plan.lights.map(l=>l.id),['L2','L1']);
  const replacement=core.createRevision({lights:[{...raw.lights[0],fixtureId:'replacement'}]},input,'ai',first);
  assert.equal(replacement.plan.lights[0].id,'L3');
});
test('removed identities never reused; duplicate instances handled conservatively',()=>{
  const empty=core.createRevision({lights:[]},input,'ai',second);
  const next=core.createRevision(raw,input,'ai',empty);
  assert.deepEqual(next.plan.lights.map(l=>l.id),['L3','L4']);
  const duplicate=core.createRevision({lights:[raw.lights[0],raw.lights[0]]},input,'ai',first);
  assert.deepEqual(duplicate.plan.lights.map(l=>l.id),['L1','L3']);
  const ambiguous=core.createRevision({lights:[{...raw.lights[0],id:undefined}]},input,'ai',duplicate);
  assert.equal(ambiguous.plan.lights[0].id,'L4');
});
function capacityScene(count,mode='best') {
  const lights=Array.from({length:count},(_,i)=>({...raw.lights[0],id:'L'+(i+1),
    fixtureId:i===count-1?'fixture-'+ 'x'.repeat(130):'fixture-'+i,
    fixtureName:i===count-1?'Model '+ 'm'.repeat(155):'Model '+i,
    role:['key','fill','backlight','ambient'][i%4],x:10+i*4,y:20+i*3,
    heightM:2+i/10,distanceM:3+i/10,angleDeg:i*15,intensityPct:25+i,
    kelvin:4000+i*50,color:i%2?'warm':'cool',modifier:'Diffusion',
    verticalTiltDeg:-i,beamAngleDeg:30+i,coverageStages:[0,1],positionNote:'Position '+i}));
  return {raw:{...raw,lights},input:{...input,mode,cameraOverrides:{},
    equipment:lights.map(l=>({fixtureId:l.fixtureId,name:l.fixtureName,qty:1,powerDrawW:200,
      cctK:{min:2700,max:6500}})),modifiers:['Diffusion']}};
}
for(const count of [12,13,16])test(`${count} lights retain all settings across repeated ISO revisions`,()=>{
  for(const mode of ['best','own']) {
    const scene=capacityScene(count,mode);
    let parent=core.createRevision(scene.raw,scene.input,'ai',null,`scene-${mode}-${count}`);
    const initial=parent,initialBytes=core.canonicalJson(initial),chain=[parent];
    assert.equal(core.request({...scene.input,previousPlan:parent.plan}).previousPlan.lights.length,count);
    for(const iso of [400,1600,800,400]) {
      const previousBytes=core.canonicalJson(parent);
      const next=core.createRevision(parent.plan,{...scene.input,cameraOverrides:{iso},
        dopRequest:'Change ISO only to '+iso},'ai',parent);
      assert.deepEqual(next.plan.lights,initial.plan.lights,'Every supported light field stays unchanged');
      assert.deepEqual(next.plan.lights.map(l=>l.id),Array.from({length:count},(_,i)=>'L'+(i+1)));
      assert.equal(next.plan.cameraSettings.iso,iso);
      for(const key of ['fps','shutterAngle','aperture','whiteBalanceK','ndStops','focalLengthMm'])
        assert.equal(next.plan.cameraSettings[key],parent.plan.cameraSettings[key]);
      assert.notEqual(next.planHash,parent.planHash);
      assert.equal(next.planHash,hash(core.canonicalJson(next.plan)));
      assert.notEqual(next.lightPlotRevisionId,parent.lightPlotRevisionId);
      assert.equal(next.parentRevisionId,parent.revisionId);
      assert.equal(core.canonicalJson(parent),previousBytes);
      assert.equal(core.canonicalJson(initial),initialBytes);
      chain.push(next);parent=next;
    }
    assert.equal(core.restoreRevisions(JSON.parse(JSON.stringify(chain))).length,5);
  }
});
test('full-capacity explicit edit, removal, addition and replacement do not steal identities',()=>{
  const scene=capacityScene(16);
  const root=core.createRevision(scene.raw,scene.input,'ai',null,'scene-edits');
  const before=core.canonicalJson(root);
  const edited=core.createRevision({...root.plan,lights:root.plan.lights.map(l=>l.id==='L13'?{
    ...l,role:'backlight',x:70,heightM:4,angleDeg:90,intensityPct:30,kelvin:5600}:l)},scene.input,'ai',root);
  assert.equal(edited.plan.lights[12].id,'L13');assert.equal(edited.plan.lights[12].x,70);
  assert.deepEqual(edited.plan.lights.filter(l=>l.id!=='L13'),root.plan.lights.filter(l=>l.id!=='L13'));
  const removed=core.createRevision({...edited.plan,lights:edited.plan.lights.filter(l=>l.id!=='L2')},scene.input,'ai',edited);
  assert.deepEqual(removed.plan.lights,edited.plan.lights.filter(l=>l.id!=='L2'));
  const added=core.createRevision({...removed.plan,lights:[{...scene.raw.lights[1],fixtureId:'new-fixture'},
    ...removed.plan.lights.slice().reverse()]},scene.input,'ai',removed);
  assert.equal(added.plan.lights[0].id,'L17');
  assert.deepEqual(added.plan.lights.slice(1),removed.plan.lights.slice().reverse());
  const replaced=core.createRevision({...added.plan,lights:added.plan.lights.map(l=>l.id==='L13'?{
    ...l,fixtureId:'replacement-fixture',fixtureName:'Replacement model'}:l)},scene.input,'ai',added);
  assert.equal(replaced.plan.lights.find(l=>l.fixtureId==='replacement-fixture').id,'L18');
  assert.deepEqual(replaced.plan.lights.filter(l=>l.id!=='L18'),added.plan.lights.filter(l=>l.id!=='L13'));
  const capped=core.createRevision({...root.plan,lights:[...root.plan.lights,{...scene.raw.lights[0],fixtureId:'overflow'}]},scene.input,'ai',root);
  assert.equal(capped.plan.lights.length,16);assert.deepEqual(capped.plan.lights,root.plan.lights);
  assert.equal(core.canonicalJson(root),before);
});
test('inventory, CCT, modifier and range validation before hashing',()=>{
  const req=canonicalInventory(core.request({...input,mode:'own',equipment:[
    {fixtureId:'led-a',name:'LED A',qty:1}],modifiers:['Diffusion']}),[
    {id:'led-a',manufacturer:'Test',model:'LED A',powerDrawW:200,cctK:{min:2700,max:6500}}]);
  const r=core.createRevision({lights:[{...raw.lights[0],kelvin:12000,x:-20,intensityPct:150,
    modifier:'Imaginary'},raw.lights[0],raw.lights[1]]},req,'ai',null,'scene-owned');
  assert.equal(r.plan.lights.length,1);assert.equal(r.plan.lights[0].kelvin,6500);
  assert.equal(r.plan.lights[0].x,5);assert.equal(r.plan.lights[0].intensityPct,100);
  assert.equal(r.plan.lights[0].modifier,'');assert.equal(r.plan.lights[0].powerDrawW,200);
  assert.equal(r.plan.lights[0].estimated,true);assert.equal(r.plan.dataStatus.inventory,'user-declared');
  assert.equal(core.verifyRevision(r),true);
});
test('JSON restoration checks integrity and chain; restores freezing',()=>{
  const restored=core.restoreRevisions(JSON.parse(JSON.stringify([first,second])));
  assert.deepEqual(restored,[first,second]);assert.ok(Object.isFrozen(restored[0].plan.cameraSettings));
  const corrupt=JSON.parse(JSON.stringify(first));corrupt.plan.lights[0].x=88;
  assert.throws(()=>core.restoreRevisions([corrupt]),/integrity/);
  assert.throws(()=>core.restoreRevisions([second]),/history/);
  assert.throws(()=>core.restoreRevisions([first,first]),/history/);
  assert.throws(()=>core.restoreRevisions([]),/Empty/);
});
test('future MP4 binding pins exact plot and immutable plan',()=>{
  const binding=core.videoRevisionBinding(first);
  assert.equal(binding.lightPlotRevisionId,first.lightPlotRevisionId);
  assert.equal(binding.planHash,first.planHash);assert.equal(binding.revisionId,first.revisionId);
  assert.notDeepEqual(binding,core.videoRevisionBinding(second));assert.ok(Object.isFrozen(binding));
});
test('Android file context without crypto, module, require or TextEncoder',()=>{
  const sandbox={};vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(new URL('../app/src/main/assets/scene-planner-core.js',import.meta.url),'utf8'),sandbox);
  const browser=sandbox.LightingAIScenePlannerCore;
  const r=browser.createRevision(raw,input,'ai',null,'scene-test');
  assert.equal(browser.canonicalJson(r),core.canonicalJson(first));
  assert.equal(browser.sha256('žena 🎬'),hash('žena 🎬'));
  assert.equal(browser.verifyRevision(browser.restoreRevisions(JSON.parse(JSON.stringify([r])))[0]),true);
});

function uiContext(store=new Map(),quota=false,aiPlan=null) {
  const nodes=new Map();
  const values={'sp-mode':'best','sp-description':'Žena hoda noću','sp-look':'Night','sp-capture':'day',
    'sp-width':'8','sp-depth':'6','sp-dop-request':''};
  const sandbox={console,window:{},document:{readyState:'loading',addEventListener(){},
    getElementById(id){
      if(!nodes.has(id))nodes.set(id,{value:values[id]||'',checked:false,style:{},textContent:'',innerHTML:'',scrollIntoView(){}});
      return nodes.get(id);
    }},localStorage:{getItem:k=>store.get(k)||null,
      setItem(k,v){if(quota)throw new Error('Quota exceeded');store.set(k,v);}},
    AbortController,setTimeout,clearTimeout,
    async fetch(){
      if(!aiPlan)throw new Error('Network forbidden in offline UI regression');
      return {ok:true,async json(){return {ok:true,plan:aiPlan};}};
    }};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(new URL('../app/src/main/assets/scene-planner-core.js',import.meta.url),'utf8'),sandbox);
  sandbox.window.LightingAIScenePlannerCore=sandbox.LightingAIScenePlannerCore;
  // Test-only closure access; no test hooks ship in the production asset.
  const source=fs.readFileSync(new URL('../app/src/main/assets/scene-planner.js',import.meta.url),'utf8')
    .replace('window.LightingAIScenePlanner={','state.photo="data:image/png;base64,offline"; window.LightingAIScenePlanner={test:{generate:generate,restore:restorePlanHistory,exportObject:exportObject},');
  vm.runInContext(source,sandbox);
  return {api:sandbox.window.LightingAIScenePlanner.test,nodes,store};
}
const ui=uiContext();
await ui.api.generate(false);
const oldUiPlan=JSON.stringify(ui.api.exportObject().revisions[0]);
ui.nodes.get('sp-dop-request').value='Hladnija kontra';
await ui.api.generate(false);
const saved=ui.api.exportObject();
assert.equal(saved.revisions.length,2);
assert.equal(JSON.stringify(saved.revisions[0]),oldUiPlan);
assert.equal(saved.plan,saved.revisions[1].plan,'plot and technical UI share the exact frozen revision plan');
assert.equal(saved.plan.dopRequest,'Hladnija kontra');
assert.ok(ui.nodes.get('sp-plot').innerHTML.includes(saved.revisions[1].lightPlotRevisionId));
assert.ok(ui.nodes.get('sp-plot').innerHTML.includes(saved.revisions[1].planHash));
for(const light of saved.plan.lights){
  assert.ok(ui.nodes.get('sp-plot').innerHTML.includes('>'+light.id+'</text>'));
  assert.ok(ui.nodes.get('sp-lights').innerHTML.includes(light.id+' /'));
}
const reloaded=uiContext(ui.store);
assert.equal(reloaded.api.restore(),true);
assert.equal(core.canonicalJson(reloaded.api.exportObject().revisions),core.canonicalJson(saved.revisions));
await reloaded.api.generate(false);
assert.equal(reloaded.api.exportObject().revisions.length,3);
console.log('PASS offline UI generation, DoP revision, export and reload');passed++;
const corruptUi=uiContext(new Map([['lighting_scene_planner_revisions_v1','invalid json']]));
assert.equal(corruptUi.api.restore(),false);
await corruptUi.api.generate(false);
assert.equal(corruptUi.api.exportObject().revisions.length,0);
assert.equal(corruptUi.store.get('lighting_scene_planner_revisions_v1'),'invalid json');
const quotaUi=uiContext(new Map(),true);
await quotaUi.api.generate(false);
assert.equal(quotaUi.api.exportObject().revisions.length,1);
assert.match(quotaUi.nodes.get('sp-status').textContent,/JSON/);
console.log('PASS corrupt history preservation and visible storage failure');passed++;

const fullScene=capacityScene(16);
const fullRoot=core.createRevision(fullScene.raw,fullScene.input,'ai',null,'scene-ui-16');
const fullUi=uiContext(new Map([['lighting_scene_planner_revisions_v1',JSON.stringify([fullRoot])]]),false,fullRoot.plan);
assert.equal(fullUi.api.restore(),true);
for(const iso of [400,1600,800]) {
  fullUi.nodes.set('sp-iso',{value:String(iso)});
  await fullUi.api.generate(true);
  const current=fullUi.api.exportObject(),revision=current.revisions[current.revisions.length-1];
  assert.equal(current.plan,revision.plan);
  assert.equal(current.plan.cameraSettings.iso,iso);
  assert.equal(core.canonicalJson(current.plan.lights),core.canonicalJson(fullRoot.plan.lights));
  assert.ok(fullUi.nodes.get('sp-plot').innerHTML.includes(revision.lightPlotRevisionId));
  assert.ok(fullUi.nodes.get('sp-plot').innerHTML.includes(revision.planHash));
  assert.ok(fullUi.nodes.get('sp-camera-result').innerHTML.includes('ISO '+iso));
  for(const l of current.plan.lights) {
    assert.ok(fullUi.nodes.get('sp-plot').innerHTML.includes('cx="'+l.x+'" cy="'+l.y+'"'));
    assert.ok(fullUi.nodes.get('sp-plot').innerHTML.includes('>'+l.id+'</text>'));
    assert.ok(fullUi.nodes.get('sp-lights').innerHTML.includes(l.id+' /'));
    assert.ok(fullUi.nodes.get('sp-lights').innerHTML.includes(l.fixtureName));
    assert.ok(fullUi.nodes.get('sp-lights').innerHTML.includes('Položaj '+l.x+'% / '+l.y+'%'));
  }
  assert.equal(core.canonicalJson(current.revisions[0]),core.canonicalJson(fullRoot));
}
assert.equal(fullUi.api.exportObject().revisions.length,4);
console.log('PASS 16-light offline UI ISO changes keep plot and technical cards on the exact revision');passed++;

console.log(`${passed} offline revision regression groups passed; no provider calls.`);
