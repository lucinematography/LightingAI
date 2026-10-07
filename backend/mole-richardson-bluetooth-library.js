// Mole-Richardson exact-model Bluetooth lighting coverage.
// First-party Mole-Richardson product evidence only.
// Bluetooth app transport is model-scoped; proprietary BLE/GATT command/session semantics remain fail-closed.
const SRC={
  variBaby:'https://www.mole.com/vari-baby-led',
  variJunior:'https://www.mole.com/vari-junior-led',
  variStudioJunior:'https://www.mole.com/vari-studio-junior-led',
  variSenior:'https://www.mole.com/vari-senior-led',
  variTener:'https://www.mole.com/vari-tener-led',
  variBigEye:'https://www.mole.com/big-eye-led',
  variSoftPanel:'https://www.mole.com/vari-soft-panel',
  variSpace200:'https://www.mole.com/200w-vari-space-series2',
  variSpace400:'https://www.mole.com/400w-vari-space-series2',
  variSpace900:'https://www.mole.com/900w-vari-space-series2',
  maxi3:'https://www.mole.com/maxi-led-3',
  maxi6:'https://www.mole.com/maxi-led-6',
  maxi12:'https://www.mole.com/maxi-led-12'
};

function capabilityVerification(sourceUrls,variableColor){
  const out={
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Mole-Richardson documents Bluetooth intensity control through its iOS app for this exact model. This proves operator capability only, not LightingAI BLE command encoding.'}
  };
  if(variableColor){
    out.cct={verified:true,scope:'official-app-capability-only',sourceUrls,note:'Mole-Richardson documents variable color temperature plus Bluetooth intensity/color control for this exact variable-color model. This proves operator capability only.'};
  }
  return out;
}

function bluetoothControl(sourceUrls,model,variableColor){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth via Mole-Richardson/Luminaire iOS App','LumenRadio wireless DMX'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Mole-Richardson documents Bluetooth app control for '+model+', but LightingAI proprietary BLE/GATT discovery, pairing, service/characteristic UUIDs and command/session semantics are not production-verified',
      'The separate LumenRadio wireless-DMX path is not treated as Bluetooth app transport in this checkpoint'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Mole-Richardson Bluetooth iOS App Control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Mole-Richardson exact-model documentation explicitly confirms Bluetooth app control. LightingAI proprietary BLE/GATT semantics remain locked pending physical capture/replay.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,variableColor)
  };
}

function variableFixture(id,model,family,formFactor,powerDrawW,sourceUrl){
  return {
    id,
    manufacturer:'Mole-Richardson',
    model,
    family,
    category:'Light',
    sourceType:'Variable-Color LED',
    formFactor,
    colorMode:'Variable White / CCT',
    ...(powerDrawW?{powerDrawW}:{}),
    cctK:{min:2700,max:6500},
    control:bluetoothControl([sourceUrl],model,true),
    sourceUrl
  };
}

function daylightFixture(id,model,family,formFactor,powerDrawW,sourceUrl){
  return {
    id,
    manufacturer:'Mole-Richardson',
    model,
    family,
    category:'Light',
    sourceType:'Daylight LED',
    formFactor,
    colorMode:'Daylight',
    powerDrawW,
    cctK:{min:5600,max:5600},
    control:bluetoothControl([sourceUrl],model,false),
    sourceUrl
  };
}

export const MOLE_RICHARDSON_BLUETOOTH_FIXTURES=[
  variableFixture('mole-vari-baby-led-9501','6" Vari-Baby LED (Type 9501)','Vari Fresnel','Fresnel',140,SRC.variBaby),
  variableFixture('mole-vari-junior-led-9511','8" Vari-Junior LED (Type 9511)','Vari Fresnel','Fresnel',180,SRC.variJunior),
  variableFixture('mole-vari-studio-junior-led-9521','10" Vari-Studio Junior LED (Type 9521)','Vari Fresnel','Fresnel',250,SRC.variStudioJunior),
  variableFixture('mole-vari-senior-led-9531','10" Vari-Senior LED (Type 9531)','Vari Fresnel','Fresnel',800,SRC.variSenior),
  variableFixture('mole-vari-tener-led-9541','14" Vari-Tener LED (Type 9541)','Vari Fresnel','Fresnel',1500,SRC.variTener),
  variableFixture('mole-vari-big-eye-led-9391','24" Vari-Big Eye LED (Type 9391)','Vari Fresnel','Fresnel',1500,SRC.variBigEye),
  variableFixture('mole-vari-soft-panel-led-9421','Vari-Soft Panel LED (Type 9421)','Vari Soft','Panel / Soft Light',400,SRC.variSoftPanel),
  variableFixture('mole-vari-space-series2-200','200W Vari-Space LED Series 2 (Type 9311)','Vari Space Series 2','Soft Light / Spacelight',null,SRC.variSpace200),
  variableFixture('mole-vari-space-series2-400','400W Vari-Space LED Series 2 (Type 9321)','Vari Space Series 2','Soft Light / Spacelight',400,SRC.variSpace400),
  variableFixture('mole-vari-space-series2-900','900W Vari-Space LED Series 2 (Type 9331)','Vari Space Series 2','Soft Light / Spacelight',900,SRC.variSpace900),
  daylightFixture('mole-maxi-led-3','Maxi-3 LED (Type AAD360L)','Maxi LED','Spotlight / LED Array',375,SRC.maxi3),
  daylightFixture('mole-maxi-led-6','Maxi-6 LED (Type MBE960L-U)','Maxi LED','Spotlight / LED Array',750,SRC.maxi6),
  daylightFixture('mole-maxi-led-12','Maxi-12 LED (Type MBE1920L-U)','Maxi LED','Spotlight / LED Array',1500,SRC.maxi12)
];
