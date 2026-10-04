// Nanlite current FC high-output family.
// Official Nanlite US sources only. Compatibility is explicit and model-scoped.

const SRC={
  fcSeries:'https://nanliteus.com/collections/fc-series',
  fc300:'https://nanliteus.com/blogs/learn/the-new-nanlite-fc-500b-and-fc-300b-high-output-bi-color-led-spotlights',
  fc500b:'https://nanliteus.com/products/fc-500b-bi-color-led-spotlight',
  fc500c:'https://nanliteus.com/products/fc-500c-rgbw-color-led-spotlight',
  fc1200b:'https://nanliteus.com/products/fc-1200b-bi-color-led-spotlight',
  fc1200c:'https://nanliteus.com/products/fc-1200c-rgbw-color-led-spotlight',
  powerController:'https://nanliteus.com/products/fc-powercontroller-for-fc-300b-fc-500b-and-fc-500c',
  fl20g:'https://nanliteus.com/products/fl-20g-fresnel-lens-for-bowens-mount',
  pj19:'https://nanliteus.com/products/pj-bm-projection-attachment-with-19-lens-for-bowens-mount',
  pj2545:'https://nanliteus.com/products/bowens-mount-projection-attachment-25-45',
  case1200:'https://nanliteus.com/products/rolling-padded-case-for-fc-1200b-and-fc-1200c'
};

function fcControl({nfc=false,twoPointFour=true}={}){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth / NANLINK app',...(twoPointFour?['2.4G']:[]),...(nfc?['NFC pairing']:[])],
    builtInBluetooth:true,
    builtInCRMX:false,
    nfcPairing:nfc,
    directLightingAI:[],
    externalInterfaceRequired:['Wired DMX interface for DMX512 control'],
    unavailableDirectProtocols:[
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}

function fixture(id,model,cctMin,cctMax,powerDrawW,colorMode,cri,tlci,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,family:'FC High Output',category:'Light',discontinued:false,
    sourceType:'LED Spotlight',mount:'Bowens',cctK:{min:cctMin,max:cctMax},
    powerDrawW,colorMode,cri,tlci,sourceUrl,...extra
  };
}

export const NANLITE_FC_HIGH_OUTPUT_FIXTURES=[
  fixture('nanlite-fc-300b','FC-300B',2700,6500,350,'Bi-Color',96,98,SRC.fc300,{
    control:fcControl(),batteryPowered:true,
    batteryOptions:['14.4-14.8V V-Mount via FC PowerController','26V V-Mount via FC PowerController','AC power supply']
  }),
  fixture('nanlite-fc-500b','FC-500B',2700,6500,520,'Bi-Color',96,98,SRC.fc500b,{
    control:fcControl(),batteryPowered:true,
    batteryOptions:['14.4-14.8V V-Mount via FC PowerController','26V V-Mount via FC PowerController','AC power supply']
  }),
  fixture('nanlite-fc-500c','FC-500C',2700,7500,520,'RGBW',95,98,SRC.fc500c,{
    control:fcControl(),batteryPowered:true,
    batteryOptions:['14.4-14.8V V-Mount via FC PowerController','26V V-Mount via FC PowerController','AC power supply']
  }),
  fixture('nanlite-fc-1200b','FC-1200B',2700,6500,1350,'Bi-Color',96,98,SRC.fc1200b,{
    control:fcControl({nfc:true,twoPointFour:false}),batteryPowered:false,powerMode:'AC only, all-in-one'
  }),
  fixture('nanlite-fc-1200c','FC-1200C',2400,12000,1350,'RGBW',95,94,SRC.fc1200c,{
    control:fcControl({nfc:true,twoPointFour:false}),batteryPowered:false,powerMode:'AC only, all-in-one'
  })
];

const POWERCTRL=['nanlite-fc-300b','nanlite-fc-500b','nanlite-fc-500c'];
const FL20G_TARGETS=['nanlite-fc-300b','nanlite-fc-500b','nanlite-fc-500c'];
const PJ_TARGETS=['nanlite-fc-500b','nanlite-fc-500c'];
const FC1200=['nanlite-fc-1200b','nanlite-fc-1200c'];

function included(id,model,category,target,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl,...extra
  };
}

