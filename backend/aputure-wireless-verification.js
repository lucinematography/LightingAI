const APUTURE_SIDUS_SOURCE='https://aputure.com/en-US/pages/sidus-link';
const APUTURE_SIDUS_HELP='https://help.aputure.com/en/general-help/sidus-link-control';

function unique(values=[]){return [...new Set(values.filter(Boolean))]}

export function normalizeAputureWirelessControl(fixtures=[]){
  for(const fixture of fixtures){
    if(fixture?.manufacturer!=='Aputure') continue;
    const control=fixture.control&&typeof fixture.control==='object'&&!Array.isArray(fixture.control)
      ? fixture.control
      : {legacyLabels:Array.isArray(fixture.control)?fixture.control.map(String):[]};
    const wireless=Array.isArray(control.wireless)?control.wireless:[];
    control.wireless=unique([...wireless,'Sidus Bluetooth Mesh']);
    control.sourceUrls=unique([
      ...(Array.isArray(control.sourceUrls)?control.sourceUrls:[]),
      fixture.sourceUrl,
      APUTURE_SIDUS_SOURCE,
      APUTURE_SIDUS_HELP
    ]);
    control.wirelessVerification={
      ...(control.wirelessVerification||{}),
      bluetooth:{
        verified:true,
        family:'Sidus Bluetooth Mesh',
        scope:'transport-capability-only',
        sourceUrls:[APUTURE_SIDUS_SOURCE,APUTURE_SIDUS_HELP],
        note:'Aputure documents Sidus Bluetooth control across Aputure fixtures. This verifies transport capability only; LightingAI proprietary command semantics remain locked until separately verified.'
      }
    };
    control.capabilityVerification={
      ...(control.capabilityVerification||{}),
      dim:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:['https://help.aputure.com/en/sidus-link-pro/sidus-link-mobile/wireless-lighting-control-system'],
        note:'Sidus Link documents fixture intensity control for Sidus Mesh fixtures. This proves the operator capability, not the LightingAI Bluetooth command encoding.'
      },
      fx:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:['https://help.aputure.com/en/sidus-link-pro/sidus-link-mobile/wireless-lighting-control-system'],
        note:'Sidus Link documents Effects modes for Sidus Mesh Daylight, Bi-Color, X and Full-Color fixture classes. This proves feature availability in the official app, not the LightingAI Bluetooth command encoding.'
      }
    };
    fixture.control=control;
  }
  return fixtures;
}
