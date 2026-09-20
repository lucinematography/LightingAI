// Astera AX9 PowerPAR wireless LED PAR.
const SRC = 'https://astera-led.com/products/ax9-powerpar/';
const ACCESSORY_SRC = 'https://astera-led.com/wp-content/uploads/AX9_CHRCSE_Charging_Case_for_AX9_Datasheet_V2.pdf';

export const ASTERA_AX9_POWERPAR_FIXTURES = [
  {
    id: 'astera-ax9-powerpar',
    manufacturer: 'Astera',
    model: 'AX9 PowerPAR',
    family: 'PowerPAR',
    category: 'Light',
    sourceType: 'RGBMintAmber LED PAR',
    totalLedPowerW: 105,
    colorMode: 'RGBMintAmber',
    batteryPowered: true,
    control: {
      wired: ['DMX'],
      wireless: ['AsteraApp', 'Wireless DMX', 'CRMX'],
      builtInCRMX: true,
      directLightingAI: [],
      externalInterfaceRequired: ['Wired DMX interface for DMX control', 'CRMX/Wireless DMX transmitter for wireless DMX control'],
      unavailableDirectProtocols: ['AsteraApp protocol is not publicly documented for third-party direct control'],
      sourceUrls: ['https://astera-led.com/products/ax9-powerpar/downloads/']
    },
    dmxModes: [{
      name: 'Profile 4 DIM RGB 4ch',
      channels: 4,
      verified: true,
      sourceUrl: 'https://astera-led.com/products/ax9-powerpar/downloads/',
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

const AX9 = ['astera-ax9-powerpar'];

export const ASTERA_AX9_POWERPAR_ACCESSORIES = [
  { id: 'astera-ax9-egc', manufacturer: 'Astera', model: 'AX9-EGC EggCrate', category: 'Light Control', compatibleWith: AX9, sourceUrl: SRC },
  { id: 'astera-ax9-ff', manufacturer: 'Astera', model: 'AX9-FF FloodFilter', category: 'Optical Modifier', compatibleWith: AX9, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-ax9-wwf', manufacturer: 'Astera', model: 'AX9-WWF Wallwash Filter', category: 'Optical Modifier', compatibleWith: AX9, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-ax-tp', manufacturer: 'Astera', model: 'AX-TP TrackPin', category: 'Mounting', compatibleWith: AX9, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-ax9-chrcse', manufacturer: 'Astera', model: 'AX9-CHRCSE Charging Case', category: 'Charging / Transport', compatibleWith: AX9, sourceUrl: ACCESSORY_SRC }
];
