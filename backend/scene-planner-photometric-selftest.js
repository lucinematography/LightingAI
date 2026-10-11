import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {getManufacturerPhotometricReferences,buildPhotometricBasis} from './scene-planner-photometry.js';
import {canonicalInventory,buildScenePlannerPrompt,generateScenePlannerPlan} from './scene-planner-service.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const PHOTO='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=';
const fixtures=[
  {id:'aputure-ls-60d',manufacturer:'Aputure',model:'LS 60d',
    sourceUrl:'https://aputure.com/EN-US/products/ls-60d',cctK:{min:5600,max:5600},powerDrawW:90},
  {id:'aputure-ls-60x',manufacturer:'Aputure',model:'LS 60x',
    sourceUrl:'https://aputure.com/en-US/products/ls-60x',cctK:{min:2700,max:6500},powerDrawW:90}
];
const raw={mode:'own',description:'Nocna scena, izracunaj svetlo za glumca',
  scenePhoto:PHOTO,roomWidthM:6,roomDepthM:4,dimensionsMeasured:true,
  equipment:[{fixtureId:'aputure-ls-60d',name:'LS 60d',qty:1},
    {fixtureId:'aputure-ls-60x',name:'LS 60x',qty:1}]};
const req=canonicalInventory(core.request(raw),fixtures);
const refs=getManufacturerPhotometricReferences(req,fixtures);
assert.equal(refs.length,2);
assert.deepEqual(refs[0].samples.map(s=>s.lux),[54300,7602,2715,9014,1096,402]);
assert.deepEqual(refs[1].samples.map(s=>s.lux),[33480,4241,1451,5803,703,268]);
assert.equal(getManufacturerPhotometricReferences(core.request(raw),fixtures).length,0,
  'Unverified client inventory must not gain manufacturer evidence');
assert.equal(getManufacturerPhotometricReferences(req,[{...fixtures[0],model:'Counterfeit'}]).length,0);
assert.equal(getManufacturerPhotometricReferences({...req,mode:'best'},fixtures).length,0);
const prompt=buildScenePlannerPrompt(req,fixtures);
assert.match(prompt,/MANUFACTURER-PUBLISHED PHOTOMETRIC REFERENCE/);
assert.match(prompt,/54300/);
assert.match(prompt,/PHY-005/,'relevant literature-derived distance principle must reach the model');
assert.match(prompt,/never convert these into measured scene lux/);
const rawLight={lights:[
  {fixtureId:'aputure-ls-60d',role:'key',x:25,y:50,intensityPct:60,kelvin:5600,
    beamAngleDeg:15,distanceM:3},
  {fixtureId:'aputure-ls-60x',role:'backlight',x:75,y:40,intensityPct:100,kelvin:5600,
    beamAngleDeg:45,distanceM:5}
]};
const plan=core.sanitizePlan(rawLight,req,'ai');
const basis=buildPhotometricBasis(req,plan,fixtures,[{id:'PHY-005'},{id:'EQ-002'},{id:'NONEXISTENT'}]);
assert.equal(basis.status,'MANUFACTURER_REFERENCE_NOT_SCENE_MEASUREMENT');
assert.deepEqual([basis.geometry.widthM,basis.geometry.depthM,basis.geometry.userMarkedMeasured],[6,4,true]);
assert.equal(basis.entries.length,2);
assert.equal(basis.entries[0].estimatedXMetres,1.5);
assert.equal(basis.entries[0].estimatedYMetres,2);
assert.equal(basis.entries[0].onSetLux,null);
assert.equal(basis.entries[0].measuredDistanceM,null);
assert.equal(basis.entries[0].configurationMatchesReference,false,'60% is not published 100% test');
assert.equal(basis.entries[1].configurationMatchesReference,true);
assert.deepEqual(basis.entries[0].bookCardIds,['PHY-005','EQ-002']);
assert.ok(basis.entries[0].samples.every(s=>[1,3,5].includes(s.distanceM)));
const unmeasuredReq={...req,dimensionsMeasured:false};
const unmeasured=buildPhotometricBasis(unmeasuredReq,core.sanitizePlan(rawLight,unmeasuredReq,'ai'),
  fixtures,[]);
