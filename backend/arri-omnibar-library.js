// ARRI Omnibar exact-model fixture definitions.
// First-party ARRI evidence only. Bluetooth Mesh transport is verified; proprietary command/session semantics remain fail-closed.
const SRC={
  product:'https://www.arri.com/en/lighting/led-linear-lights/omnibar',
  tech:'https://www.arri.com/en/lighting/led-linear-lights/omnibar/omnibar-tech-data-downloads',
  app:'https://www.arri.com/en/learn/lighting/tools-apps/omnibar-app',
  faq:'https://www.arri.com/en/lighting/led-linear-lights/omnibar/omnibar-faq'
};

function omnibarControl(model){
  return {
    wired:['DMX512 / Art-Net / sACN via ARRI Omnibase'],
    wireless:['Bluetooth Mesh via ARRI Omnibar Control App','CRMX via integrated LumenRadio TimoTwo'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:['ARRI Omnibase for wired/network data path only'],
    unavailableDirectProtocols:[
      'ARRI documents direct Bluetooth Mesh control for '+model+' through the Omnibar Control App, but LightingAI proprietary Bluetooth Mesh discovery, session, packet and command semantics are not production-verified'
    ],
    sourceUrls:[SRC.product,SRC.tech,SRC.app,SRC.faq]
  };
}

function fixture(id,model,powerDrawW,pixelZones,batteryWh){
  return {
    id,manufacturer:'ARRI',model,family:'Omnibar',category:'Light',
    sourceType:'RGBMA Pixel Linear LED Bar',formFactor:'Linear Light Bar',
    colorMode:'RGBMA / CCT / HSI / x-y / Gel / Pixel FX',
    cctK:{min:1700,max:20000},powerDrawW,pixelZones,batteryWh,cri:98,tlci:98,ipRating:'IP65',
    control:omnibarControl(model),sourceUrl:SRC.product
  };
}

export const ARRI_OMNIBAR_FIXTURES=[
  fixture('arri-omnibar-2','Omnibar 2',25,16,49),
  fixture('arri-omnibar-4','Omnibar 4',50,32,98)
];
