// De Sisti current Super LED Fresnel families beyond F4.7.
// Verified from official De Sisti product pages, data sheets and 2024/2025 mini catalogs.
const F6_SRC = 'https://www.desisti.it/super-led-f6/';
const F6_DMX_MANUAL = 'https://www.desisti.it/wp-content/uploads/2017/03/CE-INSTRUCTION-MANUAL-SUPER-LED-FRESNEL-F6.pdf';
const F7_SRC = 'https://www.desisti.it/wp-content/uploads/SUPER-LED-F7.pdf';
const F7_DMX_MANUAL = 'https://www.desisti.it/wp-content/uploads/2018/11/CE-INSTRUCTION-MANUAL-SUPER-LED-FRESNEL-F7.pdf';
const F7_VW_SRC = 'https://www.desisti.it/wp-content/uploads/SUPER-LED-F7-VW-3.pdf';
const F7_VWC_SRC = 'https://www.desisti.it/wp/wp-content/uploads/2022/04/SUPER-LED-F7-VWC-04-2022-.pdf';
const F10_SRC = 'https://www.desisti.it/super-led-f10/';
const F10_SHP_SRC = 'https://www.desisti.it/wp-content/uploads/mini-catalog-2024-1.pdf';
const VWC_SRC = 'https://www.desisti.it/wp-content/uploads/mini-catalog-2024-1.pdf';
const F14_SRC = 'https://www.desisti.it/super-led-f14/';
const F20_SRC = 'https://www.desisti.it/wp-content/uploads/mini-catalog-2025.pdf';

const verifiedFixedDimmerModes = (sourceUrl) => [
  {name:'8-bit dimmer',channels:1,verified:true,sourceUrl,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]},
  {name:'16-bit dimmer',channels:2,verified:true,sourceUrl,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',bits:16,min:0,max:100,dmxMin:0,dmxMax:65535}]}
];

const fixed = (id, model, family, ledPowerW, powerDrawW, cct, cri, tlci, lens, sourceUrl, extra={}) => ({
  id, manufacturer:'De Sisti', model, family, category:'Light', sourceType:'LED Fresnel',
  ledPowerW, ...(powerDrawW?{powerDrawW}:{}), cctK:{min:cct,max:cct},
  colorMode:cct===3200?'Tungsten':'Daylight', cri, tlci, lensDiameterMm:lens,
  control:['DMX512','On-board dimming'], dmxModes:[{name:'8-bit dimmer',channels:1},{name:'16-bit dimmer',channels:2}],
  sourceUrl, ...extra
});
const vw = (id, model, family, ledPowerW, powerDrawW, min, max, lens, sourceUrl, extra={}) => ({
  id, manufacturer:'De Sisti', model, family, category:'Light', sourceType:'Vari-White LED Fresnel',
  ledPowerW, ...(powerDrawW?{powerDrawW}:{}), cctK:{min,max}, colorMode:'Vari-White',
  cri:95, tlci:96, lensDiameterMm:lens, control:['DMX512','On-board dimming'],
  sourceUrl, ...extra
});

