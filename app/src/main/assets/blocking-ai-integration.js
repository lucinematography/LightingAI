(function(){
'use strict';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{title:'AI / BLOCKING PREDLOG',empty:'Još nema AI Visual Scene Plan rezultata. Generiši AI plan, a Blocking će ga prikazati kao predlog bez automatskih izmena.',open:'OTVORI AI VISUAL PLAN',refresh:'OSVEŽI PREDLOG',apply:'PRIMENI',applyAll:'PRIMENI SVE PREDLOGE',confirmAll:'Primeniti sve AI Blocking predloge na postojeću Skicu seta?',applied:'AI predlog je primenjen.',appliedAll:'AI Blocking predlozi su primenjeni.',noMatch:'AI svetlo nema bezbedno povezano svetlo na Skici seta.',move:'POMERANJE',distance:'POMERAJ',role:'ULOGA',fixture:'RASVETA',current:'TRENUTNO',suggested:'AI PREDLOG',manual:'Nijedna izmena se ne primenjuje automatski. Ghost oznake na tlocrtu su samo preview.',none:'AI plan nema predloge rasvete za Blocking.',matched:'povezano',unmatched:'nije povezano'},
 en:{title:'AI / BLOCKING PROPOSAL',empty:'There is no AI Visual Scene Plan result yet. Generate an AI plan and Blocking will show it as a proposal without automatic changes.',open:'OPEN AI VISUAL PLAN',refresh:'REFRESH PROPOSAL',apply:'APPLY',applyAll:'APPLY ALL PROPOSALS',confirmAll:'Apply all AI Blocking proposals to the existing Set Sketch?',applied:'AI proposal applied.',appliedAll:'AI Blocking proposals applied.',noMatch:'The AI light has no safely matched light in Set Sketch.',move:'MOVE',distance:'MOVE',role:'ROLE',fixture:'FIXTURE',current:'CURRENT',suggested:'AI PROPOSAL',manual:'No change is applied automatically. Ghost markers on the floor plan are preview only.',none:'The AI plan contains no Blocking lighting proposals.',matched:'matched',unmatched:'unmatched'}
};
const t=()=>TXT[lang()];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
let plan=null,proposals=[],statusTimer=null,lastSceneSignature='';

function api(){return window.LightingAISetSketch||null}
function scene(){const a=api();return a&&a.getActiveScene?a.getActiveScene():null}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function normText(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function catalogName(light){
 const f=(window.catalogFixtures||[]).find(x=>x&&x.id===light.fixtureId);
 return f?[(f.manufacturer||''),(f.model||''),(f.id||'')].join(' '):String(light.label||'');
}
function planLights(p){
 const d=p&&p.lighting_diagram||p&&p.diagram||{};
 const arr=Array.isArray(d.lights)?d.lights:(Array.isArray(p&&p.lights)?p.lights:[]);
 return arr.filter(x=>x&&typeof x==='object');
}
function planSubjects(p){
 const d=p&&p.lighting_diagram||p&&p.diagram||{};
 const arr=Array.isArray(d.subjects)?d.subjects:[];
 return arr.filter(x=>x&&typeof x==='object').map((x,i)=>({id:String(x.id||('S'+(i+1))),x:clamp(x.x,5,95),y:clamp(x.y,5,95)}));
}
function scoreCandidate(ai,light){
 const needle=normText(ai.fixture||ai.name||ai.model||''),hay=normText((light.label||'')+' '+catalogName(light));
 if(!needle)return 0;if(hay===needle)return 100;if(hay.includes(needle)||needle.includes(hay))return 70;
 const tokens=needle.split(' ').filter(x=>x.length>2),hits=tokens.filter(x=>hay.includes(x)).length;
 return hits?hits*10:0;
}
function directionTo(x,y,tx,ty){return ((Math.atan2(tx-x,-(ty-y))*180/Math.PI)%360+360)%360}
function beamFrom(ai){
 for(const k of ['beamAngleDeg','beam_angle_deg','beamAngle','beam']){
  const v=Number(ai&&ai[k]);if(Number.isFinite(v)&&v>=1&&v<=179)return v;
 }
 return null;
}
function buildProposals(p){
 const s=scene();if(!s)return[];
 const lights=s.objects.filter(o=>o.type==='light'),used=new Set(),subjects=planSubjects(p),byId={};subjects.forEach(x=>byId[x.id]=x);
 return planLights(p).map((ai,index)=>{
  const px=clamp(ai.x,5,95),py=clamp(ai.y,5,95),sx=clamp((px-5)/90*s.roomW,0,s.roomW),sy=clamp((py-5)/90*s.roomH,0,s.roomH);
  let best=null,bestScore=-1;
  lights.forEach(light=>{if(used.has(light.id))return;const sc=scoreCandidate(ai,light);if(sc>bestScore){best=light;bestScore=sc}});
  if((!best||bestScore<=0)){
    best=lights.find(light=>!used.has(light.id))||null;
    bestScore=best?1:-1;
  }
  if(best)used.add(best.id);
  const targetIds=Array.isArray(ai.targets)?ai.targets.map(String):[],target=targetIds.map(id=>byId[id]).find(Boolean)||null;
  const rot=target?directionTo(sx,sy,clamp((target.x-5)/90*s.roomW,0,s.roomW),clamp((target.y-5)/90*s.roomH,0,s.roomH)):null;
  const beam=beamFrom(ai);
  return{id:'aib_'+index,aiIndex:index,role:String(ai.role||ai.type||''),fixture:String(ai.fixture||ai.name||ai.model||''),lightId:best&&best.id||null,lightLabel:best&&best.label||null,matchScore:bestScore,x:sx,y:sy,rot:Number.isFinite(rot)?rot:null,beamAngleDeg:beam,current:best?{x:Number(best.x)||0,y:Number(best.y)||0,rot:Number(best.rot)||0}:null,moveM:best?Math.hypot((Number(best.x)||0)-sx,(Number(best.y)||0)-sy):null};
 });
}
function status(msg){
 const el=E('blockingAiStatus');if(!el)return;el.textContent=msg||'';clearTimeout(statusTimer);statusTimer=setTimeout(()=>{if(el)el.textContent=''},2500);
}
function sceneSignature(){
 const s=scene();if(!s)return'';return s.id+'|'+s.objects.filter(o=>o.type==='light').map(o=>[o.id,o.x,o.y,o.rot,o.beamAngleDeg].join(',')).join(';');
}
function analyze(p){
 plan=p||window.__lightingAIVisualLastPlan||null;proposals=plan?buildProposals(plan):[];lastSceneSignature=sceneSignature();render();draw();return proposals;
}
function applyProposal(id,quiet){
 const s=scene(),p=proposals.find(x=>x.id===id);if(!s||!p||!p.lightId)return false;
 const light=s.objects.find(o=>o.id===p.lightId&&o.type==='light');if(!light)return false;
 light.x=clamp(p.x,0,s.roomW);light.y=clamp(p.y,0,s.roomH);if(Number.isFinite(p.rot))light.rot=p.rot;if(Number.isFinite(p.beamAngleDeg))light.beamAngleDeg=p.beamAngleDeg;
 const a=api();if(a&&a.persist)a.persist();if(a&&a.selectObject)a.selectObject(light.id);if(a&&a.refresh)a.refresh();
 proposals=plan?buildProposals(plan):[];lastSceneSignature=sceneSignature();render();draw();if(!quiet)status(t().applied);return true;
}
function applyAll(){
 const ids=proposals.filter(p=>p.lightId).map(p=>p.id);if(!ids.length)return;
 if(!confirm(t().confirmAll))return;
 ids.forEach(id=>applyProposal(id,true));status(t().appliedAll);
}
function draw(){
 const svg=E('setSketchSvg'),a=api(),s=scene();if(!svg||!a||!s)return;
 svg.querySelectorAll('.blocking-ai-overlay').forEach(n=>n.remove());
 if(!plan||!proposals.length)return;
 const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','blocking-ai-overlay');g.setAttribute('pointer-events','none');
 proposals.forEach((p,i)=>{
  const dest=a.screenXY(p.x,p.y),matched=p.lightId? s.objects.find(o=>o.id===p.lightId):null;
  if(matched){const cur=a.screenXY(matched.x,matched.y),line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',cur.x);line.setAttribute('y1',cur.y);line.setAttribute('x2',dest.x);line.setAttribute('y2',dest.y);line.setAttribute('stroke','#d07cff');line.setAttribute('stroke-width','2');line.setAttribute('stroke-dasharray','7 6');line.setAttribute('opacity','.78');g.appendChild(line)}
  const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('cx',dest.x);circle.setAttribute('cy',dest.y);circle.setAttribute('r','17');circle.setAttribute('fill','#d07cff');circle.setAttribute('fill-opacity','.14');circle.setAttribute('stroke','#d07cff');circle.setAttribute('stroke-width','3');circle.setAttribute('stroke-dasharray','5 3');g.appendChild(circle);
  const tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('x',dest.x);tx.setAttribute('y',dest.y+4);tx.setAttribute('text-anchor','middle');tx.setAttribute('font-size','11');tx.setAttribute('font-weight','900');tx.setAttribute('fill','#f1ccff');tx.textContent='AI '+(i+1);g.appendChild(tx);
 });
 svg.appendChild(g);
}
function render(){
 const body=E('blockingAiBody');if(!body)return;const x=t();
 if(E('blockingAiTitle'))E('blockingAiTitle').textContent=x.title;
 if(!plan){
  body.innerHTML='<div class="blocking-ai-empty">'+esc(x.empty)+'</div><div class="blocking-ai-actions"><button id="blockingAiOpen" class="btn primary" type="button">'+esc(x.open)+'</button><button id="blockingAiRefresh" class="btn secondary" type="button">'+esc(x.refresh)+'</button></div><div class="blocking-ai-note">'+esc(x.manual)+'</div>';
  if(E('blockingAiOpen'))E('blockingAiOpen').onclick=()=>{try{const m=window.LightingAIVisualScenePlan;if(m&&typeof m.open==='function'){m.open();return}const l=window.LightingAIVisualSceneLauncher;if(l&&typeof l.open==='function'){l.open();return}status(lang()==='en'?'AI Visual Plan is not ready.':'AI Visual Plan još nije spreman.')}catch(e){status(lang()==='en'?'AI Visual Plan could not open.':'AI Visual Plan nije mogao da se otvori.')}};
  if(E('blockingAiRefresh'))E('blockingAiRefresh').onclick=()=>analyze(window.__lightingAIVisualLastPlan||null);
  return;
 }
 if(!proposals.length){body.innerHTML='<div class="blocking-ai-empty">'+esc(x.none)+'</div><div class="blocking-ai-note">'+esc(x.manual)+'</div>';return}
 body.innerHTML='<div class="blocking-ai-summary">'+proposals.filter(p=>p.lightId).length+' '+esc(x.matched)+' · '+proposals.filter(p=>!p.lightId).length+' '+esc(x.unmatched)+'</div><div class="blocking-ai-list">'+proposals.map(p=>'<div class="blocking-ai-row"><div><b>'+esc(p.role||p.fixture||('AI '+(p.aiIndex+1)))+'</b><small>'+esc(x.fixture)+': '+esc(p.fixture||'—')+'</small><small>'+esc(x.suggested)+': '+p.x.toFixed(2)+' m · '+p.y.toFixed(2)+' m'+(Number.isFinite(p.rot)?' · '+p.rot.toFixed(0)+'°':'')+'</small>'+(p.current?'<small>'+esc(x.current)+': '+p.current.x.toFixed(2)+' m · '+p.current.y.toFixed(2)+' m · '+esc(x.distance)+' '+p.moveM.toFixed(2)+' m</small>':'<small>'+esc(x.noMatch)+'</small>')+'</div>'+(p.lightId?'<button class="btn primary blocking-ai-apply" data-id="'+esc(p.id)+'" type="button">'+esc(x.apply)+'</button>':'')+'</div>').join('')+'</div><div class="blocking-ai-actions"><button id="blockingAiRefresh" class="btn secondary" type="button">'+esc(x.refresh)+'</button><button id="blockingAiApplyAll" class="btn primary" type="button">'+esc(x.applyAll)+'</button></div><div class="blocking-ai-note">'+esc(x.manual)+'</div>';
 body.querySelectorAll('.blocking-ai-apply').forEach(b=>b.onclick=()=>applyProposal(b.dataset.id,false));
 E('blockingAiRefresh').onclick=()=>analyze(window.__lightingAIVisualLastPlan||plan);E('blockingAiApplyAll').onclick=applyAll;
}
function install(){
 const shell=E('blockingShell'),svg=E('setSketchSvg');if(!shell||!svg||E('blockingAiPanel'))return false;
 const st=document.createElement('style');st.id='blockingAiStyle';st.textContent='.blocking-ai-panel{margin-top:10px;padding:10px;background:#12161b;border:1px solid #553066;border-radius:11px}.blocking-ai-panel h4{margin:0 0 8px;color:#e5b1ff}.blocking-ai-empty,.blocking-ai-note,.blocking-ai-summary{color:#9299a3;font-size:11px;line-height:1.45}.blocking-ai-summary{color:#e5b1ff;font-weight:800;margin-bottom:7px}.blocking-ai-list{display:grid;gap:7px}.blocking-ai-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:8px;background:#15191e;border:1px solid #30343b;border-radius:9px}.blocking-ai-row b{display:block;color:#e5b1ff}.blocking-ai-row small{display:block;color:#9299a3;margin-top:3px}.blocking-ai-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.blocking-ai-note{margin-top:7px}';document.head.appendChild(st);
 const panel=document.createElement('div');panel.id='blockingAiPanel';panel.className='blocking-ai-panel';panel.innerHTML='<h4 id="blockingAiTitle"></h4><div id="blockingAiBody"></div><div id="blockingAiStatus" class="set-sketch-status"></div>';
 const statusEl=E('blockingStatus');if(statusEl&&statusEl.parentNode)statusEl.parentNode.insertBefore(panel,statusEl);else shell.appendChild(panel);
 window.addEventListener('lightingai-visual-plan-ready',ev=>analyze(ev&&ev.detail&&ev.detail.plan||window.__lightingAIVisualLastPlan||null));
 svg.addEventListener('lightingai:set-sketch-rendered',()=>setTimeout(draw,0));
 setInterval(()=>{const sig=sceneSignature();if(sig!==lastSceneSignature&&plan){proposals=buildProposals(plan);lastSceneSignature=sig;render();draw()}},900);
 analyze(window.__lightingAIVisualLastPlan||null);return true;
}
window.LightingAIBlockingAI={version:'1.1-launcher-open',analyze:analyze,applyProposal:applyProposal,applyAll:applyAll,snapshot:function(){return{hasPlan:!!plan,proposals:JSON.parse(JSON.stringify(proposals))}}};
let tries=0;const boot=setInterval(()=>{tries++;if(install()||tries>200)clearInterval(boot)},100);
})();