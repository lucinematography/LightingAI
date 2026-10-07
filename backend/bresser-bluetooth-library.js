// BRESSER exact-model Bluetooth lighting coverage.
// First-party BRESSER product/manual evidence only.
// Bluetooth transport and operator capabilities are model-scoped; proprietary BLE/GATT command/session semantics remain fail-closed.
const SRC={
  br135:'https://www.bresser.com/p/bresser-br-135rgb-cob-led-light-F005105',
  br180:'https://www.bresser.com/p/bresser-br-180rgb-cob-led-light-F005100',
  s60:'https://www.bresser.com/p/bresser-br-s60rgb-led-light-F005102',
  br150:'https://www.bresser.com/p/bresser-br-150rgb-led-light-F005104',
  br100:'https://www.bresser.com/p/bresser-br-100rgb-led-light-F005103',
  s60Manual:'https://www.bresser.com/media/27/f1/70/1723708994/Manual_F005102_BR-S60RGB_en-nl-de_BRESSER_v052024a.pdf?ts=1723708994'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'BRESSER documents app brightness control for this exact model. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'BRESSER documents app color-temperature control for this exact model. This proves operator capability only.'},
    color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'BRESSER documents RGB/HSI color operation for this exact model through the Bluetooth/app control path. This proves operator capability only.'},
    fx:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'BRESSER documents built-in/app-accessible lighting effects for this exact model. This proves operator capability only.'}
  };
}
function bluetoothControl(model,sourceUrls){
  return {
    wired:['DMX512'],
    wireless:['Bluetooth via BRESSER-documented smartphone app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'BRESSER documents Bluetooth smartphone-app control for '+model+', but LightingAI proprietary BLE/GATT discovery, pairing, services, characteristics and command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'BRESSER Bluetooth app control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party BRESSER documentation explicitly confirms Bluetooth smartphone-app control for this exact model. LightingAI proprietary BLE/GATT command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

export const BRESSER_BLUETOOTH_FIXTURES=[
  {
    id:'bresser-br-135rgb',
    manufacturer:'BRESSER',
    model:'BR-135RGB',
    family:'BR RGB COB',
    category:'Light',
    sourceType:'RGB COB LED Studio Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGB / HSI / CCT / FX',
    powerDrawW:135,
    cctK:{min:2700,max:6500},
    cri:97,
    tlci:98,
    control:bluetoothControl('BR-135RGB',[SRC.br135]),
    sourceUrl:SRC.br135
  },
  {
    id:'bresser-br-180rgb',
    manufacturer:'BRESSER',
    model:'BR-180RGB',
    family:'BR RGB COB',
    category:'Light',
    sourceType:'RGB COB LED Studio Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGB / HSI / CCT / FX',
    powerDrawW:180,
    cctK:{min:2700,max:6500},
    cri:97,
    tlci:98,
    control:bluetoothControl('BR-180RGB',[SRC.br180]),
    sourceUrl:SRC.br180
  },
  {
    id:'bresser-br-s60rgb',
    manufacturer:'BRESSER',
    model:'BR-S60RGB',
    family:'BR RGB LED',
    category:'Light',
    sourceType:'RGB LED Studio Light',
    formFactor:'Panel',
    colorMode:'RGB / HSI / CCT / FX',
    cctK:{min:2700,max:10000},
    cri:95,
    tlci:98,
    control:bluetoothControl('BR-S60RGB',[SRC.s60,SRC.s60Manual]),
    sourceUrl:SRC.s60
  },
  {
    id:'bresser-br-150rgb',
    manufacturer:'BRESSER',
    model:'BR-150RGB',
    family:'BR RGB LED Panel',
    category:'Light',
    sourceType:'RGB LED Panel',
    formFactor:'Panel',
    colorMode:'RGB / HSI / CCT / FX',
    powerDrawW:150,
    cctK:{min:2700,max:10000},
    cri:95,
    control:bluetoothControl('BR-150RGB',[SRC.br150]),
    sourceUrl:SRC.br150
  },
  {
    id:'bresser-br-100rgb',
    manufacturer:'BRESSER',
    model:'BR-100RGB',
    family:'BR RGB LED Panel',
    category:'Light',
    sourceType:'RGB LED Panel',
    formFactor:'Panel',
    colorMode:'RGB / HSI / CCT / FX',
    powerDrawW:100,
    cctK:{min:2700,max:10000},
    cri:95,
    control:bluetoothControl('BR-100RGB',[SRC.br100]),
    sourceUrl:SRC.br100
  }
];
