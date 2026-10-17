(function(root){
'use strict';
var memory=Object.create(null);
function sceneId(){var d=root.LightingAIScenePlannerDraft;return d&&typeof d.activeSceneId==='function'?d.activeSceneId():'legacy';}
function valid(x){
 if(!x||x.version!==1||Object.keys(x).sort().join(',')!=='description,dpRequest,photo,selectedIds,settings,version')return false;
 if(typeof x.photo!=='string'||x.photo.length>12000000||(x.photo!==''&&!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(x.photo)))return false;
 if(typeof x.description!=='string'||x.description.length>20000||typeof x.dpRequest!=='string'||x.dpRequest.length>20000)return false;
 if(!Array.isArray(x.selectedIds)||x.selectedIds.length>1000||!x.selectedIds.every(function(id){return typeof id==='string'&&id.length>0&&id.length<=200;}))return false;
 var s=x.settings;
 return !!s&&Object.keys(s).sort().join(',')==='look,useDmx,useMeasurements,useSun'&&typeof s.look==='string'&&s.look.length<=80&&['useMeasurements','useSun','useDmx'].every(function(k){return typeof s[k]==='boolean';});
}
function open(){
 var id=sceneId(),blocked=false,last='',lastPhoto=null,error='';
 var native=!!(root.Android&&typeof root.Android.loadAIVisualDraft==='function'&&typeof root.Android.saveAIVisualDraft==='function');
 return {sceneId:id,native:native,
  load:function(){
   try{var raw=native?root.Android.loadAIVisualDraft(id):(memory[id]||'');if(!raw)return null;var value=JSON.parse(raw);if(!valid(value))throw new Error('Invalid draft');lastPhoto=typeof root.Android?.saveAIVisualDraftMetadata==='function'?null:value.photo;last=JSON.stringify({version:value.version,description:value.description,dpRequest:value.dpRequest,selectedIds:value.selectedIds,settings:value.settings});return value;}
   catch(e){blocked=true;error='unreadable';return null;}
  },
  save:function(value){
   if(blocked||sceneId()!==id||!valid(value)){error=blocked?'unreadable':'invalid';return false;}
   try{var raw=JSON.stringify({version:value.version,description:value.description,dpRequest:value.dpRequest,selectedIds:value.selectedIds,settings:value.settings});if(raw===last&&value.photo===lastPhoto)return true;if(native){var ok=value.photo===lastPhoto&&typeof root.Android.saveAIVisualDraftMetadata==='function'?root.Android.saveAIVisualDraftMetadata(id,raw):root.Android.saveAIVisualDraft(id,JSON.stringify(value));if(ok!==true){error='write';return false;}}else memory[id]=JSON.stringify(value);lastPhoto=value.photo;last=raw;error='';return true;}
   catch(e){error='write';return false;}
  },error:function(){return error;}
 };
}
root.LightingAIVisualDraft={open:open,valid:valid,version:'1-private-scene-draft'};
})(window);
