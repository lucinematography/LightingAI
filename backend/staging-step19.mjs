import {applyStep16Lock} from './staging-access.js';
applyStep16Lock();
const mode=process.env.LIGHTINGAI_STAGE_PG_PREFLIGHT||'off';
if(mode!=='off') {
  const {runPostgresPreflight}=await import('./staging-postgres-preflight.mjs');
  await runPostgresPreflight(mode);
}
await import('./render-bootstrap.js');
