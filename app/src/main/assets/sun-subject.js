(function(){
  'use strict';
  const TXT={
    sr:{title:'Sunce u odnosu na subjekt',heading:'PRAVAC U KOM SUBJEKAT GLEDA',faceCamera:'GLEDA U KAMERU',turn:'OKRENI 180°',front:'FRONTALNO SVETLO NA LICU',back:'KONTRA / RIM NA SUBJEKTU',side:'BOČNO SVETLO NA LICU',three:'3/4 SVETLO NA LICU',left:'levo od lica',right:'desno od lica',below:'Sunce je ispod horizonta.',note:'Pravac subjekta je smer u kom lice gleda. Ovo je odvojeno od pravca kamere i daje tačniji opis svetla na licu.'},
    en:{title:'Sun relative to subject',heading:'DIRECTION SUBJECT IS FACING',faceCamera:'FACE CAMERA',turn:'TURN 180°',front:'FRONT LIGHT ON FACE',back:'BACK / RIM LIGHT ON SUBJECT',side:'SIDE LIGHT ON FACE',three:'3/4 LIGHT ON FACE',left:'left of face',right:'right of face',below:'Sun is below the horizon.',note:'Subject direction is where the face is pointing. It is separate from camera direction and gives a more accurate description of light on the face.'}
  };
  const el=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  const norm=a=>(a%360+360)%360;
  const signed=a=>((a+540)%360)-180;
  function inputDate(){
    const dv=el('sunDate')?.value,tv=el('sunTime')?.value||'12:00';if(!dv)return new Date();
    const d=dv.split('-').map(Number),tm=tv.split(':').map(Number);return new Date(d[0],d[1]-1,d[2],tm[0]||0,tm[1]||0,0,0);
  }
  function lightKey(r){const a=Math.abs(r);if(a<=30)return'front';if(a>=150)return'back';if(a>=60&&a<=120)return'side';return'three';}
  function update(){
    if(!el('sunSubjectCard')||!window.LightingAISun)return;
    const lat=Number(el('sunLat')?.value),lon=Number(el('sunLon')?.value),heading=norm(Number(el('sunSubjectHeading')?.value)||0);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const p=LightingAISun.position(inputDate(),lat,lon),tx=t();el('sunSubjectHeadingValue').textContent=heading.toFixed(0)+'°';
    if(p.elevation<=0){el('sunSubjectLight').textContent=tx.below;el('sunSubjectRelation').textContent='—';el('sunSubjectSun').style.transform='rotate(0deg) translateY(-70px)';return;}
    const r=signed(p.azimuth-heading),side=r===0?'':(' · '+Math.abs(r).toFixed(0)+'° '+(r>0?tx.right:tx.left));
    el('sunSubjectLight').textContent=tx[lightKey(r)];el('sunSubjectRelation').textContent=p.azimuth.toFixed(0)+'°'+side;el('sunSubjectSun').style.transform='rotate('+r+'deg) translateY(-70px)';
  }
  function faceCamera(){const c=Number(el('sunCameraHeading')?.value);if(!Number.isFinite(c))return;el('sunSubjectHeading').value=norm(c+180).toFixed(0);update();}
  function turn(){const h=Number(el('sunSubjectHeading')?.value)||0;el('sunSubjectHeading').value=norm(h+180).toFixed(0);update();}
  function translate(){if(!el('sunSubjectCard'))return;const tx=t();el('sunSubjectTitle').textContent=tx.title;el('sunSubjectHeadingLabel').textContent=tx.heading;el('sunSubjectFaceCamera').textContent=tx.faceCamera;el('sunSubjectTurn').textContent=tx.turn;el('sunSubjectNote').textContent=tx.note;update();}
  function init(){
    const camera=el('sunCameraCard');if(!camera||el('sunSubjectCard'))return false;
    const style=document.createElement('style');style.textContent='.sun-subject-head{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}.sun-subject-value{min-width:52px;text-align:right;color:#f5c542;font-weight:900;padding-bottom:11px}.sun-subject-stage{width:184px;height:184px;border:1px solid #30343b;border-radius:50%;margin:16px auto;position:relative;background:#0f1115}.sun-subject-axis{position:absolute;left:50%;top:50%;width:4px;height:66px;background:#d8dce2;transform:translate(-50%,-100%);border-radius:4px}.sun-subject-body{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:28px}.sun-subject-sun{position:absolute;left:50%;top:50%;transform-origin:0 0;font-size:25px;margin-left:-12px;margin-top:-12px}.sun-subject-light{text-align:center;color:#f5c542;font-weight:900;margin-top:6px}.sun-subject-relation{text-align:center;font-weight:800;margin-top:6px}.sun-subject-note{font-size:12px;color:#9299a3;margin-top:10px}.sun-subject-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}@media(max-width:520px){.sun-subject-actions{grid-template-columns:1fr}}';document.head.appendChild(style);
    const card=document.createElement('div');card.className='card';card.id='sunSubjectCard';card.innerHTML='<h2 id="sunSubjectTitle" style="margin-top:0"></h2><div class="sun-subject-head"><div><label class="caption" id="sunSubjectHeadingLabel"></label><input id="sunSubjectHeading" type="number" min="0" max="359" step="1" value="0"></div><div id="sunSubjectHeadingValue" class="sun-subject-value">0°</div></div><div class="sun-subject-actions"><button type="button" id="sunSubjectFaceCamera" class="btn secondary"></button><button type="button" id="sunSubjectTurn" class="btn secondary"></button></div><div class="sun-subject-stage"><div class="sun-subject-axis"></div><div class="sun-subject-body">🙂</div><div id="sunSubjectSun" class="sun-subject-sun">☀</div></div><div id="sunSubjectLight" class="sun-subject-light">—</div><div id="sunSubjectRelation" class="sun-subject-relation">—</div><div id="sunSubjectNote" class="sun-subject-note"></div>';
    camera.parentNode.insertBefore(card,camera.nextSibling);
    const c=Number(el('sunCameraHeading')?.value);if(Number.isFinite(c))el('sunSubjectHeading').value=norm(c+180).toFixed(0);
    el('sunSubjectHeading').addEventListener('input',update);el('sunSubjectFaceCamera').addEventListener('click',faceCamera);el('sunSubjectTurn').addEventListener('click',turn);
    ['sunDate','sunTime','sunLat','sunLon'].forEach(id=>el(id)?.addEventListener('change',update));
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}
    translate();return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},100);
})();
