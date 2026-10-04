// Nanlite current PavoTube II XR family.
// Official Nanlite US sources only. Compatibility is explicit and size-specific.

const SRC={
  xr6:'https://nanliteus.com/products/pavotube-ii-6xr-10-rgbww-led-pixel-tube-with-built-in-crmx',
  xr15:'https://nanliteus.com/products/pavotube-ii-15xr',
  xr30:'https://nanliteus.com/products/pavotube-ii-30xr-4-rgbww-led-pixel-tube-with-built-in-crmx',
  xr60:'https://nanliteus.com/products/pavotube-ii-60xr-8-rgbww-led-pixel-tube-with-built-in-crmx-8-light-kit',
  xr1530Accessories:'https://nanliteus.com/collections/pavotube-ii-xr-accessories',
  xr60Accessories:'https://nanliteus.com/collections/pavotube-ii-60xr-accessories',
  dmxUsbC:'https://nanliteus.com/products/usb-c-to-dmx-cable',
  pavotubeSeries:'https://nanliteus.com/pages/pavotube-series',
  sixCompare:'https://nanliteus.com/blogs/learn/whats-the-difference-between-the-pavotube-ii-6c-6cp-6xr'
};

function control({usbCdmx=false,twoPointFour=true}={}){
  return {
    wired:['DMX512','RDM'],
    wireless:['LumenRadio CRMX','Bluetooth / NANLINK app',...(twoPointFour?['2.4G']:[])],
    builtInBluetooth:true,
    builtInCRMX:true,
    dmxConnection:usbCdmx?'USB-C via CB-DMX-USBC-1/3II adapter':'Locking metal DMX/RDM port',
    directLightingAI:[],
    externalInterfaceRequired:[
      usbCdmx?'CB-DMX-USBC-1/3II adapter plus wired DMX interface':'CB-DMX-ACP-1/2 adapter cable plus wired DMX interface',
      'CRMX transmitter for CRMX control'
    ],
    unavailableDirectProtocols:[
      'NANLINK Bluetooth/2.4G control protocol is not publicly documented for third-party direct control'
    ]
  };
}

function fixture(id,model,lengthLabel,powerDrawW,batteryMah,cri,tlci,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,family:'PavoTube II XR',category:'Light',discontinued:false,
    sourceType:'RGBWW LED Pixel Tube',formFactor:lengthLabel,cctK:{min:2700,max:12000},
    colorMode:'RGBWW',powerDrawW,builtInBattery:true,batteryMah,cri,tlci,sourceUrl,...extra
  };
}

export const NANLITE_PAVOTUBE_II_XR_FIXTURES=[
  fixture('nanlite-pavotube-ii-6xr','PavoTube II 6XR','10-inch T12 tube',16,3200,96,97,SRC.xr6,{
    control:control({usbCdmx:true,twoPointFour:false}),
    powerOptions:['Internal battery','USB-C PD 3.0','USB power bank','AC via USB-C PD adapter']
  }),
  fixture('nanlite-pavotube-ii-15xr','PavoTube II 15XR','2-foot T12 tube',35,2200,97,98,SRC.xr15,{
    control:control(),powerOptions:['Internal battery','15V/2A AC adapter']
  }),
  fixture('nanlite-pavotube-ii-30xr','PavoTube II 30XR','4-foot T12 tube',70,4400,97,98,SRC.xr30,{
    control:control(),powerOptions:['Internal battery','15V/4A AC adapter']
  }),
  fixture('nanlite-pavotube-ii-60xr','PavoTube II 60XR','8-foot T12 tube',106,8800,97,98,SRC.xr60,{
    control:control(),powerOptions:['Internal battery','15V/6.5A AC adapter']
  })
];

const ALL=['nanlite-pavotube-ii-6xr','nanlite-pavotube-ii-6c','nanlite-pavotube-ii-6cp','nanlite-pavotube-ii-15xr','nanlite-pavotube-ii-30xr','nanlite-pavotube-ii-60xr','nanlite-pavotube-ii-15c','nanlite-pavotube-ii-30c','nanlite-pavotube-ii-15x','nanlite-pavotube-ii-30x','nanlite-pavotube-ii-60x'];
const LOCKING=['nanlite-pavotube-ii-15xr','nanlite-pavotube-ii-30xr','nanlite-pavotube-ii-60xr','nanlite-pavotube-ii-15x','nanlite-pavotube-ii-30x','nanlite-pavotube-ii-60x'];
const T1530=['nanlite-pavotube-ii-15xr','nanlite-pavotube-ii-30xr'];

function included(id,model,category,target,sourceUrl,extra={}){
  return {
    id,manufacturer:'Nanlite',model,category,compatibleWith:[target],
    compatibilityStatus:'Designed For',includedWithFixture:true,sourceUrl,...extra
  };
}

