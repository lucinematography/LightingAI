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
    fixture.control=control;
  }
  return fixtures;
}
