(function(){
  'use strict';
  const TXT={
    sr:{title:'Sumrak i noć',phase:'TRENUTNA FAZA',civilAm:'Građanski sumrak — jutro',nauticalAm:'Nautički sumrak — jutro',astroAm:'Astronomski sumrak — jutro',civilPm:'Građanski sumrak — veče',nauticalPm:'Nautički sumrak — veče',astroPm:'Astronomski sumrak — veče',day:'DAN',gold:'GOLDEN HOUR',blue:'BLUE HOUR',nautical:'NAUTIČKI SUMRAK',astronomical:'ASTRONOMSKI SUMRAK',night:'NOĆ',note:'Faze se računaju prema visini Sunca: -6° građanski, -12° nautički i -18° astronomski sumrak.'},
    en:{title:'Twilight and night',phase:'CURRENT PHASE',civilAm:'Civil twilight — morning',nauticalAm:'Nautical twilight — morning',astroAm:'Astronomical twilight — morning',civilPm:'Civil twilight — evening',nauticalPm:'Nautical twilight — evening',astroPm:'Astronomical twilight — evening',day:'DAY',gold:'GOLDEN HOUR',blue:'BLUE HOUR',nautical:'NAUTICAL TWILIGHT',astronomical:'ASTRONOMICAL TWILIGHT',night:'NIGHT',note:'Phases use Sun elevation thresholds: -6° civil, -12° nautical and -18° astronomical twilight.'}
  };
  const el=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  const pad=n=>String(n).padStart(2,'0');
  const fmt=d=>d?pad(d.getHours())+':'+pad(d.getMinutes()):'—';
  const range=(a,b)=>a&&b?fmt(a)+'–'+fmt(b):'—';
  function inputDate(){
    const dv=el('sunDate')?.value,tv=el('sunTime')?.value||'12:00';
    if(!dv)return new Date();
    const d=dv.split('-').map(Number),tm=tv.split(':').map(Number);
    return new Date(d[0],d[1]-1,d[2],tm[0]||0,tm[1]||0,0,0);
  }
  function crossing(date,lat,lon,threshold,up){
    const d=new Date(date);d.setHours(0,0,0,0);
    let prevTime=new Date(d),prev=LightingAISun.position(prevTime,lat,lon).elevation;
    for(let m=2;m<=1440;m+=2){
      const curTime=new Date(d.getTime()+m*60000),cur=LightingAISun.position(curTime,lat,lon).elevation;
      const hit=up?(prev<threshold&&cur>=threshold):(prev>=threshold&&cur<threshold);
      if(hit){
        const span=cur-prev,ratio=Math.abs(span)<1e-9?0:(threshold-prev)/span;
        return new Date(prevTime.getTime()+(curTime-prevTime)*Math.max(0,Math.min(1,ratio)));
      }
      prevTime=curTime;prev=cur;
    }
    return null;
  }
  function phase(e,tx){
    if(e>=6)return tx.day;
    if(e>=-4)return tx.gold;
    if(e>=-6)return tx.blue;
    if(e>=-12)return tx.nautical;
    if(e>=-18)return tx.astronomical;
    return tx.night;
  }
  function render(){
    if(!el('sunTwilightCard')||!window.LightingAISun)return;
    const lat=Number(el('sunLat')?.value),lon=Number(el('sunLon')?.value);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const d=inputDate(),tx=t(),p=LightingAISun.position(d,lat,lon);
    const astroDawn=crossing(d,lat,lon,-18,true),nautDawn=crossing(d,lat,lon,-12,true),civilDawn=crossing(d,lat,lon,-6,true),sunrise=crossing(d,lat,lon,-0.833,true);
    const sunset=crossing(d,lat,lon,-0.833,false),civilDusk=crossing(d,lat,lon,-6,false),nautDusk=crossing(d,lat,lon,-12,false),astroDusk=crossing(d,lat,lon,-18,false);
    el('sunTwilightPhase').textContent=phase(p.elevation,tx);
    el('sunTwCivilAm').textContent=range(civilDawn,sunrise);el('sunTwNautAm').textContent=range(nautDawn,civilDawn);el('sunTwAstroAm').textContent=range(astroDawn,nautDawn);
    el('sunTwCivilPm').textContent=range(sunset,civilDusk);el('sunTwNautPm').textContent=range(civilDusk,nautDusk);el('sunTwAstroPm').textContent=range(nautDusk,astroDusk);
  }
  function translate(){
    if(!el('sunTwilightCard'))return;
    const tx=t();
    el('sunTwilightTitle').textContent=tx.title;el('sunTwilightPhaseLabel').textContent=tx.phase;el('sunTwCivilAmLabel').textContent=tx.civilAm;el('sunTwNautAmLabel').textContent=tx.nauticalAm;el('sunTwAstroAmLabel').textContent=tx.astroAm;el('sunTwCivilPmLabel').textContent=tx.civilPm;el('sunTwNautPmLabel').textContent=tx.nauticalPm;el('sunTwAstroPmLabel').textContent=tx.astroPm;el('sunTwilightNote').textContent=tx.note;render();
  }
  function init(){
    const planner=el('sunShotPlanner');if(!planner||el('sunTwilightCard'))return false;
    const style=document.createElement('style');style.textContent='.sun-tw-phase{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px;margin-bottom:12px}.sun-tw-phase b{display:block;color:#f5c542;font-size:20px;margin-top:5px}.sun-tw-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sun-tw-item{border:1px solid #30343b;border-radius:10px;padding:10px;background:#0f1115}.sun-tw-item span{display:block;font-size:11px;color:#9299a3}.sun-tw-item b{display:block;margin-top:4px;font-size:13px}.sun-tw-note{font-size:12px;color:#9299a3;margin-top:10px}@media(max-width:520px){.sun-tw-grid{grid-template-columns:1fr}}';document.head.appendChild(style);
    const card=document.createElement('div');card.className='card';card.id='sunTwilightCard';card.innerHTML='<h2 id="sunTwilightTitle" style="margin-top:0"></h2><div class="sun-tw-phase"><span id="sunTwilightPhaseLabel"></span><b id="sunTwilightPhase">—</b></div><div class="sun-tw-grid"><div class="sun-tw-item"><span id="sunTwCivilAmLabel"></span><b id="sunTwCivilAm">—</b></div><div class="sun-tw-item"><span id="sunTwCivilPmLabel"></span><b id="sunTwCivilPm">—</b></div><div class="sun-tw-item"><span id="sunTwNautAmLabel"></span><b id="sunTwNautAm">—</b></div><div class="sun-tw-item"><span id="sunTwNautPmLabel"></span><b id="sunTwNautPm">—</b></div><div class="sun-tw-item"><span id="sunTwAstroAmLabel"></span><b id="sunTwAstroAm">—</b></div><div class="sun-tw-item"><span id="sunTwAstroPmLabel"></span><b id="sunTwAstroPm">—</b></div></div><div id="sunTwilightNote" class="sun-tw-note"></div>';
    planner.parentNode.insertBefore(card,planner.nextSibling);
    ['sunDate','sunTime','sunLat','sunLon'].forEach(id=>el(id)?.addEventListener('change',render));
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}
    translate();return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();
