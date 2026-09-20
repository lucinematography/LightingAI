// Aladdin MOSAIC flexible RGBWW lighting catalog.
// Sources: official Aladdin MOSAIC product pages, manuals, and accessory charts.
const MOSAIC_2X4='https://aladdin-lights.com/mosaic-2x4/';
const MOSAIC_MANUAL='https://aladdin-lights.com/wp-content/uploads/2023/09/MOSAIC-4x4-Manual-SINGLE-PAGE.pdf';
const MOSAIC_4X4_ACC='https://aladdin-lights.com/wp-content/uploads/2022/12/Accessory-Chart-MOSAIC-4x4-1.pdf';
const MOSAIC_DMX='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';

// Official map pp. 1-2; reconfirmed by ALADDIN_DMX_MAP-12.2025.pdf pp. 25-26.
// Preserve saved Patch mode names and footprints. Correction and FX need the typed app controls.
function mosaicModes(){
  const percent=(key,label,channel)=>({key,label,channel,type:'percent',bits:8,min:0,max:100,dmxMin:0,dmxMax:255});
  return [['Simple CCT Crossfade RGBW',8],['Expert CCT Crossfade RGBW + Effects',11]].map(([name,channels])=>({
    name,channels,verified:true,sourceUrl:MOSAIC_DMX,
    controlScope:'full-profile',
    controlNotes:'Minus correction = magenta; plus = green. FX intensity and speed are relative percentages. Select effects deliberately; some flash. Scene fades switch correction and effect selection at the end.',
    controlNotesSr:'Minus korekcija = magenta; plus = zelena. Ja\u010dina i brzina efekta su relativni procenti. Efekti mogu da bljeskaju; biraj ih namerno. Prelaz scene menja korekciju i izbor efekta tek na kraju.',
    controls:[
      percent('dimmer','Dimmer',1),
      {key:'cct',label:'CCT',channel:2,type:'cct-linear',bits:8,min:2200,max:12000,dmxMin:0,dmxMax:255},
      {key:'greenCorrection',label:'Green / magenta correction',labelSr:'Korekcija zelena / magenta',channel:3,type:'piecewise',bits:8,min:-100,max:100,step:1,defaultValue:0,fade:'snap-at-end',
        segments:[
          {min:-100,max:-100,dmxMin:11,dmxMax:11},
          {min:-99,max:-1,dmxMin:21,dmxMax:119},
          {min:0,max:0,dmxMin:0,dmxMax:0},
          {min:1,max:99,dmxMin:146,dmxMax:244},
          {min:100,max:100,dmxMin:245,dmxMax:245}
        ],
        readSegments:[
          {min:0,max:0,dmxMin:0,dmxMax:10},
          {min:-100,max:-100,dmxMin:11,dmxMax:20},
          {min:-99,max:-1,dmxMin:21,dmxMax:119},
          {min:0,max:0,dmxMin:120,dmxMax:145},
          {min:1,max:99,dmxMin:146,dmxMax:244},
          {min:100,max:100,dmxMin:245,dmxMax:255}
        ]
      },
      percent('crossfade','CCT / RGBW crossfade',4),
      percent('red','Red',5),
      percent('green','Green',6),
      percent('blue','Blue',7),
      percent('white','White',8),
      ...(channels===11?[
        {key:'effect',label:'Effect selection',labelSr:'Izbor efekta',channel:9,type:'enum',bits:8,defaultValue:0,readFallback:0,fade:'snap-at-end',choices:[
          {value:0,dmxValue:0,dmxMin:0,dmxMax:9,label:'Off',labelSr:'Isklju\u010deno'},
          {value:1,dmxValue:10,dmxMin:10,dmxMax:19,label:'Strobe',labelSr:'Stroboskop'},
          {value:2,dmxValue:20,dmxMin:20,dmxMax:29,label:'Fade',labelSr:'Postepeni prelaz'},
          {value:3,dmxValue:30,dmxMin:30,dmxMax:39,label:'Flicker',labelSr:'Treperenje'},
          {value:4,dmxValue:40,dmxMin:40,dmxMax:49,label:'Flash',labelSr:'Bljesak'},
          {value:5,dmxValue:50,dmxMin:50,dmxMax:59,label:'Police',labelSr:'Policija'},
          {value:6,dmxValue:60,dmxMin:60,dmxMax:69,label:'Welding',labelSr:'Varenje'},
          {value:7,dmxValue:70,dmxMin:70,dmxMax:79,label:'Fire',labelSr:'Vatra'},
          {value:8,dmxValue:80,dmxMin:80,dmxMax:89,label:'Candle',labelSr:'Sve\u0107a'},
          {value:9,dmxValue:90,dmxMin:90,dmxMax:99,label:'Television',labelSr:'Televizija'},
          {value:10,dmxValue:100,dmxMin:100,dmxMax:109,label:'Dissolve',labelSr:'Pretapanje'}
        ]},
        {...percent('fxDimmer','FX intensity',10),labelSr:'Ja\u010dina efekta'},
        {...percent('fxSpeed','FX speed (relative)',11),labelSr:'Brzina efekta (relativna)'}
      ]:[])
    ],
    requiredChannels:[]
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
