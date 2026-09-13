// ARRI X / ARRI X Theater discontinued daylight lampheads.
// Canonical source: official ARRI discontinued product page and ballast documentation.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/discontinued/arri-x-x-theater';
const BALLASTS='https://www.arri.com/en/lighting/daylight-tungsten/daylight/ballasts/discontinued';

const base=(id,model,lampPowerW)=>({id,manufacturer:'ARRI',model,family:'ARRI X / X Theater',category:'Light',sourceType:'Daylight open-face',lampPowerW,cct:'Daylight discharge',discontinued:true,discontinuedYear:2017,control:{wired:['via compatible ARRI electronic ballast'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC});

export const ARRI_X_SERIES_DISCONTINUED_FIXTURES=[
 base('arri-x5','ARRI X5',575),
 base('arri-x12','ARRI X12',1200),
 base('arri-x40-25','ARRI X40/25',4000),
 base('arri-x60','ARRI X60',6000),
 {...base('arri-x40-25-theater','ARRI X40/25 Theater',4000),sourceType:'Daylight open-face Theater'}
];

const X5=['arri-x5'];
const X12=['arri-x12'];
const X4025=['arri-x40-25','arri-x40-25-theater'];
const X60=['arri-x60'];
const ALL=['arri-x5','arri-x12','arri-x40-25','arri-x60','arri-x40-25-theater'];

export const ARRI_X_SERIES_DISCONTINUED_ACCESSORIES=[
 {id:'arri-x-frosted-uv-safety-glass',manufacturer:'ARRI',model:'Frosted UV Safety Glass',category:'Optics',compatibleWith:ALL,sourceUrl:SRC},
 {id:'arri-x-black-reflector',manufacturer:'ARRI',model:'Interchangeable Black Reflector',category:'Reflector',compatibleWith:ALL,sourceUrl:SRC},
 {id:'arri-x5-eb-575-1200',manufacturer:'ARRI',model:'EB 575/1200',category:'Ballast',compatibleWith:X5,sourceUrl:BALLASTS},
 {id:'arri-x12-eb-575-1200',manufacturer:'ARRI',model:'EB 575/1200',category:'Ballast',compatibleWith:X12,sourceUrl:BALLASTS},
 {id:'arri-x4025-eb-25-4',manufacturer:'ARRI',model:'EB 2.5/4',category:'Ballast',compatibleWith:X4025,sourceUrl:BALLASTS},
 {id:'arri-x60-eb-6',manufacturer:'ARRI',model:'EB 6000',category:'Ballast',compatibleWith:X60,sourceUrl:BALLASTS}
];
