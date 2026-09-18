// Godox professional continuous-light starter catalog.
// Sources: official Godox KNOWLED lighting catalogue and official LA600R/Bi product page.
const KNOWLED='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';
const LA600='https://www.godox.com/product-e/LITEMONS/LA600R-LA600Bi.html';
const KNOWLED_CATALOG='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';
const F200BI='https://www.godox.com/Downloads/KNOWLED_F200Bi.pdf';
const TP='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';
const MG1200BI='https://www.godox.com/Downloads/KNOWLED_MG1200Bi.pdf';
const MG_CATALOG='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';
const MG1200R='https://www.godox.com/static/upload/file/20241212/1733996030483415.pdf';
const MG2400R='https://www.godox.com/Downloads/KNOWLED_MG2400R.pdf';
const MS60='https://www.godox.com/Downloads/KNOWLED_MS60R.pdf';
const M200_M300='https://www.godox.com/static/upload/file/20230608/1686187077668652.pdf';

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
  fixture('godox-tp8r','TP8R','KNOWLED Pixel Tube',2000,10000,null,null,TP,'RGBWW',{formFactor:'8 ft Pixel Tube',cri:96,tlci:96,pixelZones:64,control:['DMX','CRMX','RDM','Bluetooth/App','2.4G Remote','On-board'],battery:'Built-in rechargeable'}),
  fixture('godox-mg1200bi','MG1200Bi','KNOWLED MG',2800,6500,1200,'IP65',MG1200BI,'Bi-Color',{mount:'G-Mount',cri:96,tlci:96,control:['DMX','RDM','CRMX','Ethernet Art-Net/sACN','Bluetooth/App','2.4G Remote','On-board']}),
  fixture('godox-mg2400bi','MG2400Bi','KNOWLED MG',2800,6500,2600,'IP65',MG_CATALOG,'Bi-Color',{mount:'G-Mount',cri:96,tlci:96,control:['DMX','RDM','CRMX','Ethernet Art-Net/sACN','Bluetooth/App','2.4G Remote','On-board']}),
  fixture('godox-mg1200r','MG1200R','KNOWLED MG',1800,10000,1600,'IP54',MG1200R,'Full Color',{mount:'G-Mount',cri:96,tlci:95,control:['DMX','RDM','CRMX','Ethernet Art-Net/sACN','Bluetooth/App','On-board']}),
  fixture('godox-mg2400r','MG2400R','KNOWLED MG',1800,10000,2650,'IP54',MG2400R,'Full Color',{mount:'G-Mount',cri:96,tlci:95,control:['DMX','RDM','CRMX','Ethernet Art-Net/sACN','Bluetooth/App','On-board']}),
  fixture('godox-ms60bi','MS60Bi','KNOWLED MS',2800,6500,60,null,MS60,'Bi-Color',{mount:'Godox Magnetic',cri:97,tlci:98,control:['DMX','RDM','CRMX','Bluetooth/App'],battery:'Removable fast-charging battery'}),
  fixture('godox-ms60r','MS60R','KNOWLED MS',1800,10000,60,null,MS60,'Full Color',{mount:'Godox Magnetic',cri:95,tlci:95,control:['DMX','RDM','CRMX','Bluetooth/App'],battery:'Removable fast-charging battery'}),
  fixture('godox-m200d','M200D','KNOWLED M',5600,5600,230,null,M200_M300,'Daylight',{mount:'Bowens',cri:96,tlci:97,control:['DMX512','2.4G Remote','Bluetooth/App']}),
  fixture('godox-m300d','M300D','KNOWLED M',5600,5600,330,null,M200_M300,'Daylight',{mount:'Bowens',cri:96,tlci:97,control:['DMX512','2.4G Remote','Bluetooth/App']}),
  fixture('godox-m200bi','M200Bi','KNOWLED M',2800,6500,230,null,M200_M300,'Bi-Color',{mount:'Bowens',cri:96,tlci:97,control:['DMX512','2.4G Remote','Bluetooth/App']}),
  fixture('godox-m300bi','M300Bi','KNOWLED M',2800,6500,360,null,M200_M300,'Bi-Color',{mount:'Bowens',cri:96,tlci:97,control:['DMX512','2.4G Remote','Bluetooth/App']})
];

