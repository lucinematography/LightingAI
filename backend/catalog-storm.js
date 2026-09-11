import { STORM_CINE_KIT_ACCESSORIES, mergeStormCineKitAccessory } from './catalog-storm-cine-kits.js';
import {
  STORM_COMPATIBILITY_ACCESSORIES,
  mergeStormCompatibilityAccessory
} from './catalog-storm-compatibility-pass.js';
import {
  STORM_EXTENDED_ACCESSORIES,
  mergeStormExtendedAccessory
} from './catalog-storm-extended-accessories.js';
import { ELECTRO_STORM_FIXTURES, ELECTRO_STORM_ACCESSORIES, mergeElectroStormAccessory } from './catalog-electro-storm.js';
import { HIGH_POWER_STORM_FIXTURES, HIGH_POWER_STORM_ACCESSORIES, mergeHighPowerStormAccessory } from './catalog-storm-high-power.js';
import { APUTURE_EXPANSION_ACCESSORIES } from './catalog-aputure-expansion.js';
import { APUTURE_INFINIMAT_ACCESSORIES } from './catalog-aputure-infinimat.js';
import { APUTURE_INFINIBAR_COMPLETION_ACCESSORIES } from './catalog-aputure-infinibar-completion.js';
import {
  FIXTURE_LIBRARY as BASE_FIXTURE_LIBRARY,
  ACCESSORY_CATALOG as BASE_ACCESSORY_CATALOG
} from './catalog.js';

const STORM_80C_ID = 'aputure-storm-80c';

const STORM_80C_FIXTURES = [
  {
    id: STORM_80C_ID,
    manufacturer: 'Aputure',
    model: 'STORM 80c',
    category: 'Light',
    sourceType: 'BLAIR-CG Full-Color LED',
    powerDrawW: 100,
    outputPowerW: 80,
    cctK: { min: 1800, max: 20000 },
    colorMode: 'Full Color',
    colorGamut: '90%+ Rec.2020',
    cri: 97,
    tlci: 99,
    ssi: { tungsten: 88, daylight: 84 },
    beamAngleDeg: 60,
    includedReflectorBeamAngleDeg: 35,
    mount: 'Mini ProLock Bowens Mount',
    greenMagentaAdjustment: '±G 100% (Full ASC MITC Range)',
    control: ['On-board', 'Sidus Link', 'Sidus Link Pro', 'DMX/RDM', 'CRMX'],
    acInput: '100-240V AC, 50/60Hz',
    dcInput: '12-19V',
    batterySupport: '14.4V V-Mount via optional handheld bracket; 100W USB-C input supported',
    ipRating: 'IP65',
    weightKg: 1.35,
    sourceUrl: 'https://aputure.com/en-US/products/storm-80c'
  }
];

