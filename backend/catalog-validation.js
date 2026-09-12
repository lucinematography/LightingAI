import { RUNTIME_CATALOG } from './catalog-runtime.js';

const VALID_STATUSES = new Set(['Compatible','Designed For','Compatible but not optimized','Do Not Use']);

export function validateCatalog(catalog = RUNTIME_CATALOG) {
  const fixtures = catalog.fixtures;
  const accessories = catalog.accessories;
  const errors = [];
  const warnings = [];
  const duplicateIds = items => { const seen=new Set(), dup=new Set(); for(const item of items){if(!item?.id)continue;if(seen.has(item.id))dup.add(item.id);seen.add(item.id);} return [...dup]; };

  for (const id of duplicateIds(fixtures)) errors.push(`Duplicate fixture id: ${id}`);
  for (const id of duplicateIds(catalog.sourceAccessoryDefinitions || accessories)) errors.push(`Duplicate accessory source definition: ${id}`);

  const fixtureIds=new Set(fixtures.map(f=>f.id));
  const accessoryIds=new Set(accessories.map(a=>a.id));
  const knownIds=new Set([...fixtureIds,...accessoryIds]);

  for(const fixture of fixtures){
    if(!fixture.id||!fixture.manufacturer||!fixture.model) errors.push(`Malformed fixture record: ${fixture.id||fixture.model||'unknown'}`);
    if(fixture.powerDrawW!=null&&fixture.powerDrawW<=0) errors.push(`Invalid power draw: ${fixture.id}`);
    if(fixture.outputPowerW!=null&&fixture.outputPowerW<=0) errors.push(`Invalid output power: ${fixture.id}`);
    if(fixture.outputPowerW!=null&&fixture.powerDrawW!=null&&fixture.outputPowerW>fixture.powerDrawW) warnings.push(`Output power exceeds power draw: ${fixture.id}`);
    if(fixture.cctK&&(fixture.cctK.min<=0||fixture.cctK.max<fixture.cctK.min)) errors.push(`Invalid CCT range: ${fixture.id}`);
    if(fixture.cri!=null&&(fixture.cri<0||fixture.cri>100)) errors.push(`Invalid CRI: ${fixture.id}`);
    if(fixture.tlci!=null&&(fixture.tlci<0||fixture.tlci>100)) errors.push(`Invalid TLCI: ${fixture.id}`);
    if(!fixture.sourceUrl) warnings.push(`Fixture has no source URL: ${fixture.id}`);
  }

  for(const accessory of accessories){
    if(!accessory.id||!accessory.manufacturer||!accessory.model) errors.push(`Malformed accessory record: ${accessory.id||accessory.model||'unknown'}`);
    if(accessory.compatibilityStatus&&!VALID_STATUSES.has(accessory.compatibilityStatus)) warnings.push(`Unknown compatibility status: ${accessory.id} = ${accessory.compatibilityStatus}`);
    const targets=accessory.compatibleWith||[];
    if(new Set(targets).size!==targets.length) errors.push(`Duplicate compatibility target on ${accessory.id}`);
    for(const targetId of targets){if(!knownIds.has(targetId)) errors.push(`Broken compatibility link: ${accessory.id} -> ${targetId}`);if(targetId===accessory.id) errors.push(`Self-referencing accessory: ${accessory.id}`);}
    for(const [targetId,metadata] of Object.entries(accessory.compatibility||{})){
      if(!knownIds.has(targetId)) errors.push(`Broken compatibility metadata link: ${accessory.id} -> ${targetId}`);
      if(!targets.includes(targetId)) errors.push(`Compatibility metadata without compatibleWith link: ${accessory.id} -> ${targetId}`);
      if(metadata?.status&&!VALID_STATUSES.has(metadata.status)) warnings.push(`Unknown per-fixture status: ${accessory.id} -> ${targetId} = ${metadata.status}`);
      if(metadata?.status==='Do Not Use'&&targets.includes(targetId)) warnings.push(`Do Not Use target remains linked and must be filtered at runtime: ${accessory.id} -> ${targetId}`);
    }
    if(accessory.beamAngleDeg&&(accessory.beamAngleDeg.min<=0||accessory.beamAngleDeg.max<accessory.beamAngleDeg.min)) errors.push(`Invalid accessory beam range: ${accessory.id}`);
    if(accessory.weightKg!=null&&accessory.weightKg<=0) errors.push(`Invalid accessory weight: ${accessory.id}`);
    if(!accessory.sourceUrl) warnings.push(`Accessory has no source URL: ${accessory.id}`);
  }

  const graph=new Map(accessories.map(a=>[a.id,(a.compatibleWith||[]).filter(id=>accessoryIds.has(id))]));
  const visiting=new Set(),visited=new Set();
  function visit(id,path=[]){if(visiting.has(id)){errors.push(`Accessory dependency cycle: ${[...path,id].join(' -> ')}`);return;}if(visited.has(id))return;visiting.add(id);for(const next of graph.get(id)||[])visit(next,[...path,id]);visiting.delete(id);visited.add(id);}
  for(const id of accessoryIds)visit(id);
  const memo=new Map();
  function reachesFixture(id,stack=new Set()){if(memo.has(id))return memo.get(id);if(stack.has(id))return false;const a=catalog.accessoryById?.get(id)||accessories.find(x=>x.id===id);if(!a)return false;const next=new Set(stack);next.add(id);const result=(a.compatibleWith||[]).some(target=>fixtureIds.has(target)||(accessoryIds.has(target)&&reachesFixture(target,next)));memo.set(id,result);return result;}
  for(const id of accessoryIds) if(!reachesFixture(id)) warnings.push(`Accessory has no path to a fixture: ${id}`);

  return {ok:errors.length===0,fixtureCount:fixtures.length,accessoryCount:accessories.length,errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}