const mSeries=['godox-m300r','godox-m600r','godox-m1000r','godox-m600bi-pro'];
const allSix=[...mSeries,'godox-la600r','godox-la600bi'];
const knowledPanels=['godox-p600r-hard','godox-p1200r-hard'];
const flexibleBi=['godox-f200bi','godox-f400bi','godox-f600bi'];
const tpSeries=['godox-tp2r','godox-tp4r','godox-tp8r'];
const tp24=['godox-tp2r','godox-tp4r'];
const mgBi=['godox-mg1200bi','godox-mg2400bi'];
const mgFull=['godox-mg1200r','godox-mg2400r'];
const mgAll=[...mgBi,...mgFull];
const ms60=['godox-ms60bi','godox-ms60r'];
const m200m300=['godox-m200d','godox-m300d','godox-m200bi','godox-m300bi'];

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
  acc('godox-dt-c1','DT-C1 D-TAP to DC Male Connector Cable','Power Cable',tpSeries,TP),
  acc('godox-gr45','GR45 Reflector','Reflector',mgBi,MG_CATALOG,'Provides a 45-degree high-output beam for the G-Mount MG system.'),
  acc('godox-gf14','GF14 Fresnel Lens','Fresnel',mgBi,MG_CATALOG,'Adds adjustable focusing for long-throw cinematic use.'),
  acc('godox-gf14b','GF14 Barndoors','Barn Door',mgBi,MG_CATALOG,'Controls spill and shapes the Fresnel beam.'),
  acc('godox-gs34','GS34 Softbox','Softbox',mgBi,MG_CATALOG,'Creates a large soft source from the MG head.'),
  acc('godox-gs34-grid','GS34 Grid','Grid',mgBi,MG_CATALOG,'Reduces spill and increases directionality with the GS34 softbox.'),
  acc('godox-gl4','GL4 Lantern Softbox','Lantern',mgBi,MG_CATALOG,'Creates broad omnidirectional soft light for set and overhead use.'),
  acc('godox-gobo-gmount','G-Mount Projection/Gobo Attachment','Projection',mgAll,MG_CATALOG,'Enables projection shaping and pattern work from the MG system.'),
  acc('godox-gr15','GR15 Reflector','Reflector',mgFull,MG_CATALOG,'Creates a narrow high-output beam for long-throw MG full-color setups.'),
  acc('godox-gr30','GR30 Reflector','Reflector',mgFull,MG_CATALOG,'Provides a medium reflector option for MG full-color heads.'),
  acc('godox-mg-full-color-gmount-fresnel','G-Mount Fresnel for MG Full-Color','Fresnel',mgFull,MG_CATALOG,'Adds adjustable focusing to MG1200R and MG2400R.'),
  acc('godox-mg-full-color-barndoors','G-Mount Fresnel Barndoors','Barn Door',mgFull,MG_CATALOG,'Shapes and cuts the focused MG full-color beam.'),
  acc('godox-ms60-lens-reflector','MS60 Lens Reflector','Reflector',ms60,MS60,'Compact lens reflector supplied for the MS60 optical system.'),
  acc('godox-ms60-szl2','SZL2 Zoom Lens','Zoom Lens',ms60,MS60,'Zoom optic for the MS60 system and bridge to S60Bi optical accessories.'),
  acc('godox-ms60-dl5-lite','DL5 Lite Parallel Beam Booster','Beam Booster',ms60,MS60,'Pairs with SZL2 for a narrow long-throw beam.'),
  acc('godox-ms60-sd15','SD15 Collapsible Diffusion Dome','Diffusion',ms60,MS60,'Collapsible diffusion dome for broad soft output.'),
  acc('godox-ms60-sp1','SP1 Parabolic Softbox','Softbox',ms60,MS60,'Compact parabolic softbox for MS60 kits.'),
  acc('godox-ms60-ss11','SS11 Rectangular Softbox','Softbox',ms60,MS60,'Compact rectangular softbox for MS60 kits.'),
  acc('godox-ms60-dmx-c2','DMX-C2 DMX Adapter Cable','Control Cable',ms60,MS60,'DMX adapter cable listed for the MS60 optical/control ecosystem.'),
  acc('godox-rft19','RFT-19 Bowens-mount Reflector','Reflector',m200m300,M200_M300,'Standard reflector supplied with the M200D/M300D/M200Bi/M300Bi system.'),
  acc('godox-fls8','FLS8 Fresnel Lens','Fresnel',m200m300,KNOWLED_CATALOG,'10-40 degree variable Fresnel for the majority of Godox Bowens-mount LED fixtures.'),
  acc('godox-fls10','FLS10 Fresnel Lens','Fresnel',m200m300,KNOWLED_CATALOG,'10-35 degree Fresnel compatible with Godox Bowens-mount LED fixtures.'),
  acc('godox-lb01','LB-01 8-leaf Barndoors','Barn Door',m200m300,KNOWLED_CATALOG,'Shapes the beam when used with FLS8.'),
  acc('godox-lb02','LB-02 8-leaf Barndoors','Barn Door',m200m300,KNOWLED_CATALOG,'Shapes the beam when used with FLS10.'),
  acc('godox-rc-a6-m200m300','RC-A6 Remote Control','Remote Control',m200m300,M200_M300,'2.4GHz remote control option listed for the M200/M300 series.')
];
