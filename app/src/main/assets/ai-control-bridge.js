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
 return '<div style="padding:10px 0;border-top:1px solid #2b2f35">'+
 '<div style="font-weight:900">'+esc(x.id)+' · '+esc(x.fixture||'—')+'</div>'+
 '<div class="muted small" style="margin-top:4px">'+esc(x.role||'')+(x.direction?' • '+esc(x.direction):'')+'</div>'+
 '<div class="muted small" style="margin-top:4px">'+(sr()?'Intenzitet':'Intensity')+': '+esc(text(x.intensity))+' · CCT: '+esc(text(x.cct))+(x.color?' · '+esc(x.color):'')+'</div>'+
 '</div>';
}
function render(){
 var host=E('controlContent');if(!host)return false;
 var card=E(CARD);if(!card){card=document.createElement('div');card.id=CARD;var dash=E('lightingai-control-dashboard');if(dash&&dash.nextSibling)host.insertBefore(card,dash.nextSibling);else host.insertBefore(card,host.firstChild)}
 var draft=load(),latest=window.__lightingAIVisualLastPlan||null,plan=latest?normalize(latest):draft;
 var lights=plan&&Array.isArray(plan.lights)?plan.lights:[];
 card.innerHTML='<div class="card" style="border-color:#5a4a1c">'+
 '<div style="font-size:18px;font-weight:900;color:#f5c542">'+(sr()?'AI → KONTROLA':'AI → CONTROL')+'</div>'+
 '<div class="muted small" style="margin-top:6px">'+(sr()?'AI plan se ovde priprema kao nacrt. Ništa se ne šalje rasveti dok ti ne potvrdiš u mrežnoj kontroli.':'The AI plan is prepared here as a draft. Nothing is sent to fixtures until you confirm it in network control.')+'</div>'+
 (lights.length?lights.map(row).join(''):'<div class="muted small" style="margin-top:10px">'+(sr()?'Još nema AI plana za prenos.':'No AI plan is ready to transfer yet.')+'</div>')+
 (latest&&lights.length?'<button id="aiControlTransfer" class="btn primary" type="button" style="width:100%;margin-top:12px">'+(sr()?'PRENESI U KONTROLU':'TRANSFER TO CONTROL')+'</button>':'')+
 '<div id="aiControlStatus" class="muted small" style="margin-top:8px"></div></div>';
 var b=E('aiControlTransfer');if(b)b.onclick=function(){var d=normalize(window.__lightingAIVisualLastPlan||{});save(d);window.__lightingAIControlDraft=d;var s=E('aiControlStatus');if(s)s.textContent=sr()?'AI nacrt je prenet. Proveri uređaje, DMX Patch i vrednosti pre slanja.':'AI draft transferred. Verify fixtures, DMX Patch and values before sending.';render()};
 return true;
}
window.LightingAIAIControlBridge={render:render,getDraft:load,clear:function(){localStorage.removeItem(KEY);render()},version:'0.1-draft-only'};
window.addEventListener('lightingai-visual-plan-ready',function(){setTimeout(render,0)});
var tries=0,timer=setInterval(function(){tries++;if(render()||tries>200)clearInterval(timer)},120);
setInterval(render,1200);
var old=window.setLanguage;
if(typeof old==='function'&&!window.__lightingAIAIControlLang){
 window.__lightingAIAIControlLang=true;
 window.setLanguage=function(l){old(l);setTimeout(render,0)}
}
})();