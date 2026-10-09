import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import express from "express";
import {createVideoRouter,validateVideoBinary} from "./scene-planner-video.js";
import {PostgresVideoJobStore,videoPoolOptions} from "./scene-planner-job-store.js";
import {testMp4,testStore} from "./scene-planner-video-test-support.js";

const env={SCENE_PLANNER_VIDEO_ENABLED:"true",RUNWAYML_API_SECRET:"fake-provider-secret-for-offline-tests",
  SCENE_PLANNER_VIDEO_ACCESS_TOKEN:"fake-access-token-for-offline-tests-only",SCENE_PLANNER_VIDEO_DATABASE_URL:"postgres://unused.invalid/offline"};
const plan={look:"Day for Night",lights:[]};
const clip=testMp4(12),uuid=()=>crypto.randomUUID();
async function listen(store,provider,configured=env){
  const app=express();app.use(express.json({limit:"15mb"}));
  app.use("/video",createVideoRouter(express,configured,provider,{store}));
  const server=await new Promise(resolve=>{const s=app.listen(0,"127.0.0.1",()=>resolve(s));});
  const root="http://127.0.0.1:"+server.address().port+"/video";
  return {
    async call(route,body){
      const response=await fetch(root+route,{method:body?"POST":"GET",headers:{Authorization:"Bearer "+env.SCENE_PLANNER_VIDEO_ACCESS_TOKEN,"Content-Type":"application/json"},...(body?{body:JSON.stringify(body)}:{})});
      return {code:response.status,data:await response.json()};
    },
    async upload(buffer=clip,duration="999"){
      const r=await fetch(root+"/upload",{method:"POST",headers:{Authorization:"Bearer "+env.SCENE_PLANNER_VIDEO_ACCESS_TOKEN,"Content-Type":"video/mp4","X-Scene-Duration":duration},body:buffer});
      return {code:r.status,data:await r.json()};
    },
    async close(){server.closeAllConnections();await new Promise(r=>server.close(r));}
  };
}
function providerFixture(){
  const state={paid:0,uploads:0,status:"RUNNING",mode:"ok",tasks:[],beforePost:null,omitOutput:false};
  const json=data=>new Response(JSON.stringify(data),{headers:{"Content-Type":"application/json"}});
  return {state,async fetch(url,options){
    assert.equal(options.redirect,"error");assert.ok(options.signal instanceof AbortSignal);
    const route=String(url);
    if(route.endsWith("/uploads")){state.uploads++;return json({uploadUrl:"https://offline.amazonaws.com/form",runwayUri:"runway://uploads/offline",fields:{key:"offline"}});}
    if(route.endsWith("/form"))return new Response(null,{status:204});
    if(route.endsWith("/video_to_video")){
      state.paid++;if(state.beforePost)await state.beforePost();
      if(state.mode==="timeout")throw Object.assign(new Error("private provider detail must not escape"),{name:"TimeoutError"});
      if(state.mode==="invalid")return json({id:"unusable"});
      const id=uuid();state.tasks.push(id);return json({id});
    }
    if(route.includes("/tasks/")){
      if(state.mode==="status-error")throw new Error("private upstream URL and log");
      return json({status:state.status,...(state.status==="SUCCEEDED"&&!state.omitOutput?{output:["https://offline.cloudfront.net/output.mp4"]}:{})});
    }
    throw new Error("Unexpected offline provider route");
  }};
}
const start=(uploadId,requestId=uuid())=>({uploadId,requestId,plan,confirmPaidGeneration:true});

