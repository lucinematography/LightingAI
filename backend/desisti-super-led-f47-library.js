// De Sisti Super LED F4.7 family.
// Verified from official De Sisti product pages and data sheets.
const SRC = 'https://www.desisti.it/super-led-f4-7/';
const DMX_MANUAL = 'https://www.desisti.it/wp-content/uploads/2017/03/CE-INSTRUCTION-MANUAL-SUPER-LED-FRESNEL-F4.7.pdf';
const VW_DMX_MANUAL = 'https://www.desisti.it/wp-content/uploads/2018/12/NEW_CE-INSTRUCTION-MANUAL-SUPER-LED-FRESNEL-F4.7-Vari-White.pdf';
const VWC_SRC = 'https://www.desisti.it/wp-content/uploads/SUPER-LED-F4.7-VWC-04-2022-W-PHOTOMETRICS.pdf';

export const DESISTI_SUPER_LED_F47_FIXTURES = [
  {
    id: 'desisti-super-led-f47-t',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 T',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'LED Fresnel',
    ledPowerW: 60,
    powerDrawW: 75,
    cctK: { min: 3200, max: 3200 },
    colorMode: 'Tungsten',
    cri: 97,
    tlci: 96,
    beamAngleDeg: { min: 12, max: 54 },
    lensDiameterMm: 120,
    ipRating: 'IP22',
    control: ['DMX512', 'On-board dimming'],
    dmxModes: [
      { name: '8-bit dimmer', channels: 1, verified: true, sourceUrl: DMX_MANUAL, controls: [{ key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 }] },
      { name: '16-bit dimmer', channels: 2, verified: true, sourceUrl: DMX_MANUAL, controls: [{ key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', bits: 16, min: 0, max: 100, dmxMin: 0, dmxMax: 65535 }] }
    ],
    sourceUrl: SRC
  },
  {
    id: 'desisti-super-led-f47-d',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 D',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'LED Fresnel',
    ledPowerW: 60,
    powerDrawW: 75,
    cctK: { min: 5600, max: 5600 },
    colorMode: 'Daylight',
    cri: 96,
    tlci: 97,
    beamAngleDeg: { min: 12, max: 54 },
    lensDiameterMm: 120,
    ipRating: 'IP22',
    control: ['DMX512', 'On-board dimming'],
    dmxModes: [
      { name: '8-bit dimmer', channels: 1, verified: true, sourceUrl: DMX_MANUAL, controls: [{ key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 }] },
      { name: '16-bit dimmer', channels: 2, verified: true, sourceUrl: DMX_MANUAL, controls: [{ key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', bits: 16, min: 0, max: 100, dmxMin: 0, dmxMax: 65535 }] }
    ],
    sourceUrl: SRC
  },
  {
    id: 'desisti-super-led-f47-vw',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 Vari-White',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'Vari-White LED Fresnel',
    ledPowerW: 60,
    powerDrawW: 75,
    cctK: { min: 2800, max: 6600 },
    colorMode: 'Vari-White',
    cri: 95,
    tlci: 96,
    beamAngleDeg: { min: 12, max: 54 },
    lensDiameterMm: 120,
    ipRating: 'IP22',
    control: ['DMX512', 'On-board dimming'],
    dmxModes: [
      { name: 'Vari-White', channels: 3, verified: true, sourceUrl: VW_DMX_MANUAL, controls: [{ key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 }] },
      { name: 'Vari-White 16-bit', channels: 4, verified: true, sourceUrl: VW_DMX_MANUAL, controls: [{ key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', bits: 16, min: 0, max: 100, dmxMin: 0, dmxMax: 65535 }] }
    ],
    sourceUrl: SRC
  },
  {
    id: 'desisti-super-led-f47-vwc',
    manufacturer: 'De Sisti',
    model: 'Super LED F4.7 VW+C',
    family: 'Super LED F4.7',
    category: 'Light',
    sourceType: 'Vari-White + Color LED Fresnel',
    ledPowerW: 100,
    powerDrawW: 115,
    cctK: { min: 1750, max: 14500 },
    colorMode: 'Vari-White + RGBA',
    cri: 95,
    tlci: 96,
    beamAngleDeg: { min: 12, max: 55 },
    lensDiameterMm: 120,
    ipRating: 'IP20',
    control: ['DMX512/RDM', 'On-board'],
    sourceUrl: VWC_SRC
  }
];

const ALL = DESISTI_SUPER_LED_F47_FIXTURES.map(x => x.id);

export const DESISTI_SUPER_LED_F47_ACCESSORIES = [
  { id: 'desisti-302-631', manufacturer: 'De Sisti', model: '302.631 Reinforced Moulded Polyethylene Kit Case', category: 'Transport', compatibilityStatus: 'Designed For', compatibleWith: ALL, sourceUrl: SRC },
  { id: 'desisti-306-100', manufacturer: 'De Sisti', model: '306.100 Four Leaf Rotating Barndoor', category: 'Barn Door', compatibilityStatus: 'Designed For', compatibleWith: ALL, effectOnLight: 'Four-leaf beam shaping and spill control.', sourceUrl: SRC },
  { id: 'desisti-306-200', manufacturer: 'De Sisti', model: '306.200 Eight Leaf Rotating Barndoor', category: 'Barn Door', compatibilityStatus: 'Designed For', compatibleWith: ALL, effectOnLight: 'Eight-leaf beam shaping and spill control.', sourceUrl: SRC },
  { id: 'desisti-307-100', manufacturer: 'De Sisti', model: '307.100 Colorframe', category: 'Filter Frame', compatibilityStatus: 'Designed For', compatibleWith: ALL, sourceUrl: SRC },
  { id: 'desisti-308-100', manufacturer: 'De Sisti', model: '308.100 Cone with Two Discs', category: 'Snoot / Cone', compatibilityStatus: 'Designed For', compatibleWith: ALL, effectOnLight: 'Narrows and controls spill from the Fresnel beam.', sourceUrl: SRC },
  { id: 'desisti-309-100', manufacturer: 'De Sisti', model: '309.100 Stainless Steel Scrim Set', category: 'Scrim Set', compatibilityStatus: 'Designed For', compatibleWith: ALL, effectOnLight: 'Reduces output while preserving beam shape.', sourceUrl: SRC }
];
