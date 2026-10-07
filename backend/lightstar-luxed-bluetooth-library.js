// Lightstar Lights exact-model LUXED Bluetooth coverage.
// First-party Lightstar product evidence only.
// Bluetooth App Control is model-scoped; proprietary BLE/GATT command/session semantics remain fail-closed.
const SRC={
  p2:'https://lightstar-lights.com/luxed-p2/',
  p4:'https://lightstar-lights.com/luxed-p4/',
  p6:'https://lightstar-lights.com/luxed-p6/',
  p9:'https://lightstar-lights.com/luxed-p9/',
  p12:'https://lightstar-lights.com/luxed-p12/',
  proP2:'https://lightstar-lights.com/luxed-pro-p2/',
  proP4:'https://lightstar-lights.com/luxed-pro-p4/',
  proP9:'https://lightstar-lights.com/luxed-p9-pro/',
  proP12:'https://lightstar-lights.com/luxed-p12-pro/',
  series:'https://lightstar-lights.com/luxed-p-series/',
  proSeries:'https://lightstar-lights.com/luxed-p/'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Lightstar documents 0-100% dimming together with Bluetooth App Control for this exact LUXED model. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Lightstar documents tunable CCT together with Bluetooth App Control for this exact LUXED model. This proves operator capability only.'},
    color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Lightstar documents RGBWW/HSI/RGB color operation together with Bluetooth App Control for this exact LUXED model. This proves operator capability only.'}
  };
}

function bluetoothControl(sourceUrls,model){
  return {
    wired:['DMX512'],
    wireless:['Bluetooth App Control (iOS & Android)','LumenRadio CRMX / W-DMX'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Lightstar documents Bluetooth App Control for '+model+', but LightingAI proprietary BLE/GATT discovery, pairing, service/characteristic UUIDs and command/session semantics are not production-verified',
      'The separate LumenRadio CRMX/W-DMX path is not treated as Bluetooth app transport in this checkpoint'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Lightstar LUXED Bluetooth App Control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Lightstar exact-model pages explicitly list Bluetooth: App Control (iOS & Android). LightingAI proprietary BLE/GATT command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

function fixture(id,model,family,powerDrawW,cctMin,cctMax,cri,tlci,sourceUrl,pro=false){
  const sources=[sourceUrl,pro?SRC.proSeries:SRC.series];
  return {
    id,
    manufacturer:'Lightstar Lights',
    model,
    family,
    category:'Light',
    sourceType:'RGBWW LED Spotlight Matrix',
    formFactor:'Spotlight / LED Matrix',
    colorMode:'RGBWW / HSI / CCT',
    powerDrawW,
    cctK:{min:cctMin,max:cctMax},
    cri,
    tlci,
    control:bluetoothControl(sources,model),
    sourceUrl
  };
}

export const LIGHTSTAR_LUXED_BLUETOOTH_FIXTURES=[
  fixture('lightstar-luxed-p2','LUXED-P2','LUXED P',320,2700,10000,95,95,SRC.p2),
  fixture('lightstar-luxed-p4','LUXED-P4','LUXED P',640,2700,10000,95,95,SRC.p4),
  fixture('lightstar-luxed-p6','LUXED-P6','LUXED P',960,2700,10000,95,95,SRC.p6),
  fixture('lightstar-luxed-p9','LUXED-P9','LUXED P',1440,2700,10000,95,95,SRC.p9),
  fixture('lightstar-luxed-p12','LUXED-P12','LUXED P',1920,2700,10000,95,95,SRC.p12),
  fixture('lightstar-luxed-pro-p2','LUXED PRO-P2','LUXED P PRO',360,2700,10000,95,90,SRC.proP2,true),
  fixture('lightstar-luxed-pro-p4','LUXED PRO-P4','LUXED P PRO',720,2700,10000,95,90,SRC.proP4,true),
  fixture('lightstar-luxed-pro-p9','LUXED PRO-P9','LUXED P PRO',1620,2700,10000,95,97,SRC.proP9,true),
  fixture('lightstar-luxed-pro-p12','LUXED PRO-P12','LUXED P PRO',2160,2700,10000,95,97,SRC.proP12,true)
];
