// Astera AX2 PixelBar battery-powered linear LED fixtures.
// Canonical specifications from Astera AX2 PixelBar datasheet.
const SRC = 'https://astera-led.com/products/ax2-pixelbar/';
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
    control: {
      wired: ['DMX'],
      wireless: ['AsteraApp via AsteraBox/UHF', 'CRMX', 'Bluetooth on AX2-50-BTB variant', 'WiFi on AX2-50-BTB variant'],
      builtInCRMX: true,
      builtInBTBVariant: 'AX2-50-BTB',
      directLightingAI: [],
      externalInterfaceRequired: ['Wired DMX interface for DMX control', 'CRMX transmitter for CRMX control', 'AsteraBox for AsteraApp/UHF control'],
      unavailableDirectProtocols: ['AsteraApp Bluetooth/UHF/Wi-Fi protocol is not publicly documented for third-party direct control'],
      sourceUrls: [
        'https://update.astera-led.com/release_notes/ax2_50/release_notes',
        'https://astera-led.com/wp-content/uploads/ART7_AsteraBox_Datasheet_V3.pdf'
      ]
    },
    dmxModes: [{
      name: 'Profile 4 DIM RGB 4ch',
      channels: 4,
      verified: true,
      sourceUrl: 'https://astera-led.com/products/ax2-pixelbar/downloads/',
      controls: [
        { key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'red', label: 'Red', channel: 2, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'green', label: 'Green', channel: 3, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'blue', label: 'Blue', channel: 4, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 }
      ]
    }],
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
    control: {
      wired: ['DMX'],
      wireless: ['AsteraApp via AsteraBox/UHF', 'CRMX', 'Bluetooth on AX2-100-BTB variant', 'WiFi on AX2-100-BTB variant'],
      builtInCRMX: true,
      builtInBTBVariant: 'AX2-100-BTB',
      directLightingAI: [],
      externalInterfaceRequired: ['Wired DMX interface for DMX control', 'CRMX transmitter for CRMX control', 'AsteraBox for AsteraApp/UHF control'],
      unavailableDirectProtocols: ['AsteraApp Bluetooth/UHF/Wi-Fi protocol is not publicly documented for third-party direct control'],
      sourceUrls: [
        'https://update.astera-led.com/release_notes/ax2_50/release_notes',
        'https://astera-led.com/wp-content/uploads/ART7_AsteraBox_Datasheet_V3.pdf'
      ]
    },
    dmxModes: [{
      name: 'Profile 4 DIM RGB 4ch',
      channels: 4,
      verified: true,
      sourceUrl: 'https://astera-led.com/products/ax2-pixelbar/downloads/',
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
