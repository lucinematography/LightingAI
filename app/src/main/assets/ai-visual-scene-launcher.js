(function(){
'use strict';
var BUTTON_ID='lightingai-ai-visual-launcher';
var SCRIPT_ID='lightingai-ai-visual-scene-plan-script';
function label(){return window.currentLang==='en'?'AI VISUAL PLAN':'AI VIZUELNI PLAN';}
function openModule(){
  if(window.LightingAIVisualScenePlan&&typeof window.LightingAIVisualScenePlan.open==='function'){
    window.LightingAIVisualScenePlan.open();
    return;
  }
  var existing=document.getElementById(SCRIPT_ID);
  if(existing){existing.addEventListener('load',openModule,{once:true});return;}
  var script=document.createElement('script');
  script.id=SCRIPT_ID;
  script.src='file:///android_asset/ai-visual-scene-plan.js';
  script.onload=openModule;
  document.body.appendChild(script);
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
window.LightingAIVisualSceneLauncher={open:openModule,install:install,version:'0.1'};
})();
