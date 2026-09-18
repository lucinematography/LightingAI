// Additional De Sisti conventional discharge/tungsten fixtures.
// Verified from official De Sisti Goya and Giotto documentation.
const GOYA400='https://www.desisti.it/it/goya-400w/';
const GOYA575='https://www.desisti.it/goya-575w/';
const GOYA1200='https://www.desisti.it/goya-1200w/';
const GOYA254='https://www.desisti.it/goya-2-5-4kw/';
const GIOTTO='https://www.desisti.it/wp-content/uploads/2017/12/ds_Giotto.pdf';

function goya(id,model,powerW,sourceUrl,extra={}){
  return {
    id,manufacturer:'De Sisti',model,family:'Goya',category:'Light',
    sourceType:'Daylight Discharge Broadlight',lampPowerW:powerW,
    cctK:{min:5600,max:5600},colorMode:'Daylight',cri:90,
    beamAngleDeg:{min:90,max:90},ipRating:'IP23',
    lifecycle:'legacy / conventional',control:['External electronic ballast'],
    sourceUrl,...extra
  };
}

export const DESISTI_CONVENTIONAL_EXTRA_FIXTURES=[
  goya('desisti-goya-400w','Goya 400 W',400,GOYA400),
  goya('desisti-goya-575w','Goya 575 W',575,GOYA575),
  goya('desisti-goya-1200w','Goya 1200 W',1200,GOYA1200),
  goya('desisti-goya-2-5-4kw','Goya 2.5/4 kW',4000,GOYA254,{lampPowerOptionsW:[2500,4000]}),
  goya('desisti-goya-6-12kw','Goya 6/12 kW',12000,GOYA254,{lampPowerOptionsW:[6000,12000]}),
  {
    id:'desisti-giotto-mk2-tungsten',
    manufacturer:'De Sisti',
    model:'Giotto MK2',
    family:'Giotto',
    category:'Light',
    sourceType:'Tungsten Quartz-Halogen Top Cyclorama',
    cctK:{min:3200,max:3200},
    colorMode:'Tungsten',
    lampSocket:'R7s',
    compartmentCountOptions:[2,3,4],
    maxLampPowerPerCompartmentW:1250,
    lifecycle:'legacy / conventional',
    control:['Line power / external dimmer'],
    sourceUrl:GIOTTO
  }
];

const goyas=DESISTI_CONVENTIONAL_EXTRA_FIXTURES.filter(x=>x.family==='Goya').map(x=>x.id);
const smallGoya=['desisti-goya-400w','desisti-goya-575w'];
const mediumGoya=['desisti-goya-1200w'];
const highGoya=['desisti-goya-2-5-4kw','desisti-goya-6-12kw'];
const giotto=['desisti-giotto-mk2-tungsten'];

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const DESISTI_CONVENTIONAL_EXTRA_ACCESSORIES=[
  acc('desisti-goya-8leaf-barndoor','Goya Eight Leaf Barndoor','Barn Door',goyas,GOYA254,'Controls the broad 90-degree discharge beam.'),
  acc('desisti-goya-black-reflector','Goya Black Reflector Kit','Light Control',goyas,GOYA254,'Creates the Goya shadowlight configuration with sharper projected shadows.'),
  acc('desisti-goya-white-reflector','Goya White Reflector Kit','Light Control',goyas,GOYA254,'Provides the broad homogeneous Goya field.'),
  acc('desisti-goya-scrims','Goya Stainless Steel Scrim Set','Scrim Set',goyas,GOYA254,'Reduces output while preserving the broad field.'),
  acc('desisti-goya-diffuser-glass','Goya Diffuser Glass','Diffusion',smallGoya,GOYA400,'Softens the broadlight field.'),
  acc('desisti-goya-deb-200-400','DEB 200/400 W Dual Flicker-Free Electronic Ballast','Ballast',['desisti-goya-400w'],GOYA400),
  acc('desisti-goya-deb-575','DEB 575 W Flicker-Free Electronic Ballast','Ballast',['desisti-goya-575w'],GOYA575),
  acc('desisti-goya-deb-575-1200','DEB 575/1200 W Dual Flicker-Free Electronic Ballast','Ballast',mediumGoya,GOYA1200),
  acc('desisti-goya-deb-2500-4000','DEB 2500/4000 W Dual Flicker-Free Electronic Ballast','Ballast',['desisti-goya-2-5-4kw'],GOYA254),
  acc('desisti-goya-head-ballast-25ft','Goya Head-to-Ballast Cable 25 ft','Power / Data Cable',goyas,GOYA254),
  acc('desisti-goya-head-ballast-50ft','Goya Head-to-Ballast Cable 50 ft','Power / Data Cable',goyas,GOYA254),
  acc('desisti-goya-high-system','Goya High-Power External Ballast System','Ballast',highGoya,GOYA254),

  acc('desisti-giotto-filter-frame','Giotto MK2 Flexible Filter Frame','Filter Frame',giotto,GIOTTO,'Holds gel tangential to the output rays for cyclorama color.'),
  acc('desisti-giotto-manual-yoke','Giotto MK2 Manual Yoke','Mounting',giotto,GIOTTO),
  acc('desisti-giotto-pole-yoke','Giotto MK2 Pole-Operated Yoke','Mounting',giotto,GIOTTO)
];
