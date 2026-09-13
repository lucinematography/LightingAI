// ARRI True Blue ST5 studio tungsten Fresnel and verified compatible equipment.
// Canonical sources: current official ARRI product and accessory pages.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/true-blue-st/true-blue-st5';

export const ARRI_TRUE_BLUE_ST5_FIXTURES=[
 {id:'arri-true-blue-st5',manufacturer:'ARRI',model:'True Blue ST5',family:'True Blue ST',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:5000,voltage:'220-240 V',lampBase:'G38',cct:'3200 K',beamAngle:'9-62 deg',lensDiameterMm:300,accessoryDiameterMm:400,barndoorDiameterMm:413,mount:'Spigot 28 mm / 1 1/8 in',housingColors:['Blue/Silver','Black'],ipRating:'IP23',mainsPlug:['Bare Ends'],variants:['Manual','Pole-operated','Hanging','Location'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const ST5=['arri-true-blue-st5'];
export const ARRI_TRUE_BLUE_ST5_ACCESSORIES=[
 {id:'arri-st5-barndoor-4',manufacturer:'ARRI',model:'4-leaf barndoor, True Blue 413 mm / 16.3 in',orderCode:'L2.41200.0',category:'Barndoor',compatibleWith:ST5,sourceUrl:'https://www.arri.com/en/lighting/accessories/barndoors'},
 {id:'arri-st5-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 400 mm / 15.8 in scrims',orderCode:'L2.88916.1',category:'Bag',compatibleWith:ST5,sourceUrl:'https://www.arri.com/en/lighting/accessories/scrims-scrim-bags'},
 {id:'arri-st5-filter-frame',manufacturer:'ARRI',model:'Filter frame 400 mm / 15.8 in',orderCode:'L2.81220.0',category:'Filter Frame',compatibleWith:ST5,sourceUrl:'https://www.arri.com/en/lighting/accessories/filter-frames'},
 {id:'arri-st5-snoot',manufacturer:'ARRI',model:'Snoot 413 mm / 16.3 in with variable aperture',orderCode:'L2.81225.0',category:'Snoot',compatibleWith:ST5,sourceUrl:'https://www.arri.com/en/lighting/accessories/diffusion-spill-rings-snoots-louvers'},
 {id:'arri-st5-speed-ring',manufacturer:'ARRI',model:'Speed Ring circular 411 mm / 16.2 in (9365)',orderCode:'L2.89062.0',category:'Softbox Mount',compatibleWith:ST5,sourceUrl:'https://www.arri.com/en/lighting/accessories/softboxes-accessory-holders-speed-rings'},
 {id:'arri-st5-theater-conversion',manufacturer:'ARRI',model:'Conversion Kit from True Blue ST5 to theater version',orderCode:'L2.34065.0',category:'Conversion Kit',compatibleWith:ST5,sourceUrl:'https://www.arri.com/en/lighting/accessories/other-accessories'}
];
