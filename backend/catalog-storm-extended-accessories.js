// Official Aputure STORM accessory expansion verified 2026-09-11.

const STORM_80C = 'aputure-storm-80c';
const STORM_400X = 'aputure-storm-400x';
const STORM_700X = 'aputure-storm-700x';
const STORM_1000C = 'aputure-storm-1000c';
const STORM_1200X = 'aputure-storm-1200x';
const STORM_XT52 = 'aputure-storm-xt52';
const STORM_CS32 = 'aputure-storm-cs32';
const LS_1200D_PRO = 'aputure-ls-1200d-pro';
const LS_600D_PRO = 'aputure-ls-600d-pro';
const LS_600X_PRO = 'aputure-ls-600x-pro';
const LS_300X = 'aputure-ls-300x';
const REFLECTOR_KIT = 'aputure-storm-1000c-1200x-reflector-kit';

const SOURCE_FAMILY = 'https://aputure.com/en-US/product-families/storm';
const SOURCE_80C_WIZARD =
  'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-80c';
const SOURCE_400X_WIZARD =
  'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-400x';
const SOURCE_700X_WIZARD =
  'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-700x';
const SOURCE_400X_BAG = 'https://aputure.com/en-US/products/storm-400x-carrying-bag';
const SOURCE_700X_CASE = 'https://aputure.com/en-US/products/storm-700x-rolling-soft-case';
const SOURCE_1000C_1200X_CASE =
  'https://aputure.com/en-US/products/storm-1000c-1200x-rolling-carrying-case';
const SOURCE_REFLECTOR_CASE =
  'https://aputure.com/en-US/products/storm-1200x-reflector-kit-case';
const SOURCE_XT52_CONTROL_CASE =
  'https://aputure.com/en-US/products/flight-case-for-xt52-control-box';
const SOURCE_XT52_LAMP_CASE =
  'https://aputure.com/en-US/products/flight-case-for-xt52-lamp-head';
const SOURCE_XT52_POWER_CABLE =
  'https://aputure.com/en-US/products/aputure-lp-28-t455-to-bare-leads-power-input-ac-cable-1-m';
const SOURCE_LS1200_CASE =
  'https://aputure.com/en-US/products/rolling-carrying-case-for-ls-1200d-pro';
const SOURCE_LS600_CASE =
  'https://aputure.com/en-US/products/rolling-carrying-case-for-ls-600d-pro';
const SOURCE_LS1200_REFLECTOR_KIT =
  'https://aputure.com/en-US/products/ls-1200d-pro-reflector-kit';
const SOURCE_CLAMP_ADAPTER =
  'https://help.aputure.com/en/modifiers/lightning-clamp-to-ultra-clamp-adapter-kit';

const relation = (sourceUrl, status = 'Compatible', conditions = [], extra = {}) => ({
  status,
  includedWithFixture: false,
  conditions,
  sourceUrl,
  ...extra
});

const designedFor = (sourceUrl, fixtureId, conditions = []) => ({
  compatibilityStatus: 'Designed For',
  compatibleWith: [fixtureId],
  compatibility: {
    [fixtureId]: relation(sourceUrl, 'Designed For', conditions)
  }
});

