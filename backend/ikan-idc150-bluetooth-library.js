// Ikan exact-model Bluetooth coverage.
// First-party Ikan NAB catalog evidence only.
// Transport evidence is model-scoped; proprietary command/session semantics remain fail-closed.
const SRC={
  catalog:'https://ikancorp.com/Downloads/catalogs/IkanNABCatalog2018.pdf'
};

function bluetoothControl(){
  return {
    wired:[],
    wireless:['Bluetooth'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Ikan documents Bluetooth capability for IDC150, but LightingAI command/session semantics are not production-verified'
    ],
    sourceUrls:[SRC.catalog],
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Ikan IDC150 Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:[SRC.catalog],
        note:'Ikan first-party NAB catalog identifies IDC150 as the Digital Color Light and explicitly states Bluetooth enabled. LightingAI proprietary command semantics remain locked.'
      }
    }
  };
}

export const IKAN_IDC150_BLUETOOTH_FIXTURES=[
  {
    id:'ikan-idc150',
    manufacturer:'Ikan',
    model:'IDC150',
    family:'Digital Color Light',
    category:'Light',
    sourceType:'RGBW LED Panel',
    formFactor:'Panel',
    colorMode:'RGBW / CCT / Effects',
    control:bluetoothControl(),
    sourceUrl:SRC.catalog
  }
];