await test("media is measured from bounded sample tables",async t=>{
  await t.test("forged duration is ignored",()=>assert.equal(validateVideoBinary(clip,"video/mp4",2).seconds,12));
  await t.test("2 and 30 second boundaries pass",()=>{for(const s of [2,30])assert.equal(validateVideoBinary(testMp4(s),"video/mp4",999).seconds,s);});
  await t.test("outside duration boundaries fail",()=>{for(const s of [1,31])assert.throws(()=>validateVideoBinary(testMp4(s),"video/mp4",12));});
  await t.test("truncated MP4 fails",()=>assert.throws(()=>validateVideoBinary(clip.subarray(0,clip.length-8),"video/mp4",12),/container/));
  await t.test("fake signature without media tables fails",()=>{const b=Buffer.alloc(1024);b.write("ftyp",4);assert.throws(()=>validateVideoBinary(b,"video/mp4",12));});
  await t.test("sample outside mdat fails",()=>{const b=Buffer.from(clip);const at=b.indexOf("stco");b.writeUInt32BE(1,at+12);assert.throws(()=>validateVideoBinary(b,"video/mp4",12));});
  await t.test("forged movie duration fails",()=>{const b=Buffer.from(clip);b.writeUInt32BE(2000,b.indexOf("mvhd")+20);assert.throws(()=>validateVideoBinary(b,"video/mp4",2));});
  await t.test("inconsistent sample count fails",()=>{const b=Buffer.from(clip);b.writeUInt32BE(11,b.indexOf("stts")+12);assert.throws(()=>validateVideoBinary(b,"video/mp4",12));});
  await t.test("oversized video fails before analysis",()=>assert.throws(()=>validateVideoBinary(Buffer.alloc(40*1024*1024+1),"video/mp4"),/40 MiB/));
  await t.test("unverified WebM fails closed",()=>{const b=Buffer.alloc(1024);Buffer.from([0x1a,0x45,0xdf,0xa3]).copy(b);assert.throws(()=>validateVideoBinary(b,"video/webm",12),/cannot be verified/);});
});

