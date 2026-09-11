import { FIXTURE_LIBRARY, ACCESSORY_CATALOG } from './catalog.js';
import { ACCESSORY_CATEGORIES, COMPATIBILITY_STATUS } from './accessory-schema.js';

const errors = [];
const warnings = [];

function duplicateIds(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (!item?.id) {
      errors.push(`${label} record is missing id`);
      continue;
    }
    if (seen.has(item.id)) errors.push(`Duplicate ${label} id: ${item.id}`);
    seen.add(item.id);
  }
  return seen;
}

const fixtureIds = duplicateIds(FIXTURE_LIBRARY, 'fixture');
const accessoryIds = duplicateIds(ACCESSORY_CATALOG, 'accessory');
const allProductIds = new Set([...fixtureIds, ...accessoryIds]);

for (const accessory of ACCESSORY_CATALOG) {
  if (!accessory.manufacturer) errors.push(`${accessory.id}: missing manufacturer`);
  if (!accessory.model) errors.push(`${accessory.id}: missing model`);

  if (accessory.category && !ACCESSORY_CATEGORIES.includes(accessory.category)) {
    errors.push(`${accessory.id}: unknown category "${accessory.category}"`);
  }

  if (accessory.compatibilityStatus && !COMPATIBILITY_STATUS.includes(accessory.compatibilityStatus)) {
    errors.push(`${accessory.id}: unknown compatibilityStatus "${accessory.compatibilityStatus}"`);
  }

  for (const targetId of accessory.compatibleWith || []) {
    if (!allProductIds.has(targetId)) {
      errors.push(`${accessory.id}: compatibleWith references missing product ${targetId}`);
    }
  }

  for (const [targetId, relation] of Object.entries(accessory.compatibility || {})) {
    if (!allProductIds.has(targetId)) {
      errors.push(`${accessory.id}: compatibility references missing product ${targetId}`);
    }

    if (relation?.status && !COMPATIBILITY_STATUS.includes(relation.status)) {
      errors.push(`${accessory.id}: invalid status "${relation.status}" for ${targetId}`);
    }

    if (relation?.requiresAccessoryId && !accessoryIds.has(relation.requiresAccessoryId)) {
      errors.push(`${accessory.id}: requires missing accessory ${relation.requiresAccessoryId}`);
    }

    if (relation?.conditions && !Array.isArray(relation.conditions)) {
      errors.push(`${accessory.id}: conditions for ${targetId} must be an array`);
    }
  }

  if (accessory.requiresAccessoryId && !accessoryIds.has(accessory.requiresAccessoryId)) {
    errors.push(`${accessory.id}: requires missing accessory ${accessory.requiresAccessoryId}`);
  }

  if (!accessory.sourceUrl) {
    warnings.push(`${accessory.id}: missing sourceUrl`);
  }
}

console.log(`Fixtures: ${FIXTURE_LIBRARY.length}`);
console.log(`Accessories: ${ACCESSORY_CATALOG.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (warnings.length) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length) {
  console.error('\nCatalog validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('\nCatalog validation passed.');
}
