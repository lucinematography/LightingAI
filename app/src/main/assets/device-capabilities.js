(function(){
'use strict';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
  sr:{title:'Mogućnosti uređaja',intro:'LightingAI proverava stvarne mogućnosti uređaja i automatski bira najbolji raspoloživi režim. Marka telefona se ne koristi za odluke.',refresh:'OSVEŽI',mode:'PRO MERENJE',camera:'KAMERA',tilt:'SENZOR NAGIBA',location:'LOKACIJA',depth:'DEPTH IZLAZ',system:'SISTEM',native:'NATIVE PRO',fallback:'OGRANIČENI / FALLBACK',planner:'PLANERI I KALKULATORI',rear:'zadnjih kamera',af:'AF',flash:'blic',yes:'da',no:'ne',gps:'GPS',network:'mreža',permission:'dozvola',granted:'odobrena',notGranted:'nije odobrena',depthYes:'dostupan',depthNo:'nije prijavljen — nije obavezan',api:'Android API',browser:'Web režim',none:'nije dostupan',note:'Depth nije potreban za osnovno PRO merenje. Ako ga uređaj pouzdano izlaže, kasnije možemo koristiti napredniji način merenja.',rotation:'rotation vector',game:'game rotation',gravity:'gravity',accelerometer:'accelerometer'},
  en:{title:'Device capabilities',intro:'LightingAI checks the device capabilities that are actually available and automatically chooses the best path. Phone brand is not used for decisions.',refresh:'REFRESH',mode:'PRO MEASUREMENT',camera:'CAMERA',tilt:'TILT SENSOR',location:'LOCATION',depth:'DEPTH OUTPUT',system:'SYSTEM',native:'NATIVE PRO',fallback:'LIMITED / FALLBACK',planner:'PLANNERS & CALCULATORS',rear:'rear cameras',af:'AF',flash:'flash',yes:'yes',no:'no',gps:'GPS',network:'network',permission:'permission',granted:'granted',notGranted:'not granted',depthYes:'available',depthNo:'not reported — not required',api:'Android API',browser:'Web mode',none:'unavailable',note:'Depth is not required for basic PRO measurement. If a device exposes it reliably, a more advanced measurement path can be enabled later.',rotation:'rotation vector',game:'game rotation',gravity:'gravity',accelerometer:'accelerometer'}
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
  const sys=c.nativeAndroid?(x.api+' '+(c.androidApi||'—')):x.browser;
  box.innerHTML=row(x.mode,mode,modeGood)+row(x.camera,cameraText,c.rearCameraCount>0||(!c.nativeAndroid&&c.cameraAny))+row(x.tilt,tiltLabel(c.tiltMode),c.tiltMode!=='none')+row(x.location,locParts.join(' · '),c.gps||c.networkLocation)+row(x.depth,c.depthOutput?x.depthYes:x.depthNo,null)+row(x.system,sys,null);
  const note=E('deviceCapabilitiesNote');if(note)note.textContent=x.note;
}
function translate(){
  if(!E('deviceCapabilitiesCard'))return;const x=t();
  E('deviceCapabilitiesTitle').textContent=x.title;
  E('deviceCapabilitiesIntro').textContent=x.intro;
  E('deviceCapabilitiesRefresh').textContent=x.refresh;
  render();
}
function init(){
  const settings=E('settings');if(!settings||E('deviceCapabilitiesCard'))return false;
  const style=document.createElement('style');style.id='deviceCapabilitiesStyle';
  style.textContent='.device-cap-grid{display:grid;gap:0;margin-top:8px}.device-cap-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #292d33;font-size:12px}.device-cap-row span{color:#9299a3}.device-cap-row b{text-align:right;color:#d9dde3}.device-cap-row b.good{color:#b8f0d1}.device-cap-row b.limited{color:#f5dd91}.device-cap-note{font-size:11px;line-height:1.45;color:#9299a3;margin:10px 0 0}';document.head.appendChild(style);
  const card=document.createElement('div');card.id='deviceCapabilitiesCard';card.className='card';
  card.innerHTML='<h2 id="deviceCapabilitiesTitle" style="margin-top:0"></h2><p id="deviceCapabilitiesIntro" class="muted small"></p><div id="deviceCapabilitiesBody" class="device-cap-grid"></div><p id="deviceCapabilitiesNote" class="device-cap-note"></p><div class="actions"><button id="deviceCapabilitiesRefresh" class="btn secondary" type="button"></button></div>';
  const cards=settings.querySelectorAll('.card');const before=cards.length?cards[cards.length-1]:null;if(before)settings.insertBefore(card,before);else settings.appendChild(card);
  E('deviceCapabilitiesRefresh').addEventListener('click',render);
  const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
  document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page==='settings')setTimeout(render,0)}));
  translate();return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();
