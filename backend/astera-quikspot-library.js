// Astera QuikSpot battery-powered Fresnel fixture.
// Specifications verified from Astera documentation and current product datasheet references.
const SRC = 'https://astera-led.com/products/quikspot/';
const ACCESSORY_SRC = SRC;

export const ASTERA_QUIKSPOT_FIXTURES = [
  {
    id: 'astera-quikspot',
    manufacturer: 'Astera',
    model: 'QuikSpot',
    family: 'QuikSpot',
    category: 'Light',
    sourceType: 'Titan LED Engine RGBMintAmber',
    powerDrawW: 60,
    colorMode: 'RGBMintAmber',
    beamAngleDeg: { min: 13, max: 60 },
    batteryPowered: true,
    batteryRuntimeHours: { max: 20, maxBrightness: 4.5 },
    ipRating: 'IP65',
    weightKg: 3.45,
    dimensionsMm: { length: 164, width: 164, height: 182 },
    control: {
      wired: ['DMX'],
      wireless: ['AsteraApp', 'CRMX'],
      builtInCRMX: true,
      builtInBTB: true
    },
    sourceUrl: SRC
  }
];

const QUIKSPOT = ['astera-quikspot'];

export const ASTERA_QUIKSPOT_ACCESSORIES = [
  { id: 'astera-quikspot-chrplt', manufacturer: 'Astera', model: 'AST-QUKSP-CHRPLT ChargingPlate for 8x QuikSpot', category: 'Power', compatibleWith: QUIKSPOT, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-prpbx-quikspot', manufacturer: 'Astera', model: 'AST-PRPBX PrepBox', category: 'Control', compatibleWith: QUIKSPOT, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-quikspot-bd', manufacturer: 'Astera', model: 'AST-QUKSP-BD Barndoor', category: 'Light Control', compatibleWith: QUIKSPOT, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-quikspot-flxcvr-wt-8', manufacturer: 'Astera', model: 'AST-QUKSP-FLXCVR-WT-8 FlexCover White', category: 'Light Control', compatibleWith: QUIKSPOT, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-quikspot-flxcvr-mir-8', manufacturer: 'Astera', model: 'AST-QUKSP-FLXCVR-MIR-8 FlexCover Mirror', category: 'Light Control', compatibleWith: QUIKSPOT, sourceUrl: ACCESSORY_SRC },
  { id: 'astera-tpc-quikspot', manufacturer: 'Astera', model: 'AST-TPC TrackPin Compact', category: 'Mounting', compatibleWith: QUIKSPOT, sourceUrl: ACCESSORY_SRC }
];
