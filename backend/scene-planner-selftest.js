import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
import {validateScenePlannerRequest,canonicalInventory,buildScenePlannerPrompt,generateScenePlannerPlan}
  from "./scene-planner-service.js";
const require=createRequire(import.meta.url);
const core=require("../app/src/main/assets/scene-planner-core.js");
const PHOTO="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=";
const own={mode:"own",description:"Zena ide od ograde do drveta, noc",look:"Night",
  scenePhoto:PHOTO,equipment:[
    {id:"fixture-1",fixtureId:"fixture-1",name:"Test LED",qty:1},
    {id:"accessory-1",accessoryId:"accessory-1",name:"Softbox",qty:1},
    {id:"generator",name:"Generator",sapa:true,qty:1}
  ]};
assert.equal(core.request(own).equipment.length,1);
assert.deepEqual(core.request(own).modifiers,["Softbox"]);
assert.throws(()=>validateScenePlannerRequest({...own,scenePhoto:"data:text/plain;base64,SGVsbG8="}),/Invalid/);
assert.throws(()=>validateScenePlannerRequest({...own,scenePhoto:"",videoFrames:[]}),/photo or video frames/);
assert.throws(()=>validateScenePlannerRequest({...own,equipment:[]}),/fixture/);
assert.throws(()=>validateScenePlannerRequest({...own,description:""}),/description/);
const catalog=[{id:"fixture-1",manufacturer:"ARRI",model:"Test LED",powerDrawW:150,cctK:{min:2700,max:6500}}];
const canonical=canonicalInventory(validateScenePlannerRequest(own),catalog);
assert.equal(canonical.equipment[0].powerDrawW,150);
const guarded=core.sanitizePlan({summary:"Test",
  actors:[{label:"Zena",x:60,y:45,path:[{x:10,y:66},{x:65,y:25}]}],
  lights:[
    {fixtureName:"Not owned",role:"key",modifier:"Imaginary"},
    {fixtureId:"fixture-1",role:"key",kelvin:9000,modifier:"Softbox",x:-40,y:100},
    {fixtureId:"fixture-1",role:"fill"}
  ]},canonical,"ai");
assert.equal(guarded.lights.length,1);
assert.equal(guarded.lights[0].kelvin,6500);
assert.equal(guarded.lights[0].modifier,"Softbox");
assert.equal(guarded.lights[0].x,5);
assert.equal(guarded.lights[0].y,95);
assert.equal(guarded.lights[0].available,true);
assert.equal(guarded.lights[0].powerDrawW,150);
assert.equal(guarded.actors[0].path.length,2);
assert.equal(guarded.geometry.measured,false);
assert.ok(guarded.limitations.some(x=>x.includes("inventaru")));
const noModifier=core.sanitizePlan({lights:[{fixtureId:"fixture-1",modifier:"Imaginary"}]},canonical,"ai");
assert.equal(noModifier.lights[0].modifier,"");
const best=core.sanitizePlan({lights:[{fixtureName:"Proposed LED",role:"key"}]},{
  mode:"best",description:"test"
},"ai");
assert.equal(best.lights[0].available,false);
assert.equal(best.lights[0].estimated,true);
assert.ok(core.localPlan(own).lights.every(x=>x.available));
assert.ok(core.localPlan({...own,equipment:[]}).limitations.some(x=>x.includes("Nema rasvetnih")));
assert.ok(core.localPlan({mode:"best",description:"test"}).lights.every(x=>!x.available));
const prompt=buildScenePlannerPrompt(canonical);
assert.match(prompt,/ONLY MY EQUIPMENT/);
assert.match(prompt,/fixture-1/);
assert.doesNotMatch(prompt,/DMX|Art-Net|CRMX|ART7|Bluetooth/);
const clip={...own,scenePhoto:"",videoFrames:[{timeSec:1.5,image:PHOTO},{timeSec:4.5,image:PHOTO}]};
assert.equal(validateScenePlannerRequest(clip).videoFrames.length,2);
let sent=null;
const mock={responses:{create:async args=>{
  sent=args;
  return {output_text:JSON.stringify({summary:"Video scene",
    actors:[{label:"Zena",x:50,y:50,path:[{x:25,y:65},{x:70,y:35}]}],
    lights:[{fixtureId:"fixture-1",fixtureName:"ARRI Test LED",role:"key",kelvin:4500,modifier:"Softbox"}]
  })};
}}};
const produced=await generateScenePlannerPlan(mock,clip,catalog);
assert.equal(produced.ok,true);
assert.equal(produced.plan.source,"ai");
assert.equal(produced.plan.lights.length,1);
assert.equal(produced.plan.lights[0].fixtureName,"ARRI Test LED");
assert.equal(produced.plan.actors[0].path.length,2);
assert.equal(produced.plan.inputSummary.videoKeyframes,2);
assert.equal(produced.plan.inputSummary.recordedFootageNotUploaded,true);
assert.equal(sent.input[0].content.filter(x=>x.type==="input_image").length,2);
console.log("Scene Planner self-test passed: modes, video keyframes, inventory, modifiers, CCT, blocking and model contract.");

