import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { ASTERA_TITANTUBE_FIXTURES, ASTERA_TITANTUBE_ACCESSORIES } from './astera-titantube-library.js';
import { FIXTURE_LIBRARY } from './fixture-library.js';
import { ARRI_SKYPANEL_PRO_FIXTURES } from './arri-skypanel-pro-library.js';
import { ARRI_ORBITER_FIXTURES } from './arri-orbiter-library.js';
import { ARRI_SKYPANEL_CLASSIC_S30_FIXTURES } from './arri-skypanel-classic-s30-library.js';
import { ARRI_SKYPANEL_DISCONTINUED_FIXTURES } from './arri-skypanel-discontinued-library.js';
import { ARRI_CASTER_SERIES_DISCONTINUED_FIXTURES } from './arri-caster-series-discontinued-library.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const failures = [];
const expect = (ok, msg) => { if (!ok) failures.push(msg); };

const aputureFixtures = FIXTURE_LIBRARY.filter(f => f.manufacturer === 'Aputure');
expect(aputureFixtures.every(f => !Array.isArray(f.control)), 'Aputure legacy control arrays must be normalized before production routing');

function aputure(id) { return aputureFixtures.find(f => f.id === id); }
function hasAll(values, expected) { return expected.every(value => (values || []).includes(value)); }

const ls60d = aputure('aputure-ls-60d');
const ls60x = aputure('aputure-ls-60x');
for (const fixture of [ls60d, ls60x]) {
  expect(!!fixture, 'Aputure LS 60 fixture missing');
  expect((fixture?.control?.directLightingAI || []).length === 0, (fixture?.id || 'LS60') + ' must not claim native Art-Net/sACN');
  expect(!(fixture?.control?.wired || []).includes('DMX512'), (fixture?.id || 'LS60') + ' must not invent wired DMX512');
}

const ls600d = aputure('aputure-ls-600d');
expect(hasAll(ls600d?.control?.wired, ['DMX512']), 'LS 600d documented wired DMX512 route missing');
expect((ls600d?.control?.directLightingAI || []).length === 0, 'LS 600d must not claim Ethernet Art-Net/sACN');
const ls600Verified = (ls600d?.dmxModes || []).filter(mode => mode?.verified === true);
expect(ls600Verified.length === 1, 'LS 600d must expose exactly one verified default DMX profile');
expect(ls600Verified[0]?.name === 'Lighting 1ch' && ls600Verified[0]?.channels === 1, 'LS 600d verified Lighting 1ch profile missing');
expect((ls600Verified[0]?.controls || []).some(control => control?.key === 'dimmer' && control?.channel === 1), 'LS 600d verified dimmer channel missing');
expect(String(ls600Verified[0]?.sourceUrl || '').includes('LS-600d-DMX-Profile-Specification-V1.0-.pdf'), 'LS 600d official DMX profile source missing');

for (const id of ['aputure-ls-600d-pro','aputure-ls-600x-pro','aputure-storm-cs32','aputure-electro-storm-cs15','aputure-electro-storm-xt26']) {
  const fixture = aputure(id);
  expect(!!fixture, 'Aputure native-network fixture missing: ' + id);
  expect(hasAll(fixture?.control?.directLightingAI, ['Art-Net','sACN']), 'Aputure native Art-Net/sACN route missing: ' + id);
}

const cs32 = aputure('aputure-storm-cs32');
expect(cs32?.dmxProfileVerification?.status === 'HOLD', 'STORM CS32 DMX profile must remain HOLD until its per-channel chart is locked');
expect(!(cs32?.dmxModes || []).some(mode => mode?.verified === true), 'STORM CS32 must not expose an unverified DMX profile as verified');
expect((cs32?.dmxProfileVerification?.sourceUrls || []).some(url => String(url).includes('STORM%20CS32%20DMX%20Profile%20Specification%20V1.0.pdf')), 'STORM CS32 HOLD must reference the official DMX chart');

for (const id of ['aputure-storm-80c','aputure-storm-400x','aputure-storm-700x']) {
  const fixture = aputure(id);
  expect(!!fixture, 'Aputure STORM fixture missing: ' + id);
  expect(hasAll(fixture?.control?.wired, ['DMX512','RDM']), 'Aputure STORM DMX/RDM route missing: ' + id);
  expect((fixture?.control?.directLightingAI || []).length === 0, 'Aputure STORM fixture must not invent native network control: ' + id);
}

