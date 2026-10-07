// Ulanzi exact-model Bluetooth coverage.
// First-party Ulanzi Connect support list and model pages only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  app:'https://www.ulanzi.com/en-au/pages/ulanzi-app',
  vl120:'https://www.ulanzi.com/collections/continuous-lighting/products/120w-v-mount-light-l074cna1',
  vl200bi:'https://www.ulanzi.com/collections/continuous-lighting/products/vl-200bi-200w-video-light-l079cna1',
  ec65:'https://www.ulanzi.com/collections/continuous-lighting/products/65w-portable-bi-color-led-video-light-l184',
  al60:'https://www.ulanzi.com/collections/continuous-lighting/products/inflatable-led-air-tube-light-l096',
  k6500:'https://www.ulanzi.com/en-sg/products/ulanzi-k6500-ulanzi-studio-magnetic-bluetooth-video-light'
};

function bluetoothControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth via Ulanzi Connect'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Ulanzi documents Bluetooth-based Ulanzi Connect support, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,SRC.app],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Ulanzi Connect Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.app],
        note:'First-party Ulanzi Connect documentation lists this model as supported and recommends Bluetooth 5.0+ hardware for desktop control. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,sourceType,formFactor,sourceUrl,cctK,powerDrawW,colorMode){
  return {
    id,
    manufacturer:'Ulanzi',
    model,
    family:'Ulanzi Connect',
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

export const ULANZI_CONNECT_BLUETOOTH_FIXTURES=[
  fixture('ulanzi-vl-120bi','VL-120Bi','Bi-Color COB LED','COB / Monolight',SRC.vl120,{min:2700,max:6500},120,'Bi-Color'),
  fixture('ulanzi-vl-120c','VL-120C','RGB COB LED','COB / Monolight',SRC.vl120,{min:2700,max:6500},120,'RGB / HSI / CCT'),
  fixture('ulanzi-vl-200bi','VL-200Bi','Bi-Color COB LED','COB / Monolight',SRC.vl200bi,{min:2700,max:6500},200,'Bi-Color'),
  fixture('ulanzi-ec65','EC65','Bi-Color COB LED','Cube / Mini COB',SRC.ec65,{min:2500,max:6500},70,'Bi-Color'),
  fixture('ulanzi-al60','AL60','Bi-Color LED Air Tube','Inflatable Tube / Mat',SRC.al60,{min:2700,max:6500},68,'Bi-Color'),
  fixture('ulanzi-k6500','K6500','Magnetic Bluetooth Video Light','Pocket / Magnetic Panel',SRC.k6500,null,null,'App-controlled RGB / effects')
];
