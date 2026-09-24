import fs from 'node:fs';

function read(path){return fs.readFileSync(path,'utf8');}
function need(text,needle,msg){if(!text.includes(needle))throw new Error(msg+': '+needle);}

const index=read('../app/src/main/assets/index.html');
const tools=read('../app/src/main/assets/tools-compact-ui.js');
const workflow=read('../.github/workflows/build-apk.yml');

need(index,'tools-compact-ui.js','Compact Tools UI must load');
need(tools,"window.LightingAIToolsCompact",'Compact Tools public API missing');
need(tools,"version:VERSION",'Compact Tools version marker missing');
need(tools,'nav button[data-page="tools"]','Tools navigation hook missing');
need(tools,'setTimeout(home,0)','Tools must reset to top on navigation');
need(tools,'card.hidden=true','Tools cards must collapse without deletion');
need(tools,'openTool','Tools open function missing');
need(tools,'collapseAll','Tools collapse function missing');
need(tools,'projectBackupCard','Project Backup must remain available');
need(tools,'deviceCapabilitiesCard','Device Capabilities must remain available');
need(workflow,"'assets/tools-compact-ui.js'",'APK must package compact Tools UI');

if((index.match(/tools-compact-ui\.js/g)||[]).length!==1)throw new Error('Compact Tools UI must load exactly once');
if(tools.includes('removeChild(')||tools.includes('.remove()'))throw new Error('Compact Tools UI must not delete existing tool modules');
if(tools.includes('MutationObserver'))throw new Error('Compact Tools UI must not use a global MutationObserver');

console.log('Compact Tools integration self-test passed');
