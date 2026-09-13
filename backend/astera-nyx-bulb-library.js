// Astera NYX Bulb professional LED bulb for film and event lighting.
// Canonical fixture source: Astera NYX for Filmmakers.
const SRC = 'https://nyx-for-filmmakers.astera-led.com/';

export const ASTERA_NYX_BULB_FIXTURES = [
  {
    id: 'astera-nyx-bulb',
    manufacturer: 'Astera',
    model: 'NYX Bulb',
    family: 'NYX Bulb',
    category: 'Light',
    sourceType: 'RGBMintAmber LED',
    powerDrawW: 10,
    outputLumens: 750,
    outputLumensAtCctK: 4000,
    colorMode: 'RGBMintAmber',
    control: {
      wireless: ['AsteraApp', 'CRMX'],
      builtInCRMX: true
    },
    sourceUrl: SRC
  }
];

export const ASTERA_NYX_BULB_ACCESSORIES = [];
