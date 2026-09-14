(function(){
'use strict';
var BUTTON_ID='lightingai-ai-visual-launcher';
var SCRIPT_ID='lightingai-ai-visual-scene-plan-script';
var SIM_SCRIPT_ID='lightingai-ai-visual-local-simulation-script';
var MODULE_ID='lightingai-ai-visual-scene-plan';
var PROD_API='https://lightingai.onrender.com';
var PREVIEW_TEST_API='https://lightingai-ai-preview-test.onrender.com';
var previewCapabilityVerified=false;
function label(){return window.currentLang==='en'?'AI VISUAL PLAN':'AI VIZUELNI PLAN';}
function unavailableResponse(status){return {ok:false,status:status||503,json:function(){return Promise.resolve({ok:false,environment:'unverified-isolated-test'});}};}
function isExactApi(url,path){return url===PROD_API+path||url.indexOf(PROD_API+path+'?')===0;}
function emitPlan(response){
  if(!response||!response.ok||!document.getElementById(MODULE_ID))return;
  try{
    response.clone().json().then(function(data){
      window.__lightingAIVisualLastPlan=data;
      try{window.dispatchEvent(new CustomEvent('lightingai-visual-plan-ready',{detail:data}));}catch(e){}
    }).catch(function(){});
  }catch(e){}
}
function installPreviewApiRouter(){
  if(window.__lightingAIVisualPreviewFetchRouter)return;
  var nativeFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    var url=typeof input==='string'?input:(input&&input.url?String(input.url):'');
    if(isExactApi(url,'/api/visual-preview')){
      var routed=url.replace(PROD_API,PREVIEW_TEST_API);
      var method=String((init&&init.method)||(input&&input.method)||'GET').toUpperCase();
      if(method!=='GET'&&!previewCapabilityVerified)return Promise.resolve(unavailableResponse(503));
      var requestPromise;
      if(typeof input==='string')requestPromise=nativeFetch(routed,init);
      else{try{requestPromise=nativeFetch(new Request(routed,input),init);}catch(e){requestPromise=nativeFetch(routed,init);}}
      if(method!=='GET')return requestPromise;
      return requestPromise.then(function(response){
        if(!response||!response.ok){previewCapabilityVerified=false;return response||unavailableResponse(503);}
        var copy;
        try{copy=response.clone();}catch(e){previewCapabilityVerified=false;return unavailableResponse(503);}
        return copy.json().then(function(data){
          if(data&&data.ok===true&&data.environment==='isolated-test'){
            previewCapabilityVerified=true;
            return response;
          }
          previewCapabilityVerified=false;
          return unavailableResponse(200);
        }).catch(function(){previewCapabilityVerified=false;return unavailableResponse(503);});
      }).catch(function(){previewCapabilityVerified=false;return unavailableResponse(503);});
    }
    if(isExactApi(url,'/api/lighting-plan')){
      return nativeFetch(input,init).then(function(response){emitPlan(response);return response;});
    }
    return nativeFetch(input,init);
  };
  window.__lightingAIVisualPreviewFetchRouter={testApi:PREVIEW_TEST_API,isVerified:function(){return previewCapabilityVerified;}};
}
function ensureSimulation(next){
  if(window.LightingAILocalLightSimulation){next();return;}
  var existing=document.getElementById(SIM_SCRIPT_ID);
  if(existing){existing.addEventListener('load',next,{once:true});return;}
  var script=document.createElement('script');
  script.id=SIM_SCRIPT_ID;
  script.src='file:///android_asset/ai-visual-local-simulation.js';
  script.onload=next;
  script.onerror=next;
  document.body.appendChild(script);
}
function openPlanModule(){
  if(window.LightingAIVisualScenePlan&&typeof window.LightingAIVisualScenePlan.open==='function'){
    window.LightingAIVisualScenePlan.open();
    return;
  }
  var existing=document.getElementById(SCRIPT_ID);
  if(existing){existing.addEventListener('load',openPlanModule,{once:true});return;}
  var script=document.createElement('script');
  script.id=SCRIPT_ID;
  script.src='file:///android_asset/ai-visual-scene-plan.js';
  script.onload=openPlanModule;
  document.body.appendChild(script);
}
function openModule(){
  installPreviewApiRouter();
  ensureSimulation(openPlanModule);
}
function install(){
  if(document.getElementById(BUTTON_ID))return;
  var button=document.createElement('button');
  button.id=BUTTON_ID;
  button.type='button';
  button.textContent='✦ '+label();
  button.setAttribute('aria-label',label());
  button.style.cssText='position:fixed;right:14px;bottom:92px;z-index:1200;border:1px solid #f5c542;border-radius:999px;padding:12px 15px;background:#191b20;color:#f5c542;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,.35)';
  button.onclick=openModule;
  document.body.appendChild(button);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.LightingAIVisualSceneLauncher={open:openModule,install:install,version:'0.4-local-simulation'};
})();
