// De Sisti LITE Series.
// Verified from current official De Sisti LITE Series pages/data sheets.
// Fields are intentionally limited to values documented in the cited official sources.
const F47_TD='https://www.desisti.it/wp/wp-content/uploads/2026/04/FRESNEL-LED-F4.7-Lite-D-T-0426.pdf';
const F47_VW='https://www.desisti.it/wp/wp-content/uploads/2026/04/FRESNEL-LED-F4.7-Lite-VW-04-26-.pdf';
const F6_TD='https://www.desisti.it/wp/wp-content/uploads/2026/04/FRESNEL-LED-F6-Lite-D-T-0426.pdf';
const F6_VW='https://www.desisti.it/wp/wp-content/uploads/2026/04/FRESNEL-LED-F6-Lite-VW-04-26-.pdf';
const S1_VW='https://www.desisti.it/wp/wp-content/uploads/2026/04/SOFTLED-1Lite-VW-020426.pdf';
const S1_RGB='https://www.desisti.it/wp/wp-content/uploads/2024/02/SOFTLED-1Lite-VWRGB.pdf';
const S2_TD='https://www.desisti.it/wp/wp-content/uploads/2024/02/SOFTLED-2Lite-T-D-0224.pdf';
const S2_VW='https://www.desisti.it/wp/wp-content/uploads/2024/02/SOFTLED-2Lite-VW-02224.pdf';
const SERIES='https://www.desisti.it/wp/lite-series/';

