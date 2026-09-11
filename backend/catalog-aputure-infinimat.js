// Official Aputure INFINIMAT accessories verified 2026-09-11.
const makeAccessory = ({
  id,
  model,
  category,
  compatibleWith,
  sourceUrl,
  effectOnLight,
  compatibilityStatus = 'Designed For',
  includedWithFixture = false,
  conditions = [],
  ...extra
}) => ({
  id,
  manufacturer: 'Aputure',
  model,
  category,
  compatibilityStatus,
  compatibleWith,
  compatibility: Object.fromEntries(
    compatibleWith.map(fixtureId => [
      fixtureId,
      {
        status: compatibilityStatus,
        includedWithFixture,
        conditions
      }
    ])
  ),
  effectOnLight,
  sourceUrl,
  ...extra
});

const MAT_SIZES = [
  {
    size: '1x2',
    fixtureId: 'aputure-infinimat-1x2',
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-1x2-with-clear-softbox'
  },
  {
    size: '1x4',
    fixtureId: 'aputure-infinimat-1x4',
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-1x4-with-clear-softbox'
  },
  {
    size: '2x4',
    fixtureId: 'aputure-infinimat-2x4',
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-2x4-with-clear-softbox'
  },
  {
    size: '4x4',
    fixtureId: 'aputure-infinimat-4x4',
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-4x4-with-clear-softbox'
  },
  {
    size: '8x8',
    fixtureId: 'aputure-infinimat-8x8',
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-8x8-with-clear-softbox'
  },
  {
    size: '20x20',
    fixtureId: 'aputure-infinimat-20x20',
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-20x20-with-clear-softbox'
  }
];

const MAT_SMALL = MAT_SIZES.slice(0, 3).map(({ fixtureId }) => fixtureId);
const MAT_SMALL_PLUS_4X4 = MAT_SIZES.slice(0, 4).map(({ fixtureId }) => fixtureId);
const MAT_LARGE = MAT_SIZES.slice(3).map(({ fixtureId }) => fixtureId);
const MAT_ALL = MAT_SIZES.map(({ fixtureId }) => fixtureId);
const FAMILY_URL = 'https://aputure.com/en-US/product-families/infinimat';

const RIGID_SOFTBOX_ACCESSORIES = MAT_SIZES.slice(0, 4).map(({ size, fixtureId, sourceUrl }) =>
  makeAccessory({
    id: `aputure-infinimat-rigid-softbox-${size}`,
    model: `Aputure INFINIMAT Rigid Softbox ${size}`,
    category: 'Softbox',
    compatibleWith: [fixtureId],
    sourceUrl,
    effectOnLight: `Rigid frame with interchangeable diffusion for INFINIMAT ${size}.`
  })
);

const CONTROL_GRID_ACCESSORIES = MAT_SIZES.map(({ size, fixtureId, sourceUrl }) =>
  makeAccessory({
    id: `aputure-infinimat-control-grid-${size}`,
    model: `Aputure INFINIMAT Control Grid ${size}`,
    category: 'Grid',
    compatibleWith: [fixtureId],
    sourceUrl,
    effectOnLight: `Light control grid for INFINIMAT ${size}, reducing spill while preserving the soft source.`,
    conditions: ['Use with the matching INFINIMAT size.']
  })
);

const CONTROL_SKIRT_ACCESSORIES = MAT_SIZES.map(({ size, fixtureId, sourceUrl }) =>
  makeAccessory({
    id: `aputure-infinimat-control-skirt-${size}`,
    model: `Aputure INFINIMAT Control Skirt ${size}`,
    category: 'Other',
    compatibleWith: [fixtureId],
    sourceUrl,
    effectOnLight: `Black control skirt for INFINIMAT ${size} to contain lateral spill.`,
    conditions: ['Use with the matching inflatable softbox.']
  })
);

const DIFFUSION_ACCESSORIES = MAT_SIZES.flatMap(({ size, fixtureId, sourceUrl }) =>
  [1, 2].map(stop =>
    makeAccessory({
      id: `aputure-infinimat-diffusion-cloth-${size}-${stop}-stop`,
      model: `Aputure INFINIMAT Diffusion Cloth ${stop}-Stop ${size}`,
      category: 'Diffusion',
      compatibleWith: [fixtureId],
      sourceUrl,
      effectOnLight: `${stop}-stop interchangeable diffusion cloth for the INFINIMAT ${size} inflatable softbox.`,
      conditions: ['Use with the matching INFINIMAT size and clear softbox.']
    })
  )
);

