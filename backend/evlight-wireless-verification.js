const EVLIGHT_GEMX21_SOURCE='https://www.evlightprofessional.com/quality-led-soft-light-panel-63424122.html';
const EVLIGHT_GEM2X1ST_SOURCE='https://www.evlightprofessional.com/quality-led-soft-light-panel-63400265.html';
const EVLIGHT_GEMX24ST_SOURCE='https://www.evlightpro.com/led-soft-light-panel/68692360.html';

function unique(values=[]){return [...new Set(values.filter(Boolean))]}
function list(value){return Array.isArray(value)?value.filter(Boolean).map(String):[]}
function hasBluetooth(values=[]){return values.some(v=>/(^|[^a-z0-9])(bluetooth|ble)([^a-z0-9]|$)/i.test(String(v)))}
function hasWifi(values=[]){return values.some(v=>/(^|[^a-z0-9])wi[ -]?fi([^a-z0-9]|$)/i.test(String(v)))}

function officialWirelessSources(fixture){
  const ids={
    'evlight-gemx21-hard':[EVLIGHT_GEMX21_SOURCE],
    'evlight-gem2x1st':[EVLIGHT_GEM2X1ST_SOURCE],
    'evlight-gemx24-st':[EVLIGHT_GEMX24ST_SOURCE]
  };
  return unique([
    fixture?.sourceUrl,
    ...(fixture?.control?.sourceUrls||[]),
    ...(ids[fixture?.id]||[])
  ]).filter(url=>/^https:\/\/(?:www\.)?(?:evlightprofessional\.com|(?:[a-z]{2}\.)?evlightpro\.com)\//i.test(String(url)));
}

export function normalizeEvLightWirelessVerification(fixtures=[]){
  for(const fixture of fixtures){
    if(fixture?.manufacturer!=='EV Light') continue;
    const control=fixture.control&&typeof fixture.control==='object'&&!Array.isArray(fixture.control)?fixture.control:null;
    if(!control) continue;
    const values=[...list(control.wireless),...list(control.directLightingAI)];
    const bt=hasBluetooth(values);
    const wifi=hasWifi(values);
    if(!bt&&!wifi) continue;
    const sources=officialWirelessSources(fixture);
    if(!sources.length) continue;

    const verification={...(control.wirelessVerification||{})};
    if(bt){
      verification.bluetooth={
        verified:true,
        family:'EV Light Bluetooth App Control',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'EV Light documents Bluetooth app control for this fixture family/model. This verifies transport capability only; LightingAI command semantics remain locked until the vendor protocol is separately verified.'
      };
    }
    if(wifi){
      verification.wifi={
        verified:true,
        family:'EV Light WiFi-DMX / App Control',
        scope:'transport-capability-only',
        sourceUrls:sources,
        note:'EV Light documents WiFi-DMX/app control for this fixture family/model. This verifies transport capability only; LightingAI discovery/session and command semantics remain locked until separately verified.'
      };
    }
    fixture.control={
      ...control,
      sourceUrls:unique([...(control.sourceUrls||[]),...sources]),
      wirelessVerification:verification
    };
  }
  return fixtures;
}
