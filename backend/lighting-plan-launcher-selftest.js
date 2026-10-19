import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Reuse the existing UI fixture only; do not import or execute the earlier suite.
// Production handlers, input revision checks and launcher transport run unchanged.
globalThis.fetch = () => { throw new Error('External network forbidden'); };
const earlierUrl = new URL('./lighting-plan-request-selftest.js', import.meta.url);
const earlier = fs.readFileSync(earlierUrl, 'utf8');
const ui = fs.readFileSync(new URL('../app/src/main/assets/ai-visual-scene-plan.js', import.meta.url), 'utf8');
const launcher = fs.readFileSync(new URL('../app/src/main/assets/ai-visual-scene-launcher.js', import.meta.url), 'utf8');
const lines = ui.split(/\r?\n/);
const fixtureScope = {fs, vm, URL, ui,
  generateLine: lines.find(x => x.startsWith("document.getElementById('aiv-generate').onclick=")),
  payloadLine: lines.find(x => x.startsWith('function pdfPayload(')),
  pdfLine: lines.find(x => x.startsWith("document.getElementById('aiv-pdf-export').onclick="))};
const helperStart = earlier.indexOf('function uiFor(');
const helperEnd = earlier.indexOf('\nawait check(', helperStart);
assert.ok(helperStart > 0 && helperEnd > helperStart);
vm.runInNewContext(earlier.slice(helperStart, helperEnd).replaceAll('import.meta.url', JSON.stringify(earlierUrl.href)), fixtureScope);
const plan = {summary:'Synthetic scene', equipment_list:['Test fixture'],
  knowledgeBasis:{schema:'lightingai-professional-pdf-knowledge/1', sourceStatus:'UNVERIFIED'},
  lighting_diagram:{lights:[{id:'L1',fixtureId:'test',fixture:'Test fixture',accessoryIds:[],accessories:[]}]}};
const copy = value => JSON.parse(JSON.stringify(value));
const deferred = () => {let resolve;const promise = new Promise(r => {resolve=r;});return {promise,resolve};};
let groups = 0;
async function check(name, fn) {await fn(); groups++; console.log('PASS '+name);}

function screenFor(transport, language='sr') {
  let screen;
  screen = fixtureScope.uiFor((url, init) => screen.ctx.diagnosticPlanRequest(transport,url,init), language);
  const events=[], invalidations=[], listeners=new Map();
  Object.assign(screen.ctx, {isSr:()=>language==='sr',setPlanDiagnostic(){},clearTimeout(){},
    CustomEvent:class {constructor(type,options={}){this.type=type;this.detail=options.detail;}}});
  screen.ctx.window.addEventListener=(type,fn)=>{if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);};
  screen.ctx.window.dispatchEvent = event => {
    if(event.type==='lightingai-visual-plan-ready')events.push(event);
    else if(event.type==='lightingai-visual-plan-invalidated')invalidations.push(event);
    for(const fn of listeners.get(event.type)||[])fn(event);
  };
  vm.runInContext(launcher.slice(launcher.indexOf('function selectedLook('), launcher.indexOf('function previewGet(')), screen.ctx);
  return {...screen,events,invalidations};
}
function response(value=plan) {return new Response(JSON.stringify(value), {status:200,headers:{'content-type':'application/json'}});}
async function generate(screen) {await screen.document.getElementById('aiv-generate').onclick();}
function assertBlocked(screen) {
  assert.equal(screen.state.plan,null);
  assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,null);
  assert.equal(screen.events.length,0,'no other screen may receive an unaccepted plan');
  assert.equal(screen.ctx.transferLatest(),false);
  for(const id of ['aiv-pdf-export','aiv-pdf-share','aiv-transfer-control'])screen.document.getElementById(id).onclick();
  assert.equal(screen.saved.length,0);assert.equal(screen.transferred.length,0);
}

await check('real launcher + generate publishes once with unchanged SR/EN PDF provenance',async()=>{
  for(const language of ['sr','en']) {
    let calls=0;
    const screen=screenFor(async()=>{calls++;return response();},language);
    await generate(screen);
    assert.equal(calls,1);assert.equal(screen.events.length,1);
    assert.equal(screen.events[0].type,'lightingai-visual-plan-ready');
    assert.equal(screen.events[0].detail.plan,screen.state.plan);
    assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,screen.state.plan);
    screen.document.getElementById('aiv-pdf-export').onclick();
    assert.equal(screen.saved.length,1);assert.equal(screen.saved[0].payload.language,language);
    assert.deepEqual(copy(screen.saved[0].payload.plan.knowledgeBasis),plan.knowledgeBasis);
    assert.equal(screen.ctx.transferLatest(),true);
  }
});

