// Nanlite first-generation Forza 60 / 60B legacy family.
// Official Nanlite US sources only. Compatibility is conservative and explicit.

const SRC={
  generation:'https://nanliteus.com/blogs/learn/the-nanlite-forza-60-ii-and-60b-ii-new-upgrades-make-a-big-difference',
  forza60bLaunch:'https://nanliteus.com/blog/nanlite-announces-the-new-forza-60b-and-forza-200/',
  forza60bBluetooth:'https://nanliteus.com/blog/directly-control-the-forza-60b-with-the-nanlink-mobile-app-with-new-firmware/',
  nanlink:'https://nanliteus.com/blogs/learn/the-impressively-powerful-nanlink-mobile-app-is-here',
  modifiers:'https://nanliteus.com/blogs/learn/light-modifiers-and-other-accessories-for-the-nanlite-forza-60-and-60b',
  powerAdapter:'https://nanliteus.com/nanlite-forza-60-power-adapter-15v-6a/'
};

const proprietaryProtocolNote='NANLINK Bluetooth/2.4G protocol is not publicly documented for third-party direct control';

export const NANLITE_FORZA_60_LEGACY_FIXTURES=[
  {
    id:'nanlite-forza-60',manufacturer:'Nanlite',model:'Forza 60',
    family:'Forza',category:'Light',discontinued:true,lifecycleStatus:'legacy',
    sourceType:'Daylight LED Spotlight',mount:'FM Mount',
    cctK:{fixed:5600},colorMode:'Daylight',
    batteryPowered:true,
    powerOptions:['AC power adapter','NP-F batteries via battery handgrip','V-Mount battery via battery handgrip'],
    control:{
      wired:[],
      wireless:['2.4G via NANLINK WS-TB-1'],
      builtInBluetooth:false,builtInCRMX:false,
      directLightingAI:[],
      externalInterfaceRequired:['NANLINK WS-TB-1 for NANLINK app control'],
      unavailableDirectProtocols:[proprietaryProtocolNote],
      controlEvidenceNote:'Nanlite explicitly states that the original Forza 60 did not have built-in Bluetooth. Nanlite separately documents app control of Forza 60 through WS-TB-1.'
    },
    sourceUrl:SRC.generation,
    evidenceSources:[SRC.generation,SRC.nanlink,SRC.modifiers,SRC.powerAdapter]
  },
  {
    id:'nanlite-forza-60b',manufacturer:'Nanlite',model:'Forza 60B',
    family:'Forza',category:'Light',discontinued:true,lifecycleStatus:'legacy',
    sourceType:'Bi-Color LED Spotlight',mount:'FM Mount',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',cri:96,tlci:98,
    batteryPowered:true,
    powerOptions:['AC power adapter','NP-F batteries via battery handgrip','V-Mount battery via battery handgrip'],
    control:{
      wired:[],
      wireless:['Bluetooth / NANLINK app'],
      builtInBluetooth:true,builtInCRMX:false,
      bluetoothRequiresFirmware:'V1.00.17 or later',
      directLightingAI:[],
      externalInterfaceRequired:[],
      unavailableDirectProtocols:[proprietaryProtocolNote],
      controlEvidenceNote:'Official Nanlite firmware instructions confirm direct NANLINK Bluetooth control after updating the original Forza 60B to firmware V1.00.17.'
    },
    sourceUrl:SRC.forza60bLaunch,
    evidenceSources:[SRC.forza60bLaunch,SRC.forza60bBluetooth,SRC.modifiers,SRC.powerAdapter]
  }
];

export const NANLITE_FORZA_60_LEGACY_ACCESSORIES=[];
