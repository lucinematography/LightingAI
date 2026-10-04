// Nanlite current creator handheld/pocket family: wand + pico.
// Official Nanlite US sources only.

const SRC={
  wand:'https://nanliteus.com/products/full-color-wand-led-light-mint-blue',
  pico:'https://nanliteus.com/products/pico-led-mini-pocket-light-mint-blue',
  picoGrid:'https://nanliteus.com/products/magnetic-eggcrate-for-pico'
};

function bluetoothOnly(){
  return {
    wired:[],
    wireless:['Bluetooth / NANLINK app'],
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'No DMX/RDM, 2.4G or CRMX control is listed for these creator lights',
      'NANLINK Bluetooth protocol is not publicly documented for third-party direct control'
    ]
  };
}

export const NANLITE_CREATOR_HANDHELD_FIXTURES=[
  {
    id:'nanlite-wand',manufacturer:'Nanlite',model:'wand Full-Color Handheld LED Light',
    family:'Creator Lights',category:'Light',discontinued:false,
    sourceType:'RGBW Handheld LED Light',cctK:{min:2700,max:7500},colorMode:'RGBW',
    beamAngleDeg:45,powerDrawW:30,cri:95,tlci:93,batteryPowered:true,
    powerOptions:['7.4V NP-F battery','USB-C PD 3.0 adapter','USB-C PD power bank'],
    mount:'1/4-20',control:bluetoothOnly(),sourceUrl:SRC.wand
  },
  {
    id:'nanlite-pico',manufacturer:'Nanlite',model:'pico LED Mini Pocket Light',
    family:'Creator Lights',category:'Light',discontinued:false,
    sourceType:'RGBW Pocket LED Light',cctK:{min:2700,max:7500},colorMode:'RGBW',
    beamAngleDeg:45,powerDrawW:4,cri:95,tlci:95,batteryPowered:true,batteryMah:1500,
    powerOptions:['Built-in 3.7V 1500mAh battery','USB-C 5V/2A','USB power bank'],
    mount:'Magnetic base + 1/4-20',control:bluetoothOnly(),sourceUrl:SRC.pico
  }
];

function included(id,model,category,target,sourceUrl,extra={}){
  return {id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl,...extra};
}

export const NANLITE_CREATOR_HANDHELD_ACCESSORIES=[
  included('nanlite-wand-barndoors','wand Removable Barndoors','Barndoors','nanlite-wand',SRC.wand),
  included('nanlite-wand-diffuser','wand Removable Diffuser','Diffusion','nanlite-wand',SRC.wand),
  included('nanlite-wand-case','wand Carrying Bag','Case','nanlite-wand',SRC.wand),

  included('nanlite-pico-magnetic-diffuser','pico Magnetic Diffuser','Diffusion','nanlite-pico',SRC.pico),
  included('nanlite-pico-cold-shoe-adapter','pico Cold Shoe Adapter with 1/4-20 Mount','Mount','nanlite-pico',SRC.pico),
  {
    id:'nanlite-ec-pico',manufacturer:'Nanlite',model:'EC-PICO Magnetic Eggcrate',
    category:'Grid',compatibleWith:['nanlite-pico'],compatibilityStatus:'Designed For',
    beamAngleDeg:27,sourceUrl:SRC.picoGrid
  }
];
