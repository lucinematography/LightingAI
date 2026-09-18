// Godox professional continuous-light starter catalog.
// Sources: official Godox KNOWLED lighting catalogue and official LA600R/Bi product page.
const KNOWLED='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';
const LA600='https://www.godox.com/product-e/LITEMONS/LA600R-LA600Bi.html';
const KNOWLED_CATALOG='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';

function fixture(id,model,family,cctMin,cctMax,powerW,ipRating,sourceUrl,colorMode,extra={}){
  return {
    id,manufacturer:'Godox',model,family,category:'Light',
    sourceType:'LED Continuous Light',
    cctK:{min:cctMin,max:cctMax},
    colorMode,
    ...(powerW?{powerW}:{}),
    ...(ipRating?{ipRating}:{}),
    sourceUrl,
    ...extra
  };
}

export const GODOX_CONTINUOUS_FIXTURES=[
  fixture('godox-m300r','M300R','KNOWLED M',1800,10000,460,'IP65',KNOWLED,'Full Color',{mount:'Bowens',control:['DMX','CRMX','App','On-board']}),
  fixture('godox-m600r','M600R','KNOWLED M',1800,10000,720,'IP54',KNOWLED,'Full Color',{mount:'Flat Bowens',control:['DMX','CRMX','App','On-board']}),
  fixture('godox-m1000r','M1000R','KNOWLED M',1800,10000,1150,'IP65',KNOWLED,'Full Color',{mount:'Flat Bowens',control:['DMX','CRMX','App','On-board']}),
  fixture('godox-m600bi-pro','M600Bi Pro','KNOWLED M',2800,6500,650,'IP54',KNOWLED,'Bi-Color',{mount:'Flat Bowens',control:['DMX','CRMX','App','On-board']}),
  fixture('godox-la600r','LA600R','LITEMONS LA',1800,10000,null,null,LA600,'Full Color',{mount:'Flat Bowens',control:['DMX','Bluetooth/App','CRMX via TimoLink RX']}),
  fixture('godox-la600bi','LA600Bi','LITEMONS LA',2800,6500,null,null,LA600,'Bi-Color',{mount:'Flat Bowens',control:['DMX','Bluetooth/App','CRMX via TimoLink RX']}),
  fixture('godox-p600r-hard','P600R Hard','KNOWLED Panel',1800,10000,650,null,KNOWLED_CATALOG,'Full Color',{formFactor:'1x1 LED Panel',cri:96,tlci:96,control:['DMX','CRMX','App','On-board']}),
  fixture('godox-p1200r-hard','P1200R Hard','KNOWLED Panel',1800,10000,1200,null,KNOWLED_CATALOG,'Full Color',{formFactor:'2x1 LED Panel',cri:96,tlci:96,control:['DMX','CRMX','App','On-board']})
];

const mSeries=['godox-m300r','godox-m600r','godox-m1000r','godox-m600bi-pro'];
const allSix=[...mSeries,'godox-la600r','godox-la600bi'];
const knowledPanels=['godox-p600r-hard','godox-p1200r-hard'];

function acc(id,model,category,compatibleWith,sourceUrl,effectOnLight){
  return {
    id,manufacturer:'Godox',model,category,
    compatibilityStatus:'Designed For',
    compatibleWith,sourceUrl,
    ...(effectOnLight?{effectOnLight}:{})
  };
}

export const GODOX_CONTINUOUS_ACCESSORIES=[
  acc('godox-beamlight-b60','BeamLight B60','Reflector',allSix,KNOWLED,'Boosts throw and concentrates output for high-intensity setups.'),
  acc('godox-bf10-fresnel','BF10 Fresnel','Fresnel',mSeries,KNOWLED,'Provides controllable focusing of the beam.'),
  acc('godox-liteflow-reflector','LiteFlow Reflector','Reflector',mSeries,KNOWLED,'Redirects and shapes reflected light for controlled cinematic setups.'),
  acc('godox-cs-d-lantern-softbox','CS-D Lantern Softbox','Softbox',mSeries,KNOWLED,'Creates broad, soft omnidirectional illumination.'),
  acc('godox-sb-fw-120-octa','SB-FW-120 Octa Softbox','Softbox',mSeries,KNOWLED,'Creates a large soft source with controlled spill.'),
  acc('godox-qr-p-parabolic-softbox','QR-P Parabolic Softbox','Softbox',mSeries,KNOWLED,'Softens the source while retaining directional control.'),
  acc('godox-p-hard-diffusion-panel','P600R/P1200R Hard Diffusion Panel','Diffusion',knowledPanels,KNOWLED_CATALOG,'Switches the hard panel output toward a softer field.'),
  acc('godox-p-hard-light-control','P600R/P1200R Hard Light Control Accessory','Light Control',knowledPanels,KNOWLED_CATALOG,'Supports controlled shaping of the panel output.')
];
