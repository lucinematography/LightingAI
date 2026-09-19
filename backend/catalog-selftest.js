import { buildRuntimeCatalog } from './catalog-runtime.js';
import { validateCatalog } from './catalog-validation.js';
import { buildAccessoryTree, isBlockedCompatibilityStatus } from './accessory-graph.js';

const RUNTIME_CATALOG = buildRuntimeCatalog();
RUNTIME_CATALOG.fixtureById = new Map(RUNTIME_CATALOG.fixtures.map(x => [x.id, x]));
RUNTIME_CATALOG.accessoryById = new Map(RUNTIME_CATALOG.accessories.map(x => [x.id, x]));
RUNTIME_CATALOG.duplicateAccessoryIds = RUNTIME_CATALOG.integrity?.duplicateAccessoryIds || [];

const failures = [];
const report = validateCatalog(RUNTIME_CATALOG);
if (!report.ok) failures.push(...report.errors);
const fixtureIds = new Set(RUNTIME_CATALOG.fixtures.map(x => x.id));
const accessoryIds = new Set(RUNTIME_CATALOG.accessories.map(x => x.id));

for (const fixture of RUNTIME_CATALOG.fixtures) if (RUNTIME_CATALOG.fixtureById.get(fixture.id) !== fixture) failures.push(`Fixture map mismatch: ${fixture.id}`);
for (const accessory of RUNTIME_CATALOG.accessories) {
  if (RUNTIME_CATALOG.accessoryById.get(accessory.id) !== accessory) failures.push(`Accessory map mismatch: ${accessory.id}`);
  if (new Set(accessory.compatibleWith || []).size !== (accessory.compatibleWith || []).length) failures.push(`Runtime duplicate target: ${accessory.id}`);
  for (const target of accessory.compatibleWith || []) if (!fixtureIds.has(target) && !accessoryIds.has(target)) failures.push(`Unresolved target: ${accessory.id} -> ${target}`);
}
function reachesFixture(id, trail = new Set()) {if (fixtureIds.has(id)) return true;if (trail.has(id)) return false;const accessory=RUNTIME_CATALOG.accessoryById.get(id);if(!accessory)return false;const next=new Set(trail);next.add(id);return (accessory.compatibleWith||[]).some(target=>reachesFixture(target,next));}
for (const accessory of RUNTIME_CATALOG.accessories) if (!reachesFixture(accessory.id)) failures.push(`No fixture path: ${accessory.id}`);

for (const fixture of RUNTIME_CATALOG.fixtures) {
  const tree = buildAccessoryTree(fixture.id, RUNTIME_CATALOG);
  const ids = new Set();
  for (const record of tree) {
    if (ids.has(record.id)) failures.push(`Duplicate tree record: ${fixture.id} -> ${record.id}`);
    ids.add(record.id);
    const source = RUNTIME_CATALOG.accessoryById.get(record.id);
    if (!source) failures.push(`Tree references missing accessory: ${fixture.id} -> ${record.id}`);
    if (isBlockedCompatibilityStatus(source?.compatibility?.[fixture.id]?.status)) failures.push(`Blocked accessory exposed: ${fixture.id} -> ${record.id}`);
    if (record.depth < 1) failures.push(`Invalid accessory depth: ${fixture.id} -> ${record.id}`);
    if (!record.parentIds.length) failures.push(`Accessory has no resolved parent: ${fixture.id} -> ${record.id}`);
  }
}

