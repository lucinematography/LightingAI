(function(){
  'use strict';
  const KEY='lightingai_sun_shot_presets_v1';
  const TXT={
    sr:{title:'Sačuvani planovi kadra',note:'Sačuvaj trenutni SUNCE plan: lokaciju, datum, vreme, pravac kamere, željeno svetlo i visinu objekta.',name:'NAZIV PLANA',placeholder:'npr. Scena 12 - kontra',save:'SAČUVAJ PLAN',empty:'Još nema sačuvanih planova.',apply:'PRIMENI PLAN',remove:'OBRIŠI',needName:'Unesi naziv plana.',invalid:'Plan nema ispravne podatke.',saved:'Plan je sačuvan.',camera:'kamera',height:'visina'},
    en:{title:'Saved shot plans',note:'Save the current SUN plan: location, date, time, camera direction, desired light and object height.',name:'PLAN NAME',placeholder:'e.g. Scene 12 - backlight',save:'SAVE PLAN',empty:'No saved plans yet.',apply:'APPLY PLAN',remove:'DELETE',needName:'Enter a plan name.',invalid:'Plan data is invalid.',saved:'Plan saved.',camera:'camera',height:'height'}
  };
  const el=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return []}}
  function write(x){localStorage.setItem(KEY,JSON.stringify(x));}
  function current(){
    return {
      name:'',
      lat:Number(el('sunLat')?.value),lon:Number(el('sunLon')?.value),
      date:el('sunDate')?.value||'',time:el('sunTime')?.value||'',
      heading:Number(el('sunCameraHeading')?.value),
      light:el('sunShotDesired')?.value||'backlight',
      height:Number(el('sunObjectHeight')?.value||1.8)
    };
  }
  function valid(p){return Number.isFinite(p.lat)&&p.lat>=-90&&p.lat<=90&&Number.isFinite(p.lon)&&p.lon>=-180&&p.lon<=180&&/^\d{4}-\d{2}-\d{2}$/.test(p.date)&&/^\d{2}:\d{2}$/.test(p.time)&&Number.isFinite(p.heading)&&p.heading>=0&&p.heading<=359.9&&Number.isFinite(p.height)&&p.height>0}
  function status(msg){const s=el('sunPresetStatus');if(s)s.textContent=msg||'';}
  function lightLabel(k){
    const sr={backlight:'KONTRA',threeQuarter:'3/4',sidelight:'BOČNO',frontlight:'FRONTALNO'},en={backlight:'BACKLIGHT',threeQuarter:'3/4',sidelight:'SIDE',frontlight:'FRONT'};
    return (lang()==='sr'?sr:en)[k]||k;
  }
  function render(){
    const host=el('sunPresetRows');if(!host)return;const tx=t(),items=read();host.innerHTML='';
    if(!items.length){const d=document.createElement('div');d.className='sun-preset-empty';d.textContent=tx.empty;host.appendChild(d);return;}
    items.forEach((p,index)=>{
      const row=document.createElement('div');row.className='sun-preset-row';
      const info=document.createElement('div');info.className='sun-preset-info';
      const b=document.createElement('b');b.textContent=p.name;
      const s1=document.createElement('small');s1.textContent=p.date+' · '+p.time+' · '+lightLabel(p.light);
      const s2=document.createElement('small');s2.textContent=Number(p.lat).toFixed(5)+', '+Number(p.lon).toFixed(5)+' · '+tx.camera+' '+Math.round(Number(p.heading))+'° · '+tx.height+' '+Number(p.height).toFixed(2)+' m';
      info.appendChild(b);info.appendChild(s1);info.appendChild(s2);
      const actions=document.createElement('div');actions.className='sun-preset-actions';
      const use=document.createElement('button');use.type='button';use.className='sun-preset-use';use.dataset.index=String(index);use.textContent=tx.apply;
      const del=document.createElement('button');del.type='button';del.className='sun-preset-delete';del.dataset.index=String(index);del.textContent=tx.remove;
      actions.appendChild(use);actions.appendChild(del);row.appendChild(info);row.appendChild(actions);host.appendChild(row);
    });
  }
  function translate(){if(!el('sunShotPresets'))return;const tx=t();el('sunPresetTitle').textContent=tx.title;el('sunPresetNote').textContent=tx.note;el('sunPresetNameLabel').textContent=tx.name;el('sunPresetName').placeholder=tx.placeholder;el('sunPresetSave').textContent=tx.save;render();}
  function save(){
    const tx=t(),name=(el('sunPresetName')?.value||'').trim(),p=current();
    if(!name){status(tx.needName);return}p.name=name;if(!valid(p)){status(tx.invalid);return}
    const items=read(),i=items.findIndex(x=>String(x.name).toLowerCase()===name.toLowerCase());if(i>=0)items[i]=p;else items.unshift(p);
    write(items.slice(0,50));el('sunPresetName').value='';status(tx.saved);render();
  }
  function apply(p){
    if(!valid(p)){status(t().invalid);return}
    el('sunLat').value=Number(p.lat).toFixed(6);el('sunLon').value=Number(p.lon).toFixed(6);el('sunDate').value=p.date;el('sunTime').value=p.time;
    if(el('sunCameraHeading'))el('sunCameraHeading').value=Number(p.heading).toFixed(0);
    if(el('sunShotDesired'))el('sunShotDesired').value=p.light||'backlight';
    if(el('sunObjectHeight'))el('sunObjectHeight').value=Number(p.height).toFixed(2);
    ['sunLat','sunLon','sunDate','sunTime'].forEach(id=>el(id)?.dispatchEvent(new Event('change',{bubbles:true})));
    el('sunCameraHeading')?.dispatchEvent(new Event('input',{bubbles:true}));el('sunShotDesired')?.dispatchEvent(new Event('change',{bubbles:true}));el('sunObjectHeight')?.dispatchEvent(new Event('input',{bubbles:true}));status(p.name);
  }
  function rowClick(ev){
    const use=ev.target.closest('.sun-preset-use[data-index]'),del=ev.target.closest('.sun-preset-delete[data-index]');if(!use&&!del)return;
    const items=read(),i=Number((use||del).dataset.index);if(!Number.isInteger(i)||i<0||i>=items.length)return;
    if(del){items.splice(i,1);write(items);render();return;}apply(items[i]);
  }
  function init(){
    const loc=el('sunSavedLocations');if(!loc||el('sunShotPresets'))return false;
    const style=document.createElement('style');style.textContent='.sun-preset-note,.sun-preset-empty,#sunPresetStatus{font-size:12px;color:#9299a3}.sun-preset-note{margin-bottom:12px}.sun-preset-save-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end}.sun-preset-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid #292d33}.sun-preset-info b{display:block;color:#f5c542}.sun-preset-info small{display:block;color:#9299a3;margin-top:3px}.sun-preset-actions{display:flex;gap:6px}.sun-preset-actions button{background:#171b20;border:1px solid #30343b;border-radius:8px;color:#d8dce2;padding:7px 9px;font-size:10px;font-weight:800}.sun-preset-delete{color:#d89a9a!important}@media(max-width:520px){.sun-preset-save-row,.sun-preset-row{grid-template-columns:1fr}.sun-preset-actions{justify-content:flex-start}}';document.head.appendChild(style);
    const card=document.createElement('div');card.className='card';card.id='sunShotPresets';card.innerHTML='<h2 id="sunPresetTitle" style="margin-top:0"></h2><div id="sunPresetNote" class="sun-preset-note"></div><div class="sun-preset-save-row"><div><label class="caption" id="sunPresetNameLabel"></label><input id="sunPresetName" type="text" maxlength="60"></div><button type="button" id="sunPresetSave" class="btn secondary"></button></div><div id="sunPresetStatus" style="margin-top:8px"></div><div id="sunPresetRows" style="margin-top:8px"></div>';
    loc.parentNode.insertBefore(card,loc.nextSibling);el('sunPresetSave').addEventListener('click',save);el('sunPresetRows').addEventListener('click',rowClick);el('sunPresetName').addEventListener('keydown',e=>{if(e.key==='Enter')save();});
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}translate();return true;
  }
  function ensureTimeScrubber(){
    if(document.getElementById('lightingai-sun-time-scrubber-runtime'))return;
    const s=document.createElement('script');s.id='lightingai-sun-time-scrubber-runtime';s.src='file:///android_asset/sun-time-scrubber.js';document.head.appendChild(s);
  }
  ensureTimeScrubber();
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},100);
})();
