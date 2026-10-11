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
// Build a genuine two-light key/fill history through public creation APIs.
const ratioRaw={...rawLight,lights:[
  {...rawLight.lights[0],role:'key'},
  {...rawLight.lights[1],role:'fill'}
]};
const ratioPlan=core.createRevision({...generated.plan,lights:ratioRaw.lights},raw,'ai',null,'ratio-demo');
const ratioA=core.createDistanceMeasurementRevision(ratioPlan,{lightId:'L1',distanceM:3,confirmed:true});
const ratioB=core.createDistanceMeasurementRevision(ratioA,{lightId:'L2',distanceM:5,confirmed:true});
const commonContext={meterModel:'Sekonic C-800 test fixture',measurementPoint:'Face mark A',
  receptorOrientation:'RECEPTOR_TOWARD_CAMERA',measuredAtLocal:'2026-10-11T14:30'};
const ratioC=core.createIncidentLuxRevision(ratioB,{
  ...commonContext,lightId:'L1',lux:400,confirmed:true,fixtureIsolated:true
});
const ratioD=core.createIncidentLuxRevision(ratioC,{
  ...commonContext,lightId:'L2',lux:100,confirmed:true,fixtureIsolated:true,
  measuredAtLocal:'2026-10-11T14:34'
});
const positive=core.compareKeyFillMeasurements(ratioD,'L1','L2');
assert.equal(positive.status,'COMPARABLE_BY_USER_REPORTED_PROTOCOL_ONLY');
assert.equal(positive.ratio,4);
assert.deepEqual([positive.keyLux,positive.fillLux],[400,100]);
assert.equal(positive.sceneContrastVerified,false);
assert.equal(positive.cameraExposureVerified,false);
assert.equal(positive.manufacturerPhotometricsUsed,false);
assert.equal(positive.relativeStops,2,'a four-to-one isolated contribution is +2 relative stops');
assert.equal(positive.relativeMeaning,'KEY_MINUS_FILL_ISOLATED_CONTRIBUTION_STOPS');
assert.deepEqual(positive.bookGuidance.map(c=>c.id),positive.bookCardIds);
for(const card of positive.bookGuidance){
  const validated=ratioD.plan.knowledgeBasis.cards.find(c=>c.id===card.id);
  assert.ok(validated,'never invent unattached book guidance');
  assert.equal(card.principle,validated.principle);
  assert.equal(card.validation,validated.validation);
  assert.equal(card.limitations,validated.limitations);
}
const exposureContext=core.analyzeMeteredExposureContext(ratioD,'L1','L2');
const savedCamera=ratioD.plan.cameraSettings;
const exactShutterSeconds=savedCamera.shutterAngle/(360*savedCamera.fps);
const expectedSettingsEv100=Number((Math.log2((savedCamera.aperture**2/exactShutterSeconds)*
  (100/savedCamera.iso))+savedCamera.ndStops).toFixed(3));
assert.equal(exposureContext.contract,'lightingai-metered-exposure-context/1');
assert.equal(exposureContext.revisionId,ratioD.revisionId);
assert.equal(exposureContext.planHash,ratioD.planHash);
assert.equal(exposureContext.status,'RELATIVE_LIGHT_CONTRIBUTIONS_ONLY');
assert.equal(exposureContext.camera.nominalSettingsEv100,expectedSettingsEv100);
assert.equal(exposureContext.camera.aperture,savedCamera.aperture);
assert.equal(exposureContext.camera.iso,savedCamera.iso);
assert.equal(exposureContext.camera.shutterSeconds,Number(exactShutterSeconds.toPrecision(9)));
assert.deepEqual([exposureContext.incidentEvidence.keyLux,
  exposureContext.incidentEvidence.fillLux,exposureContext.incidentEvidence.relativeStops],[400,100,2]);
