import pg from "pg";

export const ACTIVE_VIDEO_STATES=["SUBMITTING","UNKNOWN","PENDING","THROTTLED","RUNNING"];
const failure=(message,status=503)=>Object.assign(new Error(message),{status});
// No private media, prompts, credentials or raw provider responses belong here.
export const VIDEO_JOB_SCHEMA=`
CREATE TABLE IF NOT EXISTS scene_video_gate (id integer PRIMARY KEY CHECK (id=1));
INSERT INTO scene_video_gate VALUES (1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS scene_video_upload (
 id uuid PRIMARY KEY, uri text, seconds double precision NOT NULL CHECK(seconds BETWEEN 2 AND 30),
 expires_at timestamptz NOT NULL, request_id uuid UNIQUE);
CREATE TABLE IF NOT EXISTS scene_video_request (
 id uuid PRIMARY KEY, upload_id uuid NOT NULL UNIQUE, task_id uuid UNIQUE,
 status text NOT NULL CHECK(status IN ('SUBMITTING','UNKNOWN','PENDING','THROTTLED','RUNNING','SUCCEEDED','FAILED','CANCELED','EXPIRED')),
 expires_at timestamptz NOT NULL, output_url text);
CREATE INDEX IF NOT EXISTS scene_video_active ON scene_video_request(status);
CREATE INDEX IF NOT EXISTS scene_video_upload_expiry ON scene_video_upload(expires_at);
`;

export function videoPoolOptions(env){
  const connectionString=env.SCENE_PLANNER_VIDEO_DATABASE_URL;
  if(!connectionString)return null;
  let url;
  try{url=new URL(connectionString);}catch{throw failure("Invalid video storage configuration.");}
  if(!["postgres:","postgresql:"].includes(url.protocol)||!url.hostname)
    throw failure("Invalid video storage configuration.");
  // Only explicitly configured private networking may omit TLS. Never disable certificate validation.
  // Connection-string query options must not override TLS validation or query timeouts.
  url.search="";
  return {connectionString:url.toString(),options:"-c synchronous_commit=on",max:4,connectionTimeoutMillis:3000,
    idleTimeoutMillis:10000,statement_timeout:5000,query_timeout:6000,
    idle_in_transaction_session_timeout:5000,
    ssl:env.SCENE_PLANNER_VIDEO_DATABASE_TLS==="internal"?false:{rejectUnauthorized:true}};
}

