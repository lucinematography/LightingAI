import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {mock} from "node:test";
import OpenAI from "openai";
import {createLightingPlanRequest, LIGHTING_PLAN_LIMITS, lightingPlanFailure} from "./lighting-plan-request.js";
import {prepareLightingInventory,assertLightingPlanInventory,lightingInventoryFailure} from "./lighting-plan-inventory.js";

import {buildLightingKnowledgeContext,lightingKnowledgePrompt,attachLightingKnowledge} from "./lighting-plan-knowledge.js";

// No real provider, public server, credentials or Android runtime are used.
globalThis.fetch = () => { throw new Error("External network forbidden in this selftest"); };
let passed = 0;
async function check(name, run) { await run(); passed++; console.log("PASS " + name); }
function deferred() { let resolve, reject; const promise = new Promise((a,b) => {resolve=a;reject=b;}); return {promise,resolve,reject}; }
const fixture = {
  summary:"Čitljiv plan — č, ć, š, ž, đ",key:"Key",fill:"Fill",backlight:"Rim",negative_fill:"Flag",
  camera_notes:"Verify exposure",color_notes:"4300 K estimate",sun_notes:"Unknown",dmx_notes:"Not provided",
  safety_notes:"Verify rigging",equipment_list:["Test fixture"],
  lighting_diagram:{subjects:[],camera:"x50 y90",lights:[{id:"L1",role:"KEY",fixtureId:"test",fixture:"Test fixture",accessoryIds:[],accessories:[],targets:["S1","invalid"],x:25,y:25,direction:"Left",notes:"Estimate"}]}
};
const complete = plan => ({status:"completed",incomplete_details:null,output_text:JSON.stringify(plan)});
const client = create => ({responses:{create}});
const content = [{type:"input_text",text:"Return JSON"},{type:"input_image",image_url:"data:image/png;base64,offline"}];
const snapshot = value => JSON.parse(JSON.stringify(value));

await check("complete JSON and PDF fields survive bounded call unchanged", async () => {
  let calls=0;
  const request=createLightingPlanRequest(client(async (body,options) => {
    calls++;
    assert.equal(body.model,"gpt-5.6-luna");
    assert.equal(body.max_output_tokens,6000);
    assert.deepEqual(body.input,[{role:"user",content}]);
    assert.equal(options.maxRetries,0);
    assert.equal(options.timeout,120000);
    assert.equal(options.signal.aborted,false);
    return complete(fixture);
  }));
  assert.deepEqual(await request(content),fixture);
  assert.equal(calls,1);
});

await check("long complete JSON remains valid with configured output limit", async () => {
  const long={...fixture,summary:"Lighting recommendation. ".repeat(500)};
  const response={...complete(long),usage:{input_tokens:1200,output_tokens:5500}};
  const result=await createLightingPlanRequest(client(async()=>response))(content);
  assert.deepEqual(result,long);
  assert.ok(response.usage.output_tokens<LIGHTING_PLAN_LIMITS.maxOutputTokens);
  // Synthetic usage is not a tokenizer benchmark or proof of live-model length.
});

await check("truncation is rejected even if output looks like complete JSON", async () => {
  for(const details of [{reason:"max_output_tokens"},{reason:"content_filter"}]) {
    await assert.rejects(createLightingPlanRequest(client(async()=>({...complete(fixture),status:"incomplete",incomplete_details:details})))(content),{code:"LIGHTING_PLAN_INCOMPLETE",status:502});
  }
  await assert.rejects(createLightingPlanRequest(client(async()=>({...complete(fixture),status:"failed"})))(content),{code:"LIGHTING_PLAN_INCOMPLETE"});
});