assert.equal(exposureContext.incidentEvidence.ratio,4);
assert.deepEqual(exposureContext.bookGuidance.map(x=>x.id),positive.bookCardIds);
for(const field of ['derivedSceneLux','measuredSceneEv100','recommendedAperture','recommendedIso']){
  assert.equal(exposureContext[field],null,'never fabricate '+field+' from isolated lux');
}
for(const flag of ['sceneExposureVerified','cameraExposureVerified','meterCalibrationVerified',
  'manufacturerPhotometricsUsed']){
  assert.equal(exposureContext[flag],false,'comparison cannot imply '+flag);
}
assert.equal(Object.isFrozen(exposureContext),true);
const inverseKey=core.createIncidentLuxRevision(ratioD,{
  ...commonContext,lightId:'L1',lux:25,confirmed:true,fixtureIsolated:true
});
assert.equal(core.compareKeyFillMeasurements(inverseKey,'L1','L2').relativeStops,-2,
  'fill brighter than key must have negative relative stops, not a clipped zero');
const equalKey=core.createIncidentLuxRevision(ratioD,{
  ...commonContext,lightId:'L1',lux:100,confirmed:true,fixtureIsolated:true
});
assert.equal(core.compareKeyFillMeasurements(equalKey,'L1','L2').relativeStops,0);
assert.equal(core.analyzeMeteredExposureContext(ratioC,'L1','L2').status,
  'CAMERA_SETTINGS_ONLY','a missing reading cannot be used to infer camera exposure');
assert.equal(core.analyzeMeteredExposureContext(ratioC,'L1','L2').incidentEvidence.relativeStops,null);
assert.equal(core.analyzeMeteredExposureContext(ratioD,null,null).incidentEvidence.blocker,
  'INVALID_KEY_FILL_PAIR','missing light roles fail closed');
const tamperedExposure=JSON.parse(JSON.stringify(ratioD));
tamperedExposure.plan.incidentLuxReadings[0].lux=800;
assert.throws(()=>core.analyzeMeteredExposureContext(tamperedExposure,'L1','L2'),
  /integrity|Invalid|mismatch/i,'tampered meter inputs may not generate exposure context');
const tamperedCamera=JSON.parse(JSON.stringify(ratioD));
tamperedCamera.plan.cameraSettings.aperture=32;
assert.throws(()=>core.analyzeMeteredExposureContext(tamperedCamera,'L1','L2'),
  /integrity|Invalid|mismatch/i,'tampered camera inputs may not generate exposure context');
assert.equal(core.restoreRevisions([ratioPlan,ratioA,ratioB,ratioC,ratioD]).length,5);
const differentPoint=core.createIncidentLuxRevision(ratioC,{
  ...commonContext,measurementPoint:'Different face mark',lightId:'L2',
  lux:100,confirmed:true,fixtureIsolated:true
});
assert.equal(core.compareKeyFillMeasurements(differentPoint,'L1','L2').reason,'DIFFERENT_MEASUREMENT_POINTS');
const rotated=core.createIncidentLuxRevision(ratioC,{
  ...commonContext,receptorOrientation:'RECEPTOR_TOWARD_FIXTURE',
  lightId:'L2',lux:100,confirmed:true,fixtureIsolated:true
});
assert.equal(core.compareKeyFillMeasurements(rotated,'L1','L2').reason,
  'SENSOR_ORIENTATION_NOT_COMMON_CAMERA_AXIS');
const remoteTime=core.createIncidentLuxRevision(ratioC,{
  ...commonContext,measuredAtLocal:'2026-10-11T15:30',
  lightId:'L2',lux:100,confirmed:true,fixtureIsolated:true
});
assert.equal(core.compareKeyFillMeasurements(remoteTime,'L1','L2').reason,
  'MEASUREMENT_TIMES_TOO_FAR_APART');
const absentTime=core.createIncidentLuxRevision(ratioC,{
  ...commonContext,measuredAtLocal:'',lightId:'L2',
  lux:100,confirmed:true,fixtureIsolated:true
});
assert.equal(core.compareKeyFillMeasurements(absentTime,'L1','L2').reason,'MISSING_MEASUREMENT_TIMES');
const wrongInstrument=core.createIncidentLuxRevision(ratioC,{
  ...commonContext,meterModel:'Other incident meter',lightId:'L2',
  lux:100,confirmed:true,fixtureIsolated:true
});
assert.equal(core.compareKeyFillMeasurements(wrongInstrument,'L1','L2').reason,
  'DIFFERENT_METER_IDENTITIES');
const zeroFill=core.createIncidentLuxRevision(ratioC,{
  ...commonContext,lightId:'L2',lux:0,confirmed:true,fixtureIsolated:true
});
assert.equal(core.compareKeyFillMeasurements(zeroFill,'L1','L2').reason,'ZERO_READING_NO_FINITE_RATIO');
const oneMeter=core.compareKeyFillMeasurements(ratioC,'L1','L2');
assert.equal(oneMeter.reason,'MISSING_USER_REPORTED_LUX');

