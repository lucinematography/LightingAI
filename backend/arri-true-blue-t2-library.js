// ARRI True Blue T2 tungsten Fresnel and verified compatible equipment.
// Canonical sources: official ARRI True Blue T2 page, EMEAI Product Catalog 2025 and current ARRI accessory pages.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/true-blue-t/t2';
const CATALOG='https://www.arri.com/resource/blob/250174/b4b68d41218d2d1f9dce62062566c252/arri-emeai-product-catalog-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';

export const ARRI_TRUE_BLUE_T2_FIXTURES=[
 {id:'arri-true-blue-t2-man-blue-bare',manufacturer:'ARRI',model:'True Blue T2 MAN blue/silver – Bare Ends',family:'True Blue T',category:'Light',orderCode:'L0.41250.B',sourceType:'Tungsten Fresnel',lampPowerW:2000,beamAngle:'12-57°',cct:'3200 K',lampBase:'G38',mount:'Spigot 28 mm',ipRating:'IP23',control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-true-blue-t2-man-blue-schuko',manufacturer:'ARRI',model:'True Blue T2 MAN blue/silver – Schuko',family:'True Blue T',category:'Light',orderCode:'L0.41250.D',sourceType:'Tungsten Fresnel',lampPowerW:2000,beamAngle:'12-57°',cct:'3200 K',lampBase:'G38',mount:'Spigot 28 mm',ipRating:'IP23',control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-true-blue-t2-po-blue-bare',manufacturer:'ARRI',model:'True Blue T2 P.O. blue/silver – Bare Ends',family:'True Blue T',category:'Light',orderCode:'L0.41250.I',sourceType:'Tungsten Fresnel',lampPowerW:2000,beamAngle:'12-57°',cct:'3200 K',lampBase:'G38',mount:'Spigot 28 mm',ipRating:'IP23',control:{wired:['Pole-operated pan/tilt','0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-true-blue-t2-man-black-bare',manufacturer:'ARRI',model:'True Blue T2 MAN black – Bare Ends',family:'True Blue T',category:'Light',orderCode:'L0.41255.B',sourceType:'Tungsten Fresnel',lampPowerW:2000,beamAngle:'12-57°',cct:'3200 K',lampBase:'G38',mount:'Spigot 28 mm',ipRating:'IP23',control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-true-blue-t2-man-black-schuko',manufacturer:'ARRI',model:'True Blue T2 MAN black – Schuko',family:'True Blue T',category:'Light',orderCode:'L0.41255.D',sourceType:'Tungsten Fresnel',lampPowerW:2000,beamAngle:'12-57°',cct:'3200 K',lampBase:'G38',mount:'Spigot 28 mm',ipRating:'IP23',control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-true-blue-t2-po-black-bare',manufacturer:'ARRI',model:'True Blue T2 P.O. black – Bare Ends',family:'True Blue T',category:'Light',orderCode:'L0.41255.I',sourceType:'Tungsten Fresnel',lampPowerW:2000,beamAngle:'12-57°',cct:'3200 K',lampBase:'G38',mount:'Spigot 28 mm',ipRating:'IP23',control:{wired:['Pole-operated pan/tilt','0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const T2=ARRI_TRUE_BLUE_T2_FIXTURES.map(f=>f.id);
export const ARRI_TRUE_BLUE_T2_ACCESSORIES=[
 {id:'arri-t2-lamp-2000-osram',manufacturer:'ARRI',model:'Lamp 2000 W 230 V G38 FKK CP73',orderCode:'L2.89213.0',category:'Lamp',compatibleWith:T2,sourceUrl:LAMPS},
 {id:'arri-t2-barndoor-4',manufacturer:'ARRI',model:'4-leaf barndoor, True Blue 245 mm / 9.7 in',orderCode:'L2.39870.0',category:'Barndoor',compatibleWith:T2,sourceUrl:CATALOG},
 {id:'arri-t2-scrim-set',manufacturer:'ARRI',model:'Set of 4 scrims 230 mm / 9.1 in',orderCode:'L2.79860.0',category:'Scrim',compatibleWith:T2,sourceUrl:CATALOG},
 {id:'arri-t2-scrim-full-single',manufacturer:'ARRI',model:'Scrim, full single 230 mm / 9.1 in',orderCode:'L2.79860.A',category:'Scrim',compatibleWith:T2,sourceUrl:CATALOG},
 {id:'arri-t2-scrim-full-double',manufacturer:'ARRI',model:'Scrim, full double 230 mm / 9.1 in',orderCode:'L2.79860.B',category:'Scrim',compatibleWith:T2,sourceUrl:CATALOG},
 {id:'arri-t2-scrim-half-double',manufacturer:'ARRI',model:'Scrim, half double 230 mm / 9.1 in',orderCode:'L2.79860.D',category:'Scrim',compatibleWith:T2,sourceUrl:CATALOG},
 {id:'arri-t2-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 230 mm / 9.1 in scrims',orderCode:'L2.88914.1',category:'Bag',compatibleWith:T2,sourceUrl:CATALOG},
 {id:'arri-t2-filter-frame',manufacturer:'ARRI',model:'Filter frame 230 mm / 9.1 in',orderCode:'L2.79890.0',category:'Filter Frame',compatibleWith:T2,sourceUrl:CATALOG},
 {id:'arri-t2-c-clamp',manufacturer:'ARRI',model:'ARRI Swiveling C Clamp (C150)',orderCode:'L2.76989.0',category:'Mounting',compatibleWith:T2,sourceUrl:CATALOG}
];