export const STORM_EXTENDED_ACCESSORIES = [
  {
    id: 'aputure-quick-dome-40',
    manufacturer: 'Aputure',
    model: 'Quick Dome 40',
    category: 'Dome',
    ...designedFor(SOURCE_80C_WIZARD, STORM_80C),
    mount: 'Mini ProLock Mount',
    effectOnLight: '40 cm circular quick-release softbox for broad, controlled diffusion from the STORM 80c.',
    sourceUrl: SOURCE_80C_WIZARD,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-storm-80c-v-mount-bracket-for-power-bank',
    manufacturer: 'Aputure',
    model: 'V-Mount Bracket for Power Bank',
    category: 'Bracket',
    ...designedFor(SOURCE_80C_WIZARD, STORM_80C),
    effectOnLight: 'V-Mount power-bank mounting plate designed for the STORM 80c handheld bracket and USB-C power workflows.',
    sourceUrl: SOURCE_80C_WIZARD,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-spotlight-mini-36-lens-only',
    manufacturer: 'Aputure',
    model: 'Spotlight Mini 36° Lens Only',
    category: 'Lens',
    ...designedFor(SOURCE_80C_WIZARD, STORM_80C, [
      'Replacement 36° lens for the Spotlight Mini body'
    ]),
    beamAngleDeg: { min: 36, max: 36 },
    effectOnLight: 'Replacement 36° projection lens for precise Spotlight Mini beam shaping and gobo projection.',
    sourceUrl: SOURCE_80C_WIZARD,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-spotlight-mini-19-lens-only',
    manufacturer: 'Aputure',
    model: 'Spotlight Mini 19° Lens Only',
    category: 'Lens',
    ...designedFor(SOURCE_80C_WIZARD, STORM_80C, [
      'Replacement 19° lens for the Spotlight Mini body'
    ]),
    beamAngleDeg: { min: 19, max: 19 },
    effectOnLight: 'Replacement 19° projection lens for a narrow, precise Spotlight Mini beam and gobo projection.',
    sourceUrl: SOURCE_80C_WIZARD,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-spotlight-iris-m-size',
    manufacturer: 'Aputure',
    model: 'Spotlight Iris (M Size)',
    category: 'Iris',
    ...designedFor(SOURCE_80C_WIZARD, STORM_80C, [
      '18-blade iris insert for the Spotlight Mini'
    ]),
    effectOnLight: '18-blade iris insert for tightening and shaping the Spotlight Mini projection beam.',
    sourceUrl: SOURCE_80C_WIZARD,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-storm-400x-carrying-bag',
    manufacturer: 'Aputure',
    model: 'STORM 400x Carrying Bag',
    category: 'Other',
    ...designedFor(SOURCE_400X_BAG, STORM_400X),
    effectOnLight: 'Dedicated carrying bag for protecting and transporting the STORM 400x fixture and its core accessories.',
    sourceUrl: SOURCE_400X_BAG,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-storm-700x-rolling-soft-case',
    manufacturer: 'Aputure',
    model: 'STORM 700x Rolling Soft Case',
    category: 'Other',
    ...designedFor(SOURCE_700X_CASE, STORM_700X),
    effectOnLight: 'Dedicated rolling soft case for transporting the STORM 700x and production accessories.',
    sourceUrl: SOURCE_700X_CASE,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-storm-1000c-1200x-rolling-carrying-case',
    manufacturer: 'Aputure',
    model: 'STORM 1000c/1200x Rolling Carrying Case',
    category: 'Other',
    compatibilityStatus: 'Designed For',
    compatibleWith: [STORM_1000C, STORM_1200X],
    compatibility: {
      [STORM_1000C]: relation(SOURCE_1000C_1200X_CASE, 'Designed For'),
      [STORM_1200X]: relation(SOURCE_1000C_1200X_CASE, 'Designed For')
    },
    effectOnLight: 'Dedicated rolling transport case for STORM 1000c and STORM 1200x fixtures, control boxes and cables.',
    sourceUrl: SOURCE_1000C_1200X_CASE,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-storm-1200x-reflector-kit-case',
    manufacturer: 'Aputure',
    model: 'STORM 1200x Reflector Kit Case',
    category: 'Other',
    ...designedFor(SOURCE_REFLECTOR_CASE, REFLECTOR_KIT, [
      'Protective case for the STORM 1000c/1200x Reflector Kit'
    ]),
    effectOnLight: 'Dedicated case for storing and transporting the STORM 1000c/1200x reflector kit.',
    sourceUrl: SOURCE_REFLECTOR_CASE,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-storm-xt52-control-box-flight-case',
    manufacturer: 'Aputure',
    model: 'Flight Case for XT52 Control Box',
    category: 'Other',
    ...designedFor(SOURCE_XT52_CONTROL_CASE, STORM_XT52),
    effectOnLight: 'Protective flight case designed for the STORM XT52 control box.',
    sourceUrl: SOURCE_XT52_CONTROL_CASE,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-storm-xt52-lamp-head-flight-case',
    manufacturer: 'Aputure',
    model: 'Flight Case for XT52 Lamp Head',
    category: 'Other',
    ...designedFor(SOURCE_XT52_LAMP_CASE, STORM_XT52),
    effectOnLight: 'Protective flight case designed for the STORM XT52 lamp head and yoke.',
    sourceUrl: SOURCE_XT52_LAMP_CASE,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-lp-28-t455-to-bare-leads-power-input-ac-cable-1m',
    manufacturer: 'Aputure',
    model: 'LP-28-T455 to Bare Leads Power Input AC Cable (1 m)',
    category: 'Power',
    ...designedFor(SOURCE_XT52_POWER_CABLE, STORM_XT52, [
      'Bare-leads power input cable for the STORM XT52'
    ]),
    effectOnLight: 'One-meter LP-28-T455 to bare-leads AC input cable for professional STORM XT52 power distribution.',
    sourceUrl: SOURCE_XT52_POWER_CABLE,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-spotlight-mount-26-lens-kit',
    manufacturer: 'Aputure',
    model: 'Spotlight Mount 26° Lens Kit',
    category: 'Spotlight',
    ...designedFor(SOURCE_400X_WIZARD, STORM_400X),
    mount: 'ProLock / Bowens Mount',
    beamAngleDeg: { min: 26, max: 26 },
    effectOnLight: 'Ellipsoidal projection optic for a precise 26° beam, gobo projection and controlled shaping on STORM 400x.',
    sourceUrl: SOURCE_400X_WIZARD,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-ls-1200d-pro-rolling-carrying-case',
    manufacturer: 'Aputure',
    model: 'Rolling Carrying Case for LS 1200d Pro',
    category: 'Other',
    ...designedFor(SOURCE_LS1200_CASE, LS_1200D_PRO),
    effectOnLight: 'Dedicated rolling protective case for the LS 1200d Pro lamp head and production accessories.',
    sourceUrl: SOURCE_LS1200_CASE,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-ls-1200d-pro-reflector-kit',
    manufacturer: 'Aputure',
    model: 'LS 1200d Pro Reflector Kit',
    category: 'Reflector',
    ...designedFor(SOURCE_LS1200_REFLECTOR_KIT, LS_1200D_PRO),
    beamAngleDeg: { min: 15, max: 45 },
    effectOnLight: 'Three hyper-reflectors for narrow, medium and wide beam control on LS 1200d Pro.',
    sourceUrl: SOURCE_LS1200_REFLECTOR_KIT,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-ls-600-series-rolling-carrying-case',
    manufacturer: 'Aputure',
    model: 'Rolling Carrying Case for LS 600d/600d Pro/600x Pro/600c Pro',
    category: 'Other',
    compatibilityStatus: 'Designed For',
    compatibleWith: [LS_600D_PRO, LS_600X_PRO],
    compatibility: {
      [LS_600D_PRO]: relation(SOURCE_LS600_CASE, 'Designed For'),
      [LS_600X_PRO]: relation(SOURCE_LS600_CASE, 'Designed For')
    },
    effectOnLight: 'Dedicated rolling protective case for the Aputure LS 600-series lamp heads and accessories.',
    sourceUrl: 'https://aputure.com/en-US/products/rolling-carrying-case-for-ls-600d-pro',
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-spotlight-max-19-lens',
    manufacturer: 'Aputure',
    model: 'Spotlight Max 19° Lens',
    category: 'Lens',
    ...designedFor(SOURCE_400X_WIZARD, STORM_400X),
    beamAngleDeg: { min: 19, max: 19 },
    effectOnLight: 'Replacement 19° projection lens for the Spotlight Max body.',
    sourceUrl: SOURCE_400X_WIZARD,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-cf7-fresnel-and-barn-doors-kit',
    manufacturer: 'Aputure',
    model: 'CF7 Fresnel and Barn Doors Kit',
    category: 'Fresnel',
    ...designedFor(SOURCE_400X_WIZARD, STORM_400X),
    mount: 'ProLock Bowens Mount',
    effectOnLight: 'Combined 7-inch Fresnel and barn-door modifier kit designed for STORM 400x beam control.',
    sourceUrl: SOURCE_400X_WIZARD,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-ultra-clamp',
    manufacturer: 'Aputure',
    model: 'Aputure Ultra Clamp',
    category: 'Bracket',
    compatibilityStatus: 'Compatible',
    compatibleWith: [STORM_CS32, STORM_XT52, STORM_700X, STORM_400X, STORM_1200X, STORM_1000C],
    compatibility: {
      [STORM_CS32]: relation(SOURCE_CLAMP_ADAPTER, 'Designed For', [
        'Included with STORM CS32; its Ultra mounting plate attaches directly to the clamp'
      ], { includedWithFixture: true }),
      [STORM_XT52]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible', [
        'Use with the Lightning Clamp to Ultra Clamp Adapter Kit when the control box has a Lightning mounting plate'
      ]),
      [STORM_700X]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible', [
        'Use with the Lightning Clamp to Ultra Clamp Adapter Kit when the control box has a Lightning mounting plate'
      ]),
      [STORM_400X]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible', [
        'Use with the Lightning Clamp to Ultra Clamp Adapter Kit when the control box has a Lightning mounting plate'
      ]),
      [STORM_1200X]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible', [
        'Use with the Lightning Clamp to Ultra Clamp Adapter Kit when the control box has a Lightning mounting plate'
      ]),
      [STORM_1000C]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible', [
        'Use with the Lightning Clamp to Ultra Clamp Adapter Kit when the control box has a Lightning mounting plate'
      ])
    },
    effectOnLight: 'Heavy-duty clamp for mounting STORM control boxes to round or square tubing; the STORM CS32 mounts directly through its Ultra plate.',
    sourceUrl: SOURCE_CLAMP_ADAPTER,
    verifiedAt: '2026-09-11'
  },
  {
    id: 'aputure-lightning-clamp-to-ultra-clamp-adapter-kit',
    manufacturer: 'Aputure',
    model: 'Lightning Clamp to Ultra Clamp Adapter Kit',
    category: 'Mount Adapter',
    compatibilityStatus: 'Compatible',
    compatibleWith: [
      STORM_XT52,
      STORM_700X,
      STORM_400X,
      STORM_1200X,
      STORM_1000C,
      LS_1200D_PRO,
      LS_600D_PRO,
      LS_600X_PRO,
      LS_300X
    ],
    compatibility: {
      [STORM_XT52]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible'),
      [STORM_700X]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible'),
      [STORM_400X]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible'),
      [STORM_1200X]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible'),
      [STORM_1000C]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible'),
      [LS_1200D_PRO]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible'),
      [LS_600D_PRO]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible'),
      [LS_600X_PRO]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible'),
      [LS_300X]: relation(SOURCE_CLAMP_ADAPTER, 'Compatible'),
      [STORM_CS32]: relation(SOURCE_CLAMP_ADAPTER, 'Do Not Use', [
        'STORM CS32 already ships with an Ultra mounting plate and mounts to the Ultra Clamp directly'
      ])
    },
    effectOnLight: 'Retrofit kit that lets a control box with a Lightning mounting plate attach to the Aputure Ultra Clamp.',
    sourceUrl: SOURCE_CLAMP_ADAPTER,
    verifiedAt: '2026-09-11'
  }
];

