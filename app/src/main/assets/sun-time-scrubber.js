(function(){
  'use strict';
  const TXT={
    sr:{title:'Brzo vreme kroz dan',note:'Pomeraj vreme kroz dan i odmah prati Sunce, senku i odnos prema kameri.',time:'IZABRANO VREME',now:'SADA',minus30:'−30 MIN',minus15:'−15 MIN',plus15:'+15 MIN',plus30:'+30 MIN',dayStart:'00:00',dayEnd:'23:55'},
    en:{title:'Quick time through day',note:'Scrub through the day and instantly track the Sun, shadow and camera relationship.',time:'SELECTED TIME',now:'NOW',minus30:'−30 MIN',minus15:'−15 MIN',plus15:'+15 MIN',plus30:'+30 MIN',dayStart:'00:00',dayEnd:'23:55'}
  };
  const el=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  const pad=n=>String(n).padStart(2,'0');
  function timeToMinutes(v){const p=String(v||'00:00').split(':').map(Number);return Math.max(0,Math.min(1439,(p[0]||0)*60+(p[1]||0)));}
  function minutesToTime(m){m=((Math.round(m)%1440)+1440)%1440;return pad(Math.floor(m/60))+':'+pad(m%60);}
  function dateValue(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function syncFromInputs(){
    const slider=el('sunTimeScrubber'),label=el('sunTimeScrubberValue'),input=el('sunTime');if(!slider||!input)return;
    const mins=timeToMinutes(input.value);slider.value=String(Math.round(mins/5)*5);if(label)label.textContent=input.value||minutesToTime(mins);
  }
  function setTimeMinutes(mins){
    const input=el('sunTime');if(!input)return;
    const rounded=Math.max(0,Math.min(1435,Math.round(mins/5)*5));input.value=minutesToTime(rounded);syncFromInputs();input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function shift(delta){
    const dateInput=el('sunDate'),timeInput=el('sunTime');if(!timeInput)return;
    let total=timeToMinutes(timeInput.value)+delta;
    if(total<0||total>=1440){
      const dv=dateInput?.value;if(dv&&dateInput){const p=dv.split('-').map(Number),d=new Date(p[0],p[1]-1,p[2],12,0,0,0);d.setDate(d.getDate()+(total<0?-1:1));dateInput.value=dateValue(d);dateInput.dispatchEvent(new Event('change',{bubbles:true}));}
      total=((total%1440)+1440)%1440;
    }
    setTimeMinutes(total);
  }
  function setNow(){
    const now=new Date(),dateInput=el('sunDate'),timeInput=el('sunTime');
    if(dateInput){dateInput.value=dateValue(now);dateInput.dispatchEvent(new Event('change',{bubbles:true}));}
    if(timeInput){timeInput.value=pad(now.getHours())+':'+pad(now.getMinutes());timeInput.dispatchEvent(new Event('change',{bubbles:true}));syncFromInputs();}
  }
  function translate(){
    if(!el('sunTimeScrubberCard'))return;const tx=t();
    el('sunTimeScrubberTitle').textContent=tx.title;el('sunTimeScrubberNote').textContent=tx.note;el('sunTimeScrubberLabel').textContent=tx.time;
    el('sunTimeNow').textContent=tx.now;el('sunTimeMinus30').textContent=tx.minus30;el('sunTimeMinus15').textContent=tx.minus15;el('sunTimePlus15').textContent=tx.plus15;el('sunTimePlus30').textContent=tx.plus30;
    el('sunTimeStart').textContent=tx.dayStart;el('sunTimeEnd').textContent=tx.dayEnd;syncFromInputs();
  }
  function init(){
    const input=el('sunTime');if(!input||el('sunTimeScrubberCard'))return false;
    const source=input.closest('.card');if(!source||!source.parentNode)return false;
    const style=document.createElement('style');style.textContent='.sun-time-note{font-size:12px;color:#9299a3;margin-bottom:12px}.sun-time-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:8px}.sun-time-head small{display:block;color:#9299a3;font-size:9px}.sun-time-head b{display:block;color:#f5c542;font-size:24px;margin-top:2px}.sun-time-range{width:100%;accent-color:#f5c542}.sun-time-scale{display:flex;justify-content:space-between;color:#777f89;font-size:9px;margin-top:2px}.sun-time-buttons{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:12px}.sun-time-buttons button{background:#171b20;border:1px solid #30343b;border-radius:9px;color:#d8dce2;padding:9px 5px;font-size:10px;font-weight:800}.sun-time-buttons #sunTimeNow{color:#f5c542;border-color:#6e5b20}@media(max-width:520px){.sun-time-buttons{grid-template-columns:repeat(3,1fr)}.sun-time-buttons #sunTimePlus30{grid-column:3}}';document.head.appendChild(style);
    const card=document.createElement('div');card.className='card';card.id='sunTimeScrubberCard';card.innerHTML='<h2 id="sunTimeScrubberTitle" style="margin-top:0"></h2><div id="sunTimeScrubberNote" class="sun-time-note"></div><div class="sun-time-head"><div><small id="sunTimeScrubberLabel"></small><b id="sunTimeScrubberValue">—</b></div></div><input id="sunTimeScrubber" class="sun-time-range" type="range" min="0" max="1435" step="5"><div class="sun-time-scale"><span id="sunTimeStart"></span><span>06:00</span><span>12:00</span><span>18:00</span><span id="sunTimeEnd"></span></div><div class="sun-time-buttons"><button type="button" id="sunTimeMinus30"></button><button type="button" id="sunTimeMinus15"></button><button type="button" id="sunTimeNow"></button><button type="button" id="sunTimePlus15"></button><button type="button" id="sunTimePlus30"></button></div>';
    source.parentNode.insertBefore(card,source.nextSibling);
    el('sunTimeScrubber').addEventListener('input',e=>setTimeMinutes(Number(e.target.value)));
    el('sunTimeMinus30').addEventListener('click',()=>shift(-30));el('sunTimeMinus15').addEventListener('click',()=>shift(-15));el('sunTimeNow').addEventListener('click',setNow);el('sunTimePlus15').addEventListener('click',()=>shift(15));el('sunTimePlus30').addEventListener('click',()=>shift(30));
    input.addEventListener('change',syncFromInputs);input.addEventListener('input',syncFromInputs);
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}
    translate();return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},100);
})();
