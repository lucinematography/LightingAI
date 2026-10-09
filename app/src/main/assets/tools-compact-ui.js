(function(){
'use strict';
var VERSION='1.0';
var TOOL_IDS=[
 'sceneMeasureCard','setSketchCard',
 'dofCard','flickerCard','cameraSetupSection','lightingRatioCard',
 'powerCalculatorCard','lightCalcCard','cctGelCard',
 'dmxCard','continuityCard','shotListCard','cueCard','projectBackupCard','deviceCapabilitiesCard'
];
var FALLBACK={
 sceneMeasureCard:['Merenje scene kamerom','Scene measurement'],
 setSketchCard:['Skica seta / Blocking','Set sketch / Blocking'],
 dofCard:['DOF planer','DOF planner'],
 flickerCard:['Flicker / Shutter','Flicker / Shutter'],
 cameraSetupSection:['Camera Setup A/B/C','Camera Setup A/B/C'],
 lightingRatioCard:['Lighting Ratio','Lighting Ratio'],
 powerCalculatorCard:['Power Calculator','Power Calculator'],
 lightCalcCard:['Light Calculator','Light Calculator'],
 cctGelCard:['CCT / Gel Calculator','CCT / Gel Calculator'],
 dmxCard:['DMX Patch','DMX Patch'],
 continuityCard:['Continuity / Match Shot','Continuity / Match Shot'],
 shotListCard:['Shot List','Shot List'],
 cueCard:['Lighting Cue Planner','Lighting Cue Planner'],
 projectBackupCard:['Project Backup','Project Backup'],
 deviceCapabilitiesCard:['Device Capabilities','Device Capabilities']
};
function sr(){try{return (localStorage.getItem('lighting_language_v1')||'sr')!=='en';}catch(e){return true;}}
function titleFor(card,id){
 var h=card.querySelector('h1,h2,h3,.cardTitle,.sectionTitle');
 var t=h&&String(h.textContent||'').trim();
 if(t&&t.length<80)return t;
 var f=FALLBACK[id]||[id,id];
 return sr()?f[0]:f[1];
}
function buttonId(id){return 'toolsCompactToggle-'+id;}
function allButtons(){return TOOL_IDS.map(function(id){return document.getElementById(buttonId(id));}).filter(Boolean);}
function updateButton(id){
 var card=document.getElementById(id),btn=document.getElementById(buttonId(id));
 if(!card||!btn)return;
 var open=!card.hidden;
 btn.innerHTML='<span>'+titleFor(card,id)+'</span><span aria-hidden="true">'+(open?'▲':'▼')+'</span>';
 btn.setAttribute('aria-expanded',open?'true':'false');
 btn.style.borderColor=open?'#6d5921':'#30343b';
 btn.style.color=open?'#f5c542':'#f4f4f5';
}
function collapse(id){
 var card=document.getElementById(id);if(!card)return;
 card.hidden=true;updateButton(id);
}
function collapseAll(except){
 TOOL_IDS.forEach(function(id){if(id!==except)collapse(id);});
}
function openTool(id,opts){
 var card=document.getElementById(id);if(!card)return false;
 collapseAll(id);
 card.hidden=false;updateButton(id);
 var btn=document.getElementById(buttonId(id));
 if(!(opts&&opts.noScroll)){
   setTimeout(function(){
    var el=btn||card;
    try{el.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){el.scrollIntoView();}
   },60);
 }
 return true;
}
function toggle(id){
 var card=document.getElementById(id);if(!card)return;
 if(card.hidden)openTool(id);else collapse(id);
}
function ensure(id){
 var card=document.getElementById(id);
 if(!card||!card.parentNode)return;
 var btn=document.getElementById(buttonId(id));
 if(!btn){
   btn=document.createElement('button');
   btn.id=buttonId(id);
   btn.type='button';
   btn.className='btn secondary lightingaiToolToggle';
   btn.setAttribute('data-tool-target',id);
   btn.style.cssText='width:100%;min-height:48px;margin:5px 0;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13px;font-weight:900';
   btn.onclick=function(){toggle(id);};
   card.parentNode.insertBefore(btn,card);
 }
 if(!card.dataset.toolsCompactReady){
   card.dataset.toolsCompactReady='1';
   card.hidden=true;
 }
 updateButton(id);
}
function sync(){TOOL_IDS.forEach(ensure);}
function home(){
 sync();collapseAll();
 setTimeout(function(){
   var tools=document.getElementById('tools');
   if(tools){
     try{tools.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){tools.scrollIntoView();}
   }else{
     try{window.scrollTo({top:0,behavior:'smooth'});}catch(e){window.scrollTo(0,0);}
   }
 },40);
}
function install(){
 sync();
 var nav=document.querySelector('nav button[data-page="tools"]');
 if(nav&&!nav.dataset.toolsCompactHome){
   nav.dataset.toolsCompactHome='1';
   nav.addEventListener('click',function(){setTimeout(home,0);});
 }
 setInterval(sync,900);
}
window.LightingAIToolsCompact={sync:sync,home:home,openTool:openTool,collapseAll:collapseAll,version:VERSION};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
