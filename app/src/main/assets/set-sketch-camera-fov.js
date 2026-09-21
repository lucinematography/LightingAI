(function(){
'use strict';

const KEY='lighting_set_sketch_v1';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
  sr:{title:'KADAR KAMERE / FOV',focal:'ŽIŽNA DALJINA (mm)',sensor:'ŠIRINA SENZORA (mm)',angle:'HORIZONTALNI FOV',width3:'ŠIRINA KADRA NA 3 m',width5:'ŠIRINA KADRA NA 5 m',presets:'BRZI OBJEKTIVI',actorPlane:'RAVAN GLUMCA',actorFrame:'KADAR KOD GLUMCA',inside:'U KADRU',outside:'VAN KADRA',hint:'Geometrijski horizontalni kadar na tlocrtu. Stvarna slika zavisi i od faktora izreza, odnosa stranica i kadriranja.'},
  en:{title:'CAMERA FRAME / FOV',focal:'FOCAL LENGTH (mm)',sensor:'SENSOR WIDTH (mm)',angle:'HORIZONTAL FOV',width3:'FRAME WIDTH AT 3 m',width5:'FRAME WIDTH AT 5 m',presets:'QUICK LENSES',actorPlane:'ACTOR PLANE',actorFrame:'FRAME AT ACTOR',inside:'IN FRAME',outside:'OUT OF FRAME',hint:'Geometric horizontal frame on the floor plan. The real image also depends on crop factor, aspect ratio and framing.'}
};
const t=()=>TXT[lang()];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let selectedObjectId=null;

function readState(){try{return JSON.parse(localStorage.getItem(KEY))||null}catch(e){return null}}
function activeBundle(){
  const state=readState();
  if(!state||!Array.isArray(state.scenes)||!state.scenes.length)return null;
  const scene=state.scenes.find(x=>x.id===state.activeId)||state.scenes[0];
  return {state,scene};
}
function fov(sensor,focal){return 2*Math.atan(sensor/(2*focal))*180/Math.PI}
function widthAt(angle,d){return 2*d*Math.tan((angle*Math.PI/180)/2)}
function screenXY(scene,x,y){const left=55,top=45,w=890,h=610;return {x:left+x/scene.roomW*w,y:top+y/scene.roomH*h}}
function roomXY(scene,sx,sy){const left=55,top=45,w=890,h=610;return {x:(sx-left)/w*scene.roomW,y:(sy-top)/h*scene.roomH}}
function livePosition(scene,o){
  try{if(window.LightingAISetSketch&&typeof window.LightingAISetSketch.getVisualObject==='function')o=window.LightingAISetSketch.getVisualObject(o)||o}catch(e){}
  const svg=E('setSketchSvg');if(!svg)return o;
  const g=svg.querySelector('[data-object-id="'+o.id+'"]');if(!g)return o;
  const tr=String(g.getAttribute('transform')||''),m=tr.match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
  if(!m)return o;
  const p=roomXY(scene,Number(m[1]),Number(m[2]));
  return Object.assign({},o,{x:p.x,y:p.y});
}
function rayToEdge(scene,o,dx,dy){
  const ts=[];
  if(dx>0.0001)ts.push((scene.roomW-o.x)/dx);else if(dx<-0.0001)ts.push((0-o.x)/dx);
  if(dy>0.0001)ts.push((scene.roomH-o.y)/dy);else if(dy<-0.0001)ts.push((0-o.y)/dy);
  const p=ts.filter(v=>Number.isFinite(v)&&v>0);
  return p.length?Math.min.apply(null,p):0;
}
function cameraCone(scene,source){
  const o=livePosition(scene,source);
  const focal=clamp(Number(o.focalLengthMm)||35,8,300),sensor=clamp(Number(o.sensorWidthMm)||36,5,70),angle=fov(sensor,focal);
  const r=(o.rot||0)*Math.PI/180,dx=Math.sin(r),dy=-Math.cos(r),distance=rayToEdge(scene,o,dx,dy);
  if(!(distance>0))return '';
  const half=distance*Math.tan((angle*Math.PI/180)/2),px=-dy,py=dx,p0=screenXY(scene,o.x,o.y),p1=screenXY(scene,o.x+dx*distance+px*half,o.y+dy*distance+py*half),p2=screenXY(scene,o.x+dx*distance-px*half,o.y+dy*distance-py*half),selected=o.id===selectedObjectId;
  return '<polygon class="set-camera-fov-cone" points="'+p0.x.toFixed(1)+','+p0.y.toFixed(1)+' '+p1.x.toFixed(1)+','+p1.y.toFixed(1)+' '+p2.x.toFixed(1)+','+p2.y.toFixed(1)+'" fill="#89c7ff" fill-opacity="'+(selected?'0.16':'0.07')+'" stroke="#89c7ff" stroke-opacity="'+(selected?'0.8':'0.35')+'" stroke-width="1.5" clip-path="url(#setSketchClip)" pointer-events="none"/>';
}
function subjectInfo(scene,camera,angle){
  camera=livePosition(scene,camera);
  const r=(camera.rot||0)*Math.PI/180,dx=Math.sin(r),dy=-Math.cos(r),px=-dy,py=dx;
  const rows=scene.objects.filter(o=>o.type==='subject').map(o=>{
    o=livePosition(scene,o);
    const v={x:o.x-camera.x,y:o.y-camera.y};
    return {o,depth:v.x*dx+v.y*dy,lateral:v.x*px+v.y*py};
  }).filter(x=>x.depth>0.01).sort((a,b)=>a.depth-b.depth);
  if(!rows.length)return null;
  const row=rows[0],frame=widthAt(angle,row.depth);
  return {depth:row.depth,frame,inside:Math.abs(row.lateral)<=frame/2};
}
function draw(){
  const svg=E('setSketchSvg'),bundle=activeBundle();if(!svg||!bundle)return;
  svg.querySelectorAll('.set-camera-fov-cone').forEach(n=>n.remove());
  const firstObject=svg.querySelector('.set-object');
  bundle.scene.objects.filter(o=>o.type==='camera').forEach(o=>{
    const markup=cameraCone(bundle.scene,o);if(!markup)return;
    const wrap=document.createElementNS('http://www.w3.org/2000/svg','g');wrap.innerHTML=markup;const node=wrap.firstChild;
    if(node){if(firstObject)svg.insertBefore(node,firstObject);else svg.appendChild(node)}
  });
}
function selectedCamera(){
  const bundle=activeBundle();if(!bundle||!selectedObjectId)return null;
  const o=bundle.scene.objects.find(x=>x.id===selectedObjectId);
  return o&&o.type==='camera'?{bundle,camera:o}:null;
}
function subjectMarkup(scene,camera,angle){
  const info=subjectInfo(scene,camera,angle);if(!info)return '';
  return '<div id="setSketchSubjectFov" class="set-camera-subject-info"><div class="set-readout"><small>'+t().actorPlane+'</small><b>'+info.depth.toFixed(2)+' m</b></div><div class="set-readout"><small>'+t().actorFrame+'</small><b>'+info.frame.toFixed(2)+' m · '+(info.inside?t().inside:t().outside)+'</b></div></div>';
}
function refreshReadouts(){
  const picked=selectedCamera();if(!picked)return;
  const fl=clamp(Number(E('setSketchFocalLength')&&E('setSketchFocalLength').value)||Number(picked.camera.focalLengthMm)||35,8,300),sw=clamp(Number(E('setSketchSensorWidth')&&E('setSketchSensorWidth').value)||Number(picked.camera.sensorWidthMm)||36,5,70),a=fov(sw,fl);
  if(E('setSketchFovAngle'))E('setSketchFovAngle').textContent=a.toFixed(1)+'°';
  if(E('setSketchFovW3'))E('setSketchFovW3').textContent=widthAt(a,3).toFixed(2)+' m';
  if(E('setSketchFovW5'))E('setSketchFovW5').textContent=widthAt(a,5).toFixed(2)+' m';
  const old=E('setSketchSubjectFov');if(old)old.remove();
  const box=E('setSketchCameraFovBox');if(box){const note=box.querySelector('.set-sketch-note');if(note)note.insertAdjacentHTML('beforebegin',subjectMarkup(picked.bundle.scene,picked.camera,a));}
}
function enhanceSelected(force){
  const panel=E('setSketchSelectedPanel');if(!panel)return;
  const picked=selectedCamera(),existing=E('setSketchCameraFovBox');
  if(!picked){if(existing)existing.remove();return;}
  if(existing&&!force){refreshReadouts();return;}
  if(existing)existing.remove();
  const camera=picked.camera,focal=clamp(Number(camera.focalLengthMm)||35,8,300),sensor=clamp(Number(camera.sensorWidthMm)||36,5,70),angle=fov(sensor,focal),box=document.createElement('div');
  box.id='setSketchCameraFovBox';box.className='set-camera-fov-controls';
  box.innerHTML='<h4>'+t().title+'</h4><div class="set-camera-fov-grid"><label>'+t().focal+'<input id="setSketchFocalLength" type="number" min="8" max="300" step="1" value="'+focal+'"></label><label>'+t().sensor+'<input id="setSketchSensorWidth" type="number" min="5" max="70" step="0.1" value="'+sensor+'"></label><div class="set-readout"><small>'+t().angle+'</small><b id="setSketchFovAngle">'+angle.toFixed(1)+'°</b></div><div class="set-readout"><small>'+t().width3+'</small><b id="setSketchFovW3">'+widthAt(angle,3).toFixed(2)+' m</b></div><div class="set-readout"><small>'+t().width5+'</small><b id="setSketchFovW5">'+widthAt(angle,5).toFixed(2)+' m</b></div></div><div class="set-camera-lens-title">'+t().presets+'</div><div class="set-camera-lens-presets">'+[18,24,35,50,85].map(v=>'<button class="btn secondary" type="button" data-set-focal="'+v+'">'+v+' mm</button>').join('')+'</div>'+subjectMarkup(picked.bundle.scene,camera,angle)+'<div class="set-sketch-note">'+t().hint+'</div>';
  const actions=panel.querySelector('.actions');if(actions)panel.insertBefore(box,actions);else panel.appendChild(box);
  function save(){
    const fl=clamp(Number(E('setSketchFocalLength').value)||35,8,300),sw=clamp(Number(E('setSketchSensorWidth').value)||36,5,70),bundle=activeBundle();
    if(bundle){const co=bundle.scene.objects.find(x=>x.id===selectedObjectId);if(co&&co.type==='camera'){co.focalLengthMm=fl;co.sensorWidthMm=sw;localStorage.setItem(KEY,JSON.stringify(bundle.state))}}
    refreshReadouts();draw();
  }
  E('setSketchFocalLength').addEventListener('input',save);E('setSketchSensorWidth').addEventListener('input',save);
  box.querySelectorAll('[data-set-focal]').forEach(btn=>btn.addEventListener('click',()=>{E('setSketchFocalLength').value=btn.dataset.setFocal;save()}));
}
function selectFromPointer(ev){
  const g=ev.target&&ev.target.closest?ev.target.closest('[data-object-id]'):null;if(!g)return;
  selectedObjectId=g.dataset.objectId||null;setTimeout(()=>{draw();enhanceSelected(false)},0);
}
function selectAfterAction(id){
  setTimeout(()=>{
    const bundle=activeBundle();if(!bundle)return;
    if(id==='setSketchAddCamera'){const cams=bundle.scene.objects.filter(o=>o.type==='camera');selectedObjectId=cams.length?cams[cams.length-1].id:null;}
    else if(id==='setSketchApplyMeasurements'){const cam=bundle.scene.objects.find(o=>o.type==='camera');selectedObjectId=cam?cam.id:null;}
    else if(id==='setSketchNew'||id==='setSketchCopy'||id==='setSketchDeleteScene'||id==='setSketchSceneSelect')selectedObjectId=null;
    draw();enhanceSelected(false);
  },0);
}
function install(){
  const svg=E('setSketchSvg');if(!svg)return false;
  if(!E('setSketchCameraFovStyle')){
    const st=document.createElement('style');st.id='setSketchCameraFovStyle';
    st.textContent='.set-camera-fov-controls{margin-top:10px;padding:10px;background:#10141a;border:1px solid #30343b;border-radius:12px}.set-camera-fov-controls h4{margin:0 0 8px}.set-camera-fov-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.set-camera-fov-grid label{font-size:11px;color:#9299a3}.set-camera-lens-title{font-size:10px;color:#9299a3;margin:10px 0 5px}.set-camera-lens-presets{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}.set-camera-lens-presets .btn{padding:7px 3px;font-size:11px}.set-camera-subject-info{display:grid;grid-template-columns:1fr 1.4fr;gap:8px;margin-top:8px}@media(max-width:520px){.set-camera-fov-grid{grid-template-columns:1fr 1fr}.set-camera-lens-presets{grid-template-columns:repeat(3,1fr)}}';document.head.appendChild(st);
  }
  svg.addEventListener('pointerdown',selectFromPointer);
  svg.addEventListener('pointermove',()=>draw());
  svg.addEventListener('pointerup',()=>{draw();setTimeout(()=>enhanceSelected(false),0)});
  svg.addEventListener('pointercancel',()=>draw());
  svg.addEventListener('lightingai:set-sketch-rendered',()=>{draw();refreshReadouts()});
  document.addEventListener('click',ev=>{const id=String(ev.target&&ev.target.id||'');if(id.indexOf('setSketch')!==0)return;selectAfterAction(id);setTimeout(()=>{draw();enhanceSelected(false)},0)});
  document.addEventListener('change',ev=>{const id=String(ev.target&&ev.target.id||'');if(id==='setSketchObjectName')setTimeout(()=>enhanceSelected(false),0)});
  if(typeof window.setLanguage==='function'&&!window.__lightingaiFovLanguageHook){const old=window.setLanguage;window.__lightingaiFovLanguageHook=true;window.setLanguage=function(l){old(l);setTimeout(()=>enhanceSelected(true),0)}}
  setInterval(()=>{if(E('setSketchSvg')){draw();refreshReadouts()}},700);
  draw();return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>120)clearInterval(timer)},100);
})();