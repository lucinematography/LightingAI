(function(){
  'use strict';
  const KEY='lighting_scene_measurements_v1';
  const TXT={
    sr:{
      title:'📏 Merenje scene kamerom',
      intro:'Uperi centar kamere u mesto gde objekat dodiruje pod. LightingAI koristi visinu kamere i nagib telefona da proceni udaljenost.',
      target:'ŠTA MERIŠ',height:'VISINA KAMERE OD PODA',start:'POKRENI KAMERU',stop:'ZAUSTAVI KAMERU',measure:'IZMERI',clear:'OBRIŠI MERENJA',
      subject:'Kamera → glumac',wall:'Kamera → zid',background:'Kamera → pozadina',
      angle:'Nagib',distance:'Procena udaljenosti',ready:'Uperi krstić u tačku na podu i pritisni IZMERI.',
      needTilt:'Spusti kameru ka podu da bi procena bila moguća.',needSensor:'Senzor nagiba nije dostupan na ovom uređaju.',
      cameraStarting:'Pokrećem zadnju kameru…',cameraOn:'Kamera je spremna.',cameraOff:'Kamera je zaustavljena.',
      permission:'Odobri pristup kameri, pa će se pregled automatski pokrenuti.',denied:'Pristup kameri nije odobren.',
      unavailable:'Pregled uživo nije dostupan na ovom telefonu/WebView-u. Ostale funkcije aplikacije nisu promenjene.',
      measurements:'Sačuvana merenja',none:'Još nema sačuvanih merenja.',derived:'Glumac → pozadina',estimate:'PROCENA',note:'Ovo je praktična procena, ne geodetsko merenje. Najbolji rezultat dobijaš kada je telefon uspravno u portret režimu i kada ciljaš tačku dodira sa podom.'
    },
    en:{
      title:'📏 Camera Scene Measurement',
      intro:'Aim the camera center at the point where the object meets the floor. LightingAI uses camera height and phone tilt to estimate distance.',
      target:'WHAT ARE YOU MEASURING',height:'CAMERA HEIGHT ABOVE FLOOR',start:'START CAMERA',stop:'STOP CAMERA',measure:'MEASURE',clear:'CLEAR MEASUREMENTS',
      subject:'Camera → subject',wall:'Camera → wall',background:'Camera → background',
      angle:'Tilt',distance:'Estimated distance',ready:'Aim the crosshair at the floor contact point and tap MEASURE.',
      needTilt:'Tilt the camera down toward the floor to calculate distance.',needSensor:'Tilt sensor is unavailable on this device.',
      cameraStarting:'Starting rear camera…',cameraOn:'Camera ready.',cameraOff:'Camera stopped.',
      permission:'Allow camera access and the preview will start automatically.',denied:'Camera access was not granted.',
      unavailable:'Live preview is unavailable on this phone/WebView. Other app functions are unchanged.',
      measurements:'Saved measurements',none:'No saved measurements yet.',derived:'Subject → background',estimate:'ESTIMATE',note:'This is a practical estimate, not survey-grade measurement. Best results come with the phone upright in portrait and the crosshair aimed at the floor contact point.'
    }
  };
  const E=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  let stream=null, betaSmooth=null, currentDistance=null, sensorSeen=false;
  let measurements=read();
  function read(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
  function save(){localStorage.setItem(KEY,JSON.stringify(measurements))}
  function fmt(v){return Number(v).toFixed(2).replace('.',lang()==='sr'?',':'.')+' m'}
  function setStatus(text,kind){const s=E('sceneMeasureStatus');if(!s)return;s.textContent=text;s.className='scene-measure-status '+(kind||'')}
  function targetLabel(key){const x=t();return key==='subject'?x.subject:key==='wall'?x.wall:x.background}
  function estimate(){
    const h=Number(E('sceneMeasureHeight')?.value||0);
    const dep=betaSmooth===null?null:90-betaSmooth;
    const angle=E('sceneMeasureAngle'), dist=E('sceneMeasureDistance');
    if(angle)angle.textContent=dep===null?'—':Math.max(0,dep).toFixed(1)+'°';
    if(dep===null||!Number.isFinite(dep)){currentDistance=null;if(dist)dist.textContent='—';return}
    if(dep<2||dep>80||!Number.isFinite(h)||h<=0){currentDistance=null;if(dist)dist.textContent='—';setStatus(t().needTilt,'warn');return}
    currentDistance=h/Math.tan(dep*Math.PI/180);
    if(!Number.isFinite(currentDistance)||currentDistance<=0||currentDistance>100){currentDistance=null;if(dist)dist.textContent='—';return}
    if(dist)dist.textContent=fmt(currentDistance);
    setStatus(t().ready,'ok');
  }
  function onOrientation(ev){
    if(typeof ev.beta!=='number'||!Number.isFinite(ev.beta))return;
    sensorSeen=true;
    betaSmooth=betaSmooth===null?ev.beta:(betaSmooth*0.82+ev.beta*0.18);
    estimate();
  }
  async function openCamera(){
    try{
      setStatus(t().cameraStarting,'');
      if(window.Android&&typeof Android.hasCameraPermission==='function'&&!Android.hasCameraPermission()){
        setStatus(t().permission,'warn');
        if(typeof Android.requestCameraPermission==='function')Android.requestCameraPermission();
        return;
      }
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('mediaDevices');
      stopCamera(false);
      stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
      const v=E('sceneMeasureVideo');v.srcObject=stream;v.play().catch(()=>{});
      E('sceneMeasureStage').classList.add('live');
      E('sceneMeasureStart').textContent=t().stop;
      setStatus(t().cameraOn,'ok');
    }catch(e){setStatus(t().unavailable,'warn');stopCamera(false)}
  }
  function stopCamera(showStatus=true){
    if(stream){stream.getTracks().forEach(x=>x.stop());stream=null}
    const v=E('sceneMeasureVideo');if(v)v.srcObject=null;
    E('sceneMeasureStage')?.classList.remove('live');
    if(E('sceneMeasureStart'))E('sceneMeasureStart').textContent=t().start;
    if(showStatus)setStatus(t().cameraOff,'');
  }
  function toggleCamera(){if(stream)stopCamera();else openCamera()}
  function addMeasurement(){
    estimate();
    if(currentDistance===null){setStatus(sensorSeen?t().needTilt:t().needSensor,'warn');return}
    const key=E('sceneMeasureTarget').value;
    measurements.unshift({target:key,distance:Number(currentDistance.toFixed(3)),time:Date.now()});
    measurements=measurements.slice(0,12);save();renderMeasurements();
  }
  function clearMeasurements(){measurements=[];save();renderMeasurements()}
  function renderMeasurements(){
    const box=E('sceneMeasureList');if(!box)return;const tx=t();
    if(!measurements.length){box.innerHTML='<div class="scene-measure-empty">'+tx.none+'</div>';return}
    let html=measurements.map((m,i)=>'<div class="scene-measure-row"><span>'+targetLabel(m.target)+'</span><b>'+fmt(m.distance)+'</b><button type="button" data-del="'+i+'">×</button></div>').join('');
    const subject=measurements.find(x=>x.target==='subject');
    const bg=measurements.find(x=>x.target==='background');
    if(subject&&bg){const d=Math.abs(bg.distance-subject.distance);html='<div class="scene-measure-derived"><span>'+tx.derived+'</span><b>'+fmt(d)+'</b><small>'+tx.estimate+'</small></div>'+html}
    box.innerHTML=html;
  }
  function translate(){
    if(!E('sceneMeasureCard'))return;const x=t();
    E('sceneMeasureTitle').textContent=x.title;E('sceneMeasureIntro').textContent=x.intro;E('sceneMeasureTargetLabel').textContent=x.target;E('sceneMeasureHeightLabel').textContent=x.height;
    E('sceneMeasureStart').textContent=stream?x.stop:x.start;E('sceneMeasureDo').textContent=x.measure;E('sceneMeasureClear').textContent=x.clear;
    E('sceneMeasureAngleLabel').textContent=x.angle;E('sceneMeasureDistanceLabel').textContent=x.distance;E('sceneMeasureMeasurementsTitle').textContent=x.measurements;E('sceneMeasureNote').textContent=x.note;
    const s=E('sceneMeasureTarget'),val=s.value;s.innerHTML='<option value="subject">'+x.subject+'</option><option value="wall">'+x.wall+'</option><option value="background">'+x.background+'</option>';s.value=val||'subject';renderMeasurements();estimate();
  }
  function init(){
    const planner=E('planner');if(!planner||E('sceneMeasureCard'))return false;
    const style=document.createElement('style');style.textContent='.scene-measure-card{overflow:hidden}.scene-measure-stage{position:relative;aspect-ratio:4/3;background:#0b0d10;border:1px solid #30343b;border-radius:14px;margin:12px 0;overflow:hidden}.scene-measure-stage video{width:100%;height:100%;object-fit:cover;display:none}.scene-measure-stage.live video{display:block}.scene-measure-placeholder{position:absolute;inset:0;display:grid;place-items:center;color:#707781;font-size:48px}.scene-measure-stage.live .scene-measure-placeholder{display:none}.scene-measure-cross{position:absolute;left:50%;top:50%;width:42px;height:42px;transform:translate(-50%,-50%);pointer-events:none}.scene-measure-cross:before,.scene-measure-cross:after{content:"";position:absolute;background:#f5c542;box-shadow:0 0 3px #000}.scene-measure-cross:before{left:20px;top:0;width:2px;height:42px}.scene-measure-cross:after{left:0;top:20px;width:42px;height:2px}.scene-measure-live{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.scene-measure-value{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px}.scene-measure-value small{display:block;color:#9299a3;margin-bottom:5px}.scene-measure-value b{font-size:22px;color:#f5c542}.scene-measure-status{font-size:12px;color:#9299a3;margin:8px 0 12px}.scene-measure-status.ok{color:#b8f0d1}.scene-measure-status.warn{color:#f5dd91}.scene-measure-row,.scene-measure-derived{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid #292d33}.scene-measure-row b,.scene-measure-derived b{color:#f5c542}.scene-measure-row button{border:0;background:transparent;color:#9299a3;font-size:20px}.scene-measure-derived{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px;margin-bottom:8px}.scene-measure-derived small{color:#9299a3}.scene-measure-empty{color:#9299a3;font-size:12px;padding:8px 0}.scene-measure-note{color:#9299a3;font-size:12px;line-height:1.45;margin-top:10px}';document.head.appendChild(style);
    const card=document.createElement('div');card.id='sceneMeasureCard';card.className='card scene-measure-card';card.innerHTML='<h2 id="sceneMeasureTitle" style="margin-top:0"></h2><p id="sceneMeasureIntro" class="muted small"></p><div class="row"><div><label id="sceneMeasureTargetLabel" class="caption"></label><select id="sceneMeasureTarget"><option value="subject"></option><option value="wall"></option><option value="background"></option></select></div><div><label id="sceneMeasureHeightLabel" class="caption"></label><input id="sceneMeasureHeight" type="number" min="0.3" max="3" step="0.01" value="1.50"></div></div><div id="sceneMeasureStage" class="scene-measure-stage"><video id="sceneMeasureVideo" autoplay playsinline muted></video><div class="scene-measure-placeholder">📷</div><div class="scene-measure-cross"></div></div><div class="scene-measure-live"><div class="scene-measure-value"><small id="sceneMeasureAngleLabel"></small><b id="sceneMeasureAngle">—</b></div><div class="scene-measure-value"><small id="sceneMeasureDistanceLabel"></small><b id="sceneMeasureDistance">—</b></div></div><div id="sceneMeasureStatus" class="scene-measure-status"></div><div class="actions"><button id="sceneMeasureStart" class="btn secondary" type="button"></button><button id="sceneMeasureDo" class="btn primary" type="button"></button></div><h3 id="sceneMeasureMeasurementsTitle" style="margin:18px 0 6px"></h3><div id="sceneMeasureList"></div><div class="actions"><button id="sceneMeasureClear" class="btn secondary" type="button"></button></div><div id="sceneMeasureNote" class="scene-measure-note"></div>';
    const api=E('apiStatus');if(api&&api.parentNode)api.parentNode.insertBefore(card,api.nextSibling);else planner.insertBefore(card,planner.firstChild);
    E('sceneMeasureStart').addEventListener('click',toggleCamera);E('sceneMeasureDo').addEventListener('click',addMeasurement);E('sceneMeasureClear').addEventListener('click',clearMeasurements);E('sceneMeasureHeight').addEventListener('input',estimate);
    E('sceneMeasureList').addEventListener('click',ev=>{const b=ev.target.closest('[data-del]');if(!b)return;measurements.splice(Number(b.dataset.del),1);save();renderMeasurements()});
    window.addEventListener('deviceorientation',onOrientation,true);
    window.LightingAISceneMeasureCameraPermission=function(ok){if(ok)openCamera();else setStatus(t().denied,'warn')};
    document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page&&b.dataset.page!=='planner')stopCamera(false)}));
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
    translate();setStatus(sensorSeen?t().ready:t().needSensor,'');setTimeout(()=>{if(!sensorSeen)setStatus(t().needSensor,'warn')},1800);return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();
