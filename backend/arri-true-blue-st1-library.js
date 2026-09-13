// ARRI True Blue ST1 studio tungsten Fresnel.
// Official ARRI product data; accessories are limited to compatibility verified from current ARRI data.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/true-blue-st/true-blue-st1';
const ACCESSORIES='https://www.arri.com/en/lighting/accessories';

export const ARRI_TRUE_BLUE_ST1_FIXTURES=[
 {
  id:'arri-true-blue-st1',manufacturer:'ARRI',model:'True Blue ST1',family:'True Blue ST',category:'Light',sourceType:'Tungsten Fresnel',
  lampPowerW:1000,voltage:'100-240 V',lampBase:'G22',cct:'3200 K',beamAngle:'8.3-53 deg',accessoryDiameterMm:230,barndoorDiameterMm:245,
  mount:'Spigot 28 mm / 1 1/8 in',housingColors:['Blue/Silver','Black'],ipRating:'IP23',mainsPlug:['Schuko','Bare Ends'],
  variants:['Manual','Pole-operated','Location'],
  control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC
 }
];

const ST1=['arri-true-blue-st1'];
export const ARRI_TRUE_BLUE_ST1_ACCESSORIES=[
 {id:'arri-st1-lamp-1000w',manufacturer:'ARRI',model:'Lamp 1000 W 230 V G22 FKJ CP71 (Osram)',orderCode:'L2.89208.0',category:'Lamp',compatibleWith:ST1,sourceUrl:'https://www.arri.com/en/lighting/accessories/lamps'},
 // ST1 uses the 230 mm scrim / 245 mm barndoor accessory class. Exact order-code entries are added only when verified against current ARRI catalog pages.
 {id:'arri-st1-barndoor-245',manufacturer:'ARRI',model:'Barndoor 245 mm for True Blue ST1',category:'Barndoor',compatibleWith:ST1,sourceUrl:ACCESSORIES},
 {id:'arri-st1-scrim-230',manufacturer:'ARRI',model:'Scrim 230 mm for True Blue ST1',category:'Scrim',compatibleWith:ST1,sourceUrl:ACCESSORIES}
];
