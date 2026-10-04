// Nanlite current compact FM-mount family.
// Sources are official Nanlite US product/accessory pages.
// Compatibility is intentionally explicit; do not infer unlisted model relationships.

const SRC = {
  forza60ii:'https://nanliteus.com/blogs/learn/the-nanlite-forza-60-ii-and-60b-ii-new-upgrades-make-a-big-difference',
  forza60bii:'https://nanliteus.com/products/forza-60b-ii-bi-color-led-spotlight',
  forza60c:'https://nanliteus.com/products/forza-60c-rgblac-led-spotlight-kit-includes-battery-grip-and-bowens-mount-adapter',
  forza60cr:'https://nanliteus.com/products/forza-60cr-rgblac-led-spotlight-with-crmx',
  fc60b:'https://nanliteus.com/products/fc-60b-bi-color-led-spotlight',
  fc120b:'https://nanliteus.com/products/fc-120b-bi-color-led-spotlight',
  fc120c:'https://nanliteus.com/products/fc-120c-full-color-led-spotlight',
  fs60b:'https://nanliteus.com/products/fs-60b-bi-color-ac-led-monolight',
  bowens:'https://nanliteus.com/products/forza-bowens-adapter-for-fm-mount-lights',
  fl11:'https://nanliteus.com/products/fl-11-fresnel-lens-and-barndoors-for-forza-fm-mount-lights',
  pj19:'https://nanliteus.com/products/forza-pj-fmm-projection-attachment-with-19-lens-for-fm-mount',
  pj36:'https://nanliteus.com/products/forza-pj-fmm-projection-attachment-with-36-lens-for-fm-mount',
  sb40:'https://nanliteus.com/products/40cm-octagonal-softbox-for-fm-mount',
  sb60:'https://nanliteus.com/products/60cm-octagonal-softbox-for-fm-mount',
  npfGrip:'https://nanliteus.com/products/np-f-battery-grip-for-forza-60-ii-60b-ii-and-60c',
  vmountGrip:'https://nanliteus.com/products/v-mount-battery-grip-for-forza-60-ii-60b-ii-60c-and-fc-60b',
  xlrVmountGrip:'https://nanliteus.com/products/v-mount-battery-grip-for-forza-150b-and-fc-120b',
  rc:'https://nanliteus.com/products/nanlink-ws-rc-c2-2-4ghz-remote-control',
  tb:'https://nanliteus.com/products/nanlink-ws-tb-1-transmitter-box',
  rf45:'https://nanliteus.com/products/rf-fmm-45-45-degree-reflector-for-fm-mount',
  rf45s:'https://nanliteus.com/products/forza-45-degree-mini-reflector-with-fm-mount',
  dome:'https://nanliteus.com/products/diffusion-dome-for-fc-120b-and-forza-150b',
  case60:'https://nanliteus.com/products/padded-carrying-case-for-forza-60s-or-fs-60b'
};

