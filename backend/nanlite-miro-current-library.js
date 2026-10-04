// Nanlite current miro creator-panel family.
// Official Nanlite US sources only.

const SRC={
  m30:'https://nanliteus.com/products/miro-30c-led-full-color-round-panel-light-mint-blue',
  m60:'https://nanliteus.com/products/miro-60c-led-full-color-round-panel-light-midnight-blue',
  guide:'https://nanliteus.com/blogs/learn/the-new-nanlite-miro-60c-30c-round-led-panel-lights'
};

function control(){
  return {
    wired:[],
    wireless:['Bluetooth / NANLINK app'],
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'No DMX/RDM or 2.4G control is listed for miro 30c/60c',
      'NANLINK Bluetooth protocol is not publicly documented for third-party direct control'
    ]
  };
}
function fixture(id,model,powerDrawW,npfCount,sourceUrl){
  return {
    id,manufacturer:'Nanlite',model,family:'miro',category:'Light',discontinued:false,
    sourceType:'RGBW Round LED Panel',cctK:{min:2700,max:7500},colorMode:'RGBW',
    beamAngleDeg:45,powerDrawW,cri:95,tlci:93,
    batteryPowered:true,
    powerOptions:[
      npfCount===2?'2x 7.4V NP-F batteries':'1x 7.4V NP-F battery',
      'USB-C PD 3.0 adapter','USB-C PD power bank'
    ],
    control:control(),sourceUrl
  };
}

export const NANLITE_MIRO_CURRENT_FIXTURES=[
  fixture('nanlite-miro-30c','miro 30c',30,1,SRC.m30),
  fixture('nanlite-miro-60c','miro 60c',60,2,SRC.m60)
];

const BOTH=['nanlite-miro-30c','nanlite-miro-60c'];

function included(id,model,category,target,sourceUrl){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl
  };
}

export const NANLITE_MIRO_CURRENT_ACCESSORIES=[
  {
    id:'nanlite-bt-npf750-miro',manufacturer:'Nanlite',model:'BT-NPF750 NP-F Battery',
    category:'Battery',compatibleWith:[...BOTH,'nanlite-wand'],compatibilityStatus:'Compatible',sourceUrl:SRC.guide
  },
  {
    id:'nanlite-bt-npf970-miro',manufacturer:'Nanlite',model:'BT-NPF970 NP-F Battery',
    category:'Battery',compatibleWith:[...BOTH,'nanlite-wand'],compatibilityStatus:'Compatible',sourceUrl:SRC.guide
  },
  {
    id:'nanlite-bt-cg-npf-2',manufacturer:'Nanlite',model:'BT-CG-NPF-2 Dual-Slot NP-F Battery Charger',
    category:'Power',compatibleWith:BOTH,compatibilityStatus:'Compatible',sourceUrl:SRC.guide
  },
  {
    id:'nanlite-as-pbh-npf',manufacturer:'Nanlite',model:'AS-PBH-NPF Power Bank Holder for NP-F Mount',
    category:'Mount',compatibleWith:BOTH,compatibilityStatus:'Designed For',
    conditions:['Secures a USB-C PD power bank to the fixture body'],sourceUrl:SRC.guide
  },

  included('nanlite-miro-30c-diffuser','miro 30c Magnetic Diffuser','Diffusion','nanlite-miro-30c',SRC.m30),
  included('nanlite-miro-30c-baby-receiver','miro 30c 5/8in Baby Receiver with 1/4-20 Thread','Mount','nanlite-miro-30c',SRC.m30),
  included('nanlite-miro-30c-usbc-cable','miro 30c USB-C Cable','Cable','nanlite-miro-30c',SRC.m30),
  included('nanlite-miro-30c-case','miro 30c Carrying Bag','Case','nanlite-miro-30c',SRC.m30),

  included('nanlite-miro-60c-diffuser','miro 60c Magnetic Diffuser','Diffusion','nanlite-miro-60c',SRC.m60),
  included('nanlite-miro-60c-baby-receiver','miro 60c 5/8in Baby Receiver with 1/4-20 Thread','Mount','nanlite-miro-60c',SRC.m60),
  included('nanlite-miro-60c-usbc-cable','miro 60c USB-C Cable','Cable','nanlite-miro-60c',SRC.m60),
  included('nanlite-miro-60c-case','miro 60c Carrying Bag','Case','nanlite-miro-60c',SRC.m60)
];
