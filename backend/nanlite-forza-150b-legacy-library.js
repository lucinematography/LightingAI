// Nanlite Forza 150B legacy/open-box-only model.
// Official Nanlite US sources only. This model is not treated as part of the current mainline catalog.

const SRC={
  product:'https://nanliteus.com/products/open-box-forza-150b-bi-color-led-spotlight',
  bowens:'https://nanliteus.com/products/forza-bowens-adapter-for-fm-mount-lights',
  fl11:'https://nanliteus.com/products/fl-11-fresnel-lens-and-barndoors-for-forza-fm-mount-lights',
  pj19:'https://nanliteus.com/products/forza-pj-fmm-projection-attachment-with-19-lens-for-fm-mount',
  pj36:'https://nanliteus.com/products/forza-pj-fmm-projection-attachment-with-36-lens-for-fm-mount',
  sb40:'https://nanliteus.com/products/40cm-octagonal-softbox-for-fm-mount',
  sb60:'https://nanliteus.com/products/60cm-octagonal-softbox-for-fm-mount',
  xlrVmountGrip:'https://nanliteus.com/products/v-mount-battery-grip-for-forza-150b-and-fc-120b'
};

export const NANLITE_FORZA_150B_LEGACY_FIXTURES=[
  {
    id:'nanlite-forza-150b',manufacturer:'Nanlite',model:'Forza 150B',
    family:'Forza',category:'Light',discontinued:true,lifecycleStatus:'legacy/open-box-only',
    sourceType:'Bi-Color LED Spotlight',mount:'FM Mount',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',
    batteryPowered:true,
    powerOptions:['V-Mount via BT-BG-XLR4-II battery grip','AC power'],
    control:{
      wired:['DMX512','RDM'],
      wireless:['Bluetooth / NANLINK app','2.4G'],
      builtInBluetooth:true,builtInCRMX:false,
      dmxConnection:'Locking 3.5mm DMX/RDM port via CB-DMX-3.5C-1/2',
      directLightingAI:[],
      externalInterfaceRequired:['CB-DMX-3.5C-1/2 adapter plus wired DMX interface'],
      unavailableDirectProtocols:['NANLINK Bluetooth/2.4G protocol is not publicly documented for third-party direct control']
    },
    sourceUrl:SRC.product
  }
];

export const NANLITE_FORZA_150B_LEGACY_ACCESSORIES=[
  {
    id:'nanlite-forza-150b-accessory-note',manufacturer:'Nanlite',
    model:'Forza 150B shares documented FM-mount accessory ecosystem',
    category:'Other',compatibleWith:['nanlite-forza-150b'],
    compatibilityStatus:'Reference',
    conditions:[
      'Uses canonical AS-BA-FMM, FL-11, PJ-FMM-19, PJ-FMM-36, SB-FMM-O-40, SB-FMM-O-60, BT-BG-XLR4-II and CB-DMX-3.5C-1/2 records'
    ],
    sourceUrl:SRC.product
  }
];
