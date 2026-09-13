import { buildRuntimeCatalog } from './catalog-runtime.js';
import { buildAccessoryTree } from './accessory-graph.js';

const RUNTIME_CATALOG = buildRuntimeCatalog();
RUNTIME_CATALOG.fixtureById = new Map(RUNTIME_CATALOG.fixtures.map(x => [x.id, x]));
RUNTIME_CATALOG.accessoryById = new Map(RUNTIME_CATALOG.accessories.map(x => [x.id, x]));

const EXPECTED_FIXTURES = [
  'aputure-ls-60d','aputure-ls-60x','aputure-ls-300d-ii','aputure-ls-300x','aputure-ls-600d','aputure-ls-600d-pro','aputure-ls-600c-pro-ii','aputure-ls-600x-pro','aputure-ls-1200d-pro',
  'aputure-storm-80c','aputure-storm-400x','aputure-storm-700x','aputure-storm-1000c','aputure-storm-1200x','aputure-storm-cs32','aputure-storm-xt52','aputure-electro-storm-cs15','aputure-electro-storm-xt26'
];

const errors = [];
for (const id of EXPECTED_FIXTURES) if (!RUNTIME_CATALOG.fixtureById.has(id)) errors.push(`Missing Aputure fixture ${id}`);
if (EXPECTED_FIXTURES.length !== 18) errors.push('Completion gate fixture manifest must contain exactly 18 Aputure fixtures');

// Completion gate protects a conservative cross-section of links already verified by the
// family-specific LS, STORM and Electro STORM tests. Do not infer compatibility from a shared mount.
const requiredReachability = {
  'aputure-ls-600x-pro': ['aputure-space-light-90'],
  'aputure-ls-600c-pro-ii': ['aputure-space-light-90'],
  'aputure-ls-1200d-pro': ['aputure-bowens-standard-reflector','aputure-f10-fresnel'],
  'aputure-storm-80c': ['aputure-spotlight-mini','aputure-spotlight-mini-lens-19','aputure-spotlight-mini-lens-36','aputure-spotlight-mini-gobo-holder-m-size','aputure-spotlight-mini-gobo-kit-m-size','aputure-spotlight-mini-iris-m-size','aputure-quick-dome-40'],
  'aputure-storm-400x': ['aputure-cf7-fresnel','aputure-quick-dome-90','aputure-space-light-90'],
  'aputure-storm-700x': ['aputure-cf10-fresnel','aputure-quick-dome-90','aputure-space-light-90'],
  'aputure-storm-1000c': ['aputure-storm-1000c-1200x-cf12-fresnel','aputure-quick-dome-90','aputure-space-light-90'],
  'aputure-storm-1200x': ['aputure-storm-1000c-1200x-cf12-fresnel','aputure-quick-dome-90','aputure-space-light-90'],
  'aputure-storm-cs32': ['aputure-motorized-cf16-fresnel','aputure-storm-parallel-beam-70','aputure-cf16-barn-doors-adapter','aputure-mount-reflector-30','aputure-mount-reflector-25','aputure-mount-reflector-35','aputure-mount-reflector-50','aputure-mount-reflector-20-combo','aputure-mount-light-dome-150','aputure-mount-lantern-120','aputure-mount-lantern-180','aputure-storm-cs32-skid','aputure-ultra-clamp','aputure-storm-cs32-head-cable-15m'],
  'aputure-storm-xt52': ['aputure-motorized-cf16-fresnel','aputure-storm-parallel-beam-70','aputure-cf16-barn-doors-adapter','aputure-mount-reflector-20-combo','aputure-mount-reflector-25','aputure-mount-reflector-35','aputure-mount-reflector-50','aputure-mount-reflector-30','aputure-mount-light-dome-150','aputure-mount-lantern-120','aputure-mount-lantern-180','aputure-storm-xt52-skid','aputure-quick-release-clamp','aputure-storm-xt52-head-cable-7-5m','aputure-storm-xt52-head-cable-15m'],
  'aputure-electro-storm-cs15': ['aputure-electro-storm-f14-fresnel','aputure-electro-storm-motorized-yoke','aputure-electro-storm-reflector-20','aputure-electro-storm-reflector-35','aputure-electro-storm-reflector-50','aputure-electro-storm-flight-case','aputure-storm-parallel-beam-70','aputure-spotlight-max','aputure-sidus-one','aputure-sidus-four'],
  'aputure-electro-storm-xt26': ['aputure-electro-storm-f14-fresnel','aputure-electro-storm-motorized-yoke','aputure-electro-storm-reflector-20','aputure-electro-storm-reflector-35','aputure-electro-storm-reflector-50','aputure-electro-storm-flight-case','aputure-electro-storm-xt26-lp28-bates-40a-cable','aputure-storm-parallel-beam-70','aputure-spotlight-max','aputure-quick-dome-90','aputure-space-light-90','aputure-sidus-one','aputure-sidus-four']
};

for (const [fixtureId, ids] of Object.entries(requiredReachability)) {
  const reachable = new Set(buildAccessoryTree(fixtureId, RUNTIME_CATALOG).map(x => x.id));
  for (const id of ids) if (!reachable.has(id)) errors.push(`${fixtureId} cannot reach completion-critical accessory ${id}`);
}

// Keep the high-value safety exclusions here as a final completion gate.
const forbidden = {
  'aputure-ls-1200d-pro': ['aputure-spotlight-mount-ii'],
  'aputure-storm-1200x': ['aputure-spotlight-mount-ii'],
  'aputure-storm-80c': ['aputure-f10-fresnel'],
  'aputure-storm-xt52': ['aputure-electro-storm-f14-fresnel']
};
for (const [fixtureId, ids] of Object.entries(forbidden)) {
  const reachable = new Set(buildAccessoryTree(fixtureId, RUNTIME_CATALOG).map(x => x.id));
  for (const id of ids) if (reachable.has(id)) errors.push(`${fixtureId} must not reach ${id}`);
}

console.log(JSON.stringify({
  ok: errors.length === 0,
  aputureFixtures: EXPECTED_FIXTURES.length,
  completionCriticalLinks: Object.values(requiredReachability).reduce((n, x) => n + x.length, 0),
  errors
}, null, 2));
if (errors.length) process.exit(1);