export const DESISTI_LITE_FIXTURES=[
  {
    id:'desisti-f47-lite-t',manufacturer:'De Sisti',model:'F4.7 Lite T',family:'LITE Series',
    category:'Light',sourceType:'Fanless LED Fresnel',ledPowerW:40,powerDrawW:45,
    cctK:{min:3200,max:3200},colorMode:'Tungsten',cri:97,tlci:96,lensDiameterMm:120,
    ipRating:'IP20',weightKg:3.0,control:['DMX512','On-board dimming'],
    dmxModes:[{name:'8-bit dimmer',channels:1},{name:'16-bit dimmer',channels:2}],sourceUrl:F47_TD
  },
  {
    id:'desisti-f47-lite-d',manufacturer:'De Sisti',model:'F4.7 Lite D',family:'LITE Series',
    category:'Light',sourceType:'Fanless LED Fresnel',ledPowerW:40,powerDrawW:45,
    cctK:{min:5600,max:5600},colorMode:'Daylight',cri:96,tlci:97,lensDiameterMm:120,
    ipRating:'IP20',weightKg:3.0,control:['DMX512','On-board dimming'],
    dmxModes:[{name:'8-bit dimmer',channels:1},{name:'16-bit dimmer',channels:2}],sourceUrl:F47_TD
  },
  {
    id:'desisti-f47-lite-vw',manufacturer:'De Sisti',model:'F4.7 Lite VW',family:'LITE Series',
    category:'Light',sourceType:'Fanless Vari-White LED Fresnel',ledPowerW:45,powerDrawW:55,
    cctK:{min:2800,max:6600},colorMode:'Vari-White',cri:95,tlci:96,lensDiameterMm:120,
    ipRating:'IP20',weightKg:3.0,control:['DMX512','On-board dimming'],
    dmxModes:[{name:'8-bit Vari-White',channels:2},{name:'16-bit Vari-White',channels:3}],sourceUrl:F47_VW
  },
  {
    id:'desisti-f6-lite-t',manufacturer:'De Sisti',model:'F6 Lite T',family:'LITE Series',
    category:'Light',sourceType:'Fanless LED Fresnel',ledPowerW:70,
    cctK:{min:3200,max:3200},colorMode:'Tungsten',cri:96,lensDiameterMm:150,
    control:['DMX512','On-board dimming'],
    dmxModes:[{name:'8-bit dimmer',channels:1,verified:true,sourceUrl:F6_TD,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]},{name:'16-bit dimmer',channels:2}],sourceUrl:F6_TD
  },
  {
    id:'desisti-f6-lite-d',manufacturer:'De Sisti',model:'F6 Lite D',family:'LITE Series',
    category:'Light',sourceType:'Fanless LED Fresnel',ledPowerW:70,
    cctK:{min:5600,max:5600},colorMode:'Daylight',cri:96,lensDiameterMm:150,
    control:['DMX512','On-board dimming'],
    dmxModes:[{name:'8-bit dimmer',channels:1,verified:true,sourceUrl:F6_TD,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]},{name:'16-bit dimmer',channels:2}],sourceUrl:F6_TD
  },
  {
    id:'desisti-f6-lite-vw',manufacturer:'De Sisti',model:'F6 Lite VW',family:'LITE Series',
    category:'Light',sourceType:'Fanless Vari-White LED Fresnel',ledPowerW:80,powerDrawW:90,
    cctK:{min:2800,max:6600},colorMode:'Vari-White',cri:95,tlci:96,lensDiameterMm:150,
    ipRating:'IP20',weightKg:5.5,control:['DMX512','On-board dimming'],
    dmxModes:[{name:'8-bit Vari-White',channels:2},{name:'16-bit Vari-White',channels:3}],sourceUrl:F6_VW
  },
  {
    id:'desisti-softled-1-lite-t',manufacturer:'De Sisti',model:'Soft LED 1 Lite T',family:'LITE Series',
    category:'Light',sourceType:'Fanless LED Softlight',cctK:{min:3200,max:3200},colorMode:'Tungsten',
    control:['DMX512','On-board dimming'],sourceUrl:SERIES
  },
  {
    id:'desisti-softled-1-lite-d',manufacturer:'De Sisti',model:'Soft LED 1 Lite D',family:'LITE Series',
    category:'Light',sourceType:'Fanless LED Softlight',cctK:{min:5600,max:5600},colorMode:'Daylight',
    control:['DMX512','On-board dimming'],sourceUrl:SERIES
  },
  {
    id:'desisti-softled-1-lite-vw',manufacturer:'De Sisti',model:'Soft LED 1 Lite VW',family:'LITE Series',
    category:'Light',sourceType:'Fanless Vari-White LED Softlight',ledPowerW:45,powerDrawW:55,
    cctK:{min:2800,max:6600},colorMode:'Vari-White',cri:93,tlci:96,ipRating:'IP20',weightKg:6.5,
    control:['DMX512','On-board dimming'],
    dmxModes:[{name:'8-bit Vari-White',channels:2},{name:'16-bit Vari-White',channels:3}],sourceUrl:S1_VW
  },
  {
    id:'desisti-softled-1-lite-vwrgb',manufacturer:'De Sisti',model:'Soft LED 1 Lite VW+RGB',family:'LITE Series',
    category:'Light',sourceType:'Fanless Vari-White + RGB LED Softlight',ledPowerW:60,powerDrawW:65,
    cctK:{min:2700,max:10000},colorMode:'Vari-White + RGB',cri:94,tlci:96,ipRating:'IP20',weightKg:1.7,
    batterySupport:'2 x S1 Lite-BATT 6600 mAh; approx. 60 min at full power',
    pixels:4,control:['DMX512','On-board','Bluetooth app'],
    dmxModes:[{name:'Minimum control',channels:2},{name:'Extended / zones',channels:20}],
    sourceUrl:S1_RGB
  },
  {
    id:'desisti-softled-2-lite-t',manufacturer:'De Sisti',model:'Soft LED 2 Lite T',family:'LITE Series',
    category:'Light',sourceType:'Fanless LED Softlight',ledPowerW:120,powerDrawW:155,
    cctK:{min:3200,max:3200},colorMode:'Tungsten',cri:93,ipRating:'IP20',weightKg:6.5,
    control:['DMX512','On-board dimming'],
    dmxModes:[{name:'8-bit dimmer',channels:1,verified:true,sourceUrl:S2_TD,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]},{name:'16-bit dimmer',channels:2}],sourceUrl:S2_TD
  },
  {
    id:'desisti-softled-2-lite-d',manufacturer:'De Sisti',model:'Soft LED 2 Lite D',family:'LITE Series',
    category:'Light',sourceType:'Fanless LED Softlight',ledPowerW:120,powerDrawW:155,
    cctK:{min:5600,max:5600},colorMode:'Daylight',cri:93,ipRating:'IP20',weightKg:6.5,
    control:['DMX512','On-board dimming'],
    dmxModes:[{name:'8-bit dimmer',channels:1,verified:true,sourceUrl:S2_TD,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]},{name:'16-bit dimmer',channels:2}],sourceUrl:S2_TD
  },
  {
    id:'desisti-softled-2-lite-vw',manufacturer:'De Sisti',model:'Soft LED 2 Lite VW',family:'LITE Series',
    category:'Light',sourceType:'Fanless Vari-White LED Softlight',ledPowerW:120,
    cctK:{min:2700,max:6500},colorMode:'Vari-White',cri:93,
    control:['DMX512','On-board dimming'],sourceUrl:S2_VW
  }
];