const frontend=fs.readFileSync(new URL("../app/src/main/assets/scene-planner.js",import.meta.url),"utf8");
const catalogUi=fs.readFileSync(new URL("../app/src/main/assets/catalog.js",import.meta.url),"utf8");
const native=fs.readFileSync(new URL("../app/src/main/java/com/lightingai/app/MainActivity.java",import.meta.url),"utf8");
const server=fs.readFileSync(new URL("./server.js",import.meta.url),"utf8");
assert.ok(frontend.includes('accept="video/*"'),"video file inputs needed");
assert.ok(frontend.includes('capture="environment"'),"camera/video capture requested");
assert.ok(frontend.includes("Android.startSpeechInput"),"native voice input wired");
assert.ok(frontend.includes("sp-description"),"voice destination exists");
assert.ok(frontend.includes("videoFrames(state.videoUrl)"),"must sample video before AI request");
assert.ok(frontend.includes("Originalni video ostaje na telefonu"),"raw video stays on device");
assert.ok(frontend.includes("sp-mode"),"mode selection required");
assert.ok(frontend.includes("sp-plot"),"2D light plot required");
assert.ok(catalogUi.includes("lightingai-scene-planner-script"),"AI navigation entry required");
assert.ok(native.includes("MediaStore.ACTION_VIDEO_CAPTURE"),"native camera recording required");
assert.ok(native.includes("openVideoForWebView"),"native video chooser required");
assert.ok(server.includes('app.post("/api/scene-planner/plan"'),"AI endpoint missing");
assert.doesNotMatch(frontend,/DMX|ArtNet|Bluetooth|CRMX|ART7/,"Scene Planner must stay control-free");
console.log("Scene Planner wiring tests passed: Android capture, voice, UI and backend endpoint.");

const nightInput={...own,mode:"best",captureLighting:"day",look:"Cinematic",description:"Zena ide ka drvetu, noc i mesecina",videoFrames:[{timeSec:0,image:PHOTO},{timeSec:3,image:PHOTO},{timeSec:6,image:PHOTO}]};
assert.equal(core.request(nightInput).look,"Day for Night");
const movement=core.sanitizePlan({
  sceneAnalysis:{cameraMotion:"moving",blockingConfidence:"medium",observedLighting:"day",evidence:"fence and tree visible"},
  actors:[{label:"Zena",confidence:"medium",path:[{x:20,y:60,timeSec:0},{x:50,y:45,timeSec:2},{x:80,y:25,timeSec:4}]}],
  lights:[{role:"key",fixtureName:"Rental LED",coverageStages:[0,2],verticalTiltDeg:-24,beamAngleDeg:65}]
},nightInput,"ai");
assert.equal(movement.actors[0].path[1].timeSec,2);
assert.equal(movement.sceneAnalysis.cameraMotion,"moving");
assert.equal(movement.lights[0].coverageStages.length,2);
assert.deepEqual(movement.unknownCoverageStages,[2]);
assert.equal(movement.captureLighting,"day");
assert.ok(movement.dayForNightNotes.length>0);
assert.ok(movement.limitations.some(x=>x.includes("Kamera se kreće")));
const unknownMotion=core.sanitizePlan({lights:[]},nightInput,"local");
assert.deepEqual(unknownMotion.actors[0].path,[],"never invent an observed trajectory");
assert.ok(frontend.includes('id="sp-stage"'),"blocking scrubber must render");
assert.ok(frontend.includes('id="sp-capture"'),"capture time-of-day must be selectable");
assert.ok(frontend.includes("Math.abs(video.currentTime-t)>"),"avoid seeking to same timestamp");
assert.ok(frontend.includes("0.04,.20,.40,.60,.80,.96"),"sample six chronological keyframes");
console.log("Scene Planner continuity tests passed: no fabricated blocking, coverage gaps and day-for-night intent.");
