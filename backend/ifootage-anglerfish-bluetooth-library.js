// iFootage Anglerfish exact-model direct-Bluetooth lighting coverage.
// First-party iFootage product/support evidence only.
// Transport and operator capabilities are model-scoped; proprietary BLE/GATT command/session semantics remain fail-closed.
const SRC={
  sl400bns:'https://www.ifootagegear.com/pages/product-support-400bns',
  sl200bna:'https://www.ifootagegear.com/pages/product-support-anglerfish-sl1-200bna',
  sl320dn:'https://www.ifootagegear.com/pages/product-support-anglerfish-sl1-320dn',
  sl220dn:'https://eu.ifootagegear.com/products/anglerfish-sl1-220dn',
  sl60dn:'https://eu.ifootagegear.com/collections/lighting-collection/products/anglerfish-sl1-60dn',
  hl1c4:'https://www.ifootagegear.com/pages/product-support-anglerfish-handy-light-hl1-c4'
};

function capabilityVerification(sourceUrls,{cct=false,color=false}={}){
  const out={
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'iFootage documents Lumin/Lumin+ app control for this exact model, including brightness control. This proves operator capability only, not LightingAI Bluetooth command encoding.'}
  };
  if(cct){
    out.cct={verified:true,scope:'official-app-capability-only',sourceUrls,note:'iFootage documents adjustable color temperature for this exact model together with Bluetooth Lumin/Lumin+ app control. This proves operator capability only.'};
  }
  if(color){
    out.color={verified:true,scope:'official-app-capability-only',sourceUrls,note:'iFootage documents Bluetooth Lumin app color control for this exact RGBW model. This proves operator capability only.'};
  }
  return out;
}

function bluetoothControl(sourceUrl,model,capabilities={}){
  const sourceUrls=[sourceUrl];
  return {
    wired:[],
    wireless:['Bluetooth via iFootage Lumin / Lumin+ App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'iFootage documents direct Bluetooth app control for '+model+', but LightingAI proprietary BLE/GATT discovery, pairing, services, characteristics and command/session semantics are not production-verified'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'iFootage Lumin Bluetooth',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party iFootage documentation explicitly confirms Bluetooth app control for this exact model. LightingAI proprietary BLE/GATT command/session semantics remain locked pending physical capture/replay.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,capabilities)
  };
}

export const IFOOTAGE_ANGLERFISH_BLUETOOTH_FIXTURES=[
  {
    id:'ifootage-anglerfish-sl1-400bns',
    manufacturer:'iFootage',
    model:'SL1 400BNS',
    family:'Anglerfish SL1',
    category:'Light',
    sourceType:'Bi-Color COB LED Spotlight',
    formFactor:'Spotlight / Monolight',
    colorMode:'Bi-Color',
    cctK:{min:2700,max:6500},
    powerDrawW:480,
    cri:98,
    tlci:99,
    control:bluetoothControl(SRC.sl400bns,'SL1 400BNS',{cct:true}),
    sourceUrl:SRC.sl400bns
  },
  {
    id:'ifootage-anglerfish-sl1-200bna',
    manufacturer:'iFootage',
    model:'SL1 200BNA',
    family:'Anglerfish SL1',
    category:'Light',
    sourceType:'Bi-Color COB LED Spotlight',
    formFactor:'Spotlight / Monolight',
    colorMode:'Bi-Color',
    cctK:{min:2700,max:6500},
    cri:98,
    tlci:99,
    control:bluetoothControl(SRC.sl200bna,'SL1 200BNA',{cct:true}),
    sourceUrl:SRC.sl200bna
  },
  {
    id:'ifootage-anglerfish-sl1-320dn',
    manufacturer:'iFootage',
    model:'SL1 320DN',
    family:'Anglerfish SL1',
    category:'Light',
    sourceType:'Daylight COB LED Spotlight',
    formFactor:'Spotlight / Monolight',
    colorMode:'Daylight',
    cctK:{min:5400,max:5800},
    cri:98,
    tlci:99,
    control:bluetoothControl(SRC.sl320dn,'SL1 320DN'),
    sourceUrl:SRC.sl320dn
  },
  {
    id:'ifootage-anglerfish-sl1-220dn',
    manufacturer:'iFootage',
    model:'SL1 220DN',
    family:'Anglerfish SL1',
    category:'Light',
    sourceType:'Daylight COB LED Spotlight',
    formFactor:'Spotlight / Monolight',
    colorMode:'Daylight',
    cctK:{min:5400,max:5800},
    control:bluetoothControl(SRC.sl220dn,'SL1 220DN'),
    sourceUrl:SRC.sl220dn
  },
  {
    id:'ifootage-anglerfish-sl1-60dn',
    manufacturer:'iFootage',
    model:'SL1 60DN',
    family:'Anglerfish SL1',
    category:'Light',
    sourceType:'Daylight COB LED Spotlight',
    formFactor:'Spotlight / Monolight',
    colorMode:'Daylight',
    cctK:{min:5400,max:5800},
    control:bluetoothControl(SRC.sl60dn,'SL1 60DN'),
    sourceUrl:SRC.sl60dn
  },
  {
    id:'ifootage-anglerfish-hl1-c4',
    manufacturer:'iFootage',
    model:'HL1 C4',
    family:'Anglerfish Handy Light',
    category:'Light',
    sourceType:'RGBW Pocket LED Light',
    formFactor:'Pocket / Handheld',
    colorMode:'RGBW / HSI / CCT',
    cctK:{min:2700,max:10000},
    powerDrawW:4,
    cri:95,
    control:bluetoothControl(SRC.hl1c4,'HL1 C4',{cct:true,color:true}),
    sourceUrl:SRC.hl1c4
  }
];
