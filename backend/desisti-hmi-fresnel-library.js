// De Sisti conventional daylight HMI/metal-halide Fresnel range.
// Verified from official De Sisti product pages and manuals. Retained as legacy/conventional fixtures for real-world rental inventory.
const SRC={
  r200:'https://www.desisti.it/rembrandt-piccolo-200w/',
  r575:'https://www.desisti.it/rembrandt-575w/',
  r1200:'https://www.desisti.it/wp-content/uploads/2018/02/ds_Rembrandt_Piccolo_1200w.pdf',
  r1225:'https://www.desisti.it/rembrandt-1-2-2-5kw/',
  r254:'https://www.desisti.it/rembrandt-2-5-4kw/',
  r6:'https://www.desisti.it/rembrandt-piccolo-6kw/',
  r612:'https://www.desisti.it/rembrandt-6-12kw/',
  r1218:'https://www.desisti.it/rembrandt-12-18kw/'
};

function hmi(id,model,powerW,lensDiameterMm,weightKg,sourceUrl,extra={}){
  return {
    id,manufacturer:'De Sisti',model,family:'Conventional Daylight HMI Fresnel',category:'Light',
    sourceType:'Hot-restrike metal-halide Fresnel',lampPowerW:powerW,cctK:{min:5600,max:5600},
    colorMode:'Daylight',cri:90,lensDiameterMm,weightKg,legacy:true,
    control:['External ballast'],sourceUrl,...extra
  };
}

export const DESISTI_HMI_FRESNEL_FIXTURES=[
  hmi('desisti-rembrandt-piccolo-200','Rembrandt Piccolo 200 W',200,120,2.9,SRC.r200,{lampSocket:'GZY9.5',ipRating:'IP22'}),
  hmi('desisti-rembrandt-piccolo-575','Rembrandt Piccolo 575 W MK2',575,150,5.8,SRC.r575,{ipRating:'IP23'}),
  hmi('desisti-rembrandt-piccolo-1200','Rembrandt Piccolo 1.2 kW',1200,150,null,SRC.r1200,{lampSocket:'G38'}),
  {
    id:'desisti-rembrandt-1-2-2-5kw',manufacturer:'De Sisti',model:'Rembrandt 1.2-2.5 kW',
    family:'Conventional Daylight HMI Fresnel',category:'Light',sourceType:'Dual-power hot-restrike metal-halide Fresnel',
    lampPowerOptionsW:[1200,2500],maxLampPowerW:2500,cctK:{min:5600,max:5600},colorMode:'Daylight',
    cri:90,lensDiameterMm:250,lampSocket:'G38',ipRating:'IP23',weightKg:14.3,legacy:true,
    control:['External DEB or magnetic ballast'],sourceUrl:SRC.r1225
  },
  {
    id:'desisti-rembrandt-2-5-4kw',manufacturer:'De Sisti',model:'Rembrandt 2.5-4 kW',
    family:'Conventional Daylight HMI Fresnel',category:'Light',sourceType:'Dual-power hot-restrike metal-halide Fresnel',
    lampPowerOptionsW:[2500,4000],maxLampPowerW:4000,cctK:{min:5600,max:5600},colorMode:'Daylight',
    cri:90,legacy:true,control:['External ballast'],sourceUrl:SRC.r254
  },
  hmi('desisti-rembrandt-piccolo-6kw','Rembrandt Piccolo 6 kW',6000,350,29,SRC.r6,{lampSocket:'GX38',ipRating:'IP22'}),
  {
    id:'desisti-rembrandt-6-12kw',manufacturer:'De Sisti',model:'Rembrandt 6-12 kW',
    family:'Conventional Daylight HMI Fresnel',category:'Light',sourceType:'Dual-power hot-restrike metal-halide Fresnel',
    lampPowerOptionsW:[6000,12000],maxLampPowerW:12000,cctK:{min:5600,max:5600},colorMode:'Daylight',
    cri:90,weightKg:43,legacy:true,control:['DEB dual flicker-free ballast','Local/remote/DMX via ballast'],sourceUrl:SRC.r612
  },
  {
    id:'desisti-rembrandt-12-18kw',manufacturer:'De Sisti',model:'Rembrandt 12-18 kW MK2',
    family:'Conventional Daylight HMI Fresnel',category:'Light',sourceType:'Dual-power double-ended hot-restrike metal-halide Fresnel',
    lampPowerOptionsW:[12000,18000],maxLampPowerW:18000,cctK:{min:5600,max:5600},colorMode:'Daylight',
    cri:90,legacy:true,control:['Digital DEB 12-18 kW','Local/remote/DMX via ballast'],sourceUrl:SRC.r1218
  }
];

