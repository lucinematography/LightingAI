export const ACCESSORY_CATEGORIES = [
  'Reflector',
  'Fresnel',
  'Spotlight',
  'Lens',
  'Softbox',
  'Dome',
  'Lantern',
  'Grid',
  'Barn Door',
  'Iris',
  'Diffusion',
  'Mount Adapter',
  'Cable',
  'Power',
  'Control',
  'Yoke',
  'Bracket',
  'Other'
];

export const COMPATIBILITY_STATUS = [
  'Designed For',
  'Compatible',
  'Compatible but not optimized',
  'Do Not Use'
];

/*
Per-product compatibility model:

compatibility: {
  'fixture-or-accessory-id': {
    status: 'Compatible',
    includedWithFixture: false,
    conditions: [
      'Remove inner baffle'
    ],
    requiresAccessoryId: 'optional-required-accessory-id'
  }
}

includedWithFixture inside a compatibility entry is authoritative for that
specific fixture. The legacy top-level includedWithFixture value remains
supported as a fallback during migration.

requiresAccessoryId records a dependency when an accessory requires another
accessory for the stated compatibility relationship (for example, barn doors
that require a mounting adapter).

Legacy compatibleWith remains supported during migration.
*/
