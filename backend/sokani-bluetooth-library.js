// Sokani exact-model Bluetooth lighting coverage.
// First-party Sokani catalog/spec evidence only.
// X100 RGB transport is verified; proprietary Bluetooth/GATT command/session semantics remain fail-closed.
const SRC={
  x100rgb:'https://www.sokani.net/pt-br/video-light/',
  catalog:'https://www.sokani.net/en/shop/catalogue/?selected_facets=brand_exact%3ASOKANI&selected_facets=product_class_exact%3AContinuous+Lighting&selected_facets=product_class_exact%3ATripods'
};

function bluetoothControl(model){
  const sourceUrls=[SRC.x100rgb,SRC.catalog];
  return {
    wired:[],
    wireless:['Bluetooth via SS LED Video Light app'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Sokani documents a 60 ft Bluetooth connection and SS LED Video Light app for '+model+', but LightingAI proprietary Bluetooth/GATT discovery, pairing, services, characteristics and command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Sokani SS LED Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Sokani documentation explicitly lists Bluetooth connection and the SS LED Video Light app for exact model X100 RGB. LightingAI proprietary Bluetooth/GATT command/session semantics remain locked.'
      }
    }
  };
}

export const SOKANI_BLUETOOTH_FIXTURES=[
  {
    id:'sokani-x100-rgb',
    manufacturer:'Sokani',
    model:'X100 RGB',
    family:'X100',
    category:'Light',
    sourceType:'RGB COB LED Video Light',
    formFactor:'Spotlight / Monolight',
    colorMode:'RGB / CCT',
    powerDrawW:100,
    cctK:{min:2800,max:10000},
    cri:96,
    control:bluetoothControl('X100 RGB'),
    sourceUrl:SRC.x100rgb
  }
];
