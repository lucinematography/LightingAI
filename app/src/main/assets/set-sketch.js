(function(){
'use strict';

const KEY='lighting_set_sketch_v1';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
  sr:{title:'📐 Skica seta',intro:'Tlocrt scene u metrima. Dodaj kameru, glumca, svetla, zid ili pozadinu, pa ih pomeraj prstom. Izabran element automatski prikazuje udaljenosti do ostalih.',scene:'SCENA',sceneName:'NAZIV SCENE',save:'SAČUVAJ',newScene:'NOVA',copy:'KOPIRAJ',deleteScene:'OBRIŠI SCENU',room:'DIMENZIJE SETA',width:'ŠIRINA (m)',height:'DUŽINA (m)',add:'DODAJ U SKICU',camera:'KAMERA',subject:'GLUMAC',light:'SVETLO',wall:'ZID',background:'POZADINA',fixture:'RASVETNO TELO',selected:'IZABRANI ELEMENT',name:'NAZIV',position:'POZICIJA',direction:'SMER',rotateLeft:'−15°',rotateRight:'+15°',remove:'OBRIŠI ELEMENT',distances:'UDALJENOSTI OD IZABRANOG',nothing:'Dodirni element na skici da ga izabereš.',empty:'Nema drugih elemenata za merenje.',saved:'Scena je sačuvana.',created:'Nova scena je napravljena.',copied:'Scena je kopirana.',deleted:'Scena je obrisana.',drag:'Pomeraj element prstom. Kamera i svetlo imaju strelicu smera.',meters:'m',genericLight:'Svetlo',defaultScene:'Scena 1',confirmDelete:'Obrisati ovu scenu?',beamAngle:'UGAO SNOPA (°)',beamWidth:'ŠIRINA SNOPA',beamCatalog:'KATALOG',beamManual:'RUČNO',beamMissing:'Nema podatka o uglu snopa. Unesi ga ručno.',beamRange:'Katalog opseg',beamAt1:'na 1 m',beamAt3:'na 3 m'},
  en:{title:'📐 Set Sketch',intro:'Top-down scene plan in metres. Add camera, actor, lights, wall or background, then drag them with your finger. The selected item automatically shows distances to the others.',scene:'SCENE',sceneName:'SCENE NAME',save:'SAVE',newScene:'NEW',copy:'COPY',deleteScene:'DELETE SCENE',room:'SET DIMENSIONS',width:'WIDTH (m)',height:'LENGTH (m)',add:'ADD TO SKETCH',camera:'CAMERA',subject:'ACTOR',light:'LIGHT',wall:'WALL',background:'BACKGROUND',fixture:'FIXTURE',selected:'SELECTED ITEM',name:'NAME',position:'POSITION',direction:'DIRECTION',rotateLeft:'−15°',rotateRight:'+15°',remove:'DELETE ITEM',distances:'DISTANCES FROM SELECTED',nothing:'Tap an item in the sketch to select it.',empty:'No other items to measure.',saved:'Scene saved.',created:'New scene created.',copied:'Scene copied.',deleted:'Scene deleted.',drag:'Drag an item with your finger. Camera and light show their direction arrow.',meters:'m',genericLight:'Light',defaultScene:'Scene 1',confirmDelete:'Delete this scene?',beamAngle:'BEAM ANGLE (°)',beamWidth:'BEAM WIDTH',beamCatalog:'CATALOG',beamManual:'MANUAL',beamMissing:'No beam-angle data. Enter it manually.',beamRange:'Catalog range',beamAt1:'at 1 m',beamAt3:'at 3 m'}
};
const t=()=>TXT[lang()];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));

function defaultObjects(){
  return [
    {id:uid(),type:'camera',label:t().camera,x:2,y:6.6,rot:0},
    {id:uid(),type:'subject',label:t().subject,x:5,y:4,rot:0},
    {id:uid(),type:'light',label:t().genericLight,x:2.5,y:3.1,rot:55},
    {id:uid(),type:'background',label:t().background,x:5,y:1.1,rot:90}
  ];
}
function defaultState(){
  const id=uid();
  return {activeId:id,scenes:[{id,name:t().defaultScene,roomW:10,roomH:8,objects:defaultObjects()}]};
}
function read(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY));
    if(s&&Array.isArray(s.scenes)&&s.scenes.length)return s;
  }catch(e){}
  return defaultState();
}

