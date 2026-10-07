// Rosco Miro Cube 2 exact-model assisted-Bluetooth lighting coverage.
// First-party Rosco product/control evidence only.
// Bluetooth requires the external myMIX Connect RJ45 dongle; proprietary BLE/GATT command/session semantics remain fail-closed.
const SRC={
  wnc:'https://us.rosco.com/en/product/miro-cube-2-wnc',
  color:'https://us.rosco.com/en/product/miro-cube-2-4c-4ca',
  uv365:'https://us.rosco.com/en/product/miro-cube-2-uv365',
  connect:'https://us.rosco.com/en/product/mymix-connect'
};

function capabilityVerification(sourceUrls,{cct=false,color=false}={}){
  const out={
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Rosco documents fixture dimming together with Bluetooth control via myMIX Connect and the myMIX app. This proves operator capability only, not LightingAI BLE command encoding.'}
  };
  if(cct){
    out.cct={verified:true,scope:'official-app-capability-only',sourceUrls,note:'Rosco documents color-temperature control for this exact Miro Cube 2 variant and Bluetooth control via myMIX Connect. This proves operator capability only.'};
  }
  if(color){
    out.color={verified:true,scope:'official-app-capability-only',sourceUrls,note:'Rosco documents color control for this exact Miro Cube 2 color variant and Bluetooth control via myMIX Connect. This proves operator capability only.'};
  }
  return out;
}

function assistedBluetoothControl(sourceUrls,model,opts={}){
  return {
    wired:['DMX512','RDM','0-10VDC'],
    wireless:['Bluetooth via Rosco myMIX Connect RJ45 dongle and myMIX App'],
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:['Rosco myMIX Connect Bluetooth / RJ45 dongle (515800000046)'],
    unavailableDirectProtocols:[
      'Rosco documents Bluetooth app control for '+model+' only through the external myMIX Connect accessory; direct fixture Bluetooth is not claimed',
      'LightingAI proprietary BLE/GATT discovery, pairing, service/characteristic UUIDs and command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Rosco myMIX Connect assisted Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Rosco documentation states that Miro Cube 2 is controlled from a mobile device through the self-powered myMIX Connect RJ45 dongle and myMIX app. This is assisted Bluetooth; direct fixture BLE semantics are not claimed.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,opts)
  };
}

function fixture(id,model,sourceType,colorMode,sourceUrl,opts={}){
  const sources=[sourceUrl,SRC.connect];
  return {
    id,
    manufacturer:'Rosco',
    model,
    family:'Miro Cube 2',
    category:'Light',
    sourceType,
    formFactor:'PAR / Point Light',
    colorMode,
    control:assistedBluetoothControl(sources,model,opts),
    sourceUrl
  };
}

export const ROSCO_MIRO_CUBE_ASSISTED_BLUETOOTH_FIXTURES=[
  fixture('rosco-miro-cube-2-wnc','Miro Cube 2 WNC','Tunable White LED Cube','Variable White',SRC.wnc,{cct:true}),
  fixture('rosco-miro-cube-2-4c','Miro Cube 2 4C','RGBW LED Cube','RGBW / CCT',SRC.color,{cct:true,color:true}),
  fixture('rosco-miro-cube-2-4ca','Miro Cube 2 4CA','RGBA LED Cube','RGBA / CCT',SRC.color,{cct:true,color:true}),
  fixture('rosco-miro-cube-2-uv365','Miro Cube 2 UV365','UV365 LED Cube','UV 365 nm',SRC.uv365)
];
