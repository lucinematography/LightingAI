(function () {
  'use strict';
  var MODULE='lightingai-scene-planner-overlay';
  var ENTRY='lightingai-scene-planner-entry';
  var API='https://lightingai.onrender.com';
  var STORE='lighting_scene_planner_last_v1';
  var REVISION_STORE='lighting_scene_planner_revisions_v1';
  var revisions=[],sceneId=null,historyBlocked=false;
  var PRELIGHT_STORE='lighting_scene_planner_prelight_reviews_v1';
  var prelightReviews=[],prelightLoaded=false,prelightBlocked=false;
  // Local video samples are not immutable PTS evidence. Bind them to the
  // video session used for the current plan; never reuse an older light plot.
  var videoFrameSession=0,plannedVideoFrameSession=null,selectedFrameCompare=0;
  var VIDEO_RECEIPT='lighting_scene_planner_video_receipt_v1';
  var videoReceipt=null,videoReceiptBlocked=false;
  function emptyState(){return {photo:'',frames:[],videoUrl:'',plan:null,aiPreview:'',busy:false,videoBusy:false,abort:null,videoFile:null,exportedVideo:null,aiStoryboard:[],aiVideoTaskId:null,aiVideoAvailable:false,aiVideoPreviewUrl:null,videoDurationSec:null,aiVideoPending:null,aiVideoCompletedPlan:null};}
  var state=emptyState(),sceneChanging=false,sceneReady=false,photoBusy=false;
  var backupBusy=false,backupPreviewReady=false,backupRequest=null,backupUnlockRequest=null,backupReadSequence=0;
  var ENCRYPTED_BACKUP_LIMIT=34*1024*1024;
  function el(id){return document.getElementById(id);}
  function draft(){return window.LightingAIScenePlannerDraft;}
  function activeRevisionId(){return revisions.length?revisions[revisions.length-1].revisionId:null;}
  var planPersistenceError='',photoPersistenceError='';
  function draftStatus(ok,message){
    var box=el('sp-draft-status');if(!box)return;
    box.textContent=planPersistenceError||photoPersistenceError||message||(ok?'Nacrt se automatski čuva na ovom uređaju.':'Nacrt nije sačuvan.');
    box.style.color=planPersistenceError||photoPersistenceError||!ok?'#ffd1c7':'#c2e8cc';
  }
  function saveDraftPhoto(){return draft()&&state.photo?draft().savePhoto(state.photo):Promise.resolve(false);}
  function storedWorkspace(key){return draft()&&draft().readWorkspaceValue?draft().readWorkspaceValue(key):localStorage.getItem(key);}

  function sceneStorage(){return draft()&&draft().sceneStorage?draft().sceneStorage():localStorage;}
  function renderSceneControls(){
    var picker=el('sp-scene-select'),create=el('sp-scene-create');
    if(!picker||!create)return;
    var supported=draft()&&draft().sceneSupport&&draft().sceneSupport();
    picker.innerHTML=(draft()&&draft().listScenes?draft().listScenes():[]).map(function(s){
      return '<option value="'+esc(s.id)+'">'+esc(s.name)+'</option>';
    }).join('');
    if(draft()&&draft().activeSceneId)picker.value=draft().activeSceneId();
    picker.disabled=create.disabled=!supported||!sceneReady||sceneChanging||backupBusy;
    ['sp-backup-export','sp-backup-import'].forEach(function(id){if(el(id))el(id).disabled=!supported||!sceneReady||sceneChanging||backupBusy;});
  }
  async function changeScene(id,name){
    if(sceneChanging)return;
    if(!sceneReady||photoBusy||backupBusy||state.busy||state.videoBusy||
       state.aiVideoPending&&state.aiVideoPending.started){
      renderSceneControls();status('Sačekaj da se prethodno učitavanje ili obrada završi.',true);return;
    }
    if(!draft()||!draft().sceneSupport()||historyBlocked||prelightBlocked||
       planPersistenceError||photoPersistenceError){
      renderSceneControls();status('Promena scene je blokirana dok prethodni rad nije bezbedno sačuvan.',true);return;
    }
    if(name===undefined&&id===draft().activeSceneId())return;
    sceneChanging=true;renderSceneControls();
    try{
      if(!draft().flush())throw new Error('Nacrt prethodne scene nije sačuvan.');
      if(state.photo&&!await saveDraftPhoto())throw new Error('Fotografija prethodne scene nije sačuvana.');
      close();
      var switched=name===undefined?draft().selectScene(id):draft().createScene(name);
      if(!switched){var error=draft().lastError();open();throw new Error(error||'Scena nije otvorena.');}
      revisions=[];sceneId=null;historyBlocked=false;
      prelightReviews=[];prelightLoaded=false;prelightBlocked=false;
      state=emptyState();planPersistenceError='';photoPersistenceError='';
      videoReceipt=null;videoReceiptBlocked=false;videoFrameSession++;plannedVideoFrameSession=null;selectedFrameCompare=0;
      open();
    }catch(error){status(error.message||'Promena scene nije uspela.',true);}
    finally{sceneChanging=false;renderSceneControls();}
  }

  function backupMessage(message,error){
    var box=el('sp-backup-status');if(!box)return;
    box.textContent=message;box.style.color=error?'#ffd1c7':'#c2e8cc';
  }
  function canUseBackup(){
    if(!sceneReady||photoBusy||backupBusy||sceneChanging||state.busy||state.videoBusy||
       state.aiVideoPending&&state.aiVideoPending.started||historyBlocked||prelightBlocked||planPersistenceError||photoPersistenceError){
      backupMessage('Sačekaj završetak obrade i uspešno čuvanje tekuće scene.',true);return false;
    }
    return true;
  }
  async function exportSceneFile(){
    if(!canUseBackup())return;
    backupBusy=true;renderSceneControls();
    try{
      if(state.photo&&!await saveDraftPhoto())throw new Error('Fotografija nije sačuvana.');
      var data=await draft().exportSceneBackup();
      if(!window.Android||typeof window.Android.exportScenePlannerBackup!=='function')
        throw new Error('Izvoz zahteva aktuelnu Android verziju aplikacije.');
      backupRequest='backup-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
      backupMessage('Unesi i ponovi lozinku u lokalnom Android dijalogu. Šifrovanje može potrajati…');
      if(window.Android.exportScenePlannerBackup(backupRequest,data)!==true)throw new Error('Čuvanje datoteke nije pokrenuto.');
    }catch(error){backupRequest=null;backupBusy=false;renderSceneControls();backupMessage(error.message||'Izvoz nije uspeo.',true);}
  }
  function onBackupSaved(request,saved){
    if(request!==backupRequest)return;
    backupRequest=null;backupBusy=false;renderSceneControls();
    backupMessage(saved?'Šifrovana kopija scene je sačuvana lokalno kao LightingAI_SceneBackup_….encrypted.json.':
      'Kopija nije sačuvana ili je čuvanje otkazano. Proveri slobodan prostor i pokušaj ponovo.',!saved);
  }
  function cancelBackupPreview(){
    if(draft()&&draft().cancelSceneBackup)draft().cancelSceneBackup();
    backupPreviewReady=false;
    if(el('sp-backup-preview'))el('sp-backup-preview').innerHTML='';
  }
  async function previewSceneFile(file){
    if(!canUseBackup())return;
    cancelBackupPreview();backupBusy=true;renderSceneControls();
    var sequence=++backupReadSequence,waiting=false;
    try{
      if(file.size>ENCRYPTED_BACKUP_LIMIT)throw new Error('Datoteka prelazi 34 MiB.');
      var text=await new Promise(function(resolve,reject){
        var reader=new FileReader();
        reader.onload=function(){resolve(String(reader.result));};
        reader.onerror=function(){reject(new Error('Datoteka nije čitljiva.'));};
        reader.readAsText(file.slice(0,ENCRYPTED_BACKUP_LIMIT+1),'UTF-8');
      });
      if(sequence!==backupReadSequence||!el(MODULE))return;
      var envelope=JSON.parse(text);
      if(envelope&&envelope.format==='LightingAI.EncryptedSceneBackup'){
        if(!window.Android||typeof window.Android.unlockScenePlannerBackup!=='function')
          throw new Error('Za otključavanje je potrebna aktuelna Android verzija.');
        backupUnlockRequest='backup-unlock-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
        if(window.Android.unlockScenePlannerBackup(backupUnlockRequest,text)!==true){
          backupUnlockRequest=null;throw new Error('Šifrovana kopija nije podržana ili druga obrada još traje.');
        }
        waiting=true;backupMessage('Unesi lozinku u lokalnom Android dijalogu. Najpre proveravamo autentičnost…');
      }else showBackupPreview(text,false);
    }catch(error){cancelBackupPreview();backupMessage(error.message||'Kopija nije čitljiva.',true);}
    finally{if(sequence===backupReadSequence&&!waiting){backupBusy=false;renderSceneControls();}}
  }
  function onBackupUnlocked(request,text,result){
    if(request!==backupUnlockRequest)return;
    backupUnlockRequest=null;
    try{
      if(result!=='ok'){
        cancelBackupPreview();
        backupMessage(result==='cancelled'?'Otključavanje je otkazano; scene nisu menjane.':
          'Lozinka nije ispravna ili je datoteka oštećena/nepodržana. Scene nisu menjane.',true);return;
      }
      showBackupPreview(text,true);
    }catch(error){cancelBackupPreview();backupMessage('Sadržaj kopije nije podržan; scene nisu menjane.',true);}
    finally{backupBusy=false;renderSceneControls();}
  }
  function showBackupPreview(text,encrypted){
      var preview=draft().previewSceneBackup(text,encrypted);
      var box=el('sp-backup-preview');if(!box){draft().cancelSceneBackup();return;}
      box.innerHTML='<div class="sp-lamp"><p><b>'+(encrypted?'AES-256-GCM: autentičnost je proverena.':'UPOZORENJE: stara NEŠIFROVANA JSON kopija. Privatni sadržaj nije zaštićen lozinkom.')+'</b></p><b>'+esc(preview.name)+'</b>'+
        '<p>Kopija: '+esc(preview.savedAt)+'<br>Revizije: '+preview.revisionCount+' • stručne provere: '+preview.reviewCount+
        ' • fotografija: '+(preview.photo?'DA':'NE')+'</p>'+
        (preview.aiVisualDescription!==null&&preview.aiVisualDescription!==undefined?'<p><b>AI Visual nacrt</b><br>'+esc(preview.aiVisualDescription)+'<br>DP: '+esc(preview.aiVisualDpRequest||'')+'</p>':'')+
        '<p>'+esc(preview.description)+'</p><p>Plan: '+esc(preview.planSummary||'Plan još nije napravljen')+'</p>'+
        (preview.photo?'<img id="sp-backup-photo" class="sp-media" alt="Fotografija iz kopije">':'')+
        '<details><summary>Podešavanja i započeti unosi</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+
        esc(JSON.stringify({settings:preview.settings,pendingMeasurements:preview.pendingMeasurements,pendingPlanFields:preview.pendingPlanFields},null,2))+'</pre></details>'+
        '<p class="sp-note">SHA-256 integritet je proveren; to ne potvrđuje autora, stručnu tačnost ni fizička merenja. '+
        'Originalni video, video kadrovi, AI mediji, originalna fotografija pune rezolucije i globalni inventar nisu uključeni.</p>'+
        '<label><input type="checkbox" id="sp-backup-confirm"> Pregledao sam sadržaj. Dodaj kao NOVU scenu, bez prepisivanja postojećih. Istorijska merenja ne potvrđuju novu fizičku postavku.</label>'+
        '<div class="sp-actions"><button type="button" class="sp-btn" id="sp-backup-apply" disabled>POTVRDI UVOZ NOVE SCENE</button>'+
        '<button type="button" class="sp-btn" id="sp-backup-cancel">OTKAŽI</button></div></div>';
      var image=el('sp-backup-photo');
      backupPreviewReady=!preview.photo;
      if(image){
        image.onload=function(){backupPreviewReady=true;};
        image.onerror=function(){cancelBackupPreview();backupMessage('Fotografija nije čitljiva; uvoz je otkazan.',true);};
        image.src=preview.photo;
      }
      el('sp-backup-confirm').onchange=function(){el('sp-backup-apply').disabled=!this.checked;};
      el('sp-backup-cancel').onclick=function(){cancelBackupPreview();backupMessage('Uvoz je otkazan; scene nisu menjane.');};
      el('sp-backup-apply').onclick=function(){
        if(!backupPreviewReady||!el('sp-backup-confirm').checked){
          backupMessage('Sačekaj pregled fotografije i potvrdi uvoz.',true);return;
        }
        if(!canUseBackup())return;
        backupBusy=true;renderSceneControls();
        try{
          if(!draft().flush())throw new Error('Tekuća scena nije sačuvana.');
          var result=draft().importSceneBackup(true);
          cancelBackupPreview();backupMessage('Dodata je nova scena: '+result.name+'. Nastavi je kroz izbor scena.');
        }catch(error){backupMessage(error.message||'Uvoz nije sačuvan.',true);}
        finally{backupBusy=false;renderSceneControls();}
      };

      backupMessage(encrypted?'Autentičnost je proverena. Pregledaj sadržaj; uvoz još nije izvršen.':
        'UPOZORENJE: nešifrovana kopija. Pregledaj sadržaj; uvoz još nije izvršen.',!encrypted);
  }

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
      if(draft())draft().flush();
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
    sceneReady=false;
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
      '<div class="sp-card"><h2 class="sp-h">FILMSKE SCENE</h2>'+
      '<label for="sp-scene-select">NASTAVI RAD NA SCENI</label><select id="sp-scene-select" class="sp-field" disabled></select>'+
      '<label for="sp-scene-name">NAZIV NOVE SCENE</label><input id="sp-scene-name" class="sp-field" maxlength="80" placeholder="Npr. 12 — kuhinja, noć">'+
      '<button type="button" id="sp-scene-create" class="sp-btn" disabled>NOVA SCENA</button>'+
      '<button type="button" id="sp-continuity-open" class="sp-btn">KONTINUITET — POREDI SAČUVANE SCENE / KADROVE</button><div id="sp-continuity-panel" hidden></div>'+
      '<label>NAZIV KADRA ZA SHOT LIST<input id="sp-continuity-shot-name" class="sp-field" maxlength="80"></label><button type="button" id="sp-continuity-shot" class="sp-btn">SAČUVAJ SAČUVANI PLAN KAO KADAR</button>'+
      '<p class="sp-note">Svaka scena čuva svoj nacrt, fotografiju, plan, revizije i započeta merenja. Promena scene najpre čuva prethodni rad.</p></div>'+
      '<div class="sp-card"><h2 class="sp-h">KOPIJA CELE SCENE</h2>'+
      '<div class="sp-actions"><button type="button" id="sp-backup-export" class="sp-btn">IZVEZI KOPIJU SCENE</button>'+
      '<button type="button" id="sp-backup-import" class="sp-btn">UVEZI KOPIJU — PREGLED</button></div>'+
      '<input id="sp-backup-file" type="file" accept=".json,application/json" hidden>'+
      '<p class="sp-note">Kopija sadrži sačuvanu fotografiju, opis, podešavanja, nacrt i istoriju. Novi izvoz je šifrovan lozinkom (AES-256-GCM). Lozinku čuvaj odvojeno; ne možemo je povratiti. '+
      'Ne sadrži originalni video, izdvojene video kadrove, AI medije, originalnu fotografiju pune rezolucije ni globalni inventar opreme.</p>'+
      '<div id="sp-backup-status" class="sp-note" role="status"></div><div id="sp-backup-preview"></div>'+
      '<div id="sp-imported-note" class="sp-note"></div></div>'+
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
      '<div id="sp-video-note" class="sp-note">Trajanje prati izvorni snimak. Za sada AI koristi do 6 vremenski označenih kadrova; puna video analiza nije dostupna.</div></div></div></div>'+
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
      '<p id="sp-status" role="status" aria-live="polite" class="sp-note" style="min-height:20px;margin:12px 0 0"></p>'+
      '<p id="sp-draft-status" role="status" class="sp-note"></p></div>'+
      '<div id="sp-result" hidden><div class="sp-card"><h2 class="sp-h">VIZUELNI PREVIEW</h2>'+
      '<div id="sp-preview" style="position:relative;overflow:hidden;border-radius:10px;background:#090d13"></div>'+
      '<div class="sp-actions" style="margin-top:12px"><button type="button" class="sp-btn" id="sp-ai-preview">NAPRAVI AI FOTO-PREVIEW</button></div>'+
      '<p class="sp-note">Lokalna simulacija je ilustrativna i nije fotometrijsko merenje. AI foto-preview zahteva mrežu i dostupan servis.</p></div>'+
      '<div class="sp-card"><h2 class="sp-h">2D LIGHT PLOT — PROCENJENI POLOŽAJI</h2>'+
      '<div id="sp-plot"></div><div id="sp-blocking" class="sp-note"></div>'+
      '<div id="sp-motion-preview" class="sp-card" style="margin-top:12px"><b style="color:#f5c542">VIDEO PREVIZ / POKRETNI KONCEPT</b>'+
      '<p class="sp-note">Vremenski sinhronizovan pregled izvornog snimka i procenjenog rasporeda rasvete. Ovo nije AI generisan video.</p>'+
      '<div id="sp-motion-stage"></div>'+ 
      '<div id="sp-shot-cues" class="sp-card" style="margin-top:10px"></div>'+
      '<div id="sp-sample-compare" class="sp-card" style="margin-top:10px"></div>'+
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
      '<div id="sp-summary"></div><div id="sp-camera-result" class="sp-lamp"></div><div id="sp-lights"></div>'+
      '<div id="sp-dop-manual"></div><div id="sp-warnings"></div>'+
      '<div class="sp-actions" style="margin-top:12px"><button type="button" class="sp-btn" id="sp-save">SAČUVAJ PLAN (JSON)</button>'+
      '<button type="button" class="sp-btn" id="sp-share">PODELI PLAN</button></div></div></div></div>';
    document.body.appendChild(wrap);
    el('sp-close').onclick=close;
    renderSceneControls();
    el('sp-scene-select').onchange=function(){changeScene(this.value);};
    el('sp-scene-create').onclick=function(){changeScene(null,el('sp-scene-name').value);};
    el('sp-continuity-open').onclick=function(){
      var box=el('sp-continuity-panel');box.hidden=!box.hidden;
      if(box.hidden)return;
      function mount(){if(box.isConnected)window.LightingAIContinuity.mountSavedComparison(box);}
      if(window.LightingAIContinuity){mount();return;}
      var script=document.createElement('script');script.src='file:///android_asset/continuity-match-shot.js';
      script.onload=mount;script.onerror=function(){box.textContent='Poređenje nije učitano.';};
      document.body.appendChild(script);
    };
    el('sp-continuity-shot').onclick=function(){
      var scene=draft().activeSceneId(),name=el('sp-continuity-shot-name').value;
      function capture(){
        try{var row=window.LightingAIShotList.captureScenePlannerShot(scene,name);
          status('Kadar '+row.name+' je vezan za sačuvanu reviziju '+row.setup.scenePlannerBinding.sequence+'. Osveži spisak u poređenju.');}
        catch(error){status(error.message,true);}
      }
      if(window.LightingAIShotList){capture();return;}
      var script=document.createElement('script');script.src='file:///android_asset/shot-list-planner.js';
      script.onload=capture;script.onerror=function(){status('Shot List nije učitan.',true);};document.body.appendChild(script);
    };
    el('sp-backup-export').onclick=exportSceneFile;
    el('sp-backup-import').onclick=function(){
      if(!canUseBackup())return;
      if(!draft().flush()){backupMessage('Nacrt nije sačuvan; uvoz nije otvoren.',true);return;}
      el('sp-backup-file').click();
    };
    el('sp-backup-file').onchange=function(e){
      var file=e.target.files&&e.target.files[0];e.target.value='';
      if(file)previewSceneFile(file);
    };
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
    if(draft()){
      draft().restore(wrap,null);
      draft().attach(wrap,activeRevisionId,draftStatus);
      draftStatus(!draft().lastError(),draft().lastError());
    }
    loadCore(function(){
      if(el(MODULE)!==wrap)return;
      if(!restorePlanHistory())return;
      if(draft())draft().restore(wrap,activeRevisionId());
      if(draft()&&draft().importedSceneInfo&&draft().importedSceneInfo())
        el('sp-imported-note').textContent='Scena je uvezena iz kopije. Preneta merenja i stručne provere su istorijski zapisi, ne potvrda nove postavke ili novog telefona. Nove potvrde unosiš lično.';
      updateInventory();
      if(draft())draft().loadPhoto().then(function(photo){
        if(!photo||el(MODULE)!==wrap||state.photo)return;
        state.photo=photo;
        var image=el('sp-image');if(image){image.src=photo;image.hidden=false;}
      }).finally(function(){if(el(MODULE)===wrap){sceneReady=true;renderSceneControls();}});
      else {sceneReady=true;renderSceneControls();}
      status('Spremno. Sačuvan plan i nacrt su vraćeni gde je dostupno.');
    });
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
    if(backupBusy||state.busy||state.videoBusy){status('Sačekaj završetak prethodne obrade.',true);return;}
    if(photoBusy){status('Sačekaj čuvanje fotografije.',true);return;}
    photoBusy=true;
    status('Pripremam fotografiju…');
    try{
      state.photo=await optimizePhoto(file);state.aiPreview='';
      // A different source photograph also requires a fresh visual plan.
      plannedVideoFrameSession=null;
      if(state.plan){renderSampledVideoCues();renderMotionStage(0);}
      renderSampledFrameComparison();
      var image=el('sp-image');if(image){image.src=state.photo;image.hidden=false;}
      var photoSaved=await saveDraftPhoto();
      photoPersistenceError=photoSaved?'':'Fotografija nije trajno sačuvana. Sačuvaj original pre zatvaranja aplikacije.';
      if(draft())draft().flush();
      status(photoSaved?'Fotografija dodata i sačuvana na uređaju.':
        'Fotografija je učitana, ali nije trajno sačuvana. Sačuvaj original pre zatvaranja aplikacije.',!photoSaved);
    }catch(e){status(e.message||'Fotografija nije učitana.',true);}
    finally{photoBusy=false;}
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
      // Read only a tiny decoded RGB thumbnail; never persist full pixel arrays.
      // Video colorimetry and camera transfer are unknown, so these are not lux.
      var codes=null;
      try{
        if(core()&&core().summarizeWebViewFrameCodeValues){
          var probe=document.createElement('canvas');probe.width=32;probe.height=32;
          var probeCtx=probe.getContext('2d',{willReadFrequently:true});
          if(probeCtx){
            probeCtx.drawImage(video,0,0,32,32);
            codes=core().summarizeWebViewFrameCodeValues(probeCtx.getImageData(0,0,32,32));
          }
        }
      }catch(unavailablePixels){codes=null;}
      frames.push({timeSec:Number(t.toFixed(2)),image:canvas.toDataURL('image/jpeg',.72),
        codeValues:codes});
    }
    video.removeAttribute('src');video.load();
    return {frames:frames,durationSec:duration};
  }
  async function videoPicked(file,fromCapture){
    if(state.aiVideoPending&&state.aiVideoPending.started){
      status('Prethodni plaćeni AI zahtev još nije razjašnjen. Ne menjaj snimak i ne pokreći novi zahtev.',true);
      return;
    }
    if(state.busy||state.videoBusy){status('Sačekaj završetak prethodne obrade.',true);return;}
    if(!/^video\//.test(file.type)&&file.type) {status('Potreban je video snimak.',true);return;}
    if(file.size>180*1024*1024){status('Video prelazi 180 MB. Skrati snimak i pokušaj ponovo.',true);return;}
    videoFrameSession++;selectedFrameCompare=0;
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
    }finally{
      state.videoBusy=false;
      if(state.plan){renderSampledVideoCues();renderMotionStage(0);}
      renderSampledFrameComparison();
      releaseCaptures(!!fromCapture);
    }
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
    if(el('sp-measured').checked && !req.dimensionsMeasured){
      status('Za zaista izmerene dimenzije unesi širinu i dubinu od 0,5 do 100 m. Nećemo izmišljati ili zaokruživati mere.',true);
      return;
    }
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
      plannedVideoFrameSession=state.frames.length?videoFrameSession:null;
      renderResult();remember();
      if(draft())draft().flush();
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
      ' • očekivani izvori: '+(p.dopLocalVariant&&p.dopLocalVariant.changedLights.length?
        'procena pokrivenosti nije ažurirana nakon DoP izmene':
        (covered.length?covered.map(function(l){return l.id;}).join(', '):'nisu potvrđeni'))+
      (!known.length&&!(p.dopLocalVariant&&p.dopLocalVariant.changedLights.length)?
        ' • UPOZORENJE: nije potvrđen key/ambient na ovom delu putanje.':'');
  }
  function renderMotionStage(index){
    var region=el('sp-motion-stage'),p=state.plan;
    if(!region||!p)return;
    if(!state.frames.length){
      region.innerHTML='<p class="sp-note">Dodaj video da bi pregledao kretanje kroz snimljene kadrove.</p>';
      return;
    }
    if(!hasCurrentVideoPlan()){
      region.innerHTML='<p class="sp-note">Učitani video ili fotografija su promenjeni od planiranja. ' +
        'Napravi novi plan da bi se izbeglo povezivanje starog rasporeda sa drugim snimkom.</p>';
      return;
    }
    var actor=(p.actors||[])[0],path=actor&&actor.path||[];
    var current=path[index]||null;
    var targetTime=current&&current.timeSec!=null?current.timeSec:state.frames[Math.min(index,state.frames.length-1)].timeSec;
    var frame=state.frames.reduce(function(best,f){return Math.abs(f.timeSec-targetTime)<Math.abs(best.timeSec-targetTime)?f:best;},state.frames[0]);
    var selected=state.frames.indexOf(frame);
    var shade=p.look==='Night'||p.look==='Day for Night';
    var filter=shade?'brightness(.53) contrast(1.18) saturate(.70) hue-rotate(12deg)':'contrast(1.06)';
    var changedDoPLights=!!(p.dopLocalVariant&&p.dopLocalVariant.changedLights.length);
    var labels=changedDoPLights?'Pokrivenost nije revidirana posle DoP izmene':
      (p.lights||[]).filter(function(l){return l.coverageStages.includes(index);}).map(function(l){return l.id;}).join(', ');
    region.innerHTML='<div style="position:relative;background:#070d15;border-radius:10px;overflow:hidden">'+
      '<img alt="Referentni kadar '+(selected+1)+'" src="'+frame.image+'" style="width:100%;max-height:350px;object-fit:contain;display:block;filter:'+filter+'">'+
      '<div style="position:absolute;bottom:8px;left:8px;background:#050b11da;border-radius:8px;color:#f5c542;font-size:12px;padding:7px">'+
      'Kadar '+(selected+1)+' / '+state.frames.length+' · '+frame.timeSec.toFixed(1)+' s · osvetljenje: '+esc(labels||'nepotvrđeno')+
      '</div></div>'+
      '<p class="sp-note">Procena izgledа iz izabranog kadra. Svetlosni filter je kreativni prikaz, a ne simulacija stvarnih izvora.</p>';
  }
  // A selected video is usable only by the plan created from this same
  // in-memory sample session. Restored plans cannot silently attach new media.
  function hasCurrentVideoPlan(){
    return !!(state.plan&&state.videoFile&&state.frames.length&&
      plannedVideoFrameSession===videoFrameSession&&
      revisions.length&&revisions[revisions.length-1].plan===state.plan);
  }
  function currentSampledCueSheet(){
    if(!core()||!core().createDopSampledVideoCueSheet||historyBlocked||
       !state.plan||!revisions.length||!state.frames.length||
       !hasCurrentVideoPlan())return null;
    return core().createDopSampledVideoCueSheet(
      revisions[revisions.length-1],
      state.frames.map(function(f){return {timeSec:f.timeSec};}));
  }
  function renderSampledVideoCues(){
    var box=el('sp-shot-cues');if(!box)return;
    if(!state.frames.length){
      box.innerHTML='<p class="sp-note">Dodaj video za vremenski plan po najviše šest uzorkovanih kadrova.</p>';
      return;
    }
    if(!hasCurrentVideoPlan()){
      box.innerHTML='<p class="sp-note">Video ili fotografija su promenjeni. '+
        'Pre vremenskog plana regeneriši Scene Planner za nove kadrove.</p>';
      return;
    }
    var sheet;
    try{sheet=currentSampledCueSheet();}
    catch(error){
      box.textContent='Vremenski plan nije potvrđen: '+error.message;
      return;
    }
    if(!sheet){box.textContent='Nema potvrđene veze kadrova sa aktuelnom revizijom plana.';return;}
    var html='<h3 class="sp-h">DoP — VREMENSKI PLAN SVETLA (UZORKOVANI KADROVI)</h3>'+
      '<p class="sp-note">Revizija '+esc(sheet.revisionId.slice(0,16))+
      ' • plot '+esc(sheet.lightPlotRevisionId.slice(0,16))+
      ' • '+sheet.sampleCount+' približnih WebView kadrova. '+
      'Ovo nisu originalni PTS, analiza svih kadrova ni AI relighting.</p>';
    sheet.cues.forEach(function(cue){
      html+='<details class="sp-lamp"><summary><b>Kadar '+cue.sampleNumber+
        ' • oko '+esc(cue.approximateTimeSec)+' s</b> — '+
        (cue.stageIndex===null?'kretanje nije vremenski potvrđeno':
          'procenjena tačka '+(cue.stageIndex+1))+'</summary>';
      if(cue.stageIndex===null)
        html+='<p class="sp-note">Nema jedinstvene veze sa AI putanjom u ovom trenutku. '+
          'Ne pretpostavljamo izvor, koordinatu glumca ni osvetljenost.</p>';
      else{
        html+='<p>Planirana pokrivenost: '+esc(cue.coverageStatus)+
          ' • 2D položaj glumca: '+esc(cue.estimatedActorPosition.x)+
          '% / '+esc(cue.estimatedActorPosition.y)+'% (AI procena).</p>'+
          (cue.plannedLights.length?'<ul>'+
            cue.plannedLights.map(function(l){
              return '<li>'+esc(l.lightId)+' / '+esc(l.role)+' / '+esc(l.fixtureName)+
                ' — položaj '+esc(l.x)+'/'+esc(l.y)+'%, '+
                'jačina '+esc(fmt(l.intensityPct,'%'))+', '+
                'boja '+esc(fmt(l.kelvin,' K'))+', '+
                'visina '+esc(fmt(l.heightM,' m'))+', '+
                'distanca '+esc(fmt(l.distanceM,' m'))+'</li>';
            }).join('')+'</ul>':
            '<p class="sp-note">Nijedan izvor nije označen za ovu tačku u planu.</p>');
        if(cue.coverageStatus!=='PLANNED_KEY_OR_AMBIENT_ASSIGNED_NOT_PHYSICALLY_VERIFIED')
          html+='<p class="sp-note">Proveriti key/ambient svetlo na ovoj tački. '+
            'To ne dokazuje da je kadar zaista taman.</p>';
      }
      html+='</details>';
    });
    html+='<p class="sp-note">Kamera (predlog): f/'+esc(sheet.cameraProposal.aperture)+
      ', ISO '+esc(sheet.cameraProposal.iso)+', '+esc(sheet.cameraProposal.fps)+
      ' fps, shutter '+esc(sheet.cameraProposal.shutterAngle)+'°, WB '+
      esc(sheet.cameraProposal.whiteBalanceK)+' K, ND '+
      esc(sheet.cameraProposal.ndStops)+' stop. '+
      'Postavka, originalni frame PTS, praćenje glumca, lux i ekspozicija nisu potvrđeni.</p>';
    box.innerHTML=html;
  }
  // Both views use the exact same in-memory WebView JPEG sample. Only the
  // second display applies an illustrative CSS look. No media is rewritten.
  // Derived from the same in-memory samples as the DoP cue sheet. A missing
  // or malformed sample never receives fabricated code statistics.
  function currentCodeValueAudit(){
    if(!hasCurrentVideoPlan()||!core()||!core().createOfflineCodeValueAudit)
      return null;
    return core().createOfflineCodeValueAudit(revisions[revisions.length-1],
      state.frames.map(function(f){
        return {timeSec:f.timeSec,codeValues:f.codeValues||null};
      }));
  }
  function safeCodeValueAudit(){
    try{return currentCodeValueAudit();}
    catch(invalidWebViewSample){return null;}
  }
  function safeSampledJpegDataUri(frame){
    if(!frame||typeof frame.image!=='string'||frame.image.length>3500000||
       frame.image.length<40||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(frame.image))
      return null;
    return frame.image;
  }
  function renderSampledFrameComparison(){
    var box=el('sp-sample-compare');if(!box)return;
    if(!state.videoFile||!state.frames.length){
      box.innerHTML='<p class="sp-note">Dodaj video za poređenje izvornog '+
        'kadra i ilustrativnog izgleda, bez AI videa i bez interneta.</p>';
      return;
    }
    if(!hasCurrentVideoPlan()){
      box.innerHTML='<p class="sp-note"><b>NEPODUDARANJE VIDEA I PLANA.</b> '+
        'Izabran je drugi izvor ili je obnovljena starija revizija. '+
        'Generiši novi plan za izabrani snimak pre poređenja kadrova.</p>';
      return;
    }
    var sheet;
    try{sheet=currentSampledCueSheet();}
    catch(error){
      box.textContent='Vremenske oznake uzoraka nisu potvrđene: '+error.message;
      return;
    }
    if(!sheet||sheet.sampleCount!==state.frames.length||!state.videoUrl){
      box.textContent='Nema potvrđenog lokalnog para uzoraka za aktuelni plan.';
      return;
    }
    selectedFrameCompare=Math.max(0,Math.min(sheet.sampleCount-1,selectedFrameCompare));
    box.innerHTML='<h3 class="sp-h">DoP — IZVORNI KADAR / KREATIVNI LOOK</h3>'+
      '<p class="sp-note">Biraj jedan od '+sheet.sampleCount+
      ' približnih WebView JPEG uzoraka. Obe slike predstavljaju isti izvorni kadar. '+
      'Desno je samo CSS filter za ideju izgleda, ne fizička simulacija niti AI relighting.</p>'+
      '<label for="sp-sample-compare-range">UZORKOVANI VIDEO-KADAR</label>'+
      '<input id="sp-sample-compare-range" type="range" class="sp-field" '+
      'style="padding:5px" min="0" max="'+(sheet.sampleCount-1)+
      '" step="1" value="'+selectedFrameCompare+'">'+
      '<div id="sp-sample-compare-selected"></div>'+
      '<p class="sp-note">Povezano sa revizijom '+esc(sheet.revisionId.slice(0,20))+
      ' i light plotom '+esc(sheet.lightPlotRevisionId.slice(0,20))+
      '; identitet izvornog videa i originalni PTS nisu provereni. '+
      'U JSON izlaz ne dodajemo JPEG piksele.</p>';
    el('sp-sample-compare-range').oninput=function(){
      selectedFrameCompare=Number(this.value)||0;
      renderSampledFrameComparisonSelected(sheet);
    };
    renderSampledFrameComparisonSelected(sheet);
  }
  function renderSampledFrameComparisonSelected(sheet){
    var box=el('sp-sample-compare-selected');if(!box||!hasCurrentVideoPlan())return;
    if(sheet.revisionId!==revisions[revisions.length-1].revisionId||
       sheet.planHash!==revisions[revisions.length-1].planHash){
      box.textContent='Revizija plana se promenila. Ponovo otvori poređenje.';
      return;
    }
    var i=selectedFrameCompare,cue=sheet.cues[i],frame=state.frames[i];
    var image=safeSampledJpegDataUri(frame);
    if(!cue||!frame||!image||cue.sampleNumber!==i+1||
       cue.approximateTimeSec!==frame.timeSec){
      box.textContent='Uzorak nije potvrđen kao JPEG kadar sa odgovarajućom oznakom vremena.';
      return;
    }
    var night=sheet.look==='Night'||sheet.look==='Day for Night';
    var lookFilter=night?'brightness(.53) contrast(1.18) saturate(.70) hue-rotate(12deg)':
      sheet.look==='Moody'?'brightness(.76) contrast(1.21)':'contrast(1.06)';
    var imageBlock=function(label,filter){
      return '<div><p class="sp-note"><b>'+label+'</b></p>'+
        '<img src="'+image+'" alt="'+label+' na približnom vremenskom uzorku" '+
        'style="width:100%;max-height:300px;object-fit:contain;display:block;'+
        'border-radius:9px;filter:'+filter+'"></div>';
    };
    var codeAudit=safeCodeValueAudit();
    var sampleCode=codeAudit&&codeAudit.binding.revisionId===sheet.revisionId&&
      codeAudit.samples[i]&&codeAudit.samples[i].approximateTimeSec===frame.timeSec?
      codeAudit.samples[i]:null;
    var dopChangedLight=!!(state.plan.dopLocalVariant&&
      state.plan.dopLocalVariant.changedLights.length);
    var stageText=cue.stageIndex===null?
      'Veza ovog kadra sa AI tačkom kretanja nije potvrđena.':
      dopChangedLight?
        'DoP je menjao parametre svetala; staru pokrivenost po tačkama treba ponovo proveriti.':
        'Procenjena tačka kretanja: '+(cue.stageIndex+1)+
          '. Dodela svetala je samo plan, ne osvetljenost iz kadra.';
    var stageLights=cue.stageIndex===null||dopChangedLight?[]:cue.plannedLights;
    var cards=state.plan.knowledgeBasis&&Array.isArray(state.plan.knowledgeBasis.cards)?
      state.plan.knowledgeBasis.cards.slice(0,2):[];
    box.innerHTML='<p class="sp-note">Kadar '+(i+1)+'/'+sheet.sampleCount+
      ' • približno '+esc(cue.approximateTimeSec.toFixed(2))+' s. '+esc(stageText)+'</p>'+
      '<div class="sp-two">'+
      imageBlock('IZVORNI JPEG UZORAK','none')+
      imageBlock('KREATIVNI CSS LOOK — NIJE AI RELIGHT',lookFilter)+'</div>'+ 
      (sampleCode&&sampleCode.codeValues?
        '<p class="sp-note"><b>IZVORNI KADAR — RGB KODNE VREDNOSTI (32×32)</b>: '+
        'prosečna Y\u2032 kodna vrednost '+esc(sampleCode.codeValues.meanLumaCode)+'/255; '+
        'P10/P90 '+esc(sampleCode.codeValues.p10LumaCode)+'/'+
        esc(sampleCode.codeValues.p90LumaCode)+'; tamni kodovi (≤16) '+
        esc((sampleCode.codeValues.nearBlackFraction*100).toFixed(1))+'%; '+
        'svetli kodovi (≥235) '+esc((sampleCode.codeValues.nearWhiteFraction*100).toFixed(1))+'%. '+
        (sampleCode.deltaMeanLumaCodeFromPreviousSample===null?'':
          'Razlika prosečnog Y\u2032 koda od prethodnog uzorka: '+
          esc(sampleCode.deltaMeanLumaCodeFromPreviousSample)+' (ne dokazuje flicker).')+
        '</p>':
        '<p class="sp-note">Statistika piksela nije dostupna za ovaj kadar; '+
        'ne izmišljamo svetlinu.</p>')+
      '<p class="sp-note">Očitane su samo 8-bitne RGB vrednosti malog uzorka '+
      'pre kreativnog CSS filtera. Nepoznati su transfer, kolorimetrija, '+
      'stvarna ekspozicija, scene-linear svetlo i kontinuitet između svih kadrova.</p>'+
      '<p class="sp-note">Filter ne računa pojedinačne izvore svetla, '+
      'jačinu, Kelvin, geometriju senke niti parametre ekspozicije.</p>'+
      '<details class="sp-lamp"><summary><b>POSTAVKA DoP PLANA U OVOM PREGLEDU</b></summary>'+
      '<p class="sp-note">Status kadra: '+esc(cue.coverageStatus)+
      '. '+(stageLights.length?
        'Samo planirane svetiljke dodeljene procenjenoj tački.':
        'Nije potvrđena rasveta dodeljena ovom konkretnom kadru.')+'</p>'+
      (stageLights.length?
        '<ul>'+stageLights.map(function(l){
          return '<li>'+esc(l.lightId)+' '+esc(l.role)+' / '+esc(l.fixtureName)+
            ' • '+esc(l.x)+'/'+esc(l.y)+'% • '+fmt(l.intensityPct,'%')+
            ' • '+fmt(l.kelvin,' K')+'</li>';
        }).join('')+'</ul>':'')+
      '<p class="sp-note"><b>UKUPNI PREDLOG POSTAVKE (nije verifikovan po kadru)</b></p>'+
      (state.plan.lights.map(function(l){
        return '<div class="sp-note">'+esc(l.id)+' / '+esc(l.role)+
          ' / '+esc(l.fixtureName)+': X/Y '+esc(l.x)+'/'+esc(l.y)+'%, '+
          'intenzitet '+esc(fmt(l.intensityPct,'%'))+', '+esc(fmt(l.kelvin,' K'))+
          ', visina '+esc(fmt(l.heightM,' m'))+
          ', distanca '+esc(fmt(l.distanceM,' m'))+'.</div>';
      }).join('')||'<p class="sp-note">Nema predloženih svetala.</p>')+
      '<p class="sp-note">Kamera — f/'+esc(sheet.cameraProposal.aperture)+
        ', ISO '+esc(sheet.cameraProposal.iso)+
        ', '+esc(sheet.cameraProposal.fps)+' fps, shutter '+
        esc(sheet.cameraProposal.shutterAngle)+'°, WB '+
        esc(sheet.cameraProposal.whiteBalanceK)+' K, ND '+
        esc(sheet.cameraProposal.ndStops)+' stop (samo kreativni predlog).</p>'+
      (cards.length?
        '<p class="sp-note"><b>POVEZANI PRINCIPI IZ STRUČNE BAZE</b></p>'+
        cards.map(function(card){
          return '<p class="sp-note">'+esc(card.id)+': '+esc(card.principle)+
            ' Provera na setu: '+esc(card.validation)+
            ' Ograničenje: '+esc(card.limitations)+'</p>';
        }).join(''):
        '<p class="sp-note">Ovaj kadar nema zasebnu potvrđenu knjišku potporu.</p>')+
      '</details>'+
      '<p class="sp-note">Nisu provereni izvorni SHA-256 video bajtovi, pravi frame PTS, '+
      'praćenje glumca, lux, ekspozicija, stvarni položaji ili kontinuitet '+
      'svetla kroz sve kadrove. Nema nove video datoteke.</p>';
  }
  function conceptPhoto(plan){
    if(state.videoFile&&state.frames.length&&!hasCurrentVideoPlan())
      return '<p class="sp-note">Snimak je promenjen: regeneriši plan pre konceptualnog prikaza.</p>';
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
  function formatMeterUtcOffset(minutes){
    if(!Number.isInteger(minutes)||minutes< -720||minutes>840)return '';
    var abs=Math.abs(minutes);
    return (minutes<0?'-':'+')+
      String(Math.floor(abs/60)).padStart(2,'0')+':'+String(abs%60).padStart(2,'0');
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
    if(Array.isArray(plan.distanceMeasurements)&&plan.distanceMeasurements.length){
      lines.push('','KORISNIČKI PRIJAVLJENE UDALJENOSTI (NISU NEZAVISNO PROVERENE)');
      plan.distanceMeasurements.forEach(function(m){
        lines.push(m.lightId+' / '+m.fixtureId+': '+m.distanceM+
          ' m od izvora do subjekta u tački merenja; nije merenje osvetljenosti.');
        var ref=plan.photometricBasis&&plan.photometricBasis.entries&&
          plan.photometricBasis.entries.find(function(x){return x.lightId===m.lightId;});
        if(ref&&ref.publishedReferenceAtMeasuredDistance){
          lines.push('Referenca proizvođača za iste nominalne uslove: '+
            ref.publishedReferenceAtMeasuredDistance.lux+' lx (NIJE lux izmeren na setu).');
        }
      });
    }
    if(Array.isArray(plan.opticConfirmations)&&plan.opticConfirmations.length){
      lines.push('','KORISNIK POTVRDIO MONTIRANI REFLEKTOR (NIJE NEZAVISNO PROVEREN)');
      plan.opticConfirmations.forEach(function(a){
        lines.push(a.lightId+' / '+a.fixtureId+': '+a.opticId+
          ' — lično potvrđeno na setu; AI nije identifikovao optički dodatak.');
      });
    }
    if(Array.isArray(plan.incidentLuxReadings)&&plan.incidentLuxReadings.length){
      lines.push('','SVETLOMER — OČITAVANJE KOJE JE PRIJAVIO KORISNIK, NIJE NEZAVISNO PROVERENO');
      plan.incidentLuxReadings.forEach(function(m){
        lines.push(m.lightId+' / '+m.fixtureId+': '+m.lux+' lx na subjektu pri '+
          m.distanceMAtMeasurement+' m; incidentni svetlomer, ovaj reflektor izdvojen, ostali izvori kontrolisani.');
        lines.push(m.protocolVersion===2||m.protocolVersion===3?
          'Instrument: '+m.meterModel+'; tačka: '+m.measurementPoint+
          '; orijentacija: '+m.receptorOrientation+'; vreme: '+(m.measuredAtLocal||'nije navedeno')+
          (m.protocolVersion===3?
            '; ID instrumenta: '+m.meterIdentifier+'; UTC pomeraj: '+formatMeterUtcOffset(m.utcOffsetMinutes)+
            ' (prijavio korisnik).':
            '; V2 lokalni sat bez poznatog UTC pomeraja.')+
          ' Kalibracija: nije nezavisno proverena.':
          'Istorijski zapis bez potpunih podataka o instrumentu i tački merenja.');
        lines.push('Ovo nije fabrički lux, nije AI procena niti dokaz ekspozicije cele scene.');
      });
    }
    if(plan.dopLocalVariant){
      var dop=plan.dopLocalVariant;
      lines.push('','LOKALNA DoP VARIJANTA — IZMENJEN SAMO PLAN',
        'Zahtev: '+dop.reason,
        'Izmenjene lampe: '+dop.changedLights.map(function(x){
          return x.lightId+' ('+x.fields.join(', ')+')';
        }).join('; '),
        'Izmenjeni predloženi parametri kamere: '+(dop.changedCameraFields.join(', ')||'nema'),
        'Bez komandi ka rasveti, stvarne ekspozicije, potvrde sposobnosti lampe ili AI relight videa.');
      (plan.knowledgeBasis&&plan.knowledgeBasis.cards||[]).filter(function(card){
        return dop.bookCardIds.indexOf(card.id)>=0;
      }).forEach(function(card){
        lines.push('Stručni princip '+card.id+': '+card.principle,
          'Provera na setu: '+card.validation,'Ograničenje: '+card.limitations);
      });
    }
    // Text shared with the DoP contains the full validated creative timeline,
    // not just the last label copied into a later on-set measurement revision.
    if(plan===state.plan&&revisions.length&&core().listDopPlannedEditEvents){
      var doPHistory=core().listDopPlannedEditEvents(revisions);
      if(doPHistory.eventCount){
        lines.push('','ISTORIJA DoP KREATIVNIH IZMENA — SAMO PREDLOŽENI PARAMETRI');
        doPHistory.events.forEach(function(item,index){
          lines.push('Izmena '+(index+1)+' (revizije '+item.beforeSequence+' → '+
            item.afterSequence+'): '+item.reason);
          item.lightChanges.forEach(function(c){
            lines.push('Rasveta '+c.lightId+' / '+c.field+': '+
              (c.before===null?'nije uneto':c.before)+' → '+c.after);
          });
          item.cameraChanges.forEach(function(c){
            lines.push('Kamera '+c.field+': '+
              (c.before===null?'nije uneto':c.before)+' → '+c.after);
          });
        });
        lines.push('Provere: istorija je izvedena iz SHA-256 povezanih revizija. '+
          'Nema komandi lampama, potvrđenog lux-a, izmerene ekspozicije ni video relight-a.');
      }
    }
    if(plan===state.plan){
      var sampledSheet=null;
      try{sampledSheet=currentSampledCueSheet();}catch(invalidSampleTimes){
        lines.push('Vremenski plan uzoraka nije potvrđen; potrebne su strogo rastuće oznake vremena.');
      }
      if(sampledSheet){
        lines.push('','DO P — VREMENSKI PLAN (SAMO DO 6 UZORKOVANIH KADROVA)',
          'Revizija: '+sampledSheet.revisionId+' / plot: '+sampledSheet.lightPlotRevisionId,
          'Vremena su približni WebView seek uzorci, ne originalni PTS ili identitet izvornog videa.');
        sampledSheet.cues.forEach(function(cue){
          lines.push('Kadar '+cue.sampleNumber+' oko '+cue.approximateTimeSec+' s: '+
            cue.coverageStatus+
            (cue.stageIndex===null?' / tačka nepoznata':' / procenjena tačka '+(cue.stageIndex+1)));
          cue.plannedLights.forEach(function(light){
            lines.push('  '+light.lightId+' '+light.role+' '+light.fixtureName+
              ' • X/Y '+light.x+'/'+light.y+'% • intenzitet '+
              fmt(light.intensityPct,'%')+' • Kelvin '+fmt(light.kelvin,' K')+
              ' • visina '+fmt(light.heightM,' m')+
              ' • distanca '+fmt(light.distanceM,' m'));
          });
        });
        lines.push('Nema potvrde fotometrije, ekspozicije, fizičkog rasporeda, praćenja glumca ni obrađenog videa.');
      }
    }
    if(plan===state.plan){
      var codeAudit=safeCodeValueAudit();
      if(codeAudit){
        lines.push('','VIDEO — RGB KODNE VREDNOSTI IZ 32×32 WEBVIEW UZORAKA',
          'Prijavljene vrednosti malih uzoraka, bez potvrde izvornog PTS-a, kolorimetrije, ekspozicije ili flicker-a.');
        codeAudit.samples.forEach(function(entry){
          var c=entry.codeValues;
          lines.push('Uzorak '+entry.sampleNumber+' oko '+entry.approximateTimeSec+
            ' s: '+(c?'Y-prime prosečni kod '+c.meanLumaCode+'/255; P10/P90 '+
              c.p10LumaCode+'/'+c.p90LumaCode+'; tamni kodovi '+
              (c.nearBlackFraction*100).toFixed(1)+'%; svetli kodovi '+
              (c.nearWhiteFraction*100).toFixed(1)+'%':'nema dostupnih kodnih vrednosti'));
        });
        lines.push('Razlike između ovih vremenski razmaknutih uzoraka ne potvrđuju treperenje niti stabilan relighting.');
      }
    }
    if(plan.sceneIncidentLuxReading){
      var sceneMeterText=plan.sceneIncidentLuxReading;
      lines.push('','CELA POSTAVKA — KORISNIKOVO OČITAVANJE NA JEDNOJ TAČKI (NE EKSPОZICIJA)',
        sceneMeterText.lux+' lx, svi prijavljeni aktivni izvori i ambijent u mernoj tački. '+
        'Svetlomer: '+sceneMeterText.meterModel+' / '+sceneMeterText.meterIdentifier+
        '; tačka: '+sceneMeterText.measurementPoint+
        '; lokalno vreme: '+sceneMeterText.measuredAtLocal+
        '; UTC: '+formatMeterUtcOffset(sceneMeterText.utcOffsetMinutes),
        'Status: prijavio korisnik, bez nezavisne kalibracije/validacije. '+
        'Ne sabirati sa izolovanim izvorima; ne računati blendu, ISO ni kontrast kadra.');
    }
    if(revisions.length&&core().compareKeyFillMeasurements){
      var keys=plan.lights.filter(function(l){return l.role==='key'&&l.available;});
      var fills=plan.lights.filter(function(l){return l.role==='fill'&&l.available;});
      if(keys.length===1&&fills.length===1){
        var comparison=core().compareKeyFillMeasurements(revisions[revisions.length-1],keys[0].id,fills[0].id);
        lines.push('','KEY/FILL — ODNOS IZDVOJENIH MERENJA, NIJE KONTRAST SCENE');
        lines.push(comparison.status==='COMPARABLE_BY_USER_REPORTED_PROTOCOL_ONLY'?
          'Odnos '+comparison.ratio+':1 ('+comparison.keyLux+' lx / '+comparison.fillLux+
          ' lx); instrument i metapodaci prijavljeni od korisnika, nezavisno nepotvrđeni.':
          'Nije uporedivo: '+comparison.reason);
        lines.push('Knjiški principi prisutni u planu: '+(comparison.bookCardIds.join(', ')||'nema'));
        if(comparison.status==='COMPARABLE_BY_USER_REPORTED_PROTOCOL_ONLY'){
          lines.push('Razlika izolovanih doprinosa: '+comparison.relativeStops+
            ' stop (key minus fill); ovo nije kontrast slike niti izmerena ekspozicija.');
          lines.push('Osnova vremena: '+comparison.timeBasis+
            '; identitet uređaja i kalibracija nisu nezavisno provereni.');
        }
        (comparison.bookGuidance||[]).forEach(function(card){
          lines.push('Kartica '+card.id+': '+card.principle,
            'Primena: '+card.application,'Provera: '+card.validation,
            'Ograničenje: '+card.limitations);
        });
      }
    }
    if(revisions.length&&core().analyzeMeteredExposureContext){
      var keyForExposure=plan.lights.filter(function(l){return l.role==='key'&&l.available;});
      var fillForExposure=plan.lights.filter(function(l){return l.role==='fill'&&l.available;});
      var exposure=core().analyzeMeteredExposureContext(revisions[revisions.length-1],
        keyForExposure.length===1?keyForExposure[0].id:null,
        fillForExposure.length===1?fillForExposure[0].id:null);
      lines.push('','KAMERA — MATEMATIČKA OSNOVA, NE MERENJE EKSPOZICIJE',
        'Nominalni EV100 postavke: '+exposure.camera.nominalSettingsEv100+
        ' (f-broj, shutter, ISO i ND; NIJE mereni EV scene).',
        'Iz lux očitavanja nisu računati blenda, ISO, ukupni lux scene ni ekspozicija kamere.');
      var alignment=exposure.sceneMeterAlignment;
      lines.push('','METAPODACI TRI MERENJA — KEY, FILL I CELA POSTAVKA',
        alignment.status==='ALIGNED_BY_USER_REPORTED_METADATA_ONLY'?
          'Usklađeni samo prijavljeni podaci: '+alignment.meterModel+
          ' / '+alignment.meterIdentifier+' / '+alignment.measurementPoint+
          '; najveći razmak '+alignment.minutesSpan+' min. Očitano key '+
          alignment.keyLux+' lx, fill '+alignment.fillLux+' lx, cela postavka '+
          alignment.sceneLux+' lx, bez nezavisne provere.':
          'Nisu usklađeni ili nepotpuni: '+alignment.reason,
        'Očitavanja su iz različitih fizičkih stanja; NE sabirati, ne oduzimati i ne izvoditi ambient lux, ekspoziciju, ISO ili blendu.');
      (alignment.bookGuidance||[]).forEach(function(card){
        lines.push('Kartica '+card.id+': '+card.principle,
          'Provera: '+card.validation,'Ograničenje: '+card.limitations);
      });
      var camWave=exposure.cameraWaveformEvidence;
      if(camWave.status==='USER_REPORTED_GRAY_CARD_SIGNAL_NOT_CALIBRATED'){
        lines.push('','SIVA KARTA — KORISNIKOVO OČITAVANJE WAVEFORM-A, NE KALIBRISANA EKSPOZICIJA',
          'Očitano '+camWave.waveformIre+' IRE; kamera '+camWave.cameraModel+
          '; profil '+camWave.recordingProfile+'; signal '+camWave.signalPath+
          '; instrument '+camWave.waveformSource+'; karta '+camWave.grayCardIdentifier+
          '; protokol V'+camWave.protocolVersion+
          (camWave.protocolVersion===2?
            '; opseg '+camWave.signalCodeRange+'; opaženi transfer '+camWave.observedTransferLabel+
            '; monitoring transform '+(camWave.monitoringTransformId||'nije prijavljen')+
            '; vezani signalni kontekst '+camWave.signalContextHash:'; V1 bez detaljnog signalnog konteksta')+
          '; merna tačka '+camWave.measurementPoint+
          '; čas '+camWave.measuredAtLocal+' UTC '+formatMeterUtcOffset(camWave.utcOffsetMinutes)+
          '; razmak od svetlomera '+camWave.sceneMeterMinutesApart+' minuta.');
        if(camWave.referenceDifferenceIrePoints!==null){
          lines.push('Korisnički zadat referentni nivo: '+camWave.userReferenceIre+
            ' IRE ('+camWave.userReferenceBasis+'); razlika '+camWave.referenceDifferenceIrePoints+
            ' IRE poena, status '+camWave.referenceComparisonStatus+
            '; NIJE promena ekspozicije u stopima niti potvrda pravilnog eksponiranja.');
        }else lines.push('Nema korisnički unetog referentnog nivoa; nije predložen univerzalni IRE.');
        (camWave.bookGuidance||[]).forEach(function(card){
          lines.push('Kartica '+card.id+': '+card.principle,
            'Provera: '+card.validation,'Ograničenje: '+card.limitations);
        });
        lines.push('Signal, opseg, profil, LUT, kalibracija kamere, monitora i refleksija karte NIŠTA od toga nije nezavisno provereno. '+
          'Nema izvedenog ISO, blende, T-stop-a, scene EV ili ukupne ekspozicije.');
      }
    }
    // Compare true new measurements, not copied records on child revisions.
    if(revisions.length&&core().compareGrayCardWaveformRevisions&&
      core().listGrayCardWaveformCaptures&&
      revisions[revisions.length-1].plan.cameraGrayCardWaveformReading){
      var captureIndex=core().listGrayCardWaveformCaptures(revisions);
      if(captureIndex.currentWaveformInherited){
        lines.push('','PORЕKLO WAVEFORM OČITAVANJA',
          'Aktuelna revizija '+captureIndex.currentRevisionId+
          ' samo čuva ranije očitavanje iz '+captureIndex.activeCaptureRevisionId+
          '; nije novo merenje.');
      }
      if(captureIndex.captureRevisionIds.length>=2){
        var previousCaptureId=captureIndex.captureRevisionIds[captureIndex.captureRevisionIds.length-2];
        var newestCaptureId=captureIndex.captureRevisionIds[captureIndex.captureRevisionIds.length-1];
        var comparison=core().compareGrayCardWaveformRevisions(
          revisions,previousCaptureId,newestCaptureId);
        lines.push('','POREĐENJE DVA STVARNO PRIJAVLJENA WAVEFORM OČITAVANJA',
          'Pre: '+comparison.beforeRevisionId+'; posle: '+comparison.afterRevisionId);
        if(comparison.status==='USER_REPORTED_IRE_LEVEL_DIFFERENCE_ONLY'){
          lines.push('Pre '+comparison.beforeIre+' IRE; posle '+comparison.afterIre+
            ' IRE; razlika '+comparison.deltaIrePoints+' IRE poena za sivu kartu '+
            comparison.grayCardIdentifier+' na tački '+comparison.measurementPoint+
            '. Razmak očitavanja '+comparison.minutesBetween+' min.',
            'Da li se PLANIRANA postavka promenila: '+
            (comparison.plannedSetupFingerprintMatches?'ne prema otisku plana':'da prema otisku plana')+
            '. Fizička postavka, ambijentalna stabilnost, signal i kalibracija nisu nezavisno potvrđeni.');
        }else lines.push('Poređenje odbijeno: '+comparison.reason+
          '. IRE brojevi nisu sabirani ili pogrešno pretvarani u ekspozicione stope.');
        (comparison.bookGuidance||[]).forEach(function(card){
          lines.push('Princip '+card.id+': '+card.principle,
            'Praktična provera: '+card.validation,
            'Ograničenje: '+card.limitations);
        });
        lines.push('Nema izvedenog ISO, blende, log-EV, kontrasta kadra ili automatskog saveta za lampu.');
      }
    }
    if(revisions.length&&core().listSceneIncidentLuxCaptures&&
      core().compareSceneIncidentLuxRevisions&&
      revisions[revisions.length-1].plan.sceneIncidentLuxReading){
      var sceneCaptures=core().listSceneIncidentLuxCaptures(revisions);
      if(sceneCaptures.currentReadingInherited){
        lines.push('','POREKLO UKUPNOG LUX OČITAVANJA',
          'Aktuelna revizija '+sceneCaptures.currentRevisionId+
          ' prenosi korisničko očitavanje iz '+sceneCaptures.activeCaptureRevisionId+
          '; ovo nije novo merenje.');
      }
      if(sceneCaptures.captureRevisionIds.length>=2){
        var sceneBeforeId=sceneCaptures.captureRevisionIds[sceneCaptures.captureRevisionIds.length-2];
        var sceneAfterId=sceneCaptures.captureRevisionIds[sceneCaptures.captureRevisionIds.length-1];
        var sceneDiff=core().compareSceneIncidentLuxRevisions(revisions,sceneBeforeId,sceneAfterId);
        lines.push('','POREĐENJE DVA STVARNA OČITAVANJA UKUPNE OSVETLJENOSTI',
          'Pre: '+sceneDiff.beforeRevisionId+'; posle: '+sceneDiff.afterRevisionId);
        if(sceneDiff.status==='USER_REPORTED_INCIDENT_ILLUMINANCE_DIFFERENCE_ONLY'){
          lines.push('Na istoj prijavljenoj tački '+sceneDiff.measurementPoint+
            ' uz isti prijavljeni svetlomer '+sceneDiff.meterModel+' / '+sceneDiff.meterIdentifier+
            ': '+sceneDiff.beforeLux+' lx ranije, '+sceneDiff.afterLux+
            ' lx kasnije; razlika '+sceneDiff.deltaLux+' lx.'+
            ' Vremenski razmak '+sceneDiff.minutesBetween+' minuta.',
            sceneDiff.ratio!==null?
              'Odnos ukupnog incidentnog svetla: '+sceneDiff.ratio+
              ':1; relativna promena osvetljenosti '+sceneDiff.relativeIlluminanceStops+
              ' stopa (NIJE promena ekspozicije kamere).':
              'Nije izračunat odnos/stop razlika: '+sceneDiff.ratioReason+'.',
            'Otisak predložene postavke: '+
              (sceneDiff.plannedSetupFingerprintMatches?'isti.':'promenjen.')+
            ' Ovo ne potvrđuje stvarni raspored reflektora ni stabilnost ambijenta.');
        }else lines.push('Očitavanja scene nisu uporediva: '+sceneDiff.reason+
          '; ne izvodimo odnos niti relativne stope.');
        (sceneDiff.bookGuidance||[]).forEach(function(card){
          lines.push('Stručni princip '+card.id+': '+card.principle,
            'Provera na setu: '+card.validation,'Ograničenje: '+card.limitations);
        });
        lines.push('Bez automatskog ISO, blende, scene EV, kontrasta kadra ili promene lampi.');
      }
    }
    lines.push('','OGRANIČENJA',...plan.limitations,'','BEZBEDNOST',...plan.safetyNotes);
    return lines.join('\n');
  }
  function renderResult(){
    var plan=state.plan;if(!plan||!el('sp-result'))return;
    el('sp-result').hidden=false;
    el('sp-summary').innerHTML='<div style="line-height:1.55">'+esc(plan.summary)+'</div>'+
      '<p class="sp-note">'+esc(plan.rationale)+'</p>'+
      '<div class="sp-pill" style="display:inline-block">'+(plan.source==='ai'?'AI PREDLOG':'LOKALNI KONCEPT')+
      ' • '+(plan.mode==='own'?'SAMO MOJA OPREMA':'NAJBOLJA RASVETA')+
      (plan.dopLocalVariant?' • DoP LOKALNO IZMENJEN PLAN':'')+'</div><div id="sp-prelight"></div>';
    var current=revisions[revisions.length-1];
    if(current)el('sp-summary').innerHTML+='<p class="sp-note">Revizija '+current.sequence+
      ' • '+esc(current.sceneId)+'<br>Light plot: '+esc(current.lightPlotRevisionId)+
      '<br>SHA-256: '+esc(current.planHash)+'</p>';
    if(plan.knowledgeBasis&&plan.knowledgeBasis.cards&&plan.knowledgeBasis.cards.length){
      el('sp-summary').innerHTML+='<details class="sp-lamp"><summary><b>Stručna baza: knjige i obrazloženja ('+
        plan.knowledgeBasis.cards.length+')</b></summary>'+
        '<p class="sp-note">Kurirani principi; stranice još nisu nezavisno stručno potvrđene. Nisu fotometrijska merenja.</p>'+
        plan.knowledgeBasis.cards.map(function(c){
          return '<div class="sp-note"><b>'+esc(c.title)+'</b><div>'+esc(c.principle)+'</div>'+
            '<div>Primena: '+esc(c.application)+'</div><div>Provera na setu: '+esc(c.validation||'Potrebna provera sa direktorom fotografije.')+'</div><div>Ograničenja: '+esc(c.limitations)+'</div>'+
            (c.references||[]).map(function(r){return '<div>Izvor: '+esc(r.author||r.source)+
              ' — '+esc(r.title||'Nepoznat naslov')+(r.edition?' ('+esc(r.edition)+')':'')+
              ' • PDF str. '+esc(r.pdfPage)+' • štampana str. '+esc(r.printedPage)+'</div>';}).join('')+'</div>';
        }).join('')+'</details>';
    }
    if(plan.source==='ai'&&plan.knowledgeBasis&&Array.isArray(plan.knowledgeBasis.cards)&&
       !plan.knowledgeBasis.cards.length){
      el('sp-summary').innerHTML+='<p class="sp-note">Stručna baza: za ovaj opis scene nisu pronađeni odgovarajući kurirani principi iz knjiga. AI predlog nema knjišku potporu; proveriti sa direktorom fotografije.</p>';
    }
    if(plan.photometricBasis && Array.isArray(plan.photometricBasis.entries) &&
       plan.photometricBasis.entries.length){
      var ph=plan.photometricBasis;
      el('sp-summary').innerHTML+='<details class="sp-lamp"><summary><b>Fotometrija proizvođača — referentni podaci ('+
        ph.entries.length+')</b></summary>'+
        '<p class="sp-note">Objavljene vrednosti proizvođača, a NE stvarni lux na setu. Važe samo za navedenu distancu, 5600 K, 100% izlaza, spot/flood položaj i bez dodatnih modifikatora. AI distance i položaji nisu izmereni. Potvrditi svetlomerom.</p>'+
        '<p class="sp-note">'+(ph.geometry&&ph.geometry.userMarkedMeasured?
          'Dimenzije prostorije korisnik je označio kao izmerene; koordinate reflektora su i dalje AI procene.':
          'Dimenzije nisu označene kao izmerene; metrički položaji nisu dostupni.')+'</p>'+
        ph.entries.map(function(e){
          return '<div class="sp-note"><b>'+esc(e.lightId)+' / '+esc(e.fixtureId)+'</b>'+
            '<div>Izvor proizvođača: '+esc(e.sourceUrl)+'</div>'+
            '<div>Referentni uslovi: '+esc(e.cctK)+' K, '+esc(e.outputPct)+'% izlaza; '+(e.requiresAttestedOptic?
              'tačno navedeni optički reflektor iz tabele; status montaže je korisnička potvrda.':
              'spot/flood bez modifikatora.')+'</div>'+
            '<div>Objavljeno (ne na setu): '+e.samples.map(function(s){
              return (s.opticId?esc(s.opticId)+' / ':'')+esc(s.beamAngleDeg)+'° / '+esc(s.distanceM)+' m: '+esc(s.lux)+' lx';
            }).join(' • ')+'</div>'+
            (e.requiresAttestedOptic?'<div>Montirani optički dodatak: '+
              (e.attestedOpticId?esc(e.attestedOpticId)+' (prijavio i potvrdio korisnik, nije nezavisno provereno)':
                'NIJE POTVRĐEN')+'</div>':'')+
            '<div>Parametri plana: '+(e.configurationMatchesReference?
              'nominalno odgovaraju tabeli, ali distanca i stvarni izlaz nisu potvrđeni.':
              'ne odgovaraju u potpunosti uslovima tabele — ne koristiti tabelu za obračun ekspozicije.')+'</div>'+
            '<div>Procena položaja u planu: x ~'+fmt(e.estimatedXMetres,' m')+
              ', y ~'+fmt(e.estimatedYMetres,' m')+' (nije fizičko merenje pozicije).</div>'+
            '<div>Knjiški principi: '+esc((e.bookCardIds||[]).join(', ')||'nema posebno povezanog principa')+'</div>'+
            '<div>Udaljenost do subjekta koju je korisnik potvrdio: '+
              (e.measuredDistanceM==null?'nije prijavljena':esc(e.measuredDistanceM)+' m (nije nezavisno proverena)')+'</div>'+
            (e.publishedReferenceAtMeasuredDistance?
              '<div>Referenca proizvođača ZA ISTU UDALJENOST I PRIJAVLJENI OPTIČKI DODATAK: '+
              (e.publishedReferenceAtMeasuredDistance.opticId?
                esc(e.publishedReferenceAtMeasuredDistance.opticId)+' / ':'')+
              esc(e.publishedReferenceAtMeasuredDistance.lux)+
              ' lx pri '+esc(e.publishedReferenceAtMeasuredDistance.beamAngleDeg)+
              '° — NIJE merenje scene i ne dokazuje ekspoziciju.</div>':
              '<div>Nema pouzdanog poklapanja sa tačnom tabelom proizvođača. Lux ne računamo interpolacijom.</div>')+
            '<div>Stvarni lux: nije izmeren; proveriti svetlomerom i kamerom na setu.</div></div>';
        }).join('')+'</details>';
    }
    if(current&&core().compareKeyFillMeasurements){
      var keyLights=plan.lights.filter(function(l){return l.role==='key'&&l.available;});
      var fillLights=plan.lights.filter(function(l){return l.role==='fill'&&l.available;});
      if(keyLights.length===1&&fillLights.length===1){
        var pair=core().compareKeyFillMeasurements(current,keyLights[0].id,fillLights[0].id);
        var bookDetails=(pair.bookGuidance||[]).map(function(card){
          return '<div><b>'+esc(card.id)+' — '+esc(card.title)+'</b>: '+esc(card.principle)+
            '<div>Primena: '+esc(card.application)+'</div>'+
            '<div>Praktična provera: '+esc(card.validation)+'</div>'+
            '<div>Ograničenje: '+esc(card.limitations)+'</div></div>';
        }).join('');
        el('sp-summary').innerHTML+='<details class="sp-lamp"><summary><b>KEY / FILL — PROVERA UPOREDIVOSTI</b></summary>'+
          (pair.status==='COMPARABLE_BY_USER_REPORTED_PROTOCOL_ONLY'?
            '<p>'+esc(pair.ratio)+':1, key '+esc(pair.keyLux)+' lx / fill '+esc(pair.fillLux)+
            ' lx; razlika '+esc(pair.relativeStops)+' stop (key minus fill). To su samo izolovani doprinosi, ne kontrast kadra ili ekspozicija.</p>'+
            '<p>Osnova poređenja: '+(pair.meterProtocolVersion===3?
              'V3 — prijavljeni ID svetlomera i UTC pomeraj oba očitavanja.':
              'V2 — lokalni sat bez UTC pomeraja; vremenska uporedivost nije potpuna.')+
            ' Kalibracija i identitet instrumenta nisu nezavisno provereni.</p>':
            '<p>Odnos nije pouzdano uporediv: '+esc(pair.reason)+'. Razlika u stopama se ne računa.</p>')+
          '<p>Kurirani stručni principi iz ovog plana: '+esc(pair.bookCardIds.join(', ')||'nema relevantne kartice')+
          '. Bez univerzalnog idealnog odnosa; proveriti senke i izgled kamerom. Očitavanja, identitet i kalibracija instrumenta nisu nezavisno potvrđeni.</p>'+
          bookDetails+'</details>';
      }
    }
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
    if(cameraBox&&current&&core().analyzeMeteredExposureContext){
      var meterKeys=plan.lights.filter(function(l){return l.role==='key'&&l.available;});
      var meterFills=plan.lights.filter(function(l){return l.role==='fill'&&l.available;});
      var cameraEvidence=core().analyzeMeteredExposureContext(current,
        meterKeys.length===1?meterKeys[0].id:null,
        meterFills.length===1?meterFills[0].id:null);
      cameraBox.innerHTML+='<p class="sp-note"><b>EV100 PODEŠAVANJA (MATEMATIČKI, NIJE MERENJE): </b>'+
        esc(cameraEvidence.camera.nominalSettingsEv100)+
        '. Računato samo iz f-broja, zatvarača, ISO i prijavljenog ND-a. '+
        (cameraEvidence.status==='RELATIVE_LIGHT_CONTRIBUTIONS_ONLY'?
          'Postoji uporediv par izolovanih očitavanja; pokazuje samo relativnu razliku svetla. ':
          'Nema uporedivog key/fill para ('+esc(cameraEvidence.incidentEvidence.blocker)+'). ')+
        (cameraEvidence.sceneIncidentEvidence.status==='USER_REPORTED_COMBINED_INCIDENT_LUX_NOT_VERIFIED'?
          'Korisnik je prijavio '+esc(cameraEvidence.sceneIncidentEvidence.userReportedLux)+
          ' lx sa celom postavkom u jednoj tački; ovo NIJE izračunato niti nezavisno provereno. ':
          'Nema prijavljenog zasebnog incidentnog očitavanja cele postavke. ')+
        'EV scene, stvarna ekspozicija, ukupni lux cele slike i preporučena blenda/ISO nisu izračunati. '+
        'Za validaciju: potvrditi kalibraciju instrumenta, profil kamere, gray card i waveform.</p>';
      var alignment=cameraEvidence.sceneMeterAlignment;
      cameraBox.innerHTML+='<details class="sp-lamp"><summary><b>METAPODACI TRI MERENJA — KEY / FILL / SCENA</b></summary>'+
        (alignment.status==='ALIGNED_BY_USER_REPORTED_METADATA_ONLY'?
          '<p>Protokol se poklapa prema prijavljenim podacima: isti model/ID svetlomera, tačka, '+
          'orijentacija senzora prema kameri i najviše 15 minuta između SVA tri merenja. '+
          'Razmak '+esc(alignment.minutesSpan)+' min; key '+esc(alignment.keyLux)+
          ' lx, fill '+esc(alignment.fillLux)+' lx, svi izvori '+esc(alignment.sceneLux)+' lx.</p>':
          '<p>Podaci nisu uporedivi kao jedna merna sesija: <b>'+
          esc(alignment.reason)+'</b>. Nije izveden trostruki proračun.</p>')+
        '<p class="sp-note">Ovo su tri različita stanja osvetljenja. Ne sabirati ili oduzimati očitavanja radi dobijanja ambijentalnog lux-a ili doprinosa izvora. '+
        'Fizička postavka, promena ambijenta, kalibracija i ekspozicija kamere nisu nezavisno potvrđeni. '+
        'ISO, blenda, T-stop, kontrast kadra i EV scene ostaju nepotvrđeni.</p>'+
        (alignment.bookGuidance||[]).map(function(card){
          return '<div class="sp-note"><b>'+esc(card.id)+' — '+esc(card.title)+'</b>'+
            '<div>Princip: '+esc(card.principle)+'</div>'+
            '<div>Provera: '+esc(card.validation)+'</div>'+
            '<div>Ograničenje: '+esc(card.limitations)+'</div></div>';
        }).join('')+'</details>';
    }
    if(cameraBox&&current&&plan.mode==='own'&&plan.lights.some(function(l){return l.available;})){
      var combined=plan.sceneIncidentLuxReading||null;
      cameraBox.innerHTML+='<details class="sp-lamp"><summary><b>SCENA — SVETLOMER, SVI IZVORI + AMBIJENT</b></summary>'+
        (combined?
          '<p class="sp-note"><b>Korisnik prijavio: '+esc(combined.lux)+' lx</b> na '+esc(combined.measurementPoint)+
          ' (svi predviđeni izvori i ambijent u toj tački). Instrument: '+
          esc(combined.meterModel)+' / '+esc(combined.meterIdentifier)+
          '; '+esc(combined.measuredAtLocal)+' UTC '+esc(formatMeterUtcOffset(combined.utcOffsetMinutes))+
          '. Nije potvrđena kalibracija ni ekspozicija kamere.</p>':
          '<p class="sp-note">Nema očitavanja ukupne postavke. Izolovana key/fill merenja i tabele proizvođača nisu zamena.</p>')+
        '<label for="sp-scene-total-lux">INCIDENTNI LUX U JEDNOJ TAČKI SCENE (0–1000000)</label>'+
        '<input id="sp-scene-total-lux" class="sp-field" type="number" min="0" max="1000000" step="0.001" value="'+
          (combined?esc(combined.lux):'')+'">'+
        '<label for="sp-scene-total-meter-model">MODEL SVETLOMERA</label>'+
        '<input id="sp-scene-total-meter-model" class="sp-field" maxlength="120" value="'+
          esc(combined&&combined.meterModel||'')+'">'+
        '<label for="sp-scene-total-meter-id">OZNAKA KONKRETNOG UREĐAJA</label>'+
        '<input id="sp-scene-total-meter-id" class="sp-field" maxlength="80" value="'+
          esc(combined&&combined.meterIdentifier||'')+'">'+
        '<label for="sp-scene-total-point">TAČKA MERENJA (SUBJEKAT)</label>'+
        '<input id="sp-scene-total-point" class="sp-field" maxlength="100" value="'+
          esc(combined&&combined.measurementPoint||'')+'">'+
        '<label for="sp-scene-total-time">LOKALNI DATUM I VREME MERENJA</label>'+
        '<input id="sp-scene-total-time" class="sp-field" type="datetime-local" value="'+
          esc(combined&&combined.measuredAtLocal||'')+'">'+
        '<label for="sp-scene-total-offset">UTC POMERAJ U TRENUTKU MERENJA (NPR. +02:00)</label>'+
        '<input id="sp-scene-total-offset" class="sp-field" maxlength="6" placeholder="+02:00" value="'+
          esc(combined?formatMeterUtcOffset(combined.utcOffsetMinutes):'')+'">'+
        '<label style="display:flex;gap:7px;align-items:center"><input type="checkbox" id="sp-scene-total-measured">'+
        ' Potvrđujem da sam fizički očitao incidentni svetlomer, senzor prema kameri</label>'+
        '<label style="display:flex;gap:7px;align-items:center"><input type="checkbox" id="sp-scene-total-active">'+
        ' Potvrđujem da su svi planirani dostupni izvori bili aktivni, uključujući ambijentalno svetlo</label>'+
        '<button type="button" class="sp-btn" id="sp-save-scene-total">SAČUVAJ OČITAVANJE SCENE — NOVA REVIZIJA</button>'+
        '<p class="sp-note">Merena je samo jedna tačka, ne cela slika. Predloženi parametri lampi i kamere nisu nezavisno provereni. '+
        'Vrednost se ne koristi za izvođenje ISO, blende, EV scene ili kontrasta; promena rastojanja ili optike briše očitavanje samo iz nove revizije.</p></details>';
      var sceneButton=el('sp-save-scene-total');
      if(sceneButton)sceneButton.onclick=function(){
        if(state.busy||historyBlocked||!revisions.length)return;
        if(!el('sp-scene-total-measured').checked||!el('sp-scene-total-active').checked){
          status('Potvrdi stvarno očitavanje i stanje svih izvora na setu.',true);return;
        }
        try{
          var revision=core().createSceneIncidentLuxRevision(revisions[revisions.length-1],{
            confirmed:true,allSourcesActiveConfirmed:true,
            lux:el('sp-scene-total-lux').value,
            meterModel:el('sp-scene-total-meter-model').value,
            meterIdentifier:el('sp-scene-total-meter-id').value,
            measurementPoint:el('sp-scene-total-point').value,
            measuredAtLocal:el('sp-scene-total-time').value,
            measuredUtcOffset:el('sp-scene-total-offset').value
          });
          revisions=revisions.concat([revision]);state.plan=revision.plan;
          renderResult();remember();
          status('Ukupno očitavanje jedne tačke sačuvano kao korisnički prijavljeno; ekspozicija nije kalibrisana.');
        }catch(error){status('Očitavanje scene nije sačuvano: '+error.message,true);}
      };
    }
    if(cameraBox&&current&&plan.mode==='own'&&plan.sceneIncidentLuxReading&&
      core().createCameraGrayCardWaveformRevision){
      var recordedWave=plan.cameraGrayCardWaveformReading||null;
      var cameraWaveEvidence=cameraEvidence&&cameraEvidence.cameraWaveformEvidence;
      var scenePoint=plan.sceneIncidentLuxReading.measurementPoint;
      cameraBox.innerHTML+='<details class="sp-lamp"><summary><b>KAMERA — SIVA KARTA / WAVEFORM (RUČNO OČITAVANJE)</b></summary>'+
        (recordedWave?
          '<p class="sp-note"><b>Prijavljeno: '+esc(recordedWave.waveformIre)+' IRE</b> na sivoj karti '+
            esc(recordedWave.grayCardIdentifier)+'; kamera '+esc(recordedWave.cameraModel)+
            '; profil '+esc(recordedWave.recordingProfile)+'; signal '+esc(recordedWave.signalPath)+
            '; izvor '+esc(recordedWave.waveformSource)+
            (recordedWave.protocolVersion===2?
              '; signalni opseg '+esc(recordedWave.signalCodeRange)+
              '; opaženi transfer '+esc(recordedWave.observedTransferLabel)+
              '; monitoring transform '+esc(recordedWave.monitoringTransformId||'nije naveden')+'. ':
              '. Istorijski V1 bez precizno zabeleženog signalnog opsega i monitoring konteksta. ')+
            (cameraWaveEvidence&&cameraWaveEvidence.referenceDifferenceIrePoints!==null?
              'Korisnička referenca '+esc(cameraWaveEvidence.userReferenceIre)+
              ' IRE; razlika '+esc(cameraWaveEvidence.referenceDifferenceIrePoints)+
              ' IRE poena (nije u stopima). Status: '+esc(cameraWaveEvidence.referenceComparisonStatus)+'. ':
              'Nema zadate reference, pa nema poređenja. ')+
            'Korisnički prijavljeno; nije nezavisno provereno.</p>':
          '<p class="sp-note">Nema prijavljenog waveform očitavanja sive karte. '+
          'Očitavanje će biti povezano sa svetlomerom cele postavke i podešavanjima kamere u ovoj reviziji.</p>')+
        '<p class="sp-note">Tačka: <b>'+esc(scenePoint)+'</b>. Koristi istu poziciju kao za merenje scene, '+
        'sa svim raspoloživim izvorima uključenim. Karta ne mora biti fabrički potvrđena 18%.</p>'+
        '<label for="sp-waveform-ire">OČITANI WAVEFORM NIVO SIVE KARTE (0–109 IRE, 1 DECIMALA)</label>'+
        '<input id="sp-waveform-ire" class="sp-field" type="number" min="0" max="109" step="0.1" placeholder="npr. 42.5" value="'+
          (recordedWave?esc(recordedWave.waveformIre):'')+'">'+
        '<label for="sp-waveform-camera-model">MODEL KAMERE (KORISNIK PRIJAVLJUJE)</label>'+
        '<input id="sp-waveform-camera-model" class="sp-field" maxlength="120" value="'+
          esc(recordedWave&&recordedWave.cameraModel||'')+'">'+
        '<label for="sp-waveform-profile">STVARNI PROFIL SNIMANJA / GAMMA</label>'+
        '<input id="sp-waveform-profile" class="sp-field" maxlength="120" placeholder="npr. LogC4, S-Log3..." value="'+
          esc(recordedWave&&recordedWave.recordingProfile||'')+'">'+
        '<label for="sp-waveform-card">OZNAKA FIZIČKE SIVE KARTE</label>'+
        '<input id="sp-waveform-card" class="sp-field" maxlength="100" placeholder="npr. kartica A" value="'+
          esc(recordedWave&&recordedWave.grayCardIdentifier||'')+'">'+
        '<label for="sp-waveform-source">GDE JE WAVEFORM OČITAN?</label>'+
        '<select id="sp-waveform-source" class="sp-field">'+
          '<option value="">Izaberi instrument</option>'+
          '<option value="CAMERA_INTERNAL"'+(recordedWave&&recordedWave.waveformSource==='CAMERA_INTERNAL'?' selected':'')+
            '>U samoj kameri</option>'+
          '<option value="EXTERNAL_MONITOR"'+(recordedWave&&recordedWave.waveformSource==='EXTERNAL_MONITOR'?' selected':'')+
            '>Na spoljašnjem monitoru</option></select>'+
        '<label for="sp-waveform-path">KAKAV SIGNAL MERI WAVEFORM?</label>'+
        '<select id="sp-waveform-path" class="sp-field">'+
          '<option value="UNKNOWN"'+(!recordedWave||recordedWave.signalPath==='UNKNOWN'?' selected':'')+
            '>Nije sigurno / ne znam</option>'+
          '<option value="RECORDING_SIGNAL"'+(recordedWave&&recordedWave.signalPath==='RECORDING_SIGNAL'?' selected':'')+
            '>Signal zapisa (bez monitoring LUT-a)</option>'+
          '<option value="DISPLAY_LUT_SIGNAL"'+(recordedWave&&recordedWave.signalPath==='DISPLAY_LUT_SIGNAL'?' selected':'')+
            '>Signal sa monitoring LUT-om / display transformacijom</option></select>'+
        '<label for="sp-waveform-code-range">OPSEG SIGNALA KOJI WAVEFORM PRIKAZUJE</label>'+
        '<select id="sp-waveform-code-range" class="sp-field">'+
          '<option value="UNKNOWN"'+(!recordedWave||recordedWave.signalCodeRange==='UNKNOWN'||
            recordedWave.protocolVersion===1?' selected':'')+'>Ne znam</option>'+
          '<option value="VIDEO_LEGAL"'+(recordedWave&&recordedWave.signalCodeRange==='VIDEO_LEGAL'?' selected':'')+
            '>Video / legal range (prijavljen)</option>'+
          '<option value="FULL_DATA"'+(recordedWave&&recordedWave.signalCodeRange==='FULL_DATA'?' selected':'')+
            '>Full data range (prijavljen)</option></select>'+
        '<label for="sp-waveform-transfer">OPAŽENA TRANSFER FUNKCIJA / IZLAZNI PROFIL WAVEFORM-A</label>'+
        '<input id="sp-waveform-transfer" class="sp-field" maxlength="120" '+
          'placeholder="npr. monitoring Rec.709 posle LUT-a ili recording Log" value="'+
          esc(recordedWave&&recordedWave.observedTransferLabel||'')+'">'+
        '<label for="sp-waveform-lut">TAČNO IME MONITORING LUT-a / TRANSFORMACIJE (ako se meri display/LUT signal)</label>'+
        '<input id="sp-waveform-lut" class="sp-field" maxlength="120" '+
          'placeholder="Ostavi prazno ako se meri originalni recording signal" value="'+
          esc(recordedWave&&recordedWave.monitoringTransformId||'')+'">'+
        '<label for="sp-waveform-time">LOKALNI DATUM I VREME OČITAVANJA</label>'+
        '<input id="sp-waveform-time" class="sp-field" type="datetime-local" value="'+
          esc(recordedWave&&recordedWave.measuredAtLocal||'')+'">'+
        '<label for="sp-waveform-offset">UTC POMERAJ U TRENUTKU OČITAVANJA</label>'+
        '<input id="sp-waveform-offset" class="sp-field" maxlength="6" placeholder="+02:00" value="'+
          (recordedWave?esc(formatMeterUtcOffset(recordedWave.utcOffsetMinutes)):'')+'">'+
        '<label for="sp-waveform-target">OPCIONI REFERENTNI NIVO (IRE, SAMO KORISNIK UNOSI)</label>'+
        '<input id="sp-waveform-target" class="sp-field" type="number" min="0" max="109" step="0.1" placeholder="Ostavi prazno bez sopstvene reference" value="'+
          (recordedWave&&recordedWave.userReferenceIre!==null?esc(recordedWave.userReferenceIre):'')+'">'+
        '<label for="sp-waveform-basis">OPCIONI IZVOR TVOJE REFERENTNE VREDNOSTI</label>'+
        '<input id="sp-waveform-basis" class="sp-field" maxlength="180" placeholder="Kamera, profil, monitoring LUT i odluka DoP-a" value="'+
          esc(recordedWave&&recordedWave.referenceBasis||'')+'">'+
        '<label style="display:flex;gap:7px"><input type="checkbox" id="sp-waveform-reference-confirmed">'+
          ' Ako unosim IRE referencu, potvrđujem da se odnosi na baš ovu kameru, profil, opaženi transfer, '+
          'opseg signala i navedeni monitoring LUT / putanju, na osnovu izvora koji sam upisao</label>'+
        '<label style="display:flex;gap:7px"><input type="checkbox" id="sp-waveform-card-confirmed">'+
          ' Potvrđujem da sam postavio sivu kartu u istoj tački i očitao waveform</label>'+
        '<label style="display:flex;gap:7px"><input type="checkbox" id="sp-waveform-camera-confirmed">'+
          ' Potvrđujem da stvarna kamera ima ISO, blendu, shutter, fps i ND iz prikazanog plana</label>'+
        '<label style="display:flex;gap:7px"><input type="checkbox" id="sp-waveform-lights-confirmed">'+
          ' Potvrđujem da je cela planirana rasveta sa ambijentom bila aktivna</label>'+
        '<button type="button" class="sp-btn" id="sp-save-waveform">SAČUVAJ WAVEFORM KAO NOVU REVIZIJU</button>'+
        '<p class="sp-note">Nivo sive karte zavisi od profila, LUT-a, monitoringa i refleksije karte. '+
          'Reference NEMA po podrazumevanim pravilima: ako je unosiš, navedi njen konkretan izvor, '+
          'odaberi poznat opseg i signalni put, a za display signal upiši tačan monitoring LUT. '+
          'V2 zahteva i tvoju potvrdu da referenca važi za tu istu signalnu konfiguraciju. '+
          'Ako bilo šta nije poznato, sačuvaj samo opaženo očitavanje bez reference. '+
          'Stari V1 zapisi nisu automatski unapređeni. Razlika u IRE poenima nije promena ekspozicije u stopima. '+
          'Ne računamo ISO, blendu, lux ili EV scene iz IRE-a.</p></details>';
      var saveWave=el('sp-save-waveform');
      if(saveWave)saveWave.onclick=function(){
        if(state.busy||historyBlocked||!revisions.length)return;
        if(!el('sp-waveform-card-confirmed').checked||
          !el('sp-waveform-camera-confirmed').checked||
          !el('sp-waveform-lights-confirmed').checked){
          status('Potvrdi fizičku sivu kartu, ista podešavanja kamere i rasvetnu postavku.',true);return;
        }
        try{
          var next=core().createCameraGrayCardWaveformRevision(revisions[revisions.length-1],{
            confirmed:true,grayCardPlacedConfirmed:true,cameraSettingsMatchedConfirmed:true,
            allSourcesActiveConfirmed:true,
            waveformIre:el('sp-waveform-ire').value,
            cameraModel:el('sp-waveform-camera-model').value,
            recordingProfile:el('sp-waveform-profile').value,
            grayCardIdentifier:el('sp-waveform-card').value,
            measurementPoint:scenePoint,
            waveformSource:el('sp-waveform-source').value,
            signalPath:el('sp-waveform-path').value,
            protocolVersion:2,
            signalCodeRange:el('sp-waveform-code-range').value,
            observedTransferLabel:el('sp-waveform-transfer').value,
            monitoringTransformId:el('sp-waveform-lut').value,
            referenceContextConfirmed:el('sp-waveform-reference-confirmed').checked,
            measuredAtLocal:el('sp-waveform-time').value,
            measuredUtcOffset:el('sp-waveform-offset').value,
            userReferenceIre:el('sp-waveform-target').value,
            referenceBasis:el('sp-waveform-basis').value
          });
          revisions=revisions.concat([next]);state.plan=next.plan;
          renderResult();remember();
          status('Prijavljeno očitavanje sive karte je sačuvano u novoj reviziji. Ekspozicija nije kalibrisana.');
        }catch(error){status('Waveform očitavanje nije sačuvano: '+error.message,true);}
      };
    }
    // A copied whole-scene lux record is not another measurement.
    if(cameraBox&&current&&current.plan.sceneIncidentLuxReading&&
      core().listSceneIncidentLuxCaptures&&core().compareSceneIncidentLuxRevisions){
      var sceneHistory=core().listSceneIncidentLuxCaptures(revisions);
      if(sceneHistory.currentReadingInherited){
        cameraBox.innerHTML+='<p class="sp-note">UKUPNI LUX: trenutna revizija samo prenosi '+
          'staro očitavanje iz '+esc(sceneHistory.activeCaptureRevisionId)+
          '; to NIJE novo merenje.</p>';
      }
      if(sceneHistory.captureRevisionIds.length>=2){
        var firstSceneId=sceneHistory.captureRevisionIds[sceneHistory.captureRevisionIds.length-2];
        var secondSceneId=sceneHistory.captureRevisionIds[sceneHistory.captureRevisionIds.length-1];
        var sceneComparison=core().compareSceneIncidentLuxRevisions(
          revisions,firstSceneId,secondSceneId);
        cameraBox.innerHTML+='<details class="sp-lamp"><summary><b>DoP — POREĐENJE UKUPNOG LUX-A SCENE</b></summary>'+
          '<p class="sp-note">Dva stvarna korisnički evidentirana merenja: '+
          esc(sceneComparison.beforeRevisionId)+' i '+esc(sceneComparison.afterRevisionId)+'</p>'+
          (sceneComparison.status==='USER_REPORTED_INCIDENT_ILLUMINANCE_DIFFERENCE_ONLY'?
            '<p>Pre '+esc(sceneComparison.beforeLux)+' lx; posle '+
            esc(sceneComparison.afterLux)+' lx; promena '+
            esc(sceneComparison.deltaLux)+' lx. Svetlomer '+esc(sceneComparison.meterModel)+
            ' / '+esc(sceneComparison.meterIdentifier)+' na tački '+
            esc(sceneComparison.measurementPoint)+'; razmak '+
            esc(sceneComparison.minutesBetween)+' minuta.</p>'+
            (sceneComparison.ratio!==null?
              '<p>Odnos ukupne prijavljene incidentne osvetljenosti: '+
              esc(sceneComparison.ratio)+':1; '+esc(sceneComparison.relativeIlluminanceStops)+
              ' stopa promene OSVETLJENOSTI, NE ekspozicije kamere.</p>':
              '<p>Lux očitavanje je nula; nema konačnog odnosa niti razlike u stopama.</p>')+
            '<p class="sp-note">Otisak PLANIRANE postavke: '+
              (sceneComparison.plannedSetupFingerprintMatches?'isti.':'različit.')+
              ' Stvarni dimmer, ambijent, promena svetla i pozicije nisu nezavisno provereni.</p>':
            '<p>Poređenje odbijeno: <b>'+esc(sceneComparison.reason)+
              '</b>. Proveri svetlomer, identitet, mernu tačku i vremenski razmak.</p>')+
          '<p class="sp-note">Obe vrednosti su korisnički prijavljene, sa svim planiranim izvorima i ambijentom. '+
          'Ovo nije kontrast kadra, zbir key/fill izvora, scena EV, ISO ili predlog blende. '+
          'Svetlomer, kalibracija, fizička postavka i promena ambijenta nisu nezavisno provereni.</p>'+
          (sceneComparison.bookGuidance||[]).map(function(card){
            return '<div class="sp-note"><b>'+esc(card.id)+' — '+esc(card.title)+'</b>'+
              '<div>Princip: '+esc(card.principle)+'</div>'+
              '<div>Praktična provera: '+esc(card.validation)+'</div>'+
              '<div>Ograničenje: '+esc(card.limitations)+'</div></div>';
          }).join('')+'</details>';
      }else{
        cameraBox.innerHTML+='<p class="sp-note">Za poređenje ukupnog lux-a scene '+
          'potrebna su dva zasebna stvarna očitavanja na istom mestu u razmaku do 15 minuta. '+
          'Kopija starog očitavanja ne računa se kao novo merenje.</p>';
      }
    }
    // A revision may inherit an older waveform. Show only actual distinct
    // capture events, verified against the intact history by the core.
    if(cameraBox&&current&&current.plan.cameraGrayCardWaveformReading&&
      core().compareGrayCardWaveformRevisions&&core().listGrayCardWaveformCaptures){
      var capturedHistory=core().listGrayCardWaveformCaptures(revisions);
      if(capturedHistory.currentWaveformInherited){
        cameraBox.innerHTML+='<p class="sp-note">PAŽNJA: trenutna revizija samo prenosi '+
          'postojeće waveform očitavanje iz revizije '+
          esc(capturedHistory.activeCaptureRevisionId)+
          '; nije izvršeno novo očitavanje na kameri.</p>';
      }
      if(capturedHistory.captureRevisionIds.length>=2){
        var beforeCaptureId=capturedHistory.captureRevisionIds[capturedHistory.captureRevisionIds.length-2];
        var afterCaptureId=capturedHistory.captureRevisionIds[capturedHistory.captureRevisionIds.length-1];
        var beforeAfter=core().compareGrayCardWaveformRevisions(
          revisions,beforeCaptureId,afterCaptureId);
        cameraBox.innerHTML+='<details class="sp-lamp"><summary><b>POREĐENJE DVA WAVEFORM OČITAVANJA — DoP</b></summary>'+
          '<p class="sp-note">Stvarna evidentiranja: ranije '+esc(beforeAfter.beforeRevisionId)+
          '; kasnije '+esc(beforeAfter.afterRevisionId)+'</p>'+
          (beforeAfter.status==='USER_REPORTED_IRE_LEVEL_DIFFERENCE_ONLY'?
            '<p>Ranije '+esc(beforeAfter.beforeIre)+' IRE; kasnije '+
            esc(beforeAfter.afterIre)+' IRE; promena '+
            esc(beforeAfter.deltaIrePoints)+' IRE poena. '+
            'Ista korisnički prijavljena kamera, profil, signalni opseg, transfer, LUT, '+
            'identifikator sive karte i merna tačka; razmak '+
            esc(beforeAfter.minutesBetween)+' min.</p>'+
            '<p>Otisak PLANIRANE postavke: '+
            (beforeAfter.plannedSetupFingerprintMatches?
              'isti.':'različit.')+
            ' To nije dokaz stvarne postavke, stabilnog ambijenta ili pravilne ekspozicije.</p>':
            '<p>Poređenje nije dozvoljeno: <b>'+esc(beforeAfter.reason)+
            '</b>. Zahteva se ista prijavljena signalna putanja i V2 zapis oba očitavanja.</p>')+
          '<p class="sp-note">Razlika u IRE poenima nije razlika u ekspozicionim stopama. '+
          'Ne menjamo ISO, blendu ili reflektore; ne pripisujemo razliku isključivo osvetljenju. '+
          'Proveri ambijent, blokiranje, senke i kamerin waveform za sve kadrove.</p>'+
          (beforeAfter.bookGuidance||[]).map(function(card){
            return '<div class="sp-note"><b>'+esc(card.id)+' — '+esc(card.title)+'</b>'+
              '<div>Princip: '+esc(card.principle)+'</div>'+
              '<div>Praktična provera: '+esc(card.validation)+'</div>'+
              '<div>Ograničenje: '+esc(card.limitations)+'</div></div>';
          }).join('')+'</details>';
      }else{
        cameraBox.innerHTML+='<p class="sp-note">Za poređenje sa ranijom postavkom '+
          'potrebna su dva različita stvarno zabeležena V2 waveform očitavanja. '+
          'Prepisivanje istog očitavanja u novu reviziju ne računa se kao novo merenje. '+
          'Sačuvaj sledeće očitavanje sa stvarnim vremenom posle dokumentovanog merenja scene.</p>';
      }
    }
    el('sp-plot').innerHTML=plotSvg(plan,current);
    renderBlocking();
    renderSampledVideoCues();
    renderSampledFrameComparison();
    el('sp-preview').innerHTML=conceptPhoto(plan);
    el('sp-lights').innerHTML=plan.lights.length?plan.lights.map(function(l){
      var opticBasis=plan.photometricBasis&&Array.isArray(plan.photometricBasis.entries)?
        plan.photometricBasis.entries.find(function(e){
          return e.lightId===l.id&&e.fixtureId===l.fixtureId&&e.requiresAttestedOptic;
        }):null;
      var mounted=(plan.opticConfirmations||[]).find(function(a){return a.lightId===l.id;});
      var measuredDistance=(plan.distanceMeasurements||[]).find(function(a){return a.lightId===l.id;});
      var meterReading=(plan.incidentLuxReadings||[]).find(function(a){return a.lightId===l.id;});
      var availableOptics=opticBasis?(opticBasis.samples||[]).filter(function(sample,i,all){
        return sample.opticId&&all.findIndex(function(s){return s.opticId===sample.opticId;})===i;
      }):[];
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
        '<p style="font-size:13px;line-height:1.4;margin:9px 0 0">'+esc(l.why)+'</p>'+
        (plan.mode==='own'&&l.available?
          '<div class="sp-note" style="margin-top:12px;padding-top:10px;border-top:1px solid #4b4b4b">'+
          '<label for="sp-distance-'+esc(l.id)+'">IZMERENA UDALJENOST REFLEKTOR–SUBJEKAT U TAČKI MERENJA (m)</label>'+
          '<input class="sp-field" id="sp-distance-'+esc(l.id)+'" type="number" min="0.1" max="100" step="any" placeholder="0.1–100" value="'+
          esc(((plan.distanceMeasurements||[]).find(function(m){return m.lightId===l.id;})||{}).distanceM||'')+'">'+
          '<label style="display:flex;align-items:center;gap:7px;margin:7px 0">'+
          '<input type="checkbox" id="sp-distance-verified-'+esc(l.id)+'"> Lično potvrđujem merenje na setu; AI nije merio distancu</label>'+
          '<button type="button" class="sp-btn" data-sp-distance-light="'+esc(l.id)+'">SAČUVAJ MERENJE KAO NOVU REVIZIJU</button>'+
          '<div>Izmerena je samo udaljenost koju korisnik prijavljuje, ne i lux, smer snopa ili ekspozicija.</div></div>':'')+
        (plan.mode==='own'&&l.available&&opticBasis&&availableOptics.length?
          '<div class="sp-note" style="margin-top:12px;padding-top:10px;border-top:1px solid #4b4b4b">'+
          '<label for="sp-optic-'+esc(l.id)+'">FIZIČKI MONTIRANI REFLEKTOR (NE AI PREDLOG)</label>'+
          '<select id="sp-optic-'+esc(l.id)+'" class="sp-field">'+
          '<option value="">Izaberi provereni dodatak</option>'+
          availableOptics.map(function(o){
            return '<option value="'+esc(o.opticId)+'"'+
              (mounted&&mounted.opticId===o.opticId?' selected':'')+'>'+
              esc(o.opticId)+' ('+esc(o.beamAngleDeg)+'°)</option>';
          }).join('')+'</select>'+
          '<label style="display:flex;align-items:center;gap:7px;margin:7px 0">'+
          '<input type="checkbox" id="sp-optic-confirmed-'+esc(l.id)+'">'+
          ' Potvrđujem da sam fizički proverio montirani dodatak na setu</label>'+
          '<button type="button" class="sp-btn" data-sp-optic-light="'+esc(l.id)+'">'+
          'POTVRDI OPTIČKI DODATAK — NOVA REVIZIJA</button>'+
          '<div>Potvrda dodatka nije potvrda jačine, Kelvina ili lux vrednosti na setu.</div></div>':'')+
        (plan.mode==='own'&&l.available?
          '<div class="sp-note" style="margin-top:12px;padding-top:10px;border-top:1px solid #4b4b4b">'+
          '<b>SVETLOMER NA SETU — NIJE FABRIČKI PODATAK</b>'+
          (meterReading?
            '<div>Korisnik prijavio: '+esc(meterReading.lux)+' lx sa incidentnog svetlomera pri '+
              esc(meterReading.distanceMAtMeasurement)+
              ' m, samo ovaj izvor, ostali izvori kontrolisani. Nije nezavisno provereno.</div>'+
            (meterReading.protocolVersion===2||meterReading.protocolVersion===3?
              '<div>Instrument: '+esc(meterReading.meterModel)+'; tačka: '+
              esc(meterReading.measurementPoint)+'; orijentacija: '+
              esc(meterReading.receptorOrientation)+
              (meterReading.protocolVersion===3?
                '; ID: '+esc(meterReading.meterIdentifier)+
                '; UTC pomeraj: '+esc(formatMeterUtcOffset(meterReading.utcOffsetMinutes)):
                '; V2 lokalno vreme — UTC pomeraj nije zabeležen')+
              '. Kalibracija nepotvrđena.</div>':
              '<div>Istorijski zapis: nepotpuni podaci o instrumentu i mestu merenja.</div>'):
            '<div>Nema korisnički prijavljenog lux očitavanja za ovu postavku.</div>')+
          (measuredDistance?
            '<label for="sp-incident-'+esc(l.id)+'">OČITANJE INCIDENTNOG SVETLOMERA NA SUBJEKTU (lx)</label>'+
            '<input class="sp-field" type="number" id="sp-incident-'+esc(l.id)+
              '" min="0" max="1000000" step="0.001" placeholder="0–1000000" value="'+
              (meterReading?esc(meterReading.lux):'')+'">'+
            '<label style="display:flex;align-items:center;gap:7px;margin:7px 0">'+
            '<input type="checkbox" id="sp-incident-confirmed-'+esc(l.id)+'">'+
              ' Potvrđujem očitavanje svetlomerom i da je ovaj izvor izdvojen, a ostali kontrolisani</label>'+
            '<button type="button" class="sp-btn" data-sp-incident-light="'+esc(l.id)+'">'+
              'SAČUVAJ OČITAVANJE — NOVA REVIZIJA</button>':
            '<div>Prvo sačuvaj stvarno izmerenu udaljenost ovog reflektora do subjekta.</div>')+
          (measuredDistance?
            '<label for="sp-meter-model-'+esc(l.id)+'">MODEL / IDENTIFIKACIJA SVETLOMERA</label>'+
            '<input class="sp-field" id="sp-meter-model-'+esc(l.id)+'" maxlength="120" placeholder="Npr. model instrumenta" value="'+
            esc(meterReading&&meterReading.meterModel||'')+'">'+
            '<label for="sp-meter-point-'+esc(l.id)+'">OZNAKA MERNE TAČKE</label>'+
            '<input class="sp-field" id="sp-meter-point-'+esc(l.id)+'" maxlength="100" placeholder="Npr. lice glumca, pozicija A" value="'+
            esc(meterReading&&meterReading.measurementPoint||'')+'">'+
            '<label for="sp-meter-orientation-'+esc(l.id)+'">ORIJENTACIJA SENZORA</label>'+
            '<select class="sp-field" id="sp-meter-orientation-'+esc(l.id)+'">'+
            '<option value="">Izaberi orijentaciju</option>'+
            '<option value="RECEPTOR_TOWARD_FIXTURE"'+(meterReading&&meterReading.receptorOrientation==='RECEPTOR_TOWARD_FIXTURE'?' selected':'')+'>Prema merenom izvoru</option>'+
            '<option value="RECEPTOR_TOWARD_CAMERA"'+(meterReading&&meterReading.receptorOrientation==='RECEPTOR_TOWARD_CAMERA'?' selected':'')+'>Prema kameri</option></select>'+
            '<label for="sp-meter-time-'+esc(l.id)+'">LOKALNO VREME MERENJA (za poređenje obavezno)</label>'+
            '<input class="sp-field" type="datetime-local" id="sp-meter-time-'+esc(l.id)+'" value="'+
            esc(meterReading&&meterReading.measuredAtLocal||'')+'">'+
            '<label for="sp-meter-identifier-'+esc(l.id)+'">OZNAKA KONKRETNOG SVETLOMERA (za V3)</label>'+
            '<input class="sp-field" id="sp-meter-identifier-'+esc(l.id)+'" maxlength="80" placeholder="Npr. inventarski ID uređaja" value="'+
            esc(meterReading&&meterReading.protocolVersion===3?meterReading.meterIdentifier:'')+'">'+
            '<label for="sp-meter-offset-'+esc(l.id)+'">UTC POMERAJ U TRENUTKU MERENJA (za V3, npr. +02:00)</label>'+
            '<input class="sp-field" id="sp-meter-offset-'+esc(l.id)+'" maxlength="6" placeholder="+02:00" value="'+
            esc(meterReading&&meterReading.protocolVersion===3?
              formatMeterUtcOffset(meterReading.utcOffsetMinutes):'')+'">':'')+
          '<div>Za V3 unesi zajedno oznaku konkretnog svetlomera, vreme i tačan UTC pomeraj. Prazna oba nova polja čuvaju stari V2 zapis sa slabijom vremenskom uporedivošću. Korisnički podaci i kalibracija nisu nezavisno provereni. Ne obračunava se automatski blenda/ISO.</div></div>':'')+
        '</div>';
    }).join(''):'<p class="sp-note">Nije moguće napraviti pouzdan izbor lampi iz dostupnog inventara.</p>';
    if(typeof el('sp-lights').querySelectorAll==='function')
      el('sp-lights').querySelectorAll('button[data-sp-distance-light]').forEach(function(btn){
      btn.onclick=function(){
        if(state.busy||historyBlocked||!revisions.length)return;
        var id=btn.getAttribute('data-sp-distance-light');
        var confirmed=el('sp-distance-verified-'+id),field=el('sp-distance-'+id);
        if(!confirmed||!confirmed.checked){
          status('Potvrdi da si zaista izmerio udaljenost na setu.',true);return;
        }
        try{
          var previous=revisions[revisions.length-1];
          var revision=core().createDistanceMeasurementRevision(previous,{
            lightId:id,distanceM:field&&field.value,confirmed:true
          });
          revisions=revisions.concat([revision]);state.plan=revision.plan;
          renderResult();remember();
          status('Udaljenost je sačuvana u novoj reviziji kao korisnički prijavljeno merenje. Lux nije izmeren.');
        }catch(error){status('Merenje nije sačuvano: '+error.message,true);}
      };
    });
    if(typeof el('sp-lights').querySelectorAll==='function')
      el('sp-lights').querySelectorAll('button[data-sp-optic-light]').forEach(function(btn){
      btn.onclick=function(){
        if(state.busy||historyBlocked||!revisions.length)return;
        var id=btn.getAttribute('data-sp-optic-light');
        var confirmed=el('sp-optic-confirmed-'+id),field=el('sp-optic-'+id);
        if(!confirmed||!confirmed.checked){
          status('Potvrdi da si fizički proverio koji je reflektor montiran na setu.',true);return;
        }
        try{
          var previous=revisions[revisions.length-1];
          var revision=core().createMountedOpticRevision(previous,{
            lightId:id,opticId:field&&field.value,confirmed:true
          });
          revisions=revisions.concat([revision]);state.plan=revision.plan;
          renderResult();remember();
          status('Montirani dodatak je korisnički potvrđen u novoj reviziji. Lux na setu nije izmeren.');
        }catch(error){status('Optički dodatak nije potvrđen: '+error.message,true);}
      };
    });
    if(typeof el('sp-lights').querySelectorAll==='function')
      el('sp-lights').querySelectorAll('button[data-sp-incident-light]').forEach(function(btn){
      btn.onclick=function(){
        if(state.busy||historyBlocked||!revisions.length)return;
        var id=btn.getAttribute('data-sp-incident-light');
        var confirmation=el('sp-incident-confirmed-'+id),field=el('sp-incident-'+id);
        if(!confirmation||!confirmation.checked){
          status('Potvrdi fizičko očitavanje incidentnim svetlomerom i izdvajanje izvora.',true);return;
        }
        try{
          var previous=revisions[revisions.length-1];
          var revision=core().createIncidentLuxRevision(previous,{
            lightId:id,lux:field&&field.value,confirmed:true,fixtureIsolated:true,
            meterModel:el('sp-meter-model-'+id)&&el('sp-meter-model-'+id).value,
            measurementPoint:el('sp-meter-point-'+id)&&el('sp-meter-point-'+id).value,
            receptorOrientation:el('sp-meter-orientation-'+id)&&el('sp-meter-orientation-'+id).value,
            measuredAtLocal:el('sp-meter-time-'+id)&&el('sp-meter-time-'+id).value,
            meterIdentifier:el('sp-meter-identifier-'+id)&&el('sp-meter-identifier-'+id).value,
            measuredUtcOffset:el('sp-meter-offset-'+id)&&el('sp-meter-offset-'+id).value
          });
          revisions=revisions.concat([revision]);state.plan=revision.plan;
          renderResult();remember();
          status('Lux je sačuvan kao korisničko očitavanje u novoj reviziji. Nije nezavisno potvrđen.');
        }catch(error){status('Očitavanje nije sačuvano: '+error.message,true);}
      };
    });
    renderDopManualVariant(plan,current);
    renderPrelightReview(current);
    el('sp-warnings').innerHTML='<div class="sp-note" style="margin-top:10px"><b style="color:#f5c542">PROCENE I KOMPROMISI</b><ul>'+
      plan.limitations.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+
      '</ul><b style="color:#f5c542">DAN ZA NOĆ / KONTROLA DNEVNOG SVETLA</b><ul>'+
      (plan.dayForNightNotes||[]).map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+
      '</ul><b style="color:#f5c542">BEZBEDNOST</b><ul>'+
      plan.safetyNotes.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+'</ul></div>';
    el('sp-result').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function loadPrelightReviews(){
    if(prelightLoaded)return;
    prelightLoaded=true;
    try{
      var saved=storedWorkspace(PRELIGHT_STORE);
      prelightReviews=core().restorePrelightReviews(saved?JSON.parse(saved):[],revisions);
    }catch(error){prelightBlocked=true;}
  }
  function renderPrelightReview(current){
    if(!current)return;
    loadPrelightReviews();
    var matching=prelightReviews.filter(function(r){return r.revisionId===current.revisionId;});
    var latest=matching.length?matching[matching.length-1]:null;
    var labels={reviewed:'Provereno',needs_adjustment:'Potrebna dorada',not_applicable:'Nije primenljivo'};
    el('sp-prelight').innerHTML='<section class="sp-lamp">'+
      '<h3>Provera plana pre snimanja</h3><p class="sp-note">Procena snimatelja za reviziju '+
      esc(current.sequence)+'. Proveri nameru plana i rezultat na setu. Ove odluke nisu merenja niti automatska potvrda kvaliteta osvetljenja.</p>'+
      '<p class="sp-note">'+(prelightBlocked?'Sačuvane provere nisu učitane. Postojeći zapis je sačuvan; unos je blokiran.':
      latest?'Poslednja provera ove revizije: '+esc(latest.reviewedAt):
      prelightReviews.length?'Ova revizija zahteva novu proveru. Prethodne odluke ostaju u istoriji.':'Ova revizija još nije proverena.')+'</p>'+
      core().prelightChecks.map(function(check){
        return '<label class="sp-note" style="display:block;margin:12px 0"><b>'+esc(check.title)+
          '</b><div>'+esc(check.question)+'</div><div>Izvor: '+esc(check.source)+' — str. '+check.page+
          ' (proverena stranica izvornog PDF-a).</div><select class="sp-field" id="sp-prelight-'+check.id+'"'+
          (prelightBlocked?' disabled':'')+'><option value="">Izaberi odluku…</option>'+
          Object.keys(labels).map(function(key){return '<option value="'+key+'"'+
            (latest&&latest.decisions[check.id]===key?' selected':'')+'>'+labels[key]+'</option>';}).join('')+
          '</select></label>';
      }).join('')+'<button type="button" class="sp-btn" id="sp-prelight-save"'+
      (prelightBlocked?' disabled':'')+'>SAČUVAJ PROVERU OVE REVIZIJE</button><p class="sp-note" id="sp-prelight-status" role="status"></p>'+
      (prelightReviews.length?'<details><summary>Istorija stručnih provera ('+prelightReviews.length+')</summary>'+
        prelightReviews.map(function(r){var rev=revisions.find(function(item){return item.revisionId===r.revisionId;});
          return '<p class="sp-note">Revizija '+esc(rev.sequence)+' • '+esc(r.reviewedAt)+'<br>'+
            core().prelightChecks.map(function(c){return esc(c.title)+': '+esc(labels[r.decisions[c.id]]);}).join('<br>')+'</p>';
        }).join('')+'</details>':'')+'</section>';
    core().prelightChecks.forEach(function(check){
      el('sp-prelight-'+check.id).onchange=function(){el('sp-prelight-status').textContent='Izbor je promenjen; sačuvaj novu proveru.';};
    });
    el('sp-prelight-save').onclick=function(){
      if(prelightBlocked||historyBlocked||state.busy||state.videoBusy)return;
      try{
        if(revisions[revisions.length-1].revisionId!==current.revisionId)
          throw new Error('Plan je promenjen. Pregledaj novu reviziju.');
        var decisions={};core().prelightChecks.forEach(function(c){decisions[c.id]=el('sp-prelight-'+c.id).value;});
        var record=core().createPrelightReview(current,decisions,new Date().toISOString());
        var next=prelightReviews.concat([record]);
        // Persist the plan first, so a restored review always has its parent revision.
        var reviewUpdates={};reviewUpdates[REVISION_STORE]=JSON.stringify(revisions);reviewUpdates[PRELIGHT_STORE]=JSON.stringify(next);
        var nativeSaved=draft()&&draft().nativeAvailable()&&draft().checkpointWorkspace(reviewUpdates);
        if(draft()&&draft().nativeAvailable()&&!nativeSaved)throw new Error('Android upis provere nije uspeo.');
        try{sceneStorage().setItem(REVISION_STORE,reviewUpdates[REVISION_STORE]);
          sceneStorage().setItem(PRELIGHT_STORE,reviewUpdates[PRELIGHT_STORE]);
        }catch(storageError){if(!nativeSaved)throw storageError;}
        prelightReviews=next;remember();renderResult();
        if(draft())draft().flush();
        el('sp-prelight-status').textContent='Provera je sačuvana za ovu reviziju plana.';
      }catch(error){el('sp-prelight-status').textContent='Provera nije sačuvana: '+error.message;}
    };
  }
  // A purely local editing path for concrete DoP creative parameters.
  // It does NOT regenerate via any AI endpoint or send commands to fixtures.
  function renderDopManualVariant(plan,current){
    var root=el('sp-dop-manual');
    if(!root||!current||!core().createDopLightingVariantRevision)return;
    var lightFields=[
      {k:'x',name:'X U PLOTU (%)',min:5,max:95},
      {k:'y',name:'Y U PLOTU (%)',min:5,max:95},
      {k:'heightM',name:'PREDLOŽENA VISINA (m)',min:0.1,max:25},
      {k:'distanceM',name:'PREDLOŽENA DISTANCA (m)',min:0.1,max:100},
      {k:'intensityPct',name:'PREDLOŽENI INTENZITET (%)',min:0,max:100},
      {k:'kelvin',name:'TRAŽENA BOJA (K)',min:1000,max:20000}
    ];
    var cameraFields=[
      {k:'aperture',name:'PREDLOŽENA BLENDA (f)',min:0.7,max:32},
      {k:'iso',name:'PREDLOŽENI ISO',min:50,max:25600},
      {k:'fps',name:'FPS',min:1,max:120},
      {k:'shutterAngle',name:'SHUTTER ANGLE (°)',min:11.25,max:360},
      {k:'whiteBalanceK',name:'WHITE BALANCE (K)',min:1700,max:20000},
      {k:'ndStops',name:'ND FILTER (stop)',min:0,max:12}
    ];
    var html='<div class="sp-card"><h2 class="sp-h">DoP — RUČNA VARIJANTA PLANA (OFFLINE)</h2>'+
      '<p class="sp-note">Menjaš plan svakog izvora bez plaćenog AI-ja i bez kontrole lampe. '+
      'Ova izmena odmah pravi novu SHA-256 reviziju, ažurira 2D light plot i konceptualni prikaz. '+
      'X/Y nisu izmerena 3D rastojanja. Traženi Kelvin nije dokaz da ga konkretna lampa podržava.</p>';
    if(plan.dopLocalVariant){
      var v=plan.dopLocalVariant;
      html+='<details><summary><b>POSLEDNJA RUČNA DoP VARIJANTA</b></summary>'+
        '<p>Uputstvo: '+esc(v.reason)+'</p><p>Lampе: '+
        esc(v.changedLights.map(function(l){return l.lightId+' ('+l.fields.join(', ')+')';}).join('; ')||'nema')+
        '. Kamera: '+esc(v.changedCameraFields.join(', ')||'bez promene')+'.</p>'+
        '<p class="sp-note">Stručni principi važe kao smernice, a ne kao merenje ili garancija parametara.</p>'+
        (plan.knowledgeBasis&&plan.knowledgeBasis.cards||[]).filter(function(card){
          return v.bookCardIds.indexOf(card.id)>=0;
        }).map(function(card){
          return '<div class="sp-note"><b>'+esc(card.id)+' — '+esc(card.title)+'</b>'+
            '<div>Princip: '+esc(card.principle)+'</div>'+
            '<div>Provera: '+esc(card.validation)+'</div>'+
            '<div>Ograničenje: '+esc(card.limitations)+'</div></div>';
        }).join('')+'</details>';
    }
    // Display actual chronological creative-edit events, never copied meter
    // revisions carrying an inherited DoP label.
    var dopHistory=null;
    if(revisions.length&&core().listDopPlannedEditEvents){
      try{dopHistory=core().listDopPlannedEditEvents(revisions);}
      catch(error){
        html+='<p class="sp-note">Istorija DoP poređenja nije potvrđena: '+
          esc(error.message)+'. Izmene se ne prikazuju kao proverene.</p>';
      }
    }
    if(dopHistory&&dopHistory.eventCount){
      function plannedRow(change,labels){
        var field=labels.find(function(f){return f.k===change.field;});
        return '<li>'+(change.lightId?'<b>'+esc(change.lightId)+'</b> / ':'')+
          esc(field?field.name:change.field)+': <b>'+
          esc(change.before===null?'nije uneto':String(change.before))+
          '</b> → <b>'+esc(String(change.after))+'</b></li>';
      }
      html+='<details class="sp-lamp" open><summary><b>DoP — PRE / POSLE (SAMO PLAN) • ISTORIJA ('+
        dopHistory.eventCount+')</b></summary>'+
        '<p class="sp-note">Sve potvrđene lokalne kreativne izmene po redosledu. '+
        'Poslednja potvrđena kreativna izmena je otvorena; prethodne možeš proširiti.</p>'+
        dopHistory.events.map(function(item,index){
          return '<details class="sp-lamp" '+(index===dopHistory.events.length-1?'open':'')+
            '><summary><b>DoP izmena '+(index+1)+' • revizija '+
            esc(item.beforeSequence)+' → '+esc(item.afterSequence)+'</b></summary>'+
            '<p class="sp-note">Provereni zapisi: '+esc(item.beforeRevisionId.slice(0,16))+
            ' → '+esc(item.afterRevisionId.slice(0,16))+'</p>'+
            '<p>Instrukcija: '+esc(item.reason)+'</p>'+
            '<p><b>RASVETA — PREDLOŽENE VREDNOSTI</b></p><ul>'+
            (item.lightChanges.map(function(c){return plannedRow(c,lightFields);}).join('')||
              '<li>Bez promene predloga za rasvetu.</li>')+'</ul>'+
            '<p><b>KAMERA — PREDLOŽENE VREDNOSTI</b></p><ul>'+
            (item.cameraChanges.map(function(c){return plannedRow(c,cameraFields);}).join('')||
              '<li>Bez promene predloga za kameru.</li>')+'</ul></details>';
        }).join('')+
        '<p class="sp-note">Ovo je istorija zamišljenih vrednosti, ne istorija '+
        'stvarnih pomeranja lampi, svetlomerne kalibracije, ekspozicije niti '+
        'promena originalnog snimka.</p></details>';
    }
    plan.lights.forEach(function(l){
      html+='<details class="sp-lamp"><summary><b>'+esc(l.id)+' / '+
        esc(l.role.toUpperCase())+' — '+esc(l.fixtureName)+'</b></summary>'+
        '<div class="sp-two">';
      lightFields.forEach(function(f){
        html+='<div><label for="sp-dop-light-'+esc(l.id)+'-'+f.k+'">'+f.name+'</label>'+
          '<input class="sp-field" type="number" step="any" min="'+f.min+
          '" max="'+f.max+'" id="sp-dop-light-'+esc(l.id)+'-'+f.k+
          '" value="'+(l[f.k]===null?'':esc(l[f.k]))+'"></div>';
      });
      html+='</div><p class="sp-note">Ovo su tražene vrednosti za light plot. '+
        'Fizička postavka, dopustiva CCT snaga, stvarni dimmer i fotometrija nisu potvrđeni.</p></details>';
    });
    html+='<details class="sp-lamp"><summary><b>DoP — PREDLOŽENA KAMERA</b></summary><div class="sp-two">';
    cameraFields.forEach(function(f){
      html+='<div><label for="sp-dop-camera-'+f.k+'">'+f.name+'</label>'+
        '<input class="sp-field" type="number" step="any" min="'+f.min+
        '" max="'+f.max+'" id="sp-dop-camera-'+f.k+
        '" value="'+esc(plan.cameraSettings[f.k])+'"></div>';
    });
    html+='</div><p class="sp-note">Promena kamere ne znači da je potvrđena stvarna ekspozicija. '+
      'Prethodno očitavanje sive karte neće važiti za novi plan sa izmenjenom kamerom.</p></details>'+
      '<label for="sp-dop-local-reason">ŠTA ŽELIŠ DA PROMENIŠ U OVOM KADRU?</label>'+
      '<textarea id="sp-dop-local-reason" class="sp-field" rows="2" maxlength="500" '+
      'placeholder="Npr. bliži key sa leve strane i toplija pozadina, prema zahtevu DoP-a"></textarea>'+
      '<label style="display:flex;gap:8px;align-items:center">'+
      '<input type="checkbox" id="sp-dop-local-confirmed"> Potvrđujem da je ovo SAMO kreativna varijanta plana, '+
      'bez merenja na setu, fizičke komande lampama ili nove AI video obrade.</label>'+
      '<button id="sp-dop-local-save" type="button" class="sp-btn sp-primary" '+
      'style="width:100%;margin-top:8px">SAČUVAJ DoP VARIJANTU I NOVI LIGHT PLOT</button>'+
      '<p class="sp-note">Za svaku promenu moraš uneti stvaran zahtev. '+
      'Prazno polje kod ranije nepoznate vrednosti znači bez promene. '+
      'Izmene rasporeda/jačine poništavaju stara očitavanja rasvete samo u novoj reviziji. '+
      'Izmene samo kamere čuvaju incidentna lux merenja, ali poništavaju waveform zapis.</p></div>';
    root.innerHTML=html;
    var button=el('sp-dop-local-save');
    if(!button)return;
    button.onclick=function(){
      if(state.busy||state.videoBusy||historyBlocked||!revisions.length)return;
      if(!el('sp-dop-local-confirmed').checked){
        status('Potvrdi da je ovo kreativna izmena plana, a ne fizičko merenje.',true);return;
      }
      try{
        var lightEdits=[],cameraEdits={};
        function readChange(domId,oldValue,output,key){
          var node=el(domId);
          if(!node)throw new Error('Nedostaje polje za '+key);
          var value=node.value.trim();
          if(value===''){
            if(oldValue!==null)throw new Error('Broj za '+key+' je obrisan; vrati ga ili unesi novi.');
            return;
          }
          if(value!==String(oldValue))output[key]=value;
        }
        plan.lights.forEach(function(l){
          var change={lightId:l.id};
          lightFields.forEach(function(f){
            readChange('sp-dop-light-'+l.id+'-'+f.k,l[f.k],change,f.k);
          });
          if(Object.keys(change).length>1)lightEdits.push(change);
        });
        cameraFields.forEach(function(f){
          readChange('sp-dop-camera-'+f.k,plan.cameraSettings[f.k],cameraEdits,f.k);
        });
        var latest=revisions[revisions.length-1];
        var child=core().createDopLightingVariantRevision(latest,{
          confirmed:true,reason:el('sp-dop-local-reason').value,
          lightEdits:lightEdits,cameraEdits:cameraEdits
        });
        revisions=revisions.concat([child]);state.plan=child.plan;
        state.aiPreview='';state.aiStoryboard=[];state.exportedVideo=null;
        if(el('sp-video-share'))el('sp-video-share').disabled=true;
        renderResult();remember();
        status('Sačuvana je nova lokalna DoP varijanta. Plot i predlozi su ažurirani; stvarna rasveta i ekspozicija nisu potvrđene.');
      }catch(error){
        status('DoP varijanta nije sačuvana: '+(error&&error.message||'Neispravan zahtev'),true);
      }
    };
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
    if(state.videoFile&&state.frames.length&&!hasCurrentVideoPlan()){
      status('Novi video nema vezu sa ovim planom. Generiši plan za trenutno izabrani snimak.',true);return;
    }
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
    if(state.busy||state.videoBusy||!hasCurrentVideoPlan()){
      status('Generiši novi plan za trenutno izabrani video pre AI storyboarda.',true);return;
    }
    setBusy(true);
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
    finally{clearTimeout(timer);state.abort=null;if(button)button.disabled=false;setBusy(false);}
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
  function currentVideoBinding(){
    var revision=revisions[revisions.length-1];
    if(!revision||!state.plan||revision.plan!==state.plan)throw new Error('Nema potvrđene revizije plana za AI video.');
    return core().videoRevisionBinding(revision);
  }
  function videoBindingLabel(){
    if(!videoReceipt||!videoReceipt.binding)return 'Revizija AI videa nije potvrđena.';
    return 'Revizija: '+videoReceipt.binding.revisionId+' | Plan: '+videoReceipt.binding.planHash.slice(0,12);
  }
  function persistVideoReceipt(value){
    // Opaque identifiers/status only. Never serialize state, plans, media or the access field.
    var binding=value.binding||videoReceipt&&videoReceipt.binding;
    if(!binding||!binding.revisionId||!binding.planHash||!binding.lightPlotRevisionId)
      throw new Error('AI video nema potvrđenu vezu sa revizijom plana.');
    var receipt={requestId:value.requestId,uploadId:value.uploadId||null,taskId:value.taskId||null,
      status:value.status||'SUBMITTING',binding:binding};
    sceneStorage().setItem(VIDEO_RECEIPT,JSON.stringify(receipt));
    videoReceipt=receipt;
  }
  function restoreVideoReceipt(){
    try{
      var raw=sceneStorage().getItem(VIDEO_RECEIPT);
      if(!raw)return;
      var value=JSON.parse(raw),id=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
      if(!value||!id.test(value.requestId)||!id.test(value.uploadId)||
        (value.taskId&&!id.test(value.taskId))||
        ['SUBMITTING','UNKNOWN','PENDING','RUNNING','THROTTLED','SUCCEEDED','FAILED','CANCELED','EXPIRED'].indexOf(value.status)<0)
        throw new Error('Neispravna potvrda zadatka.');
      if(!value.binding||typeof value.binding.revisionId!=='string'||
        !/^[a-f0-9]{64}$/i.test(value.binding.planHash)||
        typeof value.binding.lightPlotRevisionId!=='string')
        throw new Error('Prethodni AI video nema pouzdanu vezu sa planom.');
      videoReceipt=value;
      videoReceiptBlocked=['SUCCEEDED','FAILED','CANCELED','EXPIRED'].indexOf(value.status)<0;
      state.aiVideoTaskId=value.taskId;
      el('sp-video-ai-check').disabled=false;
      videoStatus('Sačuvan je prethodni AI zahtev. '+videoBindingLabel()+' Unesi token i proveri status.');
    }catch(e){videoReceiptBlocked=true;videoStatus('Potvrdu prethodnog zadatka nije moguće proveriti. Nova plaćena obrada je blokirana.',true);}
  }
  async function startAIVideo(){
    if(state.busy||state.videoBusy){videoStatus('Sačekaj da se prethodna obrada završi.',true);return;}
    if(videoReceiptBlocked){videoStatus('Prvo razjasni prethodni plaćeni zahtev dugmetom za status.',true);return;}
    if(!state.aiVideoAvailable){videoStatus('AI video servis nije omogućen.',true);return;}
    if(!hasCurrentVideoPlan()){
      videoStatus('Generiši novi plan za upravo izabrani video pre plaćene AI obrade.',true);return;
    }
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
    state.videoBusy=true; // lock selected media/DoP edits throughout upload and provider start
    try{
      var pending=state.aiVideoPending;
      if(!pending){
        pending={requestId:cryptoRandomRequestId(),uploadId:null,plan:state.plan,binding:currentVideoBinding(),started:false};
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
      persistVideoReceipt({requestId:pending.requestId,uploadId:pending.uploadId,status:'SUBMITTING',binding:pending.binding});
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
      videoStatus('AI zadatak '+task.taskId+' je prihvaćen. '+videoBindingLabel()+' Procena: '+(task.estimatedCredits==null?'nije potvrđena':task.estimatedCredits)+' kredita. Proveri status dugmetom.');
    }catch(error){
      if(pending&&pending.started){
        if(el('sp-video-ai-check'))el('sp-video-ai-check').disabled=false;
        if(el('sp-video-cost-confirm'))el('sp-video-cost-confirm').checked=false;
      }
      videoStatus('AI zahtev nije potvrđen: '+error.message+
        (state.aiVideoPending&&state.aiVideoPending.started?' Moguće je da je naplaćen; ne šalji novi zahtev. Sledeća provera koristi isti ID.':''),true);
    }
    finally{state.videoBusy=false;button.disabled=false;}
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
        videoStatus('AI video je spreman za MP4 preuzimanje. '+videoBindingLabel()+' Sadržaj proveriti pre korišćenja na setu.');
        var out=el('sp-video-ai-output');
        if(!out)return;
        out.innerHTML='<button id="sp-ai-mp4-download" type="button" class="sp-btn sp-primary">SAČUVAJ AI MP4</button>'+
          '<button id="sp-ai-mp4-preview" type="button" class="sp-btn">PREGLEDAJ AI MP4</button>'+
          '<p class="sp-note">Rezultat može sadržati promene pokreta, lica ili tekstura; proveriti kontinuitet sa originalom.</p>';
        el('sp-ai-mp4-download').onclick=downloadAIVideo;
        el('sp-ai-mp4-preview').onclick=function(){downloadAIVideo(true);};
      }else videoStatus('Status AI zadatka: '+String(task.status||'nepoznat')+'. '+videoBindingLabel());
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
      if(previewOnly===true){videoStatus('MP4 pregled je spreman. '+videoBindingLabel());return;}
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
    if(state.busy||state.videoBusy||!hasCurrentVideoPlan()){
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
    state.videoBusy=true; // do not replace the source clip during asynchronous WebM export
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
      state.videoBusy=false;
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
  function safeExportCueSheet(){
    try{return currentSampledCueSheet();}
    catch(invalidSampleTimes){return null;}
  }
  function exportObject(){
    var codeAudit=safeCodeValueAudit();
    var doPHistory=revisions.length&&core().listDopPlannedEditEvents?
      core().listDopPlannedEditEvents(revisions):null;
    return {format:'LightingAI.ScenePlanner.v1',savedAt:new Date().toISOString(),
      plan:state.plan,revisionSchemaVersion:1,revisions:revisions,
      dopPlannedEditHistory:doPHistory,
      prelightReviewHistory:prelightReviews,
      prelightReviewHistoryStatus:prelightBlocked?'UNAVAILABLE_PRESERVED':'DOP_REPORTED_NOT_PHYSICAL_VERIFICATION',
      sampledVideoCueSheet:safeExportCueSheet(),
      webViewCodeValueAudit:codeAudit,
      notes:'Originalni foto i video materijal nisu uključeni u JSON izvoz. DoP istorija je izvedena iz revizija, nije fizički izmerena.'};
  }
  function restorePlanHistory(){
    if(revisions.length){renderResult();return true;}
    try{
      var saved=storedWorkspace(REVISION_STORE);if(!saved)return true;
      revisions=core().restoreRevisions(JSON.parse(saved));
      sceneId=revisions[0].sceneId;state.plan=revisions[revisions.length-1].plan;
      renderResult();
      return true;
    }catch(error){historyBlocked=true;status('Istorija revizija nije učitana: '+error.message,true);return false;}
  }
  function remember(){
    if(!state.plan)return;
    var updates={};updates[REVISION_STORE]=JSON.stringify(revisions);updates[STORE]=JSON.stringify(exportObject());
    var nativeSaved=draft()&&draft().nativeAvailable()&&draft().checkpointWorkspace(updates);
    try{
      sceneStorage().setItem(REVISION_STORE,updates[REVISION_STORE]);
      sceneStorage().setItem(STORE,updates[STORE]);
      planPersistenceError=draft()&&draft().nativeAvailable()&&!nativeSaved?'Android upis plana nije uspeo. Sačuvaj JSON izvoz.':'';
    }catch(e){planPersistenceError='Plan je u memoriji; lokalno čuvanje nije uspelo. Sačuvaj JSON izvoz.';
      if(nativeSaved)planPersistenceError='';
      status(planPersistenceError,true);}
    if(draft())draft().flush();
    draftStatus(!planPersistenceError,planPersistenceError);
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
    backupReadSequence++;
    if(window.Android&&typeof window.Android.cancelSceneBackupOperation==='function')window.Android.cancelSceneBackupOperation();
    cancelBackupPreview();backupRequest=null;backupUnlockRequest=null;backupBusy=false;
    if(draft()){draft().flush();draft().setOpen(false);draft().detach();}
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
    onBackupSaved:onBackupSaved,onBackupUnlocked:onBackupUnlocked,onNativeVideoSaved:onNativeVideoSaved,version:'0.3-native-mp4-saf-save'};
})();
