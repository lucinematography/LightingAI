// De Sisti "The Muses of Light" cinema/location range.
// Verified from official De Sisti datasheets linked from the current De Sisti press-kit/catalog area.
const SRC={
  melpomene:'https://www.desisti.it/wp/wp-content/uploads/2022/06/Melpomene-DS.pdf',
  tersicore:'https://www.desisti.it/wp/wp-content/uploads/2022/06/Tersicore-DS.pdf',
  clio:'https://www.desisti.it/wp/wp-content/uploads/2022/07/Clio-DS.pdf',
  clioM:'https://www.desisti.it/wp/wp-content/uploads/2022/06/Clio-M-DS.pdf',
  polymnia:'https://www.desisti.it/wp/wp-content/uploads/2022/07/Polymnia-DS.pdf',
  erato:'https://www.desisti.it/wp/wp-content/uploads/2022/06/Erato-DS.pdf',
  euterpe:'https://www.desisti.it/wp/wp-content/uploads/2022/07/Euterpe-DS.pdf',
  talia:'https://www.desisti.it/wp/wp-content/uploads/2022/06/Talia-DS.pdf',
  aurea:'https://www.desisti.it/wp/wp-content/uploads/2022/06/Aurea-DS.pdf',
  aureaSmall:'https://www.desisti.it/wp/wp-content/uploads/2022/06/Aurea-Small.pdf'
};

const dmxModes=[
  {name:'Simple 8-bit',channels:2},
  {name:'Simple 16-bit',channels:3},
  {name:'8-bit base',channels:7},
  {name:'8-bit with mode/fan',channels:9},
  {name:'8-bit extended',channels:39},
  {name:'16-bit base',channels:8},
  {name:'16-bit with mode/fan',channels:10},
  {name:'16-bit extended',channels:40}
];
const verifiedDmxModes=(sourceUrl)=>dmxModes.map((mode)=>({...mode,verified:true,sourceUrl}));

function muse(id,model,orderCode,shape,ledPowerW,powerDrawW,beamAngleDeg,headKg,driverKg,driverModel,caseCode,cableCode,sourceUrl,extra={}){
  return {
    id,manufacturer:'De Sisti',model,family:'The Muses of Light',orderCode,shape,
    category:'Light',sourceType:'Vari-White LED cinema/location luminaire',
    ledPowerW,...(powerDrawW?{powerDrawW}:{}),cctK:{min:2800,max:6600},
    colorMode:'Vari-White',cri:95,tlci:96,beamAngleDeg,ipRating:'Min. IP23',
    weightKg:headKg,driverWeightKg:driverKg,detachableDriver:true,remoteDriverMaxM:50,
    driverModel,transportCaseCode:caseCode,extensionCableCode:cableCode,
    batterySupport:'XLR input for battery operation',
    control:['DMX512','LumenRadio TimoTwo Wireless DMX','On-board'],
    dmxModes,sourceUrl,...extra
  };
}

export const DESISTI_MUSES_FIXTURES=[
  muse('desisti-muse-melpomene','Melpomene','2LH','Triangle',480,null,11,23.8,5,'DSE-500','2LC','EC19P-10M',SRC.melpomene,{dmxModes:verifiedDmxModes(SRC.melpomene)}),
  muse('desisti-muse-tersicore','Tersicore','3LH','Square',960,1130,16,46,7.5,'DSE-1000','3LC','EC19P-10M',SRC.tersicore),
  muse('desisti-muse-clio','Clio','4LH','Rectangle',480,564,16,28.5,5,'DSE-500','4LC','EC19P-10M',SRC.clio),
  muse('desisti-muse-clio-medium','Clio Medium','4MH','Rectangle',240,282,16,17,6.5,'DSE-300','4MC','EC19P-10M',SRC.clioM,{fieldAngleDeg:27}),
  muse('desisti-muse-polymnia','Polymnia','5MH','Pentagon',210,247,28,12.9,2.5,'DSE-300','5MC','EC19P-10M',SRC.polymnia),
  muse('desisti-muse-erato','Erato','6MH','Hexagon',360,424,34,16,2.5,'DSE-300','6MC','EC19P-10M',SRC.erato),
  muse('desisti-muse-euterpe','Euterpe','7MH','Octagon',540,635,66,23,7.5,'DSE-1000','7MC','EC19P-10M',SRC.euterpe),
  muse('desisti-muse-talia','Talia','8LH','Decagon',1500,1764,105,80,12.5,'DSE-2000','8LC','EC35P-10M',SRC.talia),
  muse('desisti-muse-aurea','Aurea','10LH','Circle',2040,2400,11,80,12.5,'DSE-2000','10LC','EC35P-10M',SRC.aurea),
  muse('desisti-muse-aurea-small','Aurea Small','10SH','Circle',380,450,11,19.5,6.5,'DSE-500','10SC','EC19P-10M',SRC.aureaSmall,{fieldAngleDeg:20})
];

