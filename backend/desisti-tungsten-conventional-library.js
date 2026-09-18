// De Sisti conventional tungsten Fresnel range.
// Verified from official De Sisti product pages. These are legacy/conventional lamp fixtures kept for rental-house and film-set workflows.
const SRC={
  magis:'https://www.desisti.it/magis/',
  leo1:'https://www.desisti.it/leonardo-1kw/',
  leo2:'https://www.desisti.it/leonardo-2kw/',
  multipower:'https://www.desisti.it/leonardo-multipower/',
  leo5:'https://www.desisti.it/leonardo-5kw/',
  piccolo1012:'https://www.desisti.it/leonardo-piccolo-10-12kw/',
  super2024:'https://www.desisti.it/super-leo-20-24kw/'
};

function tungstenFixture(id,model,powerW,lensDiameterMm,weightKg,sourceUrl,extra={}){
  return {
    id,manufacturer:'De Sisti',model,family:'Conventional Tungsten Fresnel',category:'Light',
    sourceType:'Tungsten Quartz-Halogen Fresnel',lampPowerW:powerW,cctK:{min:3200,max:3200},
    colorMode:'Tungsten',lensDiameterMm,ipRating:'IP22',weightKg,legacy:true,
    control:['Mains dimmer / line power'],sourceUrl,...extra
  };
}

export const DESISTI_TUNGSTEN_FIXTURES=[
  tungstenFixture('desisti-magis-300','Magis 300 W',300,120,2.4,SRC.magis,{lampSocket:'GY9.5'}),
  tungstenFixture('desisti-magis-500','Magis 500 W',500,120,2.4,SRC.magis,{lampSocket:'GY9.5'}),
  tungstenFixture('desisti-magis-650','Magis 650 W',650,120,2.4,SRC.magis,{lampSocket:'GY9.5'}),
  tungstenFixture('desisti-leonardo-1kw','Leonardo 1 kW',1000,150,6.3,SRC.leo1,{lampSocket:'G22 / GX9.5'}),
  tungstenFixture('desisti-leonardo-2kw','Leonardo 2 kW',2000,250,12.0,SRC.leo2),
  {
    id:'desisti-leonardo-multipower',manufacturer:'De Sisti',model:'Leonardo MultiPower',family:'Conventional Tungsten Fresnel',
    category:'Light',sourceType:'Multi-power Tungsten Quartz-Halogen Fresnel',lampPowerOptionsW:[650,1000,1200,2000,2500],
    maxLampPowerW:2500,cctK:{min:3200,max:3200},colorMode:'Tungsten',lensDiameterMm:250,lampSocket:'G22',
    ipRating:'IP22',weightKg:12.0,legacy:true,control:['Mains dimmer / line power'],sourceUrl:SRC.multipower
  },
  tungstenFixture('desisti-leonardo-5kw','Leonardo 5 kW',5000,300,16.0,SRC.leo5),
  {
    id:'desisti-leonardo-piccolo-10-12kw',manufacturer:'De Sisti',model:'Leonardo Piccolo 10-12 kW',
    family:'Conventional Tungsten Fresnel',category:'Light',sourceType:'Dual-power Tungsten Quartz-Halogen Fresnel',
    lampPowerOptionsW:[10000,12000],maxLampPowerW:12000,cctK:{min:3200,max:3200},colorMode:'Tungsten',
    lensDiameterMm:350,lampSocket:'G38',ipRating:'IP22',weightKg:26.5,legacy:true,
    control:['Mains dimmer / line power'],sourceUrl:SRC.piccolo1012
  },
  {
    id:'desisti-super-leo-20-24kw',manufacturer:'De Sisti',model:'Super Leo 20-24 kW',
    family:'Conventional Tungsten Fresnel',category:'Light',sourceType:'High-power Tungsten Quartz-Halogen Fresnel',
    lampPowerOptionsW:[20000,24000],maxLampPowerW:24000,cctK:{min:3200,max:3200},colorMode:'Tungsten',
    lensDiameterMm:625,lampSocket:'G38',legacy:true,
    control:['Built-in dimmer','Local/remote control'],sourceUrl:SRC.super2024
  }
];

const magis=['desisti-magis-300','desisti-magis-500','desisti-magis-650'];
const leo1=['desisti-leonardo-1kw'];
const medium=['desisti-leonardo-2kw','desisti-leonardo-multipower'];
const leo5=['desisti-leonardo-5kw'];
const big=['desisti-leonardo-piccolo-10-12kw'];
const superLeo=['desisti-super-leo-20-24kw'];

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}
function frontSet(prefix,targets,source,codes){
  return [
    acc('desisti-'+prefix+'-4leaf',codes[0]+' Four Leaf Rotating Barndoor','Barn Door',targets,source,'Shapes the Fresnel beam and controls spill.'),
    acc('desisti-'+prefix+'-8leaf',codes[1]+' Eight Leaf Rotating Barndoor','Barn Door',targets,source,'Eight-leaf beam shaping and spill control.'),
    acc('desisti-'+prefix+'-colorframe',codes[2]+' Colorframe','Filter Frame',targets,source),
    acc('desisti-'+prefix+'-cone',codes[3]+' Cone with Two Discs','Snoot / Cone',targets,source,'Narrows the Fresnel beam and suppresses spill.'),
    acc('desisti-'+prefix+'-scrims',codes[4]+' Stainless Steel Scrim Set','Scrim Set',targets,source,'Reduces light output while preserving beam geometry.')
  ];
}

export const DESISTI_TUNGSTEN_ACCESSORIES=[
  ...frontSet('magis',magis,SRC.magis,['306.100','306.200','307.100','308.100','309.100']),
  ...frontSet('leonardo-1k',leo1,SRC.leo1,['316.100','316.200','317.100','318.100','319.100']),
  ...frontSet('leonardo-2k-multipower',medium,SRC.multipower,['326.110','326.210','327.100','328.100','329.100']),
  ...frontSet('leonardo-5k',leo5,SRC.leo5,['326.110','326.210','327.100','328.100','329.100']),
  ...frontSet('leonardo-piccolo-1012',big,SRC.piccolo1012,['326.110','326.210','327.100','328.100','329.100']),
  acc('desisti-super-leo-2024-feed','401.100 7 ft Detachable Feeding Cable','Power / Cable',superLeo,SRC.super2024),
  acc('desisti-super-leo-2024-remote-33','404.110 33 ft Dimmer Remote Extension','Control Cable',superLeo,SRC.super2024),
  acc('desisti-super-leo-2024-remote-66','404.120 66 ft Dimmer Remote Extension','Control Cable',superLeo,SRC.super2024),
  acc('desisti-super-leo-2024-4leaf','496.100 Four Leaf Rotating Barndoor','Barn Door',superLeo,SRC.super2024,'Shapes the high-power Fresnel beam.'),
  acc('desisti-super-leo-2024-colorframe','497.100 Colorframe','Filter Frame',superLeo,SRC.super2024),
  acc('desisti-super-leo-2024-scrims','499.100 Stainless Steel Scrim Set','Scrim Set',superLeo,SRC.super2024),
  acc('desisti-super-leo-2024-remote','5505.100 Analogue Dimmer Remote Control','Control',superLeo,SRC.super2024)
];
