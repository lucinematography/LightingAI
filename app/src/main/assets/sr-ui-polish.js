(function(){
'use strict';
const E=id=>document.getElementById(id);
const isSr=()=>localStorage.getItem('lighting_language_v1')!=='en';
function text(id,value){const e=E(id);if(e&&isSr()&&e.textContent!==value)e.textContent=value;}
function apply(){
  if(!isSr())return;

  text('continuityTitle','🎬 Kontinuitet / Usklađivanje kadra');
  text('shotListTitle','🎞 Lista kadrova / Plan pokrivenosti');
  text('flickerTitle','⚡ Treperenje / Bezbedan zatvarač');
  text('cueTitle','🎚 Planer svetlosnih promena');

  text('shotSetupTitle','🎥 Izveštaj scene / Postavka kadra');
  text('dofTitle','🎥 Dubinska oštrina (DOF)');
  text('dofCocLabel','KRUG RASEJANJA (CoC) (mm)');
  text('dofHyperfocalLabel','HIPERFOKALNA DALJINA');
  text('dofNearLabel','BLISKA GRANICA');
  text('dofFarLabel','DALEKA GRANICA');
  text('dofTotalLabel','UKUPNA DUBINSKA OŠTRINA');

  text('ratioTitle','⚖️ Odnos svetla · Glavno / dopunsko / kontrasvetlo');
  text('ratioKeyLabel','GLAVNO / KEY (lux)');
  text('ratioFillLabel','DOPUNSKO / FILL (lux)');
  text('ratioBackLabel','KONTRASVETLO / BACK (lux)');
  text('ratioTargetLabel','ŽELJENA RAZLIKA GLAVNO–DOPUNSKO (stop)');
  text('ratioDirectLabel','GLAVNO : DOPUNSKO');
  text('ratioClassicLabel','(GLAVNO + DOPUNSKO) : DOPUNSKO');
  text('ratioBackKeyLabel','KONTRASVETLO : GLAVNO');
  text('ratioTargetFillLabel','DOPUNSKO ZA ŽELJENI KONTRAST');

  text('lightCalcShutterLabel','UGAO ZATVARAČA');
  text('flickerAngleLabel','UGAO ZATVARAČA');

  text('cctTintIntro','Za fluorescentne, gasne i LED izvore izaberi smer korekcije i jačinu. Ovo je odvojeno od CCT-a.');
  text('cctTintLossLabel','GUBITAK GELA ZA ZELENO/MAGENTA KOREKCIJU');
  text('cctTintNote','Plus/Minus Green jačina nije univerzalna skala zelena/magenta na kameri. LEE navodi približne CC ekvivalente, pa LightingAI ne pretvara proizvoljnu vrednost korekcije u gel bez merenja.');

  text('projectBackupTitle','💾 Rezervna kopija projekta');
  text('projectBackupIntro','Sačuvaj lokalne LightingAI planerske podatke u jedan JSON fajl. Fotografije, podaci uređaja i backend/auth podešavanja nisu deo rezervne kopije.');
  text('projectBackupSave','SAČUVAJ JSON PROJEKTA');
  text('projectBackupCopy','KOPIRAJ SAŽETAK');
  text('projectBackupSunLabel','UKLJUČI SUNCE / LOKACIJSKE PODATKE');
  text('projectBackupNote','Ovo je trenutno samo izvoz. Uvoz rezervne kopije još nije uključen, da ne bismo rizikovali postojeće podatke.');
  const count=E('projectBackupCount');
  if(count&&/^U backup ulazi:/i.test(count.textContent))count.textContent=count.textContent.replace(/^U backup ulazi:/i,'Rezervna kopija sadrži:').replace(/ · equipment /i,' · oprema ');
}
const observer=new MutationObserver(()=>apply());
if(document.body)observer.observe(document.body,{subtree:true,childList:true,characterData:true});
const old=window.setLanguage;
if(typeof old==='function'&&!window.__lightingaiSrPolishLanguageHook){
  window.__lightingaiSrPolishLanguageHook=true;
  window.setLanguage=function(l){old(l);setTimeout(apply,0);setTimeout(apply,120);};
}
window.LightingAISerbianUiPolish=apply;
apply();
})();
