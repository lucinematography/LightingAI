// Official Aputure INFINIBAR completion accessories verified 2026-09-11.
const makeAccessory = ({
  id,
  model,
  category,
  compatibleWith,
  sourceUrl = 'https://aputure.com/en-US/collections/infinibar',
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
    compatibleWith.map(fixtureId => [
      fixtureId,
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

const PB_BARS = [
  'aputure-infinibar-pb3',
  'aputure-infinibar-pb6',
  'aputure-infinibar-pb12'
];
const PB6 = ['aputure-infinibar-pb6'];
const PB12 = ['aputure-infinibar-pb12'];
const BATTERY_STATION = ['aputure-infinibar-battery-power-station'];
const FAMILY_URL = 'https://aputure.com/en-US/collections/infinibar';

const KIT_ACCESSORIES = [
  makeAccessory({
    id: 'aputure-infinibar-pb6-4-light-kit',
    model: 'INFINIBAR PB6 4-Light Kit',
    category: 'Other',
    compatibleWith: PB6,
    effectOnLight: 'Four PB6 pixel bars packaged in a protective hard case for multi-light production setups.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-pb12-4-light-kit',
    model: 'INFINIBAR PB12 4-Light Kit',
    category: 'Other',
    compatibleWith: PB12,
    effectOnLight: 'Four PB12 pixel bars packaged in a protective hard case for multi-light production setups.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-pb6-8-light-kit',
    model: 'INFINIBAR PB6 8-Light Kit',
    category: 'Other',
    compatibleWith: PB6,
    effectOnLight: 'Eight PB6 pixel bars packaged in a protective hard case for larger programmable arrays.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-pb12-8-light-kit',
    model: 'INFINIBAR PB12 8-Light Kit',
    category: 'Other',
    compatibleWith: PB12,
    effectOnLight: 'Eight PB12 pixel bars packaged in a protective hard case for larger programmable arrays.'
  })
];

const POWER_ACCESSORIES = [
  makeAccessory({
    id: 'aputure-infinibar-48w-power-adapter-kit',
    model: 'INFINIBAR 48W (24V) Power Adapter Kit',
    category: 'Power',
    compatibleWith: PB_BARS,
    effectOnLight: '48W AC-to-24V adapter kit for powering compact INFINIBAR configurations.',
    conditions: ['Stay within the adapter wattage and connector limits for the connected bars.']
  }),
  makeAccessory({
    id: 'aputure-infinibar-168w-power-adapter-kit',
    model: 'INFINIBAR 168W (24V) Power Adapter Kit',
    category: 'Power',
    compatibleWith: PB_BARS,
    effectOnLight: '168W AC-to-24V adapter kit for powering INFINIBAR arrays.',
    conditions: ['Stay within the adapter wattage and connector limits for the connected bars.']
  }),
  makeAccessory({
    id: 'aputure-infinibar-250w-power-adapter-kit',
    model: 'INFINIBAR 250W (24V) Power Adapter Kit',
    category: 'Power',
    compatibleWith: PB_BARS,
    effectOnLight: '250W AC-to-24V adapter kit for larger INFINIBAR arrays.',
    conditions: ['Stay within the adapter wattage and connector limits for the connected bars.']
  }),
  makeAccessory({
    id: 'aputure-infinibar-330w-power-adapter-kit',
    model: 'INFINIBAR 330W (24V) Power Adapter Kit',
    category: 'Power',
    compatibleWith: PB_BARS,
    effectOnLight: '330W AC-to-24V adapter kit for high-capacity INFINIBAR arrays.',
    conditions: ['Stay within the adapter wattage and connector limits for the connected bars.']
  }),
  makeAccessory({
    id: 'aputure-infinibar-330w-power-adapter-kit-extension',
    model: 'INFINIBAR 330W (24V) Power Adapter Kit and Extension Cables',
    category: 'Power',
    compatibleWith: PB_BARS,
    effectOnLight: '330W 24V adapter kit with DC extension cables for flexible INFINIBAR placement.',
    conditions: ['Stay within the adapter wattage and connector limits for the connected bars.']
  }),
  makeAccessory({
    id: 'aputure-infinibar-4-way-power-splitter-cable',
    model: 'INFINIBAR 4-Way Power Splitter Cable',
    category: 'Cable',
    compatibleWith: PB_BARS,
    effectOnLight: 'Four-way 5.5mm DC barrel splitter for distributing 24V power across INFINIBARs.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-8-way-dc-power-splitter',
    model: 'INFINIBAR 8-Way DC Power Splitter',
    category: 'Cable',
    compatibleWith: PB_BARS,
    effectOnLight: 'Eight-way 5.5mm DC barrel splitter for powering larger INFINIBAR arrays.'
  })
];

const PASSIVE_CONNECTORS = [
  ['3-way', 'INFINIBAR 3-Way Flat Connector (Passive)'],
  ['4-way', 'INFINIBAR 4-Way Flat Connector (Passive)'],
  ['6-way', 'INFINIBAR 6-Way Flat Connector (Passive)'],
  ['straight', 'INFINIBAR Straight Connector (Passive)']
].map(([slug, model]) =>
  makeAccessory({
    id: `aputure-infinibar-${slug}-flat-connector-passive`,
    model,
    category: 'Mount Adapter',
    compatibleWith: PB_BARS,
    effectOnLight: `Passive ${slug} connector for rigid INFINIBAR multi-bar layouts without active pixel data.`,
    conditions: ['Use the connector geometry that matches the intended bar layout.']
  })
);

const ACTIVE_CONNECTORS = [
  ['straight', 'INFINIBAR Connectors Straight Connector', 'straight active'],
  ['hexagon-3d', 'INFINIBAR Connectors Hexagon 3D Connector', 'hexagon 3D'],
  ['hexagon-flat', 'INFINIBAR Connectors Hexagon Flat Connector', 'hexagon flat'],
  ['square-flat', 'INFINIBAR Connectors Square Flat Connector', 'square flat'],
  ['triangle-3d', 'INFINIBAR Connectors Triangle 3D Connector', 'triangle 3D'],
  ['triangle-flat', 'INFINIBAR Connectors Triangle Flat Connector', 'triangle flat']
].map(([slug, model, layout]) =>
  makeAccessory({
    id: `aputure-infinibar-${slug}-connector-active`,
    model,
    category: 'Mount Adapter',
    compatibleWith: PB_BARS,
    effectOnLight: `Active ${layout} connector for mechanically joining INFINIBARs while preserving pixel-aware control paths.`,
    conditions: ['Use with compatible INFINIBAR bars and the matching active connector orientation.']
  })
);

const MOUNTING_ACCESSORIES = [
  makeAccessory({
    id: 'aputure-infinibar-clamp',
    model: 'INFINIBAR Clamp',
    category: 'Bracket',
    compatibleWith: PB_BARS,
    effectOnLight: 'Baby-pin mounting adapter for securing INFINIBAR bars to stands and grip hardware.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-3-8-screw-lighting-clamp-plate-adapter',
    model: '3/8in Screw to Lighting Clamp Plate Adapter',
    category: 'Mount Adapter',
    compatibleWith: BATTERY_STATION,
    effectOnLight: '3/8-16 screw adapter for attaching the INFINIBAR Battery Power Station to a lighting clamp plate.'
  })
];

const CASE_ACCESSORIES = [
  makeAccessory({
    id: 'aputure-infinibar-pb6-4-light-rolling-hard-case',
    model: 'INFINIBAR PB6 4-Light Rolling Hard Case',
    category: 'Other',
    compatibleWith: PB6,
    effectOnLight: 'Rolling hard case for four INFINIBAR PB6 bars and accessories.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-pb12-4-light-rolling-hard-case',
    model: 'INFINIBAR PB12 4-Light Rolling Hard Case',
    category: 'Other',
    compatibleWith: PB12,
    effectOnLight: 'Rolling hard case for four INFINIBAR PB12 bars and accessories.'
  })
];

export const APUTURE_INFINIBAR_COMPLETION_ACCESSORIES = [
  ...KIT_ACCESSORIES,
  ...POWER_ACCESSORIES,
  ...PASSIVE_CONNECTORS,
  ...ACTIVE_CONNECTORS,
  ...MOUNTING_ACCESSORIES,
  ...CASE_ACCESSORIES
];
