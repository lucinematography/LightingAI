import { ACCESSORY_LIBRARY } from './accessory-library.js';

// Compatibility additions for restored Aputure LS fixtures.
// Kept separate from the large accessory library so existing records stay untouched.
// Sources: Aputure Accessory Compatibility Sheet / Compatibility Wizard and official product pages.
export const ACCESSORY_COMPATIBILITY_OVERRIDES = {
  'aputure-ls-300d-ii': [
    'aputure-bowens-standard-reflector',
    'aputure-light-dome-mini-ii',
    'aputure-light-dome-se',
    'aputure-light-dome-ii',
    'aputure-light-dome-150',
    'aputure-light-octadome-120',
    'aputure-light-box-60x90',
    'aputure-light-box-30x120',
    'aputure-light-box-45x45',
    'aputure-lantern',
    'aputure-lantern-90',
    'aputure-space-light',
    'aputure-f10-fresnel',
    'aputure-spotlight-mount'
  ],
  'aputure-ls-600d': [
    'aputure-bowens-standard-reflector',
    'aputure-ls-600-series-hyper-reflector',
    'aputure-light-dome-mini-ii',
    'aputure-light-dome-se',
    'aputure-light-dome-ii',
    'aputure-light-dome-150',
    'aputure-light-octadome-120',
    'aputure-light-box-60x90',
    'aputure-light-box-30x120',
    'aputure-lantern',
    'aputure-lantern-90',
    'aputure-space-light',
    'aputure-f10-fresnel',
    'aputure-spotlight-mount'
  ],
  'aputure-ls-600c-pro-ii': [
    'aputure-ls-600-series-hyper-reflector',
    'aputure-light-dome-mini-ii',
    'aputure-light-dome-se',
    'aputure-light-dome-ii',
    'aputure-light-dome-150',
    'aputure-light-octadome-120',
    'aputure-light-box-60x90',
    'aputure-light-box-30x120',
    'aputure-lantern',
    'aputure-lantern-90',
    'aputure-space-light',
    'aputure-f10-fresnel'
  ]
};

export function applyAccessoryCompatibilityOverrides(accessories) {
  for (const [fixtureId, accessoryIds] of Object.entries(ACCESSORY_COMPATIBILITY_OVERRIDES)) {
    for (const accessoryId of accessoryIds) {
      const accessory = accessories.find(item => item.id === accessoryId);
      if (!accessory) continue;
      accessory.compatibleWith ||= [];
      if (!accessory.compatibleWith.includes(fixtureId)) accessory.compatibleWith.push(fixtureId);
    }
  }
  return accessories;
}

applyAccessoryCompatibilityOverrides(ACCESSORY_LIBRARY);
