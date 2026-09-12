import assert from 'node:assert/strict';
import { RUNTIME_CATALOG } from './catalog-runtime.js';

const byId = RUNTIME_CATALOG.accessoryById;
const fixtureById = RUNTIME_CATALOG.fixtureById;

function fixture(id) {
  const value = fixtureById.get(id);
  assert.ok(value, `Missing fixture ${id}`);
  return value;
}

function accessory(id) {
  const value = byId.get(id);
  assert.ok(value, `Missing accessory ${id}`);
  return value;
}

function target(id, fixtureId) {
  assert.ok(accessory(id).compatibleWith?.includes(fixtureId), `${id} must target ${fixtureId}`);
}

const storm400 = fixture('aputure-storm-400x');
assert.equal(storm400.powerDrawW, 500, 'STORM 400x max draw must remain 500W');
assert.equal(storm400.outputPowerW, 400, 'STORM 400x output must remain 400W');
assert.deepEqual(storm400.cctK, { min: 2500, max: 10000 }, 'STORM 400x CCT range changed');
assert.equal(storm400.beamAngleDeg, 57, 'STORM 400x native beam changed');
assert.equal(storm400.includedReflectorBeamAngleDeg, 35, 'STORM 400x included reflector beam changed');

target('aputure-cf7-fresnel', 'aputure-storm-400x');
assert.deepEqual(accessory('aputure-cf7-fresnel').beamAngleDeg, { min: 15, max: 40 });
target('aputure-quick-dome-60', 'aputure-storm-400x');
assert.equal(accessory('aputure-quick-dome-60').weightKg, 0.76);
assert.deepEqual(accessory('aputure-quick-dome-60').diffusionStops, [1]);
assert.equal(accessory('aputure-quick-dome-60').gridAngleDeg, 40);
target('aputure-quick-dome-90', 'aputure-storm-400x');

const storm700 = fixture('aputure-storm-700x');
assert.equal(storm700.powerDrawW, 880, 'STORM 700x max draw must remain 880W');
assert.equal(storm700.outputPowerW, 700, 'STORM 700x output must remain 700W');
assert.deepEqual(storm700.cctK, { min: 2500, max: 10000 }, 'STORM 700x CCT range changed');
assert.equal(storm700.beamAngleDeg, 58, 'STORM 700x native beam changed');
assert.equal(storm700.includedReflectorBeamAngleDeg, 35, 'STORM 700x included reflector beam changed');

target('aputure-storm-700x-reflector-25', 'aputure-storm-700x');
target('aputure-storm-700x-reflector-35', 'aputure-storm-700x');
target('aputure-cf10-fresnel', 'aputure-storm-700x');
assert.deepEqual(accessory('aputure-cf10-fresnel').beamAngleDeg, { min: 15, max: 40 });
target('aputure-storm-700x-skid', 'aputure-storm-700x');
target('aputure-quick-dome-90', 'aputure-storm-700x');

console.log(JSON.stringify({
  ok: true,
  checkedFixtures: ['aputure-storm-400x', 'aputure-storm-700x'],
  protectedFacts: 22
}, null, 2));
