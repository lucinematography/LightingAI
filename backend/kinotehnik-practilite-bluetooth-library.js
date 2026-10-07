// Kinotehnik Practilite exact-model Bluetooth LE coverage.
// First-party Kinotehnik manuals only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  p602:'https://kinotehnik.com/wp-content/uploads/2020/08/PRACTILITE-602_manual_for_web.pdf',
  p632:'https://kinotehnik.com/632_user_manual.pdf',
  app:'https://kinotehnik.com/practilite-remote-control-app/'
};

function bluetoothControl(sourceUrl){
  return {
    wired:[],
    wireless:['Bluetooth LE via Practilite Remote Control App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Kinotehnik documents Bluetooth LE app transport, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[sourceUrl,SRC.app],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Kinotehnik Practilite Bluetooth LE',
        scope:'transport-capability-only',
        sourceUrls:[sourceUrl,SRC.app],
        note:'First-party Kinotehnik manual explicitly confirms Bluetooth LE remote control. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

function fixture(id,model,sourceType,formFactor,sourceUrl,beamAngle,powerDrawW){
  return {
    id,
    manufacturer:'Kinotehnik',
    model,
    family:'Practilite',
    category:'Light',
    sourceType,
    formFactor,
    cctK:{min:3000,max:6000},
    colorMode:'Bi-Color',
    beamAngle,
    powerDrawW,
    control:bluetoothControl(sourceUrl),
    sourceUrl
  };
}

export const KINOTEHNIK_PRACTILITE_BLUETOOTH_FIXTURES=[
  fixture('kinotehnik-practilite-602','Practilite 602','Bi-Color LED Fresnel','Fresnel',SRC.p602,{min:15,max:75},85),
  fixture('kinotehnik-practilite-632','Practilite 632','Bi-Color LED Aspheric Zoom','Spotlight / Zoom',SRC.p632,{min:10,max:60},65)
];
