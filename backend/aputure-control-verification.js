function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

const VERIFIED_OVERRIDES = {
  'aputure-ls-600d': {
    wired: ['DMX512'],
    sourceUrls: ['https://help.aputure.com/en/ls600d/control-options-faq']
  },
  'aputure-electro-storm-cs15': {
    wired: ['DMX512','RDM','Ethernet'],
    directLightingAI: ['Art-Net','sACN'],
    sourceUrls: [
      'https://help.aputure.com/en/escs15/control-system',
      'https://help.aputure.com/en/escs15/ethernet-mode'
    ]
  },
  'aputure-electro-storm-xt26': {
    wired: ['DMX512','RDM','Ethernet'],
    directLightingAI: ['Art-Net','sACN'],
    sourceUrls: [
      'https://help.aputure.com/en/esxt26/control-system',
      'https://help.aputure.com/en/esxt26/ethernet-mode'
    ]
  }
};

export function normalizeLegacyAputureControl(fixtures = []) {
  for (const fixture of fixtures) {
    if (fixture?.manufacturer !== 'Aputure' || !Array.isArray(fixture.control)) continue;

    const labels = fixture.control.map(value => String(value));
    const local = [];
    const wired = [];
    const wireless = [];
    const directLightingAI = [];

    for (const label of labels) {
      const normalized = label.trim().toLowerCase();
      if (normalized === 'on-board' || normalized === 'onboard') local.push('On-board');
      if (normalized === 'dmx512') wired.push('DMX512');
      if (normalized === 'dmx/rdm') wired.push('DMX512','RDM');
      if (normalized === 'ethercon') wired.push('Ethernet');
      if (normalized === 'art-net' || normalized === 'artnet') directLightingAI.push('Art-Net');
      if (normalized === 'sacn' || normalized === 'e1.31') directLightingAI.push('sACN');
      if (normalized.includes('sidus link')) wireless.push(label);
      if (normalized === '2.4ghz') wireless.push('2.4GHz Remote');
      if (normalized.includes('crmx') || normalized.includes('lumenradio')) wireless.push(label);
    }

    const override = VERIFIED_OVERRIDES[fixture.id] || {};
    fixture.control = {
      local: unique(local),
      wired: unique([...wired, ...(override.wired || [])]),
      wireless: unique(wireless),
      directLightingAI: unique([...directLightingAI, ...(override.directLightingAI || [])]),
      externalInterfaceRequired: [],
      sourceUrls: unique([
        fixture.sourceUrl,
        ...(override.sourceUrls || [])
      ]),
      legacyLabels: labels
    };
  }
  return fixtures;
}