export const DESISTI_LED_FRESNEL_FIXTURES = [
  fixed('desisti-super-led-f6-t','Super LED F6 T','Super LED F6',120,150,3200,97,96,150,F6_SRC,{ipRating:'IP22',dmxModes:verifiedFixedDimmerModes(F6_DMX_MANUAL)}),
  fixed('desisti-super-led-f6-d','Super LED F6 D','Super LED F6',120,150,5600,96,97,150,F6_SRC,{ipRating:'IP22',dmxModes:verifiedFixedDimmerModes(F6_DMX_MANUAL)}),
  vw('desisti-super-led-f6-vw','Super LED F6 Vari-White','Super LED F6',120,150,2800,6600,150,F6_SRC,{ipRating:'IP22',dmxModes:[{name:'Vari-White',channels:3}]}),

  fixed('desisti-super-led-f7-t','Super LED F7 T','Super LED F7',160,null,3200,97,96,175,F7_SRC,{rainProtectedOption:'IP23',dmxModes:verifiedFixedDimmerModes(F7_DMX_MANUAL)}),
  fixed('desisti-super-led-f7-d','Super LED F7 D','Super LED F7',160,null,5600,96,97,175,F7_SRC,{rainProtectedOption:'IP23',dmxModes:verifiedFixedDimmerModes(F7_DMX_MANUAL)}),
  vw('desisti-super-led-f7-vw','Super LED F7 Vari-White','Super LED F7',160,null,2800,6600,175,F7_VW_SRC,{rainProtectedOption:'IP23',dmxModes:[{name:'Vari-White',channels:3}]}),
  {
    id:'desisti-super-led-f7-vwc',manufacturer:'De Sisti',model:'Super LED F7 VW+C',family:'Super LED F7',category:'Light',
    sourceType:'Vari-White + Color LED Fresnel',ledPowerW:170,cctK:{min:1800,max:12000},colorMode:'Vari-White + RGBA',
    cri:95,lensDiameterMm:175,control:['DMX512','On-board'],sourceUrl:F7_VWC_SRC
  },

  fixed('desisti-super-led-f10-t','Super LED F10 T','Super LED F10',180,215,3200,97,96,250,F10_SRC,{ipRating:'IP22'}),
  fixed('desisti-super-led-f10-d','Super LED F10 D','Super LED F10',180,215,5600,96,97,250,F10_SRC,{ipRating:'IP22'}),
  vw('desisti-super-led-f10-vw','Super LED F10 Vari-White','Super LED F10',200,250,2800,6600,250,F10_SRC,{ipRating:'IP22',dmxModes:[{name:'Vari-White',channels:3}]}),
  {
    id:'desisti-super-led-f10-vwc',manufacturer:'De Sisti',model:'Super LED F10 VW+C',family:'Super LED F10',category:'Light',
    sourceType:'Vari-White + Color LED Fresnel',ledPowerW:230,powerDrawW:260,cctK:{min:1750,max:14500},
    colorMode:'Vari-White + RGBA',cri:95,tlci:96,beamAngleDeg:{min:18,max:55},lensDiameterMm:250,
    ipRating:'IP20',control:['DMX512/RDM','On-board'],sourceUrl:VWC_SRC
  },

  fixed('desisti-super-led-f10hp-t','Super LED F10 HP T','Super LED F10 HP',330,400,3200,97,96,250,F10_SRC,{ipRating:'IP22',rainProtectedOption:'IP23'}),
  fixed('desisti-super-led-f10hp-d','Super LED F10 HP D','Super LED F10 HP',330,400,5600,96,97,250,F10_SRC,{ipRating:'IP22',rainProtectedOption:'IP23'}),
  vw('desisti-super-led-f10hp-vw','Super LED F10 HP Vari-White','Super LED F10 HP',330,400,2800,6600,250,F10_SRC,{ipRating:'IP22',rainProtectedOption:'IP23',dmxModes:[{name:'Vari-White',channels:3}]}),

  fixed('desisti-super-led-f10shp-t','Super LED F10 SHP T','Super LED F10 SHP',470,490,3200,96,96,250,F10_SHP_SRC,{ipRating:'IP20',rainProtectedOption:'IP23',beamAngleDeg:{min:15,max:78},control:['DMX512/RDM','On-board dimming']}),
  fixed('desisti-super-led-f10shp-d','Super LED F10 SHP D','Super LED F10 SHP',470,490,5600,96,96,250,F10_SHP_SRC,{ipRating:'IP20',rainProtectedOption:'IP23',beamAngleDeg:{min:15,max:78},control:['DMX512/RDM','On-board dimming']}),
  vw('desisti-super-led-f10shp-vw','Super LED F10 SHP Vari-White','Super LED F10 SHP',470,490,2700,6500,250,F10_SHP_SRC,{ipRating:'IP20',beamAngleDeg:{min:15,max:78},tlci:95,control:['DMX512/RDM','On-board'],dmxModes:[{name:'8-bit Vari-White',channels:3},{name:'16-bit Vari-White',channels:4}]}),

  fixed('desisti-super-led-f14-t','Super LED F14 T','Super LED F14',400,null,3200,97,96,350,F14_SRC,{ipRating:'IP22',rainProtectedOption:'IP23'}),
  fixed('desisti-super-led-f14-d','Super LED F14 D','Super LED F14',400,null,5600,95,95,350,F14_SRC,{ipRating:'IP22',rainProtectedOption:'IP23'}),
  fixed('desisti-super-led-f14hp-t','Super LED F14 HP T','Super LED F14 HP',580,650,3200,97,96,350,F14_SRC,{ipRating:'IP22',rainProtectedOption:'IP23'}),
  fixed('desisti-super-led-f14hp-d','Super LED F14 HP D','Super LED F14 HP',580,650,5600,96,97,350,F14_SRC,{ipRating:'IP22',rainProtectedOption:'IP23'}),
  vw('desisti-super-led-f14hp-vw','Super LED F14 HP Vari-White','Super LED F14 HP',580,650,2800,6600,350,F14_SRC,{ipRating:'IP22',rainProtectedOption:'IP23',dmxModes:[{name:'Vari-White',channels:3}]}),

  {
    id:'desisti-super-led-f20-t',manufacturer:'De Sisti',model:'Super LED F20 T',family:'Super LED F20',category:'Light',
    sourceType:'LED Fresnel',ledPowerW:1000,cctK:{min:3200,max:3200},colorMode:'Tungsten',cri:95,
    control:['DMX512','LumenRadio TimoTwo Wireless DMX','On-board dimming'],detachableDriver:true,remoteDriverMaxM:50,sourceUrl:F20_SRC
  },
  {
    id:'desisti-super-led-f20-d',manufacturer:'De Sisti',model:'Super LED F20 D',family:'Super LED F20',category:'Light',
    sourceType:'LED Fresnel',ledPowerW:1000,cctK:{min:5600,max:5600},colorMode:'Daylight',cri:95,
    control:['DMX512','LumenRadio TimoTwo Wireless DMX','On-board dimming'],detachableDriver:true,remoteDriverMaxM:50,sourceUrl:F20_SRC
  }
];