export const STORM_EXTENDED_OVERRIDES = {
  'aputure-storm-xt52-head-cable-7-5m': {
    model: 'STORM XT52 Head Cable (7.5m)',
    sourceUrl: 'https://aputure.com/en-US/products/storm-xt52'
  },
  'aputure-storm-xt52-head-cable-15m': {
    model: 'STORM XT52 Head Cable (15m)',
    sourceUrl: SOURCE_FAMILY
  },
  'aputure-quick-dome-90': {
    sourceUrl: SOURCE_FAMILY,
    compatibility: {
      [STORM_400X]: relation(SOURCE_400X_WIZARD, 'Designed For'),
      [STORM_700X]: relation(SOURCE_700X_WIZARD, 'Designed For')
    }
  },
  'aputure-storm-1200x-cf12-fresnel': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_400X_WIZARD, 'Compatible', [
        'Aputure lists CF12 Fresnel as physically compatible with STORM 400x'
      ]),
      [STORM_1000C]: relation(
        'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c',
        'Designed For'
      )
    }
  },
  'aputure-storm-1200x-15-reflector': {
    compatibility: {
      [STORM_1000C]: relation(
        'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c',
        'Designed For'
      )
    }
  },
  'aputure-storm-1200x-30-reflector': {
    compatibility: {
      [STORM_1000C]: relation(
        'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c',
        'Designed For'
      )
    }
  },
  'aputure-storm-1200x-45-reflector': {
    compatibility: {
      [STORM_1000C]: relation(
        'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c',
        'Designed For'
      )
    }
  },
  'aputure-storm-1200x-barn-door-adapter': {
    compatibility: {
      [STORM_1000C]: relation(
        'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c',
        'Designed For'
      )
    }
  },
  'aputure-cf12-barn-doors': {
    compatibility: {
      [STORM_1000C]: relation(
        'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c',
        'Designed For',
        ['Requires STORM 1000c/1200x Barn Doors Adapter for direct fixture mounting']
      )
    }
  },
  'aputure-ls1200d-neutrik-power-cable-6m': {
    compatibility: {
      [STORM_1000C]: relation(
        'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1000c',
        'Compatible',
        ['Aputure lists this 6 m Neutrik Power Cable for STORM 1000c and STORM 1200x']
      )
    }
  },
  'aputure-light-dome-mini-iii': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-light-dome-iii': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-light-dome-se': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-light-dome-150': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-light-box-60x90': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-light-box-30x120': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-light-box-45x45': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-light-octadome-120': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-spotlight-max-19-lens-kit': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-lantern': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-f10-barn-doors': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-ls1200d-neutrik-power-cable-6m': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-space-light-90': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-sidus-one': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  },
  'aputure-sidus-four': {
    compatibility: {
      [STORM_400X]: relation(SOURCE_FAMILY, 'Compatible'),
      [STORM_700X]: relation(SOURCE_FAMILY, 'Compatible')
    }
  }
};

export function mergeStormExtendedAccessory(accessory) {
  const override = STORM_EXTENDED_OVERRIDES[accessory.id];
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
