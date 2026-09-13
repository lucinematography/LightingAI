// ARRI M-Series M40 daylight fixture and verified compatible equipment.
// Canonical sources: official ARRI M40 page/data sheet, Lighting Product Catalog, lamps, cables, barndoors and Daylight Sets.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/m-series/m40';
const DATA='https://www.arri.com/resource/blob/31490/bffb6b1737011e1f8cc1e3128b5286b5/arri-m-series-m40-data-sheet-en-sep2018-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const CABLES='https://www.arri.com/en/lighting/accessories/cables';
const BARNDOORS='https://www.arri.com/en/lighting/accessories/barndoors';
const SETS='https://www.arri.com/en/lighting/kits/daylight-sets';

export const ARRI_M_SERIES_M40_FIXTURES=[
 {id:'arri-m40',manufacturer:'ARRI',model:'M40',family:'M-Series',category:'Light',sourceType:'HMI daylight open-face with MAX Technology reflector',lampPowerW:'2500/4000',beamAngle:'18-52°',cct:'6000 K',lampBase:'G38',mount:'Spigot 28 mm / 1 1/8 in',connector:'International (VEAM)',ipRating:'IP23',orderCode:'L1.37400.B',control:{wired:['Via compatible ARRI electronic ballast; DMX with EB MAX 2.5/4'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const M40=['arri-m40'];
export const ARRI_M_SERIES_M40_ACCESSORIES=[
 {id:'arri-m40-lamp-4000-osram',manufacturer:'ARRI',model:'Lamp HMI 4000 W/SE XS G38 UVS (Osram)',orderCode:'L2.89256.0',category:'Lamp',compatibleWith:M40,sourceUrl:LAMPS},
 {id:'arri-m40-eb-max-2-5-4',manufacturer:'ARRI',model:'EB MAX 2.5/4, ALF CCL DMX AutoScan, 50/60/75/300/1000 Hz, International (VEAM), Bare Ends',orderCode:'L2.0019423',category:'Ballast',compatibleWith:M40,sourceUrl:DATA},
 {id:'arri-m40-eb-2-5-4',manufacturer:'ARRI',model:'EB 2.5/4 with ALF',orderCode:'L2.76640.0',category:'Ballast',compatibleWith:M40,sourceUrl:SETS},
 {id:'arri-m40-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 413 mm / 16.3 in',orderCode:'L2.41200.0',category:'Barndoor',compatibleWith:M40,sourceUrl:BARNDOORS},
 {id:'arri-m40-spill-ring',manufacturer:'ARRI',model:'Spill Ring 400 mm / 15.8 in',orderCode:'L2.37305.0',category:'Spill Ring',compatibleWith:M40,sourceUrl:SETS},
 {id:'arri-m40-head-ballast-7m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 2500/4000 W, 7 m, International connector (VEAM)',orderCode:'L2.75620.0',category:'Cable',compatibleWith:M40,sourceUrl:CABLES},
 {id:'arri-m40-head-ballast-15m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 2500/4000 W, 15 m, International connector (VEAM)',orderCode:'L2.75620.C',category:'Cable',compatibleWith:M40,sourceUrl:CABLES}
];
