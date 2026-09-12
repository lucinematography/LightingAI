import { ACCESSORY_LIBRARY } from './accessory-library.js';

// Compatibility additions for restored Aputure LS fixtures.
// Sources: Aputure Accessory Compatibility Sheet / Compatibility Wizard and official product pages.
export const ACCESSORY_COMPATIBILITY_OVERRIDES = {
  'aputure-ls-300d-ii': [
    'aputure-bowens-standard-reflector','aputure-light-dome-mini-ii','aputure-light-dome-se','aputure-light-dome-ii','aputure-light-dome-150','aputure-light-octadome-120','aputure-light-box-60x90','aputure-light-box-30x120','aputure-light-box-45x45','aputure-lantern','aputure-lantern-90','aputure-space-light','aputure-f10-fresnel','aputure-spotlight-mount','aputure-ls-600-series-hyper-reflector'
  ],
  'aputure-ls-600d': [
    'aputure-bowens-standard-reflector','aputure-ls-600-series-hyper-reflector','aputure-light-dome-mini-ii','aputure-light-dome-se','aputure-light-dome-ii','aputure-light-dome-150','aputure-light-octadome-120','aputure-light-box-60x90','aputure-light-box-30x120','aputure-lantern','aputure-lantern-90','aputure-space-light','aputure-f10-fresnel','aputure-spotlight-mount','aputure-f10-barn-doors'
  ],
  'aputure-ls-600c-pro-ii': [
    'aputure-bowens-standard-reflector','aputure-ls-600-series-hyper-reflector','aputure-light-dome-mini-ii','aputure-light-dome-se','aputure-light-dome-ii','aputure-light-dome-150','aputure-light-octadome-120','aputure-light-box-60x90','aputure-light-box-30x120','aputure-lantern','aputure-lantern-90','aputure-space-light','aputure-f10-fresnel','aputure-f10-barn-doors','aputure-spotlight-mount'
  ]
};

export const ACCESSORY_COMPATIBILITY_METADATA_OVERRIDES = {
  'aputure-ls-300d-ii': {
    'aputure-ls-600-series-hyper-reflector': {
      status: 'Compatible but not optimized',
      conditions: ['Physically compatible; not optimized for LS 300d II output']
    }
  },
  'aputure-ls-600d': {
    'aputure-light-dome-mini-ii': { status: 'Compatible', conditions: ['Remove inner baffle and gel holder'] },
    'aputure-light-dome-ii': { status: 'Compatible', conditions: ['Remove inner baffle and gel holder'] },
    'aputure-light-dome-se': { status: 'Compatible', conditions: ['Remove inner baffle'] },
    'aputure-light-octadome-120': { status: 'Compatible', conditions: ['Remove inner baffle'] },
    'aputure-light-box-60x90': { status: 'Compatible', conditions: ['Remove inner baffle'] },
    'aputure-light-box-30x120': { status: 'Compatible', conditions: ['Remove inner baffle'] }
  },
  'aputure-ls-600c-pro-ii': {
    'aputure-light-dome-mini-ii': { status: 'Compatible', conditions: ['Remove inner baffle and gel holder'] },
    'aputure-light-dome-ii': { status: 'Compatible', conditions: ['Remove inner baffle and gel holder'] },
    'aputure-light-dome-se': { status: 'Compatible', conditions: ['Remove inner baffle'] },
    'aputure-light-octadome-120': { status: 'Compatible', conditions: ['Remove inner baffle'] },
    'aputure-light-box-60x90': { status: 'Compatible', conditions: ['Remove inner baffle'] },
    'aputure-light-box-30x120': { status: 'Compatible', conditions: ['Remove inner baffle'] }
  }
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
  for (const [fixtureId, accessoryMetadata] of Object.entries(ACCESSORY_COMPATIBILITY_METADATA_OVERRIDES)) {
    for (const [accessoryId, metadata] of Object.entries(accessoryMetadata)) {
      const accessory = accessories.find(item => item.id === accessoryId);
      if (!accessory) continue;
      accessory.compatibility ||= {};
      accessory.compatibility[fixtureId] = metadata;
    }
  }
  return accessories;
}

applyAccessoryCompatibilityOverrides(ACCESSORY_LIBRARY);