await check("malformed, empty and non-object JSON cannot become PDF data", async () => {
  for(const text of ['{"summary":','', 'null','[]','"text"']) {
    await assert.rejects(createLightingPlanRequest(client(async()=>({status:"completed",output_text:text})))(content),{code:"LIGHTING_PLAN_INVALID_JSON",status:502});
  }
  const result=await createLightingPlanRequest(client(async()=>({...complete(fixture),output_text:'```json\n'+JSON.stringify(fixture)+'\n```'})))(content);
  assert.deepEqual(result,fixture);
});

await check("parallel calls are rejected before a second provider request", async () => {
  const held=deferred();let calls=0;
  const request=createLightingPlanRequest(client(async()=>{calls++;return held.promise;}));
  const first=request(content);
  await assert.rejects(request(content),{code:"LIGHTING_PLAN_BUSY",status:409});
  assert.equal(calls,1);
  held.resolve(complete(fixture));await first;
  await request(content);assert.equal(calls,2);
});

await check("failure releases lock without automatic retry", async () => {
  let calls=0;
  const request=createLightingPlanRequest(client(async()=>{calls++;if(calls===1)throw new Error("offline failure");return complete(fixture);}));
  await assert.rejects(request(content),/offline failure/);
  assert.equal(calls,1);
  assert.deepEqual(await request(content),fixture);
});

await check("120-second deadline aborts request and returns controlled timeout", async () => {
  mock.timers.enable({apis:["setTimeout"]});
  try {
    let signal;
    const request=createLightingPlanRequest(client((_body,options)=>{
      signal=options.signal;
      return new Promise((_resolve,reject)=>signal.addEventListener("abort",()=>reject(Object.assign(new Error("aborted"),{name:"AbortError"})),{once:true}));
    }));
    const pending=request(content);
    const rejected=assert.rejects(pending,{code:"LIGHTING_PLAN_TIMEOUT",status:504});
    mock.timers.tick(119999);assert.equal(signal.aborted,false);
    mock.timers.tick(1);assert.equal(signal.aborted,true);
    await rejected;
    // A completed response after an expired deadline must also be refused.
    const late=deferred();
    const lateRequest=createLightingPlanRequest(client(()=>late.promise));
    const p=lateRequest(content);mock.timers.tick(120000);late.resolve(complete(fixture));
    await assert.rejects(p,{code:"LIGHTING_PLAN_TIMEOUT"});
    assert.deepEqual(await lateRequest(content),fixture,"timeout must release the lock");
  } finally { mock.timers.reset(); }
});

await check("missing API configuration and errors expose no provider secrets", async () => {
  await assert.rejects(createLightingPlanRequest(null)(content),{code:"LIGHTING_PLAN_UNAVAILABLE",status:503});
  const safe=lightingPlanFailure({code:"provider_secret_code",message:"sensitive provider detail",status:401});
  assert.deepEqual(safe,{status:500,body:{error:"Lighting plan generation failed.",code:"LIGHTING_PLAN_FAILED"}});
  assert.equal(lightingPlanFailure({code:"LIGHTING_PLAN_BUSY"}).status,409);
});

await check("installed OpenAI SDK makes only one attempt on 429, 500 and network errors", async () => {
  for(const status of [429,500,"network"]) {
    let attempts=0;
    const sdk=new OpenAI({apiKey:"offline-test-only",baseURL:"https://offline.invalid/v1",fetch:async()=>{
      attempts++;
      if(status==="network")throw new Error("offline transport failure");
      return new Response(JSON.stringify({error:{message:"offline failure",type:"test_error"}}),{status,headers:{"content-type":"application/json"}});
    }});
    await assert.rejects(createLightingPlanRequest(sdk)(content));assert.equal(attempts,1,String(status));
  }
});

