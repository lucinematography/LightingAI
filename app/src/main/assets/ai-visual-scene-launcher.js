(function(){
'use strict';
var BUTTON_ID='lightingai-ai-visual-launcher';
var EQUIPMENT_CARD_ID='lightingai-ai-equipment-card';
var POWER_BODY_ID='lightingai-power-collapsible-body';
var POWER_TOGGLE_ID='lightingai-power-collapsible-toggle';
var SCRIPT_ID='lightingai-ai-visual-scene-plan-script';
var SIM_SCRIPT_ID='lightingai-ai-visual-local-simulation-script';
var POLISH_SCRIPT_ID='lightingai-ai-visual-result-polish-script';
var IMAGE_ACTIONS_SCRIPT_ID='lightingai-ai-visual-image-actions-script';
var REFINEMENTS_SCRIPT_ID='lightingai-ai-preview-refinements-script';
var BUILD_SCRIPT_ID='lightingai-feature-build-info-script';
var PHONE_DIAG_SCRIPT_ID='lightingai-project5-phone-diagnostics-script';
var MODULE_ID='lightingai-ai-visual-scene-plan';
var PROD_API='https://lightingai.onrender.com';
var PREVIEW_TEST_API='https://lightingai-ai-preview-test.onrender.com';
var PLAN_TIMEOUT_MS=55000;
var previewCapabilityVerified=false;
var previewActiveApi='';
function label(){return window.currentLang==='en'?'AI VISUAL PLAN':'AI VIZUELNI PLAN';}
function isSr(){return window.currentLang!=='en';}
function equipmentText(){return isSr()?{title:'✦ AI VIZUELNI PLAN',desc:'Fotografija scene + dostupna rasveta + AI predlog + vizuelni preview.'}:{title:'✦ AI VISUAL PLAN',desc:'Scene photo + available lighting + AI proposal + visual preview.'};}
function unavailableResponse(status){return {ok:false,status:status||503,json:function(){return Promise.resolve({ok:false,environment:'preview-unavailable'});}};}
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
function setPlanDiagnostic(){/* Release build: request diagnostics stay internal and never mount user-visible test UI. */}
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
function diagnosticPlanRequest(nativeFetch,input,init){
  var started=Date.now(),controller=typeof AbortController!=='undefined'?new AbortController():null,timeoutId=null,requestInit=injectLook(init)||{};
  var diagnosticId='phone-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
  try{if(typeof requestInit.body==='string'){var body=JSON.parse(requestInit.body);body.diagnosticId=diagnosticId;requestInit=Object.assign({},requestInit,{body:JSON.stringify(body)});}}catch(e){}
  if(controller){requestInit=Object.assign({},requestInit,{signal:controller.signal});timeoutId=setTimeout(function(){controller.abort();},PLAN_TIMEOUT_MS);}
  setPlanDiagnostic((isSr()?'AI zahtev poslat produkciji':'AI request sent to production')+' • '+diagnosticId,false);
  return nativeFetch(input,requestInit).then(function(response){
    if(timeoutId)clearTimeout(timeoutId);
    var elapsed=Date.now()-started;
    setPlanDiagnostic((isSr()?'Produkcija odgovorila za ':'Production responded in ')+(elapsed/1000).toFixed(1)+' s • HTTP '+response.status+' • '+diagnosticId,!response.ok);
    emitPlan(response);return response;
  }).catch(function(error){
    if(timeoutId)clearTimeout(timeoutId);
    var elapsed=Date.now()-started,aborted=error&&String(error.name)==='AbortError';
    setPlanDiagnostic((aborted?(isSr()?'TIMEOUT: produkcija nije odgovorila za ':'TIMEOUT: production did not respond in '):(isSr()?'MREŽNA GREŠKA posle ':'NETWORK ERROR after '))+(elapsed/1000).toFixed(1)+' s • '+diagnosticId,true);
    throw error;
  });
}
function previewGet(nativeFetch,api){
  return nativeFetch(api+'/api/visual-preview',{cache:'no-store'}).then(function(response){
    if(!response||!response.ok)return null;
    var copy;try{copy=response.clone();}catch(e){return null;}
    return copy.json().then(function(data){
      var valid=api===PREVIEW_TEST_API?(data&&data.ok===true&&data.environment==='isolated-test'):(data&&data.ok===true);
      return valid?response:null;
    }).catch(function(){return null;});
  }).catch(function(){return null;});
}
function previewRequest(nativeFetch,api,input,init){
  var target=api+'/api/visual-preview';
  if(typeof input==='string')return nativeFetch(target,init);
  try{return nativeFetch(new Request(target,input),init);}catch(e){return nativeFetch(target,init);}
}
function installPreviewApiRouter(){
  if(window.__lightingAIVisualPreviewFetchRouter)return;
  var nativeFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    var url=typeof input==='string'?input:(input&&input.url?String(input.url):'');
    if(isExactApi(url,'/api/visual-preview')){
      var method=String((init&&init.method)||(input&&input.method)||'GET').toUpperCase();
      if(method==='GET'){
        return previewGet(nativeFetch,PROD_API).then(function(prodResponse){
          if(prodResponse){previewCapabilityVerified=true;previewActiveApi=PROD_API;return prodResponse;}
          return previewGet(nativeFetch,PREVIEW_TEST_API).then(function(testResponse){
            if(testResponse){previewCapabilityVerified=true;previewActiveApi=PREVIEW_TEST_API;return testResponse;}
            previewCapabilityVerified=false;previewActiveApi='';return unavailableResponse(503);
          });
        }).catch(function(){previewCapabilityVerified=false;previewActiveApi='';return unavailableResponse(503);});
      }
      if(!previewCapabilityVerified||!previewActiveApi)return Promise.resolve(unavailableResponse(503));
      return previewRequest(nativeFetch,previewActiveApi,input,init);
    }
    if(isExactApi(url,'/api/lighting-plan'))return diagnosticPlanRequest(nativeFetch,input,init);
    return nativeFetch(input,init);
  };
  window.__lightingAIVisualPreviewFetchRouter={productionApi:PROD_API,testApi:PREVIEW_TEST_API,planTimeoutMs:PLAN_TIMEOUT_MS,isVerified:function(){return previewCapabilityVerified;},activeApi:function(){return previewActiveApi;}};
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
function ensurePhoneDiagnostics(next){ensureScript(PHONE_DIAG_SCRIPT_ID,'file:///android_asset/ai-visual-phone-diagnostics.js',function(){return !!window.LightingAIProject5Diagnostics;},next);}
function ensureRefinements(next){ensureScript(REFINEMENTS_SCRIPT_ID,'file:///android_asset/ai-visual-preview-refinements.js',function(){return !!window.LightingAIVisualPreviewRefinements;},next);}
function ensureImageActions(next){ensureScript(IMAGE_ACTIONS_SCRIPT_ID,'file:///android_asset/ai-visual-image-actions.js',function(){return !!window.LightingAIVisualImageActions;},next);}
function ensurePolish(next){ensureScript(POLISH_SCRIPT_ID,'file:///android_asset/ai-visual-result-polish.js',function(){return !!window.LightingAIVisualResultPolish;},function(){ensureImageActions(function(){ensureRefinements(function(){ensurePhoneDiagnostics(next);});});});}
function ensureSimulation(next){ensureScript(SIM_SCRIPT_ID,'file:///android_asset/ai-visual-local-simulation.js',function(){return !!window.LightingAILocalLightSimulation;},function(){ensurePolish(next);});}
function opened(){/* Release build intentionally exposes no Project 5 diagnostic/test surface. */}
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
function installEquipmentEntry(){
  var page=document.getElementById('equipment');if(!page)return false;
  var card=document.getElementById(EQUIPMENT_CARD_ID),t=equipmentText();
  if(!card){
    card=document.createElement('div');card.id=EQUIPMENT_CARD_ID;card.className='card';
    card.style.cssText='border-color:#66571f;background:linear-gradient(180deg,#191b20,#13161b);padding:16px';
    card.innerHTML='<div data-aiv-title style="font-size:20px;font-weight:900;color:#f5c542;margin-bottom:6px"></div><div data-aiv-desc class="muted small" style="line-height:1.45;margin-bottom:12px"></div>';
    var button=document.createElement('button');button.id=BUTTON_ID;button.type='button';button.className='btn primary';button.onclick=openModule;button.style.cssText='width:100%;padding:14px;font-size:15px;font-weight:900';card.appendChild(button);
  }
  var title=card.querySelector('[data-aiv-title]'),desc=card.querySelector('[data-aiv-desc]');if(title)title.textContent=t.title;if(desc)desc.textContent=t.desc;
  var pageTitle=page.querySelector('h1');if(pageTitle)pageTitle.insertAdjacentElement('afterend',card);else if(card.parentNode!==page)page.insertBefore(card,page.firstChild);
  updateButton();return true;
}
function updatePowerToggle(toggle,body){var open=!body.hidden;toggle.textContent=(open?(isSr()?'ZATVORI':'CLOSE'):(isSr()?'OTVORI':'OPEN'))+(open?' ▲':' ▼');toggle.setAttribute('aria-expanded',open?'true':'false');}
function compactPowerCard(){
  var card=document.getElementById('powerCalculatorCard');if(!card)return false;
  if(card.dataset.p5Compact==='1'){installEquipmentEntry();return true;}
  var title=card.querySelector('#powerTitle')||card.querySelector('h2');if(!title)return false;
  var header=document.createElement('div');header.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px';
  var toggle=document.createElement('button');toggle.id=POWER_TOGGLE_ID;toggle.type='button';toggle.style.cssText='border:1px solid #3b4048;border-radius:9px;padding:8px 10px;background:#252a31;color:#fff;font-weight:800;font-size:11px;white-space:nowrap';
  var body=document.createElement('div');body.id=POWER_BODY_ID;body.hidden=true;
  card.insertBefore(header,card.firstChild);header.appendChild(title);title.style.margin='0';header.appendChild(toggle);
  while(header.nextSibling)body.appendChild(header.nextSibling);card.appendChild(body);card.dataset.p5Compact='1';card.style.padding='13px 16px';
  toggle.onclick=function(){body.hidden=!body.hidden;updatePowerToggle(toggle,body);};updatePowerToggle(toggle,body);installEquipmentEntry();return true;
}
function install(){
  try{installEquipmentEntry();}catch(e){}
  ensureBuildInfo(updateButton);
  var tries=0,timer=setInterval(function(){tries++;try{installEquipmentEntry();if(compactPowerCard()){clearInterval(timer);return;}}catch(e){}if(tries>=80)clearInterval(timer);},125);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.LightingAIVisualSceneLauncher={open:openModule,install:install,version:'1.0-equipment-home-safe'};
})();