// Nanlite TK Series legacy panels.
// Official Nanlite FAQ is the controlling source for the preserved control relationship.
// Detailed optical/power specifications are intentionally omitted where a first-party product page
// could not be recovered during this audit.

const SRC={
  faq:'https://nanliteus.com/pages/faq'
};

function tkControl(){
  return {
    wired:[],
    wireless:['2.4G via NANLINK WS-TB-1'],
    builtInBluetooth:false,builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:['NANLINK WS-TB-1 Transmitter Box'],
    controlEvidenceIncomplete:true,
    evidenceNote:'Nanlite FAQ explicitly lists TK-140B/280B/200/450 among fixtures that require WS-TB-1 for grouping over 2.4G. No DMX or Bluetooth claim is made here without a recoverable first-party product/manual source.',
    unavailableDirectProtocols:['No DMX/CRMX path is asserted','Nanlite 2.4G protocol is not publicly documented for third-party direct control']
  };
}

function fixture(id,model){
  return {
    id,manufacturer:'Nanlite',model,family:'TK Series',category:'Light',
    discontinued:true,lifecycleStatus:'legacy/archival',
    sourceType:'LED Panel',
    control:tkControl(),
    sourceUrl:SRC.faq
  };
}

export const NANLITE_TK_LEGACY_FIXTURES=[
  fixture('nanlite-tk-140b','TK-140B'),
  fixture('nanlite-tk-280b','TK-280B'),
  fixture('nanlite-tk-200','TK-200'),
  fixture('nanlite-tk-450','TK-450')
];

export const NANLITE_TK_LEGACY_ACCESSORIES=[];
