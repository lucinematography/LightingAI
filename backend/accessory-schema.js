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
    conditions: [
      'Remove inner baffle'
    ]
  }
}

Legacy compatibleWith remains supported during migration.
*/
