(function(){
  'use strict';
  const KEY='lighting_scene_measurements_v1';
  const TXT={
    sr:{title:'📏 Merenje scene kamerom',intro:'PRO režim koristi Android Camera2 i native senzor nagiba, pa radi i bez depth senzora. WEB kamera ostaje kao rezervni režim.',target:'ŠTA MERIŠ',height:'VISINA KAMERE OD PODA',pro:'OTVORI PRO MERAČ',web:'WEB KAMERA',stop:'ZAUSTAVI WEB KAMERU',measure:'SAČUVAJ WEB MERENJE',clear:'OBRIŠI MERENJA',subject:'Kamera → glumac',wall:'Kamera → zid',background:'Kamera → pozadina',angle:'Nagib',distance:'Procena udaljenosti',ready:'Uperi krstić u tačku na podu i sačuvaj merenje.',needTilt:'Spusti kameru ka podu da bi procena bila moguća.',needSensor:'WEB senzor nagiba nije dostupan. Koristi PRO merač.',cameraStarting:'Pokrećem WEB kameru…',cameraOn:'WEB kamera je spremna.',cameraOff:'WEB kamera je zaustavljena.',permission:'Odobri pristup kameri, pa će se pregled automatski pokrenuti.',denied:'Pristup kameri nije odobren.',unavailable:'WEB pregled nije dostupan na ovom telefonu/WebView-u. Koristi PRO merač.',proStarting:'Otvaram PRO merač…',proSaved:'PRO merenje je sačuvano.',proFallback:'Native PRO nije dostupan na ovom uređaju. Prebacujem na WEB rezervni režim.',proNoCamera:'PRO merenje nije dostupno jer uređaj nema kompatibilnu zadnju kameru. Ostali planeri i kalkulatori rade normalno.',measurements:'Sačuvana merenja',none:'Još nema sačuvanih merenja.',derived:'Glumac → pozadina',estimate:'PROCENA',note:'Ciljaj mesto gde objekat dodiruje ravan pod. PRO režim je pouzdaniji jer koristi native kameru i native senzor; rezultat je i dalje geometrijska procena, ne lasersko merenje.'},
    en:{title:'📏 Camera Scene Measurement',intro:'PRO mode uses Android Camera2 and the native tilt sensor, so it works without a depth sensor. WEB camera remains as a fallback.',target:'WHAT ARE YOU MEASURING',height:'CAMERA HEIGHT ABOVE FLOOR',pro:'OPEN PRO METER',web:'WEB CAMERA',stop:'STOP WEB CAMERA',measure:'SAVE WEB MEASUREMENT',clear:'CLEAR MEASUREMENTS',subject:'Camera → actor',wall:'Camera → wall',background:'Camera → background',angle:'Tilt',distance:'Estimated distance',ready:'Aim the crosshair at the floor contact point and save the measurement.',needTilt:'Tilt the camera down toward the floor to calculate distance.',needSensor:'WEB tilt sensor is unavailable. Use the PRO meter.',cameraStarting:'Starting WEB camera…',cameraOn:'WEB camera ready.',cameraOff:'WEB camera stopped.',permission:'Allow camera access and the preview will start automatically.',denied:'Camera access was not granted.',unavailable:'WEB preview is unavailable on this phone/WebView. Use the PRO meter.',proStarting:'Opening PRO meter…',proSaved:'PRO measurement saved.',proFallback:'Native PRO is unavailable on this device. Switching to the WEB fallback mode.',proNoCamera:'PRO measurement is unavailable because this device has no compatible rear camera. Other planners and calculators still work.',measurements:'Saved measurements',none:'No saved measurements yet.',derived:'Actor → background',estimate:'ESTIMATE',note:'Aim at the point where the object meets a level floor. PRO mode is more robust because it uses the native camera and native sensor; the result is still a geometric estimate, not laser ranging.'}
  };
  const E=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  let stream=null,betaSmooth=null,currentDistance=null,sensorSeen=false;
  let measurements=read();
  function read(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
  function save(){localStorage.setItem(KEY,JSON.stringify(measurements))}
  function fmt(v){return Number(v).toFixed(2).replace('.',lang()==='sr'?',':'.')+' m'}
  function setStatus(text,kind){const s=E('sceneMeasureStatus');if(!s)return;s.textContent=text;s.className='scene-measure-status '+(kind||'')}
  function targetLabel(key){const x=t();return key==='subject'?x.subject:key==='wall'?x.wall:x.background}
  function nativeCapabilities(){
    try{
      if(window.LightingAIDeviceCapabilities&&typeof window.LightingAIDeviceCapabilities==='object')return window.LightingAIDeviceCapabilities;
      if(window.Android&&typeof Android.getDeviceCapabilities==='function'){
        const parsed=JSON.parse(Android.getDeviceCapabilities()||'{}');
        if(parsed&&typeof parsed==='object')return parsed;
      }
    }catch(e){}
    return null;
  }
  function pushMeasurement(target,distance,angle,method){
    distance=Number(distance);if(!Number.isFinite(distance)||distance<=0)return false;
    measurements.unshift({target,distance:Number(distance.toFixed(3)),angle:Number(angle),method:method||'web',time:Date.now()});
    measurements=measurements.slice(0,20);save();renderMeasurements();return true;
  }
  function estimate(){
    const h=Number(E('sceneMeasureHeight')?.value||0),dep=betaSmooth===null?null:90-betaSmooth;
    const angle=E('sceneMeasureAngle'),dist=E('sceneMeasureDistance');
    if(angle)angle.textContent=dep===null?'—':Math.max(0,dep).toFixed(1)+'°';
    if(dep===null||!Number.isFinite(dep)){currentDistance=null;if(dist)dist.textContent='—';return}
    if(dep<2||dep>80||!Number.isFinite(h)||h<=0){currentDistance=null;if(dist)dist.textContent='—';setStatus(t().needTilt,'warn');return}
    currentDistance=h/Math.tan(dep*Math.PI/180);
    if(!Number.isFinite(currentDistance)||currentDistance<=0||currentDistance>100){currentDistance=null;if(dist)dist.textContent='—';return}
    if(dist)dist.textContent=fmt(currentDistance);setStatus(t().ready,'ok');
  }
  function onOrientation(ev){if(typeof ev.beta!=='number'||!Number.isFinite(ev.beta))return;sensorSeen=true;betaSmooth=betaSmooth===null?ev.beta:(betaSmooth*.82+ev.beta*.18);estimate()}
  async function openWebCamera(){
    try{
      setStatus(t().cameraStarting,'');
      if(window.Android&&typeof Android.hasCameraPermission==='function'&&!Android.hasCameraPermission()){setStatus(t().permission,'warn');if(typeof Android.requestCameraPermission==='function')Android.requestCameraPermission();return}
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('mediaDevices');
      stopWebCamera(false);stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
      const v=E('sceneMeasureVideo');v.srcObject=stream;v.play().catch(()=>{});E('sceneMeasureStage').classList.add('live');E('sceneMeasureStart').textContent=t().stop;setStatus(t().cameraOn,'ok');
    }catch(e){setStatus(t().unavailable,'warn');stopWebCamera(false)}
  }
  function stopWebCamera(showStatus=true){if(stream){stream.getTracks().forEach(x=>x.stop());stream=null}const v=E('sceneMeasureVideo');if(v)v.srcObject=null;E('sceneMeasureStage')?.classList.remove('live');if(E('sceneMeasureStart'))E('sceneMeasureStart').textContent=t().web;if(showStatus)setStatus(t().cameraOff,'')}
  function toggleWebCamera(){if(stream)stopWebCamera();else openWebCamera()}
  function startPro(){
    const input=E('sceneMeasureHeight');let h=Number(String(input?.value||'1.50').replace(',','.'));if(!Number.isFinite(h)||h<.3||h>3)h=1.5;
    stopWebCamera(false);
    const caps=nativeCapabilities();
    if(caps&&caps.nativeAndroid===true){
      if(Number(caps.rearCameraCount)===0){setStatus(t().proNoCamera,'warn');return}
      if(caps.nativeProAvailable===false){setStatus(t().proFallback,'warn');setTimeout(()=>openWebCamera(),350);return}
    }
    setStatus(t().proStarting,'');
    if(window.Android&&typeof Android.startSceneMeasure==='function'){Android.startSceneMeasure(h,lang());return}
    setStatus(t().proFallback,'warn');openWebCamera();
  }
  function addWebMeasurement(){estimate();if(currentDistance===null){setStatus(sensorSeen?t().needTilt:t().needSensor,'warn');return}pushMeasurement(E('sceneMeasureTarget').value,currentDistance,90-betaSmooth,'web')}
  function clearMeasurements(){measurements=[];save();renderMeasurements()}
  function renderMeasurements(){
    const box=E('sceneMeasureList');if(!box)return;const tx=t();
    if(!measurements.length){box.innerHTML='<div class="scene-measure-empty">'+tx.none+'</div>';return}
    let html=measurements.map((m,i)=>'<div class="scene-measure-row"><span>'+targetLabel(m.target)+(m.method==='native'?'<small class="scene-measure-method">PRO</small>':'<small class="scene-measure-method">WEB</small>')+'</span><b>'+fmt(m.distance)+'</b><button type="button" data-del="'+i+'">×</button></div>').join('');
    const subject=measurements.find(x=>x.target==='subject'),bg=measurements.find(x=>x.target==='background');
    if(subject&&bg){const d=Math.abs(bg.distance-subject.distance);html='<div class="scene-measure-derived"><span>'+tx.derived+'</span><b>'+fmt(d)+'</b><small>'+tx.estimate+'</small></div>'+html}
    box.innerHTML=html;
  }
  function translate(){
    if(!E('sceneMeasureCard'))return;const x=t();
    E('sceneMeasureTitle').textContent=x.title;E('sceneMeasureIntro').textContent=x.intro;E('sceneMeasureTargetLabel').textContent=x.target;E('sceneMeasureHeightLabel').textContent=x.height;E('sceneMeasurePro').textContent=x.pro;E('sceneMeasureStart').textContent=stream?x.stop:x.web;E('sceneMeasureDo').textContent=x.measure;E('sceneMeasureClear').textContent=x.clear;E('sceneMeasureAngleLabel').textContent=x.angle;E('sceneMeasureDistanceLabel').textContent=x.distance;E('sceneMeasureMeasurementsTitle').textContent=x.measurements;E('sceneMeasureNote').textContent=x.note;
    const s=E('sceneMeasureTarget'),val=s.value;s.innerHTML='<option value="subject">'+x.subject+'</option><option value="wall">'+x.wall+'</option><option value="background">'+x.background+'</option>';s.value=val||'subject';renderMeasurements();estimate();
  }
  function init(){
    const planner=E('planner');if(!planner||E('sceneMeasureCard'))return false;
    const style=document.createElement('style');style.textContent='.scene-measure-card{overflow:hidden}.scene-measure-stage{position:relative;aspect-ratio:4/3;background:#0b0d10;border:1px solid #30343b;border-radius:14px;margin:12px 0;overflow:hidden}.scene-measure-stage video{width:100%;height:100%;object-fit:cover;display:none}.scene-measure-stage.live video{display:block}.scene-measure-placeholder{position:absolute;inset:0;display:grid;place-items:center;color:#707781;font-size:48px}.scene-measure-stage.live .scene-measure-placeholder{display:none}.scene-measure-cross{position:absolute;left:50%;top:50%;width:42px;height:42px;transform:translate(-50%,-50%);pointer-events:none}.scene-measure-cross:before,.scene-measure-cross:after{content:"";position:absolute;background:#f5c542;box-shadow:0 0 3px #000}.scene-measure-cross:before{left:20px;top:0;width:2px;height:42px}.scene-measure-cross:after{left:0;top:20px;width:42px;height:2px}.scene-measure-live{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.scene-measure-value{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px}.scene-measure-value small{display:block;color:#9299a3;margin-bottom:5px}.scene-measure-value b{font-size:22px;color:#f5c542}.scene-measure-status{font-size:12px;color:#9299a3;margin:8px 0 12px}.scene-measure-status.ok{color:#b8f0d1}.scene-measure-status.warn{color:#f5dd91}.scene-measure-row,.scene-measure-derived{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid #292d33}.scene-measure-row b,.scene-measure-derived b{color:#f5c542}.scene-measure-row button{border:0;background:transparent;color:#9299a3;font-size:20px}.scene-measure-method{display:inline-block;margin-left:7px;color:#9299a3;font-size:9px}.scene-measure-derived{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px;margin-bottom:8px}.scene-measure-derived small{color:#9299a3}.scene-measure-empty{color:#9299a3;font-size:12px;padding:8px 0}.scene-measure-note{color:#9299a3;font-size:12px;line-height:1.45;margin-top:10px}.scene-measure-pro{width:100%;margin-top:12px}';document.head.appendChild(style);
    const card=document.createElement('div');card.id='sceneMeasureCard';card.className='card scene-measure-card';card.innerHTML='<h2 id="sceneMeasureTitle" style="margin-top:0"></h2><p id="sceneMeasureIntro" class="muted small"></p><div class="row"><div><label id="sceneMeasureTargetLabel" class="caption"></label><select id="sceneMeasureTarget"><option value="subject"></option><option value="wall"></option><option value="background"></option></select></div><div><label id="sceneMeasureHeightLabel" class="caption"></label><input id="sceneMeasureHeight" type="number" min="0.3" max="3" step="0.01" value="1.50"></div></div><button id="sceneMeasurePro" class="btn primary scene-measure-pro" type="button"></button><div id="sceneMeasureStage" class="scene-measure-stage"><video id="sceneMeasureVideo" autoplay playsinline muted></video><div class="scene-measure-placeholder">📷</div><div class="scene-measure-cross"></div></div><div class="scene-measure-live"><div class="scene-measure-value"><small id="sceneMeasureAngleLabel"></small><b id="sceneMeasureAngle">—</b></div><div class="scene-measure-value"><small id="sceneMeasureDistanceLabel"></small><b id="sceneMeasureDistance">—</b></div></div><div id="sceneMeasureStatus" class="scene-measure-status"></div><div class="actions"><button id="sceneMeasureStart" class="btn secondary" type="button"></button><button id="sceneMeasureDo" class="btn secondary" type="button"></button></div><h3 id="sceneMeasureMeasurementsTitle" style="margin:18px 0 6px"></h3><div id="sceneMeasureList"></div><div class="actions"><button id="sceneMeasureClear" class="btn secondary" type="button"></button></div><div id="sceneMeasureNote" class="scene-measure-note"></div>';
    const api=E('apiStatus');if(api&&api.parentNode)api.parentNode.insertBefore(card,api.nextSibling);else planner.insertBefore(card,planner.firstChild);
    E('sceneMeasurePro').addEventListener('click',startPro);E('sceneMeasureStart').addEventListener('click',toggleWebCamera);E('sceneMeasureDo').addEventListener('click',addWebMeasurement);E('sceneMeasureClear').addEventListener('click',clearMeasurements);E('sceneMeasureHeight').addEventListener('input',estimate);
    E('sceneMeasureList').addEventListener('click',ev=>{const b=ev.target.closest('[data-del]');if(!b)return;measurements.splice(Number(b.dataset.del),1);save();renderMeasurements()});
    window.addEventListener('deviceorientation',onOrientation,true);
    window.LightingAISceneMeasureCameraPermission=function(ok){if(ok)openWebCamera();else setStatus(t().denied,'warn')};
    window.LightingAISceneMeasureNativeResult=function(target,distance,angle,height){
      if(Number.isFinite(Number(height)))E('sceneMeasureHeight').value=Number(height).toFixed(2);
      if(pushMeasurement(target,Number(distance),Number(angle),'native')){
        E('sceneMeasureTarget').value=target;
        E('sceneMeasureDistance').textContent=fmt(Number(distance));
        E('sceneMeasureAngle').textContent=Number.isFinite(Number(angle))?Number(angle).toFixed(1)+'°':'—';
        setStatus(t().proSaved,'ok');
      }
      const card=E('sceneMeasureCard');
      if(card)setTimeout(()=>card.scrollIntoView({behavior:'smooth',block:'start'}),120);
    };
    document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page&&b.dataset.page!=='planner')stopWebCamera(false)}));
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
    translate();setStatus(t().ready,'');return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();
