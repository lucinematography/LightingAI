export function qualifyEvLightDmxProfiles(fixtures = []) {
  for (const fixture of fixtures) {
    const control = fixture?.control && typeof fixture.control === 'object' && !Array.isArray(fixture.control)
      ? fixture.control
      : {};
    const transports = [
      ...(Array.isArray(control.wired) ? control.wired : []),
      ...(Array.isArray(control.wireless) ? control.wireless : [])
    ];
    const documentedDmx = transports.some(value => /(^|[^a-z0-9])dmx(?:-?512a?|512)?([^a-z0-9]|$)|crmx|lumenradio/i.test(String(value)));
    const hasVerifiedMode = Array.isArray(fixture?.dmxModes) && fixture.dmxModes.some(mode => mode?.verified === true);
    if (!documentedDmx || hasVerifiedMode || fixture?.dmxProfileVerification) continue;

    const sources = [
      ...(Array.isArray(control.sourceUrls) ? control.sourceUrls : []),
      fixture?.sourceUrl
    ].filter(value => typeof value === 'string' && value.startsWith('http'));

    fixture.dmxProfileVerification = {
      status: 'HOLD',
      reason: 'DMX transport is manufacturer-documented, but LightingAI has no manufacturer-published per-channel function map locked for this exact model/profile.',
      sourceUrls: [...new Set(sources)]
    };
  }
  return fixtures;
}
