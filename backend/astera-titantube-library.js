// Astera TitanTube FP1 current wireless LED tube.
// Official product source. Keep accessories out until each compatibility link is verified.
const SRC = 'https://astera-led.com/products/titantube/';

export const ASTERA_TITANTUBE_FIXTURES = [
  {
    id: 'astera-titantube-fp1',
    manufacturer: 'Astera',
    model: 'TitanTube FP1',
    family: 'TitanTube',
    category: 'Light',
    sourceType: 'RGBMintAmber LED tube',
    colorMode: 'RGBMintAmber',
    cri: 96,
    tlci: 96,
    pixels: 16,
    ipRating: 'IP65',
    batteryPowered: true,
    control: { wireless: ['AsteraApp', 'Wireless DMX'] },
    sourceUrl: SRC
  }
];

export const ASTERA_TITANTUBE_ACCESSORIES = [];
