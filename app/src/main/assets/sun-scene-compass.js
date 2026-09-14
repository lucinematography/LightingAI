(function(){
  'use strict';
  const TXT={
    sr:{title:'Kompas scene',note:'Jedan pogled na Sunce, kameru, subjekt i smer senke za izabrano vreme.',sun:'Sunce',camera:'Kamera',subject:'Subjekt',shadow:'Senka',below:'Sunce ispod horizonta'},
    en:{title:'Scene compass',note:'One view of the Sun, camera, subject and shadow direction for the selected time.',sun:'Sun',camera:'Camera',subject:'Subject',shadow:'Shadow',below:'Sun below horizon'}
  };
  const el=id=>document.getElementById(id),norm=a=>(a%360+360)%360;
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr',t=()=>TXT[lang()];
  function inputDate(){const dv=el('sunDate')?.value,tv=el('sunTime')?.value||'12:00';if(!dv)return new Date();const d=dv.split('-').map(Number),tm=tv.split(':').map(Number);return new Date(d[0],d[1]-1,d[2],tm[0]||0,tm[1]||0,0,0);}
  function setNeedle(id,deg,hidden){const n=el(id);if(!n)return;n.style.display=hidden?'none':'block';n.style.transform='translate(-50%,-100%) rotate('+norm(deg)+'deg)';}
  function update(){
    if(!el('sunSceneCompass')||!window.LightingAISun)return;
    const lat=Number(el('sunLat')?.value),lon=Number(el('sunLon')?.value),cam=Number(el('sunCameraHeading')?.value),sub=Number(el('sunSubjectHeading')?.value);
    if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const dt=inputDate(),p=LightingAISun.position(dt,lat,lon),sh=LightingAISun.shadow(dt,lat,lon),day=p.elevation>0;
    setNeedle('sunSceneSun',p.azimuth,!day);setNeedle('sunSceneShadow',sh.azimuth,!day);setNeedle('sunSceneCamera',Number.isFinite(cam)?cam:0,false);setNeedle('sunSceneSubject',Number.isFinite(sub)?sub:0,false);
    el('sunSceneSummary').textContent=day?('☀ '+p.azimuth.toFixed(0)+'° · 🎥 '+norm(cam||0).toFixed(0)+'° · 🙂 '+norm(sub||0).toFixed(0)+'° · ▰ '+sh.azimuth.toFixed(0)+'°'):t().below;
  }
  function translate(){if(!el('sunSceneCompass'))return;const tx=t();el('sunSceneTitle').textContent=tx.title;el('sunSceneNote').textContent=tx.note;el('sunSceneLegend').innerHTML='<span>☀ '+tx.sun+'</span><span>🎥 '+tx.camera+'</span><span>🙂 '+tx.subject+'</span><span>▰ '+tx.shadow+'</span>';update();}
  function init(){
    const subject=el('sunSubjectCard');if(!subject||el('sunSceneCompass'))return false;
    const style=document.createElement('style');style.textContent='.sun-scene-note,.sun-scene-summary{font-size:12px;color:#9299a3}.sun-scene-dial{width:236px;height:236px;border:1px solid #3a3f47;border-radius:50%;margin:16px auto;position:relative;background:#0f1115}.sun-scene-dial:before,.sun-scene-dial:after{content:"";position:absolute;background:#262b32}.sun-scene-dial:before{left:50%;top:8px;bottom:8px;width:1px}.sun-scene-dial:after{top:50%;left:8px;right:8px;height:1px}.sun-scene-cardinal{position:absolute;font-size:11px;font-weight:900;color:#8f97a2}.ssc-n{top:7px;left:50%;transform:translateX(-50%)}.ssc-s{bottom:7px;left:50%;transform:translateX(-50%)}.ssc-e{right:9px;top:50%;transform:translateY(-50%)}.ssc-w{left:9px;top:50%;transform:translateY(-50%)}.sun-scene-center{position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:50%;background:#d8dce2;transform:translate(-50%,-50%);z-index:4}.sun-scene-needle{position:absolute;left:50%;top:50%;width:3px;height:87px;transform-origin:50% 100%;border-radius:3px;z-index:2}.sun-scene-sun{background:#f5c542}.sun-scene-camera{background:#e6e9ee;width:4px}.sun-scene-subject{background:#8bb8ff}.sun-scene-shadow{background:#8d6f62;width:2px;border:1px dashed #c7a79a}.sun-scene-tip{position:absolute;top:-15px;left:50%;transform:translateX(-50%);font-size:15px}.sun-scene-legend{display:grid;grid-template-columns:1fr 1fr;gap:7px;font-size:12px;margin-top:8px}.sun-scene-legend span{background:#15191e;border:1px solid #292e35;border-radius:8px;padding:8px}.sun-scene-summary{text-align:center;margin-top:10px}';document.head.appendChild(style);
    const card=document.createElement('div');card.className='card';card.id='sunSceneCompass';card.innerHTML='<h2 id="sunSceneTitle" style="margin-top:0"></h2><div id="sunSceneNote" class="sun-scene-note"></div><div class="sun-scene-dial"><div class="sun-scene-cardinal ssc-n">N</div><div class="sun-scene-cardinal ssc-e">E</div><div class="sun-scene-cardinal ssc-s">S</div><div class="sun-scene-cardinal ssc-w">W</div><div id="sunSceneSun" class="sun-scene-needle sun-scene-sun"><span class="sun-scene-tip">☀</span></div><div id="sunSceneCamera" class="sun-scene-needle sun-scene-camera"><span class="sun-scene-tip">🎥</span></div><div id="sunSceneSubject" class="sun-scene-needle sun-scene-subject"><span class="sun-scene-tip">🙂</span></div><div id="sunSceneShadow" class="sun-scene-needle sun-scene-shadow"><span class="sun-scene-tip">▰</span></div><div class="sun-scene-center"></div></div><div id="sunSceneLegend" class="sun-scene-legend"></div><div id="sunSceneSummary" class="sun-scene-summary"></div>';
    subject.parentNode.insertBefore(card,subject);
    ['sunDate','sunTime','sunLat','sunLon'].forEach(id=>el(id)?.addEventListener('change',update));el('sunCameraHeading')?.addEventListener('input',update);el('sunSubjectHeading')?.addEventListener('input',update);
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}translate();return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},100);
})();
