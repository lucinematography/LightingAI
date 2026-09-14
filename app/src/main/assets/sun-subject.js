(function(){
  'use strict';
  const TXT={
    sr:{title:'Sunce u odnosu na subjekt',heading:'PRAVAC U KOM SUBJEKAT GLEDA',faceCamera:'GLEDA U KAMERU',turn:'OKRENI 180°',front:'FRONTALNO SVETLO NA LICU',back:'KONTRA / RIM NA SUBJEKTU',side:'BOČNO SVETLO NA LICU',three:'3/4 SVETLO NA LICU',left:'levo od lica',right:'desno od lica',below:'Sunce je ispod horizonta.',note:'Pravac subjekta je smer u kom lice gleda. Ovo je odvojeno od pravca kamere i daje tačniji opis svetla na licu.',timeline:'Svetlo na licu kroz dan',timelineNote:'Dodirni period da prebaciš SUNCE na sredinu tog termina. Periodi važe dok je Sunce iznad horizonta.',noDaylight:'Nema dnevnog svetla za izabrani datum i lokaciju.'},
    en:{title:'Sun relative to subject',heading:'DIRECTION SUBJECT IS FACING',faceCamera:'FACE CAMERA',turn:'TURN 180°',front:'FRONT LIGHT ON FACE',back:'BACK / RIM LIGHT ON SUBJECT',side:'SIDE LIGHT ON FACE',three:'3/4 LIGHT ON FACE',left:'left of face',right:'right of face',below:'Sun is below the horizon.',note:'Subject direction is where the face is pointing. It is separate from camera direction and gives a more accurate description of light on the face.',timeline:'Face light through the day',timelineNote:'Tap a period to move SUN to the middle of that window. Periods apply while the Sun is above the horizon.',noDaylight:'No daylight for the selected date and location.'}
  };
  const el=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  const norm=a=>(a%360+360)%360;
  const signed=a=>((a+540)%360)-180;
  const pad=n=>String(n).padStart(2,'0');
  function inputDate(){
    const dv=el('sunDate')?.value,tv=el('sunTime')?.value||'12:00';if(!dv)return new Date();
    const d=dv.split('-').map(Number),tm=tv.split(':').map(Number);return new Date(d[0],d[1]-1,d[2],tm[0]||0,tm[1]||0,0,0);
  }
  function dayStart(){const d=inputDate();d.setHours(0,0,0,0);return d;}
  function lightKey(r){const a=Math.abs(r);if(a<=30)return'front';if(a>=150)return'back';if(a>=60&&a<=120)return'side';return'three';}
  function timeText(d){return pad(d.getHours())+':'+pad(d.getMinutes());}
  function buildTimeline(lat,lon,heading){
    const tx=t(),start=dayStart(),samples=[];
    for(let m=0;m<=1440;m+=15){const dt=new Date(start.getTime()+m*60000),p=LightingAISun.position(dt,lat,lon);if(p.elevation>0)samples.push({time:dt,key:lightKey(signed(p.azimuth-heading))});}
    if(!samples.length)return '<div class="sun-subject-empty">'+tx.noDaylight+'</div>';
    const groups=[];let g={start:samples[0].time,end:samples[0].time,key:samples[0].key};
    for(let i=1;i<samples.length;i++){const s=samples[i];if(s.key===g.key&&s.time-g.end<=16*60000)g.end=s.time;else{groups.push(g);g={start:s.time,end:s.time,key:s.key};}}
    groups.push(g);
    return groups.map(x=>{const end=new Date(x.end.getTime()+15*60000),mid=new Date(x.start.getTime()+(end-x.start)/2);return '<button type="button" class="sun-subject-slot" data-time="'+timeText(mid)+'"><b>'+timeText(x.start)+'–'+timeText(end)+'</b><span>'+tx[x.key]+'</span><span class="sun-subject-jump">›</span></button>';}).join('');
  }
  function jumpToTimeline(ev){const slot=ev.target.closest('.sun-subject-slot[data-time]');if(!slot)return;const input=el('sunTime');if(!input)return;input.value=slot.dataset.time;input.dispatchEvent(new Event('change',{bubbles:true}));}
  function update(){
    if(!el('sunSubjectCard')||!window.LightingAISun)return;
    const lat=Number(el('sunLat')?.value),lon=Number(el('sunLon')?.value),heading=norm(Number(el('sunSubjectHeading')?.value)||0);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const p=LightingAISun.position(inputDate(),lat,lon),tx=t();el('sunSubjectHeadingValue').textContent=heading.toFixed(0)+'°';el('sunSubjectTimeline').innerHTML=buildTimeline(lat,lon,heading);
    if(p.elevation<=0){el('sunSubjectLight').textContent=tx.below;el('sunSubjectRelation').textContent='—';el('sunSubjectSun').style.transform='rotate(0deg) translateY(-70px)';return;}
    const r=signed(p.azimuth-heading),side=r===0?'':(' · '+Math.abs(r).toFixed(0)+'° '+(r>0?tx.right:tx.left));
    el('sunSubjectLight').textContent=tx[lightKey(r)];el('sunSubjectRelation').textContent=p.azimuth.toFixed(0)+'°'+side;el('sunSubjectSun').style.transform='rotate('+r+'deg) translateY(-70px)';
  }
  function faceCamera(){const c=Number(el('sunCameraHeading')?.value);if(!Number.isFinite(c))return;el('sunSubjectHeading').value=norm(c+180).toFixed(0);update();}
  function turn(){const h=Number(el('sunSubjectHeading')?.value)||0;el('sunSubjectHeading').value=norm(h+180).toFixed(0);update();}
  function translate(){if(!el('sunSubjectCard'))return;const tx=t();el('sunSubjectTitle').textContent=tx.title;el('sunSubjectHeadingLabel').textContent=tx.heading;el('sunSubjectFaceCamera').textContent=tx.faceCamera;el('sunSubjectTurn').textContent=tx.turn;el('sunSubjectNote').textContent=tx.note;el('sunSubjectTimelineTitle').textContent=tx.timeline;el('sunSubjectTimelineNote').textContent=tx.timelineNote;update();}
  function init(){
    const camera=el('sunCameraCard');if(!camera||el('sunSubjectCard'))return false;
    const style=document.createElement('style');style.textContent='.sun-subject-head{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}.sun-subject-value{min-width:52px;text-align:right;color:#f5c542;font-weight:900;padding-bottom:11px}.sun-subject-stage{width:184px;height:184px;border:1px solid #30343b;border-radius:50%;margin:16px auto;position:relative;background:#0f1115}.sun-subject-axis{position:absolute;left:50%;top:50%;width:4px;height:66px;background:#d8dce2;transform:translate(-50%,-100%);border-radius:4px}.sun-subject-body{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:28px}.sun-subject-sun{position:absolute;left:50%;top:50%;transform-origin:0 0;font-size:25px;margin-left:-12px;margin-top:-12px}.sun-subject-light{text-align:center;color:#f5c542;font-weight:900;margin-top:6px}.sun-subject-relation{text-align:center;font-weight:800;margin-top:6px}.sun-subject-note,.sun-subject-timeline-note{font-size:12px;color:#9299a3;margin-top:10px}.sun-subject-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.sun-subject-timeline{margin-top:10px;border-top:1px solid #292d33}.sun-subject-slot{width:100%;display:grid;grid-template-columns:96px 1fr 18px;gap:10px;align-items:center;padding:11px 0;border:0;border-bottom:1px solid #292d33;background:transparent;color:inherit;text-align:left;font:inherit;font-size:12px}.sun-subject-slot b{color:#f5c542}.sun-subject-slot:active{background:#1a1e24}.sun-subject-jump{text-align:right;color:#f5c542;font-size:20px}.sun-subject-empty{padding:12px 0;color:#9299a3;font-size:12px}@media(max-width:520px){.sun-subject-actions{grid-template-columns:1fr}}';document.head.appendChild(style);
    const card=document.createElement('div');card.className='card';card.id='sunSubjectCard';card.innerHTML='<h2 id="sunSubjectTitle" style="margin-top:0"></h2><div class="sun-subject-head"><div><label class="caption" id="sunSubjectHeadingLabel"></label><input id="sunSubjectHeading" type="number" min="0" max="359" step="1" value="0"></div><div id="sunSubjectHeadingValue" class="sun-subject-value">0°</div></div><div class="sun-subject-actions"><button type="button" id="sunSubjectFaceCamera" class="btn secondary"></button><button type="button" id="sunSubjectTurn" class="btn secondary"></button></div><div class="sun-subject-stage"><div class="sun-subject-axis"></div><div class="sun-subject-body">🙂</div><div id="sunSubjectSun" class="sun-subject-sun">☀</div></div><div id="sunSubjectLight" class="sun-subject-light">—</div><div id="sunSubjectRelation" class="sun-subject-relation">—</div><div id="sunSubjectNote" class="sun-subject-note"></div><h3 id="sunSubjectTimelineTitle" style="margin:18px 0 0"></h3><div id="sunSubjectTimelineNote" class="sun-subject-timeline-note"></div><div id="sunSubjectTimeline" class="sun-subject-timeline"></div>';
    camera.parentNode.insertBefore(card,camera.nextSibling);
    const c=Number(el('sunCameraHeading')?.value);if(Number.isFinite(c))el('sunSubjectHeading').value=norm(c+180).toFixed(0);
    el('sunSubjectHeading').addEventListener('input',update);el('sunSubjectFaceCamera').addEventListener('click',faceCamera);el('sunSubjectTurn').addEventListener('click',turn);el('sunSubjectTimeline').addEventListener('click',jumpToTimeline);
    ['sunDate','sunTime','sunLat','sunLon'].forEach(id=>el(id)?.addEventListener('change',update));
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}
    translate();return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},100);
})();
