// Nanlite current Alien RGBWW panel family.
// Official Nanlite US sources only. Shared NANLINK/clamp accessories live in canonical records.

const SRC={
  alien150:'https://nanliteus.com/products/alien-150c-rgbww-led-panel-light-with-crmx',
  alien300:'https://nanliteus.com/products/alien-300c-rgbww-led-panel-light-with-crmx',
  bd150:'https://nanliteus.com/products/barndoors-for-alien-150c',
  bd300:'https://nanliteus.com/products/barndoors-for-alien-300c',
  collection:'https://nanliteus.com/collections/alien-accessories'
};

function control(){
  return {
    wired:['DMX512','RDM'],
    wireless:['LumenRadio CRMX','Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,
    builtInCRMX:true,
    dmxConnection:'Locking metal DMX/RDM port',
    directLightingAI:[],
    externalInterfaceRequired:[
      'Wired DMX interface for DMX512 control',
      'CRMX transmitter for CRMX control'
    ],
    unavailableDirectProtocols:[
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}

function fixture(id,model,powerDrawW,sourceUrl,batteryOptions,externalDc){
  return {
    id,manufacturer:'Nanlite',model,family:'Alien',category:'Light',discontinued:false,
    sourceType:'RGBWW LED Panel',cctK:{min:2700,max:12000},colorMode:'RGBWW',
    cri:96,tlci:97,powerDrawW,weatherResistance:'Head IP55 / Control Unit IP20',
    beamAngleDeg:60,batteryPowered:true,batteryOptions,externalDc,
    control:control(),sourceUrl
  };
}

export const NANLITE_ALIEN_CURRENT_FIXTURES=[
  fixture(
    'nanlite-alien-150c','Alien 150C',175,SRC.alien150,
    ['1x 14.4-14.8V V-Mount at full output','1x 26-28V V-Mount at full output','AC mains'],
    '24V external DC'
  ),
  fixture(
    'nanlite-alien-300c','Alien 300C',350,SRC.alien300,
    ['1x 14.4-14.8V V-Mount up to 45% output','1x 26-28V V-Mount up to 75% output','2x V-Mount for full output','AC mains'],
    '48V external DC'
  )
];

function included(id,model,category,target,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl,...extra
  };
}

export const NANLITE_ALIEN_CURRENT_ACCESSORIES=[
  {
    id:'nanlite-bd-al150',manufacturer:'Nanlite',model:'BD-AL150 Barndoors for Alien 150C',
    category:'Barndoors',compatibleWith:['nanlite-alien-150c'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.bd150
  },
  {
    id:'nanlite-bd-al300',manufacturer:'Nanlite',model:'BD-AL300 Barndoors for Alien 300C',
    category:'Barndoors',compatibleWith:['nanlite-alien-300c'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.bd300
  },

  included('nanlite-alien-150c-control-unit','Alien 150C Control Unit with V-Mount Plate','Power','nanlite-alien-150c',SRC.alien150),
  included('nanlite-alien-150c-dc-cable','Alien 150C DC Connection Cable 3 m','Cable','nanlite-alien-150c',SRC.alien150),
  included('nanlite-alien-150c-ac-cable','Alien 150C AC Power Cable 6 m','Cable','nanlite-alien-150c',SRC.alien150),
  included('nanlite-alien-150c-softbox','Alien 150C Pop-Up Softbox','Softbox','nanlite-alien-150c',SRC.alien150),
  included('nanlite-alien-150c-diffusers','Alien 150C 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-alien-150c',SRC.alien150),
  included('nanlite-alien-150c-grid','Alien 150C Eggcrate Grid','Grid','nanlite-alien-150c',SRC.alien150),
  included('nanlite-alien-150c-rain-cover','Alien 150C Control Unit / Battery Rain Cover','Other','nanlite-alien-150c',SRC.alien150),
  included('nanlite-alien-150c-case','Alien 150C Padded Carrying Case','Case','nanlite-alien-150c',SRC.alien150),

  included('nanlite-alien-300c-control-unit','Alien 300C Control Unit with Dual V-Mount Plates','Power','nanlite-alien-300c',SRC.alien300),
  included('nanlite-alien-300c-dc-cable','Alien 300C DC Connection Cable 3 m','Cable','nanlite-alien-300c',SRC.alien300),
  included('nanlite-alien-300c-ac-cable','Alien 300C AC Power Cable 6 m','Cable','nanlite-alien-300c',SRC.alien300),
  included('nanlite-alien-300c-softbox','Alien 300C Pop-Up Softbox','Softbox','nanlite-alien-300c',SRC.alien300),
  included('nanlite-alien-300c-diffusers','Alien 300C 1.5/2.5-Stop Diffuser Set','Diffusion','nanlite-alien-300c',SRC.alien300),
  included('nanlite-alien-300c-grid','Alien 300C Eggcrate Grid','Grid','nanlite-alien-300c',SRC.alien300),
  included('nanlite-alien-300c-rain-cover','Alien 300C Control Unit / Battery Rain Cover','Other','nanlite-alien-300c',SRC.alien300),
  included('nanlite-alien-300c-case','Alien 300C Padded Carrying Case','Case','nanlite-alien-300c',SRC.alien300)
];
