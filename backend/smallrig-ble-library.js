// SmallRig exact-model BLE lighting coverage.
// First-party SmallRig manuals/product pages only.
// BLE evidence is transport-capability-only; proprietary command semantics remain fail-closed.
const SRC={
  rc100b:'https://www.smallrig.com/RC-100B-COB-LED-Video-Light.html?noRedirect=1&skuId=1834542978930290689',
  rc100bManual:'https://static.smallrig.com/mall/img/public/ikoxo2sh29-1740738075427_.pdf',
  rc220c:'https://www.smallrig.com/RC-220C-RGB-COB-LED-Video-Light.html',
  rc220cManual:'https://static.smallrig.com/mall/img/public/5wglduq1wx7-1748506964081_.pdf',
  rc350b:'https://www.smallrig.com/global/SmallRig-RC-350-COB-LED-Video-Light-EU.html',
  rc450b:'https://www.smallrig.com/SmallRig-RC-450B-COB-LED-Video-Light-3979.html',
  rc350450Manual:'https://static.smallrig.com/mall/img/public/1732525071182_.pdf'
};

function control(sourceUrl,manualUrl){
  return {
    wired:[],
    wireless:['Bluetooth Low Energy via SmallGoGo App'],
    builtInBluetooth:true,
    builtInCRMX:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'SmallRig documents BLE/SmallGoGo transport for this exact model, but LightingAI proprietary command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,manualUrl],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'SmallRig SmallGoGo BLE',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,manualUrl],
        note:'SmallRig explicitly documents BLE/Bluetooth app control for this exact model. This verifies transport capability only; LightingAI command semantics remain locked.'
      }
    }
  };
}

export const SMALLRIG_BLE_FIXTURES=[
  {
    id:'smallrig-rc-100b',manufacturer:'SmallRig',model:'RC 100B',family:'RC COB',category:'Light',
    sourceType:'Bi-Color COB LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',
    control:control(SRC.rc100b,SRC.rc100bManual),sourceUrl:SRC.rc100b
  },
  {
    id:'smallrig-rc-220c',manufacturer:'SmallRig',model:'RC 220C',family:'RC COB',category:'Light',
    sourceType:'RGB COB LED Spotlight',formFactor:'Spotlight / Monolight',
    colorMode:'RGB Full Color',
    control:control(SRC.rc220c,SRC.rc220cManual),sourceUrl:SRC.rc220c
  },
  {
    id:'smallrig-rc-350b',manufacturer:'SmallRig',model:'RC 350B',family:'RC COB',category:'Light',
    sourceType:'Bi-Color COB LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',powerDrawW:403.2,cri:96,tlci:97,
    control:control(SRC.rc350b,SRC.rc350450Manual),sourceUrl:SRC.rc350b
  },
  {
    id:'smallrig-rc-450b',manufacturer:'SmallRig',model:'RC 450B',family:'RC COB',category:'Light',
    sourceType:'Bi-Color COB LED Spotlight',formFactor:'Spotlight / Monolight',
    cctK:{min:2700,max:6500},colorMode:'Bi-Color',powerDrawW:499.8,cri:96,tlci:97,
    control:control(SRC.rc450b,SRC.rc350450Manual),sourceUrl:SRC.rc450b
  }
];
