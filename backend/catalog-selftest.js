import { RUNTIME_CATALOG } from './catalog-runtime.js';
import { validateCatalog } from './catalog-validation.js';

const failures = [];
const report = validateCatalog(RUNTIME_CATALOG);
if (!report.ok) failures.push(...report.errors);
const fixtureIds = new Set(RUNTIME_CATALOG.fixtures.map(x => x.id));
const accessoryIds = new Set(RUNTIME_CATALOG.accessories.map(x => x.id));

for (const fixture of RUNTIME_CATALOG.fixtures) if (RUNTIME_CATALOG.fixtureById.get(fixture.id) !== fixture) failures.push(`Fixture map mismatch: ${fixture.id}`);
for (const accessory of RUNTIME_CATALOG.accessories) {
  if (RUNTIME_CATALOG.accessoryById.get(accessory.id) !== accessory) failures.push(`Accessory map mismatch: ${accessory.id}`);
  if (new Set(accessory.compatibleWith || []).size !== (accessory.compatibleWith || []).length) failures.push(`Runtime duplicate target: ${accessory.id}`);
  for (const target of accessory.compatibleWith || []) if (!fixtureIds.has(target) && !accessoryIds.has(target)) failures.push(`Unresolved target: ${accessory.id} -> ${target}`);
}
function reachesFixture(id, trail = new Set()) {if (fixtureIds.has(id)) return true;if (trail.has(id)) return false;const accessory=RUNTIME_CATALOG.accessoryById.get(id);if(!accessory)return false;const next=new Set(trail);next.add(id);return (accessory.compatibleWith||[]).some(target=>reachesFixture(target,next));}
for (const accessory of RUNTIME_CATALOG.accessories) if (!reachesFixture(accessory.id)) failures.push(`No fixture path: ${accessory.id}`);

// Source duplicates are allowed only because runtime deterministically merges them.
for (const id of RUNTIME_CATALOG.duplicateAccessoryIds) {
  const merged = RUNTIME_CATALOG.accessoryById.get(id);
  if (!merged) failures.push(`Merged accessory missing: ${id}`);
}
const uniqueFailures=[...new Set(failures)];
console.log(JSON.stringify({ok:uniqueFailures.length===0,fixtures:RUNTIME_CATALOG.fixtures.length,accessories:RUNTIME_CATALOG.accessories.length,mergedSourceDefinitions:RUNTIME_CATALOG.duplicateAccessoryIds,warnings:report.warnings.length,failures:uniqueFailures},null,2));
if(uniqueFailures.length)process.exit(1);
