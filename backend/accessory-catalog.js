import { ACCESSORY_LIBRARY } from './accessory-library.js';

const STORM_1200X_ID = 'aputure-storm-1200x';
const STORM_1000C_ID = 'aputure-storm-1000c';

const VERIFIED_STORM_ACCESSORIES = [
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
    id: 'aputure-storm-1000c-head-cable-7-5m',
    manufacturer: 'Aputure',
    model: 'STORM 1000c Head Cable (7.5m)',
    category: 'Cable',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1000C_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    },
    effectOnLight: 'Head cable supplied with the STORM 1000c for connecting the lamp head and control box.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-1000c'
  },
  {
    id: 'aputure-storm-1000c-1200x-skid',
    manufacturer: 'Aputure',
    model: 'STORM 1000c/1200x Skid',
    category: 'Bracket',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_1200X_ID, STORM_1000C_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Included with the STORM 1200x Cine Kit, not with the standard fixture package']
      },
      [STORM_1000C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Included with the STORM 1000c Cine Kit, not with the standard fixture package']
      }
    },
    effectOnLight: 'Protective support skid for STORM 1000c and STORM 1200x lamp heads.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c'
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
    compatibleWith: [STORM_1200X_ID, STORM_1000C_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      },
      [STORM_1000C_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Four-universe CRMX transmitter, DMX node, and wireless-router control interface.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=sidus-four'
  },
  {
    id: 'aputure-quick-dome-90',
    manufacturer: 'Aputure',
    model: 'Quick Dome 90',
    category: 'Dome',
    compatibilityStatus: 'Compatible',
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1000C_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: '90 cm quick-release circular softbox for broad diffused illumination.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c'
  },
  {
    id: 'aputure-light-dome-iii',
    manufacturer: 'Aputure',
    model: 'Light Dome III',
    category: 'Dome',
    compatibilityStatus: 'Compatible',
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1000C_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: 'Three-foot circular quick-folding softbox for broad diffused key or fill light.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c'
  },
  {
    id: 'aputure-spotlight-max-50-lens-kit',
    manufacturer: 'Aputure',
    model: 'Spotlight Max 50° Lens Kit',
    category: 'Spotlight',
    compatibilityStatus: 'Compatible',
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1000C_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    },
    beamAngleDeg: { min: 50, max: 50 },
    effectOnLight: 'Projection optic for precise 50-degree beam shaping and controlled light placement.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c'
  }
];

const STORM_OVERRIDES = {
  'aputure-storm-1200x-cf12-fresnel': {
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Included with the STORM 1200x Cine Kit, not with the standard fixture package']
      },
      [STORM_1000C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Included with the STORM 1000c Cine Kit, not with the standard fixture package']
      }
    }
  },
  'aputure-storm-1200x-15-reflector': {
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      },
      [STORM_1000C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-storm-1200x-30-reflector': {
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      },
      [STORM_1000C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-storm-1200x-45-reflector': {
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      },
      [STORM_1000C_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    }
  },
  'aputure-storm-1200x-barn-door-adapter': {
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      },
      [STORM_1000C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-cf12-barn-doors': {
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Use with the CF12 Fresnel or the STORM 1000c/1200x Barn Doors Adapter']
      },
      [STORM_1000C_ID]: {
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
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1200X_ID]: {
        status: 'Compatible',
        includedWithFixture: true,
        conditions: []
      },
      [STORM_1000C_ID]: {
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
  },
  'aputure-light-dome-se': {
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1000C_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-lantern-90': {
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1000C_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-light-box-30x120': {
    compatibleWith: [STORM_1000C_ID],
    compatibility: {
      [STORM_1000C_ID]: {
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
  const override = STORM_OVERRIDES[baseAccessory.id];
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
  ...VERIFIED_STORM_ACCESSORIES
];
