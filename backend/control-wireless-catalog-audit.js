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
    directBluetooth: 0,
    assistedBluetooth: 0,
    directWifi: 0,
    assistedWifi: 0,
    verifiedBluetoothEvidence: 0,
    verifiedWifiEvidence: 0,
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
let directBluetoothFixtures = 0;
let assistedBluetoothFixtures = 0;
let directWifiFixtures = 0;
let assistedWifiFixtures = 0;
let verifiedBluetoothEvidenceFixtures = 0;
let verifiedWifiEvidenceFixtures = 0;

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
  const external = list(fixture?.control?.externalInterfaceRequired);
  const bluetoothExternal = external.some(value => /bluetooth|\bble\b|bt dongle|bluetooth.*dongle|sidus link bridge/i.test(String(value)));
  const wifiExternal = external.some(value => /wi-?fi|wifi|w-2|wireless adapter/i.test(String(value)));
  const wirelessVerification = fixture?.control && typeof fixture.control === 'object' && !Array.isArray(fixture.control)
    ? fixture.control.wirelessVerification || {}
    : {};
  const verifiedBtEvidence = wirelessVerification?.bluetooth?.verified === true;
  const verifiedWifiEvidence = wirelessVerification?.wifi?.verified === true;

  if (bt) {
    b.bluetooth++; bluetoothFixtures++; sample(b.bluetoothSamples, id);
    if (bluetoothExternal) { b.assistedBluetooth++; assistedBluetoothFixtures++; }
    else { b.directBluetooth++; directBluetoothFixtures++; }
    if (verifiedBtEvidence) { b.verifiedBluetoothEvidence++; verifiedBluetoothEvidenceFixtures++; }
  }
  if (wifi) {
    b.wifi++; wifiFixtures++; sample(b.wifiSamples, id);
    if (wifiExternal) { b.assistedWifi++; assistedWifiFixtures++; }
    else { b.directWifi++; directWifiFixtures++; }
    if (verifiedWifiEvidence) { b.verifiedWifiEvidence++; verifiedWifiEvidenceFixtures++; }
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
const godox=byManufacturer.get('Godox');
if(!godox || godox.bluetooth!==68) {
  failures.push('Godox Bluetooth catalog coverage expected 68 fixtures');
}
const arri=byManufacturer.get('ARRI');
if(!arri || arri.bluetooth!==5 || arri.wifi!==1 || arri.both!==1) {
  failures.push('ARRI wireless verification expected 5 Bluetooth / 1 Wi-Fi / 1 both');
}
const aladdin=byManufacturer.get('Aladdin');
if(!aladdin || aladdin.bluetooth!==5) {
  failures.push('Aladdin Bluetooth verification expected 5 fixtures');
}
const evlight=byManufacturer.get('EV Light');
if(!evlight || evlight.bluetooth!==2 || evlight.wifi!==5 || evlight.both!==2) {
  failures.push('EV Light wireless coverage expected 2 Bluetooth / 5 Wi-Fi / 2 both');
}
const rotolight=byManufacturer.get('Rotolight');
if(!rotolight || rotolight.bluetooth!==7 || rotolight.wifi!==5 || rotolight.both!==5) {
  failures.push('Rotolight wireless coverage expected 7 Bluetooth / 5 Wi-Fi / 5 both');
}
const luxli=byManufacturer.get('Luxli');
if(!luxli || luxli.bluetooth!==7 || luxli.wifi!==0 || luxli.both!==0) {
  failures.push('Luxli wireless coverage expected 7 Bluetooth / 0 Wi-Fi / 0 both');
}
const quasar=byManufacturer.get('Quasar Science');
if(!quasar || quasar.bluetooth!==4 || quasar.wifi!==4 || quasar.both!==4) {
  failures.push('Quasar Science wireless coverage expected 4 Bluetooth / 4 Wi-Fi / 4 both');
}
const kelvin=byManufacturer.get('Kelvin');
if(!kelvin || kelvin.bluetooth!==6 || kelvin.wifi!==0 || kelvin.both!==0) {
  failures.push('Kelvin wireless coverage expected 6 Bluetooth / 0 Wi-Fi / 0 both');
}
const smallrig=byManufacturer.get('SmallRig');
if(!smallrig || smallrig.bluetooth!==4 || smallrig.wifi!==0 || smallrig.both!==0) {
  failures.push('SmallRig wireless coverage expected 4 Bluetooth / 0 Wi-Fi / 0 both');
}
const amaran=byManufacturer.get('amaran');
if(!amaran || amaran.bluetooth!==20 || amaran.wifi!==1 || amaran.both!==1) {
  failures.push('amaran wireless coverage expected 20 Bluetooth / 1 Wi-Fi / 1 both');
}
const neewer=byManufacturer.get('NEEWER');
if(!neewer || neewer.bluetooth!==4 || neewer.wifi!==0 || neewer.both!==0) {
  failures.push('NEEWER wireless coverage expected 4 Bluetooth / 0 Wi-Fi / 0 both');
}
const gvm=byManufacturer.get('GVM');
if(!gvm || gvm.bluetooth!==10 || gvm.wifi!==1 || gvm.both!==0) {
  failures.push('GVM wireless coverage expected 10 Bluetooth / 1 Wi-Fi / 0 both');
}
const litepanels=byManufacturer.get('Litepanels');
if(!litepanels || litepanels.bluetooth!==13 || litepanels.wifi!==3 || litepanels.both!==3) {
  failures.push('Litepanels wireless coverage expected 13 Bluetooth / 3 Wi-Fi / 3 both');
}
const dmg=byManufacturer.get('DMG Lumiere');
if(!dmg || dmg.bluetooth!==3 || dmg.wifi!==3 || dmg.both!==3) {
  failures.push('DMG Lumiere wireless coverage expected 3 Bluetooth / 3 Wi-Fi / 3 both');
}
const zhiyun=byManufacturer.get('ZHIYUN');
if(!zhiyun || zhiyun.bluetooth!==16 || zhiyun.wifi!==0 || zhiyun.both!==0) {
  failures.push('ZHIYUN wireless coverage expected 16 Bluetooth / 0 Wi-Fi / 0 both');
}
const prolycht=byManufacturer.get('PROLYCHT');
if(!prolycht || prolycht.bluetooth!==2 || prolycht.wifi!==2 || prolycht.both!==2) {
  failures.push('PROLYCHT wireless coverage expected 2 Bluetooth / 2 Wi-Fi / 2 both');
}
const colbor=byManufacturer.get('COLBOR');
if(!colbor || colbor.bluetooth!==2 || colbor.wifi!==0 || colbor.both!==0) {
  failures.push('COLBOR wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const sirui=byManufacturer.get('SIRUI');
if(!sirui || sirui.bluetooth!==10 || sirui.wifi!==0 || sirui.both!==0) {
  failures.push('SIRUI wireless coverage expected 10 Bluetooth / 0 Wi-Fi / 0 both');
}
const fiilex=byManufacturer.get('Fiilex');
if(!fiilex || fiilex.bluetooth!==0 || fiilex.wifi!==1 || fiilex.both!==0) {
  failures.push('Fiilex wireless coverage expected 0 Bluetooth / 1 Wi-Fi / 0 both');
}
const harlowe=byManufacturer.get('Harlowe');
if(!harlowe || harlowe.bluetooth!==11 || harlowe.wifi!==0 || harlowe.both!==0) {
  failures.push('Harlowe wireless coverage expected 11 Bluetooth / 0 Wi-Fi / 0 both');
}
const swit=byManufacturer.get('SWIT');
if(!swit || swit.bluetooth!==7 || swit.wifi!==0 || swit.both!==0) {
  failures.push('SWIT wireless coverage expected 7 Bluetooth / 0 Wi-Fi / 0 both');
}
const dracast=byManufacturer.get('Dracast');
if(!dracast || dracast.bluetooth!==2 || dracast.wifi!==0 || dracast.both!==0) {
  failures.push('Dracast wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
for (const maker of ['Kino Flo','De Sisti','LiteGear']) {
  const row=byManufacturer.get(maker);
  if(!row) failures.push(maker+' wireless audit row missing');
  else if(row.bluetooth!==0 || row.wifi!==0) failures.push(maker+' must not infer Bluetooth/Wi-Fi from DMX/CRMX/LumenRadio metadata');
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
  directBluetoothFixtures,
  assistedBluetoothFixtures,
  directWifiFixtures,
  assistedWifiFixtures,
  verifiedBluetoothEvidenceFixtures,
  verifiedWifiEvidenceFixtures,
  failures,
  byManufacturer: manufacturers
};
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