await test("durable PostgreSQL statements and mocked HTTP provider",async t=>{
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),"lightingai-video-store-test-"));
  let store=await testStore(path.join(folder,"database"));
  const provider=providerFixture();let api=await listen(store,provider.fetch);
  const reset=async()=>{await store.pool.query("TRUNCATE scene_video_request,scene_video_upload");Object.assign(provider.state,{paid:0,uploads:0,status:"RUNNING",mode:"ok",tasks:[],beforePost:null,omitOutput:false});};
  try{
    await t.test("database config validates protocol and TLS",()=>{
      assert.equal(videoPoolOptions({}),null);
      assert.throws(()=>videoPoolOptions({SCENE_PLANNER_VIDEO_DATABASE_URL:"https://wrong.invalid"}));
      const opts=videoPoolOptions({...env,SCENE_PLANNER_VIDEO_DATABASE_URL:"postgres://unused.invalid/test?sslmode=disable"});
      assert.equal(opts.ssl.rejectUnauthorized,true);assert.ok(!opts.connectionString.includes("sslmode"));
      assert.match(opts.options,/synchronous_commit=on/);
      assert.equal(videoPoolOptions({...env,SCENE_PLANNER_VIDEO_DATABASE_TLS:"internal"}).ssl,false);
    });
    await t.test("missing storage and kill switch prohibit every provider call",async()=>{
      for(const configured of [{...env,SCENE_PLANNER_VIDEO_DATABASE_URL:""},{...env,LIGHTINGAI_DISABLE_PAID_AI:"true"}]){
        const disabled=await listen(store,provider.fetch,configured);
        try{assert.equal((await disabled.call("/capabilities")).data.available,false);assert.equal((await disabled.upload()).code,503);assert.equal(provider.state.uploads,0);assert.equal(provider.state.paid,0);}finally{await disabled.close();}
      }
    });
    await t.test("actual duration returned despite forged HTTP header; corrupt upload never leaves server",async()=>{
      assert.equal((await api.upload()).data.seconds,12);
      assert.equal((await api.upload(clip.subarray(0,512),"12")).code,422);assert.equal(provider.state.uploads,1);
    });
    await t.test("upload and paid task survive database/process restart",async()=>{
      await reset();const upload=await api.upload();const body=start(upload.data.uploadId);
      await api.close();await store.close();store=await testStore(path.join(folder,"database"));api=await listen(store,provider.fetch);
      provider.state.beforePost=async()=>assert.equal((await store.request(body.requestId)).status,"SUBMITTING","reservation committed before provider charge");
      const result=await api.call("/start",body);assert.equal(result.code,200);
      await api.close();await store.close();store=await testStore(path.join(folder,"database"));api=await listen(store,provider.fetch);
      assert.equal((await api.call("/request/"+body.requestId)).data.taskId,result.data.taskId);
      assert.equal((await api.call("/start",body)).data.reused,true);assert.equal(provider.state.paid,1);
      assert.equal((await api.call("/status/"+result.data.taskId)).data.status,"RUNNING");
    });
    await t.test("concurrent routers reserve same request only once",async()=>{
      await reset();const other=await listen(new PostgresVideoJobStore(store.pool),provider.fetch);
      try{const body=start((await api.upload()).data.uploadId);const results=await Promise.all([api.call("/start",body),other.call("/start",body)]);
        assert.ok(results.every(r=>[200,409].includes(r.code)));assert.equal(provider.state.paid,1);
        assert.equal((await api.call("/start",body)).data.reused,true);
      }finally{await other.close();}
    });
    await t.test("same upload cannot fund concurrent independent requests",async()=>{
      await reset();const id=(await api.upload()).data.uploadId;
      const results=await Promise.all([api.call("/start",start(id)),api.call("/start",start(id))]);
      assert.equal(results.filter(r=>r.code===200).length,1);assert.equal(provider.state.paid,1);
    });
    for(const mode of ["timeout","invalid"]){
      await t.test(mode+" outcome never retries, including after restart and expiry",async()=>{
        await reset();provider.state.mode=mode;const body=start((await api.upload()).data.uploadId);
        assert.equal((await api.call("/start",body)).code,409);
        assert.equal((await store.request(body.requestId)).status,"UNKNOWN");
        await store.pool.query("UPDATE scene_video_request SET expires_at=now()-interval '30 days'");
        await store.pool.query("UPDATE scene_video_upload SET expires_at=now()-interval '30 days'");
        await api.close();await store.close();store=await testStore(path.join(folder,"database"));api=await listen(store,provider.fetch);
        const recovered=await api.call("/request/"+body.requestId);assert.equal(recovered.code,409);assert.equal(recovered.data.requiresReview,true);
        assert.equal((await api.call("/start",body)).code,409);assert.equal(provider.state.paid,1);
        assert.equal((await store.active()).length,1);assert.equal((await store.request(body.requestId)).status,"UNKNOWN");
        assert.ok(!JSON.stringify(recovered).includes("private"));
      });
    }
    await t.test("task persistence failure blocks a second charge",async()=>{
      await reset();const body=start((await api.upload()).data.uploadId),submitted=store.submitted;
      store.submitted=async()=>{throw new Error("private database details");};
      try{assert.equal((await api.call("/start",body)).code,409);}finally{store.submitted=submitted;}
      assert.equal((await api.call("/start",body)).code,409);assert.equal(provider.state.paid,1);
    });
    async function withDbFault(match,fail,run){
      const connect=store.pool.connect;let hits=0;
      store.pool.connect=async()=>{
        const client=await connect(),query=client.query;
        client.query=async(sql,params)=>{
          if(match(sql))return fail(++hits,()=>query(sql,params),query);
          return query(sql,params);
        };
        return client;
      };
      try{await run(()=>hits);}finally{store.pool.connect=connect;}
    }
    const serialization=()=>Object.assign(new Error("offline serialization failure"),{code:"40001"});
    const receiptWrite=sql=>sql.startsWith("UPDATE scene_video_request SET task_id=");
    await t.test("40001 after provider acceptance retries DB only and survives restart",async()=>{
      await reset();const body=start((await api.upload()).data.uploadId);let result;
      await withDbFault(receiptWrite,(hit,query,raw)=>{
        if(hit===1)return raw("DO $$ BEGIN RAISE EXCEPTION 'offline serialization fixture' USING ERRCODE='40001'; END $$");
        return query();
      },async hits=>{
        result=await api.call("/start",body);assert.equal(result.code,200);assert.equal(hits(),2);assert.equal(provider.state.paid,1);
      });
      await api.close();await store.close();store=await testStore(path.join(folder,"database"));api=await listen(store,provider.fetch);
      assert.equal((await api.call("/request/"+body.requestId)).data.taskId,result.data.taskId);
      assert.equal((await api.call("/start",body)).data.reused,true);assert.equal(provider.state.paid,1);
    });
    await t.test("persistent 40001 stops after three DB attempts; restart never charges again",async()=>{
      await reset();const body=start((await api.upload()).data.uploadId);
      await withDbFault(receiptWrite,()=>{throw serialization();},async hits=>{
        assert.equal((await api.call("/start",body)).code,409);assert.equal(hits(),3);
      });
      assert.equal((await store.request(body.requestId)).status,"UNKNOWN");
      await api.close();await store.close();store=await testStore(path.join(folder,"database"));api=await listen(store,provider.fetch);
      assert.equal((await api.call("/start",body)).code,409);assert.equal(provider.state.paid,1);
    });
    await t.test("lost COMMIT acknowledgement is not retried; durable receipt reconciles",async()=>{
      await reset();const body=start((await api.upload()).data.uploadId),connect=store.pool.connect;let attempts=0;
      store.pool.connect=async()=>{
        const client=await connect(),query=client.query;let submitted=false;
        client.query=async(sql,params)=>{
          if(receiptWrite(sql)){submitted=true;attempts++;}
          const result=await query(sql,params);
          if(submitted&&sql==="COMMIT")throw Object.assign(new Error("offline lost acknowledgment"),{code:"08006"});
          return result;
        };return client;
      };
      try{assert.equal((await api.call("/start",body)).code,409);assert.equal(attempts,1);}finally{store.pool.connect=connect;}
      const receipt=await store.request(body.requestId);assert.ok(receipt.task_id);assert.equal(receipt.status,"PENDING");
      await api.close();await store.close();store=await testStore(path.join(folder,"database"));api=await listen(store,provider.fetch);
      assert.equal((await api.call("/start",body)).data.taskId,receipt.task_id);assert.equal(provider.state.paid,1);
    });
    await t.test("40001 in reservation cannot replay provider or exceed capacity",async()=>{
      await reset();const body=start((await api.upload()).data.uploadId);
      await withDbFault(sql=>sql.startsWith("INSERT INTO scene_video_request"),(hit,query)=>{if(hit===1)throw serialization();return query();},async hits=>{
        assert.equal((await api.call("/start",body)).code,200);assert.equal(hits(),2);assert.equal(provider.state.paid,1);
      });
    });
    await t.test("unknown and status retries preserve terminal and task identity guards",async()=>{
      await reset();const body=start((await api.upload()).data.uploadId),result=await api.call("/start",body);
      await withDbFault(sql=>sql.startsWith("UPDATE scene_video_request SET status="),(hit,query)=>{if(hit===1)throw serialization();return query();},async hits=>{
        await store.updateTask(result.data.taskId,"FAILED");assert.equal(hits(),2);
      });
      await store.submitted(body.requestId,result.data.taskId);await store.unknown(body.requestId);
      assert.equal((await store.request(body.requestId)).status,"FAILED");
      await assert.rejects(store.submitted(body.requestId,uuid()),/not persisted/);
      await reset();provider.state.mode="timeout";const ambiguous=start((await api.upload()).data.uploadId);
      await withDbFault(sql=>sql.startsWith("UPDATE scene_video_request SET status='UNKNOWN'"),(hit,query)=>{if(hit===1)throw serialization();return query();},async hits=>{
        assert.equal((await api.call("/start",ambiguous)).code,409);assert.equal(hits(),2);
      });
      assert.equal((await store.request(ambiguous.requestId)).status,"UNKNOWN");assert.equal(provider.state.paid,1);
    });
    await t.test("40001 at COMMIT rechecks the saved receipt in a fresh transaction",async()=>{
      await reset();const body=start((await api.upload()).data.uploadId);
      await store.reserve(body.requestId,body.uploadId);const taskId=uuid();
      await withDbFault(sql=>sql==="COMMIT",(hit,query)=>{if(hit===1)throw serialization();return query();},async hits=>{
        await store.submitted(body.requestId,taskId);assert.equal(hits(),2);
      });
      await store.submitted(body.requestId,taskId);assert.equal((await store.request(body.requestId)).task_id,taskId);
      assert.equal(provider.state.paid,0);
    });
    await t.test("failed rollback prevents retry even for 40001",async()=>{
      let attempts=0,released=0;
      const broken=new PostgresVideoJobStore({connect:async()=>{
        attempts++;return {query:async sql=>{if(sql==="ROLLBACK")throw new Error("offline connection lost");throw serialization();},release(){released++;}};
      }});
      await assert.rejects(broken.submitted(uuid(),uuid()),e=>e.code==="40001");assert.equal(attempts,1);assert.equal(released,1);
    });
    await t.test("all adapter mutations use explicit READ COMMITTED transactions",async()=>{
      await reset();
      await withDbFault(sql=>/^(INSERT|UPDATE|DELETE) /.test(sql),async(hit,query,raw)=>{
        assert.equal((await raw("SHOW transaction_isolation")).rows[0].transaction_isolation,"read committed");
        return query();
      },async hits=>{
        const body=start((await api.upload()).data.uploadId),result=await api.call("/start",body);
        assert.equal(result.code,200);await store.updateTask(result.data.taskId,"FAILED");await store.unknown(body.requestId);
        assert.ok(hits()>5);assert.equal(provider.state.paid,1);
      });
    });
    await t.test("active limit is atomic across three concurrent starts",async()=>{
      await reset();const uploads=await Promise.all([api.upload(),api.upload(),api.upload()]);
      const results=await Promise.all(uploads.map(u=>api.call("/start",start(u.data.uploadId))));
      assert.equal(results.filter(r=>r.code===200).length,2);assert.equal(results.filter(r=>r.code===429).length,1);assert.equal(provider.state.paid,2);
    });
    for(const status of ["SUCCEEDED","FAILED","CANCELED"]){
      await t.test("refresh "+status+" releases active slots",async()=>{
        await reset();for(let i=0;i<2;i++)assert.equal((await api.call("/start",start((await api.upload()).data.uploadId))).code,200);
        provider.state.status=status;
        assert.equal((await api.call("/start",start((await api.upload()).data.uploadId))).code,200);assert.equal(provider.state.paid,3);
      });
    }
    await t.test("unknown and unavailable statuses cannot trigger another paid start",async()=>{
      await reset();await api.call("/start",start((await api.upload()).data.uploadId));
      const body=start((await api.upload()).data.uploadId);provider.state.status="UNRECOGNIZED";
      assert.equal((await api.call("/start",body)).code,502);assert.equal(provider.state.paid,1);
      provider.state.mode="status-error";const result=await api.call("/start",body);
      assert.equal(result.code,500);assert.ok(!JSON.stringify(result).includes("private"));assert.equal(provider.state.paid,1);
    });
    await t.test("completed job without usable output still releases its slot",async()=>{
      await reset();const result=await api.call("/start",start((await api.upload()).data.uploadId));
      provider.state.status="SUCCEEDED";provider.state.omitOutput=true;
      const status=await api.call("/status/"+result.data.taskId);
      assert.equal(status.data.status,"SUCCEEDED");assert.equal(status.data.ready,false);assert.equal((await store.active()).length,0);
      assert.equal((await api.call("/start",start((await api.upload()).data.uploadId))).code,200);
    });
    await t.test("terminal expiry clears URL but preserves replay tombstone",async()=>{
      await reset();const body=start((await api.upload()).data.uploadId);const result=await api.call("/start",body);
      provider.state.status="SUCCEEDED";await api.call("/status/"+result.data.taskId);
      await store.pool.query("UPDATE scene_video_request SET expires_at=now()-interval '1 day'");
      assert.equal((await api.call("/start",body)).code,410);const record=await store.request(body.requestId);
      assert.equal(record.status,"EXPIRED");assert.equal(record.output_url,null);assert.equal(provider.state.paid,1);assert.equal((await store.active()).length,0);
      assert.equal((await api.call("/status/"+result.data.taskId)).data.status,"EXPIRED");
      assert.equal((await api.call("/request/"+body.requestId)).data.expired,true);
    });
    await t.test("stale concurrent status cannot resurrect terminal work",async()=>{
      await reset();const result=await api.call("/start",start((await api.upload()).data.uploadId));
      await store.updateTask(result.data.taskId,"FAILED");await store.updateTask(result.data.taskId,"RUNNING");
      assert.equal((await store.task(result.data.taskId)).status,"FAILED");
    });
    await t.test("expired unused uploads are removed",async()=>{
      await reset();const id=(await api.upload()).data.uploadId;await store.pool.query("UPDATE scene_video_upload SET expires_at=now()-interval '1 day'");
      assert.equal((await api.call("/start",start(id))).code,410);assert.equal(provider.state.paid,0);
    });
    await t.test("storage outage blocks paid start and sanitizes details",async()=>{
      await reset();const ready=store.ready;store.ready=async()=>{throw new Error("private connection string");};
      try{assert.equal((await api.call("/capabilities")).data.available,false);const r=await api.call("/start",start(uuid()));assert.equal(r.code,500);assert.ok(!JSON.stringify(r).includes("private"));assert.equal(provider.state.paid,0);}finally{store.ready=ready;}
    });
  }finally{
    await api.close();await store.close();assert.equal(path.dirname(path.resolve(folder)),path.resolve(os.tmpdir()));fs.rmSync(folder,{recursive:true,force:true});
  }
});

