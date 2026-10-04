// ZHIYUN exact-model Bluetooth / ZY Vega coverage.
// First-party ZHIYUN product/specification sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  g60:'https://www.zhiyun-tech.com/en/product/param/757',
  g200:'https://www.zhiyun-tech.com/en/product/param/816',
  g300:'https://www.zhiyun-tech.com/en/product/param/934',
  bSeries:'https://www.zhiyun-tech.com/en/product/param/924',
  x60:'https://www.zhiyun-tech.com/en/product/param/901',
  x100:'https://store.zhiyun-tech.com/products/molus-x100',
  x100rgb:'https://www.zhiyun-tech.com/en/product/param/1077',
  x200:'https://www.zhiyun-tech.com/en/product/param/1099',
  m60Ultra:'https://www.zhiyun-tech.com/en/product/param/1132',
  cx50:'https://www.zhiyun-tech.com/en/product/param/1055'
};

function bluetoothControl(sourceUrl,family='ZHIYUN Bluetooth app / ZY Vega'){
  return {
    wired:[],
    wireless:['Bluetooth app control (ZY Vega)'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'ZHIYUN documents Bluetooth app control, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family,
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl],
        note:'First-party ZHIYUN documentation confirms Bluetooth app control. LightingAI command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,sourceUrl,cctK,colorMode,powerDrawW,formFactor='Spotlight / Monolight'){
  return {
    id,manufacturer:'ZHIYUN',model,family,category:'Light',
    sourceType,formFactor,cctK,colorMode,powerDrawW,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const ZHIYUN_BLUETOOTH_FIXTURES=[
  fixture('zhiyun-molus-g60','MOLUS G60','MOLUS G','Bi-Color COB LED Light',SRC.g60,{min:2700,max:6500},'Bi-Color',60),
  fixture('zhiyun-molus-g200','MOLUS G200','MOLUS G','Bi-Color COB LED Light',SRC.g200,{min:2700,max:6500},'Bi-Color',200),
  fixture('zhiyun-molus-g300','MOLUS G300','MOLUS G','Bi-Color COB LED Light',SRC.g300,{min:2700,max:6500},'Bi-Color',300),

  fixture('zhiyun-molus-b100','MOLUS B100','MOLUS B','Bi-Color COB LED Light',SRC.bSeries,{min:2700,max:6500},'Bi-Color',100),
  fixture('zhiyun-molus-b200','MOLUS B200','MOLUS B','Bi-Color COB LED Light',SRC.bSeries,{min:2700,max:6500},'Bi-Color',200),
  fixture('zhiyun-molus-b300','MOLUS B300','MOLUS B','Bi-Color COB LED Light',SRC.bSeries,{min:2700,max:6500},'Bi-Color',300),
  fixture('zhiyun-molus-b500','MOLUS B500','MOLUS B','Bi-Color COB LED Light',SRC.bSeries,{min:2700,max:6500},'Bi-Color',500),

  fixture('zhiyun-molus-x60','MOLUS X60','MOLUS X','Bi-Color COB LED Light',SRC.x60,{min:2700,max:6500},'Bi-Color',60),
  fixture('zhiyun-molus-x60-rgb','MOLUS X60 RGB','MOLUS X','Full-Color RGB COB LED Light',SRC.x60,{min:2700,max:6500},'RGB Full Color',60),
  fixture('zhiyun-molus-x100','MOLUS X100','MOLUS X','Bi-Color COB LED Light',SRC.x100,{min:2700,max:6500},'Bi-Color',100),
  fixture('zhiyun-molus-x100-rgb','MOLUS X100 RGB','MOLUS X','Full-Color RGB COB LED Light',SRC.x100rgb,{min:2500,max:10000},'RGB Full Color',100),
  fixture('zhiyun-molus-x200','MOLUS X200','MOLUS X','Bi-Color COB LED Light',SRC.x200,{min:2700,max:6500},'Bi-Color',200),
  fixture('zhiyun-molus-x200-rgb','MOLUS X200 RGB','MOLUS X','Full-Color RGB COB LED Light',SRC.x200,{min:2500,max:10000},'RGB Full Color',200),

  fixture('zhiyun-fiveray-m60-ultra','FIVERAY M60 Ultra','FIVERAY','Full-Color RGB LED Pocket Light',SRC.m60Ultra,{min:2500,max:10000},'RGB Full Color',60,'Pocket / Handheld'),

  fixture('zhiyun-cinepeer-cx50','CINEPEER CX50','CINEPEER CX','Bi-Color COB LED Light',SRC.cx50,{min:2700,max:6500},'Bi-Color',50),
  fixture('zhiyun-cinepeer-cx50-rgb','CINEPEER CX50 RGB','CINEPEER CX','Full-Color RGB COB LED Light',SRC.cx50,{min:2700,max:6500},'RGB Full Color',50)
];