export const NANLITE_FC_HIGH_OUTPUT_ACCESSORIES=[
  {
    id:'nanlite-fc-powercontroller',manufacturer:'Nanlite',model:'FC PowerController',
    category:'Power',compatibleWith:POWERCTRL,compatibilityStatus:'Designed For',
    batteryMounts:['14.4-14.8V V-Mount','26V V-Mount'],
    bundledComponents:['DC Connection Cable 3 m'],sourceUrl:SRC.powerController
  },
  {
    id:'nanlite-fl-20g-fc',manufacturer:'Nanlite',model:'FL-20G Fresnel Lens with Removable Metal Barndoors',
    category:'Fresnel',mount:'Bowens',beamAngleDeg:{min:10,max:45},
    compatibleWith:FL20G_TARGETS,compatibilityStatus:'Designed For',sourceUrl:SRC.fl20g
  },
  {
    id:'nanlite-pj-bm-19-fc',manufacturer:'Nanlite',model:'PJ-BM Projection Attachment with 19° Lens',
    category:'Spotlight',mount:'Bowens',beamAngleDeg:19,compatibleWith:PJ_TARGETS,
    compatibilityStatus:'Designed For',sourceUrl:SRC.pj19
  },
  {
    id:'nanlite-pj-bm-25-45-fc',manufacturer:'Nanlite',model:'PJ-BM-25-45 Bowens Zoom Projection Attachment',
    category:'Spotlight',mount:'Bowens',beamAngleDeg:{min:25,max:45},compatibleWith:PJ_TARGETS,
    compatibilityStatus:'Designed For',sourceUrl:SRC.pj2545
  },
  {
    id:'nanlite-cc-st-fc1200',manufacturer:'Nanlite',model:'CC-ST-FC1200 Rolling Padded Case',
    category:'Case',compatibleWith:FC1200,compatibilityStatus:'Designed For',sourceUrl:SRC.case1200
  },

  included('nanlite-fc-300b-power-supply','FC-300B Power Supply','Power','nanlite-fc-300b',SRC.fc300),
  included('nanlite-fc-300b-reflector','FC-300B Bowens Reflector','Reflector','nanlite-fc-300b',SRC.fc300),
  included('nanlite-fc-300b-head-cable','FC-300B Head Cable','Cable','nanlite-fc-300b',SRC.fc300),
  included('nanlite-fc-300b-ac-cable','FC-300B AC Power Cable','Cable','nanlite-fc-300b',SRC.fc300),

  included('nanlite-fc-500b-power-supply','FC-500B Power Supply','Power','nanlite-fc-500b',SRC.fc500b),
  included('nanlite-fc-500b-reflector','FC-500B 45-Degree Bowens Reflector','Reflector','nanlite-fc-500b',SRC.fc500b),
  included('nanlite-fc-500b-head-cable','FC-500B Head Cable 3 m','Cable','nanlite-fc-500b',SRC.fc500b),
  included('nanlite-fc-500b-ac-cable','FC-500B AC Power Cable 6 m','Cable','nanlite-fc-500b',SRC.fc500b),
  included('nanlite-fc-500b-quick-release-plate','FC-500B Power-Supply Quick-Release Plate','Bracket','nanlite-fc-500b',SRC.fc500b),
  included('nanlite-fc-500b-case','FC-500B Carrying Case','Case','nanlite-fc-500b',SRC.fc500b),

  included('nanlite-fc-500c-power-supply','FC-500C Power Supply','Power','nanlite-fc-500c',SRC.fc500c),
  included('nanlite-fc-500c-reflector','FC-500C Bowens Reflector','Reflector','nanlite-fc-500c',SRC.fc500c),
  included('nanlite-fc-500c-head-cable','FC-500C Head Cable 3 m','Cable','nanlite-fc-500c',SRC.fc500c),
  included('nanlite-fc-500c-ac-cable','FC-500C AC Power Cable 6 m','Cable','nanlite-fc-500c',SRC.fc500c),
  included('nanlite-fc-500c-quick-release-clamp','FC-500C Quick-Release Clamp','Bracket','nanlite-fc-500c',SRC.fc500c),
  included('nanlite-fc-500c-case','FC-500C Carrying Case','Case','nanlite-fc-500c',SRC.fc500c),

  included('nanlite-fc-1200b-reflector','FC-1200B 45-Degree Bowens Reflector','Reflector','nanlite-fc-1200b',SRC.fc1200b),
  included('nanlite-fc-1200b-power-cable','FC-1200B Power Cable 7.5 m','Cable','nanlite-fc-1200b',SRC.fc1200b),
  included('nanlite-fc-1200b-hard-case','FC-1200B Hard-Foam Latching Case','Case','nanlite-fc-1200b',SRC.fc1200b),

  included('nanlite-fc-1200c-reflector','FC-1200C 45-Degree Bowens Reflector','Reflector','nanlite-fc-1200c',SRC.fc1200c),
  included('nanlite-fc-1200c-power-cable','FC-1200C Power Cable 7.5 m','Cable','nanlite-fc-1200c',SRC.fc1200c),
  included('nanlite-fc-1200c-hard-case','FC-1200C Hard-Foam Latching Case','Case','nanlite-fc-1200c',SRC.fc1200c)
];
