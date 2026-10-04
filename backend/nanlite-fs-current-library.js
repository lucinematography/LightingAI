// Nanlite current FS Bowens-mount monolight family.
// Official Nanlite US sources only. These are AC-only all-in-one fixtures.

const SRC={
  fs150b:'https://nanliteus.com/products/fs-150b-bi-color-ac-led-monolight',
  fs300b:'https://nanliteus.com/products/fs-300b-ac-powered-bi-color-led-monolight',
  fs300c:'https://nanliteus.com/products/fs-300c-ac-powered-rgbw-color-led-monolight',
  fl20g:'https://nanliteus.com/products/fl-20g-fresnel-lens-for-bowens-mount',
  pj2545:'https://nanliteus.com/products/bowens-mount-projection-attachment-25-45',
  caseFs:'https://nanliteus.com/products/padded-carrying-case-for-fs-series-lights',
  barndoors:'https://nanliteus.com/products/barndoors-and-grid-for-the-rf-bm-bowens-mount-reflector'
};

function control(){
  return {
    wired:[],
    wireless:['Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'No DMX/RDM control is listed for these FS-Series fixtures',
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}
function fixture(id,model,cctMin,cctMax,powerDrawW,colorMode,cri,tlci,sourceUrl){
  return {
    id,manufacturer:'Nanlite',model,family:'FS Series',category:'Light',discontinued:false,
    sourceType:'AC LED Monolight',mount:'Bowens',
    cctK:{min:cctMin,max:cctMax},powerDrawW,colorMode,cri,tlci,
    batteryPowered:false,powerMode:'AC only, all-in-one',
    control:control(),sourceUrl
  };
}

export const NANLITE_FS_CURRENT_FIXTURES=[
  fixture('nanlite-fs-150b','FS-150B',2700,6500,175,'Bi-Color',96,97,SRC.fs150b),
  fixture('nanlite-fs-300b','FS-300B',2700,6500,350,'Bi-Color',96,97,SRC.fs300b),
  fixture('nanlite-fs-300c','FS-300C',2700,7500,300,'RGBW',95,94,SRC.fs300c)
];

const ALL=['nanlite-fs-150b','nanlite-fs-300b','nanlite-fs-300c'];
const ALL_WITH_LEGACY=[...ALL,'nanlite-fs-200b','nanlite-fs-300'];
const BD_BM_RF45_TARGETS=[...ALL_WITH_LEGACY,'nanlite-forza-720','nanlite-forza-720b','nanlite-fc-500b','nanlite-fc-500c'];

function included(id,model,category,target,sourceUrl){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl
  };
}

export const NANLITE_FS_CURRENT_ACCESSORIES=[
  {
    id:'nanlite-cc-s-fs',manufacturer:'Nanlite',model:'CC-S-FS Padded Carrying Case for FS-Series Lights',
    category:'Case',compatibleWith:ALL_WITH_LEGACY,compatibilityStatus:'Designed For',sourceUrl:SRC.caseFs
  },
  {
    id:'nanlite-bd-bm-rf45',manufacturer:'Nanlite',model:'BD-BM-RF45 Barndoors and Grid',
    category:'Barndoors',compatibleWith:BD_BM_RF45_TARGETS,compatibilityStatus:'Designed For',
    conditions:['Requires the RF-BM Bowens-mount reflector'],
    compatibilityEvidenceNote:'Nanlite product documentation explicitly lists Forza 720/720B, FC-500B/500C and the FS-Series lights that use the required RF-BM reflector.',
    sourceUrl:SRC.barndoors
  },

  included('nanlite-fs-150b-reflector','FS-150B 45-Degree Bowens Reflector','Reflector','nanlite-fs-150b',SRC.fs150b),
  included('nanlite-fs-150b-power-cord','FS-150B Power Cord 4.5 m','Cable','nanlite-fs-150b',SRC.fs150b),
  included('nanlite-fs-150b-cob-cap','FS-150B COB Protective Cap','Other','nanlite-fs-150b',SRC.fs150b),

  included('nanlite-fs-300b-reflector','FS-300B 45-Degree Bowens Reflector','Reflector','nanlite-fs-300b',SRC.fs300b),
  included('nanlite-fs-300b-power-cord','FS-300B Power Cord 4.5 m','Cable','nanlite-fs-300b',SRC.fs300b),
  included('nanlite-fs-300b-cob-cap','FS-300B COB Protective Cap','Other','nanlite-fs-300b',SRC.fs300b),

  included('nanlite-fs-300c-reflector','FS-300C 45-Degree Bowens Reflector','Reflector','nanlite-fs-300c',SRC.fs300c),
  included('nanlite-fs-300c-power-cord','FS-300C Power Cord 4.5 m','Cable','nanlite-fs-300c',SRC.fs300c),
  included('nanlite-fs-300c-cob-cap','FS-300C COB Protective Cap','Other','nanlite-fs-300c',SRC.fs300c)
];