// Full-scene incident lux is a SEPARATE user-reported observation, not
// sum(key+fill), sensor exposure or a published fixture table result.
const sceneInput={
  confirmed:true,allSourcesActiveConfirmed:true,lux:'650.125',
  meterModel:'Sekonic C-800 test fixture',meterIdentifier:'ONSET-METER-001',
  measurementPoint:'Face mark A',measuredAtLocal:'2026-10-11T16:05',
  measuredUtcOffset:'+02:00'
};
const sceneRev=core.createSceneIncidentLuxRevision(ratioD,sceneInput);
const sceneLux=sceneRev.plan.sceneIncidentLuxReading;
assert.equal(sceneRev.sequence,ratioD.sequence+1);
assert.equal(sceneRev.parentRevisionId,ratioD.revisionId);
assert.equal(sceneLux.lux,650.125);
assert.equal(sceneLux.protocolVersion,1);
assert.equal(sceneLux.unit,'lx');
assert.equal(sceneLux.fixtureCount,2);
assert.equal(sceneLux.utcOffsetMinutes,120);
assert.equal(sceneLux.receptorOrientation,'RECEPTOR_TOWARD_CAMERA');
assert.equal(sceneLux.measurementScope,'ALL_PLANNED_AVAILABLE_SOURCES_ACTIVE_AMBIENT_INCLUDED');
assert.equal(sceneLux.calibrationStatus,'NOT_INDEPENDENTLY_VERIFIED');
assert.match(sceneLux.setupFingerprint,/^[a-f0-9]{64}$/);
assert.equal(sceneRev.plan.dataStatus.sceneIncidentLuxReading,
  'user-reported-not-independently-verified');
assert.equal(ratioD.plan.sceneIncidentLuxReading,undefined,
  'historical revision remains immutable');
assert.equal(core.compareKeyFillMeasurements(sceneRev,'L1','L2').ratio,4,
  'the full-scene value must not alter isolated light comparison');
assert.equal(core.verifyRevision(sceneRev),true);
assert.equal(core.restoreRevisions([ratioPlan,ratioA,ratioB,ratioC,ratioD,sceneRev]).length,6);
const sceneContext=core.analyzeMeteredExposureContext(sceneRev,'L1','L2');
assert.equal(sceneContext.sceneIncidentEvidence.status,
  'USER_REPORTED_COMBINED_INCIDENT_LUX_NOT_VERIFIED');
assert.equal(sceneContext.sceneIncidentEvidence.userReportedLux,650.125);
assert.equal(sceneContext.sceneIncidentEvidence.meterIdentifier,'ONSET-METER-001');
assert.equal(sceneContext.sceneIncidentEvidence.utcOffsetMinutes,120);
assert.equal(sceneContext.sceneIncidentEvidence.setupFingerprint,sceneLux.setupFingerprint);
assert.equal(sceneContext.incidentEvidence.ratio,4);
assert.equal(sceneContext.camera.nominalSettingsEv100,exposureContext.camera.nominalSettingsEv100,
  'a user-reported scene lux cannot silently recalibrate camera settings');
assert.equal(sceneContext.sceneIncidentEvidence.cameraExposureVerified,false);
assert.equal(sceneContext.sceneIncidentEvidence.calibrationVerified,false);
for(const key of ['derivedSceneLux','measuredSceneEv100','recommendedAperture','recommendedIso'])
  assert.equal(sceneContext[key],null,'do not derive '+key+' from scene meter reading');
assert.equal(sceneContext.cameraExposureVerified,false);
assert.equal(sceneContext.manufacturerPhotometricsUsed,false);
assert.equal(core.analyzeMeteredExposureContext(ratioD,'L1','L2')
  .sceneIncidentEvidence.userReportedLux,null,'no meter report means no scene lux');

