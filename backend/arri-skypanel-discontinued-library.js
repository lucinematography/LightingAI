// Discontinued ARRI SkyPanel panel-light fixtures that are still encountered on sets.
// S60-C is intentionally not duplicated here because it already exists in the Classic catalog.
const SRC30 = 'https://www.arri.com/en/lighting/led-spotlights/discontinued/s30-rp';
const SRC60 = 'https://www.arri.com/en/lighting/led-spotlights/discontinued/s60-rp';

export const ARRI_SKYPANEL_DISCONTINUED_FIXTURES = [
  { id:'arri-skypanel-s30-rp', manufacturer:'ARRI', model:'SkyPanel S30-RP', family:'SkyPanel', category:'Light', discontinued:true, sourceType:'LED Soft Light', opticalSystem:'Remote Phosphor Panel', cctOptionsK:[2700,3200,4300,5600,6500,10000], fixtureWeightKg:7.7, control:{wired:['DMX-512A','RDM','Art-Net','sACN','Ethernet'],wireless:['ARRI SkyLink Receiver (external)'],builtInWirelessDMX:false}, sourceUrl:SRC30 },
  { id:'arri-skypanel-s60-rp', manufacturer:'ARRI', model:'SkyPanel S60-RP', family:'SkyPanel', category:'Light', discontinued:true, sourceType:'LED Soft Light', opticalSystem:'Remote Phosphor Panel', cctOptionsK:[2700,3200,4300,5600,6500,10000], fixtureWeightKg:12.6, control:{wired:['DMX-512A','RDM','Art-Net','sACN','Ethernet'],wireless:['ARRI SkyLink Receiver (external)'],builtInWirelessDMX:false}, sourceUrl:SRC60 }
];

// Remote-phosphor panels are the defining interchangeable optical accessories for these fixtures.
export const ARRI_SKYPANEL_DISCONTINUED_ACCESSORIES = [
  { id:'arri-s30-rp-panel-2700', manufacturer:'ARRI', model:'Remote Phosphor Panel S30 2700 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s30-rp'], sourceUrl:SRC30 },
  { id:'arri-s30-rp-panel-3200', manufacturer:'ARRI', model:'Remote Phosphor Panel S30 3200 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s30-rp'], sourceUrl:SRC30 },
  { id:'arri-s30-rp-panel-4300', manufacturer:'ARRI', model:'Remote Phosphor Panel S30 4300 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s30-rp'], sourceUrl:SRC30 },
  { id:'arri-s30-rp-panel-5600', manufacturer:'ARRI', model:'Remote Phosphor Panel S30 5600 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s30-rp'], sourceUrl:SRC30 },
  { id:'arri-s30-rp-panel-6500', manufacturer:'ARRI', model:'Remote Phosphor Panel S30 6500 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s30-rp'], sourceUrl:SRC30 },
  { id:'arri-s30-rp-panel-10000', manufacturer:'ARRI', model:'Remote Phosphor Panel S30 10000 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s30-rp'], sourceUrl:SRC30 },
  { id:'arri-s60-rp-panel-2700', manufacturer:'ARRI', model:'Remote Phosphor Panel S60 2700 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s60-rp'], sourceUrl:SRC60 },
  { id:'arri-s60-rp-panel-3200', manufacturer:'ARRI', model:'Remote Phosphor Panel S60 3200 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s60-rp'], sourceUrl:SRC60 },
  { id:'arri-s60-rp-panel-4300', manufacturer:'ARRI', model:'Remote Phosphor Panel S60 4300 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s60-rp'], sourceUrl:SRC60 },
  { id:'arri-s60-rp-panel-5600', manufacturer:'ARRI', model:'Remote Phosphor Panel S60 5600 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s60-rp'], sourceUrl:SRC60 },
  { id:'arri-s60-rp-panel-6500', manufacturer:'ARRI', model:'Remote Phosphor Panel S60 6500 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s60-rp'], sourceUrl:SRC60 },
  { id:'arri-s60-rp-panel-10000', manufacturer:'ARRI', model:'Remote Phosphor Panel S60 10000 K', category:'Remote Phosphor', compatibleWith:['arri-skypanel-s60-rp'], sourceUrl:SRC60 }
];
