// Intellytech LiteCloth 2.0 exact-model assisted-Bluetooth coverage.
// First-party Intellytech product/app evidence plus Intellytech-authored LiteCloth 2.0 quickstart documentation.
// Bluetooth terminates at the included control box; do not claim direct BLE in the LED mat.
// Proprietary BLE/GATT/session semantics remain fail-closed.
const SRC={
  products:'https://www.intellytechusa.com/collections/litecloth-2-0',
  app:'https://apps.apple.com/us/app/litesync/id1576623809',
  quickstart:'https://carleton-wp-production.s3.amazonaws.com/uploads/sites/96/2025/10/Litecloth-Quickstart-Guide.pdf'
};

function assistedBluetoothControl(model,{color=false}={}){
  const sourceUrls=[SRC.products,SRC.app,SRC.quickstart];
  const capabilityVerification={
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Intellytech LiteCloth 2.0 quickstart documentation exposes output control through the LiteSync+ workflow.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Intellytech LiteCloth 2.0 quickstart documentation exposes CCT control through the LiteSync+ workflow.'}
  };
  if(color){
    capabilityVerification.color={verified:true,scope:'official-product-capability-only',sourceUrls,note:'The exact LC-160RGBWW 2.0 model is identified by Intellytech as the RGBWW LiteCloth 2.0 variant; proprietary color command encoding remains unverified.'};
  }
  return {
    wired:[],
    wireless:['Bluetooth via Intellytech LiteSync+ to LiteCloth 2.0 control box'],
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:['Included Intellytech LiteCloth 2.0 control box with Bluetooth'],
    unavailableDirectProtocols:[
      'Intellytech documents Bluetooth pairing and LiteSync+ app control for LiteCloth 2.0 products through the control box; direct Bluetooth in the LED mat is not claimed',
      'LightingAI BLE discovery, service/characteristic UUIDs, pairing/session state and private payload semantics for '+model+' are not production-verified',
      'Do not infer command equivalence between LiteCloth 2.0 models without physical capture/replay evidence'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Intellytech LiteSync+ assisted Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'The official Intellytech product collection identifies the exact LiteCloth 2.0 models, the Intellytech-published LiteSync+ app is explicitly for LiteCloth 2.0 products, and the Intellytech-authored quickstart documents Bluetooth pairing with the control box. LightingAI proprietary BLE/GATT semantics remain locked.'
      }
    },
    capabilityVerification
  };
}

export const INTELLYTECH_LITECLOTH_2_BLUETOOTH_FIXTURES=[
  {
    id:'intellytech-litecloth-lc120-2',
    manufacturer:'Intellytech',
    model:'LiteCloth LC-120 2.0',
    family:'LiteCloth 2.0',
    category:'Light',
    sourceType:'Variable White Flexible LED Mat',
    formFactor:'Flexible Panel / Mat',
    colorMode:'Variable White / CCT',
    control:assistedBluetoothControl('LiteCloth LC-120 2.0'),
    sourceUrl:SRC.products
  },
  {
    id:'intellytech-litecloth-lc160-2',
    manufacturer:'Intellytech',
    model:'LiteCloth LC-160 2.0',
    family:'LiteCloth 2.0',
    category:'Light',
    sourceType:'Variable White Flexible LED Mat',
    formFactor:'Flexible Panel / Mat',
    colorMode:'Variable White / CCT',
    control:assistedBluetoothControl('LiteCloth LC-160 2.0'),
    sourceUrl:SRC.products
  },
  {
    id:'intellytech-litecloth-lc160rgbww-2',
    manufacturer:'Intellytech',
    model:'LiteCloth LC-160RGBWW 2.0',
    family:'LiteCloth 2.0',
    category:'Light',
    sourceType:'RGBWW Flexible LED Mat',
    formFactor:'Flexible Panel / Mat',
    colorMode:'RGBWW / CCT',
    control:assistedBluetoothControl('LiteCloth LC-160RGBWW 2.0',{color:true}),
    sourceUrl:SRC.products
  }
];
