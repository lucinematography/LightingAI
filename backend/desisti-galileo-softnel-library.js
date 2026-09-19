// De Sisti Galileo SoftNel hybrid Fresnel/softlight fixture.
// Verified from the official De Sisti Galileo SoftNel product page.
const SRC='https://www.desisti.it/galileo-softnel/';

export const DESISTI_GALILEO_FIXTURES=[
  {
    id:'desisti-galileo-softnel',
    manufacturer:'De Sisti',
    model:'Galileo SoftNel',
    family:'Galileo',
    category:'Light',
    sourceType:'Hybrid Fresnel + Softlight LED',
    fresnelLedPowerW:185,
    softLedPowerW:185,
    totalLedPowerW:370,
    cctK:{min:2800,max:6600},
    colorMode:'Vari-White',
    cri:95,
    tlci:96,
    fresnelLensDiameterMm:120,
    softDiffuserDiameterMm:250,
    ipRating:'IP20',
    weightKg:13.0,
    poleOperatedWeightKg:14.3,
    control:['DMX512','On-board dimming'],
    dmxModes:[
      {name:'8-bit',channels:6,verified:true,sourceUrl:SRC},
      {name:'16-bit',channels:8,verified:true,sourceUrl:SRC}
    ],
    sourceUrl:SRC
  }
];

const ALL=['desisti-galileo-softnel'];

export const DESISTI_GALILEO_ACCESSORIES=[
  {
    id:'desisti-galileo-four-leaf-barndoor',
    manufacturer:'De Sisti',
    model:'Galileo 4 Leaf Rotating Barndoor',
    category:'Barn Door',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    weightKg:1.4,
    effectOnLight:'Shapes the Fresnel component of the Galileo beam and controls spill.',
    sourceUrl:SRC
  },
  {
    id:'desisti-galileo-eight-leaf-barndoor',
    manufacturer:'De Sisti',
    model:'Galileo 8 Leaf Rotating Barndoor',
    category:'Barn Door',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    weightKg:1.65,
    effectOnLight:'Eight-leaf beam shaping for finer spill control.',
    sourceUrl:SRC
  },
  {
    id:'desisti-galileo-color-frame',
    manufacturer:'De Sisti',
    model:'Galileo 305 mm Color Frame',
    category:'Filter Frame',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    weightKg:0.28,
    sourceUrl:SRC
  },
  {
    id:'desisti-galileo-scrim-set',
    manufacturer:'De Sisti',
    model:'Galileo 305 mm Scrim Set',
    category:'Scrim Set',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    effectOnLight:'Reduces Fresnel output while preserving beam geometry.',
    sourceUrl:SRC
  },
  {
    id:'desisti-galileo-manual-yoke',
    manufacturer:'De Sisti',
    model:'Galileo Positive-Lock Manual Yoke',
    category:'Mounting',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    sourceUrl:SRC
  },
  {
    id:'desisti-galileo-pole-yoke',
    manufacturer:'De Sisti',
    model:'Galileo Pole-Operated Yoke',
    category:'Mounting',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    sourceUrl:SRC
  },
  {
    id:'desisti-galileo-powercon-true1',
    manufacturer:'De Sisti',
    model:'Galileo powerCON TRUE1 Power Cable',
    category:'Power / Cable',
    compatibilityStatus:'Compatible',
    compatibleWith:ALL,
    sourceUrl:SRC
  },
  {
    id:'desisti-galileo-5pin-dmx',
    manufacturer:'De Sisti',
    model:'Galileo 5-pin DMX Cable',
    category:'DMX Cable',
    compatibilityStatus:'Compatible',
    compatibleWith:ALL,
    sourceUrl:SRC
  }
];
