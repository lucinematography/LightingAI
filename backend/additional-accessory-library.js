// Additional verified Aputure modifiers that were missing from the original accessory library.
// Sources are official Aputure product/help pages.
export const ADDITIONAL_ACCESSORY_LIBRARY = [
  {
    id: 'aputure-fresnel-2x',
    manufacturer: 'Aputure',
    model: 'Fresnel 2X',
    category: 'Fresnel',
    compatibilityStatus: 'Compatible',
    compatibleWith: ['aputure-ls-300d-ii'],
    mount: 'Bowens Mount',
    beamAngleDeg: { min: 12, max: 40 },
    weightKg: 1.24,
    dimensionsMm: { width: 180, height: 180, depth: 141 },
    effectOnLight: 'Dual-lens focusing Fresnel with adjustable 12-40 degree spot-to-flood beam.',
    sourceUrl: 'https://aputure.com/EN-US/products/fresnel-2x'
  },
  {
    id: 'aputure-spotlight-max',
    manufacturer: 'Aputure',
    model: 'Spotlight Max',
    category: 'Spotlight',
    compatibilityStatus: 'Compatible',
    compatibleWith: ['aputure-ls-600c-pro-ii'],
    mount: 'Bowens Mount',
    availableLensAnglesDeg: [19, 36, 50],
    effectOnLight: 'Projection modifier for precise beam shaping and lens-based control.',
    sourceUrl: 'https://aputure.com/en-US/products/ls-600c-pro-ii'
  }
];
