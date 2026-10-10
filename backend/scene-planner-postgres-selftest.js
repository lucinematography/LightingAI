import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";
import fs from "node:fs";
import {fork} from "node:child_process";
import pg from "pg";
import {VIDEO_JOB_SCHEMA,videoPoolOptions} from "./scene-planner-job-store.js";
import {testMp4} from "./scene-planner-video-test-support.js";
import {testDatabaseUrl,testSchema,MOCK_VIDEO_TOKEN} from "./scene-planner-postgres-worker.js";

const uuid=()=>crypto.randomUUID(),hex=()=>crypto.randomBytes(8).toString("hex");
const root=new URL("../",import.meta.url);

async function preflight(){
  await test("PostgreSQL integration fixture rejects unsafe database targets",()=>{
    assert.equal(new URL(testDatabaseUrl("postgres://lightingai_ci:offline-only@127.0.0.1:5432/lightingai_ci_test")).hostname,"127.0.0.1");
    for(const value of [undefined,"", "postgres://lightingai_ci:offline-only@render.invalid/lightingai_ci_test",
      "postgres://lightingai_ci:offline-only@127.0.0.1/production","postgres://postgres:offline-only@127.0.0.1/lightingai_ci_test",
      "postgres://lightingai_ci:offline-only@127.0.0.1/lightingai_ci_test?options=unsafe"])
      assert.throws(()=>testDatabaseUrl(value));
    assert.throws(()=>testSchema("public"));assert.throws(()=>testSchema("lightingai_ci_bad; DROP SCHEMA public"));
  });
  await test("real PostgreSQL and Android checks remain mandatory in CI",()=>{
    const workflow=fs.readFileSync(new URL(".github/workflows/build-apk.yml",root),"utf8");
    assert.match(workflow,/image: postgres:16/);assert.match(workflow,/POSTGRES_DB: lightingai_ci_test/);
    assert.match(workflow,/--health-cmd "pg_isready -U lightingai_ci -d lightingai_ci_test"/);
    assert.match(workflow,/npm run test:scene-planner-postgres/);
    const step=workflow.split("- name: Scene Planner real PostgreSQL integration")[1]?.split("- name:")[0];
    assert.ok(step);assert.doesNotMatch(step,/continue-on-error|if:/);
    for(const command of ["gradle lintDebug","node android-lint-changed-files-gate.js","gradle testDebugUnitTest","gradle assembleDebug"])
      assert.ok(workflow.includes(command),command);
    const junit=fs.readFileSync(new URL("app/src/test/java/com/lightingai/app/ScenePlannerCaptureCleanupTest.java",root),"utf8");
    assert.equal((junit.match(/@Test\b/g)||[]).length,3);
    const pkg=JSON.parse(fs.readFileSync(new URL("backend/package.json",root),"utf8"));
    assert.equal(pkg.scripts["test:scene-planner-postgres"],"node scene-planner-postgres-selftest.js");
    assert.ok(pkg.scripts.check.includes("test:scene-planner-video-phase2"));
  });
  await test("worker cannot fall back to a real paid provider",()=>{
    const source=fs.readFileSync(new URL("./scene-planner-postgres-worker.js",import.meta.url),"utf8");
    assert.doesNotMatch(source,/\bfetch\s*\(/);assert.match(source,/createVideoRouter\(express,env,provider,\{store\}\)/);
    assert.match(source,/testDatabaseUrl\(process\.env\.SCENE_PLANNER_POSTGRES_TEST_URL\)/);
    assert.match(source,/new pg\.Pool/);
  });
}

async function integration(){
  // Intentionally fatal, not skipped: the runner must supply a real service.
  const url=testDatabaseUrl(process.env.SCENE_PLANNER_POSTGRES_TEST_URL);
  const schema=testSchema("lightingai_ci_"+hex());
  const admin=new pg.Pool({...videoPoolOptions({SCENE_PLANNER_VIDEO_DATABASE_URL:url,SCENE_PLANNER_VIDEO_DATABASE_TLS:"internal"}),max:2});
  admin.on("error",()=>{});
  const children=new Set();let paid=0,providerHolds=0,holdWaiter=null;
  function waitProviderHolds(count){
    if(providerHolds>=count)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{holdWaiter=null;reject(new Error("Pending provider count timed out."));},15000);
      holdWaiter={count,resolve:()=>{clearTimeout(timer);holdWaiter=null;resolve();}};
    });
  }
  async function instance(){
    const name="lightingai_ci_worker_"+hex();
    const child=fork(new URL("./scene-planner-postgres-worker.js",import.meta.url),["--worker"],{
      env:{PATH:process.env.PATH||"",SYSTEMROOT:process.env.SYSTEMROOT||"",TEMP:process.env.TEMP||"",
        SCENE_PLANNER_POSTGRES_TEST_URL:url,SCENE_PLANNER_POSTGRES_TEST_SCHEMA:schema,SCENE_PLANNER_POSTGRES_TEST_INSTANCE:name},
      stdio:["ignore","ignore","ignore","ipc"]});
    const events=[],waiting=new Map(),pending=new Map();let closed=false,port;
    const gone=new Promise(resolve=>child.once("exit",()=>{
      closed=true;children.delete(api);
      for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error("CI worker exited unexpectedly."));}
      for(const p of waiting.values()){clearTimeout(p.timer);p.reject(new Error("CI worker exited before expected event."));}
      resolve();
    }));
    child.on("message",message=>{
      if(message.event==="paid-post")paid++;
      if(message.event==="provider-held"){providerHolds++;if(holdWaiter&&providerHolds>=holdWaiter.count)holdWaiter.resolve();}
      if(message.reply){const p=pending.get(message.reply);if(p){pending.delete(message.reply);clearTimeout(p.timer);message.ok?p.resolve(message):p.reject(new Error("CI worker command failed."));}}
      else if(message.event){
        const p=waiting.get(message.event);
        if(p){waiting.delete(message.event);clearTimeout(p.timer);p.resolve(message);}else events.push(message);
      }
    });
    const api={name,child,
      event(type){
        const index=events.findIndex(e=>e.event===type);
        if(index>=0)return Promise.resolve(events.splice(index,1)[0]);
        if(closed)return Promise.reject(new Error("CI worker is closed."));
        return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{waiting.delete(type);reject(new Error("CI worker event timed out: "+type));},15000);waiting.set(type,{resolve,reject,timer});});
      },
      command(command,data={}){
        if(closed)return Promise.reject(new Error("CI worker is closed."));
        const id=uuid();return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(new Error("CI worker command timed out."));},15000);pending.set(id,{resolve,reject,timer});child.send({id,command,...data});});
      },
      async config(mode="ok",status="RUNNING"){await api.command("config",{mode,status});},
      async call(route,body){
        const response=await fetch("http://127.0.0.1:"+port+"/video"+route,{method:body?"POST":"GET",
          headers:{Authorization:"Bearer "+MOCK_VIDEO_TOKEN,"Content-Type":"application/json"},
          ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000),redirect:"error"});
        return {code:response.status,data:await response.json()};
      },
      async upload(){
        const response=await fetch("http://127.0.0.1:"+port+"/video/upload",{method:"POST",
          headers:{Authorization:"Bearer "+MOCK_VIDEO_TOKEN,"Content-Type":"video/mp4","X-Scene-Duration":"999"},
          body:testMp4(12),signal:AbortSignal.timeout(20000),redirect:"error"});
        assert.equal(response.status,200,"Offline upload failed");return (await response.json()).uploadId;
      },
      async stop(crash=false){
        if(closed)return;
        if(crash)child.kill("SIGKILL");else await api.command("stop");
        await Promise.race([gone,new Promise((_,reject)=>{const timer=setTimeout(()=>{child.kill("SIGKILL");reject(new Error("CI worker stop timed out."));},5000);gone.then(()=>clearTimeout(timer));})]);
      }
    };
    children.add(api);
    const ready=await api.event("ready");port=ready.port;return api;
  }
  const sql=(text,params)=>admin.query(text,params);
  const request=id=>sql(`SELECT * FROM ${schema}.scene_video_request WHERE id=$1`,[id]).then(r=>r.rows[0]);
  const body=uploadId=>({uploadId,requestId:uuid(),plan:{look:"Day for Night",lights:[]},confirmPaidGeneration:true});
  let a,b;
  const reset=async()=>{
    await Promise.all([a.config(),b.config()]);
    await sql(`TRUNCATE ${schema}.scene_video_request,${schema}.scene_video_upload`);
    paid=0;providerHolds=0;
  };
  const paidCount=async()=>{await Promise.all([...children].map(w=>w.command("stats")));return paid;};
  try{
    await sql(`CREATE SCHEMA ${schema}`);
    const client=await admin.connect();
    try{await client.query("BEGIN");await client.query(`SET LOCAL search_path=${schema}`);await client.query(VIDEO_JOB_SCHEMA);await client.query("COMMIT");}
    catch(error){await client.query("ROLLBACK").catch(()=>{});throw error;}finally{client.release();}
    a=await instance();b=await instance();
    await test("real PostgreSQL: two processes and independent connection pools",async t=>{
      assert.notEqual(a.child.pid,b.child.pid);
      const connections=await sql("SELECT DISTINCT application_name FROM pg_stat_activity WHERE application_name=ANY($1::text[]) AND datname='lightingai_ci_test'",[[a.name,b.name]]);
      assert.equal(connections.rows.length,2,"Both processes must have independent real PostgreSQL connections");
      await t.test("real SSI conflict reproduces the old receipt-write isolation failure",async()=>{
        await reset();const ids=[uuid(),uuid()],tasks=[uuid(),uuid()];
        for(const id of ids)await sql(`INSERT INTO ${schema}.scene_video_request(id,upload_id,status,expires_at) VALUES($1,$2,'SUBMITTING',now()+interval '7 days')`,[id,uuid()]);
        const clients=[];
        try{
          for(let i=0;i<2;i++){
            const c=await admin.connect();clients.push(c);
            await c.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
            await c.query(`SET LOCAL search_path=${schema}`);
            // Deterministic overlapping read sets, not a fabricated SQLSTATE.
            await c.query("SELECT id,task_id,status FROM scene_video_request");
          }
          const outcomes=await Promise.all(clients.map(async(c,i)=>{
            try{
              await c.query("UPDATE scene_video_request SET task_id=$2,status='PENDING' WHERE id=$1 AND status='SUBMITTING'",[ids[i],tasks[i]]);
              await c.query("COMMIT");return "committed";
            }catch(error){await c.query("ROLLBACK");return error.code;}
          }));
          assert.equal(outcomes.filter(x=>x==="40001").length,1);
          assert.equal(outcomes.filter(x=>x==="committed").length,1);
        }finally{
          for(const c of clients){await c.query("ROLLBACK").catch(()=>{});c.release();}
        }
        assert.equal((await sql(`SELECT count(*)::int AS count FROM ${schema}.scene_video_request WHERE task_id IS NOT NULL`)).rows[0].count,1);
      });
      await t.test("concurrent same request is charged once and reconciles identically",async()=>{
        await reset();const input=body(await a.upload());
        const results=await Promise.all(Array.from({length:8},(_,i)=>(i%2?a:b).call("/start",input)));
        assert.ok(results.every(r=>[200,409].includes(r.code)));assert.ok(results.some(r=>r.code===200));
        assert.equal(await paidCount(),1);
        const receipt=await request(input.requestId);assert.ok(receipt.task_id);
        assert.equal((await b.call("/request/"+input.requestId)).data.taskId,receipt.task_id);
        assert.equal((await b.call("/start",input)).data.taskId,receipt.task_id);assert.equal(await paidCount(),1);
      });
      await t.test("one upload cannot fund independent concurrent requests",async()=>{
        await reset();const upload=await a.upload();
        const results=await Promise.all([a.call("/start",body(upload)),b.call("/start",body(upload))]);
        assert.equal(results.filter(r=>r.code===200).length,1);assert.ok(results.some(r=>[409,410].includes(r.code)));
        assert.equal(await paidCount(),1);
      });
      await t.test("three concurrent reservations share exactly two slots across processes",async()=>{
        await reset();const uploads=await Promise.all([a.upload(),b.upload(),a.upload()]);
        await Promise.all([a.config("hold-provider"),b.config("hold-provider")]);
        const pending=uploads.map((upload,i)=>(i===1?b:a).call("/start",body(upload)).catch(()=>({code:0})));
        try{
          assert.equal((await Promise.race(pending)).code,429,"A third concurrent reservation must fail before any third provider call");
          await waitProviderHolds(2);assert.equal(await paidCount(),2);
        }
        finally{await Promise.all([a.command("release-provider"),b.command("release-provider")]);}
        const results=await Promise.all(pending);
        assert.equal(results.filter(r=>r.code===200).length,2);assert.equal(results.filter(r=>r.code===429).length,1);
      });
      await t.test("application restart recovers upload and task without provider replay",async()=>{
        await reset();const input=body(await a.upload());await a.stop();a=await instance();
        const result=await a.call("/start",input);assert.equal(result.code,200);
        await a.stop();a=await instance();
        assert.equal((await a.call("/request/"+input.requestId)).data.taskId,result.data.taskId);
        assert.equal((await a.call("/status/"+result.data.taskId)).data.status,"RUNNING");
        assert.equal((await a.call("/start",input)).data.reused,true);assert.equal(await paidCount(),1);
      });
      await t.test("server 40001 after provider acceptance retries only DB and recovers after restart",async()=>{
        await reset();const input=body(await a.upload());await a.config("submitted-conflict");
        const result=await a.call("/start",input);assert.equal(result.code,200);
        assert.equal((await a.command("stats")).dbFaults,1);assert.equal(await paidCount(),1);
        await a.stop();a=await instance();
        assert.equal((await a.call("/request/"+input.requestId)).data.taskId,result.data.taskId);
        assert.equal((await b.call("/start",input)).data.reused,true);assert.equal(await paidCount(),1);
      });
      await t.test("persistent server 40001 is bounded and cannot recharge after restart",async()=>{
        await reset();const input=body(await a.upload());await a.config("submitted-conflict-always");
        assert.equal((await a.call("/start",input)).code,409);assert.equal((await a.command("stats")).dbFaults,3);
        assert.equal((await request(input.requestId)).status,"UNKNOWN");
        await a.stop();a=await instance();
        assert.equal((await b.call("/request/"+input.requestId)).data.requiresReview,true);
        assert.equal((await a.call("/start",input)).code,409);assert.equal(await paidCount(),1);
      });
      await t.test("terminated database connection rolls back a reservation before a provider call",async()=>{
        await reset();const input=body(await a.upload());await a.config("hold-reservation");
        const pending=a.call("/start",input),held=await a.event("reservation-held");
        const terminated=await sql("SELECT pg_terminate_backend(pid) AS terminated FROM pg_stat_activity WHERE pid=$1 AND application_name=$2 AND datname='lightingai_ci_test'",[held.pid,a.name]);
        assert.equal(terminated.rows.length,1);assert.equal(terminated.rows[0].terminated,true);
        await a.command("release-reservation");const result=await pending;
        assert.ok(result.code>=400);assert.equal(await paidCount(),0);assert.equal(await request(input.requestId),undefined);
        await a.stop();a=await instance();
        assert.equal((await a.call("/start",input)).code,200);assert.equal(await paidCount(),1);
      });
      await t.test("connection loss after provider acceptance preserves an unresolved durable reservation",async()=>{
        await reset();const input=body(await a.upload());await a.config("hold-provider");
        const pending=a.call("/start",input);await a.event("provider-held");
        await a.command("disconnect");await a.command("release-provider");
        assert.equal((await pending).code,409);assert.equal((await request(input.requestId)).status,"SUBMITTING");
        await a.stop();a=await instance();assert.equal((await a.call("/start",input)).code,409);assert.equal(await paidCount(),1);
      });
      await t.test("process death during provider call never recharges after restart",async()=>{
        await reset();const input=body(await a.upload());await a.config("hold-provider");
        const pending=a.call("/start",input).then(r=>r,()=>null);await a.event("provider-held");
        assert.equal((await request(input.requestId)).status,"SUBMITTING");await a.stop(true);await pending;
        a=await instance();const recovered=await a.call("/request/"+input.requestId);
        assert.equal(recovered.code,409);assert.equal(recovered.data.requiresReview,true);
        assert.equal((await a.call("/start",input)).code,409);assert.equal(await paidCount(),1);
      });
      for(const mode of ["timeout","invalid"]){
        await t.test(mode+" provider outcome remains blocked through restart and expiration",async()=>{
          await reset();const input=body(await a.upload());await a.config(mode);
          assert.equal((await a.call("/start",input)).code,409);assert.equal((await request(input.requestId)).status,"UNKNOWN");
          await sql(`UPDATE ${schema}.scene_video_request SET expires_at=now()-interval '30 days'`);
          await sql(`UPDATE ${schema}.scene_video_upload SET expires_at=now()-interval '30 days'`);
          await a.stop();a=await instance();assert.equal((await a.call("/start",input)).code,409);
          assert.equal((await request(input.requestId)).status,"UNKNOWN");assert.equal(await paidCount(),1);
        });
      }
      for(const status of ["SUCCEEDED","FAILED","CANCELED"]){
        await t.test(status+" refresh releases capacity across instances",async()=>{
          await reset();assert.equal((await a.call("/start",body(await a.upload()))).code,200);
          assert.equal((await b.call("/start",body(await b.upload()))).code,200);
          await Promise.all([a.config("ok",status),b.config("ok",status)]);
          assert.equal((await b.call("/start",body(await a.upload()))).code,200);assert.equal(await paidCount(),3);
        });
      }
      await t.test("unavailable or unknown task status blocks new paid starts",async()=>{
        await reset();await a.call("/start",body(await a.upload()));const input=body(await b.upload());
        await b.config("ok","UNRECOGNIZED");assert.equal((await b.call("/start",input)).code,502);
        await b.config("status-error");const result=await b.call("/start",input);
        assert.ok(result.code>=400);assert.ok(!JSON.stringify(result).includes("private"));assert.equal(await paidCount(),1);
      });
      await t.test("two unresolved requests retain all capacity; expiry never permits recharge",async()=>{
        await reset();await Promise.all([a.config("timeout"),b.config("timeout")]);
        const first=body(await a.upload()),second=body(await b.upload());
        assert.equal((await a.call("/start",first)).code,409);assert.equal((await b.call("/start",second)).code,409);
        await sql(`UPDATE ${schema}.scene_video_request SET expires_at=now()-interval '30 days'`);
        assert.equal((await b.call("/start",body(await b.upload()))).code,429);assert.equal(await paidCount(),2);
      });
      await t.test("expired terminal receipt is recoverable but cannot restart or resurrect",async()=>{
        await reset();const input=body(await a.upload()),result=await a.call("/start",input);
        await a.config("ok","SUCCEEDED");await a.call("/status/"+result.data.taskId);
        await sql(`UPDATE ${schema}.scene_video_request SET expires_at=now()-interval '1 day'`);
        assert.equal((await b.call("/start",input)).code,410);
        assert.equal((await b.call("/request/"+input.requestId)).data.status,"EXPIRED");
        await b.command("stale-status",{taskId:result.data.taskId});
        assert.equal((await request(input.requestId)).status,"EXPIRED");
        assert.equal((await request(input.requestId)).output_url,null);assert.equal(await paidCount(),1);
      });
    });
  }finally{
    await Promise.allSettled([...children].map(w=>w.stop(true)));
    // Validated random schema in the dedicated CI database only. No production objects.
    await sql(`DROP SCHEMA IF EXISTS ${testSchema(schema)} CASCADE`).finally(()=>admin.end());
  }
}

await preflight();
if(process.argv[2]!=="--preflight"){
  try{await integration();}
  catch{console.error("Real PostgreSQL integration failed; inspect the failed test assertions. No private database/provider details are emitted.");process.exitCode=1;}
}
