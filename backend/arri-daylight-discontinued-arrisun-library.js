// ARRI Daylight Discontinued — ARRISUN family.
// Canonical sources: official ARRI ARRISUN discontinued page, current ARRI lenses/ballast/conversion-kit references.
const SRC='https://www.arri.com/en/lighting/daylight-tungsten/daylight/discontinued/arrisun';
const LENSES='https://www.arri.com/en/lighting/accessories/lenses';
const OTHER='https://www.arri.com/en/lighting/accessories/other-accessories';
const BALLAST='https://www.arri.com/resource/blob/66436/deb8457fa17ad56645d79a20a6b52f38/arri-eb-max-range-ballasts-tech-specs-poster-data.pdf';
const DMX='https://www.arri.com/resource/blob/189028/08491e735ef655fc505f1a8d26d4936c/eb-max-range-dmx-channel-settings-data.pdf';
const EB18='https://www.arri.com/resource/blob/31446/25a485ba9cb52b0811c740fde053815f/arri-eb-max-1-8-manual-de-en-apr2018-data.pdf';
const EB254='https://www.arri.com/resource/blob/31448/bc5856bd85e1db931bae4b20c89032ca/arri-eb-max-2-5-4-manual-de-en-data.pdf';
const EB69='https://www.arri.com/resource/blob/127420/bb49d93204c725de2711dd92cc37b821/l2-0016747-arri-eb-max-6-9-manual-de-en-mar2018-data.pdf';
const EB1218='https://www.arri.com/resource/blob/31450/31161def81341893d4f84a8c4ccac845/arri-eb-max-12-18-manual-de-en-mar2018-data.pdf';

function ebMaxControl(ballast,manual){
  return {
    control:{
      wired:['DMX512 via ARRI '+ballast+' ballast'],
      wireless:[],
      directLightingAI:[],
      externalInterfaceRequired:['ARRI '+ballast+' ballast'],
      builtInWirelessDMX:false,
      sourceUrls:[SRC,BALLAST,manual,DMX]
    },
    dmxModes:[{
      name:ballast+' · Flicker Free 75 Hz · 2ch',
      channels:2,
      verified:true,
      sourceUrl:DMX,
      controls:[
        {key:'dimmer',label:'Lamp Power',channel:1,type:'percent',min:50,max:100,dmxMin:128,dmxMax:255},
        {key:'powerMode',label:'Ballast Power / Mode',channel:2,type:'enum',fade:'snap-at-end',choices:[
          {value:0,label:'OFF',labelSr:'ISKLJUČENO',dmxValue:0},
          {value:1,label:'ON · Flicker Free 75 Hz',labelSr:'UKLJUČENO · Flicker Free 75 Hz',dmxValue:128}
        ]}
      ],
      profileConfiguration:{
        ballast:'ARRI '+ballast,
        channel3Unused:true,
        defaultSafeState:'OFF',
        rationale:'ARRI MAX Range DMX Channel Settings define CH1 dimming and CH2 ON/OFF plus operation mode. Flicker Free 75 Hz uses a two-channel footprint; CH3 is only used by operation modes 10-13. The default DMX frame therefore leaves the ballast OFF until explicitly enabled.'
      }
    }]
  };
}

export const ARRI_ARRISUN_DISCONTINUED_FIXTURES=[
 {id:'arri-arrisun-2',manufacturer:'ARRI',model:'ARRISUN 2',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',control:{wired:['Via compatible ARRI electronic ballast'],wireless:[],builtInWirelessDMX:false},sourceUrl:SRC},
 {id:'arri-arrisun-5',manufacturer:'ARRI',model:'ARRISUN 5',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',lampPowerW:'575/800',...ebMaxControl('EB MAX 1.8',EB18),sourceUrl:SRC},
 {id:'arri-as-18',manufacturer:'ARRI',model:'AS 18',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',lampPowerW:'1200/1800',ipRating:'IP23',...ebMaxControl('EB MAX 1.8',EB18),sourceUrl:SRC},
 {id:'arri-as-40-25',manufacturer:'ARRI',model:'AS 40/25',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',lampPowerW:'2500/4000',ipRating:'IP23',...ebMaxControl('EB MAX 2.5/4',EB254),sourceUrl:SRC},
 {id:'arri-arrisun-60',manufacturer:'ARRI',model:'ARRISUN 60',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',lampPowerW:'6000',...ebMaxControl('EB MAX 6/9',EB69),sourceUrl:SRC},
 {id:'arri-arrisun-120',manufacturer:'ARRI',model:'ARRISUN 120',family:'ARRISUN',category:'Light',status:'Discontinued',sourceType:'HMI daylight PAR',lampPowerW:'12000',...ebMaxControl('EB MAX 12/18',EB1218),sourceUrl:SRC}
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