export const NANLITE_PAVOTUBE_II_XR_ACCESSORIES=[
  {
    id:'nanlite-cb-dmx-usbc-1-3ii',manufacturer:'Nanlite',model:'CB-DMX-USBC-1/3II USB-C to DMX Cable',
    category:'Control',compatibleWith:['nanlite-pavotube-ii-6xr','nanlite-pavotube-t8-7x'],compatibilityStatus:'Designed For',
    conditions:['Required for wired DMX/RDM on PavoTube II 6XR'],sourceUrl:SRC.dmxUsbC
  },
  {
    id:'nanlite-cb-dmx-acp-1-2',manufacturer:'Nanlite',model:'CB-DMX-ACP-1/2 Locking DMX Adapter Cable',
    category:'Control',compatibleWith:LOCKING,compatibilityStatus:'Designed For',
    conditions:['Adapts the fixture locking DMX/RDM port to standard DMX cabling'],sourceUrl:SRC.xr1530Accessories
  },
  {
    id:'nanlite-pavotube-t12-clip-1-4',manufacturer:'Nanlite',model:'PavoTube Clear T12 Mounting Clip with 1/4-20 Receivers',
    category:'Mount',compatibleWith:ALL,compatibilityStatus:'Compatible',sourceUrl:SRC.xr1530Accessories
  },
  {
    id:'nanlite-pavotube-t12-clip-magnet',manufacturer:'Nanlite',model:'PavoTube Clear T12 Mounting Clip with Magnet',
    category:'Mount',compatibleWith:ALL,compatibilityStatus:'Compatible',sourceUrl:SRC.xr1530Accessories
  },
  {
    id:'nanlite-pavotube-single-holder-swivel',manufacturer:'Nanlite',model:'PavoTube Single T12 Holder with Swivel Ball Joint and 5/8in Baby Pin',
    category:'Mount',compatibleWith:ALL,compatibilityStatus:'Compatible',sourceUrl:SRC.xr1530Accessories
  },
  {
    id:'nanlite-pavotube-single-holder-5-8',manufacturer:'Nanlite',model:'PavoTube Single T12 Holder with 5/8in Receiver',
    category:'Mount',compatibleWith:ALL,compatibilityStatus:'Compatible',sourceUrl:SRC.xr1530Accessories
  },
  {
    id:'nanlite-pavotube-t12-clip-baby-pin',manufacturer:'Nanlite',model:'PavoTube Clear T12 Mounting Clip with 5/8in Baby Pin',
    category:'Mount',compatibleWith:ALL,compatibilityStatus:'Compatible',sourceUrl:SRC.xr1530Accessories
  },
  {
    id:'nanlite-pavotube-double-bank',manufacturer:'Nanlite',model:'PavoTube Double Bank 2 T12 Tube Mount with Gooseneck and 5/8in Receiver',
    category:'Mount',compatibleWith:LOCKING,compatibilityStatus:'Compatible',sourceUrl:SRC.xr1530Accessories
  },
  {
    id:'nanlite-pavotube-quad-bank',manufacturer:'Nanlite',model:'PavoTube Quad Bank 4 T12 Tube Mount with Gooseneck and 5/8in Receiver',
    category:'Mount',compatibleWith:LOCKING,compatibilityStatus:'Compatible',sourceUrl:SRC.xr1530Accessories
  },
  {
    id:'nanlite-ec-ptii6c',manufacturer:'Nanlite',model:'EC-PTII6C Fabric Grid',
    category:'Grid',compatibleWith:['nanlite-pavotube-ii-6c','nanlite-pavotube-ii-6cp','nanlite-pavotube-ii-6xr'],compatibilityStatus:'Compatible',
    sourceUrl:SRC.sixCompare
  },
  {
    id:'nanlite-as-wb-ptii6c',manufacturer:'Nanlite',model:'AS-WB-PTII6C Waterproof Bag',
    category:'Other',compatibleWith:['nanlite-pavotube-ii-6c','nanlite-pavotube-ii-6cp','nanlite-pavotube-ii-6xr'],compatibilityStatus:'Compatible',
    conditions:['For underwater / wet-environment use as specified by Nanlite'],sourceUrl:SRC.sixCompare
  },
  {
    id:'nanlite-pavotube-15x-fabric-barndoors-grid',manufacturer:'Nanlite',model:'Fabric Barndoors and Grid for PavoTube II 15X',
    category:'Barndoors',compatibleWith:['nanlite-pavotube-ii-15xr'],compatibilityStatus:'Designed For',
    sourceUrl:SRC.xr1530Accessories
  },
  {
    id:'nanlite-pavotube-30xr-fabric-barndoors-grid',manufacturer:'Nanlite',model:'Fabric Barndoors and Grid for PavoTube II 30XR',
    category:'Barndoors',compatibleWith:['nanlite-pavotube-ii-30xr'],compatibilityStatus:'Designed For',
    sourceUrl:SRC.xr1530Accessories
  },

  included('nanlite-pavotube-ii-6xr-usbc-cable','Braided USB-C Cable 1 m','Cable','nanlite-pavotube-ii-6xr',SRC.xr6),
  included('nanlite-pavotube-ii-6xr-iron-plates','Iron Plates for Magnetic Mounting (set of 3)','Mount','nanlite-pavotube-ii-6xr',SRC.xr6),
  included('nanlite-pavotube-ii-6xr-case','PavoTube II 6XR Carrying Bag','Case','nanlite-pavotube-ii-6xr',SRC.xr6),

  included('nanlite-pavotube-ii-15xr-power-adapter','15V/2A Power Adapter','Power','nanlite-pavotube-ii-15xr',SRC.xr15),
  included('nanlite-pavotube-ii-15xr-power-cable','Power Cable 3 m','Cable','nanlite-pavotube-ii-15xr',SRC.xr15),
  included('nanlite-pavotube-ii-15xr-case','PavoTube II 15XR Padded Carrying Bag','Case','nanlite-pavotube-ii-15xr',SRC.xr15),

  included('nanlite-pavotube-ii-30xr-power-adapter','15V/4A Power Adapter','Power','nanlite-pavotube-ii-30xr',SRC.xr30),
  included('nanlite-pavotube-ii-30xr-power-cable','Power Cable 3 m','Cable','nanlite-pavotube-ii-30xr',SRC.xr30),
  included('nanlite-pavotube-ii-30xr-case','PavoTube II 30XR Padded Carrying Bag','Case','nanlite-pavotube-ii-30xr',SRC.xr30),

  included('nanlite-pavotube-ii-60xr-power-adapter','15V/6.5A Power Adapter','Power','nanlite-pavotube-ii-60xr',SRC.xr60)
];
