// Official Aputure expansion accessories verified 2026-09-11.
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

const NOVA_P600C = 'aputure-nova-p600c';
const NOVA_P300C = 'aputure-nova-p300c';
const NOVA_1X1 = 'aputure-nova-ii-1x1';
const NOVA_2X1 = 'aputure-nova-ii-2x1';
const NOVA_9_2X1 = 'aputure-nova-9-2x1';
const PB_BARS = ['aputure-infinibar-pb3', 'aputure-infinibar-pb6', 'aputure-infinibar-pb12'];
const PB3 = ['aputure-infinibar-pb3'];
const PB6 = ['aputure-infinibar-pb6'];
const PB12 = ['aputure-infinibar-pb12'];
const MINI_PRO = ['aputure-mc-pro'];
const MT_PRO = ['aputure-mt-pro'];
const MC = ['aputure-mc'];
const B7C = ['aputure-accent-b7c'];

export const APUTURE_EXPANSION_ACCESSORIES = [
  makeAccessory({
    id: 'aputure-nova-p600c-barn-doors',
    model: 'Nova P600c Barn Doors',
    category: 'Barn Door',
    compatibleWith: [NOVA_P600C],
    sourceUrl: 'https://aputure.com/en-US/products/nova-p600c',
    effectOnLight: 'Four-leaf beam control for the Nova P600c.'
  }),
  makeAccessory({
    id: 'aputure-nova-p600c-rain-shield',
    model: 'Nova P600c Rain Shield',
    category: 'Other',
    compatibleWith: [NOVA_P600C],
    sourceUrl: 'https://aputure.com/en-US/products/nova-p600c',
    effectOnLight: 'Weather cover for Nova P600c operation in light rain.'
  }),
  makeAccessory({
    id: 'aputure-nova-p600c-dual-head-yoke',
    model: 'Nova P600c Dual Head Yoke',
    category: 'Yoke',
    compatibleWith: [NOVA_P600C],
    sourceUrl: 'https://aputure.com/en-US/products/nova-p600c',
    effectOnLight: 'Dual-head yoke for mounting two Nova P600c panels.'
  }),
  makeAccessory({
    id: 'aputure-nova-p600c-45-metal-grid',
    model: 'Nova P600c 45° Metal Grid',
    category: 'Grid',
    compatibleWith: [NOVA_P600C],
    sourceUrl: 'https://aputure.com/en-US/products/nova-p600c',
    effectOnLight: '45-degree metal grid for tighter Nova P600c control.'
  }),
  makeAccessory({
    id: 'aputure-nova-p600c-case',
    model: 'Nova P600c Case',
    category: 'Other',
    compatibleWith: [NOVA_P600C],
    sourceUrl: 'https://aputure.com/en-US/products/nova-p600c',
    effectOnLight: 'Rolling hard case for Nova P600c transport.'
  }),
  makeAccessory({
    id: 'aputure-nova-p600c-space-light',
    model: 'Nova P600c Space Light',
    category: 'Lantern',
    compatibleWith: [NOVA_P600C],
    sourceUrl: 'https://aputure.com/en-US/products/nova-p600c',
    effectOnLight: 'Omnidirectional soft modifier for Nova P600c.'
  }),
  makeAccessory({
    id: 'aputure-nova-p300c-softbox',
    model: 'Nova P300c Softbox',
    category: 'Softbox',
    compatibleWith: [NOVA_P300C],
    sourceUrl: 'https://aputure.com/en-US/products/nova-p300c',
    effectOnLight: 'Rectangular softbox with 40-degree fabric grid for Nova P300c.'
  }),
  makeAccessory({
    id: 'aputure-nova-p300c-case',
    model: 'Nova P300c Case',
    category: 'Other',
    compatibleWith: [NOVA_P300C],
    sourceUrl: 'https://aputure.com/en-US/products/nova-p300c',
    effectOnLight: 'Rolling hard case for Nova P300c transport.'
  }),
  makeAccessory({
    id: 'aputure-nova-p300c-barn-doors',
    model: 'Nova P300c Barn Doors',
    category: 'Barn Door',
    compatibleWith: [NOVA_P300C],
    sourceUrl: 'https://aputure.com/en-US/products/nova-p300c',
    effectOnLight: 'Four-leaf beam control for the Nova P300c.'
  }),
  makeAccessory({
    id: 'aputure-nova-1x1-softbox',
    model: 'NOVA 1x1 Softbox',
    category: 'Softbox',
    compatibleWith: [NOVA_1X1],
    sourceUrl: 'https://aputure.com/en-US/products/nova-ii-1x1',
    effectOnLight: 'Fast-deploy softbox for the NOVA II 1x1.'
  }),
  makeAccessory({
    id: 'aputure-nova-1x1-dome-diffuser-heavy-frost',
    model: 'NOVA 1x1 Dome Diffuser (Heavy Frost)',
    category: 'Dome',
    compatibleWith: [NOVA_1X1],
    sourceUrl: 'https://aputure.com/en-US/products/nova-ii-1x1',
    effectOnLight: 'Low-profile omnidirectional heavy-frost dome diffuser for the NOVA II 1x1.'
  }),
  makeAccessory({
    id: 'aputure-nova-1x1-fabric-control-grid',
    model: 'NOVA 1x1 Fabric Control Grid',
    category: 'Grid',
    compatibleWith: [NOVA_1X1],
    sourceUrl: 'https://aputure.com/en-US/products/nova-ii-1x1',
    effectOnLight: 'Fabric control grid for the NOVA II 1x1.'
  }),
  makeAccessory({
    id: 'aputure-nova-2x1-3-light-yoke',
    model: 'NOVA 2x1 3-Light Yoke',
    category: 'Yoke',
    compatibleWith: [NOVA_2X1, NOVA_9_2X1],
    sourceUrl: 'https://aputure.com/en-US/products/nova-ii-2x1',
    effectOnLight: 'Rigid yoke for connecting three NOVA 2x1 panels.'
  }),
  makeAccessory({
    id: 'aputure-nova-2x1-fabric-control-grid',
    model: 'NOVA 2x1 Fabric Control Grid',
    category: 'Grid',
    compatibleWith: [NOVA_2X1, NOVA_9_2X1],
    sourceUrl: 'https://aputure.com/en-US/products/nova-ii-2x1',
    effectOnLight: 'Fabric control grid for the NOVA II 2x1 and NOVA 9° 2x1.'
  }),
  makeAccessory({
    id: 'aputure-nova-2x1-rolling-hard-case',
    model: 'NOVA 2x1 Rolling Hard Case',
    category: 'Other',
    compatibleWith: [NOVA_2X1, NOVA_9_2X1],
    sourceUrl: 'https://aputure.com/en-US/products/nova-ii-2x1',
    effectOnLight: 'Protective rolling case for NOVA 2x1 panels.'
  }),
  makeAccessory({
    id: 'aputure-nova-2x1-barn-doors',
    model: 'NOVA 2x1 Barn Doors',
    category: 'Barn Door',
    compatibleWith: [NOVA_2X1, NOVA_9_2X1],
    sourceUrl: 'https://aputure.com/en-US/products/nova-ii-2x1',
    effectOnLight: 'Barn doors for the NOVA II 2x1 and NOVA 9° 2x1.'
  }),
  makeAccessory({
    id: 'aputure-nova-2x1-softbox',
    model: 'NOVA 2x1 Softbox',
    category: 'Softbox',
    compatibleWith: [NOVA_2X1, NOVA_9_2X1],
    compatibilityStatus: 'Compatible',
    sourceUrl: 'https://aputure.com/en-US/products/nova-9-2x1',
    effectOnLight: 'Fast-deploy softbox for the NOVA II 2x1 and NOVA 9° 2x1.'
  }),
  makeAccessory({
    id: 'aputure-nova-2x1-dome-diffuser-light-frost',
    model: 'NOVA 2x1 Dome Diffuser (Light Frost)',
    category: 'Dome',
    compatibleWith: [NOVA_2X1, NOVA_9_2X1],
    sourceUrl: 'https://aputure.com/en-US/products/nova-9-2x1',
    effectOnLight: 'Light-frost omnidirectional dome diffuser for NOVA 2x1 panels.'
  }),
  makeAccessory({
    id: 'aputure-nova-2x1-dome-diffuser-heavy-frost',
    model: 'NOVA 2x1 Dome Diffuser (Heavy Frost)',
    category: 'Dome',
    compatibleWith: [NOVA_2X1, NOVA_9_2X1],
    sourceUrl: 'https://aputure.com/en-US/products/nova-9-2x1',
    effectOnLight: 'Heavy-frost omnidirectional dome diffuser for NOVA 2x1 panels.'
  }),
  makeAccessory({
    id: 'aputure-nova-dual-quick-release-truss-clamp-adapter',
    model: 'Dual Quick Release to Truss Clamp Adapter',
    category: 'Mount Adapter',
    compatibleWith: [NOVA_1X1, NOVA_2X1, NOVA_9_2X1],
    sourceUrl: 'https://aputure.com/en-US/products/nova-ii-1x1',
    effectOnLight: 'Low-profile truss mount for NOVA II 1x1, NOVA II 2x1, and NOVA 9° 2x1.'
  }),
  makeAccessory({
    id: 'aputure-rcac3f-x-ac-power-cable-6m-20a',
    model: 'RCAC3F-X AC Power Cable (6m) (20A Max)',
    category: 'Power',
    compatibleWith: [NOVA_1X1, NOVA_2X1, NOVA_9_2X1],
    compatibilityStatus: 'Compatible',
    sourceUrl: 'https://aputure.com/en-US/products/nova-ii-1x1',
    effectOnLight: '20A-rated six-meter AC power cable for NOVA II and NOVA 9° panels.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-pb3-softbox',
    model: 'INFINIBAR PB3 Softbox',
    category: 'Softbox',
    compatibleWith: PB3,
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb3',
    effectOnLight: 'Tool-less softbox for the one-foot INFINIBAR PB3.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-pb6-softbox',
    model: 'INFINIBAR PB6 Softbox',
    category: 'Softbox',
    compatibleWith: PB6,
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb6',
    effectOnLight: 'Tool-less softbox for the two-foot INFINIBAR PB6.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-pb12-softbox',
    model: 'INFINIBAR PB12 Softbox',
    category: 'Softbox',
    compatibleWith: PB12,
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb12',
    effectOnLight: 'Tool-less softbox for the four-foot INFINIBAR PB12.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-pb3-45-grid',
    model: 'INFINIBAR PB3 45° Fabric Light Control Grid',
    category: 'Grid',
    compatibleWith: PB3,
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb3',
    effectOnLight: '45-degree fabric grid for the INFINIBAR PB3.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-pb6-45-grid',
    model: 'INFINIBAR PB6 45° Fabric Light Control Grid',
    category: 'Grid',
    compatibleWith: PB6,
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb6',
    effectOnLight: '45-degree fabric grid for the INFINIBAR PB6.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-pb12-45-grid',
    model: 'INFINIBAR PB12 45° Fabric Light Control Grid',
    category: 'Grid',
    compatibleWith: PB12,
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb12',
    effectOnLight: '45-degree fabric grid for the INFINIBAR PB12.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-straight-connector-passive',
    model: 'INFINIBAR Straight Connector (Passive)',
    category: 'Mount Adapter',
    compatibleWith: PB_BARS,
    sourceUrl: 'https://aputure.com/en-US/product-families/infinibar',
    effectOnLight: 'Passive end-to-end connector for INFINIBAR bars.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-3-way-flat-connector-active',
    model: 'INFINIBAR 3-Way Flat Connector (Active)',
    category: 'Mount Adapter',
    compatibleWith: PB_BARS,
    sourceUrl: 'https://aputure.com/en-US/product-families/infinibar',
    effectOnLight: 'Active three-way flat connector for building powered INFINIBAR arrays.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-4-way-flat-connector-active',
    model: 'INFINIBAR 4-Way Flat Connector (Active)',
    category: 'Mount Adapter',
    compatibleWith: PB_BARS,
    sourceUrl: 'https://aputure.com/en-US/product-families/infinibar',
    effectOnLight: 'Active four-way flat connector for building powered INFINIBAR arrays.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-6-way-flat-connector-active',
    model: 'INFINIBAR 6-Way Flat Connector (Active)',
    category: 'Mount Adapter',
    compatibleWith: PB_BARS,
    sourceUrl: 'https://aputure.com/en-US/product-families/infinibar',
    effectOnLight: 'Active six-way flat connector for building powered INFINIBAR arrays.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-square-3d-connector-active',
    model: 'INFINIBAR Square 3D Connector (Active)',
    category: 'Mount Adapter',
    compatibleWith: PB_BARS,
    sourceUrl: 'https://aputure.com/en-US/product-families/infinibar',
    effectOnLight: 'Active square 3D connector for multi-plane INFINIBAR arrays.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-battery-power-station',
    model: 'INFINIBAR Battery Power Station',
    category: 'Power',
    compatibleWith: PB_BARS,
    compatibilityStatus: 'Designed For',
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb3',
    effectOnLight: 'V-Mount 24V battery station for portable INFINIBAR power.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-active-usbc-dmx-adapter',
    model: 'Aputure Active USB-C to 5-Pin DMX In & Out Adapter',
    category: 'Control',
    compatibleWith: PB_BARS,
    compatibilityStatus: 'Compatible',
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb6',
    effectOnLight: 'Wired DMX input and output for INFINIBAR fixtures.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-locking-dc-extension-cable-3m',
    model: 'Locking 5.5mm DC to 5.5mm DC Barrel Extension Cable (3m)',
    category: 'Cable',
    compatibleWith: PB_BARS,
    compatibilityStatus: 'Compatible',
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb3',
    effectOnLight: 'Three-meter locking DC extension for INFINIBAR power distribution.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-tripod-base',
    model: 'INFINIBAR 1/4-20in Collapsible Tripod Base',
    category: 'Bracket',
    compatibleWith: PB_BARS,
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb6',
    effectOnLight: 'Folding tripod base for tabletop INFINIBAR mounting.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-tilting-mounting-bracket',
    model: 'INFINIBAR Tilting Mounting Bracket',
    category: 'Bracket',
    compatibleWith: PB_BARS,
    sourceUrl: 'https://aputure.com/en-US/products/infinibar-pb6',
    effectOnLight: 'Pair of tilting screw-in mounting brackets for INFINIBARs.'
  }),
  makeAccessory({
    id: 'aputure-infinibar-multi-light-shaping-kit',
    model: 'INFINIBAR Connectors Multi-Light Shaping Kit',
    category: 'Mount Adapter',
    compatibleWith: PB_BARS,
    sourceUrl: 'https://aputure.com/en-US/product-families/infinibar',
    effectOnLight: 'Collection of active and passive connectors for multi-bar shapes.'
  }),
  makeAccessory({
    id: 'aputure-mc-pro-bubble-diffuser',
    model: 'MC Pro Bubble Diffuser',
    category: 'Dome',
    compatibleWith: MINI_PRO,
    sourceUrl: 'https://aputure.com/en-US/products/mc-pro',
    effectOnLight: 'Bubble diffuser for softer MC Pro output.'
  }),
  makeAccessory({
    id: 'aputure-mc-pro-dome-diffuser',
    model: 'MC Pro Dome Diffuser',
    category: 'Dome',
    compatibleWith: MINI_PRO,
    sourceUrl: 'https://aputure.com/en-US/products/mc-pro',
    effectOnLight: 'Dome diffuser for broad MC Pro output.'
  }),
  makeAccessory({
    id: 'aputure-mc-pro-metal-grid',
    model: 'Metal Grid for MC Pro',
    category: 'Grid',
    compatibleWith: MINI_PRO,
    sourceUrl: 'https://aputure.com/en-US/products/mc-pro',
    effectOnLight: '30-degree metal grid for MC Pro beam control.'
  }),
  makeAccessory({
    id: 'aputure-mc-pro-8-light-charging-case',
    model: 'MC Pro 8-Light Charging Case',
    category: 'Other',
    compatibleWith: MINI_PRO,
    sourceUrl: 'https://aputure.com/en-US/products/mc-pro',
    effectOnLight: 'Protective charging case for eight MC Pro fixtures.'
  }),
  makeAccessory({
    id: 'aputure-mt-pro-waterproof-pouch',
    model: 'Waterproof Pouch for MT Pro',
    category: 'Other',
    compatibleWith: MT_PRO,
    sourceUrl: 'https://aputure.com/en-US/products/mt-pro',
    effectOnLight: 'Waterproof pouch for underwater or wet-location MT Pro use.'
  }),
  makeAccessory({
    id: 'aputure-mt-pro-baby-pin-adapter-back-clamp',
    model: 'Baby Pin Adapter to Back Clamp for MT Pro',
    category: 'Mount Adapter',
    compatibleWith: MT_PRO,
    sourceUrl: 'https://aputure.com/en-US/products/mt-pro',
    effectOnLight: 'Baby-pin mounting adapter and back clamp for MT Pro.'
  }),
  makeAccessory({
    id: 'aputure-mc-silicone-rubber-diffuser',
    model: 'MC Silicone Rubber Diffuser',
    category: 'Diffusion',
    compatibleWith: MC,
    sourceUrl: 'https://aputure.com/en-US/products/mc',
    effectOnLight: 'Silicone diffuser for softer original MC output.'
  }),
  makeAccessory({
    id: 'aputure-mc-4-light-wireless-charging-case',
    model: 'MC 4-Light Wireless Charging Case',
    category: 'Other',
    compatibleWith: MC,
    sourceUrl: 'https://aputure.com/en-US/products/mc',
    effectOnLight: 'Protective wireless charging case for four MC fixtures.'
  }),
  makeAccessory({
    id: 'aputure-mc-12-light-wireless-charging-case',
    model: 'MC 12-Light Wireless Charging Case',
    category: 'Other',
    compatibleWith: MC,
    sourceUrl: 'https://aputure.com/en-US/products/mc',
    effectOnLight: 'Protective wireless charging case for twelve MC fixtures.'
  }),
  makeAccessory({
    id: 'aputure-accent-b7c-8-light-kit-case',
    model: 'Accent B7c 8-Light Kit Case',
    category: 'Other',
    compatibleWith: B7C,
    sourceUrl: 'https://aputure.com/en-US/products/accent-b7c',
    effectOnLight: 'Protective charging case for eight Accent B7c bulbs.'
  })
];
