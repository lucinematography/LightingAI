// De Sisti conventional Daylight discharge (HMI/MSR) Fresnels and PARs.
// Verified from official De Sisti Rembrandt and Remington product pages/data sheets.
const REMB200='https://www.desisti.it/rembrandt-piccolo-200w/';
const REMB575='https://www.desisti.it/rembrandt-575w/';
const REMB1200='https://www.desisti.it/wp-content/uploads/2018/02/ds_Rembrandt_Piccolo_1200w.pdf';
const REMB12='https://www.desisti.it/rembrandt-1-2-2-5kw/';
const REMB25='https://www.desisti.it/wp-content/uploads/2019/02/REMBRANDT-2.5-4kw.pdf';
const REMB6='https://www.desisti.it/rembrandt-piccolo-6kw/';
const REMB612='https://www.desisti.it/rembrandt-6-12kw/';
const REMB1218='https://www.desisti.it/rembrandt-12-18kw/';
const REMING575='https://www.desisti.it/remington-575w/';
const REMING1200='https://www.desisti.it/remington-1200w/';
const REMING25='https://www.desisti.it/remington-2-5-4kw/';
const REMING6='https://www.desisti.it/remington-6kw/';

function hmi(id,model,family,powerW,sourceType,sourceUrl,extra={}){
  return {
    id,manufacturer:'De Sisti',model,family,category:'Light',sourceType,
    lampPowerW:powerW,cctK:{min:5600,max:5600},colorMode:'Daylight',
    cri:90,lifecycle:'legacy / conventional',control:['External electronic ballast'],
    sourceUrl,...extra
  };
}

export const DESISTI_HMI_FIXTURES=[
  hmi('desisti-rembrandt-200w-mk2','Rembrandt Piccolo 200 W','Rembrandt',200,'Daylight Discharge Fresnel',REMB200,{weightKg:2.9,lensDiameterMm:120,ipRating:'IP22'}),
  hmi('desisti-rembrandt-575w-mk2','Rembrandt Piccolo 575 W MK2','Rembrandt',575,'Daylight Discharge Fresnel',REMB575,{weightKg:5.8,lensDiameterMm:150,ipRating:'IP23'}),
  hmi('desisti-rembrandt-piccolo-1200w','Rembrandt Piccolo 1.2 kW','Rembrandt',1200,'Daylight Discharge Fresnel',REMB1200),
  hmi('desisti-rembrandt-1-2-2-5kw','Rembrandt 1.2/2.5 kW','Rembrandt',2500,'Dual-power Daylight Discharge Fresnel',REMB12,{weightKg:14.3,ipRating:'IP23',lampPowerOptionsW:[1200,2500]}),
  hmi('desisti-rembrandt-2-5-4kw','Rembrandt 2.5/4 kW','Rembrandt',4000,'Dual-power Daylight Discharge Fresnel',REMB25,{lampPowerOptionsW:[2500,4000]}),
  hmi('desisti-rembrandt-piccolo-6kw','Rembrandt Piccolo 6 kW','Rembrandt',6000,'Daylight Discharge Fresnel',REMB6,{weightKg:29,lensDiameterMm:350,ipRating:'IP22'}),
  hmi('desisti-rembrandt-piccolo-6-12kw-mk2','Rembrandt 6/12 kW','Rembrandt',12000,'Dual-power Daylight Discharge Fresnel',REMB612,{weightKg:43,lampPowerOptionsW:[6000,12000]}),
  hmi('desisti-rembrandt-12-18kw-mk2','Rembrandt 12/18 kW MK2','Rembrandt',18000,'Dual-power Daylight Discharge Fresnel',REMB1218,{lampPowerOptionsW:[12000,18000]}),

  hmi('desisti-remington-575w','Remington 575 W','Remington',575,'HMI Open Face PAR',REMING575,{ipRating:'IP23',lampSocket:'G22'}),
  hmi('desisti-remington-1200w','Remington 1200 W','Remington',1200,'HMI Open Face PAR',REMING1200,{ipRating:'IP23',lampSocket:'G38'}),
  hmi('desisti-remington-2-5-4kw','Remington 2.5/4 kW','Remington',4000,'Dual-power HMI PAR',REMING25,{ipRating:'IP23',lampPowerOptionsW:[2500,4000]}),
  hmi('desisti-remington-6kw','Remington 6 kW','Remington',6000,'HMI Open Face PAR',REMING6,{ipRating:'IP23'}),
  hmi('desisti-remington-6-12kw','Remington 6/12 kW','Remington',12000,'Dual-power HMI PAR',REMING6,{ipRating:'IP23',lampPowerOptionsW:[6000,12000]})
];