let state=read(),selectedId=null,dragId=null,dragPointer=null,statusTimer=null;
function persist(){localStorage.setItem(KEY,JSON.stringify(state));}
function active(){let s=state.scenes.find(x=>x.id===state.activeId);if(!s){s=state.scenes[0];state.activeId=s.id;}return s;}
function obj(id){return active().objects.find(x=>x.id===id);}
function labelFor(o){return o.label||({camera:t().camera,subject:t().subject,light:t().genericLight,wall:t().wall,background:t().background}[o.type]||o.type);}
function showStatus(msg){const el=E('setSketchStatus');if(!el)return;el.textContent=msg;clearTimeout(statusTimer);statusTimer=setTimeout(()=>{if(el)el.textContent='';},2200);}

function selectedFixtures(){
  const all=Array.isArray(window.catalogFixtures)?window.catalogFixtures:[];
  const sel=Array.isArray(window.equipment)?window.equipment:[];
  return sel.map(e=>all.find(f=>f.id===e.id||f.id===e.fixtureId)).filter(Boolean);
}
function fixtureForId(id){return (window.catalogFixtures||[]).find(f=>f.id===id)||null;}
function fixtureBeamSpec(id){
  const f=fixtureForId(id);
  if(!f)return {fixed:null,hint:''};
  const included=Number(f.includedReflectorBeamAngleDeg);
  if(Number.isFinite(included)&&included>0&&included<180)return {fixed:included,hint:included.toFixed(0)+'°'};
  const b=f.beamAngleDeg;
  if(Number.isFinite(Number(b))&&Number(b)>0&&Number(b)<180)return {fixed:Number(b),hint:Number(b).toFixed(0)+'°'};
  if(b&&typeof b==='object'){
    const mn=Number(b.min),mx=Number(b.max);
    if(Number.isFinite(mn)&&Number.isFinite(mx)&&mn>0&&mx<180){
      if(Math.abs(mx-mn)<0.01)return {fixed:mn,hint:mn.toFixed(0)+'°'};
      return {fixed:null,hint:mn.toFixed(0)+'–'+mx.toFixed(0)+'°'};
    }
  }
  const arr=Array.isArray(f.reflectorBeamAnglesDeg)?f.reflectorBeamAnglesDeg.map(Number).filter(x=>Number.isFinite(x)&&x>0&&x<180):[];
  if(arr.length===1)return {fixed:arr[0],hint:arr[0].toFixed(0)+'°'};
  if(arr.length>1)return {fixed:null,hint:arr.join(' / ')+'°'};
  return {fixed:null,hint:''};
}
function beamInfo(o){
  if(!o||o.type!=='light')return null;
  const manual=Number(o.beamAngleDeg);
  if(Number.isFinite(manual)&&manual>0&&manual<180)return {angle:manual,source:'manual',hint:''};
  const spec=fixtureBeamSpec(o.fixtureId);
  if(Number.isFinite(spec.fixed))return {angle:spec.fixed,source:'catalog',hint:spec.hint};
  return {angle:null,source:'catalog',hint:spec.hint};
}
function beamWidth(angle,distance){return 2*distance*Math.tan((angle*Math.PI/180)/2);}
function fillFixtureSelect(){
  const sel=E('setSketchFixture');if(!sel)return;
  const old=sel.value,fs=selectedFixtures();
  let html='<option value="">'+esc(t().genericLight)+'</option>';
  fs.forEach(f=>{const name=((f.manufacturer||'')+' '+(f.model||f.id)).trim();html+='<option value="'+esc(f.id)+'">'+esc(name)+'</option>';});
  sel.innerHTML=html;
  if(Array.from(sel.options).some(o=>o.value===old))sel.value=old;
}

