// Aladdin MOSAIC flexible RGBWW lighting catalog.
// Sources: official Aladdin MOSAIC product pages, manuals, and accessory charts.
const MOSAIC_2X4='https://aladdin-lights.com/mosaic-2x4/';
const MOSAIC_MANUAL='https://aladdin-lights.com/wp-content/uploads/2023/09/MOSAIC-4x4-Manual-SINGLE-PAGE.pdf';
const MOSAIC_4X4_ACC='https://aladdin-lights.com/wp-content/uploads/2022/12/Accessory-Chart-MOSAIC-4x4-1.pdf';
const MOSAIC_DMX='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';


// Static-light controls: DMX map 2023 pp. 1-2, reconfirmed by 12.2025 pp. 25-26.
// Green correction is piecewise, and FX selection is discrete: neither is a linear slider.
// Keep both neutral/off until their dedicated UI is implemented. Do not infer crossfade direction.
function mosaicModes(){
  const percent=(key,label,channel)=>({key,label,channel,type:'percent',bits:8,min:0,max:100,dmxMin:0,dmxMax:255});
  return [['Simple CCT Crossfade RGBW',8],['Expert CCT Crossfade RGBW + Effects',11]].map(([name,channels])=>({
    name,channels,verified:true,sourceUrl:MOSAIC_DMX,
    controlScope:'static-light',
    controlNotes:'Green correction is neutral; Expert effects are OFF during these direct controls.',
    controls:[
      percent('dimmer','Dimmer',1),
      {key:'cct',label:'CCT',channel:2,type:'cct-linear',bits:8,min:2200,max:12000,dmxMin:0,dmxMax:255},
      percent('crossfade','CCT / RGBW crossfade (static light)',4),
      percent('red','Red',5),
      percent('green','Green',6),
      percent('blue','Blue',7),
      percent('white','White',8)
    ],
    requiredChannels:[{channel:3,value:0},...(channels===11?[{channel:9,value:0}]:[])]
  }));
}

function fixture(id,model,powerW,sourceUrl,extra={}){
  return {
    id,manufacturer:'Aladdin',model,family:'MOSAIC',category:'Light',
    sourceType:'Flexible LED Panel',cctK:{min:2200,max:12000},
    colorMode:'RGBWW',powerW,sourceUrl,
    cri:95,tlci:95,beamAngleDeg:140,
    control:['Bluetooth/App','DMX512','LumenRadio','On-board','Optional Wired Dimmer'],
    // DMX requires the compatible DMX attachment or M-WDIM.
    dmxModes:mosaicModes(),
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
