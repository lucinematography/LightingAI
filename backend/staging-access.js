import {createHash,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs/promises';
import {createPostgresAttemptStore} from './staging-postgres-attempt-store.js';
export const PLAN_PATH='/api/lighting-plan';
const safeGets=new Set(['/health','/api/catalog-health','/api/catalog-status','/api/fixtures','/api/accessories','/api/kits','/api/review/aputure']);
export function canonical(value) {
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value!==null&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
export const payloadHash=body=>createHash('sha256').update(canonical(body)).digest('hex');
const hash=value=>createHash('sha256').update(value).digest();
export function applyStep16Lock(env=process.env) {
  const mode=env.LIGHTINGAI_STAGE_MODE||'disabled';
  if(!['disabled','simulation'].includes(mode))throw new Error('STAGING_LIVE_NOT_READY: dedicated durable storage and live-provider review required');
  // This review copy NEVER enables OpenAI or Runway.
  env.LIGHTINGAI_DISABLE_PAID_AI='true';env.SCENE_PLANNER_VIDEO_ENABLED='false';env.LIGHTINGAI_PREVIEW_TEST='0';
  delete env.OPENAI_API_KEY;delete env.RUNWAYML_API_SECRET;
  return mode;
}
let singleton;
export function getStep16Gate(env=process.env) {
  if(singleton)return singleton;
  const mode=env.LIGHTINGAI_STAGE_MODE||'disabled';
  const enabled=mode==='simulation'&&env.LIGHTINGAI_STAGE_APPROVED_PATH===PLAN_PATH;
  const admitted=new WeakSet();
  const tokenHash=String(env.LIGHTINGAI_STAGE_TOKEN_SHA256||'');
  const requestHash=String(env.LIGHTINGAI_STAGE_REQUEST_SHA256||'');
  let store=null;
  if(enabled) {
    if(!/^[a-f0-9]{64}$/.test(tokenHash)||!/^[a-f0-9]{64}$/.test(requestHash))throw new Error('STAGING_APPROVAL_CONFIG');
    store=createPostgresAttemptStore(env);
  }
  const deny=(res,status,code)=>res.status(status).json({ok:false,code,error:'Isolated test request refused: '+code});
  async function handle(req,res,next) {
    // Exact path and method checks prevent Express case/trailing-slash aliases,
    // query-string variants and unrelated paid routes from bypassing admission.
    const raw=req.originalUrl||req.url;
    if(req.method==='GET'&&raw==='/api/visual-preview')return res.json({ok:false,available:false,reason:'disabled-in-one-photo-test'});
    if(req.method==='GET'&&(safeGets.has(raw)||/^\/api\/fixtures\/[a-zA-Z0-9_-]+\/accessories$/.test(raw)))return next();
    if(!enabled) return deny(res,503,'STAGING_DISABLED');
    if(req.method!=='POST'||raw!==PLAN_PATH)return deny(res,403,'STAGING_ROUTE_BLOCKED');
    const authorization=req.get('authorization')||'';
    const match=/^Bearer ([A-Za-z0-9_-]{32,256})$/.exec(authorization);
    if(!match||!timingSafeEqual(hash(match[1]),Buffer.from(tokenHash,'hex')))return deny(res,401,'STAGING_UNAUTHORIZED');
    if(!req.body||Array.isArray(req.body)||typeof req.body!=='object'||typeof req.body.scenePhoto!=='string'||!req.body.scenePhoto.startsWith('data:image/'))return deny(res,400,'STAGING_INVALID_INPUT');
    if(payloadHash(req.body)!==requestHash)return deny(res,403,'STAGING_INPUT_NOT_APPROVED');
    try{await store.consume(requestHash);}
    catch(error){return deny(res,error.code==='STAGING_ATTEMPT_SPENT'?409:503,error.code==='STAGING_ATTEMPT_SPENT'?error.code:'STAGING_STORE_UNAVAILABLE');}
    admitted.add(req);next();
  }
  const middleware=(req,res,next)=>{handle(req,res,next).catch(()=>{if(!res.headersSent)deny(res,503,'STAGING_ADMISSION_FAILED');});};
  singleton={middleware,isAdmitted:req=>admitted.has(req)};
  return singleton;
}
export function createStep16SimulationClient(env=process.env) {
  if((env.LIGHTINGAI_STAGE_MODE||'disabled')!=='simulation')return null;
  if(!env.LIGHTINGAI_STAGE_SIMULATION_PLAN_PATH||!env.LIGHTINGAI_STAGE_SIMULATION_LOG)throw new Error('STAGING_SIMULATION_CONFIG');
  return {responses:{create:async(body,options)=>{
    if(body.max_output_tokens!==6000||options.maxRetries!==0||options.timeout!==120000)throw new Error('STAGING_LIMITS_CHANGED');
    await fs.appendFile(env.LIGHTINGAI_STAGE_SIMULATION_LOG,JSON.stringify({kind:'simulated-provider-attempt',maxOutputTokens:body.max_output_tokens,maxRetries:options.maxRetries,timeout:options.timeout})+'\n');
    const delay=Math.max(0,Math.min(10000,Number(env.LIGHTINGAI_STAGE_SIMULATION_DELAY_MS)||0));
    if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
    if(env.LIGHTINGAI_STAGE_SIMULATION_FAILURE==='true')throw new Error('SIMULATED_PROVIDER_FAILURE');
    return {status:'completed',incomplete_details:null,output_text:await fs.readFile(env.LIGHTINGAI_STAGE_SIMULATION_PLAN_PATH,'utf8')};
  }}};
}
