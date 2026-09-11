import { FIXTURE_LIBRARY as BASE_FIXTURE_LIBRARY } from './fixture-library.js';
import { ACCESSORY_CATALOG as BASE_ACCESSORY_CATALOG } from './accessory-catalog.js';

const STORM_700X_ID = 'aputure-storm-700x';
const STORM_400X_ID = 'aputure-storm-400x';

const MIDRANGE_STORM_FIXTURES = [
  {
    id: STORM_700X_ID,
    manufacturer: 'Aputure',
    model: 'STORM 700x',
    category: 'Light',
    sourceType: 'BLAIR Full-Spectrum LED',
    powerDrawW: 880,
    outputPowerW: 700,
    cctK: { min: 2500, max: 10000 },
    colorMode: 'Tunable White + Limited Color',
    cri: 95,
    tlci: 95,
    ssi: { tungsten: 87, daylight: 87 },
    beamAngleDeg: 58,
    includedReflectorBeamAngleDeg: 35,
    mount: 'ProLock Bowens Mount',
    greenMagentaAdjustment: '±G 100% (Full ASC MITC Range)',
    control: ['On-board', 'Sidus Link', 'Sidus Link Pro', 'DMX/RDM', 'CRMX'],
    acInput: '100-240V AC, 50/60Hz',
    ipRating: 'IP65',
    weightKg: 5.15,
    sourceUrl: 'https://aputure.com/en-US/products/storm-700x'
  },
  {
    id: STORM_400X_ID,
    manufacturer: 'Aputure',
    model: 'STORM 400x',
    category: 'Light',
    sourceType: 'BLAIR Full-Spectrum LED',
    powerDrawW: 500,
    outputPowerW: 400,
    cctK: { min: 2500, max: 10000 },
    colorMode: 'Tunable White + Limited Color',
    cri: 95,
    tlci: 95,
    ssi: { tungsten: 87, daylight: 85 },
    beamAngleDeg: 57,
    includedReflectorBeamAngleDeg: 35,
    mount: 'ProLock Bowens Mount',
    greenMagentaAdjustment: '±G 100% (Full ASC MITC Range)',
    control: ['On-board', 'Sidus Link', 'Sidus Link Pro', 'DMX/RDM', 'CRMX'],
    acInput: '100-240V AC, 50/60Hz',
    batterySupport: '14.4V V-Mount or Gold Mount configuration',
    ipRating: 'IP65',
    weightKg: 3.95,
    sourceUrl: 'https://aputure.com/en-US/products/storm-400x'
  }
];