const CLEAR_SOFTBOX_PACK_ACCESSORIES = MAT_SIZES.map(({ size, fixtureId, sourceUrl }) =>
  makeAccessory({
    id: `aputure-infinimat-clear-softbox-pack-${size}`,
    model: size === '20x20'
      ? 'Aputure INFINIMAT Inflatable Clear Softbox 20x20'
      : `Aputure INFINIMAT LED & Clear Softbox Pack ${size}`,
    category: 'Softbox',
    compatibleWith: [fixtureId],
    sourceUrl,
    effectOnLight: `Inflatable clear airbag and softbox component for building an INFINIMAT ${size} system.`,
    conditions: ['The complete system includes the matching lamp head and size-specific components.']
  })
);

const INFINIMAT_CONTROL_BOXES = [
  makeAccessory({
    id: 'aputure-infinimat-control-box-400w',
    model: 'Aputure INFINIMAT Control Box 400W',
    category: 'Control',
    compatibleWith: MAT_ALL,
    sourceUrl: FAMILY_URL,
    effectOnLight: '400W universal INFINIMAT power and control box for small-mat combinations.',
    conditions: ['Aputure documents 400W combinations for 1x2, 1x4 and 2x4 mats; stay within the 400W output limit.']
  }),
  makeAccessory({
    id: 'aputure-infinimat-control-box-1600w',
    model: 'Aputure INFINIMAT Control Box 1600W',
    category: 'Control',
    compatibleWith: MAT_ALL,
    sourceUrl: FAMILY_URL,
    effectOnLight: '1,600W universal INFINIMAT power and control box for high-power mats and arrays.',
    conditions: ['Aputure documents 1600W combinations up to five mats; use the correct high-power ports and AC power cable.']
  })
];

const INFINIMAT_HEAD_CABLES = [
  makeAccessory({
    id: 'aputure-infinimat-head-cable-7-5m-400w',
    model: 'Aputure INFINIMAT 7.5m Head Cable (400W)',
    category: 'Cable',
    compatibleWith: MAT_SMALL,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-1x2-with-clear-softbox',
    effectOnLight: '7.5-meter head cable for connecting small INFINIMAT mats to the 400W control box.',
    conditions: ['Use with the INFINIMAT Control Box 400W and compatible small-mat combinations.']
  }),
  makeAccessory({
    id: 'aputure-infinimat-head-cable-15m-400w',
    model: 'Aputure INFINIMAT 15m Head Cable (400W)',
    category: 'Cable',
    compatibleWith: MAT_SMALL,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-1x4-with-clear-softbox',
    effectOnLight: '15-meter head cable for extending small INFINIMAT mat placement from the 400W control box.',
    conditions: ['Use with the INFINIMAT Control Box 400W and compatible small-mat combinations.']
  }),
  makeAccessory({
    id: 'aputure-infinimat-head-cable-7-5m-1600w',
    model: 'Aputure INFINIMAT 7.5m Head Cable (1600W)',
    category: 'Cable',
    compatibleWith: MAT_LARGE,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-4x4-with-clear-softbox',
    effectOnLight: '7.5-meter high-power head cable for 4x4, 8x8 and 20x20 INFINIMAT systems.',
    conditions: ['Use with the INFINIMAT Control Box 1600W.']
  }),
  makeAccessory({
    id: 'aputure-infinimat-head-cable-15m-1600w',
    model: 'Aputure INFINIMAT 15m Head Cable (1600W)',
    category: 'Cable',
    compatibleWith: MAT_LARGE,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-8x8-with-clear-softbox',
    effectOnLight: '15-meter high-power head cable for remote placement of large INFINIMAT mats.',
    conditions: ['Use with the INFINIMAT Control Box 1600W.']
  })
];

