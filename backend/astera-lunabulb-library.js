// Astera LunaBulb FP7 practical LED bulb family.
// Specifications verified from Astera LunaBulb documentation.
const SRC = 'https://astera-led.com/products/lunabulb/';
const PREPINLAY_SRC = 'https://www.bbplight.nl/contents/en-us/p93845_astera-fp7-prpinl-kit-fp7-lunabulb-prepinlay-kit---fp7-prpinl-kit.html';
const PREPCASE_SRC = 'https://www.bbplight.nl/contents/en-us/p93843_astera-fp7-prpcse-kit-fp7-lunabulb-prepcase-kit---fp7-prpcse-kit.html';
const ACCESSORY_KIT_SRC = 'https://www.bhphotovideo.com/c/product/1860475-REG/astera_fp7_acccse_kit_lunabulb_accessory_kit_4x.html';

const common = {
  manufacturer: 'Astera',
  family: 'LunaBulb',
  category: 'Light',
  sourceType: 'Titan LED Engine RGBMintAmber',
  totalLedPowerW: 4.25,
  powerDrawW: 3.3,
  colorMode: 'RGBMintAmber',
  cri: 96,
  tlci: 96,
  pixels: 1,
  batteryPowered: false,
  acInput: '100–240 VAC',
  ipRating: 'IP44',
  weightKg: 0.081,
  control: {
    wired: [],
    wireless: ['AsteraApp', 'CRMX', 'UHF', 'Bluetooth', 'Wi-Fi'],
    builtInCRMX: true,
    builtInBTB: true,
    directLightingAI: [],
    externalInterfaceRequired: ['CRMX transmitter for CRMX control'],
    unavailableDirectProtocols: ['AsteraApp Bluetooth/UHF/Wi-Fi protocol is not publicly documented for third-party direct control'],
    sourceUrls: [
      'https://astera-led.com/products/lunabulb/',
      'https://update.astera-led.com/firmwares/current/release_notes.html'
    ]
  },
  sourceUrl: SRC
};

export const ASTERA_LUNABULB_FIXTURES = [
  { ...common, id: 'astera-lunabulb-fp7-e26', model: 'LunaBulb FP7-E26', orderCode: 'FP7-E26', socket: 'E26' },
  { ...common, id: 'astera-lunabulb-fp7-e27', model: 'LunaBulb FP7-E27', orderCode: 'FP7-E27', socket: 'E27' },
  { ...common, id: 'astera-lunabulb-fp7-b22', model: 'LunaBulb FP7-B22', orderCode: 'FP7-B22', socket: 'B22' }
];

const LUNABULB = ASTERA_LUNABULB_FIXTURES.map((fixture) => fixture.id);

export const ASTERA_LUNABULB_ACCESSORIES = [
  { id: 'astera-fp7-prpinl-kit', manufacturer: 'Astera', model: 'FP7-PRPINL-KIT LunaBulb PrepInlay Kit', category: 'Charging / Transport Kit', compatibleWith: LUNABULB, sourceUrl: PREPINLAY_SRC },
  { id: 'astera-fp7-prpinl', manufacturer: 'Astera', model: 'FP7-PRPINL LunaBulb PrepInlay', category: 'Transport / Preparation', compatibleWith: LUNABULB, sourceUrl: PREPINLAY_SRC },
  { id: 'astera-fp7-prpcse-kit', manufacturer: 'Astera', model: 'FP7-PRPCSE-KIT LunaBulb PrepCase Kit', category: 'Charging / Transport Kit', compatibleWith: LUNABULB, sourceUrl: PREPCASE_SRC },
  { id: 'astera-fp7-prpcse', manufacturer: 'Astera', model: 'FP7-PRPCSE LunaBulb PrepCase', category: 'Charging / Transport', compatibleWith: LUNABULB, sourceUrl: PREPCASE_SRC },
  { id: 'astera-fp7-acccse-kit', manufacturer: 'Astera', model: 'FP7-ACCCSE-KIT LunaBulb Accessory Kit', category: 'Light Control Kit', compatibleWith: LUNABULB, sourceUrl: ACCESSORY_KIT_SRC },
  { id: 'astera-lunareflector', manufacturer: 'Astera', model: 'LunaReflector', category: 'Light Control', compatibleWith: LUNABULB, sourceUrl: ACCESSORY_KIT_SRC },
  { id: 'astera-lunadiffuser', manufacturer: 'Astera', model: 'LunaDiffuser', category: 'Light Control', compatibleWith: LUNABULB, sourceUrl: ACCESSORY_KIT_SRC },
  { id: 'astera-lunalens', manufacturer: 'Astera', model: 'LunaLens', category: 'Light Control', compatibleWith: LUNABULB, sourceUrl: ACCESSORY_KIT_SRC },
  { id: 'astera-lunasnoot', manufacturer: 'Astera', model: 'LunaSnoot', category: 'Light Control', compatibleWith: LUNABULB, sourceUrl: ACCESSORY_KIT_SRC },
  { id: 'astera-lunashade-blocker', manufacturer: 'Astera', model: 'LunaShade with Blocker', category: 'Light Control', compatibleWith: LUNABULB, sourceUrl: ACCESSORY_KIT_SRC },
  { id: 'astera-lunashade-diffuser', manufacturer: 'Astera', model: 'LunaShade with Diffuser', category: 'Light Control', compatibleWith: LUNABULB, sourceUrl: ACCESSORY_KIT_SRC },
  { id: 'astera-lunabulb-accessory-case', manufacturer: 'Astera', model: 'LunaBulb AccessoryCase with Foam Insert', category: 'Transport', compatibleWith: LUNABULB, sourceUrl: ACCESSORY_KIT_SRC }
];
