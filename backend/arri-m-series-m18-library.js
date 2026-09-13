// ARRI M-Series M18 daylight fixture and verified compatible equipment.
// Canonical sources: official ARRI M18 data sheet, M-Series technical specs, lamps and Daylight Sets pages.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/m-series/m18/39592-39592';
const DATA='https://www.arri.com/resource/blob/31486/d3fccf4c81aca241b393bead1faa267c/arri-m-series-m18-data-sheet-en-feb2020-data.pdf';
const CATALOG='https://www.arri.com/resource/blob/250174/f6e4b0aa8cdccc863173d7b1de438c36/arri-emeai-product-catalog-2024-en-v1-0-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const SETS='https://www.arri.com/en/lighting/kits/daylight-sets';
const BARNDOORS='https://www.arri.com/en/lighting/accessories/barndoors';

export const ARRI_M_SERIES_M18_FIXTURES=[
 {id:'arri-m18',manufacturer:'ARRI',model:'M18',family:'M-Series',category:'Light',sourceType:'HMI daylight open-face with MAX Technology reflector',lampPowerW:'1200/1800',beamAngle:'15-58°',cct:'Daylight',lampBase:'G38',mount:'Spigot 28 mm / 1 1/8 in',connector:'International (VEAM), 0.5 m cable outlet',ipRating:'IP23',orderCode:'L1.37600.B',control:{wired:['Via compatible ARRI electronic ballast (DMX where supported)'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const M18=['arri-m18'];
export const ARRI_M_SERIES_M18_ACCESSORIES=[
 {id:'arri-m18-lamp-1200-koto',manufacturer:'ARRI',model:'DIS 1200 W/SE G38 UV-B (Koto)',orderCode:'L2.0003885',category:'Lamp',compatibleWith:M18,sourceUrl:LAMPS},
 {id:'arri-m18-lamp-1200-osram',manufacturer:'ARRI',model:'Digital HMI 1200 W/SE G38 UVS (Osram)',orderCode:'L2.89254L0',category:'Lamp',compatibleWith:M18,sourceUrl:LAMPS},
 {id:'arri-m18-lamp-1800-osram',manufacturer:'ARRI',model:'HMI Digital 1800 W/SE G38 UVS (Osram)',orderCode:'L2.37590.0',category:'Lamp',compatibleWith:M18,sourceUrl:LAMPS},
 {id:'arri-m18-eb-max-1-8',manufacturer:'ARRI',model:'EB MAX 1.8, ALF CCL DMX AutoScan',orderCode:'L2.0014190',category:'Ballast',compatibleWith:M18,sourceUrl:DATA},
 {id:'arri-m18-eb-1200-1800',manufacturer:'ARRI',model:'EB 1200/1800',orderCode:'L2.76625.0',category:'Ballast',compatibleWith:M18,sourceUrl:DATA},
 {id:'arri-m18-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 344 mm / 13.5 in',orderCode:'L2.40950.0',category:'Barndoor',compatibleWith:M18,sourceUrl:BARNDOORS},
 {id:'arri-m18-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 330 mm / 13.0 in',orderCode:'L2.80980.0',category:'Scrim',compatibleWith:M18,sourceUrl:CATALOG},
 {id:'arri-m18-scrim-full-single',manufacturer:'ARRI',model:'Scrim Full Single 330 mm / 13.0 in',orderCode:'L2.80980.A',category:'Scrim',compatibleWith:M18,sourceUrl:CATALOG},
 {id:'arri-m18-scrim-full-double',manufacturer:'ARRI',model:'Scrim Full Double 330 mm / 13.0 in',orderCode:'L2.80980.B',category:'Scrim',compatibleWith:M18,sourceUrl:CATALOG},
 {id:'arri-m18-scrim-half-single',manufacturer:'ARRI',model:'Scrim Half Single 330 mm / 13.0 in',orderCode:'L2.80980.C',category:'Scrim',compatibleWith:M18,sourceUrl:CATALOG},
 {id:'arri-m18-scrim-half-double',manufacturer:'ARRI',model:'Scrim Half Double 330 mm / 13.0 in',orderCode:'L2.80980.D',category:'Scrim',compatibleWith:M18,sourceUrl:CATALOG},
 {id:'arri-m18-filter-frame',manufacturer:'ARRI',model:'Filter Frame 330 mm / 13.0 in',orderCode:'L2.80970.0',category:'Filter Frame',compatibleWith:M18,sourceUrl:CATALOG},
 {id:'arri-m18-spill-ring',manufacturer:'ARRI',model:'Spill Ring 330 mm / 13.0 in',category:'Spill Ring',compatibleWith:M18,sourceUrl:SETS},
 {id:'arri-m18-head-ballast-7m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 575/800/1200/1800 W, 7 m',category:'Cable',compatibleWith:M18,sourceUrl:SETS}
];
