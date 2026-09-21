(function(){
'use strict';
const KEY='lighting_shot_list_v1';
const SET_KEY='lighting_set_sketch_v1';
const MEASURE_KEY='lighting_scene_measurements_v1';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{title:'🎞 Shot List / Coverage Planer',intro:'Planiraj više kadrova jedne scene i sačuvaj tehničke parametre kamere, blocking i referentnu sliku. Sve ostaje lokalno na uređaju.',add:'DODAJ KADAR IZ TRENUTNOG SETUP-A',clear:'OBRIŠI SVE',name:'KADAR',type:'TIP',lens:'OBJEKTIV',distance:'KAMERA → GLUMAC',status:'STATUS',notes:'NAPOMENA',duplicate:'DUPLIRAJ',remove:'UKLONI',planned:'PLANIRAN',ready:'SPREMAN',done:'SNIMLJEN',empty:'Nema planiranih kadrova.',summary:'Kadrovi',captured:'snimljeno',confirmClear:'Obrisati ceo Shot List?',shot:'Kadar',wide:'Total',medium:'Srednji',close:'Krupan',detail:'Detalj',insert:'Insert',other:'Drugo',reference:'REFERENCE',addReference:'DODAJ REFERENTNU SLIKU',removeReference:'UKLONI SLIKU',camera:'KAMERA',subject:'GLUMAC',fov:'H-FOV',refresh:'OSVEŽI SETUP'},
 en:{title:'🎞 Shot List / Coverage Planner',intro:'Plan multiple shots and save camera, blocking and reference-image data for each setup. Everything stays local on the device.',add:'ADD SHOT FROM CURRENT SETUP',clear:'CLEAR ALL',name:'SHOT',type:'TYPE',lens:'LENS',distance:'CAMERA → SUBJECT',status:'STATUS',notes:'NOTE',duplicate:'DUPLICATE',remove:'REMOVE',planned:'PLANNED',ready:'READY',done:'SHOT',empty:'No planned shots.',summary:'Shots',captured:'shot',confirmClear:'Clear the entire Shot List?',shot:'Shot',wide:'Wide',medium:'Medium',close:'Close-up',detail:'Detail',insert:'Insert',other:'Other',reference:'REFERENCE',addReference:'ADD REFERENCE IMAGE',removeReference:'REMOVE IMAGE',camera:'CAMERA',subject:'ACTOR',fov:'H-FOV',refresh:'REFRESH SETUP'}
};
const t=()=>TXT[lang()];
function parse(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v==null?f:v}catch(e){return f}}
function read(){const v=parse(KEY,{rows:[]});return v&&Array.isArray(v.rows)?v:{rows:[]}}
let state=read();
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function id(){return 'shot_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
function activeScene(){const s=parse(SET_KEY,null);if(!s||!Array.isArray(s.scenes)||!s.scenes.length)return null;return s.scenes.find(x=>x.id===s.activeId)||s.scenes[0]}
function latestSubjectDistance(){const a=parse(MEASURE_KEY,[]);if(!Array.isArray(a))return null;const m=a.find(x=>x&&x.target==='subject'&&Number(x.distance)>0);return m?Number(m.distance):null}
function selectedCamera(sc){try{const a=window.LightingAISetSketch,id=a&&typeof a.getSelectedId==='function'?a.getSelectedId():null;const picked=sc&&id&&sc.objects.find(o=>o.id===id&&o.type==='camera');if(picked)return picked}catch(e){}return sc&&Array.isArray(sc.objects)?sc.objects.find(o=>o.type==='camera'):null}
function nearestSubject(sc,cam){if(!sc||!cam)return null;const list=(sc.objects||[]).filter(o=>o.type==='subject').map(o=>({o,d:Math.hypot(Number(o.x)-Number(cam.x),Number(o.y)-Number(cam.y))})).filter(x=>Number.isFinite(x.d)).sort((a,b)=>a.d-b.d);return list[0]||null}
function currentSetup(){
 const sc=activeScene(),cam=selectedCamera(sc),near=nearestSubject(sc,cam),subj=near&&near.o;
 let distance=latestSubjectDistance();if(!(distance>0)&&near)distance=near.d;
 let dof=null,flicker=null,dmx=null,continuity=null;
 try{if(typeof window.LightingAIDofSnapshot==='function')dof=window.LightingAIDofSnapshot()}catch(e){}
 try{if(typeof window.LightingAIFlickerSnapshot==='function')flicker=window.LightingAIFlickerSnapshot()}catch(e){}
 try{if(typeof window.LightingAIDmxSnapshot==='function')dmx=window.LightingAIDmxSnapshot()}catch(e){}
 try{if(typeof window.LightingAIContinuitySnapshot==='function')continuity=window.LightingAIContinuitySnapshot()}catch(e){}
 const focal=cam&&Number(cam.focalLengthMm)||35,sensor=cam&&Number(cam.sensorWidthMm)||36,hfov=2*Math.atan(sensor/(2*focal))*180/Math.PI;
 return {sceneId:sc&&sc.id||null,sceneName:sc&&sc.name||null,cameraId:cam&&cam.id||null,cameraLabel:cam&&(cam.label||'Kamera')||null,cameraX:cam?Number(cam.x):null,cameraY:cam?Number(cam.y):null,cameraRot:cam?(Number(cam.rot)||0):null,focalLengthMm:cam?focal:null,sensorWidthMm:cam?sensor:null,horizontalFovDeg:cam?hfov:null,subjectId:subj&&subj.id||null,subjectLabel:subj&&(subj.label||'Glumac')||null,cameraToSubjectM:distance>0?distance:null,blocking:cam&&cam.blocking?JSON.parse(JSON.stringify(cam.blocking)):null,dof:dof||null,flicker:flicker||null,dmx:dmx||null,continuity:continuity||null,createdAt:new Date().toISOString()};
}
function add(){const n=state.rows.length+1,r={id:id(),name:t().shot+' '+n,type:'medium',status:'planned',notes:'',referenceImage:null,setup:currentSetup()};state.rows.push(r);save();render();return r}
function statusOptions(v){const x=t();return [['planned',x.planned],['ready',x.ready],['done',x.done]].map(a=>'<option value="'+a[0]+'" '+(v===a[0]?'selected':'')+'>'+a[1]+'</option>').join('')}
function typeOptions(v){const x=t();return [['wide',x.wide],['medium',x.medium],['close',x.close],['detail',x.detail],['insert',x.insert],['other',x.other]].map(a=>'<option value="'+a[0]+'" '+(v===a[0]?'selected':'')+'>'+a[1]+'</option>').join('')}
function fmt(v,s=''){return Number.isFinite(Number(v))?Number(v).toFixed(2)+s:'—'}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){
 const box=E('shotListRows');if(!box)return;const x=t();
 if(!state.rows.length){box.innerHTML='<div class="shot-list-empty">'+x.empty+'</div>';summary();return}
 box.innerHTML=state.rows.map((r,i)=>{const s=r.setup||{},ref=r.referenceImage;
  return '<div class="shot-list-row" data-row="'+r.id+'"><div class="shot-list-main"><input class="shot-name" data-id="'+r.id+'" value="'+esc(r.name||x.shot+' '+(i+1))+'"><select class="shot-type" data-id="'+r.id+'">'+typeOptions(r.type)+'</select><select class="shot-status" data-id="'+r.id+'">'+statusOptions(r.status)+'</select></div>'+
  '<div class="shot-list-tech"><span><small>'+x.lens+'</small><b>'+(s.focalLengthMm?fmt(s.focalLengthMm,' mm'):'—')+'</b></span><span><small>'+x.fov+'</small><b>'+(s.horizontalFovDeg?fmt(s.horizontalFovDeg,'°'):'—')+'</b></span><span><small>'+x.distance+'</small><b>'+(s.cameraToSubjectM?fmt(s.cameraToSubjectM,' m'):'—')+'</b></span><span><small>'+x.camera+'</small><b>'+esc(s.cameraLabel||'—')+'</b></span><span><small>'+x.subject+'</small><b>'+esc(s.subjectLabel||'—')+'</b></span><span><small>SCENA</small><b>'+esc(s.sceneName||'—')+'</b></span></div>'+
  '<div class="shot-reference">'+(ref?'<img src="'+esc(ref)+'" alt="'+esc(x.reference)+'"><button class="btn secondary shot-ref-remove" data-id="'+r.id+'" type="button">'+x.removeReference+'</button>':'<button class="btn secondary shot-ref-add" data-id="'+r.id+'" type="button">'+x.addReference+'</button>')+'<input class="shot-ref-file" data-id="'+r.id+'" type="file" accept="image/*" hidden></div>'+
  '<textarea class="shot-notes" data-id="'+r.id+'" placeholder="'+x.notes+'">'+esc(r.notes||'')+'</textarea><div class="actions"><button class="btn primary shot-refresh" data-id="'+r.id+'" type="button">'+x.refresh+'</button><button class="btn secondary shot-dup" data-id="'+r.id+'" type="button">'+x.duplicate+'</button><button class="btn secondary shot-remove" data-id="'+r.id+'" type="button">'+x.remove+'</button></div></div>';
 }).join('');summary();
}
function summary(){const el=E('shotListSummary');if(!el)return;const done=state.rows.filter(r=>r.status==='done').length;el.textContent=t().summary+': '+state.rows.length+' · '+done+' '+t().captured}
function update(el){const r=state.rows.find(x=>x.id===el.dataset.id);if(!r)return;if(el.classList.contains('shot-name'))r.name=el.value;if(el.classList.contains('shot-type'))r.type=el.value;if(el.classList.contains('shot-status'))r.status=el.value;if(el.classList.contains('shot-notes'))r.notes=el.value;save();summary()}
function duplicate(rowId){const r=state.rows.find(x=>x.id===rowId);if(!r)return;const copy=JSON.parse(JSON.stringify(r));copy.id=id();copy.name=(r.name||t().shot)+' copy';copy.status='planned';copy.setup=currentSetup();state.rows.push(copy);save();render()}
function refreshSetup(rowId){const r=state.rows.find(x=>x.id===rowId);if(!r)return false;r.setup=currentSetup();save();render();return true}
function setReference(rowId,file){const r=state.rows.find(x=>x.id===rowId);if(!r||!file)return;const reader=new FileReader();reader.onload=()=>{r.referenceImage=String(reader.result||'');save();render()};reader.readAsDataURL(file)}
function translate(){if(!E('shotListCard'))return;const x=t();E('shotListTitle').textContent=x.title;E('shotListIntro').textContent=x.intro;E('shotListAdd').textContent=x.add;E('shotListClear').textContent=x.clear;render()}
function bindRows(){
 const root=E('shotListRows');if(!root)return;
 root.addEventListener('input',ev=>{const el=ev.target.closest('[data-id]');if(el&&!el.classList.contains('shot-ref-file'))update(el)});
 root.addEventListener('change',ev=>{const input=ev.target.closest('.shot-ref-file');if(input&&input.files&&input.files[0]){setReference(input.dataset.id,input.files[0]);return}const el=ev.target.closest('[data-id]');if(el)update(el)});
 root.addEventListener('click',ev=>{
  const addRef=ev.target.closest('.shot-ref-add');if(addRef){const input=root.querySelector('.shot-ref-file[data-id="'+addRef.dataset.id+'"]');if(input){input.value='';input.click()}return}
  const removeRef=ev.target.closest('.shot-ref-remove');if(removeRef){const row=state.rows.find(x=>x.id===removeRef.dataset.id);if(row){row.referenceImage=null;save();render()}return}
  const refresh=ev.target.closest('.shot-refresh');if(refresh){refreshSetup(refresh.dataset.id);return}
  const dup=ev.target.closest('.shot-dup');if(dup){duplicate(dup.dataset.id);return}
  const rem=ev.target.closest('.shot-remove');if(rem){state.rows=state.rows.filter(x=>x.id!==rem.dataset.id);save();render()}
 });
}
function init(){
 const planner=E('planner');if(!planner||E('shotListCard'))return false;
 const st=document.createElement('style');st.id='shotListStyle';st.textContent='.shot-list-card{margin-top:14px}.shot-list-row{margin-top:10px;padding:10px;border:1px solid #30343b;border-radius:12px;background:#0f1115}.shot-list-main{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:7px}.shot-list-tech{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:8px 0}.shot-list-tech span{padding:8px;background:#15191f;border-radius:9px}.shot-list-tech small{display:block;color:#9299a3;font-size:9px}.shot-list-tech b{display:block;color:#f5c542;margin-top:3px;font-size:12px}.shot-reference{margin:8px 0}.shot-reference img{display:block;width:100%;max-height:220px;object-fit:cover;border-radius:10px;border:1px solid #30343b;margin-bottom:6px}.shot-notes{min-height:58px}.shot-list-summary{margin-top:8px;color:#f5c542;font-size:12px}.shot-list-empty{color:#9299a3;font-size:12px;padding:8px 0}@media(max-width:560px){.shot-list-main{grid-template-columns:1fr 1fr}.shot-list-main .shot-name{grid-column:1/3}.shot-list-tech{grid-template-columns:1fr 1fr}.shot-list-tech span:last-child{grid-column:1/3}}';document.head.appendChild(st);
 const card=document.createElement('details');card.id='shotListCard';card.className='card shot-list-card';card.innerHTML='<summary style="font-weight:900;font-size:20px;cursor:pointer"><span id="shotListTitle"></span></summary><div style="margin-top:12px"><p id="shotListIntro" class="muted small"></p><div class="actions"><button id="shotListAdd" class="btn primary" type="button"></button><button id="shotListClear" class="btn secondary" type="button"></button></div><div id="shotListSummary" class="shot-list-summary"></div><div id="shotListRows"></div></div>';planner.appendChild(card);
 E('shotListAdd').addEventListener('click',add);E('shotListClear').addEventListener('click',()=>{if(confirm(t().confirmClear)){state={rows:[]};save();render()}});bindRows();
 if(typeof window.setLanguage==='function'&&!window.__shotListLangHook){const old=window.setLanguage;window.__shotListLangHook=true;window.setLanguage=function(l){old(l);setTimeout(translate,0)}}translate();return true;
}
window.LightingAIShotList={version:'1.1-blocking-storyboard',snapshot:function(){return JSON.parse(JSON.stringify(state))},addCurrent:add,refreshCurrentSetup:refreshSetup,render:render};
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>120)clearInterval(timer)},100);
})();