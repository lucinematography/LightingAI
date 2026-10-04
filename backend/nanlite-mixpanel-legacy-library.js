// Nanlite MixPanel legacy/open-box family.
// Official Nanlite US sources only. Both MixPanel 60 and 150 are currently exposed
// in the MixPanel collection as Open Box products rather than regular new-product listings.

const SRC={
  collection:'https://nanliteus.com/shop/by-collection/light-panels/mixpanel/',
  mp60:'https://nanliteus.com/nanlite-mixpanel-60-bicolor-rgb-hard-and-soft-light-led-panel-open-box/',
  sb60:'https://nanliteus.com/nanlite-mixpanel-60-softbox-includes-fabric-grids/',
  wsTb:'https://nanliteus.com/products/nanlink-ws-tb-1-transmitter-box',
  battery26:'https://nanliteus.com/nanlite-26v-270wh-li-ion-v-mount-battery/'
};

export const NANLITE_MIXPANEL_LEGACY_FIXTURES=[
  {
    id:'nanlite-mixpanel-60',manufacturer:'Nanlite',model:'MixPanel 60',
    family:'MixPanel',category:'Light',discontinued:true,lifecycleStatus:'legacy/open-box-only',
    lifecycleEvidenceUrl:SRC.collection,
    sourceType:'RGBWW Hard / Soft LED Panel',
    cctK:{min:2700,max:7500},colorMode:'RGBWW',powerDrawW:60,cri:98,tlci:95,
    batteryPowered:true,
    powerOptions:['AC power adapter','14.8V V-Mount battery'],
    control:{
      wired:['DMX512'],
      wireless:['2.4G','Wi-Fi via Nanlite W-2 adapter / NANLINK app'],
      builtInBluetooth:false,builtInCRMX:false,
      directLightingAI:[],
      externalInterfaceRequired:['Nanlite W-2 Wi-Fi adapter or WS-TB-1 for NANLINK app control','Wired DMX interface for DMX512 control'],
      unavailableDirectProtocols:['Nanlite 2.4G/W-2 protocol is not publicly documented for third-party direct control']
    },
    sourceUrl:SRC.mp60
  },
  {
    id:'nanlite-mixpanel-150',manufacturer:'Nanlite',model:'MixPanel 150',
    family:'MixPanel',category:'Light',discontinued:true,lifecycleStatus:'legacy/open-box-only',
    lifecycleEvidenceUrl:SRC.collection,
    sourceType:'RGBWW Hard / Soft LED Panel',
    batteryPowered:true,
    powerOptions:['AC power adapter','26V V-Mount battery'],
    control:{
      wired:[],
      wireless:['2.4G / NANLINK via WS-TB-1'],
      builtInBluetooth:false,builtInCRMX:false,
      directLightingAI:[],
      externalInterfaceRequired:['NANLINK WS-TB-1 Transmitter Box'],
      controlEvidenceIncomplete:true,
      evidenceNote:'DMX is intentionally not encoded until a directly accessible first-party MixPanel 150 product/manual source is available.',
      unavailableDirectProtocols:['Nanlite 2.4G protocol is not publicly documented for third-party direct control']
    },
    sourceUrl:SRC.collection
  }
];

export const NANLITE_MIXPANEL_LEGACY_ACCESSORIES=[
  {
    id:'nanlite-rc-1-mixpanel60',manufacturer:'Nanlite',model:'RC-1 2.4G Remote Control',
    category:'Control',compatibleWith:['nanlite-mixpanel-60'],
    compatibilityStatus:'Compatible',sourceUrl:SRC.mp60
  },
  {
    id:'nanlite-sb-mp60',manufacturer:'Nanlite',model:'SB-MP60 MixPanel 60 Softbox with Fabric Grid',
    category:'Softbox',compatibleWith:['nanlite-mixpanel-60'],
    compatibilityStatus:'Designed For',
    bundledComponents:['Front diffusion','Fabric grid'],sourceUrl:SRC.sb60
  },
  {
    id:'nanlite-sb-mp150',manufacturer:'Nanlite',model:'SB-MP150 MixPanel 150 Softbox with Fabric Grid',
    category:'Softbox',compatibleWith:['nanlite-mixpanel-150'],
    compatibilityStatus:'Designed For',
    bundledComponents:['Fabric grid'],sourceUrl:SRC.collection
  },
  {
    id:'nanlite-sbmp150o',manufacturer:'Nanlite',model:'SBMP150O MixPanel 150 Octagonal Softbox with Fabric Grids',
    category:'Softbox',compatibleWith:['nanlite-mixpanel-150'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.collection
  },
  {
    id:'nanlite-bt-v-26v270',manufacturer:'Nanlite',model:'BT-V-26V270 26V 270Wh Li-Ion V-Mount Battery',
    category:'Battery',compatibleWith:['nanlite-mixpanel-150'],
    compatibilityStatus:'Compatible',sourceUrl:SRC.battery26
  },
  {
    id:'nanlite-mixpanel-60-barndoors',manufacturer:'Nanlite',model:'MixPanel 60 Metal Barndoors',
    category:'Barndoors',compatibleWith:['nanlite-mixpanel-60'],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl:SRC.mp60
  },
  {
    id:'nanlite-mixpanel-60-power-adapter',manufacturer:'Nanlite',model:'MixPanel 60 Power Adapter',
    category:'Power',compatibleWith:['nanlite-mixpanel-60'],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl:SRC.mp60
  },
  {
    id:'nanlite-mixpanel-60-case',manufacturer:'Nanlite',model:'MixPanel 60 Carry Bag',
    category:'Case',compatibleWith:['nanlite-mixpanel-60'],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl:SRC.mp60
  }
];
