// Sengled exact-model Wi-Fi bulb coverage.
// First-party Sengled evidence only.
// LightingAI production writes remain locked until exact-model physical replay.
const SRC={
  datasheet:'https://eu.sengled.com/upload/produkte/wifi-classic/datasheet-wifi-classic-en.pdf',
  manual:'https://eu.sengled.com/upload/produkte/wifi-classic/Wifi_Classic_A60_User_Manual.pdf',
  support:'https://support.sengled.com/hc/en-us/article_attachments/360012686293'
};

function wifiControl(sourceUrls,model){
  return {
    wired:[],
    wireless:['Wi-Fi via Sengled Home App'],
    builtInWifi:true,
    builtInBluetooth:false,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'No first-party local/LAN command specification is verified here for '+model,
      'Do not infer cloud, app, IFTTT or partner integration behavior as a production LightingAI local command driver'
    ],
    sourceUrls,
    wirelessVerification:{
      wifi:{
        verified:true,
        family:'2.4 GHz Wi-Fi (IEEE 802.11 b/g/n)',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Sengled documentation verifies direct 2.4 GHz Wi-Fi connectivity, no hub requirement, and Sengled Home app control for this exact model family.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'First-party Sengled documentation confirms app dimming for this exact model.'}
    }
  };
}

export const SENGLED_WIFI_FIXTURES=[
  {
    id:'sengled-wifi-classic-e27-w11-u21',
    manufacturer:'Sengled',
    model:'Wi-Fi Classic E27 (W11-U21)',
    family:'Wi-Fi Classic',
    category:'Light',
    sourceType:'LED Bulb',
    formFactor:'Practical / Bulb',
    colorMode:'White',
    control:wifiControl([SRC.datasheet,SRC.manual,SRC.support],'Wi-Fi Classic E27 (W11-U21)'),
    sourceUrl:SRC.datasheet
  },
  {
    id:'sengled-wifi-classic-b22-w11-u31',
    manufacturer:'Sengled',
    model:'Wi-Fi Classic B22 (W11-U31)',
    family:'Wi-Fi Classic',
    category:'Light',
    sourceType:'LED Bulb',
    formFactor:'Practical / Bulb',
    colorMode:'White',
    control:wifiControl([SRC.datasheet,SRC.manual,SRC.support],'Wi-Fi Classic B22 (W11-U31)'),
    sourceUrl:SRC.datasheet
  }
];
