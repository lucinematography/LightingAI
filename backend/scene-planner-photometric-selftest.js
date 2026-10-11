import assert from 'node:assert/strict';
import fs from 'node:fs';
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
const additionalFixtures=[
  {id:'aputure-ls-300d-ii',manufacturer:'Aputure',model:'LS 300d II',
    sourceUrl:'https://aputure.com/en-US/products/ls-300d-ii'},
  {id:'aputure-ls-1200d-pro',manufacturer:'Aputure',model:'LS 1200d Pro',
    sourceUrl:'https://aputure.com/en-US/products/ls-1200d-pro'}
];
const additionalReq=canonicalInventory(core.request({...raw,equipment:additionalFixtures.map(f=>({
  fixtureId:f.id,name:f.model,qty:1
}))}),additionalFixtures);
const addRefs=getManufacturerPhotometricReferences(additionalReq,additionalFixtures);
assert.equal(addRefs.length,2);
assert.deepEqual(addRefs[0].samples.map(s=>s.lux),[45000,3500,1200]);
assert.deepEqual(addRefs[1].samples.map(s=>s.lux),
  [83100,28340,15200,8580,22400,8200,4660,2880,13010,4800,2706,1775]);
assert.ok(addRefs.every(r=>r.requiresAttestedOptic===true));
const additionalRaw={lights:additionalFixtures.map((f,i)=>({
  fixtureId:f.id,role:i?'backlight':'key',beamAngleDeg:i?15:55,
  intensityPct:100,kelvin:5600,x:25+50*i,y:50
}))};
const additionalPlan=core.sanitizePlan(additionalRaw,additionalReq,'ai');
const additionalBasis=buildPhotometricBasis(additionalReq,additionalPlan,additionalFixtures,[]);
assert.equal(additionalBasis.entries.length,2);
assert.ok(additionalBasis.entries.every(e=>!e.configurationMatchesReference));
const wrappedPlan=core.sanitizePlan({
  ...additionalRaw,photometricBasis:additionalBasis,knowledgeBasis:{status:
   'CURATED_BOOK_PRINCIPLES_NOT_FULL_TEXT_OR_INDEPENDENTLY_PAGE_VERIFIED',cards:[]}
},additionalReq,'ai');
assert.equal(wrappedPlan.photometricBasis.entries.length,2);
const wrappedRevision=core.createRevision(wrappedPlan,{
  ...raw,equipment:additionalFixtures.map(f=>({fixtureId:f.id,name:f.model,qty:1}))
},'ai',null,'new-optic-references');
assert.equal(wrappedRevision.plan.photometricBasis.entries.length,2);
const newDistance=core.createDistanceMeasurementRevision(wrappedRevision,{
  lightId:'L1',distanceM:3,confirmed:true
});
assert.equal(newDistance.plan.photometricBasis.entries[0].measuredDistanceM,3);
assert.equal(newDistance.plan.photometricBasis.entries[0].publishedReferenceAtMeasuredDistance,null,
  'never claim optical configuration from AI beam angle alone');
assert.equal(newDistance.plan.photometricBasis.entries[0].onSetLux,null);

// Mounted optic must be explicitly confirmed on set; it never comes from AI beam estimates.
const opticOnly=core.createMountedOpticRevision(wrappedRevision,{
  lightId:'L1',opticId:'HYPER_REFLECTOR_55',confirmed:true
});
assert.equal(opticOnly.parentRevisionId,wrappedRevision.revisionId);
assert.equal(opticOnly.plan.opticConfirmations[0].source,
  'USER_REPORTED_MOUNTED_OPTIC_NOT_INDEPENDENTLY_VERIFIED');
assert.equal(opticOnly.plan.opticConfirmations[0].opticId,'HYPER_REFLECTOR_55');
assert.equal(opticOnly.plan.photometricBasis.entries[0].attestedOpticId,'HYPER_REFLECTOR_55');
assert.equal(opticOnly.plan.photometricBasis.entries[0].configurationMatchesReference,true);
assert.equal(opticOnly.plan.photometricBasis.entries[0].publishedReferenceAtMeasuredDistance,null);
assert.equal(opticOnly.plan.photometricBasis.entries[0].onSetLux,null);
const opticAndDistance=core.createDistanceMeasurementRevision(opticOnly,{
  lightId:'L1',distanceM:3,confirmed:true
});
assert.deepEqual(opticAndDistance.plan.photometricBasis.entries[0].publishedReferenceAtMeasuredDistance,{
  opticId:'HYPER_REFLECTOR_55',distanceM:3,beamAngleDeg:55,lux:3500,
  status:'MANUFACTURER_REFERENCE_NOT_ON_SET_MEASUREMENT'
});
assert.equal(opticAndDistance.plan.photometricBasis.entries[0].onSetLux,null);

