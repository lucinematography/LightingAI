// Canonical compatibility corrections backed by current official Aputure product data.
// This layer patches existing canonical records without creating duplicate accessory definitions.

function unique(values = []) { return [...new Set(values)]; }
function addTargets(accessory, fixtureIds) {
  accessory.compatibleWith = unique([...(accessory.compatibleWith || []), ...fixtureIds]);
}

export function applyCatalogCompatibilityCorrections(accessories) {
  const byId = new Map(accessories.map(accessory => [accessory.id, accessory]));

  const quickDome60 = byId.get('aputure-quick-dome-60');
  if (quickDome60) {
    addTargets(quickDome60, ['aputure-storm-80c','aputure-storm-400x','aputure-storm-1000c']);
    quickDome60.compatibility = {
      ...(quickDome60.compatibility || {}),
      'aputure-storm-80c': { status: 'Compatible', conditions: ['Requires STORM 80c Bowens Mount Adapter'], requiredAccessoryId: 'aputure-storm-80c-bowens-adapter' },
      'aputure-storm-400x': { status: 'Designed For', conditions: [] },
      'aputure-storm-1000c': { status: 'Compatible', conditions: [] }
    };
    quickDome60.mount = quickDome60.mount || 'Bowens Mount';
    quickDome60.weightKg = 0.76;
    quickDome60.diffusionStops = [1];
    quickDome60.gridAngleDeg = 40;
    quickDome60.sourceUrl = 'https://aputure.com/en-US/products/quick-dome-60';
  }

  const quickDome90 = byId.get('aputure-quick-dome-90');
  if (quickDome90) {
    addTargets(quickDome90, ['aputure-storm-400x','aputure-storm-700x','aputure-storm-1000c','aputure-storm-1200x']);
    quickDome90.compatibility = {
      ...(quickDome90.compatibility || {}),
      'aputure-storm-400x': { status: 'Designed For', conditions: [] },
      'aputure-storm-700x': { status: 'Designed For', conditions: [] },
      'aputure-storm-1000c': { status: 'Compatible', conditions: [] },
      'aputure-storm-1200x': { status: 'Compatible', conditions: [] }
    };
  }

  const spaceLight90 = byId.get('aputure-space-light-90');
  if (spaceLight90) {
    addTargets(spaceLight90, ['aputure-storm-400x','aputure-storm-700x','aputure-storm-1000c','aputure-storm-1200x']);
    spaceLight90.compatibility = {
      ...(spaceLight90.compatibility || {}),
      'aputure-storm-400x': { status: 'Compatible', conditions: [] },
      'aputure-storm-700x': { status: 'Compatible', conditions: [] },
      'aputure-storm-1000c': { status: 'Compatible', conditions: [] },
      'aputure-storm-1200x': { status: 'Compatible', conditions: [] }
    };
  }

  const cf10 = byId.get('aputure-cf10-fresnel');
  if (cf10) {
    addTargets(cf10, ['aputure-storm-700x','aputure-storm-400x','aputure-ls-600x-pro','aputure-ls-600c-pro-ii']);
    cf10.compatibilityStatus = 'Compatible';
    cf10.compatibility = {
      ...(cf10.compatibility || {}),
      'aputure-storm-700x': { status: 'Designed For', conditions: [] },
      'aputure-storm-400x': { status: 'Compatible', conditions: [] },
      'aputure-ls-600x-pro': { status: 'Compatible', conditions: [] },
      'aputure-ls-600c-pro-ii': { status: 'Compatible', conditions: [] }
    };
  }

  const cf12 = byId.get('aputure-storm-1000c-1200x-cf12-fresnel') || byId.get('aputure-storm-1200x-cf12-fresnel');
  if (cf12) {
    addTargets(cf12, ['aputure-storm-1000c','aputure-storm-1200x']);
    cf12.compatibility = {
      ...(cf12.compatibility || {}),
      'aputure-storm-1000c': { status: 'Designed For', conditions: [] },
      'aputure-storm-1200x': { status: 'Designed For', conditions: [] }
    };
  }

  const barnDoorAdapter = byId.get('aputure-storm-1000c-1200x-barn-doors-adapter');
  if (barnDoorAdapter) {
    addTargets(barnDoorAdapter, ['aputure-storm-1000c','aputure-storm-1200x']);
    barnDoorAdapter.compatibility = {
      ...(barnDoorAdapter.compatibility || {}),
      'aputure-storm-1000c': { status: 'Designed For', conditions: [] },
      'aputure-storm-1200x': { status: 'Designed For', conditions: [] }
    };
  }

  return accessories;
}
