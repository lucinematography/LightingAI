// Nanlite FC-720 current high-output Bowens-mount family.
// Introduced in 2026. Official Nanlite US sources only.
// FC-720B/C are AC-powered only; no battery compatibility is inferred.

const SRC_B='https://nanliteus.com/products/fc-720b-bi-color-led-spotlight';
const SRC_C='https://nanliteus.com/products/fc-720c-rgbw-color-led-spotlight';
const SERIES='https://nanliteus.com/pages/fc-720b-fc-720c';
const PJ='https://nanliteus.com/products/bowens-mount-projection-attachment-25-45';

function control({nfc=false}={}){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth / NANLINK app',...(nfc?['NFC pairing']:[])],
    builtInBluetooth:true,
    builtInCRMX:false,
    nfcPairing:nfc,
    directLightingAI:[],
    externalInterfaceRequired:['Wired DMX interface for DMX512 control'],
    unavailableDirectProtocols:['NANLINK Bluetooth control protocol is not publicly documented for third-party direct control']
  };
}

export const NANLITE_FC_720_FIXTURES=[
  {
    id:'nanlite-fc-720b',manufacturer:'Nanlite',model:'FC-720B',family:'FC-720',
    category:'Light',discontinued:false,sourceType:'Bi-Color LED Spotlight',mount:'Bowens',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',cri:96,tlci:98,powerDrawW:750,
    batteryPowered:false,powerMode:'AC only',control:control({nfc:true}),sourceUrl:SRC_B
  },
  {
    id:'nanlite-fc-720c',manufacturer:'Nanlite',model:'FC-720C',family:'FC-720',
    category:'Light',discontinued:false,sourceType:'RGBW Full-Color LED Spotlight',mount:'Bowens',
    cctK:{min:2400,max:12000},colorMode:'RGBW',cri:95,tlci:94,powerDrawW:750,
    batteryPowered:false,powerMode:'AC only',control:control({nfc:true}),sourceUrl:SRC_C
  }
];

const BOTH=['nanlite-fc-720b','nanlite-fc-720c'];

function included(id,model,category,target,sourceUrl){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl
  };
}

export const NANLITE_FC_720_ACCESSORIES=[
  {
    id:'nanlite-pj-bm-25-45',manufacturer:'Nanlite',model:'PJ-BM-25-45 Bowens Mount Projection Attachment 25°-45°',
    category:'Spotlight',mount:'Bowens',beamAngleDeg:{min:25,max:45},
    compatibleWith:['nanlite-fc-720b','nanlite-fc-720c','nanlite-fc-500b','nanlite-fc-500c','nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-forza-720b','nanlite-fs-150b','nanlite-fs-300b','nanlite-fs-300c'],
    compatibilityStatus:'Designed For',sourceUrl:PJ
  },
  {
    id:'nanlite-pj-fmm-ai-for-pj-bm',manufacturer:'Nanlite',model:'PJ-FMM-AI Adjustable Iris Diaphragm',
    category:'Iris',compatibleWith:['nanlite-pj-bm-25-45'],compatibilityStatus:'Compatible',
    conditions:['Installs in the PJ-BM-25-45 projection attachment'],sourceUrl:PJ
  },
  included('nanlite-fc-720b-power-supply','FC-720B Power Supply','Power','nanlite-fc-720b',SRC_B),
  included('nanlite-fc-720c-power-supply','FC-720C Power Supply','Power','nanlite-fc-720c',SRC_C),
  included('nanlite-fc-720b-reflector-45','FC-720B 45-Degree Bowens Mount Reflector','Reflector','nanlite-fc-720b',SRC_B),
  included('nanlite-fc-720c-reflector-45','FC-720C 45-Degree Bowens Mount Reflector','Reflector','nanlite-fc-720c',SRC_C),
  included('nanlite-fc-720b-quick-release-clamp','FC-720B Quick-Release Power-Supply Clamp','Bracket','nanlite-fc-720b',SRC_B),
  included('nanlite-fc-720c-quick-release-clamp','FC-720C Quick-Release Power-Supply Clamp','Bracket','nanlite-fc-720c',SRC_C),
  included('nanlite-fc-720b-head-cable','FC-720B Head Cable','Cable','nanlite-fc-720b',SRC_B),
  included('nanlite-fc-720c-head-cable','FC-720C Head Cable','Cable','nanlite-fc-720c',SRC_C),
  included('nanlite-fc-720b-ac-power-cable','FC-720B AC Power Cable','Cable','nanlite-fc-720b',SRC_B),
  included('nanlite-fc-720c-ac-power-cable','FC-720C AC Power Cable','Cable','nanlite-fc-720c',SRC_C),
  included('nanlite-fc-720b-hard-foam-case','FC-720B Hard-Foam Carrying Case','Other','nanlite-fc-720b',SRC_B),
  included('nanlite-fc-720c-hard-foam-case','FC-720C Hard-Foam Carrying Case','Other','nanlite-fc-720c',SRC_C),
  {
    id:'nanlite-fc-720-series-control-note',manufacturer:'Nanlite',model:'FC-720 Bluetooth / DMX-RDM Control',
    category:'Control',compatibleWith:BOTH,compatibilityStatus:'Designed For',
    conditions:['FC-720B and FC-720C support NFC pairing; official FC-720B/C product pages do not list 2.4G control'],sourceUrl:SERIES
  }
];
