// Kino Flo control verification: normalize standards routes while preserving all verified DMX profiles and fail-closing unresolved profiles.
function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function hasStandardDmxTransport(control = {}) {
  const values = [
    ...(control.wired || []),
    ...(control.wireless || []),
    ...(control.directLightingAI || [])
  ].map(value => String(value).toLowerCase());
  return values.some(value =>
    /(^|[^a-z0-9])dmx(?:-?512a?|512)?([^a-z0-9]|$)/.test(value) ||
    value.includes('crmx') ||
    value.includes('lumenradio') ||
    value.includes('art-net') ||
    value.includes('artnet') ||
    value.includes('sacn') ||
    value.includes('e1.31')
  );
}

export function normalizeKinoFloControl(fixtures = []) {
  for (const fixture of fixtures) {
    if (fixture?.manufacturer !== 'Kino Flo' || !Array.isArray(fixture.control)) continue;

    const labels = fixture.control.map(value => String(value));
    const local = [];
    const wired = [];
    const wireless = [];
    const directLightingAI = [];
    const externalInterfaceRequired = [];

    for (const label of labels) {
      const value = label.trim().toLowerCase();

      if (value.includes('onboard') || value.includes('on-board') || value === 'local' || value.includes('manual')) {
        local.push(label);
      }

      if (value.includes('lumenradio') || value.includes('crmx')) {
        wireless.push(label);
      } else if (
        value.includes('dmx') ||
        value.includes('rdm') ||
        value.includes('art-net') ||
        value.includes('artnet') ||
        value.includes('sacn') ||
        value.includes('e1.31') ||
        value.includes('ethernet') ||
        value.includes('ballast') ||
        value.includes('helios') ||
        value.includes('lighting desk')
      ) {
        wired.push(label);
      }

      if (value.includes('art-net') || value.includes('artnet')) directLightingAI.push('Art-Net');
      if (value.includes('sacn') || value.includes('e1.31')) directLightingAI.push('sACN');
    }

    const hasDmxBallast = labels.some(label => /dmx ballast/i.test(label));
    const hasDirectDmx512 = labels.some(label => /(^|[^a-z0-9])dmx(?:-?512a?|512)?([^a-z0-9]|$)/i.test(label));
    const hasWirelessDmx = labels.some(label => /lumenradio|crmx/i.test(label));
    const hasHelios = labels.some(label => /helios/i.test(label));

    if (hasDmxBallast) {
      externalInterfaceRequired.push('Compatible Kino Flo DMX ballast between LightingAI control transport and fixture head');
    } else if (hasDirectDmx512) {
      externalInterfaceRequired.push('Wired DMX interface for DMX512 control');
    }
    if (hasWirelessDmx) externalInterfaceRequired.push('CRMX/LumenRadio transmitter or bridge for wireless DMX control');
    if (hasHelios) externalInterfaceRequired.push('Megapixel HELIOS LED processor for MIMIK image-based lighting control');

    const modeSources = Array.isArray(fixture.dmxModes)
      ? fixture.dmxModes.map(mode => mode?.sourceUrl)
      : [];

    fixture.control = {
      local: unique(local),
      wired: unique(wired),
      wireless: unique(wireless),
      directLightingAI: unique(directLightingAI),
      externalInterfaceRequired: unique(externalInterfaceRequired),
      sourceUrls: unique([fixture.sourceUrl, ...modeSources]).filter(url => String(url || '').startsWith('http')),
      legacyLabels: labels
    };

    const verifiedModes = Array.isArray(fixture.dmxModes)
      ? fixture.dmxModes.filter(mode => mode?.verified === true)
      : [];

    if (hasStandardDmxTransport(fixture.control) && !verifiedModes.length && !fixture.dmxProfileVerification) {
      fixture.dmxProfileVerification = {
        status: 'HOLD',
        reason: 'Kino Flo documents a standards-based DMX, CRMX/LumenRadio, Art-Net, or sACN control path for this fixture or its required external ballast, but LightingAI does not yet have an exact manufacturer-published per-channel DMX personality verified for this specific fixture/control path. Transport remains available while semantic channel control stays fail-closed.',
        sourceUrls: unique([fixture.sourceUrl, ...modeSources]).filter(url => String(url || '').startsWith('http'))
      };
    }
  }
  return fixtures;
}
