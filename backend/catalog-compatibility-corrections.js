// Canonical compatibility corrections backed by current official Aputure product data.
// This layer patches existing canonical records without creating duplicate accessory definitions.

function unique(values = []) { return [...new Set(values)]; }

export function applyCatalogCompatibilityCorrections(accessories) {
  const byId = new Map(accessories.map(accessory => [accessory.id, accessory]));

  const quickDome60 = byId.get('aputure-quick-dome-60');
  if (quickDome60) {
    quickDome60.compatibleWith = unique([...(quickDome60.compatibleWith || []), 'aputure-storm-400x']);
    quickDome60.compatibility = {
      ...(quickDome60.compatibility || {}),
      'aputure-storm-400x': { status: 'Designed For', conditions: [] }
    };
    quickDome60.mount = quickDome60.mount || 'Bowens Mount';
    quickDome60.weightKg = 0.76;
    quickDome60.diffusionStops = [1];
    quickDome60.gridAngleDeg = 40;
    quickDome60.sourceUrl = 'https://aputure.com/en-US/products/quick-dome-60';
  }

  const quickDome90 = byId.get('aputure-quick-dome-90');
  if (quickDome90) {
    quickDome90.compatibility = {
      ...(quickDome90.compatibility || {}),
      'aputure-storm-400x': { status: 'Designed For', conditions: [] },
      'aputure-storm-700x': { status: 'Designed For', conditions: [] }
    };
  }

  const cf10 = byId.get('aputure-cf10-fresnel');
  if (cf10) {
    cf10.compatibilityStatus = 'Compatible';
    cf10.compatibility = {
      ...(cf10.compatibility || {}),
      'aputure-storm-700x': { status: 'Designed For', conditions: [] },
      'aputure-storm-400x': { status: 'Compatible', conditions: [] },
      'aputure-ls-600x-pro': { status: 'Compatible', conditions: [] },
      'aputure-ls-600c-pro-ii': { status: 'Compatible', conditions: [] }
    };
  }

  return accessories;
}