await test("browser resume and native save behavior",async t=>{
  const nodes=new Map(),saved=new Map(),calls=[];
  const node=id=>{if(!nodes.has(id))nodes.set(id,{value:"",style:{},checked:false,disabled:false,appendChild(){},load(){},remove(){}});return nodes.get(id);};
  const context={console,Map,Number,JSON,AbortController,setTimeout(){},clearTimeout(){},navigator:{},File:class{},
    URL:{createObjectURL(){return "blob:offline";},revokeObjectURL(){}},
    localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},
    document:{readyState:"loading",addEventListener(){},getElementById:node,createElement:()=>node("created")},
    window:{Android:{saveAiVideo:(id,token)=>calls.push({native:id,token}),releaseScenePlannerCaptures:keep=>calls.push({release:keep})}},
    fetch:async(url,options)=>{calls.push({url,method:options?.method||"GET"});return new Response(JSON.stringify(String(url).includes("/request/")?{taskId:taskId}:{status:"SUCCEEDED",ready:true}),{headers:{"Content-Type":"application/json"}});}
  };
  const taskId=uuid(),requestId=uuid(),uploadId=uuid();
  const source=fs.readFileSync(new URL("../app/src/main/assets/scene-planner.js",import.meta.url),"utf8").replace("window.LightingAIScenePlanner={open:open",
    "window.__test={state:state,persist:persistVideoReceipt,restore:restoreVideoReceipt,check:checkAIVideo,start:startAIVideo,download:downloadAIVideo,close:close,blocked:function(){return videoReceiptBlocked;}};window.LightingAIScenePlanner={open:open");
  vm.runInNewContext(source,context);const ui=context.window.__test;
  await t.test("receipt stores identifiers only; token stays out of localStorage",()=>{
    node("sp-video-auth").value=env.SCENE_PLANNER_VIDEO_ACCESS_TOKEN;
    ui.persist({requestId,uploadId,status:"SUBMITTING",token:env.SCENE_PLANNER_VIDEO_ACCESS_TOKEN,plan:{private:"data"}});
    const value=[...saved.values()][0];assert.ok(!value.includes(env.SCENE_PLANNER_VIDEO_ACCESS_TOKEN));assert.ok(!value.includes("private"));
  });
  await t.test("reopen reconciles lost response with GET only and blocks paid start",async()=>{
    ui.restore();assert.equal(ui.blocked(),true);ui.state.aiVideoAvailable=true;
    await ui.start();assert.equal(calls.length,0);await ui.check();
    assert.equal(ui.state.aiVideoTaskId,taskId);assert.ok(calls.every(c=>c.method==="GET"));assert.equal(ui.blocked(),false);
  });
  await t.test("native save requires no WebView fetch or blob",async()=>{
    calls.length=0;await ui.download();assert.equal(calls.length,1);assert.equal(calls[0].native,taskId);
  });
  await t.test("preview is separate and performs no native save",async()=>{
    calls.length=0;context.fetch=async()=>{calls.push({download:true});return new Response(clip);};
    await ui.download(true);assert.equal(calls.length,1);assert.equal(calls[0].download,true);assert.equal(ui.state.aiVideoPreviewUrl,"blob:offline");
  });
  await t.test("close clears token and releases captures",()=>{
    ui.close();assert.equal(node("sp-video-auth").value,"");assert.equal(calls.at(-1).release,false);assert.equal(ui.state.videoFile,null);
  });
  await t.test("corrupt receipt blocks a new paid start",()=>{
    saved.set("lighting_scene_planner_video_receipt_v1",'{"requestId":"wrong"}');ui.restore();assert.equal(ui.blocked(),true);
  });
  await t.test("native cleanup remains restricted to owned legacy captures",()=>{
    const java=fs.readFileSync(new URL("../app/src/main/java/com/lightingai/app/MainActivity.java",import.meta.url),"utf8");
    const cleanup=fs.readFileSync(new URL("../app/src/main/java/com/lightingai/app/ScenePlannerCaptureCleanup.java",import.meta.url),"utf8");
    assert.match(cleanup,/canonical\.getParentFile\(\)\.equals\(folder\)/);assert.match(cleanup,/canonical\.lastModified\(\) < cutoff/);
    assert.match(java,/ScenePlannerCaptureCleanup\.prune/);
    assert.match(java,/scenePlannerCaptureUris\.add\(uri\)/);assert.match(java,/getPackageName\(\) \+ "\.ai\.preview"/);
    assert.match(java,/onDestroy\(\) \{\s*releaseScenePlannerCaptures\(false\)/);
    assert.match(java,/@JavascriptInterface public void releaseScenePlannerCaptures/);
  });
});
