import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
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
expect(ASTERA_TITANTUBE_ACCESSORIES.some(a => a.id === 'astera-art7'), 'Astera ART7 AsteraBox accessory missing');
const art7Route = routes.find(r => r?.id === 'astera-titan-wireless-crmx');
expect(art7Route?.verified === true && (art7Route?.input || []).includes('DMX512') && !(art7Route?.input || []).includes('Art-Net') && !(art7Route?.input || []).includes('sACN') && art7Route?.interface === 'AsteraBox ART7', 'Astera ART7 route must remain DMX512 -> ART7 -> CRMX, not a network-DMX route');

const patch = fs.readFileSync(path.join(root,'app/src/main/assets/dmx-patch-planner.js'),'utf8');
expect(patch.includes('defaultMode=verified.length===1?verified[0]:null'), 'DMX patch automatic verified-profile selection missing');
expect(patch.includes('function findFreeDmxSlot(channels)'), 'DMX patch free-slot allocator missing');
expect(patch.includes('invalid-universe') && patch.includes('invalid-start') && patch.includes('invalid-channels'), 'DMX patch fail-closed address validation missing');
const dmxExport = fs.readFileSync(path.join(root,'app/src/main/assets/dmx-export.js'),'utf8');
expect(dmxExport.includes('invalid-universe') && dmxExport.includes('integerOrNull'), 'DMX snapshot fail-closed validation missing');

const main = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/MainActivity.java'),'utf8');
for (const marker of ['artNetSendDmx','artNetSetLiveDmx','sacnSendDmx','sacnSetLiveDmx','networkDmxDiagnostics']) {
  expect(main.includes(marker), 'Native network control bridge missing: ' + marker);
}


const artnet = fs.readFileSync(path.join(root,'app/src/main/assets/artnet-control.js'),'utf8');
expect(
  artnet.includes("id:'aputure-sidus-one'") &&
  artnet.includes('universeMin:1,universeMax:4') &&
  artnet.includes('artNetUniverseMin:1,artNetUniverseMax:4') &&
  artnet.includes('sacnUniverseMin:1,sacnUniverseMax:4') &&
  artnet.includes('maxActiveUniverses:1') &&
  artnet.includes('artNetPortAddressOffset:0'),
  'Sidus One verified universe/Port-Address policy missing'
);
expect(artnet.includes('preflightBridgeUniverse') && artnet.includes('operationUniverseSetIsSafe') && artnet.includes('bridgeUniverseSetAllowed'), 'Bridge universe safety must validate range at ARM and simultaneous-universe limits at operation time');
expect(artnet.includes('LightingAINetworkDmxLifecyclePause') && artnet.includes('LightingAINetworkDmxLifecycleResume'), 'Network DMX lifecycle fail-closed hooks missing');
expect(artnet.includes('setArmSignature') && artnet.includes('clearArmSignature'), 'Native armed-route binding missing');
expect(main.includes('networkDmxSetArmSignature') && main.includes('requireNetworkDmxArmedRoute'), 'Android armed-route enforcement missing');

const artnetSender = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/ArtNetSender.java'),'utf8');
const sacnSender = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/SacnSender.java'),'utf8');
expect(artnet.includes("id:'aputure-sidus-four'") && artnet.includes('artNetUniverseMax:32768') && artnet.includes('artNetPortAddressOffset:-1'), 'Sidus Four must map LightingAI U1-U32768 to Art-Net Port-Address 0-32767');
expect(artnetSender.includes('validatePortAddress') && artnetSender.includes('MAX_PORT_ADDRESS = 32767'), 'Art-Net strict Port-Address validation missing');
expect(artnetSender.includes('isUsableIpv4Target') && artnetSender.includes('Art-Net AUTO must resolve to subscriber unicast targets before native send') && artnetSender.includes('Art-Net target must be a usable IPv4 literal') && artnetSender.includes('ArtDmx broadcast targets are not allowed'), 'Native Art-Net must reject unresolved AUTO/broadcast and accept only a usable unicast IPv4 literal');
expect(artnet.includes('artNetPortAddressForUniverse') && artnet.includes('bridgeUniverseAllowed'), 'Per-bridge Art-Net universe policy missing');
expect(artnet.includes('preflightMultipleSacnRoutes') && artnet.includes('multicastRouteCount>1') && artnet.includes('native.sacnMulticastInterfaceCount'), 'Ambiguous sACN multicast route guard missing');
expect(artnet.includes('SACN_IP_MODE_KEY') && artnet.includes("value=\"ipv6\"") && artnet.includes("value=\"dual\"") && artnet.includes('applySacnIpMode'), 'sACN IPv6/Dual transport selector missing');
expect((artnet.match(/protocolNote:'Input priority: XLR > sACN > Art-Net\. Active XLR input disables network control; active sACN overrides Art-Net\.'/g)||[]).length===3,'Astera network bridges must expose documented XLR > sACN > Art-Net input priority');
expect(artnet.includes("normalized==='0.0.0.0'||first===127||(first>=224&&first<=239)"),'Art-Net ARM preflight must reject unspecified, loopback and multicast explicit targets');
expect(artnet.includes('runControlHealthCheck') && artnet.includes('armedNetworkSignature'), 'Network DMX health watchdog missing');
expect(sacnSender.includes('validateUniverse') && sacnSender.includes('MAX_UNIVERSE = 63999'), 'sACN strict universe validation missing');

const networkInspector = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/NetworkInterfaceInspector.java'),'utf8');
const artnetLive = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/ArtNetLiveEngine.java'),'utf8');
const sacnLive = fs.readFileSync(path.join(root,'app/src/main/java/com/lightingai/app/SacnLiveEngine.java'),'utf8');
expect(networkInspector.includes('String signature()'), 'Network route signature missing');
expect(artnetLive.includes('Network changed; re-arm required'), 'Art-Net network-change fail-safe missing');
expect(sacnLive.includes('Network changed; re-arm required') && sacnLive.includes('abortAll()'), 'sACN network-change fail-safe missing');

const catalogAudit = fs.readFileSync(path.join(root,'backend/control-catalog-audit.js'),'utf8');
expect(catalogAudit.includes("typeof channels !== 'number'")&&catalogAudit.includes("typeof ch !== 'number'")&&catalogAudit.includes("typeof value !== 'number'"), 'Control catalog audit must reject string/coerced numeric DMX metadata');

const routing = fs.readFileSync(path.join(root,'app/src/main/assets/control-routing.js'),'utf8');
expect(routing.includes("version:'1.4-rdm-fallback-separated'"), 'Production control router version marker missing');
const routingContext = { window:{} };
vm.createContext(routingContext);
vm.runInContext(routing, routingContext);
const legacyRoute = routingContext.window.LightingAIControlRouting.classify({
  control:['DMX512','On-board dimming'],
  dmxModes:[{name:'Verified legacy dimmer',channels:1,verified:true,sourceUrl:'https://example.invalid/verified-dmx-profile'}]
});
expect(
  legacyRoute?.route === 'gateway' &&
  legacyRoute?.dmx === true &&
  legacyRoute?.transportReady === true &&
  legacyRoute?.semanticReady === true,
  'Legacy control arrays with verified DMX profiles must remain routable through the standards gateway'
);

console.log(JSON.stringify({ok:failures.length===0,fixture:'astera-titantube-fp1',verifiedModes:verifiedModes.length,routes:routes.length,failures},null,2));
if (failures.length) process.exit(1);