// Re-attestation of physical setup invalidates combined-scene evidence
// only in the next revision, never in its validated ancestor.
const sceneMoved=core.createDistanceMeasurementRevision(sceneRev,{
  lightId:'L1',distanceM:4,confirmed:true
});
assert.equal(sceneMoved.plan.sceneIncidentLuxReading,undefined);
assert.equal(sceneMoved.plan.dataStatus.sceneIncidentLuxReading,undefined);
assert.equal(sceneRev.plan.sceneIncidentLuxReading.lux,650.125);
assert.equal(core.verifyRevision(sceneMoved),true);
const sceneOptic=core.createSceneIncidentLuxRevision(meterRevision,sceneInput);
const opticChangedAfterScene=core.createMountedOpticRevision(sceneOptic,{
  lightId:'L1',opticId:'HYPER_REFLECTOR_55',confirmed:true
});
assert.equal(opticChangedAfterScene.plan.sceneIncidentLuxReading,undefined,
  'a reconfirmed mounted optic must invalidate total-on-set lux');
assert.equal(sceneOptic.plan.sceneIncidentLuxReading.lux,650.125);
const sceneWithExtraIsolated=core.createIncidentLuxRevision(sceneRev,{
  ...commonContext,lightId:'L1',lux:390,confirmed:true,fixtureIsolated:true
});
assert.equal(sceneWithExtraIsolated.plan.sceneIncidentLuxReading.lux,650.125,
  're-reading an isolated lamp is not itself a new intended all-on setup');
const sceneReplacement=core.createSceneIncidentLuxRevision(sceneRev,{...sceneInput,lux:0});
assert.equal(sceneReplacement.plan.sceneIncidentLuxReading.lux,0,
  'meter zero is a valid reported observation, not a calibrated exposure');
assert.equal(sceneRev.plan.sceneIncidentLuxReading.lux,650.125);
assert.equal(core.restoreRevisions([ratioPlan,ratioA,ratioB,ratioC,ratioD,sceneRev,sceneReplacement]).length,7);
const refreshedAI=core.createRevision(generated.plan,raw,'ai',sceneRev,'ratio-demo');
assert.equal(refreshedAI.plan.sceneIncidentLuxReading,undefined,
  'an AI revision never inherits physical scene readings from a previous setup');
const bestScene=core.createRevision(core.localPlan({mode:'best',description:'test'}),{
  mode:'best',description:'test'},'local',null,'unowned-scene');
assert.throws(()=>core.createSceneIncidentLuxRevision(bestScene,sceneInput),/owned/i);
for(const invalid of [
  {...sceneInput,confirmed:false},{...sceneInput,allSourcesActiveConfirmed:false},
  {...sceneInput,lux:-1},{...sceneInput,lux:'700abc'},
  {...sceneInput,lux:1000000.001},{...sceneInput,lux:'1e3'},
  {...sceneInput,meterModel:'<fake>'},{...sceneInput,meterIdentifier:''},
  {...sceneInput,measurementPoint:' '},{...sceneInput,measuredAtLocal:''},
  {...sceneInput,measuredAtLocal:'2026-02-30T10:00'},
  {...sceneInput,measuredUtcOffset:'Europe/Belgrade'},
  {...sceneInput,measuredUtcOffset:'+15:00'},
  {...sceneInput,measuredUtcOffset:'+02:17'}
]){
  assert.throws(()=>core.createSceneIncidentLuxRevision(ratioD,invalid),
    /scene|meter|lighting|lux|owned/i,'missing/unverified scene evidence must fail closed');
}
const modifiedScene=JSON.parse(JSON.stringify(sceneRev));
modifiedScene.plan.sceneIncidentLuxReading.lux=123;
assert.throws(()=>core.verifyRevision(modifiedScene),/integrity|Invalid|mismatch/i);
const staleScene=JSON.parse(JSON.stringify(sceneRev));
staleScene.plan.lights[0].x=20;
assert.throws(()=>core.verifyRevision(staleScene),/stale|integrity|Invalid/i,
  'stale planned-setup fingerprint must be rejected');
const orphanScene=JSON.parse(JSON.stringify(ratioD));
orphanScene.plan.dataStatus.sceneIncidentLuxReading='user-reported-not-independently-verified';
assert.throws(()=>core.verifyRevision(orphanScene),/Orphaned/i);
const forgedSource=JSON.parse(JSON.stringify(sceneRev));
forgedSource.plan.sceneIncidentLuxReading.source='MANUFACTURER_REFERENCE';
assert.throws(()=>core.verifyRevision(forgedSource),/Invalid/i);

