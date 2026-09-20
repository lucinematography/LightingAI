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

// Astera HeliosTube control audit: keep documented direct vs bridge control paths explicit.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-heliostube-fp2-btb');
  const control = fixture?.control || {};
  for (const item of ['CRMX','UHF','Bluetooth','Wi-Fi']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera HeliosTube wireless control path missing: ${item}`);
  }
  if (!control.builtInCRMX || !control.builtInBluetoothBridge) failures.push('Astera HeliosTube built-in CRMX/BluetoothBridge flags missing');
  for (const item of ['Art-Net via PowerBox bridge','sACN via PowerBox bridge']) {
    if (!control.wired?.includes(item) || !control.directLightingAI?.includes(item)) failures.push(`Astera HeliosTube LightingAI network bridge route missing: ${item}`);
  }
  if (!control.wired?.includes('DMX via FP1-PWB / FP3-DTL / PWB-2-86')) failures.push('Astera HeliosTube documented wired DMX interface route missing');
  if (!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Astera HeliosTube CRMX transmitter requirement missing');
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera HeliosTube public-protocol limitation note missing');
}
// Astera HydraPanel control audit: keep documented direct vs bridge control paths explicit.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-hydrapanel-fp6');
  const control = fixture?.control || {};
  for (const item of ['CRMX','UHF','Bluetooth','Wi-Fi']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera HydraPanel wireless control path missing: ${item}`);
  }
  if (!control.builtInCRMX || !control.builtInBluetoothBridge) failures.push('Astera HydraPanel built-in CRMX/BluetoothBridge flags missing');
  for (const item of ['Art-Net via PowerBox bridge','sACN via PowerBox bridge']) {
    if (!control.wired?.includes(item) || !control.directLightingAI?.includes(item)) failures.push(`Astera HydraPanel LightingAI network bridge route missing: ${item}`);
  }
  if (!control.wired?.includes('DMX via FP1-PWB / FP3-DTL / PWB-2-86')) failures.push('Astera HydraPanel documented wired DMX interface route missing');
  if (!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Astera HydraPanel CRMX transmitter requirement missing');
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera HydraPanel public-protocol limitation note missing');
}

// Astera LeoFresnel control audit: keep documented transport capabilities and LightingAI limits explicit.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-leofresnel-af250');
  const control = fixture?.control || {};
  for (const item of ['CRMX','UHF','Bluetooth','Wi-Fi']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera LeoFresnel wireless control path missing: ${item}`);
  }
  for (const item of ['DMX','RDM']) {
    if (!control.wired?.includes(item)) failures.push(`Astera LeoFresnel wired control/management path missing: ${item}`);
  }
  if (!control.builtInCRMX || !control.builtInBTB) failures.push('Astera LeoFresnel built-in CRMX/BTB flags missing');
  if (control.directLightingAI?.length) failures.push('Astera LeoFresnel must not claim direct LightingAI transport without a documented direct network/API path');
  if (!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX control')) failures.push('Astera LeoFresnel wired DMX interface requirement missing');
  if (!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Astera LeoFresnel CRMX transmitter requirement missing');
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera LeoFresnel public-protocol limitation note missing');
}

// Astera PlutoFresnel control audit: keep documented transport capabilities and LightingAI limits explicit.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-plutofresnel-af80');
  const control = fixture?.control || {};
  for (const item of ['CRMX','UHF','Bluetooth','Wi-Fi']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera PlutoFresnel wireless control path missing: ${item}`);
  }
  for (const item of ['DMX','RDM']) {
    if (!control.wired?.includes(item)) failures.push(`Astera PlutoFresnel wired control/management path missing: ${item}`);
  }
  if (!control.builtInCRMX || !control.builtInBTB) failures.push('Astera PlutoFresnel built-in CRMX/BTB flags missing');
  if (control.directLightingAI?.length) failures.push('Astera PlutoFresnel must not claim direct LightingAI transport without a documented direct network/API path');
  if (!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX control')) failures.push('Astera PlutoFresnel wired DMX interface requirement missing');
  if (!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Astera PlutoFresnel CRMX transmitter requirement missing');
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera PlutoFresnel public-protocol limitation note missing');
}

// Astera AX5 TriplePAR control audit: preserve official input-source separation.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-ax5-triplepar');
  const control = fixture?.control || {};
  if (!control.wired?.includes('5-pin XLR DMX')) failures.push('Astera AX5 wired DMX path missing');
  for (const item of ['AsteraApp','CRMX/W-DMX','ART3 DMX (legacy)']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera AX5 wireless/input path missing: ${item}`);
  }
  if (!control.builtInCRMX) failures.push('Astera AX5 built-in CRMX flag missing');
  if (control.directLightingAI?.length) failures.push('Astera AX5 must not claim direct LightingAI transport without a documented direct network/API path');
  if (!control.externalInterfaceRequired?.includes('Wired DMX interface for 5-pin XLR DMX control')) failures.push('Astera AX5 wired DMX interface requirement missing');
  if (!control.externalInterfaceRequired?.includes('CRMX/W-DMX transmitter for wireless DMX control')) failures.push('Astera AX5 CRMX/W-DMX transmitter requirement missing');
  if (!control.externalInterfaceRequired?.includes('ART3 transmitter for legacy ART3 DMX control')) failures.push('Astera AX5 ART3 transmitter requirement missing');
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera AX5 public-protocol limitation note missing');
}

// Astera AX9 PowerPAR control audit: keep confirmed transport capabilities and LightingAI limits explicit.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-ax9-powerpar');
  const control = fixture?.control || {};
  if (!control.wired?.includes('DMX')) failures.push('Astera AX9 wired DMX path missing');
  for (const item of ['AsteraApp','Wireless DMX','CRMX']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera AX9 wireless/input path missing: ${item}`);
  }
  if (!control.builtInCRMX) failures.push('Astera AX9 built-in CRMX flag missing');
  if (control.directLightingAI?.length) failures.push('Astera AX9 must not claim direct LightingAI transport without a documented direct network/API path');
  if (!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX control')) failures.push('Astera AX9 wired DMX interface requirement missing');
  if (!control.externalInterfaceRequired?.includes('CRMX/Wireless DMX transmitter for wireless DMX control')) failures.push('Astera AX9 wireless DMX transmitter requirement missing');
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera AX9 public-protocol limitation note missing');
}

// Astera AX2 PixelBar control audit: preserve documented AsteraBox/UHF and CRMX paths.
for (const fixtureId of ['astera-ax2-50-pixelbar','astera-ax2-100-pixelbar']) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const control = fixture?.control || {};
  if (!control.wired?.includes('DMX')) failures.push(`Astera AX2 wired DMX path missing: ${fixtureId}`);
  for (const item of ['AsteraApp via AsteraBox/UHF','CRMX']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera AX2 wireless/input path missing: ${fixtureId} ${item}`);
  }
  if (!control.builtInCRMX) failures.push(`Astera AX2 built-in CRMX flag missing: ${fixtureId}`);
  if (control.directLightingAI?.length) failures.push(`Astera AX2 must not claim direct LightingAI transport: ${fixtureId}`);
  for (const item of ['Wired DMX interface for DMX control','CRMX transmitter for CRMX control','AsteraBox for AsteraApp/UHF control']) {
    if (!control.externalInterfaceRequired?.includes(item)) failures.push(`Astera AX2 external interface requirement missing: ${fixtureId} ${item}`);
  }
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push(`Astera AX2 public-protocol limitation note missing: ${fixtureId}`);
}

// Astera PixelBrick PB15 control audit: preserve confirmed fixture capabilities and LightingAI limits.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-pixelbrick-pb15');
  const control = fixture?.control || {};
  if (!control.wired?.includes('DMX via PWB-2-86')) failures.push('Astera PixelBrick wired DMX path missing');
  for (const item of ['AsteraApp','CRMX','UHF','Bluetooth']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera PixelBrick wireless/input path missing: ${item}`);
  }
  if (!control.builtInCRMX || !control.builtInBluetoothBridge) failures.push('Astera PixelBrick built-in CRMX/BluetoothBridge flags missing');
  if (control.directLightingAI?.length) failures.push('Astera PixelBrick must not claim direct LightingAI transport without a documented direct network/API path');
  if (!control.externalInterfaceRequired?.includes('PWB-2-86 or compatible wired DMX interface for DMX control')) failures.push('Astera PixelBrick wired DMX interface requirement missing');
  if (!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Astera PixelBrick CRMX transmitter requirement missing');
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera PixelBrick public-protocol limitation note missing');
}

// Astera NYX Bulb control audit: preserve confirmed CRMX/Bluetooth capabilities and LightingAI limits.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-nyx-bulb');
  const control = fixture?.control || {};
  if (control.wired?.length) failures.push('Astera NYX Bulb must not claim wired control without documented fixture input');
  for (const item of ['AsteraApp','CRMX','Bluetooth']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera NYX Bulb wireless/input path missing: ${item}`);
  }
  if (!control.builtInCRMX || !control.builtInBluetooth) failures.push('Astera NYX Bulb built-in CRMX/Bluetooth flags missing');
  if (control.directLightingAI?.length) failures.push('Astera NYX Bulb must not claim direct LightingAI transport without a documented public API');
  if (!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Astera NYX Bulb CRMX transmitter requirement missing');
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera NYX Bulb public-protocol limitation note missing');
}

// Astera QuikSpot control audit: preserve confirmed QUIK control capabilities and LightingAI limits.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-quikspot');
  const control = fixture?.control || {};
  for (const item of ['DMX','RDM']) {
    if (!control.wired?.includes(item)) failures.push(`Astera QuikSpot wired control/management path missing: ${item}`);
  }
  for (const item of ['AsteraApp','CRMX','Bluetooth']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera QuikSpot wireless/input path missing: ${item}`);
  }
  if (!control.builtInCRMX || !control.builtInBTB) failures.push('Astera QuikSpot built-in CRMX/BTB flags missing');
  if (control.directLightingAI?.length) failures.push('Astera QuikSpot must not claim direct LightingAI transport without a documented public API');
  if (!control.externalInterfaceRequired?.includes('Wired DMX interface for DMX control')) failures.push('Astera QuikSpot wired DMX interface requirement missing');
  if (!control.externalInterfaceRequired?.includes('CRMX transmitter for CRMX control')) failures.push('Astera QuikSpot CRMX transmitter requirement missing');
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera QuikSpot public-protocol limitation note missing');
}

