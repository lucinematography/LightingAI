import { buildRuntimeCatalog } from './catalog-runtime.js';

const { fixtures } = buildRuntimeCatalog();
const failures = [];
const warnings = [];
const byManufacturer = new Map();

function textList(value) {
  if (Array.isArray(value)) return value.flatMap(textList);
  if (value == null) return [];
  if (typeof value === 'object') {
    return [
      ...textList(value.directLightingAI),
      ...textList(value.wired),
      ...textList(value.wireless),
      ...textList(value.externalInterfaceRequired),
      ...textList(value.unavailableDirectProtocols)
    ];
  }
  return [String(value)];
}
function hasAny(values, needles) {
  return values.some(v => {
    const s = v.toLowerCase();
    return needles.some(n => s.includes(n));
  });
}
function hasStandardDmxTransport(values) {
  return values.some(v => {
    const s = String(v).toLowerCase();
    if (/\b(unavailable|unsupported|not supported|not available|no dmx|without dmx)\b/.test(s)) return false;
    return /(^|[^a-z0-9])dmx(?:-?512a?|512)?([^a-z0-9]|$)/.test(s) || s.includes('crmx') || s.includes('lumenradio');
  });
}
function bucket(name) {
  if (!byManufacturer.has(name)) byManufacturer.set(name, {
    fixtures: 0, verifiedDmxFixtures: 0, verifiedModes: 0,
    nativeNetwork: 0, standardDmx: 0, rdmManagement: 0, proprietaryWirelessOnly: 0,
    noControlMetadata: 0, legacyControlArrays: 0
  });
  return byManufacturer.get(name);
}
function pushFailure(fixture, message) {
  failures.push((fixture?.id || '?') + ': ' + message);
}
function pushWarning(fixture, message) {
  warnings.push((fixture?.id || '?') + ': ' + message);
}

