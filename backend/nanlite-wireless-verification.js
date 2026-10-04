const NANLINK_APP_SOURCE='https://nanliteus.com/pages/free-nanlink-app';
const NANLINK_BLUETOOTH_SOURCE='https://www.nanlink.com/en/h-col-242.html';

function unique(values=[]){return [...new Set(values.filter(Boolean))]}
function list(value){return Array.isArray(value)?value.filter(Boolean).map(String):[]}
function hasBluetooth(values=[]){return values.some(v=>/(^|[^a-z0-9])(bluetooth|ble)([^a-z0-9]|$)/i.test(String(v)))}
function hasWifi(values=[]){return values.some(v=>/(^|[^a-z0-9])wi[ -]?fi([^a-z0-9]|$)/i.test(String(v))||/(^|[^a-z0-9])wlan([^a-z0-9]|$)/i.test(String(v)))}

export function normalizeNanliteWirelessVerification(fixtures=[]){
  for(const fixture of fixtures){
    if(fixture?.manufacturer!=='Nanlite') continue;
    const control=fixture.control&&typeof fixture.control==='object'&&!Array.isArray(fixture.control)?fixture.control:null;
    if(!control) continue;
    const values=[...list(control.wireless),...list(control.directLightingAI)];
    const bt=hasBluetooth(values);
    const wifi=hasWifi(values);
    if(!bt&&!wifi) continue;

    const verification={...(control.wirelessVerification||{})};
    if(bt){
      verification.bluetooth={
        verified:true,
        family:'NANLINK Bluetooth',
        scope:'transport-capability-only',
        sourceUrls:unique([fixture.sourceUrl,NANLINK_APP_SOURCE,NANLINK_BLUETOOTH_SOURCE]),
        note:'Nanlite/NANLINK documents direct Bluetooth control for compatible fixtures. This verifies transport capability only; proprietary LightingAI command semantics remain locked until separately verified.'
      };
    }
    if(wifi){
      verification.wifi={
        verified:true,
        family:'Nanlite Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls:unique([fixture.sourceUrl]),
        note:'This fixture catalog entry explicitly documents Wi-Fi control. LightingAI discovery/session and command semantics remain locked until the exact vendor implementation is verified.'
      };
    }
    fixture.control={
      ...control,
      sourceUrls:unique([...(Array.isArray(control.sourceUrls)?control.sourceUrls:[]),fixture.sourceUrl,bt?NANLINK_APP_SOURCE:null,bt?NANLINK_BLUETOOTH_SOURCE:null]),
      wirelessVerification:verification,
      capabilityVerification:{
        ...(control.capabilityVerification||{}),
        dim:{
          verified:true,
          scope:'official-app-capability-only',
          sourceUrls:[NANLINK_APP_SOURCE],
          note:'NANLINK documents app intensity control for compatible connected fixtures. This proves the operator capability, not proprietary LightingAI command encoding.'
        }
      }
    };
  }
  return fixtures;
}
