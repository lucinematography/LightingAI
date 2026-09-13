import { FIXTURE_LIBRARY } from './fixture-library.js';
import { ACCESSORY_LIBRARY } from './accessory-library.js';
import { ADDITIONAL_ACCESSORY_LIBRARY } from './additional-accessory-library.js';
import { SPOTLIGHT_ACCESSORY_LIBRARY } from './spotlight-accessory-library.js';
import { SPACE_LIGHT_ACCESSORY_LIBRARY } from './space-light-accessory-library.js';
import { STORM_80C_ADAPTED_ACCESSORY_LIBRARY } from './storm-80c-adapted-accessory-library.js';
import { APUTURE_MOUNT_SYSTEM_LIBRARY } from './aputure-mount-system-library.js';
import { STORM_SUPPORT_CONTROL_LIBRARY } from './storm-support-control-library.js';
import { ELECTRO_STORM_TRANSPORT_POWER_LIBRARY } from './electro-storm-transport-power-library.js';
import { ELECTRO_STORM_SYSTEM_ACCESSORY_LIBRARY } from './electro-storm-system-accessory-library.js';
import { ARRI_SKYPANEL_X_FIXTURES, ARRI_SKYPANEL_X_ACCESSORIES } from './arri-skypanel-x-library.js';
import { ARRI_SKYPANEL_PRO_FIXTURES, ARRI_SKYPANEL_PRO_ACCESSORIES } from './arri-skypanel-pro-library.js';
import { ARRI_SKYPANEL_CLASSIC_S30_FIXTURES, ARRI_SKYPANEL_CLASSIC_S30_ACCESSORIES } from './arri-skypanel-classic-s30-library.js';
import { ARRI_SKYPANEL_CLASSIC_S60_FIXTURES, ARRI_SKYPANEL_CLASSIC_S60_ACCESSORIES } from './arri-skypanel-classic-s60-library.js';
import { ARRI_SKYPANEL_CLASSIC_S120_FIXTURES, ARRI_SKYPANEL_CLASSIC_S120_ACCESSORIES } from './arri-skypanel-classic-s120-library.js';
import { ARRI_SKYPANEL_CLASSIC_S360_FIXTURES, ARRI_SKYPANEL_CLASSIC_S360_ACCESSORIES } from './arri-skypanel-classic-s360-library.js';
import { ARRI_SKYPANEL_KITS } from './arri-skypanel-kits-library.js';
import { ARRI_SKYPANEL_DISCONTINUED_FIXTURES, ARRI_SKYPANEL_DISCONTINUED_ACCESSORIES } from './arri-skypanel-discontinued-library.js';
import { ARRI_L_SERIES_PLUS_FIXTURES, ARRI_L_SERIES_PLUS_ACCESSORIES } from './arri-l-series-plus-library.js';
import { ARRI_ORBITER_FIXTURES, ARRI_ORBITER_ACCESSORIES } from './arri-orbiter-library.js';
import { ARRI_L_SERIES_C_DISCONTINUED_FIXTURES, ARRI_L_SERIES_C_DISCONTINUED_ACCESSORIES } from './arri-l-series-c-discontinued-library.js';
import { ARRI_L_SERIES_DT_TT_DISCONTINUED_FIXTURES, ARRI_L_SERIES_DT_TT_DISCONTINUED_ACCESSORIES } from './arri-l-series-dt-tt-discontinued-library.js';
import { applyAccessoryCompatibilityOverrides } from './accessory-compatibility-overrides.js';
import { applyCatalogCompatibilityCorrections } from './catalog-compatibility-corrections.js';
import { applyElectroStormCanonicalCorrections } from './electro-storm-canonical-corrections.js';

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function unique(values = []) { return [...new Set(values)]; }

