import assert from 'node:assert/strict';
import { parseLeeHtml, parseRoscoHtml } from './gel-filter-catalog-builder.js';

const leeSource = { manufacturer:'LEE Filters', line:'Technical', category:'technical', url:'https://example.test/lee', parser:'lee' };
const lee = parseLeeHtml('<h3>201&nbsp;Full C.T. Blue</h3><h3>204 Full C.T. Orange</h3>', leeSource);
assert.equal(lee.length, 2);
assert.equal(lee[0].code, '201');
assert.equal(lee[0].name, 'Full C.T. Blue');
assert.equal(lee[1].code, '204');

const supergelSource = { manufacturer:'Rosco', line:'Supergel', category:'color-diffusion', url:'https://example.test/rosco', parser:'rosco', codePrefix:'R' };
const supergel = parseRoscoHtml('Roscolux, Supergel R00 Dempster Open White Roscolux, Supergel R01 Light Bastard Amber Roscolux, Supergel', supergelSource);
assert.equal(supergel.length, 2);
assert.equal(supergel[0].code, 'R00');
assert.equal(supergel[0].name, 'Dempster Open White');
assert.equal(supergel[1].code, 'R01');

const eColourSource = { manufacturer:'Rosco', line:'e-colour+', category:'color-correction-diffusion', url:'https://example.test/ecolour', parser:'rosco', codePrefix:'E' };
const eColour = parseRoscoHtml('e-colour+ E002 Rose Pink e-colour+ E003 Lavender Tint e-colour+', eColourSource);
assert.equal(eColour.length, 2);
assert.equal(eColour[0].code, 'E002');
assert.equal(eColour[1].name, 'Lavender Tint');

console.log('FILTERI/GEL parser self-test passed');
