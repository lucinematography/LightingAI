// ARRI True Blue D5 daylight Fresnel and verified compatible equipment.
// Canonical sources: official ARRI True Blue D5 page, EMEAI Product Catalog 2025, lamps, cables, scrims and Daylight Sets.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/true-blue-d/d5';
const CATALOG='https://www.arri.com/resource/blob/250174/f6e4b0aa8cdccc863173d7b1de438c36/arri-emeai-product-catalog-2024-en-v1-0-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const CABLES='https://www.arri.com/en/lighting/accessories/cables';
const SCRIMS='https://www.arri.com/en/lighting/accessories/scrims-scrim-bags';
const SETS='https://www.arri.com/en/lighting/kits/daylight-sets';
const LIGHT_CONTROL='https://www.arri.com/en/lighting/led-spotlights/l-series-plus/accessories';

export const ARRI_TRUE_BLUE_D5_FIXTURES=[
 {id:'arri-true-blue-d5',manufacturer:'ARRI',model:'True Blue D5',family:'True Blue D',category:'Light',sourceType:'HMI daylight Fresnel',lampPowerW:575,beamAngle:'6-56°',cct:'6000 K',lampBase:'G22',connector:'International (VEAM)',ipRating:'IP23',orderCode:'L1.33770.B',control:{wired:['Dimming 50-100% via compatible ARRI ballast','DMX with EB MAX 1.8 or EB 575/800 HS'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const D5=['arri-true-blue-d5'];
export const ARRI_TRUE_BLUE_D5_ACCESSORIES=[
 {id:'arri-d5-lamp-575-koto',manufacturer:'ARRI',model:'Lamp DIS 575 W/SE G22 UV-B (Koto)',orderCode:'L2.0003874',category:'Lamp',compatibleWith:D5,sourceUrl:LAMPS},
 {id:'arri-d5-eb-max-1-8',manufacturer:'ARRI',model:'EB MAX 1.8, ALF CCL DMX AutoScan, International (VEAM), 115/230 V Bare Ends',orderCode:'L2.0014190',category:'Ballast',compatibleWith:D5,sourceUrl:CATALOG},
 {id:'arri-d5-eb-575-800-hs-schuko',manufacturer:'ARRI',model:'EB 575/800 HS, ALF CCL DMX, International (VEAM), Schuko',orderCode:'L2.76184KH',category:'Ballast',compatibleWith:D5,sourceUrl:CATALOG},
 {id:'arri-d5-eb-575-800-hs-bare',manufacturer:'ARRI',model:'EB 575/800 HS, ALF CCL DMX, International (VEAM), Bare Ends',orderCode:'L2.0001687',category:'Ballast',compatibleWith:D5,sourceUrl:CATALOG},
 {id:'arri-d5-eb-575-1200',manufacturer:'ARRI',model:'EB 575/1200 with ALF, International (VEAM)',orderCode:'L2.76425.0',category:'Ballast',compatibleWith:D5,sourceUrl:CATALOG},
 {id:'arri-d5-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 197 mm / 7.8 in',orderCode:'L2.39670.0',category:'Barndoor',compatibleWith:D5,sourceUrl:CATALOG},
 {id:'arri-d5-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor True Blue 197 mm / 7.8 in',orderCode:'L2.39700.0',category:'Barndoor',compatibleWith:D5,sourceUrl:CATALOG},
 {id:'arri-d5-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 197 mm / 7.8 in',orderCode:'L2.79660.0',category:'Scrim',compatibleWith:D5,sourceUrl:SCRIMS},
 {id:'arri-d5-scrim-full-single',manufacturer:'ARRI',model:'Scrim Full Single 197 mm / 7.8 in',orderCode:'L2.79660.A',category:'Scrim',compatibleWith:D5,sourceUrl:SCRIMS},
 {id:'arri-d5-scrim-full-double',manufacturer:'ARRI',model:'Scrim Full Double 197 mm / 7.8 in',orderCode:'L2.79660.B',category:'Scrim',compatibleWith:D5,sourceUrl:CATALOG},
 {id:'arri-d5-scrim-half-single',manufacturer:'ARRI',model:'Scrim Half Single 197 mm / 7.8 in',orderCode:'L2.79660.C',category:'Scrim',compatibleWith:D5,sourceUrl:SCRIMS},
 {id:'arri-d5-scrim-half-double',manufacturer:'ARRI',model:'Scrim Half Double 197 mm / 7.8 in',orderCode:'L2.79660.D',category:'Scrim',compatibleWith:D5,sourceUrl:CATALOG},
 {id:'arri-d5-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 197 mm / 7.8 in scrims',orderCode:'L2.88913.1',category:'Bag',compatibleWith:D5,sourceUrl:SCRIMS},
 {id:'arri-d5-filter-frame',manufacturer:'ARRI',model:'Filter Frame 197 mm / 7.8 in',orderCode:'L2.79690.0',category:'Filter Frame',compatibleWith:D5,sourceUrl:LIGHT_CONTROL},
 {id:'arri-d5-variable-snoot',manufacturer:'ARRI',model:'Snoot 197 mm / 7.8 in with variable aperture',orderCode:'L2.79680.0',category:'Snoot',compatibleWith:D5,sourceUrl:LIGHT_CONTROL},
 {id:'arri-d5-head-ballast-7m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 575/800/1200/1800 W, 7 m, International connector (VEAM)',orderCode:'L2.75600.0',category:'Cable',compatibleWith:D5,sourceUrl:CABLES},
 {id:'arri-d5-high-speed-set',manufacturer:'ARRI',model:'D5 High Speed Set',orderCode:'L0.33770HS',category:'Set',compatibleWith:D5,sourceUrl:SETS},
 {id:'arri-d5-basic-set',manufacturer:'ARRI',model:'D5 Basic Set',orderCode:'L0.0001664',category:'Set',compatibleWith:D5,sourceUrl:SETS}
];
