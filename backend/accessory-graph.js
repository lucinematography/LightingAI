export function normalizeCompatibilityStatus(value = '') {
  return String(value).trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

export function isBlockedCompatibilityStatus(value = '') {
  const status = normalizeCompatibilityStatus(value);
  return status === 'do not use' || status === 'incompatible' || status === 'not compatible' || status === 'unsupported';
}

function normalizeConditions(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [String(value)];
}

export function accessoryRecord(accessory, fixtureId = null, depth = 1, parentIds = []) {
  const fixtureCompatibility = fixtureId ? accessory.compatibility?.[fixtureId] : null;
  return {
    id: accessory.id,
    manufacturer: accessory.manufacturer,
    model: accessory.model,
    category: accessory.category || null,
    status: fixtureCompatibility?.status || accessory.compatibilityStatus || 'Compatible',
    availability: accessory.includedWithFixture === true ? 'included' : 'optional',
    conditions: [...new Set([
      ...normalizeConditions(accessory.conditions),
      ...normalizeConditions(fixtureCompatibility?.conditions)
    ])],
    mount: accessory.mount || null,
    effectOnLight: accessory.effectOnLight || null,
    sourceUrl: accessory.sourceUrl || null,
    depth,
    parentIds
  };
}

export function buildAccessoryTree(fixtureId, catalog) {
  if (!catalog.fixtureById.get(fixtureId)) return [];
  const reachable = new Set([fixtureId]);
  const depth = new Map([[fixtureId, 0]]);
  const discovered = new Map();
  let changed = true;

  while (changed) {
    changed = false;
    for (const accessory of catalog.accessories) {
      const directMeta = accessory.compatibility?.[fixtureId];
      if (isBlockedCompatibilityStatus(directMeta?.status)) continue;
      const parents = (accessory.compatibleWith || []).filter(id => reachable.has(id));
      if (!parents.length) continue;
      const candidateDepth = Math.min(...parents.map(id => (depth.get(id) ?? 0) + 1));
      if (!reachable.has(accessory.id)) {
        reachable.add(accessory.id);
        depth.set(accessory.id, candidateDepth);
        changed = true;
      } else if (candidateDepth < (depth.get(accessory.id) ?? Infinity)) {
        depth.set(accessory.id, candidateDepth);
        changed = true;
      }
      discovered.set(accessory.id, accessory);
    }
  }

  return [...discovered.values()].map(accessory => {
    const d = depth.get(accessory.id) || 1;
    const parentIds = (accessory.compatibleWith || []).filter(id => reachable.has(id) && ((depth.get(id) ?? -1) < d));
    return accessoryRecord(accessory, d === 1 ? fixtureId : null, d, parentIds);
  }).sort((a, b) => a.depth - b.depth || a.model.localeCompare(b.model));
}
