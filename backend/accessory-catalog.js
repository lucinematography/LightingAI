import { ACCESSORY_LIBRARY } from './accessory-library.js';

const STORM_1200X_ID = 'aputure-storm-1200x';

const VERIFIED_STORM_1200X_ACCESSORIES = [
  {
    id: 'aputure-storm-1200x-8-pin-weatherproof-head-cable-7-5m',
    manufacturer: 'Aputure',
    model: 'STORM 1200x 8-Pin Weatherproof Head Cable (7.5m)',
    category: 'Cable',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_1200X_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    },
    effectOnLight: 'Weatherproof head cable connecting the STORM 1200x lamp head and control box.',
    sourceUrl: 'https://help.aputure.com/en/storm-1200x-overview'
  },
  {
    id: 'aputure-storm-1000c-1200x-skid',
    manufacturer: 'Aputure',
    model: 'STORM 1000c/1200x Skid',
    category: 'Bracket',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_1200X_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Protective support skid for STORM 1000c/1200x lamp heads; included in the Cine Kit but not the standard STORM 1200x package.',
    sourceUrl: 'https://aputure.com/EN-US/products/storm-1200x-cine-kit'
  },
  {
    id: 'aputure-space-light-90',
    manufacturer: 'Aputure',
    model: 'Space Light 90',
    category: 'Softbox',
    compatibilityStatus: 'Compatible',
    compatibleWith: [STORM_1200X_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Large cylindrical soft modifier for broad overhead and ambient illumination.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1200x'
  },
  {
    id: 'aputure-sidus-four',
    manufacturer: 'Aputure',
    model: 'Sidus Four',
    category: 'Control',
    compatibilityStatus: 'Compatible',
    compatibleWith: [STORM_1200X_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'External lighting-control interface compatible with the STORM 1200x control ecosystem.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1200x'
  }
];

const STORM_1200X_OVERRIDES = {
  'aputure-storm-1200x-cf12-fresnel': {
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Included with the STORM 1200x Cine Kit, not with the standard fixture package']
      }
    }
  },
  'aputure-storm-1200x-15-reflector': {
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-storm-1200x-30-reflector': {
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-storm-1200x-45-reflector': {
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    }
  },
  'aputure-storm-1200x-barn-door-adapter': {
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-cf12-barn-doors': {
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Use with the CF12 Fresnel or the STORM 1000c/1200x Barn Doors Adapter']
      }
    }
  },
  'aputure-ls1200d-four-light-bracket': {
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-ls1200d-neutrik-power-cable-6m': {
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Compatible',
        includedWithFixture: true,
        conditions: []
      }
    }
  },
  'aputure-light-dome-150': {
    compatibleWith: [STORM_1200X_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    }
  }
};

function mergeUnique(values = []) {
  return [...new Set(values)];
}

function mergeAccessory(baseAccessory) {
  const override = STORM_1200X_OVERRIDES[baseAccessory.id];
  if (!override) return baseAccessory;

  return {
    ...baseAccessory,
    ...override,
    compatibleWith: mergeUnique([
      ...(baseAccessory.compatibleWith || []),
      ...(override.compatibleWith || [])
    ]),
    compatibility: {
      ...(baseAccessory.compatibility || {}),
      ...(override.compatibility || {})
    }
  };
}

export const ACCESSORY_CATALOG = [
  ...ACCESSORY_LIBRARY.map(mergeAccessory),
  ...VERIFIED_STORM_1200X_ACCESSORIES
];
