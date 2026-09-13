// Astera LeoFresnel AF250 battery-powered Fresnel fixture.
// Canonical specifications from Astera LeoFresnel official specifications.
const SRC = 'https://astera-led.com/fr/products/leofresnel/specs/';

export const ASTERA_LEOFRESNEL_FIXTURES = [
  {
    id: 'astera-leofresnel-af250',
    manufacturer: 'Astera',
    model: 'LeoFresnel AF250',
    family: 'LeoFresnel',
    category: 'Light',
    sourceType: 'Titan LED Engine RGBMintAmber',
    totalLedPowerW: 350,
    powerDrawW: 250,
    colorMode: 'RGBMintAmber',
    cri: 96,
    pixels: 1,
    beamAngleDeg: { min: 15, max: 60 },
    ipRating: 'IP55',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20, maxBrightness: 2 },
    dcInput: '12-48 VDC, max 15 A',
    acInput: '100-240 VAC',
    outputLumens: { cct3200K: 4963, cct4000K: 6378, cct5500K: 7119 },
    control: {
      wired: ['DMX'],
      wireless: ['AsteraApp', 'CRMX'],
      builtInCRMX: true,
      builtInBTB: true
    },
    sourceUrl: SRC
  }
];

export const ASTERA_LEOFRESNEL_ACCESSORIES = [];
