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
const P300R='https://www.godox.com/Downloads/KNOWLED_P300R.pdf';
const P600R='https://www.godox.com/Downloads/KNOWLED_P600R.pdf';
const F100_200R='https://www.godox.com/Downloads/KNOWLED_F100R_F200R_F200SR.pdf';
const KNOWLED_FULL_COLOR_MATS='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';
const C_CREATIVE='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';
const LA150_300='https://godox.com/product-c/LA150R-LA200R-LA300R-LA300Bi.html';
const TL_SERIES='https://www.godox.com/Downloads/Godox_Continuous_Lighting_Catalogue_EN.pdf';

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
  fixture('godox-m300bi','M300Bi','KNOWLED M',2800,6500,360,null,M200_M300,'Bi-Color',{mount:'Bowens',cri:96,tlci:97,control:['DMX512','2.4G Remote','Bluetooth/App']}),
  fixture('godox-p300r','P300R','KNOWLED Panel',1800,10000,350,null,P300R,'Full Color',{formFactor:'LED Panel',cri:96,tlci:96,control:['DMX512','RDM','CRMX','Art-Net/sACN','Bluetooth/App','On-board']}),
  fixture('godox-p600r','P600R','KNOWLED Panel',1800,10000,700,null,P600R,'Full Color',{formFactor:'LED Panel',cri:96,tlci:96,control:['DMX512','RDM','CRMX','Art-Net/sACN','Bluetooth/App','On-board']}),
  fixture('godox-f100r','F100R','KNOWLED Flexible LED Mat',1800,10000,130,'IP54',F100_200R,'Full Color',{formFactor:'Flexible LED Mat',cri:96,tlci:98,control:['DMX512','RDM','CRMX','Bluetooth/App']}),
  fixture('godox-f200r','F200R','KNOWLED Flexible LED Mat',1800,10000,250,'IP54',F100_200R,'Full Color',{formFactor:'Flexible LED Mat',cri:96,tlci:98,control:['DMX512','RDM','CRMX','Bluetooth/App']}),
  fixture('godox-f200sr','F200SR','KNOWLED Flexible LED Mat',1800,10000,250,'IP54',F100_200R,'Full Color',{formFactor:'Flexible LED Mat',cri:96,tlci:98,control:['DMX512','RDM','CRMX','Bluetooth/App']}),
  fixture('godox-f400r','F400R','KNOWLED Flexible LED Mat',1800,10000,460,'IP54',KNOWLED_FULL_COLOR_MATS,'Full Color',{formFactor:'Flexible LED Mat',cri:96,tlci:97,control:['DMX512','RDM','CRMX','Art-Net/sACN','Bluetooth/App']}),
  fixture('godox-f800r','F800R','KNOWLED Flexible LED Mat',1800,10000,900,'IP54',KNOWLED_FULL_COLOR_MATS,'Full Color',{formFactor:'Flexible LED Mat',cri:96,tlci:97,control:['DMX512','RDM','CRMX','Art-Net/sACN','Bluetooth/App']}),
  fixture('godox-c5r','C5R','KNOWLED Creative Light',2500,8500,5,null,C_CREATIVE,'RGBWW',{formFactor:'Pocket Creative Light',cri:96,tlci:97,control:['On-board','Bluetooth/App'],battery:'Built-in 3000mAh rechargeable'}),
  fixture('godox-c7r','C7R','KNOWLED Creative Bulb',2000,10000,7,null,C_CREATIVE,'RGBWW',{formFactor:'E26/E27 Creative Bulb',cri:96,tlci:97,control:['On-board','Bluetooth/App'],battery:'Built-in rechargeable'}),
  fixture('godox-c10r','C10R','KNOWLED Creative Bulb',2000,10000,10,null,C_CREATIVE,'RGBWW',{formFactor:'E26/E27 Creative Bulb',cri:96,tlci:97,control:['On-board','Bluetooth/App'],powerSupply:'AC lamp socket / USB-C DC'}),
  fixture('godox-la150r','LA150R','LITEMONS LA',1800,10000,165,null,LA150_300,'Full Color',{mount:'Bowens',cri:95,tlci:94,control:['Bluetooth/App','On-board']}),
  fixture('godox-la200r','LA200R','LITEMONS LA',1800,10000,220,null,LA150_300,'Full Color',{mount:'Bowens',cri:95,tlci:94,control:['Bluetooth/App','On-board']}),
  fixture('godox-la300r','LA300R','LITEMONS LA',1800,10000,330,null,LA150_300,'Full Color',{mount:'Bowens',cri:95,tlci:94,control:['DMX via DMX-TRS1','Bluetooth/App','On-board']}),
  fixture('godox-la300bi','LA300Bi','LITEMONS LA',2800,6500,330,null,LA150_300,'Bi-Color',{mount:'Bowens',cri:95,tlci:94,control:['DMX via DMX-TRS1','Bluetooth/App','On-board']}),
  fixture('godox-tl30','TL30','RGBWW Tube Light',2700,6500,8,null,TL_SERIES,'RGBWW',{formFactor:'30cm Tube Light',cri:97,tlci:99,control:['Bluetooth/App','On-board'],battery:'Built-in rechargeable'}),
  fixture('godox-tl60','TL60','RGBWW Tube Light',2700,6500,18,null,TL_SERIES,'RGBWW',{formFactor:'75cm Tube Light',cri:96,tlci:98,control:['DMX','2.4G Remote','Bluetooth/App','On-board'],battery:'Built-in rechargeable'}),
  fixture('godox-tl120','TL120','RGBWW Tube Light',2700,6500,30,null,TL_SERIES,'RGBWW',{formFactor:'117cm Tube Light',cri:96,tlci:98,control:['DMX','2.4G Remote','Bluetooth/App','On-board'],battery:'Built-in rechargeable'}),
  fixture('godox-tl180','TL180','RGBWW Tube Light',2700,6500,55,null,TL_SERIES,'RGBWW',{formFactor:'180cm Tube Light',cri:96,tlci:98,control:['DMX','2.4G Remote','Bluetooth/App','On-board'],battery:'Built-in rechargeable'})
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
const p300r=['godox-p300r'];
const p600r=['godox-p600r'];
const fullColorMats=['godox-f100r','godox-f200r','godox-f200sr','godox-f400r','godox-f800r'];
const cCreative=['godox-c5r','godox-c7r','godox-c10r'];
const la150300=['godox-la150r','godox-la200r','godox-la300r','godox-la300bi'];
const la300=['godox-la300r','godox-la300bi'];
const tl30=['godox-tl30'];
const tl60plus=['godox-tl60','godox-tl120','godox-tl180'];
const tlAll=['godox-tl30',...tl60plus];

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
  acc('godox-rc-a6-m200m300','RC-A6 Remote Control','Remote Control',m200m300,M200_M300,'2.4GHz remote control option listed for the M200/M300 series.'),
  acc('godox-p300rh30','P300RH30 Honeycomb 30°','Grid',p300r,P300R,'Narrows spill and increases directional control.'),
  acc('godox-p300rb4','P300RB4 Barndoor','Barn Door',p300r,P300R,'Shapes and cuts the P300R beam.'),
  acc('godox-p300rs33','P300RS33 Softbox 3x3 + Grid','Softbox',p300r,P300R,'Creates a larger soft source with directional grid control.'),
  acc('godox-p300r04','P300R04 Octa 4ft + Grid','Softbox',p300r,P300R,'Provides broad soft output from the P300R.'),
  acc('godox-p600rh30','P600RH30 Honeycomb 30°','Grid',p600r,P600R,'Narrows spill and increases directional control.'),
  acc('godox-p600rb4','P600RB4 Barndoor','Barn Door',p600r,P600R,'Shapes and cuts the P600R beam.'),
  acc('godox-p600rs34','P600RS34 Softbox 3x4 + Grid','Softbox',p600r,P600R,'Creates a large soft field with grid control.'),
  acc('godox-p600r05','P600R05 Octa 5ft + Grid','Softbox',p600r,P600R,'Creates a large octagonal soft source for the P600R.'),
  acc('godox-fa-full-color','FA100/FA200/FA200S/FA400/FA800 Air Softbox Kit','Softbox',fullColorMats,KNOWLED_FULL_COLOR_MATS,'Inflatable softbox family matched to the full-color flexible mats.'),
  acc('godox-fp-full-color','FP200/FP400/FP600 Pancake Lantern','Lantern',['godox-f200r','godox-f400r','godox-f800r'],KNOWLED_FULL_COLOR_MATS,'Creates a broad soft field for overhead and location lighting.'),
  acc('godox-f-dc-full-color','F-DC5D/F-DC5E/F-DC10E DC Cable','Power Cable',fullColorMats,KNOWLED_FULL_COLOR_MATS,'Official extension cabling for the full-color flexible mat family.'),
  acc('godox-f-softbox-skirt','SS-FS100/200/200S/400/800 Softbox Skirt','Light Control',fullColorMats,KNOWLED_FULL_COLOR_MATS,'Controls spill from the matching K1 softbox kits.'),
  acc('godox-c5r-diffuser','C5R Collapsible Diffuser','Diffusion',['godox-c5r'],C_CREATIVE,'Softens the pocket light output for close practical and accent work.'),
  acc('godox-c5r-charging-kit','C5R 8-Light Charging Kit','Charging', ['godox-c5r'], C_CREATIVE,'Stores and charges multiple C5R units for production use.'),
  acc('godox-c7r-charging-kit','C7R 8-Light Charging Kit','Charging',['godox-c7r'],C_CREATIVE,'Charges and transports multiple C7R creative bulbs.'),
  acc('godox-c-creative-usbc','USB-C Power/Charging Cable','Power Cable',cCreative,C_CREATIVE,'Provides USB-C power or charging where supported.'),
  acc('godox-dbp-v','DBP-V Dual Battery Plate','Power',la150300,LA150_300,'Enables V-mount battery operation for mobile lighting setups.'),
  acc('godox-dmx-trs1','DMX-TRS1 Adapter Cable','Control Cable',la300,LA150_300,'Adds wired DMX control to updated LA300R and LA300Bi units.'),
  acc('godox-la-bowens-softbox','Bowens Mount Softbox','Softbox',la150300,LA150_300,'Softens the source with standard Bowens-mount modifiers.'),
  acc('godox-qr-p-la','QR-P Parabolic Softbox','Softbox',la150300,LA150_300,'Provides a soft directional source using Bowens mount.'),
  acc('godox-tl-g30','TL-G30 Grid','Grid',tl30,TL_SERIES,'Controls spill from TL30 and keeps the tube output directional.'),
  acc('godox-tl-c2','TL-C2 Retaining Clip','Mounting',tl30,TL_SERIES),
  acc('godox-tl-m2','TL-M2 Two-Light Coupler','Mounting',tl30,TL_SERIES),
  acc('godox-tl-m8','TL-M8 Eight-Light Coupler','Mounting',tl30,TL_SERIES),
  acc('godox-tl-w30','TL-W30 Waterproof Bag','Protection',tl30,TL_SERIES,'Allows protected TL30 use in wet environments.'),
  acc('godox-rc-r9-tl','RC-R9 Remote Control','Remote Control',tl60plus,TL_SERIES,'Provides 2.4GHz wireless control for TL60/TL120/TL180.'),
  acc('godox-tl-c120','TL-C120 RJ45 to 5-Pin XLR Cable','Control Cable',tl60plus,TL_SERIES,'Connects the TL tube series to standard 5-pin DMX control.'),
  acc('godox-tl-retaining-clip','TL Series Retaining Clip','Mounting',tl60plus,TL_SERIES),
  acc('godox-tl-wire-rope','TL Series Wire Rope','Mounting',tl60plus,TL_SERIES),
  acc('godox-tl-carrying-kit','TL Series Multi-Light Carrying Kit','Transport',tlAll,TL_SERIES,'Supports grouped transport and production deployment of multiple TL fixtures.')
];