// Astera HyperionTube FP3 control audit: preserve legacy FP3 routes without inheriting HyperionBTB-only capabilities.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-hyperiontube-fp3');
  const control = fixture?.control || {};
  if (!control.wired?.includes('DMX via Titan Power/Data Combination Cable')) failures.push('Astera HyperionTube FP3 wired DMX path missing');
  for (const item of ['AsteraApp via AsteraBox/UHF','Wireless DMX','CRMX']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera HyperionTube FP3 wireless/input path missing: ${item}`);
  }
  if (!control.builtInWirelessDMX) failures.push('Astera HyperionTube FP3 built-in wireless DMX flag missing');
  if (control.builtInBluetoothBridge) failures.push('Astera HyperionTube FP3 must not inherit HyperionBTB BluetoothBridge capability');
  if (control.directLightingAI?.length) failures.push('Astera HyperionTube FP3 must not claim direct LightingAI transport without a documented public API');
  for (const item of ['Titan Power/Data Combination Cable plus wired DMX interface for DMX control','CRMX/Wireless DMX transmitter for wireless DMX control','AsteraBox for AsteraApp/UHF control']) {
    if (!control.externalInterfaceRequired?.includes(item)) failures.push(`Astera HyperionTube FP3 external interface requirement missing: ${item}`);
  }
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera HyperionTube FP3 public-protocol limitation note missing');
}

// Astera AX7 SpotLite control audit: preserve legacy wireless routes without inventing wired or direct BLE/Wi-Fi control.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-ax7-spotlite');
  const control = fixture?.control || {};
  if (control.wired?.length) failures.push('Astera AX7 SpotLite must not claim wired control without a documented fixture input');
  for (const item of ['AsteraApp via AsteraBox/UHF','CRMX','W-DMX','UHF']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera AX7 SpotLite wireless/input path missing: ${item}`);
  }
  if (!control.builtInCRMX) failures.push('Astera AX7 SpotLite built-in CRMX flag missing');
  if (control.builtInBTB) failures.push('Astera AX7 SpotLite must not claim built-in BTB');
  if (control.directLightingAI?.length) failures.push('Astera AX7 SpotLite must not claim direct LightingAI transport without a documented public API');
  for (const item of ['CRMX/W-DMX transmitter for wireless DMX control','AsteraBox for AsteraApp/UHF control']) {
    if (!control.externalInterfaceRequired?.includes(item)) failures.push(`Astera AX7 SpotLite external interface requirement missing: ${item}`);
  }
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera AX7 SpotLite public-protocol limitation note missing');
}

