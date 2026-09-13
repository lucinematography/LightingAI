// Astera PlutoFresnel AF80 battery-powered Fresnel fixture.
// Canonical specifications from Astera PlutoFresnel AF80 datasheet.
const SRC = 'https://device.report/m/7900b3533fa233ad3d3561c4ab1190bafc0f3175a56bb2f5ddd151b7651fc1ce';

export const ASTERA_PLUTOFRESNEL_FIXTURES = [
  {
    id: 'astera-plutofresnel-af80',
    manufacturer: 'Astera',
    model: 'PlutoFresnel AF80',
    family: 'PlutoFresnel',
    category: 'Light',
    sourceType: 'Titan LED Engine RGBMintAmber',
    totalLedPowerW: 105,
    powerDrawW: 80,
    colorMode: 'RGBMintAmber',
    cri: 96,
    pixels: 1,
    beamAngleDeg: { min: 15, max: 60 },
    ipRating: 'IP55',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20, maxBrightness: 3 },
    chargingTimeHours: 3.5,
    dcInput: '24 VDC, 80 W',
    dimensionsMm: { length: 281.9, width: 153.5, height: 161.8 },
    weightKg: 4.637,
    control: {
      wired: ['DMX'],
      wireless: ['AsteraApp', 'CRMX'],
      builtInCRMX: true,
      builtInBTB: true
    },
    sourceUrl: SRC
  }
];

export const ASTERA_PLUTOFRESNEL_ACCESSORIES = [];
