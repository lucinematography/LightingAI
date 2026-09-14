(function(){
'use strict';
var ROOT_ID='lightingai-local-light-simulation';
var CONTROL_ID='lightingai-local-light-simulation-control';
var enabled=true;
var lastPlan=null;

function isSr(){return window.currentLang!=='en';}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c;});}
function lights(plan){var d=(plan&&plan.lighting_diagram)||{};var a=Array.isArray(d.lights)?d.lights:(plan&&Array.isArray(plan.lights)?plan.lights:[]);return a.filter(function(x){return x&&typeof x==='object';});}
function roleText(light){return String((light&&light.role)||'').toLowerCase();}
function directionText(light){return String((light&&light.direction)||'').toLowerCase();}
function sideFromDirection(light,fallbackLeft){var d=directionText(light);if(/\b(left|levo|leva|levi|s leve|sa leve)\b/.test(d))return 18;if(/\b(right|desno|desna|desni|s desne|sa desne)\b/.test(d))return 82;return fallbackLeft?24:76;}
function lightGradient(light,index){var r=roleText(light),x=50,y=42,color='255,238,205',alpha=.22;
 if(r.indexOf('key')>=0||r.indexOf('glavno')>=0){x=sideFromDirection(light,index%2===0);y=34;color='255,222,166';alpha=.34;}
 else if(r.indexOf('fill')>=0){x=sideFromDirection(light,index%2!==0);y=46;color='205,226,255';alpha=.20;}
 else if(r.indexOf('back')>=0||r.indexOf('rim')>=0||r.indexOf('kontra')>=0){x=sideFromDirection(light,index%2===0);y=18;color='255,202,150';alpha=.27;}
 else if(r.indexOf('practical')>=0||r.indexOf('ambient')>=0){x=50;y=48;color='255,232,190';alpha=.14;}
 return 'radial-gradient(circle at '+x+'% '+y+'%, rgba('+color+','+alpha+') 0%, rgba('+color+','+(alpha*.55).toFixed(3)+') 27%, rgba('+color+',0) 68%)';
}
function darkBackground(plan){var neg=String((plan&&plan.negative_fill)||'').toLowerCase();if(!neg)return 'none';var left=/\b(left|levo|leva|levi|s leve|sa leve)\b/.test(neg),right=/\b(right|desno|desna|desni|s desne|sa desne)\b/.test(neg);if(left&&!right)return 'linear-gradient(90deg,rgba(0,0,0,.34),rgba(0,0,0,.11) 34%,rgba(0,0,0,0) 62%)';if(right&&!left)return 'linear-gradient(270deg,rgba(0,0,0,.34),rgba(0,0,0,.11) 34%,rgba(0,0,0,0) 62%)';return 'radial-gradient(ellipse at center,rgba(0,0,0,0) 48%,rgba(0,0,0,.20) 100%)';}
function ensureRoot(){var box=document.getElementById('aiv-photo-box'),img=document.getElementById('aiv-photo');if(!box||!img)return null;var root=document.getElementById(ROOT_ID);if(root&&root.parentNode!==box){root.remove();root=null;}if(!root){root=document.createElement('div');root.id=ROOT_ID;root.style.cssText='position:absolute;pointer-events:none;overflow:hidden;z-index:1;display:none';root.innerHTML='<div data-light style="position:absolute;inset:0;mix-blend-mode:screen"></div><div data-dark style="position:absolute;inset:0;mix-blend-mode:multiply"></div><div data-bloom style="position:absolute;inset:0;box-shadow:inset 0 0 55px rgba(0,0,0,.06)"></div>';var marker=document.getElementById('aiv-overlay');if(marker)box.insertBefore(root,marker);else box.appendChild(root);}return root;}
function contentRect(){var box=document.getElementById('aiv-photo-box'),img=document.getElementById('aiv-photo');if(!box||!img||!img.naturalWidth||!img.naturalHeight)return null;var br=box.getBoundingClientRect(),ir=img.getBoundingClientRect(),ew=ir.width,eh=ir.height;if(!ew||!eh)return null;var na=img.naturalWidth/img.naturalHeight,ea=ew/eh,cw,ch,ox=0,oy=0;if(na>ea){cw=ew;ch=ew/na;oy=(eh-ch)/2;}else{ch=eh;cw=eh*na;ox=(ew-cw)/2;}return {left:ir.left-br.left+ox,top:ir.top-br.top+oy,width:cw,height:ch};}
function position(){var root=ensureRoot(),r=contentRect();if(!root||!r)return;root.style.left=r.left+'px';root.style.top=r.top+'px';root.style.width=r.width+'px';root.style.height=r.height+'px';root.style.borderRadius='10px';}
function ensureControl(){var anchor=document.getElementById('aiv-preview-copy');if(!anchor)return null;var c=document.getElementById(CONTROL_ID);if(c)return c;c=document.createElement('div');c.id=CONTROL_ID;c.style.cssText='margin-top:12px;padding:11px;border:1px solid #30343b;border-radius:11px;background:#0f1115';c.innerHTML='<button type="button" data-toggle style="width:100%;border:1px solid #f5c542;border-radius:9px;padding:10px;background:#191b20;color:#f5c542;font-weight:900"></button><div data-note style="margin-top:7px;color:#9299a3;font-size:12px;line-height:1.4"></div>';anchor.insertAdjacentElement('afterend',c);c.querySelector('[data-toggle]').onclick=function(){enabled=!enabled;apply();updateControl();};updateControl();return c;}
function updateControl(){var c=document.getElementById(CONTROL_ID);if(!c)return;var b=c.querySelector('[data-toggle]'),n=c.querySelector('[data-note]');if(b)b.textContent=isSr()?('AI SIMULACIJA SVETLA: '+(enabled?'UKLJUČENA':'ISKLJUČENA')):('AI LIGHT SIMULATION: '+(enabled?'ON':'OFF'));if(n)n.textContent=isSr()?'Konceptualni prikaz pravca, kontrasta i boje svetla. Nije fotometrijsko merenje niti garantovan konačni izgled.':'Conceptual preview of light direction, contrast and color. It is not a photometric measurement or a guaranteed final look.';}
function apply(){var root=ensureRoot();ensureControl();if(!root||!lastPlan){if(root)root.style.display='none';return;}position();root.style.display=enabled?'block':'none';if(!enabled)return;var gs=lights(lastPlan).map(lightGradient);var light=root.querySelector('[data-light]'),dark=root.querySelector('[data-dark]');if(light){light.style.background=gs.length?gs.join(','):'radial-gradient(circle at 35% 35%,rgba(255,228,180,.22),rgba(255,228,180,0) 65%)';light.style.filter='saturate(1.04) contrast(1.01)';}if(dark)dark.style.background=darkBackground(lastPlan);}
function render(plan){lastPlan=plan&&plan.plan?plan.plan:plan;apply();}
window.addEventListener('lightingai-visual-plan-ready',function(e){render(e.detail||{});});
window.addEventListener('resize',function(){if(enabled&&lastPlan)position();});
window.addEventListener('orientationchange',function(){setTimeout(function(){if(enabled&&lastPlan)position();},180);});
window.LightingAILocalLightSimulation={render:render,setEnabled:function(v){enabled=!!v;apply();updateControl();},isEnabled:function(){return enabled;},version:'0.1-conceptual'};
})();