const INFINIMAT_MOUNTING_ACCESSORIES = [
  ...MAT_SIZES.slice(0, 3).map(({ size, fixtureId, sourceUrl }) =>
    makeAccessory({
      id: `aputure-infinimat-carbon-fiber-mounting-bracket-${size}`,
      model: `Aputure INFINIMAT Carbon Fiber Mounting Bracket ${size}`,
      category: 'Bracket',
      compatibleWith: [fixtureId],
      sourceUrl,
      effectOnLight: `Carbon-fiber mounting bracket for rigid support of the INFINIMAT ${size} mat.`
    })
  ),
  makeAccessory({
    id: 'aputure-infinimat-mounting-bracket-4x4',
    model: 'Aputure INFINIMAT Mounting Bracket 4x4',
    category: 'Bracket',
    compatibleWith: ['aputure-infinimat-4x4'],
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-4x4-with-clear-softbox',
    effectOnLight: 'Rigid mounting bracket for the INFINIMAT 4x4 frame.'
  }),
  makeAccessory({
    id: 'aputure-infinimat-k-mount-arm-straight-5-8',
    model: 'Aputure INFINIMAT K-Mount Arm with Straight 5/8in Pin',
    category: 'Mount Adapter',
    compatibleWith: MAT_SMALL_PLUS_4X4,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-1x2-with-clear-softbox',
    effectOnLight: 'Straight 5/8-inch pin arm for stand mounting small and 4x4 INFINIMAT frames.',
    conditions: ['Use only with a properly supported mounting bracket.']
  }),
  makeAccessory({
    id: 'aputure-infinimat-k-mount-curved-tvmp-arm',
    model: 'Aputure INFINIMAT K-Mount with TVMP Spigot Curved Arm',
    category: 'Mount Adapter',
    compatibleWith: ['aputure-infinimat-4x4'],
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-4x4-with-clear-softbox',
    effectOnLight: 'Curved TVMP spigot arm for positioning the INFINIMAT 4x4.',
    conditions: ['Use with the matching 4x4 mounting bracket and a rated stand.']
  }),
  makeAccessory({
    id: 'aputure-infinimat-k-mount-style-mounting-clamp',
    model: 'Aputure INFINIMAT K-Mount Style Mounting Clamp',
    category: 'Bracket',
    compatibleWith: MAT_SMALL,
    sourceUrl: FAMILY_URL,
    effectOnLight: 'K-mount style clamp for securing the 400W control box pack.'
  })
];

const INFINIMAT_POWER_ACCESSORIES = [
  makeAccessory({
    id: 'aputure-infinimat-powercon-cable-6m',
    model: 'Aputure PowerCON Cable 6m',
    category: 'Power',
    compatibleWith: MAT_SMALL,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-1x2-with-clear-softbox',
    effectOnLight: '6-meter PowerCON cable for powering the INFINIMAT Control Box 400W.',
    conditions: ['Use the connector and mains specification supplied for the local market.']
  }),
  makeAccessory({
    id: 'aputure-infinimat-lp24-ac-power-cable',
    model: 'Aputure INFINIMAT LP-24 AC Power Cable',
    category: 'Power',
    compatibleWith: MAT_LARGE,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-4x4-with-clear-softbox',
    effectOnLight: 'LP-24 AC power cable for the INFINIMAT Control Box 1600W.',
    conditions: ['The US version uses an Edison 5-20P connector; verify regional plug before deployment.']
  })
];

const INFINIMAT_AIR_PUMPS = [
  makeAccessory({
    id: 'aputure-infinimat-air-pump-mini',
    model: 'Aputure INFINIMAT Air Pump Mini',
    category: 'Other',
    compatibleWith: MAT_SMALL_PLUS_4X4,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-1x2-with-clear-softbox',
    effectOnLight: 'Compact electric pump for inflating the 1x2, 1x4, 2x4 and 4x4 clear airbags.',
    conditions: ['Use the matching valve and allow the airbag to reach full inflation before fitting diffusion.']
  }),
  makeAccessory({
    id: 'aputure-infinimat-air-pump-max',
    model: 'Aputure INFINIMAT Air Pump Max',
    category: 'Other',
    compatibleWith: ['aputure-infinimat-8x8', 'aputure-infinimat-20x20'],
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-8x8-with-clear-softbox',
    effectOnLight: 'High-capacity pump for the 8x8 and 20x20 clear airbags.',
    conditions: ['Use for large airbags only and follow the setup guide for the full-inflation sequence.']
  })
];

