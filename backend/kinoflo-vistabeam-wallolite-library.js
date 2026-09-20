// Kino Flo VistaBeam / Wall-O-Lite fluorescent legacy family.
// Sources: official Kino Flo archive pages and manuals.
const VB300='https://kinoflo.com/vistabeam-300-series/';
const VB600='https://kinoflo.com/vistabeam-600-series/';
const WALL='https://kinoflo.com/wall-o-lite/';
const VB_MANUAL='https://kinoflo.com/wp-content/uploads/2022/07/3100041-VistaBeam-Web-Quality-Old.pdf';
const MANUALS='https://kinoflo.com/manuals-archive/';

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

export const KINOFLO_VISTABEAM_WALLO_FIXTURES=[
  fixture('kinoflo-vistabeam-300-dmx','VistaBeam 300 DMX','VistaBeam',VB300,{
    lampType:'96W CFL',lampCount:3,power:'120VAC or 230VAC',
    currentA:{v120:4.8,v230:2.4},weightKg:13.4,
    dimensionsCm:{width:105.5,height:62.2,depth:21.5},
    control:['DMX512','Remote Lamp Select'],switching:'1-3',
    dmxModes:[{name:'Fixture mode',channels:4,verified:true,sourceUrl:VB_MANUAL},{name:'Individual Lamp mode',channels:4,verified:true,sourceUrl:VB_MANUAL}]
  }),
  fixture('kinoflo-vistabeam-600-dmx','VistaBeam 600 DMX','VistaBeam',VB600,{
    lampType:'96W CFL',lampCount:6,power:'120VAC or 230VAC',
    currentA:{v120:9.1,v230:4.6},weightKg:21.4,
    dimensionsCm:{width:105.5,height:100.5,depth:21.5},
    control:['DMX512','Remote Lamp Select'],switching:'1-6',
    dmxModes:[{name:'Fixture mode',channels:7,verified:true,sourceUrl:VB_MANUAL},{name:'Individual Lamp mode',channels:7,verified:true,sourceUrl:VB_MANUAL}]
  }),
  fixture('kinoflo-wall-o-lite-dmx','Wall-O-Lite DMX','Wall-O-Lite',WALL,{
    voltageVariants:['120VAC','230VAC'],control:['DMX512']
  })
];

export const KINOFLO_VISTABEAM_WALLO_ACCESSORIES=[
  acc('kinoflo-vistabeam-articulated-mount','VistaBeam Articulated Mount','VistaBeam','Mounting',['kinoflo-vistabeam-300-dmx','kinoflo-vistabeam-600-dmx'],VB300,null,{orderCode:'MTP-V63C'}),
  acc('kinoflo-vistabeam-ballast-board','VistaBeam 600/300 Ballast Board','VistaBeam','Control',['kinoflo-vistabeam-300-dmx','kinoflo-vistabeam-600-dmx'],VB_MANUAL,'Electronic ballast board for VistaBeam 300/600.',{orderCode:'6800096'}),
  acc('kinoflo-wall-o-lite-articulated-mount','Wall-O-Lite Articulated Mount','Wall-O-Lite','Mounting',['kinoflo-wall-o-lite-dmx'],WALL,null,{orderCode:'MTP-V63C'}),
  acc('kinoflo-wall-o-lite-ballast-board','VG5R Ballast Board','Wall-O-Lite','Control',['kinoflo-wall-o-lite-dmx'],WALL,'Electronic ballast board listed for Wall-O-Lite.',{orderCode:'6800177'}),
  acc('kinoflo-wall-o-lite-locking-lever','Wall-O-Lite Locking Lever','Wall-O-Lite','Mounting',['kinoflo-wall-o-lite-dmx'],WALL,null,{orderCode:'PRT-WAL-175'})
];
