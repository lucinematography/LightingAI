import crypto from "node:crypto";
import { Readable } from "node:stream";
import { parseDataImage } from "./visual-preview.js";
import { createVideoJobStore } from "./scene-planner-job-store.js";
import { analyzeIsoVideo } from "./scene-planner-media.js";

export const VIDEO_MODEL="aleph2";
export const VIDEO_CREDITS_PER_SECOND=28;
export const MAX_VIDEO_BYTES=40*1024*1024;
export const MAX_VIDEO_SECONDS=30;
export const RUNWAY_API="https://api.dev.runwayml.com/v1";
export const VIDEO_STATUSES=["PENDING","THROTTLED","RUNNING","SUCCEEDED","FAILED","CANCELED"];
const MAX_DOWNLOAD_BYTES=140*1024*1024;

const mediaTypes={
  "video/mp4":{ext:"mp4",container:"iso"},
  "video/quicktime":{ext:"mov",container:"iso"},
  "video/webm":{ext:"webm",container:"webm"}
};

export function videoCapabilities(env=process.env){
  const key=String(env.RUNWAYML_API_SECRET||"");
  const password=String(env.SCENE_PLANNER_VIDEO_ACCESS_TOKEN||"");
  return {
    available:env.LIGHTINGAI_DISABLE_PAID_AI!=="true"&&env.SCENE_PLANNER_VIDEO_ENABLED==="true"&&key.length>=20&&password.length>=24&&!!env.SCENE_PLANNER_VIDEO_DATABASE_URL,
    provider:"runway",model:VIDEO_MODEL,
    inputMinSeconds:2,inputMaxSeconds:MAX_VIDEO_SECONDS,inputMaxBytes:MAX_VIDEO_BYTES,
    outputFormat:"mp4",creditsPerSecond:VIDEO_CREDITS_PER_SECOND,
    paidProcessing:true,requiresAuthorization:true,
    note:"Aleph 2.0 video editing is a paid external service; preview is not a guaranteed physical lighting simulation."
  };
}

