// ARRI True Blue T1 tungsten Fresnel and verified compatible equipment.
// Canonical sources: official ARRI True Blue T1 page, EMEAI Product Catalog 2025 and ARRI accessory pages.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/true-blue-t/t1';
const CATALOG='https://www.arri.com/resource/blob/250174/f6e4b0aa8cdccc863173d7b1de438c36/arri-emeai-product-catalog-2024-en-v1-0-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const BARNDOORS='https://www.arri.com/en/lighting/accessories/barndoors';
const SCRIMS='https://www.arri.com/en/lighting/accessories/scrims-scrim-bags';
const SNOOTS='https://www.arri.com/en/lighting/accessories/diffusion-spill-rings-snoots-louvers';

export const ARRI_TRUE_BLUE_T1_FIXTURES=[
 {id:'arri-true-blue-t1',manufacturer:'ARRI',model:'True Blue T1',family:'True Blue T',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:1000,beamAngle:'10-54°',cct:'3200 K',lampBase:'G22',voltage:'220-250 V',mount:'Spigot 28 mm (short), 16 mm socket',ipRating:'IP23',orderCodes:['L0.39610.B','L0.39610.D','L0.39610.I','L0.39615.B','L0.39615.D','L0.39615.I'],variants:['MAN blue/silver','P.O. blue/silver','MAN black','P.O. black'],included:['4-leaf barndoor','filter frame'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const T1=['arri-true-blue-t1'];
export const ARRI_TRUE_BLUE_T1_ACCESSORIES=[
 {id:'arri-t1-lamp-1000-osram',manufacturer:'ARRI',model:'Lamp 1000 W 230 V G22 FKJ CP71 (Osram)',orderCode:'L2.89208.0',category:'Lamp',compatibleWith:T1,sourceUrl:LAMPS},
 {id:'arri-t1-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 197 mm / 7.8 in',orderCode:'L2.39670.0',category:'Barndoor',compatibleWith:T1,sourceUrl:BARNDOORS},
 {id:'arri-t1-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor True Blue 197 mm / 7.8 in',orderCode:'L2.39700.0',category:'Barndoor',compatibleWith:T1,sourceUrl:CATALOG},
 {id:'arri-t1-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 197 mm / 7.8 in',orderCode:'L2.79660.0',category:'Scrim',compatibleWith:T1,sourceUrl:SCRIMS},
 {id:'arri-t1-scrim-a',manufacturer:'ARRI',model:'Scrim full single 197 mm / 7.8 in',orderCode:'L2.79660.A',category:'Scrim',compatibleWith:T1,sourceUrl:SCRIMS},
 {id:'arri-t1-scrim-c',manufacturer:'ARRI',model:'Scrim half single 197 mm / 7.8 in',orderCode:'L2.79660.C',category:'Scrim',compatibleWith:T1,sourceUrl:SCRIMS},
 {id:'arri-t1-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 197 mm / 7.8 in scrims',orderCode:'L2.88913.1',category:'Bag',compatibleWith:T1,sourceUrl:SCRIMS},
 {id:'arri-t1-filter-frame',manufacturer:'ARRI',model:'Filter Frame 197 mm / 7.8 in',orderCode:'L2.79690.0',category:'Filter Frame',compatibleWith:T1,sourceUrl:CATALOG},
 {id:'arri-t1-variable-snoot',manufacturer:'ARRI',model:'Snoot 197 mm / 7.8 in with variable aperture',orderCode:'L2.79680.0',category:'Snoot',compatibleWith:T1,sourceUrl:SNOOTS}
];

export const ARRI_TRUE_BLUE_T1_META={family:'True Blue T',sourceUrl:SRC,catalogUrl:CATALOG};
