(function(){
'use strict';
const E=id=>document.getElementById(id);
const isSr=()=>localStorage.getItem('lighting_language_v1')!=='en';
function text(id,value){const e=E(id);if(e&&isSr()&&e.textContent!==value)e.textContent=value;}
function labelPrefix(id,value){
  const e=E(id);if(!e||!isSr())return;
  const wanted=value+' ';
  const n=e.firstChild;
  if(n&&n.nodeType===3){if(n.nodeValue!==wanted)n.nodeValue=wanted;}
  else e.insertBefore(document.createTextNode(wanted),e.firstChild);
}
function setLabelForInput(selector,value){
  const input=document.querySelector(selector);if(!input||!isSr())return;
  const label=input.closest('label');if(!label)return;
  const wanted=value+' ';
  const n=label.firstChild;
  if(n&&n.nodeType===3){if(n.nodeValue!==wanted)n.nodeValue=wanted;}
  else label.insertBefore(document.createTextNode(wanted),label.firstChild);
}
function mapText(el,map){if(el&&isSr()&&Object.prototype.hasOwnProperty.call(map,el.textContent))el.textContent=map[el.textContent];}
function roundDofDistance(){
  const e=E('dofDistance');if(!e||document.activeElement===e)return;
  const n=Number(String(e.value||'').replace(',','.'));
  if(Number.isFinite(n)&&String(e.value).replace(',','.').split('.')[1]?.length>2)e.value=n.toFixed(2);
}
function hookActions(){
  const dof=E('dofFromSketch');
  if(dof&&!dof.dataset.srPolishHook){
    dof.dataset.srPolishHook='1';
    dof.addEventListener('click',()=>{setTimeout(roundDofDistance,0);setTimeout(roundDofDistance,80);});
  }
  const compare=E('continuityCompare');
  if(compare&&!compare.dataset.srPolishHook){
    compare.dataset.srPolishHook='1';
    compare.addEventListener('click',()=>setTimeout(()=>{
      if(!isSr())return;
      const s=E('continuityStatus');if(s)s.textContent='Poređenje je osveženo.';
    },0));
  }
}
function applySceneMeasure(){
  if(!isSr())return;
  text('sceneMeasureIntro','PRO režim koristi Android Camera2 i ugrađeni senzor nagiba, pa radi i bez senzora dubine. Rezervna kamera ostaje kao alternativni režim.');
  text('sceneMeasureDo','SAČUVAJ MERENJE');
  text('sceneMeasureNote','Ciljaj mesto gde objekat dodiruje ravan pod. PRO režim je pouzdaniji jer koristi ugrađenu kameru i ugrađeni senzor; rezultat je i dalje geometrijska procena, ne lasersko merenje.');
  const start=E('sceneMeasureStart');
  if(start){
    const v=(start.textContent||'').trim();
    if(/ZAUSTAVI WEB KAMERU/i.test(v))start.textContent='ZAUSTAVI REZERVNU KAMERU';
    else if(/WEB KAMERA/i.test(v))start.textContent='REZERVNA KAMERA';
  }
  const status=E('sceneMeasureStatus');
  if(status){
    const map={
      'WEB senzor nagiba nije dostupan. Koristi PRO merač.':'Senzor nagiba nije dostupan u rezervnom režimu. Koristi PRO merač.',
      'Pokrećem WEB kameru…':'Pokrećem rezervnu kameru…',
      'WEB kamera je spremna.':'Rezervna kamera je spremna.',
      'WEB kamera je zaustavljena.':'Rezervna kamera je zaustavljena.',
      'WEB pregled nije dostupan na ovom telefonu/WebView-u. Koristi PRO merač.':'Rezervni pregled nije dostupan na ovom telefonu/WebView-u. Koristi PRO merač.',
      'Native PRO nije dostupan na ovom uređaju. Prebacujem na WEB rezervni režim.':'PRO režim nije dostupan na ovom uređaju. Prebacujem na rezervnu kameru.'
    };
    if(map[status.textContent])status.textContent=map[status.textContent];
  }
}
function applyContinuity(){
  if(!isSr())return;
  text('continuityTitle','🎬 Kontinuitet / Usklađivanje kadra');
  text('continuityIntro','Sačuvaj tehničku referencu kadra i kasnije proveri šta se promenilo. Poređenje je lokalno i koristi stvarne parametre koje već ima LightingAI.');
  labelPrefix('continuityNameLabel','NAZIV REFERENCE');
  text('continuitySave','SAČUVAJ TRENUTNO');
  text('continuityCompare','POREDI SA TRENUTNIM');
  text('continuityDelete','OBRIŠI REFERENCU');
  const map={
    'Shutter ugao':'Ugao zatvarača',
    'Key lux':'Glavno svetlo (lux)',
    'Fill lux':'Dopunsko svetlo (lux)',
    'Back lux':'Kontrasvetlo (lux)',
    'Flicker parametri':'Parametri treperenja',
    'DMX patch':'DMX raspored'
  };
  document.querySelectorAll('.continuity-row b').forEach(e=>mapText(e,map));
}
function applyShotList(){
  if(!isSr())return;
  text('shotListTitle','🎞 Lista kadrova / Plan pokrivenosti');
  text('shotListIntro','Planiraj više kadrova jedne scene i sačuvaj osnovne tehničke parametre trenutne postavke. Sve ostaje lokalno na uređaju.');
  text('shotListAdd','DODAJ KADAR IZ TRENUTNE POSTAVKE');
  text('shotListClear','OBRIŠI SVE');
  text('shotListCopy','KOPIRAJ LISTU KADROVA');
  text('shotListCsv','SAČUVAJ CSV');
  const s=E('shotListExportStatus');
  if(s){
    const map={
      'Shot List je kopiran.':'Lista kadrova je kopirana.',
      'Shot List je prazan.':'Lista kadrova je prazna.'
    };
    if(map[s.textContent])s.textContent=map[s.textContent];
  }
}
function applyFlicker(){
  if(!isSr())return;
  text('flickerTitle','⚡ Treperenje / Bezbedan zatvarač');
  text('flickerIntro','Planer za usklađivanje vremena ekspozicije sa poznatom frekvencijom modulacije svetla. Ne može garantovati rezultat bez treperenja kod nepoznatog LED/PWM drajvera.');
  labelPrefix('flickerFpsLabel','FPS');
  labelPrefix('flickerAngleLabel','UGAO ZATVARAČA');
  labelPrefix('flickerFreqLabel','FREKVENCIJA SVETLA (Hz)');
  text('flickerUse','UZMI EKSPOZICIJU');
  text('flickerPresetsLabel','BRZE FREKVENCIJE');
  text('flickerCurrentLabel','TRENUTNA EKSPOZICIJA');
  text('flickerCyclesLabel','CIKLUSA SVETLA');
  text('flickerNearestLabel','NAJBLIŽI PORAVNAT UGAO');
  text('flickerOptionsLabel','PORAVNATE OPCIJE');
  text('flickerNote','100 Hz je čest rezultat mreže od 50 Hz sa punotalasnim napajanjem, a 120 Hz kod mreže od 60 Hz, ali to nije pravilo. LED PWM, dimeri, balasti i displeji mogu raditi na potpuno drugim frekvencijama. Za kritičan snimak proveri stvarni izvor kamerom ili meračem treperenja.');
}
function applyCue(){
  if(!isSr())return;
  text('cueTitle','🎚 Planer svetlosnih promena');
  text('cueIntro','Planiraj promene rasvete po kadru ili okidaču. Ovo je lokalni planerski alat: ne šalje DMX i ne upravlja lampama.');
  text('cueAdd','DODAJ PROMENU');
  text('cueClear','OBRIŠI SVE');
  text('cueCopyList','KOPIRAJ LISTU PROMENA');
  text('cueSaveCsv','SAČUVAJ CSV');
  text('cueNote','Planerski podatak — proveri stvarni režim uređaja i ponašanje na konzoli.');
  setLabelForInput('.cue-universe','UNIVERZUM');
  setLabelForInput('.cue-start','POČETNA ADRESA');
  setLabelForInput('.cue-dimmer','INTENZITET %');
  setLabelForInput('.cue-cct','CCT K');
  setLabelForInput('.cue-fade','PRELAZ s');
  const summary=E('cueSummary');
  if(summary){const m=summary.textContent.match(/^(\d+)/);if(m){const n=Number(m[1]);const w=n===1?'promena':(n>=2&&n<=4?'promene':'promena');const v=n+' '+w;if(summary.textContent!==v)summary.textContent=v;}}
  const status=E('cueExportStatus');
  if(status){
    const map={
      'Cue lista je kopirana.':'Lista promena je kopirana.',
      'Izaberi mesto za čuvanje Cue CSV fajla.':'Izaberi mesto za čuvanje CSV fajla sa svetlosnim promenama.',
      'Nema Lighting Cue stavki.':'Nema svetlosnih promena.'
    };
    if(map[status.textContent])status.textContent=map[status.textContent];
  }
}
function applyDmx(){
  if(!isSr())return;
  text('dmxTitle','🎛 DMX raspored');
  text('dmxIntro','Planiraj DMX univerzum, početnu adresu i zauzeće kanala. LightingAI ne izmišlja DMX režime: broj kanala unesi ručno dok u katalog ne dodamo verifikovane profile proizvođača.');
  text('dmxImport','UVEZI IZABRANU OPREMU');
  text('dmxAdd','DODAJ RUČNO');
  text('dmxAuto','RASPOREDI AUTOMATSKI');
  text('dmxClear','OBRIŠI SVE');
  text('dmxCopyPatch','KOPIRAJ DMX RASPORED');
  text('dmxSaveCsv','SAČUVAJ CSV');
  text('dmxH_name','UREĐAJ');
  text('dmxH_mode','DMX REŽIM');
  text('dmxH_universe','UNIVERZUM');
  text('dmxH_start','POČETNA ADRESA');
  text('dmxH_channels','KANALI');
  text('dmxH_end','KRAJ');
  text('dmxH_status','STATUS');
  text('dmxNote','DMX univerzum ima 512 kanala. Automatski raspored postavlja samo uređaje koji imaju unet broj kanala i prelazi u sledeći univerzum kada je potrebno.');
  const status=E('dmxMessage');
  if(status){
    const map={
      'DMX patch je kopiran.':'DMX raspored je kopiran.'
    };
    if(map[status.textContent])status.textContent=map[status.textContent];
  }
  const sum=E('dmxSummary');
  if(sum){
    let v=sum.textContent;
    v=v.replace(/^(1) uređaja\b/,'1 uređaj').replace(/\b1 univerzuma\b/,'1 univerzum');
    if(v!==sum.textContent)sum.textContent=v;
  }
}
function apply(){
  if(!isSr())return;

  text('subtitle','Asistent za rasvetu • Filmska i studijska rasveta');
  text('aboutText','LIGHTING AI • Asistent za filmsku i studijsku rasvetu.');

  applyContinuity();
  applyShotList();
  applyFlicker();
  applyCue();
  applyDmx();

  text('shotSetupTitle','🎥 Izveštaj scene / Postavka kadra');
  text('dofTitle','🎥 Dubinska oštrina (DOF)');
  text('dofIntro','Planerski kalkulator dubinske oštrine iz žižne daljine, blende, udaljenosti i vrednosti kruga rasipanja. Može preuzeti kameru i glumca iz Skice seta.');
  text('dofCocLabel','KRUG RASEJANJA (CoC) (mm)');
  text('dofHyperfocalLabel','HIPERFOKALNA DALJINA');
  text('dofNearLabel','BLISKA GRANICA');
  text('dofFarLabel','DALEKA GRANICA');
  text('dofTotalLabel','UKUPNA DUBINSKA OŠTRINA');
  roundDofDistance();

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

  applySceneMeasure();
  hookActions();
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
