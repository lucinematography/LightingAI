// Astera AX3 LightDrop compact battery-powered RGBW puck.
// Canonical specifications and accessories from Astera AX3 documentation.
const SRC = 'https://astera-led.com/products/ax3-lightdrop/';

export const ASTERA_AX3_LIGHTDROP_FIXTURES = [
  {
    id: 'astera-ax3-lightdrop',
    manufacturer: 'Astera',
    model: 'AX3 LightDrop',
    family: 'AX3',
    category: 'Light',
    sourceType: 'RGBW LED Engine',
    totalLedPowerW: 15,
    powerDrawW: 15,
    colorMode: 'RGBW',
    pixels: 1,
    beamAngleDeg: 13,
    fieldAngleDeg: 22,
    luminousFluxLm: 430,
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    chargingTimeHours: 7,
    dcInput: '5 VDC, 2.5 A',
    ipRating: 'IP65 with AX3-SP charging socket cover',
    weightKg: 0.679,
    dimensionsMm: { length: 120, width: 59, height: 114 },
    control: {
      wired: [],
      wireless: ['AsteraApp', 'CRMX', 'W-DMX', 'UHF', 'Bluetooth', 'WiFi'],
      builtInCRMX: true,
      builtInBTB: true
    },,
    dmxModes: [{
      name: 'Profile 4 DIM RGB 4ch',
      channels: 4,
      verified: true,
      sourceUrl: 'https://ledbox.fr/wp-content/uploads/2021/03/ax3-dmx-profiles.pdf',
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

const AX3 = ['astera-ax3-lightdrop'];

export const ASTERA_AX3_LIGHTDROP_ACCESSORIES = [
  { id: 'astera-ax3-ddsk-30', manufacturer: 'Astera', model: 'AX3-DDSK-30 30° Diffuser Filter', category: 'Light Control', compatibleWith: AX3, sourceUrl: SRC },
  { id: 'astera-ax3-ddsk-120', manufacturer: 'Astera', model: 'AX3-DDSK-120 120° Diffuser Filter', category: 'Light Control', compatibleWith: AX3, sourceUrl: SRC },
  { id: 'astera-ax3-wwdsk', manufacturer: 'Astera', model: 'AX3-WWDSK Wallwash Filter 17° × 46°', category: 'Light Control', compatibleWith: AX3, sourceUrl: SRC },
  { id: 'astera-ax3-ddm', manufacturer: 'Astera', model: 'AX3-DDM Diffuser Dome', category: 'Light Control', compatibleWith: AX3, sourceUrl: SRC },
  { id: 'astera-ax1-blt-ax3', manufacturer: 'Astera', model: 'AX1-BLT BabyPin', category: 'Mounting', compatibleWith: AX3, sourceUrl: SRC },
  { id: 'astera-ax3-chrcse', manufacturer: 'Astera', model: 'AX3-CHRCSE Charging Case for 8 AX3', category: 'Charging / Transport', compatibleWith: AX3, sourceUrl: SRC },
  { id: 'astera-ax3-sp', manufacturer: 'Astera', model: 'AX3-SP Waterproof Charging Socket Cover', category: 'Protection', compatibleWith: AX3, sourceUrl: SRC },
  { id: 'astera-ax3-sta', manufacturer: 'Astera', model: 'AX3-STA Multi-Functional Bracket', category: 'Mounting', compatibleWith: AX3, includedWithFixture: true, sourceUrl: SRC },
  { id: 'astera-ax3-eblt', manufacturer: 'Astera', model: 'AX3-EBLT Hanging Hook', category: 'Safety / Mounting', compatibleWith: AX3, sourceUrl: SRC },
  { id: 'astera-ax3-feet', manufacturer: 'Astera', model: 'AX3-FEET Rubber Feet', category: 'Mounting', compatibleWith: AX3, sourceUrl: SRC },
  { id: 'astera-ax3-chr', manufacturer: 'Astera', model: 'AX3-CHR Charger', category: 'Power', compatibleWith: AX3, sourceUrl: SRC },
  { id: 'astera-ax3-clp', manufacturer: 'Astera', model: 'AX3-CLP Clamp', category: 'Mounting', compatibleWith: AX3, sourceUrl: SRC }
];
