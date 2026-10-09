(function () {
  'use strict';
  var MODULE='lightingai-scene-planner-overlay';
  var ENTRY='lightingai-scene-planner-entry';
  var API='https://lightingai.onrender.com';
  var STORE='lighting_scene_planner_last_v1';
  var state={photo:'',frames:[],videoUrl:'',plan:null,aiPreview:'',busy:false,videoBusy:false,abort:null};
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
      '<div id="sp-video-note" class="sp-note">Do 120 sekundi. AI dobija najviše 4 izdvojena kadra, ne ceo video.</div></div></div></div>'+
      '<div class="sp-card"><h2 class="sp-h">2 / OPIŠI SCENU I ODABERI REŽIM</h2>'+
      '<label>TEKST ILI GLASOVNI OPIS SCENE</label>'+
      '<textarea class="sp-field" id="sp-description" rows="4" placeholder="Primer: Žena ide od ograde do drveta, noć, hladna mesečina, sekirom udara drvo. Kamera prati sa leve strane."></textarea>'+
      '<div class="sp-actions" style="margin-top:8px"><button type="button" class="sp-btn" id="sp-voice">🎤 GOVORI OPIS SCENE</button></div>'+
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
      '<label style="display:flex;align-items:center;gap:9px"><input id="sp-measured" type="checkbox"> Dimenzije su zaista izmerene</label>'+
      '<div id="sp-inventory" class="sp-note"></div></div>'+
      '<div class="sp-card"><h2 class="sp-h">3 / IZGRADI PLAN I VIZUELNI PRIKAZ</h2>'+
      '<div class="sp-actions"><button type="button" class="sp-btn sp-primary" id="sp-generate">GENERISI AI PLAN</button>'+
      '<button type="button" class="sp-btn" id="sp-local">LOKALNI KONCEPT (BEZ INTERNETA)</button></div>'+
      '<p id="sp-status" role="status" aria-live="polite" class="sp-note" style="min-height:20px;margin:12px 0 0"></p></div>'+
      '<div id="sp-result" hidden><div class="sp-card"><h2 class="sp-h">VIZUELNI PREVIEW</h2>'+
      '<div id="sp-preview" style="position:relative;overflow:hidden;border-radius:10px;background:#090d13"></div>'+
      '<div class="sp-actions" style="margin-top:12px"><button type="button" class="sp-btn" id="sp-ai-preview">NAPRAVI AI FOTO-PREVIEW</button></div>'+
      '<p class="sp-note">Lokalna simulacija je ilustrativna i nije fotometrijsko merenje. AI foto-preview zahteva mrežu i dostupan servis.</p></div>'+
      '<div class="sp-card"><h2 class="sp-h">2D LIGHT PLOT — PROCENJENI POLOŽAJI</h2>'+
      '<div id="sp-plot"></div><p class="sp-note">Kamera, glumci, putanje i svetla su orijentacioni dok se ne potvrde merenja.</p></div>'+
      '<div class="sp-card"><h2 class="sp-h">PREDLOG RASVETE</h2>'+
      '<div id="sp-summary"></div><div id="sp-lights"></div><div id="sp-warnings"></div>'+
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
      el(id).onchange=function(e){var file=e.target.files&&e.target.files[0];if(file)videoPicked(file);e.target.value='';};
    });
    el('sp-mode').onchange=updateInventory;
    el('sp-voice').onclick=function(){
      if(window.Android && typeof window.Android.startSpeechInput==='function') {
        status('Otvaram glasovni unos…');window.Android.startSpeechInput(locale(),'sp-description');
      } else status('Glasovni unos zahteva Android verziju aplikacije.',true);
    };
    el('sp-generate').onclick=function(){generate(true);};
    el('sp-local').onclick=function(){generate(false);};
    el('sp-ai-preview').onclick=generatePhotoPreview;
    el('sp-save').onclick=save;
    el('sp-share').onclick=share;
    updateInventory();
    loadCore(function(){status('Spremno. Dodaj fotografiju ili video i opiši kadar.');});
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
    var duration=video.duration,frames=[],times=[.2,.3,.65,.95].map(function(k,i){
      return i===0?Math.min(.15,duration*.1):Math.min(Math.max(0,duration-.05),duration*k);
    });
    for(var i=0;i<times.length;i++){
      var t=times[i];
      var seeked=waitFor(video,'seeked',14000);
      video.currentTime=t;
      await seeked;
      var canvas=document.createElement('canvas');
      var scale=Math.min(1,800/Math.max(video.videoWidth,video.videoHeight));
      canvas.width=Math.max(1,Math.round(video.videoWidth*scale));
      canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
      canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
      frames.push({timeSec:Number(t.toFixed(2)),image:canvas.toDataURL('image/jpeg',.72)});
    }
    video.removeAttribute('src');video.load();
    return frames;
  }
  async function videoPicked(file){
    if(state.videoBusy)return;
    if(!/^video\//.test(file.type)&&file.type) {status('Potreban je video snimak.',true);return;}
    if(file.size>180*1024*1024){status('Video prelazi 180 MB. Skrati snimak i pokušaj ponovo.',true);return;}
    state.videoBusy=true;state.frames=[];state.aiPreview='';
    if(state.videoUrl){URL.revokeObjectURL(state.videoUrl);state.videoUrl='';}
    state.videoUrl=URL.createObjectURL(file);
    var player=el('sp-video');if(player){player.src=state.videoUrl;player.hidden=false;player.load();}
    status('Izdvajam ključne kadrove videa na telefonu…');
    try{
      state.frames=await videoFrames(state.videoUrl);
      var note=el('sp-video-note');
      if(note)note.textContent='Izdvojena '+state.frames.length+' kadra za analizu kretanja. Originalni video ostaje na telefonu.';
      status('Video je spreman: '+state.frames.length+' kadra za planiranje putanje.');
    }catch(e){
      state.frames=[];
      status((e&&e.message||'Video nije podržan.')+' Možeš dodati fotografiju kao alternativu.',true);
    }finally{state.videoBusy=false;}
  }
  function payload(){
    return core().request({
      mode:el('sp-mode').value,description:el('sp-description').value,
      look:el('sp-look').value,roomWidthM:el('sp-width').value,
      roomDepthM:el('sp-depth').value,dimensionsMeasured:el('sp-measured').checked,
      equipment:inventory(),scenePhoto:state.photo,videoFrames:state.frames,language:locale()
    });
  }
  function setBusy(busy){
    state.busy=busy;
    ['sp-generate','sp-local','sp-ai-preview'].forEach(function(id){if(el(id))el(id).disabled=busy;});
  }
  async function generate(useAI){
    if(state.busy||!core())return;
    var req=payload();
    if(!req.description){status('Opiši scenu tekstom ili glasom.',true);return;}
    if(!req.scenePhoto&&!req.videoFrames.length){status('Dodaj fotografiju ili video sa izdvojenim kadrovima.',true);return;}
    if(req.mode==='own'&&!req.equipment.length){status('U režimu MOJA OPREMA izaberi lampu u inventaru.',true);return;}
    setBusy(true);
    state.aiPreview='';
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
        state.plan=core().sanitizePlan(response.plan,req,'ai');
        state.plan.inputSummary=response.plan.inputSummary||null;
        status('AI plan je generisan. Tehničke vrednosti su označene kao procene.');
      }catch(error){
        state.plan=core().localPlan(req);
        status('AI servis nije dostupan ('+(error.name==='AbortError'?'timeout':error.message)+'). Prikazan je LOKALNI koncept, ne AI analiza.',true);
      }finally{clearTimeout(timer);state.abort=null;setBusy(false);}
    }else{
      state.plan=core().localPlan(req);
      status('Prikazan je lokalni koncept bez AI obrade fotografije ili kretanja.');
      setBusy(false);
    }
    renderResult();
    remember();
  }
  function fmt(value,unit){
    return value==null?'neutvrđeno':(String(value)+(unit||''));
  }
  function line(x1,y1,x2,y2,color){
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="1.2" stroke-dasharray="3 2"/>';
  }
  function plotSvg(plan){
    var x=[],colors={key:'#ffce56',fill:'#7bbcff',backlight:'#ffa17d',ambient:'#c5b3ff'};
    var actor=plan.actors[0]||{x:50,y:50,path:[]};
    var base='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 105" role="img" aria-label="2D light plot sa kamerom, svetlima i putanjom glumca" style="display:block;width:100%;max-height:480px;background:#0b111c;border-radius:12px">'+
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
        '<text x="'+a.x+'" y="'+(a.y+1.2)+'" font-size="3.5" fill="#fff" text-anchor="middle">A1</text>';
    });
    base+='<rect x="42" y="86" width="16" height="7" rx="1.4" fill="#23364d" stroke="#c7e2ff"/>'+
      '<text x="50" y="90.5" font-size="3" fill="#fff" text-anchor="middle">KAMERA</text>'+
      '<text x="6" y="102" font-size="3.2" fill="#95a6b9">POGLED OD GORE • PROCENA</text></svg>';
    return base;
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
    el('sp-plot').innerHTML=plotSvg(plan);
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
        '<div>Napajanje: '+esc(l.power)+'</div></div>'+
        '<p style="font-size:13px;line-height:1.4;margin:9px 0 0">'+esc(l.why)+'</p></div>';
    }).join(''):'<p class="sp-note">Nije moguće napraviti pouzdan izbor lampi iz dostupnog inventara.</p>';
    el('sp-warnings').innerHTML='<div class="sp-note" style="margin-top:10px"><b style="color:#f5c542">PROCENE I KOMPROMISI</b><ul>'+
      plan.limitations.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+
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
  function exportObject(){
    return {format:'LightingAI.ScenePlanner.v1',savedAt:new Date().toISOString(),
      plan:state.plan,notes:'Originalni foto i video materijal nisu uključeni u JSON izvoz.'};
  }
  function remember(){
    if(!state.plan)return;
    try{localStorage.setItem(STORE,JSON.stringify(exportObject()));}catch(e){}
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
    if(state.abort){state.abort.abort();state.abort=null;}
    if(state.videoUrl){URL.revokeObjectURL(state.videoUrl);state.videoUrl='';}
    var wrap=el(MODULE);if(wrap)wrap.remove();
  }
  function closeIfOpen(){if(!el(MODULE))return false;close();return true;}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
  window.LightingAIScenePlanner={open:open,close:close,closeIfOpen:closeIfOpen,version:'0.1-video-photo-voice-mvp'};
})();
