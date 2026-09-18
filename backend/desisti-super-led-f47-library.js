// De Sisti Super LED F4.7 family.
// Initial verified family for the De Sisti catalog expansion.
// Product and accessory data are sourced from official De Sisti product / datasheet pages.
const SRC = 'https://desisti.it/';
const FAMILY_SRC = 'https://desisti.it/?s=Super+LED+F4.7';

export const DESISTI_SUPER_LED_F47_FIXTURES = [
  {
    id: 'desisti-super-led-f47-t',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 T',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'LED Fresnel',
    colorMode: 'Tungsten',
    cctK: { min: 3200, max: 3200 },
    mount: 'Fresnel fixture',
    control: ['On-board dimming', 'DMX'],
    sourceUrl: FAMILY_SRC
  },
  {
    id: 'desisti-super-led-f47-d',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 D',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'LED Fresnel',
    colorMode: 'Daylight',
    cctK: { min: 5600, max: 5600 },
    mount: 'Fresnel fixture',
    control: ['On-board dimming', 'DMX'],
    sourceUrl: FAMILY_SRC
  },
  {
    id: 'desisti-super-led-f47-vw',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 Vari-White',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'Variable White LED Fresnel',
    colorMode: 'Vari-White',
    mount: 'Fresnel fixture',
    control: ['On-board dimming', 'DMX'],
    sourceUrl: FAMILY_SRC
  },
  {
    id: 'desisti-super-led-f47-vwc',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 Vari-White + Color',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'Variable White + Color LED Fresnel',
    colorMode: 'Vari-White + Color',
    mount: 'Fresnel fixture',
    control: ['On-board dimming', 'DMX'],
    sourceUrl: FAMILY_SRC
  }
];

const ALL = DESISTI_SUPER_LED_F47_FIXTURES.map(x => x.id);

export const DESISTI_SUPER_LED_F47_ACCESSORIES = [
  {
    id: 'desisti-f47-four-leaf-barndoor',
    manufacturer: 'De Sisti',
    model: 'F4.7 Four Leaf Rotating Barndoor',
    category: 'Barn Door',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    effectOnLight: 'Four-leaf rotating light-control accessory for shaping Fresnel spill.',
    sourceUrl: SRC
  },
  {
    id: 'desisti-f47-filter-frame',
    manufacturer: 'De Sisti',
    model: 'F4.7 Filter Frame',
    category: 'Filter Frame',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    effectOnLight: 'Frame for gel, diffusion or color media used with the F4.7 Fresnel family.',
    sourceUrl: SRC
  },
  {
    id: 'desisti-f47-scrim-set',
    manufacturer: 'De Sisti',
    model: 'F4.7 Scrim Set',
    category: 'Scrim Set',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    effectOnLight: 'Wire scrim set for output reduction while preserving Fresnel beam character.',
    sourceUrl: SRC
  },
  {
    id: 'desisti-f47-safety-mesh',
    manufacturer: 'De Sisti',
    model: 'F4.7 Safety Mesh',
    category: 'Safety',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    sourceUrl: SRC
  },
  {
    id: 'desisti-f47-spigot',
    manufacturer: 'De Sisti',
    model: 'F4.7 Stand Spigot',
    category: 'Mounting',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    sourceUrl: SRC
  }
];