assert.equal(positive.meterProtocolVersion,2,'previous V2 workflow must remain readable');
assert.equal(positive.timeBasis,'LEGACY_UNVERIFIED_LOCAL_WALL_CLOCK');
assert.equal(positive.meterIdentifier,null);
assert.equal(positive.independentInstrumentIdentityVerified,false);

// V3 captures the specific user-identified meter and each reading's explicit UTC offset.
const v3context={...commonContext,meterIdentifier:'SET-METER-01',
  measuredUtcOffset:'+02:00',measuredAtLocal:'2026-10-25T02:55'};
const v3A=core.createIncidentLuxRevision(ratioB,{
  ...v3context,lightId:'L1',lux:400,confirmed:true,fixtureIsolated:true
});
const v3B=core.createIncidentLuxRevision(v3A,{
  ...v3context,lightId:'L2',lux:100,confirmed:true,fixtureIsolated:true,
  measuredAtLocal:'2026-10-25T02:05',measuredUtcOffset:'+01:00'
});
assert.equal(v3A.plan.incidentLuxReadings[0].protocolVersion,3);
assert.equal(v3A.plan.incidentLuxReadings[0].meterIdentifier,'SET-METER-01');
assert.equal(v3A.plan.incidentLuxReadings[0].utcOffsetMinutes,120);
assert.equal(v3B.plan.incidentLuxReadings[1].utcOffsetMinutes,60);
const v3ratio=core.compareKeyFillMeasurements(v3B,'L1','L2');
assert.equal(v3ratio.status,'COMPARABLE_BY_USER_REPORTED_PROTOCOL_ONLY');
assert.equal(v3ratio.meterProtocolVersion,3);
assert.equal(v3ratio.meterIdentifier,'SET-METER-01');
assert.equal(v3ratio.timeBasis,'USER_DECLARED_UTC_OFFSET');
assert.equal(v3ratio.minutesApart,10,
  'DST fallback of one wall-clock hour must be converted to 10 actual minutes');
assert.deepEqual([v3ratio.ratio,v3ratio.relativeStops],[4,2]);
assert.equal(v3ratio.sceneContrastVerified,false);
assert.equal(v3ratio.independentInstrumentIdentityVerified,false);
assert.equal(core.analyzeMeteredExposureContext(v3B,'L1','L2').incidentEvidence.timeBasis,
  'USER_DECLARED_UTC_OFFSET');
assert.equal(core.analyzeMeteredExposureContext(v3B,'L1','L2').cameraExposureVerified,false);
assert.equal(core.restoreRevisions([ratioPlan,ratioA,ratioB,v3A,v3B]).length,5,
  'V3 records must be restorable with immutable history');

const mismatchedIdentifier=core.createIncidentLuxRevision(v3A,{
  ...v3context,lightId:'L2',lux:100,confirmed:true,fixtureIsolated:true,
  meterIdentifier:'SET-METER-02'
});
assert.equal(core.compareKeyFillMeasurements(mismatchedIdentifier,'L1','L2').reason,
  'DIFFERENT_METER_IDENTIFIERS');
assert.equal(core.compareKeyFillMeasurements(mismatchedIdentifier,'L1','L2').relativeStops,null);
const mismatchedOffset=core.createIncidentLuxRevision(v3A,{
  ...v3context,lightId:'L2',lux:100,confirmed:true,fixtureIsolated:true,
  measuredAtLocal:'2026-10-25T02:59',measuredUtcOffset:'+01:00'
});
assert.equal(core.compareKeyFillMeasurements(mismatchedOffset,'L1','L2').reason,
  'MEASUREMENT_TIMES_TOO_FAR_APART',
  'nearby wall-clock times cannot bypass an hour of actual UTC elapsed time');
const exactlyFifteen=core.createIncidentLuxRevision(v3A,{
  ...v3context,lightId:'L2',lux:100,confirmed:true,fixtureIsolated:true,
  measuredAtLocal:'2026-10-25T02:10',measuredUtcOffset:'+01:00'
});
assert.equal(core.compareKeyFillMeasurements(exactlyFifteen,'L1','L2').minutesApart,15);
const sixteenMinutes=core.createIncidentLuxRevision(v3A,{
  ...v3context,lightId:'L2',lux:100,confirmed:true,fixtureIsolated:true,
  measuredAtLocal:'2026-10-25T02:11',measuredUtcOffset:'+01:00'
});
assert.equal(core.compareKeyFillMeasurements(sixteenMinutes,'L1','L2').reason,
  'MEASUREMENT_TIMES_TOO_FAR_APART');
