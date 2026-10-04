// Nanlite current Forza 720B high-output bi-color fixture.
// Official Nanlite US sources only. Shared physical accessories live in their canonical records.

const SRC={
  fixture:'https://nanliteus.com/products/forza-720b-bi-color-led-spotlight-with-rolling-case',
  case:'https://nanliteus.com/products/rolling-padded-case-for-forza-720-720b',
  pj36:'https://nanliteus.com/products/pj-bm-projection-attachment-with-36-lens-for-bowens-mount',
  pj19:'https://nanliteus.com/products/pj-bm-projection-attachment-with-19-lens-for-bowens-mount',
  sharedHeadCableEvidence:'https://nanliteus.com/products/head-cable-24-7ft-for-forza-720-720b-500-ii-500b-ii-300-ii-300b-ii',
  launch:'https://nanliteus.com/blogs/learn/the-new-nanlite-forza-720-and-720b-redefine-high-output-fixtures'
};

function control(){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:['Wired DMX interface for DMX512 control'],
    unavailableDirectProtocols:[
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}

export const NANLITE_FORZA_720B_FIXTURES=[
  {
    id:'nanlite-forza-720b',manufacturer:'Nanlite',model:'Forza 720B',
    family:'Forza 720',category:'Light',discontinued:false,
    sourceType:'Bi-Color LED Spotlight',mount:'Bowens',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',
    powerDrawW:800,cri:96,tlci:97,
    batteryPowered:true,
    batteryOptions:['2x 14.8V V-Mount via Control Unit','2x 26V V-Mount via Control Unit','AC mains'],
    control:control(),sourceUrl:SRC.fixture
  }
];

function included(id,model,category,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,category,
    compatibleWith:['nanlite-forza-720b'],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl,...extra
  };
}

export const NANLITE_FORZA_720B_ACCESSORIES=[
  included('nanlite-forza-720b-control-unit','Forza 720B Control Unit with V-Mount Plates','Power',SRC.fixture),
  {
    id:'nanlite-forza-720b-head-cable',manufacturer:'Nanlite',model:'Forza 720 / 720B Head Cable 5 m',
    category:'Cable',compatibleWith:['nanlite-forza-720','nanlite-forza-720b'],
    compatibilityStatus:'Designed For',
    includedWithFixtures:['nanlite-forza-720','nanlite-forza-720b'],
    evidenceNote:'Nanlite long-head-cable product documentation explicitly states the included 5 m head cable is supplied with both Forza 720 and Forza 720B.',
    sourceUrl:SRC.sharedHeadCableEvidence
  },
  included('nanlite-forza-720b-power-cable','Forza 720B Power Cable 6 m','Cable',SRC.fixture),
  included('nanlite-forza-720b-cob-cap','AS-CAP-BW-B COB Protective Cap','Other',SRC.fixture),
  {
    id:'nanlite-cc-st-fz720',manufacturer:'Nanlite',model:'CC-ST-FZ720 Rolling Padded Case',
    category:'Case',compatibleWith:['nanlite-forza-720b','nanlite-forza-720'],compatibilityStatus:'Designed For',
    includedWithFixtures:['nanlite-forza-720b','nanlite-forza-720'],
    inclusionEvidenceNote:'Nanlite launch documentation states a padded carrying case is included with both Forza 720 and Forza 720B.',
    officialSourceConflict:true,
    conflictNote:'Nanlite launch documentation and the Forza 720B product page describe the padded rolling case as included, while the standalone CC-ST-FZ720 accessory page lists the case as sold separately. Catalog preserves the documented kit inclusion and records the packaging-channel conflict explicitly.',
    conflictSources:[SRC.launch,SRC.fixture,SRC.case],
    sourceUrl:SRC.case
  },
  {
    id:'nanlite-pj-bm-36',manufacturer:'Nanlite',model:'PJ-BM Projection Attachment with 36° Lens',
    category:'Spotlight',mount:'Bowens',beamAngleDeg:36,
    compatibleWith:[
      'nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-forza-300-ii','nanlite-forza-500-ii','nanlite-forza-720b','nanlite-forza-720',
      'nanlite-fc-500b','nanlite-fc-500c'
    ],
    compatibilityStatus:'Designed For',sourceUrl:SRC.pj36
  },
  {
    id:'nanlite-pj-bm-ai',manufacturer:'Nanlite',model:'PJ-BM-AI Adjustable Iris Diaphragm',
    category:'Iris',compatibleWith:['nanlite-pj-bm-19','nanlite-pj-bm-36'],
    compatibilityStatus:'Compatible',sourceUrl:SRC.pj19
  },
  {
    id:'nanlite-asgbbmset1',manufacturer:'Nanlite',model:'ASGBBMSET1 Gobo Set 1 for Bowens Mount Projector',
    category:'Other',compatibleWith:['nanlite-pj-bm-19','nanlite-pj-bm-36'],
    compatibilityStatus:'Compatible',sourceUrl:SRC.pj19
  },
  {
    id:'nanlite-asgbbmset2',manufacturer:'Nanlite',model:'ASGBBMSET2 Gobo Set 2 for Bowens Mount Projector',
    category:'Other',compatibleWith:['nanlite-pj-bm-19','nanlite-pj-bm-36'],
    compatibilityStatus:'Compatible',sourceUrl:SRC.pj19
  }
];
