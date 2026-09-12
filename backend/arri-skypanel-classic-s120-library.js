// ARRI SkyPanel Classic S120-C catalog. Verified against official ARRI S120-C page, 2025 ARRI Lighting Americas Product Catalog and SkyPanel Accessories Guide.
const S120 = 'arri-skypanel-s120-c';
const SRC = 'https://www.arri.com/en/lighting/led-panel-lights/skypanel-classic/s120-c';
const CAT = 'https://www.arri.com/resource/blob/389042/3118cf5bae1816dca592dfe62ef93878/arri-lighting-americas-product-catalog-data.pdf';

export const ARRI_SKYPANEL_CLASSIC_S120_FIXTURES = [
  { id:S120, manufacturer:'ARRI', model:'SkyPanel S120-C', family:'SkyPanel Classic', category:'Light', sourceType:'RGBW LED Soft Light', opticalSystem:'Swappable Soft Diffusion Panel', cctK:{min:2800,max:10000}, colorMode:'RGBW', apertureMm:{width:1290,height:300}, beamAngleDeg:{standardDiffusion:107}, ipRating:'IP20', externalPsu:true, orientation:['Horizontal','Vertical'], control:{wired:['DMX-512A','RDM','Art-Net 4','sACN','Ethernet','SkyPanel Remote via USB'],wireless:['ARRI SkyLink Receiver (external)'],usb5VForWirelessReceiver:true,builtInWirelessDMX:false}, sourceUrl:SRC, sourceTypeLabel:'Official ARRI SkyPanel S120-C data' }
];

