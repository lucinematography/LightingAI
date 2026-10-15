import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const source=fs.readFileSync(new URL('../app/src/main/assets/scene-planner-draft.js',import.meta.url),'utf8');
const DRAFT='lighting_scene_planner_draft_v1',PHOTO='lighting_scene_planner_draft_photo_v1';
let passed=0;
function events(){const listeners=new Map();return {
  addEventListener(k,f){if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(f);},
  removeEventListener(k,f){listeners.get(k)?.delete(f);},
  emit(k,target){for(const f of listeners.get(k)||[])f({target});},
  count(k){return listeners.get(k)?.size||0;}
};}
function context(store=new Map(),media=new Map(),options={}){
  const notifications=[],nodes=new Map();let writes=0;
  const overlay={...events(),scrollTop:0,isConnected:true,
    querySelector(sel){return nodes.get(sel.slice(1))||null;},querySelectorAll(){return [...nodes.values()];}};
  function field(id,value='',type='text'){
    const f={id,value,type,tagName:'INPUT',checked:false,matches:()=>true};nodes.set(id,f);return f;
  }
  field('sp-description');field('sp-iso','400');field('sp-measured','', 'checkbox');
  for(const id of ['motivation','fill','separation'])field('sp-prelight-'+id);
  field('sp-dop-camera-iso','800');field('sp-dop-local-reason');field('sp-video-auth','private-token');
  const document={...events(),hidden:false};
  const root={...events(),document,setTimeout,clearTimeout,
    localStorage:{getItem(k){if(options.storageBlocked)throw new Error('WebView storage denied');return store.get(k)||null;},setItem(k,v){
      if(options.storageBlocked||options.quota===true || (options.photoQuota&&k===PHOTO))throw new Error('Quota');
      writes++;store.set(k,v);
    }},indexedDB:options.noDb?undefined:{open(){
      const req={};setImmediate(()=>{
        req.result={close(){},createObjectStore(){},transaction(){
          const tx={objectStore(){return {
            put(value,key){setTimeout(()=>{
              if(options.dbFailure){tx.onabort?.();return;}
              media.set(key,JSON.parse(JSON.stringify(value)));tx.oncomplete?.();
            },options.dbDelay||1);},
            get(key){const read={};setImmediate(()=>{read.result=media.get(key);read.onsuccess?.();});return read;}
          };}};return tx;
        }};req.onsuccess?.();
      });return req;
    }}};
  if(options.noStorage)root.localStorage=undefined;
  if(options.nativeFiles)root.Android={
    saveScenePlannerWorkspace(value){if(options.nativeFailure)return false;options.nativeFiles.set('workspace',value);return true;},
    loadScenePlannerWorkspace(){return options.nativeFiles.get('workspace')||'';},
    saveScenePlannerPhoto(value){if(options.nativeFailure)return false;options.nativeFiles.set('photo',value);return true;},
    loadScenePlannerPhoto(){return options.nativeFiles.get('photo')||'';}
  };
  if(options.scenes&&root.Android)Object.assign(root.Android,{
    loadScenePlannerSceneIndex(){return options.nativeFiles.get('scene-index')||'';},
    saveScenePlannerSceneIndex(value){if(options.sceneIndexFailure)return false;options.nativeFiles.set('scene-index',value);return true;},
    saveScenePlannerSceneData(id,kind,value){
      if(options.nativeFailure)return false;
      options.nativeFiles.set('scene:'+id+':'+kind,value);return true;
    },
    loadScenePlannerSceneData(id,kind){return options.nativeFiles.get('scene:'+id+':'+kind)||'';}
  });
  const sandbox={window:root};vm.createContext(sandbox);vm.runInContext(source,sandbox);
  return {api:root.LightingAIScenePlannerDraft,root,document,overlay,nodes,field,store,media,
    notifications,attach:rev=>root.LightingAIScenePlannerDraft.attach(overlay,()=>rev,(ok,message)=>notifications.push({ok,message})),
    writes:()=>writes};
}
async function test(name,run){await run();passed++;console.log('PASS '+name);}
const photoSmall='data:image/png;base64,AAAA',photoLarge='data:image/jpeg;base64,'+'A'.repeat(2300100);
await test('input survives immediate process replacement without blur or final lifecycle event',()=>{
  const c=context();c.attach('rev-one');
  c.nodes.get('sp-description').value='Žena u sceni — sačuvaj odmah';
  c.nodes.get('sp-iso').value='1600';c.nodes.get('sp-measured').checked=true;
  c.overlay.emit('input',c.nodes.get('sp-description'));
  const restarted=context(c.store,c.media);assert.equal(restarted.api.restore(restarted.overlay,'rev-one'),true);
  assert.equal(restarted.nodes.get('sp-description').value,'Žena u sceni — sačuvaj odmah');
  assert.equal(restarted.nodes.get('sp-iso').value,'1600');assert.equal(restarted.nodes.get('sp-measured').checked,true);
  assert.ok(!JSON.stringify([...c.store]).includes('private-token'));
  c.api.detach();
});
await test('all three pending prelight choices and DoP fields restore only on their exact revision',()=>{
  const c=context();c.attach('rev-one');
  c.nodes.get('sp-prelight-fill').value='needs_adjustment';
  c.nodes.get('sp-prelight-motivation').value='reviewed';
  c.nodes.get('sp-prelight-separation').value='not_applicable';
  c.nodes.get('sp-dop-camera-iso').value='3200';c.nodes.get('sp-dop-local-reason').value='Zadrži senke';
  c.overlay.emit('change',c.nodes.get('sp-prelight-fill'));
  const same=context(c.store);same.api.restore(same.overlay,'rev-one');
  assert.equal(same.nodes.get('sp-prelight-fill').value,'needs_adjustment');
  assert.equal(same.nodes.get('sp-prelight-motivation').value,'reviewed');
  assert.equal(same.nodes.get('sp-prelight-separation').value,'not_applicable');
  assert.equal(same.nodes.get('sp-dop-camera-iso').value,'3200');
  const other=context(c.store);other.api.restore(other.overlay,'rev-two');
  assert.equal(other.nodes.get('sp-prelight-fill').value,'');assert.equal(other.nodes.get('sp-dop-camera-iso').value,'800');
  c.api.detach();
});
await test('background checkpoint saves scroll and listeners do not accumulate after repeated openings',()=>{
  const c=context();for(let i=0;i<4;i++){c.attach('rev-one');c.api.detach();}
  assert.equal(c.root.count('pagehide'),0);assert.equal(c.document.count('visibilitychange'),0);
  c.attach('rev-one');c.overlay.scrollTop=850;c.overlay.emit('scroll');
  c.document.hidden=true;c.document.emit('visibilitychange');
  assert.equal(JSON.parse(c.store.get(DRAFT)).scrollTop,850);
  c.nodes.get('sp-description').value='Captured by pagehide';c.root.emit('pagehide');
  assert.equal(JSON.parse(c.store.get(DRAFT)).fields['sp-description'],'Captured by pagehide');
  c.api.flush();c.api.setOpen(false);c.api.detach();assert.equal(c.api.shouldReopen(),false);
});
await test('malformed and unsupported drafts are preserved; quota failures are visible',()=>{
  for(const raw of ['invalid json',JSON.stringify({version:2,fields:{}})]){
    const c=context(new Map([[DRAFT,raw]]));c.attach('rev-one');c.api.flush();
    assert.equal(c.store.get(DRAFT),raw);assert.match(c.api.lastError(),/blokiran/);c.api.detach();
  }
  const quota=context(new Map(),new Map(),{quota:true});quota.attach('rev-one');
  quota.overlay.emit('input',quota.nodes.get('sp-description'));
  assert.equal(quota.notifications.at(-1).ok,false);quota.api.detach();
});
await test('small-large-small photo replacement recovers the newest committed image',async()=>{
  const c=context();assert.equal(await c.api.savePhoto(photoSmall),true);
  assert.equal(await c.api.savePhoto(photoLarge),true);
  assert.equal(await context(c.store,c.media).api.loadPhoto(),photoLarge);
  const last=photoSmall+'BB';assert.equal(await c.api.savePhoto(last),true);
  assert.equal(await context(c.store,c.media).api.loadPhoto(),last);
});
await test('serialized asynchronous photo writes and interrupted/failed writes preserve committed media',async()=>{
  const c=context(new Map(),new Map(),{dbDelay:5});
  const newer=photoLarge+'BB';await Promise.all([c.api.savePhoto(photoLarge),c.api.savePhoto(newer)]);
  assert.equal(await context(c.store,c.media).api.loadPhoto(),newer);
  const failed=context(c.store,c.media,{photoQuota:true,dbFailure:true});
  assert.equal(await failed.api.savePhoto(photoSmall),false);
  assert.match(failed.api.lastError(),/nije trajno sačuvana/);
  assert.equal(await context(c.store,c.media).api.loadPhoto(),newer);
});
await test('legacy photo remains readable; IndexedDB fallback works when inline quota is exhausted',async()=>{
  const c=context(new Map([[PHOTO,photoSmall]]));assert.equal(await c.api.loadPhoto(),photoSmall);
  const fallback=context(new Map(),new Map(),{photoQuota:true});assert.equal(await fallback.api.savePhoto(photoSmall),true);
  assert.equal(await context(fallback.store,fallback.media).api.loadPhoto(),photoSmall);
});
await test('persisted generated plan and saved prelight history remain immutable after process replacement',()=>{
  const input=core.request({description:'Žena kraj prozora',mode:'best'});
  const revision=core.createRevision(core.localPlan(input),input,'local',null,'recovery-scene');
  const review=core.createPrelightReview(revision,{motivation:'reviewed',fill:'reviewed',separation:'not_applicable'},'2026-10-14T12:00:00.000Z');
  const store=new Map([['lighting_scene_planner_revisions_v1',JSON.stringify([revision])],
    ['lighting_scene_planner_prelight_reviews_v1',JSON.stringify([review])]]);
  const c=context(store);c.attach(revision.revisionId);c.nodes.get('sp-prelight-fill').value='needs_adjustment';
  c.overlay.emit('change',c.nodes.get('sp-prelight-fill'));c.api.detach();
  const restored=core.restoreRevisions(JSON.parse(store.get('lighting_scene_planner_revisions_v1')));
  const reviews=core.restorePrelightReviews(JSON.parse(store.get('lighting_scene_planner_prelight_reviews_v1')),restored);
  assert.equal(restored[0].planHash,revision.planHash);assert.equal(reviews[0].decisions.fill,'reviewed');
  const restarted=context(store);restarted.api.restore(restarted.overlay,restored[0].revisionId);
  assert.equal(restarted.nodes.get('sp-prelight-fill').value,'needs_adjustment');
});
await test('native committed checkpoint restores fields, plan and reviews after WebView storage loss',async()=>{
  const nativeFiles=new Map(),c=context(new Map(),new Map(),{nativeFiles});c.attach('native-revision');
  c.nodes.get('sp-description').value='Native durable description';c.nodes.get('sp-prelight-fill').value='needs_adjustment';
  c.overlay.emit('input',c.nodes.get('sp-description'));
  assert.equal(c.api.checkpointWorkspace({lighting_scene_planner_revisions_v1:'["fixture-plan"]',
    lighting_scene_planner_prelight_reviews_v1:'["fixture-review"]',private_token:'must-not-be-stored'}),true);
  assert.equal(await c.api.savePhoto(photoSmall),true);c.api.detach();
  assert.ok(!nativeFiles.get('workspace').includes('must-not-be-stored'));
  const restarted=context(new Map(),new Map(),{nativeFiles,noDb:true});
  restarted.api.restore(restarted.overlay,'native-revision');
  assert.equal(restarted.nodes.get('sp-description').value,'Native durable description');
  assert.equal(restarted.nodes.get('sp-prelight-fill').value,'needs_adjustment');
  assert.equal(restarted.api.readWorkspaceValue('lighting_scene_planner_revisions_v1'),'["fixture-plan"]');
  assert.equal(await restarted.api.loadPhoto(),photoSmall);
});
await test('native storage failures preserve the prior committed snapshot and show failure',async()=>{
  const nativeFiles=new Map(),c=context(new Map(),new Map(),{nativeFiles});c.attach('rev-one');
  c.nodes.get('sp-description').value='Committed';c.overlay.emit('input',c.nodes.get('sp-description'));c.api.detach();
  const committed=nativeFiles.get('workspace');
  const failed=context(new Map(),new Map(),{nativeFiles,nativeFailure:true});failed.attach('rev-one');
  failed.nodes.get('sp-description').value='Uncommitted';failed.overlay.emit('input',failed.nodes.get('sp-description'));
  assert.equal(failed.notifications.at(-1).ok,false);assert.equal(nativeFiles.get('workspace'),committed);
  assert.equal(await failed.api.savePhoto(photoSmall),false);failed.api.detach();
  const recovered=context(failed.store,new Map(),{nativeFiles});recovered.api.restore(recovered.overlay,'rev-one');
  assert.equal(recovered.nodes.get('sp-description').value,'Uncommitted','newer surviving local draft is preserved');
});
await test('native checkpoint restores and saves without WebView localStorage',()=>{
  const nativeFiles=new Map(),original=context(new Map(),new Map(),{nativeFiles});
  original.attach('rev-offline');
  original.nodes.get('sp-description').value='Pre prelaska u pozadinu';
  original.overlay.emit('input',original.nodes.get('sp-description'));original.api.detach();
  const recovered=context(new Map(),new Map(),{nativeFiles,noStorage:true});
  assert.equal(recovered.api.shouldReopen(),true);
  assert.equal(recovered.api.restore(recovered.overlay,'rev-offline'),true);
  assert.equal(recovered.nodes.get('sp-description').value,'Pre prelaska u pozadinu');
  recovered.attach('rev-offline');
  recovered.nodes.get('sp-description').value='Sacuvano bez WebView baze';
  recovered.overlay.emit('input',recovered.nodes.get('sp-description'));
  assert.equal(recovered.api.lastError(),'');recovered.api.detach();
  const next=context(new Map(),new Map(),{nativeFiles,noStorage:true});
  assert.equal(next.api.restore(next.overlay,'rev-offline'),true);
  assert.equal(next.nodes.get('sp-description').value,'Sacuvano bez WebView baze');
});
await test('denied WebView storage still permits native recovery and checkpoint',()=>{
  const nativeFiles=new Map(),original=context(new Map(),new Map(),{nativeFiles});
  original.attach('rev-denied');
  original.nodes.get('sp-description').value='Pre zabrane lokalnog skladista';
  original.overlay.emit('input',original.nodes.get('sp-description'));original.api.detach();
  const blocked=context(new Map(),new Map(),{nativeFiles,storageBlocked:true});
  assert.equal(blocked.api.restore(blocked.overlay,'rev-denied'),true);
  assert.equal(blocked.nodes.get('sp-description').value,'Pre zabrane lokalnog skladista');
  blocked.attach('rev-denied');
  blocked.nodes.get('sp-description').value='Nova native sacuvana izmena';
  blocked.overlay.emit('input',blocked.nodes.get('sp-description'));
  assert.equal(blocked.api.lastError(),'');blocked.api.detach();
  const next=context(new Map(),new Map(),{nativeFiles,noStorage:true});
  assert.equal(next.api.restore(next.overlay,'rev-denied'),true);
  assert.equal(next.nodes.get('sp-description').value,'Nova native sacuvana izmena');
});

