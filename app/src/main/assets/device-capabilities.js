(function(){
'use strict';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
  sr:{title:'Mogućnosti uređaja',intro:'LightingAI proverava stvarne mogućnosti uređaja i automatski bira najbolji raspoloživi režim. Marka telefona se ne koristi za odluke.',refresh:'OSVEŽI',mode:'PRO MERENJE',camera:'KAMERA',tilt:'SENZOR NAGIBA',location:'LOKACIJA',depth:'DEPTH IZLAZ',system:'UREĐAJ',native:'NATIVE PRO',fallback:'OGRANIČENI / FALLBACK',planner:'PLANERI I KALKULATORI',rear:'zadnjih kamera',af:'AF',flash:'blic',yes:'da',no:'ne',gps:'GPS',network:'mreža',permission:'dozvola',granted:'odobrena',notGranted:'nije odobrena',depthYes:'dostupan',depthNo:'nije prijavljen — nije obavezan',api:'Android API',browser:'Web režim',none:'nije dostupan',note:'Depth nije potreban za osnovno PRO merenje. Proizvođač i model se beleže samo u dijagnostičkom izveštaju i nikada se ne koriste za izbor funkcija.',rotation:'rotation vector',game:'game rotation',gravity:'gravity',accelerometer:'accelerometer',saveReport:'SAČUVAJ IZVEŠTAJ',copyReport:'KOPIRAJ IZVEŠTAJ',saved:'Izveštaj je spreman za čuvanje.',copied:'Izveštaj je kopiran.',copyFail:'Kopiranje nije uspelo. Koristi SAČUVAJ IZVEŠTAJ.',reportInfo:'Izveštaj ne sadrži GPS koordinate, fotografije niti podatke iz scena.'},
  en:{title:'Device capabilities',intro:'LightingAI checks the device capabilities that are actually available and automatically chooses the best path. Phone brand is not used for decisions.',refresh:'REFRESH',mode:'PRO MEASUREMENT',camera:'CAMERA',tilt:'TILT SENSOR',location:'LOCATION',depth:'DEPTH OUTPUT',system:'DEVICE',native:'NATIVE PRO',fallback:'LIMITED / FALLBACK',planner:'PLANNERS & CALCULATORS',rear:'rear cameras',af:'AF',flash:'flash',yes:'yes',no:'no',gps:'GPS',network:'network',permission:'permission',granted:'granted',notGranted:'not granted',depthYes:'available',depthNo:'not reported — not required',api:'Android API',browser:'Web mode',none:'unavailable',note:'Depth is not required for basic PRO measurement. Manufacturer and model are recorded only in the diagnostic report and are never used for feature routing.',rotation:'rotation vector',game:'game rotation',gravity:'gravity',accelerometer:'accelerometer',saveReport:'SAVE REPORT',copyReport:'COPY REPORT',saved:'The report is ready to save.',copied:'Report copied.',copyFail:'Copy failed. Use SAVE REPORT.',reportInfo:'The report does not contain GPS coordinates, photos, or scene data.'}
};
const t=()=>TXT[lang()];
let capabilities=null;

function probe(){
  try{
    if(window.Android&&typeof Android.getDeviceCapabilities==='function'){
      const raw=Android.getDeviceCapabilities();
      const parsed=JSON.parse(raw||'{}');
      if(parsed&&typeof parsed==='object')return parsed;
    }
  }catch(e){}
  return {
    nativeAndroid:false,
    androidApi:null,
    cameraAny:!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia),
    rearCameraCount:null,
    autofocus:null,
    flash:null,
    depthOutput:false,
    cameraPermission:null,
    tiltMode:typeof window.DeviceOrientationEvent!=='undefined'?'web_orientation':'none',
    gps:!!navigator.geolocation,
    networkLocation:false,
    locationPermission:null,
    nativeProAvailable:false
  };
}
function yesNo(v){return v===true?t().yes:v===false?t().no:'—'}
function tiltLabel(mode){const x=t();return mode==='rotation_vector'?x.rotation:mode==='game_rotation_vector'?x.game:mode==='gravity'?x.gravity:mode==='accelerometer'?x.accelerometer:mode==='web_orientation'?'DeviceOrientation':x.none}
function row(label,value,good){return '<div class="device-cap-row"><span>'+label+'</span><b class="'+(good===true?'good':good===false?'limited':'')+'">'+value+'</b></div>'}
function systemLabel(c){
  if(!c.nativeAndroid)return t().browser;
  const bits=[];
  if(c.manufacturer||c.model)bits.push(((c.manufacturer||'')+' '+(c.model||'')).trim());
  bits.push(t().api+' '+(c.androidApi||'—'));
  if(c.androidRelease)bits.push('Android '+c.androidRelease);
  if(c.appVersionName)bits.push('LightingAI '+c.appVersionName);
  return bits.join(' · ');
}
function render(){
  const box=E('deviceCapabilitiesBody');if(!box)return;
  capabilities=probe();window.LightingAIDeviceCapabilities=capabilities;
  try{window.dispatchEvent(new CustomEvent('lightingai:capabilities',{detail:capabilities}))}catch(e){}
  const x=t(),c=capabilities;
  let mode=x.planner,modeGood=null;
  if(c.nativeProAvailable){mode=x.native;modeGood=true;}
  else if(c.cameraAny){mode=x.fallback;modeGood=false;}
  const cameraCount=c.rearCameraCount===null?'—':String(c.rearCameraCount);
  const cameraText=c.nativeAndroid?(cameraCount+' '+x.rear+' · '+x.af+': '+yesNo(c.autofocus)+' · '+x.flash+': '+yesNo(c.flash)):(c.cameraAny?x.browser:x.none);
  const locParts=[];
  if(c.gps)locParts.push(x.gps);
  if(c.networkLocation)locParts.push(x.network);
  if(!locParts.length)locParts.push(x.none);
  if(c.locationPermission!==null)locParts.push(x.permission+': '+(c.locationPermission?x.granted:x.notGranted));
  var deviceLabel=(c.manufacturer&&String(c.manufacturer).trim())?String(c.manufacturer).trim():x.system;
  box.innerHTML=row(x.mode,mode,modeGood)+row(x.camera,cameraText,c.rearCameraCount>0||(!c.nativeAndroid&&c.cameraAny))+row(x.tilt,tiltLabel(c.tiltMode),c.tiltMode!=='none')+row(x.location,locParts.join(' · '),c.gps||c.networkLocation)+row(x.depth,c.depthOutput?x.depthYes:x.depthNo,null)+row(deviceLabel,systemLabel(c),null);
  const note=E('deviceCapabilitiesNote');if(note)note.textContent=x.note;
  const info=E('deviceCapabilitiesReportInfo');if(info)info.textContent=x.reportInfo;
}
function buildReport(){
  const c=probe();
  return {
    report:'LightingAI device compatibility',
    reportVersion:1,
    createdAt:new Date().toISOString(),
    language:lang(),
    capabilities:c,
    webRuntime:{
      userAgent:navigator.userAgent||'',
      mediaDevices:!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia),
      geolocation:!!navigator.geolocation,
      deviceOrientation:typeof window.DeviceOrientationEvent!=='undefined',
      androidBridge:!!window.Android
    }
  };
}
function reportText(){return JSON.stringify(buildReport(),null,2)}
function reportFilename(){
  const d=new Date(),p=n=>String(n).padStart(2,'0');
  return 'LightingAI-device-report-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+'.json';
}
function status(text){const s=E('deviceCapabilitiesReportStatus');if(s)s.textContent=text||''}
async function copyReport(){
  const text=reportText();
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);status(t().copied);return;}
  }catch(e){}
  try{
    const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();area.setSelectionRange(0,area.value.length);const ok=document.execCommand('copy');area.remove();if(ok){status(t().copied);return;}
  }catch(e){}
  status(t().copyFail);
}
function saveReport(){
  const text=reportText();
  if(window.Android&&typeof Android.saveText==='function'){
    try{Android.saveText(reportFilename(),text);status(t().saved);return;}catch(e){}
  }
  copyReport();
}
function translate(){
  if(!E('deviceCapabilitiesCard'))return;const x=t();
  E('deviceCapabilitiesTitle').textContent=x.title;
  E('deviceCapabilitiesIntro').textContent=x.intro;
  E('deviceCapabilitiesRefresh').textContent=x.refresh;
  E('deviceCapabilitiesSaveReport').textContent=x.saveReport;
  E('deviceCapabilitiesCopyReport').textContent=x.copyReport;
  render();
}
function init(){
  const settings=E('settings');if(!settings||E('deviceCapabilitiesCard'))return false;
  const style=document.createElement('style');style.id='deviceCapabilitiesStyle';
  style.textContent='.device-cap-grid{display:grid;gap:0;margin-top:8px}.device-cap-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #292d33;font-size:12px}.device-cap-row span{color:#c2c8d1}.device-cap-row b{text-align:right;color:#eef1f5}.device-cap-row b.good{color:#b8f0d1}.device-cap-row b.limited{color:#f5dd91}.device-cap-note,.device-cap-report-info,.device-cap-report-status{font-size:11px;line-height:1.45;color:#c2c8d1;margin:10px 0 0}.device-cap-report-status{min-height:16px;color:#b8f0d1}';document.head.appendChild(style);
  const card=document.createElement('div');card.id='deviceCapabilitiesCard';card.className='card';
  card.innerHTML='<h2 id="deviceCapabilitiesTitle" style="margin-top:0"></h2><p id="deviceCapabilitiesIntro" class="muted small"></p><div id="deviceCapabilitiesBody" class="device-cap-grid"></div><p id="deviceCapabilitiesNote" class="device-cap-note"></p><p id="deviceCapabilitiesReportInfo" class="device-cap-report-info"></p><div class="actions"><button id="deviceCapabilitiesRefresh" class="btn secondary" type="button"></button><button id="deviceCapabilitiesSaveReport" class="btn primary" type="button"></button><button id="deviceCapabilitiesCopyReport" class="btn secondary" type="button"></button></div><div id="deviceCapabilitiesReportStatus" class="device-cap-report-status"></div>';
  const cards=settings.querySelectorAll('.card');const before=cards.length?cards[cards.length-1]:null;if(before)settings.insertBefore(card,before);else settings.appendChild(card);
  E('deviceCapabilitiesRefresh').addEventListener('click',render);
  E('deviceCapabilitiesSaveReport').addEventListener('click',saveReport);
  E('deviceCapabilitiesCopyReport').addEventListener('click',copyReport);
  const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
  document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page==='settings')setTimeout(render,0)}));
  translate();return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();