const cs15 = aputure('aputure-electro-storm-cs15');
const cs15Verified = (cs15?.dmxModes || []).filter(mode => mode?.verified === true);
expect(cs15Verified.length === 1, 'Electro Storm CS15 must expose exactly one verified default DMX profile');
const cs15Rgb = cs15Verified[0];
expect(cs15Rgb?.name === 'Mode 4 RGB 8-bit 5ch' && cs15Rgb?.channels === 5, 'Electro Storm CS15 verified RGB 5ch profile missing');
const cs15Keys = new Set((cs15Rgb?.controls || []).map(control => control?.key));
for (const key of ['dimmer','red','green','blue']) expect(cs15Keys.has(key), 'Electro Storm CS15 verified profile missing control: ' + key);
expect((cs15Rgb?.requiredChannels || []).some(channel => channel?.channel === 5 && channel?.value === 0), 'Electro Storm CS15 verified profile must force strobe off on channel 5');
expect(String(cs15Rgb?.sourceUrl || '').includes('Electro%20Storm%20CS15%20DMX%20Profile%20Specification%20V1.1.pdf'), 'Electro Storm CS15 verified DMX source missing');

const xt26 = aputure('aputure-electro-storm-xt26');
const xt26Verified = (xt26?.dmxModes || []).filter(mode => mode?.verified === true);
expect(xt26Verified.length === 1, 'Electro Storm XT26 must expose exactly one verified default DMX profile');
const xt26Cct = xt26Verified[0];
expect(xt26Cct?.name === 'Mode 1 CCT 8-bit 9ch (default extensions on)' && xt26Cct?.channels === 9, 'Electro Storm XT26 safe 9ch CCT profile missing');
const xt26Keys = new Set((xt26Cct?.controls || []).map(control => control?.key));
for (const key of ['dimmer','cct']) expect(xt26Keys.has(key), 'Electro Storm XT26 verified profile missing control: ' + key);
for (const [channel,value] of [[3,128],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0]]) {
  expect((xt26Cct?.requiredChannels || []).some(item => item?.channel === channel && item?.value === value), 'Electro Storm XT26 safe required channel missing: ' + channel);
}
expect(xt26Cct?.profileConfiguration?.motorizedAccessories === 'ON' && xt26Cct?.profileConfiguration?.functionConfiguration === 'ON', 'Electro Storm XT26 verified profile must reserve the manufacturer-default extension footprint');
expect(String(xt26Cct?.sourceUrl || '').includes('Electro%20Storm%20XT26%20DMX%20Profile%20Specification%20V1.1.pdf'), 'Electro Storm XT26 verified DMX source missing');

const s30Classic = ARRI_SKYPANEL_CLASSIC_S30_FIXTURES.find(f => f.id === 'arri-skypanel-s30-c');
expect(!!s30Classic, 'ARRI SkyPanel S30-C missing');
expect(hasAll(s30Classic?.control?.wired, ['DMX512','RDM','Ethernet']), 'SkyPanel S30-C wired standards routes missing');
expect(hasAll(s30Classic?.control?.directLightingAI, ['Art-Net 4','sACN']), 'SkyPanel S30-C native Art-Net/sACN routes missing');
const s30Verified = (s30Classic?.dmxModes || []).filter(mode => mode?.verified === true);
expect(s30Verified.length === 1, 'SkyPanel S30-C must retain exactly one verified DMX profile');
expect(s30Verified[0]?.name === 'Mode 1 CCT & RGBW 8 bit' && s30Verified[0]?.channels === 12, 'SkyPanel S30-C verified 12ch profile changed unexpectedly');

const broadcasterRoute = routingContext.window.LightingAIControlRouting.classify(broadcaster);
expect(
  broadcasterRoute?.route === 'gateway' &&
  broadcasterRoute?.nativeNetwork === false &&
  broadcasterRoute?.transportReady === true &&
  broadcasterRoute?.semanticReady === true &&
  broadcasterRoute?.verifiedDmxModeCount === 1 &&
  broadcasterRoute?.requiresInterface === true,
  'BroadCaster must route through the standards gateway via required PowerDMX interface'
);