const MIDRANGE_STORM_ACCESSORIES = [
  {
    id: 'aputure-storm-700x-35-reflector',
    manufacturer: 'Aputure',
    model: 'STORM 700x 35° Hyper Reflector',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_700X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    },
    beamAngleDeg: { min: 35, max: 35 },
    effectOnLight: 'Included medium-angle reflector for higher-intensity directional output.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-700x'
  },
  {
    id: 'aputure-storm-700x-head-cable-5m',
    manufacturer: 'Aputure',
    model: 'STORM 700x Head Cable (5m)',
    category: 'Cable',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_700X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    },
    effectOnLight: 'Included head cable connecting the STORM 700x lamp head and control box.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-700x'
  },
  {
    id: 'aputure-storm-700x-8-pin-cable-15m',
    manufacturer: 'Aputure',
    model: 'STORM 700x 8-Pin Cable (15m)',
    category: 'Cable',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_700X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Optional 15 m head cable for placing the lamp head farther from the control box.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-700x-8-pin-cable-15m'
  },
  {
    id: 'aputure-storm-700x-skid',
    manufacturer: 'Aputure',
    model: 'STORM 700x Skid',
    category: 'Bracket',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_700X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Included with the STORM 700x Cine Kit, not with the standard fixture package']
      }
    },
    effectOnLight: 'Steel support skid for stable floor placement, including use with the CF10 Fresnel.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-700x-skid'
  },
  {
    id: 'aputure-cf10-fresnel',
    manufacturer: 'Aputure',
    model: 'CF10 Fresnel',
    category: 'Fresnel',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_700X_ID, STORM_400X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Included with the STORM 700x Cine Kit, not with the standard fixture package']
      },
      [STORM_400X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    },
    mount: 'Bowens Mount',
    beamAngleDeg: { min: 15, max: 40 },
    effectOnLight: 'Variable-focus 10-inch Fresnel for concentrated hard-light output and adjustable beam spread.',
    sourceUrl: 'https://aputure.com/en-US/products/cf10-fresnel-and-barn-doors-kit'
  },
  {
    id: 'aputure-cf10-barn-doors',
    manufacturer: 'Aputure',
    model: 'CF10 Barn Doors',
    category: 'Barn Door',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_700X_ID, STORM_400X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        requiresAccessoryId: 'aputure-cf10-fresnel',
        conditions: ['Mounts to the CF10 Fresnel']
      },
      [STORM_400X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        requiresAccessoryId: 'aputure-cf10-fresnel',
        conditions: ['Mounts to the CF10 Fresnel']
      }
    },
    effectOnLight: 'Eight-leaf barn doors for beam shaping and spill control on the CF10 Fresnel.',
    sourceUrl: 'https://aputure.com/en-US/products/cf10-fresnel-and-barn-doors-kit'
  },
  {
    id: 'aputure-spotlight-mount-ii-50-lens-kit',
    manufacturer: 'Aputure',
    model: 'Spotlight Mount II 50° Lens Kit',
    category: 'Spotlight',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_700X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    beamAngleDeg: { min: 50, max: 50 },
    effectOnLight: 'Projection optic for precise 50-degree beam shaping and controlled image or gobo projection.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-700x'
  },
  {
    id: 'aputure-storm-400x-35-reflector',
    manufacturer: 'Aputure',
    model: 'STORM 400x 35° Hyper Reflector',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_400X_ID],
    compatibility: {
      [STORM_400X_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    },
    beamAngleDeg: { min: 35, max: 35 },
    effectOnLight: 'Included medium-angle reflector for higher-intensity directional output.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-400x'
  },
  {
    id: 'aputure-storm-400x-head-cable-3m',
    manufacturer: 'Aputure',
    model: 'STORM 400x Head Cable (3m)',
    category: 'Cable',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_400X_ID],
    compatibility: {
      [STORM_400X_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    },
    effectOnLight: 'Included head cable connecting the STORM 400x lamp head and control box.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-400x'
  },
  {
    id: 'aputure-storm-400x-5-pin-long-head-cable-7-5m',
    manufacturer: 'Aputure',
    model: 'STORM 400x 5-Pin Long Head Cable (7.5m)',
    category: 'Cable',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_400X_ID],
    compatibility: {
      [STORM_400X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Optional 7.5 m head cable connecting the STORM 400x lamp head and control box.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-400x-5-pin-long-head-cable-7-5m'
  },
  {
    id: 'aputure-cf7-fresnel',
    manufacturer: 'Aputure',
    model: 'CF7 Fresnel',
    category: 'Fresnel',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_400X_ID],
    compatibility: {
      [STORM_400X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    mount: 'Bowens Mount',
    beamAngleDeg: { min: 15, max: 40 },
    effectOnLight: 'Variable-focus 7-inch Fresnel optimized for the STORM 400x.',
    sourceUrl: 'https://aputure.com/en-US/products/cf7-fresnel-and-barn-doors-kit'
  },
  {
    id: 'aputure-cf7-barn-doors',
    manufacturer: 'Aputure',
    model: 'CF7 Barn Doors',
    category: 'Barn Door',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_400X_ID],
    compatibility: {
      [STORM_400X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        requiresAccessoryId: 'aputure-cf7-fresnel',
        conditions: ['Mounts to the CF7 Fresnel']
      }
    },
    effectOnLight: 'Eight-leaf barn doors for shaping the CF7 Fresnel beam and controlling spill.',
    sourceUrl: 'https://aputure.com/en-US/products/cf7-fresnel-and-barn-doors-kit'
  },
  {
    id: 'aputure-light-dome-mini-iii',
    manufacturer: 'Aputure',
    model: 'Light Dome Mini III',
    category: 'Dome',
    compatibilityStatus: 'Compatible',
    compatibleWith: [STORM_400X_ID],
    compatibility: {
      [STORM_400X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: 'Compact circular quick-folding softbox for controlled diffused light.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-400x'
  },
  {
    id: 'aputure-spotlight-mount-ii-36-lens-kit',
    manufacturer: 'Aputure',
    model: 'Spotlight Mount II 36° Lens Kit',
    category: 'Spotlight',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_400X_ID],
    compatibility: {
      [STORM_400X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    beamAngleDeg: { min: 36, max: 36 },
    effectOnLight: 'Projection optic for precise 36-degree beam shaping and controlled image or gobo projection.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-400x'
  }
];

const MIDRANGE_STORM_OVERRIDES = {
  'aputure-quick-dome-60': {
    compatibleWith: [STORM_700X_ID, STORM_400X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      },
      [STORM_400X_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-sidus-four': {
    compatibleWith: [STORM_700X_ID, STORM_400X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      },
      [STORM_400X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-lantern-90': {
    compatibleWith: [STORM_700X_ID, STORM_400X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      },
      [STORM_400X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-light-box-30x120': {
    compatibleWith: [STORM_700X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-light-octadome-120': {
    compatibleWith: [STORM_700X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-light-dome-iii': {
    compatibleWith: [STORM_700X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-spotlight-max-50-lens-kit': {
    compatibleWith: [STORM_700X_ID, STORM_400X_ID],
    compatibility: {
      [STORM_700X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      },
      [STORM_400X_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    }
  },
  'aputure-spotlight-max-36-lens-kit': {
    compatibleWith: [STORM_400X_ID],
    compatibility: {
      [STORM_400X_ID]: {
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
  const override = MIDRANGE_STORM_OVERRIDES[baseAccessory.id];
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

export const FIXTURE_LIBRARY = [
  ...BASE_FIXTURE_LIBRARY,
  ...MIDRANGE_STORM_FIXTURES
];

export const ACCESSORY_CATALOG = [
  ...BASE_ACCESSORY_CATALOG.map(mergeAccessory),
  ...MIDRANGE_STORM_ACCESSORIES
];