const meterContext={meterModel:'Sekonic C-800 test fixture',measurementPoint:'Face mark A',
  receptorOrientation:'RECEPTOR_TOWARD_FIXTURE',measuredAtLocal:'2026-10-11T14:30'};
const incidentRevision=(parent,report)=>core.createIncidentLuxRevision(parent,{...meterContext,...report});
// A real meter reading is never estimated from manufacturer lux or pixels and requires
// a recorded physical distance plus a separate, user-attested isolated-light reading.
assert.throws(()=>incidentRevision(wrappedRevision,{
  lightId:'L1',lux:325.125,confirmed:true,fixtureIsolated:true
}),/distance/i,'without a physical distance the incident meter value is not tied to a setup');
for(const badContext of [
  {meterModel:''},{meterModel:'A'},{meterModel:'<script>'},
  {measurementPoint:''},{measurementPoint:'<'},{receptorOrientation:'UNKNOWN'},
  {measuredAtLocal:'2026-02-30T10:00'},{measuredAtLocal:'tomorrow'},
  {measuredAtLocal:'2026-10-11T25:00'}
]){
  assert.throws(()=>incidentRevision(opticAndDistance,{
    lightId:'L1',lux:325.125,confirmed:true,fixtureIsolated:true,...badContext
  }),/meter|orientation|time|context/i);
}
const meterRevision=incidentRevision(opticAndDistance,{
  lightId:'L1',lux:'325.125',confirmed:true,fixtureIsolated:true
});
assert.equal(meterRevision.sequence,opticAndDistance.sequence+1);
assert.equal(meterRevision.parentRevisionId,opticAndDistance.revisionId);
assert.equal(meterRevision.plan.incidentLuxReadings.length,1);
assert.deepEqual(meterRevision.plan.incidentLuxReadings[0],{
  lightId:'L1',fixtureId:'aputure-ls-300d-ii',lux:325.125,unit:'lx',
  distanceMAtMeasurement:3,meterType:'INCIDENT_LUX_METER',
  target:'SUBJECT_AT_MEASUREMENT_POINT',measurementScope:'FIXTURE_ISOLATED_OTHER_SOURCES_CONTROLLED',
  source:'USER_REPORTED_INCIDENT_LUX_NOT_INDEPENDENTLY_VERIFIED',
  protocolVersion:2,meterModel:meterContext.meterModel,
  measurementPoint:meterContext.measurementPoint,
  receptorOrientation:meterContext.receptorOrientation,
  measuredAtLocal:meterContext.measuredAtLocal,
  calibrationStatus:'NOT_INDEPENDENTLY_VERIFIED',
  userAttested:true,fixtureIsolated:true
});
assert.equal(meterRevision.plan.dataStatus.incidentLuxReadings,'user-reported-not-independently-verified');
assert.equal(meterRevision.plan.photometricBasis.entries[0].onSetLux,null,
  'on-set incident reading cannot overwrite manufacturer slot or appear as published lux');
assert.equal(meterRevision.plan.photometricBasis.entries[0].publishedReferenceAtMeasuredDistance.lux,3500,
  'the published lux remains separate from user-reported 325.125 lx');
const revisedMeter=incidentRevision(meterRevision,{
  lightId:'L1',lux:0,confirmed:true,fixtureIsolated:true
});
assert.equal(revisedMeter.plan.incidentLuxReadings.length,1,'a second reading replaces only the active reading');
assert.equal(revisedMeter.plan.incidentLuxReadings[0].lux,0,'zero incident lux is a valid meter result');
assert.equal(meterRevision.plan.incidentLuxReadings[0].lux,325.125,
  'earlier immutable revision must retain original reading');
assert.equal(core.restoreRevisions([wrappedRevision,opticOnly,opticAndDistance,meterRevision,revisedMeter]).length,5);
const relocated=core.createDistanceMeasurementRevision(meterRevision,{
  lightId:'L1',distanceM:4,confirmed:true
});
assert.ok(!relocated.plan.incidentLuxReadings||relocated.plan.incidentLuxReadings.length===0,
  'moving the fixture invalidates a recorded on-set meter value in the current revision');
