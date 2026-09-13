// Discontinued ARRI COMPACT daylight family.
// Canonical source: official ARRI discontinued ARRI Compact page and archived ARRI ballast documentation.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/discontinued/arri-compact';
const BALLASTS='https://www.arri.com/en/lighting/daylight-tungsten/daylight/ballasts/discontinued';

export const ARRI_COMPACT_DISCONTINUED_FIXTURES=[
 {id:'arri-compact-200',manufacturer:'ARRI',model:'ARRI Compact 200',family:'ARRI COMPACT',category:'Light',status:'discontinued',sourceType:'HMI daylight Fresnel',lampPowerW:'200',control:{wired:['Via compatible ARRI electronic ballast'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-compact-6000-plus',manufacturer:'ARRI',model:'ARRI Compact 6000 Plus',family:'ARRI COMPACT',category:'Light',status:'discontinued',sourceType:'HMI daylight Fresnel',lampPowerW:'6000',control:{wired:['Via compatible ARRI electronic ballast'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-compact-12000-baby',manufacturer:'ARRI',model:'ARRI Compact 12000 Baby',family:'ARRI COMPACT',category:'Light',status:'discontinued',sourceType:'HMI daylight Fresnel',lampPowerW:'12000',control:{wired:['Via compatible ARRI electronic ballast'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

export const ARRI_COMPACT_DISCONTINUED_ACCESSORIES=[
 {id:'arri-compact-200-eb-125-200',manufacturer:'ARRI',model:'EB 125/200',category:'Ballast',compatibleWith:['arri-compact-200'],sourceUrl:BALLASTS},
 {id:'arri-compact-6000-eb-6000',manufacturer:'ARRI',model:'EB 6000',orderCode:'L2.76193.0',category:'Ballast',compatibleWith:['arri-compact-6000-plus'],sourceUrl:BALLASTS},
 {id:'arri-compact-12000-eb-12-18',manufacturer:'ARRI',model:'EB 12/18',orderCode:'L2.76295.0',category:'Ballast',compatibleWith:['arri-compact-12000-baby'],sourceUrl:BALLASTS}
];
