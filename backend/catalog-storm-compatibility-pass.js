// Official Aputure STORM accessory and compatibility pass verified 2026-09-11.

const STORM_1000C = 'aputure-storm-1000c';
const STORM_1200X = 'aputure-storm-1200x';
const STORM_700X = 'aputure-storm-700x';
const STORM_400X = 'aputure-storm-400x';
const STORM_80C = 'aputure-storm-80c';
const STORM_XT52 = 'aputure-storm-xt52';
const STORM_CS32 = 'aputure-storm-cs32';
const STORM_1000C_CINE_KIT = 'aputure-storm-1000c-cine-kit';
const STORM_1200X_CINE_KIT = 'aputure-storm-1200x-cine-kit';
const STORM_700X_CINE_KIT = 'aputure-storm-700x-cine-kit';

const SOURCE_1000C_WIZARD =
  'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c';
const SOURCE_1200X_WIZARD =
  'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1200x';
const SOURCE_700X_WIZARD =
  'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-700x';
const SOURCE_QUICK_RELEASE_WIZARD =
  'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=aputure-quick-release-clamp';
const SOURCE_REFLECTOR_KIT =
  'https://aputure.com/en-US/products/storm-1000c-1200x-reflector-kit';
const SOURCE_BARN_DOORS_ADAPTER =
  'https://aputure.com/en-US/products/storm-1000c-1200x-barn-doors-adapter';
const SOURCE_SPOTLIGHT_19 =
  'https://aputure.com/en-US/products/spotlight-mount-ii-19-lens-kit';
const SOURCE_SPOTLIGHT_26 =
  'https://aputure.com/en-US/products/spotlight-mount-ii-26-lens-kit';
const SOURCE_SPOTLIGHT_36 =
  'https://aputure.com/en-US/products/spotlight-mount-ii-36-lens-kit';
const SOURCE_SPOTLIGHT_50 =
  'https://aputure.com/en-US/products/spotlight-mount-ii-50-lens-kit';
const SOURCE_CS32_CINE_KIT =
  'https://aputure.com/en-US/products/storm-cs32-cine-kit';
const SOURCE_80C_THREE_LIGHT_KIT =
  'https://aputure.com/en-US/products/storm-80c-3-light-kit';
const SOURCE_QUICK_RELEASE_CLAMP =
  'https://aputure.com/en-US/products/aputure-quick-release-clamp';

const relation = (sourceUrl, status = 'Compatible', conditions = [], extra = {}) => ({
  status,
  includedWithFixture: false,
  conditions,
  sourceUrl,
  ...extra
});

