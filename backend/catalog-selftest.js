import { buildRuntimeCatalog } from './catalog-runtime.js';
import { validateCatalog } from './catalog-validation.js';
import { buildAccessoryTree, isBlockedCompatibilityStatus } from './accessory-graph.js';

const RUNTIME_CATALOG = buildRuntimeCatalog();
RUNTIME_CATALOG.fixtureById = new Map(RUNTIME_CATALOG.fixtures.map(x => [x.id, x]));
RUNTIME_CATALOG.accessoryById = new Map(RUNTIME_CATALOG.accessories.map(x => [x.id, x]));
RUNTIME_CATALOG.duplicateAccessoryIds = RUNTIME_CATALOG.integrity?.duplicateAccessoryIds || [];

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

for (const fixture of RUNTIME_CATALOG.fixtures) {
  const tree = buildAccessoryTree(fixture.id, RUNTIME_CATALOG);
  const ids = new Set();
  for (const record of tree) {
    if (ids.has(record.id)) failures.push(`Duplicate tree record: ${fixture.id} -> ${record.id}`);
    ids.add(record.id);
    const source = RUNTIME_CATALOG.accessoryById.get(record.id);
    if (!source) failures.push(`Tree references missing accessory: ${fixture.id} -> ${record.id}`);
    if (isBlockedCompatibilityStatus(source?.compatibility?.[fixture.id]?.status)) failures.push(`Blocked accessory exposed: ${fixture.id} -> ${record.id}`);
    if (record.depth < 1) failures.push(`Invalid accessory depth: ${fixture.id} -> ${record.id}`);
    if (!record.parentIds.length) failures.push(`Accessory has no resolved parent: ${fixture.id} -> ${record.id}`);
  }
}

if (RUNTIME_CATALOG.duplicateAccessoryIds.length) failures.push(`Duplicate accessory source IDs must be zero: ${RUNTIME_CATALOG.duplicateAccessoryIds.join(', ')}`);
const aputure600dPro = RUNTIME_CATALOG.fixtureById.get('aputure-ls-600d-pro');
const aputure600dMode = aputure600dPro?.dmxModes?.find((mode) => mode.name === '5ch Lighting & FX');
if (!aputure600dMode || aputure600dMode.channels !== 5 || aputure600dMode.verified !== true) failures.push('Verified LS 600d Pro 5ch DMX profile missing');
const aputure600dDimmer = aputure600dMode?.controls?.find((control) => control.key === 'dimmer');
if (!aputure600dDimmer || aputure600dDimmer.channel !== 1 || aputure600dDimmer.type !== 'percent') failures.push('Verified LS 600d Pro dimmer mapping missing');
const aputure600xPro = RUNTIME_CATALOG.fixtureById.get('aputure-ls-600x-pro');
const aputure600xModes = new Map((aputure600xPro?.dmxModes || []).map((mode) => [mode.name, mode]));
for (const [name, channels] of [['Lighting 2ch',2],['Effects 5ch',5],['Lighting & Effects 6ch',6]]) {
  const mode = aputure600xModes.get(name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified LS 600x Pro DMX mode missing: ${name}`);
  const dimmer = mode?.controls?.find((control) => control.key === 'dimmer');
  if (!dimmer || dimmer.channel !== 1 || dimmer.type !== 'percent') failures.push(`Verified LS 600x Pro dimmer mapping missing: ${name}`);
}


const uniqueFailures=[...new Set(failures)];
console.log(JSON.stringify({ok:uniqueFailures.length===0,fixtures:RUNTIME_CATALOG.fixtures.length,accessories:RUNTIME_CATALOG.accessories.length,duplicateSourceDefinitions:RUNTIME_CATALOG.duplicateAccessoryIds,warnings:report.warnings.length,failures:uniqueFailures},null,2));
if(uniqueFailures.length)process.exit(1);