function svgPointFromEvent(ev){const svg=E('setSketchSvg'),r=svg.getBoundingClientRect();return {x:(ev.clientX-r.left)/r.width*1000,y:(ev.clientY-r.top)/r.height*700};}
function roomPointFromSvg(p){const s=active(),left=55,top=45,w=890,h=610;return {x:clamp((p.x-left)/w*s.roomW,0,s.roomW),y:clamp((p.y-top)/h*s.roomH,0,s.roomH)};}
function screenXY(x,y){const s=active(),left=55,top=45,w=890,h=610;return {x:left+x/s.roomW*w,y:top+y/s.roomH*h};}
function screenPoint(o){return screenXY(o.x,o.y);}
function rayToRoomEdge(o,dx,dy){
  const s=active(),ts=[];
  if(dx>0.0001)ts.push((s.roomW-o.x)/dx);else if(dx<-0.0001)ts.push((0-o.x)/dx);
  if(dy>0.0001)ts.push((s.roomH-o.y)/dy);else if(dy<-0.0001)ts.push((0-o.y)/dy);
  const positive=ts.filter(v=>Number.isFinite(v)&&v>0);
  return positive.length?Math.min.apply(null,positive):0;
}
function beamSvg(o,isSel){
  const info=beamInfo(o);if(!info||!Number.isFinite(info.angle))return '';
  const r=(o.rot||0)*Math.PI/180,dx=Math.sin(r),dy=-Math.cos(r),distance=rayToRoomEdge(o,dx,dy);
  if(!(distance>0))return '';
  const half=distance*Math.tan((info.angle*Math.PI/180)/2),px=-dy,py=dx;
  const p0=screenXY(o.x,o.y);
  const p1=screenXY(o.x+dx*distance+px*half,o.y+dy*distance+py*half);
  const p2=screenXY(o.x+dx*distance-px*half,o.y+dy*distance-py*half);
  const opacity=isSel?0.22:0.10;
  return '<polygon points="'+p0.x.toFixed(1)+','+p0.y.toFixed(1)+' '+p1.x.toFixed(1)+','+p1.y.toFixed(1)+' '+p2.x.toFixed(1)+','+p2.y.toFixed(1)+'" fill="#f5c542" fill-opacity="'+opacity+'" stroke="#f5c542" stroke-opacity="'+(isSel?0.7:0.25)+'" stroke-width="1.5" clip-path="url(#setSketchClip)"/>';
}
function iconSvg(o,p,isSel){
  const stroke=isSel?'#f5c542':'#d6dae1',fill=isSel?'#3b3215':'#1c2229',r=(o.rot||0)*Math.PI/180,dx=Math.sin(r),dy=-Math.cos(r),label=esc(labelFor(o));
  let body='';
  if(o.type==='camera') body='<path d="M -24 15 L 18 15 L 18 -15 L -24 -15 Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="3"/><path d="M 18 -10 L 34 -20 L 34 20 L 18 10 Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="3"/>';
  else if(o.type==='subject') body='<circle cx="0" cy="-9" r="10" fill="'+fill+'" stroke="'+stroke+'" stroke-width="3"/><path d="M 0 2 L 0 26 M -15 10 L 15 10 M 0 26 L -12 42 M 0 26 L 12 42" stroke="'+stroke+'" stroke-width="4" stroke-linecap="round"/>';
  else if(o.type==='light') body='<circle cx="0" cy="0" r="21" fill="'+fill+'" stroke="'+stroke+'" stroke-width="3"/><path d="M -10 0 L 10 0 M 0 -10 L 0 10 M -7 -7 L 7 7 M 7 -7 L -7 7" stroke="'+stroke+'" stroke-width="3"/>';
  else{
    const col=o.type==='background'?'#9c7edb':'#9ca3ad';
    body='<g transform="rotate('+(o.rot||0)+')"><line x1="-52" y1="0" x2="52" y2="0" stroke="'+(isSel?'#f5c542':col)+'" stroke-width="9" stroke-linecap="round"/><line x1="-45" y1="-7" x2="-45" y2="7" stroke="#0d0f12" stroke-width="2"/><line x1="45" y1="-7" x2="45" y2="7" stroke="#0d0f12" stroke-width="2"/></g>';
  }
  let direction='';
  if(o.type==='camera'||o.type==='light'){
    const len=o.type==='light'?105:80,x2=dx*len,y2=dy*len;
    direction='<line x1="0" y1="0" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+(o.type==='light'?'#f5c542':'#89c7ff')+'" stroke-width="3" stroke-dasharray="7 5"/><circle cx="'+x2.toFixed(1)+'" cy="'+y2.toFixed(1)+'" r="5" fill="'+(o.type==='light'?'#f5c542':'#89c7ff')+'"/>';
  }
  return '<g class="set-object" data-object-id="'+esc(o.id)+'" transform="translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')" style="cursor:grab">'+direction+body+'<text x="0" y="'+(o.type==='subject'?60:48)+'" text-anchor="middle" font-size="15" font-weight="700" fill="#f3f4f6" stroke="#0d0f12" stroke-width="4" paint-order="stroke">'+label+'</text></g>';
}

