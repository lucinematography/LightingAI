(function (root) {
  'use strict';
  // Recoverable, device-local Scene Planner draft. No network upload or book/media export.
  var DRAFT_KEY='lighting_scene_planner_draft_v1';
  var PHOTO_KEY='lighting_scene_planner_draft_photo_v1';
  var FIELD_IDS=['sp-description','sp-capture','sp-shot-camera','sp-mode','sp-look',
    'sp-width','sp-depth','sp-location','sp-scene-datetime','sp-scene-lat',
    'sp-scene-lon','sp-scene-tz','sp-scene-coords-verified','sp-measured',
    'sp-dop-request','sp-aperture','sp-iso','sp-fps','sp-shutter','sp-wb','sp-nd'];
  var CHECK_IDS=['motivation','contrast','separation'];
  var active=null;
  function storage(){try{return root.localStorage;}catch(e){return null;}}
  function read(){
    var s=storage();if(!s)return null;
    try{var d=JSON.parse(s.getItem(DRAFT_KEY)||'null');
      return d&&d.version===1&&typeof d==='object'?d:null;
    }catch(e){return null;}
  }
  function write(d){
    var s=storage();if(!s)return false;
    try{s.setItem(DRAFT_KEY,JSON.stringify(d));return true;}catch(e){return false;}
  }
  function initial(){return read()||{version:1,open:false,fields:{},review:null,scrollTop:0};}
  function node(overlay,id){return overlay&&overlay.querySelector('#'+id);}
  function revisionId(getRevisionId){
    try{return typeof getRevisionId==='function'?getRevisionId():null;}catch(e){return null;}
  }
  function capture(overlay,getRevisionId){
    if(!overlay)return false;
    var saved=initial(),fields={};
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
    var y=Number(saved.scrollTop);
    if(Number.isFinite(y)&&y>=0){
      root.setTimeout(function(){if(overlay.isConnected)overlay.scrollTop=y;},80);
    }
    return true;
  }
  function setOpen(flag){
    var d=initial();d.open=flag===true;return write(d);
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
    root.removeEventListener('pagehide',a.onHidden);
  }
  function attach(overlay,getRevisionId){
    detach();
    function flush(){if(!active||active.overlay!==overlay)return false;
      root.clearTimeout(active.timer);active.timer=null;return capture(overlay,getRevisionId);
    }
    function defer(){
      if(!active||active.overlay!==overlay)return;
      root.clearTimeout(active.timer);
      active.timer=root.setTimeout(flush,130);
    }
    function onHidden(){if(root.document.hidden)flush();}
    function onPageHide(){flush();}
    function onEdit(ev){
      if(ev.target&&ev.target.matches&&ev.target.matches('input,textarea,select'))defer();
    }
    active={overlay:overlay,getRevisionId:getRevisionId,timer:null,onEdit:onEdit,
      onScroll:defer,onHidden:function(){if(root.document.hidden)flush();},onPageHide:onPageHide};
    overlay.addEventListener('input',onEdit);
    overlay.addEventListener('change',onEdit);
    overlay.addEventListener('scroll',defer,{passive:true});
    root.document.addEventListener('visibilitychange',active.onHidden);
    root.addEventListener('pagehide',onPageHide);
    setOpen(true);
  }
  function flush(){return active?capture(active.overlay,active.getRevisionId):false;}
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
      req.onsuccess=function(){database.close();resolve(validPhoto(req.result)?req.result:null);};
      req.onerror=function(){database.close();resolve(null);};
    });}).catch(function(){return null;});
  }
  function savePhoto(value){
    if(!validPhoto(value))return Promise.resolve(false);
    var s=storage();
    if(s&&value.length<=2300000){
      try{s.setItem(PHOTO_KEY,value);return Promise.resolve(true);}catch(e){}
    }
    return writePhotoDb(value);
  }
  function loadPhoto(){
    var s=storage();
    try{var v=s&&s.getItem(PHOTO_KEY);if(validPhoto(v))return Promise.resolve(v);}catch(e){}
    return readPhotoDb();
  }
  return void (root.LightingAIScenePlannerDraft={
    shouldReopen:shouldReopen,setOpen:setOpen,capture:capture,restore:restore,
    attach:attach,detach:detach,flush:flush,savePhoto:savePhoto,loadPhoto:loadPhoto,
    version:'1.0-background-recovery'
  });
})(window);
