// Harlowe (formerly HOBOLITE) exact-model Bluetooth coverage.
// First-party Harlowe/HOBOLITE product and app sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  app:'https://www.harlowe.com/pages/harlowe-app',
  micro:'https://www.harlowe.com/products/micro-portable-led-lighting-kit',
  microSpectra:'https://www.harlowe.com/products/micro-8w-spectra-rgbcw-portable-continuous-led-light-kit',
  mini2:'https://www.harlowe.com/products/mini-ii-20w-bi-color-studio-light-kit',
  mini2x:'https://www.harlowe.com/products/mini-x-portable-led-lighting-kit',
  max:'https://www.harlowe.com/products/max-80w-videography-photography-light-kit',
  maxx:'https://www.harlowe.com/products/max-x-80w-videography-photography-light-kit',
  avant:'https://www.harlowe.com/products/avant-content-creator-lighting-kit',
  pro:'https://www.harlowe.com/products/pro-300w-studio-light-kit-photo-video',
  proSpectra:'https://www.harlowe.com/products/pro-300w-spectra-rgbcw-studio-light-kit',
  blade5:'https://www.harlowe.com/products/blade-5-bi-color-rgb-tube-light',
  bladeKit:'https://www.harlowe.com/products/blade-5-10-bi-color-rgb-tube-light-kit'
};

function bluetoothControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via Harlowe App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Harlowe documents Bluetooth app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,SRC.app],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Harlowe / HOBOLITE Bluetooth app control',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.app],
        note:'First-party Harlowe documentation confirms Bluetooth app control. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,sourceUrl,cctK,colorMode,powerDrawW){
  return {
    id,
    manufacturer:'Harlowe',
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

export const HARLOWE_BLUETOOTH_FIXTURES=[
  fixture('harlowe-micro-8w','Micro 8W','Micro','Bi-Color LED Light','Pocket / Handheld',SRC.micro,{min:2700,max:6500},'Bi-Color',8),
  fixture('harlowe-micro-8w-spectra','Micro 8W Spectra','Micro','RGBCW LED Light','Pocket / Handheld',SRC.microSpectra,{min:1700,max:10000},'RGBCW Full Color',8),
  fixture('harlowe-mini-ii-20w','Mini II 20W','Mini','Bi-Color LED Light','Spotlight / Monolight',SRC.mini2,{min:2700,max:6500},'Bi-Color',20),
  fixture('harlowe-mini-ii-x-20w','Mini II-X 20W','Mini','Bi-Color LED Light','Spotlight / Monolight',SRC.mini2x,{min:2700,max:6500},'Bi-Color',20),
  fixture('harlowe-max-80w','Max 80W','Max','Bi-Color LED Light','Spotlight / Monolight',SRC.max,{min:2700,max:6500},'Bi-Color',80),
  fixture('harlowe-max-x-80w','Max-X 80W','Max','Bi-Color LED Light','Spotlight / Monolight',SRC.maxx,{min:2700,max:6500},'Bi-Color',80),
  fixture('harlowe-avant-100w','Avant 100W','Avant','Bi-Color LED Light','Spotlight / Monolight',SRC.avant,{min:2700,max:6500},'Bi-Color',100),
  fixture('harlowe-pro-300w','Pro 300W','Pro','Bi-Color LED Light','Spotlight / Monolight',SRC.pro,{min:2700,max:6500},'Bi-Color',300),
  fixture('harlowe-pro-300w-spectra','Pro 300W Spectra','Pro','RGBCW LED Light','Spotlight / Monolight',SRC.proSpectra,{min:1700,max:10000},'RGBCW Full Color',300),
  fixture('harlowe-blade-5','Blade 5','Blade','RGBCW LED Tube','Tube',SRC.blade5,{min:1700,max:10000},'RGBCW Full Color',5),
  fixture('harlowe-blade-10','Blade 10','Blade','RGBCW LED Tube','Tube',SRC.bladeKit,{min:1700,max:10000},'RGBCW Full Color',10)
];