assert.equal(meterRevision.plan.incidentLuxReadings[0].distanceMAtMeasurement,3);
assert.equal(core.restoreRevisions([wrappedRevision,opticOnly,opticAndDistance,meterRevision,relocated]).length,5);
const changedOptical=core.createMountedOpticRevision(meterRevision,{
  lightId:'L1',opticId:'HYPER_REFLECTOR_55',confirmed:true
});
assert.ok(!changedOptical.plan.incidentLuxReadings||changedOptical.plan.incidentLuxReadings.length===0,
  'a newly confirmed optic is a different physical context; old incident lux must not carry over');
assert.equal(core.restoreRevisions([wrappedRevision,opticOnly,opticAndDistance,meterRevision,changedOptical]).length,5);
const otherLampDist=core.createDistanceMeasurementRevision(meterRevision,{
  lightId:'L2',distanceM:5,confirmed:true
});
assert.equal(otherLampDist.plan.incidentLuxReadings[0].lux,325.125,
  'changing an unrelated fixture must not invalidate this light measurement');
const renewedPlan=core.createRevision(wrappedPlan,{
  ...raw,equipment:additionalFixtures.map(f=>({fixtureId:f.id,name:f.model,qty:1}))
},'ai',meterRevision,'new-optic-references');
assert.ok(!renewedPlan.plan.incidentLuxReadings ||
  renewedPlan.plan.incidentLuxReadings.length===0,
  'fresh AI analysis must not inherit human-reported lux from a previous physical setup');
for(const bad of ['',null,undefined,true,[],{},-1,-0.1,1000000.001,1.0001,'NaN',
  'Infinity','1e3','3abc','12,5',Number.POSITIVE_INFINITY,Number.NaN]){
  assert.throws(()=>incidentRevision(opticAndDistance,{
    lightId:'L1',lux:bad,confirmed:true,fixtureIsolated:true
  }),/lux/i,'invalid lux meter values must fail closed without clipping');
}
assert.throws(()=>incidentRevision(opticAndDistance,{
  lightId:'L1',lux:101,confirmed:false,fixtureIsolated:true
}),/confirmation/i,'no UI attestation means no meter reading');
assert.throws(()=>incidentRevision(opticAndDistance,{
  lightId:'L1',lux:101,confirmed:true,fixtureIsolated:false
}),/confirmation/i,'mixed ambient/unisolated fixture cannot be reported as isolated fixture lux');
assert.throws(()=>incidentRevision(opticAndDistance,{
  lightId:'L999',lux:101,confirmed:true,fixtureIsolated:true
}),/owned|distance/i);
const tamperedLux=JSON.parse(JSON.stringify(meterRevision));
tamperedLux.plan.incidentLuxReadings[0].lux=999999;
assert.throws(()=>core.restoreRevisions([
  wrappedRevision,opticOnly,opticAndDistance,tamperedLux
]),/integrity|invalid|mismatch/i);
const fakeMeter=JSON.parse(JSON.stringify(meterRevision));
fakeMeter.plan.incidentLuxReadings[0].source='MANUFACTURER_PUBLISHED_REFERENCE';
assert.throws(()=>core.verifyRevision(fakeMeter),/Invalid on-set incident lux/i,
  'a recorded meter reading must never gain factory provenance');
