// ARRI ARRILITE Plus tungsten open-face lampheads and verified compatible equipment.
// Canonical sources: official ARRI ARRILITE Plus product pages, ARRI EMEAI Product Catalog 2025, and ARRI accessory pages.
const FAMILY='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/arrilite-plus';
const A750='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/arrilite-plus/arrilite-750-plus';
const A2000='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/arrilite-plus/arrilite-2000-plus';
const CATALOG='https://www.arri.com/resource/blob/250174/b4b68d41218d2d1f9dce62062566c252/arri-emeai-product-catalog-data.pdf';
const BARNDOORS='https://www.arri.com/en/lighting/accessories/barndoors';
const SCRIMS='https://www.arri.com/en/lighting/accessories/scrims-scrim-bags';
const SOFTBOX='https://www.arri.com/en/lighting/accessories/softboxes-accessory-holders-speed-rings';
const OTHER='https://www.arri.com/en/lighting/accessories/other-accessories';

export const ARRI_ARRILITE_PLUS_FIXTURES=[
 {id:'arri-arrilite-750-plus',manufacturer:'ARRI',model:'ARRILITE 750 Plus',family:'ARRILITE Plus',category:'Light',sourceType:'Tungsten open face with MAX parabolic facetted reflector',lampPowerW:'375/575/600/650/750/800',beamAngle:'21-73°',cct:'3200 K',lampBase:'G9.5',voltage:'100-240 V',mount:'Socket 16 mm / 5/8 in',ipRating:'IP20',orderCodes:['L0.0034720','L0.0034721'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:A750},
 {id:'arri-arrilite-2000-plus',manufacturer:'ARRI',model:'ARRILITE 2000 Plus',family:'ARRILITE Plus',category:'Light',sourceType:'Tungsten open face with MAX parabolic facetted reflector',lampPowerW:2000,beamAngle:'24-63°',cct:'3200 K',lampBase:'RX7s',voltage:'220-240 V',mount:'Socket 16 mm / 5/8 in',ipRating:'IP20',orderCodes:['L0.0034722','L1.36500.B','L1.36500.D'],control:{wired:['0-100% via external dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:A2000}
];

const A750IDS=['arri-arrilite-750-plus'];
const A2000IDS=['arri-arrilite-2000-plus'];
export const ARRI_ARRILITE_PLUS_ACCESSORIES=[
 {id:'arri-arrilite-750-barndoor',manufacturer:'ARRI',model:'4-leaf Barndoor 168 mm / 6.6 in',orderCode:'L2.79470.0',category:'Barndoor',compatibleWith:A750IDS,sourceUrl:BARNDOORS},
 {id:'arri-arrilite-750-scrim-set',manufacturer:'ARRI',model:'Set of 4 Scrims 168 mm / 6.6 in',orderCode:'L2.79460.0',category:'Scrim',compatibleWith:A750IDS,sourceUrl:SCRIMS},
 {id:'arri-arrilite-750-scrim-a',manufacturer:'ARRI',model:'Scrim full single 168 mm / 6.6 in',orderCode:'L2.79460.A',category:'Scrim',compatibleWith:A750IDS,sourceUrl:SCRIMS},
 {id:'arri-arrilite-750-scrim-b',manufacturer:'ARRI',model:'Scrim full double 168 mm / 6.6 in',orderCode:'L2.79460.B',category:'Scrim',compatibleWith:A750IDS,sourceUrl:SCRIMS},
 {id:'arri-arrilite-750-scrim-c',manufacturer:'ARRI',model:'Scrim half single 168 mm / 6.6 in',orderCode:'L2.79460.C',category:'Scrim',compatibleWith:A750IDS,sourceUrl:CATALOG},
 {id:'arri-arrilite-750-scrim-d',manufacturer:'ARRI',model:'Scrim half double 168 mm / 6.6 in',orderCode:'L2.79460.D',category:'Scrim',compatibleWith:A750IDS,sourceUrl:CATALOG},
 {id:'arri-arrilite-750-scrim-bag',manufacturer:'ARRI',model:'Scrim Bag for 168 mm / 6.6 in scrims',orderCode:'L2.88912.1',category:'Bag',compatibleWith:A750IDS,sourceUrl:CATALOG},
 {id:'arri-arrilite-750-accessory-holder',manufacturer:'ARRI',model:'Accessory Holder',orderCode:'L2.36780.0',category:'Accessory Holder',compatibleWith:A750IDS,sourceUrl:SOFTBOX},
 {id:'arri-arrilite-750-chimera',manufacturer:'ARRI',model:'Chimera Lightbank Video Pro Plus S 24 x 32 in',orderCode:'L2.70844.0',category:'Softbox',compatibleWith:A750IDS,sourceUrl:CATALOG},
 {id:'arri-arrilite-750-lamp-cooling-adapter',manufacturer:'ARRI',model:'Lamp Cooling Adapter',orderCode:'L2.36770.0',category:'Lamp Adapter',compatibleWith:A750IDS,sourceUrl:OTHER},
 {id:'arri-arrilite-750-stud',manufacturer:'ARRI',model:'Stud 16 mm with 3/8 in thread',orderCode:'L2.76986.0',category:'Grip',compatibleWith:A750IDS,sourceUrl:CATALOG},
 {id:'arri-arrilite-2000-barndoor',manufacturer:'ARRI',model:'4-leaf Barndoor 250 mm / 9.8 in',orderCode:'L2.76522.0',category:'Barndoor',compatibleWith:A2000IDS,sourceUrl:BARNDOORS}
];

export const ARRI_ARRILITE_PLUS_META={family:'ARRILITE Plus',sourceUrl:FAMILY};
