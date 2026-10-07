// ADJ Lighting exact-model direct-Bluetooth lighting coverage.
// First-party ADJ product evidence only.
// Aria X2 BLE transport is model-scoped; proprietary BLE/mesh/serial command semantics remain fail-closed.
const SRC={
  lp200x:'https://www.adj.com/products/cob-cannon-lp200x',
  lp200stx:'https://www.adj.com/products/cob-cannon-lp200stx',
  mirageQ6:'https://www.adj.com/products/mirage-q6-pak',
  aria:'https://www.adj.com/products/aria-x2'
};

function capabilityVerification(sourceUrls,{cct=false,color=false}={}){
  const out={
    dim:{verified:true,scope:'official-app-capability-only',sourceUrls,note:'ADJ documents Aria X2 BLE control and electronic dimming for this exact fixture. This proves operator capability only, not LightingAI BLE command encoding.'}
  };
  if(cct){
    out.cct={verified:true,scope:'official-app-capability-only',sourceUrls,note:'ADJ documents tunable white/CCT control for this exact fixture together with Aria X2 BLE control. This proves operator capability only.'};
  }
  if(color){
    out.color={verified:true,scope:'official-app-capability-only',sourceUrls,note:'ADJ documents direct color control for this exact fixture through Aria X2 BLE. This proves operator capability only.'};
  }
  return out;
}

function ariaBluetoothControl(sourceUrls,model,opts={}){
  return {
    wired:['DMX512'],
    wireless:['Bluetooth Low Energy via Aria X2 BLE App','Aria X2 proprietary wireless management / wireless DMX'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'ADJ documents embedded Aria X2 BLE control for '+model+', but LightingAI proprietary BLE services, characteristics, pairing/session state and command payload semantics are not production-verified',
      'Do not infer Aria X2 proprietary mesh/serial protocol frames, RF routing or cross-model command compatibility from the documented BLE app capability'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'ADJ Aria X2 BLE',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party ADJ exact-model documentation confirms embedded Aria X2 BLE app control. LightingAI proprietary BLE/mesh/serial semantics remain locked pending physical capture/replay.'
      }
    },
    capabilityVerification:capabilityVerification(sourceUrls,opts)
  };
}

export const ADJ_ARIA_X2_BLUETOOTH_FIXTURES=[
  {
    id:'adj-cob-cannon-lp200x',
    manufacturer:'ADJ Lighting',
    model:'COB Cannon LP200X',
    family:'COB Cannon',
    category:'Light',
    sourceType:'RGBAL COB Wash',
    formFactor:'PAR / Wash',
    colorMode:'RGBAL / CCT',
    powerDrawW:175,
    cctK:{min:2300,max:9900},
    cri:90,
    control:ariaBluetoothControl([SRC.lp200x,SRC.aria],'COB Cannon LP200X',{cct:true,color:true}),
    sourceUrl:SRC.lp200x
  },
  {
    id:'adj-cob-cannon-lp200stx',
    manufacturer:'ADJ Lighting',
    model:'COB Cannon LP200STX',
    family:'COB Cannon',
    category:'Light',
    sourceType:'RGBAL COB Wash',
    formFactor:'PAR / Wash',
    colorMode:'RGBAL / CCT',
    powerDrawW:200,
    cctK:{min:2300,max:9900},
    cri:90,
    control:ariaBluetoothControl([SRC.lp200stx,SRC.aria],'COB Cannon LP200STX',{cct:true,color:true}),
    sourceUrl:SRC.lp200stx
  },
  {
    id:'adj-mirage-q6-ip',
    manufacturer:'ADJ Lighting',
    model:'Mirage Q6 IP',
    family:'Mirage',
    category:'Light',
    sourceType:'RGBA Battery Uplight',
    formFactor:'PAR / Uplight',
    colorMode:'RGBA',
    powerDrawW:40,
    control:ariaBluetoothControl([SRC.mirageQ6,SRC.aria],'Mirage Q6 IP',{color:true}),
    sourceUrl:SRC.mirageQ6
  }
];
