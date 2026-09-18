// De Sisti Remington conventional daylight HMI PAR range.
// Verified from official De Sisti product pages/data sheets.
const SRC={
  r575:'https://www.desisti.it/remington-575w/',
  r1200:'https://www.desisti.it/remington-1200w/',
  r254:'https://www.desisti.it/remington-2-5-4kw/',
  r6:'https://www.desisti.it/remington-6kw/',
  r612:'https://www.desisti.it/remington-6-12kw/'
};

function par(id,model,powerW,sourceUrl,extra={}){
  return {
    id,manufacturer:'De Sisti',model,family:'Conventional Daylight HMI PAR',category:'Light',
    sourceType:'Hot-restrike HMI Open Face PAR',lampPowerW:powerW,cctK:{min:5600,max:5600},
    colorMode:'Daylight',cri:90,ipRating:'IP23',legacy:true,control:['External ballast','Local/remote/DMX via ballast'],
    opticalSystem:'Drop-in lens system: narrow spot, medium flood, wide flood, extra wide flood, frosted Fresnel',
    sourceUrl,...extra
  };
}

export const DESISTI_HMI_PAR_FIXTURES=[
  par('desisti-remington-575','Remington 575 W',575,SRC.r575),
  par('desisti-remington-1200','Remington 1.2 kW',1200,SRC.r1200,{lampSocket:'G38'}),
  {
    id:'desisti-remington-2-5-4kw',manufacturer:'De Sisti',model:'Remington 2.5-4 kW',
    family:'Conventional Daylight HMI PAR',category:'Light',sourceType:'Dual-power hot-restrike HMI Open Face PAR',
    lampPowerOptionsW:[2500,4000],maxLampPowerW:4000,cctK:{min:5600,max:5600},colorMode:'Daylight',
    cri:90,ipRating:'IP23',legacy:true,control:['DEB 2.5/4 kW dual flicker-free ballast','Local/remote/DMX via ballast'],
    opticalSystem:'Five drop-in lenses: narrow spot, medium flood, wide flood, extra wide flood, frosted Fresnel',
    sourceUrl:SRC.r254
  },
  par('desisti-remington-6kw','Remington 6 kW',6000,SRC.r6),
  {
    id:'desisti-remington-6-12kw',manufacturer:'De Sisti',model:'Remington 6-12 kW',
    family:'Conventional Daylight HMI PAR',category:'Light',sourceType:'Dual-power hot-restrike HMI Open Face PAR',
    lampPowerOptionsW:[6000,12000],maxLampPowerW:12000,cctK:{min:5600,max:5600},colorMode:'Daylight',
    cri:90,ipRating:'IP23',legacy:true,control:['Dual electronic ballast','Local/remote/DMX via ballast'],
    opticalSystem:'Drop-in PAR lens system',sourceUrl:SRC.r612
  }
];

const r575=['desisti-remington-575'];
const r1200=['desisti-remington-1200'];
const mid=['desisti-remington-2-5-4kw'];
const high=['desisti-remington-6kw','desisti-remington-6-12kw'];

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}
function common(prefix,targets,source){
  return [
    acc('desisti-'+prefix+'-4leaf',prefix.toUpperCase()+' Four Leaf Rotating Barndoor','Barn Door',targets,source,'Shapes PAR spill after the selected drop-in lens.'),
    acc('desisti-'+prefix+'-colorframe',prefix.toUpperCase()+' Colorframe','Filter Frame',targets,source),
    acc('desisti-'+prefix+'-scrims',prefix.toUpperCase()+' Stainless Steel Scrim Set','Scrim Set',targets,source,'Reduces output while preserving the selected PAR beam.'),
    acc('desisti-'+prefix+'-lens-set',prefix.toUpperCase()+' Five-Lens Set','Optics',targets,source,'Narrow spot, medium flood, wide flood, extra wide flood and frosted Fresnel optics.')
  ];
}
export const DESISTI_HMI_PAR_ACCESSORIES=[
  ...common('remington-575',r575,SRC.r575),
  ...common('remington-1200',r1200,SRC.r1200),
  acc('desisti-remington-254-deb','2535.100 DEB 2500/4000 W Dual Flicker-Free Electronic Ballast','Ballast',mid,SRC.r254),
  acc('desisti-remington-254-4leaf-large','356.100 Four Leaf Rotating Barndoor Large','Barn Door',mid,SRC.r254),
  acc('desisti-remington-254-4leaf-medium','356.110 Four Leaf Rotating Barndoor Medium','Barn Door',mid,SRC.r254),
  acc('desisti-remington-254-8leaf-large','356.200 Eight Leaf Rotating Barndoor Large','Barn Door',mid,SRC.r254),
  acc('desisti-remington-254-8leaf-medium','356.210 Eight Leaf Rotating Barndoor Medium','Barn Door',mid,SRC.r254),
  acc('desisti-remington-254-colorframe','327.100 Colorframe','Filter Frame',mid,SRC.r254),
  acc('desisti-remington-254-scrims','359.100 Four Piece Stainless Steel Scrim Set','Scrim Set',mid,SRC.r254),
  acc('desisti-remington-254-lens-set','2345.200 Five-Lens Set with Ring and Handle','Optics',mid,SRC.r254,'Narrow spot, medium flood, wide flood, extra wide flood and frosted Fresnel lenses.'),
  acc('desisti-remington-254-lens-case','2348.100 Five-Lens Fly Case','Transport',mid,SRC.r254),
  acc('desisti-remington-254-ballast-case','2535.601 Dual DEB 2500/4000 W Ballast Fly Case','Transport',mid,SRC.r254),
  acc('desisti-remington-254-cable-25','2431.100 Head-to-Ballast Cable 25 ft','Head/Ballast Cable',mid,SRC.r254),
  acc('desisti-remington-254-cable-50','2431.200 Head-to-Ballast Cable 50 ft','Head/Ballast Cable',mid,SRC.r254),
  ...common('remington-high',high,SRC.r612)
];
