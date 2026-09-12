// Canonical compatibility corrections backed by current official Aputure product data.
// This layer patches existing canonical records without creating duplicate accessory definitions.

function unique(values = []) { return [...new Set(values)]; }
function addTargets(accessory, fixtureIds) {
  accessory.compatibleWith = unique([...(accessory.compatibleWith || []), ...fixtureIds]);
}
function addCompatibility(accessory, fixtureId, status = 'Compatible', extra = {}) {
  addTargets(accessory, [fixtureId]);
  accessory.compatibility = { ...(accessory.compatibility || {}), [fixtureId]: { status, conditions: [], ...extra } };
}
function patchMany(byId, ids, fixtureId, status = 'Compatible') {
  for (const id of ids) {
    const accessory = byId.get(id);
    if (accessory) addCompatibility(accessory, fixtureId, status);
  }
}

export function applyCatalogCompatibilityCorrections(accessories) {
  const byId = new Map(accessories.map(accessory => [accessory.id, accessory]));

  const quickDome60 = byId.get('aputure-quick-dome-60');
  if (quickDome60) {
    addCompatibility(quickDome60, 'aputure-storm-80c', 'Compatible', { conditions: ['Requires STORM 80c Bowens Mount Adapter'], requiredAccessoryId: 'aputure-storm-80c-bowens-adapter' });
    addCompatibility(quickDome60, 'aputure-storm-400x', 'Designed For');
    addCompatibility(quickDome60, 'aputure-storm-1000c', 'Compatible');
    quickDome60.mount = quickDome60.mount || 'Bowens Mount';
    quickDome60.weightKg = 0.76;
    quickDome60.diffusionStops = [1];
    quickDome60.gridAngleDeg = 40;
    quickDome60.sourceUrl = 'https://aputure.com/en-US/products/quick-dome-60';
  }

  const quickDome90 = byId.get('aputure-quick-dome-90');
  if (quickDome90) {
    addCompatibility(quickDome90, 'aputure-storm-400x', 'Designed For');
    addCompatibility(quickDome90, 'aputure-storm-700x', 'Designed For');
    addCompatibility(quickDome90, 'aputure-storm-1000c', 'Compatible');
    addCompatibility(quickDome90, 'aputure-storm-1200x', 'Compatible');
  }

  const spaceLight90 = byId.get('aputure-space-light-90');
  if (spaceLight90) {
    for (const fixtureId of ['aputure-storm-400x','aputure-storm-700x','aputure-storm-1000c','aputure-storm-1200x','aputure-ls-600x-pro','aputure-ls-600c-pro-ii','aputure-electro-storm-xt26']) addCompatibility(spaceLight90, fixtureId, 'Compatible');
  }

  const cf10 = byId.get('aputure-cf10-fresnel');
  if (cf10) {
    addCompatibility(cf10, 'aputure-storm-700x', 'Designed For');
    for (const fixtureId of ['aputure-storm-400x','aputure-ls-600x-pro','aputure-ls-600c-pro-ii']) addCompatibility(cf10, fixtureId, 'Compatible');
  }

  const cf12 = byId.get('aputure-storm-1000c-1200x-cf12-fresnel') || byId.get('aputure-storm-1200x-cf12-fresnel');
  if (cf12) {
    addCompatibility(cf12, 'aputure-storm-1000c', 'Designed For');
    addCompatibility(cf12, 'aputure-storm-1200x', 'Designed For');
  }

  const barnDoorAdapter = byId.get('aputure-storm-1000c-1200x-barn-doors-adapter');
  if (barnDoorAdapter) {
    addCompatibility(barnDoorAdapter, 'aputure-storm-1000c', 'Designed For');
    addCompatibility(barnDoorAdapter, 'aputure-storm-1200x', 'Designed For');
  }

  // Current Aputure STORM family table / Compatibility Wizard: shared 1000c + 1200x system.
  const sharedDesigned = [
    'aputure-storm-1000c-1200x-reflector-15',
    'aputure-storm-1000c-1200x-reflector-30',
    'aputure-storm-1000c-1200x-reflector-45',
    'aputure-storm-1000c-1200x-skid'
  ];
  patchMany(byId, sharedDesigned, 'aputure-storm-1000c', 'Designed For');
  patchMany(byId, sharedDesigned, 'aputure-storm-1200x', 'Designed For');

  // Current official compatible Bowens modifiers for both high-output STORM fixtures.
  const sharedCompatible = [
    'aputure-light-dome-iii',
    'aputure-light-dome-se',
    'aputure-light-dome-150',
    'aputure-spotlight-max-19',
    'aputure-spotlight-max-36',
    'aputure-spotlight-max-50',
    'aputure-light-box-60x90',
    'aputure-light-box-30x120',
    'aputure-light-octadome-120',
    'aputure-lantern-90',
    'aputure-sidus-one',
    'aputure-sidus-four'
  ];
  patchMany(byId, sharedCompatible, 'aputure-storm-1000c', 'Compatible');
  patchMany(byId, sharedCompatible, 'aputure-storm-1200x', 'Compatible');

  // Four-Light Bracket is Designed For 1200x, but the current 1000c wizard lists it Compatible.
  const fourLight = byId.get('aputure-ls1200d-four-light-bracket');
  if (fourLight) {
    addCompatibility(fourLight, 'aputure-storm-1200x', 'Designed For');
    addCompatibility(fourLight, 'aputure-storm-1000c', 'Compatible');
  }

  return accessories;
}
