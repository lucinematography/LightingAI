// ARRI True Blue D25 daylight Fresnel and verified compatible equipment.
// Canonical sources: official ARRI D25 page, True Blue D overview/brochure, lamps, scrims, softbox/speed-ring and Daylight Sets.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/true-blue-d/d25';
const OVERVIEW='https://www.arri.com/resource/blob/324514/604256f9dabf87160e546e6eeb638dec/arri-d-series-overview-poster-feb2023-data.pdf';
const BROCHURE='https://www.arri.com/resource/blob/127496/7337c1c5599ab9738a8d7a36bcee6544/arri-true-blue-d-series-brochure-en-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const SCRIMS='https://www.arri.com/en/lighting/accessories/scrims-scrim-bags';
const SOFTBOX='https://www.arri.com/en/lighting/accessories/softboxes-accessory-holders-speed-rings';
const SETS='https://www.arri.com/en/lighting/kits/daylight-sets';

export const ARRI_TRUE_BLUE_D25_FIXTURES=[
 {id:'arri-true-blue-d25',manufacturer:'ARRI',model:'True Blue D25',family:'True Blue D',category:'Light',sourceType:'HMI daylight Fresnel',lampPowerW:2500,beamAngle:'6-59°',cct:'6000 K',lampBase:'G38',mount:'Spigot 28 mm / 1 1/8 in',connector:'International (VEAM)',ipRating:'IP23',orderCode:'L1.33670.B',control:{wired:['Via compatible ARRI electronic ballast; DMX with EB MAX 2.5/4'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const D25=['arri-true-blue-d25'];
export const ARRI_TRUE_BLUE_D25_ACCESSORIES=[
 {id:'arri-d25-lamp-2500-koto',manufacturer:'ARRI',model:'Lamp DIS 2500 W/SE G38 UV-B (Koto)',orderCode:'L2.0003883',category:'Lamp',compatibleWith:D25,sourceUrl:LAMPS},
 {id:'arri-d25-lamp-2500-osram',manufacturer:'ARRI',model:'Lamp HMI 2500 W/SE XS G38 (Osram)',orderCode:'L2.89255.0',category:'Lamp',compatibleWith:D25,sourceUrl:LAMPS},
 {id:'arri-d25-eb-max-2-5-4',manufacturer:'ARRI',model:'EB MAX 2.5/4, ALF CCL DMX AutoScan',category:'Ballast',compatibleWith:D25,sourceUrl:OVERVIEW},
 {id:'arri-d25-eb-2-5-4',manufacturer:'ARRI',model:'EB 2.5/4 with ALF, International (VEAM)',orderCode:'L2.76640.0',category:'Ballast',compatibleWith:D25,sourceUrl:BROCHURE},
 {id:'arri-d25-eb-2500',manufacturer:'ARRI',model:'EB 2500 W, 115/230 V, ALF, International (VEAM)',orderCode:'L2.76635.0',category:'Ballast',compatibleWith:D25,sourceUrl:BROCHURE},
 {id:'arri-d25-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 344 mm / 13.5 in',orderCode:'L2.40950.0',category:'Barndoor',compatibleWith:D25,sourceUrl:BROCHURE},
 {id:'arri-d25-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor True Blue 344 mm / 13.5 in',orderCode:'L2.40960.0',category:'Barndoor',compatibleWith:D25,sourceUrl:BROCHURE},
 {id:'arri-d25-filter-frame',manufacturer:'ARRI',model:'Filter Frame 330 mm / 13.0 in',orderCode:'L2.80970.0',category:'Filter Frame',compatibleWith:D25,sourceUrl:BROCHURE},
 {id:'arri-d25-variable-snoot',manufacturer:'ARRI',model:'Variable Snoot',orderCode:'L2.80975.0',category:'Snoot',compatibleWith:D25,sourceUrl:BROCHURE},
 {id:'arri-d25-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 330 mm / 13.0 in',orderCode:'L2.80980.0',category:'Scrim',compatibleWith:D25,sourceUrl:SCRIMS},
 {id:'arri-d25-scrim-full-single',manufacturer:'ARRI',model:'Scrim Full Single 330 mm / 13.0 in',orderCode:'L2.80980.A',category:'Scrim',compatibleWith:D25,sourceUrl:SCRIMS},
 {id:'arri-d25-scrim-full-double',manufacturer:'ARRI',model:'Scrim Full Double 330 mm / 13.0 in',orderCode:'L2.80980.B',category:'Scrim',compatibleWith:D25,sourceUrl:SCRIMS},
 {id:'arri-d25-scrim-half-single',manufacturer:'ARRI',model:'Scrim Half Single 330 mm / 13.0 in',orderCode:'L2.80980.C',category:'Scrim',compatibleWith:D25,sourceUrl:SCRIMS},
 {id:'arri-d25-scrim-half-double',manufacturer:'ARRI',model:'Scrim Half Double 330 mm / 13.0 in',orderCode:'L2.80980.D',category:'Scrim',compatibleWith:D25,sourceUrl:SCRIMS},
 {id:'arri-d25-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 330 mm / 13.0 in scrims',orderCode:'L2.88915.1',category:'Bag',compatibleWith:D25,sourceUrl:SCRIMS},
 {id:'arri-d25-speed-ring',manufacturer:'ARRI',model:'Speed Ring circular (9305), 343 mm / 13.5 in',orderCode:'L2.76247.0',category:'Speed Ring',compatibleWith:D25,sourceUrl:SOFTBOX},
 {id:'arri-d25-head-ballast-7m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 2.5/4 kW, 7 m, International connector (VEAM)',orderCode:'L2.75620.0',category:'Cable',compatibleWith:D25,sourceUrl:BROCHURE},
 {id:'arri-d25-head-ballast-15m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 2.5/4 kW, 15 m, International connector (VEAM)',orderCode:'L2.75260.C',category:'Cable',compatibleWith:D25,sourceUrl:BROCHURE},
 {id:'arri-d25-eb-max-set',manufacturer:'ARRI',model:'D25 EB MAX Set',orderCode:'L0.0019662',category:'Set',compatibleWith:D25,sourceUrl:SETS},
 {id:'arri-d25-basic-baby-set',manufacturer:'ARRI',model:'D25 Basic Set - Baby',orderCode:'L0.33670XB',category:'Set',compatibleWith:D25,sourceUrl:SETS},
 {id:'arri-d25-basic-set',manufacturer:'ARRI',model:'D25 Basic Set',orderCode:'L0.0001662',category:'Set',compatibleWith:D25,sourceUrl:SETS}
];