const changes = [
  s=>s.ctx.setPhoto('new-photo'),
  s=>s.edit('aiv-desc','new description'),
  s=>s.edit('aiv-dp-request','new DP request'),
  s=>{s.ctx.chosenEquipment=()=>[{id:'test',qty:2}];s.ctx.watchPlanInputs();}
];
await check('delayed launcher response after photo/description/DP/equipment edits cannot publish',async()=>{
  for(const change of changes) {
    const gate=deferred();const screen=screenFor(async()=>{await gate.promise;return response();});
    const pending=generate(screen);change(screen);gate.resolve();await pending;assertBlocked(screen);
  }
});

await check('change-and-revert cannot revive a request with the previous input revision',async()=>{
  for(let i=0;i<changes.length;i++) {
    const gate=deferred();const screen=screenFor(async()=>{await gate.promise;return response();});
    const pending=generate(screen);const equipment=screen.ctx.chosenEquipment;changes[i](screen);
    if(i===0)screen.ctx.setPhoto('data:image/png;base64,offline');
    if(i===1)screen.edit('aiv-desc','');
    if(i===2)screen.edit('aiv-dp-request','');
    if(i===3){screen.ctx.chosenEquipment=equipment;screen.ctx.watchPlanInputs();}
    gate.resolve();await pending;assertBlocked(screen);
  }
});

await check('emitPlan fails closed without authority and rejects raw responses and JSON copies',async()=>{
  const screen=screenFor(async()=>response());
  const publisher=screen.ctx.window.LightingAIVisualPlanPublish;
  delete screen.ctx.window.LightingAIVisualPlanPublish;
  assert.equal(screen.ctx.emitPlan(copy(plan)),false);assert.equal(screen.events.length,0);
  screen.ctx.window.LightingAIVisualPlanPublish=publisher;
  assert.equal(screen.ctx.emitPlan(copy(plan)),false);
  await generate(screen);const accepted=screen.state.plan;
  assert.equal(screen.ctx.emitPlan(response()),false);
  assert.equal(screen.ctx.emitPlan(copy(accepted)),false);
  assert.equal(screen.ctx.emitPlan(accepted),true);
  assert.equal(screen.events.length,1,'already accepted plan must not emit duplicate events');
});

await check('an accepted plan cannot be republished after edits, including silent property edits',async()=>{
  for(const change of [...changes,s=>{s.document.getElementById('aiv-desc').value='silent edit';}]) {
    const screen=screenFor(async()=>response());await generate(screen);const old=screen.state.plan;
    screen.events.length=0;change(screen);
    assert.equal(screen.ctx.emitPlan(old),false);assertBlocked(screen);
  }
});

await check('edits after headers but before JSON body completion still reject publication',async()=>{
  const body=deferred();let clones=0;
  const screen=screenFor(async()=>({ok:true,status:200,json:()=>body.promise,clone(){clones++;throw new Error('transport must not parse a publication copy');}}));
  const pending=generate(screen);await Promise.resolve();await Promise.resolve();
  screen.edit('aiv-desc','changed while reading JSON');body.resolve(copy(plan));await pending;
  assert.equal(clones,0);assertBlocked(screen);
});

await check('raw unrelated transport response cannot overwrite a newer accepted global plan',async()=>{
  const screen=screenFor(async()=>response());await generate(screen);
  const accepted=screen.state.plan;
  await screen.ctx.diagnosticPlanRequest(async()=>response({...plan,summary:'unrelated response'}),'https://offline.invalid/api/lighting-plan',{body:'{}'});
  assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,accepted);assert.equal(screen.events.length,1);
});

await check('closed screen late answer cannot publish into another screen',async()=>{
  const gate=deferred();const screen=screenFor(async()=>{await gate.promise;return response();});
  const pending=generate(screen);screen.ctx.disposePlan();screen.ctx.wrap={};
  const newer={summary:'newer screen'};screen.ctx.window.__lightingAIVisualLastPlan=newer;
  gate.resolve();await pending;
  assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,newer);assert.equal(screen.events.length,0);
  assert.equal(screen.ctx.emitPlan(copy(plan)),false);
});

