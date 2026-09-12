import { FIXTURE_LIBRARY } from './fixture-library.js';
import { ACCESSORY_LIBRARY } from './accessory-library.js';
import { ADDITIONAL_ACCESSORY_LIBRARY } from './additional-accessory-library.js';
import { applyAccessoryCompatibilityOverrides } from './accessory-compatibility-overrides.js';

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function unique(values = []) { return [...new Set(values)]; }

function mergeAccessory(base, extra) {
  const merged = { ...base, ...extra };
  merged.compatibleWith = unique([...(base.compatibleWith || []), ...(extra.compatibleWith || [])]);
  merged.compatibility = { ...(base.compatibility || {}), ...(extra.compatibility || {}) };
  // Keep the canonical/base descriptive fields unless the base omitted them.
  for (const key of ['manufacturer','model','category','mount','effectOnLight','sourceUrl']) {
    if (base[key] != null) merged[key] = base[key];
  }
  if (base.includedWithFixture != null) merged.includedWithFixture = base.includedWithFixture;
  return merged;
}

export function buildRuntimeCatalog() {
  const fixtures = clone(FIXTURE_LIBRARY);
  const accessoryDefinitions = [...clone(ACCESSORY_LIBRARY), ...clone(ADDITIONAL_ACCESSORY_LIBRARY)];
  const duplicateAccessoryIds = [];
  const accessoriesById = new Map();
  for (const accessory of accessoryDefinitions) {
    const existing = accessoriesById.get(accessory.id);
    if (existing) {
      duplicateAccessoryIds.push(accessory.id);
      accessoriesById.set(accessory.id, mergeAccessory(existing, accessory));
    } else accessoriesById.set(accessory.id, accessory);
  }
  const accessories = [...accessoriesById.values()];
  applyAccessoryCompatibilityOverrides(accessories);
  return {
    fixtures,
    accessories,
    sourceAccessoryDefinitions: accessoryDefinitions,
    duplicateAccessoryIds: [...new Set(duplicateAccessoryIds)],
    fixtureById: new Map(fixtures.map(f => [f.id, f])),
    accessoryById: new Map(accessories.map(a => [a.id, a]))
  };
}

export const RUNTIME_CATALOG = buildRuntimeCatalog();
