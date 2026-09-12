import { RUNTIME_CATALOG } from './catalog-runtime.js';

// Validates the exact catalog consumed by the backend after merge + compatibility overrides.
// Raw source definitions are also checked separately so duplicate IDs cannot be hidden by merge deduplication.
export function validateCatalog(catalog = RUNTIME_CATALOG) {
  const fixtures = catalog.fixtures;
  const accessories = catalog.accessories;
  const errors = [];
  const warnings = [];

  const duplicateIds = items => {
    const seen = new Set();
    const duplicates = new Set();
    for (const item of items) {
      if (!item?.id) continue;
      if (seen.has(item.id)) duplicates.add(item.id);
      seen.add(item.id);
    }
    return [...duplicates];
  };

  for (const id of duplicateIds(fixtures)) errors.push(`Duplicate fixture id: ${id}`);
  for (const id of duplicateIds(catalog.sourceAccessoryDefinitions || accessories)) errors.push(`Duplicate accessory source definition: ${id}`);

  const fixtureIds = new Set(fixtures.map(f => f.id));
  const accessoryIds = new Set(accessories.map(a => a.id));
  const knownIds = new Set([...fixtureIds, ...accessoryIds]);

  for (const fixture of fixtures) {
    if (!fixture.id || !fixture.manufacturer || !fixture.model) errors.push(`Malformed fixture record: ${fixture.id || fixture.model || 'unknown'}`);
    if (fixture.powerDrawW != null && fixture.powerDrawW <= 0) errors.push(`Invalid power draw: ${fixture.id}`);
    if (fixture.outputPowerW != null && fixture.outputPowerW <= 0) errors.push(`Invalid output power: ${fixture.id}`);
    if (fixture.cctK && (fixture.cctK.min <= 0 || fixture.cctK.max < fixture.cctK.min)) errors.push(`Invalid CCT range: ${fixture.id}`);
    if (fixture.cri != null && (fixture.cri < 0 || fixture.cri > 100)) errors.push(`Invalid CRI: ${fixture.id}`);
    if (fixture.tlci != null && (fixture.tlci < 0 || fixture.tlci > 100)) errors.push(`Invalid TLCI: ${fixture.id}`);
    if (!fixture.sourceUrl) warnings.push(`Fixture has no source URL: ${fixture.id}`);
  }

  for (const accessory of accessories) {
    if (!accessory.id || !accessory.manufacturer || !accessory.model) errors.push(`Malformed accessory record: ${accessory.id || accessory.model || 'unknown'}`);
    for (const targetId of accessory.compatibleWith || []) {
      if (!knownIds.has(targetId)) errors.push(`Broken compatibility link: ${accessory.id} -> ${targetId}`);
      if (targetId === accessory.id) errors.push(`Self-referencing accessory: ${accessory.id}`);
    }
    for (const targetId of Object.keys(accessory.compatibility || {})) {
      if (!knownIds.has(targetId)) errors.push(`Broken compatibility metadata link: ${accessory.id} -> ${targetId}`);
    }
    if (!accessory.sourceUrl) warnings.push(`Accessory has no source URL: ${accessory.id}`);
  }

  const graph = new Map(accessories.map(a => [a.id, (a.compatibleWith || []).filter(id => accessoryIds.has(id))]));
  const visiting = new Set();
  const visited = new Set();
  function visit(id, path = []) {
    if (visiting.has(id)) { errors.push(`Accessory dependency cycle: ${[...path, id].join(' -> ')}`); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of graph.get(id) || []) visit(next, [...path, id]);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of accessoryIds) visit(id);

  return {ok:errors.length===0,fixtureCount:fixtures.length,accessoryCount:accessories.length,errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}
