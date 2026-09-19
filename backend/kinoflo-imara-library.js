// Kino Flo Imara fluorescent legacy family.
// Sources: official Kino Flo archive manuals and parts pages.
const IMARA_S10_S6='https://kinoflo.com/wp-content/uploads/2022/07/3100051-Imara-Rev-001-01-01-2011-web.pdf';
const IMARA_S100_S60='https://kinoflo.com/wp-content/uploads/2022/07/3100083-Imara-S100-S60-DMX-Rev-A-03-02-2015.pdf';
const IMARA_PARTS='https://kinoflo.com/product-category/products/parts/imara/';

function fixture(id,model,sourceUrl){
  return {
    id,manufacturer:'Kino Flo',model,family:'Imara',category:'Light',
    sourceType:'Fluorescent Softlight',status:'Legacy / Archive',sourceUrl,
    control:['DMX512','Local']
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family:'Imara',category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_IMARA_FIXTURES=[
  fixture('kinoflo-imara-s6-dmx','Imara S6 DMX',IMARA_S10_S6),
  fixture('kinoflo-imara-s10-dmx','Imara S10 DMX',IMARA_S10_S6),
  fixture('kinoflo-imara-s60-dmx','Imara S60 DMX',IMARA_S100_S60),
  fixture('kinoflo-imara-s100-dmx','Imara S100 DMX',IMARA_S100_S60)
];

export const KINOFLO_IMARA_ACCESSORIES=[
  acc('kinoflo-imara-s6-barndoors','Imara S6 Barndoors (Set of 4)','Barn Doors',['kinoflo-imara-s6-dmx'],IMARA_S10_S6,'Shapes and cuts the fluorescent field.',{orderCode:'BRD-IM6'}),
  acc('kinoflo-imara-s6-louver-90','Imara S6 Louver 90 deg','Grid',['kinoflo-imara-s6-dmx'],IMARA_S10_S6,'Controls spill and off-axis light.',{orderCode:'LVR-IM690'}),
  acc('kinoflo-imara-s10-barndoors','Imara S10 Barndoors (Set of 4)','Barn Doors',['kinoflo-imara-s10-dmx'],IMARA_S10_S6,'Shapes and cuts the fluorescent field.',{orderCode:'BRD-IM10'}),
  acc('kinoflo-imara-s10-louver-90','Imara S10 Louver 90 deg','Grid',['kinoflo-imara-s10-dmx'],IMARA_S10_S6,'Controls spill and off-axis light.',{orderCode:'LVR-IM1090'}),
  acc('kinoflo-imara-s60-barndoors','Imara S60 Barndoors (Set of 4)','Barn Doors',['kinoflo-imara-s60-dmx'],IMARA_S100_S60,'Shapes and cuts the fluorescent field.',{orderCode:'BRD-IM6'}),
  acc('kinoflo-imara-s60-louver-90','Imara S60 Louver 90 deg','Grid',['kinoflo-imara-s60-dmx'],IMARA_S100_S60,'Controls spill and off-axis light.',{orderCode:'LVR-IM690'}),
  acc('kinoflo-imara-s100-barndoors','Imara S100 Barndoors (Set of 4)','Barn Doors',['kinoflo-imara-s100-dmx'],IMARA_S100_S60,'Shapes and cuts the fluorescent field.',{orderCode:'BRD-IM10'}),
  acc('kinoflo-imara-s100-louver-90','Imara S100 Louver 90 deg','Grid',['kinoflo-imara-s100-dmx'],IMARA_S100_S60,'Controls spill and off-axis light.',{orderCode:'LVR-IM1090'}),
  acc('kinoflo-imara-junior-pin','Junior Pin Assembly for Yoke (28mm)','Mounting',['kinoflo-imara-s6-dmx','kinoflo-imara-s10-dmx','kinoflo-imara-s60-dmx','kinoflo-imara-s100-dmx'],IMARA_PARTS,null,{orderCode:'MTP-I80'})
];
