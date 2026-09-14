(function(){
  'use strict';
  const TXT={
    sr:{title:'Brzi planer kadra',desired:'ŽELJENO SVETLO',note:'Predlog koristi položaj Sunca za izabrani datum i vreme. Dodirni pravac da ga odmah primeniš na kameru.',backlight:'KONTRA / BACKLIGHT',frontlight:'FRONTALNO SVETLO',sidelight:'BOČNO SVETLO',threeQuarter:'3/4 SVETLO',recommended:'PREPORUČEN PRAVAC KAMERE',left:'leva varijanta',right:'desna varijanta',apply:'PRIMENI',below:'Sunce je ispod horizonta — izaberi dnevni termin.',bestTitle:'Najbolji termini za ovaj kadar',bestNote:'Termini se računaju za trenutno izabrani pravac kamere i željeno svetlo. Dodirni termin da prebaciš SUNCE na njegovu sredinu.',noWindow:'Nema odgovarajućeg dnevnog termina za ovaj pravac kamere.',best:'NAJBOLJI',duration:'min'},
    en:{title:'Quick shot planner',desired:'DESIRED LIGHT',note:'Recommendation uses the Sun position for the selected date and time. Tap a direction to apply it to the camera.',backlight:'BACKLIGHT',frontlight:'FRONT LIGHT',sidelight:'SIDE LIGHT',threeQuarter:'3/4 LIGHT',recommended:'RECOMMENDED CAMERA DIRECTION',left:'left option',right:'right option',apply:'APPLY',below:'Sun is below the horizon — choose a daylight time.',bestTitle:'Best times for this shot',bestNote:'Windows are calculated for the current camera direction and desired light. Tap a window to move SUN to its midpoint.',noWindow:'No matching daylight window for this camera direction.',best:'BEST',duration:'min'}
  };
  const el=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  const norm=a=>(a%360+360)%360;
  const signed=a=>((a+540)%360)-180;
  const pad=n=>String(n).padStart(2,'0');
  function refreshSunModules(){
    setTimeout(()=>{
      el('sunTime')?.dispatchEvent(new Event('change',{bubbles:true}));
      el('sunCameraHeading')?.dispatchEvent(new Event('input',{bubbles:true}));
      render();
    },0);
  }
  function ensureCore(){
    if(window.LightingAISun){refreshSunModules();return;}
    const existing=document.getElementById('lightingai-sun-core-runtime');
    if(existing){existing.addEventListener('load',refreshSunModules,{once:true});return;}
    const core=document.createElement('script');
    core.id='lightingai-sun-core-runtime';core.src='file:///android_asset/sun.js';core.onload=refreshSunModules;
    document.head.appendChild(core);
  }
  function ensureShadowTool(){
    if(document.getElementById('lightingai-sun-shadow-tool-runtime'))return;
    const s=document.createElement('script');
    s.id='lightingai-sun-shadow-tool-runtime';s.src='file:///android_asset/sun-shadow-tool.js';
    document.head.appendChild(s);
  }
  function ensureTwilightTool(){
    if(document.getElementById('lightingai-sun-twilight-runtime'))return;
    const s=document.createElement('script');
    s.id='lightingai-sun-twilight-runtime';s.src='file:///android_asset/sun-twilight.js';
    document.head.appendChild(s);
  }
  const compass=a=>{
    const dirs=lang()==='sr'?['S','SI','I','JI','J','JZ','Z','SZ']:['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(norm(a)/45)%8];
  };
  function inputDate(){
    const dv=el('sunDate')?.value,tv=el('sunTime')?.value||'12:00';
    if(!dv)return new Date();
    const d=dv.split('-').map(Number),tm=tv.split(':').map(Number);
    return new Date(d[0],d[1]-1,d[2],tm[0]||0,tm[1]||0,0,0);
  }
  function timeText(d){return pad(d.getHours())+':'+pad(d.getMinutes());}
  function headingsFor(key,sunAz){
    if(key==='backlight')return [{heading:norm(sunAz),side:null}];
    if(key==='frontlight')return [{heading:norm(sunAz+180),side:null}];
    if(key==='sidelight')return [{heading:norm(sunAz-90),side:'right'},{heading:norm(sunAz+90),side:'left'}];
    return [{heading:norm(sunAz-45),side:'right'},{heading:norm(sunAz+45),side:'left'}];
  }
  function lightKey(r){
    const a=Math.abs(r);
    if(a<=30)return 'backlight';
    if(a>=150)return 'frontlight';
    if(a>=60&&a<=120)return 'sidelight';
    return 'threeQuarter';
  }
  function bestWindows(key,lat,lon,heading){
    const start=inputDate();start.setHours(0,0,0,0);
    const samples=[];
    for(let m=0;m<=1440;m+=10){
      const dt=new Date(start.getTime()+m*60000),p=LightingAISun.position(dt,lat,lon);
      if(p.elevation>0&&lightKey(signed(p.azimuth-heading))===key)samples.push(dt);
    }
    if(!samples.length)return [];
    const groups=[];let g={start:samples[0],end:samples[0]};
    for(let i=1;i<samples.length;i++){
      const s=samples[i];
      if(s-g.end<=11*60000)g.end=s;else{groups.push(g);g={start:s,end:s};}
    }
    groups.push(g);
    return groups.map(x=>{
      const end=new Date(x.end.getTime()+10*60000),duration=Math.max(10,Math.round((end-x.start)/60000));
      const mid=new Date(x.start.getTime()+(end-x.start)/2);
      return {start:x.start,end,mid,duration};
    });
  }
  function renderBest(key,lat,lon){
    const host=el('sunShotBestWindows');if(!host||!window.LightingAISun)return;
    const heading=norm(Number(el('sunCameraHeading')?.value)||0),tx=t(),wins=bestWindows(key,lat,lon,heading);
    if(!wins.length){host.innerHTML='<div class="sun-shot-empty">'+tx.noWindow+'</div>';return;}
    const longest=Math.max(...wins.map(w=>w.duration));
    host.innerHTML=wins.map(w=>'<button type="button" class="sun-shot-window" data-time="'+timeText(w.mid)+'"><span><b>'+timeText(w.start)+'–'+timeText(w.end)+'</b><small>'+w.duration+' '+tx.duration+'</small></span><span class="sun-shot-window-tag">'+(w.duration===longest?'★ '+tx.best:'›')+'</span></button>').join('');
  }
  function render(){
    if(!el('sunShotPlanner')||!window.LightingAISun)return;
    const lat=Number(el('sunLat')?.value),lon=Number(el('sunLon')?.value);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const p=LightingAISun.position(inputDate(),lat,lon),tx=t(),host=el('sunShotRecommendations'),key=el('sunShotDesired').value;
    if(p.elevation<=0)host.innerHTML='<div class="sun-shot-empty">'+tx.below+'</div>';
    else host.innerHTML=headingsFor(key,p.azimuth).map(x=>'<button type="button" class="sun-shot-choice" data-heading="'+x.heading.toFixed(1)+'"><span class="sun-shot-choice-label">'+(x.side?tx[x.side]:tx.recommended)+'</span><b>'+x.heading.toFixed(0)+'° '+compass(x.heading)+'</b><span class="sun-shot-apply">'+tx.apply+' ›</span></button>').join('');
    renderBest(key,lat,lon);
  }
  function translate(){
    if(!el('sunShotPlanner'))return;
    const tx=t(),sel=el('sunShotDesired'),current=sel.value||'backlight';
    el('sunShotTitle').textContent=tx.title;el('sunShotDesiredLabel').textContent=tx.desired;el('sunShotNote').textContent=tx.note;el('sunShotRecommendedLabel').textContent=tx.recommended;el('sunShotBestTitle').textContent=tx.bestTitle;el('sunShotBestNote').textContent=tx.bestNote;
    sel.innerHTML='<option value="backlight">'+tx.backlight+'</option><option value="threeQuarter">'+tx.threeQuarter+'</option><option value="sidelight">'+tx.sidelight+'</option><option value="frontlight">'+tx.frontlight+'</option>';
    sel.value=current;render();
  }
  function applyChoice(ev){
    const b=ev.target.closest('.sun-shot-choice[data-heading]');if(!b)return;
    const input=el('sunCameraHeading');if(!input)return;
    input.value=Number(b.dataset.heading).toFixed(0);input.dispatchEvent(new Event('input',{bubbles:true}));render();
  }
  function applyWindow(ev){
    const b=ev.target.closest('.sun-shot-window[data-time]');if(!b)return;
    const input=el('sunTime');if(!input)return;
    input.value=b.dataset.time;input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function init(){
    const camera=el('sunCameraCard');if(!camera||el('sunShotPlanner'))return false;
    const style=document.createElement('style');style.textContent='.sun-shot-grid{display:grid;grid-template-columns:1fr;gap:8px;margin-top:10px}.sun-shot-choice{width:100%;display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center;text-align:left;background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px;color:inherit;font:inherit}.sun-shot-choice:active,.sun-shot-window:active{background:#1a1e24}.sun-shot-choice-label{font-size:11px;color:#9299a3}.sun-shot-choice b{font-size:20px;color:#f5c542}.sun-shot-apply{grid-column:1/-1;font-size:11px;color:#c7ccd3}.sun-shot-note,.sun-shot-empty{font-size:12px;color:#9299a3;margin-top:8px}.sun-shot-empty{padding:10px 0}.sun-shot-best{margin-top:18px;border-top:1px solid #292d33;padding-top:14px}.sun-shot-window{width:100%;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;background:transparent;border:0;border-bottom:1px solid #292d33;padding:11px 0;color:inherit;text-align:left;font:inherit}.sun-shot-window b{display:block;color:#f5c542}.sun-shot-window small{display:block;color:#9299a3;margin-top:3px}.sun-shot-window-tag{font-size:11px;color:#f5c542;font-weight:800;text-align:right}';document.head.appendChild(style);
    const card=document.createElement('div');card.className='card';card.id='sunShotPlanner';card.innerHTML='<h2 id="sunShotTitle" style="margin-top:0"></h2><label class="caption" id="sunShotDesiredLabel"></label><select id="sunShotDesired"></select><div id="sunShotNote" class="sun-shot-note"></div><h3 id="sunShotRecommendedLabel" style="margin:16px 0 0"></h3><div id="sunShotRecommendations" class="sun-shot-grid"></div><div class="sun-shot-best"><h3 id="sunShotBestTitle" style="margin:0"></h3><div id="sunShotBestNote" class="sun-shot-note"></div><div id="sunShotBestWindows"></div></div>';
    camera.parentNode.insertBefore(card,camera.nextSibling);
    el('sunShotDesired').addEventListener('change',render);el('sunShotRecommendations').addEventListener('click',applyChoice);el('sunShotBestWindows').addEventListener('click',applyWindow);
    ['sunDate','sunTime','sunLat','sunLon'].forEach(id=>el(id)?.addEventListener('change',render));el('sunCameraHeading')?.addEventListener('input',render);
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}
    translate();return true;
  }
  ensureCore();
  ensureShadowTool();
  ensureTwilightTool();
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();
