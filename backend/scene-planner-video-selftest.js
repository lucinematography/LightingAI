import assert from "node:assert/strict";
import {videoCapabilities,validateVideoBinary,validateKeyframes,buildVideoRelightPrompt,
  authorizeVideoRequest,requirePaidVideoConfirmation,createVideoRouter,VIDEO_CREDITS_PER_SECOND} from "./scene-planner-video.js";
import fs from "node:fs";
import {testMp4,testStore} from "./scene-planner-video-test-support.js";
const mp4=testMp4(12);
const cfg=validateVideoBinary(mp4,"video/mp4",12);
assert.equal(cfg.seconds,12);
assert.throws(()=>validateVideoBinary(testMp4(31),"video/mp4",12),/timing/);
assert.throws(()=>validateVideoBinary(mp4,"image/jpeg",8),/Only MP4/);
assert.throws(()=>validateVideoBinary(Buffer.alloc(1024),"video/mp4",8),/container/);
assert.equal(videoCapabilities({}).available,false,"must default disabled");
assert.equal(videoCapabilities({SCENE_PLANNER_VIDEO_ENABLED:"true",RUNWAYML_API_SECRET:"valid-secret-longer-than-twenty",SCENE_PLANNER_VIDEO_ACCESS_TOKEN:"a-very-long-video-access-token"}).available,false,"paid calls require durable storage configuration");
assert.throws(()=>authorizeVideoRequest({authorization:"Bearer wrong"},{
  SCENE_PLANNER_VIDEO_ENABLED:"true",RUNWAYML_API_SECRET:"valid-secret-longer-than-twenty",
  SCENE_PLANNER_VIDEO_ACCESS_TOKEN:"a-very-long-video-access-token",SCENE_PLANNER_VIDEO_DATABASE_URL:"postgres://unused.invalid/test"
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
assert.ok(main.indexOf('app.use(express.json(')<main.indexOf('app.use("/api/scene-planner/video"'),
  "JSON body parser must run before paid /video/start router");
assert.match(videoSource,/requirePaidVideoConfirmation\(body\.confirmPaidGeneration\)/);
assert.doesNotThrow(()=>requirePaidVideoConfirmation(true));
for(const value of [undefined,null,false,0,1,"true","false",{},[]]){
  assert.throws(()=>requirePaidVideoConfirmation(value),/Confirm the paid AI video generation/);
}
assert.ok(videoSource.includes('res.setHeader("Content-Type","video/mp4")'));
assert.ok(videoSource.includes('redirect:"error"'));
assert.match(videoSource,/await store\.reserve\(jobKey,uploadId\)/,"reserve durably before a paid request");
assert.match(videoSource,/uploaded\.request_id!==jobKey/,"deny reuse of the uploaded file by another paid request");
assert.doesNotMatch(videoSource,/requestSessions\.delete\(jobKey\)/,"ambiguous provider failures must not clear idempotency protection");
assert.equal(VIDEO_CREDITS_PER_SECOND,28);
console.log("Video AI integration guard tests passed.");

const appUi=fs.readFileSync(new URL("../app/src/main/assets/scene-planner.js",import.meta.url),"utf8");
assert.ok(appUi.includes("sp-video-capabilities"));
assert.ok(appUi.includes("sp-video-cost-confirm"));
assert.ok(appUi.includes("confirmPaidGeneration:true"));
assert.ok(appUi.includes("sp-ai-mp4-download"));
assert.ok(appUi.includes("LightingAI_AI_Relight.mp4"));
assert.ok(appUi.includes("sp-ai-video-player"),"playback element is created for real MP4 output");
assert.match(appUi,/return \{frames:frames,durationSec:duration\}/,"use actual media duration");
assert.match(appUi,/var duration=Number\(state\.videoDurationSec\)/,"never bill from last storyboard frame");
assert.match(appUi,/requestId:pending\.requestId/,"paid start reuses the same request identifier");
assert.match(appUi,/if\(!pending\.uploadId\)/,"paid retries cannot upload a fresh video");
assert.ok(appUi.includes("player.src=state.aiVideoPreviewUrl"),"real downloaded bytes feed the player");
assert.ok(appUi.includes("window.Android.saveAiVideo"),"Android MP4 save must use native Storage Access Framework");
assert.ok(appUi.includes("onNativeVideoSaved:onNativeVideoSaved"),"Android save must report completion");
const androidActivity=fs.readFileSync(new URL("../app/src/main/java/com/lightingai/app/MainActivity.java",import.meta.url),"utf8");
assert.ok(androidActivity.includes("Intent.ACTION_CREATE_DOCUMENT"),"native save requests user-selected destination");
assert.ok(androidActivity.includes("@JavascriptInterface public void saveAiVideo"),"native Android save bridge exists");
assert.ok(androidActivity.includes("MAX_AI_MP4_BYTES"),"streamed save enforces bounded MP4");
assert.ok(androidActivity.includes("setInstanceFollowRedirects(false)"),"native downloads cannot redirect tokens");
assert.ok(androidActivity.includes("Build.VERSION.SDK_INT < Build.VERSION_CODES.Q"),"Android 8/9 recording uses app-owned provider");
assert.ok(androidActivity.includes("AIVisualImageProvider.captureDirectory(this)"),"legacy capture uses app-owned storage");
const captureProvider=fs.readFileSync(new URL("../app/src/main/java/com/lightingai/app/AIVisualImageProvider.java",import.meta.url),"utf8");
assert.ok(captureProvider.includes('if (lower.endsWith(".mp4")) return "video/mp4"'));
assert.ok(captureProvider.includes('isCaptureName(file.getName())'),"provider writes only dedicated capture files");
assert.ok(captureProvider.includes("ParcelFileDescriptor.MODE_TRUNCATE"),"capture provider supports camera writes");
assert.ok(androidActivity.includes("https://lightingai.onrender.com/api/scene-planner/video/download/"),"native save uses fixed backend only");

assert.ok(appUi.includes("URL.createObjectURL(blob)"),"MP4 preview uses actual downloaded bytes");
assert.ok(appUi.includes("URL.revokeObjectURL(state.aiVideoPreviewUrl)"),"old previews release their blob URLs");
assert.ok(!appUi.includes("RUNWAYML_API_SECRET"),"provider secret must stay backend-only");
console.log("Scene Planner paid video screen and export wiring checks passed.");


// A real HTTP JSON POST is essential: a source-string test alone missed a broken
// express.json() order. All external provider operations below are local mocks.
import express from "express";
const mockEnv={
  SCENE_PLANNER_VIDEO_ENABLED:"true",
  RUNWAYML_API_SECRET:"fake-provider-secret-longer-than-twenty",
  SCENE_PLANNER_VIDEO_ACCESS_TOKEN:"fake-user-token-longer-than-twenty-four",
  SCENE_PLANNER_VIDEO_DATABASE_URL:"postgres://unused.invalid/test"
};
const fakeTask="11111111-1111-4111-8111-111111111111";
const fakeRequest="22222222-2222-4222-8222-222222222222";
const fakeOtherRequest="33333333-3333-4333-8333-333333333333";
let paidCalls=0;
const mockFetcher=async(url,options={})=>{
  const uri=String(url);
  const json=(data)=>new Response(JSON.stringify(data),{status:200,headers:{"Content-Type":"application/json"}});
  if(uri.endsWith("/uploads"))return json({
    uploadUrl:"https://lightingai-test.amazonaws.com/form",
    runwayUri:"runway://uploads/test-clip",
    fields:{key:"unit-test"}
  });
  if(uri==="https://lightingai-test.amazonaws.com/form")return new Response(null,{status:204});
  if(uri.endsWith("/video_to_video")){
    paidCalls++;
    assert.equal(JSON.parse(options.body).model,"aleph2");
    return json({id:fakeTask});
  }
  if(uri.endsWith("/tasks/"+fakeTask))return json({
    status:"SUCCEEDED",output:["https://lightingai-test.cloudfront.net/result.mp4"]
  });
  if(uri==="https://lightingai-test.cloudfront.net/result.mp4")
    return new Response(mp4,{status:200,headers:{"Content-Length":String(mp4.length)}});
  throw new Error("Unexpected mocked Runway fetch: "+uri);
};
const testApp=express();
const jobStore=await testStore();
testApp.use(express.json({limit:"15mb"}));
testApp.use("/api/scene-planner/video",createVideoRouter(express,mockEnv,mockFetcher,{store:jobStore}));
const httpServer=await new Promise(resolve=>{
  const instance=testApp.listen(0,"127.0.0.1",()=>resolve(instance));
});
try{
  const base="http://127.0.0.1:"+httpServer.address().port+"/api/scene-planner/video";
  const headers={Authorization:"Bearer "+mockEnv.SCENE_PLANNER_VIDEO_ACCESS_TOKEN};
  const upload=await fetch(base+"/upload",{
    method:"POST",headers:{...headers,"Content-Type":"video/mp4","X-Scene-Duration":"2"},
    body:mp4
  });
  assert.equal(upload.status,200,"MP4 upload must pass raw body parser");
  const uploaded=await upload.json();
  assert.equal(typeof uploaded.uploadId,"string");
  const startBody={uploadId:uploaded.uploadId,requestId:fakeRequest,plan,confirmPaidGeneration:true};
  const sendStart=(body)=>fetch(base+"/start",{
    method:"POST",headers:{...headers,"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
  assert.equal((await sendStart({...startBody,confirmPaidGeneration:false})).status,422);
  assert.equal((await sendStart({...startBody,confirmPaidGeneration:"true"})).status,422);
  assert.equal(paidCalls,0,"no paid calls before explicit Boolean consent");
  const started=await sendStart(startBody);
  assert.equal(started.status,200,"valid JSON start must be parsed and accepted");
  assert.equal((await started.json()).taskId,fakeTask);
  const replay=await sendStart(startBody);
  assert.equal(replay.status,200,"lost response must be reconcilable using original requestId");
  assert.equal((await replay.json()).reused,true);
  assert.equal(paidCalls,1,"replay must never launch a second paid task");
  assert.equal((await sendStart({...startBody,requestId:fakeOtherRequest})).status,409,
    "consumed upload cannot pay for another generation");
  const status=await fetch(base+"/status/"+fakeTask,{headers});
  assert.equal((await status.json()).ready,true);
  const downloaded=await fetch(base+"/download/"+fakeTask,{headers});
  assert.equal(downloaded.status,200);
  assert.match(downloaded.headers.get("Content-Type"),/video\/mp4/);
  assert.equal((await downloaded.arrayBuffer()).byteLength,mp4.length);
  console.log("Paid video mocked HTTP upload/start/replay/status/MP4 tests passed.");
}finally{
  httpServer.closeAllConnections();
  await new Promise(resolve=>httpServer.close(resolve));
  await jobStore.close();
}
