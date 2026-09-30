import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { buildRuntimeCatalog } from './catalog-runtime.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};
for(const removed of [
 'app/src/main/assets/artnet-control.js','app/src/main/assets/dmx-patch-planner.js','app/src/main/assets/dmx-export.js',
 'app/src/main/java/com/lightingai/app/ArtNetSender.java','app/src/main/java/com/lightingai/app/SacnSender.java',
 'app/src/main/java/com/lightingai/app/NetworkInterfaceInspector.java'
])expect(!exists(removed),'removed network transport still exists: '+removed);
const main=read('app/src/main/java/com/lightingai/app/MainActivity.java');
for(const forbidden of ['artNetSendDmx','sacnSendDmx','networkDmxDiagnostics','ArtNetSender','SacnSender'])expect(!main.includes(forbidden),'native network command remains: '+forbidden);
const driversSrc=read('app/src/main/assets/control-system-drivers.js');
const routingSrc=read('app/src/main/assets/control-routing.js');
const context={window:{}};vm.createContext(context);vm.runInContext(driversSrc,context);context.window.LightingAIControlSystemDrivers=context.window.LightingAIControlSystemDrivers;vm.runInContext(routingSrc,context);
const {fixtures}=buildRuntimeCatalog();
const titan=fixtures.find(f=>f.id==='astera-titantube-fp1');
const pb12=fixtures.find(f=>f.id==='aputure-infinibar-pb12');
expect(!!titan&&!!pb12,'physical-test fixtures missing from catalog');
for(const fixture of [titan,pb12]){
 const result=context.window.LightingAIControlRouting.classify(fixture);
 expect(result.semanticReady===false&&result.transportReady===false,'unverified Bluetooth fixture must fail closed: '+fixture.id);
}
expect(context.window.LightingAIControlRouting.productionReady(titan)===false,'production route may not be inferred from catalog metadata');
console.log(JSON.stringify({ok:failures.length===0,fixtures:fixtures.length,controlPrimary:'bluetooth-only',failures},null,2));
if(failures.length)process.exit(1);
