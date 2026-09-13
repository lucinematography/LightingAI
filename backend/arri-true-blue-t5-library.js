// ARRI True Blue T5 tungsten Fresnel and verified compatible equipment.
// Canonical source: ARRI EMEAI product catalog and official ARRI True Blue T family.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/true-blue-t';
const CATALOG='https://www.arri.com/en/lighting';

export const ARRI_TRUE_BLUE_T5_FIXTURES=[
 {id:'arri-true-blue-t5-blue',manufacturer:'ARRI',model:'True Blue T5 blue/silver',family:'True Blue T',category:'Light',orderCode:'L0.40000.B',sourceType:'Tungsten Fresnel',lampPowerW:5000,cct:'3200 K',mount:'Spigot 28 mm',control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-true-blue-t5-black',manufacturer:'ARRI',model:'True Blue T5 black',family:'True Blue T',category:'Light',orderCode:'L0.40005.B',sourceType:'Tungsten Fresnel',lampPowerW:5000,cct:'3200 K',mount:'Spigot 28 mm',control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const T5=ARRI_TRUE_BLUE_T5_FIXTURES.map(f=>f.id);
export const ARRI_TRUE_BLUE_T5_ACCESSORIES=[
 {id:'arri-t5-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor for True Blue T5',orderCode:'L2.40950.0',category:'Barndoor',compatibleWith:T5,sourceUrl:CATALOG},
 {id:'arri-t5-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor for True Blue T5',orderCode:'L2.40960.0',category:'Barndoor',compatibleWith:T5,sourceUrl:CATALOG},
 {id:'arri-t5-scrim-set',manufacturer:'ARRI',model:'Set of Scrims 330 mm',orderCode:'L2.80980.0',category:'Scrim',compatibleWith:T5,sourceUrl:CATALOG},
 {id:'arri-t5-scrim-full-single',manufacturer:'ARRI',model:'Scrim full single 330 mm',orderCode:'L2.80980.A',category:'Scrim',compatibleWith:T5,sourceUrl:CATALOG},
 {id:'arri-t5-scrim-full-double',manufacturer:'ARRI',model:'Scrim full double 330 mm',orderCode:'L2.80980.B',category:'Scrim',compatibleWith:T5,sourceUrl:CATALOG},
 {id:'arri-t5-scrim-half-double',manufacturer:'ARRI',model:'Scrim half double 330 mm',orderCode:'L2.80980.D',category:'Scrim',compatibleWith:T5,sourceUrl:CATALOG},
 {id:'arri-t5-filter-frame',manufacturer:'ARRI',model:'Filter Frame for True Blue T5',orderCode:'L2.80970.0',category:'Filter Frame',compatibleWith:T5,sourceUrl:CATALOG},
 {id:'arri-t5-snoot',manufacturer:'ARRI',model:'Snoot for True Blue T5',orderCode:'L2.80975.0',category:'Snoot',compatibleWith:T5,sourceUrl:CATALOG},
 {id:'arri-t5-speed-ring',manufacturer:'ARRI',model:'Speed Ring for True Blue T5',orderCode:'L2.76247.0',category:'Softbox Mount',compatibleWith:T5,sourceUrl:CATALOG},
 {id:'arri-t5-c-clamp',manufacturer:'ARRI',model:'ARRI Swiveling C Clamp (C150)',orderCode:'L2.76989.0',category:'Mounting',compatibleWith:T5,sourceUrl:CATALOG},
 {id:'arri-t5-safety-cable',manufacturer:'ARRI',model:'Safety Cable',orderCode:'L2.0007590',category:'Safety',compatibleWith:T5,sourceUrl:CATALOG}
];