await check("installed SDK accepts bounded request and returns valid plan", async () => {
  let attempts=0;
  const sdk=new OpenAI({apiKey:"offline-test-only",baseURL:"https://offline.invalid/v1",fetch:async(_url,init)=>{
    attempts++;
    const body=JSON.parse(init.body);assert.equal(body.max_output_tokens,6000);
    const response={id:"resp_offline",object:"response",created_at:0,status:"completed",incomplete_details:null,
      output:[{id:"msg_offline",type:"message",role:"assistant",status:"completed",content:[{type:"output_text",text:JSON.stringify(fixture),annotations:[]}]}]};
    return new Response(JSON.stringify(response),{status:200,headers:{"content-type":"application/json"}});
  }});
  assert.deepEqual(await createLightingPlanRequest(sdk)(content),fixture);assert.equal(attempts,1);
});

const server=fs.readFileSync(new URL("./server.js",import.meta.url),"utf8");
const start=server.indexOf('app.post("/api/lighting-plan",');
const end=server.indexOf('app.post("/api/scene-planner/plan",',start);
assert.ok(start>0&&end>start);
function routeFor(requestLightingPlan) {
  let handler;
  vm.runInNewContext(server.slice(start,end),{
    app:{post(path,fn){assert.equal(path,"/api/lighting-plan");handler=fn;}},
    buildLightingKnowledgeContext,lightingKnowledgePrompt,attachLightingKnowledge,requestLightingPlan,lightingPlanFailure,prepareLightingInventory,assertLightingPlanInventory,lightingInventoryFailure,RUNTIME_CATALOG:{fixtures:[{id:"test",model:"Test fixture"}],accessories:[]},formatEquipmentForAI:()=>"Test fixture: compatibility reference",
    console:{error(){} }
  });
  return async body=>{
    const res={statusCode:200,status(value){this.statusCode=value;return this;},json(value){this.body=value;return this;}};
    await handler({body},res);return res;
  };
}

await check("actual route preserves SR/EN payload, subjects, light targets and measurements", async () => {
  for(const language of ["sr","en"]) {
    const route=routeFor(createLightingPlanRequest(client(async body=>{
      assert.match(body.input[0].content[0].text,language==="en"?/English/:/Serbian/);
      return complete(fixture);
    })));
    const result=await route({language,equipment:[{id:"test",name:"Test fixture",qty:1}],camera:"2.0 m",subjects:[{id:"S1",label:"Actor",x:40,y:55}],scenePhoto:"data:image/png;base64,offline"});
    assert.equal(result.statusCode,200);
    assert.equal(result.body.summary,fixture.summary);
    assert.deepEqual(snapshot(result.body.lighting_diagram.subjects),[{id:"S1",label:"Actor",x:40,y:55}]);
    assert.deepEqual(snapshot(result.body.lighting_diagram.lights[0].targets),["S1"]);
    assert.match(result.body.camera_notes,language==="en"?/Planner measurements: 2.0 m/:/Merenja iz Planera: 2.0 m/);
  }
});

await check("actual route returns controlled busy, truncated and invalid-JSON errors", async () => {
  const held=deferred();let calls=0;
  const route=routeFor(createLightingPlanRequest(client(async()=>{calls++;return held.promise;})));
  const first=route({equipment:[{id:"test",qty:1}]});const second=await route({equipment:[{id:"test",qty:1}]});
  assert.equal(second.statusCode,409);assert.equal(calls,1);
  held.resolve({...complete(fixture),status:"incomplete"});
  assert.equal((await first).statusCode,502);
  const bad=routeFor(createLightingPlanRequest(client(async()=>({status:"completed",output_text:'{"summary":'}))));
  assert.equal((await bad({equipment:[{id:"test",qty:1}]})).body.code,"LIGHTING_PLAN_INVALID_JSON");
});