const ids=(...names)=>DESISTI_MUSES_FIXTURES.filter(x=>names.includes(x.model)).map(x=>x.id);
const dse300=ids('Clio Medium','Polymnia','Erato');
const dse500=ids('Melpomene','Clio','Aurea Small');
const dse1000=ids('Tersicore','Euterpe');
const dse2000=ids('Talia','Aurea');
const ec19=[...dse300,...dse500,...dse1000];
const ec35=[...dse2000];

function acc(id,model,category,compatibleWith,sourceUrl,extra={}){
  return {id,manufacturer:'De Sisti',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...extra};
}

export const DESISTI_MUSES_ACCESSORIES=[
  acc('desisti-muses-dse-300','DSE-300 Detachable Smart Electronics 300 W','Power / Driver',dse300,SRC.clioM),
  acc('desisti-muses-dse-500','DSE-500 Detachable Smart Electronics 500 W','Power / Driver',dse500,SRC.melpomene),
  acc('desisti-muses-dse-1000','DSE-1000 Detachable Smart Electronics 1000 W','Power / Driver',dse1000,SRC.tersicore),
  acc('desisti-muses-dse-2000','DSE-2000 Detachable Smart Electronics 2000 W','Power / Driver',dse2000,SRC.talia),

  acc('desisti-muses-ec19p-10m','EC19P-10M 10 m Extension Cable','Power / Data Cable',ec19,SRC.clioM,{effectOnLight:'Allows the detachable driver to be positioned remotely; the Muses system supports remote driver operation up to 50 m with extension cabling.'}),
  acc('desisti-muses-ec35p-10m','EC35P-10M 10 m Extension Cable','Power / Data Cable',ec35,SRC.talia,{effectOnLight:'Heavy-duty extension cable for the DSE-2000 Muses fixtures.'}),

  acc('desisti-muses-2lc','2LC Melpomene Transport Case','Transport',ids('Melpomene'),SRC.melpomene),
  acc('desisti-muses-3lc','3LC Tersicore Transport Case','Transport',ids('Tersicore'),SRC.tersicore),
  acc('desisti-muses-4lc','4LC Clio Transport Case','Transport',ids('Clio'),SRC.clio),
  acc('desisti-muses-4mc','4MC Clio Medium Transport Case','Transport',ids('Clio Medium'),SRC.clioM),
  acc('desisti-muses-5mc','5MC Polymnia Transport Case','Transport',ids('Polymnia'),SRC.polymnia),
  acc('desisti-muses-6mc','6MC Erato Transport Case','Transport',ids('Erato'),SRC.erato),
  acc('desisti-muses-7mc','7MC Euterpe Transport Case','Transport',ids('Euterpe'),SRC.euterpe),
  acc('desisti-muses-8lc','8LC Talia Transport Case / Wheeled Frame','Transport',ids('Talia'),SRC.talia),
  acc('desisti-muses-10lc','10LC Aurea Transport Case / Wheeled Frame','Transport',ids('Aurea'),SRC.aurea),
  acc('desisti-muses-10sc','10SC Aurea Small Transport Case','Transport',ids('Aurea Small'),SRC.aureaSmall)
];
