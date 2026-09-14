// Astera QuikPunch high-output battery-powered spotlight.
// Specifications verified from the Astera QuikPunch V4 datasheet (05-Dec-2025).
const SRC = 'https://astera-led.com/products/quikpunch/';

export const ASTERA_QUIKPUNCH_FIXTURES = [
  {
    id: 'astera-quikpunch',
    manufacturer: 'Astera',
    model: 'QuikPunch',
    family: 'QuikPunch',
    category: 'Light',
    orderCode: 'AST-QUKPN',
    sourceType: 'Titan LED Engine RGBMintAmber',
    powerDrawW: 75,
    powerConsumptionMaxW: 100,
    tungstenEquivalentW: 650,
    colorMode: 'RGBMintAmber',
    cri: 96,
    pixels: 1,
    beamAngleDeg: { min: 13, max: 60 },
    fieldAngleDeg: { min: 20, max: 75 },
    batteryPowered: true,
    batteryRuntimeHours: { max: 20, maxBrightness: 4.5 },
    chargingTimeHours: 5.25,
    acInput: '100–240 VAC, 50/60 Hz',
    acConnector: 'powerCON TRUE1 IN/OUT',
    ipRating: 'IP65',
    weightKg: 6.567,
    dimensionsMm: { length: 237.5, width: 188, height: 309 },
    control: {
      wired: ['DMX', 'RDM'],
      wireless: ['AsteraApp', 'CRMX', 'UHF', 'Bluetooth', 'WiFi'],
      builtInCRMX: true,
      builtInBTB: true
    },
    sourceUrl: SRC
  }
];

const QUIKPUNCH = ['astera-quikpunch'];

export const ASTERA_QUIKPUNCH_ACCESSORIES = [
  { id: 'astera-quikpunch-flxcvr-wt-8', manufacturer: 'Astera', model: 'AST-QUKPN-FLXCVR-WT-8 FlexCover White', category: 'Light Control', compatibleWith: QUIKPUNCH, sourceUrl: SRC },
  { id: 'astera-quikpunch-flxcvr-mir-8', manufacturer: 'Astera', model: 'AST-QUKPN-FLXCVR-MIR-8 FlexCover Mirror', category: 'Light Control', compatibleWith: QUIKPUNCH, sourceUrl: SRC },
  { id: 'astera-prpbx-quikpunch', manufacturer: 'Astera', model: 'AST-PRPBX PrepBox', category: 'Control', compatibleWith: QUIKPUNCH, sourceUrl: SRC },
  { id: 'astera-quikpunch-chrplt', manufacturer: 'Astera', model: 'AST-QUKPN-CHRPLT ChargingPlate', category: 'Power', compatibleWith: QUIKPUNCH, sourceUrl: SRC },
  { id: 'astera-tsp-quikpunch', manufacturer: 'Astera', model: 'AST-TSP TrackSpigot', category: 'Mounting', compatibleWith: QUIKPUNCH, sourceUrl: SRC },
  { id: 'astera-quikpunch-bd', manufacturer: 'Astera', model: 'AST-QUKPN-BD Barndoor', category: 'Light Control', compatibleWith: QUIKPUNCH, sourceUrl: SRC },
  { id: 'astera-quikpunch-es', manufacturer: 'Astera', model: 'AST-QUKPN-ES EdgeSoftener Filter', category: 'Light Control', compatibleWith: QUIKPUNCH, sourceUrl: SRC },
  { id: 'astera-tpc-quikpunch', manufacturer: 'Astera', model: 'AST-TPC TrackPin Compact', category: 'Mounting', compatibleWith: QUIKPUNCH, sourceUrl: SRC },
  { id: 'astera-ax9-rotad-quikpunch', manufacturer: 'Astera', model: 'AX9-ROTAD Rotatable Filter 17° × 46°', category: 'Light Control', compatibleWith: QUIKPUNCH, sourceUrl: SRC },
  { id: 'astera-quikpunch-yk', manufacturer: 'Astera', model: 'AST-QUKPN-YK Yoke', category: 'Mounting', compatibleWith: QUIKPUNCH, includedWithFixture: true, sourceUrl: SRC }
];
