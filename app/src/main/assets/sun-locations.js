(function(){
  'use strict';
  const KEY='lightingai_sun_locations_v1';
  const TXT={
    sr:{title:'Sačuvane lokacije',note:'Sačuvaj lokacije snimanja i vrati njihove koordinate jednim dodirom.',name:'NAZIV LOKACIJE',placeholder:'npr. Studio, Kalemegdan, lokacija 1',save:'SAČUVAJ LOKACIJU',empty:'Još nema sačuvanih lokacija.',apply:'PRIMENI',remove:'OBRIŠI',invalid:'Koordinate nisu ispravne.',needName:'Unesi naziv lokacije.',saved:'Lokacija je sačuvana.'},
    en:{title:'Saved locations',note:'Save filming locations and restore their coordinates with one tap.',name:'LOCATION NAME',placeholder:'e.g. Studio, location 1',save:'SAVE LOCATION',empty:'No saved locations yet.',apply:'APPLY',remove:'DELETE',invalid:'Coordinates are invalid.',needName:'Enter a location name.',saved:'Location saved.'}
  };
  const el=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return []}}
  function write(x){localStorage.setItem(KEY,JSON.stringify(x));}
  function coords(){return {lat:Number(el('sunLat')?.value),lon:Number(el('sunLon')?.value)}}
  function valid(c){return Number.isFinite(c.lat)&&Number.isFinite(c.lon)&&c.lat>=-90&&c.lat<=90&&c.lon>=-180&&c.lon<=180}
  function status(msg){const s=el('sunLocationStatus');if(s)s.textContent=msg||'';}
  function render(){
    const host=el('sunSavedLocationRows');if(!host)return;
    const tx=t(),items=read();host.innerHTML='';
    if(!items.length){const d=document.createElement('div');d.className='sun-location-empty';d.textContent=tx.empty;host.appendChild(d);return;}
    items.forEach((item,index)=>{
      const row=document.createElement('div');row.className='sun-location-row';
      const info=document.createElement('div');info.className='sun-location-info';
      const b=document.createElement('b');b.textContent=item.name;
      const small=document.createElement('small');small.textContent=Number(item.lat).toFixed(6)+', '+Number(item.lon).toFixed(6);
      info.appendChild(b);info.appendChild(small);
      const actions=document.createElement('div');actions.className='sun-location-actions';
      const use=document.createElement('button');use.type='button';use.className='sun-location-use';use.dataset.index=String(index);use.textContent=tx.apply;
      const del=document.createElement('button');del.type='button';del.className='sun-location-delete';del.dataset.index=String(index);del.textContent=tx.remove;
      actions.appendChild(use);actions.appendChild(del);row.appendChild(info);row.appendChild(actions);host.appendChild(row);
    });
  }
  function translate(){
    if(!el('sunSavedLocations'))return;
    const tx=t();el('sunLocationTitle').textContent=tx.title;el('sunLocationNote').textContent=tx.note;el('sunLocationNameLabel').textContent=tx.name;el('sunLocationName').placeholder=tx.placeholder;el('sunLocationSave').textContent=tx.save;render();
  }
  function save(){
    const tx=t(),name=(el('sunLocationName')?.value||'').trim(),c=coords();
    if(!name){status(tx.needName);return}if(!valid(c)){status(tx.invalid);return}
    const items=read(),existing=items.findIndex(x=>String(x.name).toLowerCase()===name.toLowerCase());
    const item={name,lat:c.lat,lon:c.lon};if(existing>=0)items[existing]=item;else items.unshift(item);
    write(items.slice(0,30));el('sunLocationName').value='';status(tx.saved);render();
  }
  function rowClick(ev){
    const use=ev.target.closest('.sun-location-use[data-index]'),del=ev.target.closest('.sun-location-delete[data-index]');if(!use&&!del)return;
    const items=read(),i=Number((use||del).dataset.index);if(!Number.isInteger(i)||i<0||i>=items.length)return;
    if(del){items.splice(i,1);write(items);render();return;}
    const item=items[i];el('sunLat').value=Number(item.lat).toFixed(6);el('sunLon').value=Number(item.lon).toFixed(6);
    el('sunLat').dispatchEvent(new Event('change',{bubbles:true}));el('sunLon').dispatchEvent(new Event('change',{bubbles:true}));status(item.name);
  }
  function init(){
    const locate=el('sunLocate');if(!locate||el('sunSavedLocations'))return false;
    const source=locate.closest('.card');if(!source||!source.parentNode)return false;
    const style=document.createElement('style');style.textContent='.sun-location-note,.sun-location-empty,#sunLocationStatus{font-size:12px;color:#9299a3}.sun-location-note{margin-bottom:12px}.sun-location-save-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end}.sun-location-save-row .btn{margin:0;white-space:nowrap}.sun-location-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid #292d33}.sun-location-info b{display:block;color:#f5c542}.sun-location-info small{display:block;color:#9299a3;margin-top:3px}.sun-location-actions{display:flex;gap:6px}.sun-location-actions button{background:#171b20;border:1px solid #30343b;border-radius:8px;color:#d8dce2;padding:7px 9px;font-size:10px;font-weight:800}.sun-location-delete{color:#d89a9a!important}@media(max-width:520px){.sun-location-save-row{grid-template-columns:1fr}.sun-location-row{grid-template-columns:1fr}.sun-location-actions{justify-content:flex-start}}';document.head.appendChild(style);
    const card=document.createElement('div');card.className='card';card.id='sunSavedLocations';card.innerHTML='<h2 id="sunLocationTitle" style="margin-top:0"></h2><div id="sunLocationNote" class="sun-location-note"></div><div class="sun-location-save-row"><div><label class="caption" id="sunLocationNameLabel"></label><input id="sunLocationName" type="text" maxlength="50"></div><button type="button" id="sunLocationSave" class="btn secondary"></button></div><div id="sunLocationStatus" style="margin-top:8px"></div><div id="sunSavedLocationRows" style="margin-top:8px"></div>';
    source.parentNode.insertBefore(card,source.nextSibling);
    el('sunLocationSave').addEventListener('click',save);el('sunSavedLocationRows').addEventListener('click',rowClick);
    el('sunLocationName').addEventListener('keydown',e=>{if(e.key==='Enter')save();});
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0);};}
    translate();return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();
