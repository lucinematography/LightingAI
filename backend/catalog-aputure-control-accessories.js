// Official Aputure control, power and service accessories verified 2026-09-11.
const makeAccessory = ({
  id,
  model,
  category,
  compatibleWith,
  sourceUrl,
  effectOnLight,
  compatibilityStatus = 'Designed For',
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
    compatibleWith.map(productId => [
      productId,
      {
        status: compatibilityStatus,
        includedWithFixture: false,
        conditions
      }
    ])
  ),
  effectOnLight,
  sourceUrl,
  ...extra
});

const STORM_80C = ['aputure-storm-80c'];
const SIDUS_ONE = ['aputure-sidus-one'];
const SIDUS_FOUR = ['aputure-sidus-four'];
const INFINIMAT = [
  'aputure-infinimat-1x2',
  'aputure-infinimat-1x4',
  'aputure-infinimat-2x4',
  'aputure-infinimat-4x4',
  'aputure-infinimat-8x8',
  'aputure-infinimat-20x20'
];
const BATTERY_STATION = ['aputure-2-bay-battery-power-station'];
const BATTERY_POWER_COMPATIBLE_LIGHTS = [
  'aputure-ls-600d-pro',
  'aputure-ls-600c-pro-ii',
  'aputure-nova-p300c',
  'aputure-ls-300x',
  'aputure-ls-600x-pro',
  'aputure-nova-p600c',
  'aputure-ls-300d-ii',
  'aputure-ls-1200d-pro'
];

const STORM_80C_SERVICE = [
  makeAccessory({
    id: 'aputure-storm-80c-handbag',
    model: 'Handbag for STORM 80c',
    category: 'Other',
    compatibleWith: STORM_80C,
    sourceUrl: 'https://aputure.com/en-US/products/handbag-for-storm-80c',
    effectOnLight: 'Compact carrying bag for transporting the STORM 80c lamp head and essential accessories.'
  }),
  makeAccessory({
    id: 'aputure-storm-80c-locking-handle',
    model: 'Locking Handle for STORM 80c',
    category: 'Bracket',
    compatibleWith: STORM_80C,
    sourceUrl: 'https://aputure.com/en-US/products/locking-handle-for-storm-80c',
    effectOnLight: 'Replacement locking handle for the STORM 80c.'
  }),
  makeAccessory({
    id: 'aputure-storm-80c-protection-cover',
    model: 'Protection Cover for STORM 80c',
    category: 'Other',
    compatibleWith: STORM_80C,
    sourceUrl: 'https://aputure.com/en-US/products/protection-cover-for-storm-80c',
    effectOnLight: 'Protective cover for the STORM 80c lamp head during storage and transport.'
  }),
  makeAccessory({
    id: 'aputure-storm-80c-power-adapter-holder',
    model: 'STORM 80c Power Adapter Holder',
    category: 'Bracket',
    compatibleWith: STORM_80C,
    sourceUrl: 'https://aputure.com/en-US/products/storm-80c-power-adapter-holder',
    effectOnLight: 'Holder that secures the STORM 80c power adapter to a portable rig.'
  })
];

const SIDUS_ONE_ACCESSORIES = [
  makeAccessory({
    id: 'aputure-sidus-one-antenna',
    model: 'Sidus One Antenna',
    category: 'Control',
    compatibleWith: SIDUS_ONE,
    sourceUrl: 'https://aputure.com/en-US/products/sidus-one',
    effectOnLight: 'Replacement antenna for Sidus One CRMX, Bluetooth or Wi-Fi operation.'
  }),
  makeAccessory({
    id: 'aputure-sidus-one-power-cable-0-8m',
    model: 'Sidus One Power Cable (0.8m)',
    category: 'Cable',
    compatibleWith: SIDUS_ONE,
    sourceUrl: 'https://aputure.com/en-US/products/sidus-one-power-cable',
    effectOnLight: '0.8-meter USB power cable for charging or powering Sidus One.'
  }),
];

