function unique(values=[]){return [...new Set(values.filter(Boolean))]}
function list(value){return Array.isArray(value)?value.filter(Boolean).map(String):[]}
function hasBluetooth(values=[]){return values.some(v=>/(^|[^a-z0-9])(bluetooth|ble)([^a-z0-9]|$)/i.test(String(v)))}
function hasWifi(values=[]){return values.some(v=>/(^|[^a-z0-9])wi[ -]?fi([^a-z0-9]|$)/i.test(String(v))||/(^|[^a-z0-9])wlan([^a-z0-9]|$)/i.test(String(v)))}

export function normalizeAsteraWirelessVerification(fixtures=[]){
  for(const fixture of fixtures){
    if(fixture?.manufacturer!=='Astera') continue;
    const control=fixture.control&&typeof fixture.control==='object'&&!Array.isArray(fixture.control)?fixture.control:null;
    if(!control) continue;
    const values=[...list(control.wireless),...list(control.directLightingAI)];
    const bt=hasBluetooth(values);
    const wifi=hasWifi(values);
    if(!bt&&!wifi) continue;

    const sourceUrls=unique([
      fixture.sourceUrl,
      ...(Array.isArray(control.sourceUrls)?control.sourceUrls:[])
    ]).filter(url=>/^https?:///i.test(String(url)));
    if(!sourceUrls.length) continue;

    const verification={...(control.wirelessVerification||{})};
    if(bt){
      verification.bluetooth={
        verified:true,
        family:'Astera Bluetooth / BTB',
        scope:'transport-capability-only',
        sourceUrls,
        note:'Astera documentation/catalog metadata explicitly identifies Bluetooth capability for this fixture or BTB variant. This verifies transport capability only; proprietary LightingAI command semantics remain locked until physical protocol verification.'
      };
    }
    if(wifi){
      verification.wifi={
        verified:true,
        family:'Astera Wi-Fi',
        scope:'transport-capability-only',
        sourceUrls,
        note:'Astera documentation/catalog metadata explicitly identifies Wi-Fi capability for this fixture. This verifies transport capability only; LightingAI discovery/session and proprietary command semantics remain locked until verified.'
      };
    }
    fixture.control={
      ...control,
      sourceUrls,
      wirelessVerification:verification
    };
  }
  return fixtures;
}
