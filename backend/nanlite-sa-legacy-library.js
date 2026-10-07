// Nanlite SA Series legacy panels.
// Official Nanlite US archival sources only.
// Control compatibility is model-scoped; no family-wide wireless inference is made without direct evidence.

const SRC={
  series:'https://nanliteus.com/blog/nanlite-sa-series-a-deeper-look/',
  collection:'https://nanliteus.com/sa-series/',
  sb600:'https://nanliteus.com/nanlite-softbox-for-600sa-bsa-dsa-led-panels/',
  sbSeries:'https://nanliteus.com/shop/by-product/light-modifiers/sa-series/',
  csa600:'https://nanliteus.com/nanlite-600sa-5600k-led-panel/',
  csa1200:'https://nanliteus.com/nanlite-1200csa-bicolor-led-panel/'
};

function baseControl(){
  return {wired:[],wireless:[],builtInBluetooth:false,builtInCRMX:false,directLightingAI:[],externalInterfaceRequired:[]};
}
function localOnly(){
  return {...baseControl(),unavailableDirectProtocols:['No DMX control is documented for this SA/CSA fixture']};
}
function legacy24g(){
  return {
    ...baseControl(),
    wireless:['2.4G','Wi-Fi via Nanlite W-2 adapter'],
    externalInterfaceRequired:['Nanlite W-2 Wi-Fi adapter for app control'],
    unavailableDirectProtocols:['No DMX control is documented','Nanlite 2.4G/W-2 protocol is not publicly documented for third-party direct control']
  };
}
function dmxControl(){
  return {
    ...baseControl(),
    wired:['DMX512'],
    externalInterfaceRequired:['Wired DMX interface for DMX512 control']
  };
}
function fixture(id,model,size,cct,colorMode,dmx,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,family:'SA Series',category:'Light',
    discontinued:true,lifecycleStatus:'legacy/archival',
    sourceType:'LED Panel',panelClass:size,colorMode,
    cctK:cct,cri:95,tlci:93,dimmingPercent:{min:0,max:100},
    mount:'5/8in receiver',batteryPowered:true,
    powerOptions:['12-16.8V DC','100-240V AC','14.8V Sony V-Mount battery'],
    control:dmx?dmxControl():localOnly(),sourceUrl,...extra
  };
}

export const NANLITE_SA_LEGACY_FIXTURES=[
  fixture('nanlite-600sa','600SA','600',{fixed:5600},'Daylight',false,SRC.series),
  fixture('nanlite-600csa','600CSA','600',{min:3200,max:5600},'Bi-Color',false,SRC.csa600,{control:legacy24g()}),
  fixture('nanlite-600dsa','600DSA','600',{fixed:5600},'Daylight',true,SRC.series),

  fixture('nanlite-900sa','900SA','900',{fixed:5600},'Daylight',false,SRC.series),
  fixture('nanlite-900csa','900CSA','900',{min:3200,max:5600},'Bi-Color',false,SRC.series),
  fixture('nanlite-900dsa','900DSA','900',{fixed:5600},'Daylight',true,SRC.series),

  fixture('nanlite-1200sa','1200SA','1200',{fixed:5600},'Daylight',false,SRC.series),
  fixture('nanlite-1200csa','1200CSA','1200',{min:3200,max:5600},'Bi-Color',false,SRC.csa1200,{control:legacy24g()}),
  fixture('nanlite-1200dsa','1200DSA','1200',{fixed:5600},'Daylight',true,SRC.series)
];

const S600=['nanlite-600sa','nanlite-600csa','nanlite-600dsa'];
const S900=['nanlite-900sa','nanlite-900csa','nanlite-900dsa'];
const S1200=['nanlite-1200sa','nanlite-1200csa','nanlite-1200dsa'];

export const NANLITE_SA_LEGACY_ACCESSORIES=[
  {
    id:'nanlite-sb-600sa',manufacturer:'Nanlite',model:'SB-600SA Softbox',
    category:'Softbox',compatibleWith:S600,compatibilityStatus:'Designed For',
    conditions:['Attaches over the fixture barndoors'],sourceUrl:SRC.sb600
  },
  {
    id:'nanlite-sb-900sa',manufacturer:'Nanlite',model:'SB-900SA Softbox',
    category:'Softbox',compatibleWith:S900,compatibilityStatus:'Designed For',
    conditions:['Size-specific SA-Series softbox'],sourceUrl:SRC.sbSeries
  },
  {
    id:'nanlite-sb-1200sa',manufacturer:'Nanlite',model:'SB-1200SA Softbox',
    category:'Softbox',compatibleWith:S1200,compatibilityStatus:'Designed For',
    conditions:['Size-specific SA-Series softbox'],sourceUrl:SRC.sbSeries
  }
];
