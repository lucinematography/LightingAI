import pg from 'pg';
const {Pool}=pg;
const unavailable=()=>Object.assign(new Error('STAGING_STORE_UNAVAILABLE'),{code:'STAGING_STORE_UNAVAILABLE'});
const refused=code=>Object.assign(new Error(code),{code});
// No DDL, grant creation, fallback store, refund, or automatic retry here.
export class PostgresAttemptStore {
  constructor(pool,testId,identity={database:'lightingai_stage17_test',role:'lightingai_stage17_runtime'}) {
    if(!/^[A-Za-z0-9_-]{8,100}$/.test(testId||''))throw new Error('STAGING_TEST_ID_INVALID');
    this.pool=pool;this.testId=testId;this.identity=identity;
  }
  async consume(payloadHash) {
    if(!/^[a-f0-9]{64}$/.test(payloadHash||''))throw unavailable();
    let client;let began=false;let committed=false;let discard=false;
    try {
      client=await this.pool.connect();
      await client.query('BEGIN');began=true;
      await client.query("SET LOCAL lock_timeout = '3s'");
      await client.query("SET LOCAL statement_timeout = '5s'");
      await client.query('SET LOCAL synchronous_commit = on');
      const identity=await client.query('SELECT current_database() AS database, current_user AS role');
      if(identity.rows[0]?.database!==this.identity.database||identity.rows[0]?.role!==this.identity.role)throw unavailable();
      // READ COMMITTED + row lock: a waiter observes the committed spent state.
      const result=await client.query('SELECT payload_sha256, state FROM lightingai_stage17.ai_test_attempt WHERE test_id = $1 FOR UPDATE',[this.testId]);
      if(result.rows.length!==1)throw refused('STAGING_APPROVAL_MISSING');
      const row=result.rows[0];
      if(row.payload_sha256!==payloadHash)throw refused('STAGING_APPROVAL_MISMATCH');
      if(row.state!=='approved')throw refused('STAGING_ATTEMPT_SPENT');
      const changed=await client.query("UPDATE lightingai_stage17.ai_test_attempt SET state = 'spent', spent_at = clock_timestamp() WHERE test_id = $1 AND state = 'approved' AND payload_sha256 = $2 RETURNING test_id",[this.testId,payloadHash]);
      if(changed.rowCount!==1)throw unavailable();
      await client.query('COMMIT');committed=true;
      // The caller may contact its provider ONLY after this resolves.
    } catch(error) {
      discard=true;
      if(client&&began&&!committed) {try{await client.query('ROLLBACK');}catch{}}
      if(['STAGING_ATTEMPT_SPENT','STAGING_APPROVAL_MISSING','STAGING_APPROVAL_MISMATCH'].includes(error.code))throw error;
      // A lost COMMIT acknowledgement is NOT an admission. Never retry here.
      throw unavailable();
    } finally {
      if(client)client.release(discard);
    }
  }
}
export function expectedDatabaseIdentity(env=process.env) {
  const database=env.LIGHTINGAI_STAGE_DB_EXPECTED_NAME;
  const host=env.LIGHTINGAI_STAGE_DB_EXPECTED_HOST;
  if(!/^[a-z][a-z0-9_]{0,62}$/i.test(database||'')||!host||!/^(?:dpg-[a-z0-9-]+|localhost|127\.0\.0\.1|\[::1\])$/.test(host))throw unavailable();
  return {database,role:'lightingai_stage17_runtime',host};
}
export function postgresPoolConfig(env=process.env) {
  const value=env.LIGHTINGAI_STAGE_DATABASE_URL;
  if(!value)throw unavailable();
  let url;try{url=new URL(value);}catch{throw unavailable();}
  const expected=expectedDatabaseIdentity(env);
  // Pin the dedicated existing database and host via protected environment config.
  if(!['postgres:','postgresql:'].includes(url.protocol)||decodeURIComponent(url.pathname)!=='/'+expected.database||decodeURIComponent(url.username)!==expected.role||url.hostname!==expected.host||(url.port&&url.port!=='5432')||url.search||url.hash)throw unavailable();
  const mode=env.LIGHTINGAI_STAGE_DB_TRANSPORT||'verify-full';
  let ssl;
  if(mode==='verify-full')ssl={rejectUnauthorized:true};
  else if(mode==='loopback-test'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))ssl=false;
  // Render internal certificates are self-signed: require encrypted transport,
  // with no plaintext fallback. This mode does not authenticate the certificate.
  else if(mode==='render-internal-tls'&&/^dpg-[a-z0-9-]+$/.test(url.hostname))ssl={rejectUnauthorized:false,minVersion:'TLSv1.2'};
  else throw unavailable();
  return {connectionString:value,ssl,max:2,connectionTimeoutMillis:3000,idleTimeoutMillis:10000,query_timeout:7000,application_name:'lightingai-stage17-one-attempt'};
}
export function createPostgresAttemptStore(env=process.env) {
  let pool;
  try {
    pool=new Pool(postgresPoolConfig(env));
    pool.on('error',()=>{}); // Admission queries fail closed; never log credentials.
  } catch {
    pool={connect:async()=>{throw unavailable();}};
  }
  let identity;try{identity=expectedDatabaseIdentity(env);}catch{identity={database:'',role:''};}
  return new PostgresAttemptStore(pool,env.LIGHTINGAI_STAGE_TEST_ID,identity);
}
