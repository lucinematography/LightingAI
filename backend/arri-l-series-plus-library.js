// ARRI L-Series Plus current LED Fresnel fixtures and official compatible accessories.
// Official sources: ARRI L-Series Plus product, tech-spec and accessories pages.
const SRC='https://www.arri.com/en/lighting/led-spotlights/l-series-plus';
const ACC='https://www.arri.com/en/lighting/led-spotlights/l-series-plus/accessories';

export const ARRI_L_SERIES_PLUS_FIXTURES=[
 {id:'arri-l5-c-plus',manufacturer:'ARRI',model:'L5-C Plus',family:'L-Series Plus',category:'Light',sourceType:'RGBW LED Fresnel',lensDiameterIn:5,powerDrawW:135,ipRating:'IP20',control:{wired:['DMX-512A via adapter','RDM','Art-Net','sACN','Ethernet','SkyPanel Remote via USB-A'],wireless:['third-party receiver'],builtInWirelessDMX:false},variants:{housing:['blue/silver','black'],yoke:['manual','pole operated']},sourceUrl:SRC},
 {id:'arri-l7-c-plus',manufacturer:'ARRI',model:'L7-C Plus',family:'L-Series Plus',category:'Light',sourceType:'RGBW LED Fresnel',lensDiameterIn:7,powerDrawW:220,ipRating:'IP20',control:{wired:['DMX-512A via adapter','RDM','Art-Net','sACN','Ethernet','SkyPanel Remote via USB-A'],wireless:['third-party receiver'],builtInWirelessDMX:false},variants:{housing:['blue/silver','black'],yoke:['manual','pole operated']},sourceUrl:SRC}
];

const BOTH=['arri-l5-c-plus','arri-l7-c-plus'];
export const ARRI_L_SERIES_PLUS_ACCESSORIES=[
 {id:'arri-l5-plus-snoot-168',manufacturer:'ARRI',model:'Snoot 168 mm / 6.6 in',orderCode:'L2.79480.0',category:'Snoot',compatibleWith:['arri-l5-c-plus'],sourceUrl:ACC},
 {id:'arri-l7-plus-snoot-197',manufacturer:'ARRI',model:'Snoot 197 mm / 7.8 in with variable aperture',orderCode:'L2.79680.0',category:'Snoot',compatibleWith:['arri-l7-c-plus'],sourceUrl:ACC},
 {id:'arri-l5-plus-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor 168 mm / 6.6 in',orderCode:'L2.79470.0',category:'Barndoor',compatibleWith:['arri-l5-c-plus'],sourceUrl:ACC},
 {id:'arri-l5-plus-barndoor-4-bs',manufacturer:'ARRI',model:'4-leaf Barndoor black/silver 168 mm / 6.6 in',orderCode:'L2.79471.0',category:'Barndoor',compatibleWith:['arri-l5-c-plus'],sourceUrl:ACC},
 {id:'arri-l5-plus-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor 168 mm / 6.6 in',orderCode:'L2.79500.0',category:'Barndoor',compatibleWith:['arri-l5-c-plus'],sourceUrl:ACC},
 {id:'arri-l7-plus-barndoor-4',manufacturer:'ARRI',model:'4-leaf Barndoor True Blue 197 mm / 7.8 in',orderCode:'L2.39670.0',category:'Barndoor',compatibleWith:['arri-l7-c-plus'],sourceUrl:ACC},
 {id:'arri-l7-plus-barndoor-8',manufacturer:'ARRI',model:'8-leaf Barndoor True Blue 197 mm / 7.8 in',orderCode:'L2.39700.0',category:'Barndoor',compatibleWith:['arri-l7-c-plus'],sourceUrl:ACC},
 {id:'arri-l5-plus-filter-frame',manufacturer:'ARRI',model:'Filter Frame 168 mm / 6.6 in',orderCode:'L2.79490.0',category:'Filter Frame',compatibleWith:['arri-l5-c-plus'],sourceUrl:ACC},
 {id:'arri-l7-plus-filter-frame',manufacturer:'ARRI',model:'Filter Frame 197 mm / 7.8 in',orderCode:'L2.79690.0',category:'Filter Frame',compatibleWith:['arri-l7-c-plus'],sourceUrl:ACC},
 {id:'arri-l5-plus-chimera',manufacturer:'ARRI',model:'Chimera Lightbank Video Pro Plus S incl. 3 front screens (8125)',orderCode:'L2.70844.0',category:'Softbox',compatibleWith:['arri-l5-c-plus'],sourceUrl:ACC},
 {id:'arri-lplus-dmx-2-5m',manufacturer:'ARRI',model:'DMX Data Cable 2.5 m XLR 5',orderCode:'L2.0033530',category:'Control Cable',compatibleWith:BOTH,sourceUrl:ACC},
 {id:'arri-lplus-dmx-5m',manufacturer:'ARRI',model:'DMX Data Cable 5 m XLR 5',orderCode:'L2.0033531',category:'Control Cable',compatibleWith:BOTH,sourceUrl:ACC},
 {id:'arri-lplus-dmx-10m',manufacturer:'ARRI',model:'DMX Data Cable 10 m XLR 5',orderCode:'L2.0033532',category:'Control Cable',compatibleWith:BOTH,sourceUrl:ACC},
 {id:'arri-l5-plus-stand-compact',manufacturer:'ARRI',model:'Compact ARRI Kit Stand LS.01 (050MKA)',orderCode:'L2.76965.0',category:'Stand',compatibleWith:['arri-l5-c-plus'],sourceUrl:ACC},
 {id:'arri-l5-plus-stand-medium',manufacturer:'ARRI',model:'Medium ARRI Kit Stand LS.2 (050A)',orderCode:'L2.76976.0',category:'Stand',compatibleWith:['arri-l5-c-plus'],sourceUrl:ACC},
 {id:'arri-l7-plus-master-stand',manufacturer:'ARRI',model:'Master Stand (1004BAC)',orderCode:'L2.8803653',category:'Stand',compatibleWith:['arri-l7-c-plus'],sourceUrl:ACC}
];