export const STORM_COMPATIBILITY_ACCESSORIES = [
  {
    id: 'aputure-storm-cs32-cine-kit',
    manufacturer: 'Aputure',
    model: 'STORM CS32 Cine Kit',
    category: 'Other',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_CS32],
    compatibility: {
      [STORM_CS32]: relation(SOURCE_CS32_CINE_KIT, 'Designed For', [
        'Complete kit includes Motorized CF16 Fresnel, CF16 Fresnel Barn Doors, STORM CS32 Skid and flight cases'
      ])
    },
    effectOnLight:
      'Complete STORM CS32 production kit with CF16 Fresnel, barn doors, skid, control-box and Fresnel flight cases.',
    sourceUrl: SOURCE_CS32_CINE_KIT,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-storm-80c-3-light-kit',
    manufacturer: 'Aputure',
    model: 'STORM 80c 3-Light Kit',
    category: 'Other',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C],
    compatibility: {
      [STORM_80C]: relation(SOURCE_80C_THREE_LIGHT_KIT, 'Designed For', [
        'Complete kit includes three STORM 80c lamps, reflectors, diffusers, CF4 Fresnels with Barn Doors, Quick Dome 40, brackets, cables, clamps and rolling hard case'
      ])
    },
    effectOnLight:
      'Portable three-light STORM 80c package with hard-light, soft-light, battery and rigging accessories in a rolling case.',
    sourceUrl: SOURCE_80C_THREE_LIGHT_KIT,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-storm-1000c-1200x-reflector-kit',
    manufacturer: 'Aputure',
    model: 'STORM 1000c/1200x Reflector Kit',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: [
      STORM_1000C,
      STORM_1200X,
      STORM_400X,
      STORM_700X,
      STORM_700X_CINE_KIT
    ],
    compatibility: {
      [STORM_1000C]: relation(SOURCE_REFLECTOR_KIT, 'Designed For', [
        'Includes 15° narrow and 30° medium reflectors; the 45° wide reflector is included with the fixture'
      ]),
      [STORM_1200X]: relation(SOURCE_REFLECTOR_KIT, 'Designed For', [
        'Includes 15° narrow and 30° medium reflectors; the 45° wide reflector is included with the fixture'
      ]),
      [STORM_400X]: relation(SOURCE_REFLECTOR_KIT, 'Compatible', [
        'Aputure lists the reflector kit as compatible with STORM 400x'
      ]),
      [STORM_700X]: relation(SOURCE_REFLECTOR_KIT, 'Compatible', [
        'Aputure lists the reflector kit as compatible with STORM 700x'
      ]),
      [STORM_700X_CINE_KIT]: relation(SOURCE_REFLECTOR_KIT, 'Compatible', [
        'Aputure lists the reflector kit as compatible with the STORM 700x Cine Kit'
      ])
    },
    beamAngleDeg: { min: 15, max: 30 },
    effectOnLight:
      'Adds tuned 15° narrow and 30° medium reflectors to the included 45° wide reflector, with a protective carrying case.',
    sourceUrl: SOURCE_REFLECTOR_KIT,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-quick-release-clamp',
    manufacturer: 'Aputure',
    model: 'Aputure Quick Release Clamp',
    category: 'Other',
    compatibilityStatus: 'Compatible',
    compatibleWith: [
      STORM_1000C,
      STORM_400X,
      STORM_XT52,
      STORM_1200X,
      STORM_700X,
      STORM_1000C_CINE_KIT,
      STORM_1200X_CINE_KIT,
      STORM_700X_CINE_KIT
    ],
    compatibility: {
      [STORM_1000C]: relation(SOURCE_QUICK_RELEASE_WIZARD, 'Compatible', [
        'Mounts the STORM control box or battery station to a stand or 2–5 cm pipe using the Lightning Clamp quick-release plate'
      ]),
      [STORM_400X]: relation(SOURCE_QUICK_RELEASE_WIZARD, 'Compatible', [
        'Mounts the STORM control box or battery station to a stand or 2–5 cm pipe using the Lightning Clamp quick-release plate'
      ]),
      [STORM_XT52]: relation(SOURCE_QUICK_RELEASE_WIZARD, 'Compatible', [
        'Mounts the STORM control box or battery station to a stand or 2–5 cm pipe using the Lightning Clamp quick-release plate'
      ]),
      [STORM_1200X]: relation(SOURCE_QUICK_RELEASE_WIZARD, 'Compatible', [
        'Mounts the STORM control box or battery station to a stand or 2–5 cm pipe using the Lightning Clamp quick-release plate'
      ]),
      [STORM_700X]: relation(SOURCE_QUICK_RELEASE_WIZARD, 'Compatible', [
        'Mounts the STORM control box or battery station to a stand or 2–5 cm pipe using the Lightning Clamp quick-release plate'
      ]),
      [STORM_1000C_CINE_KIT]: relation(SOURCE_QUICK_RELEASE_WIZARD, 'Compatible', [
        'Aputure lists the clamp as compatible with the STORM 1000c Cine Kit'
      ]),
      [STORM_1200X_CINE_KIT]: relation(SOURCE_QUICK_RELEASE_WIZARD, 'Compatible', [
        'Aputure lists the clamp as compatible with the STORM 1200x Cine Kit'
      ]),
      [STORM_700X_CINE_KIT]: relation(SOURCE_QUICK_RELEASE_WIZARD, 'Compatible', [
        'Aputure lists the clamp as compatible with the STORM 700x Cine Kit'
      ])
    },
    effectOnLight:
      'Quick-release clamp for securing Aputure STORM control boxes or battery power stations to stands and pipes.',
    sourceUrl: SOURCE_QUICK_RELEASE_CLAMP,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-neutrik-nac3fx-w-type-b-15a-power-cable-6m-us',
    manufacturer: 'Aputure',
    model: 'Neutrik® NAC3FX-W to Type-B 15A AC Power Cable-6m(US)',
    category: 'Power',
    compatibilityStatus: 'Compatible',
    compatibleWith: [STORM_1000C, STORM_1200X],
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Compatible', [
        'US 15A Type-B AC cable for the STORM control box; verify the local connector and circuit rating'
      ]),
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible', [
        'US 15A Type-B AC cable for the STORM control box; verify the local connector and circuit rating'
      ])
    },
    effectOnLight: 'Six-meter North American AC power cable with Neutrik NAC3FX-W and Type-B 15A connectors.',
    sourceUrl: SOURCE_1000C_WIZARD,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-storm-700x-25-reflector',
    manufacturer: 'Aputure',
    model: 'BM6825 25° Reflector',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_700X],
    compatibility: {
      [STORM_700X]: relation(SOURCE_700X_WIZARD, 'Designed For', [
        '25° hyper-reflector designed to tighten the native STORM 700x beam to 25°'
      ])
    },
    mount: 'ProLock Bowens Mount',
    beamAngleDeg: { min: 25, max: 25 },
    effectOnLight: 'Narrows the STORM 700x beam to a tighter 25° output for increased intensity and control.',
    sourceUrl: SOURCE_700X_WIZARD,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-spotlight-mount-ii-19-lens-kit',
    manufacturer: 'Aputure',
    model: 'Spotlight Mount II 19° Lens Kit',
    category: 'Spotlight',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_400X, STORM_700X],
    compatibility: {
      [STORM_400X]: relation(SOURCE_SPOTLIGHT_19, 'Designed For', [
        'Optimized for the STORM 400x and 700x'
      ]),
      [STORM_700X]: relation(SOURCE_SPOTLIGHT_19, 'Designed For', [
        'Optimized for the STORM 400x and 700x'
      ])
    },
    mount: 'ProLock / Bowens Mount',
    beamAngleDeg: { min: 19, max: 19 },
    effectOnLight: 'Ellipsoidal projection optic for precise 19° beam shaping, gobo projection and controlled light placement.',
    sourceUrl: SOURCE_SPOTLIGHT_19,
    verifiedAt: '2026-09-11'
  }
];

