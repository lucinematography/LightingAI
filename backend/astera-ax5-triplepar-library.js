// Astera AX5 TriplePAR battery-powered LED PAR.
// Official Astera technical reference manual is the canonical fixture source.
const SRC = 'https://astera-led.com/wp-content/uploads/AX5_TriplePAR_Technical_Reference_Manual_V1.pdf';

export const ASTERA_AX5_TRIPLEPAR_FIXTURES = [
  {
    id: 'astera-ax5-triplepar',
    manufacturer: 'Astera',
    model: 'AX5 TriplePAR',
    family: 'TriplePAR',
    category: 'Light',
    sourceType: '3 x 15W RGBAW LED',
    totalLedPowerW: 45,
    colorMode: 'RGBAW',
    cri: 92,
    pixels: 1,
    beamAngleDeg: 13,
    ipRating: 'IP65',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    dimensionsMm: { diameter: 153.2, height: 140.5 },
    weightKg: 3.4,
    control: {
      wired: ['5-pin XLR DMX'],
      wireless: ['AsteraApp', 'CRMX'],
      builtInCRMX: true
    },
    sourceUrl: SRC
  }
];

export const ASTERA_AX5_TRIPLEPAR_ACCESSORIES = [];
