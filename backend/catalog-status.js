import { FIXTURE_LIBRARY } from './fixture-library.js';
import { ACCESSORY_LIBRARY } from './accessory-library.js';
import { ADDITIONAL_ACCESSORY_LIBRARY } from './additional-accessory-library.js';
import { validateCatalog } from './catalog-validation.js';

function mergedAccessories() {
  const byId = new Map();
  for (const accessory of ACCESSORY_LIBRARY) byId.set(accessory.id, accessory);
  for (const accessory of ADDITIONAL_ACCESSORY_LIBRARY) {
    if (!byId.has(accessory.id)) byId.set(accessory.id, accessory);
  }
  return [...byId.values()];
}

export function catalogStatus() {
  const health = validateCatalog();
  const accessories = mergedAccessories();
  const accessoryIds = new Set(accessories.map(a => a.id));
  const fixtureIds = new Set(FIXTURE_LIBRARY.map(f => f.id));
  let fixtureLinks = 0;
  let dependencyLinks = 0;
  let sourcedFixtures = 0;
  let sourcedAccessories = 0;
  let detailedFixtures = 0;

  for (const fixture of FIXTURE_LIBRARY) {
    if (fixture.sourceUrl) sourcedFixtures++;
    if (fixture.powerDrawW && fixture.cctK && fixture.mount) detailedFixtures++;
  }
  for (const accessory of accessories) {
    if (accessory.sourceUrl) sourcedAccessories++;
    for (const target of new Set(accessory.compatibleWith || [])) {
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
    coverage: {
      sourcedFixtures,
      sourcedAccessories,
      detailedFixtures,
      fixtureSourcePercent: health.fixtureCount ? Math.round(sourcedFixtures * 100 / health.fixtureCount) : 0,
      accessorySourcePercent: health.accessoryCount ? Math.round(sourcedAccessories * 100 / health.accessoryCount) : 0
    },
    errors: health.errors.length,
    warnings: health.warnings.length,
    checkedAt: new Date().toISOString()
  };
}