const f47=['desisti-f47-lite-t','desisti-f47-lite-d','desisti-f47-lite-vw'];
const f6=['desisti-f6-lite-t','desisti-f6-lite-d','desisti-f6-lite-vw'];
const s1=DESISTI_LITE_FIXTURES.filter(x=>x.id.startsWith('desisti-softled-1-lite')).map(x=>x.id);
const s2=DESISTI_LITE_FIXTURES.filter(x=>x.id.startsWith('desisti-softled-2-lite')).map(x=>x.id);
const rgb=['desisti-softled-1-lite-vwrgb'];
const all=DESISTI_LITE_FIXTURES.map(x=>x.id);

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}
export const DESISTI_LITE_ACCESSORIES=[
  acc('desisti-lite-306-100','306.100 Four Leaf Rotating Barndoor','Barn Door',f47,F47_TD,'Four-leaf Fresnel beam shaping and spill control.'),
  acc('desisti-lite-307-100','307.100 Color Frame','Filter Frame',f47,F47_TD),
  acc('desisti-lite-f47-cone','F4.7 Lite Cone','Snoot / Cone',f47,F47_TD,'Narrows and controls Fresnel spill.'),
  acc('desisti-lite-f47-scrim-set','F4.7 Lite Scrim Set','Scrim Set',f47,F47_TD,'Reduces output while preserving Fresnel beam character.'),

  acc('desisti-lite-316-100','316.100 Four Leaf Rotating Barndoor','Barn Door',f6,F6_TD,'Four-leaf Fresnel beam shaping and spill control.'),
  acc('desisti-lite-316-200','F6 Lite Eight Leaf Rotating Barndoor','Barn Door',f6,F6_VW,'Eight-leaf Fresnel beam shaping and spill control.'),
  acc('desisti-lite-317-100','317.100 Color Frame','Filter Frame',f6,F6_TD),
  acc('desisti-lite-f6-cone','F6 Lite Cone','Snoot / Cone',f6,F6_TD,'Narrows and controls Fresnel spill.'),
  acc('desisti-lite-f6-scrim-set','F6 Lite Scrim Set','Scrim Set',f6,F6_TD,'Reduces output while preserving Fresnel beam character.'),

  acc('desisti-s1lite-hcm','S1L-HCM Honeycomb Medium','Grid / Honeycomb',s1,S1_VW,'Controls Soft LED 1 Lite spill.'),
  acc('desisti-s1lite-bd','S1L-BD Barndoor','Barn Door',s1,S1_VW,'Shapes Soft LED 1 Lite spill.'),
  acc('desisti-s1lite-cf','S1L-CF Colourframe','Filter Frame',s1,S1_VW),
  acc('desisti-s1lite-softbox','S1 Lite-SBOX Softbox + Soft Grid','Softbox',rgb,S1_RGB,'Softbox with soft grid for Soft LED 1 Lite VW+RGB.'),
  acc('desisti-s1lite-batt','S1 Lite-BATT 6600 mAh Battery','Battery',rgb,S1_RGB),
  acc('desisti-s1lite-bkit','S1 Lite-BKIT 2 Batteries + Charger','Battery Kit',rgb,S1_RGB),
  acc('desisti-s1lite-vmount-adapter','V Mount SA Stand Adapter with Clamp and D-Tap','Mounting / Power',rgb,S1_RGB),
  acc('desisti-s1lite-vmount-battery','V BATT 95 Wh 6600 mAh V-Mount Battery','Battery',rgb,S1_RGB),
  acc('desisti-s1lite-vmount-charger','V BATT Chg Universal Charger','Charger',rgb,S1_RGB),
  acc('desisti-s1lite-carrying-bag','Soft LED 1 Lite Carrying Bag','Transport',rgb,S1_RGB),

  acc('desisti-s2lite-hcm','S2L-HCM Honeycomb Medium','Grid / Honeycomb',s2,S2_TD,'Controls Soft LED 2 Lite spill.'),
  acc('desisti-s2lite-bd','S2L-BD Barndoor','Barn Door',s2,S2_TD,'Shapes Soft LED 2 Lite spill.'),
  acc('desisti-s2lite-cf','S2L-CF Colourframe','Filter Frame',s2,S2_TD),

  acc('desisti-lite-15-300','15.300 DIN Spigot','Mounting',all,F47_TD),
  acc('desisti-lite-95-100','95.100 1-1/8 in Spigot','Mounting',all,F47_TD),
  acc('desisti-lite-11-100','11.100 Fiberglass Receiver','Mounting',all,F47_TD),
  acc('desisti-lite-370-200-40','370.200.40 Short Spigot Receiver','Mounting',all,F47_TD),
  acc('desisti-lite-5403-135','5403.135 3 m Blue powerCON Cable','Power / Cable',all,S2_TD),
  acc('desisti-lite-5pin-dmx','LITE Series 5-pin DMX Cable','DMX Cable',all,S2_TD)
];