// Astera AX10 SpotMax control audit: preserve legacy wireless routes without inventing wired or direct BLE/Wi-Fi control.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-ax10-spotmax');
  const control = fixture?.control || {};
  if (control.wired?.length) failures.push('Astera AX10 SpotMax must not claim wired control without a documented fixture input');
  for (const item of ['AsteraApp via AsteraBox/UHF','CRMX','W-DMX','UHF']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera AX10 SpotMax wireless/input path missing: ${item}`);
  }
  if (!control.builtInCRMX) failures.push('Astera AX10 SpotMax built-in CRMX flag missing');
  if (control.builtInBTB) failures.push('Astera AX10 SpotMax must not claim built-in BTB');
  if (control.directLightingAI?.length) failures.push('Astera AX10 SpotMax must not claim direct LightingAI transport without a documented public API');
  for (const item of ['CRMX/W-DMX transmitter for wireless DMX control','AsteraBox for AsteraApp/UHF control']) {
    if (!control.externalInterfaceRequired?.includes(item)) failures.push(`Astera AX10 SpotMax external interface requirement missing: ${item}`);
  }
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera AX10 SpotMax public-protocol limitation note missing');
}

// Astera AX3 LightDrop control audit: preserve existing model capabilities and add LightingAI transport limits.
{
  const fixture = RUNTIME_CATALOG.fixtureById.get('astera-ax3-lightdrop');
  const control = fixture?.control || {};
  if (control.wired?.length) failures.push('Astera AX3 LightDrop must not claim wired control without a documented fixture input');
  for (const item of ['AsteraApp','CRMX','W-DMX','UHF','Bluetooth','WiFi']) {
    if (!control.wireless?.includes(item)) failures.push(`Astera AX3 LightDrop wireless/input path missing: ${item}`);
  }
  if (!control.builtInCRMX || !control.builtInBTB) failures.push('Astera AX3 LightDrop existing CRMX/BTB capability flags changed unexpectedly');
  if (control.directLightingAI?.length) failures.push('Astera AX3 LightDrop must not claim direct LightingAI transport without a documented public API');
  if (!control.externalInterfaceRequired?.includes('CRMX/W-DMX transmitter for wireless DMX control')) failures.push('Astera AX3 LightDrop wireless DMX transmitter requirement missing');
  if (!control.unavailableDirectProtocols?.some((item) => String(item).includes('not publicly documented'))) failures.push('Astera AX3 LightDrop public-protocol limitation note missing');
}

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



const desistiF47Vw = RUNTIME_CATALOG.fixtureById.get('desisti-super-led-f47-vw');
const desistiF47Vw8 = desistiF47Vw?.dmxModes?.find((item) => item.name === 'Vari-White');
const desistiF47Vw16 = desistiF47Vw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!desistiF47Vw8 || desistiF47Vw8.channels !== 3 || desistiF47Vw8.verified !== true) failures.push('Verified De Sisti F4.7 Vari-White 3ch 8-bit mode missing');
if (!desistiF47Vw16 || desistiF47Vw16.channels !== 4 || desistiF47Vw16.verified !== true) failures.push('Verified De Sisti F4.7 Vari-White 4ch 16-bit mode missing');
const desistiF47VwDimmer8 = desistiF47Vw8?.controls?.find((item) => item.key === 'dimmer');
const desistiF47VwDimmer16 = desistiF47Vw16?.controls?.find((item) => item.key === 'dimmer');
if (!desistiF47VwDimmer8 || desistiF47VwDimmer8.channel !== 1 || desistiF47VwDimmer8.type !== 'percent' || desistiF47VwDimmer8.dmxMax !== 255) failures.push('Verified De Sisti F4.7 Vari-White 8-bit dimmer mapping missing');
if (!desistiF47VwDimmer16 || desistiF47VwDimmer16.channel !== 1 || desistiF47VwDimmer16.type !== 'percent' || desistiF47VwDimmer16.bits !== 16 || desistiF47VwDimmer16.dmxMax !== 65535) failures.push('Verified De Sisti F4.7 Vari-White 16-bit coarse/fine dimmer mapping missing');
if (desistiF47Vw8?.controls?.some((item) => item.key === 'cct') || desistiF47Vw16?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti F4.7 Vari-White CCT controls must remain hidden until CCT Mode DMX values are sourced');


for (const [fixtureId, label] of [['desisti-piccoletto-f-t','De Sisti Piccoletto F T'],['desisti-piccoletto-f-d','De Sisti Piccoletto F D']]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode = fixture?.dmxModes?.find((item) => item.name === '8-bit dimmer');
  if (!mode || mode.channels !== 1 || mode.verified !== true) failures.push(`Verified ${label} 8-bit dimmer mode missing`);
  const dimmer = mode?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer || dimmer.channel !== 1 || dimmer.type !== 'percent' || dimmer.dmxMax !== 255) failures.push(`Verified ${label} 8-bit dimmer mapping missing`);
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

const piccolettoVwCct8 = piccolettoVw8?.controls?.find((item) => item.key === 'cct');
const piccolettoVwCct16 = piccolettoVw16?.controls?.find((item) => item.key === 'cct');
if (!piccolettoVwCct8 || piccolettoVwCct8.channel !== 2 || piccolettoVwCct8.type !== 'cct-linear' || piccolettoVwCct8.min !== 2750 || piccolettoVwCct8.max !== 6900) failures.push('Verified De Sisti Piccoletto VW 8-bit CCT mapping missing');
if (!piccolettoVwCct16 || piccolettoVwCct16.channel !== 3 || piccolettoVwCct16.type !== 'cct-linear' || piccolettoVwCct16.min !== 2750 || piccolettoVwCct16.max !== 6900) failures.push('Verified De Sisti Piccoletto VW 16-bit CCT mapping missing');
const piccolettoVwModeReq8 = piccolettoVw8?.requiredChannels?.find((item) => item.channel === 3);
const piccolettoVwModeReq16 = piccolettoVw16?.requiredChannels?.find((item) => item.channel === 4);
if (!piccolettoVwModeReq8 || piccolettoVwModeReq8.value !== 0) failures.push('Verified De Sisti Piccoletto VW 8-bit CCT linear-mode requirement missing');
if (!piccolettoVwModeReq16 || piccolettoVwModeReq16.value !== 0) failures.push('Verified De Sisti Piccoletto VW 16-bit CCT linear-mode requirement missing');



const piccolettoColor = RUNTIME_CATALOG.fixtureById.get('desisti-piccoletto-c');
const piccolettoColorMode = piccolettoColor?.dmxModes?.find((item) => item.name === 'Color');
if (!piccolettoColorMode || piccolettoColorMode.channels !== 4 || piccolettoColorMode.verified !== true) failures.push('Verified De Sisti Piccoletto Color 4ch DMX mode missing');
if (piccolettoColorMode?.sourceUrl !== 'https://www.desisti.it/wp-content/uploads/PICCOLETTO-C-1.pdf') failures.push('De Sisti Piccoletto Color DMX source mismatch');
if (piccolettoColorMode?.controls?.length || piccolettoColorMode?.requiredChannels?.length) failures.push('De Sisti Piccoletto Color channel mapping must remain hidden until sourced');


for (const [fixtureId, label] of [
  ['desisti-super-led-f14-t','De Sisti Super LED F14 T'],
  ['desisti-super-led-f14-d','De Sisti Super LED F14 D'],
  ['desisti-super-led-f14hp-t','De Sisti Super LED F14 HP T'],
  ['desisti-super-led-f14hp-d','De Sisti Super LED F14 HP D']
]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode8 = fixture?.dmxModes?.find((item) => item.name === '8-bit dimmer');
  const mode16 = fixture?.dmxModes?.find((item) => item.name === '16-bit dimmer');
  if (!mode8 || mode8.channels !== 1 || mode8.verified !== true) failures.push(`Verified ${label} 8-bit dimmer mode missing`);
  const dimmer8 = mode8?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer8 || dimmer8.channel !== 1 || dimmer8.type !== 'percent' || dimmer8.dmxMax !== 255) failures.push(`Verified ${label} 8-bit dimmer mapping missing`);
  if (!mode16 || mode16.channels !== 2 || mode16.verified !== true) failures.push(`Verified ${label} 16-bit dimmer footprint missing`);
  if (mode16?.sourceUrl !== 'https://www.desisti.it/super-led-f14/') failures.push(`${label} 16-bit dimmer source mismatch`);
  if (mode16?.controls?.length || mode16?.requiredChannels?.length) failures.push(`${label} 16-bit channel order must remain hidden until coarse/fine mapping is sourced`);
}


for (const [fixtureId, label] of [
  ['desisti-super-led-f20-t','De Sisti Super LED F20 T'],
  ['desisti-super-led-f20-d','De Sisti Super LED F20 D']
]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode8 = fixture?.dmxModes?.find((item) => item.name === '8-bit');
  const mode16 = fixture?.dmxModes?.find((item) => item.name === '16-bit');
  if (!mode8 || mode8.channels !== 1 || mode8.verified !== true) failures.push(`Verified ${label} 8-bit DMX footprint missing`);
  if (!mode16 || mode16.channels !== 2 || mode16.verified !== true) failures.push(`Verified ${label} 16-bit DMX footprint missing`);
  for (const mode of [mode8, mode16]) {
    if (mode?.sourceUrl !== 'https://www.desisti.it/wp-content/uploads/mini-catalog-2025.pdf') failures.push(`${label} DMX source mismatch: ${mode?.name || 'missing'}`);
    if (mode?.controls?.length || mode?.requiredChannels?.length) failures.push(`${label} channel mapping must remain hidden until sourced: ${mode?.name || 'missing'}`);
  }
}


const desistiF14HpVw = RUNTIME_CATALOG.fixtureById.get('desisti-super-led-f14hp-vw');
const desistiF14HpVwMode = desistiF14HpVw?.dmxModes?.find((item) => item.name === 'Vari-White');
const desistiF14HpVw16 = desistiF14HpVw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!desistiF14HpVwMode || desistiF14HpVwMode.channels !== 3 || desistiF14HpVwMode.verified !== true) failures.push('Verified De Sisti F14HP Vari-White 3ch mode missing');
if (!desistiF14HpVw16 || desistiF14HpVw16.channels !== 4 || desistiF14HpVw16.verified !== true) failures.push('Verified De Sisti F14HP Vari-White 4ch 16-bit mode missing');
if (desistiF14HpVw16?.sourceUrl !== 'https://www.desisti.it/wp-content/uploads/mini-catalog-2024-1.pdf') failures.push('De Sisti F14HP Vari-White 16-bit source mismatch');
if (desistiF14HpVw16?.controls?.length || desistiF14HpVw16?.requiredChannels?.length) failures.push('De Sisti F14HP Vari-White 16-bit channel mapping must remain hidden until sourced');
const desistiF14HpVwDimmer = desistiF14HpVwMode?.controls?.find((item) => item.key === 'dimmer');
if (!desistiF14HpVwDimmer || desistiF14HpVwDimmer.channel !== 1 || desistiF14HpVwDimmer.type !== 'percent' || desistiF14HpVwDimmer.dmxMax !== 255) failures.push('Verified De Sisti F14HP Vari-White 8-bit dimmer mapping missing');
if (desistiF14HpVwMode?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti F14HP Vari-White CCT control must remain hidden until CCT Mode DMX values are sourced');


for (const [fixtureId, label] of [
  ['desisti-softled-1-t','De Sisti Soft LED 1 T'],
  ['desisti-softled-1-d','De Sisti Soft LED 1 D'],
  ['desisti-softled-4-t','De Sisti Soft LED 4 T'],
  ['desisti-softled-4-d','De Sisti Soft LED 4 D']
]) {
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


for (const [fixtureId, label] of [
  ['desisti-softled-2-t','De Sisti Soft LED 2 T'],
  ['desisti-softled-2-d','De Sisti Soft LED 2 D']
]) {
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


for (const [fixtureId, label] of [
  ['desisti-softled-8-t','De Sisti Soft LED 8 T'],
  ['desisti-softled-8-d','De Sisti Soft LED 8 D']
]) {
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


for (const [fixtureId, label] of [
  ['desisti-softled-8xl-t','De Sisti Soft LED 8 XL T'],
  ['desisti-softled-8xl-d','De Sisti Soft LED 8 XL D']
]) {
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


for (const [fixtureId, label] of [
  ['desisti-softled-2xl-t','De Sisti Soft LED 2 XL T'],
  ['desisti-softled-2xl-d','De Sisti Soft LED 2 XL D']
]) {
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


for (const [fixtureId, label] of [
  ['desisti-softled-2-lite-t','De Sisti Soft LED 2 Lite T'],
  ['desisti-softled-2-lite-d','De Sisti Soft LED 2 Lite D']
]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode8 = fixture?.dmxModes?.find((item) => item.name === '8-bit dimmer');
  const mode16 = fixture?.dmxModes?.find((item) => item.name === '16-bit dimmer');
  if (!mode8 || mode8.channels !== 1 || mode8.verified !== true) failures.push(`Verified ${label} 8-bit dimmer mode missing`);
  const dimmer8 = mode8?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer8 || dimmer8.channel !== 1 || dimmer8.type !== 'percent' || dimmer8.dmxMax !== 255) failures.push(`Verified ${label} 8-bit dimmer mapping missing`);
  if (!mode16 || mode16.channels !== 2 || mode16.verified !== true) failures.push(`Verified ${label} 16-bit dimmer footprint missing`);
  if (mode16?.sourceUrl !== 'https://www.desisti.it/wp/wp-content/uploads/2024/02/SOFTLED-2Lite-T-D-0224.pdf') failures.push(`${label} 16-bit dimmer source mismatch`);
  if (mode16?.controls?.length || mode16?.requiredChannels?.length) failures.push(`${label} 16-bit channel order must remain hidden until coarse/fine mapping is sourced`);
}


for (const [fixtureId, label] of [
  ['desisti-f6-lite-t','De Sisti F6 Lite T'],
  ['desisti-f6-lite-d','De Sisti F6 Lite D']
]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode8 = fixture?.dmxModes?.find((item) => item.name === '8-bit dimmer');
  const mode16 = fixture?.dmxModes?.find((item) => item.name === '16-bit dimmer');
  if (!mode8 || mode8.channels !== 1 || mode8.verified !== true) failures.push(`Verified ${label} 8-bit dimmer mode missing`);
  const dimmer8 = mode8?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer8 || dimmer8.channel !== 1 || dimmer8.type !== 'percent' || dimmer8.dmxMax !== 255) failures.push(`Verified ${label} 8-bit dimmer mapping missing`);
  if (!mode16 || mode16.channels !== 2 || mode16.verified !== true) failures.push(`Verified ${label} 16-bit dimmer footprint missing`);
  if (mode16?.sourceUrl !== 'https://www.desisti.it/wp/wp-content/uploads/2026/04/FRESNEL-LED-F6-Lite-D-T-0426.pdf') failures.push(`${label} 16-bit dimmer source mismatch`);
  if (mode16?.controls?.length || mode16?.requiredChannels?.length) failures.push(`${label} 16-bit channel order must remain hidden until coarse/fine mapping is sourced`);
}


const desistiF6Vw = RUNTIME_CATALOG.fixtureById.get('desisti-super-led-f6-vw');
const desistiF6VwLegacy = desistiF6Vw?.dmxModes?.find((item) => item.name === 'Vari-White');
const desistiF6Vw16 = desistiF6Vw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!desistiF6VwLegacy || desistiF6VwLegacy.channels !== 3 || desistiF6VwLegacy.verified !== true) failures.push('Verified De Sisti F6 Vari-White 3ch mode missing');
const desistiF6VwDimmer8 = desistiF6VwLegacy?.controls?.find((item) => item.key === 'dimmer');
if (!desistiF6VwDimmer8 || desistiF6VwDimmer8.channel !== 1 || desistiF6VwDimmer8.type !== 'percent' || desistiF6VwDimmer8.dmxMax !== 255) failures.push('Verified De Sisti F6 Vari-White 8-bit dimmer mapping missing');
if (desistiF6VwLegacy?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti F6 Vari-White 8-bit CCT control must remain hidden until CCT Mode values are sourced');
if (!desistiF6Vw16 || desistiF6Vw16.channels !== 4 || desistiF6Vw16.verified !== true) failures.push('Verified De Sisti F6 Vari-White 16-bit mode missing');
const desistiF6VwDimmer16 = desistiF6Vw16?.controls?.find((item) => item.key === 'dimmer');
if (!desistiF6VwDimmer16 || desistiF6VwDimmer16.channel !== 1 || desistiF6VwDimmer16.type !== 'percent' || desistiF6VwDimmer16.bits !== 16 || desistiF6VwDimmer16.dmxMax !== 65535) failures.push('Verified De Sisti F6 Vari-White 16-bit coarse/fine dimmer mapping missing');
if (desistiF6Vw16?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti F6 Vari-White CCT control must remain hidden until CCT Mode values are sourced');


const desistiF7Vw = RUNTIME_CATALOG.fixtureById.get('desisti-super-led-f7-vw');
const desistiF7VwMode = desistiF7Vw?.dmxModes?.find((item) => item.name === 'Vari-White');
const desistiF7Vw16 = desistiF7Vw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!desistiF7VwMode || desistiF7VwMode.channels !== 3 || desistiF7VwMode.verified !== true) failures.push('Verified De Sisti F7 Vari-White 3ch mode missing');
if (!desistiF7Vw16 || desistiF7Vw16.channels !== 4 || desistiF7Vw16.verified !== true) failures.push('Verified De Sisti F7 Vari-White 4ch 16-bit mode missing');
if (desistiF7Vw16?.sourceUrl !== 'https://www.desisti.it/wp-content/uploads/mini-catalog-2024-1.pdf') failures.push('De Sisti F7 Vari-White 16-bit source mismatch');
if (desistiF7Vw16?.controls?.length || desistiF7Vw16?.requiredChannels?.length) failures.push('De Sisti F7 Vari-White 16-bit channel mapping must remain hidden until sourced');
const desistiF7VwDimmer = desistiF7VwMode?.controls?.find((item) => item.key === 'dimmer');
if (!desistiF7VwDimmer || desistiF7VwDimmer.channel !== 1 || desistiF7VwDimmer.type !== 'percent' || desistiF7VwDimmer.dmxMax !== 255) failures.push('Verified De Sisti F7 Vari-White 8-bit dimmer mapping missing');
if (desistiF7VwMode?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti F7 Vari-White CCT control must remain hidden until CCT Mode DMX values are sourced');


const desistiF7Vwc = RUNTIME_CATALOG.fixtureById.get('desisti-super-led-f7-vwc');
const desistiF7VwcExt8 = desistiF7Vwc?.dmxModes?.find((item) => item.name === 'Extended 8-bit');
const desistiF7VwcExt16 = desistiF7Vwc?.dmxModes?.find((item) => item.name === 'Extended 16-bit');
if (!desistiF7VwcExt8 || desistiF7VwcExt8.channels !== 39 || desistiF7VwcExt8.verified !== true) failures.push('Verified De Sisti F7 VW+C 39ch Extended 8-bit mode missing');
if (!desistiF7VwcExt16 || desistiF7VwcExt16.channels !== 40 || desistiF7VwcExt16.verified !== true) failures.push('Verified De Sisti F7 VW+C 40ch Extended 16-bit mode missing');
if (desistiF7VwcExt8?.controls?.length || desistiF7VwcExt16?.controls?.length) failures.push('De Sisti F7 VW+C Extended controls must remain hidden until channel order is sourced');


const desistiF10HpVw = RUNTIME_CATALOG.fixtureById.get('desisti-super-led-f10hp-vw');
const desistiF10HpVwLegacy = desistiF10HpVw?.dmxModes?.find((item) => item.name === 'Vari-White');
const desistiF10HpVw16 = desistiF10HpVw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!desistiF10HpVwLegacy || desistiF10HpVwLegacy.channels !== 3 || desistiF10HpVwLegacy.verified !== true) failures.push('Verified De Sisti F10HP Vari-White 3ch mode missing');
const desistiF10HpVwDimmer8 = desistiF10HpVwLegacy?.controls?.find((item) => item.key === 'dimmer');
if (!desistiF10HpVwDimmer8 || desistiF10HpVwDimmer8.channel !== 1 || desistiF10HpVwDimmer8.type !== 'percent' || desistiF10HpVwDimmer8.dmxMax !== 255) failures.push('Verified De Sisti F10HP Vari-White 8-bit dimmer mapping missing');
if (desistiF10HpVwLegacy?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti F10HP Vari-White 8-bit CCT control must remain hidden until CCT Mode values are sourced');
if (!desistiF10HpVw16 || desistiF10HpVw16.channels !== 4 || desistiF10HpVw16.verified !== true) failures.push('Verified De Sisti F10HP Vari-White 16-bit mode missing');
const desistiF10HpVwDimmer16 = desistiF10HpVw16?.controls?.find((item) => item.key === 'dimmer');
if (!desistiF10HpVwDimmer16 || desistiF10HpVwDimmer16.channel !== 1 || desistiF10HpVwDimmer16.type !== 'percent' || desistiF10HpVwDimmer16.bits !== 16 || desistiF10HpVwDimmer16.dmxMax !== 65535) failures.push('Verified De Sisti F10HP Vari-White 16-bit coarse/fine dimmer mapping missing');
if (desistiF10HpVw16?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti F10HP Vari-White CCT control must remain hidden until CCT Mode values are sourced');


const desistiF10Vw = RUNTIME_CATALOG.fixtureById.get('desisti-super-led-f10-vw');
const desistiF10VwLegacy = desistiF10Vw?.dmxModes?.find((item) => item.name === 'Vari-White');
const desistiF10Vw16 = desistiF10Vw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!desistiF10VwLegacy || desistiF10VwLegacy.channels !== 3 || desistiF10VwLegacy.verified !== true) failures.push('Verified De Sisti F10 Vari-White 3ch mode missing');
const desistiF10VwDimmer8 = desistiF10VwLegacy?.controls?.find((item) => item.key === 'dimmer');
if (!desistiF10VwDimmer8 || desistiF10VwDimmer8.channel !== 1 || desistiF10VwDimmer8.type !== 'percent' || desistiF10VwDimmer8.dmxMax !== 255) failures.push('Verified De Sisti F10 Vari-White 8-bit dimmer mapping missing');
if (desistiF10VwLegacy?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti F10 Vari-White 8-bit CCT control must remain hidden until CCT Mode values are sourced');
if (!desistiF10Vw16 || desistiF10Vw16.channels !== 4 || desistiF10Vw16.verified !== true) failures.push('Verified De Sisti F10 Vari-White 16-bit mode missing');
const desistiF10VwDimmer16 = desistiF10Vw16?.controls?.find((item) => item.key === 'dimmer');
if (!desistiF10VwDimmer16 || desistiF10VwDimmer16.channel !== 1 || desistiF10VwDimmer16.type !== 'percent' || desistiF10VwDimmer16.bits !== 16 || desistiF10VwDimmer16.dmxMax !== 65535) failures.push('Verified De Sisti F10 Vari-White 16-bit coarse/fine dimmer mapping missing');
if (desistiF10Vw16?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti F10 Vari-White CCT control must remain hidden until CCT Mode values are sourced');


const desistiF10Vwc = RUNTIME_CATALOG.fixtureById.get('desisti-super-led-f10-vwc');
for (const [name, channels] of [
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiF10Vwc?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti F10 VW+C ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti F10 VW+C ${name} controls must remain hidden until channel order is sourced`);
}