for (const fixture of fixtures) {
  const maker = fixture.manufacturer || 'Unknown';
  const b = bucket(maker);
  b.fixtures++;

  const legacyControlArray = Array.isArray(fixture.control);
  const control = fixture.control && typeof fixture.control === 'object' && !legacyControlArray ? fixture.control : {};
  const controlStrings = textList(fixture.control);
  const directStrings = textList(control.directLightingAI);
  const standardStrings = legacyControlArray ? controlStrings : [
    ...textList(control.directLightingAI),
    ...textList(control.wired),
    ...textList(control.wireless)
  ];
  if (legacyControlArray) b.legacyControlArrays++;
  const verifiedRoutes = Array.isArray(control.standardRoutes)
    ? control.standardRoutes.filter(r => r && r.verified === true)
    : [];
  const routeInputs = verifiedRoutes.flatMap(r => textList(r.input));
  const routeOutputs = verifiedRoutes.flatMap(r => textList(r.output));
  const nativeNetwork =
    hasAny(directStrings, ['art-net','artnet','sacn','e1.31']) ||
    hasAny(routeInputs, ['art-net','artnet','sacn','e1.31']);
  const standardDmx =
    hasStandardDmxTransport(standardStrings) ||
    hasStandardDmxTransport(routeOutputs);
  const rdmManagement =
    hasAny(standardStrings, ['rdm']) ||
    hasAny(routeOutputs, ['rdm']);
  const proprietary = hasAny(controlStrings, ['sidus','bluetooth','ble','mesh','asteraapp','uhf','wifi','wi-fi']);
  if (nativeNetwork) b.nativeNetwork++;
  if (standardDmx) b.standardDmx++;
  if (rdmManagement) b.rdmManagement++;
  if (!controlStrings.length) b.noControlMetadata++;
  if (proprietary && !nativeNetwork && !standardDmx) b.proprietaryWirelessOnly++;

  const modes = Array.isArray(fixture.dmxModes) ? fixture.dmxModes : [];
  const verified = modes.filter(m => m && m.verified === true);
  if (verified.length) b.verifiedDmxFixtures++;
  b.verifiedModes += verified.length;

  const modeNames = new Set();
  for (const mode of verified) {
    const channels = mode.channels ?? mode.channelCount;
    if (typeof channels !== 'number' || !Number.isInteger(channels) || channels < 1 || channels > 512) {
      pushFailure(fixture, 'verified DMX mode has invalid channel count: ' + String(mode.name || '?'));
      continue;
    }
    const modeName = String(mode.name || mode.label || '').trim();
    if (!modeName) pushFailure(fixture, 'verified DMX mode has no name');
    else if (modeNames.has(modeName)) pushFailure(fixture, 'duplicate verified DMX mode name: ' + modeName);
    else modeNames.add(modeName);

    if (!String(mode.sourceUrl || '').startsWith('http')) {
      pushFailure(fixture, 'verified DMX mode lacks source URL: ' + (modeName || '?'));
    }

    const controls = Array.isArray(mode.controls) ? mode.controls : [];
    const keys = new Set();
    for (const ctrl of controls) {
      if (!ctrl || !ctrl.key) {
        pushFailure(fixture, 'verified DMX control without key in ' + (modeName || '?'));
        continue;
      }
      const key = String(ctrl.key);
      if (keys.has(key)) pushFailure(fixture, 'duplicate control key ' + key + ' in ' + (modeName || '?'));
      keys.add(key);

      const ch = ctrl.channel;
      const width = ctrl.bits === 16 || (typeof ctrl.dmxMax === 'number' && ctrl.dmxMax > 255) ? 2 : 1;
      if (typeof ch !== 'number' || !Number.isInteger(ch) || ch < 1 || ch + width - 1 > channels) {
        pushFailure(fixture, 'control ' + key + ' is outside mode channel range in ' + (modeName || '?'));
      }
      if (ctrl.type === 'enum' && !Array.isArray(ctrl.choices)) {
        pushFailure(fixture, 'enum control ' + key + ' lacks choices');
      }
      if (ctrl.type === 'piecewise' && !Array.isArray(ctrl.segments)) {
        pushFailure(fixture, 'piecewise control ' + key + ' lacks segments');
      }
    }

    for (const req of (Array.isArray(mode.requiredChannels) ? mode.requiredChannels : [])) {
      const ch = req?.channel;
      const value = req?.value;
      if (typeof ch !== 'number' || !Number.isInteger(ch) || ch < 1 || ch > channels) {
        pushFailure(fixture, 'required channel is outside mode channel range in ' + (modeName || '?'));
      }
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 255) {
        pushFailure(fixture, 'required channel value invalid in ' + (modeName || '?'));
      }
    }
  }

  if (fixture.control && typeof fixture.control === 'object' && !Array.isArray(fixture.control)) {
    const routes = Array.isArray(fixture.control.standardRoutes) ? fixture.control.standardRoutes : [];
    for (const route of routes.filter(r => r && r.verified === true)) {
      if (!route.id) pushFailure(fixture, 'verified standard route missing id');
      if (!Array.isArray(route.input) || !route.input.length) pushFailure(fixture, 'verified standard route missing input');
      if (!route.interface) pushFailure(fixture, 'verified standard route missing interface');
      if (!route.output) pushFailure(fixture, 'verified standard route missing output');
      if (!String(route.sourceUrl || '').startsWith('http')) pushFailure(fixture, 'verified standard route missing source URL');
    }
    const direct = Array.isArray(fixture.control.directLightingAI) ? fixture.control.directLightingAI : [];
    if (direct.some(x => /bluetooth|\bble\b|sidus|asteraapp|uhf/i.test(String(x)))) {
      pushFailure(fixture, 'proprietary wireless protocol incorrectly marked as direct LightingAI route');
    }
  }

  if ((nativeNetwork || standardDmx) && !verified.length) {
    pushWarning(fixture, 'standard control capability exists but no verified DMX mode is available to LightingAI');
  }
  if (rdmManagement && !standardDmx && !nativeNetwork) {
    pushWarning(fixture, 'RDM management is documented but no DMX/CRMX/native-network level-control transport is documented');
  }
  if (legacyControlArray) {
    pushWarning(fixture, 'legacy control metadata array should be normalized to structured control families');
  }
}

const manufacturers = Object.fromEntries([...byManufacturer.entries()].sort((a,b)=>a[0].localeCompare(b[0])));
const summary = {
  ok: failures.length === 0,
  fixtures: fixtures.length,
  manufacturers: Object.keys(manufacturers).length,
  verifiedDmxFixtures: fixtures.filter(f => Array.isArray(f.dmxModes) && f.dmxModes.some(m => m?.verified === true)).length,
  nativeNetworkFixtures: [...byManufacturer.values()].reduce((sum,b)=>sum+b.nativeNetwork,0),
  standardDmxFixtures: [...byManufacturer.values()].reduce((sum,b)=>sum+b.standardDmx,0),
  warnings: warnings.length,
  failures,
  sampleWarnings: warnings.slice(0, 80),
  byManufacturer: manufacturers
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
