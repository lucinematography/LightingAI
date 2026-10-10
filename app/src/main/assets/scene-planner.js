(function () {
  'use strict';
  var MODULE='lightingai-scene-planner-overlay';
  var ENTRY='lightingai-scene-planner-entry';
  var API='https://lightingai.onrender.com';
  var STORE='lighting_scene_planner_last_v1';
  var REVISION_STORE='lighting_scene_planner_revisions_v1';
  var revisions=[],sceneId=null,historyBlocked=false;
  var VIDEO_RECEIPT='lighting_scene_planner_video_receipt_v1';
  var videoReceipt=null,videoReceiptBlocked=false;
  var state={photo:'',frames:[],videoUrl:'',plan:null,aiPreview:'',busy:false,videoBusy:false,abort:null,videoFile:null,exportedVideo:null,aiStoryboard:[],aiVideoTaskId:null,aiVideoAvailable:false,aiVideoPreviewUrl:null,videoDurationSec:null,aiVideoPending:null,aiVideoCompletedPlan:null};
  function el(id){return document.getElementById(id);}
  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function locale(){return window.currentLang==='en'?'en':'sr';}
  function text(sr,en){return locale()==='sr'?sr:en;}
  function core(){return window.LightingAIScenePlannerCore;}
  function status(message,error){
    var node=el('sp-status');if(!node)return;
    node.textContent=message||'';
    node.style.color=error?'#ffd1c7':'#c2e8cc';
  }
  function inventory(){
    if(Array.isArray(window.equipment))return window.equipment.slice();
    try{var value=JSON.parse(localStorage.getItem('lighting_equipment_v1')||'[]');return Array.isArray(value)?value:[];}
    catch(e){return[];}
  }
  function loadCore(next){
    if(core()){next();return;}
    var script=el('lightingai-scene-planner-core-loader');
    if(!script){
      script=document.createElement('script');script.id='lightingai-scene-planner-core-loader';
      script.src='file:///android_asset/scene-planner-core.js';
      document.body.appendChild(script);
    }
    script.addEventListener('load',next,{once:true});
    script.addEventListener('error',function(){status('Nije moguće učitati model Scene Planner-a.',true);},{once:true});
  }
  function installEntry(){
    var page=el('aiContent');
    if(!page||el(ENTRY))return;
    var card=document.createElement('div');card.id=ENTRY;card.className='card';
    card.style.cssText='border:1px solid #7f6425;background:linear-gradient(135deg,#23221c,#131619);padding:16px;margin:12px 0';
    card.innerHTML='<div style="font-weight:900;color:#f5c542;font-size:19px">🎬 AI SCENE PLANNER</div>'+
      '<p class="muted small" style="line-height:1.55">Fotografija ili video kretanja • glasovni ili tekstualni opis • plan rasvete • 2D light plot.</p>'+
      '<button type="button" class="btn primary" id="sp-open" style="width:100%;padding:15px;font-weight:900">OTVORI AI SCENE PLANNER</button>';
    page.insertBefore(card,page.firstChild);
    el('sp-open').addEventListener('click',open);
  }
  function load(){
    var tries=0;installEntry();
    var timer=setInterval(function(){installEntry();if(el(ENTRY)||++tries>=60)clearInterval(timer);},180);
    var previousBack=window.LightingAIHandleBack;
    window.LightingAIHandleBack=function(){
      if(closeIfOpen())return true;
      return typeof previousBack==='function' ? previousBack() : false;
    };
    var oldVoice=window.LightingAIVoiceInputResult;
    window.LightingAIVoiceInputResult=function(target,spoken){
      if(target!=='sp-description'){if(typeof oldVoice==='function')oldVoice(target,spoken);return;}
      var field=el('sp-description');if(!field)return;
      var value=String(spoken||'').trim();
      if(!value){status('Nije prepoznat govor.',true);return;}
      field.value=(field.value.trim()?field.value.trim()+' ':'')+value;
      status('Glasovni opis je dodat.');
    };
    var oldVoiceError=window.LightingAIVoiceInputError;
    window.LightingAIVoiceInputError=function(target,error){
      if(target!=='sp-description'){if(typeof oldVoiceError==='function')oldVoiceError(target,error);return;}
      status(error==='cancelled'?'Glasovni unos otkazan.':'Glasovni unos nije uspeo; pokušaj ponovo.',error!=='cancelled');
    };
  }
  function open(){
    if(el(MODULE))return;
    var wrap=document.createElement('div');wrap.id=MODULE;
    wrap.innerHTML='<style>'+
      '#'+MODULE+'{position:fixed;inset:0;z-index:10030;background:#0c1016;overflow:auto;color:#f2f2f2;font-family:system-ui,sans-serif}'+
      '#'+MODULE+' *{box-sizing:border-box}'+
      '#'+MODULE+' .sp-wrap{max-width:980px;margin:auto;padding:18px 14px 92px}'+
      '#'+MODULE+' .sp-card{border:1px solid #323944;border-radius:14px;padding:15px;margin-top:13px;background:#161c25}'+
      '#'+MODULE+' .sp-h{margin:0 0 12px;color:#f5c542;font-weight:900;font-size:15px}'+
      '#'+MODULE+' .sp-actions{display:flex;gap:8px;flex-wrap:wrap}'+
      '#'+MODULE+' .sp-btn{background:#282f3b;border:1px solid #4b5667;border-radius:10px;color:#fff;padding:12px 14px;min-height:44px;font-weight:800;flex:1;cursor:pointer}'+
      '#'+MODULE+' .sp-primary{background:#e6b93c;color:#10131a;border-color:#e6b93c}'+
      '#'+MODULE+' .sp-btn:disabled{opacity:.48;cursor:not-allowed}'+
      '#'+MODULE+' .sp-field{width:100%;background:#0f141d;color:#fff;border:1px solid #596173;padding:11px;border-radius:10px;font-size:15px}'+
      '#'+MODULE+' label{display:block;color:#bac4d1;font-size:12px;margin:8px 0 6px;font-weight:750}'+
      '#'+MODULE+' .sp-note{color:#a9b4c2;font-size:12px;line-height:1.5}'+
      '#'+MODULE+' .sp-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px}'+
      '#'+MODULE+' .sp-meters{display:grid;grid-template-columns:1fr 1fr;gap:10px}'+
      '#'+MODULE+' .sp-media{max-width:100%;max-height:300px;object-fit:contain;display:block;margin:10px auto;border-radius:10px}'+
      '#'+MODULE+' [hidden]{display:none!important}'+
      '#'+MODULE+' .sp-lamp{background:#10151d;border:1px solid #353f4e;border-radius:11px;padding:12px;margin-top:9px}'+
      '#'+MODULE+' .sp-pill{font-size:11px;color:#f2c75e;border:1px solid #65562d;border-radius:99px;padding:3px 8px}'+
      '</style>'+
      '<div class="sp-wrap"><header style="display:flex;justify-content:space-between;gap:10px;align-items:start">'+
      '<div><div style="font-size:11px;letter-spacing:.12em;color:#c9a54b">LIGHTINGAI / FILMSKA RASVETA</div>'+
      '<h1 style="color:#f5c542;margin:5px 0 3px;font-size:25px">AI SCENE PLANNER</h1>'+
      '<div class="sp-note">Virtual Prelight / Previz — kreativno planiranje, bez upravljanja lampama</div></div>'+
      '<button type="button" id="sp-close" class="sp-btn" style="flex:none">ZATVORI ✕</button></header>'+
      '<div class="sp-card"><h2 class="sp-h">1 / SNIMI ILI DODAJ PROSTOR I KRETANJE</h2>'+
      '<div class="sp-two"><div><label>FOTOGRAFIJA PROSTORA / KADRA</label>'+
      '<div class="sp-actions"><button type="button" class="sp-btn" id="sp-gallery-btn">DODAJ FOTOGRAFIJU</button>'+
      '<button type="button" class="sp-btn" id="sp-camera-btn">FOTOGRAFIŠI</button></div>'+
      '<input type="file" id="sp-gallery" accept="image/*" hidden>'+
      '<input type="file" id="sp-camera" accept="image/*" capture="environment" hidden>'+
      '<img id="sp-image" class="sp-media" alt="Fotografija scene" hidden></div>'+
      '<div><label>VIDEO GLUMCA / KRETANJA KROZ KADAR</label>'+
      '<div class="sp-actions"><button type="button" class="sp-btn" id="sp-video-btn">DODAJ VIDEO</button>'+
      '<button type="button" class="sp-btn" id="sp-record-btn">SNIMI VIDEO</button></div>'+
      '<input type="file" id="sp-video-input" accept="video/*" hidden>'+
      '<input type="file" id="sp-record-input" accept="video/*" capture="environment" hidden>'+
      '<video id="sp-video" class="sp-media" playsinline controls preload="metadata" hidden></video>'+
      '<div id="sp-video-note" class="sp-note">Do 120 sekundi. AI dobija do 6 vremenski označenih kadrova, ne ceo video.</div></div></div></div>'+
      '<div class="sp-card"><h2 class="sp-h">2 / OPIŠI SCENU I ODABERI REŽIM</h2>'+
      '<label>TEKST ILI GLASOVNI OPIS SCENE</label>'+
      '<textarea class="sp-field" id="sp-description" rows="4" placeholder="Primer: Žena ide od ograde do drveta, noć, hladna mesečina, sekirom udara drvo. Kamera prati sa leve strane."></textarea>'+
      '<div class="sp-actions" style="margin-top:8px"><button type="button" class="sp-btn" id="sp-voice">🎤 GOVORI OPIS SCENE</button></div>'+
      '<div class="sp-two"><div><label>SNIMLJENO OSVETLJENJE</label>'+
      '<select id="sp-capture" class="sp-field"><option value="day">Snimljeno po danu</option><option value="night">Snimljeno po noći</option><option value="unknown">Nije poznato</option></select></div>'+
      '<div><label>KAMERA I KRETANJE KADRA</label><input id="sp-shot-camera" class="sp-field" placeholder="Statična kamera / kamera prati glumicu"></div></div>'+
      '<div class="sp-two"><div><label>REŽIM PLANIRANJA</label>'+
      '<select id="sp-mode" class="sp-field"><option value="best">PREDLOŽI NAJBOLJU RASVETU</option>'+
      '<option value="own">RADI SAMO SA MOJOM OPREMOM</option></select></div>'+
      '<div><label>ATMOSFERA / LOOK</label>'+
      '<select id="sp-look" class="sp-field"><option value="Cinematic">Filmski</option>'+
      '<option value="Night">Noć / mesečina</option><option value="Day for Night">Dan za noć</option>'+
      '<option value="Natural">Prirodno</option><option value="Moody">Mračno / Moody</option></select></div></div>'+
      '<div class="sp-meters"><div><label>ŠIRINA PROSTORA (m, opciono)</label>'+
      '<input id="sp-width" class="sp-field" type="number" min="0.5" max="100" step="0.1" placeholder="Nepoznato"></div>'+
      '<div><label>DUBINA PROSTORA (m, opciono)</label>'+
      '<input id="sp-depth" class="sp-field" type="number" min="0.5" max="100" step="0.1" placeholder="Nepoznato"></div></div>'+
      '<div class="sp-two"><div><label>LOKACIJA SNIMANJA (PROMENLJIVA)</label>'+ 
      '<input id="sp-location" class="sp-field" value="Beograd, Srbija"></div>'+ 
      '<div><label>VREME SNIMANJA (OPCIONO)</label><input id="sp-scene-datetime" class="sp-field" type="datetime-local"></div></div>'+
      '<div class="sp-two"><div><label>GPS LATITUDE (PRIBLIŽNO)</label><input id="sp-scene-lat" class="sp-field" type="number" min="-90" max="90" step="0.000001" value="44.7866"></div>'+
      '<div><label>GPS LONGITUDE (PRIBLIŽNO)</label><input id="sp-scene-lon" class="sp-field" type="number" min="-180" max="180" step="0.000001" value="20.4489"></div></div>'+
      '<label>VREMENSKA ZONA</label><input id="sp-scene-tz" class="sp-field" value="Europe/Belgrade">'+
      '<label style="display:flex;align-items:center;gap:9px"><input id="sp-scene-coords-verified" type="checkbox"> Koordinate su proverene na lokaciji snimanja</label>'+
      '<p class="sp-note">Beograd je početna lokacija. Koordinate su približni centar grada, ne precizna lokacija seta. SUN položaj zahteva tačan datum, vreme i proverenu lokaciju.</p>'+
      '<label style="display:flex;align-items:center;gap:9px"><input id="sp-measured" type="checkbox"> Dimenzije su zaista izmerene</label>'+
      '<div id="sp-inventory" class="sp-note"></div></div>'+
      '<div class="sp-card"><h2 class="sp-h">DIREKTOR FOTOGRAFIJE / KAMERA</h2>'+
      '<label>IZMENA / ZAHTEV DoP-a</label>'+
      '<textarea id="sp-dop-request" rows="3" class="sp-field" placeholder="Tamnije za 1 stop, topliji key, hladnija kontra, zadrži samo moje lampe..."></textarea>'+
      '<div class="sp-two"><div><label>BLENDA</label><input id="sp-aperture" class="sp-field" type="number" min="0.7" max="32" step="0.1" placeholder="AI predlog"></div>'+
      '<div><label>ISO</label><input id="sp-iso" class="sp-field" type="number" min="50" max="25600" step="50" placeholder="AI predlog"></div>'+
      '<div><label>FPS</label><input id="sp-fps" class="sp-field" type="number" min="1" max="120" step="1" placeholder="24"></div>'+
      '<div><label>SHUTTER ANGLE</label><input id="sp-shutter" class="sp-field" type="number" min="11.25" max="360" step="1" placeholder="180"></div>'+
      '<div><label>WHITE BALANCE (K)</label><input id="sp-wb" class="sp-field" type="number" min="1700" max="20000" step="100" placeholder="AI predlog"></div>'+
      '<div><label>ND (STOP)</label><input id="sp-nd" class="sp-field" type="number" min="0" max="12" step="0.5" placeholder="0"></div></div>'+
      '<button id="sp-revise" class="sp-btn sp-primary" type="button" style="width:100%;margin-top:10px">PRIMENI ZAHTEV DoP-a I PONOVO GENERIŠI PLAN</button>'+
      '<p class="sp-note">Blenda, ISO i shutter su tehnički predlozi. Stvarnu ekspoziciju potvrđuje test kamere ili svetlomer.</p></div>'+
      '<div class="sp-card"><h2 class="sp-h">3 / IZGRADI PLAN I VIZUELNI PRIKAZ</h2>'+
      '<div class="sp-actions"><button type="button" class="sp-btn sp-primary" id="sp-generate">GENERISI AI PLAN</button>'+
      '<button type="button" class="sp-btn" id="sp-local">LOKALNI KONCEPT (BEZ INTERNETA)</button></div>'+
      '<p id="sp-status" role="status" aria-live="polite" class="sp-note" style="min-height:20px;margin:12px 0 0"></p></div>'+
      '<div id="sp-result" hidden><div class="sp-card"><h2 class="sp-h">VIZUELNI PREVIEW</h2>'+
      '<div id="sp-preview" style="position:relative;overflow:hidden;border-radius:10px;background:#090d13"></div>'+
      '<div class="sp-actions" style="margin-top:12px"><button type="button" class="sp-btn" id="sp-ai-preview">NAPRAVI AI FOTO-PREVIEW</button></div>'+
      '<p class="sp-note">Lokalna simulacija je ilustrativna i nije fotometrijsko merenje. AI foto-preview zahteva mrežu i dostupan servis.</p></div>'+
      '<div class="sp-card"><h2 class="sp-h">2D LIGHT PLOT — PROCENJENI POLOŽAJI</h2>'+
      '<div id="sp-plot"></div><div id="sp-blocking" class="sp-note"></div>'+
      '<div id="sp-motion-preview" class="sp-card" style="margin-top:12px"><b style="color:#f5c542">VIDEO PREVIZ / POKRETNI KONCEPT</b>'+
      '<p class="sp-note">Vremenski sinhronizovan pregled izvornog snimka i procenjenog rasporeda rasvete. Ovo nije AI generisan video.</p>'+
      '<div id="sp-motion-stage"></div>'+
      '<button type="button" id="sp-storyboard-btn" class="sp-btn" style="width:100%;margin:10px 0">AI OBRADI 3 KLJUČNA VIDEO KADRA</button>'+
      '<div id="sp-ai-storyboard" class="sp-two"></div>'+
      '<div class="sp-actions" style="margin-top:10px"><button type="button" id="sp-video-export" class="sp-btn">IZVEZI KONCEPTUALNI VIDEO</button>'+
      '<button type="button" id="sp-video-share" class="sp-btn" disabled>PODELI IZVEZENI VIDEO</button></div>'+
      '<div id="sp-video-export-status" class="sp-note">Video izvoz koristi lokalnu obradu snimka; nije AI relight i ne menja fizičko osvetljenje.</div></div>'+
      '<div class="sp-card"><h2 class="sp-h">AI VIDEO RELIGHT / VIDEO-TO-VIDEO (EKSPERIMENTALNO)</h2>'+
      '<p class="sp-note">Za originalni video sa novom rasvetom koristi se spoljni plaćeni AI video servis. Ova funkcija ostaje zaključana dok administrator ne omogući servis; nema automatskog trošenja.</p>'+
      '<button type="button" id="sp-video-capabilities" class="sp-btn">PROVERI DOSTUPNOST AI VIDEA</button>'+
      '<div id="sp-video-provider-status" class="sp-note" role="status"></div>'+
      '<label>PRISTUPNI TOKEN DOBIJEN OD ADMINISTRATORA (NE PROVIDER API KLJUČ)</label>'+
      '<input id="sp-video-auth" type="password" autocomplete="off" class="sp-field" placeholder="Pristupni token" />'+
      '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="sp-video-cost-confirm"> Svestan sam da video-to-video generisanje koristi plaćeni AI servis.</label>'+
      '<div class="sp-actions"><button id="sp-video-ai-start" class="sp-btn sp-primary" type="button">POKRENI AI VIDEO OBRADU</button>'+
      '<button id="sp-video-ai-check" class="sp-btn" type="button" disabled>PROVERI STATUS</button></div>'+
      '<div id="sp-video-ai-status" class="sp-note"></div>'+
      '<div id="sp-video-ai-output" style="margin-top:10px"></div></div>'+
      '<label>POLOŽAJ GLUMCA / TRENUTAK SCENE</label><input type="range" id="sp-stage" min="0" max="0" value="0" step="1" class="sp-field" style="padding:4px">'+
      '<div id="sp-stage-info" class="sp-note"></div>'+
      '<p class="sp-note">2D položaji i pokrivenost su AI procene, ne stvarna fotometrijska merenja.</p></div>'+
      '<div class="sp-card"><h2 class="sp-h">PREDLOG RASVETE</h2>'+
      '<div id="sp-summary"></div><div id="sp-camera-result" class="sp-lamp"></div><div id="sp-lights"></div><div id="sp-warnings"></div>'+
      '<div class="sp-actions" style="margin-top:12px"><button type="button" class="sp-btn" id="sp-save">SAČUVAJ PLAN (JSON)</button>'+
      '<button type="button" class="sp-btn" id="sp-share">PODELI PLAN</button></div></div></div></div>';
    document.body.appendChild(wrap);
    el('sp-close').onclick=close;
    el('sp-gallery-btn').onclick=function(){el('sp-gallery').click();};
    el('sp-camera-btn').onclick=function(){el('sp-camera').click();};
    el('sp-video-btn').onclick=function(){el('sp-video-input').click();};
    el('sp-record-btn').onclick=function(){el('sp-record-input').click();};
    ['sp-gallery','sp-camera'].forEach(function(id){
      el(id).onchange=function(e){var file=e.target.files&&e.target.files[0];if(file)photoPicked(file);e.target.value='';};
    });
    ['sp-video-input','sp-record-input'].forEach(function(id){
      el(id).onchange=function(e){var file=e.target.files&&e.target.files[0];if(file)videoPicked(file,id==='sp-record-input');e.target.value='';};
    });
    el('sp-mode').onchange=updateInventory;
    el('sp-location').onchange=function(){
      // A renamed city must not silently retain Belgrade centre coordinates.
      if(!/^(beograd|belgrade)(,|$)/i.test(el('sp-location').value.trim())){
        el('sp-scene-lat').value='';el('sp-scene-lon').value='';
        el('sp-scene-coords-verified').checked=false;
      }
    };
    el('sp-stage').oninput=function(){renderBlocking();};
    el('sp-voice').onclick=function(){
      if(window.Android && typeof window.Android.startSpeechInput==='function') {
        status('Otvaram glasovni unos…');window.Android.startSpeechInput(locale(),'sp-description');
      } else status('Glasovni unos zahteva Android verziju aplikacije.',true);
    };
    el('sp-generate').onclick=function(){generate(true);};
    el('sp-revise').onclick=function(){generate(true);};
    el('sp-local').onclick=function(){generate(false);};
    el('sp-ai-preview').onclick=generatePhotoPreview;
    el('sp-storyboard-btn').onclick=generateAIStoryboard;
    el('sp-video-export').onclick=exportConceptVideo;
    el('sp-video-share').onclick=shareConceptVideo;
    el('sp-video-capabilities').onclick=checkAIProvider;
    el('sp-video-ai-start').onclick=startAIVideo;
    el('sp-video-ai-check').onclick=checkAIVideo;
    el('sp-save').onclick=save;
    el('sp-share').onclick=share;
    updateInventory();
    loadCore(function(){if(restorePlanHistory())status('Spremno. Dodaj fotografiju ili video i opiši kadar.');});
    restoreVideoReceipt();
  }
  function updateInventory(){
    var box=el('sp-inventory');if(!box)return;
    if(el('sp-mode').value!=='own'){
      box.textContent='AI može da predloži idealnu opremu; predloženi izvori nisu označeni kao dostupni.';
      return;
    }
    var list=core()?core().equipment(inventory()):inventory().filter(function(e){return !e.accessoryId&&!e.sapa&&!e.kitId;});
    box.textContent=list.length?'Moj inventar: '+list.map(function(e){return e.name+' ×'+(e.qty||1);}).join('; '):
      'Nema izabranih lampi u OPREMI. Dodaj opremu pre ovog režima.';
  }
  function optimizePhoto(file){
    return new Promise(function(resolve,reject){
      if(!/^image\//.test(file.type)){reject(new Error('Potrebna je fotografija.'));return;}
      var reader=new FileReader();
      reader.onerror=function(){reject(new Error('Čitanje fotografije nije uspelo.'));};
      reader.onload=function(){
        var img=new Image();
        img.onerror=function(){reject(new Error('Fotografija se ne može otvoriti.'));};
        img.onload=function(){
          var scale=Math.min(1,1280/Math.max(img.naturalWidth,img.naturalHeight));
          var canvas=document.createElement('canvas');
          canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
          canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
          canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',.80));
        };
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  async function photoPicked(file){
    status('Pripremam fotografiju…');
    try{
      state.photo=await optimizePhoto(file);state.aiPreview='';
      var image=el('sp-image');if(image){image.src=state.photo;image.hidden=false;}
      status('Fotografija dodata.');
    }catch(e){status(e.message||'Fotografija nije učitana.',true);}
  }
  function videoElement(url) {
    var v=document.createElement('video');
    v.preload='auto';v.muted=true;v.playsInline=true;v.src=url;
    return v;
  }
  function waitFor(v,success,timeout){
    return new Promise(function(resolve,reject){
      var timer=setTimeout(function(){finish(new Error('Isteklo vreme za otvaranje video kadra.'));},timeout||10000);
      function cleanup(){clearTimeout(timer);v.removeEventListener(success,ok);v.removeEventListener('error',bad);}
      function finish(err){cleanup();if(err)reject(err);else resolve();}
      function ok(){finish(null);}
      function bad(){finish(new Error('Video format nije podržan na ovom telefonu.'));}
      v.addEventListener(success,ok,{once:true});v.addEventListener('error',bad,{once:true});
    });
  }
  async function videoFrames(url){
    var video=videoElement(url);
    var metadata=waitFor(video,'loadedmetadata',12000);
    video.load();
    await metadata;
    if(!Number.isFinite(video.duration)||video.duration<=0)throw new Error('Trajanje video snimka nije prepoznato.');
    if(video.duration>120)throw new Error('Za sada koristi video kraći od 120 sekundi.');
    var duration=video.duration,frames=[],times=[0.04,.20,.40,.60,.80,.96].map(function(f){
      return Math.min(Math.max(0,duration-.08),Math.max(.02,duration*f));
    });
    for(var i=0;i<times.length;i++){
      var t=times[i];
      if(Math.abs(video.currentTime-t)>.025){
        var seeked=waitFor(video,'seeked',14000);
        video.currentTime=t;
        await seeked;
      }
      var canvas=document.createElement('canvas');
      var scale=Math.min(1,800/Math.max(video.videoWidth,video.videoHeight));
      canvas.width=Math.max(1,Math.round(video.videoWidth*scale));
      canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
      canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
      frames.push({timeSec:Number(t.toFixed(2)),image:canvas.toDataURL('image/jpeg',.72)});
    }
    video.removeAttribute('src');video.load();
    return {frames:frames,durationSec:duration};
  }
  async function videoPicked(file,fromCapture){
    if(state.aiVideoPending&&state.aiVideoPending.started){
      status('Prethodni plaćeni AI zahtev još nije razjašnjen. Ne menjaj snimak i ne pokreći novi zahtev.',true);
      return;
    }
    if(state.videoBusy)return;
    if(!/^video\//.test(file.type)&&file.type) {status('Potreban je video snimak.',true);return;}
    if(file.size>180*1024*1024){status('Video prelazi 180 MB. Skrati snimak i pokušaj ponovo.',true);return;}
    state.videoBusy=true;state.frames=[];state.aiPreview='';state.aiStoryboard=[];state.videoFile=file;state.exportedVideo=null;state.aiVideoTaskId=null;
    state.videoDurationSec=null;state.aiVideoPending=null;state.aiVideoCompletedPlan=null;
    if(state.videoUrl){URL.revokeObjectURL(state.videoUrl);state.videoUrl='';}
    state.videoUrl=URL.createObjectURL(file);
    var player=el('sp-video');if(player){player.src=state.videoUrl;player.hidden=false;player.load();}
    status('Izdvajam ključne kadrove videa na telefonu…');
    try{
      var extracted=await videoFrames(state.videoUrl);
      state.frames=extracted.frames;
      state.videoDurationSec=extracted.durationSec;
      var note=el('sp-video-note');
      if(note)note.textContent='Izdvojena '+state.frames.length+' kadra za analizu kretanja. Originalni video ostaje na telefonu.';
      status('Video je spreman: '+state.frames.length+' kadra za planiranje putanje.');
    }catch(e){
      state.frames=[];
      status((e&&e.message||'Video nije podržan.')+' Možeš dodati fotografiju kao alternativu.',true);
    }finally{state.videoBusy=false;releaseCaptures(!!fromCapture);}
  }
  function payload(){
    return core().request({
      mode:el('sp-mode').value,description:el('sp-description').value,
      look:el('sp-look').value,captureLighting:el('sp-capture').value,
      sceneLocation:el('sp-location').value,sceneLatitude:el('sp-scene-lat').value,
      sceneLongitude:el('sp-scene-lon').value,sceneTimeZone:el('sp-scene-tz').value,
      sceneLocalDateTime:el('sp-scene-datetime').value,
      sceneCoordsVerified:el('sp-scene-coords-verified').checked,
      shotCamera:el('sp-shot-camera').value,roomWidthM:el('sp-width').value,
      roomDepthM:el('sp-depth').value,dimensionsMeasured:el('sp-measured').checked,
      equipment:inventory(),scenePhoto:state.photo,videoFrames:state.frames,language:locale(),
      dopRequest:el('sp-dop-request').value,
      previousPlan:state.plan,
      cameraOverrides:{aperture:el('sp-aperture').value,iso:el('sp-iso').value,
        fps:el('sp-fps').value,shutterAngle:el('sp-shutter').value,
        whiteBalanceK:el('sp-wb').value,ndStops:el('sp-nd').value}
    });
  }
  function setBusy(busy){
    state.busy=busy;
    ['sp-generate','sp-local','sp-ai-preview','sp-revise'].forEach(function(id){if(el(id))el(id).disabled=busy;});
  }
  async function generate(useAI){
    if(state.busy||state.videoBusy||!core())return;
    if(historyBlocked){status('Postojeća istorija nije proverena. Sačuvane revizije neće biti prepisane.',true);return;}
    var req=payload();
    if(!req.description){status('Opiši scenu tekstom ili glasom.',true);return;}
    if(!req.scenePhoto&&!req.videoFrames.length){status('Dodaj fotografiju ili video sa izdvojenim kadrovima.',true);return;}
    if(req.mode==='own'&&!req.equipment.length){status('U režimu MOJA OPREMA izaberi lampu u inventaru.',true);return;}
    setBusy(true);
    var candidate=null;
    state.aiPreview='';state.aiStoryboard=[];
    if(useAI){
      status('AI analizira prostor, opis i kretanje iz videa…');
      var controller=new AbortController();state.abort=controller;
      var timer=setTimeout(function(){controller.abort();},65000);
      try{
        var r=await fetch(API+'/api/scene-planner/plan',{method:'POST',
          headers:{'Content-Type':'application/json'},body:JSON.stringify(req),signal:controller.signal});
        if(!r.ok)throw new Error('HTTP '+r.status);
        var response=await r.json();
        if(!response||!response.ok||!response.plan||response.plan.source!=='ai')throw new Error('Nevažeći AI odgovor.');
        candidate=response.plan;
        status('AI plan je generisan. Tehničke vrednosti su označene kao procene.');
      }catch(error){
        candidate=core().localPlan(req);
        status('AI servis nije dostupan ('+(error.name==='AbortError'?'timeout':error.message)+'). Prikazan je LOKALNI koncept, ne AI analiza.',true);
      }finally{clearTimeout(timer);state.abort=null;setBusy(false);}
    }else{
      candidate=core().localPlan(req);
      status('Prikazan je lokalni koncept bez AI obrade fotografije ili kretanja.');
      setBusy(false);
    }
    try{
      if(!sceneId)sceneId='scene-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
      var revision=core().createRevision(candidate,req,candidate.source,
        revisions.length?revisions[revisions.length-1]:null,sceneId);
      revisions=revisions.concat([revision]);state.plan=revision.plan;
      renderResult();remember();
    }catch(error){status('Revizija nije sačuvana: '+error.message,true);}
  }
  function fmt(value,unit){
    return value==null?'neutvrđeno':(String(value)+(unit||''));
  }
  function line(x1,y1,x2,y2,color){
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="1.2" stroke-dasharray="3 2"/>';
  }
  function plotSvg(plan,revision){
    var x=[],colors={key:'#ffce56',fill:'#7bbcff',backlight:'#ffa17d',ambient:'#c5b3ff'};
    var actor=plan.actors[0]||{x:50,y:50,path:[]};
    var binding=revision ? core().videoRevisionBinding(revision) : null;
    var base='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 105"'+
      (binding?' data-light-plot-revision-id="'+esc(binding.lightPlotRevisionId)+'" data-plan-hash="'+esc(binding.planHash)+'"':'')+
      ' role="img" aria-label="2D light plot sa kamerom, svetlima i putanjom glumca" style="display:block;width:100%;max-height:480px;background:#0b111c;border-radius:12px">'+
      (binding?'<metadata>'+esc(JSON.stringify(binding))+'</metadata>':'')+
      '<defs><marker id="sp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#85e0af"/></marker></defs>'+
      '<rect x="5" y="5" width="90" height="90" rx="3" fill="#101822" stroke="#738091" stroke-width="1.1"/>';
    for(var g=20;g<=80;g+=20){base+=line(g,5,g,95,'#273444')+line(5,g,95,g,'#273444');}
    plan.lights.forEach(function(light){
      var color=colors[light.role]||'#eee';
      base+=line(light.x,light.y,actor.x,actor.y,color)+
        '<circle cx="'+light.x+'" cy="'+light.y+'" r="4.8" fill="'+color+'" stroke="#0b111c" stroke-width="1"/>'+
        '<text x="'+light.x+'" y="'+(light.y+1.2)+'" fill="#111" text-anchor="middle" font-size="3.6" font-weight="900">'+esc(light.id)+'</text>';
    });
    plan.actors.forEach(function(a){
      var pts=Array.isArray(a.path)?a.path:[];
      for(var i=1;i<pts.length;i++){
        base+='<line x1="'+pts[i-1].x+'" y1="'+pts[i-1].y+'" x2="'+pts[i].x+'" y2="'+pts[i].y+
          '" stroke="#85e0af" stroke-width="1.6" stroke-dasharray="3 2" marker-end="url(#sp-arrow)"/>';
      }
      base+='<circle cx="'+a.x+'" cy="'+a.y+'" r="4.3" fill="#204d43" stroke="#a7eed2" stroke-width="1.1"/>'+
        '<text x="'+a.x+'" y="'+(a.y+1.2)+'" font-size="3.5" fill="#fff" text-anchor="middle">'+esc(a.id)+'</text>';
    });
    base+='<rect x="'+(plan.camera.x-8)+'" y="'+(plan.camera.y-3)+'" width="16" height="7" rx="1.4" fill="#23364d" stroke="#c7e2ff"/>'+
      '<text x="'+plan.camera.x+'" y="'+(plan.camera.y+1.5)+'" font-size="3" fill="#fff" text-anchor="middle">'+esc(plan.camera.label)+'</text>'+
      '<text x="6" y="102" font-size="3.2" fill="#95a6b9">POGLED OD GORE • PROCENA</text></svg>';
    return base;
  }
  function renderBlocking(){
    var p=state.plan,box=el('sp-blocking'),info=el('sp-stage-info'),slider=el('sp-stage');
    if(!p||!box||!slider)return;
    var actor=(p.actors||[])[0],path=actor&&actor.path||[];
    slider.max=String(Math.max(0,path.length-1));
    var index=Math.max(0,Math.min(path.length-1,Number(slider.value)||0));
    if(!path.length){slider.disabled=true;box.textContent='Putanja nije potvrđena: AI nije uspeo da rekonstruiše kretanje. Не приказујемо измишљене кораке.';info.textContent='Nema pouzdane putanje.';renderMotionStage(0);return;}
    slider.disabled=false;
    var pt=path[index],covered=(p.lights||[]).filter(function(l){return l.coverageStages.indexOf(index)>=0;});
    var known=covered.filter(function(l){return l.role==='key'||l.role==='ambient';});
    var camera=p.sceneAnalysis||{};
    box.textContent='Kretanje: '+path.length+' kontrolnih tačaka • pouzdanost '+(actor.confidence||'nepoznata')+
      ' • Kamera '+(camera.cameraMotion||'nepoznato')+'. Ovo nisu metričke koordinate.';
    renderMotionStage(index);
    info.textContent='Tačka '+(index+1)+'/'+path.length+
      (pt.timeSec==null?'':' • video '+pt.timeSec.toFixed(1)+' s')+
      ' • očekivani izvori: '+(covered.length?covered.map(function(l){return l.id;}).join(', '):'nisu potvrđeni')+
      (!known.length?' • UPOZORENJE: nije potvrđen key/ambient na ovom delu putanje.':'');
  }
  function renderMotionStage(index){
    var region=el('sp-motion-stage'),p=state.plan;
    if(!region||!p)return;
    if(!state.frames.length){
      region.innerHTML='<p class="sp-note">Dodaj video da bi pregledao kretanje kroz snimljene kadrove.</p>';
      return;
    }
    var actor=(p.actors||[])[0],path=actor&&actor.path||[];
    var current=path[index]||null;
    var targetTime=current&&current.timeSec!=null?current.timeSec:state.frames[Math.min(index,state.frames.length-1)].timeSec;
    var frame=state.frames.reduce(function(best,f){return Math.abs(f.timeSec-targetTime)<Math.abs(best.timeSec-targetTime)?f:best;},state.frames[0]);
    var selected=state.frames.indexOf(frame);
    var shade=p.look==='Night'||p.look==='Day for Night';
    var filter=shade?'brightness(.53) contrast(1.18) saturate(.70) hue-rotate(12deg)':'contrast(1.06)';
    var labels=(p.lights||[]).filter(function(l){return l.coverageStages.includes(index);}).map(function(l){return l.id;}).join(', ');
    region.innerHTML='<div style="position:relative;background:#070d15;border-radius:10px;overflow:hidden">'+
      '<img alt="Referentni kadar '+(selected+1)+'" src="'+frame.image+'" style="width:100%;max-height:350px;object-fit:contain;display:block;filter:'+filter+'">'+
      '<div style="position:absolute;bottom:8px;left:8px;background:#050b11da;border-radius:8px;color:#f5c542;font-size:12px;padding:7px">'+
      'Kadar '+(selected+1)+' / '+state.frames.length+' · '+frame.timeSec.toFixed(1)+' s · osvetljenje: '+esc(labels||'nepotvrđeno')+
      '</div></div>'+
      '<p class="sp-note">Procena izgledа iz izabranog kadra. Svetlosni filter je kreativni prikaz, a ne simulacija stvarnih izvora.</p>';
  }
  function conceptPhoto(plan){
    var image=state.photo||(state.frames[0]&&state.frames[0].image)||'';
    if(!image)return '<p class="sp-note">Fotografija nije dostupna.</p>';
    var night=plan.look==='Night'||plan.look==='Day for Night';
    var moody=plan.look==='Moody';
    var filter=night?'brightness(.51) contrast(1.18) saturate(.72) hue-rotate(12deg)':
      (moody?'brightness(.76) contrast(1.21)':'contrast(1.08) saturate(1.06)');
    return '<img src="'+image+'" alt="Konceptualna simulacija osvetljenja" style="display:block;width:100%;max-height:440px;object-fit:contain;filter:'+filter+'">'+
      '<div style="position:absolute;inset:0;pointer-events:none;background:'+
      (night?'linear-gradient(125deg,rgba(23,59,112,.28),transparent 55%)':'radial-gradient(circle at 25% 20%,rgba(255,199,97,.11),transparent 60%)')+'"></div>'+
      '<div style="position:absolute;left:8px;bottom:8px;padding:7px;background:#080d13db;color:#f5c542;border-radius:6px;font-size:11px;font-weight:800">LOKALNA SIMULACIJA • NIJE AI FOTO-RENDER</div>';
  }
  function resultText(plan){
    var lines=['AI SCENE PLANNER',plan.summary,'',plan.rationale,'',
      'PREDLOG SVETALA'];
    plan.lights.forEach(function(l){
      lines.push(l.id+' '+l.role+' — '+l.fixtureName+' ('+(l.available?'inventar':'predlog')+')',
        'Pozicija '+l.x+'/'+l.y+'%; visina '+fmt(l.heightM,' m')+', distanca '+fmt(l.distanceM,' m')+
        ', ugao '+fmt(l.angleDeg,'°')+', jačina '+fmt(l.intensityPct,'%')+
        ', temperatura '+fmt(l.kelvin,' K')+', modifikator '+(l.modifier||'nije naveden'),
        'Napajanje: '+l.power,
        'Zašto: '+l.why);
    });
    lines.push('','OGRANIČENJA',...plan.limitations,'','BEZBEDNOST',...plan.safetyNotes);
    return lines.join('\n');
  }
  function renderResult(){
    var plan=state.plan;if(!plan||!el('sp-result'))return;
    el('sp-result').hidden=false;
    el('sp-summary').innerHTML='<div style="line-height:1.55">'+esc(plan.summary)+'</div>'+
      '<p class="sp-note">'+esc(plan.rationale)+'</p>'+
      '<div class="sp-pill" style="display:inline-block">'+(plan.source==='ai'?'AI PREDLOG':'LOKALNI KONCEPT')+
      ' • '+(plan.mode==='own'?'SAMO MOJA OPREMA':'NAJBOLJA RASVETA')+'</div>';
    var current=revisions[revisions.length-1];
    if(current)el('sp-summary').innerHTML+='<p class="sp-note">Revizija '+current.sequence+
      ' • '+esc(current.sceneId)+'<br>Light plot: '+esc(current.lightPlotRevisionId)+
      '<br>SHA-256: '+esc(current.planHash)+'</p>';
    var camera=plan.cameraSettings||{};
    var cameraBox=el('sp-camera-result');
    if(cameraBox)cameraBox.innerHTML='<b style="color:#f5c542">KAMERA / PREPORUKA, NIJE MERENJE</b>'+
      '<p>f/'+fmt(camera.aperture)+' • ISO '+fmt(camera.iso)+' • '+fmt(camera.fps,' fps')+
      ' • Shutter '+fmt(camera.shutterAngle,'°')+' • WB '+fmt(camera.whiteBalanceK,' K')+
      ' • ND '+fmt(camera.ndStops,' stop')+'</p>'+
      '<p class="sp-note">Shutter ~'+fmt(camera.shutterSeconds,' s')+
      ' • promena u odnosu na osnovni predlog: '+fmt(camera.exposureDeltaStops,' stop')+
      '<div>'+esc(camera.provenance||'Neproverena procena')+'</div>'+
      (plan.exposureNotes||[]).map(function(n){return '<div>• '+esc(n)+'</div>';}).join('')+'</p>';
    el('sp-plot').innerHTML=plotSvg(plan,current);
    renderBlocking();
    el('sp-preview').innerHTML=conceptPhoto(plan);
    el('sp-lights').innerHTML=plan.lights.length?plan.lights.map(function(l){
      return '<div class="sp-lamp"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+
        '<b style="color:#f5c542">'+esc(l.id)+' / '+esc(l.role.toUpperCase())+'</b>'+
        '<span class="sp-pill">'+(l.available?'U INVENTARU':'PREDLOG • NIJE U INVENTARU')+'</span></div>'+
        '<div style="font-weight:800;margin-top:7px">'+esc(l.fixtureName)+'</div>'+
        '<div class="sp-note" style="margin-top:7px">Položaj '+l.x+'% / '+l.y+'% • Visina ~'+fmt(l.heightM,' m')+
        ' • Distanca ~'+fmt(l.distanceM,' m')+' • Ugao ~'+fmt(l.angleDeg,'°')+
        '<div>Intenzitet ~'+fmt(l.intensityPct,'%')+' • Kelvin '+fmt(l.kelvin,' K')+
        ' • Boja '+esc(l.color||'nije određena')+'</div>'+
        '<div>Modifikator: '+esc(l.modifier||'nije naveden')+
        ' • Potrošnja: '+fmt(l.powerDrawW,' W')+'</div>'+
        '<div>Napajanje: '+esc(l.power)+'</div>'+
        '<div>Verticalni nagib ~'+fmt(l.verticalTiltDeg,'°')+
        ' • Ugao snopa ~'+fmt(l.beamAngleDeg,'°')+'</div>'+
        '<div>Pokret/glumac: '+(l.coverageStages.length?l.coverageStages.map(function(i){return i+1;}).join(', '):'pokrivenost nepotvrđena')+'</div>'+
        '<div>'+esc(l.positionNote||'Potrebna provera položaja')+'</div></div>'+
        '<p style="font-size:13px;line-height:1.4;margin:9px 0 0">'+esc(l.why)+'</p></div>';
    }).join(''):'<p class="sp-note">Nije moguće napraviti pouzdan izbor lampi iz dostupnog inventara.</p>';
    el('sp-warnings').innerHTML='<div class="sp-note" style="margin-top:10px"><b style="color:#f5c542">PROCENE I KOMPROMISI</b><ul>'+
      plan.limitations.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+
      '</ul><b style="color:#f5c542">DAN ZA NOĆ / KONTROLA DNEVNOG SVETLA</b><ul>'+
      (plan.dayForNightNotes||[]).map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+
      '</ul><b style="color:#f5c542">BEZBEDNOST</b><ul>'+
      plan.safetyNotes.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+'</ul></div>';
    el('sp-result').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function previewPayload(plan){
    return {
      summary:plan.summary,key:resultText({summary:'',rationale:'',lights:plan.lights.filter(function(x){return x.role==='key';}),
        limitations:[],safetyNotes:[]}),
      lighting_diagram:{camera:'Kamera',subjects:plan.actors.map(function(a){
        return {id:a.id,label:a.label,x:a.x,y:a.y};
      }),lights:plan.lights.map(function(l){
        return {id:l.id,role:l.role,fixture:l.fixtureName,x:l.x,y:l.y};
      })}
    };
  }
  async function generatePhotoPreview(){
    if(state.busy||!state.plan)return;
    var image=state.photo||(state.frames[0]&&state.frames[0].image)||'';
    if(!image){status('Za foto-preview je potreban kadar.',true);return;}
    setBusy(true);status('Generišem AI foto-preview sa predloženim osvetljenjem…');
    var controller=new AbortController(),timeout=setTimeout(function(){controller.abort();},100000);
    state.abort=controller;
    try{
      var req=payload(),r=await fetch(API+'/api/visual-preview',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({scenePhoto:image,description:req.description,
          equipment:req.equipment,plan:previewPayload(state.plan),language:req.language}),
        signal:controller.signal
      });
      if(!r.ok)throw new Error('HTTP '+r.status);
      var data=await r.json();
      if(!data.image||!/^data:image\//.test(data.image))throw new Error('Nevažeća slika.');
      state.aiPreview=data.image;
      el('sp-preview').innerHTML='<img alt="AI foto-preview scene" style="width:100%;display:block;max-height:440px;object-fit:contain" src="'+state.aiPreview+'">'+
        '<div style="padding:7px 9px;font-size:11px;color:#bfe8ff">AI FOTO-PREVIEW • kreativna vizualizacija, ne verifikovana simulacija</div>';
      status('AI foto-preview spreman.');
    }catch(e){status('AI foto-preview trenutno nije dostupan: '+(e.name==='AbortError'?'timeout':e.message),true);}
    finally{clearTimeout(timeout);state.abort=null;setBusy(false);}
  }
  async function generateAIStoryboard(){
    if(state.busy||!state.plan||!state.frames.length){status('Najpre dodaj video i napravi plan rasvete.',true);return;}
    var button=el('sp-storyboard-btn');if(button)button.disabled=true;
    var indices=[0,Math.floor((state.frames.length-1)/2),state.frames.length-1];
    var frames=indices.filter(function(i,k){return indices.indexOf(i)===k;}).map(function(i){return state.frames[i];});
    var controller=new AbortController();state.abort=controller;
    var timer=setTimeout(function(){controller.abort();},150000);
    status('AI obrađuje izabrane ključne kadrove. Svaki kadar se generiše posebno.');
    try{
      var r=await fetch(API+'/api/scene-planner/storyboard',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({frames:frames,plan:state.plan,description:el('sp-description').value,language:locale()}),
        signal:controller.signal
      });
      if(!r.ok)throw new Error('HTTP '+r.status);
      var obj=await r.json();
      if(!obj.ok||!Array.isArray(obj.frames)||obj.frames.length!==frames.length||
        obj.frames.some(function(f){return !/^data:image\/png;base64,/.test(f.image);}))
        throw new Error('AI servis nije vratio validne kadrove.');
      state.aiStoryboard=obj.frames;
      var box=el('sp-ai-storyboard');
      if(box)box.innerHTML=obj.frames.map(function(frame,i){
        return '<div><img src="'+frame.image+'" alt="AI obrada kadra '+(i+1)+
          '" style="width:100%;border-radius:8px"><div class="sp-note">AI kadar '+(i+1)+' · '+frame.timeSec+' s</div></div>';
      }).join('')+'<p class="sp-note">AI su obrađene samo statične slike. Ovo još nije kompletan vremenski stabilan AI video, niti njegov video-izvoz.</p>';
      status('AI ključni kadrovi su spremni. Za pravi AI video potrebna je vremenski usklađena obrada svih kadrova.');
    }catch(error){status('AI storyboard nije dostupan: '+(error.name==='AbortError'?'timeout':error.message),true);}
    finally{clearTimeout(timer);state.abort=null;if(button)button.disabled=false;}
  }
  function videoStatus(message,problem){
    var elStatus=el('sp-video-ai-status');
    if(elStatus){elStatus.textContent=message;elStatus.style.color=problem?'#ffb4a6':'#b2e9c5';}
  }
  async function checkAIProvider(){
    try{
      var res=await fetch(API+'/api/scene-planner/video/capabilities',{cache:'no-store'});
      if(!res.ok)throw new Error('HTTP '+res.status);
      var data=await res.json();
      state.aiVideoAvailable=data.available===true;
      el('sp-video-provider-status').textContent=state.aiVideoAvailable?
        'AI servis je aktiviran. Zahteva pristupni token, odobrenje plaćenog poziva i snimak od 2 do 30 sekundi.':
        'AI video servis još nije aktiviran; ova funkcija se ne može pokrenuti.';
    }catch(e){
      state.aiVideoAvailable=false;
      el('sp-video-provider-status').textContent='Video servis nije dostupan ('+e.message+').';
    }
  }
  function videoAccess(){
    var token=el('sp-video-auth').value.trim();
    if(token.length<24)throw new Error('Pristupni token administratora nije unet.');
    return {'Authorization':'Bearer '+token};
  }
  async function videoRequest(path,options){
    var headers=Object.assign({},videoAccess(),options&&options.headers||{});
    if(typeof AbortController!=='function')throw new Error('Potrebna je podrška za bezbedan mrežni timeout.');
    var controller=new AbortController();
    var timer=setTimeout(function(){controller.abort();},path==='/start'?100000:path==='/upload'?130000:15000);
    var response;
    try{
      response=await fetch(API+'/api/scene-planner/video'+path,
        Object.assign({cache:'no-store'},options||{},{headers:headers,redirect:'error',signal:controller.signal}));
    }finally{clearTimeout(timer);}
    if(!response.ok){
      var data=await response.json().catch(function(){return {};});
      throw new Error(data.error||'Video servis HTTP '+response.status);
    }
    return response;
  }
  function persistVideoReceipt(value){
    // Opaque identifiers/status only. Never serialize state, plans, media or the access field.
    var receipt={requestId:value.requestId,uploadId:value.uploadId||null,taskId:value.taskId||null,
      status:value.status||'SUBMITTING'};
    localStorage.setItem(VIDEO_RECEIPT,JSON.stringify(receipt));
    videoReceipt=receipt;
  }
  function restoreVideoReceipt(){
    try{
      var raw=localStorage.getItem(VIDEO_RECEIPT);
      if(!raw)return;
      var value=JSON.parse(raw),id=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
      if(!value||!id.test(value.requestId)||!id.test(value.uploadId)||
        (value.taskId&&!id.test(value.taskId))||
        ['SUBMITTING','UNKNOWN','PENDING','RUNNING','THROTTLED','SUCCEEDED','FAILED','CANCELED','EXPIRED'].indexOf(value.status)<0)
        throw new Error('Neispravna potvrda zadatka.');
      videoReceipt=value;
      videoReceiptBlocked=['SUCCEEDED','FAILED','CANCELED','EXPIRED'].indexOf(value.status)<0;
      state.aiVideoTaskId=value.taskId;
      el('sp-video-ai-check').disabled=false;
      videoStatus('Sačuvan je prethodni AI zahtev. Unesi pristupni token i proveri status. Nastavak ne pokreće novu obradu.');
    }catch(e){videoReceiptBlocked=true;videoStatus('Potvrdu prethodnog zadatka nije moguće proveriti. Nova plaćena obrada je blokirana.',true);}
  }
  async function startAIVideo(){
    if(videoReceiptBlocked){videoStatus('Prvo razjasni prethodni plaćeni zahtev dugmetom za status.',true);return;}
    if(!state.aiVideoAvailable){videoStatus('AI video servis nije omogućen.',true);return;}
    if(!state.plan||!state.videoFile){videoStatus('Izaberi video i generiši plan.',true);return;}
    if(state.aiVideoCompletedPlan===state.plan){
      videoStatus('AI video za ovaj plan je već pokrenut. Za novu obradu prvo potvrdi novi DoP plan.',true);return;
    }
    if(!el('sp-video-cost-confirm').checked){
      videoStatus('Potrebna je izričita potvrda plaćene AI obrade.',true);return;
    }
    if(state.videoFile.size>40*1024*1024){videoStatus('Video prelazi dozvoljenih 40 MiB.',true);return;}
    var mime=state.videoFile.type;
    if(['video/mp4','video/quicktime','video/webm'].indexOf(mime)<0){
      videoStatus('Potreban je MP4, MOV ili WebM. Drugi video format nije prihvaćen.',true);return;
    }
    // Use the original media metadata, never the last (~96%) sampled keyframe.
    var duration=Number(state.videoDurationSec);
    if(!Number.isFinite(duration)||duration<2||duration>30){
      videoStatus('Potreban je snimak trajanja od 2 do 30 sekundi.',true);return;
    }
    var button=el('sp-video-ai-start');button.disabled=true;
    try{
      var pending=state.aiVideoPending;
      if(!pending){
        pending={requestId:cryptoRandomRequestId(),uploadId:null,plan:state.plan,started:false};
        state.aiVideoPending=pending;
      }
      if(!pending.uploadId){
        videoStatus('Otpremam izabrani video na zaštićeni servis…');
        var uploaded=await videoRequest('/upload',{
          method:'POST',headers:{'Content-Type':mime,'X-Scene-Duration':String(duration)},
          body:state.videoFile
        });
        var info=await uploaded.json();
        if(!info.uploadId)throw new Error('Servis nije vratio oznaku otpremljenog snimka.');
        pending.uploadId=info.uploadId;
      }
      videoStatus('Proveravam isti identifikator plaćenog zadatka; nema novog uploada pri ponavljanju.');
      // The same requestId and uploadId MUST be retained on ambiguous failures.
      persistVideoReceipt({requestId:pending.requestId,uploadId:pending.uploadId,status:'SUBMITTING'});
      videoReceiptBlocked=true;
      pending.started=true;
      var started=await videoRequest('/start',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({uploadId:pending.uploadId,requestId:pending.requestId,
          plan:pending.plan,confirmPaidGeneration:true})
      });
      var task=await started.json();
      state.aiVideoTaskId=task.taskId;
      persistVideoReceipt({requestId:pending.requestId,uploadId:pending.uploadId,taskId:task.taskId,status:'PENDING'});
      state.aiVideoCompletedPlan=pending.plan;
      state.aiVideoPending=null;
      if(el('sp-video-ai-check'))el('sp-video-ai-check').disabled=false;
      if(el('sp-video-cost-confirm'))el('sp-video-cost-confirm').checked=false;
      videoStatus('AI zadatak '+task.taskId+' je prihvaćen. Procena: '+(task.estimatedCredits==null?'nije potvrđena':task.estimatedCredits)+' kredita. Proveri status dugmetom.');
    }catch(error){
      if(pending&&pending.started){
        if(el('sp-video-ai-check'))el('sp-video-ai-check').disabled=false;
        if(el('sp-video-cost-confirm'))el('sp-video-cost-confirm').checked=false;
      }
      videoStatus('AI zahtev nije potvrđen: '+error.message+
        (state.aiVideoPending&&state.aiVideoPending.started?' Moguće je da je naplaćen; ne šalji novi zahtev. Sledeća provera koristi isti ID.':''),true);
    }
    finally{button.disabled=false;}
  }
  function cryptoRandomRequestId(){
    if(window.crypto&&window.crypto.randomUUID)return window.crypto.randomUUID();
    throw new Error('Za sigurno plaćeno pokretanje potreban je podržan generator jedinstvenog zahteva.');
  }
  async function checkAIVideo(){
    try{
      if(!state.aiVideoTaskId&&videoReceipt){
        var reconciled=await videoRequest('/request/'+videoReceipt.requestId,{method:'GET'});
        var known=await reconciled.json();state.aiVideoTaskId=known.taskId;
      }
      if(!state.aiVideoTaskId)return;
      var response=await videoRequest('/status/'+state.aiVideoTaskId,{method:'GET'});
      var task=await response.json();
      if(videoReceipt){
        persistVideoReceipt({requestId:videoReceipt.requestId,uploadId:videoReceipt.uploadId,taskId:state.aiVideoTaskId,status:task.status});
        videoReceiptBlocked=['SUCCEEDED','FAILED','CANCELED','EXPIRED'].indexOf(task.status)<0;
        if(!videoReceiptBlocked)state.aiVideoPending=null;
      }
      if(task.ready){
        videoStatus('AI video je spreman za MP4 preuzimanje. Sadržaj proveriti pre korišćenja na setu.');
        var out=el('sp-video-ai-output');
        if(!out)return;
        out.innerHTML='<button id="sp-ai-mp4-download" type="button" class="sp-btn sp-primary">SAČUVAJ AI MP4</button>'+
          '<button id="sp-ai-mp4-preview" type="button" class="sp-btn">PREGLEDAJ AI MP4</button>'+
          '<p class="sp-note">Rezultat može sadržati promene pokreta, lica ili tekstura; proveriti kontinuitet sa originalom.</p>';
        el('sp-ai-mp4-download').onclick=downloadAIVideo;
        el('sp-ai-mp4-preview').onclick=function(){downloadAIVideo(true);};
      }else videoStatus('Status AI zadatka: '+String(task.status||'nepoznat')+'.');
    }catch(error){videoStatus(error.message,true);}
  }
  async function downloadAIVideo(previewOnly){
    if(!state.aiVideoTaskId)return;
    videoStatus('Preuzimam AI MP4. Za duže klipove preuzimanje može zauzeti memoriju uređaja.');
    try{
      if(previewOnly!==true&&window.Android&&typeof window.Android.saveAiVideo==='function'){
        videoAccess();
        window.Android.saveAiVideo(state.aiVideoTaskId,el('sp-video-auth').value.trim());
        videoStatus('Izaberi lokaciju za MP4. Android prenosi direktno u izabranu datoteku.');
        return;
      }
      var response=await videoRequest('/download/'+state.aiVideoTaskId,{method:'GET'});
      var size=Number(response.headers.get('Content-Length'))||0;
      if(size>140*1024*1024)throw new Error('MP4 previše velik za WebView preuzimanje.');
      var blob=await response.blob();
      if(!blob.size||blob.size>140*1024*1024)throw new Error('Neispravna ili prevelika video datoteka.');
      // Playback must use the actual MP4 bytes returned by the provider, never a storyboard.
      if(state.aiVideoPreviewUrl)URL.revokeObjectURL(state.aiVideoPreviewUrl);
      state.aiVideoPreviewUrl=URL.createObjectURL(blob);
      var player=el('sp-ai-video-player');
      if(!player){
        player=document.createElement('video');player.id='sp-ai-video-player';
        player.controls=true;player.playsInline=true;player.preload='metadata';
        player.style.cssText='display:block;width:100%;max-height:460px;margin:12px 0;background:#000';
        el('sp-video-ai-output').appendChild(player);
      }
      player.src=state.aiVideoPreviewUrl;
      player.load();
      if(previewOnly===true){videoStatus('MP4 pregled je spreman.');return;}
      var file=new File([blob],'LightingAI_AI_Relight.mp4',{type:'video/mp4'});
      if(navigator.canShare&&navigator.canShare({files:[file]})&&navigator.share){
        await navigator.share({title:'LightingAI AI video relight',files:[file]});
        videoStatus('Otvoren izbor za deljenje ili čuvanje MP4 datoteke.');
      }else{
        var url=URL.createObjectURL(blob),a=document.createElement('a');
        a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
        setTimeout(function(){URL.revokeObjectURL(url);},30000);
        videoStatus('Pokrenuto MP4 preuzimanje. Android WebView izvoz se mora proveriti na uređaju.');
      }
    }catch(error){videoStatus('MP4 preuzimanje nije uspelo: '+error.message,true);}
  }
  function onNativeVideoSaved(success){
    videoStatus(success?'AI MP4 je uspešno sačuvan na izabranoj lokaciji.':
      'Čuvanje AI MP4 nije uspelo ili je otkazano.',!success);
  }
  function exportMessage(message,error){
    var box=el('sp-video-export-status');
    if(box){box.textContent=message;box.style.color=error?'#ffc2ae':'#b0edc7';}
  }
  async function exportConceptVideo(){
    if(state.busy||state.videoBusy||!state.videoFile||!state.plan){
      exportMessage('Dodaj video i generiši plan pre izvoza.',true);return;
    }
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){
      exportMessage('Ovaj Android WebView ne podržava lokalni WebM izvoz. Ne pravim lažni video.',true);return;
    }
    var formats=['video/webm;codecs=vp8','video/webm'];
    var mime=formats.find(function(m){return MediaRecorder.isTypeSupported(m);});
    if(!mime){exportMessage('WebM kodiranje nije dostupno na ovom telefonu.',true);return;}
    var source=state.videoUrl;
    if(!source){exportMessage('Video datoteka više nije dostupna.',true);return;}
    var video=document.createElement('video');
    video.src=source;video.muted=true;video.playsInline=true;video.preload='auto';
    var canvas=document.createElement('canvas');
    var ctx=canvas.getContext('2d');
    var recorder=null,raf=0,chunks=[],stream=null;
    var onMetadata=function(){return new Promise(function(resolve,reject){
      if(video.readyState>=1){resolve();return;}
      video.addEventListener('loadedmetadata',resolve,{once:true});
      video.addEventListener('error',function(){reject(new Error('Nije moguće otvoriti video za izvoz.'));},{once:true});
    });};
    try{
      exportMessage('Pripremam lokalni video izvoz…');
      await onMetadata();
      if(video.duration>30)throw new Error('Lokalni WebM izvoz je trenutno ograničen na 30 sekundi.');
      var scale=Math.min(1,720/Math.max(video.videoWidth||720,video.videoHeight||720));
      canvas.width=Math.max(1,Math.round(video.videoWidth*scale));
      canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
      stream=canvas.captureStream(24);
      recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:1600000});
      recorder.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
      var done=new Promise(function(resolve,reject){
        recorder.onstop=resolve;
        recorder.onerror=function(){reject(new Error('Video kodiranje je prekinuto.'));};
      });
      var plan=state.plan;
      function frame(){
        if(video.paused||video.ended)return;
        ctx.save();ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(video,0,0,canvas.width,canvas.height);
        if(plan.look==='Night'||plan.look==='Day for Night'){
          ctx.fillStyle='rgba(10,26,58,0.43)';ctx.fillRect(0,0,canvas.width,canvas.height);
        }else if(plan.look==='Moody'){
          ctx.fillStyle='rgba(4,6,10,0.21)';ctx.fillRect(0,0,canvas.width,canvas.height);
        }
        ctx.fillStyle='rgba(0,0,0,0.62)';ctx.fillRect(0,canvas.height-28,canvas.width,28);
        ctx.fillStyle='#fff';ctx.font='12px sans-serif';
        ctx.fillText('LIGHTINGAI • KONCEPTUALNI VIDEO (NIJE AI RELIGHT)',8,canvas.height-10);
        ctx.restore();raf=requestAnimationFrame(frame);
      }
      recorder.start(1000);
      await video.play();frame();exportMessage('Izvoz u toku — originalni video se obrađuje lokalno (bez zvuka).');
      await new Promise(function(resolve,reject){
        video.onended=resolve;video.onerror=function(){reject(new Error('Video reprodukcija nije uspela.'));};
      });
      cancelAnimationFrame(raf);
      if(recorder.state!=='inactive')recorder.stop();
      await done;
      var output=new Blob(chunks,{type:'video/webm'});
      if(!output.size)throw new Error('Kodirani video je prazan.');
      state.exportedVideo=output;
      if(el('sp-video-share'))el('sp-video-share').disabled=false;
      var filename='LightingAI_ScenePlanner_Concept.webm';
      if(navigator.canShare&&navigator.canShare({files:[new File([output],filename,{type:'video/webm'})]})){
        exportMessage('Konceptualni WebM je spreman. Pritisni PODELI IZVEZENI VIDEO.');
      } else {
        var url=URL.createObjectURL(output),anchor=document.createElement('a');
        anchor.href=url;anchor.download=filename;document.body.appendChild(anchor);anchor.click();anchor.remove();
        setTimeout(function(){URL.revokeObjectURL(url);},20000);
        exportMessage('Pokrenuto preuzimanje WebM snimka. Proveri preuzimanja, naročito na Android WebView-u.');
      }
    }catch(error){exportMessage('Izvoz nije uspeo: '+error.message,true);}
    finally{
      cancelAnimationFrame(raf);video.pause();video.removeAttribute('src');video.load();
      if(recorder&&recorder.state!=='inactive')recorder.stop();
      if(stream)stream.getTracks().forEach(function(track){track.stop();});
    }
  }
  async function shareConceptVideo(){
    if(!state.exportedVideo){exportMessage('Najpre izvezi konceptualni video.',true);return;}
    var filename='LightingAI_ScenePlanner_Concept.webm';
    var file=new File([state.exportedVideo],filename,{type:'video/webm'});
    if(!navigator.share||!navigator.canShare||!navigator.canShare({files:[file]})){
      exportMessage('Deljenje WebM fajla nije podržano u ovom Android WebView-u.',true);return;
    }
    try{await navigator.share({files:[file],title:'LightingAI Scene Planner konceptualni previz'});}
    catch(error){if(error.name!=='AbortError')exportMessage('Deljenje nije uspelo.',true);}
  }
  function exportObject(){
    return {format:'LightingAI.ScenePlanner.v1',savedAt:new Date().toISOString(),
      plan:state.plan,revisionSchemaVersion:1,revisions:revisions,
      notes:'Originalni foto i video materijal nisu uključeni u JSON izvoz.'};
  }
  function restorePlanHistory(){
    if(revisions.length)return true;
    try{
      var saved=localStorage.getItem(REVISION_STORE);if(!saved)return true;
      revisions=core().restoreRevisions(JSON.parse(saved));
      sceneId=revisions[0].sceneId;state.plan=revisions[revisions.length-1].plan;
      renderResult();
      return true;
    }catch(error){historyBlocked=true;status('Istorija revizija nije učitana: '+error.message,true);return false;}
  }
  function remember(){
    if(!state.plan)return;
    try{
      localStorage.setItem(REVISION_STORE,JSON.stringify(revisions));
      localStorage.setItem(STORE,JSON.stringify(exportObject()));
    }catch(e){status('Revizija je u memoriji; lokalno čuvanje nije uspelo. Sačuvaj JSON izvoz.',true);}
  }
  function save(){
    if(!state.plan)return;
    var value=JSON.stringify(exportObject(),null,2),file='LightingAI_ScenePlanner_'+
      new Date().toISOString().replace(/[:.]/g,'-')+'.json';
    if(window.Android&&typeof window.Android.saveText==='function'){
      window.Android.saveText(file,value);
      status('Plan je poslat Android sistemu za čuvanje u JSON formatu.');
    }else{
      var url=URL.createObjectURL(new Blob([value],{type:'application/json'}));
      var a=document.createElement('a');a.href=url;a.download=file;a.click();
      setTimeout(function(){URL.revokeObjectURL(url);},1000);
      status('Pokrenuto čuvanje JSON fajla.');
    }
  }
  function share(){
    if(!state.plan)return;
    var value=resultText(state.plan);
    if(window.Android&&typeof window.Android.shareText==='function'){
      window.Android.shareText('LightingAI Scene Planner',value,'Podeli plan rasvete');
      status('Otvoren Android meni za deljenje.');
    }else{
      try{navigator.clipboard.writeText(value);status('Plan kopiran u clipboard.');}
      catch(e){status('Deljenje nije dostupno na ovom uređaju.',true);}
    }
  }
  function close(){
    releaseCaptures(false);
    state.videoFile=null;state.videoDurationSec=null;
    if(el('sp-video-auth'))el('sp-video-auth').value='';
    if(state.abort){state.abort.abort();state.abort=null;}
    if(state.videoUrl){URL.revokeObjectURL(state.videoUrl);state.videoUrl='';}
    if(state.aiVideoPreviewUrl){URL.revokeObjectURL(state.aiVideoPreviewUrl);state.aiVideoPreviewUrl=null;}
    var wrap=el(MODULE);if(wrap)wrap.remove();
  }
  function releaseCaptures(keepLatest){
    if(window.Android&&typeof window.Android.releaseScenePlannerCaptures==='function')
      window.Android.releaseScenePlannerCaptures(keepLatest===true);
  }
  function closeIfOpen(){if(!el(MODULE))return false;close();return true;}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
  window.LightingAIScenePlanner={open:open,close:close,closeIfOpen:closeIfOpen,
    onNativeVideoSaved:onNativeVideoSaved,version:'0.3-native-mp4-saf-save'};
})();
