import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASTERA_TITANTUBE_FIXTURES, ASTERA_TITANTUBE_ACCESSORIES } from './astera-titantube-library.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const failures = [];
const expect = (ok, msg) => { if (!ok) failures.push(msg); };

const titan = ASTERA_TITANTUBE_FIXTURES.find(f => f.id === 'astera-titantube-fp1');
expect(!!titan, 'TitanTube FP1 missing');

const modes = titan?.dmxModes || [];
const verifiedModes = modes.filter(m => m?.verified === true && Number(m.channels) > 0);
expect(verifiedModes.length === 1, 'TitanTube must expose exactly one verified default DMX profile for automatic patching');

const profile = verifiedModes[0];
expect(profile?.channels === 4, 'TitanTube verified profile must be 4 channels');
const keys = new Set((profile?.controls || []).map(c => c?.key));
for (const key of ['dimmer','red','green','blue']) expect(keys.has(key), 'TitanTube verified profile missing control: ' + key);

const routes = titan?.control?.standardRoutes || [];
expect(routes.some(r => r?.verified === true && (r.input || []).includes('Art-Net') && (r.input || []).includes('sACN')), 'TitanTube verified network production route missing');
expect(ASTERA_TITANTUBE_ACCESSORIES.some(a => a.id === 'astera-fp3-dtl'), 'Astera FP3 DataLink accessory missing');

const patch = fs.readFileSync(path.join(root,'app/src/main/assets/dmx-patch-planner.js'),'utf8');
expect(patch.includes('defaultMode=verified.length===1?verified[0]:null'), 'DMX patch automatic verified-profile selection missing');
expect(patch.includes('function findFreeDmxSlot(channels)'), 'DMX patch free-slot allocator missing');

const main = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/MainActivity.java'),'utf8');
for (const marker of ['artNetSendDmx','artNetSetLiveDmx','sacnSendDmx','sacnSetLiveDmx','networkDmxDiagnostics']) {
  expect(main.includes(marker), 'Native network control bridge missing: ' + marker);
}


const artnet = fs.readFileSync(path.join(root,'app/src/main/assets/artnet-control.js'),'utf8');
expect(artnet.includes("universeMin:1,universeMax:4,maxActiveUniverses:1"), 'Sidus One verified universe limits missing');
expect(artnet.includes('preflightBridgeUniverse') && artnet.includes('preflightBridgeMulti'), 'Bridge universe preflight safety missing');
expect(artnet.includes('LightingAINetworkDmxLifecyclePause') && artnet.includes('LightingAINetworkDmxLifecycleResume'), 'Network DMX lifecycle fail-closed hooks missing');
expect(artnet.includes('setArmSignature') && artnet.includes('clearArmSignature'), 'Native armed-route binding missing');
expect(main.includes('networkDmxSetArmSignature') && main.includes('requireNetworkDmxArmedRoute'), 'Android armed-route enforcement missing');

const artnetSender = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/ArtNetSender.java'),'utf8');
const sacnSender = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/SacnSender.java'),'utf8');
expect(artnetSender.includes('validateUniverse') && artnetSender.includes('MAX_UNIVERSE = 32768'), 'Art-Net strict universe validation missing');
expect(sacnSender.includes('validateUniverse') && sacnSender.includes('MAX_UNIVERSE = 63999'), 'sACN strict universe validation missing');

const networkInspector = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/NetworkInterfaceInspector.java'),'utf8');
const artnetLive = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/ArtNetLiveEngine.java'),'utf8');
const sacnLive = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/SacnLiveEngine.java'),'utf8');
expect(networkInspector.includes('String signature()'), 'Network route signature missing');
expect(artnetLive.includes('Network changed; re-arm required'), 'Art-Net network-change fail-safe missing');
expect(sacnLive.includes('Network changed; re-arm required') && sacnLive.includes('abortAll()'), 'sACN network-change fail-safe missing');

const routing = fs.readFileSync(path.join(root,'app/src/main/assets/control-routing.js'),'utf8');
expect(routing.includes("version:'1.3-conservative-system-driver-gated'"), 'Production control router version marker missing');

console.log(JSON.stringify({ok:failures.length===0,fixture:'astera-titantube-fp1',verifiedModes:verifiedModes.length,routes:routes.length,failures},null,2));
if (failures.length) process.exit(1);
