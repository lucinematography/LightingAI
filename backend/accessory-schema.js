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
  'Barn Doors',
  'Iris',
  'Gobo',
  'Gobo Holder',
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
    conditions: [
      'Remove inner baffle',
      'Requires F10 Fresnel',
      'Requires Spotlight Mount or Spotlight Mount II'
    ]
  }
}

Top-level conditions are also supported for dependency rules that apply to every
compatible fixture, for example a gobo holder that always requires a Spotlight
Mount. backend/server.js merges top-level and per-product conditions before the
accessory context is sent to the AI.

Legacy compatibleWith remains supported during migration.
*/
