import fs from 'node:fs';

function read(path){return fs.readFileSync(path,'utf8');}
function requireText(text,needle,message){if(!text.includes(needle))throw new Error(message+': '+needle);}

const catalog=read('../app/src/main/assets/catalog.js');
const gelCatalog=read('../app/src/main/assets/gel-filter-catalog.js');
const gelUi=read('../app/src/main/assets/gel-filter-ui.js');
const ai=read('../app/src/main/assets/ai-visual-scene-plan.js');
const index=read('../app/src/main/assets/index.html');
const server=read('./server.js');
const controlWorkflow=read('../.github/workflows/build-control-lab-apk.yml');
const standardWorkflow=read('../.github/workflows/build-apk.yml');

requireText(index,'gel-filter-catalog.js','FILTERI/GEL asset must load in Android UI');
requireText(index,'id="gelFilterFolder"','Equipment must expose isolated FILTERI/GEL mount point');
requireText(index,'gel-filter-ui.js','Isolated FILTERI/GEL UI script must load');
requireText(gelUi,'FILTERI / GEL','Isolated FILTERI/GEL folder missing');
requireText(gelUi,"equipmentType:'gel'",'Selected gels must be typed as gel modifiers');
requireText(gelUi,"version:'1.1-isolated'",'FILTERI/GEL UI must remain isolated from lighting catalog');
requireText(gelUi,'folderOpen=false','FILTERI/GEL folder must start collapsed');
if(gelUi.includes('details.open=true'))throw new Error('FILTERI/GEL folder must not be forced open on render');
if(catalog.includes('FILTERI / GEL')||catalog.includes("equipmentType:'gel'"))throw new Error('Stable lighting catalog must not contain FILTERI/GEL UI logic');
const gelCount=(gelCatalog.match(/"equipmentType":"gel"/g)||[]).length;
if(gelCount!==977)throw new Error('FILTERI/GEL must contain exactly 977 filters, found '+gelCount);
for(const marker of ['"count":333','"count":144','"count":312','"count":188'])requireText(gelCatalog,marker,'FILTERI/GEL source count missing');
requireText(ai,'gelCatalog:gelCatalog','AI Visual Plan must send the gel catalog');
requireText(ai,'gel_recommendations','AI result must render gel recommendations');
requireText(server,'formatGelCatalogForAI','Backend gel catalog formatter missing');
requireText(server,'never invent a gel code or product','AI must not invent gel products or codes');
requireText(server,'GEL/FILTER RULES: filters and gels are modifiers, never fixtures','AI must not treat gels as fixtures');
requireText(server,'gel_recommendations','Backend schema must expose gel recommendations');
for(const workflow of [controlWorkflow,standardWorkflow]){
  requireText(workflow,'npm run build:gels','CI must build official gel catalog');
  requireText(workflow,"'assets/gel-filter-catalog.js'",'APK must package gel catalog');
  requireText(workflow,"'assets/gel-filter-ui.js'",'APK must package isolated gel UI');
}
const loadGel=index.indexOf('gel-filter-catalog.js');
const loadCatalog=index.indexOf('catalog.js');
const loadGelUi=index.indexOf('gel-filter-ui.js');
if(loadGel<0||loadCatalog<0||loadGelUi<0||loadGel>loadCatalog||loadCatalog>loadGelUi)throw new Error('Gel catalog must load before Equipment catalog and gel UI after it');
console.log('FILTERI/GEL integration self-test passed: Rosco-only catalog');
