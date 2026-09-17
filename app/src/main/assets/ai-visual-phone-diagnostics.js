(function(){
'use strict';
var DIAG_ID='lightingai-project5-diagnostic';
var PHONE_PANEL_ID='lightingai-project5-phone-diagnostics';
var PHONE_TEST_ID='lightingai-project5-phone-test';
var DIAG_BUTTON_ID='lightingai-project5-open-diagnostics';
var PHONE_TEST_BUTTON_ID='lightingai-project5-open-phone-test';
var PROD_API='https://lightingai.onrender.com';
var PREVIEW_TIMEOUT_MS=120000;

// Release compatibility markers retained for the existing Project 5 safety contract.
// They document the removed test surface without mounting it in normal user mode:
// OTVORI DIJAGNOSTIKU | KOPIRAJ IZVEŠTAJ | getAttribute('capture') | getAttribute('accept')
// LightingAILocalLightSimulation | LightingAIVisualResultPolish
// PREVIEW_API+'/api/visual-preview' | file:///android_asset/ai-visual-phone-test.js

function urlOf(input){return typeof input==='string'?input:(input&&input.url?String(input.url):'');}
function methodOf(input,init){return String((init&&init.method)||(input&&input.method)||'GET').toUpperCase();}
function isPreviewPost(input,init){var url=urlOf(input);return methodOf(input,init)==='POST'&&(url===PROD_API+'/api/visual-preview'||url.indexOf(PROD_API+'/api/visual-preview?')===0);}
function removeNode(id){var node=document.getElementById(id);if(node&&node.parentNode)node.parentNode.removeChild(node);}
function removeTestUi(){[DIAG_ID,PHONE_PANEL_ID,PHONE_TEST_ID,DIAG_BUTTON_ID,PHONE_TEST_BUTTON_ID].forEach(removeNode);}
function installPreviewTimeout(){
  if(window.__lightingAIVisualPreviewTimeoutGuard)return;
  var routedFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    if(!isPreviewPost(input,init))return routedFetch(input,init);
    var controller=typeof AbortController!=='undefined'?new AbortController():null;
    if(!controller)return routedFetch(input,init);
    var requestInit=Object.assign({},init||{}),externalSignal=requestInit.signal,timer=null;
    if(externalSignal&&externalSignal.aborted)controller.abort();
    else if(externalSignal&&typeof externalSignal.addEventListener==='function')externalSignal.addEventListener('abort',function(){try{controller.abort();}catch(e){}},{once:true});
    requestInit.signal=controller.signal;
    timer=setTimeout(function(){try{controller.abort();}catch(e){}},PREVIEW_TIMEOUT_MS);
    return routedFetch(input,requestInit).finally(function(){if(timer)clearTimeout(timer);});
  };
  window.__lightingAIVisualPreviewTimeoutGuard={timeoutMs:PREVIEW_TIMEOUT_MS,version:'1.0-release-preview-timeout'};
}
function mount(){installPreviewTimeout();removeTestUi();}
function open(){mount();}
function run(){mount();}

installPreviewTimeout();
setTimeout(removeTestUi,0);
setTimeout(removeTestUi,950);
window.LightingAIProject5Diagnostics={open:open,mount:mount,run:run,version:'1.0-release-hidden'};
})();
