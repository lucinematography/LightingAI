// Philips Hue exact-model direct-Bluetooth practical-light coverage.
// First-party Philips Hue product/app evidence only.
// Bluetooth transport is exact-model scoped; Zigbee/Hue Bridge and proprietary app/session semantics remain separate and fail-closed.
const SRC={
  goTable:'https://www.philips-hue.com/en-us/p/hue-white-and-color-ambiance-hue-go-portable-table-lamp/046677576455',
  goAccent:'https://www.philips-hue.com/en-us/p/hue-white-and-color-ambiance-go-portable-table-lamp/7602031U7',
  app:'https://www.philips-hue.com/en-us/explore-hue/apps'
};

function bluetoothControl(sourceUrls,model){
  return {
    wired:[],
    wireless:['Bluetooth via Philips Hue App'],
    builtInBluetooth:true,
    directLightingAI:[],
    externalInterfaceRequired:[],
    unavailableDirectProtocols:[
      'Philips Hue documents direct Bluetooth app control for '+model+', but LightingAI BLE discovery, service/characteristic details, pairing/session state and private payload semantics are not production-verified',
      'Zigbee and Hue Bridge compatibility are separate control paths and must not be interpreted as direct Wi-Fi fixture control'
    ],
    sourceUrls,
    wirelessVerification:{
      bluetooth:{
        verified:true,
        family:'Philips Hue direct Bluetooth app control',
        scope:'transport-capability-only',
        sourceUrls,
        note:'First-party Philips Hue exact-model documentation confirms Bluetooth control via the Hue app. LightingAI proprietary Bluetooth/session semantics remain locked.'
      }
    },
    capabilityVerification:{
      dim:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Philips Hue documents app-based dimming/control for this exact model.'},
      color:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Philips Hue documents white and color ambience for this exact model.'},
      fx:{verified:true,scope:'official-product-capability-only',sourceUrls,note:'Philips Hue documents Effects compatibility for this exact model.'}
    }
  };
}

export const PHILIPS_HUE_BLUETOOTH_FIXTURES=[
  {
    id:'philips-hue-go-portable-table-lamp',
    manufacturer:'Philips Hue',
    model:'Hue Go portable table lamp',
    family:'Hue Go',
    category:'Light',
    sourceType:'RGBW Portable Practical Light',
    formFactor:'Table / Practical Light',
    colorMode:'RGBW / White and Color Ambiance',
    powerDrawW:6,
    control:bluetoothControl([SRC.goTable,SRC.app],'Hue Go portable table lamp'),
    sourceUrl:SRC.goTable
  },
  {
    id:'philips-hue-go-portable-accent-light',
    manufacturer:'Philips Hue',
    model:'Go portable accent light',
    family:'Hue Go',
    category:'Light',
    sourceType:'RGBW Portable Accent Light',
    formFactor:'Practical Light',
    colorMode:'RGBW / White and Color Ambiance',
    powerDrawW:6,
    control:bluetoothControl([SRC.goAccent,SRC.app],'Go portable accent light'),
    sourceUrl:SRC.goAccent
  }
];