const STORM_80C_ACCESSORIES = [
  {
    id: 'aputure-storm-80c-mini-prolock-hyper-reflector',
    manufacturer: 'Aputure',
    model: 'STORM 80c Mini ProLock Hyper Reflector',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    },
    beamAngleDeg: { min: 35, max: 35 },
    effectOnLight: 'Included reflector that narrows the native 60-degree beam to a more intense 35-degree beam.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-80c'
  },
  {
    id: 'aputure-storm-80c-mini-lantern-diffuser',
    manufacturer: 'Aputure',
    model: 'STORM 80c Mini Lantern Diffuser',
    category: 'Lantern',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    },
    effectOnLight: 'Included compact diffuser for broad soft illumination.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-80c'
  },
  {
    id: 'aputure-storm-80c-ac-power-adapter',
    manufacturer: 'Aputure',
    model: 'STORM 80c AC Power Adapter',
    category: 'Power',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    },
    effectOnLight: 'Included AC power supply providing the fixture with 19V DC power.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-80c'
  },
  {
    id: 'aputure-storm-80c-ac-power-cable-4m',
    manufacturer: 'Aputure',
    model: 'STORM 80c AC Power Cable (4m)',
    category: 'Power',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: true,
        conditions: []
      }
    },
    effectOnLight: 'Included mains power cable for the STORM 80c AC power adapter.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-80c'
  },
  {
    id: 'aputure-storm-80c-dtap-to-locking-barrel-power-cable',
    manufacturer: 'Aputure',
    model: 'Locking D-Tap to 5.5mm DC Barrel Power Cable',
    category: 'Power',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Allows compatible D-Tap battery power to feed the STORM 80c DC input.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-locking-barrel-extension-cable-3m',
    manufacturer: 'Aputure',
    model: 'Locking 5.5mm DC to 5.5mm DC Barrel Extension Cable (3m)',
    category: 'Power',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Extends the low-voltage DC power connection by 3 meters.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-spotlight-mini-36-lens-kit',
    manufacturer: 'Aputure',
    model: 'Spotlight Mini 36° Lens Kit',
    category: 'Spotlight',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    mount: 'Mini ProLock Mount',
    beamAngleDeg: { min: 36, max: 36 },
    effectOnLight: 'Compact ellipsoidal projector with integrated four-leaf cutter for precise 36-degree beam shaping and gobo projection.',
    sourceUrl: 'https://aputure.com/en-US/products/spotlight-mini-36-lens-kit'
  },
  {
    id: 'aputure-spotlight-mini-19-lens-kit',
    manufacturer: 'Aputure',
    model: 'Spotlight Mini 19° Lens Kit',
    category: 'Spotlight',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    mount: 'Mini ProLock Mount',
    beamAngleDeg: { min: 19, max: 19 },
    effectOnLight: 'Compact ellipsoidal projector for a narrow, precise 19-degree shaped beam and gobo projection.',
    sourceUrl: 'https://aputure.com/en-US/products/spotlight-mini-19-lens-kit'
  },
  {
    id: 'aputure-lantern-30',
    manufacturer: 'Aputure',
    model: 'Lantern 30',
    category: 'Lantern',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Small omnidirectional softbox designed specifically for broad soft output from the STORM 80c.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-storm-80c-baby-pin-adapter',
    manufacturer: 'Aputure',
    model: 'Baby Pin to Anti-Rotating 3/8in Screw Adapter',
    category: 'Mount Adapter',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Adapts the fixture anti-rotating 3/8in mounting point to a standard baby pin.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-super-clamp',
    manufacturer: 'Aputure',
    model: 'Aputure Super Clamp',
    category: 'Other',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Grip clamp with an anti-rotating 3/8in mounting interface for compact fixture rigging.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-universal-magic-arm',
    manufacturer: 'Aputure',
    model: 'Aputure Universal Magic Arm',
    category: 'Other',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Dual-ball-joint mounting arm for positioning the STORM 80c in compact rigs.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-storm-80c-bowens-mount-adapter',
    manufacturer: 'Aputure',
    model: 'STORM 80c Bowens Mount Adapter',
    category: 'Mount Adapter',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    mount: 'Mini ProLock to full-size Bowens Mount',
    effectOnLight: 'Adapts the Mini ProLock mount to standard full-size Bowens modifiers.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-storm-80c-handheld-bracket',
    manufacturer: 'Aputure',
    model: 'STORM 80c Handheld Bracket',
    category: 'Bracket',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Includes a V-Mount battery plate and D-Tap to 5.5mm DC barrel cable']
      }
    },
    effectOnLight: 'Hand grip and V-Mount battery support for portable handheld or stand-mounted operation.',
    sourceUrl: 'https://aputure.com/en-US/products/storm-80c-handheld-bracket'
  },
  {
    id: 'aputure-cf4-fresnel',
    manufacturer: 'Aputure',
    model: 'CF4 Fresnel',
    category: 'Fresnel',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    mount: 'Mini ProLock Mount',
    effectOnLight: 'Compact Fresnel designed for the STORM 80c to create a controllable hard-light beam.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-light-dome-40',
    manufacturer: 'Aputure',
    model: 'Light Dome 40',
    category: 'Dome',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Compact softbox designed for the STORM 80c for controlled diffused key and fill light.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-sidus-one',
    manufacturer: 'Aputure',
    model: 'Sidus One',
    category: 'Control',
    compatibilityStatus: 'Compatible',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Compatible',
        includedWithFixture: false,
        conditions: []
      }
    },
    effectOnLight: 'Single-universe CRMX transceiver with built-in battery for professional wireless lighting control.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-sidus-one-dmx-2-way-splitter-cable',
    manufacturer: 'Aputure',
    model: 'Sidus One DMX 2-Way Splitter Cable',
    category: 'Cable',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        requiresAccessoryId: 'aputure-sidus-one',
        conditions: ['Use with Sidus One for wired DMX connectivity']
      }
    },
    effectOnLight: '5-pin DMX to 3-pin push-pull adapter cable for linking Sidus One with the STORM 80c control port.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  },
  {
    id: 'aputure-storm-80c-3-light-kit-empty-hard-case',
    manufacturer: 'Aputure',
    model: 'STORM 80c 3-Light Kit Empty Hard Case',
    category: 'Other',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
        status: 'Designed For',
        includedWithFixture: false,
        conditions: ['Designed to transport three STORM 80c fixtures and accessories']
      }
    },
    effectOnLight: 'Protective rolling transport case for a three-light STORM 80c kit.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c'
  }
];

const STORM_80C_OVERRIDES = {
  'aputure-sidus-four': {
    compatibleWith: [STORM_80C_ID],
    compatibility: {
      [STORM_80C_ID]: {
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
  const override = STORM_80C_OVERRIDES[baseAccessory.id];
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
  ...STORM_80C_FIXTURES,
  ...HIGH_POWER_STORM_FIXTURES,
  ...ELECTRO_STORM_FIXTURES
];

export const ACCESSORY_CATALOG = [
  ...BASE_ACCESSORY_CATALOG.map(mergeAccessory).map(mergeHighPowerStormAccessory),
  ...STORM_80C_ACCESSORIES.map(mergeHighPowerStormAccessory),
  ...HIGH_POWER_STORM_ACCESSORIES,
  ...ELECTRO_STORM_ACCESSORIES,
  ...APUTURE_EXPANSION_ACCESSORIES,
  ...APUTURE_INFINIMAT_ACCESSORIES,
  ...APUTURE_INFINIBAR_COMPLETION_ACCESSORIES,
  ...STORM_CINE_KIT_ACCESSORIES,
  ...STORM_COMPATIBILITY_ACCESSORIES,
  ...STORM_EXTENDED_ACCESSORIES
].map(mergeElectroStormAccessory)
  .map(mergeStormCineKitAccessory)
  .map(mergeStormCompatibilityAccessory)
  .map(mergeStormExtendedAccessory);
