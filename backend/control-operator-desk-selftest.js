import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const dashboard=fs.readFileSync(path.join(root,'app/src/main/assets/control-dashboard.js'),'utf8');
const artnet=fs.readFileSync(path.join(root,'app/src/main/assets/artnet-control.js'),'utf8');
const bootstrap=fs.readFileSync(path.join(root,'app/src/main/assets/control-bootstrap.js'),'utf8');

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

for(const marker of [
  'controlOpenBluetooth',
  'controlLoadAdvanced',
  'LightingAIAdvancedControlLoad',
  "version:'0.19-bluetooth-primary-no-dmx-gate'"
]) expect(dashboard.includes(marker)||bootstrap.includes(marker),'Bluetooth-first CONTROL marker missing: '+marker);

expect(dashboard.includes('PRONAĐI I POVEŽI RASVETU')&&dashboard.includes('DISCOVER & CONNECT FIXTURES'),'Primary CONTROL CTA must be direct Bluetooth discovery');
expect(dashboard.includes('Bluetooth je glavni put')&&dashboard.includes('Bluetooth is the primary path'),'Primary CONTROL copy must be Bluetooth-first');
expect(dashboard.includes('UČITAJ NAPREDNU KONTROLU')&&dashboard.includes('LOAD ADVANCED CONTROL'),'Advanced network/DMX control must be opt-in');
expect(!dashboard.includes('controlDeskArm')&&!dashboard.includes('controlDeskDimmer'),'Primary dashboard must not expose DMX operator desk controls');
expect(!bootstrap.includes("const scripts=["),'Bootstrap must not serialize Bluetooth behind a single DMX/network dependency chain');
expect(bootstrap.indexOf('ble-control.js')<bootstrap.indexOf('artnet-control.js'),'Bluetooth asset must be declared before advanced Art-Net asset');
expect(bootstrap.includes('const directScripts=')&&bootstrap.includes('const advancedScripts='),'Primary and advanced CONTROL assets must be split');
expect(bootstrap.includes("window.LightingAIControlBootstrapMode='bluetooth-first'"),'Bootstrap mode must be Bluetooth-first');
expect(bootstrap.includes('window.LightingAIAdvancedControlLoad=async function()'),'Advanced DMX/network loader must be explicit and lazy');

// Advanced network control remains fail-closed when manually loaded.
for(const apiMarker of [
  'masterDimmer:applyMasterDimmer',
  'previousCue:previousCue',
  'goCue:goCue',
  'globalBlackout:globalBlackout',
  'restoreBlackout:restoreBeforeBlackout',
  'arm:setOutputArmed',
  "version:'0.66-sacn-ipv6-dual'"
]) expect(artnet.includes(apiMarker),'Advanced Art-Net operator API missing: '+apiMarker);

expect(artnet.includes('function applyMasterDimmer(value){')&&artnet.includes('if(!requireOutputArmed())return;'),'Advanced MASTER dimmer must remain ARM gated');
expect(artnet.includes('function goCue(index){')&&artnet.includes('if(!requireOutputArmed())return;'),'Advanced GO cue must remain ARM gated');
expect(artnet.includes('function globalBlackout(){')&&artnet.includes('if(!requireOutputArmed())return;'),'Advanced blackout must remain ARM gated');
expect(artnet.includes('function restoreBeforeBlackout(){')&&artnet.includes('if(!requireOutputArmed())return;'),'Advanced blackout restore must remain ARM gated');

console.log(JSON.stringify({ok:failures.length===0,controlPrimary:'bluetooth-first',failures},null,2));
if(failures.length)process.exit(1);
