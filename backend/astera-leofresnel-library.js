// Astera LeoFresnel AF250 battery-powered Fresnel fixture.
// Canonical specifications from Astera LeoFresnel official specifications.
const SRC = 'https://astera-led.com/fr/products/leofresnel/specs/';
const ACCESSORY_SRC = SRC;

export const ASTERA_LEOFRESNEL_FIXTURES = [
  {
    id: 'astera-leofresnel-af250',
    manufacturer: 'Astera',
    model: 'LeoFresnel AF250',
    family: 'LeoFresnel',
    category: 'Light',
    sourceType: 'Titan LED Engine RGBMintAmber',
    totalLedPowerW: 350,
    powerDrawW: 250,
    colorMode: 'RGBMintAmber',
    cri: 96,
    pixels: 1,
    beamAngleDeg: { min: 15, max: 60 },
    ipRating: 'IP55',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20, maxBrightness: 2 },
    dcInput: '12-48 VDC, max 15 A',
    acInput: '100-240 VAC',
    outputLumens: { cct3200K: 4963, cct4000K: 6378, cct5500K: 7119 },
    control: {
      wired: ['DMX', 'RDM'],
      wireless: ['AsteraApp', 'CRMX', 'UHF', 'Bluetooth', 'Wi-Fi'],
      builtInCRMX: true,
      builtInBTB: true,
      directLightingAI: [],
      externalInterfaceRequired: ['Wired DMX interface for DMX control', 'CRMX transmitter for CRMX control'],
      unavailableDirectProtocols: ['AsteraApp Bluetooth/UHF/Wi-Fi protocol is not publicly documented for third-party direct control'],
      sourceUrls: ['https://astera-led.com/fr/products/leofresnel/specs/']
    },
    dmxModes: [{
      name: 'Profile 147 DIM RGB FAN 5ch',
      channels: 5,
      verified: true,
      sourceUrl: 'https://astera-led.com/wp-content/uploads/AF250_LeoFresnel_DMX-Profiles_V1.pdf',
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

const LEO = ['astera-leofresnel-af250'];

export const ASTERA_LEOFRESNEL_ACCESSORIES = [
  { id: 'astera-af250-fl', manufacturer: 'Astera', model: 'AF250-FL Fresnel Lens', category: 'Light Control', compatibleWith: LEO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-af250-bd', manufacturer: 'Astera', model: 'AF250-BD Barndoor', category: 'Light Control', compatibleWith: LEO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-af250-yk', manufacturer: 'Astera', model: 'AF250-YK Yoke', category: 'Mounting', compatibleWith: LEO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-af250-ykb', manufacturer: 'Astera', model: 'AF250-YKB YokeBase', category: 'Mounting', compatibleWith: LEO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-af250-rra', manufacturer: 'Astera', model: 'AF250-RRA Rabbit-Rounder Adapter', category: 'Mounting', compatibleWith: LEO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-ax-tvmp-leo', manufacturer: 'Astera', model: 'AX-TVMP TVMP Adapter', category: 'Mounting', compatibleWith: LEO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-ax-thd-leo', manufacturer: 'Astera', model: 'AX-THD Aero Handle', category: 'Mounting', compatibleWith: LEO, sourceUrl: ACCESSORY_SRC }
];
