// Kino Flo Diva-Lite fluorescent + BarFly legacy families.
// Sources: official Kino Flo archive pages and manuals.
const DIVA='https://kinoflo.com/diva-lite-series/';
const DIVA_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100048-Diva-Lite-401-201-Rev-C-3-20-2013-Web-Quality.pdf';
const BARFLY='https://kinoflo.com/barfly-2/';
const BARFLY_450_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100062-BarFly-450-Rev-A-5-18-2012-Web-Quality.pdf';
const REMOTE='https://kinoflo.com/fixtures-remote/';

function fixture(id,model,family,sourceUrl,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category:'Light',
    sourceType:'Fluorescent Softlight',status:'Legacy / Archive',sourceUrl,...extra
  };
}
function acc(id,model,family,category,compatibleWith,sourceUrl,effectOnLight,extra={}){
  return {
    id,manufacturer:'Kino Flo',model,family,category,
    compatibilityStatus:'Designed For',compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{}),...extra
  };
}

export const KINOFLO_DIVA_BARFLY_FIXTURES=[
  fixture('kinoflo-diva-lite-201','Diva-Lite 201','Diva-Lite Fluorescent',DIVA_MANUAL,{lampCount:2,lampType:'55W compact fluorescent'}),
  fixture('kinoflo-diva-lite-400','Diva-Lite 400 Universal','Diva-Lite Fluorescent',DIVA_MANUAL,{lampCount:4,lampType:'55W compact fluorescent',voltage:'100-240VAC',dimming:'100-5%',weightKg:6.4}),
  fixture('kinoflo-diva-lite-401','Diva-Lite 401','Diva-Lite Fluorescent',DIVA_MANUAL,{lampCount:4,lampType:'55W compact fluorescent',voltage:'120VAC or 230VAC',dimming:'100-5%',weightKg:5.9}),
  fixture('kinoflo-diva-lite-415','Diva-Lite 415','Diva-Lite Fluorescent',DIVA,{lampCount:4,lampType:'55W compact fluorescent'}),
  fixture('kinoflo-barfly-100','BarFly 100 Fixture','BarFly',REMOTE,{lampCount:1,lampType:'F55/QFL'}),
  fixture('kinoflo-barfly-200','BarFly 200 Fixture','BarFly',BARFLY,{lampCount:2,lampType:'F55/QFL'}),
  fixture('kinoflo-barfly-400','BarFly 400 Fixture','BarFly',BARFLY,{lampCount:4,lampType:'F55/QFL'}),
  fixture('kinoflo-barfly-450-dmx','BarFly 450 DMX','BarFly',BARFLY,{lampCount:4,control:['DMX512'],dmxModes:[{name:'1ch all lamps',channels:1,verified:true,sourceUrl:BARFLY_450_MANUAL},{name:'4ch individual lamps',channels:4,verified:true,sourceUrl:BARFLY_450_MANUAL}]})
];

export const KINOFLO_DIVA_BARFLY_ACCESSORIES=[
  acc('kinoflo-diva201-mount','Kino #10 Mount Kit','Diva-Lite Fluorescent','Mounting',['kinoflo-diva-lite-201'],DIVA,null,{orderCode:'PRT-M10Y'}),
  acc('kinoflo-diva400-gel-frame','Diva-Lite 400 Gel Frame','Diva-Lite Fluorescent','Filter Holder',['kinoflo-diva-lite-400'],DIVA_MANUAL,'Holds gel or diffusion media.'),
  acc('kinoflo-diva401-gel-frame','Diva-Lite 401 Gel Frame','Diva-Lite Fluorescent','Filter Holder',['kinoflo-diva-lite-401'],DIVA_MANUAL,'Holds gel or diffusion media.',{orderCode:'GFR-D4'}),
  acc('kinoflo-diva401-louver-90','Diva-Lite 401 Louver 90 deg','Diva-Lite Fluorescent','Grid',['kinoflo-diva-lite-401'],DIVA_MANUAL,'Controls spill and off-axis output.',{orderCode:'LVR-D490-P'}),
  acc('kinoflo-diva415-mount','Kino #10 Mount Kit','Diva-Lite Fluorescent','Mounting',['kinoflo-diva-lite-415'],DIVA,null,{orderCode:'PRT-M10Y'}),
  acc('kinoflo-barfly100-connector','BarFly 100 Male Connector Assembly','BarFly','Cable',['kinoflo-barfly-100'],REMOTE,null,{orderCode:'PRT-XM2'}),
  acc('kinoflo-barfly200-connector','BarFly 200 Male Connector Assembly','BarFly','Cable',['kinoflo-barfly-200'],REMOTE,null,{orderCode:'PRT-XM2'}),
  acc('kinoflo-barfly400-connector','BarFly 400 Male Connector Assembly','BarFly','Cable',['kinoflo-barfly-400'],REMOTE,null,{orderCode:'PRT-MGM4'}),
  acc('kinoflo-barfly450-dmx-control','BarFly 450 DMX Integrated Control','BarFly','Control',['kinoflo-barfly-450-dmx'],BARFLY,'Provides DMX512 control for the BarFly 450 DMX.')
];
