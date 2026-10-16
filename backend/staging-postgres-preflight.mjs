import pg from 'pg';
import {postgresPoolConfig,expectedDatabaseIdentity} from './staging-postgres-attempt-store.js';
export async function runPostgresPreflight(mode,env=process.env) {
  if(!['identity','schema'].includes(mode))throw new Error('STAGING_PREFLIGHT_MODE_INVALID');
  const expected=expectedDatabaseIdentity(env);
  if(env.LIGHTINGAI_STAGE_DB_TRANSPORT!=='render-internal-tls'||!expected.host.startsWith('dpg-'))throw new Error('STAGING_PREFLIGHT_PRIVATE_ONLY');
  const pool=new pg.Pool(postgresPoolConfig(env));pool.on('error',()=>{});
  let client;
  try {
    client=await pool.connect();await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout='5s'");
    const identity=(await client.query('SELECT current_database() AS database,current_user AS role,current_setting(\'server_version_num\')::int AS version')).rows[0];
    if(identity.database!==expected.database||identity.role!==expected.role||identity.version<180000||identity.version>=190000)throw new Error('STAGING_PREFLIGHT_IDENTITY');
    const tls=(await client.query('SELECT ssl,version FROM pg_stat_ssl WHERE pid=pg_backend_pid()')).rows[0];
    if(!tls?.ssl||!['TLSv1.2','TLSv1.3'].includes(tls.version))throw new Error('STAGING_PREFLIGHT_TLS_REQUIRED');
    const role=(await client.query('SELECT rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls,NOT rolcanlogin AS cannot_login FROM pg_roles WHERE rolname=current_user')).rows[0];
    if(!role||Object.values(role).some(Boolean))throw new Error('STAGING_PREFLIGHT_PRIVILEGED_ROLE');
    if((await client.query('SELECT 1 FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname=current_user)')).rowCount)throw new Error('STAGING_PREFLIGHT_ROLE_MEMBERSHIP');
    if((await client.query('SELECT 1 FROM pg_database WHERE datname=current_database() AND datdba=(SELECT oid FROM pg_roles WHERE rolname=current_user)')).rowCount)throw new Error('STAGING_PREFLIGHT_DATABASE_OWNER');
    if(mode==='schema') {
      const migration=(await client.query("SELECT version FROM lightingai_stage17.schema_migration WHERE version='step20-v1'")).rows;
      if(migration.length!==1)throw new Error('STAGING_PREFLIGHT_MIGRATION');
      const table=(await client.query("SELECT c.relowner=(SELECT oid FROM pg_roles WHERE rolname=current_user) AS owned,n.nspowner=(SELECT oid FROM pg_roles WHERE rolname=current_user) AS schema_owned FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='lightingai_stage17' AND c.relname='ai_test_attempt' AND c.relkind='r'")).rows[0];
      if(!table||table.owned||table.schema_owned)throw new Error('STAGING_PREFLIGHT_SCHEMA');
      const rights=(await client.query("SELECT has_table_privilege(current_user,'lightingai_stage17.ai_test_attempt','SELECT') AS can_select,has_column_privilege(current_user,'lightingai_stage17.ai_test_attempt','state','UPDATE') AS can_spend,has_column_privilege(current_user,'lightingai_stage17.ai_test_attempt','spent_at','UPDATE') AS can_stamp,has_any_column_privilege(current_user,'lightingai_stage17.ai_test_attempt','INSERT') AS can_insert,has_table_privilege(current_user,'lightingai_stage17.ai_test_attempt','DELETE') AS can_delete,has_table_privilege(current_user,'lightingai_stage17.ai_test_attempt','TRUNCATE') AS can_truncate,has_column_privilege(current_user,'lightingai_stage17.ai_test_attempt','test_id','UPDATE') AS can_rewrite_id,has_column_privilege(current_user,'lightingai_stage17.ai_test_attempt','payload_sha256','UPDATE') AS can_rewrite_hash,has_column_privilege(current_user,'lightingai_stage17.ai_test_attempt','approved_at','UPDATE') AS can_rewrite_approval,has_schema_privilege(current_user,'lightingai_stage17','CREATE') AS can_create")).rows[0];
      if(!rights.can_select||!rights.can_spend||!rights.can_stamp||Object.entries(rights).some(([k,v])=>!['can_select','can_spend','can_stamp'].includes(k)&&v))throw new Error('STAGING_PREFLIGHT_RIGHTS');
      const trigger=(await client.query("SELECT 1 FROM pg_trigger WHERE tgrelid='lightingai_stage17.ai_test_attempt'::regclass AND tgname='ai_attempt_no_rearm' AND tgenabled='O' AND NOT tgisinternal")).rowCount;
      if(trigger!==1)throw new Error('STAGING_PREFLIGHT_TRIGGER');
    }
    await client.query('COMMIT');
    // No host, logical database, role, URL, row content or credentials in logs.
    console.log(JSON.stringify({kind:'postgres-private-preflight',ok:true,mode,postgresMajor:18,readOnly:true,tlsRequired:true,certificateAuthenticated:false,aiCalls:0}));
  } catch {
    if(client)try{await client.query('ROLLBACK');}catch{}
    throw new Error('STAGING_PG_PREFLIGHT_FAILED');
  } finally {if(client)client.release();await pool.end();}
}
