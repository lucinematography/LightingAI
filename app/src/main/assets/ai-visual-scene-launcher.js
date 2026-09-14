(function(){
'use strict';
var BUTTON_ID='lightingai-ai-visual-launcher';
var SCRIPT_ID='lightingai-ai-visual-scene-plan-script';
var SIM_SCRIPT_ID='lightingai-ai-visual-local-simulation-script';
var POLISH_SCRIPT_ID='lightingai-ai-visual-result-polish-script';
var BUILD_SCRIPT_ID='lightingai-feature-build-info-script';
var PHONE_DIAG_SCRIPT_ID='lightingai-project5-phone-diagnostics-script';
var EQUIPMENT_HOME_SCRIPT_ID='lightingai-ai-equipment-home-script';
var DIAG_ID='lightingai-project5-diagnostic';
var MODULE_ID='lightingai-ai-visual-scene-plan';
var PROD_API='https://lightingai.onrender.com';
var PREVIEW_TEST_API='https://lightingai-ai-preview-test.onrender.com';
var previewCapabilityVerified=false;
var diagnosticRequestInFlight=false;
function label(){return window.currentLang==='en'?'AI VISUAL PLAN':'AI VIZUELNI PLAN';}
function isSr(){return window.currentLang!=='en';}
function unavailableResponse(status){return {ok:false,status:status||503,json:function(){return Promise.resolve({ok:false,environment:'unverified-isolated-test'});}};}
function isExactApi(url,path){return url===PROD_API+path||url.indexOf(PROD_API+path+'?')===0;}
function buildInfo(){return window.LightingAIFeatureBuild||{};}
function buildLabel(){var b=buildInfo();return b.run?('B'+b.run+(b.sha?' • '+b.sha:'')):'';}
function updateButton(){var b=document.getElementById(BUTTON_ID);if(!b)return;var tag=buildLabel();b.textContent='✦ '+label()+(tag?' • '+tag:'');b.setAttribute('aria-label',label()+(tag?' '+tag:''));}
function ensureBuildInfo(next){
  if(window.LightingAIFeatureBuild){updateButton();if(next)next();return;}
  var existing=document.getElementById(BUILD_SCRIPT_ID);
  if(existing){updateButton();if(next)next();return;}
  var script=document.createElement('script');
  script.id=BUILD_SCRIPT_ID;
  script.src='file:///android_asset/feature-build-info.js';
  script.onload=function(){updateButton();if(next)next();};
  script.onerror=function(){updateButton();if(next)next();};
  document.body.appendChild(script);
}
function diagnosticShell(){
  var module=document.getElementById(MODULE_ID);if(!module)return null;
  var existing=document.getElementById(DIAG_ID);if(existing)return existing;
  var inner=module.firstElementChild;if(!inner)return null;
  var box=document.createElement('div');box.id=DIAG_ID;
  box.style.cssText='margin-top:12px;padding:10px 12px;border:1px solid #3b4048;border-radius:11px;background:#11141a;color:#c7ccd3;font-size:12px;line-height:1.45';
  var header=inner.firstElementChild;if(header&&header.parentNode===inner)header.insertAdjacentElement('afterend',box);else inner.insertBefore(box,inner.firstChild);
  return box;
}
function renderDiagnostic(previewState){
  var box=diagnosticShell();if(!box)return;
  var b=buildInfo(),run=b.run||'?',sha=b.sha||'?',branch=b.branch||'feature',previewText=previewState==='active'?(isSr()?'AKTIVAN':'ACTIVE'):previewState==='checking'?(isSr()?'PROVERA...':'CHECKING...'):(isSr()?'ZAKLJUČAN':'LOCKED');
  var previewColor=previewState==='active'?'#8ee6a8':previewState==='checking'?'#f5dd91':'#ffb5b5';
  box.innerHTML='<b style="color:#f5c542">P5 TEST • BUILD '+String(run)+' • '+String(sha)+'</b><div style="margin-top:4px">'+(isSr()?'GRANA':'BRANCH')+': '+String(branch)+'</div><div>AI PLAN: <b style="color:#8ee6a8">'+(isSr()?'PRODUKCIJA':'PRODUCTION')+'</b></div><div>FOTO-PREVIEW: <b style="color:'+previewColor+'">'+previewText+'</b></div>';
  if(window.LightingAIProject5Diagnostics&&typeof window.LightingAIProject5Diagnostics.mount==='function')window.LightingAIProject5Diagnostics.mount();
}
function updateDiagnostic(){
  renderDiagnostic('checking');
  if(diagnosticRequestInFlight)return;
  diagnosticRequestInFlight=true;
  fetch(PREVIEW_TEST_API+'/api/visual-preview',{cache:'no-store'}).then(function(r){return r.json();}).then(function(v){renderDiagnostic(v&&v.ok===true&&v.environment==='isolated-test'?'active':'locked');}).catch(function(){renderDiagnostic('locked');}).finally(function(){diagnosticRequestInFlight=false;});
}
function selectedLook(){var s=document.getElementById('aiv-look-preset');if(s&&s.value)return s.value;if(window.LightingAILocalLightSimulation&&typeof window.LightingAILocalLightSimulation.getPreset==='function')return window.LightingAILocalLightSimulation.getPreset();return 'Cinematic';}
function injectLook(init){if(!init||typeof init.body!=='string')return init;try{var body=JSON.parse(init.body);if(body&&typeof body==='object'&&!Array.isArray(body)){body.look=selectedLook();var copy=Object.assign({},init);copy.body=JSON.stringify(body);return copy;}}catch(e){}return init;}
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
      return nativeFetch(input,injectLook(init)).then(function(response){emitPlan(response);return response;});
    }
    return nativeFetch(input,init);
  };
  window.__lightingAIVisualPreviewFetchRouter={testApi:PREVIEW_TEST_API,isVerified:function(){return previewCapabilityVerified;}};
}
function ensureScript(id,src,ready,next){
  if(ready()){next();return;}
  var existing=document.getElementById(id);
  if(existing){existing.addEventListener('load',next,{once:true});existing.addEventListener('error',next,{once:true});return;}
  var script=document.createElement('script');
  script.id=id;
  script.src=src;
  script.onload=next;
  script.onerror=next;
  document.body.appendChild(script);
}
function ensureEquipmentHome(next){ensureScript(EQUIPMENT_HOME_SCRIPT_ID,'file:///android_asset/ai-visual-equipment-home.js',function(){return !!window.LightingAIEquipmentHome;},next||function(){});}
function ensurePhoneDiagnostics(next){ensureScript(PHONE_DIAG_SCRIPT_ID,'file:///android_asset/ai-visual-phone-diagnostics.js',function(){return !!window.LightingAIProject5Diagnostics;},next);}
function ensurePolish(next){ensureScript(POLISH_SCRIPT_ID,'file:///android_asset/ai-visual-result-polish.js',function(){return !!window.LightingAIVisualResultPolish;},function(){ensurePhoneDiagnostics(next);});}
function ensureSimulation(next){ensureScript(SIM_SCRIPT_ID,'file:///android_asset/ai-visual-local-simulation.js',function(){return !!window.LightingAILocalLightSimulation;},function(){ensurePolish(next);});}
function opened(){setTimeout(updateDiagnostic,0);setTimeout(updateDiagnostic,900);setTimeout(function(){if(window.LightingAIProject5Diagnostics&&typeof window.LightingAIProject5Diagnostics.mount==='function')window.LightingAIProject5Diagnostics.mount();},1000);}
function openPlanModule(){
  if(window.LightingAIVisualScenePlan&&typeof window.LightingAIVisualScenePlan.open==='function'){
    window.LightingAIVisualScenePlan.open();opened();return;
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
  ensureBuildInfo(function(){ensureSimulation(openPlanModule);});
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
  ensureBuildInfo(updateButton);
  ensureEquipmentHome(function(){if(window.LightingAIEquipmentHome&&typeof window.LightingAIEquipmentHome.refresh==='function')window.LightingAIEquipmentHome.refresh();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.LightingAIVisualSceneLauncher={open:openModule,install:install,version:'0.9-equipment-ai-first'};
})();