function renderSvg(){
  const svg=E('setSketchSvg');if(!svg)return;
  const s=active(),left=55,top=45,w=890,h=610;
  let htm='<defs><clipPath id="setSketchClip"><rect x="'+left+'" y="'+top+'" width="'+w+'" height="'+h+'" rx="10"/></clipPath></defs>';
  htm+='<rect x="'+left+'" y="'+top+'" width="'+w+'" height="'+h+'" rx="10" fill="#0b0d10" stroke="#4b515b" stroke-width="2"/>';
  s.objects.filter(o=>o.type==='light').forEach(o=>{htm+=beamSvg(o,o.id===selectedId);});
  for(let m=0;m<=Math.floor(s.roomW);m++){
    const x=left+m/s.roomW*w;
    htm+='<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top+h)+'" stroke="'+(m===0||m===Math.floor(s.roomW)?'#424850':'#24292f')+'" stroke-width="1"/><text x="'+x+'" y="'+(top+h+22)+'" text-anchor="middle" font-size="11" fill="#7f8792">'+m+'m</text>';
  }
  for(let m=0;m<=Math.floor(s.roomH);m++){
    const y=top+m/s.roomH*h;
    htm+='<line x1="'+left+'" y1="'+y+'" x2="'+(left+w)+'" y2="'+y+'" stroke="'+(m===0||m===Math.floor(s.roomH)?'#424850':'#24292f')+'" stroke-width="1"/><text x="'+(left-9)+'" y="'+(y+4)+'" text-anchor="end" font-size="11" fill="#7f8792">'+m+'m</text>';
  }
  const chosen=obj(selectedId);
  if(chosen){
    const a=screenPoint(chosen);
    s.objects.filter(o=>o.id!==chosen.id).forEach(o=>{
      const b=screenPoint(o),d=Math.hypot(o.x-chosen.x,o.y-chosen.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      htm+='<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="#646c77" stroke-width="1.5" stroke-dasharray="5 5"/><rect x="'+(mx-27)+'" y="'+(my-11)+'" width="54" height="22" rx="7" fill="#15191e" stroke="#444b54"/><text x="'+mx+'" y="'+(my+4)+'" text-anchor="middle" font-size="12" fill="#f5c542">'+d.toFixed(2)+'m</text>';
    });
  }
  s.objects.forEach(o=>{htm+=iconSvg(o,screenPoint(o),o.id===selectedId);});
  svg.innerHTML=htm;
  renderSelected();
}

function renderSelected(){
  const panel=E('setSketchSelectedPanel'),dist=E('setSketchDistances');if(!panel||!dist)return;
  const s=active(),o=obj(selectedId);
  if(!o){panel.innerHTML='<div class="set-empty">'+esc(t().nothing)+'</div>';dist.innerHTML='';return;}
  let beamHtml='';
  if(o.type==='light'){
    const info=beamInfo(o),spec=fixtureBeamSpec(o.fixtureId),value=Number.isFinite(info.angle)?info.angle.toFixed(1):'';
    let source='';
    if(info.source==='manual')source=t().beamManual;
    else if(Number.isFinite(info.angle))source=t().beamCatalog+(spec.hint?' · '+spec.hint:'');
    else if(spec.hint)source=t().beamRange+' · '+spec.hint;
    else source=t().beamMissing;
    let widths='';
    if(Number.isFinite(info.angle))widths=t().beamAt1+': '+beamWidth(info.angle,1).toFixed(2)+' m · '+t().beamAt3+': '+beamWidth(info.angle,3).toFixed(2)+' m';
    beamHtml='<div class="set-beam-controls"><label>'+esc(t().beamAngle)+'<input id="setSketchBeamAngle" type="number" min="1" max="179" step="0.5" value="'+esc(value)+'" placeholder="'+esc(spec.hint)+'"></label><div class="set-beam-info"><small>'+esc(source)+'</small>'+(widths?'<b>'+esc(t().beamWidth)+': '+esc(widths)+'</b>':'')+'</div></div>';
  }
  panel.innerHTML='<div class="set-selected-grid"><label>'+esc(t().name)+'<input id="setSketchObjectName" value="'+esc(labelFor(o))+'"></label><div class="set-readout"><small>'+esc(t().position)+'</small><b>'+o.x.toFixed(2)+' m · '+o.y.toFixed(2)+' m</b></div><div class="set-readout"><small>'+esc(t().direction)+'</small><b>'+Math.round(((o.rot||0)%360+360)%360)+'°</b></div></div>'+beamHtml+'<div class="actions"><button id="setSketchRotL" class="btn secondary" type="button">'+t().rotateLeft+'</button><button id="setSketchRotR" class="btn secondary" type="button">'+t().rotateRight+'</button><button id="setSketchRemove" class="btn secondary" type="button">'+esc(t().remove)+'</button></div>';
  E('setSketchObjectName').addEventListener('change',ev=>{o.label=ev.target.value.trim()||labelFor(o);persist();renderSvg();});
  if(E('setSketchBeamAngle'))E('setSketchBeamAngle').addEventListener('change',ev=>{
    const raw=String(ev.target.value||'').trim();
    if(!raw)delete o.beamAngleDeg;
    else{
      const v=Number(raw.replace(',','.'));
      if(Number.isFinite(v)&&v>=1&&v<=179)o.beamAngleDeg=v;
    }
    persist();renderSvg();
  });
  E('setSketchRotL').addEventListener('click',()=>{o.rot=((o.rot||0)-15+360)%360;persist();renderSvg();});
  E('setSketchRotR').addEventListener('click',()=>{o.rot=((o.rot||0)+15)%360;persist();renderSvg();});
  E('setSketchRemove').addEventListener('click',()=>{s.objects=s.objects.filter(x=>x.id!==o.id);selectedId=null;persist();renderAll();});
  const rows=s.objects.filter(x=>x.id!==o.id).map(x=>({x,d:Math.hypot(x.x-o.x,x.y-o.y)})).sort((a,b)=>a.d-b.d);
  dist.innerHTML='<h4>'+esc(t().distances)+'</h4>'+(rows.length?rows.map(r=>'<div class="set-distance-row"><span>'+esc(labelFor(r.x))+'</span><b>'+r.d.toFixed(2)+' m</b></div>').join(''):'<div class="set-empty">'+esc(t().empty)+'</div>');
}

function sceneOptions(){const sel=E('setSketchSceneSelect');if(!sel)return;sel.innerHTML=state.scenes.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name)+'</option>').join('');sel.value=state.activeId;}
function renderSceneControls(){sceneOptions();const s=active();if(E('setSketchSceneName'))E('setSketchSceneName').value=s.name;if(E('setSketchRoomW'))E('setSketchRoomW').value=s.roomW;if(E('setSketchRoomH'))E('setSketchRoomH').value=s.roomH;fillFixtureSelect();}
function renderAll(){renderSceneControls();renderSvg();}
function addObject(type){
  const s=active();let label={camera:t().camera,subject:t().subject,wall:t().wall,background:t().background}[type]||t().genericLight,fixtureId=null;
  if(type==='light'){
    fixtureId=E('setSketchFixture')?E('setSketchFixture').value:'';
    if(fixtureId){const f=fixtureForId(fixtureId);if(f)label=((f.manufacturer||'')+' '+(f.model||f.id)).trim();}
  }
  const count=s.objects.filter(x=>x.type===type).length;
  const o={id:uid(),type,label:label+(count?' '+(count+1):''),x:clamp(s.roomW*(0.32+0.08*(count%4)),0,s.roomW),y:clamp(s.roomH*(0.35+0.08*(count%4)),0,s.roomH),rot:type==='wall'||type==='background'?90:0};
  if(type==='light'&&fixtureId)o.fixtureId=fixtureId;
  s.objects.push(o);selectedId=o.id;persist();renderAll();
}
function newScene(copy){
  const src=active(),id=uid(),n=state.scenes.length+1;
  const sc=copy?JSON.parse(JSON.stringify(src)):{id,name:(lang()==='sr'?'Scena ':'Scene ')+n,roomW:10,roomH:8,objects:defaultObjects()};
  sc.id=id;
  if(copy)sc.name=src.name+' '+(lang()==='sr'?'kopija':'copy');
  sc.objects.forEach(o=>o.id=uid());
  state.scenes.push(sc);state.activeId=id;selectedId=null;persist();renderAll();showStatus(copy?t().copied:t().created);
}
function deleteScene(){
  if(state.scenes.length===1){const s=active();s.objects=[];s.name=t().defaultScene;s.roomW=10;s.roomH=8;selectedId=null;persist();renderAll();showStatus(t().deleted);return;}
  if(!confirm(t().confirmDelete))return;
  state.scenes=state.scenes.filter(s=>s.id!==state.activeId);state.activeId=state.scenes[0].id;selectedId=null;persist();renderAll();showStatus(t().deleted);
}

