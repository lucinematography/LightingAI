// ARRI discontinued Tungsten Cyc / Flood lampheads.
// Canonical source: official ARRI Tungsten Discontinued page.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/tungsten/discontinued';

export const ARRI_TUNGSTEN_DISCONTINUED_FIXTURES=[
 {id:'arri-cyc-1250-single',manufacturer:'ARRI',model:'ARRI Cyc 1250 Single',family:'ARRI Cyc / Flood Light',category:'Light',sourceType:'Tungsten Cyc',lampPowerW:1250,status:'Discontinued 2017',variants:['Manual','Pole-operated'],control:{wired:['External mains/dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-cyc-1250-double',manufacturer:'ARRI',model:'ARRI Cyc 1250 Double',family:'ARRI Cyc / Flood Light',category:'Light',sourceType:'Tungsten Cyc',lampPowerW:1250,status:'Discontinued 2017',variants:['Manual','Pole-operated'],control:{wired:['External mains/dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-cyc-1250-4-bank',manufacturer:'ARRI',model:'ARRI Cyc 1250 4-Bank',family:'ARRI Cyc / Flood Light',category:'Light',sourceType:'Tungsten Cyc',lampPowerW:1250,status:'Discontinued 2017',control:{wired:['External mains/dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-cyc-1250-4-cube',manufacturer:'ARRI',model:'ARRI Cyc 1250 4-Cube',family:'ARRI Cyc / Flood Light',category:'Light',sourceType:'Tungsten Cyc',lampPowerW:1250,status:'Discontinued 2017',control:{wired:['External mains/dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-flood-1250-single',manufacturer:'ARRI',model:'ARRI Flood 1250 Single',family:'ARRI Cyc / Flood Light',category:'Light',sourceType:'Tungsten Flood',lampPowerW:1250,status:'Discontinued 2017',variants:['Manual','Pole-operated'],control:{wired:['External mains/dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-flood-1250-double',manufacturer:'ARRI',model:'ARRI Flood 1250 Double',family:'ARRI Cyc / Flood Light',category:'Light',sourceType:'Tungsten Flood',lampPowerW:1250,status:'Discontinued 2017',control:{wired:['External mains/dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-flood-1250-4-cube',manufacturer:'ARRI',model:'ARRI Flood 1250 4-Cube',family:'ARRI Cyc / Flood Light',category:'Light',sourceType:'Tungsten Flood',lampPowerW:1250,status:'Discontinued 2017',control:{wired:['External mains/dimming system'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC}
];

const ALL=ARRI_TUNGSTEN_DISCONTINUED_FIXTURES.map(f=>f.id);
export const ARRI_TUNGSTEN_DISCONTINUED_ACCESSORIES=[
 {id:'arri-cyc-flood-1250-filter-frame',manufacturer:'ARRI',model:'Quick-release filter frame for ARRI Cyc / Flood 1250',category:'Filter Frame',compatibleWith:ALL,sourceUrl:SRC},
 {id:'arri-cyc-flood-1250-protection-glass',manufacturer:'ARRI',model:'Double protection glass for ARRI Cyc / Flood 1250',category:'Protection',compatibleWith:ALL,sourceUrl:SRC}
];
