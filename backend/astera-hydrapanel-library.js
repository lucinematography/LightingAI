// Astera HydraPanel FP6 wireless LED softlight.
// Official product documentation: Astera FP6 HydraPanel user manual.
const SRC = 'https://astera-led.com/hydra';
const MANUAL = 'https://cdn.stormlighting.co.uk/content/2024/02/Astera_HydraPanel_Manual.pdf';

export const ASTERA_HYDRAPANEL_FIXTURES = [
  {
    id: 'astera-hydrapanel-fp6',
    manufacturer: 'Astera',
    model: 'HydraPanel FP6',
    family: 'HydraPanel',
    category: 'Light',
    sourceType: 'RGBMintAmber LED softlight',
    totalLedPowerW: 25,
    powerDrawW: 17,
    colorMode: 'RGBMintAmber',
    cri: 96,
    tlci: 96,
    pixels: 6,
    beamAngleDeg: { horizontal: 110, vertical: 100 },
    luminousFluxLm: 1298,
    ipRating: 'IP65 with PB15-PLG DC Covers or approved power/data cables',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20, fullBrightness: 1.75 },
    dimensionsMm: { width: 166, height: 85, depth: 44 },
    weightKg: 0.6,
    control: {
      wired: ['DMX via FP1-PWB, FP3-DTL or PWB-2-86'],
      wireless: ['AsteraApp', 'Wireless DMX', 'CRMX', 'Bluetooth Bridge'],
      builtInWirelessDMX: true,
      builtInCRMX: true,
      builtInBluetoothBridge: true
    },
    sourceUrl: SRC,
    manualUrl: MANUAL
  }
];

export const ASTERA_HYDRAPANEL_ACCESSORIES = [];