function err(message,status){
  return Object.assign(new Error(message),{status});
}
function safeId(value){
  const v=String(value||"").toLowerCase();
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v))throw err("Invalid video job identifier.",400);
  return v;
}
function secureEqual(a,b){
  const aBytes=Buffer.from(String(a||""));
  const bBytes=Buffer.from(String(b||""));
  return aBytes.length===bBytes.length&&aBytes.length>=24&&crypto.timingSafeEqual(aBytes,bBytes);
}
export function authorizeVideoRequest(headers,env=process.env){
  if(!videoCapabilities(env).available)throw err("AI video relight is not configured on this backend.",503);
  const bearer=String(headers?.authorization||"").match(/^Bearer ([^\s]+)$/);
  if(!bearer||!secureEqual(bearer[1],env.SCENE_PLANNER_VIDEO_ACCESS_TOKEN))throw err("AI video authorization required.",401);
}
export function validateVideoBinary(buffer,mime){
  const type=String(mime||"").split(";")[0].trim().toLowerCase();
  const config=mediaTypes[type];
  if(!config)throw err("Only MP4, MOV and WebM video are supported.",415);
  if(!Buffer.isBuffer(buffer)||buffer.length<512||buffer.length>MAX_VIDEO_BYTES)
    throw err("Video must be between 512 bytes and 40 MiB.",413);
  const iso=buffer.length>=12&&buffer.toString("ascii",4,8)==="ftyp";
  const webm=buffer.length>=4&&buffer.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));
  if(config.container==="iso"&&!iso||config.container==="webm"&&!webm)
    throw err("Video container does not match declared MIME type.",415);
  // MIME/signature alone and X-Scene-Duration are never evidence of duration.
  if(config.container!=="iso")throw err("WebM timing cannot be verified by this backend. Export MP4/MOV.",422);
  const seconds=analyzeIsoVideo(buffer);
  if(!Number.isFinite(seconds)||seconds<2||seconds>MAX_VIDEO_SECONDS)
    throw err("AI video relight accepts clips from 2 to 30 seconds.",422);
  return {mime:type,filename:"lightingai-input."+config.ext,seconds};
}
export function buildVideoRelightPrompt(plan){
  if(!plan||typeof plan!=="object"||!Array.isArray(plan.lights))
    throw err("A lighting plan is required before video relighting.",400);
  const lines=[
    "Edit this existing live-action footage, changing primarily LIGHTING, not action or scene contents.",
    "Preserve the original people and their faces, performance, wardrobe, props, camera movement, shot order, timing, framing and set geometry.",
    "No added objects, people, fixtures, text, titles, logos or moving light sources.",
    "Desired lighting and atmosphere: "+String(plan.look||"Cinematic").slice(0,100),
    "Creative scene brief: "+String(plan.description||"").slice(0,900),
    "Gaffer plan: "+String(plan.summary||"").slice(0,700),
    "Reasons: "+String(plan.rationale||"").slice(0,650),
    "Director of Photography's latest adjustments: "+String(plan.dopRequest||"").slice(0,700),
    "Treat fixture positions as virtual off-camera lighting references; preserve realistic shadow direction and continuity from first to last frame."
  ];
  for(const light of plan.lights.slice(0,10)){
    lines.push("Light "+String(light.id||"").slice(0,12)+": "+
      String(light.role||"").slice(0,40)+" from "+String(light.fixtureName||"").slice(0,100)+
      "; color "+String(light.color||"").slice(0,45)+
      "; CCT "+String(light.kelvin??"unspecified").slice(0,10)+" K"+
      "; intensity estimate "+String(light.intensityPct??"unknown").slice(0,8)+"%"+
      "; purpose "+String(light.why||"").slice(0,170));
  }
  if(plan.look==="Night"||plan.look==="Day for Night"){
    lines.push("Transform filmed daylight into plausible nighttime photography. Reduce ambient daylight and sky illumination, protect faces, retain texture, add restrained believable moonlight where motivated, and keep the lighting direction stable during movement.");
    lines.push("Do not add a fake moon, stars or additional scenery unless already present. Avoid visible daytime sunlight and sudden exposure pumping.");
  }
  return lines.join("\n").slice(0,4900);
}
function trustedUrl(value,kind){
  const url=new URL(value);
  if(url.protocol!=="https:"||url.username||url.password||url.port&&url.port!=="443")
    throw err("Untrusted video-service URL.",502);
  const host=url.hostname.toLowerCase();
  if(/^\d+(?:\.\d+){3}$/.test(host)||host==="localhost")
    throw err("Untrusted video-service host.",502);
  const domains=kind==="upload"?
    ["amazonaws.com","googleapis.com","runwayml.com","runway.com","cloudflarestorage.com"]:
    ["cloudfront.net","runwayml.com","runway.com","amazonaws.com"];
  if(!domains.some(d=>host===d||host.endsWith("."+d)))
    throw err("Unknown video-service storage host.",502);
  return url;
}
function jsonHeaders(env){
  return {
    "Authorization":"Bearer "+env.RUNWAYML_API_SECRET,
    "X-Runway-Version":"2024-11-06",
    "Content-Type":"application/json"
  };
}
async function responseJson(res){
  if(!res.ok)throw err("External video service returned HTTP "+res.status+".",502);
  const data=await res.json();
  if(!data||typeof data!=="object")throw err("Invalid external video service response.",502);
  return data;
}
export async function runwayRequest(path,method,data,env=process.env,fetcher=fetch){
  const url=RUNWAY_API+path;
  const res=await fetcher(url,{
    method,headers:jsonHeaders(env),
    ...(data===undefined?{}:{body:JSON.stringify(data)}),
    signal:AbortSignal.timeout(method==="GET"?10000:90000),redirect:"error"
  });
  return responseJson(res);
}
export async function uploadVideoToRunway(buffer,mime,duration,env=process.env,fetcher=fetch){
  const meta=validateVideoBinary(buffer,mime);
  const response=await runwayRequest("/uploads","POST",{type:"ephemeral",filename:meta.filename},env,fetcher);
  const uploadURL=trustedUrl(response.uploadUrl,"upload");
  if(!response.runwayUri||!/^runway:\/\/[a-z0-9/_-]+$/i.test(response.runwayUri))
    throw err("Video service did not provide a usable upload URI.",502);
  if(!response.fields||typeof response.fields!=="object"||Array.isArray(response.fields))
    throw err("Video service upload data missing.",502);
  const form=new FormData();
  for(const [key,value] of Object.entries(response.fields)){
    if(typeof value!=="string")throw err("Invalid external upload field.",502);
    form.append(key,value);
  }
  form.append("file",new Blob([buffer],{type:meta.mime}),meta.filename);
  const result=await fetcher(uploadURL,{
    method:"POST",body:form,redirect:"error",signal:AbortSignal.timeout(120000)
  });
  if(!result.ok)throw err("Uploading to external video service failed (HTTP "+result.status+").",502);
  return {uri:response.runwayUri,seconds:meta.seconds};
}
export function validateKeyframes(keyframes,duration){
  if(!Array.isArray(keyframes))return [];
  const result=[],seen=new Set();
  for(const k of keyframes.slice(0,5)){
    const sec=Number(k?.timeSec);
    if(!Number.isFinite(sec)||sec<0||sec>duration)throw err("Invalid storyboard keyframe timestamp.",422);
    try{parseDataImage(k?.image);}catch{throw err("Invalid storyboard keyframe.",422);}
    if(k.image.length>4*1024*1024)throw err("Storyboard reference frame is too large.",413);
    const key=sec.toFixed(3);
    if(seen.has(key))throw err("Video keyframe timestamps must be distinct.",422);
    seen.add(key);
    result.push({seconds:sec,uri:k.image});
  }
  return result;
}
export function requirePaidVideoConfirmation(value){
  if(value!==true)throw err("Confirm the paid AI video generation before starting.",422);
}
export function videoErrorStatus(error){
  return Number.isInteger(error?.status)&&error.status>=400&&error.status<=599?error.status:500;
}
export function createVideoRouter(express,env=process.env,fetcher=fetch,options={}){
  const router=express.Router();
  let store;
  try{store=options.store||createVideoJobStore(env);}catch{store=null;}
  const sendError=(res,error)=>res.status(videoErrorStatus(error)).json({ok:false,
    error:error?.status?error.message:"Video service is temporarily unavailable. Do not submit another paid request."});
  const auth=async(req,res,next)=>{
    try{
      authorizeVideoRequest(req.headers,env);
      if(!store?.durable)throw err("Durable video storage is required.",503);
      await store.ready();await store.prune();next();
    }catch(error){sendError(res,error);}
  };
  router.get("/capabilities",async(req,res)=>{
    const caps=videoCapabilities(env);
    try{if(!store?.durable)throw new Error();await store.ready();}
    catch{caps.available=false;}
    res.setHeader("Cache-Control","no-store");res.json(caps);
  });
  router.use((req,res,next)=>{res.setHeader("Cache-Control","no-store");next();});
  router.post("/upload",auth,express.raw({type:["video/mp4","video/quicktime","video/webm"],limit:"40mb"}),async(req,res)=>{
    try{
      const meta=validateVideoBinary(req.body,req.get("Content-Type"));
      const uploaded=await uploadVideoToRunway(req.body,meta.mime,meta.seconds,env,fetcher);
      const uploadId=crypto.randomUUID();
      const record=await store.addUpload(uploadId,uploaded.uri,uploaded.seconds);
      res.json({ok:true,uploadId,seconds:uploaded.seconds,expiresAt:record.expires_at});
    }catch(error){sendError(res,error);}
  });
  function previousResponse(res,prior,uploadId){
    if(uploadId&&prior.upload_id!==uploadId)throw err("Request identifier belongs to another upload.",409);
    if(prior.status==="EXPIRED")throw err("Video receipt has expired. This request remains reserved.",410);
    return res.status(prior.task_id?200:409).json(prior.task_id?
      {ok:true,taskId:prior.task_id,reused:true,status:prior.status}:
      {ok:false,requiresReview:true,error:"The paid request is reserved but its outcome is unconfirmed. Do not start another request; operator review is required."});
  }
  router.get("/request/:id",auth,async(req,res)=>{
    try{
      const prior=await store.request(safeId(req.params.id));
      if(!prior)throw err("Video request not found. No generation was retried.",404);
      if(prior.status==="EXPIRED")return res.json({ok:true,taskId:prior.task_id,status:"EXPIRED",expired:true});
      return previousResponse(res,prior);
    }catch(error){sendError(res,error);}
  });
  router.post("/start",auth,async(req,res)=>{
    let reserved=null;
    try{
      const body=req.body||{};
      requirePaidVideoConfirmation(body.confirmPaidGeneration);
      const uploadId=safeId(body.uploadId);
      const jobKey=safeId(body.requestId);
      // Reconcile BEFORE looking for upload, because successful starts consume it.
      const prior=await store.request(jobKey);
      if(prior)return previousResponse(res,prior,uploadId);
      const uploaded=await store.upload(uploadId);
      if(!uploaded)throw err("Uploaded video has expired. Upload again.",410);
      if(uploaded.request_id&&uploaded.request_id!==jobKey)
        throw err("This upload is already reserved for another generation request.",409);
      if(!body.plan||!Array.isArray(body.plan.lights))throw err("Missing video relighting plan.",422);
      const promptText=buildVideoRelightPrompt(body.plan);
      const keyframes=validateKeyframes(body.keyframes,uploaded.seconds);
      const fields={model:VIDEO_MODEL,videoUri:uploaded.uri,promptText,outputFormat:"mp4"};
      if(keyframes.length)fields.keyframes=keyframes;
      // Refresh real statuses before the shared database applies its atomic limit.
      // Unknown outcomes retain slots. A failed status query blocks a new paid start.
      for(const active of await store.active())if(active.task_id)await refreshJob(active.task_id);
      const reservation=await store.reserve(jobKey,uploadId);
      if(reservation.prior)return previousResponse(res,reservation.prior,uploadId);
      reserved=jobKey; // durable COMMIT has completed before the only provider POST.
      const task=await runwayRequest("/video_to_video","POST",fields,env,fetcher);
      const id=safeId(task.id);
      await store.submitted(jobKey,id);
      res.json({ok:true,taskId:id,status:"PENDING",model:VIDEO_MODEL,
        estimatedCredits:Math.ceil(uploaded.seconds*VIDEO_CREDITS_PER_SECOND)});
    }catch(error){
      if(reserved){await store.unknown(reserved).catch(()=>{});
        return sendError(res,err("Paid request outcome is unconfirmed. The request remains reserved; operator review is required.",409));}
      sendError(res,error);
    }
  });
  async function refreshJob(id){
    const session=await store.task(id);
    if(!session)throw err("Video job not found or expired.",404);
    if(["SUCCEEDED","FAILED","CANCELED","EXPIRED"].includes(session.status))return {id,session};
    const result=await runwayRequest("/tasks/"+encodeURIComponent(id),"GET",undefined,env,fetcher);
    const status=String(result.status||"");
    if(!VIDEO_STATUSES.includes(status))throw err("External video service has unknown task status.",502);
    let outputURL=null;
    if(status==="SUCCEEDED"){
      if(Array.isArray(result.output)&&result.output.length){
        try{trustedUrl(result.output[0],"output");outputURL=result.output[0];}catch{/* Terminal work still releases its slot; unusable output is never downloaded. */}
      }
    }
    await store.updateTask(id,status,outputURL);
    return {id,session:await store.task(id)};
  }
  router.get("/status/:id",auth,async(req,res)=>{
    try{const {id,session}=await refreshJob(safeId(req.params.id));
      res.json({ok:true,taskId:id,status:session.status,ready:session.status==="SUCCEEDED"&&!!session.output_url,
        outputFormat:"mp4",model:VIDEO_MODEL});
    }catch(error){sendError(res,error);}
  });
  router.get("/download/:id",auth,async(req,res)=>{
    try{
      const {session}=await refreshJob(safeId(req.params.id));
      if(session.status==="EXPIRED")throw err("Video job has expired.",410);
      if(session.status!=="SUCCEEDED"||!session.output_url)throw err("AI video is not ready.",409);
      const url=trustedUrl(session.output_url,"output");
      const upstream=await fetcher(url,{method:"GET",redirect:"error",signal:AbortSignal.timeout(120000)});
      if(!upstream.ok||!upstream.body)throw err("AI video storage could not be read.",502);
      const length=Number(upstream.headers.get("content-length"));
      if(Number.isFinite(length)&&length>MAX_DOWNLOAD_BYTES)throw err("AI video exceeds supported export size.",413);
      res.setHeader("Content-Type","video/mp4");
      res.setHeader("Content-Disposition",'attachment; filename="LightingAI_ScenePlanner_AI_Relight.mp4"');
      res.setHeader("Cache-Control","no-store");
      let bytes=0;
      const stream=Readable.fromWeb(upstream.body);
      stream.on("data",chunk=>{bytes+=chunk.length;if(bytes>MAX_DOWNLOAD_BYTES)stream.destroy(err("Video exceeds download limit.",413));});
      stream.on("error",()=>{if(!res.destroyed)res.destroy();});
      stream.pipe(res);
    }catch(error){if(!res.headersSent)sendError(res,error);}
  });
  return router;
}
