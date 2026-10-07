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
if(!aputure || aputure.fixtures!==24 || aputure.bluetooth!==24) {
  failures.push('Aputure Sidus Bluetooth verification expected 24/24 fixtures');
}
const godox=byManufacturer.get('Godox');
if(!godox || godox.bluetooth!==107) {
  failures.push('Godox Bluetooth catalog coverage expected 107 fixtures');
}
const arri=byManufacturer.get('ARRI');
if(!arri || arri.bluetooth!==7 || arri.wifi!==1 || arri.both!==1) {
  failures.push('ARRI wireless verification expected 7 Bluetooth / 1 Wi-Fi / 1 both');
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
if(!smallrig || smallrig.bluetooth!==5 || smallrig.wifi!==0 || smallrig.both!==0) {
  failures.push('SmallRig wireless coverage expected 5 Bluetooth / 0 Wi-Fi / 0 both');
}
const amaran=byManufacturer.get('amaran');
if(!amaran || amaran.bluetooth!==31 || amaran.wifi!==1 || amaran.both!==1) {
  failures.push('amaran wireless coverage expected 31 Bluetooth / 1 Wi-Fi / 1 both');
}
const neewer=byManufacturer.get('NEEWER');
if(!neewer || neewer.bluetooth!==18 || neewer.wifi!==1 || neewer.both!==1) {
  failures.push('NEEWER wireless coverage expected 18 Bluetooth / 1 Wi-Fi / 1 both');
}
const gvm=byManufacturer.get('GVM');
if(!gvm || gvm.bluetooth!==23 || gvm.wifi!==1 || gvm.both!==0) {
  failures.push('GVM wireless coverage expected 23 Bluetooth / 1 Wi-Fi / 0 both');
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
if(!zhiyun || zhiyun.bluetooth!==18 || zhiyun.wifi!==0 || zhiyun.both!==0) {
  failures.push('ZHIYUN wireless coverage expected 18 Bluetooth / 0 Wi-Fi / 0 both');
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
if(!sirui || sirui.bluetooth!==11 || sirui.wifi!==0 || sirui.both!==0) {
  failures.push('SIRUI wireless coverage expected 11 Bluetooth / 0 Wi-Fi / 0 both');
}
const fiilex=byManufacturer.get('Fiilex');
if(!fiilex || fiilex.bluetooth!==0 || fiilex.wifi!==1 || fiilex.both!==0) {
  failures.push('Fiilex wireless coverage expected 0 Bluetooth / 1 Wi-Fi / 0 both');
}
const harlowe=byManufacturer.get('Harlowe');
if(!harlowe || harlowe.bluetooth!==22 || harlowe.wifi!==0 || harlowe.both!==0) {
  failures.push('Harlowe wireless coverage expected 22 Bluetooth / 0 Wi-Fi / 0 both');
}
const swit=byManufacturer.get('SWIT');
if(!swit || swit.bluetooth!==12 || swit.wifi!==0 || swit.both!==0) {
  failures.push('SWIT wireless coverage expected 12 Bluetooth / 0 Wi-Fi / 0 both');
}
const dracast=byManufacturer.get('Dracast');
if(!dracast || dracast.bluetooth!==2 || dracast.wifi!==0 || dracast.both!==0) {
  failures.push('Dracast wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const hive=byManufacturer.get('Hive Lighting');
if(!hive || hive.bluetooth!==7 || hive.wifi!==0 || hive.both!==0) {
  failures.push('Hive Lighting wireless coverage expected 7 Bluetooth / 0 Wi-Fi / 0 both');
}
const kinotehnik=byManufacturer.get('Kinotehnik');
if(!kinotehnik || kinotehnik.bluetooth!==2 || kinotehnik.wifi!==0 || kinotehnik.both!==0) {
  failures.push('Kinotehnik wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const velvet=byManufacturer.get('VELVET');
if(!velvet || velvet.bluetooth!==4 || velvet.wifi!==6 || velvet.both!==4) {
  failures.push('VELVET wireless coverage expected 4 Bluetooth / 6 Wi-Fi / 4 both');
}
const viltrox=byManufacturer.get('VILTROX');
if(!viltrox || viltrox.bluetooth!==4 || viltrox.wifi!==0 || viltrox.both!==0) {
  failures.push('VILTROX wireless coverage expected 4 Bluetooth / 0 Wi-Fi / 0 both');
}
const phottix=byManufacturer.get('Phottix');
if(!phottix || phottix.bluetooth!==7 || phottix.wifi!==0 || phottix.both!==0) {
  failures.push('Phottix wireless coverage expected 7 Bluetooth / 0 Wi-Fi / 0 both');
}
const yongnuo=byManufacturer.get('YONGNUO');
if(!yongnuo || yongnuo.bluetooth!==12 || yongnuo.wifi!==0 || yongnuo.both!==0) {
  failures.push('YONGNUO wireless coverage expected 12 Bluetooth / 0 Wi-Fi / 0 both');
}
const pixel=byManufacturer.get('PIXEL');
if(!pixel || pixel.bluetooth!==2 || pixel.wifi!==0 || pixel.both!==0) {
  failures.push('PIXEL wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const falconEyes=byManufacturer.get('Falcon Eyes');
if(!falconEyes || falconEyes.bluetooth!==14 || falconEyes.wifi!==0 || falconEyes.both!==0) {
  failures.push('Falcon Eyes wireless coverage expected 14 Bluetooth / 0 Wi-Fi / 0 both');
}
const lishuai=byManufacturer.get('Lishuai');
if(!lishuai || lishuai.bluetooth!==4 || lishuai.wifi!==0 || lishuai.both!==0) {
  failures.push('Lishuai wireless coverage expected 4 Bluetooth / 0 Wi-Fi / 0 both');
}
const niceFoto=byManufacturer.get('NiceFoto');
if(!niceFoto || niceFoto.bluetooth!==12 || niceFoto.wifi!==0 || niceFoto.both!==0) {
  failures.push('NiceFoto wireless coverage expected 12 Bluetooth / 0 Wi-Fi / 0 both');
}
const ulanzi=byManufacturer.get('Ulanzi');
if(!ulanzi || ulanzi.bluetooth!==6 || ulanzi.wifi!==0 || ulanzi.both!==0) {
  failures.push('Ulanzi wireless coverage expected 6 Bluetooth / 0 Wi-Fi / 0 both');
}
const cameTv=byManufacturer.get('CAME-TV');
if(!cameTv || cameTv.bluetooth!==0 || cameTv.wifi!==10 || cameTv.both!==0) {
  failures.push('CAME-TV wireless coverage expected 0 Bluetooth / 10 Wi-Fi / 0 both');
}
const soonwell=byManufacturer.get('SOONWELL');
if(!soonwell || soonwell.bluetooth!==1 || soonwell.wifi!==0 || soonwell.both!==0) {
  failures.push('SOONWELL wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const tolifo=byManufacturer.get('Tolifo');
if(!tolifo || tolifo.bluetooth!==0 || tolifo.wifi!==2 || tolifo.both!==0) {
  failures.push('Tolifo wireless coverage expected 0 Bluetooth / 2 Wi-Fi / 0 both');
}
const moman=byManufacturer.get('Moman');
if(!moman || moman.bluetooth!==1 || moman.wifi!==0 || moman.both!==0) {
  failures.push('Moman wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const ikan=byManufacturer.get('Ikan');
if(!ikan || ikan.bluetooth!==1 || ikan.wifi!==0 || ikan.both!==0) {
  failures.push('Ikan wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const jinbei=byManufacturer.get('Jinbei');
if(!jinbei || jinbei.bluetooth!==12 || jinbei.wifi!==0 || jinbei.both!==0) {
  failures.push('Jinbei wireless coverage expected 12 Bluetooth / 0 Wi-Fi / 0 both');
}
const lumeCube=byManufacturer.get('Lume Cube');
if(!lumeCube || lumeCube.bluetooth!==5 || lumeCube.wifi!==0 || lumeCube.both!==0) {
  failures.push('Lume Cube wireless coverage expected 5 Bluetooth / 0 Wi-Fi / 0 both');
}
const chauvetDj=byManufacturer.get('CHAUVET DJ');
if(!chauvetDj || chauvetDj.bluetooth!==22 || chauvetDj.wifi!==0 || chauvetDj.both!==0) {
  failures.push('CHAUVET DJ wireless coverage expected 22 Bluetooth / 0 Wi-Fi / 0 both');
}
const fotodiox=byManufacturer.get('Fotodiox');
if(!fotodiox || fotodiox.bluetooth!==1 || fotodiox.wifi!==0 || fotodiox.both!==0) {
  failures.push('Fotodiox wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const broncolor=byManufacturer.get('broncolor');
if(!broncolor || broncolor.bluetooth!==0 || broncolor.wifi!==5 || broncolor.both!==0) {
  failures.push('broncolor wireless coverage expected 0 Bluetooth / 5 Wi-Fi / 0 both');
}
const genaray=byManufacturer.get('Genaray');
if(!genaray || genaray.bluetooth!==7 || genaray.wifi!==0 || genaray.both!==0) {
  failures.push('Genaray wireless coverage expected 7 Bluetooth / 0 Wi-Fi / 0 both');
}
const elgato=byManufacturer.get('Elgato');
if(!elgato || elgato.bluetooth!==0 || elgato.wifi!==6 || elgato.both!==0) {
  failures.push('Elgato wireless coverage expected 0 Bluetooth / 6 Wi-Fi / 0 both');
}
const westcott=byManufacturer.get('Westcott');
if(!westcott || westcott.bluetooth!==4 || westcott.wifi!==0 || westcott.both!==0) {
  failures.push('Westcott wireless coverage expected 4 Bluetooth / 0 Wi-Fi / 0 both');
}
const logitechG=byManufacturer.get('Logitech G');
if(!logitechG || logitechG.bluetooth!==2 || logitechG.wifi!==0 || logitechG.both!==0) {
  failures.push('Logitech G wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const rollei=byManufacturer.get('Rollei');
if(!rollei || rollei.bluetooth!==12 || rollei.wifi!==0 || rollei.both!==0) {
  failures.push('Rollei wireless coverage expected 12 Bluetooth / 0 Wi-Fi / 0 both');
}
const razer=byManufacturer.get('Razer');
if(!razer || razer.bluetooth!==0 || razer.wifi!==1 || razer.both!==0) {
  failures.push('Razer wireless coverage expected 0 Bluetooth / 1 Wi-Fi / 0 both');
}
const nanlux=byManufacturer.get('NANLUX');
if(!nanlux || nanlux.bluetooth!==6 || nanlux.wifi!==0 || nanlux.both!==0) {
  failures.push('NANLUX wireless coverage expected 6 Bluetooth / 0 Wi-Fi / 0 both');
}
const mettle=byManufacturer.get('Mettle');
if(!mettle || mettle.bluetooth!==3 || mettle.wifi!==0 || mettle.both!==0) {
  failures.push('Mettle wireless coverage expected 3 Bluetooth / 0 Wi-Fi / 0 both');
}
const pixapro=byManufacturer.get('PiXAPRO');
if(!pixapro || pixapro.bluetooth!==2 || pixapro.wifi!==0 || pixapro.both!==0) {
  failures.push('PiXAPRO wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const apeLabs=byManufacturer.get('Ape Labs');
if(!apeLabs || apeLabs.bluetooth!==8 || apeLabs.wifi!==0 || apeLabs.both!==0) {
  failures.push('Ape Labs wireless coverage expected 8 Bluetooth / 0 Wi-Fi / 0 both');
}
const pilotfly=byManufacturer.get('Pilotfly');
if(!pilotfly || pilotfly.bluetooth!==4 || pilotfly.wifi!==0 || pilotfly.both!==0) {
  failures.push('Pilotfly wireless coverage expected 4 Bluetooth / 0 Wi-Fi / 0 both');
}
const yidoblo=byManufacturer.get('Yidoblo');
if(!yidoblo || yidoblo.bluetooth!==4 || yidoblo.wifi!==0 || yidoblo.both!==0) {
  failures.push('Yidoblo wireless coverage expected 4 Bluetooth / 0 Wi-Fi / 0 both');
}
const feelworld=byManufacturer.get('FEELWORLD');
if(!feelworld || feelworld.bluetooth!==5 || feelworld.wifi!==0 || feelworld.both!==0) {
  failures.push('FEELWORLD wireless coverage expected 5 Bluetooth / 0 Wi-Fi / 0 both');
}
const sutefoto=byManufacturer.get('SUTEFOTO');
if(!sutefoto || sutefoto.bluetooth!==2 || sutefoto.wifi!==0 || sutefoto.both!==0) {
  failures.push('SUTEFOTO wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const ycOnion=byManufacturer.get('YC Onion');
if(!ycOnion || ycOnion.bluetooth!==1 || ycOnion.wifi!==0 || ycOnion.both!==0) {
  failures.push('YC Onion wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const kfConcept=byManufacturer.get('K&F Concept');
if(!kfConcept || kfConcept.bluetooth!==1 || kfConcept.wifi!==0 || kfConcept.both!==0) {
  failures.push('K&F Concept wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const profoto=byManufacturer.get('Profoto');
if(!profoto || profoto.bluetooth!==9 || profoto.wifi!==0 || profoto.both!==0) {
  failures.push('Profoto wireless coverage expected 9 Bluetooth / 0 Wi-Fi / 0 both');
}
const shehds=byManufacturer.get('SHEHDS');
if(!shehds || shehds.bluetooth!==0 || shehds.wifi!==2 || shehds.both!==0) {
  failures.push('SHEHDS wireless coverage expected 0 Bluetooth / 2 Wi-Fi / 0 both');
}
const weeylite=byManufacturer.get('Weeylite');
if(!weeylite || weeylite.bluetooth!==6 || weeylite.wifi!==0 || weeylite.both!==0) {
  failures.push('Weeylite wireless coverage expected 6 Bluetooth / 0 Wi-Fi / 0 both');
}
const imrelax=byManufacturer.get('IMRELAX');
if(!imrelax || imrelax.bluetooth!==0 || imrelax.wifi!==1 || imrelax.both!==0) {
  failures.push('IMRELAX wireless coverage expected 0 Bluetooth / 1 Wi-Fi / 0 both');
}
const kenro=byManufacturer.get('Kenro');
if(!kenro || kenro.bluetooth!==3 || kenro.wifi!==0 || kenro.both!==0) {
  failures.push('Kenro wireless coverage expected 3 Bluetooth / 0 Wi-Fi / 0 both');
}
const selens=byManufacturer.get('Selens');
if(!selens || selens.bluetooth!==2 || selens.wifi!==0 || selens.both!==0) {
  failures.push('Selens wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const fomex=byManufacturer.get('Fomex');
if(!fomex || fomex.bluetooth!==2 || fomex.wifi!==0 || fomex.both!==0) {
  failures.push('Fomex wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const bbs=byManufacturer.get('BB&S Lighting');
if(!bbs || bbs.bluetooth!==2 || bbs.wifi!==0 || bbs.both!==0) {
  failures.push('BB&S Lighting wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const sumolight=byManufacturer.get('SUMOLIGHT');
if(!sumolight || sumolight.bluetooth!==0 || sumolight.wifi!==1 || sumolight.both!==0) {
  failures.push('SUMOLIGHT wireless coverage expected 0 Bluetooth / 1 Wi-Fi / 0 both');
}
const prolights=byManufacturer.get('PROLIGHTS');
if(!prolights || prolights.bluetooth!==0 || prolights.wifi!==3 || prolights.both!==0) {
  failures.push('PROLIGHTS wireless coverage expected 0 Bluetooth / 3 Wi-Fi / 0 both');
}
const lightstar=byManufacturer.get('Lightstar Lights');
if(!lightstar || lightstar.bluetooth!==9 || lightstar.wifi!==0 || lightstar.both!==0) {
  failures.push('Lightstar Lights wireless coverage expected 9 Bluetooth / 0 Wi-Fi / 0 both');
}
const mole=byManufacturer.get('Mole-Richardson');
if(!mole || mole.bluetooth!==13 || mole.wifi!==0 || mole.both!==0) {
  failures.push('Mole-Richardson wireless coverage expected 13 Bluetooth / 0 Wi-Fi / 0 both');
}
const zolar=byManufacturer.get('ZOLAR');
if(!zolar || zolar.bluetooth!==3 || zolar.wifi!==3 || zolar.both!==3) {
  failures.push('ZOLAR wireless coverage expected 3 Bluetooth / 3 Wi-Fi / 3 both');
}
const filmgear=byManufacturer.get('Filmgear');
if(!filmgear || filmgear.bluetooth!==5 || filmgear.wifi!==0 || filmgear.both!==0) {
  failures.push('Filmgear wireless coverage expected 5 Bluetooth / 0 Wi-Fi / 0 both');
}
const rosco=byManufacturer.get('Rosco');
if(!rosco || rosco.bluetooth!==4 || rosco.wifi!==0 || rosco.both!==0) {
  failures.push('Rosco wireless coverage expected 4 Bluetooth / 0 Wi-Fi / 0 both');
}
const dedolight=byManufacturer.get('dedolight');
if(!dedolight || dedolight.bluetooth!==4 || dedolight.wifi!==0 || dedolight.both!==0) {
  failures.push('dedolight wireless coverage expected 4 Bluetooth / 0 Wi-Fi / 0 both');
}
const adj=byManufacturer.get('ADJ Lighting');
if(!adj || adj.bluetooth!==3 || adj.wifi!==0 || adj.both!==0) {
  failures.push('ADJ Lighting wireless coverage expected 3 Bluetooth / 0 Wi-Fi / 0 both');
}
const elinchrom=byManufacturer.get('Elinchrom');
if(!elinchrom || elinchrom.bluetooth!==3 || elinchrom.wifi!==0 || elinchrom.both!==0) {
  failures.push('Elinchrom wireless coverage expected 3 Bluetooth / 0 Wi-Fi / 0 both');
}
const cinelight=byManufacturer.get('CineLight');
if(!cinelight || cinelight.bluetooth!==3 || cinelight.wifi!==0 || cinelight.both!==0) {
  failures.push('CineLight wireless coverage expected 3 Bluetooth / 0 Wi-Fi / 0 both');
}
const roxx=byManufacturer.get('ROXX');
if(!roxx || roxx.bluetooth!==4 || roxx.wifi!==0 || roxx.both!==0) {
  failures.push('ROXX wireless coverage expected 4 Bluetooth / 0 Wi-Fi / 0 both');
}
const ifootage=byManufacturer.get('iFootage');
if(!ifootage || ifootage.bluetooth!==10 || ifootage.wifi!==0 || ifootage.both!==0) {
  failures.push('iFootage wireless coverage expected 10 Bluetooth / 0 Wi-Fi / 0 both');
}
const cineroid=byManufacturer.get('Cineroid');
if(!cineroid || cineroid.bluetooth!==1 || cineroid.wifi!==0 || cineroid.both!==0) {
  failures.push('Cineroid wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const sokani=byManufacturer.get('Sokani');
if(!sokani || sokani.bluetooth!==1 || sokani.wifi!==0 || sokani.both!==0) {
  failures.push('Sokani wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const fotorgear=byManufacturer.get('FotorGear');
if(!fotorgear || fotorgear.bluetooth!==1 || fotorgear.wifi!==0 || fotorgear.both!==0) {
  failures.push('FotorGear wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const bresser=byManufacturer.get('BRESSER');
if(!bresser || bresser.bluetooth!==5 || bresser.wifi!==0 || bresser.both!==0) {
  failures.push('BRESSER wireless coverage expected 5 Bluetooth / 0 Wi-Fi / 0 both');
}
const digitek=byManufacturer.get('Digitek');
if(!digitek || digitek.bluetooth!==1 || digitek.wifi!==0 || digitek.both!==0) {
  failures.push('Digitek wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const manfrotto=byManufacturer.get('Manfrotto');
if(!manfrotto || manfrotto.bluetooth!==3 || manfrotto.wifi!==0 || manfrotto.both!==0) {
  failures.push('Manfrotto wireless coverage expected 3 Bluetooth / 0 Wi-Fi / 0 both');
}
const yeelight=byManufacturer.get('Yeelight');
if(!yeelight || yeelight.bluetooth!==0 || yeelight.wifi!==2 || yeelight.both!==0) {
  failures.push('Yeelight wireless coverage expected 0 Bluetooth / 2 Wi-Fi / 0 both');
}
const twinkly=byManufacturer.get('Twinkly');
if(!twinkly || twinkly.bluetooth!==0 || twinkly.wifi!==2 || twinkly.both!==0) {
  failures.push('Twinkly wireless coverage expected 0 Bluetooth / 2 Wi-Fi / 0 both');
}
const lifx=byManufacturer.get('LIFX');
if(!lifx || lifx.bluetooth!==0 || lifx.wifi!==2 || lifx.both!==0) {
  failures.push('LIFX wireless coverage expected 0 Bluetooth / 2 Wi-Fi / 0 both');
}
const nanoleaf=byManufacturer.get('Nanoleaf');
if(!nanoleaf || nanoleaf.bluetooth!==0 || nanoleaf.wifi!==1 || nanoleaf.both!==0) {
  failures.push('Nanoleaf wireless coverage expected 0 Bluetooth / 1 Wi-Fi / 0 both');
}
const philipsHue=byManufacturer.get('Philips Hue');
if(!philipsHue || philipsHue.bluetooth!==2 || philipsHue.wifi!==0 || philipsHue.both!==0) {
  failures.push('Philips Hue wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const newell=byManufacturer.get('Newell');
if(!newell || newell.bluetooth!==2 || newell.wifi!==0 || newell.both!==0) {
  failures.push('Newell wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const govee=byManufacturer.get('Govee');
if(!govee || govee.bluetooth!==2 || govee.wifi!==2 || govee.both!==2) {
  failures.push('Govee wireless coverage expected 2 Bluetooth / 2 Wi-Fi / 2 both');
}
const visico=byManufacturer.get('VISICO');
if(!visico || visico.bluetooth!==3 || visico.wifi!==0 || visico.both!==0) {
  failures.push('VISICO wireless coverage expected 3 Bluetooth / 0 Wi-Fi / 0 both');
}
const cinepeer=byManufacturer.get('CINEPEER');
if(!cinepeer || cinepeer.bluetooth!==1 || cinepeer.wifi!==0 || cinepeer.both!==0) {
  failures.push('CINEPEER wireless coverage expected 1 Bluetooth / 0 Wi-Fi / 0 both');
}
const rayzr=byManufacturer.get('RAYZR');
if(!rayzr || rayzr.bluetooth!==0 || rayzr.wifi!==4 || rayzr.both!==0) {
  failures.push('RAYZR wireless coverage expected 0 Bluetooth / 4 Wi-Fi / 0 both');
}
const photoolex=byManufacturer.get('Photoolex');
if(!photoolex || photoolex.bluetooth!==2 || photoolex.wifi!==0 || photoolex.both!==0) {
  failures.push('Photoolex wireless coverage expected 2 Bluetooth / 0 Wi-Fi / 0 both');
}
const colorkey=byManufacturer.get('ColorKey');
if(!colorkey || colorkey.bluetooth!==0 || colorkey.wifi!==3 || colorkey.both!==0) {
  failures.push('ColorKey wireless coverage expected 0 Bluetooth / 3 Wi-Fi / 0 both');
}
const blizzard=byManufacturer.get('Blizzard Lighting');
if(!blizzard || blizzard.bluetooth!==0 || blizzard.wifi!==1 || blizzard.both!==0) {
  failures.push('Blizzard Lighting wireless coverage expected 0 Bluetooth / 1 Wi-Fi / 0 both');
}
const cineo=byManufacturer.get('Cineo');
if(!cineo || cineo.bluetooth!==0 || cineo.wifi!==2 || cineo.both!==0) {
  failures.push('Cineo wireless coverage expected 0 Bluetooth / 2 Wi-Fi / 0 both');
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
