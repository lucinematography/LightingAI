// Kino Flo ParaBeam / ParaZip fluorescent legacy family.
// Sources: official Kino Flo series pages and archive manuals.
const PB200='https://kinoflo.com/parabeam-200-series/';
const PB210='https://kinoflo.com/product-category/products/parts/parabeam/';
const PB400='https://kinoflo.com/parabeam-400-series/';
const PB410='https://kinoflo.com/parabeam-410-series/';
const PZ200='https://kinoflo.com/parazip-200-series/';
const PZ215='https://kinoflo.com/product-category/products/parts/parazip/';
const PZ400='https://kinoflo.com/parazip-400-series/';
const PZ415='https://kinoflo.com/product-category/products/parts/parazip/';
const PZ_OLD_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100039-Rev-D-ParaZip-400-200-7-02-2012-Web-Quality-Old.pdf';
const PZ_NEW_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100081-Rev-A-ParaZip-415-215-06-16-2015.pdf';

function fixture(id,model,family,sourceUrl,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category:'Light',
    sourceType:'Fluorescent Softlight',status:'Legacy / Archive',sourceUrl,
    control:['DMX512','Local'],...extra
  };
}
function acc(id,model,family,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_PARABEAM_PARAZIP_FIXTURES=[
  fixture('kinoflo-parabeam-200-dmx','ParaBeam 200 DMX','ParaBeam',PB200),
  fixture('kinoflo-parabeam-210-dmx','ParaBeam 210 DMX','ParaBeam',PB210),
  fixture('kinoflo-parabeam-400-dmx','ParaBeam 400 DMX','ParaBeam',PB400),
  fixture('kinoflo-parabeam-410-dmx','ParaBeam 410 DMX','ParaBeam',PB410),
  fixture('kinoflo-parazip-200-dmx','ParaZip 200 DMX','ParaZip',PZ200,{dmxModes:[{name:'1ch all lamps',channels:1,verified:true,sourceUrl:PZ_OLD_MANUAL}]}),
  fixture('kinoflo-parazip-215-dmx','ParaZip 215 DMX','ParaZip',PZ215,{dmxModes:[{name:'1ch all lamps',channels:1,verified:true,sourceUrl:PZ_NEW_MANUAL}]}),
  fixture('kinoflo-parazip-400-dmx','ParaZip 400 DMX','ParaZip',PZ400,{dmxModes:[{name:'1ch all lamps',channels:1,verified:true,sourceUrl:PZ_OLD_MANUAL},{name:'2ch inner/outer lamp pairs',channels:2,verified:true,sourceUrl:PZ_OLD_MANUAL}]}),
  fixture('kinoflo-parazip-415-dmx','ParaZip 415 DMX','ParaZip',PZ415,{dmxModes:[{name:'1ch all lamps',channels:1,verified:true,sourceUrl:PZ_NEW_MANUAL},{name:'2ch inner/outer lamp pairs',channels:2,verified:true,sourceUrl:PZ_NEW_MANUAL}]})
];

export const KINOFLO_PARABEAM_PARAZIP_ACCESSORIES=[
  acc('kinoflo-parabeam-10-mount','Kino #10 Mount Kit','ParaBeam','Mounting',['kinoflo-parabeam-200-dmx','kinoflo-parabeam-210-dmx'],PB200,null,{orderCode:'PRT-M10Y'}),
  acc('kinoflo-parabeam-20-mount','Kino #20 Mount Kit','ParaBeam','Mounting',['kinoflo-parabeam-400-dmx','kinoflo-parabeam-410-dmx'],PB400,null,{orderCode:'PRT-M20Y'}),
  acc('kinoflo-parazip-200-louver-90','ParaZip 200 Louver 90 deg','ParaZip','Grid',['kinoflo-parazip-200-dmx'],PZ_OLD_MANUAL,'Controls spill and off-axis light.',{orderCode:'LVR-Z290'}),
  acc('kinoflo-parazip-400-louver-90','ParaZip 400 Louver 90 deg','ParaZip','Grid',['kinoflo-parazip-400-dmx'],PZ_OLD_MANUAL,'Controls spill and off-axis light.',{orderCode:'LVR-Z490'}),
  acc('kinoflo-parazip-215-louver-90','ParaZip 215 Louver/HP 90 deg','ParaZip','Grid',['kinoflo-parazip-215-dmx'],PZ_NEW_MANUAL,'Controls spill and off-axis light.',{orderCode:'LVR-Z290-P'}),
  acc('kinoflo-parazip-415-louver-90','ParaZip 415 Louver/HP 90 deg','ParaZip','Grid',['kinoflo-parazip-415-dmx'],PZ_NEW_MANUAL,'Controls spill and off-axis light.',{orderCode:'LVR-Z490-P'}),
  acc('kinoflo-parazip-barndoors-200-400','ParaZip 400/200 Barndoors (Set of 2)','ParaZip','Barn Doors',['kinoflo-parazip-200-dmx','kinoflo-parazip-400-dmx'],PZ_OLD_MANUAL,'Shapes and cuts the fluorescent field.',{orderCode:'BRD-Z42'}),
  acc('kinoflo-parazip-barndoors-215-415','ParaZip 415/215 Barndoors (Set of 2)','ParaZip','Barn Doors',['kinoflo-parazip-215-dmx','kinoflo-parazip-415-dmx'],PZ_NEW_MANUAL,'Shapes and cuts the fluorescent field.',{orderCode:'BRD-Z42'})
];
