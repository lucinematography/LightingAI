// Nanlite current PavoBulb 10C practical RGBWW bulb.
// Official Nanlite US sources only. Shared control accessories use canonical records.

const SRC={
  product:'https://nanliteus.com/blogs/learn/the-nanlite-pavobulb-10c-a-complete-platform-for-practical-in-frame-lights',
  accessories:'https://nanliteus.com/shop/by-product/accessories/pavotube-accessories/pavobulb-accessories/',
  bouncer:'https://nanliteus.com/nanlite-pavobulb-bouncer-with-suction-cup/',
  controlBank:'https://nanliteus.com/products/control-bank'
};

export const NANLITE_PAVOBULB_CURRENT_FIXTURES=[
  {
    id:'nanlite-pavobulb-10c',manufacturer:'Nanlite',model:'PavoBulb 10C',
    family:'PavoBulb',category:'Light',discontinued:false,
    sourceType:'RGBWW LED Bulb',mount:'E27',
    cctK:{min:2700,max:7500},colorMode:'RGBWW',beamAngleDeg:205,
    cri:95,tlci:97,
    powerOptions:['E27 mains socket','USB-C power','NP-F battery via BT-BA-SNP-E27 adapter','WC-USBC-C1 Control Bank'],
    control:{
      wired:['DMX512','RDM'],
      wireless:['Bluetooth / NANLINK app','2.4G'],
      builtInBluetooth:true,builtInCRMX:false,
      dmxConnection:'USB-C via CB-DMX-USBC-1/3II adapter',
      directLightingAI:[],
      externalInterfaceRequired:['CB-DMX-USBC-1/3II adapter plus wired DMX interface'],
      unavailableDirectProtocols:['NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control']
    },
    sourceUrl:SRC.product
  }
];

export const NANLITE_PAVOBULB_CURRENT_ACCESSORIES=[
  {
    id:'nanlite-as-mba-e27-v2',manufacturer:'Nanlite',model:'AS-MBA-E27-V2 E27 Magnetic Mount with Power Cable',
    category:'Mount',mount:'E27 magnetic mount',compatibleWith:['nanlite-pavobulb-10c'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-bt-ba-snp-e27',manufacturer:'Nanlite',model:'BT-BA-SNP-E27 NP-F Battery Adapter and Mount',
    category:'Power',compatibleWith:['nanlite-pavobulb-10c'],
    compatibilityStatus:'Designed For',
    conditions:['Provides E27 socket and 1/4-20 mounting receiver','Supports NP-F style batteries'],
    sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-as-bsc',manufacturer:'Nanlite',model:'AS-BSC PavoBulb Bouncer with Suction Cup',
    category:'Other',compatibleWith:['nanlite-pavobulb-10c'],
    compatibilityStatus:'Designed For',
    conditions:['Adjustable aperture for spill control'],sourceUrl:SRC.bouncer
  },
  {
    id:'nanlite-pavobulb-10c-usbc-cable',manufacturer:'Nanlite',model:'PavoBulb 10C USB-C to USB-A Cable',
    category:'Cable',compatibleWith:['nanlite-pavobulb-10c'],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl:SRC.product
  }
];