for (const [fixtureId, label] of [
  ['desisti-super-led-f10shp-t','De Sisti F10 SHP T'],
  ['desisti-super-led-f10shp-d','De Sisti F10 SHP D']
]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode8 = fixture?.dmxModes?.find((item) => item.name === '8-bit dimmer');
  const mode16 = fixture?.dmxModes?.find((item) => item.name === '16-bit dimmer');
  if (!mode8 || mode8.channels !== 1 || mode8.verified !== true) failures.push(`Verified ${label} 8-bit DMX footprint missing`);
  if (!mode16 || mode16.channels !== 2 || mode16.verified !== true) failures.push(`Verified ${label} 16-bit DMX footprint missing`);
  for (const mode of [mode8, mode16]) {
    if (mode?.sourceUrl !== 'https://www.desisti.it/wp-content/uploads/mini-catalog-2024-1.pdf') failures.push(`${label} DMX source mismatch: ${mode?.name || 'missing'}`);
    if (mode?.controls?.length || mode?.requiredChannels?.length) failures.push(`${label} DMX channel mapping must remain hidden until sourced: ${mode?.name || 'missing'}`);
  }
}

const desistiF10ShpVw = RUNTIME_CATALOG.fixtureById.get('desisti-super-led-f10shp-vw');
const desistiF10ShpVw8 = desistiF10ShpVw?.dmxModes?.find((item) => item.name === '8-bit Vari-White');
const desistiF10ShpVw16 = desistiF10ShpVw?.dmxModes?.find((item) => item.name === '16-bit Vari-White');
if (!desistiF10ShpVw8 || desistiF10ShpVw8.channels !== 3 || desistiF10ShpVw8.verified !== true) failures.push('Verified De Sisti F10 SHP Vari-White 3ch 8-bit mode missing');
if (!desistiF10ShpVw16 || desistiF10ShpVw16.channels !== 4 || desistiF10ShpVw16.verified !== true) failures.push('Verified De Sisti F10 SHP Vari-White 4ch 16-bit mode missing');
if (desistiF10ShpVw8?.controls?.length || desistiF10ShpVw16?.controls?.length) failures.push('De Sisti F10 SHP Vari-White controls must remain hidden until channel order is sourced');


const desistiMelpomene = RUNTIME_CATALOG.fixtureById.get('desisti-muse-melpomene');
for (const [name, channels] of [
  ['Simple 8-bit',2],
  ['Simple 16-bit',3],
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiMelpomene?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Melpomene ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Melpomene ${name} controls must remain hidden until channel order is sourced`);
}


const desistiTersicore = RUNTIME_CATALOG.fixtureById.get('desisti-muse-tersicore');
for (const [name, channels] of [
  ['Simple 8-bit',2],
  ['Simple 16-bit',3],
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiTersicore?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Tersicore ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Tersicore ${name} controls must remain hidden until channel order is sourced`);
}


const desistiClio = RUNTIME_CATALOG.fixtureById.get('desisti-muse-clio');
for (const [name, channels] of [
  ['Simple 8-bit',2],
  ['Simple 16-bit',3],
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiClio?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Clio ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Clio ${name} controls must remain hidden until channel order is sourced`);
}


const desistiClioMedium = RUNTIME_CATALOG.fixtureById.get('desisti-muse-clio-medium');
for (const [name, channels] of [
  ['Simple 8-bit',2],
  ['Simple 16-bit',3],
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiClioMedium?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Clio Medium ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Clio Medium ${name} controls must remain hidden until channel order is sourced`);
}


const desistiPolymnia = RUNTIME_CATALOG.fixtureById.get('desisti-muse-polymnia');
for (const [name, channels] of [
  ['Simple 8-bit',2],
  ['Simple 16-bit',3],
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiPolymnia?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Polymnia ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Polymnia ${name} controls must remain hidden until channel order is sourced`);
}


const desistiErato = RUNTIME_CATALOG.fixtureById.get('desisti-muse-erato');
for (const [name, channels] of [
  ['Simple 8-bit',2],
  ['Simple 16-bit',3],
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiErato?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Erato ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Erato ${name} controls must remain hidden until channel order is sourced`);
}


const desistiSoftLed4Vwc = RUNTIME_CATALOG.fixtureById.get('desisti-softled-4-vwc');
for (const [name, channels] of [
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiSoftLed4Vwc?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Soft LED 4 VW+C ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Soft LED 4 VW+C ${name} controls must remain hidden until channel order is sourced`);
}


const desistiSoftLed8Vwc = RUNTIME_CATALOG.fixtureById.get('desisti-softled-8-vwc');
for (const [name, channels] of [
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiSoftLed8Vwc?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Soft LED 8 VW+C ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Soft LED 8 VW+C ${name} controls must remain hidden until channel order is sourced`);
}


const desistiSoftLed12Vwc = RUNTIME_CATALOG.fixtureById.get('desisti-softled-12-vwc');
for (const [name, channels] of [
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit simple',12],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit simple',13],
  ['16-bit extended',40]
]) {
  const mode = desistiSoftLed12Vwc?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Soft LED 12 VW+C ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Soft LED 12 VW+C ${name} controls must remain hidden until channel order is sourced`);
}


const desistiSoftLed2XlVwc = RUNTIME_CATALOG.fixtureById.get('desisti-softled-2xl-vwc');
for (const [name, channels] of [
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiSoftLed2XlVwc?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Soft LED 2 XL VW+C ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Soft LED 2 XL VW+C ${name} controls must remain hidden until channel order is sourced`);
}


