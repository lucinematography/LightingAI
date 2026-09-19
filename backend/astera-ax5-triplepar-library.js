// Astera AX5 TriplePAR battery-powered LED PAR.
// Official Astera technical reference manual is the canonical fixture source.
const SRC = 'https://astera-led.com/wp-content/uploads/AX5_TriplePAR_Technical_Reference_Manual_V1.pdf';

export const ASTERA_AX5_TRIPLEPAR_FIXTURES = [
  {
    id: 'astera-ax5-triplepar',
    manufacturer: 'Astera',
    model: 'AX5 TriplePAR',
    family: 'TriplePAR',
    category: 'Light',
    sourceType: '3 x 15W RGBAW LED',
    totalLedPowerW: 45,
    colorMode: 'RGBAW',
    cri: 92,
    pixels: 1,
    beamAngleDeg: 13,
    ipRating: 'IP65',
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    dimensionsMm: { diameter: 153.2, height: 140.5 },
    weightKg: 3.4,
    control: {
      wired: ['5-pin XLR DMX'],
      wireless: ['AsteraApp', 'CRMX'],
      builtInCRMX: true
    },
    dmxModes: [{
      name: 'Profile 4 DIM RGB 4ch',
      channels: 4,
      verified: true,
      sourceUrl: 'https://astera-led.com/wp-content/uploads/AX10_SpotMax_DMX_Profiles_V1.pdf',
      controls: [
        { key: 'dimmer', label: 'Dimmer', channel: 1, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'red', label: 'Red', channel: 2, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'green', label: 'Green', channel: 3, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 },
        { key: 'blue', label: 'Blue', channel: 4, type: 'percent', min: 0, max: 100, dmxMin: 0, dmxMax: 255 }
      ]
    }],
    sourceUrl: SRC
  }
];

const AX5 = ['astera-ax5-triplepar'];

export const ASTERA_AX5_TRIPLEPAR_ACCESSORIES = [
  { id: 'astera-ax5-ff', manufacturer: 'Astera', model: 'AX5-FF 32 Degree Flood Filter', category: 'Optical Modifier', compatibleWith: AX5, includedWithFixture: true, sourceUrl: SRC },
  { id: 'astera-ax5-wwf', manufacturer: 'Astera', model: 'AX5-WWF 17 x 46 Degree Wallwash Filter', category: 'Optical Modifier', compatibleWith: AX5, includedWithFixture: true, sourceUrl: SRC },
  { id: 'astera-ax5-rotad', manufacturer: 'Astera', model: 'AX5-ROTAD Rotatable Filter 17 x 46 Degree', category: 'Optical Modifier', compatibleWith: AX5, sourceUrl: SRC },
  { id: 'astera-ax5-ddm', manufacturer: 'Astera', model: 'AX5-DDM Diffuser Dome', category: 'Diffusion', compatibleWith: AX5, sourceUrl: SRC },
  { id: 'astera-ax5-sn', manufacturer: 'Astera', model: 'AX5-SN Snoot', category: 'Light Control', compatibleWith: AX5, sourceUrl: SRC },
  { id: 'astera-ax5-vulcvr-wt', manufacturer: 'Astera', model: 'AX5-VULCVR-WT Volcano Cover White', category: 'Cover', compatibleWith: AX5, sourceUrl: SRC },
  { id: 'astera-ax5-flxcvr-wt', manufacturer: 'Astera', model: 'AX5-FLXCVR-WT Flex Cover White', category: 'Cover', compatibleWith: AX5, sourceUrl: SRC },
  { id: 'astera-ax5-flxcvr-mir', manufacturer: 'Astera', model: 'AX5-FLXCVR-MIR Flex Cover Mirror', category: 'Cover', compatibleWith: AX5, sourceUrl: SRC },
  { id: 'astera-ax5-chrcse', manufacturer: 'Astera', model: 'AX5-CHRCSE Charging Case', category: 'Charging / Transport', compatibleWith: AX5, sourceUrl: SRC },
  { id: 'astera-ax5-chrplt-8', manufacturer: 'Astera', model: 'AX5-CHRPLT-8 Charging Plate', category: 'Charging', compatibleWith: AX5, sourceUrl: SRC },
  { id: 'astera-ax5-blt', manufacturer: 'Astera', model: 'AX5-BLT Bolt', category: 'Mounting', compatibleWith: AX5, sourceUrl: SRC }
];
