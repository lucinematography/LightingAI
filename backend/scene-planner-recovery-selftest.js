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
    localStorage:{getItem:k=>store.get(k)||null,setItem(k,v){
      if(options.quota===true || (options.photoQuota&&k===PHOTO))throw new Error('Quota');
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
  if(options.nativeFiles)root.Android={
    saveScenePlannerWorkspace(value){if(options.nativeFailure)return false;options.nativeFiles.set('workspace',value);return true;},
    loadScenePlannerWorkspace(){return options.nativeFiles.get('workspace')||'';},
    saveScenePlannerPhoto(value){if(options.nativeFailure)return false;options.nativeFiles.set('photo',value);return true;},
    loadScenePlannerPhoto(){return options.nativeFiles.get('photo')||'';}
  };
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
console.log(`${passed} recovery regression groups passed; no provider or video processing calls.`);
