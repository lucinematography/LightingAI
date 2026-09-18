// De Sisti conventional tungsten softlights and broadlights.
// Verified from official De Sisti Botticelli and Renoir product pages.
const B1='https://www.desisti.it/botticelli-1kw/';
const B2='https://www.desisti.it/botticelli-2kw/';
const B5='https://www.desisti.it/botticelli-5kw/';
const R2='https://www.desisti.it/renoir-2kw/';
const R5='https://www.desisti.it/renoir-5kw/';

function fixture(id,model,family,powerW,sourceType,sourceUrl,extra={}){
 return {
   id,manufacturer:'De Sisti',model,family,category:'Light',sourceType,
   lampPowerW:powerW,powerDrawW:powerW,cctK:{min:3200,max:3200},colorMode:'Tungsten',
   lifecycle:'legacy / conventional',control:['Line power / external dimmer'],sourceUrl,...extra
 };
}

export const DESISTI_TUNGSTEN_SOFT_BROAD_FIXTURES=[
  fixture('desisti-botticelli-1kw','Botticelli 1 kW','Botticelli',1000,'Tungsten Quartz-Halogen Softlight',B1,{lampSocket:'R7s'}),
  fixture('desisti-botticelli-2kw','Botticelli 2 kW','Botticelli',2000,'Tungsten Quartz-Halogen Softlight',B2,{lampSocket:'R7s',lampCount:2}),
  fixture('desisti-botticelli-5kw','Botticelli 5 kW','Botticelli',5000,'Tungsten Quartz-Halogen Softlight',B5,{lampSocket:'R7s',lampCount:4}),
  fixture('desisti-renoir-300','Renoir 300 W','Renoir',300,'Tungsten Quartz-Halogen Broadlight',R2,{beamAngleDeg:{min:90,max:90}}),
  fixture('desisti-renoir-500','Renoir 500 W','Renoir',500,'Tungsten Quartz-Halogen Broadlight',R2,{beamAngleDeg:{min:90,max:90}}),
  fixture('desisti-renoir-650','Renoir 650 W','Renoir',650,'Tungsten Quartz-Halogen Broadlight',R2,{beamAngleDeg:{min:90,max:90}}),
  fixture('desisti-renoir-2kw','Renoir 2 kW','Renoir',2000,'Tungsten Quartz-Halogen Broadlight',R2,{beamAngleDeg:{min:90,max:90},lampSocket:'G38'}),
  fixture('desisti-renoir-5kw','Renoir 5 kW','Renoir',5000,'Tungsten Quartz-Halogen Broadlight',R5,{beamAngleDeg:{min:90,max:90},lampSocket:'G38'})
];

const botticelli=DESISTI_TUNGSTEN_SOFT_BROAD_FIXTURES.filter(x=>x.family==='Botticelli').map(x=>x.id);
const renoir=DESISTI_TUNGSTEN_SOFT_BROAD_FIXTURES.filter(x=>x.family==='Renoir').map(x=>x.id);

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
 return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}
export const DESISTI_TUNGSTEN_SOFT_BROAD_ACCESSORIES=[
  acc('desisti-botticelli-3106-100','3106.100 Eggcrate Thickness 1','Eggcrate',botticelli,B1,'Controls softlight spill with moderate beam restriction.'),
  acc('desisti-botticelli-3106-200','3106.200 Eggcrate Thickness 2','Eggcrate',botticelli,B1,'Provides stronger spill control for the Botticelli softlight.'),
  acc('desisti-botticelli-3107-100','3107.100 Colorframe','Filter Frame',botticelli,B1),

  acc('desisti-renoir-2716-200','2716.200 Eight Leaf Barndoor','Barn Door',renoir,R2,'Shapes the broad 90-degree beam and controls spill.'),
  acc('desisti-renoir-2719-100','2719.100 Four Piece Stainless Steel Scrim Set','Scrim Set',renoir,R2,'Reduces broadlight output while preserving the flat field.')
];
