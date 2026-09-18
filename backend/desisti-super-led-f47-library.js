// De Sisti Super LED F4.7 family.
// Verified from the official De Sisti LED Fresnel Series catalog.
const SRC = 'https://www.desisti.it/wp-content/uploads/LED-Fresnel-Catalog-web.pdf';

export const DESISTI_SUPER_LED_F47_FIXTURES = [
  {
    id: 'desisti-super-led-f47-t',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 T',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'LED Fresnel',
    powerDrawW: 60,
    cctK: { min: 3200, max: 3200 },
    colorMode: 'Tungsten',
    cri: 97,
    tlci: 96,
    beamAngleDeg: { min: 12, max: 54 },
    lensDiameterMm: 120,
    control: ['DMX', 'On-board dimming'],
    sourceUrl: SRC
  },
  {
    id: 'desisti-super-led-f47-d',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 D',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'LED Fresnel',
    powerDrawW: 60,
    cctK: { min: 5600, max: 5600 },
    colorMode: 'Daylight',
    cri: 96,
    tlci: 97,
    beamAngleDeg: { min: 12, max: 54 },
    lensDiameterMm: 120,
    control: ['DMX', 'On-board dimming'],
    sourceUrl: SRC
  },
  {
    id: 'desisti-super-led-f47-vw',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 Vari-White',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'Vari-White LED Fresnel',
    powerDrawW: 60,
    cctK: { min: 2800, max: 6600 },
    colorMode: 'Vari-White',
    cri: 95,
    tlci: 96,
    beamAngleDeg: { min: 12, max: 54 },
    lensDiameterMm: 120,
    control: ['DMX', 'On-board dimming'],
    sourceUrl: SRC
  }
];

const ALL = DESISTI_SUPER_LED_F47_FIXTURES.map(x => x.id);

export const DESISTI_SUPER_LED_F47_ACCESSORIES = [
  {
    id: 'desisti-f47-colorframe',
    manufacturer: 'De Sisti',
    model: 'F4.7 Colorframe',
    category: 'Filter Frame',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    effectOnLight: 'Holds color or diffusion media in front of the Fresnel.',
    sourceUrl: SRC
  },
  {
    id: 'desisti-f47-scrim-set',
    manufacturer: 'De Sisti',
    model: 'F4.7 Set of Scrims',
    category: 'Scrim Set',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    effectOnLight: 'Wire scrims reduce output while preserving Fresnel beam character.',
    sourceUrl: SRC
  },
  {
    id: 'desisti-f47-8-leaf-barndoor',
    manufacturer: 'De Sisti',
    model: 'F4.7 8 Leaf Barndoor',
    category: 'Barn Door',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    effectOnLight: 'Eight-leaf beam shaping and spill control.',
    sourceUrl: SRC
  },
  {
    id: 'desisti-f47-4-leaf-barndoor',
    manufacturer: 'De Sisti',
    model: 'F4.7 4 Leaf Barndoor',
    category: 'Barn Door',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    effectOnLight: 'Four-leaf beam shaping and spill control.',
    sourceUrl: SRC
  },
  {
    id: 'desisti-f47-three-light-soft-case',
    manufacturer: 'De Sisti',
    model: 'Soft Case for Three Super LED F4.7',
    category: 'Transport',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    sourceUrl: SRC
  },
  {
    id: 'desisti-f47-reinforced-moulded-case',
    manufacturer: 'De Sisti',
    model: 'Reinforced Moulded Polyethylene Kit Case',
    category: 'Transport',
    compatibilityStatus: 'Designed For',
    compatibleWith: ALL,
    sourceUrl: SRC
  }
];
