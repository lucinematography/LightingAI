// Fiilex original Matrix exact-model Wi-Fi coverage.
// First-party Fiilex legacy manual/data sources only.
// Transport evidence is model-scoped; proprietary command semantics remain fail-closed.
const SRC={
  matrixManual:'https://fiilex.com/downloads/Legacy/Matrix_User_Manual_2016_0720.pdf',
  matrixData:'https://fiilex.com/downloads/Legacy/Matrix_DataSheet_20160817.pdf'
};

function matrixWifiControl(){
  return {
    wired:[],
    wireless:['WiFi via Fiilex WiFi app'],
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Fiilex documents Matrix Wi-Fi/app transport, but LightingAI Wi-Fi command/session semantics are not production-verified'
    ],
    sourceUrls:[SRC.matrixManual,SRC.matrixData],
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'Fiilex Matrix WiFi app',
        scope:'transport-capability-only',
        sourceUrls:[SRC.matrixManual,SRC.matrixData],
        note:'Fiilex documents original Matrix WiFi remote control and the Fiilex WiFi app. LightingAI command/session semantics remain locked.'
      }
    }
  };
}

export const FIILEX_MATRIX_WIFI_FIXTURES=[
  {
    id:'fiilex-matrix-original',
    manufacturer:'Fiilex',
    model:'Matrix',
    family:'Matrix',
    category:'Light',
    sourceType:'Tunable White LED Panel',
    formFactor:'Panel',
    cctK:{min:2800,max:6500},
    colorMode:'Tunable White + Hue',
    powerDrawW:320,
    control:matrixWifiControl(),
    sourceUrl:SRC.matrixManual
  }
];