const ui=fs.readFileSync(new URL("../app/src/main/assets/ai-visual-scene-plan.js",import.meta.url),"utf8");
const generateLine=ui.split(/\r?\n/).find(line=>line.startsWith("document.getElementById('aiv-generate').onclick="));
const pdfLine=ui.split(/\r?\n/).find(line=>line.startsWith("document.getElementById('aiv-pdf-export').onclick="));
const payloadLine=ui.split(/\r?\n/).find(line=>line.startsWith("function pdfPayload()"));
function uiFor(fetch, language="sr") {
  const elements=new Map(), listeners=new Map();
  const document={getElementById(id){if(!elements.has(id))elements.set(id,{disabled:false,style:{},value:"",src:"",innerHTML:"",removeAttribute(key){delete this[key];}});return elements.get(id);},addEventListener(type,fn){listeners.set(type,fn);},removeEventListener(type,fn){if(listeners.get(type)===fn)listeners.delete(type);}};
  const state={photo:"data:image/png;base64,offline",plan:null,inputRevision:0,planRevision:-1,planInputKey:"",observedInputKey:""};const saved=[],transferred=[];
  const ctx={document,state,restoringDraft:false,queueVisualDraftSave(){},saveVisualDraft(){return true;},clearTimeout(){},draftTimer:null,MODULE_ID:"lightingai-ai-visual-scene-plan",SET_SKETCH_KEY:"lighting_set_sketch_v1",wrap:document.getElementById("lightingai-ai-visual-scene-plan"),API_BASE:"https://offline.invalid",generationInFlight:false,fetch,
    chosenEquipment:()=>[{id:"test",name:"Test fixture",qty:1}],chosenMeasurementContext:()=>"2.0 m",
    setSketchSubjects:()=>[{id:"S1",label:"Actor",x:40,y:55}],chosenSunContext:()=>null,chosenDmxContext:()=>null,
    descriptionWithMeasurements:()=>"Test scene",currentLanguage:()=>language,normalizePlan:v=>v,
    photoOverlay:()=>"overlay",setupMap:()=>"map",planHtml:()=>"plan",t:{noPhoto:"photo",noEquipment:"equipment",working:"working",error:"error",inputsChanged:language==="sr"?"Podaci scene su promenjeni":"Scene inputs changed",transferControlError:"stale transfer",photoReady:"ready"},
    window:{dispatchEvent(){},addEventListener(){},removeEventListener(){},LightingAIImages:{}},CustomEvent:class {},
    setTimeout(){},normalize:p=>({lights:p.lighting_diagram?.lights||[]}),save:d=>transferred.push(d),render(){},pdfEquipment:()=>[{name:"Test fixture",qty:1}],pdfTechnicalSnapshot:()=>({}),readLocal:()=>({}),pdfStatus(){},pdfStamp:()=>"offline",
    LightingAIImages:{savePlanPdf(name,payload){saved.push({name,payload:JSON.parse(payload)});},sharePlanPdf(name,payload){saved.push({name,payload:JSON.parse(payload)});}}
  };
  vm.createContext(ctx);vm.runInContext(ui.split(/\r?\n/).filter(line=>["function esc(","function inventoryKey(","function ownsScreen(","function planInputKey(","function invalidatePlan(","function inputsChanged(","function currentPlan(","function publishPlan(","function watchPlanInputs(","function resetGenerated(","function setPhoto(","function disposePlan("].some(prefix=>line.startsWith(prefix))).join("\n")+"\n"+generateLine+"\n"+payloadLine+"\n"+pdfLine,ctx);
  const lines=ui.split(/\r?\n/);
  const bridge=fs.readFileSync(new URL("../app/src/main/assets/ai-control-bridge.js",import.meta.url),"utf8");
  vm.runInContext(lines.find(x=>x.startsWith("document.getElementById('aiv-pdf-share').onclick="))+"\n"+lines.find(x=>x.startsWith("document.getElementById('aiv-transfer-control').onclick="))+"\n"+bridge.split(/\r?\n/).filter(x=>x.startsWith("function latestVisualPlan(")||x.startsWith("function transferLatest(")).join("\n"),ctx);
  vm.runInContext(lines.find(x=>x.startsWith("document.getElementById('aiv-real-preview-btn').onclick=")),ctx);
  ctx.window.LightingAIVisualPlanCurrent=ctx.currentPlan;
  ctx.window.LightingAIVisualPlanPublish=ctx.publishPlan;
  ctx.window.LightingAIAIControlBridge={transferLatest:ctx.transferLatest};
  state.observedInputKey=ctx.planInputKey();
  document.addEventListener("input",ctx.watchPlanInputs,true);
  document.addEventListener("change",ctx.watchPlanInputs,true);
  return {ctx,state,document,saved,transferred,edit(id,value,type="input"){document.getElementById(id).value=value;listeners.get(type)?.({target:document.getElementById(id)});}};
}

