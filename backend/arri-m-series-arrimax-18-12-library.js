// ARRI M-Series ARRIMAX 18/12 daylight fixture and verified compatible equipment.
// Canonical sources: official ARRI ARRIMAX 18/12 page/data sheet, EMEAI Product Catalog 2025, lamps, cables and Daylight Sets.
const SRC='https://www.arri.com/en/lighting/daylight/m-series/arrimax-18-12';
const DATA='https://www.arri.com/resource/blob/31498/e061ffb5f0c5c494445352e5fda1cf64/arri-m-series-arrimax-data-sheet-en-sep2018-data.pdf';
const CATALOG='https://www.arri.com/resource/blob/250174/b4b68d41218d2d1f9dce62062566c252/arri-emeai-product-catalog-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const CABLES='https://www.arri.com/en/lighting/accessories/cables';
const SETS='https://www.arri.com/en/lighting/kits/daylight-sets';

export const ARRI_M_SERIES_ARRIMAX_18_12_FIXTURES=[
 {id:'arri-arrimax-18-12',manufacturer:'ARRI',model:'ARRIMAX 18/12',family:'M-Series',category:'Light',sourceType:'HMI daylight open-face with MAX Technology facetted reflector',lampPowerW:'12000/18000',beamAngle:'15-50° standard reflector; 8-15° spot reflector',cct:'approx. 5600 K',lampBase:'GX51 / GX38',mount:'Spigot 28 mm / 1 1/8 in',connector:'International (VEAM), 0.5 m cable outlet',ipRating:'IP23',orderCode:'L1.37950.B',control:{wired:['Via compatible ARRI electronic ballast; DMX with EB MAX 12/18'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const ARRIMAX=['arri-arrimax-18-12'];
export const ARRI_M_SERIES_ARRIMAX_18_12_ACCESSORIES=[
 {id:'arri-arrimax-lamp-12000-koto',manufacturer:'ARRI',model:'Lamp DIS 12000 W/SE G38 UV-B (Koto)',orderCode:'L2.0003880',category:'Lamp',compatibleWith:ARRIMAX,sourceUrl:LAMPS},
 {id:'arri-arrimax-lamp-18000-osram',manufacturer:'ARRI',model:'Lamp HMI 18000 W/SE XS GX51 (Osram)',orderCode:'L2.89262.0',category:'Lamp',compatibleWith:ARRIMAX,sourceUrl:LAMPS},
 {id:'arri-arrimax-eb-max-12-18',manufacturer:'ARRI',model:'EB MAX 12/18, ALF DMX AutoScan, 50/60/75/300/1000 Hz, International (VEAM), 230 V Bare Ends',orderCode:'L2.0016748',category:'Ballast',compatibleWith:ARRIMAX,sourceUrl:CATALOG},
 {id:'arri-arrimax-eb-12-18',manufacturer:'ARRI',model:'EB 12/18, ALF with trolley, 50/60/75 Hz, International (VEAM), 230 V Bare Ends',orderCode:'L2.76290.0',category:'Ballast',compatibleWith:ARRIMAX,sourceUrl:CATALOG},
 {id:'arri-arrimax-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor 740 mm / 29.1 in',orderCode:'L2.71100.0',category:'Barndoor',compatibleWith:ARRIMAX,sourceUrl:CATALOG},
 {id:'arri-arrimax-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 740 mm / 29.1 in',orderCode:'L2.71115.0',category:'Scrim',compatibleWith:ARRIMAX,sourceUrl:CATALOG},
 {id:'arri-arrimax-scrim-full-single',manufacturer:'ARRI',model:'Scrim Full Single 740 mm / 29.1 in',orderCode:'L2.71115.A',category:'Scrim',compatibleWith:ARRIMAX,sourceUrl:CATALOG},
 {id:'arri-arrimax-scrim-full-double',manufacturer:'ARRI',model:'Scrim Full Double 740 mm / 29.1 in',orderCode:'L2.71115.B',category:'Scrim',compatibleWith:ARRIMAX,sourceUrl:CATALOG},
 {id:'arri-arrimax-spot-reflector',manufacturer:'ARRI',model:'Spot Reflector 8-15° HPA',orderCode:'L2.37940.0',category:'Reflector',compatibleWith:ARRIMAX,sourceUrl:DATA},
 {id:'arri-arrimax-head-ballast-15m',manufacturer:'ARRI',model:'Head-to-Ballast/Dimmer Cable 12/18/24 kW, 15 m, International connector (VEAM)',orderCode:'L2.82294.0',category:'Cable',compatibleWith:ARRIMAX,sourceUrl:CABLES},
 {id:'arri-arrimax-head-ballast-20m',manufacturer:'ARRI',model:'Head-to-Ballast/Dimmer Cable 12/18/24 kW, 20 m, International connector (VEAM)',orderCode:'L2.82294.A',category:'Cable',compatibleWith:ARRIMAX,sourceUrl:CABLES},
 {id:'arri-arrimax-eb-max-set',manufacturer:'ARRI',model:'ARRIMAX 18/12 EB MAX Set',orderCode:'L0.0019667',category:'Set',compatibleWith:ARRIMAX,sourceUrl:SETS},
 {id:'arri-arrimax-basic-set',manufacturer:'ARRI',model:'ARRIMAX 18/12 Basic Set',orderCode:'L0.0019665',category:'Set',compatibleWith:ARRIMAX,sourceUrl:SETS}
];
