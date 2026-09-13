// Astera PixelBrick PB15 battery-powered LED fixture.
// Product specifications verified against Astera PixelBrick documentation.
const SRC = 'https://astera-led.com/products/pixelbrick/';

export const ASTERA_PIXELBRICK_FIXTURES = [
  {
    id: 'astera-pixelbrick-pb15',
    manufacturer: 'Astera',
    model: 'PixelBrick PB15',
    family: 'PixelBrick',
    category: 'Light',
    sourceType: 'Titan LED Engine RGBMintAmber',
    totalLedPowerW: 15,
    powerDrawW: 12,
    colorMode: 'RGBMintAmber',
    cri: 96,
    tlci: 96,
    pixels: 1,
    beamAngleDeg: 13,
    luminousFluxLm: { at2700K: 405, at3200K: 475, at5500K: 395 },
    ipRating: 'IP65',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    dimensionsMm: { width: 91, height: 91, depth: 94 },
    weightKg: 1.12,
    control: {
      wired: ['DMX via PWB-2-86'],
      wireless: ['AsteraApp', 'CRMX', 'UHF', 'Bluetooth'],
      builtInCRMX: true,
      builtInBluetoothBridge: true
    },
    sourceUrl: SRC
  }
];

export const ASTERA_PIXELBRICK_ACCESSORIES = [];