function bind(){
  E('setSketchSceneSelect').addEventListener('change',ev=>{state.activeId=ev.target.value;selectedId=null;persist();renderAll();});
  E('setSketchSave').addEventListener('click',()=>{
    const s=active();s.name=E('setSketchSceneName').value.trim()||s.name;s.roomW=clamp(Number(E('setSketchRoomW').value)||10,2,50);s.roomH=clamp(Number(E('setSketchRoomH').value)||8,2,50);s.objects.forEach(o=>{o.x=clamp(o.x,0,s.roomW);o.y=clamp(o.y,0,s.roomH);});persist();renderAll();showStatus(t().saved);
  });
  E('setSketchNew').addEventListener('click',()=>newScene(false));
  E('setSketchCopy').addEventListener('click',()=>newScene(true));
  E('setSketchDeleteScene').addEventListener('click',deleteScene);
  ['camera','subject','light','wall','background'].forEach(type=>E('setSketchAdd'+type[0].toUpperCase()+type.slice(1)).addEventListener('click',()=>addObject(type)));
  ['setSketchRoomW','setSketchRoomH'].forEach(id=>E(id).addEventListener('change',()=>E('setSketchSave').click()));
  const svg=E('setSketchSvg');
  svg.addEventListener('pointerdown',ev=>{const g=ev.target.closest('[data-object-id]');if(!g)return;selectedId=g.dataset.objectId;dragId=selectedId;dragPointer=ev.pointerId;try{svg.setPointerCapture(ev.pointerId);}catch(e){}renderSvg();ev.preventDefault();});
  svg.addEventListener('pointermove',ev=>{if(!dragId||dragPointer!==ev.pointerId)return;const o=obj(dragId);if(!o)return;const p=roomPointFromSvg(svgPointFromEvent(ev));o.x=p.x;o.y=p.y;renderSvg();ev.preventDefault();});
  const end=ev=>{if(dragId&&dragPointer===ev.pointerId){persist();dragId=null;dragPointer=null;try{svg.releasePointerCapture(ev.pointerId);}catch(e){}}};
  svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
}

