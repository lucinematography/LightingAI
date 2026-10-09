// Offline integration fixture only. Never imported by the backend server.
import pg from "pg";
import express from "express";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {PostgresVideoJobStore,videoPoolOptions} from "./scene-planner-job-store.js";
import {createVideoRouter} from "./scene-planner-video.js";

export function testDatabaseUrl(value){
  let url;try{url=new URL(value);}catch{throw new Error("A dedicated loopback CI PostgreSQL URL is required.");}
  if(!["postgres:","postgresql:"].includes(url.protocol)||
    !["127.0.0.1","localhost"].includes(url.hostname)||url.pathname!=="/lightingai_ci_test"||
    url.username!=="lightingai_ci"||url.search||url.hash)
    throw new Error("Only the dedicated loopback lightingai_ci_test database/role is permitted.");
  return url.toString();
}
export function testSchema(value){
  if(!/^lightingai_ci_[a-f0-9]{16}$/.test(value||""))throw new Error("Invalid isolated CI schema.");
  return value;
}
export const MOCK_VIDEO_TOKEN="fake-access-token-for-postgres-ci-only";

async function worker(){
  if(!process.send)throw new Error("The PostgreSQL fixture requires a parent IPC channel.");
  const url=testDatabaseUrl(process.env.SCENE_PLANNER_POSTGRES_TEST_URL);
  const schema=testSchema(process.env.SCENE_PLANNER_POSTGRES_TEST_SCHEMA);
  const name=process.env.SCENE_PLANNER_POSTGRES_TEST_INSTANCE;
  if(!/^lightingai_ci_worker_[a-f0-9]{16}$/.test(name||""))throw new Error("Invalid CI worker name.");
  const env={SCENE_PLANNER_VIDEO_ENABLED:"true",SCENE_PLANNER_VIDEO_DATABASE_URL:url,
    SCENE_PLANNER_VIDEO_DATABASE_TLS:"internal",RUNWAYML_API_SECRET:"fake-provider-key-for-postgres-ci-only",
    SCENE_PLANNER_VIDEO_ACCESS_TOKEN:MOCK_VIDEO_TOKEN};
  const options=videoPoolOptions(env);
  // Prove the adapter forces READ COMMITTED even with a stronger server default.
  options.options+=" -c search_path="+schema+" -c default_transaction_isolation=serializable";
  const pool=new pg.Pool({...options,application_name:name});pool.on("error",()=>{});
  let mode="ok",status="RUNNING",paid=0,heldProviders=[],heldReservation=null,dbFaults=0;
  const connect=pool.connect.bind(pool);
  const storePool={query:(...args)=>{
    if(/^(INSERT|UPDATE|DELETE) /.test(args[0]))throw new Error("Video writes must use explicit transactions.");
    return pool.query(...args);
  },end:()=>pool.end()};
  storePool.connect=async()=>{
    const client=await connect(),query=client.query.bind(client);
    const connectionError=()=>{};client.on("error",connectionError);
    client.query=async(sql,params)=>{
      if(/^(INSERT|UPDATE|DELETE) /.test(sql)){
        const isolation=(await query("SHOW transaction_isolation")).rows[0].transaction_isolation;
        if(isolation!=="read committed")throw new Error("Video mutation isolation is not explicit READ COMMITTED.");
      }
      if(sql.startsWith("UPDATE scene_video_request SET task_id=")&&
        (mode==="submitted-conflict-always"||(mode==="submitted-conflict"&&dbFaults===0))){
        dbFaults++;
        // Actual server SQLSTATE and aborted transaction, deterministic fault injection only.
        await query("DO $$ BEGIN RAISE EXCEPTION 'offline serialization fixture' USING ERRCODE='40001'; END $$");
      }
      const result=await query(sql,params);
      if(sql.startsWith("SELECT count(*)::int AS count FROM scene_video_request")){
        // Widen the count/insert race without replacing SQL or database locking.
        // With the gate intact this occurs inside the serialized transaction.
        await new Promise(resolve=>setTimeout(resolve,50));
      }
      if(mode==="hold-reservation"&&sql.startsWith("INSERT INTO scene_video_request")){
        const pid=(await query("SELECT pg_backend_pid() AS pid")).rows[0].pid;
        await new Promise(resolve=>{heldReservation=resolve;process.send({event:"reservation-held",pid});});
      }
      return result;
    };
    const release=client.release.bind(client);
    client.release=(...args)=>{client.removeListener("error",connectionError);client.query=query;client.release=release;release(...args);};
    return client;
  };
  const store=new PostgresVideoJobStore(storePool);
  const provider=async(url,options)=>{
    if(options.redirect!=="error"||!(options.signal instanceof AbortSignal))throw new Error("Provider safety options missing.");
    const route=String(url),json=data=>new Response(JSON.stringify(data),{headers:{"Content-Type":"application/json"}});
    if(route.endsWith("/uploads"))return json({uploadUrl:"https://offline.amazonaws.com/form",runwayUri:"runway://uploads/offline",fields:{key:"offline"}});
    if(route==="https://offline.amazonaws.com/form")return new Response(null,{status:204});
    if(route.endsWith("/video_to_video")){
      paid++;process.send({event:"paid-post"});
      if(mode==="hold-provider")await new Promise(resolve=>{heldProviders.push(resolve);process.send({event:"provider-held"});});
      if(mode==="timeout")throw new Error("Synthetic private provider failure");
      if(mode==="invalid")return json({id:"invalid"});
      return json({id:crypto.randomUUID()});
    }
    if(route.includes("/tasks/")){
      if(mode==="status-error")throw new Error("Synthetic private status failure");
      return json({status,...(status==="SUCCEEDED"?{output:["https://offline.cloudfront.net/result.mp4"]}:{})});
    }
    // No fallback to fetch: no real AI network operation is possible.
    throw new Error("Unexpected offline provider route.");
  };
  await store.ready();
  const app=express();app.use(express.json({limit:"15mb"}));
  app.use("/video",createVideoRouter(express,env,provider,{store}));
  const server=await new Promise(resolve=>{const s=app.listen(0,"127.0.0.1",()=>resolve(s));});
  let poolClosed=false;
  process.on("message",async message=>{
    try{
      if(message.command==="config"){
        if(!["ok","timeout","invalid","hold-provider","hold-reservation","status-error","submitted-conflict","submitted-conflict-always"].includes(message.mode)||
          !["RUNNING","SUCCEEDED","FAILED","CANCELED","UNRECOGNIZED"].includes(message.status))throw new Error();
        mode=message.mode;status=message.status;dbFaults=0;
      }else if(message.command==="release-reservation"){heldReservation?.();heldReservation=null;}
      else if(message.command==="release-provider"){for(const resolve of heldProviders)resolve();heldProviders=[];}
      else if(message.command==="stale-status"){
        if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(message.taskId||""))throw new Error();
        await store.updateTask(message.taskId,"RUNNING");
      }
      else if(message.command==="disconnect"){await pool.end();poolClosed=true;}
      else if(message.command==="stats"){}
      else if(message.command==="stop"){
        server.closeAllConnections();await new Promise(r=>server.close(r));
        if(!poolClosed)await pool.end();
        process.send({reply:message.id,ok:true,paid});process.disconnect();return;
      }else throw new Error();
      process.send({reply:message.id,ok:true,paid,dbFaults});
    }catch{process.send({reply:message.id,ok:false});}
  });
  process.send({event:"ready",port:server.address().port});
}
if(process.argv[1]===fileURLToPath(import.meta.url)&&process.argv[2]==="--worker"){
  worker().catch(()=>{process.send?.({event:"fatal"});process.exitCode=1;process.disconnect?.();});
}
