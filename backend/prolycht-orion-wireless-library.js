// PROLYCHT Orion exact-model Bluetooth/Wi-Fi coverage.
// First-party PROLYCHT product/manual sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  orion300:'https://www.prolycht.com/orion300fs/index.aspx',
  orion675:'https://prolycht.com/orion675fs/index.aspx',
  orion300Manual:'https://prolycht.com/uploadfiles/2021/11/20211125172104110.pdf',
  orion675Data:'https://prolycht.com/uploadfiles/2022/10/20221014151213506.pdf'
};

function directOrionControl(sourceUrl,extraUrl){
  return {
    wired:[],
    wireless:['Bluetooth / ChromaLink','Wi-Fi / ChromaLink'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'PROLYCHT documents Bluetooth/Wi-Fi app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,extraUrl],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'PROLYCHT Orion ChromaLink Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,extraUrl],
        note:'PROLYCHT documents ChromaLink Bluetooth control for this Orion model. LightingAI command semantics remain locked.'
      },
      wifi:{
        verified:true,
        family:'PROLYCHT Orion ChromaLink Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,extraUrl],
        note:'PROLYCHT documents ChromaLink/Wi-Fi control for this Orion model. LightingAI command/session semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,sourceUrl,extraUrl,cctK,powerDrawW){
  return {
    id,
    manufacturer:'PROLYCHT',
    model,
    family:'Orion',
    category:'Light',
    sourceType:'RGBACL Full-Color LED Spotlight',
    formFactor:'Spotlight / Monolight',
    cctK,
    colorMode:'RGBACL Full Color',
    powerDrawW,
    control:directOrionControl(sourceUrl,extraUrl),
    sourceUrl
  };
}

export const PROLYCHT_ORION_WIRELESS_FIXTURES=[
  fixture('prolycht-orion-300-fs','Orion 300 FS',SRC.orion300,SRC.orion300Manual,{min:2000,max:20000},320),
  fixture('prolycht-orion-675-fs','Orion 675 FS',SRC.orion675,SRC.orion675Data,{min:1800,max:20000},675)
];
