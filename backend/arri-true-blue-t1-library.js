// ARRI True Blue T1 tungsten Fresnel and verified compatible equipment.
// Canonical sources: official ARRI True Blue T1 page, EMEAI Product Catalog 2025 and Lamps page.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/true-blue-t/t1';
const CATALOG='https://www.arri.com/resource/blob/250174/f6e4b0aa8cdccc863173d7b1de438c36/arri-emeai-product-catalog-2024-en-v1-0-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';

export const ARRI_TRUE_BLUE_T1_FIXTURES=[
 {id:'arri-true-blue-t1',manufacturer:'ARRI',model:'True Blue T1',family:'True Blue T',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:1000,beamAngle:'10-54°',cct:'3200 K',lampBase:'G22',mount:'Spigot 28 mm (short), 16 mm socket',ipRating:'IP23',control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const T1=['arri-true-blue-t1'];
export const ARRI_TRUE_BLUE_T1_ACCESSORIES=[
 {id:'arri-t1-lamp-1000-osram',manufacturer:'ARRI',model:'Lamp 1000 W 230 V G22 FKJ CP71 (Osram)',orderCode:'L2.89208.0',category:'Lamp',compatibleWith:T1,sourceUrl:LAMPS},
 {id:'arri-t1-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 197 mm / 7.8 in',category:'Barndoor',compatibleWith:T1,sourceUrl:CATALOG},
 {id:'arri-t1-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 197 mm / 7.8 in',category:'Scrim',compatibleWith:T1,sourceUrl:CATALOG},
 {id:'arri-t1-filter-frame',manufacturer:'ARRI',model:'Filter Frame 197 mm / 7.8 in',category:'Filter Frame',compatibleWith:T1,sourceUrl:CATALOG},
 {id:'arri-t1-variable-snoot',manufacturer:'ARRI',model:'Snoot 197 mm / 7.8 in with variable aperture',category:'Snoot',compatibleWith:T1,sourceUrl:CATALOG},
 {id:'arri-t1-safety-cable',manufacturer:'ARRI',model:'Safety Cable',category:'Safety',compatibleWith:T1,sourceUrl:CATALOG}
];