const desistiSoftLed8XlVwc = RUNTIME_CATALOG.fixtureById.get('desisti-softled-8xl-vwc');
for (const [name, channels] of [
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit extended',40]
]) {
  const mode = desistiSoftLed8XlVwc?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Soft LED 8 XL VW+C ${name} ${channels}ch mode missing`);
  if (mode?.controls?.length) failures.push(`De Sisti Soft LED 8 XL VW+C ${name} controls must remain hidden until channel order is sourced`);
}


const desistiSoftLed1XlVw = RUNTIME_CATALOG.fixtureById.get('desisti-softled-1xl-vw');
const desistiSoftLed1XlVwMode = desistiSoftLed1XlVw?.dmxModes?.find((item) => item.name === 'Vari-White');
if (!desistiSoftLed1XlVwMode || desistiSoftLed1XlVwMode.channels !== 3 || desistiSoftLed1XlVwMode.verified !== true) failures.push('Verified De Sisti Soft LED 1 XL Vari-White 3ch mode missing');
const desistiSoftLed1XlVwDimmer = desistiSoftLed1XlVwMode?.controls?.find((item) => item.key === 'dimmer');
if (!desistiSoftLed1XlVwDimmer || desistiSoftLed1XlVwDimmer.channel !== 1 || desistiSoftLed1XlVwDimmer.type !== 'percent' || desistiSoftLed1XlVwDimmer.dmxMax !== 255) failures.push('Verified De Sisti Soft LED 1 XL Vari-White 8-bit dimmer mapping missing');
if (desistiSoftLed1XlVwMode?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti Soft LED 1 XL Vari-White CCT control must remain hidden until channel behavior is fully sourced');
const desistiSoftLed1XlVw16 = desistiSoftLed1XlVw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!desistiSoftLed1XlVw16 || desistiSoftLed1XlVw16.channels !== 4 || desistiSoftLed1XlVw16.verified !== true) failures.push('Verified De Sisti Soft LED 1 XL Vari-White 4ch 16-bit mode missing');
const desistiSoftLed1XlVwDimmer16 = desistiSoftLed1XlVw16?.controls?.find((item) => item.key === 'dimmer');
if (!desistiSoftLed1XlVwDimmer16 || desistiSoftLed1XlVwDimmer16.channel !== 1 || desistiSoftLed1XlVwDimmer16.type !== 'percent' || desistiSoftLed1XlVwDimmer16.bits !== 16 || desistiSoftLed1XlVwDimmer16.dmxMax !== 65535) failures.push('Verified De Sisti Soft LED 1 XL Vari-White 16-bit coarse/fine dimmer mapping missing');
if (desistiSoftLed1XlVw16?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti Soft LED 1 XL Vari-White 16-bit CCT control must remain hidden until CCT Mode DMX values are sourced');


const desistiSoftLed4Vw = RUNTIME_CATALOG.fixtureById.get('desisti-softled-4-vw');
const desistiSoftLed4VwMode = desistiSoftLed4Vw?.dmxModes?.find((item) => item.name === 'Vari-White');
if (!desistiSoftLed4VwMode || desistiSoftLed4VwMode.channels !== 3 || desistiSoftLed4VwMode.verified !== true) failures.push('Verified De Sisti Soft LED 4 Vari-White 3ch mode missing');
const desistiSoftLed4VwDimmer = desistiSoftLed4VwMode?.controls?.find((item) => item.key === 'dimmer');
if (!desistiSoftLed4VwDimmer || desistiSoftLed4VwDimmer.channel !== 1 || desistiSoftLed4VwDimmer.type !== 'percent' || desistiSoftLed4VwDimmer.dmxMax !== 255) failures.push('Verified De Sisti Soft LED 4 Vari-White 8-bit dimmer mapping missing');
if (desistiSoftLed4VwMode?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti Soft LED 4 Vari-White CCT control must remain hidden until CCT Mode values are sourced');


const desistiSoftLed2XlVw = RUNTIME_CATALOG.fixtureById.get('desisti-softled-2xl-vw');
const desistiSoftLed2XlVwMode = desistiSoftLed2XlVw?.dmxModes?.find((item) => item.name === 'Vari-White');
if (!desistiSoftLed2XlVwMode || desistiSoftLed2XlVwMode.channels !== 3 || desistiSoftLed2XlVwMode.verified !== true) failures.push('Verified De Sisti Soft LED 2 XL Vari-White 3ch mode missing');
const desistiSoftLed2XlVwDimmer = desistiSoftLed2XlVwMode?.controls?.find((item) => item.key === 'dimmer');
if (!desistiSoftLed2XlVwDimmer || desistiSoftLed2XlVwDimmer.channel !== 1 || desistiSoftLed2XlVwDimmer.type !== 'percent' || desistiSoftLed2XlVwDimmer.dmxMax !== 255) failures.push('Verified De Sisti Soft LED 2 XL Vari-White 8-bit dimmer mapping missing');
if (desistiSoftLed2XlVwMode?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti Soft LED 2 XL Vari-White CCT control must remain hidden until CCT Mode values are sourced');
const desistiSoftLed2XlVw16 = desistiSoftLed2XlVw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!desistiSoftLed2XlVw16 || desistiSoftLed2XlVw16.channels !== 4 || desistiSoftLed2XlVw16.verified !== true) failures.push('Verified De Sisti Soft LED 2 XL Vari-White 4ch 16-bit mode missing');
const desistiSoftLed2XlVwDimmer16 = desistiSoftLed2XlVw16?.controls?.find((item) => item.key === 'dimmer');
if (!desistiSoftLed2XlVwDimmer16 || desistiSoftLed2XlVwDimmer16.channel !== 1 || desistiSoftLed2XlVwDimmer16.type !== 'percent' || desistiSoftLed2XlVwDimmer16.bits !== 16 || desistiSoftLed2XlVwDimmer16.dmxMax !== 65535) failures.push('Verified De Sisti Soft LED 2 XL Vari-White 16-bit coarse/fine dimmer mapping missing');
if (desistiSoftLed2XlVw16?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti Soft LED 2 XL Vari-White 16-bit CCT control must remain hidden until CCT Mode DMX values are sourced');


const desistiSoftLed8Vw = RUNTIME_CATALOG.fixtureById.get('desisti-softled-8-vw');
const desistiSoftLed8VwMode = desistiSoftLed8Vw?.dmxModes?.find((item) => item.name === 'Vari-White');
if (!desistiSoftLed8VwMode || desistiSoftLed8VwMode.channels !== 3 || desistiSoftLed8VwMode.verified !== true) failures.push('Verified De Sisti Soft LED 8 Vari-White 3ch mode missing');
const desistiSoftLed8VwDimmer = desistiSoftLed8VwMode?.controls?.find((item) => item.key === 'dimmer');
if (!desistiSoftLed8VwDimmer || desistiSoftLed8VwDimmer.channel !== 1 || desistiSoftLed8VwDimmer.type !== 'percent' || desistiSoftLed8VwDimmer.dmxMax !== 255) failures.push('Verified De Sisti Soft LED 8 Vari-White 8-bit dimmer mapping missing');
if (desistiSoftLed8VwMode?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti Soft LED 8 Vari-White CCT control must remain hidden until CCT Mode values are sourced');


const desistiSoftLed8XlVw = RUNTIME_CATALOG.fixtureById.get('desisti-softled-8xl-vw');
const desistiSoftLed8XlVwMode8 = desistiSoftLed8XlVw?.dmxModes?.find((item) => item.name === '8-bit dimmer');
const desistiSoftLed8XlVwMode16 = desistiSoftLed8XlVw?.dmxModes?.find((item) => item.name === '16-bit dimmer');
if (!desistiSoftLed8XlVwMode8 || desistiSoftLed8XlVwMode8.channels !== 1 || desistiSoftLed8XlVwMode8.verified !== true) failures.push('Verified De Sisti Soft LED 8 XL VW 8-bit dimmer mode missing');
if (!desistiSoftLed8XlVwMode16 || desistiSoftLed8XlVwMode16.channels !== 2 || desistiSoftLed8XlVwMode16.verified !== true) failures.push('Verified De Sisti Soft LED 8 XL VW 16-bit dimmer mode missing');
const desistiSoftLed8XlVwDimmer8 = desistiSoftLed8XlVwMode8?.controls?.find((item) => item.key === 'dimmer');
const desistiSoftLed8XlVwDimmer16 = desistiSoftLed8XlVwMode16?.controls?.find((item) => item.key === 'dimmer');
if (!desistiSoftLed8XlVwDimmer8 || desistiSoftLed8XlVwDimmer8.channel !== 1 || desistiSoftLed8XlVwDimmer8.type !== 'percent' || desistiSoftLed8XlVwDimmer8.dmxMax !== 255) failures.push('Verified De Sisti Soft LED 8 XL VW 8-bit dimmer mapping missing');
if (!desistiSoftLed8XlVwDimmer16 || desistiSoftLed8XlVwDimmer16.channel !== 1 || desistiSoftLed8XlVwDimmer16.type !== 'percent' || desistiSoftLed8XlVwDimmer16.bits !== 16 || desistiSoftLed8XlVwDimmer16.dmxMax !== 65535) failures.push('Verified De Sisti Soft LED 8 XL VW 16-bit coarse/fine dimmer mapping missing');
if (desistiSoftLed8XlVw?.dmxModes?.some((item) => item.channels === 3 || item.controls?.some((control) => control.key === 'cct'))) failures.push('De Sisti Soft LED 8 XL VW must remain dimmer-only in DMX until an official CCT DMX profile is sourced');


const desistiSpacelightVw = RUNTIME_CATALOG.fixtureById.get('desisti-spacelight-vw');
const desistiSpacelightVwMode = desistiSpacelightVw?.dmxModes?.find((item) => item.name === 'Vari-White');
if (!desistiSpacelightVwMode || desistiSpacelightVwMode.channels !== 3 || desistiSpacelightVwMode.verified !== true) failures.push('Verified De Sisti Spacelight VW 3ch mode missing');
const desistiSpacelightVwDimmer = desistiSpacelightVwMode?.controls?.find((item) => item.key === 'dimmer');
if (!desistiSpacelightVwDimmer || desistiSpacelightVwDimmer.channel !== 1 || desistiSpacelightVwDimmer.type !== 'percent' || desistiSpacelightVwDimmer.dmxMax !== 255) failures.push('Verified De Sisti Spacelight VW 8-bit dimmer mapping missing');
if (desistiSpacelightVwMode?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti Spacelight VW CCT control must remain hidden until CCT Mode DMX values are sourced');


for (const [fixtureId, label] of [
  ['desisti-softled-1-vw','De Sisti Soft LED 1 VW'],
  ['desisti-softled-2-vw','De Sisti Soft LED 2 VW']
]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode = fixture?.dmxModes?.find((item) => item.name === 'Vari-White');
  if (!mode || mode.channels !== 3 || mode.verified !== true) failures.push(`Verified ${label} 3ch mode missing`);
  const dimmer = mode?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer || dimmer.channel !== 1 || dimmer.type !== 'percent' || dimmer.dmxMax !== 255) failures.push(`Verified ${label} 8-bit dimmer mapping missing`);
  if (mode?.controls?.some((item) => item.key === 'cct')) failures.push(`${label} CCT control must remain hidden until CCT Mode DMX values are sourced`);
}
const desistiSoftLed1Vw = RUNTIME_CATALOG.fixtureById.get('desisti-softled-1-vw');
const desistiSoftLed1Vw16 = desistiSoftLed1Vw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!desistiSoftLed1Vw16 || desistiSoftLed1Vw16.channels !== 4 || desistiSoftLed1Vw16.verified !== true) failures.push('Verified De Sisti Soft LED 1 VW 4ch 16-bit mode missing');
const desistiSoftLed1VwDimmer16 = desistiSoftLed1Vw16?.controls?.find((item) => item.key === 'dimmer');
if (!desistiSoftLed1VwDimmer16 || desistiSoftLed1VwDimmer16.channel !== 1 || desistiSoftLed1VwDimmer16.type !== 'percent' || desistiSoftLed1VwDimmer16.bits !== 16 || desistiSoftLed1VwDimmer16.dmxMax !== 65535) failures.push('Verified De Sisti Soft LED 1 VW 16-bit coarse/fine dimmer mapping missing');
if (desistiSoftLed1Vw16?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti Soft LED 1 VW 16-bit CCT control must remain hidden until CCT Mode DMX values are sourced');
const desistiSoftLed2Vw = RUNTIME_CATALOG.fixtureById.get('desisti-softled-2-vw');
const desistiSoftLed2Vw16 = desistiSoftLed2Vw?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
if (!desistiSoftLed2Vw16 || desistiSoftLed2Vw16.channels !== 4 || desistiSoftLed2Vw16.verified !== true) failures.push('Verified De Sisti Soft LED 2 VW 4ch 16-bit mode missing');
const desistiSoftLed2VwDimmer16 = desistiSoftLed2Vw16?.controls?.find((item) => item.key === 'dimmer');
if (!desistiSoftLed2VwDimmer16 || desistiSoftLed2VwDimmer16.channel !== 1 || desistiSoftLed2VwDimmer16.type !== 'percent' || desistiSoftLed2VwDimmer16.bits !== 16 || desistiSoftLed2VwDimmer16.dmxMax !== 65535) failures.push('Verified De Sisti Soft LED 2 VW 16-bit coarse/fine dimmer mapping missing');
if (desistiSoftLed2Vw16?.controls?.some((item) => item.key === 'cct')) failures.push('De Sisti Soft LED 2 VW 16-bit CCT control must remain hidden until CCT Mode DMX values are sourced');


for (const [fixtureId, label] of [
  ['desisti-softled-4-vw','De Sisti Soft LED 4 VW'],
  ['desisti-softled-8-vw','De Sisti Soft LED 8 VW']
]) {
  const fixture = RUNTIME_CATALOG.fixtureById.get(fixtureId);
  const mode16 = fixture?.dmxModes?.find((item) => item.name === 'Vari-White 16-bit');
  if (!mode16 || mode16.channels !== 4 || mode16.verified !== true) failures.push(`Verified ${label} 4ch 16-bit mode missing`);
  const dimmer16 = mode16?.controls?.find((item) => item.key === 'dimmer');
  if (!dimmer16 || dimmer16.channel !== 1 || dimmer16.type !== 'percent' || dimmer16.bits !== 16 || dimmer16.dmxMax !== 65535) failures.push(`Verified ${label} 16-bit coarse/fine dimmer mapping missing`);
  if (mode16?.controls?.some((item) => item.key === 'cct')) failures.push(`${label} 16-bit CCT control must remain hidden until CCT Mode DMX values are sourced`);
}

const desistiGiottoVw = RUNTIME_CATALOG.fixtureById.get('desisti-giotto-linear-vw');
const desistiGiottoVw8 = desistiGiottoVw?.dmxModes?.find((item) => item.name === '8-bit');
const desistiGiottoVw16 = desistiGiottoVw?.dmxModes?.find((item) => item.name === '16-bit');
if (!desistiGiottoVw8 || desistiGiottoVw8.channels !== 2 || desistiGiottoVw8.verified !== true) failures.push('Verified De Sisti Giotto Linear VW 2ch 8-bit mode missing');
if (!desistiGiottoVw16 || desistiGiottoVw16.channels !== 3 || desistiGiottoVw16.verified !== true) failures.push('Verified De Sisti Giotto Linear VW 3ch 16-bit mode missing');
if (desistiGiottoVw8?.controls?.length || desistiGiottoVw16?.controls?.length) failures.push('De Sisti Giotto Linear VW controls must remain hidden until channel order is sourced');


const desistiGiottoVwc = RUNTIME_CATALOG.fixtureById.get('desisti-giotto-linear-vwc');
for (const [name, channels] of [
  ['8-bit base',7],
  ['8-bit with mode/fan',9],
  ['8-bit simple',12],
  ['8-bit extended',39],
  ['16-bit base',8],
  ['16-bit with mode/fan',10],
  ['16-bit simple',13],
  ['16-bit extended',40]
]) {
  const mode = desistiGiottoVwc?.dmxModes?.find((item) => item.name === name);
  if (!mode || mode.channels !== channels || mode.verified !== true) failures.push(`Verified De Sisti Giotto Linear VW+C mode missing: ${name}`);
  if (mode?.controls?.length) failures.push(`De Sisti Giotto Linear VW+C controls must remain hidden until channel map is sourced: ${name}`);
}


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



// Kino Flo Celeb 250/450/450Q/850 True Match 5.0 DMX personality widths.
const kinoCelebTrueMatch5Source='https://kinoflo.com/wp-content/uploads/2022/07/True-Match-Firmware-5.0-RDM-DMX-Personalities-May-2021.pdf';
const kinoCelebTrueMatch5Widths=[
  ['P1 CCT 8-bit',3],
  ['P2 GEL 8-bit',6],
  ['P3 RGB 8-bit',6],
  ['P4 FX 8-bit',8],
  ['P5 CIE xy 8-bit',3],
  ['P6 CCT 16-bit',4],
  ['P7 GEL 16-bit',7],
  ['P8 RGB 16-bit',7],
  ['P9 FX 16-bit',9],
  ['P10 CIE xy 16-bit',4],
  ['P11 CCT 8-bit',3],
  ['P12 CCT 16-bit',5],
  ['P13 Gel 8-bit',3],
  ['P14 Gel 16-bit',5],
  ['P15 HS 8-bit',4],
  ['P16 HS 16-bit',8],
  ['P17 RGB 8-bit',5],
  ['P18 RGB 16-bit',10],
  ['P19 CIE xy 8-bit',3],
  ['P20 CIE xy 16-bit',6],
  ['P21 FX 8-bit',8],
  ['P22 FX 16-bit',10],
  ['P23 CCT & HS 8-bit',7],
  ['P24 CCT & HS 16-bit',13],
  ['P25 CCT & RGB 8-bit',8],
  ['P26 CCT & RGB 16-bit',15],
  ['P27 xy1 & xy2 8-bit',6],
  ['P28 xy1 & xy2 16-bit',12],
  ['P29 CCT & TDRGB 8-bit',9],
  ['P30 CCT & TDRGB 16-bit',15]
];
for(const id of ["kinoflo-celeb-250-led-dmx","kinoflo-celeb-450-led-dmx","kinoflo-celeb-450q-led-dmx","kinoflo-celeb-850-led-dmx"]){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==kinoCelebTrueMatch5Widths.length){
    failures.push('Kino Flo Celeb True Match 5.0 DMX mode set missing: '+id);
    continue;
  }
  for(const [name,channels] of kinoCelebTrueMatch5Widths){
    const mode=fixture.dmxModes.find(item=>item?.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==kinoCelebTrueMatch5Source){
      failures.push('Verified Kino Flo Celeb DMX width/source missing: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo Celeb channel mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Kino Flo Diva-Lite 20/30/21/31/41 True Match 5.0 DMX personality widths.
const kinoDivaTrueMatch5Source='https://kinoflo.com/wp-content/uploads/2022/07/True-Match-Firmware-5.0-RDM-DMX-Personalities-May-2021.pdf';
const kinoDivaTrueMatch5Widths=[
  ['P1 CCT 8-bit',3],
  ['P2 GEL 8-bit',6],
  ['P3 RGB 8-bit',6],
  ['P4 FX 8-bit',8],
  ['P5 CIE xy 8-bit',3],
  ['P6 CCT 16-bit',4],
  ['P7 GEL 16-bit',7],
  ['P8 RGB 16-bit',7],
  ['P9 FX 16-bit',9],
  ['P10 CIE xy 16-bit',4],
  ['P11 CCT 8-bit',3],
  ['P12 CCT 16-bit',5],
  ['P13 Gel 8-bit',3],
  ['P14 Gel 16-bit',5],
  ['P15 HS 8-bit',4],
  ['P16 HS 16-bit',8],
  ['P17 RGB 8-bit',5],
  ['P18 RGB 16-bit',10],
  ['P19 CIE xy 8-bit',3],
  ['P20 CIE xy 16-bit',6],
  ['P21 FX 8-bit',8],
  ['P22 FX 16-bit',10],
  ['P23 CCT & HS 8-bit',7],
  ['P24 CCT & HS 16-bit',13],
  ['P25 CCT & RGB 8-bit',8],
  ['P26 CCT & RGB 16-bit',15],
  ['P27 xy1 & xy2 8-bit',6],
  ['P28 xy1 & xy2 16-bit',12],
  ['P29 CCT & TDRGB 8-bit',9],
  ['P30 CCT & TDRGB 16-bit',15]
];
for(const id of ["kinoflo-diva-lite-20-led","kinoflo-diva-lite-30-led","kinoflo-diva-lite-21-led","kinoflo-diva-lite-31-led","kinoflo-diva-lite-41-led"]){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==kinoDivaTrueMatch5Widths.length){
    failures.push('Kino Flo Diva-Lite True Match 5.0 DMX mode set missing: '+id);
    continue;
  }
  for(const [name,channels] of kinoDivaTrueMatch5Widths){
    const mode=fixture.dmxModes.find(item=>item?.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==kinoDivaTrueMatch5Source){
      failures.push('Verified Kino Flo Diva-Lite DMX width/source missing: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo Diva-Lite channel mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Kino Flo Image L40/L80 True Match 5.0 DMX personality widths.
const kinoImageTrueMatch5Source='https://kinoflo.com/wp-content/uploads/2022/07/True-Match-Firmware-5.0-RDM-DMX-Personalities-May-2021.pdf';
const kinoImageTrueMatch5Widths=[
  ['P1 CCT 8-bit',3],
  ['P2 GEL 8-bit',6],
  ['P3 RGB 8-bit',6],
  ['P4 FX 8-bit',8],
  ['P5 CIE xy 8-bit',3],
  ['P6 CCT 16-bit',4],
  ['P7 GEL 16-bit',7],
  ['P8 RGB 16-bit',7],
  ['P9 FX 16-bit',9],
  ['P10 CIE xy 16-bit',4],
  ['P11 CCT 8-bit',3],
  ['P12 CCT 16-bit',5],
  ['P13 Gel 8-bit',3],
  ['P14 Gel 16-bit',5],
  ['P15 HS 8-bit',4],
  ['P16 HS 16-bit',8],
  ['P17 RGB 8-bit',5],
  ['P18 RGB 16-bit',10],
  ['P19 CIE xy 8-bit',3],
  ['P20 CIE xy 16-bit',6],
  ['P21 FX 8-bit',8],
  ['P22 FX 16-bit',10],
  ['P23 CCT & HS 8-bit',7],
  ['P24 CCT & HS 16-bit',13],
  ['P25 CCT & RGB 8-bit',8],
  ['P26 CCT & RGB 16-bit',15],
  ['P27 xy1 & xy2 8-bit',6],
  ['P28 xy1 & xy2 16-bit',12],
  ['P29 CCT & TDRGB 8-bit',9],
  ['P30 CCT & TDRGB 16-bit',15]
];
for(const id of ["kinoflo-image-l40-led","kinoflo-image-l80-led"]){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==kinoImageTrueMatch5Widths.length){
    failures.push('Kino Flo Image LED True Match 5.0 DMX mode set missing: '+id);
    continue;
  }
  for(const [name,channels] of kinoImageTrueMatch5Widths){
    const mode=fixture.dmxModes.find(item=>item?.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==kinoImageTrueMatch5Source){
      failures.push('Verified Kino Flo Image LED DMX width/source missing: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo Image LED channel mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Kino Flo Select LED 20/30 via LED-150X controller, True Match 6.0 DFS.
const kinoSelectTm6Source='https://kinoflo.com/wp-content/uploads/2025/07/TrueMatch-Firmware-6.0-RDM-DMX-Personalities-June-2025-Rev-E.pdf';
const kinoSelectTm6Manual='https://kinoflo.com/wp-content/uploads/2022/08/3100088-Rev-A-Select-150X-LED-Controller-04-07-2016-1.pdf';
const kinoSelectTm6Widths=[
  ['TM6 P1 CCT 8-bit',3],
  ['TM6 P2 CCT/Gel/HS 8-bit',6],
  ['TM6 P3 CCT/RGB 8-bit',6],
  ['TM6 P4 CCT 8-bit',3],
  ['TM6 P5 CIE xy 8-bit',3],
  ['TM6 P6 CCT 16-bit',4],
  ['TM6 P7 CCT/Gel/HS 16-bit',7],
  ['TM6 P8 CCT/RGB 16-bit',7],
  ['TM6 P9 CCT 16-bit',4],
  ['TM6 P10 CIE xy 16-bit',4],
  ['TM6 P11 CCT 8-bit',3],
  ['TM6 P12 CCT 16-bit',5],
  ['TM6 P13 Gel 8-bit',3],
  ['TM6 P14 Gel 16-bit',5],
  ['TM6 P15 HS 8-bit',4],
  ['TM6 P16 HS 16-bit',8],
  ['TM6 P17 RGB 8-bit',5],
  ['TM6 P18 RGB 16-bit',10],
  ['TM6 P19 CIE xy 8-bit',3],
  ['TM6 P20 CIE xy 16-bit',6],
  ['TM6 P21 CCT 8-bit',3],
  ['TM6 P22 CCT 16-bit',5],
  ['TM6 P23 xfade CCT & HS 8-bit',7],
  ['TM6 P24 xfade CCT & HS 16-bit',13],
  ['TM6 P25 xfade CCT & RGB 8-bit',8],
  ['TM6 P26 xfade CCT & RGB 16-bit',15],
  ['TM6 P27 xfade CIE xy1 & xy2 8-bit',6],
  ['TM6 P28 xfade CIE xy1 & xy2 16-bit',12],
  ['TM6 P29 xfade CCT & TDRGB 8-bit',9],
  ['TM6 P30 xfade CCT & TDRGB 16-bit',15]
];
for(const id of ["kinoflo-select-led-20","kinoflo-select-led-30"]){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  if(!fixture||fixture.dmxControllerModel!=='LED-150X'||fixture.dmxFirmware!=='True Match 6.0 DFS'||
     fixture.dmxApplicabilitySourceUrl!==kinoSelectTm6Manual||!Array.isArray(fixture.dmxModes)||
     fixture.dmxModes.length!==kinoSelectTm6Widths.length){
    failures.push('Kino Flo Select True Match 6.0 DMX mode set missing: '+id);
    continue;
  }
  for(const [name,channels] of kinoSelectTm6Widths){
    const mode=fixture.dmxModes.find(item=>item?.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==kinoSelectTm6Source){
      failures.push('Verified Kino Flo Select TM6 DMX width/source missing: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo Select TM6 channel mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Kino Flo FreeStyle Air Mini/Air/Max via LED-140X, True Match 6.0 DFS.
const kinoFreeStyleAirTm6Source='https://kinoflo.com/wp-content/uploads/2025/07/TrueMatch-Firmware-6.0-RDM-DMX-Personalities-June-2025-Rev-E.pdf';
const kinoFreeStyleAirTm6Widths=[
  ['TM6 P1 CCT 8-bit',3],
  ['TM6 P2 CCT/Gel/HS 8-bit',6],
  ['TM6 P3 CCT/RGB 8-bit',6],
  ['TM6 P4 CCT 8-bit',3],
  ['TM6 P5 CIE xy 8-bit',3],
  ['TM6 P6 CCT 16-bit',4],
  ['TM6 P7 CCT/Gel/HS 16-bit',7],
  ['TM6 P8 CCT/RGB 16-bit',7],
  ['TM6 P9 CCT 16-bit',4],
  ['TM6 P10 CIE xy 16-bit',4],
  ['TM6 P11 CCT 8-bit',3],
  ['TM6 P12 CCT 16-bit',5],
  ['TM6 P13 Gel 8-bit',3],
  ['TM6 P14 Gel 16-bit',5],
  ['TM6 P15 HS 8-bit',4],
  ['TM6 P16 HS 16-bit',8],
  ['TM6 P17 RGB 8-bit',5],
  ['TM6 P18 RGB 16-bit',10],
  ['TM6 P19 CIE xy 8-bit',3],
  ['TM6 P20 CIE xy 16-bit',6],
  ['TM6 P21 CCT 8-bit',3],
  ['TM6 P22 CCT 16-bit',5],
  ['TM6 P23 xfade CCT & HS 8-bit',7],
  ['TM6 P24 xfade CCT & HS 16-bit',13],
  ['TM6 P25 xfade CCT & RGB 8-bit',8],
  ['TM6 P26 xfade CCT & RGB 16-bit',15],
  ['TM6 P27 xfade CIE xy1 & xy2 8-bit',6],
  ['TM6 P28 xfade CIE xy1 & xy2 16-bit',12],
  ['TM6 P29 xfade CCT & TDRGB 8-bit',9],
  ['TM6 P30 xfade CCT & TDRGB 16-bit',15]
];
for(const id of ["kinoflo-freestyle-air-mini","kinoflo-freestyle-air","kinoflo-freestyle-air-max"]){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  if(!fixture||fixture.dmxControllerModel!=='LED-140X'||fixture.dmxFirmware!=='True Match 6.0 DFS'||
     !Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==kinoFreeStyleAirTm6Widths.length){
    failures.push('Kino Flo FreeStyle Air True Match 6.0 DMX mode set missing: '+id);
    continue;
  }
  for(const [name,channels] of kinoFreeStyleAirTm6Widths){
    const mode=fixture.dmxModes.find(item=>item?.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==kinoFreeStyleAirTm6Source){
      failures.push('Verified Kino Flo FreeStyle Air TM6 DMX width/source missing: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo FreeStyle Air TM6 channel mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Kino Flo Tegra 4Bank DMX verified 1ch/4ch footprints.
const kinoTegraDmxSource='https://kinoflo.com/wp-content/uploads/2022/07/3100061-archive-Rev-A-Tegra-4Bank-DMX-02-06-2013.pdf';
{
  const fixture=RUNTIME_CATALOG.fixtureById.get('kinoflo-tegra-4bank-dmx');
  const widths=[['1ch all lamps',1],['4ch individual lamps',4]];
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==widths.length){
    failures.push('Kino Flo Tegra 4Bank DMX mode set missing');
  }else{
    for(const [name,channels] of widths){
      const mode=fixture.dmxModes.find(item=>item?.name===name);
      if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==kinoTegraDmxSource){
        failures.push('Verified Kino Flo Tegra DMX width/source missing: '+name);
      }
      if(mode?.controls?.length||mode?.requiredChannels?.length){
        failures.push('Kino Flo Tegra DMX channel values remain width-only in this pass: '+name);
      }
    }
  }
}


// Kino Flo Image 47/87 fluorescent verified DMX footprint widths.
const kinoImageFluoroDmxSource='https://kinoflo.com/wp-content/uploads/2022/07/3100066-Rev-A-IMAGE-87-47-DMX-Rev-6-12-2013-Web-Quality-1.pdf';
for(const [id,widths] of [
  ['kinoflo-image-47-dmx',[['1ch all lamps',1],['5ch individual lamps + HO/Std',5]]],
  ['kinoflo-image-87-dmx',[['1ch all lamps',1],['9ch individual lamps + HO/Std',9]]]
]){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==widths.length){
    failures.push('Kino Flo Image fluorescent DMX mode set missing: '+id);
    continue;
  }
  for(const [name,channels] of widths){
    const mode=fixture.dmxModes.find(item=>item?.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==kinoImageFluoroDmxSource){
      failures.push('Verified Kino Flo Image fluorescent DMX width/source missing: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo Image fluorescent DMX mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Kino Flo Imara verified DMX footprint widths.
for(const [id,widths,sourceUrl] of [
  ['kinoflo-imara-s6-dmx',[['1ch all lamps',1],['3ch lamp pairs',3]],'https://kinoflo.com/wp-content/uploads/2022/07/3100051-Imara-Rev-001-01-01-2011-web.pdf'],
  ['kinoflo-imara-s10-dmx',[['1ch all lamps',1],['5ch lamp pairs',5]],'https://kinoflo.com/wp-content/uploads/2022/07/3100051-Imara-Rev-001-01-01-2011-web.pdf'],
  ['kinoflo-imara-s60-dmx',[['1ch all lamps',1],['3ch lamp pairs',3]],'https://kinoflo.com/wp-content/uploads/2022/07/3100083-Imara-S100-S60-DMX-Rev-A-03-02-2015.pdf'],
  ['kinoflo-imara-s100-dmx',[['1ch all lamps',1],['5ch lamp pairs',5]],'https://kinoflo.com/wp-content/uploads/2022/07/3100083-Imara-S100-S60-DMX-Rev-A-03-02-2015.pdf']
]){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==widths.length){
    failures.push('Kino Flo Imara DMX mode set missing: '+id);
    continue;
  }
  for(const [name,channels] of widths){
    const mode=fixture.dmxModes.find(item=>item?.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==sourceUrl){
      failures.push('Verified Kino Flo Imara DMX width/source missing: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo Imara DMX mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Kino Flo ParaZip verified DMX footprint widths.
for(const [id,widths,sourceUrl] of [
  ['kinoflo-parazip-200-dmx',[['1ch all lamps',1]],'https://kinoflo.com/wp-content/uploads/2022/07/3100039-Rev-D-ParaZip-400-200-7-02-2012-Web-Quality-Old.pdf'],
  ['kinoflo-parazip-215-dmx',[['1ch all lamps',1]],'https://kinoflo.com/wp-content/uploads/2022/07/3100081-Rev-A-ParaZip-415-215-06-16-2015.pdf'],
  ['kinoflo-parazip-400-dmx',[['1ch all lamps',1],['2ch inner/outer lamp pairs',2]],'https://kinoflo.com/wp-content/uploads/2022/07/3100039-Rev-D-ParaZip-400-200-7-02-2012-Web-Quality-Old.pdf'],
  ['kinoflo-parazip-415-dmx',[['1ch all lamps',1],['2ch inner/outer lamp pairs',2]],'https://kinoflo.com/wp-content/uploads/2022/07/3100081-Rev-A-ParaZip-415-215-06-16-2015.pdf']
]){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==widths.length){
    failures.push('Kino Flo ParaZip DMX mode set missing: '+id);
    continue;
  }
  for(const [name,channels] of widths){
    const mode=fixture.dmxModes.find(item=>item?.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==sourceUrl){
      failures.push('Verified Kino Flo ParaZip DMX width/source missing: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo ParaZip DMX mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Kino Flo ParaBeam verified DMX footprint widths.
for(const [id,widths,sourceUrl] of [
  ['kinoflo-parabeam-200-dmx',[['1ch all lamps',1]],'https://kinoflo.com/wp-content/uploads/2022/07/3100026-ParaBeam-400-200-Rev-10-05-2005-Web-Quality-Old.pdf'],
  ['kinoflo-parabeam-210-dmx',[['1ch all lamps',1]],'https://kinoflo.com/wp-content/uploads/2022/07/3100026-ParaBeam-400-200-Rev-10-05-2005-Web-Quality.pdf'],
  ['kinoflo-parabeam-400-dmx',[['1ch all lamps',1],['2ch inner/outer lamp pairs',2]],'https://kinoflo.com/wp-content/uploads/2022/07/3100026-ParaBeam-400-200-Rev-10-05-2005-Web-Quality-Old.pdf'],
  ['kinoflo-parabeam-410-dmx',[['1ch all lamps',1],['2ch inner/outer lamp pairs',2]],'https://kinoflo.com/wp-content/uploads/2022/07/3100026-ParaBeam-400-200-Rev-10-05-2005-Web-Quality.pdf']
]){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==widths.length){
    failures.push('Kino Flo ParaBeam DMX mode set missing: '+id);
    continue;
  }
  for(const [name,channels] of widths){
    const mode=fixture.dmxModes.find(item=>item?.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==sourceUrl){
      failures.push('Verified Kino Flo ParaBeam DMX width/source missing: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo ParaBeam DMX mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Kino Flo VistaBeam 300/600 verified DMX footprint widths.
const kinoVistaBeamDmxSource='https://kinoflo.com/wp-content/uploads/2022/07/3100041-VistaBeam-Web-Quality-Old.pdf';
for(const [id,channels] of [['kinoflo-vistabeam-300-dmx',4],['kinoflo-vistabeam-600-dmx',7]]){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  const names=['Fixture mode','Individual Lamp mode'];
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==names.length){
    failures.push('Kino Flo VistaBeam DMX mode set missing: '+id);
    continue;
  }
  for(const name of names){
    const mode=fixture.dmxModes.find(item=>item?.name===name);
    if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==kinoVistaBeamDmxSource){
      failures.push('Verified Kino Flo VistaBeam DMX width/source missing: '+id+' / '+name);
    }
    if(mode?.controls?.length||mode?.requiredChannels?.length){
      failures.push('Kino Flo VistaBeam DMX mapping must remain width-only in this pass: '+id+' / '+name);
    }
  }
}


// Kino Flo Wall-O-Lite verified DMX footprint widths.
const kinoWallOLiteDmxSource='https://kinoflo.com/wp-content/uploads/2022/07/3100021-wall-o-lite-colorRev-10-05-2005-Web-Quality.pdf';
{
  const fixture=RUNTIME_CATALOG.fixtureById.get('kinoflo-wall-o-lite-dmx');
  const widths=[['Fixture mode',1],['Individual Lamp mode',8]];
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==widths.length){
    failures.push('Kino Flo Wall-O-Lite DMX mode set missing');
  }else{
    for(const [name,channels] of widths){
      const mode=fixture.dmxModes.find(item=>item?.name===name);
      if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==kinoWallOLiteDmxSource){
        failures.push('Verified Kino Flo Wall-O-Lite DMX width/source missing: '+name);
      }
      if(mode?.controls?.length||mode?.requiredChannels?.length){
        failures.push('Kino Flo Wall-O-Lite DMX mapping must remain width-only in this pass: '+name);
      }
    }
  }
}


// Kino Flo BarFly 450 verified DMX footprint widths.
const kinoBarFly450DmxSource='https://kinoflo.com/wp-content/uploads/2022/07/3100062-BarFly-450-Rev-A-5-18-2012-Web-Quality.pdf';
{
  const fixture=RUNTIME_CATALOG.fixtureById.get('kinoflo-barfly-450-dmx');
  const widths=[['1ch all lamps',1],['4ch individual lamps',4]];
  if(!fixture||!Array.isArray(fixture.dmxModes)||fixture.dmxModes.length!==widths.length){
    failures.push('Kino Flo BarFly 450 DMX mode set missing');
  }else{
    for(const [name,channels] of widths){
      const mode=fixture.dmxModes.find(item=>item?.name===name);
      if(!mode||mode.channels!==channels||mode.verified!==true||mode.sourceUrl!==kinoBarFly450DmxSource){
        failures.push('Verified Kino Flo BarFly 450 DMX width/source missing: '+name);
      }
      if(mode?.controls?.length||mode?.requiredChannels?.length){
        failures.push('Kino Flo BarFly 450 DMX mapping must remain width-only in this pass: '+name);
      }
    }
  }
}


// Aladdin BASE-LITE 100/200 exact 2-channel DMX mapping from the official protocol map.
const aladdinBaseLiteDmxSource='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
for(const id of ['aladdin-base-lite-100','aladdin-base-lite-200']){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  const mode=fixture?.dmxModes?.find(item=>item?.name==='2ch Dimmer + CCT');
  if(!mode||fixture.dmxModes.length!==1||mode.channels!==2||mode.verified!==true||mode.sourceUrl!==aladdinBaseLiteDmxSource){
    failures.push('Verified Aladdin BASE-LITE DMX mode/source missing: '+id);
    continue;
  }
  const dimmer=mode.controls?.find(item=>item?.key==='dimmer');
  const cct=mode.controls?.find(item=>item?.key==='cct');
  if(!dimmer||dimmer.channel!==1||dimmer.type!=='percent'||dimmer.min!==0||dimmer.max!==100||dimmer.dmxMin!==0||dimmer.dmxMax!==255){
    failures.push('Verified Aladdin BASE-LITE dimmer mapping missing: '+id);
  }
  if(!cct||cct.channel!==2||cct.type!=='cct-linear'||cct.min!==2900||cct.max!==6400||cct.dmxMin!==0||cct.dmxMax!==255){
    failures.push('Verified Aladdin BASE-LITE CCT mapping missing: '+id);
  }
  if(mode.controls?.length!==2||mode.requiredChannels?.length){
    failures.push('Unexpected Aladdin BASE-LITE extra DMX mapping data: '+id);
  }
}


// Aladdin BI-FABRIC 2/4 exact 2-channel DMX mapping.
const aladdinBiFabricDmxSource='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
for(const id of ['aladdin-bi-fabric-2','aladdin-bi-fabric-4']){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  const mode=fixture?.dmxModes?.find(item=>item?.name==='2ch Dimmer + CCT');
  if(!mode||fixture.dmxModes.length!==1||mode.channels!==2||mode.verified!==true||mode.sourceUrl!==aladdinBiFabricDmxSource){
    failures.push('Verified Aladdin BI-FABRIC DMX mode/source missing: '+id);
    continue;
  }
  const dimmer=mode.controls?.find(item=>item?.key==='dimmer');
  const cct=mode.controls?.find(item=>item?.key==='cct');
  if(!dimmer||dimmer.channel!==1||dimmer.type!=='percent'||dimmer.min!==0||dimmer.max!==100||dimmer.dmxMin!==0||dimmer.dmxMax!==255){
    failures.push('Verified Aladdin BI-FABRIC dimmer mapping missing: '+id);
  }
  if(!cct||cct.channel!==2||cct.type!=='cct-linear'||cct.min!==2900||cct.max!==6000||cct.dmxMin!==0||cct.dmxMax!==255){
    failures.push('Verified Aladdin BI-FABRIC CCT mapping missing: '+id);
  }
  if(mode.controls?.length!==2||mode.requiredChannels?.length){
    failures.push('Unexpected Aladdin BI-FABRIC extra DMX mapping data: '+id);
  }
}


// Aladdin FABRIC-LITE 20/35 exact 2-channel DMX mapping.
const aladdinFabricLiteDmxSource='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
for(const id of ['aladdin-fabric-lite-20','aladdin-fabric-lite-35']){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  const mode=fixture?.dmxModes?.find(item=>item?.name==='2ch Dimmer + CCT');
  if(!mode||fixture.dmxModes.length!==1||mode.channels!==2||mode.verified!==true||mode.sourceUrl!==aladdinFabricLiteDmxSource){
    failures.push('Verified Aladdin FABRIC-LITE DMX mode/source missing: '+id);
    continue;
  }
  const dimmer=mode.controls?.find(item=>item?.key==='dimmer');
  const cct=mode.controls?.find(item=>item?.key==='cct');
  if(!dimmer||dimmer.channel!==1||dimmer.type!=='percent'||dimmer.min!==0||dimmer.max!==100||dimmer.dmxMin!==0||dimmer.dmxMax!==255){
    failures.push('Verified Aladdin FABRIC-LITE dimmer mapping missing: '+id);
  }
  if(!cct||cct.channel!==2||cct.type!=='cct-linear'||cct.min!==2900||cct.max!==6000||cct.dmxMin!==0||cct.dmxMax!==255){
    failures.push('Verified Aladdin FABRIC-LITE CCT mapping missing: '+id);
  }
  if(mode.controls?.length!==2||mode.requiredChannels?.length){
    failures.push('Unexpected Aladdin FABRIC-LITE extra DMX mapping data: '+id);
  }
}


// Aladdin BI-FLEX M3/M7 exact 2-channel DMX mapping.
const aladdinBiFlexMxDmxSource='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
for(const id of ['aladdin-bi-flex-m3','aladdin-bi-flex-m7']){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  const mode=fixture?.dmxModes?.find(item=>item?.name==='2ch Dimmer + CCT');
  if(!mode||fixture.dmxModes.length!==1||mode.channels!==2||mode.verified!==true||mode.sourceUrl!==aladdinBiFlexMxDmxSource){
    failures.push('Verified Aladdin BI-FLEX M3/M7 DMX mode/source missing: '+id);
    continue;
  }
  const dimmer=mode.controls?.find(item=>item?.key==='dimmer');
  const cct=mode.controls?.find(item=>item?.key==='cct');
  if(!dimmer||dimmer.channel!==1||dimmer.type!=='percent'||dimmer.min!==0||dimmer.max!==100||dimmer.dmxMin!==0||dimmer.dmxMax!==255){
    failures.push('Verified Aladdin BI-FLEX M3/M7 dimmer mapping missing: '+id);
  }
  if(!cct||cct.channel!==2||cct.type!=='cct-linear'||cct.min!==2900||cct.max!==5600||cct.dmxMin!==0||cct.dmxMax!==255){
    failures.push('Verified Aladdin BI-FLEX M3/M7 CCT mapping missing: '+id);
  }
  if(mode.controls?.length!==2||mode.requiredChannels?.length){
    failures.push('Unexpected Aladdin BI-FLEX M3/M7 extra DMX mapping data: '+id);
  }
}
for(const id of ['aladdin-bi-flex-2','aladdin-bi-flex-4']){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  const mode=fixture?.dmxModes?.find(item=>item?.name==='2ch Dimmer + CCT');
  const source='https://aladdin-lights.com/wp-content/uploads/2022/08/DIMMER-UNIT-200W-Manual-SINGLE-PAGE.pdf';
  if(!mode||fixture.dmxModes.length!==1||mode.channels!==2||mode.verified!==true||mode.sourceUrl!==source){failures.push('Verified legacy Aladdin BI-FLEX 2/4 DMX mode/source missing: '+id);continue;}
  const dimmer=mode.controls?.find(item=>item?.key==='dimmer'),cct=mode.controls?.find(item=>item?.key==='cct');
  if(!dimmer||dimmer.channel!==1||dimmer.type!=='percent'||dimmer.min!==0||dimmer.max!==100||dimmer.dmxMin!==0||dimmer.dmxMax!==255) failures.push('Verified legacy Aladdin BI-FLEX 2/4 dimmer mapping missing: '+id);
  if(!cct||cct.channel!==2||cct.type!=='cct-linear'||cct.min!==2900||cct.max!==6000||cct.dmxMin!==0||cct.dmxMax!==255) failures.push('Verified legacy Aladdin BI-FLEX 2/4 CCT mapping missing: '+id);
  if(mode.controls?.length!==2||mode.requiredChannels?.length) failures.push('Unexpected legacy Aladdin BI-FLEX 2/4 extra DMX mapping data: '+id);
  if(!fixture.control?.includes('LumenRadio')) failures.push('Verified legacy Aladdin BI-FLEX 2/4 LumenRadio path missing: '+id);
}
{
  const fixture=RUNTIME_CATALOG.fixtureById.get('aladdin-bi-flex-1');
  if(fixture?.dmxModes?.length) failures.push('Aladdin BI-FLEX 1 must remain non-DMX');
}


// Aladdin ALL-IN ONE/TWO safe controls: documented function order, normalized CCT only.
const aladdinAllInController='https://aladdin-lights.com/wp-content/uploads/2024/02/ALL-IN-DIMMER-UNIT-Manual-05.02.2024.pdf';
for(const id of ['aladdin-all-in-one','aladdin-all-in-two']){
  const fixture=RUNTIME_CATALOG.fixtureById.get(id);
  const bi=fixture?.dmxModes?.find(mode=>mode?.name==='2ch White Bi-Color (optional DMX)');
  const rgb=fixture?.dmxModes?.find(mode=>mode?.name==='3ch RGB (optional DMX)');
  if(!bi||bi.channels!==2||bi.verified!==true||bi.sourceUrl!==aladdinAllInController) failures.push('Verified Aladdin ALL-IN 2ch controls missing: '+id);
  if(!rgb||rgb.channels!==3||rgb.verified!==true||rgb.sourceUrl!==aladdinAllInController) failures.push('Verified Aladdin ALL-IN 3ch controls missing: '+id);
  for(const [mode,expected] of [[bi,[['dimmer',1],['cctPosition',2]]],[rgb,[['red',1],['green',2],['blue',3]]]]){
    if(!mode) continue;
    if(mode.controls?.length!==expected.length||mode.requiredChannels?.length) failures.push('Unexpected Aladdin ALL-IN controls: '+id+' / '+mode.name);
    for(const [key,channel] of expected){const control=mode.controls?.find(item=>item?.key===key);if(!control||control.channel!==channel||control.type!=='percent'||control.bits!==8||control.min!==0||control.max!==100||control.dmxMin!==0||control.dmxMax!==255) failures.push('Incorrect Aladdin ALL-IN control: '+id+' / '+key);}
  }
  if(bi?.controls?.some(control=>control.key==='cct'||control.type==='cct-linear')) failures.push('Aladdin ALL-IN must not invent Kelvin transfer: '+id);
  if(!fixture?.control?.includes('LumenRadio via ALL-WDIM')) failures.push('Aladdin ALL-IN LumenRadio route missing: '+id);
}

const uniqueFailures=[...new Set(failures)];
console.log(JSON.stringify({ok:uniqueFailures.length===0,fixtures:RUNTIME_CATALOG.fixtures.length,accessories:RUNTIME_CATALOG.accessories.length,duplicateSourceDefinitions:RUNTIME_CATALOG.duplicateAccessoryIds,warnings:report.warnings.length,failures:uniqueFailures},null,2));
if(uniqueFailures.length)process.exit(1);