await check("actual generate handler prevents double tap and keeps AI-to-PDF payload", async () => {
  const held=deferred();let calls=0;
  const screen=uiFor(async()=>{calls++;await held.promise;return {ok:true,json:async()=>snapshot(fixture)};});
  const button=screen.document.getElementById("aiv-generate");
  const first=button.onclick();assert.equal(button.disabled,true);
  await button.onclick();assert.equal(calls,1);
  held.resolve();await first;
  assert.equal(button.disabled,false);assert.equal(screen.ctx.generationInFlight,false);
  assert.deepEqual(screen.state.plan,fixture);
  screen.document.getElementById("aiv-pdf-export").onclick();
  assert.equal(screen.saved.length,1);
  assert.deepEqual(screen.saved[0].payload.plan,fixture);
  assert.equal(screen.saved[0].payload.language,"sr");
  assert.equal(calls,1,"PDF export must not invoke AI again");
});

await check("actual generate handler unlocks after errors and rejects missing input", async () => {
  for(const fail of [async()=>{throw new Error("offline");},async()=>({ok:false,status:409})]) {
    let calls=0;
    const screen=uiFor(async()=>{calls++;return fail();});const button=screen.document.getElementById("aiv-generate");
    await button.onclick();assert.equal(button.disabled,false);assert.equal(screen.ctx.generationInFlight,false);assert.equal(screen.state.plan,null);assert.equal(calls,1);
    screen.state.photo="";await button.onclick();assert.equal(calls,1);
    screen.state.photo="photo";screen.ctx.chosenEquipment=()=>[];await button.onclick();assert.equal(calls,1);
  }
});

await check("actual route rejects excess quantities and unknown selection before acceptance",async()=>{
  let calls=0;
  const route=routeFor(createLightingPlanRequest(client(async()=>{calls++;return complete({...fixture,lighting_diagram:{...fixture.lighting_diagram,lights:[fixture.lighting_diagram.lights[0],{...fixture.lighting_diagram.lights[0],id:"L2"}]}});} )));
  const bad=await route({equipment:[{id:"test",qty:1}],language:"sr"});
  assert.equal(bad.statusCode,502);assert.equal(bad.body.code,"LIGHTING_PLAN_INVENTORY");assert.match(bad.body.error,/predloženo je 2, a dostupno je 1/);
  const good=await route({equipment:[{id:"test",qty:2}]});assert.equal(good.statusCode,200);assert.equal(good.body.lighting_diagram.lights.length,2);
  const before=calls;assert.equal((await route({equipment:[{name:"Test fixture",qty:1}]})).statusCode,422);assert.equal(calls,before);
});

await check("inventory rejection displays clear error and clears old plan/PDF path",async()=>{
  const screen=uiFor(async()=>({ok:false,status:502,json:async()=>({code:"LIGHTING_PLAN_INVENTORY",error:"AI plan rejected: proposed 2, available 1. PDF export is blocked."})}));
  screen.state.plan=fixture;screen.ctx.window.__lightingAIVisualLastPlan=fixture;
  await screen.document.getElementById("aiv-generate").onclick();
  assert.equal(screen.state.plan,null);assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,null);
  assert.match(screen.document.getElementById("aiv-status").innerHTML,/proposed 2, available 1/);
  assert.match(screen.document.getElementById("aiv-status").innerHTML,/error AI plan rejected/,"preserve the generic error prefix recognized by existing progress UI");
  screen.document.getElementById("aiv-pdf-export").onclick();assert.equal(screen.saved.length,0);
});

