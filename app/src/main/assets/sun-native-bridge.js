(function(){
'use strict';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
  sr:{finding:'Tražim lokaciju…',loaded:'Lokacija je učitana.',fail:'Lokacija nije dostupna. Koordinate možeš uneti ručno.',compassStarting:'Pokrećem native kompas…',compassOn:'Native kompas je uključen.',compassFallback:'Native kompas nije dostupan. Pokušavam WEB kompas…'},
  en:{finding:'Finding location…',loaded:'Location loaded.',fail:'Location unavailable. You can enter coordinates manually.',compassStarting:'Starting native compass…',compassOn:'Native compass enabled.',compassFallback:'Native compass unavailable. Trying WEB compass…'}
};
const t=()=>TXT[lang()];
let bypassWebCompass=false;

function hasNativeLocation(){return !!(window.Android&&typeof Android.requestNativeSunLocation==='function')}
function hasNativeCompass(){return !!(window.Android&&typeof Android.startNativeSunCompass==='function')}

function setSunStatus(text){const s=E('sunStatus');if(s)s.textContent=text;}
function setCompassStatus(text,live){const s=E('sunCameraStatus');if(!s)return;s.textContent=text;s.dataset.live=live?'1':'';}

window.LightingAINativeSunLocation=function(lat,lon,accuracy){
  lat=Number(lat);lon=Number(lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
  if(E('sunLat'))E('sunLat').value=lat.toFixed(6);
  if(E('sunLon'))E('sunLon').value=lon.toFixed(6);
  setSunStatus(t().loaded+(Number.isFinite(Number(accuracy))?' · ±'+Math.round(Number(accuracy))+' m':''));
  E('sunLat')?.dispatchEvent(new Event('change',{bubbles:true}));
  E('sunLon')?.dispatchEvent(new Event('change',{bubbles:true}));
  E('sunCalc')?.click();
};
window.LightingAINativeSunLocationError=function(){setSunStatus(t().fail)};
window.LightingAINativeSunCompassHeading=function(heading){
  heading=Number(heading);if(!Number.isFinite(heading))return;
  const input=E('sunCameraHeading');if(!input)return;
  input.value=((heading%360+360)%360).toFixed(0);
  setCompassStatus(t().compassOn,true);
  input.dispatchEvent(new Event('input',{bubbles:true}));
};
window.LightingAINativeSunCompassStatus=function(ok){
  if(ok){setCompassStatus(t().compassOn,true);return;}
  setCompassStatus(t().compassFallback,false);
  const b=E('sunCameraCompass');if(!b)return;
  bypassWebCompass=true;
  setTimeout(()=>b.click(),0);
};

document.addEventListener('click',ev=>{
  const locate=ev.target&&ev.target.closest?ev.target.closest('#sunLocate'):null;
  if(locate&&hasNativeLocation()){
    ev.preventDefault();ev.stopImmediatePropagation();
    setSunStatus(t().finding);
    try{Android.requestNativeSunLocation()}catch(e){window.LightingAINativeSunLocationError()}
    return;
  }

  const compass=ev.target&&ev.target.closest?ev.target.closest('#sunCameraCompass'):null;
  if(compass){
    if(bypassWebCompass){bypassWebCompass=false;return;}
    if(hasNativeCompass()){
      ev.preventDefault();ev.stopImmediatePropagation();
      setCompassStatus(t().compassStarting,true);
      try{Android.startNativeSunCompass()}catch(e){window.LightingAINativeSunCompassStatus(false)}
      return;
    }
  }

  const nav=ev.target&&ev.target.closest?ev.target.closest('nav button'):null;
  if(nav&&nav.dataset&&nav.dataset.page!=='sunce'&&window.Android&&typeof Android.stopNativeSunCompass==='function'){
    try{Android.stopNativeSunCompass()}catch(e){}
  }
},true);

if(!document.getElementById('lightingai-set-sketch-sun-script')){
  const s=document.createElement('script');
  s.id='lightingai-set-sketch-sun-script';
  s.src='file:///android_asset/set-sketch-sun.js';
  document.body.appendChild(s);
}
if(!document.getElementById('lightingai-shot-setup-report-script')){
  const r=document.createElement('script');
  r.id='lightingai-shot-setup-report-script';
  r.src='file:///android_asset/shot-setup-report.js';
  document.body.appendChild(r);
}
if(!document.getElementById('lightingai-lighting-ratio-script')){
  const q=document.createElement('script');
  q.id='lightingai-lighting-ratio-script';
  q.src='file:///android_asset/lighting-ratio.js';
  document.body.appendChild(q);
}
if(!document.getElementById('lightingai-dmx-patch-script')){
  const d=document.createElement('script');
  d.id='lightingai-dmx-patch-script';
  d.src='file:///android_asset/dmx-patch-planner.js';
  document.body.appendChild(d);
}
if(!document.getElementById('lightingai-dmx-export-script')){
  const x=document.createElement('script');
  x.id='lightingai-dmx-export-script';
  x.src='file:///android_asset/dmx-export.js';
  document.body.appendChild(x);
}
})();
