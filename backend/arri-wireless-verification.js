const LICO_SOURCE='https://www.arri.com/en/learn-help/lighting/tools-apps/lico';
const S60_PRO_FAQ='https://www.arri.com/en/lighting/led-panel-lights/skypanel-pro/faq';
const SKYPANEL_X_CONTROL='https://www.arri.com/en/lighting/led-panel-lights/skypanel-x/control-options';
const OMNIBAR_PRODUCT='https://www.arri.com/en/lighting/led-linear-lights/omnibar';
const OMNIBAR_TECH='https://www.arri.com/en/lighting/led-linear-lights/omnibar/omnibar-tech-data-downloads';
const OMNIBAR_APP='https://www.arri.com/en/learn/lighting/tools-apps/omnibar-app';
const OMNIBAR_FAQ='https://www.arri.com/en/lighting/led-linear-lights/omnibar/omnibar-faq';

const BLUETOOTH_IDS=new Set([
  'arri-skypanel-x21',
  'arri-skypanel-x22',
  'arri-skypanel-x23',
  'arri-skypanel-s60-pro',
  'arri-orbiter',
  'arri-omnibar-2',
  'arri-omnibar-4'
]);

function unique(values=[]){return [...new Set(values.filter(Boolean))]}

export function normalizeArriWirelessControl(fixtures=[]){
  for(const fixture of fixtures){
    if(fixture?.manufacturer!=='ARRI' || !BLUETOOTH_IDS.has(fixture.id)) continue;
    const control=fixture.control&&typeof fixture.control==='object'&&!Array.isArray(fixture.control)
      ? fixture.control
      : {legacyLabels:Array.isArray(fixture.control)?fixture.control.map(String):[]};
    const wireless=Array.isArray(control.wireless)?control.wireless:[];
    const isOmnibar=fixture.id==='arri-omnibar-2'||fixture.id==='arri-omnibar-4';
    const btLabel=isOmnibar
      ? 'ARRI Omnibar Control Bluetooth Mesh'
      : fixture.id==='arri-orbiter'
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
      isOmnibar?OMNIBAR_PRODUCT:LICO_SOURCE,
      isOmnibar?OMNIBAR_TECH:null,
      isOmnibar?OMNIBAR_APP:null,
      isOmnibar?OMNIBAR_FAQ:null,
      fixture.id.startsWith('arri-skypanel-x')?SKYPANEL_X_CONTROL:null,
      fixture.id==='arri-skypanel-s60-pro'?S60_PRO_FAQ:null
    ]);
    control.wirelessVerification={
      ...(control.wirelessVerification||{}),
      bluetooth:{
        verified:true,
        family:isOmnibar?'ARRI Omnibar Bluetooth Mesh':'ARRI LiCo Bluetooth 5.0',
        scope:'transport-capability-only',
        externalInterfaceRequired:fixture.id==='arri-orbiter'?['Supported Bluetooth 5.0 USB dongle']:[],
        sourceUrls:isOmnibar?[OMNIBAR_PRODUCT,OMNIBAR_TECH,OMNIBAR_APP,OMNIBAR_FAQ]:[LICO_SOURCE],
        note:isOmnibar?'ARRI documents integrated Bluetooth Mesh control for Omnibar 2 and Omnibar 4 through the dedicated Omnibar Control App. Proprietary command/session semantics remain locked.':'ARRI documents LiCo Bluetooth control for SkyPanel Pro, SkyPanel X and Orbiter. Command semantics remain locked until separately verified.'
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
    control.capabilityVerification={
      ...(control.capabilityVerification||{}),
      dim:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:isOmnibar?[OMNIBAR_APP,OMNIBAR_TECH]:[LICO_SOURCE],
        note:isOmnibar?'ARRI Omnibar documentation and Control App document intensity control. This proves operator capability only.':'ARRI LiCo documents dimming control for SkyPanel Pro, SkyPanel X and Orbiter. This proves operator capability only, not Bluetooth command encoding.'
      },
      ...(isOmnibar?{cct:{verified:true,scope:'official-app-capability-only',sourceUrls:[OMNIBAR_APP,OMNIBAR_TECH],note:'ARRI Omnibar Control App documents CCT control. This proves operator capability only.'}}:{}),
      color:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:isOmnibar?[OMNIBAR_APP,OMNIBAR_TECH]:[LICO_SOURCE],
        note:isOmnibar?'ARRI Omnibar Control App documents HSI/RGB/x-y/gel color control. This proves operator capability only.':'ARRI LiCo documents color control for SkyPanel Pro, SkyPanel X and Orbiter. This proves operator capability only, not Bluetooth command encoding.'
      },
      fx:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:isOmnibar?[OMNIBAR_APP,OMNIBAR_PRODUCT]:[LICO_SOURCE],
        note:isOmnibar?'ARRI Omnibar Control App documents media/pixel effects. This proves operator capability only.':'ARRI LiCo documents effects control for SkyPanel Pro, SkyPanel X and Orbiter. This proves operator capability only, not Bluetooth command encoding.'
      }
    };
    fixture.control=control;
  }
  return fixtures;
}
