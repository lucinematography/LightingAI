// SHEHDS exact-model Wi-Fi lighting coverage.
// First-party SHEHDS product/app evidence only.
// Transport and operator capabilities are model-scoped; proprietary network command/session semantics remain fail-closed.
const SRC={
  product:'https://shehds.com/products/app-control-200w-300w-cob-par-light',
  app:'https://shehds.com/pages/app-control'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'SHEHDS documents smartphone app control and smooth 0-100% dimming for this exact product family. This proves operator capability only, not LightingAI network command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'SHEHDS documents warm/cool white CCT ranges for these exact 200W/300W variants and app control. This proves operator capability only.'},
    fx:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'SHEHDS documents app control for strobe/effects on this exact product family. This proves operator capability only.'}
  };
}
function wifiControl(sourceUrls,model){
  return {
    wired:['DMX / RDM'],
    wireless:['Wi-Fi via SHEHDS Control app'],
    builtInWifi:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'SHEHDS documents Wireless WiFi/app control for '+model+', but LightingAI proprietary network discovery, session and command semantics are not production-verified',
      'Bluetooth is not claimed for this exact model checkpoint'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{verified:true,family:'SHEHDS Control Wi-Fi',scope:'transport-capability-only',sourceUrls,note:'First-party SHEHDS exact-product documentation explicitly lists Wireless WiFi among control modes for this 200W/300W App Control COB Zoom Par family. LightingAI proprietary network command semantics remain locked.'}
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}
export const SHEHDS_WIFI_FIXTURES=[
  {id:'shehds-app-control-200w-cob-zoom-par-ww',manufacturer:'SHEHDS',model:'App Control 200W COB Zoom Par Warm&Cool White',family:'App Control COB Zoom Par',category:'Light',sourceType:'Bi-Color COB Zoom Par Stage Light',formFactor:'COB Par / Spotlight',colorMode:'Bi-Color / FX',powerDrawW:200,cctK:{min:2600,max:6500},cri:94.5,control:wifiControl([SRC.product,SRC.app],'App Control 200W COB Zoom Par Warm&Cool White'),sourceUrl:SRC.product},
  {id:'shehds-app-control-300w-cob-zoom-par-ww',manufacturer:'SHEHDS',model:'App Control 300W COB Zoom Par Warm&Cool White',family:'App Control COB Zoom Par',category:'Light',sourceType:'Bi-Color COB Zoom Par Stage Light',formFactor:'COB Par / Spotlight',colorMode:'Bi-Color / FX',powerDrawW:300,cctK:{min:2600,max:6600},cri:90,control:wifiControl([SRC.product,SRC.app],'App Control 300W COB Zoom Par Warm&Cool White'),sourceUrl:SRC.product}
];
