// ARRI ARRILUX POCKETPAR discontinued Daylight family.
// Canonical sources: official ARRI ARRILUX discontinued page and ARRI discontinued ballast documentation.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/discontinued/arrilux';
const BALLASTS='https://www.arri.com/en/lighting/daylight-tungsten/daylight/ballasts/discontinued';

export const ARRI_ARRILUX_DISCONTINUED_FIXTURES=[
 {id:'arri-arrilux-pocketpar-125',manufacturer:'ARRI',model:'ARRILUX POCKETPAR 125',family:'ARRILUX POCKETPAR',category:'Light',sourceType:'Daylight PAR',lampPowerW:125,status:'Discontinued',discontinuedYear:2017,sourceUrl:SRC},
 {id:'arri-arrilux-pocketpar-200',manufacturer:'ARRI',model:'ARRILUX POCKETPAR 200',family:'ARRILUX POCKETPAR',category:'Light',sourceType:'Daylight PAR',lampPowerW:200,status:'Discontinued',discontinuedYear:2017,sourceUrl:SRC},
 {id:'arri-arrilux-pocketpar-400',manufacturer:'ARRI',model:'ARRILUX POCKETPAR 400',family:'ARRILUX POCKETPAR',category:'Light',sourceType:'Daylight PAR',lampPowerW:400,status:'Discontinued',discontinuedYear:2017,sourceUrl:SRC}
];

const P125=['arri-arrilux-pocketpar-125'];
const P200=['arri-arrilux-pocketpar-200'];
const P400=['arri-arrilux-pocketpar-400'];
const P125_200=[...P125,...P200];

export const ARRI_ARRILUX_DISCONTINUED_ACCESSORIES=[
 {id:'arri-arrilux-eb-125-200-ac',manufacturer:'ARRI',model:'EB 125/200 AC Ballast',orderCode:'L2.76013.A/.B',category:'Ballast',compatibleWith:P125_200,sourceUrl:BALLASTS},
 {id:'arri-arrilux-ebb-125-200-dc',manufacturer:'ARRI',model:'EBB 125-200 20-34 V DC Ballast',orderCode:'L2.76040.0/A/B',category:'Ballast',compatibleWith:P125_200,sourceUrl:BALLASTS},
 {id:'arri-arrilux-ebb-200-400-dc',manufacturer:'ARRI',model:'EBB 200-400 20-34 V DC Ballast',orderCode:'L2.76270.A/B',category:'Ballast',compatibleWith:[...P200,...P400],sourceUrl:BALLASTS},
 {id:'arri-arrilux-eb-400-575-ac',manufacturer:'ARRI',model:'EB 400/575 AC Ballast',orderCode:'L2.76260.0/62.0',category:'Ballast',compatibleWith:P400,sourceUrl:BALLASTS},
 {id:'arri-arrilux-eb-400-575-dmx',manufacturer:'ARRI',model:'EB 400/575 AC Ballast with DMX option',orderCode:'L2.76260KH/L2.76262KH',category:'Ballast',compatibleWith:P400,sourceUrl:BALLASTS},
 {id:'arri-arrilux-drop-in-lenses-125',manufacturer:'ARRI',model:'ARRILUX POCKETPAR 125 color-coded drop-in spread lenses',category:'Lens',compatibleWith:P125,sourceUrl:SRC},
 {id:'arri-arrilux-drop-in-lenses-200',manufacturer:'ARRI',model:'ARRILUX POCKETPAR 200 color-coded drop-in spread lenses',category:'Lens',compatibleWith:P200,sourceUrl:SRC},
 {id:'arri-arrilux-drop-in-lenses-400',manufacturer:'ARRI',model:'ARRILUX POCKETPAR 400 color-coded drop-in spread lenses',category:'Lens',compatibleWith:P400,sourceUrl:SRC}
];
