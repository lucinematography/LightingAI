(function(){
'use strict';
var ROOT_ID='lightingai-ai-preview-refinements';
var CUSTOM_ID='lightingai-ai-preview-refinement-custom';
var PREVIOUS_ID='lightingai-ai-preview-previous';
var API_BASE='https://lightingai.onrender.com';
var previousPreviewSrc='';
var pending=false;
var presets=[
 {sr:'SVETLIJE',en:'BRIGHTER',instructionSr:'Napravi osvetljenje svetlijim, ali sačuvaj detalje u svetlim delovima.',instructionEn:'Make the lighting brighter while preserving highlight detail.'},
 {sr:'TAMNIJE',en:'DARKER',instructionSr:'Napravi scenu tamnijom i atmosferičnijom, bez gubitka važnih detalja.',instructionEn:'Make the scene darker and moodier without losing important detail.'},
 {sr:'TOPLIJE',en:'WARMER',instructionSr:'Pomeri izgled svetla ka toplijim tonovima kože i ambijenta.',instructionEn:'Shift the lighting toward warmer skin tones and ambience.'},
 {sr:'HLADNIJE',en:'COOLER',instructionSr:'Pomeri izgled svetla ka hladnijim tonovima, uz prirodnu boju kože.',instructionEn:'Shift the lighting toward cooler tones while keeping skin natural.'},
 {sr:'MEKŠE',en:'SOFTER',instructionSr:'Omekšaj svetlo i prelaze senki, uz prirodan filmski kontrast.',instructionEn:'Soften the light and shadow transitions while keeping cinematic contrast.'},
 {sr:'VIŠE KONTRASTA',en:'MORE CONTRAST',instructionSr:'Povećaj odnos svetla i senke i naglasi oblik subjekta.',instructionEn:'Increase light-to-shadow contrast and emphasize the subject shape.'}
];
function isSr(){return window.currentLang!=='en';}
function updatePreviousButton(){var b=document.getElementById(PREVIOUS_ID);if(!b)return;b.disabled=!previousPreviewSrc||pending;b.style.opacity=previousPreviewSrc&&!pending?'1':'.45';}
function setControlsDisabled(disabled){var root=document.getElementById(ROOT_ID);if(!root)return;Array.prototype.forEach.call(root.querySelectorAll('button,textarea'),function(el){if(el.id===PREVIOUS_ID){return;}el.disabled=!!disabled;});updatePreviousButton();}
function compactPreviewSource(src){return new Promise(function(resolve,reject){if(!src){reject(new Error('No preview'));return;}var img=new Image();img.onload=function(){try{var max=1024,w=img.naturalWidth||img.width,h=img.naturalHeight||img.height,scale=Math.min(1,max/Math.max(w,h)),cw=Math.max(1,Math.round(w*scale)),ch=Math.max(1,Math.round(h*scale)),canvas=document.createElement('canvas');canvas.width=cw;canvas.height=ch;var ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,cw,ch);resolve(canvas.toDataURL('image/jpeg',0.82));}catch(e){reject(e);}};img.onerror=reject;img.src=src;});}
async function applyRefinement(instruction){
 var preview=document.getElementById('aiv-real-preview-img'),status=document.getElementById('aiv-real-preview-status');
 if(pending||!preview||!preview.src||preview.style.display==='none'||!instruction)return false;
 pending=true;setControlsDisabled(true);
 var source=preview.src;
 if(status)status.textContent=isSr()?'AI pravi novu korekciju preview-a...':'AI is creating a refined preview...';
 try{
  var compact=await compactPreviewSource(source);
  var r=await fetch(API_BASE+'/api/visual-preview?refinement=1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenePhoto:compact,plan:{summary:isSr()?'Korekcija postojećeg AI foto-preview-a':'Refinement of existing AI photo preview'},description:instruction,equipment:[],language:isSr()?'sr':'en'})});
  if(!r.ok)throw new Error('HTTP '+r.status);
  var data=await r.json();if(!data.image)throw new Error('No image');
  previousPreviewSrc=source;preview.src=data.image;preview.style.display='block';
  if(status)status.textContent=isSr()?'AI korekcija je spremna.':'AI refinement is ready.';
  updatePreviousButton();return true;
 }catch(e){if(status)status.textContent=isSr()?'AI korekciju trenutno nije moguće napraviti. Prethodna verzija je sačuvana.':'AI refinement is currently unavailable. The previous version was preserved.';return false;}
 finally{pending=false;setControlsDisabled(false);updatePreviousButton();}
}
function button(label,instruction){var b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='border:1px solid #3a4049;border-radius:9px;padding:9px 7px;background:#191b20;color:#fff;font-weight:800;font-size:11px';b.onclick=function(){applyRefinement(instruction);};return b;}
function install(){
 var anchor=document.getElementById('aiv-real-preview-btn'),preview=document.getElementById('aiv-real-preview-img');if(!anchor||!preview||!preview.src||preview.style.display==='none')return false;
 var old=document.getElementById(ROOT_ID);if(old)return true;
 var box=document.createElement('div');box.id=ROOT_ID;box.style.cssText='margin-top:10px;padding:11px;border:1px solid #30343b;border-radius:11px;background:#0f1115';
 var title=document.createElement('b');title.style.color='#f5c542';title.textContent=isSr()?'AI KOREKCIJE PREVIEW-a':'AI PREVIEW REFINEMENTS';box.appendChild(title);
 var hint=document.createElement('div');hint.style.cssText='margin:5px 0 9px;color:#9299a3;font-size:11px;line-height:1.4';hint.textContent=isSr()?'Korekcija koristi već napravljeni AI preview kao osnovu, pa menja samo traženi izgled bez ponovnog generisanja celog plana.':'A refinement uses the existing AI preview as its source, changing only the requested look without regenerating the full plan.';box.appendChild(hint);
 var grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px';presets.forEach(function(p){grid.appendChild(button(isSr()?p.sr:p.en,isSr()?p.instructionSr:p.instructionEn));});box.appendChild(grid);
 var custom=document.createElement('textarea');custom.id=CUSTOM_ID;custom.placeholder=isSr()?'Druga korekcija, npr. „jači rim sa leve strane“':'Custom refinement, e.g. “stronger rim from camera left”';custom.style.cssText='width:100%;min-height:64px;margin-top:9px;background:#15181d;border:1px solid #343a43;color:#fff;border-radius:9px;padding:9px';box.appendChild(custom);
 var customButton=button(isSr()?'NAPRAVI MOJU VERZIJU':'CREATE MY VERSION','');customButton.style.marginTop='7px';customButton.style.width='100%';customButton.onclick=function(){var v=custom.value.trim();if(v)applyRefinement(v);};box.appendChild(customButton);
 var previousButton=button(isSr()?'VRATI PRETHODNU AI VERZIJU':'RESTORE PREVIOUS AI VERSION','');previousButton.id=PREVIOUS_ID;previousButton.style.marginTop='7px';previousButton.style.width='100%';previousButton.onclick=function(){var p=document.getElementById('aiv-real-preview-img');if(!p||!previousPreviewSrc||pending)return;var current=p.src;p.src=previousPreviewSrc;previousPreviewSrc=current;var status=document.getElementById('aiv-real-preview-status');if(status)status.textContent=isSr()?'Prikazana je prethodna AI verzija.':'Previous AI version restored.';updatePreviousButton();};box.appendChild(previousButton);
 anchor.insertAdjacentElement('afterend',box);updatePreviousButton();return true;
}
document.addEventListener('click',function(ev){if(ev.target&&ev.target.closest&&ev.target.closest('#lightingai-ai-visual-launcher')){setTimeout(install,250);setTimeout(install,800);}},false);
document.addEventListener('load',function(ev){if(ev.target&&ev.target.id==='aiv-real-preview-img')setTimeout(install,0);},true);
var tries=0,timer=setInterval(function(){tries++;if(install()||tries>=80)clearInterval(timer);},125);
window.LightingAIVisualPreviewRefinements={install:install,apply:applyRefinement,compactPreviewSource:compactPreviewSource,version:'1.2-compact-direct-refinement'};
})();