const measurementExamples=[
  ['sp-distance-L1','3.25','number'],['sp-optic-L1','reflector-A','select-one'],
  ['sp-incident-L1','250','number'],['sp-meter-model-L1','User meter','text'],
  ['sp-meter-point-L1','Actor A','text'],['sp-meter-orientation-L1','RECEPTOR_TOWARD_CAMERA','select-one'],
  ['sp-meter-time-L1','2026-10-15T14:30','datetime-local'],['sp-meter-identifier-L1','M-07','text'],
  ['sp-meter-offset-L1','+02:00','text'],['sp-scene-total-lux','420','number'],
  ['sp-scene-total-meter-model','Scene meter','text'],['sp-scene-total-meter-id','M-08','text'],
  ['sp-scene-total-point','Actor A','text'],['sp-scene-total-time','2026-10-15T14:32','datetime-local'],
  ['sp-scene-total-offset','+02:00','text'],['sp-waveform-ire','42.5','number'],
  ['sp-waveform-camera-model','User camera','text'],['sp-waveform-profile','User recording profile','text'],
  ['sp-waveform-card','Card A','text'],['sp-waveform-source','CAMERA_INTERNAL','select-one'],
  ['sp-waveform-path','RECORDING_SIGNAL','select-one'],['sp-waveform-code-range','VIDEO_LEGAL','select-one'],
  ['sp-waveform-transfer','User transfer','text'],['sp-waveform-lut','','text'],
  ['sp-waveform-time','2026-10-15T14:33','datetime-local'],['sp-waveform-offset','+02:00','text'],
  ['sp-waveform-target','41','number'],['sp-waveform-basis','User reference notes','text']
];
const measurementConfirmations=[
  'sp-distance-verified-L1','sp-optic-confirmed-L1','sp-incident-confirmed-L1',
  'sp-scene-total-measured','sp-scene-total-active','sp-waveform-reference-confirmed',
  'sp-waveform-card-confirmed','sp-waveform-camera-confirmed','sp-waveform-lights-confirmed'
];
function measurementContext(store=new Map(),options={}){
  const c=context(store,new Map(),options);
  for(const [id,value,type] of measurementExamples){
    const f=c.field(id,'',type);
    if(type==='select-one'){f.tagName='SELECT';f.options=[{value:''},{value}];}
  }
  for(const id of measurementConfirmations)c.field(id,'','checkbox');
  return c;
}
await test('pending on-set fields survive immediate replacement only on the same plan revision',()=>{
  const c=measurementContext();c.attach('meter-revision');
  for(const [id,value] of measurementExamples)c.nodes.get(id).value=value;
  for(const id of measurementConfirmations)c.nodes.get(id).checked=true;
  c.overlay.emit('input',c.nodes.get('sp-waveform-ire'));c.api.detach();
  const same=measurementContext(c.store);same.api.restore(same.overlay,'meter-revision');
  for(const [id,value] of measurementExamples)assert.equal(same.nodes.get(id).value,value,id);
  for(const id of measurementConfirmations)assert.equal(same.nodes.get(id).checked,false,id+' requires fresh confirmation');
  const other=measurementContext(c.store);other.api.restore(other.overlay,'different-revision');
  for(const [id] of measurementExamples)assert.equal(other.nodes.get(id).value,'',id+' must not cross revisions');
  const unbound=measurementContext(c.store);unbound.api.restore(unbound.overlay,null);
  assert.equal(unbound.nodes.get('sp-waveform-ire').value,'');
});
await test('pending measurements recover from native storage without changing accepted plan or reviews',()=>{
  const nativeFiles=new Map(),c=measurementContext(new Map(),{nativeFiles});
  const acceptedPlan='["accepted-plan-fixture"]',acceptedReview='["accepted-review-fixture"]';
  c.api.checkpointWorkspace({lighting_scene_planner_revisions_v1:acceptedPlan,
    lighting_scene_planner_prelight_reviews_v1:acceptedReview});
  c.attach('meter-native');
  c.nodes.get('sp-scene-total-lux').value='420';
  c.nodes.get('sp-waveform-ire').value='42.5';
  c.overlay.emit('input',c.nodes.get('sp-waveform-ire'));c.api.detach();
  const recovered=measurementContext(new Map(),{nativeFiles,noStorage:true,noDb:true});
  recovered.api.restore(recovered.overlay,'meter-native');
  assert.equal(recovered.nodes.get('sp-scene-total-lux').value,'420');
  assert.equal(recovered.nodes.get('sp-waveform-ire').value,'42.5');
  assert.equal(recovered.api.readWorkspaceValue('lighting_scene_planner_revisions_v1'),acceptedPlan);
  assert.equal(recovered.api.readWorkspaceValue('lighting_scene_planner_prelight_reviews_v1'),acceptedReview);
});
await test('measurement draft whitelist excludes secrets, unsupported inputs and physical confirmations',()=>{
  const c=measurementContext();
  c.field('sp-waveform-auth','private-measurement-token');
  c.field('sp-waveform-camera-model','private-password','password');
  c.field('sp-meter-model-L2','private-file-path','file');
  c.field('sp-meter-identifier-L2','private-hidden-value','hidden');
  c.field('sp-scene-total-point','A'.repeat(1001));
  c.attach('meter-privacy');c.overlay.emit('input',c.nodes.get('sp-waveform-ire'));c.api.detach();
  const saved=JSON.parse(c.store.get(DRAFT)).measurementFields.fields;
  for(const id of measurementConfirmations)assert.equal(Object.hasOwn(saved,id),false,id);
  const all=JSON.stringify([...c.store]);
  for(const secret of ['private-measurement-token','private-password','private-file-path','private-hidden-value','private-token'])
    assert.equal(all.includes(secret),false,secret+' must not be stored');
  assert.equal(Object.hasOwn(saved,'sp-scene-total-point'),false);
});
await test('restoration rejects forged confirmations, unknown select choices and malformed measurement values',()=>{
  const c=measurementContext();c.attach('meter-validation');
  c.overlay.emit('input',c.nodes.get('sp-waveform-ire'));c.api.detach();
  const raw=JSON.parse(c.store.get(DRAFT));
  raw.measurementFields.fields={
    'sp-waveform-source':'NO_SUCH_INSTRUMENT','sp-waveform-card-confirmed':'true',
    'sp-scene-total-active':true,'sp-waveform-ire':{value:'42.5'},'sp-waveform-ire[':'bad-selector',
    'sp-scene-total-point':'A'.repeat(1001),'sp-video-auth':'forged-token'
  };
  c.store.set(DRAFT,JSON.stringify(raw));
  const recovered=measurementContext(c.store);
  const query=recovered.overlay.querySelector.bind(recovered.overlay);
  recovered.overlay.querySelector=selector=>{
    if(selector.includes('['))throw new Error('Invalid selector must not reach the DOM');
    return query(selector);
  };
  recovered.api.restore(recovered.overlay,'meter-validation');
  assert.equal(recovered.nodes.get('sp-waveform-source').value,'');
  assert.equal(recovered.nodes.get('sp-waveform-card-confirmed').checked,false);
  assert.equal(recovered.nodes.get('sp-scene-total-active').checked,false);
  assert.equal(recovered.nodes.get('sp-waveform-ire').value,'');
  assert.equal(recovered.nodes.get('sp-scene-total-point').value,'');
  assert.equal(recovered.nodes.get('sp-video-auth').value,'private-token');
});


