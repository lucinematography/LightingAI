import { buildRuntimeCatalog } from './catalog-runtime.js';

const { fixtures } = buildRuntimeCatalog();
const byManufacturer = new Map();
const failures = [];

function list(value) {
  if (Array.isArray(value)) return value.flatMap(list);
  if (value == null) return [];
  if (typeof value === 'object') {
    return [
      ...list(value.directLightingAI),
      ...list(value.wireless),
      ...list(value.wired),
      ...list(value.externalInterfaceRequired)
    ];
  }
  return [String(value)];
}
function wirelessStrings(fixture) {
  const c = fixture?.control;
  if (Array.isArray(c)) return list(c);
  if (!c || typeof c !== 'object') return [];
  return [...list(c.directLightingAI), ...list(c.wireless)];
}
function isBluetooth(s) {
  s = String(s || '').toLowerCase();
  return /(^|[^a-z0-9])(bluetooth|ble)([^a-z0-9]|$)/.test(s);
}
function isWifi(s) {
  s = String(s || '').toLowerCase();
  return /(^|[^a-z0-9])wi[ -]?fi([^a-z0-9]|$)/.test(s) || /(^|[^a-z0-9])wlan([^a-z0-9]|$)/.test(s);
}
function isOtherRadio(s) {
  s = String(s || '').toLowerCase();
  return /2\.4\s*ghz|5\.8\s*ghz|\buhf\b|\brf\b|\bcrmx\b|lumenradio|wireless\s*dmx|radio\s*(control|remote)|\bmesh\b/.test(s);
}
function bucket(name) {
  if (!byManufacturer.has(name)) byManufacturer.set(name, {
    fixtures: 0,
    bluetooth: 0,
    wifi: 0,
    both: 0,
    otherRadioOnly: 0,
    noWirelessMetadata: 0,
    bluetoothSamples: [],
    wifiSamples: [],
    bothSamples: [],
    otherRadioSamples: []
  });
  return byManufacturer.get(name);
}
function sample(arr, id) {
  if (arr.length < 12) arr.push(id);
}

let bluetoothFixtures = 0;
let wifiFixtures = 0;
let bothFixtures = 0;
let otherRadioOnlyFixtures = 0;
let noWirelessMetadataFixtures = 0;

for (const fixture of fixtures) {
  const maker = fixture.manufacturer || 'Unknown';
  const b = bucket(maker);
  b.fixtures++;
  const values = wirelessStrings(fixture);
  const btEvidence = values.filter(isBluetooth);
  const wifiEvidence = values.filter(isWifi);
  const otherEvidence = values.filter(isOtherRadio);
  const bt = btEvidence.length > 0;
  const wifi = wifiEvidence.length > 0;
  const other = otherEvidence.length > 0;
  const id = fixture.id || '?';

  if (bt) {
    b.bluetooth++; bluetoothFixtures++; sample(b.bluetoothSamples, id);
  }
  if (wifi) {
    b.wifi++; wifiFixtures++; sample(b.wifiSamples, id);
  }
  if (bt && wifi) {
    b.both++; bothFixtures++; sample(b.bothSamples, id);
  }
  if (!bt && !wifi && other) {
    b.otherRadioOnly++; otherRadioOnlyFixtures++; sample(b.otherRadioSamples, id);
  }
  if (!bt && !wifi && !other) {
    b.noWirelessMetadata++; noWirelessMetadataFixtures++;
  }

  if (bt && !btEvidence.every(x => isBluetooth(x))) failures.push(id + ': Bluetooth evidence classifier mismatch');
  if (wifi && !wifiEvidence.every(x => isWifi(x))) failures.push(id + ': Wi-Fi evidence classifier mismatch');
}

const manufacturers = Object.fromEntries([...byManufacturer.entries()].sort((a,b)=>a[0].localeCompare(b[0])));
const aputure=byManufacturer.get('Aputure');
if(!aputure || aputure.fixtures!==19 || aputure.bluetooth!==19) {
  failures.push('Aputure Sidus Bluetooth verification expected 19/19 fixtures');
}
const summary = {
  ok: failures.length === 0,
  fixtures: fixtures.length,
  manufacturers: Object.keys(manufacturers).length,
  bluetoothFixtures,
  wifiFixtures,
  bothFixtures,
  otherRadioOnlyFixtures,
  noWirelessMetadataFixtures,
  failures,
  byManufacturer: manufacturers
};
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
