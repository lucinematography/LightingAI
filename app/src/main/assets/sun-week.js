(function(){
  'use strict';
  const TXT={
    sr:{title:'Pregled narednih 7 dana',note:'Poređenje izlaska, zalaska, njihovog smera, golden hour-a i maksimalne visine Sunca. Dodirni datum da ga primeniš.',rise:'IZLAZAK',set:'ZALAZAK',goldAm:'GOLDEN JUTRO',goldPm:'GOLDEN VEČE',max:'MAKS. VISINA',apply:'PRIMENI'},
    en:{title:'Next 7 days overview',note:'Compare sunrise, sunset, their directions, golden hour and maximum Sun elevation. Tap a date to apply it.',rise:'SUNRISE',set:'SUNSET',goldAm:'GOLDEN AM',goldPm:'GOLDEN PM',max:'MAX ELEVATION',apply:'APPLY'}
  };
  const el=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  const pad=n=>String(n).padStart(2,'0');
  const fmt=d=>d?pad(d.getHours())+':'+pad(d.getMinutes()):'—';
  const range=(a,b)=>a&&b?fmt(a)+'–'+fmt(b):'—';
  const norm=a=>(a%360+360)%360;
  function compass(a){
    const dirs=lang()==='sr'?['S','SI','I','JI','J','JZ','Z','SZ']:['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(norm(a)/45)%8];
  }
  function eventText(d,lat,lon){
    if(!d)return '—';
    const p=LightingAISun.position(d,lat,lon);
    return fmt(d)+' · '+p.azimuth.toFixed(0)+'° '+compass(p.azimuth);
  }
  function selectedDate(){
    const v=el('sunDate')?.value;if(!v)return new Date();
    const p=v.split('-').map(Number);return new Date(p[0],p[1]-1,p[2],12,0,0,0);
  }
  function dateValue(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function dateLabel(d){
    const locale=lang()==='sr'?'sr-Latn-RS':'en-GB';
    try{return new Intl.DateTimeFormat(locale,{weekday:'short',day:'2-digit',month:'2-digit'}).format(d);}catch(e){return pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.';}
  }
  function render(){
    if(!el('sunWeekCard')||!window.LightingAISun)return;
    const lat=Number(el('sunLat')?.value),lon=Number(el('sunLon')?.value);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const base=selectedDate(),tx=t(),host=el('sunWeekRows');
    const rows=[];
    for(let i=0;i<7;i++){
      const d=new Date(base);d.setDate(base.getDate()+i);
      const c=LightingAISun.crossings(d,lat,lon),w=LightingAISun.lightWindows(d,lat,lon),s=LightingAISun.dailySummary(d,lat,lon);
      rows.push('<button type="button" class="sun-week-row" data-date="'+dateValue(d)+'"><span class="sun-week-date"><b>'+dateLabel(d)+'</b><small>'+dateValue(d)+'</small></span><span><small>'+tx.rise+'</small><b>'+eventText(c.sunrise,lat,lon)+'</b></span><span><small>'+tx.set+'</small><b>'+eventText(c.sunset,lat,lon)+'</b></span><span><small>'+tx.goldAm+'</small><b>'+range(w.goldenMorningStart,w.goldenMorningEnd)+'</b></span><span><small>'+tx.goldPm+'</small><b>'+range(w.goldenEveningStart,w.goldenEveningEnd)+'</b></span><span><small>'+tx.max+'</small><b>'+s.maxElevation.toFixed(1)+'°</b></span><em>'+tx.apply+' ›</em></button>');
    }
    host.innerHTML=rows.join('');
  }
  function translate(){
    if(!el('sunWeekCard'))return;
    const tx=t();el('sunWeekTitle').textContent=tx.title;el('sunWeekNote').textContent=tx.note;render();
  }
  function applyDate(ev){
    const b=ev.target.closest('.sun-week-row[data-date]');if(!b)return;
    const input=el('sunDate');if(!input)return;
    input.value=b.dataset.date;input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function ensureLocations(){
    if(document.getElementById('lightingai-sun-locations-runtime'))return;
    const s=document.createElement('script');
    s.id='lightingai-sun-locations-runtime';s.src='file:///android_asset/sun-locations.js';
    document.head.appendChild(s);
  }
  function init(){
    const tw=el('sunTwilightCard')||el('sunShotPlanner');if(!tw||el('sunWeekCard'))return false;
    const style=document.createElement('style');style.textContent='.sun-week-note{font-size:12px;color:#9299a3;margin-bottom:10px}.sun-week-row{width:100%;display:grid;grid-template-columns:1.1fr repeat(5,1fr) auto;gap:8px;align-items:center;text-align:left;background:transparent;border:0;border-bottom:1px solid #292d33;padding:11px 0;color:inherit;font:inherit}.sun-week-row:active{background:#1a1e24}.sun-week-row span{min-width:0}.sun-week-row small{display:block;color:#9299a3;font-size:9px;line-height:1.2}.sun-week-row b{display:block;font-size:11px;margin-top:3px;white-space:nowrap}.sun-week-date b{color:#f5c542;font-size:12px}.sun-week-row em{font-style:normal;color:#f5c542;font-size:10px;font-weight:800}@media(max-width:720px){.sun-week-row{grid-template-columns:1.2fr 1.35fr 1.35fr;gap:6px}.sun-week-row span:nth-child(4),.sun-week-row span:nth-child(5),.sun-week-row span:nth-child(6){display:none}.sun-week-row b{font-size:10px}.sun-week-row em{grid-column:3;text-align:right}}';document.head.appendChild(style);
    const card=document.createElement('div');card.className='card';card.id='sunWeekCard';card.innerHTML='<h2 id="sunWeekTitle" style="margin-top:0"></h2><div id="sunWeekNote" class="sun-week-note"></div><div id="sunWeekRows"></div>';
    tw.parentNode.insertBefore(card,tw.nextSibling);
    el('sunWeekRows').addEventListener('click',applyDate);['sunDate','sunLat','sunLon'].forEach(id=>el(id)?.addEventListener('change',render));
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}
    translate();return true;
  }
  ensureLocations();
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();
