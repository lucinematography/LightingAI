import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import http from "node:http";
import path from "node:path";
import {buildLightingKnowledgeContext,lightingKnowledgePrompt,attachLightingKnowledge,PDF_KNOWLEDGE_SCHEMA} from "./lighting-plan-knowledge.js";
import {prepareLightingInventory,assertLightingPlanInventory,lightingInventoryFailure} from "./lighting-plan-inventory.js";
import {buildRuntimeCatalog} from "./catalog-runtime.js";
import {accessoryRecord,buildAccessoryTree} from "./accessory-graph.js";
import {createLightingPlanRequest,lightingPlanFailure} from "./lighting-plan-request.js";

// Real local adapters and real route, fake provider only. No SDK, keys or remote fetch.
globalThis.fetch=()=>{throw new Error("External network forbidden in knowledge selftest");};
let groups=0;
async function check(name,run){await run();groups++;console.log("PASS "+name);}
const clone=x=>JSON.parse(JSON.stringify(x));
const catalog=buildRuntimeCatalog();catalog.fixtureById=new Map(catalog.fixtures.map(x=>[x.id,x]));catalog.accessoryById=new Map(catalog.accessories.map(x=>[x.id,x]));
const fixtureId="aputure-ls-600d-pro",fixture="Aputure LS 600d Pro";
const body={language:"en",description:"Negative fill crna zastava bounce senka",dpRequest:"Control unwanted bounce without assuming available grip",look:"directional",equipment:[{id:fixtureId,qty:1}],subjects:[{id:"S1",label:"Actor",x:50,y:50}]};
const inventory=prepareLightingInventory(body.equipment,catalog);
const context=buildLightingKnowledgeContext(body,inventory);
function plan(){return {summary:"SIMULATION ONLY: ČĆŠŽĐ čćšžđ",key:"Use selected key; confirm on set",fill:"Unconfirmed",backlight:"Not selected",negative_fill:"Consider only if grip is available",camera_notes:"Verify exposure",color_notes:"CCT estimate",sun_notes:"Unknown",dmx_notes:"Not supplied",safety_notes:"Qualified crew must review rigging and power",equipment_list:[fixture],knowledgeCardIds:["PHY-007"],lighting_diagram:{subjects:body.subjects,camera:"x50 y90",lights:[{id:"L1",fixtureId,fixture,role:"KEY",accessoryIds:[],accessories:[],targets:["S1"],x:25,y:30,heightM:2.4,cctK:5600,dimmerPercent:0,intensityPct:null,direction:"Left, estimate",notes:"Unmeasured proposal"}]}};}

