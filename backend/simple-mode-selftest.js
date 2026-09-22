import fs from 'node:fs';

function read(path){return fs.readFileSync(path,'utf8');}
function requireText(text,needle,message){
  if(!text.includes(needle)) throw new Error(message+': '+needle);
}

const index=read('../app/src/main/assets/index.html');
const simple=read('../app/src/main/assets/simple-mode-ui.js');
const catalog=read('../app/src/main/assets/catalog.js');
const workflow=read('../.github/workflows/build-apk.yml');

requireText(index,'simple-mode-ui.js','Simple mode UI must load');
requireText(simple,"MODE_KEY='lightingai_ui_mode_v1'",'Simple mode persistence key missing');
requireText(simple,"var SIMPLE='simple', ADVANCED='advanced'",'Simple/Advanced modes missing');
requireText(simple,"s1:'1. NOVI PROJEKAT'",'Guided beginner workflow missing');
requireText(simple,"s2:'2. IZABERI OPREMU'",'Equipment guide step missing');
requireText(simple,"s3:'3. DODAJ SCENU'",'Scene guide step missing');
requireText(simple,"s4:'4. NAPRAVI AI PLAN'",'AI guide step missing');
requireText(simple,"s5:'5. SAČUVAJ / IZVEZI'",'Save/export guide step missing');
requireText(simple,'? KAKO SE KORISTI','Per-page help missing');
requireText(simple,'lightingai-simple-mode','Simple mode body class missing');
requireText(simple,'data-page="control"','Simple mode must only hide Control navigation, not delete it');
requireText(simple,'data-page="tools"','Simple mode must only hide Tools navigation, not delete it');
requireText(simple,"window.LightingAISimpleMode",'Simple mode public API missing');
requireText(simple,'collapseGuide','VODI ME collapse behavior missing');
requireText(simple,'guideCollapsedBtn','Collapsed VODI ME bar missing');
requireText(simple,"guideStep+'/5'",'VODI ME step indicator missing');
requireText(simple,"version:'1.1'",'Simple mode version marker missing');
requireText(workflow,"'assets/simple-mode-ui.js'",'APK must package Simple mode UI');

if(catalog.includes('lightingai_ui_mode_v1')||catalog.includes('LightingAISimpleMode')){
  throw new Error('Stable equipment catalog must remain independent from Simple mode');
}
if(simple.includes('MutationObserver')) throw new Error('Simple mode must not use a global MutationObserver');
if(simple.includes('position:fixed')) throw new Error('Simple mode must not add a floating launcher');
if((index.match(/simple-mode-ui\.js/g)||[]).length!==1) throw new Error('Simple mode UI must load exactly once');

console.log('Simple mode integration self-test passed');