const SIDUS_FOUR_ACCESSORIES = [
  makeAccessory({
    id: 'aputure-sidus-four-antenna',
    model: 'Sidus Four Antenna',
    category: 'Control',
    compatibleWith: SIDUS_FOUR,
    sourceUrl: 'https://aputure.com/en-US/products/sidus-four',
    effectOnLight: 'Replacement TNC dual-band antenna for Sidus Four CRMX and Wi-Fi communication.'
  }),
  makeAccessory({
    id: 'aputure-sidus-four-18w-9v-power-adapter',
    model: 'Sidus Four 18W (9V) Power Adapter',
    category: 'Power',
    compatibleWith: SIDUS_FOUR,
    sourceUrl: 'https://aputure.com/en-US/products/sidus-four',
    effectOnLight: '18W 9V AC adapter for powering Sidus Four from mains.'
  }),
  makeAccessory({
    id: 'aputure-sidus-four-5-pin-xlr-male-to-male-adapter',
    model: '5-Pin XLR Male to 5-Pin XLR Male Adapter',
    category: 'Cable',
    compatibleWith: SIDUS_FOUR,
    sourceUrl: 'https://aputure.com/en-US/products/5-pin-xlr-male-to-5-pin-xlr-male-adapter',
    effectOnLight: '5-pin XLR adapter for feeding DMX data into Sidus Four.'
  }),
  makeAccessory({
    id: 'aputure-sidus-four-3-8-baby-pin-receiver-adapter',
    model: 'Sidus Four 3/8in to Baby Pin Receiver Adapter',
    category: 'Mount Adapter',
    compatibleWith: SIDUS_FOUR,
    sourceUrl: 'https://aputure.com/en-US/products/sidus-four',
    effectOnLight: '3/8-inch to baby-pin receiver adapter for stand or grip mounting Sidus Four.'
  }),
  makeAccessory({
    id: 'aputure-sidus-four-hard-case',
    model: 'Sidus Four Hard Case',
    category: 'Other',
    compatibleWith: SIDUS_FOUR,
    sourceUrl: 'https://aputure.com/en-US/products/sidus-four',
    effectOnLight: 'Protective hard case for the Sidus Four controller, antennas and adapters.'
  })
];

const BATTERY_POWER_STATION_ACCESSORIES = [
  makeAccessory({
    id: BATTERY_STATION[0],
    model: 'Aputure 2-Bay Battery Power Station',
    category: 'Power',
    compatibleWith: BATTERY_POWER_COMPATIBLE_LIGHTS,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-2-bay-battery-power-station',
    effectOnLight: 'Dual V-Mount or Gold-Mount battery station with regulated 48V DC output for portable Aputure fixtures.',
    compatibilityStatus: 'Compatible',
    conditions: ['Up to 480W DC output via 3-pin XLR; powers 300W fixtures at full output or 600W fixtures at limited output.']
  }),
  makeAccessory({
    id: 'aputure-2-bay-battery-power-station-3m-3-pin-xlr-cable',
    model: 'Aputure 2-Bay Battery Power Station 3m 3-Pin XLR Power Cable',
    category: 'Cable',
    compatibleWith: BATTERY_STATION,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-2-bay-battery-power-station',
    effectOnLight: 'Three-meter 3-pin XLR male-to-female power cable supplied with the 2-Bay Battery Power Station.'
  }),
  makeAccessory({
    id: 'aputure-2-bay-battery-power-station-3-pin-to-4-pin-adapter',
    model: 'Aputure 2-Bay Battery Power Station 3-Pin to 4-Pin XLR Adapter Cable',
    category: 'Cable',
    compatibleWith: BATTERY_STATION,
    sourceUrl: 'https://aputure.com/en-US/products/aputure-2-bay-battery-power-station',
    effectOnLight: 'Short 3-pin male to 4-pin male XLR adapter supplied with the 2-Bay Battery Power Station.'
  })
];

// Coding cable omitted pending confirmation of its intended function and targets.

export const APUTURE_CONTROL_ACCESSORIES = [
  ...STORM_80C_SERVICE,
  ...SIDUS_ONE_ACCESSORIES,
  ...SIDUS_FOUR_ACCESSORIES,
  ...BATTERY_POWER_STATION_ACCESSORIES,
];