await check("inventory changes during generation or before PDF export block stale plan",async()=>{
  const screen=uiFor(async()=>({ok:true,json:async()=>snapshot(fixture)}));
  await screen.document.getElementById("aiv-generate").onclick();
  screen.ctx.chosenEquipment=()=>[{id:"test",qty:2}];
  screen.document.getElementById("aiv-pdf-export").onclick();assert.equal(screen.saved.length,0);assert.equal(screen.state.plan,null);
  const held=deferred();const pending=uiFor(async()=>{await held.promise;return {ok:true,json:async()=>snapshot(fixture)};});
  const call=pending.document.getElementById("aiv-generate").onclick();pending.ctx.chosenEquipment=()=>[{id:"test",qty:2}];held.resolve();await call;
  assert.equal(pending.state.plan,null);assert.equal(pending.ctx.window.__lightingAIVisualLastPlan,null);
});


await check("late photo response cannot restore global plan, PDF or Control in SR/EN",async()=>{
  for(const language of ["sr","en"]){
    const held=deferred();let calls=0;
    const screen=uiFor(async()=>{calls++;await held.promise;return {ok:true,json:async()=>snapshot(fixture)};},language);
    const pending=screen.document.getElementById("aiv-generate").onclick();
    screen.ctx.setPhoto("data:image/png;base64,new-photo");
    assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,null);
    held.resolve();await pending;
    assert.equal(screen.state.plan,null);assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,null);
    assert.equal(screen.document.getElementById("aiv-result").style.display,"none");
    assert.match(screen.document.getElementById("aiv-status").innerHTML,language==="sr"?/Podaci scene/:/Scene inputs/);
    for(const id of ["aiv-pdf-export","aiv-pdf-share","aiv-transfer-control"])screen.document.getElementById(id).onclick();
    assert.equal(screen.ctx.transferLatest(),false);assert.equal(screen.saved.length,0);assert.equal(screen.transferred.length,0);assert.equal(calls,1);
  }
});

await check("description, DP request and inventory edits reject delayed answers including change-and-revert",async()=>{
  for(const change of [s=>s.edit("aiv-desc","New description"),s=>s.edit("aiv-dp-request","New DP brief"),s=>{s.edit("aiv-desc","temporary");s.edit("aiv-desc","");},s=>{s.ctx.setPhoto("temporary");s.ctx.setPhoto("data:image/png;base64,offline");},s=>{s.ctx.chosenEquipment=()=>[{id:"test",qty:2}];s.ctx.watchPlanInputs();}]){
    const held=deferred();const screen=uiFor(async()=>{await held.promise;return {ok:true,json:async()=>snapshot(fixture)};});
    const pending=screen.document.getElementById("aiv-generate").onclick();change(screen);held.resolve();await pending;
    assert.equal(screen.state.plan,null);assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,null);assert.equal(screen.ctx.transferLatest(),false);
  }
});

await check("accepted plan is immediately cleared on photo/description/DP/equipment changes",async()=>{
  for(const change of [s=>s.ctx.setPhoto("new-photo"),s=>s.edit("aiv-desc","edited"),s=>s.edit("aiv-dp-request","edited"),s=>{s.ctx.chosenEquipment=()=>[{id:"test",qty:2}];s.ctx.watchPlanInputs();}]){
    const screen=uiFor(async()=>({ok:true,json:async()=>snapshot(fixture)}));
    await screen.document.getElementById("aiv-generate").onclick();assert.ok(screen.ctx.window.__lightingAIVisualLastPlan);
    change(screen);assert.equal(screen.state.plan,null);assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,null);
    assert.equal(screen.document.getElementById("aiv-overlay").innerHTML,"");assert.equal(screen.ctx.transferLatest(),false);
    screen.document.getElementById("aiv-pdf-export").onclick();assert.equal(screen.saved.length,0);
  }
});

