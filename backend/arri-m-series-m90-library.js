// ARRI M-Series M90 daylight fixture and verified compatible equipment.
// Canonical sources: official ARRI M90 page/data sheet, EMEAI Product Catalog 2025, lamps, cables and Daylight Sets.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/m-series/m90';
const DATA='https://www.arri.com/resource/blob/31494/0cd9af9d759f4d8768fcc732ebdad956/arri-m-series-m90-data-sheet-en-sep2018-data.pdf';
const CATALOG='https://www.arri.com/resource/blob/250174/b4b68d41218d2d1f9dce62062566c252/arri-emeai-product-catalog-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const CABLES='https://www.arri.com/en/lighting/accessories/cables';
const SETS='https://www.arri.com/en/lighting/kits/daylight-sets';

export const ARRI_M_SERIES_M90_FIXTURES=[
 {id:'arri-m90',manufacturer:'ARRI',model:'M90',family:'M-Series',category:'Light',sourceType:'HMI daylight open-face with MAX Technology reflector',lampPowerW:'6000/9000',beamAngle:'16-49° (9000 W lamp)',cct:'6000 K',lampBase:'GX38',mount:'Spigot 28 mm / 1 1/8 in',connector:'International (VEAM)',ipRating:'IP23',orderCode:'L1.37489.B',control:{wired:['Via compatible ARRI electronic ballast; DMX with EB MAX 6/9'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const M90=['arri-m90'];
export const ARRI_M_SERIES_M90_ACCESSORIES=[
 {id:'arri-m90-lamp-9000-osram',manufacturer:'ARRI',model:'Lamp HMI 9000 W/SE XS GX38 UVS (Osram)',orderCode:'L2.37482.0',category:'Lamp',compatibleWith:M90,sourceUrl:LAMPS},
 {id:'arri-m90-eb-max-6-9',manufacturer:'ARRI',model:'EB MAX 6/9, ALF CCL DMX AutoScan, 50/60/75/300/1000 Hz, International (VEAM), 230 V Bare Ends',orderCode:'L2.0016747',category:'Ballast',compatibleWith:M90,sourceUrl:CATALOG},
 {id:'arri-m90-eb-6-9',manufacturer:'ARRI',model:'EB 6/9, ALF, 50/60/75 Hz, International (VEAM), 230 V Bare Ends',orderCode:'L2.76180.0',category:'Ballast',compatibleWith:M90,sourceUrl:CATALOG},
 {id:'arri-m90-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor 584 mm / 23.0 in',orderCode:'L2.37560.0',category:'Barndoor',compatibleWith:M90,sourceUrl:CATALOG},
 {id:'arri-m90-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 571 mm / 22.5 in',orderCode:'L2.0008688',category:'Scrim',compatibleWith:M90,sourceUrl:CATALOG},
 {id:'arri-m90-spill-ring',manufacturer:'ARRI',model:'Spill Ring 571 mm / 22.5 in',orderCode:'L2.37561.0',category:'Spill Ring',compatibleWith:M90,sourceUrl:CATALOG},
 {id:'arri-m90-head-ballast-7m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 6000/9000 W, 7 m, International connector (VEAM)',orderCode:'L2.77940.0',category:'Cable',compatibleWith:M90,sourceUrl:CABLES},
 {id:'arri-m90-head-ballast-15m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 6000/9000 W, 15 m, International connector (VEAM)',orderCode:'L2.77940.A',category:'Cable',compatibleWith:M90,sourceUrl:CABLES},
 {id:'arri-m90-eb-max-set',manufacturer:'ARRI',model:'M90 EB MAX Set',orderCode:'L0.0019658',category:'Set',compatibleWith:M90,sourceUrl:SETS},
 {id:'arri-m90-basic-set',manufacturer:'ARRI',model:'M90 Basic Set',orderCode:'L0.0019659',category:'Set',compatibleWith:M90,sourceUrl:SETS}
];
