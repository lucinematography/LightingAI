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
    dmxModes: [{
      name: 'Profile 4 DIM RGB 4ch',
      channels: 4,
      verified: true,
      sourceUrl: 'https://goknight.com/content/documentation/FP6_HydraPanel_DMX_Profiles_V1.pdf',
      controls: [
        { key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'red', label: 'Red', channel: 2, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'green', label: 'Green', channel: 3, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'blue', label: 'Blue', channel: 4, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 }
      ]
    }],
    sourceUrl: SRC,
    manualUrl: MANUAL
  }
];

const HYDRAPANEL = ['astera-hydrapanel-fp6'];

export const ASTERA_HYDRAPANEL_ACCESSORIES = [
  { id: 'astera-fp6-ds-100', manufacturer: 'Astera', model: 'FP6-DS-100 DiffusorSheet 100', category: 'Diffusion', compatibleWith: HYDRAPANEL, sourceUrl: SRC },
  { id: 'astera-fp6-sf-100', manufacturer: 'Astera', model: 'FP6-SF-100 SoftFrame 100', category: 'Diffusion', compatibleWith: HYDRAPANEL, sourceUrl: SRC },
  { id: 'astera-fp6-int-80', manufacturer: 'Astera', model: 'FP6-INT-80 Intensifier 80', category: 'Optical Modifier', compatibleWith: HYDRAPANEL, sourceUrl: SRC },
  { id: 'astera-fp6-egc-40', manufacturer: 'Astera', model: 'FP6-EGC-40 EggCrate 40', category: 'Light Control', compatibleWith: HYDRAPANEL, sourceUrl: SRC },
  { id: 'astera-fp6-egc-60', manufacturer: 'Astera', model: 'FP6-EGC-60 EggCrate 60', category: 'Light Control', compatibleWith: HYDRAPANEL, sourceUrl: SRC },
  { id: 'astera-fp6-gh', manufacturer: 'Astera', model: 'FP6-GH GelHolder', category: 'Filter Holder', compatibleWith: HYDRAPANEL, sourceUrl: SRC }
];
