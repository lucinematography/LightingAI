// De Sisti legacy/conventional Tungsten Quartz Halogen Fresnels.
// Verified from official De Sisti Tungsten Quartz Halogen Fresnels pages.
const CAT='https://www.desisti.it/tungsten-quartz-halogen-fresnels/';
const MAGIS='https://www.desisti.it/magis/';
const L1='https://www.desisti.it/leonardo-1kw/';
const L2='https://www.desisti.it/leonardo-2kw/';
const LM='https://www.desisti.it/leonardo-multipower/';
const L5='https://www.desisti.it/leonardo-5kw/';
const LP='https://www.desisti.it/leonardo-piccolo-10-12kw/';
const SUPER20='https://www.desisti.it/super-leo-20-24kw/';

function tungstenFixture(id,model,powerW,lensDiameterMm,sourceUrl,extra={}){
  return {
    id,manufacturer:'De Sisti',model,family:'Tungsten Quartz Halogen Fresnels',
    category:'Light',sourceType:'Tungsten Quartz Halogen Fresnel',
    lampPowerW:powerW,powerDrawW:powerW,cctK:{min:3200,max:3200},colorMode:'Tungsten',
    lifecycle:'legacy / conventional',control:['Manual'],
    ...(lensDiameterMm?{lensDiameterMm}:{}),sourceUrl,...extra
  };
}

export const DESISTI_TUNGSTEN_FIXTURES=[
  tungstenFixture('desisti-magis-300','Magis 300 W',300,null,MAGIS),
  tungstenFixture('desisti-magis-500','Magis 500 W',500,null,MAGIS),
  tungstenFixture('desisti-magis-650','Magis 650 W',650,null,MAGIS),
  tungstenFixture('desisti-leonardo-1kw','Leonardo 1 kW',1000,null,L1),
  tungstenFixture('desisti-leonardo-2kw','Leonardo 2 kW',2000,250,L2,{weightKg:12,ipRating:'IP22'}),
  tungstenFixture('desisti-leonardo-multipower','Leonardo Multipower',2500,250,LM,{weightKg:12,ipRating:'IP22',lampPowerOptionsW:[650,1000,1200,2000,2500]}),
  tungstenFixture('desisti-leonardo-5kw','Leonardo 5 kW',5000,300,L5,{ipRating:'IP22'}),
  tungstenFixture('desisti-leonardo-piccolo-10-12kw','Leonardo Piccolo 10-12 kW',12000,350,LP,{weightKg:26.5,ipRating:'IP22',lampPowerOptionsW:[10000,12000]}),
  tungstenFixture('desisti-super-leo-10-12kw','Super Leo 10-12 kW',12000,null,CAT,{control:['Manual','Local/remote dimmer']}),
  tungstenFixture('desisti-super-leo-20-24kw','Super Leo 20-24 kW',24000,null,SUPER20,{control:['Built-in dimmer','Local/remote']})
];

const ids=DESISTI_TUNGSTEN_FIXTURES.map(x=>x.id);
const magis=ids.filter(x=>x.includes('magis-'));
const leonardo=ids.filter(x=>x.includes('leonardo-'));
const superLeo=ids.filter(x=>x.includes('super-leo-'));

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const DESISTI_TUNGSTEN_ACCESSORIES=[
  acc('desisti-tungsten-magis-4leaf','Magis Four Leaf Rotating Barndoor','Barn Door',magis,MAGIS,'Shapes the Fresnel beam and controls spill.'),
  acc('desisti-tungsten-magis-8leaf','Magis Eight Leaf Rotating Barndoor','Barn Door',magis,MAGIS,'Provides finer spill control.'),
  acc('desisti-tungsten-magis-colorframe','Magis Color Frame','Filter Frame',magis,MAGIS),
  acc('desisti-tungsten-magis-scrims','Magis Scrim Set','Scrim Set',magis,MAGIS,'Reduces output while preserving Fresnel beam character.'),
  acc('desisti-tungsten-leonardo-4leaf','Leonardo Four Leaf Rotating Barndoor','Barn Door',leonardo,L5,'Shapes the Fresnel beam and controls spill.'),
  acc('desisti-tungsten-leonardo-8leaf','Leonardo Eight Leaf Rotating Barndoor','Barn Door',leonardo,L5,'Provides finer spill control.'),
  acc('desisti-tungsten-leonardo-colorframe','Leonardo Color Frame','Filter Frame',leonardo,L5),
  acc('desisti-tungsten-leonardo-cone','Leonardo Cone with Two Discs','Snoot / Cone',leonardo,L5,'Narrows and controls spill.'),
  acc('desisti-tungsten-leonardo-scrims','Leonardo Stainless Steel Scrim Set','Scrim Set',leonardo,L5,'Reduces output while preserving beam shape.'),
  acc('desisti-tungsten-leonardo-bottom-spill','Leonardo 180° Bottom Light Spill Protection','Light Control',leonardo,L5),
  acc('desisti-tungsten-superleo-barndoor','Super Leo Four Leaf Rotating Barndoor','Barn Door',superLeo,SUPER20,'Shapes the high-output Fresnel beam.'),
  acc('desisti-tungsten-superleo-colorframe','Super Leo Color Frame','Filter Frame',superLeo,SUPER20),
  acc('desisti-tungsten-superleo-scrims','Super Leo Scrim Set','Scrim Set',superLeo,SUPER20,'Reduces output while preserving Fresnel character.')
];
