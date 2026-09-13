// ARRI True Blue ST2/3 studio tungsten Fresnel and verified compatible equipment.
// Canonical sources: current official ARRI product and accessory pages.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/true-blue-st/true-blue-st2-3';
const ACCESSORIES='https://www.arri.com/en/lighting/accessories';

export const ARRI_TRUE_BLUE_ST2_3_FIXTURES=[
 {id:'arri-true-blue-st2-3',manufacturer:'ARRI',model:'True Blue ST2/3',family:'True Blue ST',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:[2000,3000],voltage:'220-240 V',lampBase:'G38',cct:'3200 K',beamAngle:'7.9-56 deg / 11.6-56.3 deg (2 kW / 3 kW)',accessoryDiameterMm:330,barndoorDiameterMm:344,mount:'Spigot 28 mm / 1 1/8 in',housingColors:['Blue/Silver','Black'],ipRating:'IP23',mainsPlug:['Schuko','Bare Ends'],variants:['Manual','Pole-operated'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const ST23=['arri-true-blue-st2-3'];
export const ARRI_TRUE_BLUE_ST2_3_ACCESSORIES=[
 {id:'arri-st23-lamp-2000w',manufacturer:'ARRI',model:'Lamp 2000 W 230 V G38 FKK CP73 (Osram)',orderCode:'L2.89213.0',category:'Lamp',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/lamps'},
 {id:'arri-st23-barndoor-4',manufacturer:'ARRI',model:'4-leaf barndoor, True Blue 344 mm / 13.5 in',orderCode:'L2.40950.0',category:'Barndoor',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/barndoors'},
 {id:'arri-st23-scrim-set',manufacturer:'ARRI',model:'Set of 4 scrims 330 mm / 13.0 in',orderCode:'L2.80980.0',category:'Scrim',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/scrims-scrim-bags'},
 {id:'arri-st23-scrim-full-single',manufacturer:'ARRI',model:'Scrim, full single 330 mm / 13.0 in',orderCode:'L2.80980.A',category:'Scrim',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/scrims-scrim-bags'},
 {id:'arri-st23-scrim-full-double',manufacturer:'ARRI',model:'Scrim, full double 330 mm / 13.0 in',orderCode:'L2.80980.B',category:'Scrim',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/scrims-scrim-bags'},
 {id:'arri-st23-scrim-half-double',manufacturer:'ARRI',model:'Scrim, half double 330 mm / 13.0 in',orderCode:'L2.80980.D',category:'Scrim',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/scrims-scrim-bags'},
 {id:'arri-st23-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 330 mm / 13.0 in scrims',orderCode:'L2.88915.1',category:'Bag',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/scrims-scrim-bags'},
 {id:'arri-st23-filter-frame',manufacturer:'ARRI',model:'Filter frame 330 mm / 13.0 in',orderCode:'L2.80970.0',category:'Filter Frame',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/filter-frames'},
 {id:'arri-st23-snoot',manufacturer:'ARRI',model:'Snoot 344 mm / 13.5 in with variable aperture',orderCode:'L2.80975.0',category:'Snoot',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/diffusion-spill-rings-snoots-louvers'},
 {id:'arri-st23-speed-ring',manufacturer:'ARRI',model:'Speed Ring circular 343 mm / 13.5 in (9305)',orderCode:'L2.76247.0',category:'Softbox Mount',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/softboxes-accessory-holders-speed-rings'},
 {id:'arri-st23-c-clamp',manufacturer:'ARRI',model:'ARRI Swiveling C Clamp (C150)',orderCode:'L2.76989.0',category:'Mounting',compatibleWith:ST23,sourceUrl:ACCESSORIES},
 {id:'arri-st23-safety-cable',manufacturer:'ARRI',model:'Safety cable 5 mm, 1 m, max. load 25 kg',orderCode:'L2.0007590',category:'Safety',compatibleWith:ST23,sourceUrl:'https://www.arri.com/en/lighting/accessories/grip'}
];
