// ARRI Orbiter current LED spotlight system and verified core optics/accessories.
// Official ARRI product/accessory pages are the canonical source for this library.
const SRC='https://www.arri.com/en/lighting/led-spotlights/orbiter';
const OPT='https://www.arri.com/en/lighting/led-spotlights/orbiter/accessories/optics';
const CTRL='https://www.arri.com/en/lighting/led-spotlights/orbiter/control-connectivity';
const LC='https://www.arri.com/en/lighting/led-spotlights/orbiter/accessories/light-control';

export const ARRI_ORBITER_FIXTURES=[
 {id:'arri-orbiter',manufacturer:'ARRI',model:'Orbiter',family:'Orbiter',category:'Light',sourceType:'RGBACL six-color LED spotlight',mount:'ARRI Quick Lighting Mount (QLM)',control:{wired:['Removable Orbiter Control Panel','DMX','RDM','Art-Net','sACN','Ethernet'],wireless:['LumenRadio CRMX','Bluetooth 5.0'],builtInWirelessDMX:true},sourceUrl:SRC,controlSourceUrl:CTRL}
];

const O=['arri-orbiter'];
export const ARRI_ORBITER_ACCESSORIES=[
 {id:'arri-orbiter-glass-cover',manufacturer:'ARRI',model:'Orbiter Glass Cover',orderCode:'L2.0039439',category:'Optic',mount:'QLM',compatibleWith:O,sourceUrl:OPT},
 {id:'arri-orbiter-open-face-15',manufacturer:'ARRI',model:'Orbiter Open Face Optic 15°',orderCode:'L2.0033540',category:'Optic',mount:'QLM',compatibleWith:O,sourceUrl:OPT},
 {id:'arri-orbiter-open-face-30',manufacturer:'ARRI',model:'Orbiter Open Face Optic 30°',orderCode:'L2.0033541',category:'Optic',mount:'QLM',compatibleWith:O,sourceUrl:OPT},
 {id:'arri-orbiter-open-face-60',manufacturer:'ARRI',model:'Orbiter Open Face Optic 60°',orderCode:'L2.0033542',category:'Optic',mount:'QLM',compatibleWith:O,sourceUrl:OPT},
 {id:'arri-orbiter-projection-25',manufacturer:'ARRI',model:'Orbiter Projection Optic 25°',orderCode:'L2.0033549',category:'Projection Optic',mount:'QLM',compatibleWith:O,sourceUrl:'https://www.arri.com/en/lighting/led-spotlights/orbiter/accessories/optics/projection'},
 {id:'arri-orbiter-projection-35',manufacturer:'ARRI',model:'Orbiter Projection Optic 35°',orderCode:'L2.0033550',category:'Projection Optic',mount:'QLM',compatibleWith:O,sourceUrl:'https://www.arri.com/en/lighting/led-spotlights/orbiter/accessories/optics/projection'},
 {id:'arri-orbiter-beam',manufacturer:'ARRI',model:'Orbiter Beam Optic 4°',orderCode:'L2.0048438',category:'Beam Optic',mount:'QLM',compatibleWith:O,sourceUrl:'https://www.arri.com/en/lighting/led-spotlights/orbiter/accessories/optics/beam'},
 {id:'arri-orbiter-barndoor-4-168',manufacturer:'ARRI',model:'4-leaf Barndoor 168 mm / 6.6 in',orderCode:'L2.79470.0',category:'Barndoor',compatibleWith:O,sourceUrl:LC},
 {id:'arri-orbiter-barndoor-8-168',manufacturer:'ARRI',model:'8-leaf Barndoor 168 mm / 6.6 in',orderCode:'L2.79500.0',category:'Barndoor',compatibleWith:O,sourceUrl:LC},
 {id:'arri-orbiter-snoot-245',manufacturer:'ARRI',model:'Snoot 245 mm / 9.7 in',orderCode:'L2.79880.0',category:'Snoot',compatibleWith:O,sourceUrl:LC},
 {id:'arri-orbiter-projection-snoot',manufacturer:'ARRI',model:'Snoot for Orbiter Projection Optic 25° / 35°',orderCode:'L2.0033841',category:'Snoot',compatibleWith:O,sourceUrl:LC},
 {id:'arri-orbiter-gobo-holder',manufacturer:'ARRI',model:'Gobo Holder for Orbiter Projection Optic 25° / 35°',orderCode:'L2.0033843',category:'Gobo Holder',compatibleWith:O,sourceUrl:LC}
];
