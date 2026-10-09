import assert from "node:assert/strict";
import {videoCapabilities,validateVideoBinary,validateKeyframes,buildVideoRelightPrompt,
  authorizeVideoRequest,requirePaidVideoConfirmation,createVideoRouter,VIDEO_CREDITS_PER_SECOND} from "./scene-planner-video.js";
import fs from "node:fs";
const mp4=Buffer.alloc(1024);mp4.write("ftyp",4,"ascii");
const cfg=validateVideoBinary(mp4,"video/mp4",12);
assert.equal(cfg.seconds,12);
assert.throws(()=>validateVideoBinary(mp4,"video/mp4",31),/2 to 30/);
assert.throws(()=>validateVideoBinary(mp4,"image/jpeg",8),/Only MP4/);
assert.throws(()=>validateVideoBinary(Buffer.alloc(1024),"video/mp4",8),/container/);
assert.equal(videoCapabilities({}).available,false,"must default disabled");
assert.equal(videoCapabilities({SCENE_PLANNER_VIDEO_ENABLED:"true",RUNWAYML_API_SECRET:"valid-secret-longer-than-twenty",SCENE_PLANNER_VIDEO_ACCESS_TOKEN:"a-very-long-video-access-token"}).available,true);
assert.throws(()=>authorizeVideoRequest({authorization:"Bearer wrong"},{
  SCENE_PLANNER_VIDEO_ENABLED:"true",RUNWAYML_API_SECRET:"valid-secret-longer-than-twenty",
  SCENE_PLANNER_VIDEO_ACCESS_TOKEN:"a-very-long-video-access-token"
}),/authorization/);
const plan={look:"Day for Night",description:"Actor walks from fence to tree",dopRequest:"Keep faces one stop darker",
  lights:[{id:"L1",role:"key",fixtureName:"LED",kelvin:5600,intensityPct:50,why:"Moon key"}]};
const prompt=buildVideoRelightPrompt(plan);
assert.match(prompt,/nighttime/);
assert.match(prompt,/fence to tree/);
assert.match(prompt,/one stop darker/);
assert.match(prompt,/Preserve the original people/);
assert.throws(()=>validateKeyframes([{timeSec:32,image:"invalid"}],30),/timestamp/);
const videoSource=fs.readFileSync(new URL("./scene-planner-video.js",import.meta.url),"utf8");
const main=fs.readFileSync(new URL("./server.js",import.meta.url),"utf8");
assert.ok(main.includes('app.use("/api/scene-planner/video",createVideoRouter(express))'));
assert.match(videoSource,/requirePaidVideoConfirmation\(body\.confirmPaidGeneration\)/);
assert.doesNotThrow(()=>requirePaidVideoConfirmation(true));
for(const value of [undefined,null,false,0,1,"true","false",{},[]]){
  assert.throws(()=>requirePaidVideoConfirmation(value),/Confirm the paid AI video generation/);
}
assert.ok(videoSource.includes('res.setHeader("Content-Type","video/mp4")'));
assert.ok(videoSource.includes('redirect:"error"'));
assert.equal(VIDEO_CREDITS_PER_SECOND,28);
console.log("Video AI integration guard tests passed.");

const appUi=fs.readFileSync(new URL("../app/src/main/assets/scene-planner.js",import.meta.url),"utf8");
assert.ok(appUi.includes("sp-video-capabilities"));
assert.ok(appUi.includes("sp-video-cost-confirm"));
assert.ok(appUi.includes("confirmPaidGeneration:true"));
assert.ok(appUi.includes("sp-ai-mp4-download"));
assert.ok(appUi.includes("LightingAI_AI_Relight.mp4"));
assert.ok(!appUi.includes("RUNWAYML_API_SECRET"),"provider secret must stay backend-only");
console.log("Scene Planner paid video screen and export wiring checks passed.");