await check("PDF and direct Control transfer recheck identity even without DOM events",async()=>{
  for(const action of [s=>s.document.getElementById("aiv-pdf-export").onclick(),s=>s.document.getElementById("aiv-pdf-share").onclick(),s=>s.ctx.transferLatest(),s=>s.document.getElementById("aiv-transfer-control").onclick()]){
    for(const change of [s=>{s.state.photo="changed silently";},s=>{s.document.getElementById("aiv-desc").value="changed silently";},s=>{s.ctx.chosenDmxContext=()=>({changed:true});}]){
      const screen=uiFor(async()=>({ok:true,json:async()=>snapshot(fixture)}));await screen.document.getElementById("aiv-generate").onclick();change(screen);action(screen);
      assert.equal(screen.state.plan,null);assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,null);assert.equal(screen.saved.length,0);assert.equal(screen.transferred.length,0);
    }
  }
});

await check("unchanged regenerated SR/EN plan preserves provenance, PDF sharing and Control transfer",async()=>{
  for(const language of ["sr","en"]){
    const plan={...snapshot(fixture),knowledgeBasis:{schema:"lightingai-professional-pdf-knowledge/1",cards:[{id:"PHY-007",sourceStatus:"UNVERIFIED"}]}};
    const screen=uiFor(async()=>({ok:true,json:async()=>snapshot(plan)}),language);
    await screen.document.getElementById("aiv-generate").onclick();screen.edit("aiv-desc","new approved input");
    await screen.document.getElementById("aiv-generate").onclick();
    screen.document.getElementById("aiv-pdf-export").onclick();screen.document.getElementById("aiv-pdf-share").onclick();
    assert.equal(screen.saved.length,2);for(const saved of screen.saved){assert.equal(saved.payload.language,language);assert.deepEqual(saved.payload.plan.knowledgeBasis,plan.knowledgeBasis);assert.equal(saved.payload.description,"new approved input");}
    assert.equal(screen.ctx.transferLatest(),true);assert.equal(screen.transferred.length,1);
  }
});

await check("closed screen rejects its late response without overwriting a newer screen",async()=>{
  const held=deferred();const screen=uiFor(async()=>{await held.promise;return {ok:true,json:async()=>snapshot(fixture)};});
  const pending=screen.document.getElementById("aiv-generate").onclick();screen.ctx.disposePlan();screen.ctx.wrap={};
  const newer={summary:"new screen plan"};screen.ctx.window.__lightingAIVisualLastPlan=newer;held.resolve();await pending;
  assert.equal(screen.ctx.window.__lightingAIVisualLastPlan,newer);assert.equal(screen.state.plan,null);
});


await check("late preview cannot attach an old photo rendering to a regenerated PDF",async()=>{
  const held=deferred();const screen=uiFor(async url=>{if(url.endsWith("/api/visual-preview")){await held.promise;return {ok:true,json:async()=>({image:"data:image/png;base64,stale-preview"})};}return {ok:true,json:async()=>snapshot(fixture)};});
  screen.state.visualPreviewAvailable=true;
  await screen.document.getElementById("aiv-generate").onclick();
  const pending=screen.document.getElementById("aiv-real-preview-btn").onclick();
  screen.ctx.setPhoto("data:image/png;base64,new-photo");await screen.document.getElementById("aiv-generate").onclick();
  held.resolve();await pending;
  assert.equal(screen.document.getElementById("aiv-real-preview-img").style.display,"none");
  screen.document.getElementById("aiv-pdf-export").onclick();assert.equal(screen.saved.length,1);
  assert.equal(screen.saved[0].payload.scenePhoto,"data:image/png;base64,new-photo");assert.equal(screen.saved[0].payload.aiPreview,"");
});

console.log(`Lighting plan controlled-request selftest: ${passed} groups passed; zero live AI calls.`);
