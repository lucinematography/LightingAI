// Astera HeliosTube FP2-BTB current wireless LED tube.
// Official product documentation: Astera FP2-BTB HeliosTube user manual.
const SRC = 'https://astera-led.com/helios';
const MANUAL = 'https://www.mad-music.de/wp-content/uploads/2026/06/FP2_HeliosTube_Manual_EN_DE-11.pdf';

export const ASTERA_HELIOSTUBE_FIXTURES = [
  {
    id: 'astera-heliostube-fp2-btb',
    manufacturer: 'Astera',
    model: 'HeliosTube FP2-BTB',
    family: 'HeliosTube',
    category: 'Light',
    sourceType: 'RGBMintAmber LED tube',
    totalLedPowerW: 36,
    powerDrawW: 24,
    colorMode: 'RGBMintAmber',
    cri: 96,
    tlci: 96,
    pixels: 8,
    beamAngleDeg: { min: 120, max: 120 },
    luminousFluxLm: 1340,
    ipRating: 'IP65 with FP1-SP SiliconCap when not wired',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    dimensionsMm: { diameter: 42, length: 550 },
    weightKg: 0.765,
    control: {
      wired: ['DMX via Titan Power/Data Combination Cable'],
      wireless: ['AsteraApp', 'Wireless DMX', 'CRMX', 'Bluetooth Bridge'],
      builtInWirelessDMX: true,
      builtInBluetoothBridge: true
    },
    sourceUrl: SRC,
    manualUrl: MANUAL
  }
];

const HELIOS = ['astera-heliostube-fp2-btb'];

export const ASTERA_HELIOSTUBE_ACCESSORIES = [
  { id: 'astera-fp1-sp', manufacturer: 'Astera', model: 'FP1-SP SiliconCap', category: 'Weather Protection', compatibleWith: HELIOS, includedWithFixture: true, sourceUrl: MANUAL },
  { id: 'astera-ax1-cp', manufacturer: 'Astera', model: 'AX1-CP CrossPlate', category: 'Multi-light Mount', mount: '5/8 in baby pin', compatibleWith: HELIOS, requires: ['astera-tube-wing-plate'], sourceUrl: MANUAL },
  { id: 'astera-fp2-hnd', manufacturer: 'Astera', model: 'FP2-HND HeliosHandle', category: 'Handheld Mount', compatibleWith: HELIOS, sourceUrl: MANUAL }
];
