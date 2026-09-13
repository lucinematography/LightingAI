// Astera PixelBrick PB15 battery-powered LED fixture.
// Product specifications verified against Astera PixelBrick documentation.
const SRC = 'https://astera-led.com/products/pixelbrick/';
const REX_SRC = 'https://astera-led.com/es/products/runtimeextender-gold-mount-kit-of-4/';

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

const PIXELBRICK = ['astera-pixelbrick-pb15'];

export const ASTERA_PIXELBRICK_ACCESSORIES = [
  { id: 'astera-pb15-bmo', manufacturer: 'Astera', model: 'PB15-BMO BrickMount', category: 'Mounting', compatibleWith: PIXELBRICK, sourceUrl: SRC },
  { id: 'astera-pb15-bcn', manufacturer: 'Astera', model: 'PB15-BCN BrickConnect', category: 'Mounting', compatibleWith: PIXELBRICK, sourceUrl: REX_SRC },
  { id: 'astera-pb15-plg', manufacturer: 'Astera', model: 'PB15-PLG Waterproof Protective Cover', category: 'Protection', compatibleWith: PIXELBRICK, sourceUrl: REX_SRC },
  { id: 'astera-ax-hcn', manufacturer: 'Astera', model: 'AX-HCN HexConnect', category: 'Mounting', compatibleWith: PIXELBRICK, sourceUrl: REX_SRC }
];
