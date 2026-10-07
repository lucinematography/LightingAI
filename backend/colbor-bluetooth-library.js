// COLBOR exact-model Bluetooth coverage.
// First-party COLBOR product/editorial sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  cl60:'https://www.colborlight.com/products/co-cl60',
  cl100x:'https://www.colborlight.com/products/co-cl100x',
  cl60Bluetooth:'https://www.colborlight.com/blogs/articles/get-studio-lights-for-youtube',
  cl100xBluetooth:'https://www.colborlight.com/blogs/articles/buyer-guide-to-light-for-streaming',
  app:'https://www.colborlight.com/pages/colbor-apps-download'
};

function bluetoothControl(sourceUrl,bluetoothEvidenceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via COLBOR Studio App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'COLBOR documents Bluetooth app control, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,bluetoothEvidenceUrl,SRC.app],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'COLBOR Studio Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,bluetoothEvidenceUrl,SRC.app],
        note:'First-party COLBOR documentation explicitly confirms Bluetooth remote control for this model. LightingAI command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,sourceUrl,bluetoothEvidenceUrl,cctK,powerDrawW){
  return {
    id,
    manufacturer:'COLBOR',
    model,
    family:'CL',
    category:'Light',
    sourceType:'Bi-Color COB LED Light',
    formFactor:'Spotlight / Monolight',
    cctK,
    colorMode:'Bi-Color',
    powerDrawW,
    control:bluetoothControl(sourceUrl,bluetoothEvidenceUrl),
    sourceUrl
  };
}

export const COLBOR_BLUETOOTH_FIXTURES=[
  fixture('colbor-cl60','CL60',SRC.cl60,SRC.cl60Bluetooth,{min:2700,max:6500},80),
  fixture('colbor-cl100x','CL100X',SRC.cl100x,SRC.cl100xBluetooth,{min:2700,max:6500},120)
];
