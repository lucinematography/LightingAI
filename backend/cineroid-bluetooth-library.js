// Cineroid exact-model Bluetooth lighting coverage.
// First-party Cineroid catalog/app evidence only.
// The CFL1600V app route is transport evidence; proprietary Bluetooth/GATT command/session semantics remain fail-closed.
const SRC={
  cfl1600v:'https://www.cineroid.com/upload/2020/12/2020%20CINEROID%20CATALOG_web%20%282%29.pdf',
  app:'https://www.cineroid.com/upload/2023/10/23%20Cineroid%20catalog_web2.pdf'
};

function bluetoothControl(model){
  const sourceUrls=[SRC.cfl1600v,SRC.app];
  return {
    wired:['DMX512'],
    wireless:['Bluetooth via Cineroid App'],
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Cineroid documents mobile-app control for '+model+' and documents that the Cineroid app connects by Bluetooth, but LightingAI proprietary Bluetooth/GATT discovery, pairing, services, characteristics and command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Cineroid App Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Cineroid catalogs link CFL1600V to mobile-app control and document Bluetooth as the Cineroid app transport. No proprietary command semantics are inferred.'
      }
    }
  };
}

export const CINEROID_BLUETOOTH_FIXTURES=[
  {
    id:'cineroid-cfl1600v',
    manufacturer:'Cineroid',
    model:'CFL1600V',
    family:'CFL Flexible LED Light',
    category:'Light',
    sourceType:'RGBWW Full-Color Flexible LED Panel',
    formFactor:'Flexible Panel / Mat',
    colorMode:'RGBWW / Full Color',
    cctK:{min:2700,max:6500},
    powerDrawW:240,
    cri:95,
    control:bluetoothControl('CFL1600V'),
    sourceUrl:SRC.cfl1600v
  }
];
