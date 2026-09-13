// Astera HyperionTube FP3 wireless LED tube.
// Official product documentation: Astera FP3 HyperionTube user manual.
const SRC = 'https://astera-led.com/hyperion';
const MANUAL = 'https://www.innovationlighting.net/wp-content/uploads/2023/10/FP3_HyperionTube_Manual_EN_DE_IT_ES_FR_CN.pdf';

export const ASTERA_HYPERIONTUBE_FIXTURES = [
  {
    id: 'astera-hyperiontube-fp3',
    manufacturer: 'Astera',
    model: 'HyperionTube FP3',
    family: 'HyperionTube',
    category: 'Light',
    sourceType: 'RGBMintAmber LED tube',
    totalLedPowerW: 144,
    powerDrawW: 92,
    colorMode: 'RGBMintAmber',
    cri: 96,
    tlci: 96,
    pixels: 32,
    beamAngleDeg: { min: 120, max: 120 },
    luminousFluxLm: 5800,
    ipRating: 'IP65 with FP1-SP SiliconCap on DC socket',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    dimensionsMm: { diameter: 43, length: 2031 },
    weightKg: 2.9,
    control: {
      wired: ['DMX via Titan Power/Data Combination Cable'],
      wireless: ['AsteraApp via Bluetooth Bridge', 'Wireless DMX', 'CRMX'],
      builtInWirelessDMX: true,
      builtInBluetoothBridge: false
    },
    sourceUrl: SRC,
    manualUrl: MANUAL
  }
];

export const ASTERA_HYPERIONTUBE_ACCESSORIES = [];
