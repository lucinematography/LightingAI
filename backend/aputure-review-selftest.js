import assert from 'node:assert/strict';
import { aputureReviewCatalog, aputureReviewHtml } from './aputure-review.js';

const review = aputureReviewCatalog();
assert.equal(review.manufacturer, 'Aputure');
assert.equal(review.fixtureCount, 18, 'Review must expose all 18 verified Aputure fixtures');
assert.equal(review.fixtures.length, 18);
assert.ok(review.accessoryCount >= 130, 'Review must expose the completed Aputure accessory catalog');

const ids = new Set(review.fixtures.map(f => f.id));
for (const id of [
  'aputure-ls-300d-ii','aputure-ls-300x','aputure-ls-600d','aputure-ls-600d-pro','aputure-ls-600c-pro-ii','aputure-ls-600x-pro','aputure-ls-1200d-pro',
  'aputure-storm-80c','aputure-storm-400x','aputure-storm-700x','aputure-storm-1000c','aputure-storm-1200x','aputure-storm-cs32','aputure-storm-xt52',
  'aputure-electro-storm-cs15','aputure-electro-storm-xt26'
]) assert.ok(ids.has(id), `Review missing ${id}`);

for (const fixture of review.fixtures) {
  assert.ok(fixture.model, `${fixture.id} missing model`);
  assert.ok(fixture.sourceUrl?.startsWith('https://'), `${fixture.id} missing official source`);
  assert.ok(Array.isArray(fixture.accessories), `${fixture.id} missing accessory list`);
}

const html = aputureReviewHtml();
assert.match(html, /LightingAI · Aputure baza/);
assert.match(html, /Pretraži lampu ili dodatak/);
assert.match(html, /Izaberi konkretnu lampu/);
assert.match(html, /DESIGNED FOR/);
assert.match(html, /COMPATIBLE/);
assert.match(html, /UKLJUČENI/);
assert.match(html, /18<\/b> lampi/);
assert.match(html, /130<\/b> dodataka/);
assert.ok(!html.includes('Planner</button>'), 'Review must remain isolated from the restored app UI');
console.log(`Aputure review self-test OK: ${review.fixtureCount} fixtures, ${review.accessoryCount} runtime accessories.`);
