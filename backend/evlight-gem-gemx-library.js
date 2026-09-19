// EV LIGHT GEM / GEMX film and studio panel catalog.
// Sources: official EV LIGHT product pages and accessories catalog.
const GEM1X1BI='https://www.evlightprofessional.com/quality-led-soft-light-panel-68277576.html';
const GEM1X1FC='https://www.evlightprofessional.com/products-index/5/';
const GEM2X1BI='https://www.evlightprofessional.com/quality-led-soft-light-panel-63222309.html';
const GEM2X1ST='https://www.evlightprofessional.com/quality-led-soft-light-panel-63400265.html';
const GEMX21HARD='https://www.evlightprofessional.com/quality-led-soft-light-panel-63364386.html';
const ACCESSORIES='https://www.evlightpro.com/accessories/';

function fixture(id,model,family,powerW,cctMin,cctMax,colorMode,beamAngleDeg,sourceUrl,extra={}){
  return {
    id,manufacturer:'EV Light',model,family,category:'Light',
    sourceType:'LED Film/Studio Panel',powerW,cctK:{min:cctMin,max:cctMax},
    colorMode,beamAngleDeg,sourceUrl,...extra
  };
}
function acc(id,model,category,compatibleWith,effectOnLight){
  return {id,manufacturer:'EV Light',model,family:'GEM / GEMX',category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl:ACCESSORIES,...(effectOnLight?{effectOnLight}:{})};
}

export const EVLIGHT_GEM_GEMX_FIXTURES=[
  fixture('evlight-gem1x1bi','GEM1X1BI','GEM',200,2700,6400,'Bi-Color',110,GEM1X1BI,{cri:96,tlci:98,dimming:'0-100%',control:['DMX512','RDM'],ipRating:'IP20',dimensions:'449 x 506 x 178.5 mm',weightKg:7,cooling:'Controllable fan'}),
  fixture('evlight-gem1x1fc','GEM1X1FC','GEM',200,2700,10000,'RGBW Full Color',null,GEM1X1FC,{control:['DMX512'],formFactor:'1x1 soft panel'}),
  fixture('evlight-gem2x1bi','GEM2X1BI','GEM',350,2700,6500,'Bi-Color',120,GEM2X1BI,{cri:96,dimming:'0-100%',control:['DMX512'],ipRating:'IP20',dimensions:'737 x 382.5 x 173 mm',weightKg:11.8}),
  fixture('evlight-gem2x1st','GEM2X1ST','GEM',350,2700,10000,'RGBW Full Color',110,GEM2X1ST,{cri:97,tlci:98,cqs:96,control:['DMX512','RDM','WiFi-DMX'],modes:['CCT','HSI','GEL','RGBCW','XY'],battery:'57V series supported'}),
  fixture('evlight-gemx21-hard','GEMX21 HARD','GEMX',360,2700,10000,'RGBWW Full Color',25,GEMX21HARD,{cri:96,control:['DMX512','RDM','Wireless DMX','WiFi-DMX'],ipRating:'IP65',dimmingFrequency:'20 kHz',alternateBeamAngleDeg:120})
];

const twoByOne=['evlight-gem2x1bi','evlight-gem2x1st','evlight-gemx21-hard'];

export const EVLIGHT_GEM_GEMX_ACCESSORIES=[
  acc('evlight-1x1-cellular-grille','1x1 Cellular Grille','Grid',['evlight-gem1x1bi','evlight-gem1x1fc'],'Controls spill from EV Light 1x1 GEM panels.'),
  acc('evlight-1x1-softbox','1x1 Softbox','Softbox',['evlight-gem1x1bi','evlight-gem1x1fc'],'Softens and enlarges the apparent source for EV Light 1x1 GEM panels.'),
  acc('evlight-2x1-cellular-grille','2x1 Cellular Grille','Grid',twoByOne,'Controls spill; official accessory page lists 60° / 90° options.'),
  acc('evlight-2x1-barn-door','2x1 Barn Door','Barn Doors',['evlight-gem2x1bi','evlight-gem2x1st'],'Shapes and cuts the panel beam.'),
  acc('evlight-gemx21-diffuser','GEMX21 Diffuser','Diffusion',['evlight-gemx21-hard'],'Converts the hard-panel output toward a wider, softer field.'),
  acc('evlight-2x1-softbox','2x1 Softbox','Softbox',twoByOne,'Softens and enlarges the apparent source.')
];
