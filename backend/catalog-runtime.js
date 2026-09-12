import { FIXTURE_LIBRARY } from './fixture-library.js';
import { ACCESSORY_LIBRARY } from './accessory-library.js';
import { ADDITIONAL_ACCESSORY_LIBRARY } from './additional-accessory-library.js';
import { applyAccessoryCompatibilityOverrides } from './accessory-compatibility-overrides.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function buildRuntimeCatalog() {
  const fixtures = clone(FIXTURE_LIBRARY);
  const accessoryDefinitions = [...clone(ACCESSORY_LIBRARY), ...clone(ADDITIONAL_ACCESSORY_LIBRARY)];
  const duplicateAccessoryIds = [];
  const accessoriesById = new Map();
  for (const accessory of accessoryDefinitions) {
    if (accessoriesById.has(accessory.id)) duplicateAccessoryIds.push(accessory.id);
    else accessoriesById.set(accessory.id, accessory);
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
