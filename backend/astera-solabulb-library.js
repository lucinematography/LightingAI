// Astera SolaBulb zoomable Fresnel-based practical bulb family.
// Specifications and accessories verified from the Astera V1 datasheet (04-Sep-2025).
const SRC = 'https://astera-led.com/solabulb/';

const common = {
  manufacturer: 'Astera',
  family: 'SolaBulb',
  category: 'Light',
  sourceType: 'Titan LED Engine RGBMintAmber',
  powerDrawW: 15,
  powerConsumptionMaxW: 16.5,
  incandescentEquivalentW: 50,
  colorMode: 'RGBMintAmber',
  cri: 96,
  pixels: 1,
  beamAngleDeg: { min: 15, max: 50 },
  fieldAngleDeg: { min: 23, max: 73 },
  batteryPowered: false,
  dcInput: '9–18 VDC, 2.1 A max',
  ipRating: 'IP44 on AC with FP5-SP installed; IP20 on DC',
  weightKg: 0.433,
  control: {
    wired: [],
    wireless: ['AsteraApp', 'CRMX', 'UHF', 'Bluetooth', 'WiFi'],
    builtInCRMX: true,
    builtInBTB: true,
    directLightingAI: [],
    externalInterfaceRequired: ['CRMX transmitter for CRMX control'],
    unavailableDirectProtocols: ['AsteraApp Bluetooth/UHF/Wi-Fi protocol is not publicly documented for third-party direct control'],
    sourceUrls: [
      'https://astera-led.com/solabulb/',
      'https://update.astera-led.com/firmwares/current/release_notes.html'
    ]
  },
  sourceUrl: SRC
};

export const ASTERA_SOLABULB_FIXTURES = [
  { ...common, id: 'astera-solabulb-e26', model: 'SolaBulb E26', orderCode: 'AST-BLBSL-E26', socket: 'E26', dimensionsMm: { lengthMin: 114.6, lengthMax: 134.6, width: 91.8, height: 91.8 } },
  { ...common, id: 'astera-solabulb-e27', model: 'SolaBulb E27', orderCode: 'AST-BLBSL-E27', socket: 'E27', dimensionsMm: { lengthMin: 117.6, lengthMax: 137.6, width: 91.8, height: 91.8 } },
  { ...common, id: 'astera-solabulb-b22', model: 'SolaBulb B22', orderCode: 'AST-BLBSL-B22', socket: 'B22', dimensionsMm: { lengthMin: 116.2, lengthMax: 136.2, width: 91.8, height: 91.8 } }
];

const SOLABULB = ASTERA_SOLABULB_FIXTURES.map(fixture => fixture.id);

export const ASTERA_SOLABULB_ACCESSORIES = [
  { id: 'astera-blbsl-sn', manufacturer: 'Astera', model: 'AST-BLBSL-SN SolaSnoot', category: 'Light Control', compatibleWith: SOLABULB, sourceUrl: SRC },
  { id: 'astera-blbsl-kit', manufacturer: 'Astera', model: 'AST-BLBSL-KIT SolaBulb Kit', category: 'Kit / Transport', compatibleWith: SOLABULB, sourceUrl: SRC },
  { id: 'astera-fp5-sp-solabulb', manufacturer: 'Astera', model: 'FP5-SP Waterproof DC Socket Cover', category: 'Protection', compatibleWith: SOLABULB, sourceUrl: SRC }
];
