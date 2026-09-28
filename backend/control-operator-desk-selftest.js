import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const dashboard=fs.readFileSync(path.join(root,'app/src/main/assets/control-dashboard.js'),'utf8');
const artnet=fs.readFileSync(path.join(root,'app/src/main/assets/artnet-control.js'),'utf8');

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

for(const marker of [
  "controlDeskDimmer",
  "controlDeskApplyMaster",
  "controlDeskArm",
  "controlDeskPrev",
  "controlDeskGo",
  "controlDeskBlackout",
  "controlDeskRestore",
  "version:'0.14-operator-startup-deterministic'"
]) expect(dashboard.includes(marker),'Operator desk marker missing: '+marker);

expect(dashboard.includes("desk.masterDimmer(Number(dr&&dr.value)||0)"),'Operator MASTER must call existing safe masterDimmer API');
expect(dashboard.includes("desk.arm(!(typeof desk.isArmed==='function'&&desk.isArmed()))"),'Operator ARM must call existing arm API');
expect(dashboard.includes("desk.previousCue()")&&dashboard.includes("desk.goCue()"),'Operator cue transport must call existing cue APIs');
expect(dashboard.includes("desk.globalBlackout()")&&dashboard.includes("desk.restoreBlackout()"),'Operator blackout/restore must call existing safety APIs');

expect(dashboard.includes('deskPointerActive')&&dashboard.includes('deskInteractionUntil')&&dashboard.includes('periodicRender()'),'Operator desk interaction guard missing');
expect(dashboard.includes('card.onpointerdown=function(){deskPointerActive=true')&&dashboard.includes('card.onpointerup=function(){deskPointerActive=false')&&dashboard.includes('card.onfocusin=function(){holdDeskInteraction(2500)'), 'Whole operator card touch/focus guard missing');
expect(dashboard.includes("dr.onpointerdown=function(){deskPointerActive=true")&&dashboard.includes("dr.onpointerup=function(){deskPointerActive=false"),'MASTER touch pointer guard missing');
expect(dashboard.includes('setInterval(periodicRender,900)'),'Periodic dashboard refresh must use interaction-safe render gate');
expect(dashboard.includes('controlDeskSelectAll')&&dashboard.includes('MASTER SCOPE')&&dashboard.includes('OBIM MASTER-a'),'Operator desk must show explicit master scope and ALL reset');
expect(artnet.includes('masterDimmerScope:masterDimmerScope')&&artnet.includes('selectAllMasterControls:selectAllMasterControls'),'Master scope/reset API missing');
expect(artnet.includes('cueStatus:cueStatus')&&artnet.includes('function cueStatus(){'),'Operator cue status API missing');
expect(artnet.includes("ensureReady:function(){return !!E('artnetCard')||install();}"),'Control API startup readiness gate missing');
expect(dashboard.includes("typeof api.ensureReady==='function'&&!api.ensureReady()"),'Operator desk must wait for control UI readiness');
expect(dashboard.includes('CURRENT CUE')&&dashboard.includes('SLEDEĆI')&&dashboard.includes('GLOBAL BLACKOUT'),'Operator cue/global blackout visibility missing');
expect(artnet.includes("document.querySelectorAll('.artnet-master-device,.artnet-master-cct-device,.artnet-master-rgb-device')"),'ALL reset must select the existing verified master controls');
expect(dashboard.includes('if(deskPointerActive&&now<deskInteractionUntil)return')&&dashboard.includes('if(deskPointerActive)deskPointerActive=false'),'Stalled pointer state must self-release after interaction timeout');
expect(!dashboard.includes('setInterval(render,900)'),'Unsafe periodic full re-render must not return');

for(const apiMarker of [
  'masterDimmer:applyMasterDimmer',
  'previousCue:previousCue',
  'goCue:goCue',
  'globalBlackout:globalBlackout',
  'restoreBlackout:restoreBeforeBlackout',
  'arm:setOutputArmed',
  "version:'0.66-sacn-ipv6-dual'"
]) expect(artnet.includes(apiMarker),'Safe Art-Net operator API missing: '+apiMarker);

expect(artnet.includes('function applyMasterDimmer(value){')&&artnet.includes('if(!requireOutputArmed())return;'),'MASTER dimmer must remain ARM gated');
expect(artnet.includes('function goCue(index){')&&artnet.includes('if(!requireOutputArmed())return;'),'GO cue must remain ARM gated');
expect(artnet.includes('function globalBlackout(){')&&artnet.includes('if(!requireOutputArmed())return;'),'Global blackout must remain ARM gated');
expect(artnet.includes('function restoreBeforeBlackout(){')&&artnet.includes('if(!requireOutputArmed())return;'),'Blackout restore must remain ARM gated');
expect(artnet.includes('function profileForRow(r)')&&artnet.includes('verified===true'),'Operator control engine must retain verified-profile gating');

console.log(JSON.stringify({ok:failures.length===0,operatorDeskVersion:'0.14-operator-startup-deterministic',failures},null,2));
if(failures.length)process.exit(1);
