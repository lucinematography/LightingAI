// Current Godox Bluetooth-capable fixtures missing from the legacy continuous-light library.
// Each fixture is backed by an exact-model first-party Godox product page or manual.
// Transport capability only: proprietary Bluetooth command/session semantics remain fail-closed.

const PRIVATE_BLUETOOTH_LIMIT='Godox Bluetooth app/session protocol is proprietary and not publicly documented for third-party direct control';

function control(sourceUrl,{wired=[],wireless=['Bluetooth/App'],builtInCRMX=false,direct=[],external=[]}={}){
  return {
    wired,wireless,builtInCRMX,builtInBluetooth:true,
    directLightingAI:direct,
    externalInterfaceRequired:external,
    unavailableDirectProtocols:[PRIVATE_BLUETOOTH_LIMIT],
    sourceUrls:[sourceUrl]
  };
}
function fixture(id,model,family,cctMin,cctMax,sourceUrl,colorMode,formFactor,extra={}){
  return {
    id,manufacturer:'Godox',model,family,category:'Light',
    sourceType:'LED Continuous Light',formFactor,
    cctK:{min:cctMin,max:cctMax},colorMode,sourceUrl,...extra
  };
}
const bt=(s)=>control(s);
const dmxBt=(s,external='Wired DMX interface for DMX512/RDM control')=>control(s,{wired:['DMX512','RDM'],external:[external]});
const proBt=(s)=>control(s,{
  wired:['DMX512','RDM','Ethernet Art-Net','Ethernet sACN'],
  wireless:['CRMX','Bluetooth/App'],
  builtInCRMX:true,
  direct:['Art-Net','sACN'],
  external:['Wired DMX interface for DMX512 control','CRMX transmitter for CRMX control']
});
const extCrmxBt=(s,label)=>control(s,{
  wired:['DMX512','RDM'],wireless:['Bluetooth/App',label],
  external:['Wired DMX interface for DMX512 control','Compatible TimoLink interface for CRMX control']
});

const ML40='https://godox.com/product-e/LED/ML40Bi-ML40R.html';
const ML80='https://www.godox.com/product-e/LED/ML80Bi-ML150Bi.html';
const RS60='https://www.godox.com/product-b/RS60Bi-RS60R.html';
const RS100='https://www.godox.com/product-e/LED/RS100Bi-RS100R.html';
const LP800='https://www.godox.com/product-e/LITEMONS/LP800Bi.html';
const FL15='https://www.godox.com/product-e/LED/FL15Bi.html';
const FH50='https://www.godox.com/product-a/FH50Bi-FH50R.html';
const LEBI='https://godox.com/product-e/LITEMONS/LE200Bi-LE300Bi-LE600Bi.html';
const LER='https://www.godox.com/product-e/LITEMONS/LE200R-LE300R-LE600R.html';
const ML150RF='https://www.godox.com/product-e/ML150RF.html';
const SLRF='https://godox.com/product-e/SL200RF-SL300RF.html';
const FLR='https://www.godox.com/product-e/FL100R-FL200R-FL200SR.html';
const UP150='https://www.godox.com/product-e/UP150R.html';
const PLRF='https://cn.godox.com/product-e/KNOWLED/PL600RF-PL1200RF.html';
const MA5='https://www.godox.com/product-a/MA5R.html';
const LCAIR='https://www.godox.com/product-e/LED/LC500RAir-LR150Air.html';
const AM800='https://cn.godox.com/product-e/KNOWLED/AM800R.html';
const AM1600='https://cn.godox.com/product-e/KNOWLED/AM1600R.html';
const MG4K='https://www.godox.com/Downloads/KNOWLED_MG4K.pdf';
const MG4KR='https://www.godox.com/Downloads/KNOWLED_MG4KR.pdf';
const MG6K='https://www.godox.com/Downloads/KNOWLED_MG6K.pdf';
const P600PRO='https://www.godox.com/Downloads/P600R_Hard_PRO.pdf';
const P1200PRO='https://www.godox.com/Downloads/Godox_KNOWLED_Lighting_Catalogue_EN.pdf';
const C30R='https://www.godox.com/product-e/LITEMONS/C30Bi-C30R.html';
const SR20R='https://godox.com/product-e/LITEMONS/SR20R.html';

