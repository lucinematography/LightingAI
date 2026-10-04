const APUTURE_SIDUS_SOURCE='https://aputure.com/en-US/pages/sidus-link';
const APUTURE_SIDUS_HELP='https://help.aputure.com/en/general-help/sidus-link-control';
const APUTURE_SIDUS_CONTROL_SOURCE='https://help.aputure.com/en/sidus-link-pro/sidus-link-mobile/wireless-lighting-control-system';

function unique(values=[]){return [...new Set(values.filter(Boolean))]}
function hasSidusEvidence(control={}){
  const values=[
    ...(Array.isArray(control.wireless)?control.wireless:[]),
    ...(Array.isArray(control.legacyLabels)?control.legacyLabels:[])
  ].map(String);
  return values.some(value=>/sidus link|sidus bluetooth mesh/i.test(value));
}
function variableCctCapable(fixture){
  const c=fixture?.cctK;
  return !!(c&&Number.isFinite(Number(c.min))&&Number.isFinite(Number(c.max))&&Number(c.max)>Number(c.min));
}
function fullColorCapable(fixture){
  const mode=String(fixture?.colorMode||'').trim().toLowerCase();
  if(!mode) return false;
  return /rgb|full color|full-color|full spectrum color|rgbw|rgbww|hsi|cie\s*xy/.test(mode);
}

export function normalizeAputureWirelessControl(fixtures=[]){
  for(const fixture of fixtures){
    if(fixture?.manufacturer!=='Aputure') continue;
    const control=fixture.control&&typeof fixture.control==='object'&&!Array.isArray(fixture.control)
      ? fixture.control
      : {legacyLabels:Array.isArray(fixture.control)?fixture.control.map(String):[]};
    if(!hasSidusEvidence(control)) continue;
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
        note:'This fixture already carries model-scoped Sidus Link evidence. The normalization only makes the Bluetooth transport explicit; LightingAI proprietary command semantics remain locked until separately verified.'
      }
    };
    control.capabilityVerification={
      ...(control.capabilityVerification||{}),
      dim:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:[APUTURE_SIDUS_CONTROL_SOURCE],
        note:'Sidus Link documents fixture intensity control for Sidus Mesh fixtures. This proves the operator capability, not the LightingAI Bluetooth command encoding.'
      },
      ...(variableCctCapable(fixture)?{
        cct:{
          verified:true,
          scope:'official-app-capability-only',
          sourceUrls:[APUTURE_SIDUS_CONTROL_SOURCE],
          note:'Sidus Link documents CCT control for compatible variable-white, bi-color and full-spectrum fixtures. This proves operator capability only, not proprietary command encoding.'
        }
      }:{}),
      ...(fullColorCapable(fixture)?{
        color:{
          verified:true,
          scope:'official-app-capability-only',
          sourceUrls:[APUTURE_SIDUS_CONTROL_SOURCE],
          note:'Sidus Link documents HSI/RGB/xy color control for compatible color fixtures. This proves operator capability only, not proprietary command encoding.'
        }
      }:{}),
      fx:{
        verified:true,
        scope:'official-app-capability-only',
        sourceUrls:[APUTURE_SIDUS_CONTROL_SOURCE],
        note:'Sidus Link documents Effects modes for Sidus Mesh Daylight, Bi-Color, X and Full-Color fixture classes. This proves feature availability in the official app, not the LightingAI Bluetooth command encoding.'
      }
    };
    fixture.control=control;
  }
  return fixtures;
}
