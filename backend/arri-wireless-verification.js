const LICO_SOURCE='https://www.arri.com/en/learn-help/lighting/tools-apps/lico';
const S60_PRO_FAQ='https://www.arri.com/en/lighting/led-panel-lights/skypanel-pro/faq';
const SKYPANEL_X_CONTROL='https://www.arri.com/en/lighting/led-panel-lights/skypanel-x/control-options';

const BLUETOOTH_IDS=new Set([
  'arri-skypanel-x21',
  'arri-skypanel-x22',
  'arri-skypanel-x23',
  'arri-skypanel-s60-pro',
  'arri-orbiter'
]);

function unique(values=[]){return [...new Set(values.filter(Boolean))]}

export function normalizeArriWirelessControl(fixtures=[]){
  for(const fixture of fixtures){
    if(fixture?.manufacturer!=='ARRI' || !BLUETOOTH_IDS.has(fixture.id)) continue;
    const control=fixture.control&&typeof fixture.control==='object'&&!Array.isArray(fixture.control)
      ? fixture.control
      : {legacyLabels:Array.isArray(fixture.control)?fixture.control.map(String):[]};
    const wireless=Array.isArray(control.wireless)?control.wireless:[];
    const btLabel=fixture.id==='arri-orbiter'
      ? 'ARRI LiCo Bluetooth 5.0 via supported USB dongle'
      : 'ARRI LiCo Bluetooth 5.0';
    const extra=fixture.id==='arri-skypanel-s60-pro'?['Wi-Fi Web Portal']:[];
    control.wireless=unique([...wireless,btLabel,...extra]);
    control.externalInterfaceRequired=unique([
      ...(Array.isArray(control.externalInterfaceRequired)?control.externalInterfaceRequired:[]),
      ...(fixture.id==='arri-orbiter'?['Supported Bluetooth 5.0 USB dongle']:[])
    ]);
    control.sourceUrls=unique([
      ...(Array.isArray(control.sourceUrls)?control.sourceUrls:[]),
      fixture.sourceUrl,
      LICO_SOURCE,
      fixture.id.startsWith('arri-skypanel-x')?SKYPANEL_X_CONTROL:null,
      fixture.id==='arri-skypanel-s60-pro'?S60_PRO_FAQ:null
    ]);
    control.wirelessVerification={
      ...(control.wirelessVerification||{}),
      bluetooth:{
        verified:true,
        family:'ARRI LiCo Bluetooth 5.0',
        scope:'transport-capability-only',
        externalInterfaceRequired:fixture.id==='arri-orbiter'?['Supported Bluetooth 5.0 USB dongle']:[],
        sourceUrls:[LICO_SOURCE],
        note:'ARRI documents LiCo Bluetooth control for SkyPanel Pro, SkyPanel X and Orbiter. Command semantics remain locked until separately verified.'
      },
      ...(fixture.id==='arri-skypanel-s60-pro'?{
        wifi:{
          verified:true,
          family:'SkyPanel Web Portal Wi-Fi',
          scope:'transport-capability-only',
          sourceUrls:[S60_PRO_FAQ],
          note:'ARRI documents Web Portal access over Wi-Fi for SkyPanel S60 Pro. LightingAI session/command semantics remain locked until separately verified.'
        }
      }:{})
    };
    fixture.control=control;
  }
  return fixtures;
}
