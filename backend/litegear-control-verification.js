// LiteGear Spectrum Gen 2 control verification: preserve documented LiteDimmer transport while semantic DMX profiles remain fail-closed until encoded.
const SPECTRUM_G2_IDS = new Set([
  'litegear-litemat-spectrum-g2-1',
  'litegear-litemat-spectrum-g2-2',
  'litegear-litemat-spectrum-g2-2l',
  'litegear-litemat-spectrum-g2-3',
  'litegear-litemat-spectrum-g2-4',
  'litegear-litemat-spectrum-g2-8'
]);

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function qualifyLiteGearSpectrumG2Profiles(fixtures = []) {
  for (const fixture of fixtures) {
    if (!SPECTRUM_G2_IDS.has(fixture?.id)) continue;
    const verifiedModes = Array.isArray(fixture.dmxModes)
      ? fixture.dmxModes.filter(mode => mode?.verified === true)
      : [];
    if (verifiedModes.length || fixture.dmxProfileVerification) continue;

    const officialProfileTable = fixture.control?.dmx?.officialProfileTable;
    fixture.dmxProfileVerification = {
      status: 'HOLD',
      reason: 'LiteGear documents DMX/RDM personalities for the external LiteDimmer Spectrum running Spectrum OS 3.1, but LightingAI has not yet encoded and verified one exact per-channel personality for this fixture/pixel configuration. Standards transport remains available through the documented LiteDimmer while semantic channel control stays fail-closed.',
      sourceUrls: unique([
        fixture.sourceUrl,
        ...(fixture.control?.sourceUrls || []),
        officialProfileTable
      ]).filter(url => String(url || '').startsWith('http'))
    };
  }
  return fixtures;
}
