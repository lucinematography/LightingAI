// Astera QuikSpot battery-powered Fresnel fixture.
// Specifications verified from Astera documentation and current product datasheet references.
const SRC = 'https://astera-led.com/products/quikspot/';

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

export const ASTERA_QUIKSPOT_ACCESSORIES = [];
