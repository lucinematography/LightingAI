// ROXX exact-model direct-Bluetooth lighting coverage.
// First-party ROXX product/manual evidence only.
// Integrated Bluetooth / ROXX.APP transport is model-scoped; proprietary BLE/GATT command/session semantics remain fail-closed.
const SRC={
  showTw:'https://roxxlight.com/e-show-tw/',
  showFc:'https://roxxlight.com/wp-content/uploads/2021/06/manual-e-show-fc-rev-01.pdf',
  miniTw:'https://roxxlight.com/e-show-mini-tw/',
  miniManual:'https://roxxlight.com/wp-content/uploads/2025/05/manual-e-show-mini-tw-fc-rev-1.pdf',
  appManual:'https://roxxlight.com/wp-content/uploads/2023/08/manual-roxx-app-rev-03.pdf'
};

function capabilityVerification(sourceUrls,{cct=false,color=false}={}){
  const out={
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'ROXX documents direct ROXX.APP control together with fixture dimming for this exact model. This proves operator capability only, not LightingAI BLE command encoding.'}
  };
  if(cct){
    out.cct={verified:true,scope:'official-app-capability-only',sourceUrls,note:'ROXX documents tunable-white/CCT control for this exact TW+ model together with direct ROXX.APP Bluetooth control. This proves operator capability only.'};
  }
  if(color){
    out.color={verified:true,scope:'official-app-capability-only',sourceUrls,note:'ROXX documents full-color fixture control together with direct ROXX.APP Bluetooth control for this exact FC model. This proves operator capability only.'};
  }
  return out;
}

function bluetoothControl(sourceUrls,model,opts={}){
  return {
    wired:['DMX512','RDM'],
    wireless:['Bluetooth Low Energy via ROXX.APP','LumenRadio CRMX / wireless DMX'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'ROXX documents integrated Bluetooth/ROXX.APP control for '+model+', but LightingAI proprietary BLE/GATT discovery, pairing, service/characteristic UUIDs and command/session semantics are not production-verified',
      'CRMX/W-DMX is a separate wireless-DMX transport and is not treated as Bluetooth app control'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'ROXX integrated BLE / ROXX.APP',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party ROXX exact-model pages/manuals explicitly confirm direct Bluetooth app control without additional hardware. LightingAI proprietary BLE/GATT semantics remain locked pending physical capture/replay.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,opts)
  };
}

export const ROXX_BLUETOOTH_FIXTURES=[
  {
    id:'roxx-e-show-tw-plus',
    manufacturer:'ROXX',
    model:'E.SHOW TW+',
    family:'E.SHOW',
    category:'Light',
    sourceType:'Tunable White LED Spotlight',
    formFactor:'Spotlight / Wash',
    colorMode:'Tunable White / CCT',
    control:bluetoothControl([SRC.showTw,SRC.appManual],'E.SHOW TW+',{cct:true}),
    sourceUrl:SRC.showTw
  },
  {
    id:'roxx-e-show-fc',
    manufacturer:'ROXX',
    model:'E.SHOW FC',
    family:'E.SHOW',
    category:'Light',
    sourceType:'Full-Color LED Spotlight',
    formFactor:'Spotlight / Wash',
    colorMode:'RGB / Full Color',
    control:bluetoothControl([SRC.showFc,SRC.appManual],'E.SHOW FC',{color:true}),
    sourceUrl:SRC.showFc
  },
  {
    id:'roxx-e-show-mini-tw-plus',
    manufacturer:'ROXX',
    model:'E.SHOW mini TW+',
    family:'E.SHOW mini',
    category:'Light',
    sourceType:'Tunable White LED Spotlight',
    formFactor:'Compact Spotlight / Wash',
    colorMode:'Tunable White / CCT',
    powerDrawW:100,
    control:bluetoothControl([SRC.miniTw,SRC.miniManual,SRC.appManual],'E.SHOW mini TW+',{cct:true}),
    sourceUrl:SRC.miniTw
  },
  {
    id:'roxx-e-show-mini-fc',
    manufacturer:'ROXX',
    model:'E.SHOW mini FC',
    family:'E.SHOW mini',
    category:'Light',
    sourceType:'Full-Color LED Spotlight',
    formFactor:'Compact Spotlight / Wash',
    colorMode:'RGB / Full Color',
    powerDrawW:100,
    control:bluetoothControl([SRC.miniManual,SRC.appManual],'E.SHOW mini FC',{color:true}),
    sourceUrl:SRC.miniManual
  }
];
