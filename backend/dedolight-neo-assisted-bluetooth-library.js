// dedolight NEO exact-model assisted-Bluetooth lighting coverage.
// First-party Dedo Weigert Film / dedolight evidence only.
// Bluetooth is provided by the required DTneo+/DTN7C+ control ballast; proprietary BLE/GATT command/session semantics remain fail-closed.
const SRC={
  priceList:'https://www.dedoweigertfilm.de/dwf-en/products/Price-Lists/dedolight_neo_Pricelist_0924_Customer.pdf',
  dtneo:'https://www.dedoweigertfilm.de/dwf-en/media/PDF/dedolight/dedolight_DTneo_tec_sheet.pdf',
  colorControl:'https://www.dedoweigertfilm.de/dwf-en/media/PDF/dedolight/dedolight_DTneo_color_tec_sheet.pdf'
};

function capabilityVerification(sourceUrls,{cct=false,color=false}={}){
  const out={
    dim:{verified:true,scope:'official-control-capability-only',sourceUrls,note:'dedolight documents smooth dimming together with DTneo+/DTN7C+ Bluetooth control. This proves operator capability only, not LightingAI BLE command encoding.'}
  };
  if(cct){
    out.cct={verified:true,scope:'official-control-capability-only',sourceUrls,note:'dedolight documents variable color-temperature control for this exact NEO system together with Bluetooth control through its required control ballast.'};
  }
  if(color){
    out.color={verified:true,scope:'official-control-capability-only',sourceUrls,note:'dedolight documents full-color HSI/CIExy control for DLED7N-C through DTN7C+ and the ChromaLink app. This proves operator capability only.'};
  }
  return out;
}

function assistedBluetoothControl(sourceUrls,model,controller,opts={}){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth via '+controller,'LumenRadio CRMX'],
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:[controller+' Bluetooth / CRMX control ballast'],
    unavailableDirectProtocols:[
      'dedolight documents Bluetooth for '+model+' only through the required '+controller+' control ballast; direct Bluetooth in the light head is not claimed',
      'LightingAI proprietary BLE/GATT discovery, pairing, service/characteristic UUIDs, app session flow and command payload semantics are not production-verified',
      'LumenRadio CRMX is a separate wireless-DMX path and is not treated as Bluetooth app transport'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'dedolight NEO assisted Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party dedolight documentation verifies Bluetooth on the required NEO control ballast. This is assisted Bluetooth; direct light-head BLE semantics are not claimed.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,opts)
  };
}

function fixture(id,model,sourceType,colorMode,controller,sourceUrls,opts={}){
  return {
    id,
    manufacturer:'dedolight',
    model,
    family:'NEO Series 7',
    category:'Light',
    sourceType,
    formFactor:'Spotlight / Monolight',
    colorMode,
    control:assistedBluetoothControl(sourceUrls,model,controller,opts),
    sourceUrl:sourceUrls[0]
  };
}

export const DEDOLIGHT_NEO_ASSISTED_BLUETOOTH_FIXTURES=[
  fixture('dedolight-setdled7n-plus-bi','SETDLED7N+BI — DLED7N-BI with DTneo+','Bi-Color Focusing LED','Bi-Color / CCT','DTneo+',[SRC.priceList,SRC.dtneo],{cct:true}),
  fixture('dedolight-setdled7n-plus-d','SETDLED7N+D — DLED7N-D with DTneo+','Daylight Focusing LED','Daylight','DTneo+',[SRC.priceList,SRC.dtneo]),
  fixture('dedolight-setdled7n-plus-t','SETDLED7N+T — DLED7N-T with DTneo+','Tungsten Focusing LED','Tungsten','DTneo+',[SRC.priceList,SRC.dtneo]),
  fixture('dedolight-dled7n-c-dtn7c-plus','DLED7N-C with DTN7C+','RGBACL Full-Color Focusing LED','RGBACL / HSI / CCT','DTN7C+',[SRC.colorControl],{cct:true,color:true})
];
