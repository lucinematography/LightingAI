// Godox professional continuous-light starter catalog.
// Sources: official Godox KNOWLED lighting catalogue and official LA600R/Bi product page.
const KNOWLED='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';
const LA600='https://www.godox.com/product-e/LITEMONS/LA600R-LA600Bi.html';
const KNOWLED_CATALOG='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';
const F200BI='https://www.godox.com/Downloads/KNOWLED_F200Bi.pdf';
const TP='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';

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
  fixture('godox-p1200r-hard','P1200R Hard','KNOWLED Panel',1800,10000,1200,null,KNOWLED_CATALOG,'Full Color',{formFactor:'2x1 LED Panel',cri:96,tlci:96,control:['DMX','CRMX','App','On-board']}),
  fixture('godox-f200bi','F200Bi','KNOWLED Flexible LED Mat',2700,8500,200,'IP65',F200BI,'Bi-Color',{formFactor:'Flexible LED Mat',cri:96,tlci:96,control:['DMX','2.4G Remote','Bluetooth/App']}),
  fixture('godox-f400bi','F400Bi','KNOWLED Flexible LED Mat',2700,8500,400,'IP65',KNOWLED_CATALOG,'Bi-Color',{formFactor:'Flexible LED Mat',cri:96,tlci:96,control:['DMX','2.4G Remote','Bluetooth/App']}),
  fixture('godox-f600bi','F600Bi','KNOWLED Flexible LED Mat',2700,8500,600,'IP65',KNOWLED_CATALOG,'Bi-Color',{formFactor:'Flexible LED Mat',cri:96,tlci:96,control:['DMX','2.4G Remote','Bluetooth/App']}),
  fixture('godox-tp2r','TP2R','KNOWLED Pixel Tube',2000,10000,null,null,TP,'RGBWW',{formFactor:'2 ft Pixel Tube',cri:96,tlci:96,pixelZones:16,control:['DMX','CRMX','RDM','Bluetooth/App','2.4G Remote','On-board'],battery:'Built-in rechargeable'}),
  fixture('godox-tp4r','TP4R','KNOWLED Pixel Tube',2000,10000,null,null,TP,'RGBWW',{formFactor:'4 ft Pixel Tube',cri:96,tlci:96,pixelZones:32,control:['DMX','CRMX','RDM','Bluetooth/App','2.4G Remote','On-board'],battery:'Built-in rechargeable'}),
  fixture('godox-tp8r','TP8R','KNOWLED Pixel Tube',2000,10000,null,null,TP,'RGBWW',{formFactor:'8 ft Pixel Tube',cri:96,tlci:96,pixelZones:64,control:['DMX','CRMX','RDM','Bluetooth/App','2.4G Remote','On-board'],battery:'Built-in rechargeable'})
];

const mSeries=['godox-m300r','godox-m600r','godox-m1000r','godox-m600bi-pro'];
const allSix=[...mSeries,'godox-la600r','godox-la600bi'];
const knowledPanels=['godox-p600r-hard','godox-p1200r-hard'];
const flexibleBi=['godox-f200bi','godox-f400bi','godox-f600bi'];
const tpSeries=['godox-tp2r','godox-tp4r','godox-tp8r'];
const tp24=['godox-tp2r','godox-tp4r'];

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
  acc('godox-p-hard-light-control','P600R/P1200R Hard Light Control Accessory','Light Control',knowledPanels,KNOWLED_CATALOG,'Supports controlled shaping of the panel output.'),
  acc('godox-fs200-softbox-grid','FS200 Softbox with Grid','Softbox',['godox-f200bi'],KNOWLED_CATALOG,'Softens the flexible mat output and the grid limits spill.'),
  acc('godox-fs400-softbox-grid','FS400 Softbox with Grid','Softbox',['godox-f400bi'],KNOWLED_CATALOG,'Softens the flexible mat output and the grid limits spill.'),
  acc('godox-fs600-softbox-grid','FS600 Softbox with Grid','Softbox',['godox-f600bi'],KNOWLED_CATALOG,'Softens the flexible mat output and the grid limits spill.'),
  acc('godox-fp200-pancake-lantern','FP200 Pancake Lantern','Lantern',['godox-f200bi'],KNOWLED_CATALOG,'Creates a broad soft field for overhead and close-location use.'),
  acc('godox-fp400-pancake-lantern','FP400 Pancake Lantern','Lantern',['godox-f400bi'],KNOWLED_CATALOG,'Creates a broad soft field for overhead and close-location use.'),
  acc('godox-fp600-pancake-lantern','FP600 Pancake Lantern','Lantern',['godox-f600bi'],KNOWLED_CATALOG,'Creates a broad soft field for overhead and close-location use.'),
  acc('godox-ff200-flag-frame','FF200 Flag Frame','Light Control',['godox-f200bi'],KNOWLED_CATALOG,'Adds a rigid flagging frame for shaping the F200Bi field.'),
  acc('godox-f-dc5a','F-DC5A 5m DC Cable','Power Cable',['godox-f200bi'],KNOWLED_CATALOG),
  acc('godox-f-dc5b','F-DC5B 5m DC Cable','Power Cable',['godox-f400bi'],KNOWLED_CATALOG),
  acc('godox-f-dc5c','F-DC5C 5m DC Cable','Power Cable',['godox-f600bi'],KNOWLED_CATALOG),
  acc('godox-rc-a6ii','RC-A6II Remote Control','Remote Control',flexibleBi,KNOWLED_CATALOG),
  acc('godox-rc-r9ii','RC-R9II Remote Control','Remote Control',flexibleBi,KNOWLED_CATALOG),
  acc('godox-tp-b2','TP-B2 Two-light Bracket Kit','Mounting',tp24,TP),
  acc('godox-tp-b4','TP-B4 Four-light Bracket Kit','Mounting',tp24,TP),
  acc('godox-tp-b8','TP-B8 Eight-light Bracket Kit','Mounting',tp24,TP),
  acc('godox-tp-s2-s4','TP-S2 / TP-S4 Softbox','Softbox',tp24,TP,'Softens the tube output for a broader, more even field.'),
  acc('godox-tp-s2a-s4a','TP-S2A / TP-S4A Air Soft Tube','Diffusion',tp24,TP,'Turns the tube into a larger diffused linear source.'),
  acc('godox-tp-p600','TP-P600 Power Box','Power',tpSeries,TP),
  acc('godox-tp-grid','TP-G2 / TP-G4 / TP-G8 Grid','Grid',tpSeries,TP,'Reduces spill and increases directional control.'),
  acc('godox-tp-fs60','TP-FS60 Floor Stand','Mounting',tpSeries,TP),
  acc('godox-tp-m2','TP-M2 Multi-tube Light Connector','Mounting',tpSeries,TP),
  acc('godox-dmx-c1','DMX-C1 DMX Adapter Cable','Control Cable',tpSeries,TP),
  acc('godox-tp-a2r-a4r-a8r','TP-A2R / TP-A4R / TP-A8R One-for-Two Adapter','Power',tpSeries,TP),
  acc('godox-tp-dc5','TP-DC5 5m DC Cable','Power Cable',tpSeries,TP),
  acc('godox-dt-c1','DT-C1 D-TAP to DC Male Connector Cable','Power Cable',tpSeries,TP)
];