export class PostgresVideoJobStore {
  constructor(pool){this.pool=pool;this.durable=true;}
  async ready(){
    // Deployment must apply VIDEO_JOB_SCHEMA explicitly. Runtime never silently creates a database/schema.
    const result=await this.pool.query("SELECT id FROM scene_video_gate WHERE id=1");
    if(result.rows.length!==1)throw failure("Video storage is not ready.");
    await this.pool.query("SELECT id,uri,seconds,expires_at,request_id FROM scene_video_upload LIMIT 0");
    await this.pool.query("SELECT id,upload_id,task_id,status,expires_at,output_url FROM scene_video_request LIMIT 0");
  }
  async transaction(action){
    // DB-only callbacks: never place provider calls inside this retry boundary.
    // 40001 proves the transaction aborted; transport/COMMIT ambiguity does not.
    for(let attempt=0;attempt<3;attempt++){
      const client=await this.pool.connect();
      try{
        // A fresh snapshot after acquiring the gate is essential for cross-replica limits.
        await client.query("BEGIN ISOLATION LEVEL READ COMMITTED");
        await client.query("SET LOCAL synchronous_commit=on");
        const gate=await client.query("SELECT id FROM scene_video_gate WHERE id=1 FOR UPDATE");
        if(gate.rows.length!==1)throw failure("Video storage is not ready.");
        const result=await action(client);
        await client.query("COMMIT");
        return result;
      }catch(error){
        const rolledBack=await client.query("ROLLBACK").then(()=>true,()=>false);
        if(error.code!=="40001"||!rolledBack||attempt===2)throw error;
      }
      finally{client.release();}
      await new Promise(resolve=>setTimeout(resolve,25*(attempt+1)));
    }
  }
  async prune(){
    await this.transaction(async c=>{
      // Consumed uploads may be deleted too: their identifiers remain UNIQUE in request tombstones.
      await c.query("DELETE FROM scene_video_upload WHERE expires_at<=now()");
      // Minimal request/upload tombstones are retained: expiring idempotency keys could cause a second charge.
      // Unresolved or running requests never expire into a free slot.
      await c.query("UPDATE scene_video_request SET status='EXPIRED',output_url=NULL WHERE expires_at<=now() AND status IN ('SUCCEEDED','FAILED','CANCELED')");
    });
  }
  async addUpload(id,uri,seconds){
    return this.transaction(async c=>{
      const r=await c.query("INSERT INTO scene_video_upload(id,uri,seconds,expires_at) VALUES($1,$2,$3,now()+interval '1 hour') RETURNING expires_at",[id,uri,seconds]);
      return r.rows[0];
    });
  }
  async request(id){return (await this.pool.query("SELECT * FROM scene_video_request WHERE id=$1",[id])).rows[0];}
  async upload(id){return (await this.pool.query("SELECT * FROM scene_video_upload WHERE id=$1 AND expires_at>now()",[id])).rows[0];}
  async task(id){return (await this.pool.query("SELECT * FROM scene_video_request WHERE task_id=$1",[id])).rows[0];}
  async active(){return (await this.pool.query("SELECT * FROM scene_video_request WHERE status=ANY($1::text[])",[ACTIVE_VIDEO_STATES])).rows;}
  async reserve(id,uploadId){
    return this.transaction(async c=>{
      const prior=(await c.query("SELECT * FROM scene_video_request WHERE id=$1",[id])).rows[0];
      if(prior){
        if(prior.upload_id!==uploadId)throw failure("Request identifier belongs to another upload.",409);
        return {prior};
      }
      const upload=(await c.query("SELECT * FROM scene_video_upload WHERE id=$1 AND expires_at>now()",[uploadId])).rows[0];
      if(!upload||upload.request_id)throw failure("Uploaded video has expired or is already reserved.",410);
      const count=(await c.query("SELECT count(*)::int AS count FROM scene_video_request WHERE status=ANY($1::text[])",[ACTIVE_VIDEO_STATES])).rows[0].count;
      if(count>=2)throw failure("Two AI video jobs are already in progress or need review.",429);
      await c.query("INSERT INTO scene_video_request(id,upload_id,status,expires_at) VALUES($1,$2,'SUBMITTING',now()+interval '7 days')",[id,uploadId]);
      await c.query("UPDATE scene_video_upload SET request_id=$2 WHERE id=$1",[uploadId,id]);
      return {upload};
    });
  }
  async submitted(id,taskId){
    return this.transaction(async c=>{
      const prior=(await c.query("SELECT * FROM scene_video_request WHERE id=$1",[id])).rows[0];
      // Reconcile identical durable receipts; never overwrite a different task or a terminal state.
      if(prior?.task_id===taskId)return;
      if(!prior||prior.task_id||prior.status!=="SUBMITTING")throw failure("Video task receipt was not persisted.");
      const result=await c.query("UPDATE scene_video_request SET task_id=$2,status='PENDING' WHERE id=$1 AND status='SUBMITTING' AND task_id IS NULL",[id,taskId]);
      if(result.rowCount!==1&&result.affectedRows!==1)throw failure("Video task receipt was not persisted.");
    });
  }
  async unknown(id){return this.transaction(c=>c.query("UPDATE scene_video_request SET status='UNKNOWN' WHERE id=$1 AND task_id IS NULL AND status='SUBMITTING'",[id]));}
  async updateTask(id,status,outputURL){
    // Concurrent stale polls cannot turn a terminal task back into an active one.
    return this.transaction(c=>c.query("UPDATE scene_video_request SET status=$2,output_url=$3 WHERE task_id=$1 AND status NOT IN ('SUCCEEDED','FAILED','CANCELED','EXPIRED')",[id,status,outputURL||null]));
  }
  async close(){await this.pool.end();}
}

export function createVideoJobStore(env=process.env){
  const options=videoPoolOptions(env);
  if(!options)return null;
  const pool=new pg.Pool(options);
  pool.on("error",()=>{}); // Do not print credentials, queries or private provider URLs.
  return new PostgresVideoJobStore(pool);
}
