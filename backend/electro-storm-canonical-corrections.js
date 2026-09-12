// Canonical Electro Storm optical corrections backed by current official Aputure product data.
// This patches existing records only; it intentionally creates no accessory definitions.
function unique(values = []) { return [...new Set(values)]; }
function designedFor(accessory, fixtureId, extra = {}) {
  if (!accessory) return;
  accessory.compatibleWith = unique([...(accessory.compatibleWith || []), fixtureId]);
  accessory.compatibility = { ...(accessory.compatibility || {}), [fixtureId]: { status: 'Designed For', conditions: [], ...extra } };
}

export function applyElectroStormCanonicalCorrections(accessories) {
  const byId = new Map(accessories.map(a => [a.id, a]));
  const fixtures = ['aputure-electro-storm-cs15','aputure-electro-storm-xt26'];

  const f14 = byId.get('aputure-electro-storm-f14-fresnel');
  if (f14) {
    for (const fixtureId of fixtures) designedFor(f14, fixtureId);
    f14.compatibilityStatus = 'Designed For';
    f14.mount = 'Aputure Mount';
    f14.diameterCm = 35;
    f14.beamAngleDeg = { min: 18, max: 50 };
    f14.weightKg = 13;
    f14.weatherResistance = 'IP65';
    f14.sourceUrl = 'https://aputure.com/EN-US/products/motorized-f14-fresnel';
  }

  const motorYoke = byId.get('aputure-electro-storm-motorized-yoke');
  if (motorYoke) {
    for (const fixtureId of fixtures) designedFor(motorYoke, fixtureId);
    motorYoke.compatibilityStatus = 'Designed For';
    motorYoke.weightKg = 20;
    motorYoke.panRangeDeg = 540;
    motorYoke.tiltRangeDeg = 270;
    motorYoke.weatherResistance = 'IP65';
    motorYoke.sourceUrl = 'https://aputure.com/en-US/products/motorized-yoke-for-cs15-xt26';
  }

  const reflectorSpecs = {
    'aputure-electro-storm-reflector-20': { angle: 20, weightKg: 3.8 },
    'aputure-electro-storm-reflector-35': { angle: 35, weightKg: 1.5, included: true },
    'aputure-electro-storm-reflector-50': { angle: 50, weightKg: 1.2 }
  };
  for (const [id, spec] of Object.entries(reflectorSpecs)) {
    const reflector = byId.get(id);
    if (!reflector) continue;
    for (const fixtureId of fixtures) designedFor(reflector, fixtureId, spec.included ? { includedWithFixture: true } : {});
    reflector.compatibilityStatus = 'Designed For';
    reflector.mount = 'Aputure Mount';
    reflector.beamAngleDeg = { min: spec.angle, max: spec.angle };
    reflector.weightKg = spec.weightKg;
    reflector.sourceUrl = 'https://aputure.com/en-US/products/electro-storm-xt26';
  }

  const reflectorDoors = byId.get('aputure-electro-storm-reflector-barn-doors');
  if (reflectorDoors) {
    reflectorDoors.compatibilityStatus = 'Designed For';
    reflectorDoors.compatibleWith = unique([...(reflectorDoors.compatibleWith || []),'aputure-electro-storm-reflector-35','aputure-electro-storm-reflector-50']);
    reflectorDoors.weightKg = 1.5;
    reflectorDoors.sourceUrl = 'https://aputure.com/en-US/products/electro-storm-xt26';
  }
  return accessories;
}
