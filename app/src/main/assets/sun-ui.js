(function(){
  'use strict';
  function el(id){return document.getElementById(id)}
  function pad(n){return String(n).padStart(2,'0')}
  function localDateValue(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  function localTimeValue(d){return pad(d.getHours())+':'+pad(d.getMinutes())}
  function fmtTime(d){return d?pad(d.getHours())+':'+pad(d.getMinutes()):'—'}
  function num(id){return Number(el(id).value)}
  function dateFromInputs(){
    const dv=el('sunDate').value, tv=el('sunTime').value||'12:00';
    const parts=dv.split('-').map(Number), t=tv.split(':').map(Number);
    return new Date(parts[0],parts[1]-1,parts[2],t[0]||0,t[1]||0,0,0);
  }
  function compass(a){const dirs=['N','NE','E','SE','S','SW','W','NW'];return dirs[Math.round((((a%360)+360)%360)/45)%8]}
  function renderPath(points){
    const visible=points.filter(p=>p.elevation>-6);
    if(!visible.length)return '<div class="sun-empty">Sunce je ispod horizonta tokom izabranog dana.</div>';
    return visible.filter((_,i)=>i%2===0).map(p=>'<div class="sun-hour"><b>'+pad(p.time.getHours())+':'+pad(p.time.getMinutes())+'</b><span>'+p.azimuth.toFixed(0)+'° '+compass(p.azimuth)+'</span><span>'+p.elevation.toFixed(1)+'°</span></div>').join('');
  }
  function updateSun(){
    if(!window.LightingAISun)return;
    const lat=num('sunLat'),lon=num('sunLon');
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180){el('sunStatus').textContent='Unesi ispravne koordinate.';return}
    const d=dateFromInputs(),p=LightingAISun.position(d,lat,lon),x=LightingAISun.crossings(d,lat,lon),path=LightingAISun.dayPath(d,lat,lon,30);
    el('sunAz').textContent=p.azimuth.toFixed(1)+'° '+compass(p.azimuth);
    el('sunEl').textContent=p.elevation.toFixed(1)+'°';
    el('sunRise').textContent=fmtTime(x.sunrise);
    el('sunSet').textContent=fmtTime(x.sunset);
    el('sunDayState').textContent=p.elevation>=0?'IZNAD HORIZONTA':'ISPOD HORIZONTA';
    el('sunCompassNeedle').style.transform='translate(-50%,-100%) rotate('+p.azimuth+'deg)';
    el('sunPath').innerHTML=renderPath(path);
    el('sunStatus').textContent='Proračun je lokalni i ne zahteva internet.';
  }
  function useLocation(){
    try{
      if(window.Android&&Android.hasLocationPermission&&!Android.hasLocationPermission()){
        Android.requestLocationPermission();
        el('sunStatus').textContent='Odobri lokaciju telefonu, zatim ponovo pritisni MOJA LOKACIJA.';
        return;
      }
    }catch(e){}
    if(!navigator.geolocation){el('sunStatus').textContent='GPS nije dostupan. Koordinate možeš uneti ručno.';return}
    el('sunStatus').textContent='Tražim lokaciju…';
    navigator.geolocation.getCurrentPosition(pos=>{
      el('sunLat').value=pos.coords.latitude.toFixed(6);el('sunLon').value=pos.coords.longitude.toFixed(6);el('sunStatus').textContent='Lokacija je učitana.';updateSun();
    },()=>{el('sunStatus').textContent='Lokacija nije dostupna. Koordinate možeš uneti ručno.'},{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
  }
  function init(){
    if(el('sunce'))return;
    const style=document.createElement('style');style.textContent='.sun-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.sun-metric{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px}.sun-metric b{display:block;color:#f5c542;font-size:20px;margin-top:5px}.sun-compass{width:220px;height:220px;border:1px solid #3a3f47;border-radius:50%;margin:16px auto;position:relative;background:radial-gradient(circle,#171b20 0,#0f1115 68%)}.sun-compass span{position:absolute;font-size:11px;color:#9da3ad}.sun-n{top:7px;left:50%;transform:translateX(-50%)}.sun-e{right:8px;top:50%;transform:translateY(-50%)}.sun-s{bottom:7px;left:50%;transform:translateX(-50%)}.sun-w{left:8px;top:50%;transform:translateY(-50%)}.sun-needle{position:absolute;left:50%;top:50%;width:4px;height:82px;background:#f5c542;transform-origin:50% 100%;border-radius:4px;box-shadow:0 0 16px rgba(245,197,66,.35)}.sun-center{position:absolute;left:50%;top:50%;width:14px;height:14px;border-radius:50%;background:#f5c542;transform:translate(-50%,-50%)}.sun-hour{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:9px 0;border-bottom:1px solid #292d33;font-size:12px}.sun-hour span{text-align:right}.sun-empty{padding:14px;color:#9299a3}.sun-status{margin-top:10px;color:#9299a3;font-size:12px}@media(max-width:520px){.sun-grid{grid-template-columns:1fr 1fr}}';document.head.appendChild(style);
    const main=document.querySelector('main'),nav=document.querySelector('nav');if(!main||!nav)return;
    const section=document.createElement('section');section.id='sunce';section.className='page';section.innerHTML='<h1>SUNCE</h1><div class="card"><div class="row"><div><label class="caption">DATUM</label><input id="sunDate" type="date"></div><div><label class="caption">VREME</label><input id="sunTime" type="time"></div></div><div class="row"><div><label class="caption">GEOGRAFSKA ŠIRINA</label><input id="sunLat" type="number" step="0.000001" value="44.7866"></div><div><label class="caption">GEOGRAFSKA DUŽINA</label><input id="sunLon" type="number" step="0.000001" value="20.4489"></div></div><div class="actions"><button id="sunLocate" class="btn secondary">📍 MOJA LOKACIJA</button><button id="sunCalc" class="btn primary">IZRAČUNAJ</button></div><div id="sunStatus" class="sun-status"></div></div><div class="card"><div class="sun-grid"><div class="sun-metric"><span>AZIMUT</span><b id="sunAz">—</b></div><div class="sun-metric"><span>VISINA SUNCA</span><b id="sunEl">—</b></div><div class="sun-metric"><span>IZLAZAK</span><b id="sunRise">—</b></div><div class="sun-metric"><span>ZALAZAK</span><b id="sunSet">—</b></div></div><div class="sun-compass"><span class="sun-n">N</span><span class="sun-e">E</span><span class="sun-s">S</span><span class="sun-w">W</span><div id="sunCompassNeedle" class="sun-needle"></div><div class="sun-center"></div></div><div style="text-align:center"><b id="sunDayState">—</b></div></div><div class="card"><h2 style="margin-top:0">Položaj Sunca po satima</h2><div id="sunPath"></div></div>';
    main.appendChild(section);
    nav.style.gridTemplateColumns='repeat(5,1fr)';
    const b=document.createElement('button');b.dataset.page='sunce';b.innerHTML='☀ <span>SUNCE</span>';nav.insertBefore(b,nav.lastElementChild);
    b.addEventListener('click',()=>{document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));section.classList.add('active');b.classList.add('active');updateSun()});
    const now=new Date();el('sunDate').value=localDateValue(now);el('sunTime').value=localTimeValue(now);el('sunCalc').addEventListener('click',updateSun);el('sunLocate').addEventListener('click',useLocation);['sunDate','sunTime','sunLat','sunLon'].forEach(id=>el(id).addEventListener('change',updateSun));updateSun();
  }
  function loadCore(){if(window.LightingAISun){init();return}const s=document.createElement('script');s.src='file:///android_asset/sun.js';s.onload=init;document.body.appendChild(s)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadCore);else loadCore();
})();