const r200=['desisti-rembrandt-piccolo-200'];
const r575=['desisti-rembrandt-piccolo-575'];
const r1200=['desisti-rembrandt-piccolo-1200'];
const mid=['desisti-rembrandt-1-2-2-5kw','desisti-rembrandt-2-5-4kw'];
const high=['desisti-rembrandt-piccolo-6kw','desisti-rembrandt-6-12kw'];
const ultra=['desisti-rembrandt-12-18kw'];

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const DESISTI_HMI_FRESNEL_ACCESSORIES=[
  acc('desisti-r200-deb','DEB 200 AC/DC Ballast','Ballast',r200,SRC.r200),
  acc('desisti-r200-4leaf','306.100 Four Leaf Rotating Barndoor','Barn Door',r200,SRC.r200,'Shapes the Fresnel beam and controls spill.'),
  acc('desisti-r200-8leaf','306.200 Eight Leaf Rotating Barndoor','Barn Door',r200,SRC.r200),
  acc('desisti-r200-colorframe','307.100 Colour Frame','Filter Frame',r200,SRC.r200),
  acc('desisti-r200-cone','308.100 Cone with Two Discs','Snoot / Cone',r200,SRC.r200),
  acc('desisti-r200-scrims','309.100 Stainless Steel Scrim Set','Scrim Set',r200,SRC.r200),
  acc('desisti-r200-cable-2-5m','2208.100 2.5 m Extension Cable','Head/Ballast Cable',r200,SRC.r200),
  acc('desisti-r200-cable-7-5m','2208.200 7.5 m Extension Cable','Head/Ballast Cable',r200,SRC.r200),

  acc('desisti-r575-4leaf','575 W Four Leaf Rotating Barndoor','Barn Door',r575,SRC.r575),
  acc('desisti-r575-colorframe','575 W Colour Frame','Filter Frame',r575,SRC.r575),
  acc('desisti-r575-scrims','575 W Stainless Steel Scrim Set','Scrim Set',r575,SRC.r575),

  acc('desisti-r1200-barndoor','1.2 kW Four Leaf Rotating Barndoor','Barn Door',r1200,SRC.r1200),
  acc('desisti-r1200-colorframe','1.2 kW Colour Frame','Filter Frame',r1200,SRC.r1200),
  acc('desisti-r1200-scrims','1.2 kW Stainless Steel Scrim Set','Scrim Set',r1200,SRC.r1200),

  acc('desisti-r1225-deb','DEB 1.2/2.5 kW Ballast / Adaptor System','Ballast',mid,SRC.r1225),
  acc('desisti-r1225-cable-7-5m','2021.100 7.5 m Extension Cable','Head/Ballast Cable',mid,SRC.r1225),
  acc('desisti-r1225-cable-15m','2021.200 15 m Extension Cable','Head/Ballast Cable',mid,SRC.r1225),
  acc('desisti-r1225-4leaf-large','326.100 Four Leaf Rotating Barndoor Large','Barn Door',mid,SRC.r1225),
  acc('desisti-r1225-4leaf-medium','326.110 Four Leaf Rotating Barndoor Medium','Barn Door',mid,SRC.r1225),
  acc('desisti-r1225-8leaf-large','326.200 Eight Leaf Rotating Barndoor Large','Barn Door',mid,SRC.r1225),
  acc('desisti-r1225-8leaf-medium','326.210 Eight Leaf Rotating Barndoor Medium','Barn Door',mid,SRC.r1225),
  acc('desisti-r1225-colorframe','327.100 Colour Frame','Filter Frame',mid,SRC.r1225),
  acc('desisti-r1225-cone','328.100 Cone with Two Discs','Snoot / Cone',mid,SRC.r1225),
  acc('desisti-r1225-scrims','329.100 Stainless Steel Scrim Set','Scrim Set',mid,SRC.r1225),

  acc('desisti-r612-deb','2555.100 DEB 6000/12000 W Dual Flicker-Free Electronic Ballast','Ballast',high,SRC.r612),
  acc('desisti-r612-4leaf','496.100 Four Leaf Rotating Barndoor','Barn Door',high,SRC.r612),
  acc('desisti-r612-colorframe','497.100 Colorframe','Filter Frame',high,SRC.r612),
  acc('desisti-r612-scrims','499.100 Four Piece Stainless Steel Scrim Set','Scrim Set',high,SRC.r612),
  acc('desisti-r612-cable-25','2451.100 Head-to-Ballast Cable 25 ft','Head/Ballast Cable',high,SRC.r612),
  acc('desisti-r612-cable-50','2451.200 Head-to-Ballast Cable 50 ft','Head/Ballast Cable',high,SRC.r612),
  acc('desisti-r612-ballast-case','2555.601 Ballast Fly Case','Transport',high,SRC.r612),

  acc('desisti-r1218-deb','DEB 12/18 kW Dual Digital Ballast','Ballast',ultra,SRC.r1218),
  acc('desisti-r1218-4leaf','406.100 Four Leaf Rotating Barndoor','Barn Door',ultra,SRC.r1218),
  acc('desisti-r1218-scrims','409.100 Four Piece Stainless Steel Scrim Set','Scrim Set',ultra,SRC.r1218),
  acc('desisti-r1218-cable-25','2451.100 Head-to-Ballast Cable 25 ft','Head/Ballast Cable',ultra,SRC.r1218),
  acc('desisti-r1218-cable-50','2451.200 / 2452.200 Head-to-Ballast Cable 50 ft','Head/Ballast Cable',ultra,SRC.r1218),
  acc('desisti-r1218-head-case','2560.601 Fixture and Accessory Fly Case','Transport',ultra,SRC.r1218),
  acc('desisti-r1218-ballast-case','2565.601 DEB 12/18 kW Ballast Fly Case','Transport',ultra,SRC.r1218)
];
