import assert from 'node:assert/strict';
import { RUNTIME_CATALOG } from './catalog-runtime.js';

const byId = RUNTIME_CATALOG.accessoryById;
const fixtureById = RUNTIME_CATALOG.fixtureById;
function fixture(id){ const v=fixtureById.get(id); assert.ok(v,`Missing fixture ${id}`); return v; }
function accessory(id){ const v=byId.get(id); assert.ok(v,`Missing accessory ${id}`); return v; }
function target(id,fixtureId){ assert.ok(accessory(id).compatibleWith?.includes(fixtureId),`${id} must target ${fixtureId}`); }

const s80=fixture('aputure-storm-80c');
assert.equal(s80.powerDrawW,100); assert.equal(s80.outputPowerW,80); assert.deepEqual(s80.cctK,{min:1800,max:20000}); assert.equal(s80.beamAngleDeg,60); assert.equal(s80.includedReflectorBeamAngleDeg,35); assert.equal(s80.weightKg,1.35);
target('aputure-cf4-fresnel','aputure-storm-80c'); target('aputure-spotlight-mini','aputure-storm-80c'); target('aputure-quick-dome-40','aputure-storm-80c');

const s400=fixture('aputure-storm-400x');
assert.equal(s400.powerDrawW,500); assert.equal(s400.outputPowerW,400); assert.deepEqual(s400.cctK,{min:2500,max:10000}); assert.equal(s400.beamAngleDeg,57); assert.equal(s400.includedReflectorBeamAngleDeg,35);
target('aputure-cf7-fresnel','aputure-storm-400x'); assert.deepEqual(accessory('aputure-cf7-fresnel').beamAngleDeg,{min:15,max:40}); target('aputure-quick-dome-60','aputure-storm-400x'); target('aputure-quick-dome-90','aputure-storm-400x');

const s700=fixture('aputure-storm-700x');
assert.equal(s700.powerDrawW,850); assert.equal(s700.outputPowerW,700); assert.deepEqual(s700.cctK,{min:2500,max:10000}); assert.equal(s700.beamAngleDeg,58); assert.equal(s700.includedReflectorBeamAngleDeg,35);
target('aputure-storm-700x-reflector-25','aputure-storm-700x'); target('aputure-storm-700x-reflector-35','aputure-storm-700x'); target('aputure-cf10-fresnel','aputure-storm-700x'); target('aputure-storm-700x-skid','aputure-storm-700x'); target('aputure-quick-dome-90','aputure-storm-700x');

const s1000=fixture('aputure-storm-1000c');
assert.equal(s1000.powerDrawW,1440); assert.equal(s1000.outputPowerW,1000); assert.deepEqual(s1000.cctK,{min:1800,max:20000}); assert.equal(s1000.beamAngleDeg,67); assert.equal(s1000.includedReflectorBeamAngleDeg,45); assert.equal(s1000.weightKg,9.66); assert.equal(s1000.ipRating,'IP65');
target('aputure-storm-1000c-1200x-cf12-fresnel','aputure-storm-1000c'); target('aputure-storm-1000c-1200x-skid','aputure-storm-1000c'); target('aputure-space-light-90','aputure-storm-1000c'); target('aputure-quick-dome-90','aputure-storm-1000c');

const s1200=fixture('aputure-storm-1200x');
assert.equal(s1200.powerDrawW,1550); assert.equal(s1200.outputPowerW,1200); assert.deepEqual(s1200.cctK,{min:2500,max:10000}); assert.equal(s1200.beamAngleDeg,67); assert.equal(s1200.includedReflectorBeamAngleDeg,45); assert.equal(s1200.weightKg,9.5); assert.equal(s1200.ipRating,'IP65');
target('aputure-storm-1000c-1200x-cf12-fresnel','aputure-storm-1200x'); target('aputure-storm-1000c-1200x-skid','aputure-storm-1200x'); target('aputure-space-light-90','aputure-storm-1200x'); target('aputure-quick-dome-90','aputure-storm-1200x');

const cs32=fixture('aputure-storm-cs32');
assert.equal(cs32.powerDrawW,3200); assert.equal(cs32.lampHeadPowerDrawW,3000); assert.equal(cs32.outputPowerW,2600); assert.deepEqual(cs32.cctK,{min:1800,max:20000}); assert.equal(cs32.cri,97); assert.equal(cs32.tlci,98); assert.equal(cs32.beamAngleDeg,78); assert.equal(cs32.includedReflectorBeamAngleDeg,30); assert.deepEqual(cs32.reflectorBeamAnglesDeg,[20,25,30,35,50]); assert.equal(cs32.ipRating,'IP65'); assert.equal(cs32.weightKg,19.8); assert.equal(cs32.lampHeadWithoutYokeWeightKg,16.8); assert.equal(cs32.maxHeadCableLengthM,45);

const xt52=fixture('aputure-storm-xt52');
assert.equal(xt52.powerDrawW,5600); assert.equal(xt52.standardLampHeadPowerDrawW,5200); assert.equal(xt52.extendedHeadCableMaxPowerDrawW,6000); assert.equal(xt52.lowVoltageMaxPowerDrawW,3200); assert.equal(xt52.outputPowerW,4800); assert.deepEqual(xt52.cctK,{min:2500,max:10000}); assert.equal(xt52.cri,96); assert.equal(xt52.tlci,96); assert.equal(xt52.beamAngleDeg,93); assert.equal(xt52.includedReflectorBeamAngleDeg,35); assert.deepEqual(xt52.reflectorBeamAnglesDeg,[20,25,35,50]); assert.equal(xt52.ipRating,'IP65'); assert.equal(xt52.weightKg,31.3); assert.equal(xt52.lampHeadWithoutYokeWeightKg,27.8); assert.equal(xt52.maxHeadCableLengthM,45);

console.log(JSON.stringify({ok:true,checkedFixtures:['aputure-storm-80c','aputure-storm-400x','aputure-storm-700x','aputure-storm-1000c','aputure-storm-1200x','aputure-storm-cs32','aputure-storm-xt52'],protectedFacts:76},null,2));
