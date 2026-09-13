// ARRI True Blue ST Theater tungsten Fresnels and verified compatible equipment.
// Canonical sources: current official ARRI product and accessory pages.
const ST12_SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/true-blue-st-theatre/true-blue-st1-2-theatre';
const ST5_SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/true-blue-st-theatre/true-blue-st5-theatre';

export const ARRI_TRUE_BLUE_ST_THEATER_FIXTURES=[
 {id:'arri-true-blue-st1-2-theater',manufacturer:'ARRI',model:'True Blue ST1/2 Theater',family:'True Blue ST Theater',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:[1000,2000],voltage:'230 V',lampBase:'G38/G22',cct:'3200 K',beamAngle:'11.5-60 deg / 13.5-59 deg (1 kW / 2 kW)',lensDiameterMm:175,accessoryDiameterMm:245,barndoorDiameterMm:245,mount:'Spigot 28 mm / 1 1/8 in',housingColors:['Black'],ipRating:'IP23',mainsPlug:['Bare Ends'],variants:['Manual','Pole-operated'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:ST12_SRC},
 {id:'arri-true-blue-st5-theater',manufacturer:'ARRI',model:'True Blue ST5 Theater',family:'True Blue ST Theater',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:5000,voltage:'230 V',lampBase:'G38',cct:'3200 K',beamAngle:'9-58 deg',lensDiameterMm:300,accessoryDiameterMm:400,barndoorDiameterMm:413,mount:'Spigot 28 mm / 1 1/8 in',housingColors:['Black'],ipRating:'IP23',mainsPlug:['Bare Ends'],variants:['Manual','Motorized'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:ST5_SRC}
];

const ST12=['arri-true-blue-st1-2-theater'];
const ST5=['arri-true-blue-st5-theater'];
export const ARRI_TRUE_BLUE_ST_THEATER_ACCESSORIES=[
 {id:'arri-st12-theater-lamp-1000w',manufacturer:'ARRI',model:'Lamp 1000 W 230 V G22 FKJ CP71 (Osram)',orderCode:'L2.89208.0',category:'Lamp',compatibleWith:ST12,sourceUrl:'https://www.arri.com/en/lighting/accessories/lamps'},
 {id:'arri-st12-theater-barndoor',manufacturer:'ARRI',model:'4-leaf barndoor, True Blue 245 mm / 9.7 in',orderCode:'L2.39870.0',category:'Barndoor',compatibleWith:ST12,sourceUrl:'https://www.arri.com/en/lighting/accessories/barndoors'},
 {id:'arri-st12-theater-filter-frame',manufacturer:'ARRI',model:'Filter frame for Theater cassette 245 mm / 9.7 in',orderCode:'L2.33817.0',category:'Filter Frame',compatibleWith:ST12,sourceUrl:'https://www.arri.com/en/lighting/accessories/filter-frames'},
 {id:'arri-st5-theater-barndoor',manufacturer:'ARRI',model:'4-leaf barndoor, True Blue 413 mm / 16.3 in',orderCode:'L2.41200.0',category:'Barndoor',compatibleWith:ST5,sourceUrl:'https://www.arri.com/en/lighting/accessories/barndoors'},
 {id:'arri-st5-theater-filter-frame',manufacturer:'ARRI',model:'Filter frame 400 mm / 15.8 in',orderCode:'L2.81220.0',category:'Filter Frame',compatibleWith:ST5,sourceUrl:'https://www.arri.com/en/lighting/accessories/filter-frames'}
];
