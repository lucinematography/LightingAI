// Godox control verification: preserve standards transport while unverified semantic DMX profiles fail closed.
function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
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
