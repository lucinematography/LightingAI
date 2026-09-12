// Canonical compatibility corrections backed by current official Aputure product data.
// This layer patches existing canonical records without creating duplicate accessory definitions.

function unique(values = []) { return [...new Set(values)]; }
function addTargets(accessory, fixtureIds) { accessory.compatibleWith = unique([...(accessory.compatibleWith || []), ...fixtureIds]); }
function addCompatibility(accessory, fixtureId, status = 'Compatible', extra = {}) {
  addTargets(accessory, [fixtureId]);
  accessory.compatibility = { ...(accessory.compatibility || {}), [fixtureId]: { status, conditions: [], ...extra } };
}
function patchMany(byId, ids, fixtureId, status = 'Compatible') {
  for (const id of ids) { const accessory = byId.get(id); if (accessory) addCompatibility(accessory, fixtureId, status); }
}

export function applyCatalogCompatibilityCorrections(accessories) {
  const byId = new Map(accessories.map(accessory => [accessory.id, accessory]));

  const standardReflector = byId.get('aputure-bowens-standard-reflector');
  if (standardReflector) for (const fixtureId of ['aputure-ls-300d-ii','aputure-ls-300x','aputure-ls-600d','aputure-ls-600d-pro','aputure-ls-600x-pro','aputure-ls-600c-pro-ii','aputure-ls-1200d-pro']) addCompatibility(standardReflector, fixtureId, 'Compatible');
  for (const controlId of ['aputure-sidus-one','aputure-sidus-four']) {
    const control = byId.get(controlId);
    if (control) for (const fixtureId of ['aputure-ls-600d-pro','aputure-ls-600x-pro','aputure-ls-600c-pro-ii','aputure-ls-1200d-pro']) addCompatibility(control, fixtureId, 'Compatible');
  }

  const quickDome60 = byId.get('aputure-quick-dome-60');
  if (quickDome60) {
    addCompatibility(quickDome60, 'aputure-storm-80c', 'Compatible', { conditions: ['Requires STORM 80c Bowens Mount Adapter'], requiredAccessoryId: 'aputure-storm-80c-bowens-adapter' });
    addCompatibility(quickDome60, 'aputure-storm-400x', 'Designed For');
    addCompatibility(quickDome60, 'aputure-storm-1000c', 'Compatible');
    addCompatibility(quickDome60, 'aputure-storm-1200x', 'Compatible');
    quickDome60.mount = 'Bowens Mount'; quickDome60.diameterCm = 60; quickDome60.builtDimensionsCm = { diameter: 58.0, depth: 32.7 };
    quickDome60.weightKg = 0.76; quickDome60.diffusionStops = [1]; quickDome60.gridAngleDeg = 40;
    quickDome60.sourceUrl = 'https://aputure.com/en-US/products/quick-dome-60';
  }

  const quickDome90 = byId.get('aputure-quick-dome-90');
  if (quickDome90) {
    addCompatibility(quickDome90, 'aputure-storm-400x', 'Designed For');
    addCompatibility(quickDome90, 'aputure-storm-700x', 'Designed For');
    addCompatibility(quickDome90, 'aputure-storm-1000c', 'Compatible');
    addCompatibility(quickDome90, 'aputure-storm-1200x', 'Compatible');
    quickDome90.mount = 'Bowens Mount'; quickDome90.diameterCm = 90; quickDome90.weightKg = 1.40; quickDome90.diffusionStops = [1,2]; quickDome90.gridAngleDeg = 40;
    quickDome90.sourceUrl = 'https://aputure.com/en-US/products/quick-dome-90';
  }

  const cf7 = byId.get('aputure-cf7-fresnel');
  if (cf7) { addCompatibility(cf7, 'aputure-storm-400x', 'Designed For'); cf7.beamAngleDeg={min:15,max:40}; cf7.weightKg=1.35; cf7.sourceUrl='https://aputure.com/en-US/products/cf7-fresnel-and-barn-doors-kit'; }
  const cf7Doors = byId.get('aputure-cf7-barn-doors');
  if (cf7Doors) { cf7Doors.weightKg=0.95; cf7Doors.sourceUrl='https://aputure.com/en-US/products/cf7-fresnel-and-barn-doors-kit'; }

  const spaceLight90 = byId.get('aputure-space-light-90');
  if (spaceLight90) for (const fixtureId of ['aputure-storm-400x','aputure-storm-700x','aputure-storm-1000c','aputure-storm-1200x','aputure-ls-600x-pro','aputure-ls-600c-pro-ii']) addCompatibility(spaceLight90, fixtureId, 'Compatible');

  const cf10 = byId.get('aputure-cf10-fresnel');
  if (cf10) {
    addCompatibility(cf10, 'aputure-storm-700x', 'Designed For');
    for (const fixtureId of ['aputure-storm-400x','aputure-ls-600x-pro','aputure-ls-600c-pro-ii']) addCompatibility(cf10, fixtureId, 'Compatible');
    cf10.beamAngleDeg={min:15,max:40}; cf10.weightKg=2.45; cf10.sourceUrl='https://aputure.com/en-US/products/cf10-fresnel-and-barn-doors-kit';
  }
  const cf10Doors=byId.get('aputure-cf10-barn-doors'); if(cf10Doors){cf10Doors.weightKg=1.40;cf10Doors.sourceUrl='https://aputure.com/en-US/products/cf10-fresnel-and-barn-doors-kit';}

  const cf12 = byId.get('aputure-storm-1000c-1200x-cf12-fresnel') || byId.get('aputure-storm-1200x-cf12-fresnel');
  if (cf12) {
    addCompatibility(cf12, 'aputure-storm-1000c', 'Designed For'); addCompatibility(cf12, 'aputure-storm-1200x', 'Designed For');
    addCompatibility(cf12, 'aputure-storm-400x', 'Compatible'); addCompatibility(cf12, 'aputure-storm-700x', 'Compatible');
    cf12.beamAngleDeg={min:15,max:45}; cf12.lensDiameterIn=12; cf12.weightKg=4.72; cf12.mount='Bowens Mount';
    cf12.sourceUrl='https://aputure.com/EN-US/products/cf12-fresnel';
  }
  const cf12Doors=byId.get('aputure-cf12-barn-doors');
  if(cf12Doors){cf12Doors.scrimCompatibilityIn=13;cf12Doors.sourceUrl='https://aputure.com/EN-US/products/storm-1200x-cine-kit';}

  const bowens400Compatible = ['aputure-light-dome-iii','aputure-light-dome-se','aputure-light-dome-150','aputure-spotlight-max','aputure-light-box-60x90','aputure-light-box-30x120','aputure-light-box-45x45','aputure-light-octadome-120','aputure-lantern-90','aputure-lantern','aputure-cf10-fresnel','aputure-storm-1000c-1200x-cf12-fresnel','aputure-space-light-90','aputure-sidus-one','aputure-sidus-four','aputure-neutrik-power-cable-1200-series-6m'];
  const bowens700Compatible = ['aputure-light-dome-iii','aputure-light-dome-se','aputure-light-dome-150','aputure-spotlight-max','aputure-light-box-60x90','aputure-light-box-30x120','aputure-light-octadome-120','aputure-lantern-90','aputure-lantern','aputure-storm-1000c-1200x-cf12-fresnel','aputure-space-light-90','aputure-sidus-one','aputure-sidus-four','aputure-neutrik-power-cable-1200-series-6m'];
  patchMany(byId, bowens400Compatible, 'aputure-storm-400x', 'Compatible'); patchMany(byId, bowens700Compatible, 'aputure-storm-700x', 'Compatible');
  if (cf10) addCompatibility(cf10, 'aputure-storm-700x', 'Designed For');

  const barnDoorAdapter = byId.get('aputure-storm-1000c-1200x-barn-doors-adapter');
  if (barnDoorAdapter) { addCompatibility(barnDoorAdapter, 'aputure-storm-1000c', 'Designed For'); addCompatibility(barnDoorAdapter, 'aputure-storm-1200x', 'Designed For'); }
  const sharedDesigned = ['aputure-storm-1000c-1200x-reflector-15','aputure-storm-1000c-1200x-reflector-30','aputure-storm-1000c-1200x-reflector-45','aputure-storm-1000c-1200x-skid'];
  patchMany(byId, sharedDesigned, 'aputure-storm-1000c', 'Designed For'); patchMany(byId, sharedDesigned, 'aputure-storm-1200x', 'Designed For');
  for(const [id,angle] of [['aputure-storm-1000c-1200x-reflector-15',15],['aputure-storm-1000c-1200x-reflector-30',30],['aputure-storm-1000c-1200x-reflector-45',45]]){
    const reflector=byId.get(id); if(reflector){reflector.beamAngleDeg=angle; reflector.sourceUrl=angle===45?'https://aputure.com/en-US/products/storm-1000c-1200x-45-reflector':'https://aputure.com/EN-US/products/storm-1000c-1200x-reflector-kit';}
  }

  const sharedCompatible = ['aputure-light-dome-iii','aputure-light-dome-se','aputure-light-dome-150','aputure-spotlight-max','aputure-spotlight-max-19','aputure-spotlight-max-36','aputure-spotlight-max-50','aputure-light-box-60x90','aputure-light-box-30x120','aputure-light-octadome-120','aputure-lantern-90','aputure-quick-dome-60','aputure-quick-dome-90','aputure-space-light-90','aputure-sidus-one','aputure-sidus-four'];
  patchMany(byId, sharedCompatible, 'aputure-storm-1000c', 'Compatible'); patchMany(byId, sharedCompatible, 'aputure-storm-1200x', 'Compatible');
  if (cf12) { addCompatibility(cf12, 'aputure-storm-1000c', 'Designed For'); addCompatibility(cf12, 'aputure-storm-1200x', 'Designed For'); }
  if (barnDoorAdapter) { addCompatibility(barnDoorAdapter, 'aputure-storm-1000c', 'Designed For'); addCompatibility(barnDoorAdapter, 'aputure-storm-1200x', 'Designed For'); }
  patchMany(byId, sharedDesigned, 'aputure-storm-1000c', 'Designed For'); patchMany(byId, sharedDesigned, 'aputure-storm-1200x', 'Designed For');

  for (const fixtureId of ['aputure-electro-storm-cs15','aputure-electro-storm-xt26']) patchMany(byId, ['aputure-light-dome-150','aputure-lantern-90','aputure-spotlight-max'], fixtureId, 'Compatible');
  patchMany(byId, ['aputure-quick-dome-90','aputure-space-light-90'], 'aputure-electro-storm-xt26', 'Compatible');

  const fourLight = byId.get('aputure-ls1200d-four-light-bracket');
  if (fourLight) { addCompatibility(fourLight, 'aputure-storm-1200x', 'Designed For'); addCompatibility(fourLight, 'aputure-storm-1000c', 'Compatible'); }
  return accessories;
}
