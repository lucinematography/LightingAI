(function(){
'use strict';

const KEY='lighting_set_sketch_v1';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
  sr:{title:'KADAR KAMERE / FOV',focal:'ŽIŽNA DALJINA (mm)',sensor:'ŠIRINA SENZORA (mm)',angle:'HORIZONTALNI FOV',width3:'ŠIRINA KADRA NA 3 m',width5:'ŠIRINA KADRA NA 5 m',hint:'Ovo je geometrijski horizontalni kadar na tlocrtu. Stvarna slika zavisi i od crop-a, aspect ratio-a i framinga.'},
  en:{title:'CAMERA FRAME / FOV',focal:'FOCAL LENGTH (mm)',sensor:'SENSOR WIDTH (mm)',angle:'HORIZONTAL FOV',width3:'FRAME WIDTH AT 3 m',width5:'FRAME WIDTH AT 5 m',hint:'This is the geometric horizontal frame on the floor plan. The real image also depends on crop, aspect ratio and framing.'}
};
const t=()=>TXT[lang()];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function readState(){try{return JSON.parse(localStorage.getItem(KEY))||null}catch(e){return null}}
function activeScene(){const s=readState();if(!s||!Array.isArray(s.scenes)||!s.scenes.length)return null;return s.scenes.find(x=>x.id===s.activeId)||s.scenes[0]}
function fov(sensor,focal){return 2*Math.atan(sensor/(2*focal))*180/Math.PI}
function widthAt(angle,d){return 2*d*Math.tan((angle*Math.PI/180)/2)}
function screenXY(scene,x,y){const left=55,top=45,w=890,h=610;return {x:left+x/scene.roomW*w,y:top+y/scene.roomH*h}}
function rayToEdge(scene,o,dx,dy){const ts=[];if(dx>0.0001)ts.push((scene.roomW-o.x)/dx);else if(dx<-0.0001)ts.push((0-o.x)/dx);if(dy>0.0001)ts.push((scene.roomH-o.y)/dy);else if(dy<-0.0001)ts.push((0-o.y)/dy);const p=ts.filter(v=>Number.isFinite(v)&&v>0);return p.length?Math.min.apply(null,p):0}
function cameraCone(scene,o){
  const focal=clamp(Number(o.focalLengthMm)||35,8,300),sensor=clamp(Number(o.sensorWidthMm)||36,5,70),angle=fov(sensor,focal);
  const r=(o.rot||0)*Math.PI/180,dx=Math.sin(r),dy=-Math.cos(r),distance=rayToEdge(scene,o,dx,dy);if(!(distance>0))return '';
  const half=distance*Math.tan((angle*Math.PI/180)/2),px=-dy,py=dx,p0=screenXY(scene,o.x,o.y),p1=screenXY(scene,o.x+dx*distance+px*half,o.y+dy*distance+py*half),p2=screenXY(scene,o.x+dx*distance-px*half,o.y+dy*distance-py*half);
  return '<polygon class="set-camera-fov-cone" points="'+p0.x.toFixed(1)+','+p0.y.toFixed(1)+' '+p1.x.toFixed(1)+','+p1.y.toFixed(1)+' '+p2.x.toFixed(1)+','+p2.y.toFixed(1)+'" fill="#89c7ff" fill-opacity="0.09" stroke="#89c7ff" stroke-opacity="0.55" stroke-width="1.5" clip-path="url(#setSketchClip)"/>';
}
function draw(){
  const svg=E('setSketchSvg'),scene=activeScene();if(!svg||!scene)return;
  svg.querySelectorAll('.set-camera-fov-cone').forEach(n=>n.remove());
  const firstObject=svg.querySelector('.set-object');
  scene.objects.filter(o=>o.type==='camera').forEach(o=>{
    const wrap=document.createElementNS('http://www.w3.org/2000/svg','g');wrap.innerHTML=cameraCone(scene,o);const node=wrap.firstChild;if(node){if(firstObject)svg.insertBefore(node,firstObject);else svg.appendChild(node);}
  });
}
function enhanceSelected(){
  const panel=E('setSketchSelectedPanel'),scene=activeScene();if(!panel||!scene)return;
  const selected=E('setSketchSvg')&&E('setSketchSvg').querySelector('.set-object[style*="cursor"]');
  let camera=null;
  const nameInput=E('setSketchObjectName');
  if(nameInput){
    const label=nameInput.value;
    camera=scene.objects.find(o=>o.type==='camera'&&(o.label||'')===label)||scene.objects.find(o=>o.type==='camera'&&label.toLowerCase().indexOf('kamera')>=0)||scene.objects.find(o=>o.type==='camera'&&label.toLowerCase().indexOf('camera')>=0);
  }
  if(!camera)return;
  if(E('setSketchCameraFovBox'))return;
  const focal=clamp(Number(camera.focalLengthMm)||35,8,300),sensor=clamp(Number(camera.sensorWidthMm)||36,5,70),angle=fov(sensor,focal);
  const box=document.createElement('div');box.id='setSketchCameraFovBox';box.className='set-camera-fov-controls';
  box.innerHTML='<h4>'+t().title+'</h4><div class="set-camera-fov-grid"><label>'+t().focal+'<input id="setSketchFocalLength" type="number" min="8" max="300" step="1" value="'+focal+'"></label><label>'+t().sensor+'<input id="setSketchSensorWidth" type="number" min="5" max="70" step="0.1" value="'+sensor+'"></label><div class="set-readout"><small>'+t().angle+'</small><b id="setSketchFovAngle">'+angle.toFixed(1)+'°</b></div><div class="set-readout"><small>'+t().width3+'</small><b id="setSketchFovW3">'+widthAt(angle,3).toFixed(2)+' m</b></div><div class="set-readout"><small>'+t().width5+'</small><b id="setSketchFovW5">'+widthAt(angle,5).toFixed(2)+' m</b></div></div><div class="set-sketch-note">'+t().hint+'</div>';
  const actions=panel.querySelector('.actions');if(actions)panel.insertBefore(box,actions);else panel.appendChild(box);
  function save(){const fl=clamp(Number(E('setSketchFocalLength').value)||35,8,300),sw=clamp(Number(E('setSketchSensorWidth').value)||36,5,70),a=fov(sw,fl);camera.focalLengthMm=fl;camera.sensorWidthMm=sw;const state=readState();if(state){const sc=state.scenes.find(x=>x.id===state.activeId)||state.scenes[0],co=sc.objects.find(x=>x.id===camera.id);if(co){co.focalLengthMm=fl;co.sensorWidthMm=sw;localStorage.setItem(KEY,JSON.stringify(state));}}E('setSketchFovAngle').textContent=a.toFixed(1)+'°';E('setSketchFovW3').textContent=widthAt(a,3).toFixed(2)+' m';E('setSketchFovW5').textContent=widthAt(a,5).toFixed(2)+' m';setTimeout(draw,0)}
  E('setSketchFocalLength').addEventListener('input',save);E('setSketchSensorWidth').addEventListener('input',save);
}
function install(){
  if(!E('setSketchSvg'))return false;
  if(!E('setSketchCameraFovStyle')){const st=document.createElement('style');st.id='setSketchCameraFovStyle';st.textContent='.set-camera-fov-controls{margin-top:10px;padding:10px;background:#10141a;border:1px solid #30343b;border-radius:12px}.set-camera-fov-controls h4{margin:0 0 8px}.set-camera-fov-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.set-camera-fov-grid label{font-size:11px;color:#9299a3}@media(max-width:520px){.set-camera-fov-grid{grid-template-columns:1fr 1fr}}';document.head.appendChild(st)}
  const svg=E('setSketchSvg');
  const observer=new MutationObserver(()=>{draw();setTimeout(enhanceSelected,0)});observer.observe(svg,{childList:true,subtree:true});
  svg.addEventListener('pointerup',()=>setTimeout(enhanceSelected,0));
  document.addEventListener('click',ev=>{if(ev.target&&String(ev.target.id||'').indexOf('setSketch')===0)setTimeout(()=>{draw();enhanceSelected()},0)});
  draw();setTimeout(enhanceSelected,200);return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>120)clearInterval(timer)},100);
})();