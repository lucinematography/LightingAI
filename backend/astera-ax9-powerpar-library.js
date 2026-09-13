// Astera AX9 PowerPAR wireless LED PAR.
// Official Astera product source; accessories stay separate until compatibility is verified.
const SRC = 'https://astera-led.com/products/ax9-powerpar/';

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

export const ASTERA_AX9_POWERPAR_ACCESSORIES = [];
