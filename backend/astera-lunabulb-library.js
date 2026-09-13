// Astera LunaBulb FP7 practical LED bulb family.
// Specifications verified from Astera LunaBulb documentation.
const SRC = 'https://astera-led.com/products/lunabulb/';

const common = {
  manufacturer: 'Astera',
  family: 'LunaBulb',
  category: 'Light',
  sourceType: 'Titan LED Engine RGBMintAmber',
  colorMode: 'RGBMintAmber',
  cri: 96,
  ipRating: 'IP44',
  control: {
    wireless: ['AsteraApp', 'CRMX'],
    builtInCRMX: true,
    builtInBTB: true
  },
  sourceUrl: SRC
};

export const ASTERA_LUNABULB_FIXTURES = [
  { ...common, id: 'astera-lunabulb-fp7-e26', model: 'LunaBulb FP7-E26', socket: 'E26' },
  { ...common, id: 'astera-lunabulb-fp7-e27', model: 'LunaBulb FP7-E27', socket: 'E27' },
  { ...common, id: 'astera-lunabulb-fp7-b22', model: 'LunaBulb FP7-B22', socket: 'B22' }
];

export const ASTERA_LUNABULB_ACCESSORIES = [];
