export const ACCESSORY_LIBRARY = [
  {
    id: 'aputure-bowens-standard-reflector',
    manufacturer: 'Aputure',
    model: 'Bowens Mount Standard Reflector',
    category: 'Reflector',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-1200d-pro"],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: []
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: 'Directional reflector for increased control compared with bare fixture output.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-ls-600-series-hyper-reflector',
    manufacturer: 'Aputure',
    model: 'LS 600 Series Hyper Reflector',
    category: 'Reflector',
    compatibilityStatus: 'Compatible',
    compatibleWith: [
      'aputure-ls-600d-pro',
      'aputure-ls-600x-pro'
    ],
    mount: 'Bowens Mount',
    effectOnLight: 'High-output directional reflector designed for the LS 600 Series.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-light-dome-mini-ii',
    manufacturer: 'Aputure',
    model: 'Light Dome Mini II',
    category: 'Dome',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-60d","aputure-ls-60x","aputure-ls-300x"],
    mount: 'Bowens Mount',
    effectOnLight: 'Compact soft source for controlled diffusion.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-light-dome-se',
    manufacturer: 'Aputure',
    model: 'Light Dome SE',
    category: 'Dome',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-60d","aputure-ls-60x","aputure-ls-300x","aputure-ls-1200d-pro"],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: ['Remove inner baffle']
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: 'Circular soft source for diffused key and fill lighting.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-light-dome-ii',
    manufacturer: 'Aputure',
    model: 'Light Dome II',
    category: 'Dome',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-300x","aputure-ls-1200d-pro"],
    mount: 'Bowens Mount',
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: ['Remove inner baffle and gel holder']
      }
    },
    effectOnLight: 'Large circular soft source for broad diffused illumination.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-light-dome-150',
    manufacturer: 'Aputure',
    model: 'Light Dome 150',
    category: 'Dome',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-300x","aputure-ls-1200d-pro"],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: []
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: 'Large 150 cm circular soft source with selectable diffusion and light-control grid.',
    diffusionStops: [1.5, 2.5],
    gridAngleDeg: 45,
    sourceUrl: 'https://aputure.com/en-US/products/light-dome-150'
  },
  {
    id: 'aputure-light-octadome-120',
    manufacturer: 'Aputure',
    model: 'Light OctaDome 120',
    category: 'Softbox',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-300x","aputure-ls-1200d-pro"],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: ['Remove inner baffle']
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: 'Large octagonal soft source for broad controlled illumination.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-light-box-60x90',
    manufacturer: 'Aputure',
    model: 'Light Box 60x90',
    category: 'Softbox',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-1200d-pro"],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: ['Remove inner baffle']
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: 'Rectangular soft source for directional key or controlled fill.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-light-box-30x120',
    manufacturer: 'Aputure',
    model: 'Light Box 30x120',
    category: 'Softbox',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-300x","aputure-ls-1200d-pro"],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: ['Remove inner baffle']
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: 'Long rectangular soft source for narrow directional illumination.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-lantern',
    manufacturer: 'Aputure',
    model: 'Lantern',
    category: 'Lantern',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-1200d-pro"],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible but not optimized',
        conditions: []
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: 'Broad omnidirectional soft source for ambient and overhead-style illumination.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-lantern-90',
    manufacturer: 'Aputure',
    model: 'Lantern 90',
    category: 'Lantern',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-300x","aputure-ls-1200d-pro"],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: []
      }
    },
    mount: 'Bowens Mount',
    effectOnLight: 'Large omnidirectional soft source for broad ambient illumination.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-space-light',
    manufacturer: 'Aputure',
    model: 'Space Light',
    category: 'Softbox',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-300x","aputure-ls-1200d-pro"],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible but not optimized',
        conditions: []
      }
    },
    effectOnLight: 'Cylindrical overhead modifier for broad vertical illumination.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-f10-fresnel',
    manufacturer: 'Aputure',
    model: 'F10 Fresnel',
    category: 'Fresnel',
    compatibilityStatus: 'Designed For',
    compatibleWith: [
      'aputure-ls-600d-pro',
      'aputure-ls-600x-pro',
      'aputure-ls-1200d-pro'
    ],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: []
      }
    },
    mount: 'Bowens Mount',
    beamAngleDeg: { min: 15, max: 45 },
    photometrics: [
      { fixtureId: 'aputure-ls-600d-pro', beam: 'Flood 45deg', distanceM: 1, lux: 89200 },
      { fixtureId: 'aputure-ls-600d-pro', beam: 'Flood 45deg', distanceM: 3, lux: 11440 },
      { fixtureId: 'aputure-ls-600d-pro', beam: 'Flood 45deg', distanceM: 5, lux: 4260 },
      { fixtureId: 'aputure-ls-600d-pro', beam: 'Spot 15deg', distanceM: 1, lux: 224200 },
      { fixtureId: 'aputure-ls-600d-pro', beam: 'Spot 15deg', distanceM: 3, lux: 29300 },
      { fixtureId: 'aputure-ls-600d-pro', beam: 'Spot 15deg', distanceM: 5, lux: 10580 }
    ],
    effectOnLight: 'Variable-focus Fresnel converting point-source output into controlled hard light.',
    sourceUrl: 'https://aputure.com/en-US/products/f10-fresnel'
  },
  {
    id: 'aputure-f10-barn-doors',
    manufacturer: 'Aputure',
    model: 'F10 Barn Doors',
    category: 'Barn Door',
    compatibilityStatus: 'Designed For',
    compatibleWith: ['aputure-f10-fresnel'],
    effectOnLight: 'Eight-leaf beam shaping system for cutting and controlling F10 Fresnel spill.',
    sourceUrl: 'https://aputure.com/en-US/products/f10-fresnel'
  },
  {
    id: 'aputure-spotlight-mount',
    manufacturer: 'Aputure',
    model: 'Spotlight Mount',
    category: 'Spotlight',
    compatibilityStatus: 'Compatible',
    compatibleWith: ["aputure-ls-600d-pro","aputure-ls-600x-pro","aputure-ls-300x"],
    effectOnLight: 'Ellipsoidal projection modifier for controlled hard-light shaping and gobo projection.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
  {
    id: 'aputure-spotlight-mount-18-leaf-iris',
    manufacturer: 'Aputure',
    model: '18-Leaf Iris for Spotlight Mount',
    category: 'Iris',
    compatibilityStatus: 'Designed For',
    compatibleWith: ['aputure-spotlight-mount'],
    effectOnLight: 'Adjusts the projected beam aperture of the Spotlight Mount.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=ls-600d-pro'
  },
{
    id: 'aputure-ls-60-softbox',
    manufacturer: 'Aputure',
    model: 'LS 60 Softbox',
    category: 'Softbox',
    compatibilityStatus: 'Designed For',
    compatibleWith: [
      'aputure-ls-60d',
      'aputure-ls-60x'
    ],
    mount: 'LS 60 Mini Mount',
    diffusionStops: [1.5, 2.5],
    effectOnLight: 'Compact soft source designed specifically for the LS 60d/60x optical output.',
    conditions: 'Designed for LS 60d/60x; use 45° flood for maximum diffusion fill.',
    sourceUrl: 'https://help.aputure.com/en/modifiers/ls-60-softbox-faqs'
  },
  {
    id: 'aputure-spotlight-mini-zoom',
    manufacturer: 'Aputure',
    model: 'Spotlight Mini Zoom',
    category: 'Spotlight',
    compatibilityStatus: 'Designed For',
    compatibleWith: [
      'aputure-ls-60d',
      'aputure-ls-60x'
    ],
    effectOnLight: 'Precision projection attachment with 2X optical zoom range.',
    conditions: 'Best results with LS 60d/60x set to 15° spot mode.',
    sourceUrl: 'https://help.aputure.com/en/ls60d/accessories'
  },
  
  
  {
    id: 'aputure-light-box-45x45',
    manufacturer: 'Aputure',
    model: 'Light Box 45x45',
    category: 'Softbox',
    compatibilityStatus: 'Compatible',
    compatibleWith: [
      'aputure-ls-60d',
      'aputure-ls-60x',
      'aputure-ls-300x'
    ],
    mount: 'Bowens Mount Adapter',
    effectOnLight: 'Compact square soft source for controlled diffusion.',
    conditions: 'LS 60d/60x require the LS 60 Bowens Mount Adapter.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard'
  },
  
  
  
  
  
  
  
  {
    id: 'aputure-storm-1200x-cf12-fresnel',
    manufacturer: 'Aputure',
    model: 'CF12 Fresnel',
    category: 'Fresnel',
    compatibilityStatus: 'Designed For',
    compatibleWith: [
      'aputure-storm-1200x'
    ],
    mount: 'Bowens Mount',
    effectOnLight: 'Compact Fresnel optic for controlled hard-light output.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1200x'
  },
  {
    id: 'aputure-storm-1200x-15-reflector',
    manufacturer: 'Aputure',
    model: 'STORM 1000c/1200x 15° Reflector',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: [
      'aputure-storm-1200x'
    ],
    beamAngleDeg: { min: 15, max: 15 },
    effectOnLight: 'Narrow reflector for concentrated directional output.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1200x'
  },
  {
    id: 'aputure-storm-1200x-30-reflector',
    manufacturer: 'Aputure',
    model: 'STORM 1000c/1200x 30° Reflector',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: [
      'aputure-storm-1200x'
    ],
    beamAngleDeg: { min: 30, max: 30 },
    effectOnLight: 'Medium-width reflector for controlled directional output.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1200x'
  },
  {
    id: 'aputure-storm-1200x-45-reflector',
    manufacturer: 'Aputure',
    model: 'STORM 1000c/1200x 45° Reflector',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: [
      'aputure-storm-1200x'
    ],
    beamAngleDeg: { min: 45, max: 45 },
    effectOnLight: 'Wider reflector for broader directional output.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1200x'
  },
  {
    id: 'aputure-storm-1200x-barn-door-adapter',
    manufacturer: 'Aputure',
    model: 'STORM 1000c/1200x Barn Doors Adapter',
    category: 'Mount Adapter',
    compatibilityStatus: 'Designed For',
    compatibleWith: [
      'aputure-storm-1200x'
    ],
    effectOnLight: 'Adapter allowing CF12 Barn Doors to mount directly to STORM 1000c/1200x.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-1200x'
  },
  {
    id: 'aputure-cf12-barn-doors',
    manufacturer: 'Aputure',
    model: 'CF12 Barn Doors',
    category: 'Barn Door',
    compatibilityStatus: 'Designed For',
    compatibleWith: [
      'aputure-storm-1200x'
    ],
    effectOnLight: 'Beam shaping barn doors for the CF12 Fresnel.',
    conditions: 'Requires STORM 1000c/1200x Barn Doors Adapter for direct fixture mounting.',
    sourceUrl: 'https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=cf12-barn-doors'
  },
{
    id: 'aputure-ls1200-hyper-reflector-narrow',
    manufacturer: 'Aputure',
    model: 'LS 1200 Series Hyper Reflector Narrow (BM1215)',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: ['aputure-ls-1200d-pro'],
    mount: 'Bowens Mount',
    beamAngleDeg: { min: 15, max: 15 },
    includedWithFixture: true,
    photometrics: [
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 3, lux: 83100 },
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 5, lux: 28340 },
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 7, lux: 15200 },
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 9, lux: 8580 }
    ],
    effectOnLight: 'Narrow high-output directional beam.',
    sourceUrl: 'https://aputure.com/en-US/products/ls-1200d-pro-reflector-kit'
  },
  {
    id: 'aputure-ls1200-hyper-reflector-medium',
    manufacturer: 'Aputure',
    model: 'LS 1200 Series Hyper Reflector Medium (BM1230)',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: ['aputure-ls-1200d-pro'],
    mount: 'Bowens Mount',
    beamAngleDeg: { min: 30, max: 30 },
    includedWithFixture: true,
    photometrics: [
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 3, lux: 22400 },
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 5, lux: 8200 },
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 7, lux: 4660 },
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 9, lux: 2880 }
    ],
    effectOnLight: 'Medium directional beam balancing spread and intensity.',
    sourceUrl: 'https://aputure.com/en-US/products/ls-1200d-pro-reflector-kit'
  },
  {
    id: 'aputure-ls1200-hyper-reflector-wide',
    manufacturer: 'Aputure',
    model: 'LS 1200 Series Hyper Reflector Wide (BM1245)',
    category: 'Reflector',
    compatibilityStatus: 'Designed For',
    compatibleWith: ['aputure-ls-1200d-pro'],
    mount: 'Bowens Mount',
    beamAngleDeg: { min: 45, max: 45 },
    includedWithFixture: true,
    photometrics: [
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 3, lux: 13010 },
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 5, lux: 4800 },
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 7, lux: 2706 },
      { fixtureId: 'aputure-ls-1200d-pro', distanceM: 9, lux: 1775 }
    ],
    effectOnLight: 'Wide directional beam for broader coverage.',
    sourceUrl: 'https://aputure.com/en-US/products/ls-1200d-pro-reflector-kit'
  },
{
    id: 'aputure-ls1200d-four-light-bracket',
    manufacturer: 'Aputure',
    model: 'LS 1200d Four-Light Bracket',
    category: 'Yoke',
    compatibilityStatus: 'Designed For',
    compatibleWith: ['aputure-ls-1200d-pro'],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Designed For',
        conditions: []
      }
    },
    includedWithFixture: false,
    effectOnLight: 'Mounting bracket designed to combine multiple LS 1200d Pro lamp heads into a multi-light array.',
    sourceUrl: 'https://aputure.com/EN-US/products/ls-1200d-pro'
  },
  {
    id: 'aputure-ls1200d-neutrik-power-cable-6m',
    manufacturer: 'Aputure',
    model: 'Neutrik Power Cable for LS 1200d Pro (6m)',
    category: 'Power',
    compatibilityStatus: 'Designed For',
    compatibleWith: ['aputure-ls-1200d-pro'],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Designed For',
        conditions: []
      }
    },
    includedWithFixture: true,
    effectOnLight: 'Mains power connection cable for the LS 1200d Pro system.',
    sourceUrl: 'https://aputure.com/EN-US/products/ls-1200d-pro'
  },
  {
    id: 'aputure-7-pin-weatherproof-head-cable-7-5m',
    manufacturer: 'Aputure',
    model: '7-Pin Weatherproof Head Cable (7.5m)',
    category: 'Cable',
    compatibilityStatus: 'Compatible',
    compatibleWith: ['aputure-ls-1200d-pro'],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: []
      }
    },
    includedWithFixture: true,
    effectOnLight: 'Weatherproof head cable connecting the LS 1200d Pro lamp head and control box.',
    sourceUrl: 'https://aputure.com/EN-US/products/ls-1200d-pro'
  },
  {
    id: 'aputure-spotlight-max-36-lens-kit',
    manufacturer: 'Aputure',
    model: 'Spotlight Max 36° Lens Kit',
    category: 'Spotlight',
    compatibilityStatus: 'Compatible',
    compatibleWith: ['aputure-ls-1200d-pro'],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: []
      }
    },
    includedWithFixture: false,
    beamAngleDeg: { min: 36, max: 36 },
    effectOnLight: 'Projection optic for controlled 36-degree beam shaping and precise light placement.',
    sourceUrl: 'https://aputure.com/EN-US/products/ls-1200d-pro'
  },
  {
    id: 'aputure-quick-dome-60',
    manufacturer: 'Aputure',
    model: 'Quick Dome 60',
    category: 'Dome',
    compatibilityStatus: 'Compatible',
    compatibleWith: ['aputure-ls-1200d-pro'],
    compatibility: {
      'aputure-ls-1200d-pro': {
        status: 'Compatible',
        conditions: []
      }
    },
    includedWithFixture: false,
    effectOnLight: 'Compact soft-light modifier for broad, diffused illumination.',
    sourceUrl: 'https://aputure.com/EN-US/products/ls-1200d-pro'
  }
];