for (const id of ['arri-skypanel-s30-rp','arri-skypanel-s60-rp']) {
  const fixture = ARRI_SKYPANEL_DISCONTINUED_FIXTURES.find(f => f.id === id);
  expect(!!fixture, 'ARRI SkyPanel RP fixture missing: ' + id);
  expect(hasAll(fixture?.control?.wired, ['DMX512','RDM','Ethernet']), 'SkyPanel RP wired standards routes missing: ' + id);
  expect(hasAll(fixture?.control?.directLightingAI, ['Art-Net 4']), 'SkyPanel RP native Art-Net route missing: ' + id);
  expect(!(fixture?.control?.directLightingAI || []).includes('sACN'), 'SkyPanel RP must not claim model-specific sACN without an explicit manufacturer source: ' + id);
  const verified = (fixture?.dmxModes || []).filter(mode => mode?.verified === true);
  expect(verified.length === 1, 'SkyPanel RP must expose exactly one verified DMX profile: ' + id);
  const mode = verified[0];
  expect(mode?.name === 'Mode 1 Dimm 8-bit 5ch · DMX v4.x' && mode?.channels === 5, 'SkyPanel RP verified 5ch Mode 1 missing: ' + id);
  expect((mode?.controls || []).some(control => control?.key === 'dimmer' && control?.channel === 1), 'SkyPanel RP dimmer channel missing: ' + id);
  for (const [channel,value] of [[2,0],[3,0],[4,0],[5,0]]) {
    expect((mode?.requiredChannels || []).some(item => item?.channel === channel && item?.value === value), 'SkyPanel RP safe required channel missing: ' + id + ' ch' + channel);
  }
  expect(mode?.profileConfiguration?.dmxProtocol === '4.x' && mode?.profileConfiguration?.firmwareMin === '4.0', 'SkyPanel RP DMX v4.x qualification missing: ' + id);
}

const broadcaster = ARRI_CASTER_SERIES_DISCONTINUED_FIXTURES.find(f => f.id === 'arri-broadcaster-2-plus');
expect(!!broadcaster, 'ARRI BroadCaster 2 Plus missing');
expect((broadcaster?.control?.wired || []).some(x => String(x).includes('DMX512')), 'BroadCaster DMX512 transport missing');
expect((broadcaster?.control?.directLightingAI || []).length === 0, 'BroadCaster must not claim native Art-Net/sACN');
expect((broadcaster?.control?.externalInterfaceRequired || []).some(x => String(x).includes('24 V / 300 W')), 'BroadCaster PowerDMX supply requirement missing');
const broadcasterVerified = (broadcaster?.dmxModes || []).filter(mode => mode?.verified === true);
expect(broadcasterVerified.length === 1, 'BroadCaster must expose exactly one verified DMX profile');
const broadcasterMode = broadcasterVerified[0];
expect(broadcasterMode?.name === 'BroadCaster PowerDMX 4ch' && broadcasterMode?.channels === 4, 'BroadCaster verified 4ch profile missing');
for (const [key,channel] of [['dimmer',1],['cct',2],['greenMagenta',3]]) {
  expect((broadcasterMode?.controls || []).some(control => control?.key === key && control?.channel === channel), 'BroadCaster control channel missing: ' + key);
}
expect((broadcasterMode?.requiredChannels || []).some(item => item?.channel === 4 && item?.value === 0), 'BroadCaster reserved fourth channel must be held at 0');
expect(String(broadcasterMode?.sourceUrl || '').includes('arri-caster-user-manual-en-apr2015'), 'BroadCaster official manual source missing');

const s60Pro = ARRI_SKYPANEL_PRO_FIXTURES.find(f => f.id === 'arri-skypanel-s60-pro');
expect(!!s60Pro, 'ARRI SkyPanel S60 Pro missing');
expect(hasAll(s60Pro?.control?.wired, ['DMX512','RDM','Ethernet']), 'SkyPanel S60 Pro wired control routes missing');
expect(hasAll(s60Pro?.control?.directLightingAI, ['Art-Net 4','sACN']), 'SkyPanel S60 Pro native Art-Net/sACN routes missing');
expect((s60Pro?.control?.wireless || []).some(x => String(x).includes('CRMX')), 'SkyPanel S60 Pro CRMX route missing');
expect(s60Pro?.dmxProfileVerification?.status === 'HOLD', 'SkyPanel S60 Pro semantic DMX profile must remain HOLD until a per-channel mode is locked');
expect(!(s60Pro?.dmxModes || []).some(mode => mode?.verified === true), 'SkyPanel S60 Pro must not expose an unverified DMX mode as verified');

