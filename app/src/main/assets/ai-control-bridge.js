(function(){
'use strict';
var KEY='lighting_ai_control_draft_v1',CARD='lightingai-ai-control-draft';
function E(id){return document.getElementById(id)}
function sr(){return (window.currentLang||'sr')!=='en'}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c})}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v))}
function diagramLights(plan){
 var d=plan&&plan.lighting_diagram;
 if(d&&Array.isArray(d.lights))return d.lights;
 if(plan&&plan.plan&&plan.plan.lighting_diagram&&Array.isArray(plan.plan.lighting_diagram.lights))return plan.plan.lighting_diagram.lights;
 return [];
}
function findValue(x,names){
 for(var i=0;i<names.length;i++){var k=names[i];if(x&&x[k]!=null&&x[k]!=='')return x[k]}
 return null;
}
function normalize(plan){
 var lights=diagramLights(plan).map(function(x,i){
  return {
   id:x.id||('L'+(i+1)),
   fixture:x.fixture||x.name||'',
   role:x.role||'',
   direction:x.direction||'',
   intensity:findValue(x,['intensity','dimmer','level','power','percent']),
   cct:findValue(x,['cct','kelvin','temperature']),
   color:findValue(x,['color','rgb','hue']),
   notes:x.notes||''
  };
 });
 return {createdAt:new Date().toISOString(),lights:lights,rawPlan:plan};
}
function text(v){return v==null||v===''?'—':String(v)}
function row(x){
 var badge='<span style="display:inline-block;margin-top:6px;padding:3px 7px;border-radius:999px;background:#342e18;color:#f5dd91;font-size:10px;font-weight:800">'+(sr()?'BLUETOOTH POTVRDA JE POTREBNA':'BLUETOOTH VERIFICATION REQUIRED')+'</span>';
 return '<div style="padding:10px 0;border-top:1px solid #2b2f35">'+
 '<div style="font-weight:900">'+esc(x.id)+' · '+esc(x.fixture||'—')+'</div>'+
 '<div class="muted small" style="margin-top:4px">'+esc(x.role||'')+(x.direction?' • '+esc(x.direction):'')+'</div>'+
 '<div class="muted small" style="margin-top:4px">'+(sr()?'Intenzitet':'Intensity')+': '+esc(text(x.intensity))+' · CCT: '+esc(text(x.cct))+(x.color?' · '+esc(x.color):'')+'</div>'+badge+
 '</div>';
}
function render(){
 var host=E('controlContent');if(!host)return false;
 var card=E(CARD);if(!card){card=document.createElement('div');card.id=CARD;var dash=E('lightingai-control-dashboard');if(dash&&dash.nextSibling)host.insertBefore(card,dash.nextSibling);else host.insertBefore(card,host.firstChild)}
 var draft=load(),latest=window.__lightingAIVisualLastPlan||null,plan=latest?normalize(latest):draft;
 var lights=plan&&Array.isArray(plan.lights)?plan.lights:[];
 card.innerHTML='<details class="card" style="border-color:#5a4a1c;background:#14171b" '+(lights.length?'open':'')+'>'+
 '<summary style="cursor:pointer;list-style:none"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><div style="font-size:18px;font-weight:900;color:#f5c542">'+(sr()?'AI → KONTROLA':'AI → CONTROL')+'</div><div class="muted small" style="margin-top:4px">'+(sr()?'AI nacrt za proveru pre bilo kakvog slanja.':'AI draft for review before any output is sent.')+'</div></div><span style="padding:5px 8px;border-radius:999px;background:'+(lights.length?'#342e18':'#20242a')+';color:'+(lights.length?'#f5dd91':'#9299a3')+';font-size:10px;font-weight:900">'+(lights.length?(lights.length+' '+(sr()?'SVETALA':'LIGHTS')):(sr()?'PRAZNO':'EMPTY'))+'</span></div></summary>'+
 '<div style="margin-top:12px;padding-top:10px;border-top:1px solid #2b2f35">'+
 (lights.length?lights.map(row).join(''):'<div class="muted small">'+(sr()?'Još nema AI plana za prenos.':'No AI plan is ready to transfer yet.')+'</div>')+
 (latest&&lights.length?'<button id="aiControlTransfer" class="btn primary" type="button" style="width:100%;margin-top:12px">'+(sr()?'PRENESI U KONTROLU':'TRANSFER TO CONTROL')+'</button>':'')+(draft&&lights.length?'<button id="aiControlClear" class="btn secondary" type="button" style="width:100%;margin-top:8px">'+(sr()?'UKLONI AI NACRT':'CLEAR AI DRAFT')+'</button>':'')+
 '<div id="aiControlStatus" class="muted small" style="margin-top:8px"></div></div></details>';
 var b=E('aiControlTransfer');if(b)b.onclick=function(){var d=normalize(window.__lightingAIVisualLastPlan||{});save(d);window.__lightingAIControlDraft=d;var s=E('aiControlStatus');if(s)s.textContent=sr()?'AI nacrt je prenet. Pronađi Bluetooth uređaj i proveri ga pre bilo kakve komande.':'AI draft transferred. Discover and verify the Bluetooth fixture before any command.';render()};var clear=E('aiControlClear');if(clear)clear.onclick=function(){localStorage.removeItem(KEY);window.__lightingAIControlDraft=null;render()};
 return true;
}
function transferLatest(){var latest=window.__lightingAIVisualLastPlan||null;if(!latest)return false;var d=normalize(latest);if(!d.lights||!d.lights.length)return false;save(d);window.__lightingAIControlDraft=d;render();return true;}
window.LightingAIAIControlBridge={render:render,getDraft:load,transferLatest:transferLatest,clear:function(){localStorage.removeItem(KEY);render()},version:'0.6-bluetooth-verification-only'};
window.addEventListener('lightingai-visual-plan-ready',function(){setTimeout(render,0)});
var tries=0,timer=setInterval(function(){tries++;if(render()||tries>200)clearInterval(timer)},120);
setInterval(render,1200);
var old=window.setLanguage;
if(typeof old==='function'&&!window.__lightingAIAIControlLang){
 window.__lightingAIAIControlLang=true;
 window.setLanguage=function(l){old(l);setTimeout(render,0)}
}
})();
