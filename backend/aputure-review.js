import { RUNTIME_CATALOG } from './catalog-runtime.js';
import { buildAccessoryTree } from './accessory-graph.js';

function compactFixture(f) {
  return {
    id: f.id,
    manufacturer: f.manufacturer,
    model: f.model,
    sourceType: f.sourceType,
    powerDrawW: f.powerDrawW,
    outputPowerW: f.outputPowerW,
    cctK: f.cctK,
    colorMode: f.colorMode,
    cri: f.cri,
    tlci: f.tlci,
    beamAngleDeg: f.beamAngleDeg,
    includedReflectorBeamAngleDeg: f.includedReflectorBeamAngleDeg,
    mount: f.mount,
    ipRating: f.ipRating,
    weightKg: f.weightKg,
    sourceUrl: f.sourceUrl
  };
}

function compactAccessory(r) {
  const a = RUNTIME_CATALOG.accessoryById.get(r.id) || {};
  return {
    id: r.id,
    model: r.model,
    manufacturer: r.manufacturer,
    category: r.category,
    status: r.status,
    availability: r.availability,
    conditions: r.conditions || [],
    depth: r.depth,
    parentIds: r.parentIds || [],
    mount: a.mount,
    effectOnLight: a.effectOnLight,
    sourceUrl: a.sourceUrl
  };
}

export function aputureReviewCatalog() {
  const fixtures = RUNTIME_CATALOG.fixtures
    .filter(f => f.manufacturer === 'Aputure' || String(f.id).startsWith('aputure-'))
    .map(f => ({
      ...compactFixture(f),
      accessories: buildAccessoryTree(f.id, RUNTIME_CATALOG).map(compactAccessory)
    }));
  return {
    manufacturer: 'Aputure',
    fixtureCount: fixtures.length,
    accessoryCount: RUNTIME_CATALOG.accessories.length,
    purpose: 'Human review of the verified LightingAI Aputure catalog before ARRI expansion.',
    fixtures
  };
}