export const STORM_COMPATIBILITY_OVERRIDES = {
  'aputure-storm-1200x-barn-door-adapter': {
    sourceUrl: SOURCE_BARN_DOORS_ADAPTER,
    compatibility: {
      [STORM_1200X]: relation(SOURCE_BARN_DOORS_ADAPTER, 'Designed For'),
      [STORM_1000C]: relation(SOURCE_BARN_DOORS_ADAPTER, 'Designed For')
    }
  },
  'aputure-ls1200d-four-light-bracket': {
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Compatible', [
        'Aputure lists the four-light bracket as compatible with STORM 1000c'
      ])
    }
  },
  'aputure-f10-barn-doors': {
    compatibility: {
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible', [
        'Use with the F10 Fresnel'
      ])
    }
  },
  'aputure-light-dome-se': {
    compatibility: {
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-light-dome-iii': {
    compatibility: {
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-light-dome-150': {
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Compatible')
    }
  },
  'aputure-lantern-90': {
    compatibility: {
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-spotlight-max-19-lens-kit': {
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Compatible'),
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-spotlight-max-36-lens-kit': {
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Compatible'),
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-spotlight-max-50-lens-kit': {
    compatibility: {
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-space-light-90': {
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Compatible')
    }
  },
  'aputure-light-box-60x90': {
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Compatible'),
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-light-octadome-120': {
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Compatible'),
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-light-box-30x120': {
    compatibility: {
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-sidus-one': {
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Compatible'),
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-quick-dome-60': {
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Compatible'),
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-quick-dome-90': {
    compatibility: {
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Compatible')
    }
  },
  'aputure-lantern': {
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_WIZARD, 'Do Not Use'),
      [STORM_1200X]: relation(SOURCE_1200X_WIZARD, 'Do Not Use')
    }
  },
  'aputure-spotlight-mount-ii-26-lens-kit': {
    sourceUrl: SOURCE_SPOTLIGHT_26,
    compatibility: {
      [STORM_400X]: relation(SOURCE_SPOTLIGHT_26, 'Designed For', [
        'Optimized for the STORM 400x and 700x'
      ])
    }
  },
  'aputure-spotlight-mount-ii-36-lens-kit': {
    sourceUrl: SOURCE_SPOTLIGHT_36,
    compatibility: {
      [STORM_400X]: relation(SOURCE_SPOTLIGHT_36, 'Designed For'),
      [STORM_700X]: relation(SOURCE_SPOTLIGHT_36, 'Designed For')
    }
  },
  'aputure-spotlight-mount-ii-50-lens-kit': {
    sourceUrl: SOURCE_SPOTLIGHT_50,
    compatibility: {
      [STORM_400X]: relation(SOURCE_SPOTLIGHT_50, 'Designed For'),
      [STORM_700X]: relation(SOURCE_SPOTLIGHT_50, 'Designed For')
    }
  }
};

// Explicit Do Not Use relations remain in compatibility and are removed from compatibleWith.
export function mergeStormCompatibilityAccessory(accessory) {
  const override = STORM_COMPATIBILITY_OVERRIDES[accessory.id];
  if (!override) return accessory;

  const compatibility = {
    ...(accessory.compatibility || {}),
    ...(override.compatibility || {})
  };
  const targets = new Set([
    ...(accessory.compatibleWith || []),
    ...(override.compatibleWith || []),
    ...Object.keys(compatibility)
  ]);

  return {
    ...accessory,
    ...override,
    compatibleWith: [...targets].filter(id => compatibility[id]?.status !== 'Do Not Use'),
    compatibility
  };
}
