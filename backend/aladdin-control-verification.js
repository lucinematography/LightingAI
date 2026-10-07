// Aladdin control verification: normalize runtime metadata without changing verified DMX semantics.
const ALADDIN_MOSAIC_SOURCE='https://aladdin-lights.com/mosaic-2x4/';
const ALADDIN_ALL_IN_ONE_SOURCE='https://aladdin-lights.com/wp-content/uploads/2024/02/ALL-IN-ONE-Manual-corrected-version-05.02.2024.pdf';
const ALADDIN_ALL_IN_TWO_SOURCE='https://aladdin-lights.com/wp-content/uploads/2024/02/ALL-IN-TWO-Manual-corrected-version-05.02.2024.pdf';
const ALADDIN_BLUETOOTH_SOURCE='https://aladdin-lights.com/mosaic-2x4/';
const ALADDIN_MOSAIC_MANUAL='https://aladdin-lights.com/wp-content/uploads/2023/09/MOSAIC-4x4-Manual-SINGLE-PAGE.pdf';

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}
function hasDmxTransport(control = {}) {
  const values = [
    ...(control.wired || []),
    ...(control.wireless || [])
  ].map(value => String(value).toLowerCase());
  return values.some(value =>
    /(^|[^a-z0-9])dmx(?:-?512a?|512)?([^a-z0-9]|$)/.test(value) ||
    value.includes('lumenradio')
  );
}
export function normalizeAladdinControl(fixtures = []) {
  for (const fixture of fixtures) {
    if (fixture?.manufacturer !== 'Aladdin' || !Array.isArray(fixture.control)) continue;
    const labels = fixture.control.map(value => String(value));
    const local = [], wired = [], wireless = [];
    for (const label of labels) {
      const value = label.trim().toLowerCase();
      if (value.includes('on-board') || value.includes('onboard')) local.push(label);
      if (value.includes('bluetooth') || value.includes('lumenradio')) {
        wireless.push(label);
        continue;
      }
      if (value.includes('dmx') || value.includes('wired dimmer') || value.includes('wired controller')) wired.push(label);
    }
    const modeSources = Array.isArray(fixture.dmxModes)
      ? fixture.dmxModes.map(mode => mode?.sourceUrl)
      : [];
    const bluetoothCandidate = wireless.some(value => /bluetooth/i.test(String(value)));
    const bluetoothSources = [];
    if (fixture.id && fixture.id.startsWith('aladdin-mosaic-')) bluetoothSources.push(ALADDIN_MOSAIC_SOURCE);
    if (fixture.id === 'aladdin-all-in-one') bluetoothSources.push(ALADDIN_ALL_IN_ONE_SOURCE);
    if (fixture.id === 'aladdin-all-in-two') bluetoothSources.push(ALADDIN_ALL_IN_TWO_SOURCE);
    const bluetoothVerified = bluetoothCandidate && bluetoothSources.length > 0;
    fixture.control = {
      local: unique(local),
      wired: unique(wired),
      wireless: unique(wireless),
      directLightingAI: [],
      externalInterfaceRequired: [],
      sourceUrls: unique([fixture.sourceUrl, ...modeSources, ...bluetoothSources]).filter(url => String(url || '').startsWith('http')),
      legacyLabels: labels,
      ...(bluetoothVerified ? {
        wirelessVerification: {
          bluetooth: {
            verified: true,
            family: 'Aladdin app Bluetooth',
            scope: 'transport-capability-only',
            sourceUrls: bluetoothSources,
            note: 'Aladdin documents Bluetooth app control for this product family. LightingAI proprietary command semantics remain locked until separately verified.'
          }
        }
      } : {})
    };
    const verifiedModes = Array.isArray(fixture.dmxModes)
      ? fixture.dmxModes.filter(mode => mode?.verified === true)
      : [];
    if (hasDmxTransport(fixture.control) && !verifiedModes.length && !fixture.dmxProfileVerification) {
      fixture.dmxProfileVerification = {
        status: 'HOLD',
        reason: 'Aladdin documents a standards-based DMX or LumenRadio control path for this fixture, but LightingAI has not yet verified a manufacturer-published per-channel map for the exact profile. Transport remains available while semantic channel control stays fail-closed.',
        sourceUrls: unique([fixture.sourceUrl, ...modeSources]).filter(url => String(url || '').startsWith('http'))
      };
    }
  }
  return fixtures;
}
