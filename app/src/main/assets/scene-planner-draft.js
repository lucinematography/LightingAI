(function (root) {
  'use strict';
  // Recoverable, device-local Scene Planner draft. No network upload or book/media export.
  var DRAFT_KEY='lighting_scene_planner_draft_v1';
  var PHOTO_KEY='lighting_scene_planner_draft_photo_v1';
  var FIELD_IDS=['sp-description','sp-capture','sp-shot-camera','sp-mode','sp-look',
    'sp-width','sp-depth','sp-location','sp-scene-datetime','sp-scene-lat',
    'sp-scene-lon','sp-scene-tz','sp-scene-coords-verified','sp-measured',
    'sp-dop-request','sp-aperture','sp-iso','sp-fps','sp-shutter','sp-wb','sp-nd'];
  var CHECK_IDS=['motivation','fill','separation'];
  var PHOTO_SEQUENCE_KEY='lighting_scene_planner_draft_photo_sequence_v2';
  var WORKSPACE_KEYS=[DRAFT_KEY,'lighting_scene_planner_revisions_v1',
    'lighting_scene_planner_prelight_reviews_v1','lighting_scene_planner_last_v1'];
  var active=null,lastError='',photoSequence=Date.now(),photoWrites=Promise.resolve();
  var nativeWorkspace=null,checkpoint=Date.now();
  // Existing workspace stays in place; additional scenes have separate private files.
  var scenes={version:1,activeId:'legacy',scenes:[{id:'legacy',name:'Postojeća scena'}]},scenesBlocked=false;
  function sceneSupport(){
    return !!(root.Android&&['loadScenePlannerSceneIndex','saveScenePlannerSceneIndex',
      'loadScenePlannerSceneData','saveScenePlannerSceneData'].every(function(k){return typeof root.Android[k]==='function';}));
  }
  function validScenes(value){
    if(!value||value.version!==1||!Array.isArray(value.scenes)||!value.scenes.length||value.scenes.length>100)return false;
    var ids=[];
    return value.scenes.every(function(s){
      if(!s||typeof s.id!=='string'||!(/^(legacy|s-[a-z0-9]{8,64})$/).test(s.id)||ids.indexOf(s.id)>=0||
         typeof s.name!=='string'||!s.name.trim()||s.name.length>80)return false;
      ids.push(s.id);return true;
    })&&ids.indexOf('legacy')>=0&&ids.indexOf(value.activeId)>=0;
  }
  function loadScenes(){
    if(!sceneSupport())return;
    try{
      var raw=root.Android.loadScenePlannerSceneIndex();if(!raw)return;
      var saved=JSON.parse(raw);if(!validScenes(saved))throw new Error('Invalid scene index');
      scenes=saved;
    }catch(e){scenesBlocked=true;report(false,'Spisak scena nije čitljiv. Postojeći podaci su očuvani; upis je blokiran.');}
  }
  function nativeRead(kind){
    if(scenes.activeId!=='legacy')return root.Android.loadScenePlannerSceneData(scenes.activeId,kind);
    return kind==='workspace'?root.Android.loadScenePlannerWorkspace():root.Android.loadScenePlannerPhoto();
  }
  function nativeWrite(kind,data){
    if(scenesBlocked)return false;
    if(scenes.activeId!=='legacy')return root.Android.saveScenePlannerSceneData(scenes.activeId,kind,data);
    return kind==='workspace'?root.Android.saveScenePlannerWorkspace(data):root.Android.saveScenePlannerPhoto(data);
  }
  function listScenes(){return scenes.scenes.map(function(s){return {id:s.id,name:s.name};});}
  function selectScene(id,name){
    if(!sceneSupport()||scenesBlocked)return report(false,'Izbor scena zahteva dostupno Android skladište.');
    if(active&&!flush())return false;
    var next=JSON.parse(JSON.stringify(scenes));
    if(name!==undefined){
      name=String(name).trim();
      if(!name||name.length>80||/[\u0000-\u001f]/.test(name)||next.scenes.length>=100)
        return report(false,'Unesi naziv scene do 80 znakova; najviše 100 scena.');
      id='s-'+Date.now().toString(36)+Math.random().toString(36).slice(2,14);
      if(next.scenes.some(function(s){return s.id===id;}))return report(false,'Pokušaj ponovo sa novom scenom.');
      next.scenes.push({id:id,name:name});
    }
    if(!next.scenes.some(function(s){return s.id===id;}))return report(false,'Scena nije pronađena.');
    next.activeId=id;
    try{
      if(name===undefined){
        var workspace=id==='legacy'?root.Android.loadScenePlannerWorkspace():root.Android.loadScenePlannerSceneData(id,'workspace');
        var photo=id==='legacy'?root.Android.loadScenePlannerPhoto():root.Android.loadScenePlannerSceneData(id,'photo');
        if(workspace){
          var snapshot=JSON.parse(workspace);
          if(!snapshot||snapshot.version!==1||!Number.isSafeInteger(snapshot.checkpoint)||
             !snapshot.values||typeof snapshot.values!=='object'||Array.isArray(snapshot.values)||
             !Object.keys(snapshot.values).every(function(k){return WORKSPACE_KEYS.indexOf(k)>=0&&typeof snapshot.values[k]==='string';}))
            throw new Error('Invalid workspace');
          if(snapshot.values[DRAFT_KEY]){
            var pending=JSON.parse(snapshot.values[DRAFT_KEY]);
            if(!pending||pending.version!==1||!pending.fields||typeof pending.fields!=='object'||Array.isArray(pending.fields))
              throw new Error('Invalid scene draft');
          }
        }
        if(photo&&!photoRecord(JSON.parse(photo)))throw new Error('Invalid scene photo');
      }
    }catch(invalidScene){return report(false,'Scena nije čitljiva. Prethodna scena ostaje aktivna; podaci nisu prepisani.');}
    try{
      if(root.Android.saveScenePlannerSceneIndex(JSON.stringify(next))!==true)
        return report(false,'Izbor scene nije sačuvan. Prethodna scena ostaje aktivna.');
    }catch(e){return report(false,'Izbor scene nije sačuvan.');}
    stagedBackup=null;detach();scenes=next;nativeWorkspace=null;checkpoint=Date.now();photoSequence=Date.now();
    lastError='';recoverNativeWorkspace();return !scenesBlocked;
  }
  var stagedBackup=null;
  var BACKUP_LIMIT=24*1024*1024;
  var BACKUP_EXCLUDED=['originalVideo','sampledVideoFrames','aiGeneratedMedia',
    'originalFullResolutionPhoto','globalEquipmentInventory','accessTokens'];
  function backupCore(){
    var c=root.LightingAIScenePlannerCore;
    if(!c||typeof c.sha256!=='function')throw new Error('Model plana nije učitan.');
    return c;
  }
  function backupHash(text){
    if(root.Android&&typeof root.Android.sceneBackupSha256==='function'){
      var result=root.Android.sceneBackupSha256(text);
      if(typeof result!=='string'||!/^[a-f0-9]{64}$/.test(result))throw new Error('SHA-256 provera nije dostupna.');
      return result;
    }
    return backupCore().sha256(text);
  }
  function utf8Size(value){
    var size=0;
    for(var i=0;i<value.length;i++){
      var code=value.charCodeAt(i);
      if(code>=0xd800&&code<=0xdbff&&i+1<value.length&&value.charCodeAt(i+1)>=0xdc00&&value.charCodeAt(i+1)<=0xdfff){size+=4;i++;}
      else size+=code<128?1:code<2048?2:3;
      if(size>BACKUP_LIMIT)return size;
    }
    return size;
  }
  function backupSafeKeys(value,depth){
    if(depth>80)throw new Error('Kopija ima previše ugnježdenih podataka.');
    if(!value||typeof value!=='object')return;
    Object.keys(value).forEach(function(k){
      if(/password|passphrase|secret|token|authorization|api[_-]?key|private[_-]?key|keystore/i.test(k)||
         ['__proto__','constructor','prototype'].indexOf(k)>=0)throw new Error('Kopija sadrži nedozvoljeno polje.');
      backupSafeKeys(value[k],depth+1);
    });
  }
  function backupDraft(value){
    if(!value||value.version!==1||!value.fields||typeof value.fields!=='object'||Array.isArray(value.fields))
      throw new Error('Nacrt nije podržan.');
    var result={version:1,open:false,fields:{},review:null,scrollTop:0};
    FIELD_IDS.forEach(function(id){
      var v=value.fields[id];
      if(['sp-measured','sp-scene-coords-verified'].indexOf(id)>=0){
        if(typeof v==='boolean')result.fields[id]=v;
      }else if(typeof v==='string')result.fields[id]=v;
    });
    if(value.review&&typeof value.review.revisionId==='string'&&value.review.decisions){
      var decisions={};
      CHECK_IDS.forEach(function(id){
        var v=value.review.decisions[id];
        if(['','reviewed','needs_adjustment','not_applicable'].indexOf(v)>=0)decisions[id]=v;
      });
      result.review={revisionId:value.review.revisionId,decisions:decisions};
    }
    ['planFields','measurementFields'].forEach(function(kind){
      var group=value[kind];
      if(!group||typeof group.revisionId!=='string'||!group.fields||typeof group.fields!=='object'||Array.isArray(group.fields))return;
      var fields={};
      Object.keys(group.fields).forEach(function(id){
        var allowed=kind==='measurementFields'?measurementFieldId(id):
          /^sp-dop-(light-L\d+-(x|y|heightM|distanceM|intensityPct|kelvin)|camera-(fps|shutterAngle|aperture|iso|whiteBalanceK|ndStops)|local-reason)$/.test(id);
        if(allowed&&typeof group.fields[id]==='string'&&group.fields[id].length<=1000)fields[id]=group.fields[id];
      });
      result[kind]={revisionId:group.revisionId,fields:fields};
    });
    if(value.importedFromBackup&&value.importedFromBackup.version===1){
      result.importedFromBackup={version:1,savedAt:String(value.importedFromBackup.savedAt||''),
        importedAt:String(value.importedFromBackup.importedAt||'')};
    }
    return result;
  }
  function validateBackupPayload(payload){
    var c=backupCore();
    if(!payload||typeof payload!=='object'||Array.isArray(payload)||
       Object.keys(payload).sort().join(',')!=='draft,excluded,name,photo,prelightReviews,revisions,savedAt'||
       typeof payload.name!=='string'||!payload.name.trim()||payload.name.length>80||
       typeof payload.savedAt!=='string'||!Number.isFinite(Date.parse(payload.savedAt))||
       !Array.isArray(payload.excluded)||c.canonicalJson(payload.excluded)!==c.canonicalJson(BACKUP_EXCLUDED))
      throw new Error('Nepodržana struktura kopije.');
    backupSafeKeys({draft:payload.draft,revisions:payload.revisions,prelightReviews:payload.prelightReviews},0);
    var cleanDraft=backupDraft(payload.draft);
    if(c.canonicalJson(cleanDraft)!==c.canonicalJson(payload.draft))throw new Error('Nacrt sadrži nepodržana polja.');
    if(!Array.isArray(payload.revisions)||payload.revisions.length>2000||!Array.isArray(payload.prelightReviews)||
       payload.prelightReviews.length>10000)throw new Error('Istorija nije podržana.');
    var history=payload.revisions.length?c.restoreRevisions(payload.revisions):[];
    c.restorePrelightReviews(payload.prelightReviews,history);
    if(payload.photo!==null&&(typeof payload.photo!=='string'||payload.photo.length>12000000||
       !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(payload.photo)||
       (payload.photo.length-payload.photo.indexOf(',')-1)%4!==0))
      throw new Error('Fotografija nije podržana.');
    if(payload.photo&&root.Android&&typeof root.Android.validateScenePlannerBackupPhoto==='function'&&
       root.Android.validateScenePlannerBackupPhoto(payload.photo)!==true)throw new Error('Fotografija nije čitljiva ili prelazi 16 megapiksela / 8192 px.');
    return payload;
  }
  async function exportSceneBackup(){
    if(scenesBlocked)throw new Error('Skladište scena nije dostupno.');
    if(active&&!flush())throw new Error('Nacrt nije trajno sačuvan.');
    var id=scenes.activeId,c=backupCore(),d=read();
    if(!d)throw new Error('Nema čitljivog nacrta za izvoz.');
    var rawRevisions=readWorkspaceValue(WORKSPACE_KEYS[1]),rawReviews=readWorkspaceValue(WORKSPACE_KEYS[2]);
    var photo;
    if(root.Android&&typeof root.Android.loadScenePlannerPhoto==='function'){
      var raw=nativeRead('photo');
      if(raw&&!photoRecord(JSON.parse(raw)))throw new Error('Sačuvana fotografija nije čitljiva.');
    }
    photo=await loadPhoto();
    if(scenes.activeId!==id)throw new Error('Scena je promenjena tokom izvoza.');
    var payload={name:scenes.scenes.find(function(s){return s.id===id;}).name,
      savedAt:new Date().toISOString(),draft:backupDraft(d),revisions:rawRevisions?JSON.parse(rawRevisions):[],
      prelightReviews:rawReviews?JSON.parse(rawReviews):[],photo:photo,excluded:BACKUP_EXCLUDED.slice()};
    validateBackupPayload(payload);
    var canonical=c.canonicalJson(payload);
    if(utf8Size(canonical)>BACKUP_LIMIT-1024)throw new Error('Scena prelazi ograničenje kopije od 24 MiB.');
    return JSON.stringify({format:'LightingAI.SceneBackup',version:1,payload:payload,
      integrity:{algorithm:'SHA-256',digest:backupHash(canonical)}});
  }
  function previewSceneBackup(text){
    stagedBackup=null;
    if(typeof text!=='string'||text.length>BACKUP_LIMIT||utf8Size(text)>BACKUP_LIMIT)
      throw new Error('Datoteka prelazi 24 MiB.');
    var file=JSON.parse(text),c=backupCore();
    if(!file||file.format!=='LightingAI.SceneBackup'||file.version!==1||
       Object.keys(file).sort().join(',')!=='format,integrity,payload,version'||
       !file.integrity||Object.keys(file.integrity).sort().join(',')!=='algorithm,digest'||file.integrity.algorithm!=='SHA-256'||!/^[a-f0-9]{64}$/.test(file.integrity.digest))
      throw new Error('Format ili verzija kopije nisu podržani.');
    if(backupHash(c.canonicalJson(file.payload))!==file.integrity.digest)throw new Error('Provera integriteta nije uspela.');
    var p=validateBackupPayload(file.payload);
    stagedBackup=p;
    return {name:p.name,savedAt:p.savedAt,description:String(p.draft.fields['sp-description']||''),
      settings:JSON.parse(JSON.stringify(p.draft.fields)),photo:p.photo,revisionCount:p.revisions.length,
      reviewCount:p.prelightReviews.length,
      pendingMeasurements:p.draft.measurementFields?JSON.parse(JSON.stringify(p.draft.measurementFields)):null,
      pendingPlanFields:p.draft.planFields?JSON.parse(JSON.stringify(p.draft.planFields)):null,
      planSummary:p.revisions.length?p.revisions[p.revisions.length-1].plan.summary:'',
      excluded:p.excluded.slice(),digest:file.integrity.digest};
  }
  function cancelSceneBackup(){stagedBackup=null;}
  function importSceneBackup(confirmed){
    if(confirmed!==true||!stagedBackup)throw new Error('Najpre pregledaj kopiju i izričito potvrdi uvoz.');
    if(scenesBlocked||!sceneSupport()||!root.Android||
       typeof root.Android.importScenePlannerBackup!=='function')throw new Error('Android uvoz nije dostupan.');
    var p=stagedBackup,c=backupCore(),d=backupDraft(p.draft);
    // Historical records remain immutable; a new device/setup is never attested by import.
    d.fields['sp-measured']=false;d.fields['sp-scene-coords-verified']=false;
    d.importedFromBackup={version:1,savedAt:p.savedAt,importedAt:new Date().toISOString()};
    var values={};d.checkpoint=Date.now();values[DRAFT_KEY]=JSON.stringify(d);
    if(p.revisions.length){
      values[WORKSPACE_KEYS[1]]=JSON.stringify(p.revisions);
      values[WORKSPACE_KEYS[2]]=JSON.stringify(p.prelightReviews);
      values[WORKSPACE_KEYS[3]]=JSON.stringify({format:'LightingAI.ScenePlanner.v1',
        plan:p.revisions[p.revisions.length-1].plan,revisions:p.revisions,prelightReviewHistory:p.prelightReviews});
    }
    var workspace=JSON.stringify({version:1,checkpoint:d.checkpoint,values:values});
    if(utf8Size(workspace)>8*1024*1024)throw new Error('Scena prelazi ograničenje Android radnog zapisa od 8 MiB.');
    var photo=p.photo?JSON.stringify({version:2,sequence:Date.now(),value:p.photo}):'';
    var name=p.name.slice(0,72)+' (uvoz)';
    var id=root.Android.importScenePlannerBackup(name,workspace,photo,JSON.stringify(scenes));
    if(typeof id!=='string'||!/^s-[a-z0-9]{8,64}$/.test(id))throw new Error('Uvoz nije sačuvan. Proveri slobodan prostor; postojeće scene nisu menjane.');
    stagedBackup=null;loadScenes();
    return {id:id,name:name};
  }
  function importedSceneInfo(){var d=read();return d&&d.importedFromBackup||null;}

  function createScene(name){return selectScene(null,name);}
  function nativeAvailable(){return !!(root.Android&&typeof root.Android.saveScenePlannerWorkspace==='function');}
  function readWorkspaceValue(key){
    if(WORKSPACE_KEYS.indexOf(key)<0)return null;
    if(nativeWorkspace&&Object.prototype.hasOwnProperty.call(nativeWorkspace.values,key))return nativeWorkspace.values[key];
    var s=storage();try{return s?s.getItem(key):null;}catch(e){return null;}
  }
  function checkpointWorkspace(updates){
    if(scenesBlocked||!nativeAvailable())return false;
    try{
      var values={},s=storage();
      WORKSPACE_KEYS.forEach(function(key){
        var value=nativeWorkspace&&nativeWorkspace.values[key];
        if(typeof value!=='string'){
          try{value=s&&s.getItem(key);}catch(e){value=null;}
        }
        if(updates&&Object.prototype.hasOwnProperty.call(updates,key))value=updates[key];
        if(typeof value==='string')values[key]=value;
      });
      checkpoint=Math.max(checkpoint,Date.now())+1;
      if(values[DRAFT_KEY]){var d=JSON.parse(values[DRAFT_KEY]);d.checkpoint=checkpoint;values[DRAFT_KEY]=JSON.stringify(d);}
      var snapshot={version:1,checkpoint:checkpoint,values:values};
      if(nativeWrite('workspace',JSON.stringify(snapshot))!==true)return false;
      nativeWorkspace=snapshot;
      return true;
    }catch(e){return false;}
  }
  function recoverNativeWorkspace(){
    if(!nativeAvailable()||typeof root.Android.loadScenePlannerWorkspace!=='function')return;
    try{
      var raw=nativeRead('workspace');if(!raw)return;
      var saved;
      try{saved=JSON.parse(raw);}catch(invalidNative){
        scenesBlocked=true;report(false,'Android nacrt nije čitljiv; postojeći zapis je očuvan.');return;
      }
      var s=storage(),local=null;
      // A denied WebView storage read must not hide a valid Android native checkpoint.
      try{local=s&&s.getItem(DRAFT_KEY);}catch(e){}
      var localDraft=local?JSON.parse(local):null;
      if(!saved||saved.version!==1||!saved.values||typeof saved.values!=='object'||
         Array.isArray(saved.values)||!Number.isSafeInteger(saved.checkpoint)){
        scenesBlocked=true;report(false,'Android nacrt nije podržan; postojeći zapis je očuvan.');return;
      }
      // Preserve corrupt/unsupported local data; never silently replace it.
      if(localDraft&&(localDraft.version!==1||!localDraft.fields||typeof localDraft.fields!=='object'||Array.isArray(localDraft.fields)))return;
      if(localDraft&&Number(localDraft.checkpoint)>saved.checkpoint)return;
      nativeWorkspace=saved;checkpoint=Math.max(checkpoint,saved.checkpoint);
      WORKSPACE_KEYS.forEach(function(key){
        if(typeof saved.values[key]==='string'&&s){try{s.setItem(key,saved.values[key]);}catch(e){}}
      });
    }catch(e){}
  }
  function report(ok,message){
    lastError=ok?'':message||'Nacrt nije sačuvan. Proveri slobodan prostor i sačuvaj JSON plana.';
    if(active&&active.onStatus)active.onStatus(ok,lastError);
    return ok;
  }
  function storage(){
    try{
      var s=root.localStorage;if(!s||scenes.activeId==='legacy')return s;
      var prefix='lighting_scene_'+scenes.activeId+':';
      return {getItem:function(k){return s.getItem(prefix+k);},setItem:function(k,v){s.setItem(prefix+k,v);}};
    }catch(e){return null;}
  }
  function read(){
    // Native AtomicFile data can survive even when WebView localStorage is unavailable.
    var s=storage();if(!s&&!nativeWorkspace){report(false);return null;}
    try{var raw=readWorkspaceValue(DRAFT_KEY);if(!raw)return null;
      var d=JSON.parse(raw);
      if(!d||d.version!==1||typeof d!=='object'||Array.isArray(d)||
         !d.fields||typeof d.fields!=='object'||Array.isArray(d.fields))throw new Error('Invalid draft');
      return d;
    }catch(e){report(false,'Sačuvan nacrt nije čitljiv. Postojeći zapis je očuvan; automatski upis je blokiran.');return null;}
  }
  function write(d){
    if(scenesBlocked)return report(false,'Upis je blokiran dok se ne proveri skladište scena.');
    checkpoint=Math.max(checkpoint,Date.now())+1;d.checkpoint=checkpoint;
    var s=storage(),localSaved=false,value=JSON.stringify(d);
    try{if(s){s.setItem(DRAFT_KEY,value);localSaved=true;}}catch(e){}
    var updates={};updates[DRAFT_KEY]=value;
    if(nativeAvailable()){
      var saved=checkpointWorkspace(updates);
      if(!saved&&localSaved)nativeWorkspace=null;
      return report(saved);
    }
    return report(localSaved);
  }
  function initial(){
    var saved=read(),s=storage();
    if(saved)return saved;
    // Never replace a malformed existing draft with a blank one.
    try{if((!s&&!nativeAvailable())||readWorkspaceValue(DRAFT_KEY))return null;}catch(e){return null;}
    return {version:1,open:false,fields:{},review:null,scrollTop:0};
  }
  function node(overlay,id){return overlay&&overlay.querySelector('#'+id);}
  function revisionId(getRevisionId){
    try{return typeof getRevisionId==='function'?getRevisionId():null;}catch(e){return null;}
  }
  // Pending on-set entries are drafts, never measurement attestations.
  function measurementFieldId(id){
    return /^sp-(distance|optic|incident)-L\d+$/.test(id)||
      /^sp-meter-(model|point|orientation|time|identifier|offset)-L\d+$/.test(id)||
      /^sp-scene-total-(lux|meter-model|meter-id|point|time|offset)$/.test(id)||
      /^sp-waveform-(ire|camera-model|profile|card|source|path|code-range|transfer|lut|time|offset|target|basis)$/.test(id);
  }
  function measurementField(f){
    return !!(f&&['INPUT','TEXTAREA','SELECT'].indexOf(f.tagName)>=0&&
      ['text','number','datetime-local','textarea','select-one'].indexOf(f.type)>=0&&measurementFieldId(f.id));
  }
  function capture(overlay,getRevisionId){
    if(!overlay)return false;
    var saved=initial(),fields={};if(!saved)return false;
    FIELD_IDS.forEach(function(id){
      var f=node(overlay,id);if(!f)return;
      fields[id]=f.type==='checkbox'?f.checked===true:String(f.value||'');
    });
    saved.fields=fields;
    saved.open=true;
    saved.scrollTop=Math.max(0,Math.round(overlay.scrollTop||0));
    var decisions={},seen=false;
    CHECK_IDS.forEach(function(id){
      var f=node(overlay,'sp-prelight-'+id);
      if(f){seen=true;decisions[id]=String(f.value||'');}
    });
    if(seen){
      saved.review={revisionId:revisionId(getRevisionId),decisions:decisions};
    }
    var planFields={};
    if(overlay.querySelectorAll)Array.prototype.forEach.call(overlay.querySelectorAll('input[id],textarea[id]'),function(f){
      if(/^sp-dop-(light-L\d+-(x|y|heightM|distanceM|intensityPct|kelvin)|camera-(fps|shutterAngle|aperture|iso|whiteBalanceK|ndStops)|local-reason)$/.test(f.id))
        planFields[f.id]=String(f.value||'');
    });
    saved.planFields={revisionId:revisionId(getRevisionId),fields:planFields};
    var measurementFields={};
    if(overlay.querySelectorAll)Array.prototype.forEach.call(overlay.querySelectorAll('input[id],textarea[id],select[id]'),function(f){
      if(measurementField(f)&&String(f.value||'').length<=1000)measurementFields[f.id]=String(f.value||'');
    });
    saved.measurementFields={revisionId:revisionId(getRevisionId),fields:measurementFields};
    return write(saved);
  }
  function restore(overlay,currentRevisionId){
    var saved=read();if(!saved||!overlay)return false;
    var fields=saved.fields&&typeof saved.fields==='object'?saved.fields:{};
    FIELD_IDS.forEach(function(id){
      var f=node(overlay,id);
      if(!f||!Object.prototype.hasOwnProperty.call(fields,id))return;
      var value=fields[id];
      if(f.type==='checkbox'){f.checked=value===true;return;}
      if(typeof value!=='string')return;
      if(f.tagName==='SELECT' && !Array.prototype.some.call(f.options,function(o){return o.value===value;}))return;
      f.value=value;
    });
    var r=saved.review;
    if(r&&currentRevisionId&&r.revisionId===currentRevisionId&&r.decisions){
      CHECK_IDS.forEach(function(id){
        var f=node(overlay,'sp-prelight-'+id),v=r.decisions[id];
        if(f&&['','reviewed','needs_adjustment','not_applicable'].indexOf(v)>=0)f.value=v;
      });
    }
    var pending=saved.planFields;
    if(pending&&currentRevisionId&&pending.revisionId===currentRevisionId&&pending.fields)
      Object.keys(pending.fields).forEach(function(id){
        if(!/^sp-dop-(light-L\d+-(x|y|heightM|distanceM|intensityPct|kelvin)|camera-(fps|shutterAngle|aperture|iso|whiteBalanceK|ndStops)|local-reason)$/.test(id))return;
        var f=node(overlay,id);if(f&&typeof pending.fields[id]==='string')f.value=pending.fields[id];
      });
    var measurements=saved.measurementFields;
    if(measurements&&currentRevisionId&&measurements.revisionId===currentRevisionId&&
       measurements.fields&&typeof measurements.fields==='object'&&!Array.isArray(measurements.fields))
      Object.keys(measurements.fields).forEach(function(id){
        if(!measurementFieldId(id))return;
        var f=node(overlay,id),value=measurements.fields[id];
        if(!measurementField(f)||typeof value!=='string'||value.length>1000)return;
        if(f.tagName==='SELECT'&&!Array.prototype.some.call(f.options,function(o){return o.value===value;}))return;
        f.value=value;
      });
    var y=Number(saved.scrollTop);
    if(Number.isFinite(y)&&y>=0){
      root.setTimeout(function(){if(overlay.isConnected)overlay.scrollTop=y;},80);
    }
    return true;
  }
  function setOpen(flag){
    var d=initial();if(!d)return false;d.open=flag===true;return write(d);
  }
  function shouldReopen(){var d=read();return !!(d&&d.open);}
  function detach(){
    if(!active)return;
    var a=active;active=null;
    root.clearTimeout(a.timer);
    a.overlay.removeEventListener('input',a.onEdit);
    a.overlay.removeEventListener('change',a.onEdit);
    a.overlay.removeEventListener('scroll',a.onScroll);
    root.document.removeEventListener('visibilitychange',a.onHidden);
    root.removeEventListener('pagehide',a.onPageHide);
  }
  function attach(overlay,getRevisionId,onStatus){
    detach();
    function flush(){if(!active||active.overlay!==overlay)return false;
      root.clearTimeout(active.timer);active.timer=null;return capture(overlay,getRevisionId);
    }
    function defer(){
      if(!active||active.overlay!==overlay)return;
      root.clearTimeout(active.timer);
      active.timer=root.setTimeout(flush,130);
    }
    function onPageHide(){flush();}
    function onEdit(ev){
      // Save edits immediately: Android process death need not deliver a final event.
      if(ev.target&&ev.target.matches&&ev.target.matches('input,textarea,select'))flush();
    }
    active={overlay:overlay,getRevisionId:getRevisionId,timer:null,onEdit:onEdit,
      onScroll:defer,onHidden:function(){if(root.document.hidden)flush();},onPageHide:onPageHide,onStatus:onStatus};
    overlay.addEventListener('input',onEdit);
    overlay.addEventListener('change',onEdit);
    overlay.addEventListener('scroll',defer,{passive:true});
    root.document.addEventListener('visibilitychange',active.onHidden);
    root.addEventListener('pagehide',onPageHide);
    setOpen(true);
  }
  function flush(){
    if(!active)return false;
    root.clearTimeout(active.timer);active.timer=null;
    return capture(active.overlay,active.getRevisionId);
  }
  function validPhoto(v){return typeof v==='string' && /^data:image\/(jpeg|png|webp);base64,/.test(v) && v.length<=12000000;}
  function db(){
    return new Promise(function(resolve,reject){
      if(!root.indexedDB){reject(new Error('No IndexedDB'));return;}
      var req=root.indexedDB.open('lightingai_scene_planner_draft_media_v1',1);
      req.onupgradeneeded=function(){req.result.createObjectStore('files');};
      req.onerror=function(){reject(req.error||new Error('IndexedDB unavailable'));};
      req.onsuccess=function(){resolve(req.result);};
    });
  }
  function writePhotoDb(value){
    var key=scenes.activeId==='legacy'?'photo':'photo:'+scenes.activeId;
    return db().then(function(database){return new Promise(function(resolve){
      var tx;
      try{tx=database.transaction('files','readwrite');
        tx.objectStore('files').put(value,key);
      }catch(e){database.close();resolve(false);return;}
      tx.oncomplete=function(){database.close();resolve(true);};
      tx.onerror=tx.onabort=function(){database.close();resolve(false);};
    });}).catch(function(){return false;});
  }
  function readPhotoDb(){
    var key=scenes.activeId==='legacy'?'photo':'photo:'+scenes.activeId;
    return db().then(function(database){return new Promise(function(resolve){
      var req;
      try{req=database.transaction('files','readonly').objectStore('files').get(key);}
      catch(e){database.close();resolve(null);return;}
      req.onsuccess=function(){database.close();resolve(photoRecord(req.result));};
      req.onerror=function(){database.close();resolve(null);};
    });}).catch(function(){return null;});
  }
  function photoRecord(value){
    if(validPhoto(value))return {version:2,sequence:0,value:value}; // Legacy v1 photo.
    return value&&value.version===2&&Number.isSafeInteger(value.sequence)&&value.sequence>=0&&validPhoto(value.value)?value:null;
  }
  function savePhoto(value){
    if(scenesBlocked)return Promise.resolve(report(false,'Upis fotografije je blokiran.'));
    if(!validPhoto(value)){report(false,'Fotografija nije podržana za lokalno čuvanje.');return Promise.resolve(false);}
    var s=storage();
    try{photoSequence=Math.max(photoSequence,Number(s&&s.getItem(PHOTO_SEQUENCE_KEY))||0,Date.now())+1;
      if(s)s.setItem(PHOTO_SEQUENCE_KEY,String(photoSequence));
    }catch(e){photoSequence++;}
    var record={version:2,sequence:photoSequence,value:value};
    if(root.Android&&typeof root.Android.saveScenePlannerPhoto==='function'){
      try{
        if(nativeWrite('photo',JSON.stringify(record))!==true){
          report(false,'Fotografija nije trajno sačuvana u Android skladištu.');return Promise.resolve(false);
        }
        report(true);return Promise.resolve(true);
      }catch(e){report(false,'Fotografija nije trajno sačuvana u Android skladištu.');return Promise.resolve(false);}
    }
    if(s&&value.length<=2300000){
      try{s.setItem(PHOTO_KEY,JSON.stringify(record));report(true);return Promise.resolve(true);}catch(e){}
    }
    // Serialize database writes: an older asynchronous save must not overwrite a newer photo.
    var write=photoWrites.then(function(){return writePhotoDb(record);});
    photoWrites=write.catch(function(){return false;});
    return write.then(function(ok){report(ok, 'Fotografija nije trajno sačuvana. Sačuvaj original pre zatvaranja aplikacije.');return ok;});
  }
  function loadPhoto(){
    var s=storage(),local=null;
    try{var raw=s&&s.getItem(PHOTO_KEY);local=photoRecord(raw);
      if(!local&&raw)local=photoRecord(JSON.parse(raw));
    }catch(e){}
    var native=null;
    try{if(root.Android&&typeof root.Android.loadScenePlannerPhoto==='function')
      native=photoRecord(JSON.parse(nativeRead('photo')||'null'));}catch(e){}
    return readPhotoDb().then(function(record){
      var latest=local&&(!record||local.sequence>=record.sequence)?local:record;
      if(native&&(!latest||native.sequence>=latest.sequence))latest=native;
      if(latest)photoSequence=Math.max(photoSequence,latest.sequence);
      return latest?latest.value:null;
    });
  }
  loadScenes();
  recoverNativeWorkspace();
  return void (root.LightingAIScenePlannerDraft={
    shouldReopen:shouldReopen,setOpen:setOpen,capture:capture,restore:restore,
    attach:attach,detach:detach,flush:flush,savePhoto:savePhoto,loadPhoto:loadPhoto,
    readWorkspaceValue:readWorkspaceValue,checkpointWorkspace:checkpointWorkspace,nativeAvailable:nativeAvailable,
    exportSceneBackup:exportSceneBackup,previewSceneBackup:previewSceneBackup,importSceneBackup:importSceneBackup,
    cancelSceneBackup:cancelSceneBackup,importedSceneInfo:importedSceneInfo,backupMaxBytes:BACKUP_LIMIT,
    listScenes:listScenes,selectScene:selectScene,createScene:createScene,sceneStorage:storage,
    activeSceneId:function(){return scenes.activeId;},sceneSupport:sceneSupport,
    lastError:function(){return lastError;},version:'1.2-native-atomic-recovery'
  });
})(window);
