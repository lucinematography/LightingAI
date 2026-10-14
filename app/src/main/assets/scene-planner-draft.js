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
  var active=null,lastError='',photoSequence=Date.now(),photoWrites=Promise.resolve();
  function report(ok,message){
    lastError=ok?'':message||'Nacrt nije sačuvan. Proveri slobodan prostor i sačuvaj JSON plana.';
    if(active&&active.onStatus)active.onStatus(ok,lastError);
    return ok;
  }
  function storage(){try{return root.localStorage;}catch(e){return null;}}
  function read(){
    var s=storage();if(!s){report(false);return null;}
    try{var raw=s.getItem(DRAFT_KEY);if(!raw)return null;
      var d=JSON.parse(raw);
      if(!d||d.version!==1||typeof d!=='object'||Array.isArray(d)||
         !d.fields||typeof d.fields!=='object'||Array.isArray(d.fields))throw new Error('Invalid draft');
      return d;
    }catch(e){report(false,'Sačuvan nacrt nije čitljiv. Postojeći zapis je očuvan; automatski upis je blokiran.');return null;}
  }
  function write(d){
    var s=storage();if(!s)return report(false);
    try{s.setItem(DRAFT_KEY,JSON.stringify(d));return report(true);}catch(e){return report(false);}
  }
  function initial(){
    var saved=read(),s=storage();
    if(saved)return saved;
    // Never replace a malformed existing draft with a blank one.
    try{if(!s||s.getItem(DRAFT_KEY))return null;}catch(e){return null;}
    return {version:1,open:false,fields:{},review:null,scrollTop:0};
  }
  function node(overlay,id){return overlay&&overlay.querySelector('#'+id);}
  function revisionId(getRevisionId){
    try{return typeof getRevisionId==='function'?getRevisionId():null;}catch(e){return null;}
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
    return db().then(function(database){return new Promise(function(resolve){
      var tx;
      try{tx=database.transaction('files','readwrite');
        tx.objectStore('files').put(value,'photo');
      }catch(e){database.close();resolve(false);return;}
      tx.oncomplete=function(){database.close();resolve(true);};
      tx.onerror=tx.onabort=function(){database.close();resolve(false);};
    });}).catch(function(){return false;});
  }
  function readPhotoDb(){
    return db().then(function(database){return new Promise(function(resolve){
      var req;
      try{req=database.transaction('files','readonly').objectStore('files').get('photo');}
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
    if(!validPhoto(value)){report(false,'Fotografija nije podržana za lokalno čuvanje.');return Promise.resolve(false);}
    var s=storage();
    try{photoSequence=Math.max(photoSequence,Number(s&&s.getItem(PHOTO_SEQUENCE_KEY))||0,Date.now())+1;
      if(s)s.setItem(PHOTO_SEQUENCE_KEY,String(photoSequence));
    }catch(e){photoSequence++;}
    var record={version:2,sequence:photoSequence,value:value};
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
    return readPhotoDb().then(function(record){
      var latest=local&&(!record||local.sequence>=record.sequence)?local:record;
      if(latest)photoSequence=Math.max(photoSequence,latest.sequence);
      return latest?latest.value:null;
    });
  }
  return void (root.LightingAIScenePlannerDraft={
    shouldReopen:shouldReopen,setOpen:setOpen,capture:capture,restore:restore,
    attach:attach,detach:detach,flush:flush,savePhoto:savePhoto,loadPhoto:loadPhoto,
    lastError:function(){return lastError;},version:'1.1-durable-background-recovery'
  });
})(window);