const asset = name => fs.readFileSync(new URL('../app/src/main/assets/'+name,import.meta.url),'utf8');
await check('delayed result polish rejects old plans and clears its cached plan on invalidation',async()=>{
  const screen=screenFor(async()=>response());await generate(screen);
  const tasks=[],renders=[];
  const consumer={window:screen.ctx.window,document:screen.document,COPY_ID:'copy',COMPARE_ID:'compare',
    lastPlan:null,setTimeout:fn=>tasks.push(fn),renderPlan:p=>renders.push(p),patchMap:p=>renders.push(p),ensureCopy:p=>renders.push(p),closeFullCompare(){}};
  for(const id of ['copy','compare'])screen.document.getElementById(id).remove=()=>{};
  const source=asset('ai-visual-result-polish.js');
  vm.createContext(consumer);
  vm.runInContext(source.split(/\r?\n/).filter(x=>['function normalize(','function currentPolishPlan(','function polish('].some(p=>x.startsWith(p))||x.startsWith("window.addEventListener('lightingai-visual-plan-invalidated'")).join('\n'),consumer);
  const old=screen.state.plan;
  assert.equal(consumer.polish({plan:old}),true);
  screen.edit('aiv-desc','new description');
  assert.equal(consumer.lastPlan,null);assert.equal(screen.invalidations.length,1);
  for(const run of tasks.splice(0))run();assert.equal(renders.length,0);
  assert.equal(consumer.polish(old),false);
  await generate(screen);assert.equal(consumer.polish(screen.state.plan),true);
  for(const run of tasks.splice(0))run();assert.equal(renders.length,5);
});

await check('local simulation rejects stale events and hides cached output after input edits',async()=>{
  const screen=screenFor(async()=>response());await generate(screen);
  let renders=0;
  const consumer={window:screen.ctx.window,document:screen.document,ROOT_ID:'simulation',lastPlan:null,apply(){renders++;}};
  const source=asset('ai-visual-local-simulation.js');vm.createContext(consumer);
  vm.runInContext(source.split(/\r?\n/).filter(x=>x.startsWith('function simulationPlanCurrent(')||x.startsWith('function render(')||x.startsWith("window.addEventListener('lightingai-visual-plan-invalidated'")).join('\n'),consumer);
  const old=screen.state.plan;assert.equal(consumer.render({plan:old}),true);
  screen.ctx.setPhoto('new photo');assert.equal(consumer.lastPlan,null);
  assert.equal(screen.document.getElementById('simulation').style.display,'none');
  assert.equal(consumer.render(old),false);assert.equal(renders,1);
});

await check('late refinement cannot attach an old image to a new plan or PDF',async()=>{
  const screen=screenFor(async()=>response());await generate(screen);
  const preview=screen.document.getElementById('aiv-real-preview-img');preview.src='old-preview';preview.style.display='block';
  const gate=deferred(),started=deferred();let sent=0;
  const consumer={window:screen.ctx.window,document:screen.document,pending:false,previousPreviewSrc:'',previousPreviewPlan:null,
    API_BASE:'https://offline.invalid',compactPreviewSource:async()=> 'compact',setControlsDisabled(){},updatePreviousButton(){},isSr:()=>true,
    fetch:async()=>{sent++;started.resolve();await gate.promise;return {ok:true,json:async()=>({image:'stale refined image'})};}};
  const source=asset('ai-visual-preview-refinements.js');vm.createContext(consumer);
  vm.runInContext(source.split(/\r?\n/).find(x=>x.startsWith('function refinementPlan('))+'\n'+source.slice(source.indexOf('async function applyRefinement('),source.indexOf('function button(')),consumer);
  const pending=consumer.applyRefinement('brighter');await started.promise;
  screen.ctx.setPhoto('new-photo');await generate(screen);gate.resolve();
  assert.equal(await pending,false);assert.equal(sent,1);assert.equal(consumer.previousPreviewSrc,'');
  screen.document.getElementById('aiv-pdf-export').onclick();assert.equal(screen.saved[0].payload.aiPreview,'');
  assert.equal(screen.saved[0].payload.scenePhoto,'new-photo');
  delete screen.ctx.window.LightingAIVisualPlanCurrent;
  assert.equal(await consumer.applyRefinement('unknown identity'),false);assert.equal(sent,1);
});

console.log(`Launcher publication regression: ${groups} groups passed; real AI calls: 0.`);