await check("actual K0/K1 adapters return relevant cards with unchanged verification status",()=>{
 assert.equal(context.schema,PDF_KNOWLEDGE_SCHEMA);assert.equal(context.k0Contract,"lightingai-knowledge-recommendation/1");assert.equal(context.k1Contract,"lightingai-knowledge-k1-brief/1");
 assert.ok(context.cards.some(c=>c.id==="PHY-007"));assert.ok(context.cards.length<=4);assert.ok(context.cards.every(c=>c.sourceStatus==="UNVERIFIED"&&c.dopStatus==="NEEDS_DOP_REVIEW"));
 assert.equal(context.k1SourceVerification,"UNVERIFIED_NO_ORIGINAL_PAGES_REVIEWED");assert.ok(Object.isFrozen(context));
 assert.equal(context.binding.videoEvidence,null);assert.equal(context.binding.purpose,"REQUEST_CONTEXT_ONLY_EMPTY_LIGHT_PLAN");
});
await check("only independently reviewed narrow Landau reference is carried, not full-card approval",()=>{
 assert.equal(context.reviewedReferences.length,1);const r=context.reviewedReferences[0];
 assert.equal(r.sourceId,"landau-2014");assert.equal(r.pdfPage,18);assert.equal(r.printedPage,8);assert.equal(r.wholeCardVerified,false);assert.equal(r.sceneApplicability,"NOT_VERIFIED");assert.equal(r.scope,"REDUCING_UNWANTED_BOUNCE_ONLY");
 assert.ok(!JSON.stringify(context).includes('"pdfPage":98'));
});
await check("prompt includes authored advisory principles, selected IDs, limits and no raw PDFs",()=>{
 const prompt=lightingKnowledgePrompt(context);assert.match(prompt,/Tamni zastori/);assert.match(prompt,new RegExp(fixtureId));
 assert.match(prompt,/not proof of scene applicability/);assert.match(prompt,/unmeasured estimates/);assert.match(prompt,/unselected gear/);
 assert.ok(!prompt.includes("%PDF"));assert.ok(!prompt.includes("base64"));assert.ok(!prompt.includes("LightingAI_Reference_Books/"));assert.ok(prompt.length<18000);
});
await check("copied or forged context objects cannot bypass the adapter",()=>{
 assert.throws(()=>lightingKnowledgePrompt(clone(context)),e=>e.code==="LIGHTING_PLAN_KNOWLEDGE");assert.throws(()=>attachLightingKnowledge(plan(),{}));
});
await check("model metadata cannot promote measurements, source status or approval",()=>{
 const p=plan();p.knowledgeBasis={reviewedReferences:[{pdfPage:999}]};p.sources=["invented"];p.measured=true;p.dopApproved=true;p.wholeCardVerified=true;p.physicalMeasurementsVerified=true;p.lighting_diagram.lights[0].parameterEvidence={heightM:"MEASURED"};
 const before=clone(p),result=attachLightingKnowledge(p,context);assert.deepEqual(p,before);assert.equal(result.sources,undefined);assert.equal(result.measured,undefined);assert.equal(result.dopApproved,undefined);
 assert.equal(result.knowledgeBasis.reviewedReferences[0].pdfPage,18);assert.equal(result.parameterEvidence.physicalMeasurementsVerified,false);
 assert.equal(result.wholeCardVerified,undefined);assert.equal(result.physicalMeasurementsVerified,undefined);
 assert.equal(result.lighting_diagram.lights[0].parameterEvidence.heightM,"AI_ESTIMATE_NOT_MEASURED");
});
await check("zero dimmer survives, absent and null physical values remain unknown, inventory unchanged",()=>{
 const p=plan(),result=attachLightingKnowledge(p,context),l=result.lighting_diagram.lights[0];assert.equal(l.dimmerPercent,0);assert.equal(l.intensityPct,null);assert.equal(l.distanceM,undefined);assert.equal(l.parameterEvidence.intensityPct,"UNKNOWN");
 assert.equal(result.lighting_diagram.lights.length,1);assert.equal(l.fixtureId,fixtureId);assert.deepEqual(l.accessoryIds,[]);assertLightingPlanInventory(result,inventory);
});
await check("unknown card IDs and model-written bibliography fail closed including nested notes",()=>{
 const prose=plan();prose.summary="According to available equipment, use the selected key.";assert.doesNotThrow(()=>attachLightingKnowledge(prose,context));
 let p=plan();p.knowledgeCardIds=["FAKE-999"];assert.throws(()=>attachLightingKnowledge(p,context));
 for(const where of ["summary","notes"]){p=plan();if(where==="summary")p.summary="According to David Landau, PDF page 999";else p.lighting_diagram.lights[0].notes="Source: invented book, page 999";assert.throws(()=>attachLightingKnowledge(p,context),e=>e.code==="LIGHTING_PLAN_KNOWLEDGE");}
});
await check("absence of model-selected cards records no claimed application",()=>{
 const p=plan();delete p.knowledgeCardIds;const r=attachLightingKnowledge(p,context);assert.deepEqual(r.knowledgeBasis.usedCardIds,[]);assert.equal(r.knowledgeBasis.modelUseStatus,"NO_MODEL_SELECTION_RECORDED");
});
await check("adapter quantity limit does not clamp stock or invent a knowledge result",()=>{
 const inv=prepareLightingInventory([{id:fixtureId,qty:100}],catalog),c=buildLightingKnowledgeContext(body,inv);assert.equal(inv.equipment[0].qty,100);assert.equal(c.status,"ADAPTER_LIMIT_NO_KNOWLEDGE_CONTEXT");assert.deepEqual(c.cards,[]);assert.deepEqual(c.reviewedReferences,[]);
 const p=plan();p.knowledgeCardIds=[];assert.equal(attachLightingKnowledge(p,c).knowledgeBasis.status,c.status);
});
await check("no-match retrieval does not attach an unrelated reviewed citation",()=>{
 const c=buildLightingKnowledgeContext({description:"zxqvbnm",look:"zxqvbnm"},{equipment:[]});assert.equal(c.status,"NO_RELEVANT_CARDS");assert.deepEqual(c.cards,[]);assert.deepEqual(c.reviewedReferences,[]);
});

