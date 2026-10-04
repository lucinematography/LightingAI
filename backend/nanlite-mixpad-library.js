// Nanlite MixPad family.
// Official Nanlite US sources only.
// MixPad 27 has a detailed first-party product page.
// MixPad II 11C is retained conservatively because the current collection confirms the model
// but an equally detailed current first-party product page was not available during this audit.

const SRC={
  collection:'https://nanliteus.com/shop/by-collection/light-panels/mixpad/',
  mp27:'https://nanliteus.com/nanlite-mixpad-27-adjustable-bicolor-tunable-rgb-dimmable-hard-and-soft-light-ac-battery-powered-led-panel/',
  guide:'https://nanliteus.com/blog/nanlite-mixpad-11-and-mixpad-27-a-deeper-look/'
};

export const NANLITE_MIXPAD_FIXTURES=[
  {
    id:'nanlite-mixpad-27',manufacturer:'Nanlite',model:'MixPad 27',
    family:'MixPad',category:'Light',discontinued:true,lifecycleStatus:'legacy/collection-only',
    lifecycleEvidenceUrl:SRC.collection,
    sourceType:'Hard / Soft RGB LED Panel',cctK:{min:3200,max:5600},
    colorMode:'Bi-Color + RGB',powerDrawW:27,cri:95,tlci:93,
    batteryPowered:true,
    powerOptions:['Included AC adapter','2x Sony NP-F550/750/970','CB-DT-DC D-Tap cable'],
    mount:'5/8in receiver',
    control:{
      wired:[],
      wireless:['2.4G','Wi-Fi via Nanlite W-2 adapter'],
      builtInBluetooth:false,builtInCRMX:false,
      directLightingAI:[],
      externalInterfaceRequired:['Nanlite W-2 Wi-Fi adapter for app control'],
      unavailableDirectProtocols:['No DMX control is documented','Nanlite 2.4G/W-2 protocol is not publicly documented for third-party direct control']
    },
    sourceUrl:SRC.mp27
  },
  {
    id:'nanlite-mixpad-ii-11c',manufacturer:'Nanlite',model:'MixPad II 11C',
    family:'MixPad',category:'Light',discontinued:true,lifecycleStatus:'legacy/collection-only',
    lifecycleEvidenceUrl:SRC.collection,
    sourceType:'RGBWW Hard / Soft LED Panel',
    control:{
      wired:[],wireless:[],builtInBluetooth:false,builtInCRMX:false,
      directLightingAI:[],externalInterfaceRequired:[],
      controlEvidenceIncomplete:true,
      evidenceNote:'Current collection confirms the model, but a detailed current first-party product page was not available during this audit. Remote-control and power relationships are intentionally not inferred.'
    },
    sourceUrl:SRC.collection
  }
];

export const NANLITE_MIXPAD_ACCESSORIES=[
  {
    id:'nanlite-rc-1-mixpad27',manufacturer:'Nanlite',model:'RC-1 2.4G Remote Control — MixPad 27',
    category:'Control',compatibleWith:['nanlite-mixpad-27'],
    compatibilityStatus:'Compatible',sourceUrl:SRC.mp27
  },
  {
    id:'nanlite-mixpad-27-ac-adapter',manufacturer:'Nanlite',model:'MixPad 27 AC Adapter with Light-Stand Mount',
    category:'Power',compatibleWith:['nanlite-mixpad-27'],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl:SRC.mp27
  }
];
