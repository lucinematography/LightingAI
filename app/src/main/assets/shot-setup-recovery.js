(function(){
'use strict';
const E=id=>document.getElementById(id);
const TXT={
 sr:{title:'♻ VRATI SHOT SETUP JSON',intro:'Vrati Blocking test iz ranije sačuvanog Shot Setup JSON fajla. Ovo ne menja jezik, backend/auth podatke ni fotografije.',pick:'IZABERI SHOT SETUP JSON',confirm:'POTVRDI VRAĆANJE',cancel:'OTKAŽI',ready:'Shot Setup je prepoznat',done:'Blocking scena je vraćena.',bad:'Fajl nije važeći LightingAI Shot Setup JSON.',large:'Fajl je prevelik.'},
 en:{title:'♻ RESTORE SHOT SETUP JSON',intro:'Restore the Blocking test from a previously saved Shot Setup JSON file. Language, backend/auth data and photos are not changed.',pick:'CHOOSE SHOT SETUP JSON',confirm:'CONFIRM RESTORE',cancel:'CANCEL',ready:'Shot Setup recognized',done:'Blocking scene restored.',bad:'This is not a valid LightingAI Shot Setup JSON file.',large:'File is too large.'}
};
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr',t=()=>TXT[lang()];
let staged=null;
function msg(v){const e=E('shotSetupRecoveryStatus');if(!e)return;e.textContent=v;setTimeout(()=>{if(e.textContent===v)e.textContent=''},3200)}
function normalize(v){
 if(!v||typeof v!=='object'||Array.isArray(v)||v.schema!=='lightingai-shot-setup-v3-blocking-designer'||!v.scene||!Array.isArray(v.scene.objects))throw new Error('schema');
 const src=v.scene,motions=v.blocking&&Array.isArray(v.blocking.motion)?v.blocking.motion:[],sceneId=String(src.id||'recovered-scene').slice(0,80)||'recovered-scene';
 const subjectObjects=src.objects.filter(o=>o&&o.type==='subject');
 const subjects=[];
 const objects=src.objects.slice(0,500).map((o,i)=>{
   const id='recovered-'+String(o.type||'object')+'-'+(i+1);
   const out={id,type:o.type||'subject',label:o.label||o.type||('Objekat '+(i+1)),x:Number.isFinite(Number(o.xM))?Number(o.xM):0,y:Number.isFinite(Number(o.yM))?Number(o.yM):0,rot:Number.isFinite(Number(o.directionDeg))?Number(o.directionDeg):0};
   if(out.type==='subject') subjects.push({id,label:out.label});
   if(o.fixtureId)out.fixtureId=o.fixtureId;
   if(Number.isFinite(Number(o.beamAngleDeg)))out.beamAngleDeg=Number(o.beamAngleDeg);
   if(out.type==='camera'){out.focalLengthMm=Number(o.focalLengthMm)||35;out.sensorWidthMm=Number(o.sensorWidthMm)||36}
   return out;
 });
 function findObject(type,label){return objects.find(o=>o.type===type&&String(o.label||'')===String(label||''))||objects.find(o=>o.type===type)||null}
 motions.slice(0,500).forEach(m=>{
   if(!m||!Array.isArray(m.path)||!m.path.length)return;
   const out=findObject(m.type,m.label);if(!out)return;
   out.blocking={durationSec:Number(m.durationSec)||5,path:m.path.map(p=>({x:Number.isFinite(Number(p.xM))?Number(p.xM):0,y:Number.isFinite(Number(p.yM))?Number(p.yM):0}))};
   if(out.type==='camera'){
     const target=subjects[0]||null;
     out.blocking.trackSubjectId=target?target.id:null;
     out.blocking.trackFramingMode=m.trackFramingMode==='preserve'?'preserve':'center';
     out.blocking.trackOffsetDeg=Number.isFinite(Number(m.trackOffsetDeg))?Number(m.trackOffsetDeg):0;
     out.blocking.trackingEnabled=!!m.trackSubjectId&&!!target;
   }
 });
 const equipment=Array.isArray(v.equipment)?v.equipment.slice(0,500).map(e=>({id:e.id||null,name:e.name||null,qty:Math.max(1,Math.round(Number(e.qty)||1))})).filter(e=>e.id):[];
 return {sceneState:{activeId:sceneId,scenes:[{id:sceneId,name:src.name||'Vraćena scena',roomW:Number(src.widthM)||10,roomH:Number(src.lengthM)||8,objects}]},equipment};
}
function apply(){
 if(!staged){msg(t().bad);return}
 localStorage.setItem('lighting_set_sketch_v1',JSON.stringify(staged.sceneState));
 if(staged.equipment.length)localStorage.setItem('lighting_equipment_v1',JSON.stringify(staged.equipment));
 try{window.equipment=JSON.parse(JSON.stringify(staged.equipment));if(typeof window.renderEquipment==='function')window.renderEquipment()}catch(e){}
 staged=null;renderPreview();msg(t().done);
 setTimeout(()=>location.reload(),650);
}
function renderPreview(){const p=E('shotSetupRecoveryPreview'),a=E('shotSetupRecoveryActions');if(!p||!a)return;if(!staged){p.hidden=true;p.style.display='none';a.hidden=true;a.style.display='none';return}p.hidden=false;p.style.display='block';a.hidden=false;a.style.display='flex';const s=staged.sceneState.scenes[0];const cam=s.objects.find(o=>o.type==='camera');p.textContent=t().ready+': '+s.name+' · '+s.objects.length+' elemenata · '+(cam&&cam.blocking&&cam.blocking.path?cam.blocking.path.length:0)+' waypoint'}
function install(){
 const planner=E('planner');if(!planner||E('shotSetupRecoveryCard'))return false;
 const card=document.createElement('details');card.id='shotSetupRecoveryCard';card.className='card';card.style.marginTop='14px';
 card.innerHTML='<summary style="font-weight:900;font-size:20px;cursor:pointer"><span id="shotSetupRecoveryTitle"></span></summary><div style="margin-top:12px"><p id="shotSetupRecoveryIntro" class="muted small"></p><input id="shotSetupRecoveryFile" type="file" accept="application/json,.json" hidden><div class="actions"><button id="shotSetupRecoveryPick" class="btn primary" type="button"></button></div><div id="shotSetupRecoveryPreview" class="muted small" style="margin-top:8px;display:none" hidden></div><div id="shotSetupRecoveryActions" class="actions" style="display:none" hidden><button id="shotSetupRecoveryConfirm" class="btn primary" type="button"></button><button id="shotSetupRecoveryCancel" class="btn secondary" type="button"></button></div><div id="shotSetupRecoveryStatus" style="font-size:12px;color:#b8f0d1;min-height:18px;margin-top:6px"></div></div>';
 planner.appendChild(card);
 const tx=()=>{E('shotSetupRecoveryTitle').textContent=t().title;E('shotSetupRecoveryIntro').textContent=t().intro;E('shotSetupRecoveryPick').textContent=t().pick;E('shotSetupRecoveryConfirm').textContent=t().confirm;E('shotSetupRecoveryCancel').textContent=t().cancel};
 E('shotSetupRecoveryPick').onclick=()=>{const f=E('shotSetupRecoveryFile');f.value='';f.click()};
 E('shotSetupRecoveryFile').onchange=ev=>{const file=ev.target.files&&ev.target.files[0];if(!file)return;if(file.size>2*1024*1024){msg(t().large);return}const rd=new FileReader();rd.onload=()=>{try{staged=normalize(JSON.parse(String(rd.result||'')));renderPreview()}catch(e){staged=null;renderPreview();msg(t().bad)}};rd.onerror=()=>msg(t().bad);rd.readAsText(file)};
 E('shotSetupRecoveryConfirm').onclick=apply;E('shotSetupRecoveryCancel').onclick=()=>{staged=null;renderPreview()};tx();return true
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>160)clearInterval(timer)},100);
window.LightingAIShotSetupRecovery={version:'1.0',normalize};
})();