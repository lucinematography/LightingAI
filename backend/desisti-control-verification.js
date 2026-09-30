function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}
function isWirelessDmx(label = '') {
  const value = String(label).toLowerCase();
  return value.includes('wireless') || value.includes('lumenradio') || value.includes('crmx') || value.includes('timo');
}
function hasDmxTransport(control = {}) {
  const values = [...(control.wired || []), ...(control.wireless || [])].map(value => String(value).toLowerCase());
  return values.some(value =>
    /(^|[^a-z0-9])dmx(?:-?512a?|512)?([^a-z0-9]|$)/.test(value) ||
    value.includes('crmx') ||
    value.includes('lumenradio')
  );
}
export function normalizeDeSistiControl(fixtures = []) {
  for (const fixture of fixtures) {
    if (fixture?.manufacturer !== 'De Sisti' || !Array.isArray(fixture.control)) continue;
    const labels = fixture.control.map(value => String(value));
    const local = [], wired = [], wireless = [];
    for (const label of labels) {
      const normalized = label.trim().toLowerCase();
      if (normalized.includes('on-board') || normalized.includes('onboard') || normalized.includes('local') || normalized.includes('manual')) local.push(label);
      if (isWirelessDmx(label)) {
        wireless.push(label);
        continue;
      }
      if (/(^|[^a-z0-9])dmx(?:-?512a?|512)?([^a-z0-9]|$)/.test(normalized)) wired.push('DMX512');
      if (normalized.includes('rdm')) wired.push('RDM');
    }
    const modeSources = Array.isArray(fixture.dmxModes) ? fixture.dmxModes.map(mode => mode?.sourceUrl) : [];
    fixture.control = {
      local: unique(local),
      wired: unique(wired),
      wireless: unique(wireless),
      directLightingAI: [],
      externalInterfaceRequired: [],
      sourceUrls: unique([fixture.sourceUrl, ...modeSources]),
      legacyLabels: labels
    };
    const verifiedModes = Array.isArray(fixture.dmxModes) ? fixture.dmxModes.filter(mode => mode?.verified === true) : [];
    if (hasDmxTransport(fixture.control) && !verifiedModes.length && !fixture.dmxProfileVerification) {
      fixture.dmxProfileVerification = {
        status: 'HOLD',
        reason: 'De Sisti documents a standards-based DMX transport for this fixture, but LightingAI does not yet have a manufacturer-published per-channel map verified for the exact model/profile. Transport remains available while semantic channel control stays fail-closed.',
        sourceUrls: unique([fixture.sourceUrl, ...modeSources]).filter(url => String(url || '').startsWith('http'))
      };
    }
  }
  return fixtures;
}
