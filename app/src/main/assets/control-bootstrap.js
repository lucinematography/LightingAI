(function(){
'use strict';
if(window.__lightingAIControlBootstrapStarted)return;
window.__lightingAIControlBootstrapStarted=true;

const directScripts=[
 {id:'lightingai-control-system-drivers-script',src:'file:///android_asset/control-system-drivers.js'},
 {id:'lightingai-control-routing-script',src:'file:///android_asset/control-routing.js'},
 {id:'lightingai-ble-control-script',src:'file:///android_asset/ble-control.js'},
 {id:'lightingai-control-dashboard-script',src:'file:///android_asset/control-dashboard.js'},
 {id:'lightingai-ai-control-bridge-script',src:'file:///android_asset/ai-control-bridge.js'}
];
const advancedScripts=[
 {id:'lightingai-dmx-patch-script',src:'file:///android_asset/dmx-patch-planner.js'},
 {id:'lightingai-dmx-export-script',src:'file:///android_asset/dmx-export.js'},
 {id:'lightingai-artnet-control-script',src:'file:///android_asset/artnet-control.js'}
];

function loaded(script){
 return !!(script&&script.dataset&&script.dataset.lightingaiLoaded==='1');
}
function loadOne(item){
 return new Promise((resolve,reject)=>{
  let script=document.getElementById(item.id);
  if(script){
   if(loaded(script)){resolve();return}
   script.addEventListener('load',()=>{script.dataset.lightingaiLoaded='1';resolve()},{once:true});
   script.addEventListener('error',()=>reject(new Error('Control asset failed: '+item.src)),{once:true});
   return;
  }
  script=document.createElement('script');
  script.id=item.id;
  script.src=item.src;
  script.async=false;
  script.addEventListener('load',()=>{script.dataset.lightingaiLoaded='1';resolve()},{once:true});
  script.addEventListener('error',()=>reject(new Error('Control asset failed: '+item.src)),{once:true});
  document.body.appendChild(script);
 });
}
async function loadList(items){
 for(const item of items)await loadOne(item);
}
window.LightingAIAdvancedControlLoad=async function(){
 try{
  await loadList(advancedScripts);
  window.LightingAIAdvancedControlReady=true;
  window.dispatchEvent(new CustomEvent('lightingai-advanced-control-ready'));
  return true;
 }catch(error){
  window.LightingAIAdvancedControlReady=false;
  window.LightingAIAdvancedControlError=String(error&&error.message||error||'advanced_control_load_failed');
  try{console.error('[LightingAI Advanced Control]',error)}catch(ignore){}
  return false;
 }
};
async function start(){
 await loadList(directScripts);
 window.LightingAIControlBootstrapReady=true;
 window.LightingAIControlBootstrapMode='bluetooth-first';
 window.dispatchEvent(new CustomEvent('lightingai-control-ready'));
}
start().catch(error=>{
 window.LightingAIControlBootstrapReady=false;
 window.LightingAIControlBootstrapError=String(error&&error.message||error||'control_bootstrap_failed');
 try{console.error('[LightingAI Control Bootstrap]',error)}catch(ignore){}
});
})();