const mixedProtocol=core.createIncidentLuxRevision(ratioC,{
  ...v3context,lightId:'L2',lux:100,confirmed:true,fixtureIsolated:true
});
const mixedRatio=core.compareKeyFillMeasurements(mixedProtocol,'L1','L2');
assert.equal(mixedRatio.reason,'MIXED_METER_PROTOCOLS');
assert.equal(mixedRatio.ratio,null);
assert.equal(mixedRatio.relativeStops,null);
assert.equal(core.analyzeMeteredExposureContext(mixedProtocol,'L1','L2').status,
  'CAMERA_SETTINGS_ONLY','never combine V2 and V3 meter evidence');
for(const badOffset of ['+02:99','+15:00','-13:00','+02:17','Europe/Belgrade','Z',
  '+2:00','02:00','+14:15','',null,120]){
  assert.throws(()=>core.createIncidentLuxRevision(ratioB,{
    ...v3context,lightId:'L1',lux:400,confirmed:true,fixtureIsolated:true,
    measuredUtcOffset:badOffset
  }),/V3 incident meter/i,'bad UTC offset must fail closed: '+badOffset);
}
for(const missing of [
  {meterIdentifier:'',measuredUtcOffset:'+02:00'},
  {meterIdentifier:'SET-METER-01',measuredUtcOffset:''},
  {meterIdentifier:'  ',measuredUtcOffset:'+02:00'},
  {meterIdentifier:'SET-METER-01',measuredAtLocal:''}
]){
  assert.throws(()=>core.createIncidentLuxRevision(ratioB,{
    ...v3context,...missing,lightId:'L1',lux:400,confirmed:true,fixtureIsolated:true
  }),/V3 incident meter/i,'incomplete V3 must not silently downgrade to V2');
}
const tamperedV3=JSON.parse(JSON.stringify(v3B));
tamperedV3.plan.incidentLuxReadings[0].utcOffsetMinutes=0;
assert.throws(()=>core.restoreRevisions([ratioPlan,ratioA,ratioB,v3A,tamperedV3]),
  /integrity|Invalid|mismatch/i,'tampering with V3 offset must break revision integrity');
const spoofedV2=JSON.parse(JSON.stringify(ratioD));
spoofedV2.plan.incidentLuxReadings[0].meterIdentifier='FORGED-ID';
assert.throws(()=>core.verifyRevision(spoofedV2),/V2 reading cannot claim V3/i);
const spoofedV3=JSON.parse(JSON.stringify(v3B));
spoofedV3.plan.incidentLuxReadings[1].utcOffsetMinutes=90;
assert.throws(()=>core.verifyRevision(spoofedV3),/integrity|Invalid|mismatch/i);
assert.ok(positive.bookCardIds.every(id=>ratioD.plan.knowledgeBasis.cards.some(c=>c.id===id)));

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
assert.match(uiSource,/analyzeMeteredExposureContext\(current/);
assert.match(uiSource,/nominalSettingsEv100/);
assert.match(uiSource,/pair\.relativeStops/);
assert.match(uiSource,/card\.validation/,'validated book checks must reach the user');
assert.match(uiSource,/sp-meter-identifier-/,'UI must let users tag a specific physical meter');
assert.match(uiSource,/sp-meter-offset-/,'UI must capture UTC offset at the moment of reading');
assert.match(uiSource,/formatMeterUtcOffset/,'offset provenance must be printable');
assert.match(uiSource,/meterIdentifier:el\(/,'new meter tag must reach revision creator');
assert.match(uiSource,/measuredUtcOffset:el\(/,'offset must reach revision creator');
assert.match(uiSource,/createSceneIncidentLuxRevision\(revisions/);
assert.match(uiSource,/sp-scene-total-lux/);
assert.match(uiSource,/sp-scene-total-measured/);
assert.match(uiSource,/sp-scene-total-active/);
assert.match(uiSource,/sceneIncidentEvidence\.userReportedLux/);
assert.match(uiSource,/Ne sabirati sa izolovanim|Ne sabirati/i);
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