function control({dmx=true,crmx=false}={}){
  const wired=dmx?['DMX512','RDM']:[];
  const wireless=['Bluetooth / NANLINK app','2.4G'];
  if(crmx) wireless.unshift('LumenRadio CRMX');
  return {
    wired,
    wireless,
    builtInBluetooth:true,
    builtInCRMX:crmx,
    directLightingAI:[],
    externalInterfaceRequired:[
      ...(dmx?['Wired DMX interface for DMX512 control']:[]),
      ...(crmx?['CRMX transmitter for CRMX control']:[])
    ],
    unavailableDirectProtocols:[
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}

function fixture(id,model,family,cctMin,cctMax,powerDrawW,colorMode,cri,tlci,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,family,category:'Light',discontinued:false,
    sourceType:'LED Spotlight',mount:'FM Mount',
    cctK:{min:cctMin,max:cctMax},powerDrawW,colorMode,cri,tlci,sourceUrl,
    ...extra
  };
}

export const NANLITE_FM_CURRENT_FIXTURES = [
  fixture('nanlite-forza-60-ii','Forza 60 II','Forza',5600,5600,null,'Daylight',null,null,SRC.forza60ii,{control:control(),batteryPowered:true,powerOptions:['NP-F batteries via BT-BG-FZ60','V-Mount via BT-BG-V','AC power adapter']}),
  fixture('nanlite-forza-60b-ii','Forza 60B II','Forza',2700,6500,72,'Bi-Color',96,98,SRC.forza60bii,{control:control()}),
  fixture('nanlite-forza-60c','Forza 60C','Forza',1800,20000,88,'RGBLAC',96,95,SRC.forza60c,{control:control()}),
  fixture('nanlite-forza-60cr','Forza 60CR','Forza',1800,20000,88,'RGBLAC',96,95,SRC.forza60cr,{control:control({crmx:true})}),
  fixture('nanlite-fc-60b','FC-60B','FC',2700,6500,78,'Bi-Color',96,98,SRC.fc60b,{control:control()}),
  fixture('nanlite-fc-120b','FC-120B','FC',2700,6500,145,'Bi-Color',96,98,SRC.fc120b,{control:control()}),
  fixture('nanlite-fc-120c','FC-120C','FC',2700,7500,145,'Full Color',95,94,SRC.fc120c,{control:control()}),
  fixture('nanlite-fs-60b','FS-60B','FS',2700,6500,70,'Bi-Color',96,97,SRC.fs60b,{control:control({dmx:false})})
];

const FMM_CURRENT = [
  'nanlite-forza-60-ii','nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-forza-60cr',
  'nanlite-fc-60b','nanlite-fc-120b','nanlite-fc-120c','nanlite-fs-60b'
];
const FMM_SHARED = [...FMM_CURRENT,'nanlite-forza-150b'];
const NANLINK_RC_SHARED=[...FMM_SHARED,'nanlite-forza-300b-ii','nanlite-forza-500b-ii','nanlite-forza-720b','nanlite-fc-720b','nanlite-fc-720c','nanlite-pavoslim-60b','nanlite-pavoslim-60c','nanlite-pavoslim-60cl','nanlite-pavoslim-120b','nanlite-pavoslim-120c','nanlite-pavoslim-240b','nanlite-pavoslim-240c','nanlite-pavoslim-240cl','nanlite-pavoslim-360c','nanlite-pavotube-ii-15c','nanlite-pavotube-ii-30c','nanlite-pavotube-ii-6c','nanlite-pavotube-ii-15x','nanlite-pavotube-ii-30x','nanlite-pavotube-ii-60x','nanlite-fc-300b','nanlite-fc-500b','nanlite-fc-500c','nanlite-fc-1200b','nanlite-fc-1200c','nanlite-alien-150c','nanlite-alien-300c','nanlite-pavobulb-10c','nanlite-fs-150b','nanlite-fs-300b','nanlite-fs-300c','nanlite-lumipad-11','nanlite-forza-300-ii','nanlite-forza-500-ii','nanlite-forza-720','nanlite-fs-200b','nanlite-fs-300','nanlite-compac-200b'];
const NANLINK_TB_SHARED=[...NANLINK_RC_SHARED,'nanlite-mixpanel-60','nanlite-mixpanel-150','nanlite-tk-140b','nanlite-tk-280b','nanlite-tk-200','nanlite-tk-450'];
const SMALL_BATTERY = ['nanlite-forza-60-ii','nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-forza-60cr','nanlite-fc-60b'];
const VMOUNT_60 = ['nanlite-forza-60-ii','nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-fc-60b'];
const VMOUNT_XLR = ['nanlite-forza-150b','nanlite-fc-120b','nanlite-fc-120c'];
const MINI_REFLECTOR = ['nanlite-forza-60-ii','nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-forza-60cr','nanlite-fc-60b','nanlite-fs-60b'];
const LARGE_REFLECTOR = ['nanlite-forza-150b','nanlite-fc-120b','nanlite-fc-120c'];
const DMX_FMM = FMM_CURRENT.filter(id => id!=='nanlite-fs-60b');

const included = (id,model,category,target,sourceUrl) => ({
  id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
  compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl
});

export const NANLITE_FM_CURRENT_ACCESSORIES = [
  {
    id:'nanlite-as-ba-fmm',manufacturer:'Nanlite',model:'AS-BA-FMM Bowens Adapter for FM-Mount Lights',
    category:'Mount Adapter',mount:'FM Mount to Bowens',compatibleWith:FMM_SHARED,
    compatibilityStatus:'Designed For',sourceUrl:SRC.bowens
  },
  {
    id:'nanlite-fl-11',manufacturer:'Nanlite',model:'FL-11 Fresnel Lens and Barndoors',
    category:'Fresnel',mount:'FM Mount',beamAngleDeg:{min:10,max:45},compatibleWith:FMM_SHARED,
    compatibilityStatus:'Designed For',sourceUrl:SRC.fl11
  },
  {
    id:'nanlite-pj-fmm-19',manufacturer:'Nanlite',model:'PJ-FMM Projection Attachment with 19° Lens',
    category:'Spotlight',mount:'FM Mount',compatibleWith:FMM_SHARED,
    compatibilityStatus:'Designed For',sourceUrl:SRC.pj19
  },
  {
    id:'nanlite-pj-fmm-36',manufacturer:'Nanlite',model:'PJ-FMM Projection Attachment with 36° Lens',
    category:'Spotlight',mount:'FM Mount',compatibleWith:FMM_SHARED,
    compatibilityStatus:'Designed For',sourceUrl:SRC.pj36
  },
  {
    id:'nanlite-sb-fmm-o-40',manufacturer:'Nanlite',model:'SB-FMM-O-40 40cm Octagonal Softbox with Grid',
    category:'Softbox',mount:'FM Mount',compatibleWith:FMM_SHARED,
    compatibilityStatus:'Designed For',sourceUrl:SRC.sb40
  },
  {
    id:'nanlite-sb-fmm-o-60',manufacturer:'Nanlite',model:'SB-FMM-O-60 60cm Octagonal Softbox with Grid',
    category:'Softbox',mount:'FM Mount',compatibleWith:FMM_SHARED,
    compatibilityStatus:'Designed For',sourceUrl:SRC.sb60
  },
  {
    id:'nanlite-bt-bg-fz60',manufacturer:'Nanlite',model:'BT-BG-FZ60 NP-F Battery Grip',
    category:'Power',compatibleWith:SMALL_BATTERY,compatibilityStatus:'Designed For',sourceUrl:SRC.npfGrip
  },
  {
    id:'nanlite-bt-bg-v',manufacturer:'Nanlite',model:'BT-BG-V V-Mount Battery Grip',
    category:'Power',compatibleWith:VMOUNT_60,compatibilityStatus:'Designed For',sourceUrl:SRC.vmountGrip
  },
  {
    id:'nanlite-bt-bg-xlr4-ii',manufacturer:'Nanlite',model:'BT-BG-XLR4-II V-Mount Battery Grip with 4-Pin XLR',
    category:'Power',compatibleWith:VMOUNT_XLR,compatibilityStatus:'Designed For',sourceUrl:SRC.xlrVmountGrip
  },
  {
    id:'nanlite-ws-rc-c2',manufacturer:'Nanlite',model:'NANLINK WS-RC-C2 2.4GHz Remote Control',
    category:'Control',compatibleWith:NANLINK_RC_SHARED,compatibilityStatus:'Compatible',sourceUrl:SRC.rc
  },
  {
    id:'nanlite-ws-tb-1',manufacturer:'Nanlite',model:'NANLINK WS-TB-1 Transmitter Box',
    category:'Control',compatibleWith:NANLINK_TB_SHARED,compatibilityStatus:'Compatible',sourceUrl:SRC.tb
  },
  {
    id:'nanlite-rf-fmm-45-s',manufacturer:'Nanlite',model:'RF-FMM-45-S 45-Degree Mini Reflector',
    category:'Reflector',mount:'FM Mount',compatibleWith:MINI_REFLECTOR,
    compatibilityStatus:'Designed For',sourceUrl:SRC.rf45s
  },
  {
    id:'nanlite-rf-fmm-45',manufacturer:'Nanlite',model:'RF-FMM-45 45-Degree Reflector',
    category:'Reflector',mount:'FM Mount',compatibleWith:LARGE_REFLECTOR,
    compatibilityStatus:'Designed For',sourceUrl:SRC.rf45
  },
  {
    id:'nanlite-as-dd-fmm',manufacturer:'Nanlite',model:'AS-DD-FMM Diffusion Dome',
    category:'Dome',compatibleWith:['nanlite-rf-fmm-45'],compatibilityStatus:'Designed For',
    conditions:['Requires RF-FMM-45 Reflector'],sourceUrl:SRC.dome
  },
  ...DMX_FMM.map((target) => ({
    id:`nanlite-dmx-interface-note-${target.replace('nanlite-','')}`,
    manufacturer:'Nanlite',model:`DMX/RDM connection — ${target.replace('nanlite-','')}`,
    category:'Control',compatibleWith:[target],compatibilityStatus:'Designed For',
    conditions:['Fixture provides a locking DMX/RDM port; an external wired DMX controller/interface is required'],
    sourceUrl:NANLITE_FM_CURRENT_FIXTURES.find(f=>f.id===target).sourceUrl
  })),
  included('nanlite-ps-forza-60-ii','Power Adapter — Forza 60 II','Power','nanlite-forza-60-ii',SRC.forza60ii),
  included('nanlite-ps-forza-60b-ii','Power Adapter — Forza 60B II','Power','nanlite-forza-60b-ii',SRC.forza60bii),
  {
    id:'nanlite-ccsfz60ii',manufacturer:'Nanlite',model:'CCSFZ60II Padded Carrying Case',
    category:'Case',compatibleWith:['nanlite-forza-60-ii','nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-fs-60b','nanlite-fc-60b'],
    compatibilityStatus:'Designed For',includedWithFixtures:['nanlite-forza-60-ii','nanlite-forza-60b-ii','nanlite-forza-60c','nanlite-fs-60b','nanlite-fc-60b'],
    sourceUrl:SRC.case60
  },
  included('nanlite-ps-forza-60c','Power Adapter — Forza 60C','Power','nanlite-forza-60c',SRC.forza60c),
  included('nanlite-case-forza-60c','Padded Carrying Case — Forza 60C','Case','nanlite-forza-60c',SRC.forza60c),
  included('nanlite-ps-forza-60cr','15V/6A Power Adapter with V-Mount Plate — Forza 60CR','Power','nanlite-forza-60cr',SRC.forza60cr),
  included('nanlite-case-forza-60cr','Padded Carrying Case — Forza 60CR','Case','nanlite-forza-60cr',SRC.forza60cr),
  included('nanlite-ps-fc-60b','Power Adapter — FC-60B','Power','nanlite-fc-60b',SRC.fc60b),
  included('nanlite-case-fc-60b','Carry Case — FC-60B','Case','nanlite-fc-60b',SRC.fc60b),
  included('nanlite-ps-fc-120b','Power Supply — FC-120B','Power','nanlite-fc-120b',SRC.fc120b),
  included('nanlite-case-fc-120b','Carrying Case — FC-120B','Case','nanlite-fc-120b',SRC.fc120b),
  included('nanlite-ps-fc-120c','Power Supply — FC-120C','Power','nanlite-fc-120c',SRC.fc120c),
  included('nanlite-case-fc-120c','Carrying Case — FC-120C','Case','nanlite-fc-120c',SRC.fc120c)
];
