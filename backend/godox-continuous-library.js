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
const LP_SERIES='https://www.godox.com/product-b/LP-Series.html';
const LC_SERIES='https://www.godox.com/product-c/LC500R-LC500Bi.html';
const LC_MINI_SERIES='https://godox.com/product-a/LED-LC500mini.html';
const LC1000_SERIES='https://www.godox.com/product-b/LED/LC1000Bi-LC1000R.html';
const LDX_SERIES='https://www.godox.com/Downloads/Godox_Continuous_Lighting_Catalogue_EN.pdf';
const LDP_SERIES='https://godox.com/product-d/2387.html';
const ML100_SERIES='https://www.godox.com/Downloads/Godox_Continuous_Lighting_Catalogue_EN.pdf';
const SL60II='https://www.godox.com/product-a/SL60II.html';
const SL100='https://godox.com/product-d/SL100D-SL100Bi.html';
const SL_SERIES='https://www.godox.com/product-d/SLIII.html';
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
  fixture('godox-m300r','M300R','KNOWLED M',1800,10000,460,'IP65',KNOWLED,'Full Color',{mount:'Bowens',control:{wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:['Art-Net','sACN'],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/KNOWLED_M300R.pdf','https://www.godox.com/app/']}}),
  fixture('godox-m600r','M600R','KNOWLED M',1800,10000,720,'IP54',KNOWLED,'Full Color',{mount:'Flat Bowens',control:{wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:['Art-Net','sACN'],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/KNOWLED_M600R.pdf','https://www.godox.com/app/']}}),
  fixture('godox-m1000r','M1000R','KNOWLED M',1800,10000,1150,'IP65',KNOWLED,'Full Color',{mount:'Flat Bowens',control:{wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:['Art-Net','sACN'],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/KNOWLED_M1000R.pdf','https://www.godox.com/app/']}}),
  fixture('godox-m600bi-pro','M600Bi Pro','KNOWLED M',2800,6500,650,'IP54',KNOWLED,'Bi-Color',{mount:'Flat Bowens',control:{wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:['Art-Net','sACN'],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/static/upload/file/20241209/1733733960299611.pdf','https://www.godox.com/app/']}}),
  fixture('godox-la600r','LA600R','LITEMONS LA',1800,10000,null,null,LA600,'Full Color',{mount:'Flat Bowens',control:{wired:['DMX512','RDM'],wireless:['Bluetooth/App','CRMX via TimoLink RX'],builtInCRMX:false,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter plus Godox TimoLink RX for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/product-e/LITEMONS/LA600R-LA600Bi.html','https://godox.com/product-d/TimoLink.html','https://www.godox.com/app/']}}),
  fixture('godox-la600bi','LA600Bi','LITEMONS LA',2800,6500,null,null,LA600,'Bi-Color',{mount:'Flat Bowens',control:{wired:['DMX512','RDM'],wireless:['Bluetooth/App','CRMX via TimoLink RX'],builtInCRMX:false,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter plus Godox TimoLink RX for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/product-e/LITEMONS/LA600R-LA600Bi.html','https://godox.com/product-d/TimoLink.html','https://www.godox.com/app/']}}),
  fixture('godox-p600r-hard','P600R Hard','KNOWLED Panel',1800,10000,650,null,KNOWLED_CATALOG,'Full Color',{formFactor:'1x1 LED Panel',cri:96,tlci:96,control:{wired:['DMX512','RDM'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://cn.godox.com/product-a/P600RHard-P1200RHard.html','https://www.godox.com/app/']}}),
  fixture('godox-p1200r-hard','P1200R Hard','KNOWLED Panel',1800,10000,1200,null,KNOWLED_CATALOG,'Full Color',{formFactor:'2x1 LED Panel',cri:96,tlci:96,control:{wired:['DMX512','RDM'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://cn.godox.com/product-a/P600RHard-P1200RHard.html','https://www.godox.com/app/']}}),
  fixture('godox-f200bi','F200Bi','KNOWLED Flexible LED Mat',2700,8500,200,'IP65',F200BI,'Bi-Color',{formFactor:'Flexible LED Mat',cri:96,tlci:96,control:{wired:['DMX512'],wireless:['2.4G Remote','Bluetooth/App','CRMX via optional TimoLink RX'],builtInCRMX:false,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter plus Godox TimoLink RX for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/KNOWLED_F200Bi.pdf','https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf','https://godox.com/product-d/TimoLink.html']}}),
  fixture('godox-f400bi','F400Bi','KNOWLED Flexible LED Mat',2700,8500,400,'IP65',KNOWLED_CATALOG,'Bi-Color',{formFactor:'Flexible LED Mat',cri:96,tlci:96,control:{wired:['DMX512'],wireless:['2.4G Remote','Bluetooth/App','CRMX via optional TimoLink RX'],builtInCRMX:false,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter plus Godox TimoLink RX for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf','https://godox.com/product-d/TimoLink.html']}}),
  fixture('godox-f600bi','F600Bi','KNOWLED Flexible LED Mat',2700,8500,600,'IP65',KNOWLED_CATALOG,'Bi-Color',{formFactor:'Flexible LED Mat',cri:96,tlci:96,control:{wired:['DMX512'],wireless:['2.4G Remote','Bluetooth/App','CRMX via optional TimoLink RX'],builtInCRMX:false,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','CRMX transmitter plus Godox TimoLink RX for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf','https://godox.com/product-d/TimoLink.html']}}),
  fixture('godox-tp2r','TP2R','KNOWLED Pixel Tube',2000,10000,null,null,TP,'RGBWW',{formFactor:'2 ft Pixel Tube',cri:96,tlci:96,pixelZones:16,control:{wired:['DMX512 via DMX-C1','RDM via DMX-C1'],wireless:['CRMX','Bluetooth/App','2.4G Remote'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface plus Godox DMX-C1 adapter cable for DMX512/RDM control','CRMX transmitter for CRMX control','Compatible Godox 2.4GHz remote for 2.4GHz remote control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/static/upload/file/20230616/1686896173198685.pdf','https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf']},battery:'Built-in rechargeable'}),
  fixture('godox-tp4r','TP4R','KNOWLED Pixel Tube',2000,10000,null,null,TP,'RGBWW',{formFactor:'4 ft Pixel Tube',cri:96,tlci:96,pixelZones:32,control:{wired:['DMX512 via DMX-C1','RDM via DMX-C1'],wireless:['CRMX','Bluetooth/App','2.4G Remote'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface plus Godox DMX-C1 adapter cable for DMX512/RDM control','CRMX transmitter for CRMX control','Compatible Godox 2.4GHz remote for 2.4GHz remote control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/static/upload/file/20230616/1686896173198685.pdf','https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf']},battery:'Built-in rechargeable'}),
  fixture('godox-tp8r','TP8R','KNOWLED Pixel Tube',2000,10000,null,null,TP,'RGBWW',{formFactor:'8 ft Pixel Tube',cri:96,tlci:96,pixelZones:64,control:{wired:['DMX512 via DMX-C1','RDM via DMX-C1'],wireless:['CRMX','Bluetooth/App','2.4G Remote'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface plus Godox DMX-C1 adapter cable for DMX512/RDM control','CRMX transmitter for CRMX control','Compatible Godox 2.4GHz remote for 2.4GHz remote control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/static/upload/file/20230616/1686896173198685.pdf','https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf']},battery:'Built-in rechargeable'}),
  fixture('godox-mg1200bi','MG1200Bi','KNOWLED MG',2800,6500,1200,'IP65',MG1200BI,'Bi-Color',{mount:'G-Mount',cri:96,tlci:96,control:{wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],wireless:['CRMX','Bluetooth/App','2.4G Remote'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:['Art-Net','sACN'],externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control','CRMX transmitter for CRMX control','Compatible Godox 2.4GHz remote for 2.4GHz remote control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/KNOWLED_MG1200Bi.pdf','https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf']}}),
  fixture('godox-mg2400bi','MG2400Bi','KNOWLED MG',2800,6500,2600,'IP65',MG_CATALOG,'Bi-Color',{mount:'G-Mount',cri:96,tlci:96,control:{wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],wireless:['CRMX','Bluetooth/App','2.4G Remote'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:['Art-Net','sACN'],externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control','CRMX transmitter for CRMX control','Compatible Godox 2.4GHz remote for 2.4GHz remote control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf']}}),
  fixture('godox-mg1200r','MG1200R','KNOWLED MG',1800,10000,1600,'IP54',MG1200R,'Full Color',{mount:'G-Mount',cri:96,tlci:95,control:{wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:['Art-Net','sACN'],externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://godox.com/static/upload/file/20240930/1727662129225922.pdf']}}),
  fixture('godox-mg2400r','MG2400R','KNOWLED MG',1800,10000,2650,'IP54',MG2400R,'Full Color',{mount:'G-Mount',cri:96,tlci:95,control:{wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:['Art-Net','sACN'],externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/KNOWLED_MG2400R.pdf']}}),
  fixture('godox-ms60bi','MS60Bi','KNOWLED MS',2800,6500,60,null,MS60,'Bi-Color',{mount:'Godox Magnetic',cri:97,tlci:98,control:{wired:['DMX512','RDM'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/KNOWLED_MS60Bi.pdf','https://cn.godox.com/product-b/KNOWLED/MS60R-MS60Bi.html']},battery:'Removable fast-charging battery'}),
  fixture('godox-ms60r','MS60R','KNOWLED MS',1800,10000,60,null,MS60,'Full Color',{mount:'Godox Magnetic',cri:95,tlci:95,control:{wired:['DMX512','RDM'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://www.godox.com/Downloads/KNOWLED_MS60R.pdf','https://cn.godox.com/product-b/KNOWLED/MS60R-MS60Bi.html']},battery:'Removable fast-charging battery'}),
  fixture('godox-m200d','M200D','KNOWLED M',5600,5600,230,null,M200_M300,'Daylight',{mount:'Bowens',cri:96,tlci:97,control:{wired:['DMX512'],wireless:['2.4G Remote','Bluetooth/App'],builtInCRMX:false,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','Compatible Godox 2.4GHz remote for 2.4GHz remote control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://cn.godox.com/product-b/1585.html','https://www.godox.com/static/upload/file/20230608/1686187077668652.pdf','https://www.godox.com/Downloads/Godox_Continuous_Lighting_Catalogue_EN.pdf']}}),
  fixture('godox-m300d','M300D','KNOWLED M',5600,5600,330,null,M200_M300,'Daylight',{mount:'Bowens',cri:96,tlci:97,control:{wired:['DMX512'],wireless:['2.4G Remote','Bluetooth/App'],builtInCRMX:false,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','Compatible Godox 2.4GHz remote for 2.4GHz remote control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://cn.godox.com/product-b/1585.html','https://www.godox.com/static/upload/file/20230608/1686187077668652.pdf','https://www.godox.com/Downloads/Godox_Continuous_Lighting_Catalogue_EN.pdf']}}),
  fixture('godox-m200bi','M200Bi','KNOWLED M',2800,6500,230,null,M200_M300,'Bi-Color',{mount:'Bowens',cri:96,tlci:97,control:{wired:['DMX512'],wireless:['2.4G Remote','Bluetooth/App'],builtInCRMX:false,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','Compatible Godox 2.4GHz remote for 2.4GHz remote control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://cn.godox.com/product-b/1585.html','https://www.godox.com/static/upload/file/20230608/1686187077668652.pdf','https://www.godox.com/Downloads/Godox_Continuous_Lighting_Catalogue_EN.pdf']}}),
  fixture('godox-m300bi','M300Bi','KNOWLED M',2800,6500,360,null,M200_M300,'Bi-Color',{mount:'Bowens',cri:96,tlci:97,control:{wired:['DMX512'],wireless:['2.4G Remote','Bluetooth/App'],builtInCRMX:false,builtInBluetooth:true,directLightingAI:[],externalInterfaceRequired:['Wired DMX interface for DMX512 control','Compatible Godox 2.4GHz remote for 2.4GHz remote control'],unavailableDirectProtocols:['Godox Bluetooth app and 2.4GHz remote protocols are not publicly documented for third-party direct control'],sourceUrls:['https://cn.godox.com/product-b/1585.html','https://www.godox.com/static/upload/file/20230608/1686187077668652.pdf','https://www.godox.com/Downloads/Godox_Continuous_Lighting_Catalogue_EN.pdf']}}),
  fixture('godox-p300r','P300R','KNOWLED Panel',1800,10000,350,null,P300R,'Full Color',{formFactor:'LED Panel',cri:96,tlci:96,control:{wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:['Art-Net','sACN'],externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://cn.godox.com/product-b/P300R-P600R.html']}}),
  fixture('godox-p600r','P600R','KNOWLED Panel',1800,10000,700,null,P600R,'Full Color',{formFactor:'LED Panel',cri:96,tlci:96,control:{wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,builtInBluetooth:true,directLightingAI:['Art-Net','sACN'],externalInterfaceRequired:['Wired DMX interface for DMX512/RDM control','CRMX transmitter for CRMX control'],unavailableDirectProtocols:['Godox Bluetooth app protocol is not publicly documented for third-party direct control'],sourceUrls:['https://cn.godox.com/product-b/P300R-P600R.html']}}),
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
  fixture('godox-tl180','TL180','RGBWW Tube Light',2700,6500,55,null,TL_SERIES,'RGBWW',{formFactor:'180cm Tube Light',cri:96,tlci:98,control:['DMX','2.4G Remote','Bluetooth/App','On-board'],battery:'Built-in rechargeable'}),
  fixture('godox-lp400r','LP400R','LITEMONS LP',1800,10000,36,null,LP_SERIES,'Full Color',{formFactor:'LED Panel',cri:96,tlci:96,control:['Bluetooth/App','On-board'],battery:'NP-F optional'}),
  fixture('godox-lp600r','LP600R','LITEMONS LP',1800,10000,60,null,LP_SERIES,'Full Color',{formFactor:'LED Panel',cri:96,tlci:96,control:['Bluetooth/App','On-board'],battery:'NP-F optional'}),
  fixture('godox-lp1200r','LP1200R','LITEMONS LP',1800,10000,120,null,LP_SERIES,'Full Color',{formFactor:'LED Panel',cri:96,tlci:96,control:['Bluetooth/App','On-board'],battery:'V-mount optional'}),
  fixture('godox-lp400bi','LP400Bi','LITEMONS LP',2800,6500,36,null,LP_SERIES,'Bi-Color',{formFactor:'LED Panel',cri:96,tlci:96,control:['Bluetooth/App','On-board'],battery:'NP-F optional'}),
  fixture('godox-lp600bi','LP600Bi','LITEMONS LP',2800,6500,60,null,LP_SERIES,'Bi-Color',{formFactor:'LED Panel',cri:96,tlci:96,control:['Bluetooth/App','On-board'],battery:'NP-F optional'}),
  fixture('godox-lp1200bi','LP1200Bi','LITEMONS LP',2800,6500,120,null,LP_SERIES,'Bi-Color',{formFactor:'LED Panel',cri:96,tlci:96,control:['Bluetooth/App','On-board'],battery:'V-mount optional'}),
  fixture('godox-lc500r','LC500R','Light Stick',2500,8500,23,null,LC_SERIES,'RGBWW',{formFactor:'Handheld Light Stick',cri:96,tlci:98,control:['2.4G Remote','Bluetooth/App','On-board'],battery:'Built-in rechargeable'}),
  fixture('godox-lc500bi','LC500Bi','Light Stick',2800,6500,23,null,LC_SERIES,'Bi-Color',{formFactor:'Handheld Light Stick',cri:96,tlci:98,control:['2.4G Remote','Bluetooth/App','On-board'],battery:'Built-in rechargeable'}),
  fixture('godox-lc500mini','LC500 mini','Light Stick',2500,8500,20,null,LC_MINI_SERIES,'Bi-Color',{formFactor:'Compact Handheld Light Stick',cri:95,tlci:96,control:['Bluetooth/App','On-board'],battery:'Replaceable battery grip'}),
  fixture('godox-lc500rmini','LC500R mini','Light Stick',2500,8500,20,null,LC_MINI_SERIES,'RGBWW',{formFactor:'Compact Handheld Light Stick',cri:95,tlci:96,control:['Bluetooth/App','On-board'],battery:'Replaceable battery grip'}),
  fixture('godox-lc1000bi','LC1000Bi','Light Stick',2500,8500,100,null,LC1000_SERIES,'Bi-Color',{formFactor:'High-output Handheld Light Stick',cri:96,tlci:96,control:['Bluetooth/App','On-board'],battery:'Built-in 72.6Wh lithium battery'}),
  fixture('godox-lc1000r','LC1000R','Light Stick',2500,8500,100,null,LC1000_SERIES,'RGBWW',{formFactor:'High-output Handheld Light Stick',cri:96,tlci:96,control:['Bluetooth/App','On-board'],battery:'Built-in 72.36Wh lithium battery'}),
  fixture('godox-ldx50r','LDX50R','LDX Panel',2500,10000,63,null,LDX_SERIES,'RGBWW',{formFactor:'LED Panel',cri:96,tlci:96,control:['2.4G Remote','Bluetooth/App','DMX512','On-board']}),
  fixture('godox-ldx100r','LDX100R','LDX Panel',2500,10000,118,null,LDX_SERIES,'RGBWW',{formFactor:'LED Panel',cri:96,tlci:96,control:['2.4G Remote','Bluetooth/App','DMX512','On-board']}),
  fixture('godox-ldx50bi','LDX50Bi','LDX Panel',2800,6500,65,null,LDX_SERIES,'Bi-Color',{formFactor:'LED Panel',cri:96,tlci:96,control:['2.4G Remote','Bluetooth/App','DMX512','On-board']}),
  fixture('godox-ldx100bi','LDX100Bi','LDX Panel',2800,6500,120,null,LDX_SERIES,'Bi-Color',{formFactor:'LED Panel',cri:96,tlci:96,control:['2.4G Remote','Bluetooth/App','DMX512','On-board']}),
  fixture('godox-ldp8d','LDP8D','LDP Panel',5600,5600,10,null,LDP_SERIES,'Daylight',{formFactor:'Compact LED Panel',control:['On-board'],powerSupply:'DC / NP-F battery'}),
  fixture('godox-ldp18d','LDP18D','LDP Panel',5600,5600,21,null,LDP_SERIES,'Daylight',{formFactor:'LED Panel',control:['On-board'],powerSupply:'DC / NP-F battery'}),
  fixture('godox-ldp8bi','LDP8Bi','LDP Panel',2800,6500,10,null,LDP_SERIES,'Bi-Color',{formFactor:'Compact LED Panel',control:['On-board'],powerSupply:'DC / NP-F battery'}),
  fixture('godox-ldp18bi','LDP18Bi','LDP Panel',2800,6500,22,null,LDP_SERIES,'Bi-Color',{formFactor:'LED Panel',control:['On-board'],powerSupply:'DC / NP-F battery'}),
  fixture('godox-ml100bi','ML100Bi','ML Portable COB',2800,6500,110,null,ML100_SERIES,'Bi-Color',{mount:'Godox Mount',formFactor:'Portable COB',cri:96,tlci:97,control:['Bluetooth/App','On-board'],powerSupply:'DC / USB-C power bank / V-mount battery'}),
  fixture('godox-ml100r','ML100R','ML Portable COB',1800,10000,110,null,ML100_SERIES,'Full Color',{mount:'Godox Mount',formFactor:'Portable COB',cri:95,tlci:95,control:['Bluetooth/App','On-board'],powerSupply:'DC / mobile battery options'}),
  fixture('godox-sl60iid','SL60IID','SL COB',5600,5600,70,null,SL60II,'Daylight',{mount:'Bowens',cri:96,tlci:97,control:['2.4G Remote','Bluetooth/App','On-board']}),
  fixture('godox-sl60iibi','SL60IIBi','SL COB',2800,6500,75,null,SL60II,'Bi-Color',{mount:'Bowens',cri:96,tlci:97,control:['2.4G Remote','Bluetooth/App','On-board']}),
  fixture('godox-sl100d','SL100D','SL COB',5600,5600,100,null,SL100,'Daylight',{mount:'Bowens',cri:96,tlci:97,control:['2.4G Remote','Bluetooth/App','On-board']}),
  fixture('godox-sl100bi','SL100Bi','SL COB',2800,6500,100,null,SL100,'Bi-Color',{mount:'Bowens',cri:96,tlci:97,control:['2.4G Remote','Bluetooth/App','On-board']}),
  fixture('godox-sl150iii','SL150III','SL COB',5600,5600,160,null,SL_SERIES,'Daylight',{mount:'Bowens',cri:96,tlci:97,control:['2.4G Remote','Bluetooth/App','On-board']}),
  fixture('godox-sl200iii','SL200III','SL COB',5600,5600,215,null,SL_SERIES,'Daylight',{mount:'Bowens',cri:96,tlci:97,control:['2.4G Remote','Bluetooth/App','On-board']}),
  fixture('godox-sl300iii','SL300III','SL COB',5600,5600,330,null,SL_SERIES,'Daylight',{mount:'Bowens',cri:96,tlci:97,control:['2.4G Remote','Bluetooth/App','On-board']}),
  fixture('godox-sl150iiibi','SL150IIIBi','SL COB',2800,6500,160,null,SL_SERIES,'Bi-Color',{mount:'Bowens',cri:96,tlci:97,control:['2.4G Remote','Bluetooth/App','On-board']}),
  fixture('godox-sl200iiibi','SL200IIIBi','SL COB',2800,6500,215,null,SL_SERIES,'Bi-Color',{mount:'Bowens',cri:96,tlci:97,control:['2.4G Remote','Bluetooth/App','On-board']}),
  fixture('godox-sl300iiibi','SL300IIIBi','SL COB',2800,6500,330,null,SL_SERIES,'Bi-Color',{mount:'Bowens',cri:96,tlci:97,control:['2.4G Remote','Bluetooth/App','On-board']})
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
const lpSmall=['godox-lp400r','godox-lp600r','godox-lp400bi','godox-lp600bi'];
const lp1200=['godox-lp1200r','godox-lp1200bi'];
const lpAll=[...lpSmall,...lp1200];
const lcSeries=['godox-lc500r','godox-lc500bi'];
const lcMini=['godox-lc500mini','godox-lc500rmini'];
const lc1000=['godox-lc1000bi','godox-lc1000r'];
const ldxAll=['godox-ldx50r','godox-ldx100r','godox-ldx50bi','godox-ldx100bi'];
const ldpAll=['godox-ldp8d','godox-ldp18d','godox-ldp8bi','godox-ldp18bi'];
const ml100=['godox-ml100bi','godox-ml100r'];
const slCob=['godox-sl60iid','godox-sl60iibi','godox-sl100d','godox-sl100bi','godox-sl150iii','godox-sl200iii','godox-sl300iii','godox-sl150iiibi','godox-sl200iiibi','godox-sl300iiibi'];
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
  acc('godox-tl-carrying-kit','TL Series Multi-Light Carrying Kit','Transport',tlAll,TL_SERIES,'Supports grouped transport and production deployment of multiple TL fixtures.'),
  acc('godox-lp-barndoors','LP Series Detachable 4-Leaf Barndoors','Barn Door',lpAll,LP_SERIES,'Shapes and cuts spill from the LP panel output.'),
  acc('godox-lp-npf-power','NP-F Battery Power Option','Power',lpSmall,LP_SERIES,'Provides portable battery operation for LP400 and LP600 models.'),
  acc('godox-lp-vmount-power','V-Mount Battery Power Option','Power',lp1200,LP_SERIES,'Provides portable battery operation for LP1200 models.'),
  acc('godox-lp-carry-case','LP Series Carry Case','Transport',lpAll,LP_SERIES,'Protects and transports LP fixtures and kit accessories.'),
  acc('godox-lc-barndoors','LC Series 2-Leaf Barndoors','Barn Door',lcSeries,LC_SERIES,'Adds simple spill control to the handheld light stick.'),
  acc('godox-lc-handle','LC Series Handgrip','Mounting',lcSeries,LC_SERIES,'Improves handheld use and mounting flexibility.'),
  acc('godox-lc-charger','LC Series Charger','Charging',lcSeries,LC_SERIES,'Charges the built-in battery between setups.'),
  acc('godox-lc-carry-bag','LC Series Carry Bag','Transport',lcSeries,LC_SERIES,'Protects the light stick and accessories in transport.'),
  acc('godox-lc-d01','LC-D01 Diffuser','Diffusion',lcMini,LC_MINI_SERIES,'Softens LC500 mini and LC500R mini output for close portrait and practical work.'),
  acc('godox-bg01','BG01 Battery Grip','Power',lcMini,LC_MINI_SERIES,'Replaceable battery handle for longer handheld runtime.'),
  acc('godox-lc1000-usbc','USB-C 100W Charging Cable','Charging',lc1000,LC1000_SERIES,'Supports high-power USB-C charging for the LC1000 series.'),
  acc('godox-lc1000-dc','LC1000 DC Adapter','Power',lc1000,LC1000_SERIES,'Provides continuous DC power for studio operation.'),
  acc('godox-ldx-barndoors','LDX Series Barndoors','Barn Door',ldxAll,LDX_SERIES,'Shapes and limits spill from the LDX panel output.'),
  acc('godox-ldx-softbox','LDX Series Softbox','Softbox',ldxAll,LDX_SERIES,'Softens the LDX panel output for close and interview work.'),
  acc('godox-ldx-grid','LDX Series Grid','Grid',ldxAll,LDX_SERIES,'Adds directional control and reduces spill.'),
  acc('godox-rc-a6ii-ldx','RC-A6II Remote Control','Remote Control',ldxAll,LDX_SERIES,'Provides compatible 2.4GHz remote operation for the LDX series.'),
  acc('godox-ldp-npf-power','NP-F Battery Power Option','Power',ldpAll,LDP_SERIES,'Provides portable NP-F battery operation for the LDP panel family.'),
  acc('godox-ldp-dc-power','LDP DC Power Supply','Power',ldpAll,LDP_SERIES,'Provides continuous DC power for studio and desktop use.'),
  acc('godox-ml-l15','ML-L15 Lens Reflector 15°','Reflector',ml100,ML100_SERIES,'Creates a tighter, higher-intensity beam from the ML100 system.'),
  acc('godox-ml-l36','ML-L36 Lens Reflector 36°','Reflector',ml100,ML100_SERIES,'Provides a wider lens-reflector beam for general key and fill work.'),
  acc('godox-ml-bowens-adapter','ML Bowens Mount Adapter','Mounting',ml100,ML100_SERIES,'Expands the compact Godox-mount light to standard Bowens modifiers.'),
  acc('godox-ak-b02','AK-B02 V-Mount Battery Accessory Kit','Power',['godox-ml100bi'],ML100_SERIES,'Supports mobile V-mount battery operation for ML100Bi.'),
  acc('godox-bg02','BG02 Battery Grip','Power',['godox-ml100r'],ML100_SERIES,'Provides a compact mobile power option for ML100R.'),
  acc('godox-ml-air-soft-tube','ML100R Air Soft Tube','Diffusion',['godox-ml100r'],ML100_SERIES,'Creates a larger diffused source while staying portable.'),
  acc('godox-sl-standard-reflector','Bowens Standard Reflector','Reflector',slCob,SL_SERIES,'Provides the standard hard reflector beam for the SL COB family.'),
  acc('godox-sl-qr-p','QR-P70/P90/P120 Parabolic Softbox','Softbox',slCob,SL_SERIES,'Creates a soft directional source using Bowens mount.'),
  acc('godox-sl-cs-d','CS-50D/65D/85D Lantern Softbox','Lantern',slCob,SL_SERIES,'Creates broad omnidirectional soft light for room and overhead setups.'),
  acc('godox-sl-bowens-softbox','Bowens Mount Softbox','Softbox',slCob,SL_SERIES,'Adds general-purpose diffusion with broad Bowens compatibility.')
];
