(function(){
'use strict';
const ORDER=[
  'setSketchCard',
  'shotSetupCard',
  'dofCard',
  'sceneMeasureCard',
  'lightCalcCard',
  'cctGelCard',
  'lightingRatioCard',
  'flickerCard',
  'continuityCard',
  'shotListCard',
  'cueCard',
  'projectBackupCard'
];
const VERSION='1.0-stable-planner-layout';
let queued=false,lastSignature='';

function planner(){return document.getElementById('planner');}
function signature(){
  const p=planner();if(!p)return'';
  return ORDER.filter(id=>{const el=document.getElementById(id);return el&&el.parentNode===p;}).join('|');
}
function lockLayout(){
  queued=false;
  const p=planner();if(!p)return;
  const present=ORDER.map(id=>document.getElementById(id)).filter(el=>el&&el.parentNode===p);
  if(!present.length)return;
  const sig=signature();
  if(sig===lastSignature&&present.every((el,i)=>!i||present[i-1].nextElementSibling===el))return;

  const planArea=document.getElementById('planArea');
  let anchor=planArea&&planArea.parentNode===p?planArea:null;
  present.forEach(el=>{
    const expected=anchor?anchor.nextSibling:p.firstChild;
    if(expected!==el)p.insertBefore(el,expected);
    anchor=el;
  });
  lastSignature=signature();
  p.dataset.layoutVersion=VERSION;
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(lockLayout);}

const observer=new MutationObserver(schedule);
function init(){
  const p=planner();if(!p){setTimeout(init,100);return;}
  observer.observe(p,{childList:true});
  lockLayout();
  [150,400,900,1600,2800,4500,7000,10000].forEach(ms=>setTimeout(lockLayout,ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.LightingAIPlannerLayout={version:VERSION,order:ORDER.slice(),lock:lockLayout};
})();
