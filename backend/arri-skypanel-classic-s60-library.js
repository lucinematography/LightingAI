// ARRI SkyPanel Classic S60-C catalog. Verified against official ARRI S60-C page and ARRI Lighting Product Catalog.
// Accessories already defined canonically in the S60 Pro library are shared with S60-C through compatibleWith.
const S60 = 'arri-skypanel-s60-c';
const SRC = 'https://www.arri.com/en/lighting/led-spotlights/discontinued/s60-c';
const CAT = 'https://www.arri.com/resource/blob/155372/f821e2da15b191c754a8fb31e232c197/arri-lighting-americas-product-catalog-2023-en-v1-1-data.pdf';

export const ARRI_SKYPANEL_CLASSIC_S60_FIXTURES = [
  { id:S60, manufacturer:'ARRI', model:'SkyPanel S60-C', family:'SkyPanel Classic', category:'Light', sourceType:'RGBW LED Soft Light', opticalSystem:'Swappable Soft Diffusion Panel', cctK:{min:2800,max:10000}, colorMode:'RGBW', fixtureWeightKg:10.6, manualYokeWeightKg:12.6, poleOperatedWeightKg:14.1, apertureMm:{width:645,height:300}, ipRating:'IP20', pixelZones:2, externalPsu:true, control:{wired:['DMX-512A','RDM','Art-Net 4','sACN','Ethernet','SkyPanel Remote via USB'],wireless:['ARRI SkyLink Receiver (external)'],usb5VForWirelessReceiver:true,builtInWirelessDMX:false}, sourceUrl:SRC, sourceTypeLabel:'Official ARRI SkyPanel S60-C data' }
];

export const ARRI_SKYPANEL_CLASSIC_S60_ACCESSORIES = [
  { id:'arri-s60-classic-standard-diffusion', manufacturer:'ARRI', model:'Standard Diffusion for SkyPanel S60 107° HPA', category:'Diffusion', compatibleWith:[S60], includedWithFixture:S60, orderCode:'L2.0003345', sourceUrl:CAT },
  { id:'arri-s60-diffusion-kit', manufacturer:'ARRI', model:'Diffusion Kit S60-C', category:'Diffusion', compatibleWith:[S60], orderCode:'L0.0008461', sourceUrl:CAT },
  { id:'arri-s60-flexdoor', manufacturer:'ARRI', model:'FlexDoor for SkyPanel S60', category:'Light Control', compatibleWith:[S60], orderCode:'L2.0013878', sourceUrl:CAT },
  { id:'arri-skypanel-remote-s60', manufacturer:'ARRI', model:'SkyPanel Remote incl. 5 m USB cable and pouch', category:'Control', compatibleWith:[S60], orderCode:'L2.0022690', sourceUrl:CAT },
  { id:'arri-skypanel-remote-usb-s60', manufacturer:'ARRI', model:'SkyPanel Remote USB Cable 5 m', category:'Cable', compatibleWith:[S60], orderCode:'L2.0013861', sourceUrl:CAT },
  { id:'arri-skypanel-remote-pouch-s60', manufacturer:'ARRI', model:'SkyPanel Remote Carrying Pouch', category:'Transport', compatibleWith:[S60], orderCode:'L2.0013945', sourceUrl:CAT }
];
