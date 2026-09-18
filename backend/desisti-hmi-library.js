// De Sisti conventional Daylight discharge (HMI/MSR) Fresnels and PARs.
// Verified from official De Sisti Rembrandt and Remington product pages/data sheets.
const REMB12='https://www.desisti.it/rembrandt-1-2-2-5kw/';
const REMB25='https://www.desisti.it/wp-content/uploads/2019/02/REMBRANDT-2.5-4kw.pdf';
const REMB612='https://www.desisti.it/rembrandt-6-12kw/';
const REMB1218='https://www.desisti.it/rembrandt-12-18kw/';
const REMB575='https://www.desisti.it/rembrandt-575w/';
const REMB1200='https://www.desisti.it/wp-content/uploads/2018/02/ds_Rembrandt_Piccolo_1200w.pdf';
const REMING1200='https://www.desisti.it/remington-1200w/';
const REMING25='https://www.desisti.it/remington-2-5-4kw/';

function hmi(id,model,family,powerW,sourceType,sourceUrl,extra={}){
 return {
   id,manufacturer:'De Sisti',model,family,category:'Light',sourceType,
   lampPowerW:powerW,cctK:{min:5600,max:5600},colorMode:'Daylight',
   cri:90,lifecycle:'legacy / conventional',ipRating:'IP23',
   control:['External electronic ballast'],sourceUrl,...extra
 };
}

export const DESISTI_HMI_FIXTURES=[
  hmi('desisti-rembrandt-200w-mk2','Rembrandt 200 W MK2','Rembrandt',200,'Daylight Discharge Fresnel',REMB575),
  hmi('desisti-rembrandt-575w-mk2','Rembrandt Piccolo 575 W MK2','Rembrandt',575,'Daylight Discharge Fresnel',REMB575,{weightKg:5.8,lensDiameterMm:150}),
  hmi('desisti-rembrandt-piccolo-1200w','Rembrandt Piccolo 1.2 kW','Rembrandt',1200,'Daylight Discharge Fresnel',REMB1200),
  hmi('desisti-rembrandt-1-2-2-5kw','Rembrandt 1.2/2.5 kW','Rembrandt',2500,'Dual-power Daylight Discharge Fresnel',REMB12,{weightKg:14.3}),
  hmi('desisti-rembrandt-2-5-4kw','Rembrandt 2.5/4 kW','Rembrandt',4000,'Dual-power Daylight Discharge Fresnel',REMB25,{weightKg:19,beamAngleDeg:{min:8,max:58}}),
  hmi('desisti-rembrandt-piccolo-6kw','Rembrandt Piccolo 6 kW','Rembrandt',6000,'Daylight Discharge Fresnel',REMB612),
  hmi('desisti-rembrandt-piccolo-6-12kw-mk2','Rembrandt Piccolo 6/12 kW MK2','Rembrandt',12000,'Dual-power Daylight Discharge Fresnel',REMB612,{weightKg:43}),
  hmi('desisti-rembrandt-12-18kw-mk2','Rembrandt 12/18 kW MK2','Rembrandt',18000,'Dual-power Daylight Discharge Fresnel',REMB1218),

  hmi('desisti-remington-575w','Remington 575 W','Remington',575,'HMI Open Face PAR',REMB575),
  hmi('desisti-remington-1200w','Remington 1200 W','Remington',1200,'HMI Open Face PAR',REMING1200),
  hmi('desisti-remington-2-5-4kw','Remington 2.5/4 kW','Remington',4000,'Dual-power HMI PAR',REMING25),
  hmi('desisti-remington-6kw','Remington 6 kW','Remington',6000,'HMI PAR',REMING25),
  hmi('desisti-remington-6-12kw','Remington 6/12 kW','Remington',12000,'Dual-power HMI PAR',REMING25)
];

const fresnels=DESISTI_HMI_FIXTURES.filter(x=>x.family==='Rembrandt').map(x=>x.id);
const pars=DESISTI_HMI_FIXTURES.filter(x=>x.family==='Remington').map(x=>x.id);
const rembrandt1225=['desisti-rembrandt-1-2-2-5kw'];
const rembrandt254=['desisti-rembrandt-2-5-4kw'];
const rembrandt612=['desisti-rembrandt-piccolo-6kw','desisti-rembrandt-piccolo-6-12kw-mk2'];
const rembrandt1218=['desisti-rembrandt-12-18kw-mk2'];
const remington1200=['desisti-remington-1200w'];
const remington254=['desisti-remington-2-5-4kw'];

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
 return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const DESISTI_HMI_ACCESSORIES=[
  acc('desisti-hmi-rembrandt-barndoor','Rembrandt Rotating Barndoor','Barn Door',fresnels,REMB12,'Shapes the daylight Fresnel beam and controls spill.'),
  acc('desisti-hmi-rembrandt-colorframe','Rembrandt Color Frame','Filter Frame',fresnels,REMB12),
  acc('desisti-hmi-rembrandt-scrims','Rembrandt Stainless Steel Scrim Set','Scrim Set',fresnels,REMB12,'Reduces output while preserving beam geometry.'),
  acc('desisti-hmi-rembrandt-cone','Rembrandt Cone with Two Discs','Snoot / Cone',fresnels,REMB12,'Narrows and controls spill.'),
  acc('desisti-hmi-deb-575-1200-2500','DEB 575/1200/2500 W Electronic Ballast','Ballast',rembrandt1225,REMB12),
  acc('desisti-hmi-deb-2500-4000','DEB 2500/4000 W Dual Flicker-Free Electronic Ballast','Ballast',rembrandt254,REMB25),
  acc('desisti-hmi-deb-6000-12000','DEB 6000/12000 W Dual Flicker-Free Electronic Ballast','Ballast',rembrandt612,REMB612),
  acc('desisti-hmi-deb-12000-18000','DEB 12000/18000 W Dual Electronic Ballast','Ballast',rembrandt1218,REMB1218),

  acc('desisti-hmi-remington-barndoor','Remington Rotating Barndoor','Barn Door',pars,REMING25,'Controls PAR spill around the selected drop-in lens.'),
  acc('desisti-hmi-remington-colorframe','Remington Color Frame','Filter Frame',pars,REMING25),
  acc('desisti-hmi-remington-scrims','Remington Stainless Steel Scrim Set','Scrim Set',pars,REMING25,'Reduces output without changing the selected PAR lens.'),
  acc('desisti-hmi-remington-five-lens-set','Remington Five-Lens Set: Narrow, Medium, Wide, Extra Wide, Frosted Fresnel','PAR Lens Set',pars,REMING1200,'Changes the PAR beam from narrow through extra-wide plus frosted Fresnel coverage.'),
  acc('desisti-hmi-remington-1200-ballast','DEB 575/1200 W Electronic Ballast','Ballast',remington1200,REMING1200),
  acc('desisti-hmi-remington-2500-4000-ballast','DEB 2500/4000 W Dual Flicker-Free Electronic Ballast','Ballast',remington254,REMING25),
  acc('desisti-hmi-head-ballast-25ft','De Sisti HMI Head-to-Ballast Cable 25 ft','Power / Data Cable',[...fresnels,...pars],REMING1200),
  acc('desisti-hmi-head-ballast-50ft','De Sisti HMI Head-to-Ballast Cable 50 ft','Power / Data Cable',[...fresnels,...pars],REMING1200)
];
