// De Sisti Piccoletto miniature LED Fresnel family.
// Verified from the current official De Sisti Piccoletto product page and product data sheets.
const SRC = 'https://www.desisti.it/piccoletto/';
const F_SRC = 'https://www.desisti.it/wp-content/uploads/PICCOLETTO-F.pdf';
const VW_SRC = 'https://www.desisti.it/wp-content/uploads/PICCOLETTO-VW-1.pdf';
const VW_DMX_MANUAL = 'https://www.desisti.it/wp-content/uploads/INSTRUCTION-MANUAL-PICCOLETTO-VW.pdf';
const C_SRC = 'https://www.desisti.it/wp-content/uploads/PICCOLETTO-C-1.pdf';

const fixed = (id, model, variant, cct, ledPowerW, powerDrawW, control, sourceUrl, extra={}) => ({
  id,
  manufacturer:'De Sisti',
  model,
  family:'Piccoletto',
  variant,
  category:'Light',
  sourceType:'Miniature LED Fresnel',
  ledPowerW,
  powerDrawW,
  cctK:{min:cct,max:cct},
  colorMode:cct===3200?'Tungsten':'Daylight',
  cri:cct===3200?97:96,
  tlci:cct===3200?96:97,
  lensDiameterMm:80,
  ipRating:'IP22',
  weightKg:0.95,
  control,
  sourceUrl,
  ...extra
});

export const DESISTI_PICCOLETTO_FIXTURES = [
  fixed('desisti-piccoletto-f-t','Piccoletto F T','F',3200,30,35,['DMX512','On-board'],F_SRC,{dmxModes:[{name:'8-bit dimmer',channels:1,verified:true,sourceUrl:F_SRC,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]}]}),
  fixed('desisti-piccoletto-f-d','Piccoletto F D','F',5600,30,35,['DMX512','On-board'],F_SRC,{dmxModes:[{name:'8-bit dimmer',channels:1,verified:true,sourceUrl:F_SRC,controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}]}]}),
  fixed('desisti-piccoletto-fa-t','Piccoletto FA T','FA',3200,30,35,['Local potentiometer'],SRC),
  fixed('desisti-piccoletto-fa-d','Piccoletto FA D','FA',5600,30,35,['Local potentiometer'],SRC),
  fixed('desisti-piccoletto-dim-t','Piccoletto DIM T','DIM',3200,20,27,['Phase dimming'],SRC),
  fixed('desisti-piccoletto-dim-d','Piccoletto DIM D','DIM',5600,20,27,['Phase dimming'],SRC),
  {
    id:'desisti-piccoletto-vw',
    manufacturer:'De Sisti',
    model:'Piccoletto VW',
    family:'Piccoletto',
    variant:'VW',
    category:'Light',
    sourceType:'Miniature Vari-White LED Fresnel',
    ledPowerW:30,
    powerDrawW:35,
    cctK:{min:2800,max:6600},
    colorMode:'Vari-White',
    cri:95,
    tlci:96,
    beamAngleDeg:{min:18,max:80},
    lensDiameterMm:80,
    ipRating:'IP22',
    weightKg:0.95,
    control:['DMX512','On-board'],
    dmxModes:[
      {name:'Vari-White',channels:3,verified:true,sourceUrl:VW_DMX_MANUAL,requiredChannels:[{channel:3,value:0}],controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},{key:'cct',label:'CCT',channel:2,type:'cct-linear',min:2750,max:6900,dmxMin:0,dmxMax:255}]},
      {name:'Vari-White 16-bit',channels:4,verified:true,sourceUrl:VW_DMX_MANUAL,requiredChannels:[{channel:4,value:0}],controls:[{key:'dimmer',label:'Dimmer',channel:1,type:'percent',bits:16,min:0,max:100,dmxMin:0,dmxMax:65535},{key:'cct',label:'CCT',channel:3,type:'cct-linear',min:2750,max:6900,dmxMin:0,dmxMax:255}]}
    ],
    sourceUrl:VW_SRC
  },
  {
    id:'desisti-piccoletto-c',
    manufacturer:'De Sisti',
    model:'Piccoletto C',
    family:'Piccoletto',
    variant:'Color',
    category:'Light',
    sourceType:'Miniature Color LED Fresnel',
    ledPowerW:35,
    powerDrawW:40,
    cctK:{min:1650,max:8000},
    colorMode:'Color',
    cri:95,
    tlci:96,
    lensDiameterMm:80,
    ipRating:'IP20',
    weightKg:0.95,
    control:['DMX512','On-board'],
    dmxModes:[{name:'Color',channels:4}],
    sourceUrl:C_SRC
  }
];

const ALL = DESISTI_PICCOLETTO_FIXTURES.map(x=>x.id);
const DMX = DESISTI_PICCOLETTO_FIXTURES.filter(x=>x.control.includes('DMX512')).map(x=>x.id);

export const DESISTI_PICCOLETTO_ACCESSORIES = [
  {
    id:'desisti-106-100',
    manufacturer:'De Sisti',
    model:'106.100 Four Leaf Rotating Barndoor',
    category:'Barn Door',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    effectOnLight:'Four-leaf beam shaping and spill control for the 80 mm Piccoletto Fresnel.',
    sourceUrl:F_SRC
  },
  {
    id:'desisti-106-200',
    manufacturer:'De Sisti',
    model:'106.200 Eight Way Rotating Barndoor',
    category:'Barn Door',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    effectOnLight:'Eight-leaf beam shaping and spill control for the 80 mm Piccoletto Fresnel.',
    sourceUrl:VW_SRC
  },
  {
    id:'desisti-107-100',
    manufacturer:'De Sisti',
    model:'107.100 Color Frame',
    category:'Filter Frame',
    compatibilityStatus:'Designed For',
    compatibleWith:ALL,
    sourceUrl:VW_SRC
  },
  {
    id:'desisti-5402-503',
    manufacturer:'De Sisti',
    model:'5402.503 DMX Daisy Chain Cable 3 m',
    category:'DMX Cable',
    compatibilityStatus:'Designed For',
    compatibleWith:DMX,
    sourceUrl:VW_SRC
  }
];
