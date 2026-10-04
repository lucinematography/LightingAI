// Nanlite legacy FS models no longer present in the current FS-Series collection.
// Official Nanlite US sources only.

const SRC={
  fs200b:'https://nanliteus.com/blogs/learn/the-nanlite-fs-150b-and-fs-200b-high-quality-bi-color-and-affordable',
  fs300:'https://nanliteus.com/blog/the-new-nanlite-fs300b-an-affordable-powerful-bicolor-studio-light/',
  faq:'https://nanliteus.com/pages/faq',
  current:'https://nanliteus.com/collections/fs-series'
};

function legacyControl(){
  return {
    wired:[],
    wireless:['Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,builtInCRMX:false,
    directLightingAI:[],externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'No DMX/RDM or CRMX control is documented for these legacy FS fixtures',
      'NANLINK Bluetooth/2.4G protocol is not publicly documented for third-party direct control'
    ]
  };
}

export const NANLITE_FS_LEGACY_FIXTURES=[
  {
    id:'nanlite-fs-200b',manufacturer:'Nanlite',model:'FS-200B',
    family:'FS Series',category:'Light',discontinued:true,lifecycleStatus:'legacy/discontinued',
    lifecycleEvidenceUrl:SRC.current,
    sourceType:'Bi-Color AC LED Monolight',mount:'Bowens',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',cri:96,tlci:97,
    batteryPowered:false,powerMode:'AC only, all-in-one',
    control:legacyControl(),sourceUrl:SRC.fs200b
  },
  {
    id:'nanlite-fs-300',manufacturer:'Nanlite',model:'FS-300',
    family:'FS Series',category:'Light',discontinued:true,lifecycleStatus:'legacy/discontinued',
    lifecycleEvidenceUrl:SRC.current,
    sourceType:'Daylight AC LED Monolight',mount:'Bowens',
    cctK:{fixed:5600},colorMode:'Daylight',
    batteryPowered:false,powerMode:'AC only, all-in-one',
    control:legacyControl(),sourceUrl:SRC.fs300
  }
];

export const NANLITE_FS_LEGACY_ACCESSORIES=[];
