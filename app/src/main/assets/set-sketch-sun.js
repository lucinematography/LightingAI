(function(){
'use strict';
const SET_KEY='lighting_set_sketch_v1';
const CFG_KEY='lighting_set_sketch_sun_v1';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
  sr:{title:'SUNCE NA SKICI',show:'PRIKAŽI SUNCE',north:'SEVER SKICE (°)',sun:'SUNCE',shadow:'SENKA',below:'ispod horizonta',hint:'0° znači da je vrh skice sever. Vrednost rotira sever u smeru kazaljke na satu.'},
  en:{title:'SUN ON SKETCH',show:'SHOW SUN',north:'SKETCH NORTH (°)',sun:'SUN',shadow:'SHADOW',below:'below horizon',hint:'0° means the top of the sketch is north. The value rotates north clockwise.'}
};
const t=()=>TXT[lang()];
const norm=a=>(Number(a)%360+360)%360;
let lastLang='',lastSceneId='';

function readSet(){try{return JSON.parse(localStorage.getItem(SET_KEY))||null}catch(e){return null}}
function activeScene(){const s=readSet();if(!s||!Array.isArray(s.scenes)||!s.scenes.length)return null;return s.scenes.find(x=>x.id===s.activeId)||s.scenes[0]}
function readCfg(){try{return JSON.parse(localStorage.getItem(CFG_KEY))||{}}catch(e){return{}}}
function cfgFor(id){const all=readCfg(),v=all[id]||{};return {northDeg:Number.isFinite(Number(v.northDeg))?norm(v.northDeg):0,visible:v.visible!==false}}
function saveCfg(id,cfg){const all=readCfg();all[id]={northDeg:norm(cfg.northDeg),visible:cfg.visible!==false};localStorage.setItem(CFG_KEY,JSON.stringify(all))}
function sunDate(){
  const dv=E('sunDate')?.value,tv=E('sunTime')?.value||'12:00';if(!dv)return new Date();
  const d=dv.split('-').map(Number),tm=tv.split(':').map(Number);return new Date(d[0],d[1]-1,d[2],tm[0]||0,tm[1]||0,0,0);
}
function sunState(){
  if(!window.LightingAISun)return null;
  const lat=Number(E('sunLat')?.value),lon=Number(E('sunLon')?.value);if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
  const p=LightingAISun.position(sunDate(),lat,lon);if(!p||!Number.isFinite(p.azimuth)||!Number.isFinite(p.elevation))return null;
  return {azimuth:norm(p.azimuth),elevation:Number(p.elevation),shadowAzimuth:norm(p.azimuth+180)};
}
function edgeDistance(cx,cy,dx,dy,left,right,top,bottom){
  const vals=[];
  if(dx>0.0001)vals.push((right-cx)/dx);else if(dx<-0.0001)vals.push((left-cx)/dx);
  if(dy>0.0001)vals.push((bottom-cy)/dy);else if(dy<-0.0001)vals.push((top-cy)/dy);
  const p=vals.filter(v=>Number.isFinite(v)&&v>0);return p.length?Math.min.apply(null,p):0;
}
function draw(){
  const svg=E('setSketchSvg'),scene=activeScene();if(!svg||!scene)return;
  svg.querySelectorAll('.set-sun-overlay').forEach(n=>n.remove());
  const cfg=cfgFor(scene.id),sun=sunState();
  const left=55,right=945,top=45,bottom=655,cx=500,cy=350;
  let html='<g class="set-sun-overlay" pointer-events="none"><defs><marker id="setSunArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#f5c542"/></marker><marker id="setShadowArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8f97a2"/></marker></defs>';
  const nr=cfg.northDeg*Math.PI/180,ndx=Math.sin(nr),ndy=-Math.cos(nr),nx=885,ny=135,nlen=55;
  html+='<line x1="'+nx+'" y1="'+ny+'" x2="'+(nx+ndx*nlen).toFixed(1)+'" y2="'+(ny+ndy*nlen).toFixed(1)+'" stroke="#89c7ff" stroke-width="3"/>'+
    '<text x="'+(nx+ndx*(nlen+16)).toFixed(1)+'" y="'+(ny+ndy*(nlen+16)+5).toFixed(1)+'" text-anchor="middle" font-size="16" font-weight="900" fill="#89c7ff">N</text>';
  if(cfg.visible&&sun&&sun.elevation>0){
    const screenAz=norm(cfg.northDeg+sun.azimuth),r=screenAz*Math.PI/180,dx=Math.sin(r),dy=-Math.cos(r);
    const toSun=edgeDistance(cx,cy,dx,dy,left+26,right-26,top+26,bottom-26)*0.96;
    const toShadow=edgeDistance(cx,cy,-dx,-dy,left+26,right-26,top+26,bottom-26)*0.92;
    const sx=cx+dx*toSun,sy=cy+dy*toSun,shx=cx-dx*toShadow,shy=cy-dy*toShadow;
    html+='<line x1="'+sx.toFixed(1)+'" y1="'+sy.toFixed(1)+'" x2="'+cx+'" y2="'+cy+'" stroke="#f5c542" stroke-width="4" stroke-opacity=".78" marker-end="url(#setSunArrow)"/>'+
      '<line x1="'+cx+'" y1="'+cy+'" x2="'+shx.toFixed(1)+'" y2="'+shy.toFixed(1)+'" stroke="#8f97a2" stroke-width="3" stroke-dasharray="9 7" stroke-opacity=".8" marker-end="url(#setShadowArrow)"/>'+
      '<circle cx="'+sx.toFixed(1)+'" cy="'+sy.toFixed(1)+'" r="20" fill="#f5c542" fill-opacity=".18" stroke="#f5c542" stroke-width="2"/>'+
      '<text x="'+sx.toFixed(1)+'" y="'+(sy+6).toFixed(1)+'" text-anchor="middle" font-size="22">☀</text>';
  }
  html+='</g>';
  const wrap=document.createElementNS('http://www.w3.org/2000/svg','g');wrap.innerHTML=html;const node=wrap.firstChild;if(!node)return;
  const firstObject=svg.querySelector('.set-object');if(firstObject)svg.insertBefore(node,firstObject);else svg.appendChild(node);
}
function renderReadout(){
  const scene=activeScene();if(!scene)return;const cfg=cfgFor(scene.id),sun=sunState(),x=t();
  if(E('setSketchSunVisible'))E('setSketchSunVisible').checked=cfg.visible;
  if(E('setSketchNorthDeg'))E('setSketchNorthDeg').value=Math.round(cfg.northDeg);
  if(E('setSketchSunTitle'))E('setSketchSunTitle').textContent=x.title;
  if(E('setSketchSunShowLabel'))E('setSketchSunShowLabel').textContent=x.show;
  if(E('setSketchNorthLabel'))E('setSketchNorthLabel').textContent=x.north;
  if(E('setSketchSunHint'))E('setSketchSunHint').textContent=x.hint;
  if(E('setSketchSunReadout'))E('setSketchSunReadout').innerHTML=sun?(sun.elevation>0?'<small>'+x.sun+'</small><b>'+sun.azimuth.toFixed(0)+'° · '+sun.elevation.toFixed(1)+'°</b>':'<small>'+x.sun+'</small><b>'+x.below+'</b>'):'<small>'+x.sun+'</small><b>—</b>';
  if(E('setSketchShadowReadout'))E('setSketchShadowReadout').innerHTML=sun&&sun.elevation>0?'<small>'+x.shadow+'</small><b>'+sun.shadowAzimuth.toFixed(0)+'°</b>':'<small>'+x.shadow+'</small><b>—</b>';
  lastSceneId=scene.id;lastLang=lang();
}
function install(){
  const stage=E('setSketchStage'),svg=E('setSketchSvg');if(!stage||!svg)return false;
  // On a brand-new install Set Sketch has a valid in-memory default scene before
  // it has ever written that scene to localStorage. SUN/FOV/coverage extensions
  // read localStorage, so persist the default once through the existing Save path.
  if(!activeScene()){
    const save=E('setSketchSave');
    if(save)save.click();
  }
  if(!E('setSketchSunStyle')){
    const st=document.createElement('style');st.id='setSketchSunStyle';st.textContent='.set-sketch-sun-tools{margin:10px 0 4px;padding:10px;background:#10141a;border:1px solid #30343b;border-radius:12px}.set-sketch-sun-tools h4{margin:0 0 8px}.set-sketch-sun-grid{display:grid;grid-template-columns:1fr 120px 1fr 1fr;gap:8px;align-items:end}.set-sketch-sun-check{display:flex;gap:8px;align-items:center;padding:10px;background:#0f1115;border:1px solid #30343b;border-radius:10px;font-size:11px;color:#c7cbd1}.set-sketch-sun-check input{width:auto}.set-sketch-sun-grid label{font-size:11px;color:#9299a3}.set-sketch-sun-tools .set-readout{min-height:55px}@media(max-width:620px){.set-sketch-sun-grid{grid-template-columns:1fr 1fr}.set-sketch-sun-check{grid-column:1/-1}}';document.head.appendChild(st);
  }
  if(!E('setSketchSunTools')){
    const box=document.createElement('div');box.id='setSketchSunTools';box.className='set-sketch-sun-tools';box.innerHTML='<h4 id="setSketchSunTitle"></h4><div class="set-sketch-sun-grid"><label class="set-sketch-sun-check"><input id="setSketchSunVisible" type="checkbox"><span id="setSketchSunShowLabel"></span></label><label><span id="setSketchNorthLabel"></span><input id="setSketchNorthDeg" type="number" min="0" max="359" step="1" value="0"></label><div id="setSketchSunReadout" class="set-readout"></div><div id="setSketchShadowReadout" class="set-readout"></div></div><div id="setSketchSunHint" class="set-sketch-note" style="margin-top:7px"></div>';
    stage.parentNode.insertBefore(box,stage);
    E('setSketchSunVisible').addEventListener('change',()=>{const scene=activeScene();if(!scene)return;const cfg=cfgFor(scene.id);cfg.visible=E('setSketchSunVisible').checked;saveCfg(scene.id,cfg);draw();renderReadout()});
    E('setSketchNorthDeg').addEventListener('input',()=>{const scene=activeScene();if(!scene)return;const cfg=cfgFor(scene.id);cfg.northDeg=norm(E('setSketchNorthDeg').value||0);saveCfg(scene.id,cfg);draw();renderReadout()});
  }
  ['sunDate','sunTime','sunLat','sunLon'].forEach(id=>E(id)?.addEventListener('change',()=>{draw();renderReadout()}));
  E('setSketchSceneSelect')?.addEventListener('change',()=>setTimeout(()=>{draw();renderReadout()},0));
  svg.addEventListener('pointermove',()=>draw());svg.addEventListener('pointerup',()=>draw());svg.addEventListener('pointercancel',()=>draw());
  draw();renderReadout();return true;
}
let installed=false,tries=0;
const boot=setInterval(()=>{tries++;if(!installed)installed=install();if(installed){const scene=activeScene();if(scene&&(scene.id!==lastSceneId||lang()!==lastLang))renderReadout();draw();}if(tries>180&&!installed)clearInterval(boot)},500);
})();