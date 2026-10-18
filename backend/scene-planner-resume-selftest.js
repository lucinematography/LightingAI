import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const source=read('../app/src/main/assets/scene-planner-draft.js');
const fixture=read('./scene-planner-recovery-selftest.js');
const fixtureContext={source,core,setTimeout,clearTimeout,setImmediate,vm};
vm.runInNewContext(fixture.slice(fixture.indexOf('function events()'),fixture.indexOf('async function test(')),fixtureContext);
const ui=read('../app/src/main/assets/scene-planner.js');
const resumeSource=ui.slice(ui.indexOf('  function resumeAfterBackground(){'),ui.indexOf("  document.addEventListener('visibilitychange',function(){if(!document.hidden)resumeAfterBackground();});"));
let passed=0;
async function check(name,fn){await fn();passed++;console.log('PASS '+name);}
function screen(store=new Map(),nativeFiles=new Map()){
  const c=fixtureContext.context(store,new Map(),{nativeFiles});
  const attrs=new Map();c.overlay.getAttribute=k=>attrs.get(k)||null;c.overlay.setAttribute=(k,v)=>attrs.set(k,v);
  c.overlay.style={};c.overlay.hidden=true;
  c.nodes.set('sp-video-note',{textContent:''});
  const state={videoFile:{name:'synthetic.webm'},plan:{id:'unchanged'},frames:[{timeSec:1}],videoUrl:'blob:synthetic'};
  let opened=0;
  const sandbox={state,MODULE:'planner',draft:()=>c.api,locale:()=> 'sr',open:()=>{opened++;},el:id=>id==='planner'?c.overlay:c.nodes.get(id)};
  vm.createContext(sandbox);vm.runInContext(resumeSource,sandbox);
  return {...c,state,attrs,resume:sandbox.resumeAfterBackground,sandbox,opened:()=>opened,nativeFiles};
}
await check('live background return preserves video, plan, scene fields and scroll without reload',()=>{
  const s=screen();s.attach('rev-one');s.overlay.setAttribute('data-sp-video-loaded','1');
  s.nodes.get('sp-description').value='Scene 416';s.overlay.scrollTop=940;s.api.flush();
  const plan=s.state.plan,video=s.state.videoFile,frames=s.state.frames;
  s.document.hidden=true;s.document.emit('visibilitychange');
  for(let i=0;i<3;i++)assert.equal(s.resume(),true);
  assert.equal(s.state.plan,plan);assert.equal(s.state.videoFile,video);assert.equal(s.state.frames,frames);
  assert.equal(s.overlay.scrollTop,940);assert.equal(s.nodes.get('sp-description').value,'Scene 416');
  assert.equal(s.overlay.hidden,false);assert.equal(s.overlay.style.visibility,'visible');assert.equal(s.opened(),0);s.api.detach();
});
await check('renderer/process replacement restores native scene draft, exact revision and scroll; video gets an honest message',async()=>{
  const first=screen();first.attach('rev-one');first.overlay.setAttribute('data-sp-video-loaded','1');
  first.nodes.get('sp-description').value='Durable scene';first.nodes.get('sp-dop-camera-iso').value='1600';
  first.overlay.scrollTop=650;first.api.flush();first.api.detach();
  const next=screen(new Map(),first.nativeFiles);next.state.videoFile=null;next.state.frames=[];
  assert.equal(next.api.shouldReopen(),true);assert.equal(next.api.restore(next.overlay,'rev-one'),true);
  assert.equal(next.resume(),true);await new Promise(r=>setTimeout(r,100));
  assert.equal(next.nodes.get('sp-description').value,'Durable scene');assert.equal(next.nodes.get('sp-dop-camera-iso').value,'1600');
  assert.equal(next.overlay.scrollTop,650);assert.match(next.nodes.get('sp-video-note').textContent,/video više nije dostupan/);
  assert.equal(next.state.videoFile,null);assert.equal(next.state.frames.length,0);
  const saved=JSON.stringify([...first.nativeFiles]);assert(!saved.includes('blob:synthetic'));assert(!saved.includes('synthetic.webm'));
});
await check('closed Planner is not reopened on resume; open saved Planner is reopened once',()=>{
  const s=screen();s.api.setOpen(false);s.sandbox.el=()=>null;s.resume();assert.equal(s.opened(),0);
  s.api.setOpen(true);s.resume();assert.equal(s.opened(),1);
});
await check('Back keeps its existing close contract and renderer recovery is guarded natively',()=>{
  assert(ui.includes('if(closeIfOpen())return true;'));
  assert(ui.includes('draft().setOpen(false)'));
  const java=read('../app/src/main/java/com/lightingai/app/MainActivity.java');
  assert(java.includes('onRenderProcessGone(WebView view, RenderProcessGoneDetail detail)'));
  assert(java.includes('if (recoveringWebView) return;'));
  const resume=java.slice(java.indexOf('    @Override protected void onResume()'),java.indexOf('    private View createStartupSplash()'));
  assert(!resume.includes('loadUrl'));assert(resume.includes('resumePlannerView();'));
});
console.log(`${passed} Issue 416 regression groups passed; real AI calls: 0.`);
