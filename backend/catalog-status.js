import { FIXTURE_LIBRARY } from './fixture-library.js';
import { ACCESSORY_LIBRARY } from './accessory-library.js';
import { ADDITIONAL_ACCESSORY_LIBRARY } from './additional-accessory-library.js';
import { validateCatalog } from './catalog-validation.js';

export function catalogStatus() {
  const health = validateCatalog();
  const accessoryIds = new Set([
    ...ACCESSORY_LIBRARY.map(a => a.id),
    ...ADDITIONAL_ACCESSORY_LIBRARY.map(a => a.id)
  ]);
  const fixtureIds = new Set(FIXTURE_LIBRARY.map(f => f.id));
  let fixtureLinks = 0;
  let dependencyLinks = 0;
  for (const accessory of [...ACCESSORY_LIBRARY, ...ADDITIONAL_ACCESSORY_LIBRARY]) {
    for (const target of accessory.compatibleWith || []) {
      if (fixtureIds.has(target)) fixtureLinks++;
      if (accessoryIds.has(target)) dependencyLinks++;
    }
  }
  return {
    ready: health.ok,
    fixtures: health.fixtureCount,
    accessories: health.accessoryCount,
    fixtureCompatibilityLinks: fixtureLinks,
    accessoryDependencyLinks: dependencyLinks,
    errors: health.errors.length,
    warnings: health.warnings.length,
    checkedAt: new Date().toISOString()
  };
}