if (RUNTIME_CATALOG.duplicateAccessoryIds.length) failures.push(`Duplicate accessory source IDs must be zero: ${RUNTIME_CATALOG.duplicateAccessoryIds.join(', ')}`);
const aputure600dPro = RUNTIME_CATALOG.fixtureById.get('aputure-ls-600d-pro');
const aputure600dMode = aputure600dPro?.dmxModes?.find((mode) => mode.name === '5ch Lighting & FX');
if (!aputure600dMode || aputure600dMode.channels !== 5 || aputure600dMode.verified !== true) failures.push('Verified LS 600d Pro 5ch DMX profile missing');
const aputure600dDimmer = aputure600dMode?.controls?.find((control) => control.key === 'dimmer');
if (!aputure600dDimmer || aputure600dDimmer.channel !== 1 || aputure600dDimmer.type !== 'percent') failures.push('Verified LS 600d Pro dimmer mapping missing');
const aputure600xPro = RUNTIME_CATALOG.fixtureById.get('aputure-ls-600x-pro');
const aputure600xModes = new Map((aputure600xPro?.dmxModes || []).map((mode) => [mode.name, mode]));
for (const [name, channels] of [['Lighting 2ch',2],['Effects 5ch',5],['Lighting & Effects 6ch',6]]) {
  const mode = aputure600xModes.get(name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified LS 600x Pro DMX mode missing: ${name}`);
  const dimmer = mode?.controls?.find((control) => control.key === 'dimmer');
  if (!dimmer || dimmer.channel !== 1 || dimmer.type !== 'percent') failures.push(`Verified LS 600x Pro dimmer mapping missing: ${name}`);
  const cct = mode?.controls?.find((control) => control.key === 'cct');
  if (!cct || cct.channel !== 2 || cct.type !== 'cct-linear' || cct.min !== 2700 || cct.max !== 6500) failures.push(`Verified LS 600x Pro CCT mapping missing: ${name}`);
}


for (const [fixtureId, label] of [['desisti-super-led-f47-t','De Sisti Super LED F4.7 T'],['desisti-super-led-f47-d','De Sisti Super LED F4.7 D']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode8 = fixture?.dmxModes?.find((item) => item.name === '8-bit dimmer');
  const mode16 = fixture?.dmxModes?.find((item) => item.name === '16-bit dimmer');
  if (!mode8 || mode8.channels !== 1 || mode8.verified !== true) failures.push(`Verified ${label} 8-bit dimmer mode missing`);
  if (!mode16 || mode16.channels !== 2 || mode16.verified !== true) failures.push(`Verified ${label} 16-bit dimmer mode missing`);
  const dimmer8 = mode8?.controls?.find((item) => item.key === 'dimmer');
  const dimmer16 = mode16?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer8 || dimmer8.channel !== 1 || dimmer8.type !== 'percent' || dimmer8.dmxMax !== 255) failures.push(`Verified ${label} 8-bit dimmer mapping missing`);
  if (!dimmer16 || dimmer16.channel !== 1 || dimmer16.type !== 'percent' || dimmer16.bits !== 16 || dimmer16.dmxMax !== 65535) failures.push(`Verified ${label} 16-bit coarse/fine dimmer mapping missing`);
}


for (const [fixtureId, label] of [['desisti-super-led-f6-t','De Sisti Super LED F6 T'],['desisti-super-led-f6-d','De Sisti Super LED F6 D']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode8 = fixture?.dmxModes?.find((item) => item.name === '8-bit dimmer');
  const mode16 = fixture?.dmxModes?.find((item) => item.name === '16-bit dimmer');
  if (!mode8 || mode8.channels !== 1 || mode8.verified !== true) failures.push(`Verified ${label} 8-bit dimmer mode missing`);
  if (!mode16 || mode16.channels !== 2 || mode16.verified !== true) failures.push(`Verified ${label} 16-bit dimmer mode missing`);
  const dimmer8 = mode8?.controls?.find((item) => item.key === 'dimmer');
  const dimmer16 = mode16?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer8 || dimmer8.channel !== 1 || dimmer8.type !== 'percent' || dimmer8.dmxMax !== 255) failures.push(`Verified ${label} 8-bit dimmer mapping missing`);
  if (!dimmer16 || dimmer16.channel !== 1 || dimmer16.type !== 'percent' || dimmer16.bits !== 16 || dimmer16.dmxMax !== 65535) failures.push(`Verified ${label} 16-bit coarse/fine dimmer mapping missing`);
}


for (const [fixtureId, label] of [['desisti-super-led-f7-t','De Sisti Super LED F7 T'],['desisti-super-led-f7-d','De Sisti Super LED F7 D']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode8 = fixture?.dmxModes?.find((item) => item.name === '8-bit dimmer');
  const mode16 = fixture?.dmxModes?.find((item) => item.name === '16-bit dimmer');
  if (!mode8 || mode8.channels !== 1 || mode8.verified !== true) failures.push(`Verified ${label} 8-bit dimmer mode missing`);
  if (!mode16 || mode16.channels !== 2 || mode16.verified !== true) failures.push(`Verified ${label} 16-bit dimmer mode missing`);
  const dimmer8 = mode8?.controls?.find((item) => item.key === 'dimmer');
  const dimmer16 = mode16?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer8 || dimmer8.channel !== 1 || dimmer8.type !== 'percent' || dimmer8.dmxMax !== 255) failures.push(`Verified ${label} 8-bit dimmer mapping missing`);
  if (!dimmer16 || dimmer16.channel !== 1 || dimmer16.type !== 'percent' || dimmer16.bits !== 16 || dimmer16.dmxMax !== 65535) failures.push(`Verified ${label} 16-bit coarse/fine dimmer mapping missing`);
}


for (const [fixtureId, label] of [['desisti-super-led-f10-t','De Sisti Super LED F10 T'],['desisti-super-led-f10-d','De Sisti Super LED F10 D']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode8 = fixture?.dmxModes?.find((item) => item.name === '8-bit dimmer');
  const mode16 = fixture?.dmxModes?.find((item) => item.name === '16-bit dimmer');
  if (!mode8 || mode8.channels !== 1 || mode8.verified !== true) failures.push(`Verified ${label} 8-bit dimmer mode missing`);
  if (!mode16 || mode16.channels !== 2 || mode16.verified !== true) failures.push(`Verified ${label} 16-bit dimmer mode missing`);
  const dimmer8 = mode8?.controls?.find((item) => item.key === 'dimmer');
  const dimmer16 = mode16?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer8 || dimmer8.channel !== 1 || dimmer8.type !== 'percent' || dimmer8.dmxMax !== 255) failures.push(`Verified ${label} 8-bit dimmer mapping missing`);
  if (!dimmer16 || dimmer16.channel !== 1 || dimmer16.type !== 'percent' || dimmer16.bits !== 16 || dimmer16.dmxMax !== 65535) failures.push(`Verified ${label} 16-bit coarse/fine dimmer mapping missing`);
}


for (const [fixtureId, label] of [['desisti-super-led-f10hp-t','De Sisti Super LED F10 HP T'],['desisti-super-led-f10hp-d','De Sisti Super LED F10 HP D']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode8 = fixture?.dmxModes?.find((item) => item.name === '8-bit dimmer');
  const mode16 = fixture?.dmxModes?.find((item) => item.name === '16-bit dimmer');
  if (!mode8 || mode8.channels !== 1 || mode8.verified !== true) failures.push(`Verified ${label} 8-bit dimmer mode missing`);
  if (!mode16 || mode16.channels !== 2 || mode16.verified !== true) failures.push(`Verified ${label} 16-bit dimmer mode missing`);
  const dimmer8 = mode8?.controls?.find((item) => item.key === 'dimmer');
  const dimmer16 = mode16?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer8 || dimmer8.channel !== 1 || dimmer8.type !== 'percent' || dimmer8.dmxMax !== 255) failures.push(`Verified ${label} 8-bit dimmer mapping missing`);
  if (!dimmer16 || dimmer16.channel !== 1 || dimmer16.type !== 'percent' || dimmer16.bits !== 16 || dimmer16.dmxMax !== 65535) failures.push(`Verified ${label} 16-bit coarse/fine dimmer mapping missing`);
}


const piccolettoVw = RUNTIME_CATALOG.fixtureById.get('desisti-piccoletto-vw');
const piccolettoVw8 = piccolettoVw?.dmxModes?.find((item) => item.name === 'Vari-White');
const piccolettoVw16 = piccolettoVw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!piccolettoVw8 || piccolettoVw8.channels !== 3 || piccolettoVw8.verified !== true) failures.push('Verified De Sisti Piccoletto VW 8-bit mode missing');
if (!piccolettoVw16 || piccolettoVw16.channels !== 4 || piccolettoVw16.verified !== true) failures.push('Verified De Sisti Piccoletto VW 16-bit mode missing');
const piccolettoVwDimmer8 = piccolettoVw8?.controls?.find((item) => item.key === 'dimmer');
const piccolettoVwDimmer16 = piccolettoVw16?.controls?.find((item) => item.key === 'dimmer');
if (!piccolettoVwDimmer8 || piccolettoVwDimmer8.channel !== 1 || piccolettoVwDimmer8.type !== 'percent' || piccolettoVwDimmer8.dmxMax !== 255) failures.push('Verified De Sisti Piccoletto VW 8-bit dimmer mapping missing');
if (!piccolettoVwDimmer16 || piccolettoVwDimmer16.channel !== 1 || piccolettoVwDimmer16.type !== 'percent' || piccolettoVwDimmer16.bits !== 16 || piccolettoVwDimmer16.dmxMax !== 65535) failures.push('Verified De Sisti Piccoletto VW 16-bit coarse/fine dimmer mapping missing');

for (const [fixtureId, label] of [['arri-l5-c-plus','ARRI L5-C Plus'],['arri-l7-c-plus','ARRI L7-C Plus']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode = fixture?.dmxModes?.find((item) => item.name === 'Mode 1 CCT & RGBW 8 bit');
  if (!mode || mode.channels !== 12 || mode.verified !== true) failures.push(`Verified ${label} Mode 1 missing`);
  for (const [key, channel, type] of [['dimmer',1,'percent'],['cct',2,'cct-linear'],['red',5,'percent'],['green',6,'percent'],['blue',7,'percent']]) {
    const control = mode?.controls?.find((item) => item.key === key);
    if (!control || control.channel !== channel || control.type !== type) failures.push(`Verified ${label} control missing: ${key}`);
  }
  const cct = mode?.controls?.find((item) => item.key === 'cct');
  if (!cct || cct.min !== 2800 || cct.max !== 10000) failures.push(`Verified ${label} CCT range missing`);
}

for (const [fixtureId, label] of [['arri-skypanel-x21','SkyPanel X21'],['arri-skypanel-x22','SkyPanel X22'],['arri-skypanel-x23','SkyPanel X23']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode = fixture?.dmxModes?.find((item) => item.name === 'Mode 1 Legacy CCT & RGBW 8 bit');
  if (!mode || mode.channels !== 12 || mode.verified !== true) failures.push(`Verified ${label} Legacy Mode 1 missing`);
  for (const [key, channel, type] of [['dimmer',1,'percent'],['cct',2,'cct-linear'],['red',5,'percent'],['green',6,'percent'],['blue',7,'percent']]) {
    const control = mode?.controls?.find((item) => item.key === key);
    if (!control || control.channel !== channel || control.type !== type) failures.push(`Verified ${label} control missing: ${key}`);
  }
  const cct = mode?.controls?.find((item) => item.key === 'cct');
  if (!cct || cct.min !== 2800 || cct.max !== 10000) failures.push(`Verified ${label} CCT range missing`);
}

for (const [fixtureId, label] of [['arri-skypanel-x21','SkyPanel X21'],['arri-skypanel-x22','SkyPanel X22'],['arri-skypanel-x23','SkyPanel X23']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode = fixture?.dmxModes?.find((item) => item.name === 'Mode 3 Standard Ultimate 20ch');
  if (!mode || mode.channels !== 20 || mode.verified !== true) failures.push(`Verified ${label} Standard Ultimate Mode 3 missing`);
  for (const [key, channel, type] of [['dimmer',1,'percent'],['cct',2,'cct-linear'],['red',6,'percent'],['green',7,'percent'],['blue',8,'percent']]) {
    const control = mode?.controls?.find((item) => item.key === key);
    if (!control || control.channel !== channel || control.type !== type) failures.push(`Verified ${label} Ultimate control missing: ${key}`);
  }
  const cct = mode?.controls?.find((item) => item.key === 'cct');
  if (!cct || cct.bits !== 16 || cct.dmxMax !== 65535 || cct.min !== 1500 || cct.max !== 20000) failures.push(`Verified ${label} Ultimate 16-bit CCT mapping missing`);
  const rgbCctMode = mode?.requiredChannels?.find((item) => item.channel === 5);
  if (!rgbCctMode || rgbCctMode.value !== 0) failures.push(`Verified ${label} Ultimate RGB & CCT mode requirement missing`);
}

for (const [fixtureId, label] of [['arri-skypanel-s30-c','SkyPanel S30-C'],['arri-skypanel-s60-c','SkyPanel S60-C'],['arri-skypanel-s120-c','SkyPanel S120-C'],['arri-skypanel-s360-c','SkyPanel S360-C']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode = fixture?.dmxModes?.find((item) => item.name === 'Mode 1 CCT & RGBW 8 bit');
  if (!mode || mode.channels !== 12 || mode.verified !== true) failures.push(`Verified ${label} Mode 1 missing`);
  for (const [key, channel, type] of [['dimmer',1,'percent'],['cct',2,'cct-linear'],['red',5,'percent'],['green',6,'percent'],['blue',7,'percent']]) {
    const control = mode?.controls?.find((item) => item.key === key);
    if (!control || control.channel !== channel || control.type !== type) failures.push(`Verified ${label} control missing: ${key}`);
  }
  const cct = mode?.controls?.find((item) => item.key === 'cct');
  if (!cct || cct.min !== 2800 || cct.max !== 10000) failures.push(`Verified ${label} CCT range missing`);
}

const titanTube = RUNTIME_CATALOG.fixtureById.get('astera-titantube-fp1');
const titanMode = titanTube?.dmxModes?.find((mode) => mode.name === 'Profile 4 DIM RGB 4ch');
if (!titanMode || titanMode.channels !== 4 || titanMode.verified !== true) failures.push('Verified TitanTube Profile 4 DIM RGB missing');
for (const [key, channel] of [['dimmer',1],['red',2],['green',3],['blue',4]]) {
  const control = titanMode?.controls?.find((item) => item.key === key);
  if (!control || control.channel !== channel || control.type !== 'percent') failures.push(`Verified TitanTube control missing: ${key}`);
}

for (const [fixtureId, label] of [['astera-ax5-triplepar','AX5 TriplePAR'],['astera-ax10-spotmax','AX10 SpotMax'],['astera-ax9-powerpar','AX9 PowerPAR'],['astera-pixelbrick-pb15','PixelBrick PB15'],['astera-heliostube-fp2-btb','HeliosTube FP2-BTB'],['astera-ax2-50-pixelbar','AX2-50 PixelBar'],['astera-ax2-100-pixelbar','AX2-100 PixelBar'],['astera-hyperiontube-fp3','HyperionTube FP3'],['astera-hydrapanel-fp6','HydraPanel FP6'],['astera-ax3-lightdrop','AX3 LightDrop'],['astera-ax7-spotlite','AX7 SpotLite']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode = fixture?.dmxModes?.find((item) => item.name === 'Profile 4 DIM RGB 4ch');
  if (!mode || mode.channels !== 4 || mode.verified !== true) failures.push(`Verified ${label} Profile 4 DIM RGB missing`);
  for (const [key, channel] of [['dimmer',1],['red',2],['green',3],['blue',4]]) {
    const control = mode?.controls?.find((item) => item.key === key);
    if (!control || control.channel !== channel || control.type !== 'percent') failures.push(`Verified ${label} control missing: ${key}`);
  }
}

for (const [fixtureId, label] of [['astera-plutofresnel-af80','PlutoFresnel AF80'],['astera-leofresnel-af250','LeoFresnel AF250']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode = fixture?.dmxModes?.find((item) => item.name === 'Profile 147 DIM RGB FAN 5ch');
  if (!mode || mode.channels !== 5 || mode.verified !== true) failures.push(`Verified ${label} Profile 147 DIM RGB FAN missing`);
  for (const [key, channel] of [['dimmer',1],['red',2],['green',3],['blue',4]]) {
    const control = mode?.controls?.find((item) => item.key === key);
    if (!control || control.channel !== channel || control.type !== 'percent') failures.push(`Verified ${label} control missing: ${key}`);
  }
}


const uniqueFailures=[...new Set(failures)];
console.log(JSON.stringify({ok:uniqueFailures.length===0,fixtures:RUNTIME_CATALOG.fixtures.length,accessories:RUNTIME_CATALOG.accessories.length,duplicateSourceDefinitions:RUNTIME_CATALOG.duplicateAccessoryIds,warnings:report.warnings.length,failures:uniqueFailures},null,2));
if(uniqueFailures.length)process.exit(1);
