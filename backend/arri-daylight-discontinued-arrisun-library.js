// ARRI Daylight Discontinued — ARRISUN family.
// Canonical sources: official ARRI ARRISUN discontinued page, current ARRI lenses/ballast/conversion-kit references.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/discontinued/arrisun';
const LENSES='https://www.arri.com/en/lighting/accessories/lenses';
const OTHER='https://www.arri.com/en/lighting/accessories/other-accessories';
const BALLAST='https://www.arri.com/resource/blob/66436/deb8457fa17ad56645d79a20a6b52f38/arri-eb-max-range-ballasts-tech-specs-poster-data.pdf';

export const ARRI_ARRISUN_DISCONTINUED_FIXTURES=[
 {id:'arri-arrisun-2',manufacturer:'ARRI',model:'ARRISUN 2',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',control:{wired:['Via compatible ARRI electronic ballast'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-arrisun-5',manufacturer:'ARRI',model:'ARRISUN 5',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',lampPowerW:'575/800',control:{wired:['Via compatible ARRI electronic ballast; EB MAX supports DMX'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-as-18',manufacturer:'ARRI',model:'AS 18',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',lampPowerW:'1200/1800',ipRating:'IP23',control:{wired:['Via compatible ARRI electronic ballast; EB MAX supports DMX'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-as-40-25',manufacturer:'ARRI',model:'AS 40/25',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',lampPowerW:'2500/4000',ipRating:'IP23',control:{wired:['Via compatible ARRI electronic ballast; EB MAX supports DMX'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-arrisun-60',manufacturer:'ARRI',model:'ARRISUN 60',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',lampPowerW:'6000',control:{wired:['Via compatible ARRI electronic ballast; EB MAX 6/9 supports DMX'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-arrisun-120',manufacturer:'ARRI',model:'ARRISUN 120',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',lampPowerW:'12000',control:{wired:['Via compatible ARRI electronic ballast; EB MAX 12/18 supports DMX'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const AS18=['arri-as-18'];
const AS40=['arri-as-40-25'];
const AS120=['arri-arrisun-120'];
export const ARRI_ARRISUN_DISCONTINUED_ACCESSORIES=[
 {id:'arri-as18-conversion-to-m18',manufacturer:'ARRI',model:'Conversion Kit AS18 to M18',orderCode:'L2.37682.2',category:'Conversion Kit',compatibleWith:AS18,sourceUrl:OTHER},
 {id:'arri-as40-conversion-to-m40',manufacturer:'ARRI',model:'Conversion Kit AS40 to M40',orderCode:'L2.37388.0',category:'Conversion Kit',compatibleWith:AS40,sourceUrl:OTHER},
 {id:'arri-as40-dropin-narrow-flood',manufacturer:'ARRI',model:'DROP-IN Lens Narrow Flood 300 mm',orderCode:'L2.76868.0',category:'Lens',compatibleWith:AS40,sourceUrl:LENSES},
 {id:'arri-as40-dropin-flood',manufacturer:'ARRI',model:'DROP-IN Lens Flood 300 mm',orderCode:'L2.76869.0',category:'Lens',compatibleWith:AS40,sourceUrl:LENSES},
 {id:'arri-as40-dropin-super-flood',manufacturer:'ARRI',model:'DROP-IN Lens Super Flood 300 mm',orderCode:'L2.76870.0',category:'Lens',compatibleWith:AS40,sourceUrl:LENSES},
 {id:'arri-as40-dropin-super-flood-frosted',manufacturer:'ARRI',model:'DROP-IN Lens Super Flood Frosted 300 mm',orderCode:'L2.76871.0',category:'Lens',compatibleWith:AS40,sourceUrl:LENSES},
 {id:'arri-arrisun120-lens-set-5',manufacturer:'ARRI',model:'5 DROP-IN Lens Set 500 mm incl. case',orderCode:'L0.77920.0',category:'Lens Set',compatibleWith:AS120,sourceUrl:LENSES},
 {id:'arri-arrisun120-lens-set-4',manufacturer:'ARRI',model:'4 DROP-IN Lens Set 500 mm incl. case',orderCode:'L0.77921.0',category:'Lens Set',compatibleWith:AS120,sourceUrl:LENSES},
 {id:'arri-arrisun120-lens-narrow-flood',manufacturer:'ARRI',model:'DROP-IN Lens Narrow Flood 500 mm',orderCode:'L2.77926.0',category:'Lens',compatibleWith:AS120,sourceUrl:LENSES},
 {id:'arri-arrisun120-lens-flood',manufacturer:'ARRI',model:'DROP-IN Lens Flood 500 mm',orderCode:'L2.77924.0',category:'Lens',compatibleWith:AS120,sourceUrl:LENSES},
 {id:'arri-arrisun120-lens-super-flood',manufacturer:'ARRI',model:'DROP-IN Lens Super Flood 500 mm',orderCode:'L2.77925.0',category:'Lens',compatibleWith:AS120,sourceUrl:LENSES},
 {id:'arri-arrisun-eb-max-1-8',manufacturer:'ARRI',model:'EB MAX 1.8',category:'Ballast',compatibleWith:['arri-arrisun-5','arri-as-18'],sourceUrl:BALLAST},
 {id:'arri-arrisun-eb-max-2-5-4',manufacturer:'ARRI',model:'EB MAX 2.5/4',category:'Ballast',compatibleWith:AS40,sourceUrl:BALLAST},
 {id:'arri-arrisun-eb-max-6-9',manufacturer:'ARRI',model:'EB MAX 6/9',category:'Ballast',compatibleWith:['arri-arrisun-60'],sourceUrl:BALLAST},
 {id:'arri-arrisun-eb-max-12-18',manufacturer:'ARRI',model:'EB MAX 12/18',category:'Ballast',compatibleWith:AS120,sourceUrl:BALLAST}
];
