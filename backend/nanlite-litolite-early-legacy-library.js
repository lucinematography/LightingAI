// Nanlite early LitoLite legacy focusable lights.
// Official Nanlite US archival editorial sources only.
// Accessory compatibility is intentionally left empty where no model-specific first-party page was found.

const SRC={
  deeper:'https://nanliteus.com/blog/nanlite-litolite-a-deeper-look/',
  streaming:'https://nanliteus.com/blog/filming-by-yourself-at-home-lights-and-sound-for-streaming-content-creation-teaching-and-more/',
  currentShop:'https://nanliteus.com/shop/'
};

function localOnly(note){
  return {
    wired:[],wireless:[],builtInBluetooth:false,builtInCRMX:false,
    directLightingAI:[],externalInterfaceRequired:[],
    controlEvidenceIncomplete:false,
    unavailableDirectProtocols:[note,'No DMX, CRMX or documented app-control path was found in the first-party archival sources used for this audit']
  };
}

export const NANLITE_LITOLITE_EARLY_LEGACY_FIXTURES=[
  {
    id:'nanlite-litolite-8f',manufacturer:'Nanlite',model:'LitoLite 8F',
    family:'LitoLite',category:'Light',discontinued:true,lifecycleStatus:'legacy/archival',
    sourceType:'Focusable Daylight LED Light',cctK:{fixed:5600},colorMode:'Daylight',
    dimmingPercent:{min:0,max:100},beamAngleDeg:{min:10,max:60},
    control:localOnly('Archival first-party source documents local dimming/focus operation only'),
    sourceUrl:SRC.deeper
  },
  {
    id:'nanlite-litolite-28f',manufacturer:'Nanlite',model:'LitoLite 28F',
    family:'LitoLite',category:'Light',discontinued:true,lifecycleStatus:'legacy/archival',
    sourceType:'Focusable Daylight LED Light',cctK:{fixed:5600},colorMode:'Daylight',
    beamAngleDeg:{min:20,max:50},
    control:localOnly('Archival first-party source documents local focus operation only'),
    sourceUrl:SRC.deeper
  },
  {
    id:'nanlite-litolite-10fb',manufacturer:'Nanlite',model:'LitoLite 10FB',
    family:'LitoLite',category:'Light',discontinued:true,lifecycleStatus:'legacy/archival',
    sourceType:'Focusable Bi-Color LED Light',colorMode:'Bi-Color',
    dimmingPercent:{min:0,max:100},beamAngleDeg:{min:15,max:55},
    control:localOnly('Archival first-party source documents local dimming/focus operation only'),
    sourceUrl:SRC.deeper
  }
];

export const NANLITE_LITOLITE_EARLY_LEGACY_ACCESSORIES=[];
