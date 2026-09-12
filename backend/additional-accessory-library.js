// Additional verified Aputure modifiers that were missing from the original accessory library.
// Sources are official Aputure product/help pages and Aputure compatibility data.
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
    id: 'aputure-300-series-hyper-reflector',
    manufacturer: 'Aputure',
    model: 'Bowens Mount Hyper Reflector for LS 300x/300d II',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: ['aputure-ls-300d-ii', 'aputure-ls-300x'],
    mount: 'Bowens Mount',
    effectOnLight: 'Optimized reflector for the Light Storm 300 series, concentrating the point-source output.',
    sourceUrl: 'https://aputure.com/en-US/collections/replacement-parts'
  },
  {
    id: 'aputure-barndoors-fresnel-2x',
    manufacturer: 'Aputure',
    model: 'Aputure Barn Doors',
    category: 'Barn Doors',
    compatibilityStatus: 'Compatible',
    compatibleWith: ['aputure-ls-300d-ii', 'aputure-ls-300x'],
    mount: 'Fresnel 2X / Aputure reflector',
    gridAngleDeg: 30,
    effectOnLight: 'Four-leaf light shaping with black velvet lining, magnetic gel holder, and 30 degree honeycomb grid.',
    sourceUrl: 'https://aputure.com/EN-US/products/aputure-barndoors'
  },
  {
    id: 'aputure-spotlight-max',
    manufacturer: 'Aputure',
    model: 'Spotlight Max',
    category: 'Spotlight',
    compatibilityStatus: 'Compatible',
    compatibleWith: ['aputure-ls-300d-ii', 'aputure-ls-600d', 'aputure-ls-600c-pro-ii'],
    mount: 'Bowens Mount',
    availableLensAnglesDeg: [19, 36, 50],
    effectOnLight: 'Projection modifier for precise beam shaping and lens-based control.',
    sourceUrl: 'https://aputure.com/EN-US/pages/accessory-compatibility-wizard?compatModuleProduct=spotlight-max-19-lens-set'
  }
];
