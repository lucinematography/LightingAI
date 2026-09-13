// ARRI Compact Theater discontinued daylight Fresnels and verified compatible equipment.
// Canonical sources: official ARRI discontinued Compact Theater pages and ARRI EMEAI Product Catalog 2022.
const FAMILY='https://www.arri.com/en/lighting/daylight-tungsten/daylight/discontinued/compact-theater';
const C2500='https://www.arri.com/en/lighting/daylight-tungsten/daylight/discontinued/compact-theater/compact-2500-theatre';
const C4000='https://www.arri.com/en/lighting/daylight-tungsten/daylight/discontinued/compact-theater/compact-4000-theater';
const CATALOG='https://www.arri.com/resource/blob/250184/1b2b3d6452111a54907ddb1df6a2568a/arri-emeai-product-catalog-2022-en-v1-1-data.pdf';

export const ARRI_COMPACT_THEATER_DISCONTINUED_FIXTURES=[
 {id:'arri-compact-2500-theater',manufacturer:'ARRI',model:'Compact 2500 Theater',family:'Compact Theater',category:'Light',status:'Discontinued',sourceType:'HMI daylight Fresnel',lampPowerW:2500,beamAngle:'7-59°',cct:'6000 K',lampBase:'G38',mount:'Spigot 28 mm / 1 1/8 in',connector:'VEAM / Schaltbau (GTV standard)',ipRating:'IP23',accessoryDiameterMm:330,barndoorDiameterMm:344,control:{wired:['Dimming 50-100% via compatible ARRI electronic ballast'],wireless:[],builtInWirelessDMX:false},sourceUrl:C2500},
 {id:'arri-compact-4000-theater',manufacturer:'ARRI',model:'Compact 4000 Theater',family:'Compact Theater',category:'Light',status:'Discontinued',sourceType:'HMI daylight Fresnel',lampPowerW:4000,beamAngle:'7-65°',cct:'6000 K',lampBase:'G38',mount:'Spigot 28 mm / 1 1/8 in',connector:'VEAM / Schaltbau (GTV standard)',ipRating:'IP23',accessoryDiameterMm:400,barndoorDiameterMm:413,control:{wired:['Dimming 50-100% via compatible ARRI electronic ballast'],wireless:[],builtInWirelessDMX:false},sourceUrl:C4000}
];

const BOTH=['arri-compact-2500-theater','arri-compact-4000-theater'];
export const ARRI_COMPACT_THEATER_DISCONTINUED_ACCESSORIES=[
 {id:'arri-compact-theater-eb-2-5-4-basic',manufacturer:'ARRI',model:'EB 2.5/4 Basic',category:'Ballast',compatibleWith:BOTH,sourceUrl:CATALOG},
 {id:'arri-compact-2500-theater-cassette',manufacturer:'ARRI',model:'Theater Cassette for Compact 2500 Theater',category:'Theater Cassette',compatibleWith:['arri-compact-2500-theater'],sourceUrl:CATALOG},
 {id:'arri-compact-4000-theater-cassette',manufacturer:'ARRI',model:'Theater Cassette for Compact 4000 Theater',category:'Theater Cassette',compatibleWith:['arri-compact-4000-theater'],sourceUrl:CATALOG}
];

export const ARRI_COMPACT_THEATER_DISCONTINUED_META={family:'Compact Theater',status:'Discontinued',sourceUrl:FAMILY};