const uiMeter=fs.readFileSync(new URL('../app/src/main/assets/scene-planner.js',import.meta.url),'utf8');
assert.match(uiMeter,/createIncidentLuxRevision\(previous/);
assert.match(uiMeter,/data-sp-incident-light/);
assert.match(uiMeter,/Potvrđujem očitavanje svetlomerom/);
assert.match(uiMeter,/sp-meter-model-/);
assert.match(uiMeter,/sp-meter-point-/);
assert.match(uiMeter,/sp-meter-orientation-/);

const distanceFirst=core.createMountedOpticRevision(newDistance,{
  lightId:'L1',opticId:'HYPER_REFLECTOR_55',confirmed:true
});
assert.deepEqual(distanceFirst.plan.photometricBasis.entries[0].publishedReferenceAtMeasuredDistance,
  opticAndDistance.plan.photometricBasis.entries[0].publishedReferenceAtMeasuredDistance,
  'measuring before mounting confirmation has identical trusted reference semantics');
assert.equal(core.restoreRevisions([wrappedRevision,opticOnly,opticAndDistance]).length,3);
assert.equal(core.restoreRevisions([wrappedRevision,newDistance,distanceFirst]).length,3);
const wrongAngle=core.createMountedOpticRevision(wrappedRevision,{
  lightId:'L2',opticId:'BM1230_MEDIUM',confirmed:true
});
assert.equal(wrongAngle.plan.photometricBasis.entries[1].configurationMatchesReference,false,
  'user-mounted medium beam does not override AI plan with 15-degree beam');
const wrongAngleDist=core.createDistanceMeasurementRevision(wrongAngle,{
  lightId:'L2',distanceM:5,confirmed:true
});
assert.equal(wrongAngleDist.plan.photometricBasis.entries[1].publishedReferenceAtMeasuredDistance,null);
const correctedOptic=core.createMountedOpticRevision(wrongAngleDist,{
  lightId:'L2',opticId:'BM1215_NARROW',confirmed:true
});
assert.equal(correctedOptic.plan.opticConfirmations.length,1,'optic replacement must not duplicate a light');
assert.equal(correctedOptic.plan.photometricBasis.entries[1].configurationMatchesReference,true);
assert.deepEqual(correctedOptic.plan.photometricBasis.entries[1].publishedReferenceAtMeasuredDistance,{
  opticId:'BM1215_NARROW',distanceM:5,beamAngleDeg:15,lux:28340,
  status:'MANUFACTURER_REFERENCE_NOT_ON_SET_MEASUREMENT'
});
assert.equal(correctedOptic.plan.photometricBasis.entries[1].onSetLux,null);
assert.throws(()=>core.createMountedOpticRevision(wrappedRevision,{
  lightId:'L1',opticId:'BM1215_NARROW',confirmed:true
}),/Unsupported mounted optic/i);
assert.throws(()=>core.createMountedOpticRevision(wrappedRevision,{
  lightId:'L1',opticId:'HYPER_REFLECTOR_55',confirmed:false
}),/confirmation/i);
assert.throws(()=>core.createMountedOpticRevision(wrappedRevision,{
  lightId:'L99',opticId:'HYPER_REFLECTOR_55',confirmed:true
}),/verified owned fixture/i);
const incorrectLux=JSON.parse(JSON.stringify(opticAndDistance));
incorrectLux.plan.photometricBasis.entries[0].publishedReferenceAtMeasuredDistance.lux=999999;
assert.throws(()=>core.restoreRevisions([wrappedRevision,opticOnly,incorrectLux]),/integrity|invalid|mismatch/i);
const incorrectOptic=JSON.parse(JSON.stringify(opticAndDistance));
incorrectOptic.plan.opticConfirmations[0].opticId='BM1230_MEDIUM';
assert.throws(()=>core.restoreRevisions([wrappedRevision,opticOnly,incorrectOptic]),/invalid|mismatch|not a verified profile option/i);
const newPlanAfterOptic=core.createRevision(wrappedPlan,{
  ...raw,equipment:additionalFixtures.map(f=>({fixtureId:f.id,name:f.model,qty:1}))
},'ai',opticAndDistance,'new-optic-references');
assert.ok(!newPlanAfterOptic.plan.opticConfirmations||!newPlanAfterOptic.plan.opticConfirmations.length,
  'new AI plan must not inherit physical optical attestation');
assert.equal(newPlanAfterOptic.plan.photometricBasis.entries[0].configurationMatchesReference,false);
const uiOptics=fs.readFileSync(new URL('../app/src/main/assets/scene-planner.js',import.meta.url),'utf8');
assert.match(uiOptics,/createMountedOpticRevision\(previous/);
assert.match(uiOptics,/data-sp-optic-light/);
assert.match(uiOptics,/Potvrđujem da sam fizički proverio/);


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
const invalidGeometry=canonicalInventory(core.request({...raw,roomWidthM:101,dimensionsMeasured:true}),fixtures);
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
// Explicit on-set distance: user attestation, immutable revision and exact manufacturer lookup.
const distRev=core.createDistanceMeasurementRevision(revision,{lightId:'L2',distanceM:'5',confirmed:true});
assert.equal(distRev.sequence,revision.sequence+1);
assert.equal(distRev.parentRevisionId,revision.revisionId);
assert.equal(distRev.plan.distanceMeasurements.length,1);
assert.deepEqual([distRev.plan.distanceMeasurements[0].lightId,
  distRev.plan.distanceMeasurements[0].distanceM,
  distRev.plan.distanceMeasurements[0].source],
  ['L2',5,'USER_REPORTED_ON_SET_NOT_INDEPENDENTLY_VERIFIED']);
assert.equal(distRev.plan.lights[1].distanceM,revision.plan.lights[1].distanceM,
  'physical user distance must not overwrite AI estimated placement');
assert.equal(distRev.plan.photometricBasis.entries[1].measuredDistanceM,5);
assert.equal(distRev.plan.photometricBasis.entries[1].onSetLux,null);
assert.deepEqual(distRev.plan.photometricBasis.entries[1].publishedReferenceAtMeasuredDistance,{
  distanceM:5,beamAngleDeg:45,lux:268,status:'MANUFACTURER_REFERENCE_NOT_ON_SET_MEASUREMENT'
});
const secondRev=core.createDistanceMeasurementRevision(distRev,{lightId:'L1',distanceM:3,confirmed:true});
assert.equal(secondRev.plan.distanceMeasurements.length,2);
assert.equal(secondRev.plan.photometricBasis.entries[0].measuredDistanceM,3);
assert.equal(secondRev.plan.photometricBasis.entries[0].publishedReferenceAtMeasuredDistance,null,
  'dimmer 60% cannot be equated with the published full-output reading');
assert.equal(secondRev.plan.photometricBasis.entries[0].onSetLux,null);
assert.equal(secondRev.plan.photometricBasis.entries[1].publishedReferenceAtMeasuredDistance.lux,268);
assert.equal(core.restoreRevisions([revision,distRev,secondRev]).length,3);
const changedReading=JSON.parse(JSON.stringify(secondRev));
changedReading.plan.distanceMeasurements[0].distanceM=7;
assert.throws(()=>core.restoreRevisions([revision,distRev,changedReading]),/integrity|Invalid|mismatch/i);
for(const input of ['',0,0.05,101,'NaN','Infinity','3abc','1e1',null,true,[3]]){
  assert.throws(()=>core.createDistanceMeasurementRevision(revision,{
    lightId:'L2',distanceM:input,confirmed:true
  }),/distance/i,'invalid on-set distances must be rejected without clipping');
}
assert.throws(()=>core.createDistanceMeasurementRevision(revision,{
  lightId:'L2',distanceM:5,confirmed:false
}),/confirmation/i);
assert.throws(()=>core.createDistanceMeasurementRevision(revision,{
  lightId:'L999',distanceM:5,confirmed:true
}),/owned/i);
const nonSampleRev=core.createDistanceMeasurementRevision(revision,{lightId:'L2',distanceM:4,confirmed:true});
assert.equal(nonSampleRev.plan.photometricBasis.entries[1].measuredDistanceM,4);
assert.equal(nonSampleRev.plan.photometricBasis.entries[1].publishedReferenceAtMeasuredDistance,null,
  'no unsupported interpolation between 3 m and 5 m');
const nextAiRev=core.createRevision(generated.plan,raw,'ai',distRev,'photo-provenance-1');
assert.ok(!nextAiRev.plan.distanceMeasurements || nextAiRev.plan.distanceMeasurements.length===0,
  'a fresh AI plan must not inherit stale measured distances');
assert.equal(nextAiRev.plan.photometricBasis.entries[1].measuredDistanceM,null);
const bestRev=core.createRevision(core.localPlan({mode:'best',description:'test'}),{
  mode:'best',description:'test'},'local',null,'best-distance');
assert.throws(()=>core.createDistanceMeasurementRevision(bestRev,{
  lightId:bestRev.plan.lights[0].id,distanceM:5,confirmed:true
}),/owned/i,'suggested or rented lights cannot be flagged as physically measured by this workflow');
const uiSource=fs.readFileSync(new URL('../app/src/main/assets/scene-planner.js',import.meta.url),'utf8');
assert.match(uiSource,/createDistanceMeasurementRevision\(previous/);
assert.match(uiSource,/data-sp-distance-light/);
assert.match(uiSource,/Lično potvrđujem merenje na setu/);
const tampered=JSON.parse(JSON.stringify(revision));
tampered.plan.photometricBasis.entries[0].samples[0].lux=99999;
assert.throws(()=>core.restoreRevisions([tampered]),/integrity|Invalid/i);
const changedPosition=JSON.parse(JSON.stringify(revision));
changedPosition.plan.photometricBasis.entries[0].estimatedXMetres=99;
assert.throws(()=>core.restoreRevisions([changedPosition]),/integrity|Invalid/i);
assert.ok(revision.plan.photometricBasis.entries.every(e=>e.onSetLux===null),
  'measured room dimensions cannot turn estimated fixture distance into measured scene lux');
console.log('Scene Planner photometric pilot tests passed: manufacturer, books, geometry and tamper detection.');
