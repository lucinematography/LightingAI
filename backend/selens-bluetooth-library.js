// Selens exact-model direct-Bluetooth lighting coverage.
// First-party Selens catalog/app evidence only.
// Transport and operator capabilities are model-scoped; proprietary Bluetooth command/session semantics remain fail-closed.
const SRC={
  catalog:'https://selens.com/wp-content/uploads/2025/03/Selens-catalogue.pdf',
  app:'https://selens.com/app-download/'
};

function capabilityVerification(sourceUrls){
  return {
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Selens Link officially supports brightness control for compatible Selens LED lights, and the Selens catalog lists Selens Link App control for these exact models. This proves operator capability only, not LightingAI Bluetooth command encoding.'},
    cct:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Selens Link officially supports color-temperature control for compatible Selens LED lights, and the Selens catalog lists Selens Link App control for these exact models. This proves operator capability only.'},
    color:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'Selens Link officially supports RGB value control for compatible Selens LED lights, and these exact models are RGBACL panels listed with Selens Link App control. This proves operator capability only.'}
  };
}

function bluetoothControl(model){
  const sourceUrls=[SRC.catalog,SRC.app];
  return {
    wired:['DMX512','Art-Net'],
    wireless:['Bluetooth via Selens Link app','2.4 GHz remote'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Selens documents Selens Link App control for '+model+' and its official app page identifies Bluetooth transport, but LightingAI proprietary Bluetooth command/session semantics are not production-verified',
      'The separate 2.4 GHz remote path is not treated as Bluetooth or Wi-Fi in this checkpoint'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Selens Link Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Selens catalog names Selens Link App as a control method for this exact model, while the official Selens Link page states that compatible Selens LED lights are controlled via Bluetooth. LightingAI proprietary Bluetooth command/session semantics remain locked.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls)
  };
}

export const SELENS_BLUETOOTH_FIXTURES=[
  {
    id:'selens-slc4-p400s',
    manufacturer:'Selens',
    model:'Apollo P400S / SLC4-P400S',
    family:'Apollo RGBACL Panel',
    category:'Light',
    sourceType:'RGBACL LED Panel Light',
    formFactor:'Panel',
    colorMode:'RGBACL / CCT',
    powerDrawW:400,
    cctK:{min:2000,max:20000},
    cri:96,
    tlci:96,
    pixelZones:4,
    control:bluetoothControl('Apollo P400S / SLC4-P400S'),
    sourceUrl:SRC.catalog
  },
  {
    id:'selens-slc4-p800s',
    manufacturer:'Selens',
    model:'Apollo P800S / SLC4-P800S',
    family:'Apollo RGBACL Panel',
    category:'Light',
    sourceType:'RGBACL LED Panel Light',
    formFactor:'Panel',
    colorMode:'RGBACL / CCT',
    powerDrawW:800,
    cctK:{min:2000,max:20000},
    cri:96,
    tlci:96,
    pixelZones:8,
    control:bluetoothControl('Apollo P800S / SLC4-P800S'),
    sourceUrl:SRC.catalog
  }
];
