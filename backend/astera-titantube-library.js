// Astera TitanTube FP1 current wireless LED tube.
// Official product source. Keep accessories out until each compatibility link is verified.
const SRC = 'https://astera-led.com/products/titantube/';
const MANUAL = 'https://s3.amazonaws.com/lenspro-media-prod/manuals/2024/11/11/Titan_Manual_1.pdf';

export const ASTERA_TITANTUBE_FIXTURES = [
  {
    id: 'astera-titantube-fp1',
    manufacturer: 'Astera',
    model: 'TitanTube FP1',
    family: 'TitanTube',
    category: 'Light',
    sourceType: 'RGBMintAmber LED tube',
    powerDrawW: 48,
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

const TITAN = ['astera-titantube-fp1'];

export const ASTERA_TITANTUBE_ACCESSORIES = [
  { id: 'astera-tube-floorstand', manufacturer: 'Astera', model: 'Foldable Floorstand', category: 'Stand', mount: 'M5 thread', compatibleWith: TITAN, includedWithFixture: true, sourceUrl: MANUAL },
  { id: 'astera-tube-metal-holder', manufacturer: 'Astera', model: 'Metal Holder with Locking Pin', category: 'Mount', mount: '1/4-20 and M5 threads', compatibleWith: TITAN, includedWithFixture: true, sourceUrl: MANUAL },
  { id: 'astera-ax1-blt', manufacturer: 'Astera', model: 'AX1-BLT Double-ended Spigot', category: 'Mount Adapter', mount: '1/4-20 to clamp', compatibleWith: TITAN, sourceUrl: MANUAL },
  { id: 'astera-tube-wing-plate', manufacturer: 'Astera', model: 'Wing Plate', category: 'Multi-light Mount', compatibleWith: TITAN, sourceUrl: MANUAL },
  { id: 'astera-tube-m5-eyebolt', manufacturer: 'Astera', model: 'M5 Eye Bolt', category: 'Safety / Suspension', mount: 'M5 thread', compatibleWith: TITAN, includedWithFixture: true, sourceUrl: MANUAL },
  { id: 'astera-fp1-chr', manufacturer: 'Astera', model: 'FP1-CHR Individual Charger', category: 'Charger', compatibleWith: TITAN, sourceUrl: MANUAL },
  { id: 'astera-fp1-pwb', manufacturer: 'Astera', model: 'FP1-PWB PowerBox', category: 'Power / DMX Interface', compatibleWith: TITAN, sourceUrl: MANUAL },
  { id: 'astera-fp1-pwb-cab-5', manufacturer: 'Astera', model: 'FP1-PWB-CAB-5 Power/Data Combination Cable 5 m', category: 'Power / Data Cable', compatibleWith: TITAN, sourceUrl: MANUAL },
  { id: 'astera-fp1-pwb-cab-10', manufacturer: 'Astera', model: 'FP1-PWB-CAB-10 Power/Data Combination Cable 10 m', category: 'Power / Data Cable', compatibleWith: TITAN, sourceUrl: MANUAL },
  { id: 'astera-fp1-pwb-cab-15', manufacturer: 'Astera', model: 'FP1-PWB-CAB-15 Power/Data Combination Cable 15 m', category: 'Power / Data Cable', compatibleWith: TITAN, sourceUrl: MANUAL }
];
