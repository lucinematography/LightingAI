// ARRI True Blue D12 daylight Fresnel and verified compatible equipment.
// Canonical sources: official ARRI True Blue D-Series overview/brochure, lamps, barndoors, filter frames and Daylight Sets.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/true-blue-d';
const BROCHURE='https://www.arri.com/resource/blob/127496/7337c1c5599ab9738a8d7a36bcee6544/arri-true-blue-d-series-brochure-en-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const BARNDOORS='https://www.arri.com/en/lighting/accessories/barndoors';
const FILTERS='https://www.arri.com/en/lighting/accessories/filter-frames';
const SETS='https://www.arri.com/en/lighting/kits/daylight-sets';

export const ARRI_TRUE_BLUE_D12_FIXTURES=[
 {id:'arri-true-blue-d12',manufacturer:'ARRI',model:'True Blue D12',family:'True Blue D',category:'Light',sourceType:'HMI daylight Fresnel',lampPowerW:1200,beamAngle:'7.5-50°',cct:'Daylight',lampBase:'G38',mount:'Spigot 28 mm / 1 1/8 in',connector:'International (VEAM)',ipRating:'IP23',orderCode:'L1.33730.B',control:{wired:['Via compatible ARRI electronic ballast; DMX with EB MAX 1.8 or DMX-capable ballast'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const D12=['arri-true-blue-d12'];
export const ARRI_TRUE_BLUE_D12_ACCESSORIES=[
 {id:'arri-d12-lamp-1200-koto',manufacturer:'ARRI',model:'Lamp DIS 1200 W/SE G38 UV-B (Koto)',orderCode:'L2.0003885',category:'Lamp',compatibleWith:D12,sourceUrl:LAMPS},
 {id:'arri-d12-lamp-1200-osram',manufacturer:'ARRI',model:'Lamp Digital HMI 1200 W/SE G38 UVS (Osram)',orderCode:'L2.89254L0',category:'Lamp',compatibleWith:D12,sourceUrl:LAMPS},
 {id:'arri-d12-eb-max-1-8',manufacturer:'ARRI',model:'EB MAX 1.8, ALF CCL DMX AutoScan',orderCode:'L2.0014190',category:'Ballast',compatibleWith:D12,sourceUrl:SETS},
 {id:'arri-d12-eb-575-1200-alf',manufacturer:'ARRI',model:'EB 575/1200 with ALF, International (VEAM)',orderCode:'L2.76425.0',category:'Ballast',compatibleWith:D12,sourceUrl:BROCHURE},
 {id:'arri-d12-eb-1200-1800-dmx',manufacturer:'ARRI',model:'EB 1200/1800 with ALF, DMX, International (VEAM)',orderCode:'L2.76626.0',category:'Ballast',compatibleWith:D12,sourceUrl:BROCHURE},
 {id:'arri-d12-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 245 mm / 9.7 in',orderCode:'L2.39870.0',category:'Barndoor',compatibleWith:D12,sourceUrl:BARNDOORS},
 {id:'arri-d12-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor 245 mm / 9.7 in',orderCode:'L2.39900.0',category:'Barndoor',compatibleWith:D12,sourceUrl:BROCHURE},
 {id:'arri-d12-filter-frame',manufacturer:'ARRI',model:'Filter Frame 230 mm / 9.1 in',orderCode:'L2.79890.0',category:'Filter Frame',compatibleWith:D12,sourceUrl:FILTERS},
 {id:'arri-d12-variable-snoot',manufacturer:'ARRI',model:'Variable Snoot',orderCode:'L2.79880.0',category:'Snoot',compatibleWith:D12,sourceUrl:BROCHURE},
 {id:'arri-d12-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 230 mm / 9.1 in',orderCode:'L2.79860.0',category:'Scrim',compatibleWith:D12,sourceUrl:BROCHURE},
 {id:'arri-d12-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag',orderCode:'L2.88914.1',category:'Bag',compatibleWith:D12,sourceUrl:BROCHURE},
 {id:'arri-d12-head-ballast-7m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 575/800/1200/1800 W, 7 m, International connector (VEAM)',orderCode:'L2.75600.0',category:'Cable',compatibleWith:D12,sourceUrl:BROCHURE},
 {id:'arri-d12-head-ballast-15m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 575/800/1200/1800 W, 15 m, International connector (VEAM)',orderCode:'L2.75600.C',category:'Cable',compatibleWith:D12,sourceUrl:BROCHURE},
 {id:'arri-d12-eb-max-set',manufacturer:'ARRI',model:'D12 EB MAX Set',orderCode:'L0.0019660',category:'Set',compatibleWith:D12,sourceUrl:SETS},
 {id:'arri-d12-basic-set',manufacturer:'ARRI',model:'D12 Basic Set',orderCode:'L0.0001659',category:'Set',compatibleWith:D12,sourceUrl:SETS}
];