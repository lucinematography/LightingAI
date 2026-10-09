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

const VERIFIED_DMX_PROFILES = {
  'aputure-ls-600d': [{
    name: 'Lighting 1ch',
    channels: 1,
    verified: true,
    sourceUrl: 'https://docs.aputure.com/hubfs/Knowledge%20Base/Aputure/LS%20600d/All%20files/LS-600d-DMX-Profile-Specification-V1.0-.pdf',
    controls: [
      {key:'dimmer',label:'Intensity',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}
    ]
  }],
  'aputure-electro-storm-cs15': [{
    name: 'Mode 4 RGB 8-bit 5ch',
    channels: 5,
    verified: true,
    sourceUrl: 'https://docs.aputure.com/hubfs/Knowledge%20Base/Aputure/Electro%20Storm%20CS15/Electro%20Storm%20CS15%20DMX%20Profile%20Specification%20V1.1.pdf',
    requiredChannels: [{channel:5,value:0,label:'Strobe Off'}],
    controls: [
      {key:'dimmer',label:'Intensity',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},
      {key:'red',label:'Red',channel:2,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},
      {key:'green',label:'Green',channel:3,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},
      {key:'blue',label:'Blue',channel:4,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255}
    ]
  }],
  'aputure-electro-storm-xt26': [{
    name: 'Mode 1 CCT 8-bit 9ch (default extensions on)',
    channels: 9,
    verified: true,
    sourceUrl: 'https://docs.aputure.com/hubfs/Knowledge%20Base/Aputure/Electro%20Storm%20XT26/Electro%20Storm%20XT26%20DMX%20Profile%20Specification%20V1.1.pdf',
    requiredChannels: [
      {channel:3,value:128,label:'Green/Magenta Neutral'},
      {channel:4,value:0,label:'Strobe Off'},
      {channel:5,value:0,label:'Zoom No Effect'},
      {channel:6,value:0,label:'Pan No Effect'},
      {channel:7,value:0,label:'Tilt No Effect'},
      {channel:8,value:0,label:'Fan Smart'},
      {channel:9,value:0,label:'Dimming Curve Linear'}
    ],
    controls: [
      {key:'dimmer',label:'Intensity',channel:1,type:'percent',min:0,max:100,dmxMin:0,dmxMax:255},
      {key:'cct',label:'CCT',channel:2,type:'cct-linear',min:2700,max:6500,step:10,dmxMin:0,dmxMax:255}
    ],
    profileConfiguration: {
      motorizedAccessories: 'ON',
      functionConfiguration: 'ON',
      rationale: 'Use the manufacturer-default maximum 9-channel footprint to avoid DMX address overlap when both extensions are enabled.'
    }
  }]
};

const DMX_PROFILE_HOLDS = {
  'aputure-storm-cs32': {
    status: 'HOLD',
    reason: 'Aputure publishes a dedicated STORM CS32 DMX chart, but LightingAI has not yet locked a per-channel profile from that chart. Keep transport available while semantic control remains fail-closed.',
    sourceUrls: [
      'https://help.aputure.com/en/storm-cs32/dmx-settings',
      'https://help.aputure.com/hubfs/Knowledge%20Base/Aputure/STORM%20CS32/Documents/STORM%20CS32%20DMX%20Profile%20Specification%20V1.0.pdf?hsLang=en'
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

    const verifiedProfiles = VERIFIED_DMX_PROFILES[fixture.id] || [];
    const existingVerified = Array.isArray(fixture.dmxModes) && fixture.dmxModes.some(mode => mode?.verified === true);
    if (verifiedProfiles.length && !existingVerified) {
      fixture.dmxModes = [
        ...(Array.isArray(fixture.dmxModes) ? fixture.dmxModes : []),
        ...verifiedProfiles.map(mode => ({
          ...mode,
          requiredChannels: (mode.requiredChannels || []).map(channel => ({...channel})),
          controls: (mode.controls || []).map(control => ({...control}))
        }))
      ];
    }

    const hold = DMX_PROFILE_HOLDS[fixture.id];
    const verifiedAfterPatch = Array.isArray(fixture.dmxModes) && fixture.dmxModes.some(mode => mode?.verified === true);
    if (hold && !verifiedAfterPatch) {
      fixture.dmxProfileVerification = {
        status: hold.status,
        reason: hold.reason,
        sourceUrls: [...hold.sourceUrls]
      };
    }
  }
  return fixtures;
}
