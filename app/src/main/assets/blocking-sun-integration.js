(function(){
'use strict';
const CFG_KEY='lighting_set_sketch_sun_v1';
const E=id=>document.getElementById(id);
const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
const TXT={
 sr:{title:'SUNCE / BLOCKING',select:'Izaberi kameru na tlocrtu za odnos Sunca prema kadru.',sun:'SUNCE',camera:'PRAVAC KAMERE',relation:'ODNOS PREMA KAMERI',light:'TIP PRIRODNOG SVETLA',front:'ispred kamere',right:'desno od kamere',back:'iza kamere',left:'levo od kamere',backlight:'KONTRA / BACKLIGHT',frontlight:'FRONTALNO SVETLO',sidelight:'BOČNO SVETLO',threeQuarter:'3/4 SVETLO',below:'Sunce je ispod horizonta',missing:'Podesi datum, vreme i lokaciju u SUNCE modulu.',time:'VREME',flare:'Moguć lens flare — Sunce je blizu ose objektiva.',north:'SEVER SKICE'},
 en:{title:'SUN / BLOCKING',select:'Select a camera on the floor plan to see the Sun relative to the shot.',sun:'SUN',camera:'CAMERA DIRECTION',relation:'RELATIVE TO CAMERA',light:'NATURAL LIGHT TYPE',front:'in front of camera',right:'right of camera',back:'behind camera',left:'left of camera',backlight:'BACKLIGHT',frontlight:'FRONT LIGHT',sidelight:'SIDE LIGHT',threeQuarter:'3/4 LIGHT',below:'Sun is below the horizon',missing:'Set date, time and location in the SUN module.',time:'TIME',flare:'Possible lens flare — Sun is close to the lens axis.',north:'SKETCH NORTH'}
};
const t=()=>TXT[lang()];
const norm=a=>(Number(a)%360+360)%360;
const signed=a=>((Number(a)+540)%360)-180;
const pad=n=>String(n).padStart(2,'0');
function api(){return window.LightingAISetSketch||null}
function scene(){const a=api();return a&&a.getActiveScene?a.getActiveScene():null}
function selectedCamera(){
 const a=api(),s=scene();if(!a||!s)return null;
 const id=a.getSelectedId&&a.getSelectedId(),o=id?s.objects.find(x=>x.id===id):null;
 if(o&&o.type==='camera')return a.getVisualObject?a.getVisualObject(o):o;
 return null;
}
function cfgFor(id){try{const all=JSON.parse(localStorage.getItem(CFG_KEY))||{},v=all[id]||{};return{northDeg:Number.isFinite(Number(v.northDeg))?norm(v.northDeg):0,visible:v.visible!==false}}catch(e){return{northDeg:0,visible:true}}}
function inputDate(){
 const dv=E('sunDate')&&E('sunDate').value,tv=E('sunTime')&&E('sunTime').value||'12:00';if(!dv)return new Date();
 const d=dv.split('-').map(Number),tm=tv.split(':').map(Number);return new Date(d[0],d[1]-1,d[2],tm[0]||0,tm[1]||0,0,0);
}
function sunState(){
 if(!window.LightingAISun)return null;
 const lat=Number(E('sunLat')&&E('sunLat').value),lon=Number(E('sunLon')&&E('sunLon').value);
 if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
 const p=window.LightingAISun.position(inputDate(),lat,lon);if(!p||!Number.isFinite(p.azimuth)||!Number.isFinite(p.elevation))return null;
 return{azimuth:norm(p.azimuth),elevation:Number(p.elevation),shadowAzimuth:norm(p.azimuth+180),date:inputDate()};
}
function relationText(r){const x=t(),a=Math.abs(r);if(a<=45)return x.front;if(r>45&&r<135)return x.right;if(r<-45&&r>-135)return x.left;return x.back}
function lightKey(r){const a=Math.abs(r);if(a<=30)return'backlight';if(a>=150)return'frontlight';if(a>=60&&a<=120)return'sidelight';return'threeQuarter'}
function snapshot(){
 const s=scene(),cam=selectedCamera(),sun=sunState();if(!s||!cam||!sun)return null;
 const cfg=cfgFor(s.id),cameraHeading=norm((Number(cam.rot)||0)-cfg.northDeg),relative=signed(sun.azimuth-cameraHeading);
 return{sceneId:s.id,cameraId:cam.id,cameraLabel:cam.label||'Kamera',sketchNorthDeg:cfg.northDeg,cameraHeadingDeg:cameraHeading,sunAzimuthDeg:sun.azimuth,sunElevationDeg:sun.elevation,shadowAzimuthDeg:sun.shadowAzimuth,relativeAngleDeg:relative,relation:relationText(relative),lightType:lightKey(relative),flareRisk:sun.elevation>0&&Math.abs(relative)<=20,date:sun.date.toISOString()};
}
function minutes(v){const p=String(v||'12:00').split(':').map(Number);return(p[0]||0)*60+(p[1]||0)}
function dateValue(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function shiftTime(delta){
 const time=E('sunTime'),date=E('sunDate');if(!time)return;
 let total=minutes(time.value)+delta,day=0;while(total<0){total+=1440;day--}while(total>=1440){total-=1440;day++}
 if(day&&date&&date.value){const p=date.value.split('-').map(Number),d=new Date(p[0],p[1]-1,p[2],12);d.setDate(d.getDate()+day);date.value=dateValue(d);date.dispatchEvent(new Event('change',{bubbles:true}))}
 time.value=pad(Math.floor(total/60))+':'+pad(total%60);time.dispatchEvent(new Event('change',{bubbles:true}));render();
}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function render(){
 const host=E('blockingSunBody');if(!host)return;const x=t(),s=scene(),cam=selectedCamera(),sun=sunState();
 if(E('blockingSunTitle'))E('blockingSunTitle').textContent=x.title;
 if(!cam){host.innerHTML='<div class="blocking-sun-empty">'+esc(x.select)+'</div>';return}
 if(!sun){host.innerHTML='<div class="blocking-sun-empty">'+esc(x.missing)+'</div>';return}
 const cfg=cfgFor(s.id),heading=norm((Number(cam.rot)||0)-cfg.northDeg),rel=signed(sun.azimuth-heading),key=lightKey(rel),time=E('sunTime')&&E('sunTime').value||'—';
 host.innerHTML='<div class="blocking-sun-grid"><div><small>'+esc(x.sun)+'</small><b>'+sun.azimuth.toFixed(0)+'° / '+sun.elevation.toFixed(1)+'°</b></div><div><small>'+esc(x.camera)+'</small><b>'+heading.toFixed(0)+'°</b></div><div><small>'+esc(x.relation)+'</small><b>'+esc(relationText(rel))+' · '+(rel>=0?'+':'')+rel.toFixed(0)+'°</b></div><div><small>'+esc(x.light)+'</small><b>'+esc(x[key])+'</b></div><div><small>'+esc(x.north)+'</small><b>'+cfg.northDeg.toFixed(0)+'°</b></div><div><small>'+esc(x.time)+'</small><b>'+esc(time)+'</b></div></div>'+(sun.elevation<=0?'<div class="blocking-sun-warn">'+esc(x.below)+'</div>':(Math.abs(rel)<=20?'<div class="blocking-sun-warn">'+esc(x.flare)+'</div>':''))+'<div class="blocking-sun-time"><button type="button" data-sun-shift="-30">−30</button><button type="button" data-sun-shift="-15">−15</button><button type="button" data-sun-shift="15">+15</button><button type="button" data-sun-shift="30">+30</button></div>';
 host.querySelectorAll('[data-sun-shift]').forEach(b=>b.onclick=()=>shiftTime(Number(b.dataset.sunShift)||0));
}
function install(){
 const shell=E('blockingShell');if(!shell||E('blockingSunPanel'))return false;
 const st=document.createElement('style');st.id='blockingSunStyle';st.textContent='.blocking-sun-panel{margin-top:10px;padding:10px;background:#12161b;border:1px solid #30343b;border-radius:11px}.blocking-sun-panel h4{margin:0 0 8px}.blocking-sun-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.blocking-sun-grid>div{background:#15191e;border:1px solid #30343b;border-radius:9px;padding:8px}.blocking-sun-grid small{display:block;color:#9299a3;font-size:9px}.blocking-sun-grid b{display:block;color:#f5c542;margin-top:3px;font-size:11px}.blocking-sun-time{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.blocking-sun-time button{background:#171b20;border:1px solid #30343b;border-radius:8px;color:#d8dce2;padding:8px 4px;font-size:10px;font-weight:800}.blocking-sun-empty,.blocking-sun-warn{color:#9299a3;font-size:11px;line-height:1.4}.blocking-sun-warn{color:#ffcf70;margin-top:7px}@media(max-width:520px){.blocking-sun-grid{grid-template-columns:1fr 1fr}}';document.head.appendChild(st);
 const panel=document.createElement('div');panel.id='blockingSunPanel';panel.className='blocking-sun-panel';panel.innerHTML='<h4 id="blockingSunTitle"></h4><div id="blockingSunBody"></div>';
 const status=E('blockingStatus');if(status&&status.parentNode)status.parentNode.insertBefore(panel,status);else shell.appendChild(panel);
 ['sunDate','sunTime','sunLat','sunLon','setSketchNorthDeg'].forEach(id=>E(id)&&E(id).addEventListener('change',render));
 E('setSketchSvg')&&E('setSketchSvg').addEventListener('lightingai:set-sketch-rendered',render);
 document.addEventListener('click',ev=>{const id=String(ev.target&&ev.target.id||'');if(id.indexOf('setSketch')===0)setTimeout(render,0)});
 render();setInterval(()=>{if(E('blockingSunPanel'))render()},700);return true;
}
window.LightingAIBlockingSun={version:'1.0',snapshot:snapshot,shiftTime:shiftTime,render:render};
let tries=0;const boot=setInterval(()=>{tries++;if(install()||tries>180)clearInterval(boot)},100);
})();