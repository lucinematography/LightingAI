// Astera PlutoFresnel AF80 battery-powered Fresnel fixture.
// Canonical specifications from Astera PlutoFresnel AF80 datasheet.
const SRC = 'https://device.report/m/7900b3533fa233ad3d3561c4ab1190bafc0f3175a56bb2f5ddd151b7651fc1ce';
const ACCESSORY_SRC = SRC;

export const ASTERA_PLUTOFRESNEL_FIXTURES = [
  {
    id: 'astera-plutofresnel-af80',
    manufacturer: 'Astera',
    model: 'PlutoFresnel AF80',
    family: 'PlutoFresnel',
    category: 'Light',
    sourceType: 'Titan LED Engine RGBMintAmber',
    totalLedPowerW: 105,
    powerDrawW: 80,
    colorMode: 'RGBMintAmber',
    cri: 96,
    pixels: 1,
    beamAngleDeg: { min: 15, max: 60 },
    ipRating: 'IP55',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20, maxBrightness: 3 },
    chargingTimeHours: 3.5,
    dcInput: '24 VDC, 80 W',
    dimensionsMm: { length: 281.9, width: 153.5, height: 161.8 },
    weightKg: 4.637,
    control: {
      wired: ['DMX'],
      wireless: ['AsteraApp', 'CRMX'],
      builtInCRMX: true,
      builtInBTB: true
    },
    sourceUrl: SRC
  }
];

const PLUTO = ['astera-plutofresnel-af80'];

export const ASTERA_PLUTOFRESNEL_ACCESSORIES = [
  { id: 'astera-af80-fl', manufacturer: 'Astera', model: 'AF80-FL Fresnel Lens', category: 'Light Control', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-af80-bd', manufacturer: 'Astera', model: 'AF80-BD Barndoor', category: 'Light Control', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-af80-yk', manufacturer: 'Astera', model: 'AF80-YK Yoke', category: 'Mounting', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-af80-ykb', manufacturer: 'Astera', model: 'AF80-YKB YokeBase', category: 'Mounting', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-ax-thd', manufacturer: 'Astera', model: 'AX-THD TrackHandle', category: 'Mounting', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-af80-pls', manufacturer: 'Astera', model: 'AF80-PLS ProjectionLens', category: 'Light Control', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-af80-cse', manufacturer: 'Astera', model: 'AF80-CSE Charging Case', category: 'Charging / Transport', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-fp3-chr-pluto', manufacturer: 'Astera', model: 'FP3-CHR Hyperion Power Supply', category: 'Power', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-pwb-2-86-pluto', manufacturer: 'Astera', model: 'PWB-2-86 PowerBox 2x86 W', category: 'Power / Data', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-pwb-1-100-pluto', manufacturer: 'Astera', model: 'PWB-1-100 PowerBox 1x100 W', category: 'Power / Data', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-pwb-cab-pluto', manufacturer: 'Astera', model: 'PWB-CAB Power / Data Combination Cable', category: 'Power / Data', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-fp1-dtl-pluto', manufacturer: 'Astera', model: 'FP1-DTL DataLink', category: 'Data', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-rex1-vm-pluto', manufacturer: 'Astera', model: 'REX1-VM RuntimeExtender V-Mount', category: 'Power', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-rex1-gm-pluto', manufacturer: 'Astera', model: 'REX1-GM RuntimeExtender Gold Mount', category: 'Power', compatibleWith: PLUTO, sourceUrl: ACCESSORY_SRC }
];
