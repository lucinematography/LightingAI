// Aladdin MOSAIC flexible RGBWW lighting catalog.
// Sources: official Aladdin MOSAIC product pages, manuals, and accessory charts.
const MOSAIC_2X4='https://aladdin-lights.com/mosaic-2x4/';
const MOSAIC_MANUAL='https://aladdin-lights.com/wp-content/uploads/2023/09/MOSAIC-4x4-Manual-SINGLE-PAGE.pdf';
const MOSAIC_4X4_ACC='https://aladdin-lights.com/wp-content/uploads/2022/12/Accessory-Chart-MOSAIC-4x4-1.pdf';
const MOSAIC_DMX='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';

function fixture(id,model,powerW,sourceUrl,extra={}){
  return {
    id,manufacturer:'Aladdin',model,family:'MOSAIC',category:'Light',
    sourceType:'Flexible LED Panel',cctK:{min:2200,max:12000},
    colorMode:'RGBWW',powerW,sourceUrl,
    cri:95,tlci:95,beamAngleDeg:140,
    control:['Bluetooth/App','DMX512','LumenRadio','On-board','Optional Wired Dimmer'],
    // DMX requires the compatible DMX attachment or M-WDIM; this pass models footprints only.
    dmxModes:[
      {name:'Simple CCT Crossfade RGBW',channels:8,verified:true,sourceUrl:MOSAIC_DMX},
      {name:'Expert CCT Crossfade RGBW + Effects',channels:11,verified:true,sourceUrl:MOSAIC_DMX}
    ],
    ...extra
  };
}
function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {id,manufacturer:'Aladdin',model,category,compatibilityStatus:'Designed For',compatibleWith,sourceUrl,...(effectOnLight?{effectOnLight}:{})};
}

export const ALADDIN_MOSAIC_FIXTURES=[
  fixture('aladdin-mosaic-2x4','MOSAIC 2X4',350,MOSAIC_2X4,{formFactor:'Foldable flexible LED panel',dimensions:'55 x 110 cm'}),
  fixture('aladdin-mosaic-4x4','MOSAIC 4X4',600,MOSAIC_MANUAL,{formFactor:'Flexible LED panel',dimensions:'112 x 112 cm'}),
  fixture('aladdin-mosaic-3x6','MOSAIC 3X6',600,MOSAIC_MANUAL,{formFactor:'Flexible LED panel',dimensions:'176 x 91 cm'})
];

const mosaicAll=ALADDIN_MOSAIC_FIXTURES.map(x=>x.id);

export const ALADDIN_MOSAIC_ACCESSORIES=[
  acc('aladdin-m-wdim','M-WDIM Wired Dimmer','Dimmer',mosaicAll,MOSAIC_2X4,'Adds physical controls, DMX connectivity and built-in LumenRadio control.'),
  acc('aladdin-m-001','MOSAIC Stand Adapter','Mounting',mosaicAll,MOSAIC_2X4,'Provides stand mounting for framed MOSAIC panels.'),
  acc('aladdin-m-2x4-fr','MOSAIC 2X4 Frame','Frame',['aladdin-mosaic-2x4'],MOSAIC_2X4),
  acc('aladdin-m-2x4-df','MOSAIC 2X4 Diffuser','Diffusion',['aladdin-mosaic-2x4'],MOSAIC_2X4,'Softens the 2X4 panel output.'),
  acc('aladdin-m-2x4-grid','MOSAIC 2X4 Grid','Grid',['aladdin-mosaic-2x4'],MOSAIC_2X4,'Controls spill from the 2X4 panel.'),
  acc('aladdin-m-350acad','MOSAIC 350W Power Supply','Power',['aladdin-mosaic-2x4'],MOSAIC_2X4),
  acc('aladdin-m-4x4-fr','MOSAIC 4X4 Frame','Frame',['aladdin-mosaic-4x4'],MOSAIC_4X4_ACC),
  acc('aladdin-m-4x4-df','MOSAIC 4X4 Diffuser','Diffusion',['aladdin-mosaic-4x4'],MOSAIC_4X4_ACC,'Softens the 4X4 panel output.'),
  acc('aladdin-m-4x4-grid','MOSAIC 4X4 Grid','Grid',['aladdin-mosaic-4x4'],MOSAIC_4X4_ACC,'Controls spill from the 4X4 panel.'),
  acc('aladdin-m-600acad','MOSAIC 600W Power Supply','Power',['aladdin-mosaic-4x4','aladdin-mosaic-3x6'],MOSAIC_4X4_ACC),
  acc('aladdin-m-exca3m','MOSAIC Power Extension Cable 3m','Power Cable',mosaicAll,MOSAIC_2X4),
  acc('aladdin-m-wdexca3m','MOSAIC Wired Dimmer Extension Cable 3m','Control Cable',mosaicAll,MOSAIC_2X4),
  acc('aladdin-m-case','MOSAIC Hard Case','Transport',mosaicAll,MOSAIC_2X4)
];