const ids = (...prefixes) => DESISTI_LED_FRESNEL_FIXTURES.filter(x=>prefixes.includes(x.family)).map(x=>x.id);
const F6F7 = ids('Super LED F6','Super LED F7');
const F10 = ids('Super LED F10','Super LED F10 HP','Super LED F10 SHP');
const F14 = ids('Super LED F14','Super LED F14 HP');
const F20 = ids('Super LED F20');

export const DESISTI_LED_FRESNEL_ACCESSORIES = [
  {id:'desisti-316-100',manufacturer:'De Sisti',model:'316.100 Four Leaf Rotating Barndoor',category:'Barn Door',compatibilityStatus:'Designed For',compatibleWith:F6F7,sourceUrl:F6_SRC},
  {id:'desisti-316-200',manufacturer:'De Sisti',model:'316.200 Eight Leaf Rotating Barndoor',category:'Barn Door',compatibilityStatus:'Designed For',compatibleWith:F6F7,sourceUrl:F6_SRC},
  {id:'desisti-317-100',manufacturer:'De Sisti',model:'317.100 Colorframe',category:'Filter Frame',compatibilityStatus:'Designed For',compatibleWith:F6F7,sourceUrl:F6_SRC},
  {id:'desisti-318-100',manufacturer:'De Sisti',model:'318.100 Cone with Two Discs',category:'Snoot / Cone',compatibilityStatus:'Designed For',compatibleWith:F6F7,sourceUrl:F6_SRC},
  {id:'desisti-319-100',manufacturer:'De Sisti',model:'319.100 Stainless Steel Scrim Set',category:'Scrim Set',compatibilityStatus:'Designed For',compatibleWith:F6F7,sourceUrl:F6_SRC},

  {id:'desisti-326-110',manufacturer:'De Sisti',model:'326.110 Four Leaf Rotating Barndoor',category:'Barn Door',compatibilityStatus:'Designed For',compatibleWith:F10,sourceUrl:F10_SRC},
  {id:'desisti-326-210',manufacturer:'De Sisti',model:'326.210 Eight Leaf Rotating Barndoor',category:'Barn Door',compatibilityStatus:'Designed For',compatibleWith:F10,sourceUrl:F10_SRC},
  {id:'desisti-327-100',manufacturer:'De Sisti',model:'327.100 Colorframe',category:'Filter Frame',compatibilityStatus:'Designed For',compatibleWith:F10,sourceUrl:F10_SRC},
  {id:'desisti-328-100',manufacturer:'De Sisti',model:'328.100 Cone with Two Discs',category:'Snoot / Cone',compatibilityStatus:'Designed For',compatibleWith:F10,sourceUrl:F10_SRC},
  {id:'desisti-329-100',manufacturer:'De Sisti',model:'329.100 Stainless Steel Scrim Set',category:'Scrim Set',compatibilityStatus:'Designed For',compatibleWith:F10,sourceUrl:F10_SRC},

  {id:'desisti-356-110',manufacturer:'De Sisti',model:'356.110 Four Leaf Rotating Barndoor',category:'Barn Door',compatibilityStatus:'Designed For',compatibleWith:F14,sourceUrl:F14_SRC},
  {id:'desisti-356-210',manufacturer:'De Sisti',model:'356.210 Eight Leaf Rotating Barndoor',category:'Barn Door',compatibilityStatus:'Designed For',compatibleWith:F14,sourceUrl:F14_SRC},
  {id:'desisti-357-100',manufacturer:'De Sisti',model:'357.100 Colorframe',category:'Filter Frame',compatibilityStatus:'Designed For',compatibleWith:F14,sourceUrl:F14_SRC},
  {id:'desisti-358-100',manufacturer:'De Sisti',model:'358.100 Cone with Two Discs',category:'Snoot / Cone',compatibilityStatus:'Designed For',compatibleWith:F14,sourceUrl:F14_SRC},
  {id:'desisti-359-100',manufacturer:'De Sisti',model:'359.100 Stainless Steel Scrim Set',category:'Scrim Set',compatibilityStatus:'Designed For',compatibleWith:F14,sourceUrl:F14_SRC},

  {id:'desisti-f20-barndoor',manufacturer:'De Sisti',model:'F20 Barndoor',category:'Barn Door',compatibilityStatus:'Designed For',compatibleWith:F20,sourceUrl:F20_SRC},
  {id:'desisti-f20-colorframe',manufacturer:'De Sisti',model:'F20 Color Frame',category:'Filter Frame',compatibilityStatus:'Designed For',compatibleWith:F20,sourceUrl:F20_SRC},
  {id:'desisti-f20-cone',manufacturer:'De Sisti',model:'F20 Cone',category:'Snoot / Cone',compatibilityStatus:'Designed For',compatibleWith:F20,sourceUrl:F20_SRC},
  {id:'desisti-f20-scrims',manufacturer:'De Sisti',model:'F20 Scrim Set',category:'Scrim Set',compatibilityStatus:'Designed For',compatibleWith:F20,sourceUrl:F20_SRC},
  {id:'desisti-f20-driver-extension',manufacturer:'De Sisti',model:'F20 Remote Driver Extension Cable',category:'Power / Cable',compatibilityStatus:'Designed For',compatibleWith:F20,sourceUrl:F20_SRC}
];
