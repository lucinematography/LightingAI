// ARRI Junior tungsten Fresnels and verified compatible equipment.
// Canonical sources: official ARRI Junior product pages, ARRI accessory pages and EMEAI Product Catalog.
const FAMILY='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/arri-junior';
const A150=FAMILY+'/arri-150';
const A300=FAMILY+'/arri-300-plus';
const A650=FAMILY+'/arri-650-plus';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const BARNDOORS='https://www.arri.com/en/lighting/accessories/barndoors';
const SCRIMS='https://www.arri.com/en/lighting/accessories/scrims-scrim-bags';
const CATALOG='https://www.arri.com/resource/blob/250174/b4b68d41218d2d1f9dce62062566c252/arri-emeai-product-catalog-data.pdf';

export const ARRI_JUNIOR_FIXTURES=[
 {id:'arri-150',manufacturer:'ARRI',model:'ARRI 150',family:'ARRI Junior',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:'100/150',beamAngle:'14-42°',cct:'3200 K',lampBase:'GX6.35',voltage:'230 V / 120 V',mount:'Socket 16 mm / 5/8 in',ipRating:'IP20',orderCodes:['L0.79360.B'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:A150},
 {id:'arri-300-plus',manufacturer:'ARRI',model:'ARRI 300 Plus',family:'ARRI Junior',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:300,beamAngle:'14-53°',cct:'3200 K',lampBase:'GY9.5',voltage:'230 V / 120 V',mount:'Socket 16 mm / 5/8 in',ipRating:'IP20',orderCodes:['L0.79200.B','L0.79200.D','L0.79205.B','L0.79205.D'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:A300},
 {id:'arri-650-plus',manufacturer:'ARRI',model:'ARRI 650 Plus',family:'ARRI Junior',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:'300/500/650',beamAngle:'12-52°',cct:'3200 K',lampBase:'GY9.5',voltage:'230 V / 120 V',mount:'Socket 16 mm / 5/8 in',ipRating:'IP20',orderCodes:['L0.79400.B','L0.79400.I'],variants:['Manual','Pole-operated'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:A650}
];

const I150=['arri-150']; const I300=['arri-300-plus']; const I650=['arri-650-plus'];
export const ARRI_JUNIOR_ACCESSORIES=[
 {id:'arri-150-lamp',manufacturer:'ARRI',model:'Lamp 150 W 230 V GX6.35 (Osram)',orderCode:'L2.89202.0',category:'Lamp',compatibleWith:I150,sourceUrl:LAMPS},
 {id:'arri-150-barndoor',manufacturer:'ARRI',model:'4-leaf Barndoor 78 mm / 3.1 in',orderCode:'L2.79380.0',category:'Barndoor',compatibleWith:I150,sourceUrl:BARNDOORS},
 {id:'arri-150-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 78 mm / 3.1 in',orderCode:'L2.73466.0',category:'Scrim',compatibleWith:I150,sourceUrl:SCRIMS},
 {id:'arri-150-scrim-c',manufacturer:'ARRI',model:'Scrim half single 78 mm / 3.1 in',orderCode:'L2.73466.C',category:'Scrim',compatibleWith:I150,sourceUrl:SCRIMS},
 {id:'arri-150-scrim-d',manufacturer:'ARRI',model:'Scrim half double 78 mm / 3.1 in',orderCode:'L2.73466.D',category:'Scrim',compatibleWith:I150,sourceUrl:SCRIMS},
 {id:'arri-150-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 78 mm / 3.1 in scrims',orderCode:'L2.88908.1',category:'Bag',compatibleWith:I150,sourceUrl:SCRIMS},
 {id:'arri-150-filter-frame',manufacturer:'ARRI',model:'Filter Frame 78 mm / 3.1 in',orderCode:'L2.79395.0',category:'Filter Frame',compatibleWith:I150,sourceUrl:CATALOG},
 {id:'arri-150-snoot',manufacturer:'ARRI',model:'Snoot 78 mm / 3.1 in',orderCode:'L2.79390.0',category:'Snoot',compatibleWith:I150,sourceUrl:CATALOG},

 {id:'arri-300-lamp',manufacturer:'ARRI',model:'Lamp 300 W 240 V GY9.51 CP81 (Osram)',orderCode:'L2.89203.0',category:'Lamp',compatibleWith:I300,sourceUrl:LAMPS},
 {id:'arri-300-barndoor',manufacturer:'ARRI',model:'4-leaf Barndoor 130 mm / 5.1 in',orderCode:'L2.79170.0',category:'Barndoor',compatibleWith:I300,sourceUrl:BARNDOORS},
 {id:'arri-300-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 130 mm / 5.1 in',orderCode:'L2.79160.0',category:'Scrim',compatibleWith:I300,sourceUrl:SCRIMS},
 {id:'arri-300-scrim-a',manufacturer:'ARRI',model:'Scrim full single 130 mm / 5.1 in',orderCode:'L2.79160.A',category:'Scrim',compatibleWith:I300,sourceUrl:SCRIMS},
 {id:'arri-300-scrim-b',manufacturer:'ARRI',model:'Scrim full double 130 mm / 5.1 in',orderCode:'L2.79160.B',category:'Scrim',compatibleWith:I300,sourceUrl:SCRIMS},
 {id:'arri-300-scrim-d',manufacturer:'ARRI',model:'Scrim half double 130 mm / 5.1 in',orderCode:'L2.79160.D',category:'Scrim',compatibleWith:I300,sourceUrl:SCRIMS},
 {id:'arri-300-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 130 mm / 5.1 in scrims',orderCode:'L2.88911.1',category:'Bag',compatibleWith:I300,sourceUrl:SCRIMS},
 {id:'arri-300-filter-frame',manufacturer:'ARRI',model:'Filter Frame 130 mm / 5.1 in',orderCode:'L2.79190.0',category:'Filter Frame',compatibleWith:I300,sourceUrl:CATALOG},
 {id:'arri-300-snoot',manufacturer:'ARRI',model:'Snoot 130 mm / 5.1 in',orderCode:'L2.79180.0',category:'Snoot',compatibleWith:I300,sourceUrl:CATALOG},

 {id:'arri-650-lamp',manufacturer:'ARRI',model:'Lamp 650 W 230 V GY9.5 FRL CP89 (Osram)',orderCode:'L2.89205.0',category:'Lamp',compatibleWith:I650,sourceUrl:LAMPS},
 {id:'arri-650-barndoor',manufacturer:'ARRI',model:'4-leaf Barndoor 168 mm / 6.6 in',orderCode:'L2.79470.0',category:'Barndoor',compatibleWith:I650,sourceUrl:BARNDOORS},
 {id:'arri-650-barndoor-black',manufacturer:'ARRI',model:'4-leaf Barndoor black/silver 168 mm / 6.6 in',orderCode:'L2.79471.0',category:'Barndoor',compatibleWith:I650,sourceUrl:BARNDOORS},
 {id:'arri-650-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 168 mm / 6.6 in',orderCode:'L2.79460.0',category:'Scrim',compatibleWith:I650,sourceUrl:SCRIMS},
 {id:'arri-650-speed-ring-video',manufacturer:'ARRI',model:'Speed Ring circular 9670 168 mm / 6.6 in',orderCode:'L2.89068.0',category:'Speed Ring',compatibleWith:I650,sourceUrl:CATALOG},
 {id:'arri-650-speed-ring-metal',manufacturer:'ARRI',model:'Speed Ring circular metal 9670AL 168 mm / 6.6 in',orderCode:'L2.89074.0',category:'Speed Ring',compatibleWith:I650,sourceUrl:CATALOG},
 {id:'arri-650-speed-ring-daylite',manufacturer:'ARRI',model:'Speed Ring circular 9672 168 mm / 6.6 in',orderCode:'L2.89069.0',category:'Speed Ring',compatibleWith:I650,sourceUrl:CATALOG}
];

export const ARRI_JUNIOR_META={family:'ARRI Junior',sourceUrl:FAMILY};
