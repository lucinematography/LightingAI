import assert from 'node:assert/strict';
import { parseRoscoHtml } from './gel-filter-catalog-builder.js';

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
