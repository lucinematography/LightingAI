(function(){
'use strict';
var PAGE_ID='equipment';
var POWER_ID='powerCalculatorCard';
var BUTTON_ID='lightingai-ai-visual-launcher';
var AI_CARD_ID='lightingai-ai-equipment-card';
var POWER_BODY_ID='lightingai-power-collapsible-body';
var POWER_TOGGLE_ID='lightingai-power-collapsible-toggle';
function sr(){return window.currentLang!=='en';}
function text(){return sr()?{
  title:'✦ AI VIZUELNI PLAN',
  desc:'Fotografija scene + dostupna rasveta + AI predlog + vizuelni preview.',
  open:'OTVORI',
  close:'ZATVORI'
}:{
  title:'✦ AI VISUAL PLAN',
  desc:'Scene photo + available lighting + AI proposal + visual preview.',
  open:'OPEN',
  close:'CLOSE'
};}
function styleButton(button){
  button.style.cssText='position:static;width:100%;display:block;border:1px solid #f5c542;border-radius:12px;padding:13px 14px;background:#f5c542;color:#111;font-weight:900;font-size:14px;box-shadow:none;margin:0';
}
function ensureAiCard(){
  var page=document.getElementById(PAGE_ID),button=document.getElementById(BUTTON_ID);if(!page||!button)return false;
  var title=page.querySelector('h1'),card=document.getElementById(AI_CARD_ID),t=text();
  if(!card){
    card=document.createElement('div');card.id=AI_CARD_ID;card.className='card';
    card.style.cssText='border-color:#66571f;background:linear-gradient(180deg,#191b20,#13161b);padding:16px';
    card.innerHTML='<div data-aiv-equip-title style="font-size:20px;font-weight:900;color:#f5c542;margin-bottom:6px"></div><div data-aiv-equip-desc class="muted small" style="line-height:1.45;margin-bottom:12px"></div><div data-aiv-equip-action></div>';
  }
  var heading=card.querySelector('[data-aiv-equip-title]'),desc=card.querySelector('[data-aiv-equip-desc]'),action=card.querySelector('[data-aiv-equip-action]');
  if(heading)heading.textContent=t.title;if(desc)desc.textContent=t.desc;if(action&&button.parentNode!==action)action.appendChild(button);styleButton(button);
  if(title&&title.nextElementSibling!==card)title.insertAdjacentElement('afterend',card);else if(!title&&card.parentNode!==page)page.insertBefore(card,page.firstChild);
  return true;
}
function updateToggle(toggle,body){var t=text(),open=!body.hidden;toggle.textContent=(open?t.close:t.open)+(open?' ▲':' ▼');toggle.setAttribute('aria-expanded',open?'true':'false');}
function compactPower(){
  var card=document.getElementById(POWER_ID);if(!card)return false;
  if(card.dataset.p5Collapsible==='1'){ensureAiCard();return true;}
  var title=card.querySelector('#powerTitle')||card.querySelector('h2');if(!title)return false;
  var header=document.createElement('div');header.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px';
  var toggle=document.createElement('button');toggle.id=POWER_TOGGLE_ID;toggle.type='button';toggle.style.cssText='border:1px solid #3b4048;border-radius:9px;padding:8px 10px;background:#252a31;color:#fff;font-weight:800;font-size:11px;white-space:nowrap';
  var body=document.createElement('div');body.id=POWER_BODY_ID;body.hidden=true;
  card.insertBefore(header,card.firstChild);header.appendChild(title);title.style.margin='0';header.appendChild(toggle);
  while(header.nextSibling)body.appendChild(header.nextSibling);card.appendChild(body);card.dataset.p5Collapsible='1';card.style.padding='13px 16px';
  toggle.onclick=function(){body.hidden=!body.hidden;updateToggle(toggle,body);};
  updateToggle(toggle,body);
  try{new MutationObserver(function(){updateToggle(toggle,body);ensureAiCard();}).observe(title,{childList:true,subtree:true,characterData:true});}catch(e){}
  ensureAiCard();return true;
}
function refresh(){ensureAiCard();compactPower();}
var tries=0,timer=setInterval(function(){tries++;refresh();if(tries>120)clearInterval(timer);},100);
try{new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true});}catch(e){}
refresh();
window.LightingAIEquipmentHome={refresh:refresh,version:'0.1-ai-first-equipment'};
})();