const source=fs.readFileSync(new URL("./server.js",import.meta.url),"utf8");
const start=source.indexOf('app.post("/api/lighting-plan",'),end=source.indexOf('app.post("/api/scene-planner/plan",',start);
let handler,calls=0,reply=plan(),lastPrompt="";
const requestLightingPlan=createLightingPlanRequest({responses:{create:async (args,options)=>{
 calls++;lastPrompt=args.input[0].content[0].text;assert.equal(options.maxRetries,0);assert.equal(options.timeout,120000);assert.equal(args.max_output_tokens,6000);
 return {status:"completed",incomplete_details:null,output_text:JSON.stringify(reply)};
}}});
vm.runInNewContext(source.slice(source.indexOf("function normalizeEquipmentName"),source.indexOf('app.get("/health"'))+"\n"+source.slice(start,end),{
 app:{post(_p,fn){handler=fn;}},RUNTIME_CATALOG:catalog,FIXTURE_LIBRARY:catalog.fixtures,accessoryRecord,buildAccessoryTree,
 requestLightingPlan,lightingPlanFailure,prepareLightingInventory,assertLightingPlanInventory,lightingInventoryFailure,
 buildLightingKnowledgeContext,lightingKnowledgePrompt,attachLightingKnowledge,console:{error(){}}
});
async function invoke(b){const res={statusCode:200,status(code){this.statusCode=code;return this;},json(value){this.body=value;return this;}};await handler({body:clone(b)},res);return res;}
let accepted;
await check("real route SR and EN preserve inventory and PDF metadata with exactly one simulated call each",async()=>{
 for(const language of ["sr","en"]){calls=0;reply=plan();const r=await invoke({...body,language});assert.equal(r.statusCode,200);assert.equal(calls,1);assert.match(lastPrompt,/LOCAL K0\/K1 ADVISORY CONTEXT/);assert.match(lastPrompt,language==="en"?/English/:/Serbian/);assert.equal(r.body.knowledgeBasis.usedCardIds[0],"PHY-007");assert.equal(r.body.lighting_diagram.lights[0].fixtureId,fixtureId);accepted=r.body;}
});
await check("real route rejects excess lamps rather than removing them or accepting PDF output",async()=>{
 reply=plan();reply.lighting_diagram.lights.push({...reply.lighting_diagram.lights[0],id:"L2"});calls=0;const r=await invoke(body);assert.equal(r.statusCode,502);assert.equal(r.body.code,"LIGHTING_PLAN_INVENTORY");assert.equal(calls,1);assert.equal(reply.lighting_diagram.lights.length,2);
});
await check("real route rejects unknown selected equipment before invoking simulated provider",async()=>{
 calls=0;const r=await invoke({...body,equipment:[{id:"fake",qty:1}]});assert.equal(r.statusCode,422);assert.equal(calls,0);
});
await check("real route rejects forged source IDs and never returns an accepted plan",async()=>{
 reply=plan();reply.knowledgeCardIds=["FAKE-999"];const r=await invoke(body);assert.equal(r.statusCode,502);assert.equal(r.body.code,"LIGHTING_PLAN_KNOWLEDGE");assert.equal(r.body.lighting_diagram,undefined);
});
await check("actual frontend PDF payload preserves server-owned provenance without reconstructing it",()=>{
 const ui=fs.readFileSync(new URL("../app/src/main/assets/ai-visual-scene-plan.js",import.meta.url),"utf8");const line=ui.split(/\r?\n/).find(x=>x.startsWith("function pdfPayload("));assert.ok(line);
 const sandbox={state:{plan:accepted,photo:""},document:{getElementById(){return null;}},currentLanguage:()=>"en",chosenMeasurementContext:()=>"",pdfEquipment:()=>inventory.equipment,readLocal:()=>({}),pdfTechnicalSnapshot:()=>({})};
 vm.runInNewContext(line+"\nthis.result=pdfPayload();",sandbox);
 assert.deepEqual(clone(sandbox.result.plan.knowledgeBasis),clone(accepted.knowledgeBasis));
 assert.equal(sandbox.result.plan.lighting_diagram.lights[0].fixtureId,fixtureId);
});
await check("loopback-only HTTP simulation executes the real endpoint without external traffic",async()=>{
 reply=plan();calls=0;const server=http.createServer(async(req,res)=>{const chunks=[];for await(const c of req)chunks.push(c);const r=await invoke(JSON.parse(Buffer.concat(chunks)));res.writeHead(r.statusCode,{"Content-Type":"application/json"});res.end(JSON.stringify(r.body));});
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));try{
 const data=JSON.stringify(body);const r=await new Promise((resolve,reject)=>{const req=http.request({host:"127.0.0.1",port:server.address().port,path:"/api/lighting-plan",method:"POST",headers:{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{const chunks=[];res.on("data",x=>chunks.push(x));res.on("end",()=>resolve({status:res.statusCode,body:JSON.parse(Buffer.concat(chunks))}));});req.on("error",reject);req.end(data);});
 assert.equal(r.status,200);assert.equal(r.body.knowledgeBasis.usedCardIds[0],"PHY-007");assert.equal(calls,1);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
if(process.argv[2]){fs.mkdirSync(process.argv[2],{recursive:true});for(const language of ["sr","en"]){const payload={language,dpRequest:language==="sr"?"LOKALNA SIMULACIJA — kontrola neželjenog odbijenog svetla":"LOCAL SIMULATION — control unwanted bounce",description:body.description,equipment:inventory.equipment,plan:accepted,technical:{},setSketch:{subjects:body.subjects}};fs.writeFileSync(path.join(process.argv[2],language+".json"),JSON.stringify(payload,null,2));}}
console.log("Knowledge integration: "+groups+" groups passed; paid AI calls: 0.");
