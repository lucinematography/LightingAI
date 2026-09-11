// Official Aputure STORM Cine Kit and projection accessory data verified 2026-09-11.
const rel=(source,status='Designed For',included=false,conditions=[])=>({status,includedWithFixture:included,conditions,sourceUrl:source});
const product=(id,model,fixtureId,source,conditions=[])=>({
  id,manufacturer:'Aputure',model,category:'Other',compatibilityStatus:'Designed For',
  compatibleWith:[fixtureId],compatibility:{[fixtureId]:rel(source,'Designed For',false,conditions)},
  sourceUrl:source,verifiedAt:'2026-09-11'
});
const STORM_700X='aputure-storm-700x';
const STORM_1000C='aputure-storm-1000c';
const STORM_1200X='aputure-storm-1200x';
const SOURCE_700='https://aputure.com/en-US/products/storm-700x-cine-kit';
const SOURCE_1000='https://aputure.com/en-US/products/storm-1000c-cine-kit';
const SOURCE_1200='https://aputure.com/en-US/products/storm-1200x-cine-kit';
export const STORM_CINE_KIT_ACCESSORIES = [
  product('aputure-storm-700x-cine-kit','STORM 700x Cine Kit',STORM_700X,SOURCE_700,['Complete kit includes CF10 Fresnel, CF10 Barn Doors, Skid, cases and cables']),
  product('aputure-storm-1000c-cine-kit','STORM 1000c Cine Kit',STORM_1000C,SOURCE_1000,['Complete kit includes CF12 Fresnel, CF12 Barn Doors, STORM 1000c/1200x Skid and cases']),
  product('aputure-storm-1200x-cine-kit','STORM 1200x Cine Kit',STORM_1200X,SOURCE_1200,['Complete kit includes CF12 Fresnel, CF12 Barn Doors, STORM 1000c/1200x Skid and cases']),
  {
    id:'aputure-spotlight-mount-ii-26-lens-kit',manufacturer:'Aputure',
    model:'Spotlight Mount II 26° Lens Kit',category:'Spotlight',compatibilityStatus:'Designed For',
    compatibleWith:[STORM_700X],compatibility:{[STORM_700X]:rel('https://aputure.com/en-US/products/spotlight-mount-ii-26-lens-kit')},
    beamAngleDeg:{min:26,max:26},mount:'ProLock / Bowens Mount',
    effectOnLight:'Ellipsoidal projection optic for precise 26-degree beam shaping and gobo projection.',
    sourceUrl:'https://aputure.com/en-US/products/spotlight-mount-ii-26-lens-kit',verifiedAt:'2026-09-11'
  }
];
export const STORM_CINE_KIT_OVERRIDES = {
  'aputure-spotlight-mount-ii-36-lens-kit': {
    compatibleWith:[STORM_700X],
    compatibility:{[STORM_700X]:rel('https://aputure.com/en-US/products/spotlight-mount-ii-36-lens-kit')}
  }
};
export function mergeStormCineKitAccessory(accessory) {
  const override=STORM_CINE_KIT_OVERRIDES[accessory.id];
  if (!override) return accessory;
  return {...accessory,...override,
    compatibleWith:[...new Set([...(accessory.compatibleWith||[]),...override.compatibleWith])],
    compatibility:{...(accessory.compatibility||{}),...override.compatibility}};
}
