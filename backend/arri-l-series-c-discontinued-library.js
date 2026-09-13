// Discontinued ARRI L-Series C LED Fresnels and verified compatible accessories.
// Canonical sources: official ARRI discontinued L-Series C pages and ARRI lighting accessory catalog.
const SRC='https://www.arri.com/en/lighting/led-spotlights/discontinued/l-series-c';
const CABLES='https://www.arri.com/en/lighting/accessories/cables';
const LIGHT_CONTROL='https://www.arri.com/en/lighting/accessories/diffusion-spill-rings-snoots-louvers';

export const ARRI_L_SERIES_C_DISCONTINUED_FIXTURES=[
 {id:'arri-l5-c',manufacturer:'ARRI',model:'L5-C',family:'L-Series C',category:'Light',status:'Discontinued',sourceType:'RGBW LED Fresnel',lens:'137 mm / 5 in Fresnel',beamAngle:'14-50°',powerW:115,cct:'2800-10000 K',mount:'16/28 mm Combo Pin',control:{wired:['5-Pin DMX In/Thru','RDM','On-board Controller','Mini-USB'],wireless:['SkyLink receiver (external)'],builtInWirelessDMX:false},battery:'4-Pin XLR, 23-36 V DC',sourceUrl:SRC+'/l5-c'},
 {id:'arri-l7-c',manufacturer:'ARRI',model:'L7-C',family:'L-Series C',category:'Light',status:'Discontinued',sourceType:'RGBW LED Fresnel',lens:'175 mm / 7 in Fresnel',beamAngle:'15-50°',powerW:220,cct:'2800-10000 K',mount:'28 mm Spigot / Junior Pin',control:{wired:['5-Pin DMX In/Thru','RDM','On-board Controller','Mini-USB'],wireless:['SkyLink receiver (external)'],builtInWirelessDMX:false},sourceUrl:SRC+'/l7-c'},
 {id:'arri-l10-c',manufacturer:'ARRI',model:'L10-C',family:'L-Series C',category:'Light',status:'Discontinued',sourceType:'RGBW LED Fresnel',lens:'250 mm / 10 in Fresnel',powerW:400,cct:'2800-10000 K',mount:'28 mm Spigot / Junior Pin',control:{wired:['5-Pin DMX In/Thru','RDM','On-board Controller'],wireless:['SkyLink receiver (external)'],builtInWirelessDMX:false},sourceUrl:SRC+'/l10-c'}
];

const L5=['arri-l5-c'];
const L7=['arri-l7-c'];
const L10=['arri-l10-c'];
const L57=[...L5,...L7];
const ALL=[...L5,...L7,...L10];

export const ARRI_L_SERIES_C_DISCONTINUED_ACCESSORIES=[
 {id:'arri-l-series-c-skylink-receiver',manufacturer:'ARRI',model:'SkyLink Receiver',orderCode:'L2.0016357',category:'Wireless Control',compatibleWith:ALL,sourceUrl:SRC},
 {id:'arri-l-series-c-skylink-range-extender',manufacturer:'ARRI',model:'SkyLink WiFi Range Extender',orderCode:'L2.0019288',category:'Wireless Control',compatibleWith:ALL,sourceUrl:SRC},
 {id:'arri-l5-c-snoot',manufacturer:'ARRI',model:'Snoot 168 mm / 6.6 in',orderCode:'L2.79480.0',category:'Snoot',compatibleWith:L5,sourceUrl:LIGHT_CONTROL},
 {id:'arri-l7-c-snoot',manufacturer:'ARRI',model:'Snoot 197 mm / 7.8 in with variable aperture',orderCode:'L2.79680.0',category:'Snoot',compatibleWith:L7,sourceUrl:LIGHT_CONTROL},
 {id:'arri-l10-c-snoot',manufacturer:'ARRI',model:'Snoot 344 mm / 13.5 in with variable aperture',orderCode:'L2.80975.0',category:'Snoot',compatibleWith:L10,sourceUrl:LIGHT_CONTROL},
 {id:'arri-l10-c-spill-ring',manufacturer:'ARRI',model:'Spill Ring 329 mm / 12.9 in',orderCode:'L2.0008983',category:'Spill Ring',compatibleWith:L10,sourceUrl:LIGHT_CONTROL},
 {id:'arri-l10-c-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 344 mm / 13.5 in',orderCode:'L2.40950.0',category:'Barndoor',compatibleWith:L10,sourceUrl:SRC+'/l10-c'},
 {id:'arri-l10-c-barndoor-4-black-silver',manufacturer:'ARRI',model:'4-leaf Barndoor black/silver 344 mm / 13.5 in',orderCode:'L2.80951.0',category:'Barndoor',compatibleWith:L10,sourceUrl:SRC+'/l10-c'},
 {id:'arri-l10-c-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor True Blue 344 mm / 13.5 in',orderCode:'L2.40960.0',category:'Barndoor',compatibleWith:L10,sourceUrl:SRC+'/l10-c'},
 {id:'arri-l10-c-filter-frame',manufacturer:'ARRI',model:'Filter Frame 330 mm / 13.0 in',orderCode:'L2.80970.0',category:'Filter Frame',compatibleWith:L10,sourceUrl:SRC+'/l10-c'},
 {id:'arri-l-series-c-mains-chinese-3m',manufacturer:'ARRI',model:'Mains Cable 3 m powerCON TRUE1 TOP Chinese with line switch',orderCode:'L2.0003678',category:'Power Cable',compatibleWith:L57,sourceUrl:CABLES},
 {id:'arri-l-series-c-mains-japanese-3m',manufacturer:'ARRI',model:'Mains Cable 3 m powerCON TRUE1 TOP Japanese with line switch',orderCode:'L2.0008904',category:'Power Cable',compatibleWith:L57,sourceUrl:CABLES},
 {id:'arri-l-series-c-mains-bare-3m',manufacturer:'ARRI',model:'Mains Cable 3 m powerCON TRUE1 TOP Bare Ends with line switch',orderCode:'L2.0024627',category:'Power Cable',compatibleWith:L57,sourceUrl:CABLES},
 {id:'arri-l-series-c-mains-edison-7m',manufacturer:'ARRI',model:'Mains Cable 7 m powerCON TRUE1 TOP Edison with line switch',orderCode:'L2.0001487',category:'Power Cable',compatibleWith:L57,sourceUrl:CABLES},
 {id:'arri-l-series-c-mains-schuko-3m',manufacturer:'ARRI',model:'Mains Cable 3 m powerCON TRUE1 TOP Schuko with line switch',orderCode:'L2.0001486',category:'Power Cable',compatibleWith:L57,sourceUrl:CABLES}
];
