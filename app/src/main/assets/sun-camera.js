(function(){
  'use strict';
  const TXT={
    sr:{title:'Sunce u odnosu na kameru',heading:'PRAVAC KAMERE',useCompass:'🧭 KOMPAS TELEFONA',front:'Sunce je ispred kamere',right:'Sunce je desno od kamere',back:'Sunce je iza kamere',left:'Sunce je levo od kamere',backlight:'KONTRA / BACKLIGHT',frontlight:'FRONTALNO SVETLO',sidelight:'BOČNO SVETLO',threeQuarter:'3/4 SVETLO',flare:'Moguć lens flare — Sunce je blizu ose objektiva.',manual:'Unesi pravac kamere 0–359° ili koristi kompas telefona.',compassOn:'Kompas telefona je uključen.',compassUnavailable:'Kompas telefona nije dostupan. Pravac možeš uneti ručno.',timeline:'Promena svetla kroz dan',timelineNote:'Dodirni period da prebaciš SUNCE na sredinu tog termina. Periodi važe dok je Sunce iznad horizonta.',noDaylight:'Nema dnevnog svetla za izabrani datum i lokaciju.',quickTime:'BRZA PROMENA VREMENA',now:'SADA',minusHour:'−1h',plusHour:'+1h'},
    en:{title:'Sun relative to camera',heading:'CAMERA DIRECTION',useCompass:'🧭 PHONE COMPASS',front:'Sun is in front of camera',right:'Sun is right of camera',back:'Sun is behind camera',left:'Sun is left of camera',backlight:'BACKLIGHT',frontlight:'FRONT LIGHT',sidelight:'SIDE LIGHT',threeQuarter:'3/4 LIGHT',flare:'Possible lens flare — Sun is close to the lens axis.',manual:'Enter camera direction 0–359° or use the phone compass.',compassOn:'Phone compass enabled.',compassUnavailable:'Phone compass is unavailable. You can enter direction manually.',timeline:'Light changes through the day',timelineNote:'Tap a period to move SUN to the middle of that window. Periods apply while the Sun is above the horizon.',noDaylight:'No daylight for the selected date and location.',quickTime:'QUICK TIME CHANGE',now:'NOW',minusHour:'−1h',plusHour:'+1h'}
  };
  const STORE={lat:'lightingai_sun_lat_v1',lon:'lightingai_sun_lon_v1',heading:'lightingai_sun_heading_v1'};
  const el=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  const norm=a=>(a%360+360)%360;
  const signed=a=>((a+540)%360)-180;
  const pad=n=>String(n).padStart(2,'0');
  function inputDate(){
    const dv=el('sunDate')?.value,tv=el('sunTime')?.value||'12:00';
    if(!dv)return new Date();
    const d=dv.split('-').map(Number),tm=tv.split(':').map(Number);
    return new Date(d[0],d[1]-1,d[2],tm[0]||0,tm[1]||0,0,0);
  }
  function dayStart(){const d=inputDate();d.setHours(0,0,0,0);return d;}
  function relationText(r){
    const tx=t(),a=Math.abs(r);
    if(a<=45)return tx.front;
    if(r>45&&r<135)return tx.right;
    if(r<-45&&r>-135)return tx.left;
    return tx.back;
  }
  function lightKey(r){
    const a=Math.abs(r);
    if(a<=30)return 'backlight';
    if(a>=150)return 'frontlight';
    if(a>=60&&a<=120)return 'sidelight';
    return 'threeQuarter';
  }
  function lightText(r){return t()[lightKey(r)];}
  function timeText(d){return pad(d.getHours())+':'+pad(d.getMinutes());}
  function dateText(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function setDateTime(d){
    const date=el('sunDate'),time=el('sunTime');
    if(date)date.value=dateText(d);
    if(time)time.value=timeText(d);
    date?.dispatchEvent(new Event('change',{bubbles:true}));
    time?.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function setNow(){setDateTime(new Date());}
  function shiftTime(minutes){const d=inputDate();d.setMinutes(d.getMinutes()+minutes);setDateTime(d);}
  function saveState(){
    try{
      const lat=Number(el('sunLat')?.value),lon=Number(el('sunLon')?.value),heading=norm(Number(el('sunCameraHeading')?.value)||0);
      if(Number.isFinite(lat)&&lat>=-90&&lat<=90)localStorage.setItem(STORE.lat,String(lat));
      if(Number.isFinite(lon)&&lon>=-180&&lon<=180)localStorage.setItem(STORE.lon,String(lon));
      localStorage.setItem(STORE.heading,String(heading));
    }catch(e){}
  }
  function restoreState(){
    try{
      const lat=Number(localStorage.getItem(STORE.lat)),lon=Number(localStorage.getItem(STORE.lon)),heading=Number(localStorage.getItem(STORE.heading));
      if(localStorage.getItem(STORE.lat)!==null&&Number.isFinite(lat)&&lat>=-90&&lat<=90&&el('sunLat'))el('sunLat').value=lat;
      if(localStorage.getItem(STORE.lon)!==null&&Number.isFinite(lon)&&lon>=-180&&lon<=180&&el('sunLon'))el('sunLon').value=lon;
      if(localStorage.getItem(STORE.heading)!==null&&Number.isFinite(heading)&&el('sunCameraHeading'))el('sunCameraHeading').value=norm(heading).toFixed(0);
    }catch(e){}
  }
  function buildTimeline(lat,lon,heading){
    const tx=t(),start=dayStart(),samples=[];
    for(let m=0;m<1440;m+=15){
      const dt=new Date(start.getTime()+m*60000),p=LightingAISun.position(dt,lat,lon);
      if(p.elevation>0){const r=signed(p.azimuth-heading);samples.push({time:dt,key:lightKey(r)});}
    }
    if(!samples.length)return '<div class="sun-camera-empty">'+tx.noDaylight+'</div>';
    const groups=[];
    let g={start:samples[0].time,end:samples[0].time,key:samples[0].key};
    for(let i=1;i<samples.length;i++){
      const s=samples[i];
      if(s.key===g.key&&s.time-g.end<=16*60000)g.end=s.time;
      else{groups.push(g);g={start:s.time,end:s.time,key:s.key};}
    }
    groups.push(g);
    return groups.map(x=>{
      const end=new Date(x.end.getTime()+15*60000),mid=new Date(x.start.getTime()+(end-x.start)/2);
      return '<button type="button" class="sun-camera-slot" data-time="'+timeText(mid)+'"><b>'+timeText(x.start)+'–'+timeText(end)+'</b><span>'+tx[x.key]+'</span><span class="sun-camera-jump">›</span></button>';
    }).join('');
  }
  function jumpToTimeline(ev){
    const slot=ev.target.closest('.sun-camera-slot[data-time]');if(!slot)return;
    const input=el('sunTime');if(!input)return;
    input.value=slot.dataset.time;input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function update(){
    if(!el('sunCameraCard')||!window.LightingAISun)return;
    const lat=Number(el('sunLat')?.value),lon=Number(el('sunLon')?.value),heading=norm(Number(el('sunCameraHeading')?.value)||0);
    if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const p=LightingAISun.position(inputDate(),lat,lon),r=signed(p.azimuth-heading),tx=t();
    el('sunCameraRelation').textContent=relationText(r)+' • '+(r===0?'0°':Math.abs(r).toFixed(0)+'° '+(r>0?(lang()==='sr'?'desno':'right'):(lang()==='sr'?'levo':'left')));
    el('sunCameraLight').textContent=lightText(r);
    el('sunCameraFlare').textContent=Math.abs(r)<=20&&p.elevation>0?tx.flare:'';
    el('sunCameraOrbit').style.transform='rotate('+r+'deg) translateY(-72px)';
    el('sunCameraHeadingValue').textContent=heading.toFixed(0)+'°';
    el('sunCameraTimeline').innerHTML=buildTimeline(lat,lon,heading);
  }
  function translate(){
    if(!el('sunCameraCard'))return;
    const tx=t();
    el('sunCameraTitle').textContent=tx.title;el('sunCameraHeadingLabel').textContent=tx.heading;el('sunCameraCompass').textContent=tx.useCompass;el('sunCameraTimelineTitle').textContent=tx.timeline;el('sunCameraTimelineNote').textContent=tx.timelineNote;el('sunCameraQuickTimeLabel').textContent=tx.quickTime;el('sunCameraNow').textContent=tx.now;el('sunCameraMinusHour').textContent=tx.minusHour;el('sunCameraPlusHour').textContent=tx.plusHour;
    if(!el('sunCameraStatus').dataset.live)el('sunCameraStatus').textContent=tx.manual;
    update();
  }
  function onOrientation(ev){
    let heading=null;
    if(typeof ev.webkitCompassHeading==='number')heading=ev.webkitCompassHeading;
    else if(typeof ev.alpha==='number'&&(ev.absolute||ev.type==='deviceorientationabsolute'))heading=norm(360-ev.alpha);
    if(heading===null||!Number.isFinite(heading))return;
    el('sunCameraHeading').value=heading.toFixed(0);el('sunCameraStatus').dataset.live='1';el('sunCameraStatus').textContent=t().compassOn;saveState();update();
  }
  async function startCompass(){
    try{
      if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
        const result=await DeviceOrientationEvent.requestPermission();if(result!=='granted')throw new Error('denied');
      }
      if(typeof DeviceOrientationEvent==='undefined')throw new Error('unsupported');
      window.addEventListener('deviceorientationabsolute',onOrientation,true);window.addEventListener('deviceorientation',onOrientation,true);
      el('sunCameraStatus').dataset.live='';el('sunCameraStatus').textContent=t().manual;
    }catch(e){el('sunCameraStatus').dataset.live='';el('sunCameraStatus').textContent=t().compassUnavailable;}
  }
  function init(){
    const sun=el('sunce');if(!sun||el('sunCameraCard'))return false;
    const style=document.createElement('style');style.textContent='.sun-camera-stage{width:190px;height:190px;border:1px solid #30343b;border-radius:50%;margin:16px auto;position:relative;background:#0f1115}.sun-camera-axis{position:absolute;left:50%;top:50%;width:4px;height:68px;background:#8b929c;transform:translate(-50%,-100%);transform-origin:50% 100%;border-radius:4px}.sun-camera-body{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:28px}.sun-camera-orbit{position:absolute;left:50%;top:50%;transform-origin:0 0;font-size:25px;margin-left:-12px;margin-top:-12px}.sun-camera-result{text-align:center;font-weight:800;margin-top:8px}.sun-camera-light{text-align:center;color:#f5c542;font-weight:900;margin-top:6px}.sun-camera-flare{text-align:center;color:#ffcf70;font-size:12px;min-height:18px;margin-top:6px}.sun-camera-status,.sun-camera-timeline-note{color:#9299a3;font-size:12px;margin-top:8px}.sun-camera-heading-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}.sun-camera-heading-value{min-width:52px;text-align:right;color:#f5c542;font-weight:900;padding-bottom:11px}.sun-camera-quick{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.sun-camera-timeline{margin-top:10px;border-top:1px solid #292d33}.sun-camera-slot{width:100%;display:grid;grid-template-columns:96px 1fr 18px;gap:10px;align-items:center;padding:11px 0;border:0;border-bottom:1px solid #292d33;background:transparent;color:inherit;text-align:left;font:inherit;font-size:12px}.sun-camera-slot b{color:#f5c542}.sun-camera-slot:active{background:#1a1e24}.sun-camera-jump{text-align:right;color:#f5c542;font-size:20px}.sun-camera-empty{padding:12px 0;color:#9299a3;font-size:12px}';document.head.appendChild(style);
    const card=document.createElement('div');card.className='card';card.id='sunCameraCard';card.innerHTML='<h2 id="sunCameraTitle" style="margin-top:0"></h2><div class="caption" id="sunCameraQuickTimeLabel"></div><div class="sun-camera-quick"><button type="button" id="sunCameraMinusHour" class="btn secondary"></button><button type="button" id="sunCameraNow" class="btn"></button><button type="button" id="sunCameraPlusHour" class="btn secondary"></button></div><div class="sun-camera-heading-row" style="margin-top:14px"><div><label class="caption" id="sunCameraHeadingLabel"></label><input id="sunCameraHeading" type="number" min="0" max="359" step="1" value="180"></div><div id="sunCameraHeadingValue" class="sun-camera-heading-value">180°</div></div><div class="actions"><button type="button" id="sunCameraCompass" class="btn secondary"></button></div><div class="sun-camera-stage"><div class="sun-camera-axis"></div><div class="sun-camera-body">🎥</div><div id="sunCameraOrbit" class="sun-camera-orbit">☀</div></div><div id="sunCameraRelation" class="sun-camera-result">—</div><div id="sunCameraLight" class="sun-camera-light">—</div><div id="sunCameraFlare" class="sun-camera-flare"></div><div id="sunCameraStatus" class="sun-camera-status"></div><h3 id="sunCameraTimelineTitle" style="margin:18px 0 0"></h3><div id="sunCameraTimelineNote" class="sun-camera-timeline-note"></div><div id="sunCameraTimeline" class="sun-camera-timeline"></div>';
    const hourly=el('sunHourlyTitle')?.closest('.card');if(hourly)hourly.parentNode.insertBefore(card,hourly);else sun.appendChild(card);
    restoreState();
    el('sunCameraHeading').addEventListener('input',()=>{saveState();update();});el('sunCameraCompass').addEventListener('click',startCompass);el('sunCameraTimeline').addEventListener('click',jumpToTimeline);el('sunCameraNow').addEventListener('click',setNow);el('sunCameraMinusHour').addEventListener('click',()=>shiftTime(-60));el('sunCameraPlusHour').addEventListener('click',()=>shiftTime(60));
    ['sunDate','sunTime'].forEach(id=>el(id)?.addEventListener('change',update));
    ['sunLat','sunLon'].forEach(id=>{el(id)?.addEventListener('change',()=>{saveState();update();});el(id)?.addEventListener('input',saveState);});
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}
    translate();return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();