const INFINIMAT_CASES = [
  ...MAT_SIZES.slice(0, 3).map(({ size, fixtureId, sourceUrl }) =>
    makeAccessory({
      id: `aputure-infinimat-carrying-case-led-softbox-${size}`,
      model: `Aputure INFINIMAT Carrying Case LED & Clear Softbox ${size}`,
      category: 'Other',
      compatibleWith: [fixtureId],
      sourceUrl,
      effectOnLight: `Protective carrying case for the INFINIMAT ${size} lamp head and clear softbox kit.`
    })
  ),
  makeAccessory({
    id: 'aputure-infinimat-rolling-case-led-softbox-4x4',
    model: 'Aputure INFINIMAT Rolling Case LED & Clear Softbox 4x4',
    category: 'Other',
    compatibleWith: ['aputure-infinimat-4x4'],
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-4x4-with-clear-softbox',
    effectOnLight: 'Rolling case for transporting the INFINIMAT 4x4 lamp head and softbox system.'
  }),
  makeAccessory({
    id: 'aputure-infinimat-flight-case-led-softbox-8x8',
    model: 'Aputure INFINIMAT Flight Case LED & Clear Softbox 8x8',
    category: 'Other',
    compatibleWith: ['aputure-infinimat-8x8'],
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-8x8-with-clear-softbox',
    effectOnLight: 'Flight case for transporting the INFINIMAT 8x8 lamp head and inflatable softbox.'
  }),
  makeAccessory({
    id: 'aputure-infinimat-flight-case-softbox-20x20',
    model: 'Aputure INFINIMAT Flight Case Inflatable Clear Softbox 20x20',
    category: 'Other',
    compatibleWith: ['aputure-infinimat-20x20'],
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-20x20-with-clear-softbox',
    effectOnLight: 'Flight case for the separate 20x20 inflatable softbox and diffusion package.'
  }),
  makeAccessory({
    id: 'aputure-infinimat-carrying-case-control-box-400w',
    model: 'Aputure INFINIMAT Carrying Case Control Box 400W Pack',
    category: 'Other',
    compatibleWith: MAT_SMALL,
    sourceUrl: FAMILY_URL,
    effectOnLight: 'Protective carrying case for the INFINIMAT Control Box 400W pack.'
  }),
  makeAccessory({
    id: 'aputure-infinimat-rolling-case-control-box-1600w',
    model: 'Aputure INFINIMAT Rolling Case Control Box 1600W Pack',
    category: 'Other',
    compatibleWith: MAT_LARGE,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-4x4-with-clear-softbox',
    effectOnLight: 'Rolling case for the INFINIMAT Control Box 1600W pack.'
  })
];

const INFINIMAT_SERVICE_AND_SAFETY = [
  makeAccessory({
    id: 'aputure-infinimat-patch-kit',
    model: 'Aputure INFINIMAT Patch Kit',
    category: 'Other',
    compatibleWith: MAT_ALL,
    sourceUrl: FAMILY_URL,
    effectOnLight: 'Repair patch kit for maintaining the inflatable INFINIMAT airbags.',
    conditions: ['Match the patch material and adhesive to the airbag repair instructions.']
  }),
  makeAccessory({
    id: 'aputure-infinimat-cushion-4x4',
    model: 'Aputure INFINIMAT Cushion 4x4',
    category: 'Other',
    compatibleWith: ['aputure-infinimat-4x4'],
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-4x4-with-clear-softbox',
    effectOnLight: 'Protective cushion for the INFINIMAT 4x4 inflatable system.'
  }),
  makeAccessory({
    id: 'aputure-infinimat-cushion-8x8',
    model: 'Aputure INFINIMAT Cushion 8x8',
    category: 'Other',
    compatibleWith: ['aputure-infinimat-8x8'],
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-8x8-with-clear-softbox',
    effectOnLight: 'Protective cushion for the INFINIMAT 8x8 inflatable system.'
  }),
  makeAccessory({
    id: 'aputure-infinimat-cushion-20x20',
    model: 'Aputure INFINIMAT Cushion 20x20',
    category: 'Other',
    compatibleWith: ['aputure-infinimat-20x20'],
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-20x20-with-clear-softbox',
    effectOnLight: 'Protective cushion for the large 20x20 inflatable softbox.'
  }),
  makeAccessory({
    id: 'aputure-infinimat-safety-rope-1-3m',
    model: 'Aputure INFINIMAT Safety Rope 1.3m',
    category: 'Other',
    compatibleWith: MAT_LARGE,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-infinimat-4x4-with-clear-softbox',
    effectOnLight: '1.3-meter safety rope for securing large INFINIMAT systems during rigging.'
  })
];

export const APUTURE_INFINIMAT_ACCESSORIES = [
  ...RIGID_SOFTBOX_ACCESSORIES,
  ...CONTROL_GRID_ACCESSORIES,
  ...CONTROL_SKIRT_ACCESSORIES,
  ...DIFFUSION_ACCESSORIES,
  ...CLEAR_SOFTBOX_PACK_ACCESSORIES,
  ...INFINIMAT_CONTROL_BOXES,
  ...INFINIMAT_HEAD_CABLES,
  ...INFINIMAT_MOUNTING_ACCESSORIES,
  ...INFINIMAT_POWER_ACCESSORIES,
  ...INFINIMAT_AIR_PUMPS,
  ...INFINIMAT_CASES,
  ...INFINIMAT_SERVICE_AND_SAFETY
];
