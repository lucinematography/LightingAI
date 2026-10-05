// YONGNUO exact-model Bluetooth coverage.
// First-party YONGNUO manuals/product pages only.
// Bluetooth app transport is separated from YONGNUO 2.4G RF control.
// Proprietary command/session semantics remain fail-closed.
const SRC={
  yn150:'https://th.hkyongnuo.com/u_file/2408/05/file/YN150SeriesUserManual.pdf',
  yn216ii:'https://th.hkyongnuo.com/products/yn216-ii',
  yn300iii:'https://www.th.hkyongnuo.com/products/yn300-iii',
  yn600lii:'https://www.th.hkyongnuo.com/products/yn600l-ii',
  app:'https://www.hkyongnuo.com/app'
};

function bluetoothControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via YONGNUO App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'YONGNUO documents Bluetooth app transport, but LightingAI command/session semantics are not production-verified',
      'YONGNUO 2.4G RF control is not classified as Bluetooth'
    ],
    sourceUrls:[sourceUrl,SRC.app],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'YONGNUO App Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.app],
        note:'First-party YONGNUO documentation explicitly confirms Bluetooth app control for this exact model/variant. 2.4G RF remains a separate transport. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,cctK,powerDrawW,colorMode){
  return {
    id,
    manufacturer:'YONGNUO',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    cctK,
    colorMode,
    powerDrawW,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const YONGNUO_BLUETOOTH_FIXTURES=[
  fixture('yongnuo-yn150','YN150','YN150 Series','Bi-Color COB LED','COB / Monolight',SRC.yn150,{min:3200,max:5600},150,'Bi-Color'),
  fixture('yongnuo-yn216-ii','YN216 II','YN216 Series','Bi-Color LED Panel','Panel',SRC.yn216ii,{min:2700,max:8000},24,'Bi-Color'),
  fixture('yongnuo-yn300-iii-bicolor','YN300 III Bi-Color','YN300 Series','Bi-Color LED Panel','Panel',SRC.yn300iii,{min:3200,max:5600},18,'Bi-Color'),
  fixture('yongnuo-yn600l-ii-bicolor','YN600L II Bi-Color','YN600L Series','Bi-Color LED Panel','Panel',SRC.yn600lii,{min:3200,max:5600},36,'Bi-Color')
];
