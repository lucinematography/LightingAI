// ARRI True Blue D40 daylight Fresnel and verified compatible equipment.
// Canonical sources: official ARRI EMEAI Product Catalog 2025, current accessories and Daylight Sets.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/true-blue-d';
const CATALOG='https://www.arri.com/resource/blob/250174/f6e4b0aa8cdccc863173d7b1de438c36/arri-emeai-product-catalog-2024-en-v1-0-data.pdf';
const SCRIMS='https://www.arri.com/en/lighting/accessories/scrims-scrim-bags';
const BARNDOORS='https://www.arri.com/en/lighting/accessories/barndoors';
const SETS='https://www.arri.com/en/lighting/kits/daylight-sets';

export const ARRI_TRUE_BLUE_D40_FIXTURES=[
 {id:'arri-true-blue-d40',manufacturer:'ARRI',model:'True Blue D40',family:'True Blue D',category:'Light',sourceType:'HMI daylight Fresnel',lampPowerW:4000,cct:'Daylight',mount:'Spigot 28 mm / 1 1/8 in',connector:'International (VEAM)',ipRating:'IP23',orderCode:'L1.34000.B',control:{wired:['DMX512 via ARRI EB MAX 2.5/4 ballast'],wireless:[],directLightingAI:[],externalInterfaceRequired:['ARRI EB MAX 2.5/4 ballast'],builtInWirelessDMX:false,sourceUrls:[SRC,CATALOG,'https://www.arri.com/resource/blob/31448/bc5856bd85e1db931bae4b20c89032ca/arri-eb-max-2-5-4-manual-de-en-data.pdf']},dmxModes:[{name:'EB MAX 2.5/4 · Flicker Free 75 Hz · 2ch',channels:2,verified:true,sourceUrl:'https://www.arri.com/resource/blob/31448/bc5856bd85e1db931bae4b20c89032ca/arri-eb-max-2-5-4-manual-de-en-data.pdf',controls:[{key:'dimmer',label:'Lamp Power',channel:1,type:'percent',min:50,max:100,dmxMin:128,dmxMax:255},{key:'powerMode',label:'Ballast Power / Mode',channel:2,type:'enum',fade:'snap-at-end',choices:[{value:0,label:'OFF',labelSr:'ISKLJUČENO',dmxValue:0},{value:1,label:'ON · Flicker Free 75 Hz',labelSr:'UKLJUČENO · Flicker Free 75 Hz',dmxValue:128}]}],profileConfiguration:{ballast:'ARRI EB MAX 2.5/4',channel3Unused:true,defaultSafeState:'OFF',rationale:'ARRI EB MAX 2.5/4 manual defines CH1 dimming, CH2 ON/OFF + mode and CH3 frequency. In Flicker Free 75 Hz mode the profile does not use CH3, so LightingAI reserves a safe 2-channel semantic profile and leaves the ballast OFF until explicitly enabled.'}}],sourceUrl:SRC}
];

const D40=['arri-true-blue-d40'];
export const ARRI_TRUE_BLUE_D40_ACCESSORIES=[
 {id:'arri-d40-eb-max-2-5-4',manufacturer:'ARRI',model:'EB MAX 2.5/4, ALF CCL DMX AutoScan',orderCode:'L2.0016746',category:'Ballast',compatibleWith:D40,sourceUrl:CATALOG},
 {id:'arri-d40-eb-2-5-4',manufacturer:'ARRI',model:'EB 2.5/4, ALF, 50/60/75 Hz, International (VEAM)',orderCode:'L2.76640.0',category:'Ballast',compatibleWith:D40,sourceUrl:CATALOG},
 {id:'arri-d40-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 413 mm / 16.3 in',orderCode:'L2.41200.0',category:'Barndoor',compatibleWith:D40,sourceUrl:BARNDOORS},
 {id:'arri-d40-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 400 mm / 15.8 in',orderCode:'L2.81230.0',category:'Scrim',compatibleWith:D40,sourceUrl:SCRIMS},
 {id:'arri-d40-scrim-full-single',manufacturer:'ARRI',model:'Scrim Full Single 400 mm / 15.8 in',orderCode:'L2.81230.A',category:'Scrim',compatibleWith:D40,sourceUrl:SCRIMS},
 {id:'arri-d40-scrim-full-double',manufacturer:'ARRI',model:'Scrim Full Double 400 mm / 15.8 in',orderCode:'L2.81230.B',category:'Scrim',compatibleWith:D40,sourceUrl:SCRIMS},
 {id:'arri-d40-scrim-half-double',manufacturer:'ARRI',model:'Scrim Half Double 400 mm / 15.8 in',orderCode:'L2.81230.D',category:'Scrim',compatibleWith:D40,sourceUrl:SCRIMS},
 {id:'arri-d40-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 400 mm / 15.8 in scrims',orderCode:'L2.88916.1',category:'Bag',compatibleWith:D40,sourceUrl:SCRIMS},
 {id:'arri-d40-filter-frame',manufacturer:'ARRI',model:'Filter Frame 400 mm / 15.8 in',orderCode:'L2.81220.0',category:'Filter Frame',compatibleWith:D40,sourceUrl:CATALOG},
 {id:'arri-d40-variable-snoot',manufacturer:'ARRI',model:'Snoot 413 mm / 16.3 in with variable aperture',orderCode:'L2.81225.0',category:'Snoot',compatibleWith:D40,sourceUrl:CATALOG},
 {id:'arri-d40-speed-ring',manufacturer:'ARRI',model:'Speed Ring circular (9365) 411 mm / 16.2 in',orderCode:'L2.89062.0',category:'Speed Ring',compatibleWith:D40,sourceUrl:CATALOG},
 {id:'arri-d40-head-ballast-7m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 2500/4000 W, 7 m, International connector (VEAM)',category:'Cable',compatibleWith:D40,sourceUrl:SETS},
 {id:'arri-d40-eb-max-set',manufacturer:'ARRI',model:'D40 EB MAX Set',orderCode:'L0.0019663',category:'Set',compatibleWith:D40,sourceUrl:SETS},
 {id:'arri-d40-basic-set',manufacturer:'ARRI',model:'D40 Basic Set',orderCode:'L0.34000.X',category:'Set',compatibleWith:D40,sourceUrl:SETS}
];
