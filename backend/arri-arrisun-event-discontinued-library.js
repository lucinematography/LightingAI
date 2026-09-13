// ARRI ARRISUN Event discontinued daylight fixtures and verified compatible equipment.
// Canonical sources: official ARRI ARRISUN Event, Event accessories, lamps, lenses, barndoors, grip and discontinued Event ballast pages.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/discontinued/arrisun-event';
const EVENT='https://www.arri.com/en/lighting/accessories/event-accessories-adapters';
const LAMPS='https://www.arri.com/en/lighting/accessories/lamps';
const LENSES='https://www.arri.com/en/lighting/accessories/lenses';
const BARNDOORS='https://www.arri.com/en/lighting/accessories/barndoors';
const GRIP='https://www.arri.com/en/lighting/accessories/grip';
const BALLASTS='https://www.arri.com/en/lighting/daylight-tungsten/daylight/ballasts/discontinued';
const OTHER='https://www.arri.com/en/lighting/accessories/other-accessories';
const SOFTBOX='https://www.arri.com/en/lighting/accessories/softboxes-accessory-holders-speed-rings';

export const ARRI_ARRISUN_EVENT_DISCONTINUED_FIXTURES=[
 {id:'arri-arrisun-5-event',manufacturer:'ARRI',model:'ARRISUN 5 Event',family:'ARRISUN Event',category:'Light',status:'discontinued',discontinuedYear:2022,sourceType:'HMI daylight Event lamphead with dichroic facetted glass reflector',lampPowerW:'575',control:{wired:['Dedicated EVENT electronic ballast; DMX remote switching and 50% dimming'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-arrisun-18-event',manufacturer:'ARRI',model:'ARRISUN 18 Event',family:'ARRISUN Event',category:'Light',status:'discontinued',discontinuedYear:2022,sourceType:'HMI daylight Event lamphead with dichroic facetted glass reflector',lampPowerW:'1200/1800',control:{wired:['Dedicated EVENT electronic ballast; DMX remote switching and 50% dimming'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const AS5E=['arri-arrisun-5-event'];
const AS18E=['arri-arrisun-18-event'];
const BOTH=[...AS5E,...AS18E];
export const ARRI_ARRISUN_EVENT_DISCONTINUED_ACCESSORIES=[
 {id:'arri-as5-event-lamp-575-koto',manufacturer:'ARRI',model:'Lamp DIS 575 W/SE G22 UV-B (Koto)',orderCode:'L2.0003874',category:'Lamp',compatibleWith:AS5E,sourceUrl:LAMPS},
 {id:'arri-as18-event-lamp-1200-koto',manufacturer:'ARRI',model:'Lamp DIS 1200 W/SE G38 UV-B (Koto)',orderCode:'L2.0003885',category:'Lamp',compatibleWith:AS18E,sourceUrl:LAMPS},
 {id:'arri-as18-event-lamp-1200-osram',manufacturer:'ARRI',model:'Lamp HMI Digital 1200 W/SE G38 UVS (Osram)',orderCode:'L2.89254L0',category:'Lamp',compatibleWith:AS18E,sourceUrl:LAMPS},
 {id:'arri-as5-event-lens-set',manufacturer:'ARRI',model:'4 DROP-IN lens set 175 mm (spot, narrow flood, flood, super flood)',orderCode:'L0.77863.0',category:'Lens',compatibleWith:AS5E,sourceUrl:LENSES},
 {id:'arri-as5-event-lens-super-flood-frosted',manufacturer:'ARRI',model:'DROP-IN lens super flood frosted 175 mm',orderCode:'L2.77872.0',category:'Lens',compatibleWith:AS5E,sourceUrl:LENSES},
 {id:'arri-as18-event-lens-set',manufacturer:'ARRI',model:'4 DROP-IN lens set 250 mm incl. case',orderCode:'L0.76818.0',category:'Lens',compatibleWith:AS18E,sourceUrl:LENSES},
 {id:'arri-as5-event-barndoor',manufacturer:'ARRI',model:'4-leaf barndoor black/silver 197 mm',orderCode:'L2.79671.0',category:'Barndoor',compatibleWith:AS5E,sourceUrl:BARNDOORS},
 {id:'arri-as18-event-barndoor',manufacturer:'ARRI',model:'4-leaf barndoor True Blue 344 mm',orderCode:'L2.40950.0',category:'Barndoor',compatibleWith:AS18E,sourceUrl:BARNDOORS},
 {id:'arri-as18-event-barndoor-black-silver',manufacturer:'ARRI',model:'4-leaf barndoor black/silver 344 mm',orderCode:'L2.80951.0',category:'Barndoor',compatibleWith:AS18E,sourceUrl:BARNDOORS},
 {id:'arri-as5-event-safety',manufacturer:'ARRI',model:'Safety cable 4 mm, 1 m, max. load 16 kg',orderCode:'L2.0020919',category:'Safety',compatibleWith:BOTH,sourceUrl:GRIP},
 {id:'arri-as5-event-double-female-adapter',manufacturer:'ARRI',model:'Double female adapter 16 mm - 17 mm Pin',orderCode:'L2.88212.0',category:'Grip',compatibleWith:AS5E,sourceUrl:GRIP},
 {id:'arri-as5-event-transmitter-pendant',manufacturer:'ARRI',model:'Transmitter pendant module 575',orderCode:'L2.76786.0',category:'Control',compatibleWith:AS5E,sourceUrl:EVENT},
 {id:'arri-as18-event-conversion-kit',manufacturer:'ARRI',model:'Conversion Kit ARRISUN 18 Event: 4 longer brackets and spillring',orderCode:'L2.0000655',category:'Conversion Kit',compatibleWith:AS18E,sourceUrl:OTHER},
 {id:'arri-event-cable-7m',manufacturer:'ARRI',model:'Head-to-Ballast cable EVENT 1200/1800 W, 7 m',orderCode:'L2.75600.F',category:'Cable',compatibleWith:AS18E,sourceUrl:EVENT},
 {id:'arri-event-cable-15m',manufacturer:'ARRI',model:'Head-to-Ballast cable EVENT 575/800/1200/1800 W, 15 m',orderCode:'L2.75600.E',category:'Cable',compatibleWith:BOTH,sourceUrl:EVENT},
 {id:'arri-event-extension-5m',manufacturer:'ARRI',model:'Extension cable EVENT 200/575/1200 W, 5 m',orderCode:'L2.76318.B',category:'Cable',compatibleWith:AS5E,sourceUrl:EVENT},
 {id:'arri-event-extension-10m',manufacturer:'ARRI',model:'Extension cable EVENT 200/575/1200 W, 10 m',orderCode:'L2.76318.C',category:'Cable',compatibleWith:AS5E,sourceUrl:EVENT},
 {id:'arri-event-splitbox-1800',manufacturer:'ARRI',model:'Split Box EVENT 1800, 3 x 1200/1800 W',orderCode:'L2.37705.0',category:'Power Distribution',compatibleWith:AS18E,sourceUrl:EVENT},
 {id:'arri-event-splitbox-six',manufacturer:'ARRI',model:'Split Box EVENT SIX',orderCode:'L2.76341.0',category:'Power Distribution',compatibleWith:AS5E,sourceUrl:EVENT},
 {id:'arri-event-eb-1200-1800-three',manufacturer:'ARRI',model:'EB 1200/1800 EVENT THREE',orderCode:'L2.76610.0',category:'Ballast',compatibleWith:AS18E,sourceUrl:BALLASTS},
 {id:'arri-event-eb-multifunction',manufacturer:'ARRI',model:'EB 200/575/1200 MULTIPLE FUNCTION',orderCode:'L2.76777.0',category:'Ballast',compatibleWith:AS5E,sourceUrl:BALLASTS},
 {id:'arri-as5-event-chimera',manufacturer:'ARRI',model:'Chimera Lightbank Quartz Plus L 54 x 72 in',orderCode:'L2.89056.0',category:'Softbox',compatibleWith:AS5E,sourceUrl:SOFTBOX},
 {id:'arri-as5-event-speedring',manufacturer:'ARRI',model:'Speed Ring circular 530 mm',orderCode:'L2.89077.0',category:'Speed Ring',compatibleWith:AS5E,sourceUrl:SOFTBOX}
];
