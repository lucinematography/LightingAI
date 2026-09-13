// Astera AX2 PixelBar battery-powered linear LED fixtures.
// Canonical specifications from Astera AX2 PixelBar datasheet.
const SRC = 'https://device.report/m/0e05d49354ab0a17b88c19119c7db803ce0c9e24c36414278e744506af83e11f';
const CHARGING_CASE_SRC = 'https://astera-led.com/products/charging-case-for-ax2/downloads/';

export const ASTERA_AX2_PIXELBAR_FIXTURES = [
  {
    id: 'astera-ax2-50-pixelbar',
    manufacturer: 'Astera',
    model: 'AX2-50 PixelBar',
    family: 'AX2 PixelBar',
    category: 'Light',
    sourceType: 'Titan LED Engine RGBMintAmber',
    totalLedPowerW: 80,
    powerDrawW: 40,
    colorMode: 'RGBMintAmber',
    cri: 96,
    pixels: 8,
    beamAngleDeg: 21,
    ipRating: 'IP65',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    dimensionsMm: { length: 500, width: 165, height: 65 },
    weightKg: 4.5,
    control: { wired: ['DMX'], wireless: ['AsteraApp', 'CRMX'], builtInCRMX: true },
    sourceUrl: SRC
  },
  {
    id: 'astera-ax2-100-pixelbar',
    manufacturer: 'Astera',
    model: 'AX2-100 PixelBar',
    family: 'AX2 PixelBar',
    category: 'Light',
    sourceType: 'Titan LED Engine RGBMintAmber',
    totalLedPowerW: 160,
    powerDrawW: 80,
    colorMode: 'RGBMintAmber',
    cri: 96,
    pixels: 16,
    beamAngleDeg: 21,
    ipRating: 'IP65',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    dimensionsMm: { length: 1000, width: 165, height: 65 },
    weightKg: 7.4,
    control: { wired: ['DMX'], wireless: ['AsteraApp', 'CRMX'], builtInCRMX: true },
    sourceUrl: SRC
  }
];

const AX2_50 = ['astera-ax2-50-pixelbar'];
const AX2_100 = ['astera-ax2-100-pixelbar'];

export const ASTERA_AX2_PIXELBAR_ACCESSORIES = [
  {
    id: 'astera-ax2-50-chrcse',
    manufacturer: 'Astera',
    model: 'Charging Case for AX2-50',
    category: 'Charging / Transport',
    compatibleWith: AX2_50,
    sourceUrl: CHARGING_CASE_SRC
  },
  {
    id: 'astera-ax2-100-chrcse',
    manufacturer: 'Astera',
    model: 'Charging Case for AX2-100',
    category: 'Charging / Transport',
    compatibleWith: AX2_100,
    sourceUrl: CHARGING_CASE_SRC
  }
];
