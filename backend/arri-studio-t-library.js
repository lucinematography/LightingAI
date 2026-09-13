// ARRI STUDIO T high-power tungsten Fresnels.
// Canonical sources: current official ARRI STUDIO T product pages.
const FAMILY_SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/studio-t';
const T12_SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/studio-t/studio-t12';
const T24_SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/studio-t/studio-t24';

export const ARRI_STUDIO_T_FIXTURES=[
 {id:'arri-studio-t12',manufacturer:'ARRI',model:'STUDIO T12',family:'STUDIO T',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:12000,voltage:'230 V',cct:'3200 K',mount:'Spigot 28 mm / 1 1/8 in',control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:T12_SRC},
 {id:'arri-studio-t24',manufacturer:'ARRI',model:'STUDIO T24',family:'STUDIO T',category:'Light',sourceType:'Tungsten Fresnel',lampPowerW:[20000,24000],voltage:'230 V',lampBase:'G38',cct:'3200 K',beamAngle:'14-55 deg',lensDiameterMm:625,accessoryDiameterMm:740,barndoorDiameterMm:740,mount:'Spigot 28 mm / 1 1/8 in',housingColors:['Blue/Silver'],ipRating:'IP20',mainsPlug:['VEAM'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:T24_SRC}
];

const T12=['arri-studio-t12'];
const T24=['arri-studio-t24'];
export const ARRI_STUDIO_T_ACCESSORIES=[
 {id:'arri-studio-t12-compatible-equipment',manufacturer:'ARRI',model:'STUDIO T12 compatible light-control equipment',category:'Accessory',compatibleWith:T12,sourceUrl:FAMILY_SRC},
 {id:'arri-studio-t24-compatible-equipment',manufacturer:'ARRI',model:'STUDIO T24 compatible light-control equipment',category:'Accessory',compatibleWith:T24,sourceUrl:FAMILY_SRC}
];