const fresnels=DESISTI_HMI_FIXTURES.filter(x=>x.family==='Rembrandt').map(x=>x.id);
const pars=DESISTI_HMI_FIXTURES.filter(x=>x.family==='Remington').map(x=>x.id);
const smallFres=['desisti-rembrandt-200w-mk2','desisti-rembrandt-575w-mk2','desisti-rembrandt-piccolo-1200w'];
const midFres=['desisti-rembrandt-1-2-2-5kw','desisti-rembrandt-2-5-4kw'];
const highFres=['desisti-rembrandt-piccolo-6kw','desisti-rembrandt-piccolo-6-12kw-mk2'];
const ultraFres=['desisti-rembrandt-12-18kw-mk2'];
const rem575=['desisti-remington-575w'];
const rem1200=['desisti-remington-1200w'];
const rem254=['desisti-remington-2-5-4kw'];
const remHigh=['desisti-remington-6kw','desisti-remington-6-12kw'];

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}
function fresnelFront(prefix,targets,source){
  return [
    acc('desisti-'+prefix+'-barndoor',prefix.toUpperCase()+' Rotating Barndoor','Barn Door',targets,source,'Shapes the daylight Fresnel beam and controls spill.'),
    acc('desisti-'+prefix+'-colorframe',prefix.toUpperCase()+' Color Frame','Filter Frame',targets,source),
    acc('desisti-'+prefix+'-scrims',prefix.toUpperCase()+' Stainless Steel Scrim Set','Scrim Set',targets,source,'Reduces output while preserving Fresnel beam geometry.')
  ];
}
function parFront(prefix,targets,source){
  return [
    acc('desisti-'+prefix+'-barndoor',prefix.toUpperCase()+' Rotating Barndoor','Barn Door',targets,source,'Controls spill around the selected PAR lens.'),
    acc('desisti-'+prefix+'-colorframe',prefix.toUpperCase()+' Color Frame','Filter Frame',targets,source),
    acc('desisti-'+prefix+'-scrims',prefix.toUpperCase()+' Stainless Steel Scrim Set','Scrim Set',targets,source),
    acc('desisti-'+prefix+'-lens-set',prefix.toUpperCase()+' Five-Lens Set','PAR Lens Set',targets,source,'Very/narrow spot through wide/extra-wide plus frosted Fresnel coverage.')
  ];
}

export const DESISTI_HMI_ACCESSORIES=[
  ...fresnelFront('rembrandt-small',smallFres,REMB575),
  ...fresnelFront('rembrandt-mid',midFres,REMB12),
  ...fresnelFront('rembrandt-high',highFres,REMB612),
  ...fresnelFront('rembrandt-ultra',ultraFres,REMB1218),
  acc('desisti-hmi-deb-200','DEB 200 AC/DC Ballast','Ballast',['desisti-rembrandt-200w-mk2'],REMB200),
  acc('desisti-hmi-deb-575-1200','DEB 575/1200 W Electronic Ballast','Ballast',['desisti-rembrandt-575w-mk2','desisti-rembrandt-piccolo-1200w'],REMB575),
  acc('desisti-hmi-deb-1200-2500','DEB 1.2/2.5 kW Ballast / Adaptor System','Ballast',['desisti-rembrandt-1-2-2-5kw'],REMB12),
  acc('desisti-hmi-deb-2500-4000','DEB 2.5/4 kW Dual Flicker-Free Electronic Ballast','Ballast',['desisti-rembrandt-2-5-4kw'],REMB25),
  acc('desisti-hmi-deb-6000-12000','2555.100 DEB 6000/12000 W Dual Flicker-Free Electronic Ballast','Ballast',highFres,REMB612),
  acc('desisti-hmi-deb-12000-18000','DEB 12/18 kW Dual Digital Ballast','Ballast',ultraFres,REMB1218),
  acc('desisti-hmi-head-ballast-25ft','De Sisti HMI Head-to-Ballast Cable 25 ft','Power / Data Cable',fresnels,REMB12),
  acc('desisti-hmi-head-ballast-50ft','De Sisti HMI Head-to-Ballast Cable 50 ft','Power / Data Cable',fresnels,REMB12),

  ...parFront('remington-575',rem575,REMING575),
  ...parFront('remington-1200',rem1200,REMING1200),
  ...parFront('remington-254',rem254,REMING25),
  ...parFront('remington-high',remHigh,REMING6),
  acc('desisti-remington-575-ballast','DEB 575 W Flicker-Free Electronic Ballast','Ballast',rem575,REMING575),
  acc('desisti-remington-1200-ballast','DEB 1200 W Electronic Ballast','Ballast',rem1200,REMING1200),
  acc('desisti-remington-254-ballast','2535.100 DEB 2500/4000 W Dual Flicker-Free Electronic Ballast','Ballast',rem254,REMING25),
  acc('desisti-remington-6-ballast','2545.110 DEB 4000/6000 W Digital Flicker-Free Ballast','Ballast',remHigh,REMING6),
  acc('desisti-remington-head-ballast-25ft','Remington Head-to-Ballast Cable 25 ft','Power / Data Cable',pars,REMING1200),
  acc('desisti-remington-head-ballast-50ft','Remington Head-to-Ballast Cable 50 ft','Power / Data Cable',pars,REMING1200)
];
