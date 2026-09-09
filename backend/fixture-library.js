export const FIXTURE_LIBRARY = [
  {
    id: 'aputure-ls-600d-pro',
    manufacturer: 'Aputure',
    model: 'LS 600d Pro',
    category: 'Light',
    sourceType: 'Daylight LED COB',
    powerDrawW: 720,
    outputPowerW: 600,
    cctK: { min: 5600, max: 5600, tolerance: 200 },
    colorMode: 'Daylight',
    cri: 96,
    tlci: 96,
    mount: 'Bowens',
    dimming: { minPercent: 0, maxPercent: 100 },
    control: ['On-board', 'Sidus Link', 'DMX512', 'Art-Net', 'LumenRadio CRMX'],
    acInput: '100-240V AC, 50/60Hz',
    batterySupport: '48V DC / dual battery operation',
    ipRating: 'IP54',
    photometrics: [
      { modifier: 'Hyper Reflector', distanceM: 1, lux: 98500 },
      { modifier: 'Hyper Reflector', distanceM: 3, lux: 8500 },
      { modifier: 'Hyper Reflector', distanceM: 5, lux: 3000 },
      { modifier: 'F10 Fresnel 15deg Spot', distanceM: 3, lux: 29300 }
    ],
  }
];
