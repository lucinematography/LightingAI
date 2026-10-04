// Nanlite current Forza II Bowens-mount family.
// Official Nanlite US sources only; compatibility is explicit and not inferred.

const SRC300='https://nanliteus.com/products/forza-300b-ii-bi-color-led-spotlight';
const SRC500='https://nanliteus.com/products/forza-500b-ii-led-spotlight';
const SRC500G='https://nanliteus.com/products/forza-500b-ii-led-spotlight-with-gold-mount';
const FL20G='https://nanliteus.com/products/fl-20g-fresnel-lens-for-bowens-mount';
const CASE='https://nanliteus.com/products/padded-carrying-case-for-forza-300-ii-and-500-ii';
const CLAMP='https://nanliteus.com/products/quick-release-super-clamp-for-forza-720-500-300-and-pavoslim';
const RC='https://nanliteus.com/products/nanlink-ws-rc-c2-2-4ghz-remote-control';
const TB='https://nanliteus.com/products/nanlink-ws-tb-1-transmitter-box';
const CBFZ75='https://nanliteus.com/products/head-cable-24-7ft-for-forza-720-720b-500-ii-500b-ii-300-ii-300b-ii';
const CBFZ12='https://nanliteus.com/products/head-cable-39-5ft-for-forza-720-720b-500-ii-500b-ii-300-ii-300b-ii';
const CAPBW='https://nanliteus.com/nanlite-replacement-cob-cap-for-forza-720-720b-300b-200-and-fs-150/';
const CAPFAQ='https://nanliteus.com/pages/faq';
const DAY300='https://nanliteus.com/nanlite-forza-300-ii-led-spotlight-2-light-kit/';
const F720B='https://nanliteus.com/products/forza-720b-bi-color-led-spotlight-with-rolling-case';

function control(){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:['Wired DMX interface for DMX512 control'],
    unavailableDirectProtocols:['NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control']
  };
}
function fixture(id,model,powerDrawW,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,family:'Forza II',category:'Light',discontinued:false,
    sourceType:'Bi-Color LED Spotlight',mount:'Bowens',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',cri:96,tlci:97,powerDrawW,
    control:control(),sourceUrl,...extra
  };
}

export const NANLITE_FORZA_II_FIXTURES=[
  fixture('nanlite-forza-300b-ii','Forza 300B II',350,SRC300,{
    batteryOptions:['14.4V-14.8V V-Mount batteries via Control Unit'],
    includedMountSystem:'Control Unit with V-Mount plates'
  }),
  fixture('nanlite-forza-500b-ii','Forza 500B II',580,SRC500,{
    batteryOptions:['14.4V-14.8V V-Mount','26V V-Mount'],
    availableGoldMountVariant:true,
    goldMountSourceUrl:SRC500G,
    includedMountSystem:'Control Unit with V-Mount plates'
  })
];

const BOTH=['nanlite-forza-300b-ii','nanlite-forza-500b-ii'];
const DAYLIGHT_II=['nanlite-forza-300-ii','nanlite-forza-500-ii'];
const FL20G_TARGETS=[...BOTH,...DAYLIGHT_II,'nanlite-forza-720b','nanlite-forza-720','nanlite-fc-300b','nanlite-fc-500b','nanlite-fc-500c','nanlite-fc-720b','nanlite-fc-720c','nanlite-fs-150b','nanlite-fs-300b','nanlite-fs-300c'];
const LONG_HEAD_CABLE_TARGETS=[...BOTH,...DAYLIGHT_II,'nanlite-forza-720b','nanlite-forza-720'];
const CAP_BW_B_TARGETS=['nanlite-forza-300-ii','nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-forza-720','nanlite-forza-720b'];

