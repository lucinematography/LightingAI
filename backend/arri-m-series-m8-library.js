// ARRI M-Series M8 daylight fixture and verified compatible equipment.
// Canonical sources: official ARRI M8 data sheet, Lighting Product Catalog 2025, lamps and Daylight Sets pages.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/m-series/m8';
const CATALOG='https://www.arri.com/resource/blob/250174/f6e4b0aa8cdccc863173d7b1de438c36/arri-emeai-product-catalog-2024-en-v1-0-data.pdf';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const SETS='https://www.arri.com/en/lighting/kits/daylight-sets';

export const ARRI_M_SERIES_M8_FIXTURES=[
 {id:'arri-m8',manufacturer:'ARRI',model:'M8',family:'M-Series',category:'Light',sourceType:'HMI daylight open-face with MAX Technology reflector',lampPowerW:800,beamAngle:'15-60°',cct:'Daylight',mount:'Manual, blue/silver',connector:'International (VEAM), 0.5 m cable outlet',ipRating:'IP23',orderCode:'L1.37200.B',control:{wired:['DMX512 via compatible ARRI EB MAX ballast'],wireless:[],directLightingAI:[],standardRoutes:[{id:'arri-eb-max-dmx-ballast',input:['DMX512'],interface:'Compatible ARRI EB MAX ballast',output:'Ballast-controlled HMI lamp power',verified:true,sourceUrl:'https://www.arri.com/resource/blob/189028/08491e735ef655fc505f1a8d26d4936c/eb-max-range-dmx-channel-settings-data.pdf'}],externalInterfaceRequired:['Compatible ARRI EB MAX ballast','Art-Net/sACN-to-DMX gateway for LightingAI network output'],builtInWirelessDMX:false},dmxModes:[{name:'EB MAX Flicker Free 75 Hz 3ch',channels:3,verified:true,sourceUrl:'https://www.arri.com/resource/blob/189028/08491e735ef655fc505f1a8d26d4936c/eb-max-range-dmx-channel-settings-data.pdf',requiredChannels:[{channel:2,value:128,label:'ON · Flicker Free 75 Hz'},{channel:3,value:0,label:'Frequency channel unused in Mode 1'}],controls:[{key:'dimmer',label:'Ballast dimmer',channel:1,type:'percent',min:50,max:100,dmxMin:128,dmxMax:255}]}],sourceUrl:SRC}
];

const M8=['arri-m8'];
export const ARRI_M_SERIES_M8_ACCESSORIES=[
 {id:'arri-m8-lamp-800w',manufacturer:'ARRI',model:'HMI Digital 800 W/SEL G22 UVS (Osram)',orderCode:'L2.37240.0',category:'Lamp',compatibleWith:M8,sourceUrl:LAMPS},
 {id:'arri-m8-eb-max-1-8',manufacturer:'ARRI',model:'EB MAX 1.8, 575/800/1200/1800 W, ALF CCL DMX AutoScan',orderCode:'L2.0014190',category:'Ballast',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-eb-575-800-hs-schuko',manufacturer:'ARRI',model:'EB 575/800 HS, ALF CCL DMX, 50/60/75/1000 Hz, Schuko',orderCode:'L2.76184KH',category:'Ballast',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-eb-575-800-hs-bare',manufacturer:'ARRI',model:'EB 575/800 HS, ALF CCL DMX, 50/60/75/1000 Hz, Bare Ends',orderCode:'L2.0001687',category:'Ballast',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 245 mm / 9.7 in',orderCode:'L2.39870.0',category:'Barndoor',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 230 mm / 9.1 in',orderCode:'L2.79860.0',category:'Scrim',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-scrim-full-single',manufacturer:'ARRI',model:'Scrim Full Single 230 mm / 9.1 in',orderCode:'L2.79860.A',category:'Scrim',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-scrim-full-double',manufacturer:'ARRI',model:'Scrim Full Double 230 mm / 9.1 in',orderCode:'L2.79860.B',category:'Scrim',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-scrim-half-single',manufacturer:'ARRI',model:'Scrim Half Single 230 mm / 9.1 in',orderCode:'L2.79860.C',category:'Scrim',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-scrim-half-double',manufacturer:'ARRI',model:'Scrim Half Double 230 mm / 9.1 in',orderCode:'L2.79860.D',category:'Scrim',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-spill-ring',manufacturer:'ARRI',model:'Spill Ring 230 mm / 9.1 in',orderCode:'L2.37207.0',category:'Spill Ring',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-filter-frame',manufacturer:'ARRI',model:'Filter Frame 230 mm / 9.1 in',orderCode:'L2.79890.0',category:'Filter Frame',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-chimera-lightbank',manufacturer:'ARRI',model:'Chimera Lightbank Quartz Plus M incl. 3 front screens',orderCode:'L2.89055.0',category:'Softbox',compatibleWith:M8,sourceUrl:CATALOG},
 {id:'arri-m8-head-ballast-7m',manufacturer:'ARRI',model:'Head-to-Ballast Cable 575/800/1200/1800 W, 7 m',category:'Cable',compatibleWith:M8,sourceUrl:SETS}
];
