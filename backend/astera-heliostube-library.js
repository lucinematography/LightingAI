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
      wired: ['DMX via FP1-PWB / FP3-DTL / PWB-2-86', 'Art-Net via PowerBox bridge', 'sACN via PowerBox bridge'],
      wireless: ['AsteraApp', 'CRMX', 'UHF', 'Bluetooth', 'Wi-Fi'],
      builtInWirelessDMX: true,
      builtInCRMX: true,
      builtInBluetoothBridge: true,
      directLightingAI: ['Art-Net via PowerBox bridge', 'sACN via PowerBox bridge'],
      externalInterfaceRequired: ['Wired DMX interface or Astera PowerBox', 'CRMX transmitter for CRMX control'],
      unavailableDirectProtocols: ['AsteraApp Bluetooth/UHF/Wi-Fi protocol is not publicly documented for third-party direct control'],
      sourceUrls: [
        'https://astera-led.com/fr/products/helios-tube/specs/',
        'https://update.astera-led.com/release_notes.html'
      ]
    },
    dmxModes: [{
      name: 'Profile 4 DIM RGB 4ch',
      channels: 4,
      verified: true,
      sourceUrl: 'https://device.report/m/4bc78c9a477002bb5c297f8f11244eaa051e3d6fec9752995b3254dd82fd1fdf',
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

const HELIOS = ['astera-heliostube-fp2-btb'];
const HELIOS_AND_HYPERION = ['astera-heliostube-fp2-btb', 'astera-hyperiontube-fp3'];

export const ASTERA_HELIOSTUBE_ACCESSORIES = [
  { id: 'astera-fp1-sp', manufacturer: 'Astera', model: 'FP1-SP SiliconCap', category: 'Weather Protection', compatibleWith: HELIOS_AND_HYPERION, includedWithFixture: true, sourceUrl: MANUAL },
  { id: 'astera-ax1-cp', manufacturer: 'Astera', model: 'AX1-CP CrossPlate', category: 'Multi-light Mount', mount: '5/8 in baby pin', compatibleWith: HELIOS_AND_HYPERION, requires: ['astera-tube-wing-plate'], sourceUrl: MANUAL },
  { id: 'astera-fp2-hnd', manufacturer: 'Astera', model: 'FP2-HND HeliosHandle', category: 'Handheld Mount', compatibleWith: HELIOS, sourceUrl: MANUAL }
];
