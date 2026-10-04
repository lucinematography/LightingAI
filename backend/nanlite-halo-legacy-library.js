// Nanlite Halo legacy ring-light family.
// Official Nanlite US sources only. Out-of-stock/collection-only models are retained for catalog completeness.

const SRC={
  collection:'https://nanliteus.com/shop/by-collection/ring-lights/',
  h10:'https://es.nanliteus.com/anillo-de-luz-nanlite-halo-10b-dimeable-bicolor-usb-de-10-con-switch-tactil-inteligente/',
  h16:'https://nanliteus.com/nanlite-halo-16-bicolor-16in-led-ring-light-with-usb-power-passthrough-battery-kit-with-light-stand/',
  h16c:'https://nanliteus.com/nanlite-halo-16c-bicolor-and-tunable-rgb-16in-led-ring-light-with-usb-power-passthrough-kit/',
  h18:'https://nanliteus.com/nanlite-halo-18-dimmable-adjustable-bicolor-18in-led-ring-light-kit/',
  bracket:'https://nanliteus.com/nanlite-halo-series-ring-light-camera-bracket/',
  mirror:'https://nanliteus.com/nanlite-halo-series-ring-light-dual-sided-mirror-8in/'
};

function localOnly(){
  return {
    wired:[],wireless:[],builtInBluetooth:false,builtInCRMX:false,
    directLightingAI:[],externalInterfaceRequired:[],
    unavailableDirectProtocols:['No DMX or wireless control is documented for this Halo fixture']
  };
}
function w2Control(){
  return {
    wired:[],wireless:['2.4G','Wi-Fi via Nanlite W-2 adapter'],
    builtInBluetooth:false,builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:['Nanlite W-2 Wi-Fi adapter'],
    unavailableDirectProtocols:['No DMX control is documented','Nanlite 2.4G/W-2 protocol is not publicly documented for third-party direct control']
  };
}

export const NANLITE_HALO_LEGACY_FIXTURES=[
  {
    id:'nanlite-halo-10b',manufacturer:'Nanlite',model:'Halo 10B',
    family:'Halo',category:'Light',discontinued:true,lifecycleStatus:'legacy/out-of-stock',
    sourceType:'Bi-Color LED Ring Light',cctK:{min:2700,max:6500},colorMode:'Bi-Color',
    powerDrawW:9.6,cri:95,tlci:95,batteryPowered:false,
    powerOptions:['USB 5V','USB power bank'],mount:'5/8in receiver',
    control:localOnly(),sourceUrl:SRC.h10
  },
  {
    id:'nanlite-halo-14',manufacturer:'Nanlite',model:'Halo 14',
    family:'Halo',category:'Light',discontinued:true,lifecycleStatus:'legacy/collection-only',
    sourceType:'Bi-Color LED Ring Light',
    control:{...localOnly(),controlEvidenceIncomplete:true,evidenceNote:'Collection confirms the model; detailed first-party technical page was not available during this audit.'},
    sourceUrl:SRC.collection
  },
  {
    id:'nanlite-halo-14u',manufacturer:'Nanlite',model:'Halo 14U',
    family:'Halo',category:'Light',discontinued:true,lifecycleStatus:'legacy/collection-only',
    sourceType:'Bi-Color LED Ring Light with Built-In Li-Ion Battery',
    batteryPowered:true,
    control:{...localOnly(),controlEvidenceIncomplete:true,evidenceNote:'Collection/accessory pages confirm the model; detailed first-party technical page was not available during this audit.'},
    sourceUrl:SRC.collection
  },
  {
    id:'nanlite-halo-16',manufacturer:'Nanlite',model:'Halo 16',
    family:'Halo',category:'Light',discontinued:true,lifecycleStatus:'legacy/out-of-stock',
    sourceType:'Bi-Color LED Ring Light',cctK:{min:3200,max:5600},colorMode:'Bi-Color',
    powerDrawW:29,cri:95,tlci:93,batteryPowered:true,
    powerOptions:['AC adapter','Sony NP-F750 / NP-F970','CB-DT-DC D-Tap cable'],
    mount:'5/8in receiver',control:w2Control(),sourceUrl:SRC.h16
  },
  {
    id:'nanlite-halo-16c',manufacturer:'Nanlite',model:'Halo 16C',
    family:'Halo',category:'Light',discontinued:true,lifecycleStatus:'legacy/out-of-stock',
    sourceType:'Bi-Color + RGB LED Ring Light',cctK:{min:2700,max:6500},colorMode:'Bi-Color + RGB',
    powerDrawW:31,cri:95,tlci:93,batteryPowered:false,
    powerOptions:['DC 15V AC adapter','CB-DT-DC D-Tap cable'],
    mount:'5/8in receiver',control:w2Control(),sourceUrl:SRC.h16c
  },
  {
    id:'nanlite-halo-18',manufacturer:'Nanlite',model:'Halo 18',
    family:'Halo',category:'Light',discontinued:true,lifecycleStatus:'legacy/out-of-stock',
    sourceType:'Bi-Color LED Ring Light',cctK:{min:2700,max:6500},colorMode:'Bi-Color',
    powerDrawW:48,cri:95,tlci:93,batteryPowered:false,powerMode:'AC only',
    mount:'5/8in receiver',control:localOnly(),sourceUrl:SRC.h18
  }
];

const ALL=['nanlite-halo-10b','nanlite-halo-14','nanlite-halo-14u','nanlite-halo-16','nanlite-halo-16c','nanlite-halo-18'];

export const NANLITE_HALO_LEGACY_ACCESSORIES=[
  {
    id:'nanlite-as-bracket-c',manufacturer:'Nanlite',model:'AS-BRACKET-C Halo Series Camera Bracket',
    category:'Mount',compatibleWith:ALL,compatibilityStatus:'Designed For',sourceUrl:SRC.bracket
  },
  {
    id:'nanlite-as-mirror-8',manufacturer:'Nanlite',model:'AS-MIRROR-8 Halo Series Dual-Sided Mirror 8in',
    category:'Other',compatibleWith:['nanlite-halo-16','nanlite-halo-16c','nanlite-halo-18'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.mirror
  },
  {
    id:'nanlite-halo-10b-case',manufacturer:'Nanlite',model:'Halo 10B Carry Case',
    category:'Case',compatibleWith:['nanlite-halo-10b'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC.h10
  },
  {
    id:'nanlite-halo-16-case',manufacturer:'Nanlite',model:'Halo 16 Carry Case',
    category:'Case',compatibleWith:['nanlite-halo-16'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC.h16
  },
  {
    id:'nanlite-halo-16c-case',manufacturer:'Nanlite',model:'Halo 16C Carry Case',
    category:'Case',compatibleWith:['nanlite-halo-16c'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC.h16c
  },
  {
    id:'nanlite-halo-18-case',manufacturer:'Nanlite',model:'Halo 18 Carry Case',
    category:'Case',compatibleWith:['nanlite-halo-18'],compatibilityStatus:'Designed For',
    includedWithFixture:true,sourceUrl:SRC.h18
  }
];
