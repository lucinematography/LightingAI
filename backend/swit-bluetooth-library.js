// SWIT exact-model Bluetooth / SWIT Console coverage.
// First-party SWIT product sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  vango70:'https://swit.cc/index.php?c=article&id=2501',
  vango100:'https://swit.cc/index.php?c=article&id=2502',
  vango100l:'https://swit.cc/index.php?c=article&id=2613',
  monet400:'https://www.swit.cc/index.php?c=article&id=3114',
  monet700:'https://www.swit.cc/index.php?c=article&id=3115',
  clm100c:'https://swit.cc/index.php?c=article&id=2670',
  mini150b:'https://www.swit.cc/index.php?c=article&id=4440'
};

function bluetoothControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via SWIT Console'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'SWIT documents Bluetooth app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'SWIT Console Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl],
        note:'First-party SWIT documentation confirms Bluetooth control through SWIT Console. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,cctK,colorMode,powerDrawW){
  return {
    id,
    manufacturer:'SWIT',
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

export const SWIT_BLUETOOTH_FIXTURES=[
  fixture('swit-vango-70','VANGO-70','VANGO','RGBW LED Panel','Panel',SRC.vango70,{min:2800,max:10000},'RGBW Full Color',70),
  fixture('swit-vango-100','VANGO-100','VANGO','RGBW LED Panel','Panel',SRC.vango100,{min:2800,max:10000},'RGBW Full Color',100),
  fixture('swit-vango-100l','VANGO-100L','VANGO','RGBW LED Panel','Panel',SRC.vango100l,{min:2800,max:10000},'RGBW Full Color',100),
  fixture('swit-monet-400','MONET-400','MONET','RGBWW LED Panel','Panel',SRC.monet400,{min:2800,max:10000},'RGBWW Full Color',400),
  fixture('swit-monet-700','MONET-700','MONET','RGBWW LED Panel','Panel',SRC.monet700,{min:2800,max:10000},'RGBWW Full Color',700),
  fixture('swit-cl-m100c','CL-M100C','CL','RGBW LED Panel','Panel',SRC.clm100c,{min:2800,max:10000},'RGBW Full Color',100),
  fixture('swit-mini-150b','Mini-150B','Mini','Bi-Color COB LED Light','Spotlight / Monolight',SRC.mini150b,{min:2700,max:6500},'Bi-Color',150)
];