assert.equal(unmeasured.entries[0].estimatedXMetres,null);
assert.equal(unmeasured.geometry.userMarkedMeasured,false);
const invalidGeometry=core.request({...raw,roomWidthM:101,dimensionsMeasured:true});
assert.equal(invalidGeometry.roomWidthM,null);
assert.equal(invalidGeometry.dimensionsMeasured,false);
const invalidPlan=core.sanitizePlan(rawLight,invalidGeometry,'ai');
const invalidBasis=buildPhotometricBasis(invalidGeometry,invalidPlan,fixtures,[]);
assert.equal(invalidBasis.geometry.userMarkedMeasured,false);
assert.equal(invalidBasis.entries[0].estimatedXMetres,null);
assert.equal(invalidBasis.entries[0].estimatedYMetres,null,
  'one missing room dimension must prevent all metric-position claims');
const missing=buildPhotometricBasis(req,plan,[{...fixtures[0],sourceUrl:'https://example.com/fake'}],[]);
assert.equal(missing.entries.length,0,'spoofed spec must fail closed');
const response={responses:{create:async()=>({output_text:JSON.stringify({
  lights:rawLight.lights,photometricBasis:{status:'FORGED',entries:[{onSetLux:999999}]}
})})}};
const generated=await generateScenePlannerPlan(response,raw,fixtures);
assert.equal(generated.plan.photometricBasis.entries.length,2);
assert.equal(generated.plan.photometricBasis.entries[0].onSetLux,null);
assert.ok(generated.plan.knowledgeBasis.cards.some(c=>c.id==='PHY-005'));
assert.ok(generated.plan.photometricBasis.entries[0].bookCardIds.includes('PHY-005'));
const revision=core.createRevision(generated.plan,raw,'ai',null,'photo-provenance-1');
assert.equal(revision.plan.photometricBasis.entries.length,2);
assert.equal(revision.plan.photometricBasis.entries[0].onSetLux,null);
assert.deepEqual(revision.plan.photometricBasis.entries[0].bookCardIds,
  generated.plan.photometricBasis.entries[0].bookCardIds);
assert.equal(core.restoreRevisions([JSON.parse(JSON.stringify(revision))])[0].plan.photometricBasis.entries.length,2);
// The persisted UI must fail closed if reference data are invented or assigned to another product.
const forged=JSON.parse(JSON.stringify(generated.plan));
forged.photometricBasis.entries[0].samples[0].lux=54301;
const forgedRev=core.createRevision(forged,raw,'ai',null,'fake-photometry');
assert.equal(forgedRev.plan.photometricBasis.entries.length,1,'untrusted lux must be dropped instead of relabeled');
const swappedSource=JSON.parse(JSON.stringify(generated.plan));
swappedSource.photometricBasis.entries[0].sourceUrl=fixtures[1].sourceUrl;
const swappedRev=core.createRevision(swappedSource,raw,'ai',null,'swapped-photometry');
assert.equal(swappedRev.plan.photometricBasis.entries.length,1,'wrong fixture-source match must be rejected');
const madeUpBook=JSON.parse(JSON.stringify(generated.plan));
madeUpBook.photometricBasis.entries[0].bookCardIds=['NOT-A-BOOK','PHY-005'];
const bookRev=core.createRevision(madeUpBook,raw,'ai',null,'book-links');
assert.deepEqual(bookRev.plan.photometricBasis.entries[0].bookCardIds,['PHY-005']);
const noBook=JSON.parse(JSON.stringify(generated.plan));
noBook.knowledgeBasis.cards=[];
const noBookRev=core.createRevision(noBook,raw,'ai',null,'no-book-links');
assert.deepEqual(noBookRev.plan.photometricBasis.entries[0].bookCardIds,[],
  'photometry must not cite book cards absent from current validated plan');
const tampered=JSON.parse(JSON.stringify(revision));
tampered.plan.photometricBasis.entries[0].samples[0].lux=99999;
assert.throws(()=>core.restoreRevisions([tampered]),/integrity|Invalid/i);
const changedPosition=JSON.parse(JSON.stringify(revision));
changedPosition.plan.photometricBasis.entries[0].estimatedXMetres=99;
assert.throws(()=>core.restoreRevisions([changedPosition]),/integrity|Invalid/i);
assert.ok(revision.plan.photometricBasis.entries.every(e=>e.onSetLux===null),
  'measured room dimensions cannot turn estimated fixture distance into measured scene lux');
console.log('Scene Planner photometric pilot tests passed: manufacturer, books, geometry and tamper detection.');
