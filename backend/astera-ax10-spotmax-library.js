// Discontinued Astera AX10 SpotMax high-output RGBAW spotlight.
// Canonical specifications from the Astera AX10 SpotMax datasheet and manual.
const SRC = 'https://astera-led.com/products/ax10-spotmax/';

export const ASTERA_AX10_SPOTMAX_FIXTURES = [
  {
    id: 'astera-ax10-spotmax',
    manufacturer: 'Astera',
    model: 'AX10 SpotMax',
    family: 'AX10',
    category: 'Light',
    discontinued: true,
    sourceType: '9 × 15 W Philips RGBAW LEDs',
    totalLedPowerW: 135,
    powerDrawW: 135,
    colorMode: 'RGBAW',
    cri: 92,
    pixels: 1,
    beamAngleDeg: 13,
    luminousFluxLm: 3350,
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    chargingTimeHours: 7,
    acInput: '90–264 VAC, 47–63 Hz',
    ipRating: 'IP65',
    weightKg: 7.98,
    dimensionsMm: { length: 279, width: 253, height: 296 },
    control: {
      wired: [],
      wireless: ['AsteraApp', 'CRMX', 'W-DMX', 'UHF'],
      builtInCRMX: true,
      builtInBTB: false
    },
    dmxModes: [{
      name: 'Profile 4 DIM RGB 4ch',
      channels: 4,
      verified: true,
      sourceUrl: 'https://astera-led.com/wp-content/uploads/AX10_SpotMax_DMX_Profiles_V1.pdf',
      controls: [
        { key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'red', label: 'Red', channel: 2, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'green', label: 'Green', channel: 3, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'blue', label: 'Blue', channel: 4, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 }
      ]
    }],
    sourceUrl: SRC
  }
];

const AX10 = ['astera-ax10-spotmax'];

export const ASTERA_AX10_SPOTMAX_ACCESSORIES = [
  { id: 'astera-ax10-charging-case', manufacturer: 'Astera', model: 'AX10 Charging Case', category: 'Charging / Transport', compatibleWith: AX10, sourceUrl: SRC }
];
