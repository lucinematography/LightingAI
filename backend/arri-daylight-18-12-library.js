// ARRI Daylight 18/12 Fresnel and verified compatible equipment.
// Canonical sources: official ARRI product page, EMEAI Product Catalog 2025, Lamps, Barndoors, Scrims and Daylight Sets.
const SRC='https://www.arri.com/en/lighting/daylight/arri-daylight-18-12';
const CATALOG='https://www.arri.com/resource/blob/250174/f6e4b0aa8cdccc863173d7b1de438c36/arri-emeai-product-catalog-2024-en-v1-0-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const BARNDOORS='https://www.arri.com/en/lighting/accessories/barndoors';
const SCRIMS='https://www.arri.com/en/lighting/accessories/scrims-scrim-bags';
const SETS='https://www.arri.com/en/lighting/kits/daylight-sets';

export const ARRI_DAYLIGHT_18_12_FIXTURES=[
 {id:'arri-daylight-18-12',manufacturer:'ARRI',model:'ARRI Daylight 18/12',family:'Daylight Fresnel',category:'Light',sourceType:'HMI daylight Fresnel',lampPowerW:'12000/18000',beamAngle:'15-50°',cct:'6000 K',lampBase:'S30',mount:'Spigot 28 mm / 1 1/8 in',connector:'International (VEAM)',ipRating:'IP23',orderCode:'L1.71160.B',control:{wired:['Dimming 50-100% via compatible ARRI ballast'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const D1812=['arri-daylight-18-12'];
export const ARRI_DAYLIGHT_18_12_ACCESSORIES=[
 {id:'arri-daylight-18-12-lamp-osram',manufacturer:'ARRI',model:'Lamp HMI 18000 W/DE XS S30 (Osram)',orderCode:'L2.89260.0',category:'Lamp',compatibleWith:D1812,sourceUrl:LAMPS},
 {id:'arri-daylight-18-12-eb-12-18',manufacturer:'ARRI',model:'EB 12/18 with ALF & trolley',orderCode:'L2.76290.0',category:'Ballast',compatibleWith:D1812,sourceUrl:CATALOG},
 {id:'arri-daylight-18-12-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor 740 mm / 29.1 in',orderCode:'L2.71100.0',category:'Barndoor',compatibleWith:D1812,sourceUrl:BARNDOORS},
 {id:'arri-daylight-18-12-filter-frame',manufacturer:'ARRI',model:'Filter Frame 740 mm / 29.1 in',orderCode:'L2.71110.0',category:'Filter Frame',compatibleWith:D1812,sourceUrl:CATALOG},
 {id:'arri-daylight-18-12-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 740 mm / 29.1 in',orderCode:'L2.71115.0',category:'Scrim',compatibleWith:D1812,sourceUrl:SCRIMS},
 {id:'arri-daylight-18-12-scrim-full-single',manufacturer:'ARRI',model:'Scrim Full Single 740 mm / 29.1 in',orderCode:'L2.71115.A',category:'Scrim',compatibleWith:D1812,sourceUrl:SCRIMS},
 {id:'arri-daylight-18-12-scrim-full-double',manufacturer:'ARRI',model:'Scrim Full Double 740 mm / 29.1 in',orderCode:'L2.71115.B',category:'Scrim',compatibleWith:D1812,sourceUrl:SCRIMS},
 {id:'arri-daylight-18-12-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 740 mm / 29.1 in scrims',orderCode:'L2.89555.1',category:'Bag',compatibleWith:D1812,sourceUrl:SCRIMS},
 {id:'arri-daylight-18-12-head-ballast-15m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 12/18/24 kW, 15 m',orderCode:'L2.82294.0',category:'Cable',compatibleWith:D1812,sourceUrl:SETS},
 {id:'arri-daylight-18-12-safety-cable',manufacturer:'ARRI',model:'Safety Cable 10 mm, 1 m, max. load 100 kg',orderCode:'L2.0015517',category:'Safety',compatibleWith:D1812,sourceUrl:CATALOG},
 {id:'arri-daylight-18-12-basic-set',manufacturer:'ARRI',model:'ARRI Daylight 18/12 Basic Set',orderCode:'L0.71160.X',category:'Set',compatibleWith:D1812,sourceUrl:SETS}
];
