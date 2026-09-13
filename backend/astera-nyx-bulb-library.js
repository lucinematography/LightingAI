// Astera NYX Bulb professional LED bulb for film and event lighting.
// Canonical fixture source: Astera NYX for Filmmakers.
const SRC = 'https://nyx-for-filmmakers.astera-led.com/';
const ACCESSORY_SRC = 'https://lumenayre.com/files/documents/Astera-Catalog.pdf';

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

const NYX = ['astera-nyx-bulb'];

export const ASTERA_NYX_BULB_ACCESSORIES = [
  { id: 'astera-fp5-ps', manufacturer: 'Astera', model: 'FP5-PS PowerStation', category: 'Power / Control', compatibleWith: NYX, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-fp5-cpb', manufacturer: 'Astera', model: 'FP5-CPB CupBouncer', category: 'Light Control', compatibleWith: NYX, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-fp5-usbc', manufacturer: 'Astera', model: 'FP5-USBC USB DC Cable', category: 'Power', compatibleWith: NYX, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-fp5-dtsc', manufacturer: 'Astera', model: 'FP5-DTSC D-TAB SplitCable', category: 'Power', compatibleWith: NYX, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-fp5-e27s', manufacturer: 'Astera', model: 'FP5-E27S LampSocket', category: 'Mounting', compatibleWith: NYX, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-fp5-exc', manufacturer: 'Astera', model: 'FP5-EXC Extension Cable for NYX Bulb', category: 'Power', compatibleWith: NYX, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-fp5-cse', manufacturer: 'Astera', model: 'FP5-CSE NYX Bulb Case', category: 'Transport', compatibleWith: NYX, sourceUrl: ACCESSORY_SRC }
];
