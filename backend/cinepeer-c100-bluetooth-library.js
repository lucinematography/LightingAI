// CINEPEER exact-model Bluetooth Mesh fixture coverage.
// First-party ZHIYUN/CINEPEER product evidence only.
// Bluetooth Mesh transport is exact-model scoped; proprietary mesh/session semantics remain fail-closed.
const SRC={
  c100:'https://eu.zhiyun-tech.com/products/cinepeer-c100',
  store:'https://store.zhiyun-tech.com/products/cinepeer-c100'
};

function bluetoothControl(sourceUrls){
  return {
    wired:[],
    wireless:['Bluetooth Mesh via ZY Vega App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'ZHIYUN/CINEPEER documents Bluetooth Mesh networking and ZY Vega App control for C100, but LightingAI mesh discovery, provisioning, service/characteristic details, session handling and private payload semantics are not production-verified',
      'Do not infer C100 command compatibility to CF100 or other CINEPEER models without exact-model evidence'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'CINEPEER / ZY Vega Bluetooth Mesh',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party ZHIYUN/CINEPEER C100 product documentation explicitly confirms Bluetooth Mesh networking and ZY Vega App control. LightingAI proprietary mesh/session semantics and physical replay remain locked.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'C100 official product documentation exposes app/manual light control.'},
      cct:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'C100 official product documentation lists 2700K-6500K variable CCT.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'C100 official product documentation lists full-color control.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'C100 official product documentation lists built-in lighting effects and music mode.'}
    }
  };
}

export const CINEPEER_C100_BLUETOOTH_FIXTURES=[
  {
    id:'cinepeer-c100',
    manufacturer:'CINEPEER',
    model:'C100',
    family:'CINEPEER C100',
    category:'Light',
    sourceType:'RGB LED Bar Light',
    formFactor:'Linear Wash / Bar',
    colorMode:'RGB / HSI / CCT',
    powerDrawW:100,
    cctK:{min:2700,max:6500},
    cri:98,
    tlci:95,
    control:bluetoothControl([SRC.c100,SRC.store]),
    sourceUrl:SRC.c100
  }
];
