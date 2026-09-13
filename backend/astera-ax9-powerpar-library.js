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
      builtInCRMX: true
    },
    sourceUrl: SRC
  }
];

const AX9 = ['astera-ax9-powerpar'];

export const ASTERA_AX9_POWERPAR_ACCESSORIES = [
  { id: 'astera-ax9-egc', manufacturer: 'Astera', model: 'AX9-EGC EggCrate', category: 'Light Control', compatibleWith: AX9, sourceUrl: SRC },
  { id: 'astera-ax9-ff', manufacturer: 'Astera', model: 'AX9-FF FloodFilter', category: 'Optical Modifier', compatibleWith: AX9, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-ax9-wwf', manufacturer: 'Astera', model: 'AX9-WWF Wallwash Filter', category: 'Optical Modifier', compatibleWith: AX9, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-ax-tp', manufacturer: 'Astera', model: 'AX-TP TrackPin', category: 'Mounting', compatibleWith: AX9, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-ax5-blt', manufacturer: 'Astera', model: 'AX5-BLT Bolt', category: 'Mounting', compatibleWith: AX9, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-ax9-chrcse', manufacturer: 'Astera', model: 'AX9-CHRCSE Charging Case', category: 'Charging / Transport', compatibleWith: AX9, sourceUrl: ACCESSORY_SRC }
];
