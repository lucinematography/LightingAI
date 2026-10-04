// Nanlite LitoLite 5C legacy compact RGBWW panel.
// Official Nanlite US sources only.

const SRC={
  product:'https://nanliteus.com/nanlite-litolite-5c-rgbww-mini-led-panel/',
  accessories:'https://nanliteus.com/shop/by-collection/accessories/litolite-5c/',
  faq:'https://nanliteus.com/pages/faq'
};

export const NANLITE_LITOLITE_LEGACY_FIXTURES=[
  {
    id:'nanlite-litolite-5c',manufacturer:'Nanlite',model:'LitoLite 5C',
    family:'LitoLite',category:'Light',discontinued:true,lifecycleStatus:'legacy/out-of-stock',
    sourceType:'RGBWW Mini LED Panel',cctK:{min:2700,max:7500},colorMode:'RGBWW',
    beamAngleDeg:45,powerDrawW:7,cri:95,tlci:97,
    batteryPowered:true,batteryMah:2400,batteryWh:8.88,
    powerOptions:['Built-in 3.7V Li-Ion battery','USB-C 5V/2A','USB power bank'],
    mount:'1/4-20 male thread + built-in magnets',
    control:{
      wired:[],
      wireless:['First-party wireless remote / Wi-Fi adapter / Bluetooth support'],
      builtInBluetooth:true,builtInCRMX:false,
      directLightingAI:[],
      externalInterfaceRequired:[],
      controlEvidenceIncomplete:true,
      evidenceNote:'Official product page lists wireless remote / Wi-Fi adapter / Bluetooth but does not identify a current standalone adapter SKU on the accessible page. Specific accessory links are intentionally not inferred.',
      unavailableDirectProtocols:['No DMX control is documented','Nanlite wireless protocol is not publicly documented for third-party direct control']
    },
    sourceUrl:SRC.product
  }
];

export const NANLITE_LITOLITE_LEGACY_ACCESSORIES=[
  {
    id:'nanlite-as-mt-hg-1-4',manufacturer:'Nanlite',model:'AS-MT/HG-1/4 Mini Tripod / Hand Grip',
    category:'Stand',compatibleWith:['nanlite-litolite-5c'],compatibilityStatus:'Compatible',
    mount:'1/4-20',sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-as-bh-1-4',manufacturer:'Nanlite',model:'AS-BH-1/4 Mini Ball Head with Hot Shoe Adapter',
    category:'Mount',compatibleWith:['nanlite-litolite-5c'],compatibilityStatus:'Compatible',
    mount:'1/4-20',sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-as-csa-1-4',manufacturer:'Nanlite',model:'AS-CSA-1/4 Hot/Cold Shoe Adapter',
    category:'Mount',compatibleWith:['nanlite-litolite-5c'],compatibilityStatus:'Compatible',
    mount:'1/4-20',sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-litolite-5c-diffuser',manufacturer:'Nanlite',model:'LitoLite 5C Silicone Rubber Diffuser',
    category:'Diffusion',compatibleWith:['nanlite-litolite-5c'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC.product
  },
  {
    id:'nanlite-litolite-5c-usbc-cable',manufacturer:'Nanlite',model:'LitoLite 5C USB-C to USB-A Charge Cable',
    category:'Cable',compatibleWith:['nanlite-litolite-5c'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC.product
  },
  {
    id:'nanlite-litolite-5c-case',manufacturer:'Nanlite',model:'LitoLite 5C Carry Bag',
    category:'Case',compatibleWith:['nanlite-litolite-5c'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC.product
  }
];