function translate(){
  if(!E('setSketchCard'))return;const x=t();
  E('setSketchTitle').textContent=x.title;E('setSketchIntro').textContent=x.intro;E('setSketchSceneLabel').textContent=x.scene;E('setSketchSceneNameLabel').textContent=x.sceneName;E('setSketchSave').textContent=x.save;E('setSketchNew').textContent=x.newScene;E('setSketchCopy').textContent=x.copy;E('setSketchDeleteScene').textContent=x.deleteScene;E('setSketchRoomTitle').textContent=x.room;E('setSketchRoomWLabel').textContent=x.width;E('setSketchRoomHLabel').textContent=x.height;E('setSketchAddTitle').textContent=x.add;E('setSketchFixtureLabel').textContent=x.fixture;E('setSketchAddCamera').textContent='📷 '+x.camera;E('setSketchAddSubject').textContent='👤 '+x.subject;E('setSketchAddLight').textContent='💡 '+x.light;E('setSketchAddWall').textContent='━ '+x.wall;E('setSketchAddBackground').textContent='▰ '+x.background;E('setSketchSelectedTitle').textContent=x.selected;E('setSketchDragNote').textContent=x.drag;renderAll();
}
function init(){
  const planner=E('planner');if(!planner||E('setSketchCard'))return false;
  const style=document.createElement('style');
  style.textContent='.set-sketch-card{overflow:hidden}.set-sketch-toolbar{display:grid;grid-template-columns:1fr 1fr;gap:10px}.set-sketch-stage{background:#090b0e;border:1px solid #30343b;border-radius:14px;overflow:hidden;margin:12px 0}.set-sketch-stage svg{display:block;width:100%;height:auto;aspect-ratio:10/7;touch-action:none;user-select:none}.set-sketch-add{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.set-sketch-add .wide{grid-column:1/-1}.set-selected-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px;align-items:end}.set-selected-grid label,.set-beam-controls label{font-size:11px;color:#9299a3}.set-readout{background:#0f1115;border:1px solid #30343b;border-radius:10px;padding:9px}.set-readout small{display:block;color:#9299a3;font-size:10px}.set-readout b{display:block;color:#f5c542;margin-top:3px;font-size:13px}.set-beam-controls{display:grid;grid-template-columns:140px 1fr;gap:8px;margin-top:8px}.set-beam-info{background:#15191e;border:1px solid #30343b;border-radius:10px;padding:9px}.set-beam-info small{display:block;color:#9299a3}.set-beam-info b{display:block;color:#f5c542;margin-top:4px;font-size:12px}.set-distance-row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid #292d33}.set-distance-row b{color:#f5c542}.set-empty,.set-sketch-note,.set-sketch-status{color:#9299a3;font-size:12px;line-height:1.4}.set-sketch-status{min-height:18px;color:#b8f0d1}.set-sketch-card h4{margin:14px 0 5px}@media(max-width:520px){.set-selected-grid{grid-template-columns:1fr 1fr}.set-selected-grid label{grid-column:1/-1}.set-beam-controls{grid-template-columns:1fr}}';
  document.head.appendChild(style);
  const card=document.createElement('details');
  card.id='setSketchCard';card.className='card set-sketch-card';
  card.innerHTML='<summary style="font-weight:900;font-size:20px;cursor:pointer"><span id="setSketchTitle"></span></summary><div style="margin-top:12px"><p id="setSketchIntro" class="muted small"></p><div class="set-sketch-toolbar"><div><label id="setSketchSceneLabel" class="caption"></label><select id="setSketchSceneSelect"></select></div><div><label id="setSketchSceneNameLabel" class="caption"></label><input id="setSketchSceneName"></div></div><div class="actions"><button id="setSketchSave" class="btn primary" type="button"></button><button id="setSketchNew" class="btn secondary" type="button"></button><button id="setSketchCopy" class="btn secondary" type="button"></button><button id="setSketchDeleteScene" class="btn secondary" type="button"></button></div><h3 id="setSketchRoomTitle"></h3><div class="row"><div><label id="setSketchRoomWLabel" class="caption"></label><input id="setSketchRoomW" type="number" min="2" max="50" step="0.5"></div><div><label id="setSketchRoomHLabel" class="caption"></label><input id="setSketchRoomH" type="number" min="2" max="50" step="0.5"></div></div><div id="setSketchStage" class="set-sketch-stage"><svg id="setSketchSvg" viewBox="0 0 1000 700" role="img"></svg></div><div id="setSketchDragNote" class="set-sketch-note"></div><h3 id="setSketchAddTitle"></h3><div><label id="setSketchFixtureLabel" class="caption"></label><select id="setSketchFixture"></select></div><div class="set-sketch-add" style="margin-top:8px"><button id="setSketchAddCamera" class="btn secondary" type="button"></button><button id="setSketchAddSubject" class="btn secondary" type="button"></button><button id="setSketchAddLight" class="btn primary" type="button"></button><button id="setSketchAddWall" class="btn secondary" type="button"></button><button id="setSketchAddBackground" class="btn secondary wide" type="button"></button></div><h3 id="setSketchSelectedTitle"></h3><div id="setSketchSelectedPanel"></div><div id="setSketchDistances"></div><div id="setSketchStatus" class="set-sketch-status"></div></div>';
  const measure=E('sceneMeasureCard');
  if(measure&&measure.parentNode)measure.parentNode.insertBefore(card,measure.nextSibling);else{const h=planner.querySelector('h1');if(h&&h.nextSibling)planner.insertBefore(card,h.nextSibling);else planner.insertBefore(card,planner.firstChild);}
  bind();
  const oldLang=window.setLanguage;if(typeof oldLang==='function'){window.setLanguage=function(l){oldLang(l);setTimeout(translate,0);};}
  translate();
  let n=0;const refresh=setInterval(()=>{n++;fillFixtureSelect();renderSvg();if((window.catalogFixtures||[]).length||n>30)clearInterval(refresh);},300);
  return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer);},100);
})();