export const ARRI_SKYPANEL_CLASSIC_S120_ACCESSORIES = [
  { id:'arri-s120-standard-diffusion', manufacturer:'ARRI', model:'Standard Diffusion for SkyPanel S120-C 107° HPA', category:'Diffusion', compatibleWith:[S120], includedWithFixture:S120, orderCode:'L2.0009501', sourceUrl:CAT },
  { id:'arri-s120-heavy-diffusion', manufacturer:'ARRI', model:'Heavy Diffusion for SkyPanel S120-C 114° HPA', category:'Diffusion', compatibleWith:[S120], orderCode:'L2.0009500', sourceUrl:CAT },
  { id:'arri-s120-lite-diffusion', manufacturer:'ARRI', model:'Lite Diffusion for SkyPanel S120-C 105° HPA', category:'Diffusion', compatibleWith:[S120], orderCode:'L2.0009502', sourceUrl:CAT },
  { id:'arri-s120-intensifier', manufacturer:'ARRI', model:'Intensifier for SkyPanel S120-C 73° HPA', category:'Optic', compatibleWith:[S120], orderCode:'L2.0009503', sourceUrl:CAT },
  { id:'arri-s120-diffusion-kit', manufacturer:'ARRI', model:'Diffusion Kit S120-C', category:'Diffusion', compatibleWith:[S120], orderCode:'L0.0015070', sourceUrl:CAT },
  { id:'arri-s120-accessory-bag', manufacturer:'ARRI', model:'Accessory Panel Bag for SkyPanel S120-C', category:'Transport', compatibleWith:[S120], orderCode:'L2.0013780', sourceUrl:CAT },
  { id:'arri-s120-barndoor', manufacturer:'ARRI', model:'4-leaf Barndoor for SkyPanel S120-C', category:'Light Control', compatibleWith:[S120], orderCode:'L2.0010114', sourceUrl:CAT },
  { id:'arri-s120-flexdoor', manufacturer:'ARRI', model:'FlexDoor for SkyPanel S120-C', category:'Light Control', compatibleWith:[S120], orderCode:'L2.0012922', sourceUrl:'https://www.arri.com/en/lighting/accessories/barndoors' },
  { id:'arri-s120-eggcrate', manufacturer:'ARRI', model:'16-Chamber Eggcrate for SkyPanel S120-C', category:'Light Control', compatibleWith:[S120], orderCode:'L2.0009690', sourceUrl:CAT },
  { id:'arri-s120-honeycomb-60', manufacturer:'ARRI', model:'Honeycomb 60° for SkyPanel S120-C', category:'Light Control', compatibleWith:[S120], orderCode:'L2.0009561', sourceUrl:CAT },
  { id:'arri-s120-honeycomb-30', manufacturer:'ARRI', model:'Honeycomb 30° for SkyPanel S120-C', category:'Light Control', compatibleWith:[S120], orderCode:'L2.0009562', sourceUrl:CAT },
  { id:'arri-s120-snoot', manufacturer:'ARRI', model:'Snoot for SkyPanel S120-C', category:'Light Control', compatibleWith:[S120], orderCode:'L2.0009680', sourceUrl:'https://www.arri.com/en/lighting/led-panel-lights/skypanel-classic/accessories/light-control' },
  { id:'arri-s120-extra-diffusion-slot', manufacturer:'ARRI', model:'Extra Diffusion Slot for SkyPanel S120-C', category:'Light Control', compatibleWith:[S120], orderCode:'L2.0009681', sourceUrl:'https://www.arri.com/en/lighting/accessories/diffusion-spill-rings-snoots-louvers' },
  { id:'arri-s120-skybender', manufacturer:'ARRI', model:'SkyBender for SkyPanel S120-C', category:'Light Control', compatibleWith:[S120], orderCode:'L2.0010352', sourceUrl:CAT },
  { id:'arri-skypanel-remote-s120', manufacturer:'ARRI', model:'SkyPanel Remote incl. 5 m USB cable and pouch', category:'Control', compatibleWith:[S120], orderCode:'L2.0022690', sourceUrl:CAT },
  { id:'arri-skypanel-remote-usb-s120', manufacturer:'ARRI', model:'SkyPanel Remote USB Cable 5 m', category:'Cable', compatibleWith:[S120], orderCode:'L2.0013861', sourceUrl:CAT },
  { id:'arri-skypanel-remote-pouch-s120', manufacturer:'ARRI', model:'SkyPanel Remote Carrying Pouch', category:'Transport', compatibleWith:[S120], orderCode:'L2.0013945', sourceUrl:CAT },
  { id:'arri-s120-dc-cable-05m', manufacturer:'ARRI', model:'DC Cable 0.5 m (XLR) SkyPanel', category:'Power', compatibleWith:[S120], orderCode:'L2.0007492', sourceUrl:'https://www.arri.com/en/lighting/led-panel-lights/skypanel-classic/accessories/cables' },
  { id:'arri-s120-dc-cable-1m', manufacturer:'ARRI', model:'DC Cable 1 m (XLR) SkyPanel', category:'Power', compatibleWith:[S120], orderCode:'L2.0007491', sourceUrl:'https://www.arri.com/en/lighting/led-panel-lights/skypanel-classic/accessories/cables' },
  { id:'arri-s120-dc-cable-3m', manufacturer:'ARRI', model:'DC Cable 3 m (XLR) SkyPanel', category:'Power', compatibleWith:[S120], orderCode:'L2.0007493', sourceUrl:'https://www.arri.com/en/lighting/led-panel-lights/skypanel-classic/accessories/cables' },
  { id:'arri-s120-battery-adapter-ab', manufacturer:'ARRI', model:'Battery Adapter Plate for Anton/Bauer', category:'Power', compatibleWith:[S120], orderCode:'L2.0008071', sourceUrl:'https://www.arri.com/en/lighting/led-panel-lights/skypanel-classic/accessories/battery-adapters' },
  { id:'arri-s120-battery-adapter-vmount', manufacturer:'ARRI', model:'V-Mount Battery Adapter Plate', category:'Power', compatibleWith:[S120], orderCode:'L2.0008070', sourceUrl:'https://www.arri.com/en/lighting/led-panel-lights/skypanel-classic/accessories/battery-adapters' }
];
