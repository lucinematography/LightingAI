(function(){
'use strict';
var MODE_KEY='lightingai_ui_mode_v1';
var SIMPLE='simple', ADVANCED='advanced';
var guideCollapsed=false, guideStep=0;

function isSr(){
  try{return (localStorage.getItem('lighting_language_v1')||'sr')!=='en';}catch(e){return true;}
}
function currentMode(){
  try{return localStorage.getItem(MODE_KEY)||SIMPLE;}catch(e){return SIMPLE;}
}
function setStoredMode(v){
  try{localStorage.setItem(MODE_KEY,v);}catch(e){}
}
function activePage(){
  var p=document.querySelector('.page.active');
  return p?p.id:'planner';
}
function openPage(page,nav){
  if(typeof window.openCompactPage==='function')return window.openCompactPage(page,nav||page);
  var btn=document.querySelector('nav button[data-page="'+(nav||page)+'"]');
  if(btn){btn.click();return true;}
  return false;
}
function scrollToId(id){
  setTimeout(function(){
    var el=document.getElementById(id);
    if(el){try{el.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){el.scrollIntoView();}}
  },180);
}
function action(page,target,nav){
  openPage(page,nav||page);
  if(target)scrollToId(target);
}
function labels(){
  var sr=isSr();
  return sr?{
    simple:'JEDNOSTAVNO',advanced:'NAPREDNO',guide:'VODI ME',step:'Korak',
    title:'BRZI POČETAK',intro:'LightingAI te vodi kroz osnovni tok. Sve profesionalne funkcije ostaju sačuvane u režimu NAPREDNO.',
    s1:'1. NOVI PROJEKAT',s2:'2. IZABERI OPREMU',s3:'3. DODAJ SCENU',s4:'4. NAPRAVI AI PLAN',s5:'5. SAČUVAJ / IZVEZI',
    help:'? KAKO SE KORISTI',close:'ZATVORI',
    advancedNote:'Za DMX, Sunce, DOF, Flicker, Cue, Camera Setup, Blocking detalje i ostale profesionalne alate izaberi NAPREDNO.'
  }:{
    simple:'SIMPLE',advanced:'ADVANCED',guide:'GUIDE ME',step:'Step',
    title:'QUICK START',intro:'LightingAI guides you through the basic workflow. All professional functions remain available in ADVANCED mode.',
    s1:'1. NEW PROJECT',s2:'2. CHOOSE EQUIPMENT',s3:'3. ADD SCENE',s4:'4. CREATE AI PLAN',s5:'5. SAVE / EXPORT',
    help:'? HOW TO USE',close:'CLOSE',
    advancedNote:'For DMX, Sun, DOF, Flicker, Cue, Camera Setup, detailed Blocking and other professional tools choose ADVANCED.'
  };
}

var HELP={
  planner:{
    sr:['Upiši naziv projekta i scene.','Izaberi tip scene i izgled.','Dodaj fotografiju ili slikaj scenu.','Proveri izabranu opremu.','Pritisni GENERIŠI PLAN.'],
    en:['Enter project and scene names.','Choose scene type and look.','Add an image or capture the scene.','Check selected equipment.','Tap GENERATE PLAN.']
  },
  equipment:{
    sr:['Izaberi proizvođača.','Otvori katalog i izaberi reflektor.','Podesi broj komada.','Po potrebi izaberi FILTERI / GEL.','Izabrana oprema automatski je dostupna AI-ju.'],
    en:['Choose a manufacturer.','Open the catalog and select a fixture.','Set quantity.','Add FILTERS / GEL when needed.','Selected equipment is automatically available to AI.']
  },
  ai:{
    sr:['Dodaj ili snimi fotografiju scene.','AI vidi izabranu opremu iz Oprema.','Upiši zahtev DP-a, npr. "meko glavno svetlo sa leve strane".','Generiši AI vizuelni plan.','Pregledaj mapu, KEY/FILL/BACK/ACCENT i predloge gelova.'],
    en:['Add or capture a scene photo.','AI sees selected Equipment.','Enter the DP request, e.g. "soft key from camera left".','Generate the AI visual plan.','Review map, KEY/FILL/BACK/ACCENT and gel recommendations.']
  },
  control:{
    sr:['Ovde se koristi stvarna kontrola rasvete.','Izaberi Art-Net/sACN ili BLE prema uređaju.','Proveri patch/adresu pre slanja.','Sačuvaj Control Scene kada želiš da ponoviš stanje.','Za početno planiranje ova stranica nije obavezna.'],
    en:['Use this page for actual lighting control.','Choose Art-Net/sACN or BLE for the device.','Verify patch/address before output.','Save a Control Scene to recall a state.','This page is optional for basic planning.']
  },
  tools:{
    sr:['TOOLS sadrži napredne planerske funkcije.','Tu su Merenje scene, Skica seta/Blocking, Sunce, DMX Patch, DOF, Flicker, Continuity, Shot List i Cue.','Tu su i Camera Setup, Ratio, Power, Light, CCT/Gel, Backup i Device Capabilities.','Otvori samo alat koji ti trenutno treba.'],
    en:['TOOLS contains advanced planning functions.','It includes Scene Measurement, Set Sketch/Blocking, Sun, DMX Patch, DOF, Flicker, Continuity, Shot List and Cue.','It also includes Camera Setup, Ratio, Power, Light, CCT/Gel, Backup and Device Capabilities.','Open only the tool you need.']
  },
  projects:{
    sr:['Ovde su sačuvani planovi/projekti.','Otvori željeni projekat i proveri podatke scene.','Za kompletan prenos projekta koristi Project Backup u Tools.'],
    en:['Saved plans/projects are shown here.','Open a project and review scene data.','For a complete project transfer use Project Backup in Tools.']
  },
  settings:{
    sr:['Ovde proveravaš AI servis i osnovne podatke aplikacije.','Export Data je osnovni izvoz lokalnih podataka.','Za punu rezervnu kopiju koristi Project Backup u Tools.','DELETE briše lokalne projekte i opremu - koristi pažljivo.'],
    en:['Check AI service and app information here.','Export Data is the basic local-data export.','For a full backup use Project Backup in Tools.','DELETE removes local projects and equipment - use carefully.']
  }
};

function addStyles(){
  if(document.getElementById('lightingai-simple-mode-style'))return;
  var s=document.createElement('style');
  s.id='lightingai-simple-mode-style';
  s.textContent=
    '#lightingaiModeBar{margin:10px 0 14px;padding:10px;border:1px solid #30343b;border-radius:14px;background:#111318;display:grid;grid-template-columns:1fr 1fr;gap:8px}'+
    '#lightingaiModeBar .modeBtn{min-height:42px;font-size:12px;font-weight:900}'+
    '#lightingaiQuickStart{border:1px solid #6d5921;background:linear-gradient(135deg,#17150e,#26200f);padding:14px}'+
    '#lightingaiQuickStart h2{font-size:19px;margin-bottom:8px}'+
    '#lightingaiQuickStart p{margin-top:6px;margin-bottom:8px}'+
    '#lightingaiQuickStart .simpleSteps{display:grid;gap:6px;margin-top:9px}'+
    '#lightingaiQuickStart .simpleSteps button{width:100%;text-align:left;min-height:44px;font-size:13px;font-weight:900;padding:10px 13px}'+
    '#lightingaiQuickStart.lightingaiGuideCollapsed{padding:0;border-color:#6d5921;background:#18150d}'+
    '#lightingaiQuickStart .guideCollapsedBtn{width:100%;min-height:48px;text-align:left;font-size:13px;font-weight:900;border-radius:13px}'+
    '.lightingaiPageHelp{margin:0 0 12px}'+
    '.lightingaiPageHelp button{width:100%;text-align:left}'+
    '.lightingaiHelpBody{display:none;margin-top:8px;padding:10px;border:1px solid #30343b;border-radius:11px;background:#0f1115}'+
    '.lightingaiHelpBody.open{display:block}'+
    '.lightingaiHelpBody ol{margin:6px 0 0;padding-left:22px;line-height:1.7}'+
    'body.lightingai-simple-mode nav button[data-page="control"],body.lightingai-simple-mode nav button[data-page="tools"]{display:none!important}'+
    'body.lightingai-simple-mode nav{grid-template-columns:repeat(3,1fr)!important}'+
    'body.lightingai-simple-mode #toolsIntro,body.lightingai-simple-mode #controlIntro{display:none}'+
    'body.lightingai-simple-mode #shotSetupCard,body.lightingai-simple-mode #shotSetupRecoveryCard{display:none!important}'+
    'body.lightingai-simple-mode #planner>.pageBack:disabled{display:none!important}';
  document.head.appendChild(s);
}
function addModeBar(){
  if(document.getElementById('lightingaiModeBar'))return;
  var header=document.querySelector('.app > header');
  if(!header)return;
  var bar=document.createElement('div');
  bar.id='lightingaiModeBar';
  header.insertAdjacentElement('afterend',bar);
}
function renderModeBar(){
  var bar=document.getElementById('lightingaiModeBar');if(!bar)return;
  var L=labels(),mode=currentMode();
  bar.innerHTML='<button type="button" class="btn '+(mode===SIMPLE?'primary':'secondary')+' modeBtn" data-mode="'+SIMPLE+'">'+L.simple+'</button>'+
    '<button type="button" class="btn '+(mode===ADVANCED?'primary':'secondary')+' modeBtn" data-mode="'+ADVANCED+'">'+L.advanced+'</button>';
  bar.querySelectorAll('[data-mode]').forEach(function(b){b.onclick=function(){applyMode(this.getAttribute('data-mode'));};});
}
function addQuickStart(){
  if(document.getElementById('lightingaiQuickStart'))return;
  var planner=document.getElementById('planner');if(!planner)return;
  var title=planner.querySelector('h1');
  var card=document.createElement('div');
  card.id='lightingaiQuickStart';card.className='card';
  if(title&&title.nextSibling)planner.insertBefore(card,title.nextSibling);else planner.insertBefore(card,planner.firstChild);
}
function guideStepTitle(L,step){
  return [L.s1,L.s2,L.s3,L.s4,L.s5][Math.max(0,Math.min(4,step-1))]||L.s1;
}
function collapseGuide(step){
  guideStep=Math.max(1,Math.min(5,Number(step)||1));
  guideCollapsed=true;
  renderQuickStart();
}
function expandGuide(){
  guideCollapsed=false;
  renderQuickStart();
}
function renderQuickStart(){
  var card=document.getElementById('lightingaiQuickStart');if(!card)return;
  var L=labels();
  card.classList.toggle('lightingaiGuideCollapsed',guideCollapsed);
  if(guideCollapsed){
    var title=guideStepTitle(L,guideStep).replace(/^\d+\.\s*/,'');
    card.innerHTML='<button type="button" class="btn secondary guideCollapsedBtn">'+L.guide+' · '+L.step+' '+guideStep+'/5 - '+title+' ▼</button>';
    card.querySelector('.guideCollapsedBtn').onclick=expandGuide;
    return;
  }
  card.innerHTML='<h2 style="margin-top:0">'+L.guide+' - '+L.title+'</h2><p class="muted small">'+L.intro+'</p>'+
    '<div class="simpleSteps">'+
    '<button class="btn primary" data-step="1">'+L.s1+'</button>'+
    '<button class="btn secondary" data-step="2">'+L.s2+'</button>'+
    '<button class="btn secondary" data-step="3">'+L.s3+'</button>'+
    '<button class="btn secondary" data-step="4">'+L.s4+'</button>'+
    '<button class="btn secondary" data-step="5">'+L.s5+'</button>'+
    '</div><p class="muted small" style="margin-bottom:0;margin-top:12px">'+L.advancedNote+'</p>';
  card.querySelector('[data-step="1"]').onclick=function(){collapseGuide(1);action('planner','projectName');setTimeout(function(){var e=document.getElementById('projectName');if(e)e.focus();},220);};
  card.querySelector('[data-step="2"]').onclick=function(){collapseGuide(2);action('equipment','equipmentList');};
  card.querySelector('[data-step="3"]').onclick=function(){collapseGuide(3);action('planner','description');};
  card.querySelector('[data-step="4"]').onclick=function(){collapseGuide(4);action('ai','aiContent');};
  card.querySelector('[data-step="5"]').onclick=function(){
    collapseGuide(5);applyMode(ADVANCED);openPage('tools','tools');
    setTimeout(function(){
      if(window.LightingAIToolsCompact&&typeof window.LightingAIToolsCompact.openTool==='function'){
        window.LightingAIToolsCompact.openTool('projectBackupCard');
      }else scrollToId('projectBackupCard');
    },220);
  };
}
function addHelp(page){
  var section=document.getElementById(page);if(!section||section.querySelector(':scope > .lightingaiPageHelp'))return;
  var h=section.querySelector(':scope > h1');
  var wrap=document.createElement('div');wrap.className='lightingaiPageHelp';wrap.setAttribute('data-help-page',page);
  if(h&&h.nextSibling)section.insertBefore(wrap,h.nextSibling);else section.insertBefore(wrap,section.firstChild);
}
function renderHelp(page){
  var wrap=document.querySelector('.lightingaiPageHelp[data-help-page="'+page+'"]');if(!wrap)return;
  var sr=isSr(),L=labels(),items=(HELP[page]&&(sr?HELP[page].sr:HELP[page].en))||[];
  wrap.innerHTML='<button type="button" class="btn secondary">'+L.help+'</button><div class="lightingaiHelpBody"><ol>'+items.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol></div>';
  var btn=wrap.querySelector('button'),body=wrap.querySelector('.lightingaiHelpBody');
  btn.onclick=function(){body.classList.toggle('open');};
}
function applyMode(mode){
  mode=mode===ADVANCED?ADVANCED:SIMPLE;
  setStoredMode(mode);
  document.body.classList.toggle('lightingai-simple-mode',mode===SIMPLE);
  document.body.classList.toggle('lightingai-advanced-mode',mode===ADVANCED);
  var card=document.getElementById('lightingaiQuickStart');if(card)card.style.display=mode===SIMPLE?'':'none';
  if(mode===SIMPLE&&['control','tools','projects','settings'].indexOf(activePage())>=0)openPage('planner','planner');
  renderModeBar();
}
function refreshText(){
  renderModeBar();renderQuickStart();
  ['planner','equipment','ai','control','tools','projects','settings'].forEach(renderHelp);
}
function install(){
  addStyles();addModeBar();addQuickStart();
  ['planner','equipment','ai','control','tools','projects','settings'].forEach(addHelp);
  refreshText();applyMode(currentMode());
  ['langSr','langEn'].forEach(function(id){var b=document.getElementById(id);if(b)b.addEventListener('click',function(){setTimeout(refreshText,0);});});
}
window.LightingAISimpleMode={setMode:applyMode,getMode:currentMode,collapseGuide:collapseGuide,expandGuide:expandGuide,version:'1.1'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
