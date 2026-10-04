// Nanlite first-generation Bowens-mount Forza family.
// Official Nanlite US sources only. Data is intentionally conservative: do not infer undocumented control protocols.

const SRC={
  f200:'https://nanliteus.com/blog/nanlite-announces-the-new-forza-60b-and-forza-200/',
  f300family:'https://nanliteus.com/blogs/learn/the-nanlite-forza-300-ii-and-300b-ii-lots-of-changes-ever-more-appealing',
  f500:'https://nanliteus.com/blogs/learn/the-nanlite-forza-500-ii-and-500b-ii-uniquely-bright-and-compact',
  legacyCollection:'https://nanliteus.com/shop/by-collection/monolight-style/forza-500-300-200/',
  head25:'https://nanliteus.com/nanlite-forza-300-and-forza-500-head-connection-cable-8-2ft/',
  head5:'https://nanliteus.com/nanlite-forza-300-500-head-extension-cable-16-4ft/',
  pa300:'https://nanliteus.com/nanlite-power-adapter-for-forza-300/',
  wsTb:'https://nanliteus.com/products/nanlink-ws-tb-1-transmitter-box'
};

const proprietary='NANLINK 2.4G control protocol is not publicly documented for third-party direct control';

export const NANLITE_FORZA_BOWENS_LEGACY_FIXTURES=[
  {
    id:'nanlite-forza-200',manufacturer:'Nanlite',model:'Forza 200',
    family:'Forza',category:'Light',discontinued:true,lifecycleStatus:'legacy',
    sourceType:'Daylight LED Spotlight',mount:'Bowens',
    cctK:{fixed:5600},colorMode:'Daylight',powerDrawW:200,cri:98,tlci:97,
    batteryPowered:true,
    batteryOptions:['14.4V-14.8V / 12A V-Mount battery','26V / 12A V-Mount battery'],
    sourceUrl:SRC.f200
  },
  {
    id:'nanlite-forza-300',manufacturer:'Nanlite',model:'Forza 300',
    family:'Forza',category:'Light',discontinued:true,lifecycleStatus:'legacy',
    sourceType:'Daylight LED Spotlight',mount:'Bowens',
    cctK:{fixed:5600},colorMode:'Daylight',batteryPowered:true,
    batteryOptions:['Two 14.8V V-Mount batteries via legacy Control Unit','AC via removable power adapter'],
    control:{
      wired:[],wireless:[],builtInBluetooth:false,builtInCRMX:false,
      directLightingAI:[],externalInterfaceRequired:[],
      unavailableDirectProtocols:[proprietary],
      controlEvidenceNote:'Nanlite explicitly states that the first-generation Forza 300 did not have built-in Bluetooth. No DMX/RDM claim is inferred here.'
    },
    sourceUrl:SRC.f300family
  },
  {
    id:'nanlite-forza-300b',manufacturer:'Nanlite',model:'Forza 300B',
    family:'Forza',category:'Light',discontinued:true,lifecycleStatus:'legacy',
    sourceType:'Bi-Color LED Spotlight',mount:'Bowens',
    colorMode:'Bi-Color',batteryPowered:true,
    batteryOptions:['Two 14.8V V-Mount batteries via legacy Control Unit','AC via removable power supply'],
    sourceUrl:SRC.legacyCollection,
    evidenceSources:[SRC.f300family,SRC.legacyCollection]
  },
  {
    id:'nanlite-forza-500',manufacturer:'Nanlite',model:'Forza 500',
    family:'Forza',category:'Light',discontinued:true,lifecycleStatus:'legacy',
    sourceType:'Daylight LED Spotlight',mount:'Bowens',
    cctK:{fixed:5600},colorMode:'Daylight',batteryPowered:true,
    control:{
      wired:[],wireless:['2.4G via NANLINK WS-TB-1'],builtInCRMX:false,
      directLightingAI:[],
      externalInterfaceRequired:['NANLINK WS-TB-1 for NANLINK app control'],
      unavailableDirectProtocols:[proprietary],
      controlEvidenceNote:'Nanlite WS-TB-1 documentation explicitly names the first-generation Forza 500 as a compatible 2.4G fixture. No DMX/RDM claim is inferred here.'
    },
    sourceUrl:SRC.f500,
    evidenceSources:[SRC.f500,SRC.wsTb]
  }
];

const LEGACY_BOWENS=['nanlite-forza-200','nanlite-forza-300','nanlite-forza-300b','nanlite-forza-500'];

export const NANLITE_FORZA_BOWENS_LEGACY_ACCESSORIES=[
  {
    id:'nanlite-cb-fz-2-5',manufacturer:'Nanlite',model:'CB-FZ-2.5 Head Cable 2.5 m / 8.2 ft',
    category:'Cable',compatibleWith:LEGACY_BOWENS,compatibilityStatus:'Designed For',
    includedWithFixtures:LEGACY_BOWENS,lengthM:2.5,sourceUrl:SRC.head25
  },
  {
    id:'nanlite-cb-fz-5m-legacy',manufacturer:'Nanlite',model:'Forza 200/300/300B/500 Head Extension Cable 5 m / 16.4 ft',
    category:'Cable',compatibleWith:LEGACY_BOWENS,compatibilityStatus:'Designed For',
    lengthM:5,sourceUrl:SRC.head5
  },
  {
    id:'nanlite-pa-48v84a-fz300',manufacturer:'Nanlite',model:'PA-48V84A-FZ300 Power Adapter',
    category:'Power',compatibleWith:['nanlite-forza-300'],compatibilityStatus:'Designed For',
    input:'100-240 VAC, 50/60 Hz',builtInVMountPlate:true,sourceUrl:SRC.pa300
  }
];
