(function(){
'use strict';

const KEY='lighting_set_sketch_v1';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{
  title:'BLOCKING / CAMERA DESIGNER',intro:'Putanje glumaca i kamera na postojećoj Skici seta. Scene, svetla, zidovi i FOV ostaju isti sistem.',
  select:'IZABRANI ELEMENT',none:'Izaberi kameru ili glumca na tlocrtu.',path:'PUTANJA KRETANJA',duration:'TRAJANJE (s)',
  addPoint:'DODAJ WAYPOINT',clear:'OBRIŠI PUTANJU',play:'▶ PLAY',pause:'Ⅱ PAUSE',stop:'■ STOP',reset:'↺ POČETAK',
  tracking:'CAMERA TRACKING',trackSubject:'PRATI GLUMCA',off:'ISKLJUČENO',framing:'ODRŽAVAJ SMER KA SUBJEKTU',
  hint:'Waypoint dodaje trenutnu poziciju izabranog elementa. Zatim pomeri element prstom i dodaj sledeći waypoint. Tačke se mogu pomerati direktno na tlocrtu.',
  need:'Za animaciju su potrebna najmanje 2 waypoint-a.',actorOnly:'Putanja je dostupna za kameru i glumca.',statusPlay:'Animacija scene je pokrenuta.',
  statusPause:'Animacija je pauzirana.',statusStop:'Animacija je vraćena na početak.',pointAdded:'Waypoint je dodat.',pointMoved:'Waypoint je pomeren.',
  pathCleared:'Putanja je obrisana.',trackingHint:'Tracking menja samo smer kamere tokom pregleda; nije obavezno automatsko ponašanje.',cameraTools:'KAMERA / KADAR',saveShot:'DODAJ U SHOT LIST',setupA:'SAČUVAJ A',setupB:'SAČUVAJ B',setupC:'SAČUVAJ C',shotSaved:'Kadar je dodat u Shot List.',setupSaved:'Camera Setup je sačuvan.'
 },
 en:{
  title:'BLOCKING / CAMERA DESIGNER',intro:'Actor and camera paths on the existing Set Sketch. Scenes, lights, walls and FOV remain in the same system.',
  select:'SELECTED ITEM',none:'Select a camera or actor on the floor plan.',path:'MOVEMENT PATH',duration:'DURATION (s)',
  addPoint:'ADD WAYPOINT',clear:'CLEAR PATH',play:'▶ PLAY',pause:'Ⅱ PAUSE',stop:'■ STOP',reset:'↺ START',
  tracking:'CAMERA TRACKING',trackSubject:'TRACK ACTOR',off:'OFF',framing:'KEEP CAMERA AIMED AT SUBJECT',
  hint:'A waypoint stores the selected item current position. Move the item, then add the next waypoint. Waypoints can also be dragged directly on the floor plan.',
  need:'At least 2 waypoints are required for animation.',actorOnly:'Paths are available for cameras and actors.',statusPlay:'Scene animation started.',
  statusPause:'Animation paused.',statusStop:'Animation returned to start.',pointAdded:'Waypoint added.',pointMoved:'Waypoint moved.',
  pathCleared:'Path cleared.',trackingHint:'Tracking changes camera direction only during preview; it is always optional.',cameraTools:'CAMERA / SHOT',saveShot:'ADD TO SHOT LIST',setupA:'SAVE A',setupB:'SAVE B',setupC:'SAVE C',shotSaved:'Shot added to Shot List.',setupSaved:'Camera Setup saved.'
 }
};
const t=()=>TXT[lang()];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let playing=false,paused=false,startMs=0,pauseAt=0,raf=0,dragWaypoint=null,statusTimer=null;

function api(){return window.LightingAISetSketch||null}
function scene(){const a=api();return a&&a.getActiveScene?a.getActiveScene():null}
function selected(){const a=api(),s=scene(),id=a&&a.getSelectedId?a.getSelectedId():null;return s&&id?s.objects.find(o=>o.id===id)||null:null}
function save(){const a=api();if(a&&a.persist)a.persist()}
function status(msg){const el=E('blockingStatus');if(!el)return;el.textContent=msg||'';clearTimeout(statusTimer);statusTimer=setTimeout(()=>{if(el)el.textContent=''},2600)}
function ensureBlocking(o){
 if(!o)return null;
 if(!o.blocking||typeof o.blocking!=='object')o.blocking={};
 if(!Array.isArray(o.blocking.path))o.blocking.path=[];
 if(!(Number(o.blocking.durationSec)>0))o.blocking.durationSec=5;
 return o.blocking;
}
function usable(o){return !!(o&&(o.type==='camera'||o.type==='subject'))}
function pathLength(points){
 let n=0;for(let i=1;i<points.length;i++)n+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);return n;
}
function pointAt(points,p){
 if(!points.length)return null;if(points.length===1)return points[0];
 const total=pathLength(points);if(total<=0)return points[0];
 let want=clamp(p,0,1)*total;
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],seg=Math.hypot(b.x-a.x,b.y-a.y);if(want<=seg||i===points.length-1){const q=seg?want/seg:0;return{x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q};}want-=seg;}
 return points[points.length-1];
}
function trackingRotation(cameraPos,targetPos){
 const dx=targetPos.x-cameraPos.x,dy=targetPos.y-cameraPos.y;
 return ((Math.atan2(dx,-dy)*180/Math.PI)%360+360)%360;
}
function buildPreview(progress){
 const s=scene(),map=Object.create(null);if(!s)return map;
 s.objects.forEach(o=>{
  const b=o.blocking;if(!usable(o)||!b||!Array.isArray(b.path)||b.path.length<2)return;
  const d=Math.max(.1,Number(b.durationSec)||5),local=clamp(progress.animationTime/d,0,1),p=pointAt(b.path,local);
  if(p)map[o.id]={x:p.x,y:p.y};
 });
 s.objects.filter(o=>o.type==='camera').forEach(cam=>{
  const b=cam.blocking;if(!b||!b.trackSubjectId)return;
  const target=s.objects.find(o=>o.id===b.trackSubjectId&&o.type==='subject');if(!target)return;
  const cp=Object.assign({},cam,map[cam.id]||{}),tp=Object.assign({},target,map[target.id]||{});
  map[cam.id]=Object.assign({},map[cam.id]||{},{rot:trackingRotation(cp,tp)});
 });
 return map;
}
function maxDuration(){
 const s=scene();if(!s)return 0;let m=0;s.objects.forEach(o=>{const b=o.blocking;if(usable(o)&&b&&Array.isArray(b.path)&&b.path.length>=2)m=Math.max(m,Number(b.durationSec)||5)});return m;
}
function tick(now){
 if(!playing||paused)return;
 const total=maxDuration();if(!(total>0)){stop(true);status(t().need);return}
 const elapsed=(now-startMs)/1000;
 const a=api();if(a&&a.setPreview)a.setPreview(buildPreview({animationTime:Math.min(elapsed,total)}));
 updateTime(Math.min(elapsed,total),total);
 if(elapsed>=total){stop(true);return}
 raf=requestAnimationFrame(tick);
}
function play(){
 const total=maxDuration();if(!(total>0)){status(t().need);return}
 if(playing&&paused){paused=false;startMs=performance.now()-pauseAt*1000;raf=requestAnimationFrame(tick);renderControls();status(t().statusPlay);return}
 playing=true;paused=false;startMs=performance.now();pauseAt=0;raf=requestAnimationFrame(tick);renderControls();status(t().statusPlay);
}
function pause(){
 if(!playing||paused)return;paused=true;cancelAnimationFrame(raf);pauseAt=(performance.now()-startMs)/1000;renderControls();status(t().statusPause);
}
function stop(reset){
 cancelAnimationFrame(raf);playing=false;paused=false;pauseAt=0;
 const a=api();if(a&&a.clearPreview)a.clearPreview();updateTime(0,maxDuration());renderControls();if(!reset)status(t().statusStop);
}
function reset(){stop(false)}
function updateTime(v,total){if(E('blockingTime'))E('blockingTime').textContent=(v||0).toFixed(1)+' / '+(total||0).toFixed(1)+' s'}
function addPoint(){
 const o=selected();if(!usable(o)){status(t().actorOnly);return}
 const b=ensureBlocking(o),v=api()&&api().getVisualObject?api().getVisualObject(o):o;
 b.path.push({x:Number(v.x)||0,y:Number(v.y)||0});save();renderAll();status(t().pointAdded);
}
function clearPath(){
 const o=selected();if(!usable(o))return;ensureBlocking(o).path=[];save();renderAll();status(t().pathCleared);
}
function subjects(){
 const s=scene();return s?s.objects.filter(o=>o.type==='subject'):[];
}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function renderControls(){
 const box=E('blockingControls');if(!box)return;const o=selected(),x=t();
 if(!usable(o)){box.innerHTML='<div class="blocking-empty">'+esc(x.none)+'</div>';return}
 const b=ensureBlocking(o),pts=b.path||[];
 let tracking='';
 if(o.type==='camera'){
  const options='<option value="">'+esc(x.off)+'</option>'+subjects().map(s=>'<option value="'+esc(s.id)+'" '+(b.trackSubjectId===s.id?'selected':'')+'>'+esc(s.label||'Glumac')+'</option>').join('');
  tracking='<div class="blocking-track"><h4>'+esc(x.tracking)+'</h4><label>'+esc(x.trackSubject)+'<select id="blockingTrackSubject">'+options+'</select></label><label class="blocking-check"><input id="blockingTrackingEnabled" type="checkbox" '+(b.trackSubjectId?'checked':'')+'> '+esc(x.framing)+'</label><div class="blocking-note">'+esc(x.trackingHint)+'</div></div><div class="blocking-track"><h4>'+esc(x.cameraTools)+'</h4><div class="blocking-camera-actions"><button id="blockingSaveShot" class="btn primary" type="button">'+esc(x.saveShot)+'</button><button class="btn secondary blocking-save-setup" data-slot="A" type="button">'+esc(x.setupA)+'</button><button class="btn secondary blocking-save-setup" data-slot="B" type="button">'+esc(x.setupB)+'</button><button class="btn secondary blocking-save-setup" data-slot="C" type="button">'+esc(x.setupC)+'</button></div></div>';
 }
 box.innerHTML='<div class="blocking-head"><div><small>'+esc(x.select)+'</small><b>'+esc(o.label||o.type)+'</b></div><div id="blockingTime">0.0 / '+maxDuration().toFixed(1)+' s</div></div>'+
 '<div class="blocking-grid"><label>'+esc(x.duration)+'<input id="blockingDuration" type="number" min="0.2" max="120" step="0.1" value="'+Number(b.durationSec||5).toFixed(1)+'"></label><div><small>'+esc(x.path)+'</small><b>'+pts.length+' waypoint</b></div></div>'+
 '<div class="blocking-actions"><button id="blockingAddPoint" class="btn primary" type="button">'+esc(x.addPoint)+'</button><button id="blockingClearPath" class="btn secondary" type="button">'+esc(x.clear)+'</button></div>'+
 '<div class="blocking-transport"><button id="blockingPlay" class="btn primary" type="button">'+esc(x.play)+'</button><button id="blockingPause" class="btn secondary" type="button" '+(!playing||paused?'disabled':'')+'>'+esc(x.pause)+'</button><button id="blockingStop" class="btn secondary" type="button">'+esc(x.stop)+'</button><button id="blockingReset" class="btn secondary" type="button">'+esc(x.reset)+'</button></div>'+
 tracking+'<div class="blocking-note">'+esc(x.hint)+'</div>';
 E('blockingDuration').onchange=ev=>{b.durationSec=clamp(Number(ev.target.value)||5,.2,120);save();renderAll()};
 E('blockingAddPoint').onclick=addPoint;E('blockingClearPath').onclick=clearPath;E('blockingPlay').onclick=play;E('blockingPause').onclick=pause;E('blockingStop').onclick=()=>stop(false);E('blockingReset').onclick=reset;
 if(E('blockingTrackSubject'))E('blockingTrackSubject').onchange=ev=>{b.trackSubjectId=ev.target.value||'';save();renderAll()};
 if(E('blockingTrackingEnabled'))E('blockingTrackingEnabled').onchange=ev=>{if(!ev.target.checked)b.trackSubjectId='';else if(!b.trackSubjectId&&subjects()[0])b.trackSubjectId=subjects()[0].id;save();renderAll()};
 if(E('blockingSaveShot'))E('blockingSaveShot').onclick=()=>{const s=window.LightingAIShotList;if(s&&typeof s.addCurrent==='function'){s.addCurrent();status(t().shotSaved)}};
 box.querySelectorAll('.blocking-save-setup').forEach(btn=>btn.onclick=()=>{const a=window.LightingAICameraSetups;if(a&&typeof a.saveCurrentToSlot==='function'&&a.saveCurrentToSlot(btn.dataset.slot,o.id))status(t().setupSaved)});
}
function pathMarkup(){
 const s=scene(),a=api(),svg=E('setSketchSvg');if(!s||!a||!svg)return;
 svg.querySelectorAll('.blocking-overlay').forEach(n=>n.remove());
 const root=document.createElementNS('http://www.w3.org/2000/svg','g');root.setAttribute('class','blocking-overlay');
 s.objects.forEach(o=>{
  if(!usable(o))return;const b=ensureBlocking(o),pts=b.path;if(!pts.length)return;
  const sp=pts.map(p=>a.screenXY(p.x,p.y)),selectedId=a.getSelectedId&&a.getSelectedId(),sel=o.id===selectedId,col=o.type==='camera'?'#89c7ff':'#f5c542';
  if(sp.length>1){const poly=document.createElementNS('http://www.w3.org/2000/svg','polyline');poly.setAttribute('points',sp.map(p=>p.x+','+p.y).join(' '));poly.setAttribute('fill','none');poly.setAttribute('stroke',col);poly.setAttribute('stroke-width',sel?'4':'2.5');poly.setAttribute('stroke-dasharray','10 7');poly.setAttribute('opacity',sel?'.95':'.55');poly.setAttribute('pointer-events','none');root.appendChild(poly)}
  sp.forEach((p,i)=>{const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r',sel?'10':'7');c.setAttribute('fill','#11151b');c.setAttribute('stroke',col);c.setAttribute('stroke-width',sel?'4':'2');c.setAttribute('data-blocking-object',o.id);c.setAttribute('data-blocking-point',String(i));c.style.cursor='grab';root.appendChild(c)});
 });
 svg.appendChild(root);
}
function renderAll(){renderControls();setTimeout(pathMarkup,0)}
function pointerDown(ev){
 const n=ev.target&&ev.target.closest?ev.target.closest('[data-blocking-point]'):null;if(!n)return;
 dragWaypoint={objectId:n.getAttribute('data-blocking-object'),index:Number(n.getAttribute('data-blocking-point')),pointerId:ev.pointerId};
 const svg=E('setSketchSvg');try{svg.setPointerCapture(ev.pointerId)}catch(e){}ev.preventDefault();ev.stopPropagation();
}
function pointerMove(ev){
 if(!dragWaypoint||dragWaypoint.pointerId!==ev.pointerId)return;const s=scene(),a=api();if(!s||!a||!a.roomPointFromClient)return;
 const o=s.objects.find(x=>x.id===dragWaypoint.objectId),p=a.roomPointFromClient(ev.clientX,ev.clientY);if(!o||!p)return;
 const b=ensureBlocking(o);if(!b.path[dragWaypoint.index])return;b.path[dragWaypoint.index]={x:p.x,y:p.y};save();pathMarkup();ev.preventDefault();ev.stopPropagation();
}
function pointerEnd(ev){
 if(!dragWaypoint||dragWaypoint.pointerId!==ev.pointerId)return;dragWaypoint=null;const svg=E('setSketchSvg');try{svg.releasePointerCapture(ev.pointerId)}catch(e){}renderAll();status(t().pointMoved);ev.preventDefault();ev.stopPropagation();
}
function install(){
 const card=E('setSketchCard'),svg=E('setSketchSvg');if(!card||!svg||!api())return false;
 if(!E('blockingStyle')){const st=document.createElement('style');st.id='blockingStyle';st.textContent='.blocking-shell{margin-top:14px;padding:12px;background:#0e1217;border:1px solid #3a424d;border-radius:14px}.blocking-shell h3{margin:0;color:#f5c542}.blocking-intro,.blocking-note,.blocking-empty{color:#9299a3;font-size:12px;line-height:1.45}.blocking-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:10px 0}.blocking-head small,.blocking-grid small{display:block;color:#9299a3;font-size:10px}.blocking-head b{display:block;margin-top:3px}.blocking-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.blocking-grid>div,.blocking-grid label{background:#15191e;border:1px solid #30343b;border-radius:10px;padding:9px;font-size:11px}.blocking-grid input{margin-top:5px}.blocking-actions,.blocking-transport{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:8px}.blocking-transport{grid-template-columns:repeat(4,1fr)}.blocking-track{margin-top:10px;padding:10px;border:1px solid #30343b;border-radius:11px;background:#12161b}.blocking-track h4{margin:0 0 8px}.blocking-check{display:block;margin-top:8px;font-size:12px}.blocking-camera-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.blocking-note{margin-top:8px}@media(max-width:520px){.blocking-transport{grid-template-columns:repeat(2,1fr)}}';document.head.appendChild(st)}
 const shell=document.createElement('div');shell.id='blockingShell';shell.className='blocking-shell';shell.innerHTML='<h3 id="blockingTitle"></h3><div id="blockingIntro" class="blocking-intro"></div><div id="blockingControls"></div><div id="blockingStatus" class="set-sketch-status"></div>';
 const stage=E('setSketchStage');if(stage&&stage.parentNode)stage.parentNode.insertBefore(shell,stage.nextSibling);else card.appendChild(shell);
 svg.addEventListener('pointerdown',pointerDown,true);svg.addEventListener('pointermove',pointerMove,true);svg.addEventListener('pointerup',pointerEnd,true);svg.addEventListener('pointercancel',pointerEnd,true);
 svg.addEventListener('lightingai:set-sketch-rendered',()=>setTimeout(pathMarkup,0));
 document.addEventListener('click',ev=>{const id=String(ev.target&&ev.target.id||'');if(id.indexOf('setSketch')===0)setTimeout(renderAll,0)});
 if(typeof window.setLanguage==='function'&&!window.__lightingaiBlockingLang){const old=window.setLanguage;window.__lightingaiBlockingLang=true;window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
 translate();renderAll();return true;
}
function translate(){if(!E('blockingShell'))return;E('blockingTitle').textContent=t().title;E('blockingIntro').textContent=t().intro;renderAll()}
window.LightingAIBlocking={version:'0.2-storyboard-camera-link',play:play,pause:pause,stop:()=>stop(false),reset:reset,render:renderAll};
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>160)clearInterval(timer)},100);
})();