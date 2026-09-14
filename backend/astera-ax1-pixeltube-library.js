// Discontinued Astera AX1 PixelTube RGBW fixture and system accessories.
// Canonical specifications from the Astera AX1 PixelTube datasheet.
const SRC = 'https://astera-led.com/products/ax1-pixeltube/';

export const ASTERA_AX1_PIXELTUBE_FIXTURES = [
  {
    id: 'astera-ax1-pixeltube',
    manufacturer: 'Astera',
    model: 'AX1 PixelTube',
    family: 'AX1',
    category: 'Light',
    discontinued: true,
    sourceType: 'RGBW LED Tube',
    totalLedPowerW: 28,
    powerDrawW: 28,
    colorMode: 'RGBW',
    pixels: 16,
    beamAngleDeg: 180,
    luminousFluxLm: 695,
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    chargingTimeHours: 7,
    dcInput: '48 VDC, 0.5 A',
    ipRating: 'IP65',
    weightKg: 1,
    dimensionsMm: { diameter: 42, length: 1035 },
    control: {
      wired: [],
      wireless: ['AsteraApp', 'CRMX', 'W-DMX', 'UHF'],
      builtInCRMX: true,
      builtInBTB: false
    },
    sourceUrl: SRC
  }
];

const AX1 = ['astera-ax1-pixeltube'];

export const ASTERA_AX1_PIXELTUBE_ACCESSORIES = [
  { id: 'astera-ax1-chr', manufacturer: 'Astera', model: 'AX1-CHR Charger', category: 'Power', compatibleWith: AX1, includedWithFixture: true, sourceUrl: SRC },
  { id: 'astera-ax1-eblt', manufacturer: 'Astera', model: 'AX1-EBLT Eye Bolt', category: 'Safety / Mounting', compatibleWith: AX1, includedWithFixture: true, sourceUrl: SRC },
  { id: 'astera-ax1-chrcse', manufacturer: 'Astera', model: 'AX1-CHRCSE Charging Case', category: 'Charging / Transport', compatibleWith: AX1, sourceUrl: SRC }
];
