// Genaray exact-model Bluetooth coverage.
// First-party Genaray product/category evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  panels:'https://www.genaray.com/products/Lights/Panel-LEDs',
  strips:'https://www.genaray.com/products/Lights/Strip-Lights',
  tubes:'https://www.genaray.com/products/Lights/Wand-Style-%26-Tube-Lights',
  pxMod3:'https://www.genaray.com/product/21381/Genaray-PX_MOD_3-RGB-Series-Modular-RGB-Pixel-Panel%3C%2Astrong%3E'
};

function bluetoothControl(sourceUrl,note){
  const sources=[sourceUrl];
  if(sourceUrl!==SRC.pxMod3) sources.push(SRC.pxMod3);
  return {
    wired:[],
    wireless:['Bluetooth wireless app control'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Genaray documents Bluetooth app transport for this exact model, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:sources,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Genaray RGB Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:note+' LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,family,sourceType,formFactor,cctK,sourceUrl){
  return {
    id,
    manufacturer:'Genaray',
    model,
    family,
    category:'Light',
    sourceType,
    formFactor,
    cctK,
    colorMode:'RGB / HSI / CCT / Effects',
    control:bluetoothControl(sourceUrl,'First-party Genaray documentation explicitly confirms Bluetooth wireless app control for this exact model.'),
    sourceUrl
  };
}

export const GENARAY_BLUETOOTH_FIXTURES=[
  fixture('genaray-px-mod-3','PX-MOD-3','RGB Series','RGB Pixel LED Panel','Panel',{min:2800,max:8000},SRC.pxMod3),
  fixture('genaray-bl-5x7-rgb','BL-5X7-RGB','RGB Series','RGBAW LED Panel','Panel',{min:2800,max:8000},SRC.panels),
  fixture('genaray-ssl-36-rgb','SSL-36-RGB','RGB Series','RGB Linear Wash / Strip Light','Bar',{min:2500,max:10000},SRC.strips),
  fixture('genaray-px4-rgb','PX4-RGB','Pixel RGB Tube','RGB Pixel LED Tube','Tube',{min:2800,max:8000},SRC.tubes),
  fixture('genaray-px2-rgb-c','PX2-RGB-C','Pixel RGB Tube','RGB Pixel LED Tube','Tube',{min:2800,max:8000},SRC.tubes),
  fixture('genaray-px1-rgb','PX1-RGB','Pixel RGB Tube','RGB Pixel LED Tube','Tube',{min:2800,max:8000},SRC.tubes),
  fixture('genaray-px2-rgb','PX2-RGB','Pixel RGB Tube','RGB Pixel LED Tube','Tube',{min:2800,max:8000},SRC.tubes)
];