function mergeAccessory(base, extra) {
  const merged = { ...base, ...extra };
  merged.compatibleWith = unique([...(base.compatibleWith || []), ...(extra.compatibleWith || [])]);
  merged.compatibility = { ...(base.compatibility || {}), ...(extra.compatibility || {}) };
  for (const key of ['manufacturer','model','category','mount','effectOnLight','sourceUrl']) {
    if (base[key] != null) merged[key] = base[key];
  }
  if (base.includedWithFixture != null) merged.includedWithFixture = base.includedWithFixture;
  return merged;
}

export function buildRuntimeCatalog() {
  const fixtures = [...clone(FIXTURE_LIBRARY), ...clone(ARRI_SKYPANEL_X_FIXTURES), ...clone(ARRI_SKYPANEL_PRO_FIXTURES), ...clone(ARRI_SKYPANEL_CLASSIC_S30_FIXTURES), ...clone(ARRI_SKYPANEL_CLASSIC_S60_FIXTURES), ...clone(ARRI_SKYPANEL_CLASSIC_S120_FIXTURES), ...clone(ARRI_SKYPANEL_CLASSIC_S360_FIXTURES), ...clone(ARRI_SKYPANEL_DISCONTINUED_FIXTURES), ...clone(ARRI_L_SERIES_PLUS_FIXTURES), ...clone(ARRI_ORBITER_FIXTURES), ...clone(ARRI_L_SERIES_C_DISCONTINUED_FIXTURES), ...clone(ARRI_L_SERIES_DT_TT_DISCONTINUED_FIXTURES)];
  const kits = clone(ARRI_SKYPANEL_KITS);
  // Keep one canonical source definition per accessory. Electro Storm optical facts are
  // normalized after merge so richer verified data does not require duplicate records.
  const accessoryDefinitions = [...clone(ACCESSORY_LIBRARY), ...clone(ADDITIONAL_ACCESSORY_LIBRARY), ...clone(SPOTLIGHT_ACCESSORY_LIBRARY), ...clone(SPACE_LIGHT_ACCESSORY_LIBRARY), ...clone(STORM_80C_ADAPTED_ACCESSORY_LIBRARY), ...clone(APUTURE_MOUNT_SYSTEM_LIBRARY), ...clone(STORM_SUPPORT_CONTROL_LIBRARY), ...clone(ELECTRO_STORM_TRANSPORT_POWER_LIBRARY), ...clone(ELECTRO_STORM_SYSTEM_ACCESSORY_LIBRARY), ...clone(ARRI_SKYPANEL_X_ACCESSORIES), ...clone(ARRI_SKYPANEL_PRO_ACCESSORIES), ...clone(ARRI_SKYPANEL_CLASSIC_S30_ACCESSORIES), ...clone(ARRI_SKYPANEL_CLASSIC_S60_ACCESSORIES), ...clone(ARRI_SKYPANEL_CLASSIC_S120_ACCESSORIES), ...clone(ARRI_SKYPANEL_CLASSIC_S360_ACCESSORIES), ...clone(ARRI_SKYPANEL_DISCONTINUED_ACCESSORIES), ...clone(ARRI_L_SERIES_PLUS_ACCESSORIES), ...clone(ARRI_ORBITER_ACCESSORIES), ...clone(ARRI_L_SERIES_C_DISCONTINUED_ACCESSORIES), ...clone(ARRI_L_SERIES_DT_TT_DISCONTINUED_ACCESSORIES)];
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
  applyCatalogCompatibilityCorrections(accessories);
  applyElectroStormCanonicalCorrections(accessories);
  return {
    fixtures,
    accessories,
    kits,
    sourceAccessoryDefinitions: accessoryDefinitions,
    duplicateAccessoryIds: [...new Set(duplicateAccessoryIds)],
    fixtureById: new Map(fixtures.map(f => [f.id, f])),
    accessoryById: new Map(accessories.map(a => [a.id, a])),
    kitById: new Map(kits.map(k => [k.id, k]))
  };
}

export const RUNTIME_CATALOG = buildRuntimeCatalog();
