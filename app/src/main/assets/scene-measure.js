(function(){
  'use strict';
  const KEY='lighting_scene_measurements_v1';
  const SETTINGS='lighting_scene_measure_settings_v2';
  const TXT={
    sr:{
      title:'📏 Merenje scene kamerom',
      intro:'Uperi centar kamere u mesto gde objekat dodiruje pod. LightingAI koristi visinu kamere i nagib telefona da proceni udaljenost.',
      target:'ŠTA MERIŠ',height:'VISINA KAMERE OD PODA',start:'POKRENI KAMERU',stop:'ZAUSTAVI KAMERU',measure:'IZMERI',clear:'OBRIŠI MERENJA',
      subject:'Kamera → glumac',wall:'Kamera → zid',background:'Kamera → pozadina',
      angle:'Nagib nadole',distance:'Procena udaljenosti',ready:'Uperi krstić u tačku na podu i pritisni IZMERI.',
      needTilt:'Spusti kameru ka podu da bi procena bila moguća.',needSensor:'Senzor nagiba nije dostupan. Uključi ručni ugao.',
      cameraStarting:'Pokrećem zadnju kameru…',cameraOn:'Kamera je spremna.',cameraOff:'Kamera je zaustavljena.',
      permission:'Odobri pristup kameri, pa će se pregled automatski pokrenuti.',denied:'Pristup kameri nije odobren.',
      unavailable:'Pregled uživo nije dostupan na ovom telefonu/WebView-u. Ostale funkcije aplikacije nisu promenjene.',
      measurements:'Sačuvana merenja',none:'Još nema sačuvanih merenja.',derived:'Glumac → pozadina',estimate:'PROCENA',
      calibrate:'KALIBRIŠI HORIZONT',resetCal:'RESET KALIBRACIJE',calHelp:'Za kalibraciju drži telefon uspravno i uperi kameru pravo, bez nagiba gore/dole, pa dodirni KALIBRIŠI HORIZONT.',calDone:'Horizont je kalibrisan.',
      manualOn:'RUČNI UGAO',manualOff:'KORISTI SENZOR',manualLabel:'RUČNI NAGIB NADOLE',sensorMode:'SENZOR',manualMode:'RUČNO',
      stability:'Stabilnost',stable:'STABILNO',good:'DOBRO',hold:'DRŽI MIRNO',noSignal:'NEMA SIGNALA',
      note:'Ovo je praktična procena, ne geodetsko merenje. Najbolji rezultat dobijaš kada je telefon uspravno u portret režimu, kamera je kalibrisana i krstić cilja tačku dodira sa podom.'
    },
    en:{
      title:'📏 Camera Scene Measurement',
      intro:'Aim the camera center at the point where the object meets the floor. LightingAI uses camera height and phone tilt to estimate distance.',
      target:'WHAT ARE YOU MEASURING',height:'CAMERA HEIGHT ABOVE FLOOR',start:'START CAMERA',stop:'STOP CAMERA',measure:'MEASURE',clear:'CLEAR MEASUREMENTS',
      subject:'Camera → subject',wall:'Camera → wall',background:'Camera → background',
      angle:'Downward tilt',distance:'Estimated distance',ready:'Aim the crosshair at the floor contact point and tap MEASURE.',
      needTilt:'Tilt the camera down toward the floor to calculate distance.',needSensor:'Tilt sensor is unavailable. Switch to manual angle.',
      cameraStarting:'Starting rear camera…',cameraOn:'Camera ready.',cameraOff:'Camera stopped.',
      permission:'Allow camera access and the preview will start automatically.',denied:'Camera access was not granted.',
      unavailable:'Live preview is unavailable on this phone/WebView. Other app functions are unchanged.',
      measurements:'Saved measurements',none:'No saved measurements yet.',derived:'Subject → background',estimate:'ESTIMATE',
      calibrate:'CALIBRATE HORIZON',resetCal:'RESET CALIBRATION',calHelp:'For calibration hold the phone upright and aim the camera straight ahead with no up/down tilt, then tap CALIBRATE HORIZON.',calDone:'Horizon calibrated.',
      manualOn:'MANUAL ANGLE',manualOff:'USE SENSOR',manualLabel:'MANUAL DOWNWARD TILT',sensorMode:'SENSOR',manualMode:'MANUAL',
      stability:'Stability',stable:'STABLE',good:'GOOD',hold:'HOLD STILL',noSignal:'NO SIGNAL',
      note:'This is a practical estimate, not survey-grade measurement. Best results come with the phone upright in portrait, the camera calibrated, and the crosshair aimed at the floor contact point.'
    }
  };
  const E=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('lighting_language_v1')==='en'?'en':'sr';
  const t=()=>TXT[lang()];
  let stream=null,betaSmooth=null,currentDistance=null,sensorSeen=false,manualMode=false,angleHistory=[];
  let measurements=read();
  let settings=readSettings();
  function read(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
  function save(){localStorage.setItem(KEY,JSON.stringify(measurements))}
  function readSettings(){try{return Object.assign({height:1.50,horizonBeta:90,manualAngle:15},JSON.parse(localStorage.getItem(SETTINGS))||{})}catch(e){return{height:1.50,horizonBeta:90,manualAngle:15}}}
  function saveSettings(){localStorage.setItem(SETTINGS,JSON.stringify(settings))}
  function fmt(v){return Number(v).toFixed(2).replace('.',lang()==='sr'?',':'.')+' m'}
  function setStatus(text,kind){const s=E('sceneMeasureStatus');if(!s)return;s.textContent=text;s.className='scene-measure-status '+(kind||'')}
  function targetLabel(key){const x=t();return key==='subject'?x.subject:key==='wall'?x.wall:x.background}
  function currentAngle(){
    if(manualMode){const v=Number(E('sceneMeasureManualAngle')?.value);return Number.isFinite(v)?v:null}
    if(betaSmooth===null)return null;
    return settings.horizonBeta-betaSmooth;
  }
  function stability(){
    if(manualMode)return {key:'stable',spread:0};
    if(angleHistory.length<5)return {key:'noSignal',spread:null};
    const min=Math.min(...angleHistory),max=Math.max(...angleHistory),spread=max-min;
    if(spread<=0.8)return {key:'stable',spread};
    if(spread<=1.8)return {key:'good',spread};
    return {key:'hold',spread};
  }
  function renderStability(){
    const box=E('sceneMeasureStability');if(!box)return;const x=t(),q=stability();
    box.textContent=x[q.key]+(q.spread===null?'':' · ±'+(q.spread/2).toFixed(1)+'°');
    box.dataset.q=q.key;
    E('sceneMeasureMode').textContent=manualMode?x.manualMode:x.sensorMode;
  }
  function estimate(){
    const h=Number(E('sceneMeasureHeight')?.value||0);
    const dep=currentAngle();
    const angle=E('sceneMeasureAngle'),dist=E('sceneMeasureDistance');
    if(angle)angle.textContent=dep===null?'—':Math.max(0,dep).toFixed(1)+'°';
    renderStability();
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
    betaSmooth=betaSmooth===null?ev.beta:(betaSmooth*0.86+ev.beta*0.14);
    const dep=settings.horizonBeta-betaSmooth;
    angleHistory.push(dep);if(angleHistory.length>14)angleHistory.shift();
    if(!manualMode)estimate();
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
    if(currentDistance===null){setStatus((!manualMode&&!sensorSeen)?t().needSensor:t().needTilt,'warn');return}
    const key=E('sceneMeasureTarget').value,q=stability();
    measurements.unshift({target:key,distance:Number(currentDistance.toFixed(3)),angle:Number(currentAngle().toFixed(2)),quality:q.key,time:Date.now()});
    measurements=measurements.slice(0,12);save();renderMeasurements();
  }
  function clearMeasurements(){measurements=[];save();renderMeasurements()}
  function calibrate(){
    if(betaSmooth===null){setStatus(t().needSensor,'warn');return}
    settings.horizonBeta=betaSmooth;saveSettings();angleHistory=[];setStatus(t().calDone,'ok');estimate();
  }
  function resetCalibration(){settings.horizonBeta=90;saveSettings();angleHistory=[];estimate()}
  function toggleManual(){
    manualMode=!manualMode;E('sceneMeasureManualWrap').hidden=!manualMode;E('sceneMeasureManualToggle').textContent=manualMode?t().manualOff:t().manualOn;angleHistory=[];estimate();
  }
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
    E('sceneMeasureCalibrate').textContent=x.calibrate;E('sceneMeasureResetCal').textContent=x.resetCal;E('sceneMeasureCalHelp').textContent=x.calHelp;E('sceneMeasureManualToggle').textContent=manualMode?x.manualOff:x.manualOn;E('sceneMeasureManualLabel').textContent=x.manualLabel;E('sceneMeasureStabilityLabel').textContent=x.stability;
    const s=E('sceneMeasureTarget'),val=s.value;s.innerHTML='<option value="subject">'+x.subject+'</option><option value="wall">'+x.wall+'</option><option value="background">'+x.background+'</option>';s.value=val||'subject';renderMeasurements();estimate();
  }
  function init(){
    const planner=E('planner');if(!planner||E('sceneMeasureCard'))return false;
    const style=document.createElement('style');style.textContent='.scene-measure-card{overflow:hidden}.scene-measure-stage{position:relative;aspect-ratio:4/3;background:#0b0d10;border:1px solid #30343b;border-radius:14px;margin:12px 0;overflow:hidden}.scene-measure-stage video{width:100%;height:100%;object-fit:cover;display:none}.scene-measure-stage.live video{display:block}.scene-measure-placeholder{position:absolute;inset:0;display:grid;place-items:center;color:#707781;font-size:48px}.scene-measure-stage.live .scene-measure-placeholder{display:none}.scene-measure-cross{position:absolute;left:50%;top:50%;width:42px;height:42px;transform:translate(-50%,-50%);pointer-events:none}.scene-measure-cross:before,.scene-measure-cross:after{content:"";position:absolute;background:#f5c542;box-shadow:0 0 3px #000}.scene-measure-cross:before{left:20px;top:0;width:2px;height:42px}.scene-measure-cross:after{left:0;top:20px;width:42px;height:2px}.scene-measure-live{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.scene-measure-value{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px}.scene-measure-value small{display:block;color:#9299a3;margin-bottom:5px}.scene-measure-value b{font-size:22px;color:#f5c542}.scene-measure-status{font-size:12px;color:#9299a3;margin:8px 0 12px}.scene-measure-status.ok{color:#b8f0d1}.scene-measure-status.warn{color:#f5dd91}.scene-measure-tools{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.scene-measure-tools .btn{width:100%;font-size:11px}.scene-measure-cal-help{color:#9299a3;font-size:11px;line-height:1.4;margin:6px 0 10px}.scene-measure-modebar{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;margin:8px 0}.scene-measure-mode{font-size:11px;color:#f5c542;font-weight:800}.scene-measure-stability{font-size:11px;text-align:right;font-weight:800}.scene-measure-stability[data-q="stable"]{color:#b8f0d1}.scene-measure-stability[data-q="good"]{color:#f5dd91}.scene-measure-stability[data-q="hold"],.scene-measure-stability[data-q="noSignal"]{color:#ffb5b5}.scene-measure-manual{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:10px;margin:8px 0}.scene-measure-row,.scene-measure-derived{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid #292d33}.scene-measure-row b,.scene-measure-derived b{color:#f5c542}.scene-measure-row button{border:0;background:transparent;color:#9299a3;font-size:20px}.scene-measure-derived{background:#0f1115;border:1px solid #30343b;border-radius:12px;padding:12px;margin-bottom:8px}.scene-measure-derived small{color:#9299a3}.scene-measure-empty{color:#9299a3;font-size:12px;padding:8px 0}.scene-measure-note{color:#9299a3;font-size:12px;line-height:1.45;margin-top:10px}';document.head.appendChild(style);
    const card=document.createElement('div');card.id='sceneMeasureCard';card.className='card scene-measure-card';card.innerHTML='<h2 id="sceneMeasureTitle" style="margin-top:0"></h2><p id="sceneMeasureIntro" class="muted small"></p><div class="row"><div><label id="sceneMeasureTargetLabel" class="caption"></label><select id="sceneMeasureTarget"><option value="subject"></option><option value="wall"></option><option value="background"></option></select></div><div><label id="sceneMeasureHeightLabel" class="caption"></label><input id="sceneMeasureHeight" type="number" min="0.3" max="3" step="0.01"></div></div><div id="sceneMeasureStage" class="scene-measure-stage"><video id="sceneMeasureVideo" autoplay playsinline muted></video><div class="scene-measure-placeholder">📷</div><div class="scene-measure-cross"></div></div><div class="scene-measure-live"><div class="scene-measure-value"><small id="sceneMeasureAngleLabel"></small><b id="sceneMeasureAngle">—</b></div><div class="scene-measure-value"><small id="sceneMeasureDistanceLabel"></small><b id="sceneMeasureDistance">—</b></div></div><div class="scene-measure-modebar"><span id="sceneMeasureMode" class="scene-measure-mode"></span><span id="sceneMeasureStabilityLabel" class="muted small"></span><span id="sceneMeasureStability" class="scene-measure-stability"></span></div><div id="sceneMeasureStatus" class="scene-measure-status"></div><div class="actions"><button id="sceneMeasureStart" class="btn secondary" type="button"></button><button id="sceneMeasureDo" class="btn primary" type="button"></button></div><div class="scene-measure-tools"><button id="sceneMeasureCalibrate" class="btn secondary" type="button"></button><button id="sceneMeasureResetCal" class="btn secondary" type="button"></button></div><div id="sceneMeasureCalHelp" class="scene-measure-cal-help"></div><div class="actions"><button id="sceneMeasureManualToggle" class="btn secondary" type="button"></button></div><div id="sceneMeasureManualWrap" class="scene-measure-manual" hidden><label id="sceneMeasureManualLabel" class="caption"></label><input id="sceneMeasureManualAngle" type="number" min="2" max="80" step="0.1"></div><h3 id="sceneMeasureMeasurementsTitle" style="margin:18px 0 6px"></h3><div id="sceneMeasureList"></div><div class="actions"><button id="sceneMeasureClear" class="btn secondary" type="button"></button></div><div id="sceneMeasureNote" class="scene-measure-note"></div>';
    const api=E('apiStatus');if(api&&api.parentNode)api.parentNode.insertBefore(card,api.nextSibling);else planner.insertBefore(card,planner.firstChild);
    E('sceneMeasureHeight').value=Number(settings.height||1.5).toFixed(2);E('sceneMeasureManualAngle').value=Number(settings.manualAngle||15).toFixed(1);
    E('sceneMeasureStart').addEventListener('click',toggleCamera);E('sceneMeasureDo').addEventListener('click',addMeasurement);E('sceneMeasureClear').addEventListener('click',clearMeasurements);E('sceneMeasureCalibrate').addEventListener('click',calibrate);E('sceneMeasureResetCal').addEventListener('click',resetCalibration);E('sceneMeasureManualToggle').addEventListener('click',toggleManual);
    E('sceneMeasureHeight').addEventListener('input',()=>{settings.height=Number(E('sceneMeasureHeight').value)||1.5;saveSettings();estimate()});E('sceneMeasureManualAngle').addEventListener('input',()=>{settings.manualAngle=Number(E('sceneMeasureManualAngle').value)||15;saveSettings();estimate()});
    E('sceneMeasureList').addEventListener('click',ev=>{const b=ev.target.closest('[data-del]');if(!b)return;measurements.splice(Number(b.dataset.del),1);save();renderMeasurements()});
    window.addEventListener('deviceorientation',onOrientation,true);
    window.LightingAISceneMeasureCameraPermission=function(ok){if(ok)openCamera();else setStatus(t().denied,'warn')};
    document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page&&b.dataset.page!=='planner')stopCamera(false)}));
    const old=window.setLanguage;if(typeof old==='function'){window.setLanguage=function(l){old(l);setTimeout(translate,0)}}
    translate();setStatus(t().needSensor,'');setTimeout(()=>{if(!sensorSeen&&!manualMode){manualMode=true;E('sceneMeasureManualWrap').hidden=false;E('sceneMeasureManualToggle').textContent=t().manualOff;setStatus(t().needSensor,'warn');estimate()}},1800);return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>100)clearInterval(timer)},100);
})();
