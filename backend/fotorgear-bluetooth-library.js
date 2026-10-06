// FotorGear exact-product Bluetooth lighting coverage.
// First-party FotorGear product evidence only.
// Bluetooth scope is explicitly limited to the documented iOS path; Android Bluetooth flash control is not claimed.
// Proprietary BLE/GATT command/session semantics remain fail-closed.
const SRC={
  cobFlash:'https://www.fotorgear.com/products/cob-light'
};

function bluetoothControl(model){
  const sourceUrls=[SRC.cobFlash];
  return {
    wired:[],
    wireless:['Bluetooth via FotorGear App (iOS interactive path only)'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'FotorGear documents Bluetooth remote technology and app interaction for '+model+' on iOS, but LightingAI proprietary BLE/GATT discovery, pairing, services, characteristics and command/session semantics are not production-verified',
      'FotorGear explicitly states that Android does not support Bluetooth-controlled flash via the phone for this product; Android must remain excluded from the verified Bluetooth control scope'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'FotorGear App Bluetooth',
        scope:'transport-capability-only-ios',
        sourceUrls,
        note:'First-party FotorGear documentation explicitly confirms Bluetooth remote technology and interactive app operation for exact product SKU 10477 on iOS. Android Bluetooth flash control is explicitly not supported. LightingAI proprietary BLE/GATT command/session semantics remain locked.'
      }
    }
  };
}

export const FOTORGEAR_BLUETOOTH_FIXTURES=[
  {
    id:'fotorgear-cob-smartphone-bluetooth-flash-10477',
    manufacturer:'FotorGear',
    model:'COB Smartphone Bluetooth Flash (SKU 10477)',
    family:'COB Smartphone Flash',
    category:'Light',
    sourceType:'COB Smartphone Bluetooth Flash',
    formFactor:'Pocket / Handheld',
    colorMode:'Daylight',
    cctK:{min:5700,max:5700},
    batteryWh:1.85,
    control:bluetoothControl('COB Smartphone Bluetooth Flash (SKU 10477)'),
    sourceUrl:SRC.cobFlash
  }
];
