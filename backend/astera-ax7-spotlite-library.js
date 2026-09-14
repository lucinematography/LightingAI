// Discontinued Astera AX7 SpotLite RGBW spotlight and verified accessories.
// Canonical specifications from the Astera AX7 SpotLite product sheet and manual.
const SRC = 'https://astera-led.com/products/ax7-spotlite/';

export const ASTERA_AX7_SPOTLITE_FIXTURES = [
  {
    id: 'astera-ax7-spotlite',
    manufacturer: 'Astera',
    model: 'AX7 SpotLite',
    family: 'AX7',
    category: 'Light',
    discontinued: true,
    sourceType: '4 × 15 W RGBW CREE LEDs',
    totalLedPowerW: 60,
    powerDrawW: 60,
    colorMode: 'RGBW',
    pixels: 1,
    beamAngleDeg: 13,
    luminousFluxLm: 1675,
    batteryPowered: true,
    batteryRuntimeHours: { max: 20 },
    chargingTimeHours: { min: 5, max: 20 },
    acInput: '110–240 VAC, 50/60 Hz',
    acConnector: 'powerCON TRUE1 IN/OUT',
    ipRating: 'IP65',
    weightKg: 6.1,
    dimensionsMm: { length: 279, width: 253, height: 296 },
    control: {
      wired: [],
      wireless: ['AsteraApp', 'CRMX', 'W-DMX', 'UHF'],
      builtInCRMX: true,
      builtInBTB: false
    },
    sourceUrl: SRC
  }
];

const AX7 = ['astera-ax7-spotlite'];
const AX7_AND_AX10 = [...AX7, 'astera-ax10-spotmax'];

export const ASTERA_AX7_SPOTLITE_ACCESSORIES = [
  { id: 'astera-ax7-flood-diffuser', manufacturer: 'Astera', model: 'AX10-DDSK 32° Flood Diffuser', category: 'Light Control', compatibleWith: AX7_AND_AX10, includedWithFixture: true, sourceUrl: SRC },
  { id: 'astera-ax7-wallwash-diffuser', manufacturer: 'Astera', model: 'AX10-WWDSK 17° × 46° Wallwash Diffuser', category: 'Light Control', compatibleWith: AX7_AND_AX10, includedWithFixture: true, sourceUrl: SRC },
  { id: 'astera-ax7-charging-case-4', manufacturer: 'Astera', model: 'AX7 Charging Case for 4 fixtures', category: 'Charging / Transport', compatibleWith: AX7, sourceUrl: SRC },
  { id: 'astera-ax7-charging-case-8', manufacturer: 'Astera', model: 'AX7 Charging Case for 8 fixtures', category: 'Charging / Transport', compatibleWith: AX7, sourceUrl: SRC },
  { id: 'astera-ax10-blt-ax7', manufacturer: 'Astera', model: 'AX10-BLT SuperBolt', category: 'Mounting', compatibleWith: AX7_AND_AX10, sourceUrl: SRC }
];
