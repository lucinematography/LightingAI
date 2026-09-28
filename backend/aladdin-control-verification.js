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
    fixture.control = {
      local: unique(local),
      wired: unique(wired),
      wireless: unique(wireless),
      directLightingAI: [],
      externalInterfaceRequired: [],
      sourceUrls: unique([fixture.sourceUrl, ...modeSources]).filter(url => String(url || '').startsWith('http')),
      legacyLabels: labels
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
