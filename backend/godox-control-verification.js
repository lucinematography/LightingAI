// Godox control verification: preserve standards transport while unverified semantic DMX profiles fail closed.
const GODOX_LIGHT_APP_SOURCE='https://www.godox.com/app/';
const GODOX_LIGHT_APP_4_SOURCE='https://www.godox.com/product-e/Godox-Light-App.html';
function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}
function hasBluetoothTransport(control = {}) {
  const values=[...(control.wireless||[]),...(control.directLightingAI||[])].map(value=>String(value).toLowerCase());
  return values.some(value=>/(^|[^a-z0-9])(bluetooth|ble)([^a-z0-9]|$)/.test(value));
}
function hasDmxTransport(control = {}) {
  const values = [
    ...(control.wired || []),
    ...(control.wireless || []),
    ...(control.directLightingAI || [])
  ].map(value => String(value).toLowerCase());
  return values.some(value =>
    /(^|[^a-z0-9])dmx(?:-?512a?|512)?([^a-z0-9]|$)/.test(value) ||
    value.includes('crmx') ||
    value.includes('art-net') ||
    value.includes('sacn')
  );
}
export function normalizeGodoxControl(fixtures = []) {
  for (const fixture of fixtures) {
    if (fixture?.manufacturer !== 'Godox' || !fixture.control || Array.isArray(fixture.control)) continue;
    if (hasBluetoothTransport(fixture.control)) {
      fixture.control.sourceUrls = unique([
        ...(fixture.control.sourceUrls || []),
        fixture.sourceUrl,
        GODOX_LIGHT_APP_SOURCE,
        GODOX_LIGHT_APP_4_SOURCE
      ]);
      fixture.control.wirelessVerification = {
        ...(fixture.control.wirelessVerification || {}),
        bluetooth: {
          verified: true,
          family: 'Godox Light Bluetooth',
          scope: 'transport-capability-only',
          sourceUrls: [GODOX_LIGHT_APP_SOURCE, GODOX_LIGHT_APP_4_SOURCE],
          note: 'Godox documents Godox Light app control over Bluetooth for compatible LED fixtures. This verifies transport capability only; proprietary LightingAI command semantics remain locked until separately verified.'
        }
      };
      fixture.control.capabilityVerification = {
        ...(fixture.control.capabilityVerification || {}),
        dim: {
          verified: true,
          scope: 'official-app-capability-only',
          sourceUrls: [GODOX_LIGHT_APP_SOURCE],
          note: 'Godox documents brightness control in Godox Light for compatible Bluetooth LED fixtures. This proves the operator capability, not the LightingAI Bluetooth command encoding.'
        }
      };
    }
    const verifiedModes = Array.isArray(fixture.dmxModes)
      ? fixture.dmxModes.filter(mode => mode?.verified === true)
      : [];
    if (!hasDmxTransport(fixture.control) || verifiedModes.length || fixture.dmxProfileVerification) continue;
    const modeSources = Array.isArray(fixture.dmxModes)
      ? fixture.dmxModes.map(mode => mode?.sourceUrl)
      : [];
    fixture.dmxProfileVerification = {
      status: 'HOLD',
      reason: 'Godox documents a standards-based DMX, CRMX, Art-Net, or sACN control path for this fixture, but LightingAI has not yet encoded and verified a manufacturer-published per-channel DMX mode for this exact model and firmware. Transport remains available while semantic channel control stays fail-closed.',
      sourceUrls: unique([
        fixture.sourceUrl,
        ...(fixture.control.sourceUrls || []),
        ...modeSources
      ]).filter(url => String(url || '').startsWith('http'))
    };
  }
  return fixtures;
}
