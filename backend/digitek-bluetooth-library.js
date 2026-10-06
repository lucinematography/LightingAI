// Digitek exact-model Bluetooth lighting coverage.
// First-party Digitek product evidence only.
// Transport is verified for DCL 100 WBC; proprietary Bluetooth/GATT semantics remain fail-closed.
const SRC={dcl100wbc:'https://www.digitek.net.in/products/digitek-dcl-100-wbc-100w-bi-color-continuous-led-light-with-reflector-mini-bowen-mount-a-unique-modern-meticulous-design-to-cater-to-the-photographers-aesthetic-idea-for-professional-photography'};

function control(){
  const sourceUrls=[SRC.dcl100wbc];
  return {
    wired:[],
    wireless:['Bluetooth via Smartlife APP'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Digitek documents Smartlife APP control and a Bluetooth Connection Reset for DCL 100 WBC, but LightingAI proprietary Bluetooth/GATT discovery, pairing, services, characteristics and command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Digitek Smartlife Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Digitek documentation explicitly ties exact model DCL 100 WBC to Smartlife app control and a Bluetooth Connection Reset. LightingAI proprietary Bluetooth/GATT command/session semantics remain locked.'
      }
    }
  };
}

export const DIGITEK_BLUETOOTH_FIXTURES=[
  {
    id:'digitek-dcl-100-wbc',
    manufacturer:'Digitek',
    model:'DCL 100 WBC',
    family:'DCL',
    category:'Light',
    sourceType:'Bi-Color COB LED Continuous Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'Bi-Color / FX',
    powerDrawW:100,
    cctK:{min:2700,max:6500},
    cri:97,
    control:control(),
    sourceUrl:SRC.dcl100wbc
  }
];
