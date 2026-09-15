(function(){
'use strict';
var ROOT_ID='lightingai-ai-preview-refinements';
var CUSTOM_ID='lightingai-ai-preview-refinement-custom';
var NOTE_PREFIX='[AI KOREKCIJA: ';
var presets=[
 {sr:'SVETLIJE',en:'BRIGHTER',instructionSr:'Napravi osvetljenje svetlijim, ali sačuvaj detalje u svetlim delovima.',instructionEn:'Make the lighting brighter while preserving highlight detail.'},
 {sr:'TAMNIJE',en:'DARKER',instructionSr:'Napravi scenu tamnijom i atmosferičnijom, bez gubitka važnih detalja.',instructionEn:'Make the scene darker and moodier without losing important detail.'},
 {sr:'TOPLIJE',en:'WARMER',instructionSr:'Pomeri izgled svetla ka toplijim tonovima kože i ambijenta.',instructionEn:'Shift the lighting toward warmer skin tones and ambience.'},
 {sr:'HLADNIJE',en:'COOLER',instructionSr:'Pomeri izgled svetla ka hladnijim tonovima, uz prirodnu boju kože.',instructionEn:'Shift the lighting toward cooler tones while keeping skin natural.'},
 {sr:'MEKŠE',en:'SOFTER',instructionSr:'Omekšaj svetlo i prelaze senki, uz prirodan filmski kontrast.',instructionEn:'Soften the light and shadow transitions while keeping cinematic contrast.'},
 {sr:'VIŠE KONTRASTA',en:'MORE CONTRAST',instructionSr:'Povećaj odnos svetla i senke i naglasi oblik subjekta.',instructionEn:'Increase light-to-shadow contrast and emphasize the subject shape.'}
];
function isSr(){return window.currentLang!=='en';}
function cleanDescription(value){return String(value||'').replace(/\n?\[AI KOREKCIJA: [^\]]*\]\s*$/i,'').trim();}
function applyRefinement(instruction){
 var desc=document.getElementById('aiv-desc'),button=document.getElementById('aiv-real-preview-btn');
 if(!desc||!button||button.disabled)return false;
 desc.value=cleanDescription(desc.value)+(cleanDescription(desc.value)?'\n':'')+NOTE_PREFIX+instruction+']';
 var status=document.getElementById('aiv-real-preview-status');if(status)status.textContent=isSr()?'Pripremam novu AI verziju...':'Preparing a new AI version...';
 button.click();return true;
}
function button(label,instruction){var b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='border:1px solid #3a4049;border-radius:9px;padding:9px 7px;background:#191b20;color:#fff;font-weight:800;font-size:11px';b.onclick=function(){applyRefinement(instruction);};return b;}
function install(){
 var anchor=document.getElementById('aiv-real-preview-btn'),preview=document.getElementById('aiv-real-preview-img');if(!anchor||!preview||!preview.src||preview.style.display==='none')return false;
 var old=document.getElementById(ROOT_ID);if(old)return true;
 var box=document.createElement('div');box.id=ROOT_ID;box.style.cssText='margin-top:10px;padding:11px;border:1px solid #30343b;border-radius:11px;background:#0f1115';
 var title=document.createElement('b');title.style.color='#f5c542';title.textContent=isSr()?'AI KOREKCIJE PREVIEW-a':'AI PREVIEW REFINEMENTS';box.appendChild(title);
 var hint=document.createElement('div');hint.style.cssText='margin:5px 0 9px;color:#9299a3;font-size:11px;line-height:1.4';hint.textContent=isSr()?'Izaberi korekciju i AI će napraviti novu verziju iste scene.':'Choose a refinement and AI will create a new version of the same scene.';box.appendChild(hint);
 var grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px';presets.forEach(function(p){grid.appendChild(button(isSr()?p.sr:p.en,isSr()?p.instructionSr:p.instructionEn));});box.appendChild(grid);
 var custom=document.createElement('textarea');custom.id=CUSTOM_ID;custom.placeholder=isSr()?'Druga korekcija, npr. „jači rim sa leve strane“':'Custom refinement, e.g. “stronger rim from camera left”';custom.style.cssText='width:100%;min-height:64px;margin-top:9px;background:#15181d;border:1px solid #343a43;color:#fff;border-radius:9px;padding:9px';box.appendChild(custom);
 var customButton=button(isSr()?'NAPRAVI MOJU VERZIJU':'CREATE MY VERSION','');customButton.style.marginTop='7px';customButton.style.width='100%';customButton.onclick=function(){var v=custom.value.trim();if(v)applyRefinement(v);};box.appendChild(customButton);
 anchor.insertAdjacentElement('afterend',box);return true;
}
document.addEventListener('click',function(ev){if(ev.target&&ev.target.closest&&ev.target.closest('#lightingai-ai-visual-launcher')){setTimeout(install,250);setTimeout(install,800);}},false);
document.addEventListener('load',function(ev){if(ev.target&&ev.target.id==='aiv-real-preview-img')setTimeout(install,0);},true);
var tries=0,timer=setInterval(function(){tries++;if(install()||tries>=80)clearInterval(timer);},125);
window.LightingAIVisualPreviewRefinements={install:install,apply:applyRefinement,cleanDescription:cleanDescription,version:'1.0-safe-refinement-actions'};
})();
