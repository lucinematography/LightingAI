import { RUNTIME_CATALOG } from './catalog-runtime.js';
import { validateCatalog } from './catalog-validation.js';

export function catalogStatus() {
  const health = validateCatalog(RUNTIME_CATALOG);
  const fixtures = RUNTIME_CATALOG.fixtures;
  const accessories = RUNTIME_CATALOG.accessories;
  const accessoryIds = new Set(accessories.map(a => a.id));
  const fixtureIds = new Set(fixtures.map(f => f.id));
  let fixtureLinks = 0;
  let dependencyLinks = 0;
  let sourcedFixtures = 0;
  let sourcedAccessories = 0;
  let detailedFixtures = 0;

  for (const fixture of fixtures) {
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
    duplicateAccessoryDefinitions: RUNTIME_CATALOG.duplicateAccessoryIds.length,
    coverage: {
      sourcedFixtures,
      sourcedAccessories,
      detailedFixtures,
      fixtureSourcePercent: health.fixtureCount ? Math.round(sourcedFixtures * 100 / health.fixtureCount) : 0,
      accessorySourcePercent: health.accessoryCount ? Math.round(sourcedAccessories * 100 / health.accessoryCount) : 0,
      detailedFixturePercent: health.fixtureCount ? Math.round(detailedFixtures * 100 / health.fixtureCount) : 0
    },
    errors: health.errors.length,
    warnings: health.warnings.length,
    checkedAt: new Date().toISOString()
  };
}