const orbiter = ARRI_ORBITER_FIXTURES.find(f => f.id === 'arri-orbiter');
expect(!!orbiter, 'ARRI Orbiter missing');
expect(hasAll(orbiter?.control?.wired, ['DMX512','RDM','Ethernet']), 'ARRI Orbiter wired control routes missing');
expect(hasAll(orbiter?.control?.directLightingAI, ['Art-Net 4','sACN']), 'ARRI Orbiter native network routes missing');
expect((orbiter?.control?.wireless || []).some(x => String(x).includes('CRMX')), 'ARRI Orbiter CRMX route missing');
const orbiterVerified = (orbiter?.dmxModes || []).filter(mode => mode?.verified === true);
expect(orbiterVerified.length === 1, 'ARRI Orbiter must expose exactly one verified default DMX profile');
const orbiterCct = orbiterVerified[0];
expect(orbiterCct?.name === 'Mode 1 CCT 8-bit 6ch · ECC OFF · Operation OFF' && orbiterCct?.channels === 6, 'ARRI Orbiter verified 6ch CCT profile missing');
const orbiterKeys = new Set((orbiterCct?.controls || []).map(control => control?.key));
for (const key of ['dimmer','cct']) expect(orbiterKeys.has(key), 'ARRI Orbiter verified profile missing control: ' + key);
for (const [channel,value] of [[3,128],[4,0],[5,0],[6,0]]) {
  expect((orbiterCct?.requiredChannels || []).some(item => item?.channel === channel && item?.value === value), 'ARRI Orbiter safe required channel missing: ' + channel);
}
expect(orbiterCct?.profileConfiguration?.ecc === 'OFF' && orbiterCct?.profileConfiguration?.operation === 'OFF', 'ARRI Orbiter safe profile must require ECC OFF and Operation OFF');

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
for (const id of ['arri-skypanel-s30-rp','arri-skypanel-s60-rp']) {
  const fixture = ARRI_SKYPANEL_DISCONTINUED_FIXTURES.find(f => f.id === id);
  const route = routingContext.window.LightingAIControlRouting.classify(fixture);
  expect(
    route?.route === 'native-network' &&
    route?.nativeNetwork === true &&
    route?.transportReady === true &&
    route?.semanticReady === true &&
    route?.verifiedDmxModeCount === 1,
    'SkyPanel RP must route as production-ready native Art-Net with one verified DMX profile: ' + id
  );
}

const s30Route = routingContext.window.LightingAIControlRouting.classify(s30Classic);
expect(
  s30Route?.route === 'native-network' &&
  s30Route?.nativeNetwork === true &&
  s30Route?.transportReady === true &&
  s30Route?.semanticReady === true &&
  s30Route?.verifiedDmxModeCount === 1,
  'SkyPanel S30-C must route as production-ready native Art-Net/sACN using its existing verified DMX profile'
);

const orbiterRoute = routingContext.window.LightingAIControlRouting.classify(orbiter);
expect(
  orbiterRoute?.route === 'native-network' &&
  orbiterRoute?.nativeNetwork === true &&
  orbiterRoute?.transportReady === true &&
  orbiterRoute?.semanticReady === true &&
  orbiterRoute?.verifiedDmxModeCount === 1,
  'ARRI Orbiter must route as production-ready native Art-Net/sACN with one verified DMX profile'
);

const s60ProRoute = routingContext.window.LightingAIControlRouting.classify(s60Pro);
expect(
  s60ProRoute?.route === 'native-network' &&
  s60ProRoute?.nativeNetwork === true &&
  s60ProRoute?.transportReady === true &&
  s60ProRoute?.semanticReady === false &&
  s60ProRoute?.verifiedDmxModeCount === 0,
  'SkyPanel S60 Pro transport must be native-network while semantic control remains fail-closed on HOLD'
);

const ls600Route = routingContext.window.LightingAIControlRouting.classify(ls600d);
expect(
  ls600Route?.route === 'gateway' &&
  ls600Route?.transportReady === true &&
  ls600Route?.semanticReady === true &&
  ls600Route?.verifiedDmxModeCount === 1,
  'LS 600d must route through the standards gateway with one verified DMX profile'
);

const cs32Route = routingContext.window.LightingAIControlRouting.classify(cs32);
expect(
  cs32Route?.route === 'native-network' &&
  cs32Route?.nativeNetwork === true &&
  cs32Route?.transportReady === true &&
  cs32Route?.semanticReady === false &&
  cs32Route?.verifiedDmxModeCount === 0,
  'STORM CS32 transport must remain available but semantic control must fail closed while profile is HOLD'
);

const cs15Route = routingContext.window.LightingAIControlRouting.classify(cs15);
expect(
  cs15Route?.route === 'native-network' &&
  cs15Route?.nativeNetwork === true &&
  cs15Route?.semanticReady === true &&
  cs15Route?.verifiedDmxModeCount === 1,
  'Electro Storm CS15 must route as production-ready native Art-Net/sACN with one verified DMX profile'
);

const xt26Route = routingContext.window.LightingAIControlRouting.classify(xt26);
expect(
  xt26Route?.route === 'native-network' &&
  xt26Route?.nativeNetwork === true &&
  xt26Route?.semanticReady === true &&
  xt26Route?.verifiedDmxModeCount === 1,
  'Electro Storm XT26 must route as production-ready native Art-Net/sACN with one verified DMX profile'
);

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