export const GODOX_CURRENT_WIRELESS_FIXTURES=[
  fixture('godox-ml40bi','ML40Bi','ML Portable COB',2800,6500,ML40,'Bi-Color','Spotlight / Monolight',{cri:96,tlci:96,control:bt(ML40)}),
  fixture('godox-ml40r','ML40R','ML Portable COB',1800,10000,ML40,'Full Color','Spotlight / Monolight',{cri:95,tlci:95,control:bt(ML40)}),
  fixture('godox-ml80bi','ML80Bi','ML Portable COB',2800,6500,ML80,'Bi-Color','Spotlight / Monolight',{cri:96,tlci:96,control:bt(ML80)}),
  fixture('godox-ml150bi','ML150Bi','ML Portable COB',2800,6500,ML80,'Bi-Color','Spotlight / Monolight',{cri:96,tlci:96,control:dmxBt(ML80)}),
  fixture('godox-rs60bi','RS60Bi','RS Portable COB',2800,6500,RS60,'Bi-Color','Spotlight / Monolight',{cri:97,tlci:98,control:dmxBt(RS60)}),
  fixture('godox-rs60r','RS60R','RS Portable COB',1800,10000,RS60,'Full Color','Spotlight / Monolight',{cri:95,tlci:95,control:dmxBt(RS60)}),
  fixture('godox-rs100bi','RS100Bi','RS Portable COB',2800,6500,RS100,'Bi-Color','Spotlight / Monolight',{cri:98,tlci:98,control:dmxBt(RS100,'Godox DMX-C2 adapter/interface for wired DMX/RDM control')}),
  fixture('godox-rs100r','RS100R','RS Portable COB',1800,10000,RS100,'Full Color','Spotlight / Monolight',{cri:95,tlci:95,control:dmxBt(RS100,'Godox DMX-C2 adapter/interface for wired DMX/RDM control')}),
  fixture('godox-lp800bi','LP800Bi','LITEMONS LP Panel',2800,6500,LP800,'Bi-Color','Panel',{cri:96,tlci:98,control:bt(LP800)}),
  fixture('godox-fl15bi','FL15Bi','FL Portable Light',2800,6500,FL15,'Bi-Color','Pocket / Handheld',{powerW:15,ipRating:'IP54',cri:97,tlci:98,control:bt(FL15)}),
  fixture('godox-fh50bi','FH50Bi','FH Flexible Panel',2800,6500,FH50,'Bi-Color','Flexible Panel / Mat',{powerW:62,cri:97,tlci:97,control:control(FH50,{wireless:['2.4G Wireless','Bluetooth/App'],external:['Compatible Godox 2.4GHz remote for 2.4GHz wireless control']})}),
  fixture('godox-fh50r','FH50R','FH Flexible Panel',2500,10000,FH50,'Full Color','Flexible Panel / Mat',{powerW:62,cri:96,tlci:96,control:control(FH50,{wireless:['2.4G Wireless','Bluetooth/App'],external:['Compatible Godox 2.4GHz remote for 2.4GHz wireless control']})}),
  fixture('godox-le200bi','LE200Bi','LITEMONS LE COB',2800,6500,LEBI,'Bi-Color','Spotlight / Monolight',{powerW:220,cri:98,tlci:98,control:extCrmxBt(LEBI,'CRMX via TimoLink RX')}),
  fixture('godox-le300bi','LE300Bi','LITEMONS LE COB',2800,6500,LEBI,'Bi-Color','Spotlight / Monolight',{powerW:315,cri:98,tlci:98,control:extCrmxBt(LEBI,'CRMX via TimoLink RX')}),
  fixture('godox-le600bi','LE600Bi','LITEMONS LE COB',2800,6500,LEBI,'Bi-Color','Spotlight / Monolight',{powerW:610,cri:97,tlci:99,control:extCrmxBt(LEBI,'CRMX via TimoLink RX')}),
  fixture('godox-le200r','LE200R','LITEMONS LE COB',1800,10000,LER,'Full Color','Spotlight / Monolight',{cri:96,tlci:95,control:dmxBt(LER)}),
  fixture('godox-le300r','LE300R','LITEMONS LE COB',1800,10000,LER,'Full Color','Spotlight / Monolight',{cri:96,tlci:95,control:dmxBt(LER)}),
  fixture('godox-le600r','LE600R','LITEMONS LE COB',1800,10000,LER,'Full Color','Spotlight / Monolight',{cri:96,tlci:95,control:dmxBt(LER)}),
  fixture('godox-ml150rf','ML150 RF','PaletteLab ML',1800,10000,ML150RF,'Full Color','Spotlight / Monolight',{powerW:165,cri:96,tlci:96,control:extCrmxBt(ML150RF,'CRMX via TimoLink')}),
  fixture('godox-sl200rf','SL200 RF','PaletteLab SL',1800,10000,SLRF,'Full Color','Spotlight / Monolight',{powerW:230,cri:98,tlci:99,control:extCrmxBt(SLRF,'CRMX via TimoLink TRX')}),
  fixture('godox-sl300rf','SL300 RF','PaletteLab SL',1800,10000,SLRF,'Full Color','Spotlight / Monolight',{powerW:330,cri:98,tlci:99,control:extCrmxBt(SLRF,'CRMX via TimoLink TRX')}),
  fixture('godox-fl100r','FL100R','FL Full-Color Flexible Mat',1800,10000,FLR,'Full Color','Flexible Panel / Mat',{cri:95,tlci:95,control:dmxBt(FLR,'Godox DMX-TRS1 adapter cable for wired DMX/RDM control')}),
  fixture('godox-fl200r','FL200R','FL Full-Color Flexible Mat',1800,10000,FLR,'Full Color','Flexible Panel / Mat',{cri:95,tlci:95,control:dmxBt(FLR,'Godox DMX-TRS1 adapter cable for wired DMX/RDM control')}),
  fixture('godox-fl200sr','FL200SR','FL Full-Color Flexible Mat',1800,10000,FLR,'Full Color','Flexible Panel / Mat',{cri:95,tlci:95,control:dmxBt(FLR,'Godox DMX-TRS1 adapter cable for wired DMX/RDM control')}),
  fixture('godox-up150r','UP150R','LiteWafer Panel',1800,10000,UP150,'Full Color','Panel',{cri:97,tlci:98,control:dmxBt(UP150)}),
  fixture('godox-pl600rf','PL600 RF','PaletteLab KNOWLED',1800,10000,PLRF,'Full Color','Spotlight / Monolight',{ipRating:'IP65',cri:98,tlci:99,control:proBt(PLRF)}),
  fixture('godox-pl1200rf','PL1200 RF','PaletteLab KNOWLED',1800,10000,PLRF,'Full Color','Spotlight / Monolight',{ipRating:'IP65',cri:98,tlci:99,control:proBt(PLRF)}),
  fixture('godox-ma5r','MA5R','MA Smartphone Light',1800,10000,MA5,'Full Color','Pocket / Handheld',{powerW:5,cri:95,tlci:97,control:bt(MA5)}),
  fixture('godox-lc500r-air','LC500R Air','LC Air Light Stick',2800,10000,LCAIR,'Full Color','Pocket / Handheld',{cri:96,tlci:98,control:bt(LCAIR)}),
  fixture('godox-lr150-air','LR150 Air','LR Air Ring Light',2800,6500,LCAIR,'Bi-Color','Ring Light',{cri:97,tlci:98,control:bt(LCAIR)}),
  fixture('godox-am800r','AM800R 44K','KNOWLED Air Mat',1800,10000,AM800,'Full Color','Flexible Panel / Mat',{powerW:800,ipRating:'IP65',cri:96,tlci:98,control:proBt(AM800)}),
  fixture('godox-am1600r','AM1600R','KNOWLED Air Mat',1800,10000,AM1600,'Full Color','Flexible Panel / Mat',{powerW:1800,ipRating:'IP54',cri:96,tlci:97,control:proBt(AM1600)}),
  fixture('godox-mg4k','MG4K','KNOWLED MG',2800,10000,MG4K,'Bi-Color','Spotlight / Monolight',{ipRating:'IP65',cri:97,tlci:98,control:proBt(MG4K)}),
  fixture('godox-mg4kr','MG4KR','KNOWLED MG',1800,10000,MG4KR,'Full Color','Spotlight / Monolight',{ipRating:'IP65',cri:97,tlci:96,control:proBt(MG4KR)}),
  fixture('godox-mg6k','MG6K','KNOWLED MG',2800,10000,MG6K,'Bi-Color','Spotlight / Monolight',{ipRating:'IP54',cri:97,tlci:97,control:proBt(MG6K)}),
  fixture('godox-p600r-hard-pro','P600R Hard Pro','KNOWLED Hard Panel',1800,10000,P600PRO,'Full Color','Panel',{ipRating:'IP65',cri:95,tlci:96,control:control(P600PRO,{wired:['DMX512','RDM'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,external:['Wired DMX interface for DMX512 control','CRMX transmitter for CRMX control']})}),
  fixture('godox-p1200r-hard-pro','P1200R Hard Pro','KNOWLED Hard Panel',1800,10000,P1200PRO,'Full Color','Panel',{ipRating:'IP65',cri:96,tlci:98,control:control(P1200PRO,{wired:['DMX512','RDM'],wireless:['CRMX','Bluetooth/App'],builtInCRMX:true,external:['Wired DMX interface for DMX512 control','CRMX transmitter for CRMX control']})}),
  fixture('godox-c30r','C30R','LITEMONS C30 Panel',1800,10000,C30R,'Full Color','Pocket / Handheld',{cri:96,tlci:97,control:bt(C30R)}),
  fixture('godox-sr20r','SR20R','LITEMONS SR Panel',2800,6500,SR20R,'Full Color','Panel',{cri:96,tlci:96,control:bt(SR20R)})
];
