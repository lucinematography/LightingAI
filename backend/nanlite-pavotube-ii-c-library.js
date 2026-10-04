// Nanlite current PavoTube II C family.
// Official Nanlite US sources only. Current status is based on the 2026 PavoTube II C shop collection.

const SRC={
  c15:'https://nanliteus.com/products/pavotube-ii-15c-2-foot-rgbww-led-tube-light',
  c30:'https://nanliteus.com/products/pavotube-ii-30c-4-foot-rgbww-led-tube-light',
  collection:'https://nanliteus.com/collections/pavotube-ii-c',
  accessories:'https://nanliteus.com/collections/pavotube-ii-15c-30c-accessories'
};

function control(){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth / NANLINK app','2.4G'],
    builtInBluetooth:true,
    builtInCRMX:false,
    dmxConnection:'Locking 3.5mm DMX/RDM port',
    directLightingAI:[],
    externalInterfaceRequired:['CB-DMX-3.5C-1/2 adapter cable plus wired DMX interface'],
    unavailableDirectProtocols:[
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}

function fixture(id,model,lengthLabel,powerDrawW,batteryMah,sourceUrl){
  return {
    id,manufacturer:'Nanlite',model,family:'PavoTube II C',category:'Light',discontinued:false,
    sourceType:'RGBWW LED Tube',formFactor:lengthLabel,cctK:{min:2700,max:7500},
    colorMode:'RGBWW',powerDrawW,builtInBattery:true,batteryMah,cri:97,tlci:98,
    powerOptions:['Internal battery','AC adapter','USB-C PD 3.0','External D-Tap battery via CB-DT/DC cable'],
    control:control(),sourceUrl
  };
}

export const NANLITE_PAVOTUBE_II_C_FIXTURES=[
  fixture('nanlite-pavotube-ii-15c','PavoTube II 15C','2-foot T12 tube',30,2200,SRC.c15),
  fixture('nanlite-pavotube-ii-30c','PavoTube II 30C','4-foot T12 tube',60,4400,SRC.c30)
];

const BOTH=['nanlite-pavotube-ii-15c','nanlite-pavotube-ii-30c'];

function included(id,model,category,target,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl,...extra
  };
}

export const NANLITE_PAVOTUBE_II_C_ACCESSORIES=[
  {
    id:'nanlite-cb-dmx-3-5c-1-2',manufacturer:'Nanlite',model:'CB-DMX-3.5C-1/2 DMX Adapter Cable with Locking 3.5mm Connector',
    category:'Control',compatibleWith:[...BOTH,'nanlite-pavoslim-360c'],compatibilityStatus:'Designed For',
    conditions:['Required for wired DMX/RDM on PavoTube II 15C and 30C'],sourceUrl:'https://nanliteus.com/products/cb-dmx-3-5c-1-2-dmx-adapter-cable-with-locking-3-5mm-connector'
  },
  {
    id:'nanlite-lsflt12mii',manufacturer:'Nanlite',model:'LSFLT12MII Foldable Floor Stand for up to 4-Foot PavoTubes',
    category:'Stand',compatibleWith:BOTH,compatibilityStatus:'Designed For',sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-cb-dt-dc-pavotube-c',manufacturer:'Nanlite',model:'CB-DT/DC D-Tap to 5.5mm DC Barrel Power Cable',
    category:'Cable',compatibleWith:BOTH,compatibilityStatus:'Compatible',
    conditions:['Allows operation from an external battery with D-Tap output'],sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-pavotube-ii-15c-barndoors-grid',manufacturer:'Nanlite',model:'Fabric Barndoors and Grid for PavoTube II 15C',
    category:'Barndoors',compatibleWith:['nanlite-pavotube-ii-15c'],compatibilityStatus:'Designed For',
    sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-pavotube-ii-15c-eggcrate',manufacturer:'Nanlite',model:'Eggcrate for PavoTube II 15C',
    category:'Grid',compatibleWith:['nanlite-pavotube-ii-15c'],compatibilityStatus:'Designed For',
    sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-pavotube-ii-30c-barndoors-grid',manufacturer:'Nanlite',model:'Fabric Barndoors and Grid for PavoTube II 30C',
    category:'Barndoors',compatibleWith:['nanlite-pavotube-ii-30c'],compatibilityStatus:'Designed For',
    sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-pavotube-ii-30c-eggcrate',manufacturer:'Nanlite',model:'Eggcrate for PavoTube II 30C',
    category:'Grid',compatibleWith:['nanlite-pavotube-ii-30c'],compatibilityStatus:'Designed For',
    sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-pa-15v3a-pavotube',manufacturer:'Nanlite',model:'15V/3A Power Adapter for PavoTube II 15C / 15X',
    category:'Power',compatibleWith:['nanlite-pavotube-ii-15c'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.accessories
  },
  {
    id:'nanlite-pa-15v4a-pavotube',manufacturer:'Nanlite',model:'15V/4A Power Adapter for PavoTube II 30C / 30XR',
    category:'Power',compatibleWith:['nanlite-pavotube-ii-30c','nanlite-pavotube-ii-30xr'],
    compatibilityStatus:'Designed For',sourceUrl:SRC.accessories
  },

  included('nanlite-pavotube-ii-15c-power-adapter','PavoTube II 15C AC Power Adapter','Power','nanlite-pavotube-ii-15c',SRC.c15),
  included('nanlite-pavotube-ii-15c-power-cable','PavoTube II 15C AC Power Cable','Cable','nanlite-pavotube-ii-15c',SRC.c15),
  included('nanlite-pavotube-ii-15c-t12-clip','HD-T12-1-C Transparent T12 Mounting Clip','Mount','nanlite-pavotube-ii-15c',SRC.c15),
  included('nanlite-pavotube-ii-15c-safety-wire','Steel Safety Wire — PavoTube II 15C','Mount','nanlite-pavotube-ii-15c',SRC.c15),
  included('nanlite-pavotube-ii-15c-case','PavoTube II 15C Padded Carrying Bag','Case','nanlite-pavotube-ii-15c',SRC.c15),

  included('nanlite-pavotube-ii-30c-power-adapter','PavoTube II 30C AC Power Adapter','Power','nanlite-pavotube-ii-30c',SRC.c30),
  included('nanlite-pavotube-ii-30c-power-cable','PavoTube II 30C AC Power Cable','Cable','nanlite-pavotube-ii-30c',SRC.c30),
  included('nanlite-pavotube-ii-30c-t12-clip','Transparent T12 Mounting Clip with 1/4-20 Receivers','Mount','nanlite-pavotube-ii-30c',SRC.c30),
  included('nanlite-pavotube-ii-30c-safety-wire','Steel Safety Wire — PavoTube II 30C','Mount','nanlite-pavotube-ii-30c',SRC.c30),
  included('nanlite-pavotube-ii-30c-case','PavoTube II 30C Padded Carrying Bag','Case','nanlite-pavotube-ii-30c',SRC.c30)
];
