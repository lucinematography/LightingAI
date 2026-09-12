// ARRI SkyPanel Classic S360-C catalog. Verified against official ARRI S360-C product page and technical data.
const S360 = 'arri-skypanel-s360-c';
const SRC = 'https://www.arri.com/en/lighting/led-panel-lights/skypanel-classic/s360-c';

export const ARRI_SKYPANEL_CLASSIC_S360_FIXTURES = [
  { id:S360, manufacturer:'ARRI', model:'SkyPanel S360-C', family:'SkyPanel Classic', category:'Light', sourceType:'RGBW LED Soft Light', opticalSystem:'Swappable Soft Diffusion Panel', cctK:{min:2800,max:10000}, colorMode:'RGBW', fixtureWeightKg:40, yokeWeightKg:45, apertureMm:{width:1280,height:870}, beamAngleDeg:{standardDiffusion:105}, maxPowerW:1500, lampheadVoltageV:54, ipRating:'IP20', externalPsu:true, psuWeightKg:11, control:{wired:['DMX-512A 5-pin In/Through','RDM','Art-Net','sACN','Ethernet','SkyPanel Remote via USB'],wireless:['LumenRadio CRMX','LumenRadio CRMX2'],builtInWirelessDMX:true,stellarApp:true}, sourceUrl:SRC, sourceTypeLabel:'Official ARRI SkyPanel S360-C data' }
];

export const ARRI_SKYPANEL_CLASSIC_S360_ACCESSORIES = [
  { id:'arri-s360-standard-diffusion', manufacturer:'ARRI', model:'Standard Diffusion S360-C', category:'Diffusion', compatibleWith:[S360], includedWithFixture:S360, sourceUrl:SRC },
  { id:'arri-s360-heavy-diffusion', manufacturer:'ARRI', model:'Heavy Diffusion S360-C', category:'Diffusion', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-lite-diffusion', manufacturer:'ARRI', model:'Lite Diffusion S360-C', category:'Diffusion', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-intensifier', manufacturer:'ARRI', model:'Intensifier S360-C', category:'Optic', compatibleWith:[S360], orderCode:'L2.0015022', sourceUrl:SRC },
  { id:'arri-skylink-s360', manufacturer:'ARRI', model:'SkyLink', category:'Control', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-skylink-wifi-extender-s360', manufacturer:'ARRI', model:'SkyLink WiFi Range Extender', category:'Control', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-skypanel-remote-s360', manufacturer:'ARRI', model:'SkyPanel Remote', category:'Control', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-skypanel-remote-usb-s360', manufacturer:'ARRI', model:'SkyPanel Remote USB Cable 5 m', category:'Cable', compatibleWith:[S360], orderCode:'L2.0013861', sourceUrl:SRC },
  { id:'arri-skypanel-remote-pouch-s360', manufacturer:'ARRI', model:'SkyPanel Remote Carrying Pouch', category:'Transport', compatibleWith:[S360], orderCode:'L2.0013945', sourceUrl:SRC },
  { id:'arri-s360-honeycomb-30', manufacturer:'ARRI', model:'Honeycomb 30° S360', category:'Light Control', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-honeycomb-60', manufacturer:'ARRI', model:'Honeycomb 60° S360', category:'Light Control', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-psu-super-clamp-adapter', manufacturer:'ARRI', model:'Super Clamp Adapter for SkyPanel PSU', category:'Mounting', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-short-yoke', manufacturer:'ARRI', model:'Short Yoke for S360', category:'Mounting', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-dc-cable-5m', manufacturer:'ARRI', model:'DC Cable 5 m (4-Pin 30 A) SkyPanel S360', category:'Power', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-dc-cable-10m', manufacturer:'ARRI', model:'DC Cable 10 m (4-Pin 30 A) SkyPanel S360', category:'Power', compatibleWith:[S360], orderCode:'L2.0016031', sourceUrl:'https://www.arri.com/en/lighting/accessories/cables' },
  { id:'arri-s360-mains-schuko', manufacturer:'ARRI', model:'Mains Cable S360 3 m powerCON 32A / Schuko', category:'Power', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-mains-edison', manufacturer:'ARRI', model:'Mains Cable S360 3 m powerCON 32A / Edison', category:'Power', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-mains-chinese', manufacturer:'ARRI', model:'Mains Cable S360 3 m powerCON 32A / Chinese', category:'Power', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-mains-japanese', manufacturer:'ARRI', model:'Mains Cable S360 3 m powerCON 32A / Japanese', category:'Power', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-mains-bare-ends', manufacturer:'ARRI', model:'Mains Cable S360 3 m powerCON 32A / Bare Ends', category:'Power', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-dmx-2-5m', manufacturer:'ARRI', model:'DMX Data Cable 2.5 m (XLR 5)', category:'Control Cable', compatibleWith:[S360], orderCode:'L2.0033530', sourceUrl:'https://www.arri.com/en/lighting/accessories/cables' },
  { id:'arri-s360-dmx-5m', manufacturer:'ARRI', model:'DMX Data Cable 5 m (XLR 5)', category:'Control Cable', compatibleWith:[S360], orderCode:'L2.0033531', sourceUrl:'https://www.arri.com/en/lighting/accessories/cables' },
  { id:'arri-s360-dmx-10m', manufacturer:'ARRI', model:'DMX Data Cable 10 m (XLR 5)', category:'Control Cable', compatibleWith:[S360], orderCode:'L2.0033532', sourceUrl:'https://www.arri.com/en/lighting/accessories/cables' },
  { id:'arri-s360-safety-cable', manufacturer:'ARRI', model:'Safety Cable 8 mm 1 m, max load 64 kg', category:'Safety', compatibleWith:[S360], sourceUrl:SRC },
  { id:'arri-s360-hard-case', manufacturer:'ARRI', model:'Case for SkyPanel S360 - Hard Single', category:'Transport', compatibleWith:[S360], sourceUrl:SRC }
];