function seedFilmScene(c,label,iso){
  const input=core.request({description:label,mode:'best',cameraOverrides:{iso}});
  const revision=core.createRevision(core.localPlan(input),input,'local',null,'film-'+label.replace(/\s/g,'-'));
  const review=core.createPrelightReview(revision,{motivation:'reviewed',fill:'reviewed',separation:'not_applicable'},'2026-10-15T12:00:00.000Z');
  c.attach(revision.revisionId);
  c.nodes.get('sp-description').value=label;
  c.nodes.get('sp-iso').value=String(iso);
  c.nodes.get('sp-waveform-ire').value=label==='Scene A'?'42.5':'55';
  c.nodes.get('sp-prelight-fill').value='needs_adjustment';
  c.overlay.emit('input',c.nodes.get('sp-description'));
  assert.equal(c.api.checkpointWorkspace({
    lighting_scene_planner_revisions_v1:JSON.stringify([revision]),
    lighting_scene_planner_prelight_reviews_v1:JSON.stringify([review]),
    lighting_scene_planner_last_v1:JSON.stringify({plan:revision.plan,revisions:[revision]})
  }),true);
  return {revision,review};
}
await test('film scenes A-B-A retain distinct photos, plans, revisions, reviews and pending measurements',async()=>{
  const nativeFiles=new Map(),store=new Map(),options={nativeFiles,scenes:true};
  const a=measurementContext(store,options),ra=seedFilmScene(a,'Scene A',800);
  const photoA=photoSmall+'AAAA',photoB=photoSmall+'BBBB';
  assert.equal(await a.api.savePhoto(photoA),true);
  let legacyCommitted=nativeFiles.get('workspace');
  assert.equal(a.api.createScene('Scena B'),true);
  legacyCommitted=nativeFiles.get('workspace');
  const bId=a.api.activeSceneId();assert.ok(bId!=='legacy');
  assert.equal(a.api.readWorkspaceValue(DRAFT),null);
  assert.equal(await a.api.loadPhoto(),null,'new scene must not inherit legacy photo');
  const b=measurementContext(store,options);
  assert.equal(b.nodes.get('sp-description').value,'');
  const rb=seedFilmScene(b,'Scene B',1600);
  assert.equal(await b.api.savePhoto(photoB),true);
  assert.equal(nativeFiles.get('workspace'),legacyCommitted,'new scene never overwrites legacy native file');
  assert.equal(b.api.selectScene('legacy'),true);
  const backA=measurementContext(new Map(),{...options,noStorage:true,noDb:true});
  assert.equal(backA.api.restore(backA.overlay,ra.revision.revisionId),true);
  assert.equal(backA.nodes.get('sp-description').value,'Scene A');
  assert.equal(backA.nodes.get('sp-iso').value,'800');
  assert.equal(backA.nodes.get('sp-waveform-ire').value,'42.5');
  assert.equal(backA.nodes.get('sp-prelight-fill').value,'needs_adjustment');
  assert.equal(await backA.api.loadPhoto(),photoA);
  assert.equal(JSON.parse(backA.api.readWorkspaceValue('lighting_scene_planner_revisions_v1'))[0].planHash,ra.revision.planHash);
  assert.equal(JSON.parse(backA.api.readWorkspaceValue('lighting_scene_planner_prelight_reviews_v1'))[0].revisionId,ra.review.revisionId);
  assert.equal(backA.api.selectScene(bId),true);
  const reopenedB=measurementContext(new Map(),{...options,noStorage:true,noDb:true});
  assert.equal(reopenedB.api.shouldReopen(),true);
  reopenedB.api.restore(reopenedB.overlay,rb.revision.revisionId);
  assert.equal(reopenedB.nodes.get('sp-description').value,'Scene B');
  assert.equal(reopenedB.nodes.get('sp-waveform-ire').value,'55');
  assert.equal(await reopenedB.api.loadPhoto(),photoB);
  assert.equal(JSON.parse(reopenedB.api.readWorkspaceValue('lighting_scene_planner_revisions_v1'))[0].planHash,rb.revision.planHash);
});
await test('failed scene selection and failed current checkpoint keep prior scene and committed data',()=>{
  const nativeFiles=new Map(),options={nativeFiles,scenes:true};
  const c=measurementContext(new Map(),options);seedFilmScene(c,'Scene A',800);
  options.sceneIndexFailure=true;
  assert.equal(c.api.createScene('Scena B'),false);
  assert.equal(c.api.activeSceneId(),'legacy');assert.equal(nativeFiles.has('scene-index'),false);
  options.sceneIndexFailure=false;
  assert.equal(c.api.createScene('Scena B'),true);
  const selected=c.api.activeSceneId(),index=nativeFiles.get('scene-index');
  const b=measurementContext(new Map(),options);seedFilmScene(b,'Scene B',1600);
  const committed=nativeFiles.get('scene:'+selected+':workspace');
  options.nativeFailure=true;
  assert.equal(b.api.selectScene('legacy'),false);
  assert.equal(b.api.activeSceneId(),selected);assert.equal(nativeFiles.get('scene-index'),index);
  assert.equal(nativeFiles.get('scene:'+selected+':workspace'),committed);b.api.detach();
});
await test('corrupt scene index and target data are preserved without silent replacement',async()=>{
  const nativeFiles=new Map(),options={nativeFiles,scenes:true};
  const c=measurementContext(new Map(),options);seedFilmScene(c,'Scene A',800);
  assert.equal(c.api.createScene('Scena B'),true);
  const bId=c.api.activeSceneId();
  assert.equal(c.api.selectScene('legacy'),true);
  const index=nativeFiles.get('scene-index');
  nativeFiles.set('scene:'+bId+':workspace','invalid-json');
  assert.equal(c.api.selectScene(bId),false);
  assert.equal(c.api.activeSceneId(),'legacy');assert.equal(nativeFiles.get('scene-index'),index);
  assert.equal(nativeFiles.get('scene:'+bId+':workspace'),'invalid-json');
  nativeFiles.set('scene-index','broken-index');
  const blocked=measurementContext(new Map(),options),before=nativeFiles.get('workspace');
  blocked.attach('bad-index');blocked.overlay.emit('input',blocked.nodes.get('sp-description'));
  assert.equal(await blocked.api.savePhoto(photoSmall),false);
  assert.equal(blocked.api.createScene('Do not overwrite'),false);
  assert.equal(nativeFiles.get('scene-index'),'broken-index');assert.equal(nativeFiles.get('workspace'),before);
  blocked.api.detach();
});
await test('scene picker rejects unknown scenes and invalid names; legacy records remain in place',()=>{
  const nativeFiles=new Map(),options={nativeFiles,scenes:true},c=measurementContext(new Map(),options);
  seedFilmScene(c,'Scene A',800);
  const original=nativeFiles.get('workspace');
  for(const name of ['', ' '.repeat(10), 'x'.repeat(81), 'bad\nname']){
    assert.equal(c.api.createScene(name),false);
  }
  assert.equal(c.api.selectScene('../../other'),false);
  assert.equal(c.api.activeSceneId(),'legacy');
  assert.equal(c.api.listScenes().length,1);
  assert.ok(nativeFiles.get('workspace').includes('Scene A'));
  assert.ok(original.includes('Scene A'));c.api.detach();
});

console.log(`${passed} recovery regression groups passed; no provider or video processing calls.`);