export const NANLITE_FORZA_II_ACCESSORIES=[
  {
    id:'nanlite-as-cap-bw-b',manufacturer:'Nanlite',model:'AS-CAP-BW-B COB Protective Cap',
    category:'Other',mount:'Bowens',compatibleWith:CAP_BW_B_TARGETS,compatibilityStatus:'Compatible',
    includedWithFixtures:['nanlite-forza-300-ii','nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-forza-720b'],
    inclusionEvidenceNote:'Included-with list contains only current Forza models whose first-party package contents were explicitly verified; compatibility is broader.',
    officialSourceConflict:true,
    conflictNote:'Nanlite FAQ lists an older AS-CAP-BW-B compatibility set, while current Forza 300 II, 300B II, 500B II and 720B package pages explicitly include AS-CAP-BW-B. Forza 500 II is not inferred without equally direct first-party evidence.',
    conflictSources:[CAPFAQ,DAY300,SRC300,SRC500,F720B],
    sourceUrl:CAPBW
  },
  {
    id:'nanlite-cb-fz-7-5m',manufacturer:'Nanlite',model:'CB-FZ-7.5M Head Cable 7.5 m / 24.7 ft',
    category:'Cable',compatibleWith:LONG_HEAD_CABLE_TARGETS,compatibilityStatus:'Designed For',
    lengthM:7.5,sourceUrl:CBFZ75
  },
  {
    id:'nanlite-cb-fz-12m',manufacturer:'Nanlite',model:'CB-FZ-12M Head Cable 12 m / 39.5 ft',
    category:'Cable',compatibleWith:LONG_HEAD_CABLE_TARGETS,compatibilityStatus:'Designed For',
    lengthM:12,sourceUrl:CBFZ12
  },
  {
    id:'nanlite-fl-20g',manufacturer:'Nanlite',model:'FL-20G Fresnel Lens with Removable Metal Barndoors',
    category:'Fresnel',mount:'Bowens',beamAngleDeg:{min:10,max:45},compatibleWith:FL20G_TARGETS,compatibilityStatus:'Designed For',
    sourceUrl:FL20G
  },
  {
    id:'nanlite-ccsfz300ii',manufacturer:'Nanlite',model:'CCSFZ300II Padded Carrying Case for Forza 300 II / 500 II',
    category:'Other',compatibleWith:[...BOTH,...DAYLIGHT_II],compatibilityStatus:'Designed For',sourceUrl:CASE
  },
  {
    id:'nanlite-rf-bm-55-forza-ii',manufacturer:'Nanlite',model:'RF-BM 55-Degree Bowens Mount Reflector',
    category:'Reflector',mount:'Bowens',compatibleWith:[...BOTH,...DAYLIGHT_II],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC300
  },
  {
    id:'nanlite-ascpqrfz',manufacturer:'Nanlite',model:'ASCPQRFZ Quick-Release Super Clamp',
    category:'Bracket',compatibleWith:[...BOTH,...DAYLIGHT_II,'nanlite-forza-720b','nanlite-forza-720','nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-60cl','nanlite-pavoslim-120b','nanlite-pavoslim-120c','nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c','nanlite-alien-150c','nanlite-alien-300c'],compatibilityStatus:'Designed For',
    includedWithFixtures:['nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-forza-300-ii','nanlite-forza-500-ii','nanlite-forza-720b','nanlite-forza-720','nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-60cl','nanlite-pavoslim-120b','nanlite-pavoslim-120c','nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c','nanlite-alien-150c','nanlite-alien-300c'],
    inclusionEvidenceNote:'Included-with list is conservative and contains only fixtures explicitly verified in first-party product or launch documentation; compatibility is broader.',
    sourceUrl:CLAMP
  },
  {
    id:'nanlite-forza-300-ii-control-unit',manufacturer:'Nanlite',model:'Forza 300 II Control Unit with V-Mount Plates',
    category:'Power',compatibleWith:['nanlite-forza-300-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:'https://nanliteus.com/nanlite-forza-300-ii-led-spotlight-2-light-kit/'
  },
  {
    id:'nanlite-forza-300-ii-head-cable',manufacturer:'Nanlite',model:'Forza 300 II Head Cable 3 m',
    category:'Cable',compatibleWith:['nanlite-forza-300-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,lengthM:3,sourceUrl:'https://nanliteus.com/nanlite-forza-300-ii-led-spotlight-2-light-kit/'
  },
  {
    id:'nanlite-forza-300-ii-power-cable',manufacturer:'Nanlite',model:'Forza 300 II Power Cable 6 m',
    category:'Cable',compatibleWith:['nanlite-forza-300-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,lengthM:6,sourceUrl:'https://nanliteus.com/nanlite-forza-300-ii-led-spotlight-2-light-kit/'
  },
  {
    id:'nanlite-forza-300b-ii-control-unit',manufacturer:'Nanlite',model:'Forza 300B II Control Unit with V-Mount Plates',
    category:'Power',compatibleWith:['nanlite-forza-300b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC300
  },
  {
    id:'nanlite-forza-500b-ii-control-unit',manufacturer:'Nanlite',model:'Forza 500B II Control Unit with V-Mount Plates',
    category:'Power',compatibleWith:['nanlite-forza-500b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC500
  },
  {
    id:'nanlite-forza-300b-ii-head-cable',manufacturer:'Nanlite',model:'Forza 300B II Head Cable 3 m',
    category:'Cable',compatibleWith:['nanlite-forza-300b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC300
  },
  {
    id:'nanlite-forza-500b-ii-head-cable',manufacturer:'Nanlite',model:'Forza 500B II Head Cable 3 m',
    category:'Cable',compatibleWith:['nanlite-forza-500b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC500
  },
  {
    id:'nanlite-forza-300b-ii-power-cable',manufacturer:'Nanlite',model:'Forza 300B II Power Cable 6 m',
    category:'Cable',compatibleWith:['nanlite-forza-300b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC300
  },
  {
    id:'nanlite-forza-500b-ii-power-cable',manufacturer:'Nanlite',model:'Forza 500B II Power Cable 6 m',
    category:'Cable',compatibleWith:['nanlite-forza-500b-ii'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC500
  }
];
