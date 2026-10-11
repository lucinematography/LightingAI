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

// The reported camera waveform is not sampled by the app and is NEVER
// converted to lux, camera EV, aperture, ISO, or a default gray-card IRE.
const waveInput={
  confirmed:true,grayCardPlacedConfirmed:true,cameraSettingsMatchedConfirmed:true,
  allSourcesActiveConfirmed:true,waveformIre:'42.5',
  cameraModel:'ALEXA 35 test camera',recordingProfile:'LogC4 profile test',
  grayCardIdentifier:'Neutral gray mark A',
  waveformSource:'CAMERA_INTERNAL',signalPath:'RECORDING_SIGNAL',
  measurementPoint:'Face mark A',measuredAtLocal:'2026-10-11T16:12',
  measuredUtcOffset:'+02:00',userReferenceIre:'40.0',
  referenceBasis:'DoP-selected reference for this camera/profile and waveform path'
};
assert.throws(()=>core.createCameraGrayCardWaveformRevision(ratioD,waveInput),
  /whole-scene meter/i,'isolated key/fill readings cannot create camera waveform evidence');
const waveRev=core.createCameraGrayCardWaveformRevision(sceneRev,waveInput);
const wave=waveRev.plan.cameraGrayCardWaveformReading;
assert.equal(waveRev.parentRevisionId,sceneRev.revisionId);
assert.equal(waveRev.sequence,sceneRev.sequence+1);
assert.equal(waveRev.plan.dataStatus.cameraGrayCardWaveformReading,
  'user-reported-not-independently-verified');
assert.equal(wave.protocolVersion,1);
assert.equal(wave.source,'USER_REPORTED_GRAY_CARD_WAVEFORM_NOT_INDEPENDENTLY_VERIFIED');
assert.equal(wave.waveformIre,42.5);
assert.equal(wave.userReferenceIre,40);
assert.equal(wave.referenceBasis,waveInput.referenceBasis);
assert.equal(wave.grayCardPlacedConfirmed,true);
assert.equal(wave.cameraSettingsMatchedConfirmed,true);
assert.equal(wave.allSourcesActiveConfirmed,true);
assert.equal(wave.calibrationStatus,'NOT_INDEPENDENTLY_VERIFIED');
assert.equal(wave.sceneReadingHash,core.sha256(core.canonicalJson(sceneLux)));
assert.equal(wave.cameraSettingsHash,core.sha256(core.canonicalJson(sceneRev.plan.cameraSettings)));
assert.equal(core.verifyRevision(waveRev),true);
assert.equal(sceneRev.plan.cameraGrayCardWaveformReading,undefined,
  'prior revision is immutable');
assert.equal(core.restoreRevisions([ratioPlan,ratioA,ratioB,ratioC,ratioD,sceneRev,waveRev]).length,7);
const waveContext=core.analyzeMeteredExposureContext(waveRev,'L1','L2');
const evidence=waveContext.cameraWaveformEvidence;
assert.equal(evidence.status,'USER_REPORTED_GRAY_CARD_SIGNAL_NOT_CALIBRATED');
assert.equal(evidence.waveformIre,42.5);
assert.equal(evidence.unit,'IRE');
assert.equal(evidence.userReferenceIre,40);
assert.equal(evidence.referenceDifferenceIrePoints,2.5,
  'only arithmetic IRE percentage point difference, NOT stops');
assert.equal(evidence.sceneMeterMinutesApart,7);
assert.equal(evidence.signalPath,'RECORDING_SIGNAL');
assert.equal(evidence.cameraModel,waveInput.cameraModel);
assert.equal(evidence.cameraSettingsHash,wave.cameraSettingsHash);
assert.equal(evidence.sceneReadingHash,wave.sceneReadingHash);
for(const flag of ['cameraSettingsVerified','monitorSignalPathVerified',
  'grayCardReflectanceVerified','referenceStandardVerified','exposureVerified'])
  assert.equal(evidence[flag],false,'user attestation is not independent '+flag);
assert.equal(evidence.derivedExposureStops,null);
for(const field of ['derivedSceneLux','measuredSceneEv100','recommendedAperture','recommendedIso'])
  assert.equal(waveContext[field],null,'waveform must never supply '+field);
assert.equal(waveContext.cameraExposureVerified,false);
assert.equal(waveContext.sceneExposureVerified,false);
assert.equal(waveContext.meterCalibrationVerified,false);
assert.equal(waveContext.camera.nominalSettingsEv100,sceneContext.camera.nominalSettingsEv100);
assert.ok(evidence.bookGuidance.every(book=>
  waveRev.plan.knowledgeBasis.cards.some(c=>c.id===book.id&&
    c.principle===book.principle&&c.validation===book.validation&&
    c.limitations===book.limitations)),
  'waveform must explain itself only with cards actually attached to revision');
assert.ok(evidence.bookGuidance.every(c=>['EXP-001','EXP-002','EXP-003'].includes(c.id)));
assert.equal(Object.isFrozen(waveContext),true);
assert.equal(Object.isFrozen(evidence),true);
assert.equal(evidence.protocolVersion,1);
assert.equal(evidence.referenceComparisonStatus,'LEGACY_V1_REFERENCE_SIGNAL_CHAIN_INCOMPLETE');
assert.equal(evidence.signalCodeRange,null);
assert.equal(evidence.observedTransferLabel,null);
assert.equal(evidence.referenceContextHash,null);
assert.equal(core.verifyRevision(waveRev),true,'V1 history remains readable without V2 backfill');

// V2 requires an explicit and consistent description of the displayed signal.
// No camera profile or target IRE is inferred by the system.
const waveformV2Input={
  ...waveInput,protocolVersion:2,signalCodeRange:'FULL_DATA',
  observedTransferLabel:'Camera recording LogC4, user-reported',
  monitoringTransformId:'',referenceContextConfirmed:true
};
const waveformV2Rev=core.createCameraGrayCardWaveformRevision(sceneRev,waveformV2Input);
const waveformV2=waveformV2Rev.plan.cameraGrayCardWaveformReading;
assert.equal(waveformV2.protocolVersion,2);
assert.equal(waveformV2.signalCodeRange,'FULL_DATA');
assert.equal(waveformV2.monitoringTransformId,null);
assert.equal(waveformV2.observedTransferLabel,waveformV2Input.observedTransferLabel);
assert.equal(waveformV2.referenceContextConfirmed,true);
assert.match(waveformV2.signalContextHash,/^[a-f0-9]{64}$/);
assert.equal(waveformV2.referenceContextHash,waveformV2.signalContextHash);
const v2Context=core.analyzeMeteredExposureContext(waveformV2Rev,'L1','L2');
const v2E=v2Context.cameraWaveformEvidence;
assert.equal(v2E.protocolVersion,2);
assert.equal(v2E.signalCodeRange,'FULL_DATA');
assert.equal(v2E.observedTransferLabel,waveformV2Input.observedTransferLabel);
assert.equal(v2E.monitoringTransformId,null);
assert.equal(v2E.referenceContextHash,waveformV2.signalContextHash);
assert.equal(v2E.signalContextHash,waveformV2.signalContextHash);
assert.equal(v2E.referenceContextConfirmed,true);
assert.equal(v2E.referenceComparisonStatus,'V2_USER_ATTESTED_SIGNAL_CONTEXT_NOT_VERIFIED');
assert.equal(v2E.referenceDifferenceIrePoints,2.5);
assert.equal(v2E.derivedExposureStops,null);
assert.equal(v2Context.measuredSceneEv100,null);
assert.equal(v2Context.recommendedAperture,null);
assert.equal(v2Context.recommendedIso,null);
for(const f of ['signalCodeRangeVerified','transferFunctionVerified','monitoringTransformVerified',
  'cameraSettingsVerified','monitorSignalPathVerified','referenceStandardVerified',
  'grayCardReflectanceVerified','exposureVerified']){
  assert.equal(v2E[f],false,'a declared camera signal context cannot prove '+f);
}
assert.equal(Object.isFrozen(v2E),true);
assert.equal(core.restoreRevisions([ratioPlan,ratioA,ratioB,ratioC,ratioD,sceneRev,waveformV2Rev]).length,7,
  'V2 camera waveform must preserve previous immutable history');
assert.equal(sceneRev.plan.cameraGrayCardWaveformReading,undefined);

const displayV2Input={
  ...waveformV2Input,signalPath:'DISPLAY_LUT_SIGNAL',
  waveformSource:'EXTERNAL_MONITOR',signalCodeRange:'VIDEO_LEGAL',
  observedTransferLabel:'Operator monitor transform to Rec.709',
  monitoringTransformId:'MONITOR_LUT_709_REV_A'
};
const displayV2=core.createCameraGrayCardWaveformRevision(sceneRev,displayV2Input);
const displayEvidence=core.analyzeMeteredExposureContext(displayV2,'L1','L2')
  .cameraWaveformEvidence;
assert.equal(displayEvidence.monitoringTransformId,'MONITOR_LUT_709_REV_A');
assert.equal(displayEvidence.signalCodeRange,'VIDEO_LEGAL');
assert.equal(displayEvidence.referenceContextHash,displayEvidence.signalContextHash);
assert.notEqual(displayEvidence.signalContextHash,v2E.signalContextHash,
  'recording vs display-LUT paths are different user-declared signal contexts');
assert.equal(displayEvidence.referenceDifferenceIrePoints,2.5);
assert.equal(displayEvidence.referenceComparisonStatus,
  'V2_USER_ATTESTED_SIGNAL_CONTEXT_NOT_VERIFIED');

const observedOnlyV2=core.createCameraGrayCardWaveformRevision(sceneRev,{
  ...waveformV2Input,signalPath:'UNKNOWN',signalCodeRange:'UNKNOWN',
  observedTransferLabel:'Signal chain not confirmed by operator',
  userReferenceIre:'',referenceBasis:'',referenceContextConfirmed:false
});
const onlyEvidence=core.analyzeMeteredExposureContext(observedOnlyV2,'L1','L2')
  .cameraWaveformEvidence;
assert.equal(onlyEvidence.waveformIre,42.5);
assert.equal(onlyEvidence.referenceDifferenceIrePoints,null);
assert.equal(onlyEvidence.referenceComparisonStatus,'NO_USER_REFERENCE');
assert.equal(onlyEvidence.referenceContextConfirmed,false);
assert.equal(onlyEvidence.referenceContextHash,null);
assert.equal(observedOnlyV2.plan.cameraGrayCardWaveformReading.signalCodeRange,'UNKNOWN');
const unidentifiedLut=core.createCameraGrayCardWaveformRevision(sceneRev,{
  ...displayV2Input,monitoringTransformId:'',userReferenceIre:'',
  referenceBasis:'',referenceContextConfirmed:false
});
assert.equal(unidentifiedLut.plan.cameraGrayCardWaveformReading.monitoringTransformId,null);
assert.equal(core.analyzeMeteredExposureContext(unidentifiedLut,'L1','L2')
  .cameraWaveformEvidence.referenceDifferenceIrePoints,null);

// Two distinct, SHA-bound camera observations in the SAME contiguous
// revision chain. Numbers are IRE POINTS only; no IRE -> stops or lux.
const meterForSecondTake=core.createSceneIncidentLuxRevision(waveformV2Rev,{
  ...sceneInput,lux:'701.5',measuredAtLocal:'2026-10-11T16:20'
});
const secondTake=core.createCameraGrayCardWaveformRevision(meterForSecondTake,{
  ...waveformV2Input,waveformIre:'46.0',measuredAtLocal:'2026-10-11T16:23'
});
const twoTakeHistory=[ratioPlan,ratioA,ratioB,ratioC,ratioD,
  sceneRev,waveformV2Rev,meterForSecondTake,secondTake];
const twoTake=core.compareGrayCardWaveformRevisions(twoTakeHistory,
  waveformV2Rev.revisionId,secondTake.revisionId);
assert.equal(twoTake.contract,'lightingai-gray-card-waveform-revision-comparison/1');
assert.equal(twoTake.status,'USER_REPORTED_IRE_LEVEL_DIFFERENCE_ONLY');
assert.equal(twoTake.reason,null);
assert.equal(twoTake.beforeRevisionId,waveformV2Rev.revisionId);
assert.equal(twoTake.afterRevisionId,secondTake.revisionId);
assert.deepEqual([twoTake.beforeIre,twoTake.afterIre,twoTake.deltaIrePoints],[42.5,46,3.5]);
assert.equal(twoTake.minutesBetween,11);
assert.equal(twoTake.signalCodeRange,'FULL_DATA');
assert.equal(twoTake.recordingProfile,waveformV2Input.recordingProfile);
assert.equal(twoTake.grayCardIdentifier,waveformV2Input.grayCardIdentifier);
assert.equal(twoTake.measurementPoint,waveformV2Input.measurementPoint);
assert.equal(twoTake.plannedSetupFingerprintMatches,true,
  'setup plan fingerprints can match even though measured lux changed');
assert.equal(twoTake.userReferenceComparisonUsed,false,
  'comparison of two observations does not assume a universal target IRE');
for(const flag of ['waveformInstrumentVerified','profileVerified','grayCardReflectanceVerified',
  'ambientStabilityVerified','physicalRigStateVerified','cameraExposureVerified'])
  assert.equal(twoTake[flag],false,'a matching signal chain cannot prove '+flag);
for(const field of ['derivedExposureStops','derivedSceneEv100',
  'recommendedAperture','recommendedIso'])
  assert.equal(twoTake[field],null,'no measured camera exposure from '+field);
assert.ok(twoTake.bookGuidance.every(card=>
  secondTake.plan.knowledgeBasis.cards.some(c=>c.id===card.id&&
    c.principle===card.principle&&c.validation===card.validation&&
    c.limitations===card.limitations)),
  'book explanations must be precisely attached to active after revision');
assert.equal(Object.isFrozen(twoTake),true);
assert.equal(Object.isFrozen(twoTake.bookGuidance),true);
assert.equal(core.restoreRevisions(twoTakeHistory).length,9);
assert.equal(waveformV2Rev.plan.cameraGrayCardWaveformReading.waveformIre,42.5);
assert.equal(secondTake.plan.cameraGrayCardWaveformReading.waveformIre,46);

// New child revisions can carry the SAME waveform record after isolated lux
// readings. Such snapshots must not masquerade as fresh camera captures.
const onlyFirstCapture=core.listGrayCardWaveformCaptures([
  ratioPlan,ratioA,ratioB,ratioC,ratioD,sceneRev,waveformV2Rev]);
assert.equal(onlyFirstCapture.contract,'lightingai-gray-card-waveform-capture-index/1');
assert.deepEqual(onlyFirstCapture.captureRevisionIds,[waveformV2Rev.revisionId]);
assert.equal(onlyFirstCapture.currentRevisionId,waveformV2Rev.revisionId);
assert.equal(onlyFirstCapture.activeCaptureRevisionId,waveformV2Rev.revisionId);
assert.equal(onlyFirstCapture.currentWaveformInherited,false);
assert.equal(onlyFirstCapture.currentWaveformPresent,true);
assert.equal(Object.isFrozen(onlyFirstCapture),true);
assert.equal(Object.isFrozen(onlyFirstCapture.captureRevisionIds),true);
const carriedOldWave=core.createIncidentLuxRevision(waveformV2Rev,{
  ...commonContext,lightId:'L1',lux:390,confirmed:true,fixtureIsolated:true
});
const carriedHistory=[ratioPlan,ratioA,ratioB,ratioC,ratioD,sceneRev,
  waveformV2Rev,carriedOldWave];
const carriedIndex=core.listGrayCardWaveformCaptures(carriedHistory);
assert.deepEqual(carriedIndex.captureRevisionIds,[waveformV2Rev.revisionId]);
assert.equal(carriedIndex.currentWaveformInherited,true);
assert.equal(carriedIndex.activeCaptureRevisionId,waveformV2Rev.revisionId);
assert.equal(carriedOldWave.plan.cameraGrayCardWaveformReading.waveformIre,42.5);
const carriedDirect=core.compareGrayCardWaveformRevisions(carriedHistory,
  waveformV2Rev.revisionId,carriedOldWave.revisionId);
assert.equal(carriedDirect.reason,'INHERITED_WAVEFORM_NOT_A_NEW_OBSERVATION');
assert.equal(carriedDirect.status,'NOT_COMPARABLE');
assert.equal(carriedDirect.beforeIre,null);
assert.equal(carriedDirect.afterIre,null);
assert.equal(carriedDirect.deltaIrePoints,null);
assert.equal(carriedDirect.derivedExposureStops,null);
const reenteredSameWave=core.createCameraGrayCardWaveformRevision(waveformV2Rev,
  waveformV2Input);
const exactRepeatHistory=[ratioPlan,ratioA,ratioB,ratioC,ratioD,sceneRev,
  waveformV2Rev,reenteredSameWave];
assert.deepEqual(core.listGrayCardWaveformCaptures(exactRepeatHistory).captureRevisionIds,
  [waveformV2Rev.revisionId],
  'an identical observation with the same timestamp is not evidence of a second capture');
assert.equal(core.compareGrayCardWaveformRevisions(exactRepeatHistory,
  waveformV2Rev.revisionId,reenteredSameWave.revisionId).reason,
  'INHERITED_WAVEFORM_NOT_A_NEW_OBSERVATION');
const twoCaptureIndex=core.listGrayCardWaveformCaptures(twoTakeHistory);
assert.deepEqual(twoCaptureIndex.captureRevisionIds,
  [waveformV2Rev.revisionId,secondTake.revisionId]);
assert.equal(twoCaptureIndex.currentWaveformInherited,false);
const inheritedAfterSecond=core.createIncidentLuxRevision(secondTake,{
  ...commonContext,lightId:'L1',lux:330,confirmed:true,fixtureIsolated:true
});
const afterSecondHistory=[...twoTakeHistory,inheritedAfterSecond];
const afterSecondIndex=core.listGrayCardWaveformCaptures(afterSecondHistory);
assert.deepEqual(afterSecondIndex.captureRevisionIds,
  [waveformV2Rev.revisionId,secondTake.revisionId],
  'UI must show the two actual measurement events, not second plus copied second');
assert.equal(afterSecondIndex.activeCaptureRevisionId,secondTake.revisionId);
assert.equal(afterSecondIndex.currentWaveformInherited,true);
assert.equal(core.compareGrayCardWaveformRevisions(afterSecondHistory,
  waveformV2Rev.revisionId,secondTake.revisionId).deltaIrePoints,3.5);
assert.equal(core.compareGrayCardWaveformRevisions(afterSecondHistory,
  secondTake.revisionId,inheritedAfterSecond.revisionId).reason,
  'INHERITED_WAVEFORM_NOT_A_NEW_OBSERVATION');
const afterFirstInheritedMeter=core.createSceneIncidentLuxRevision(carriedOldWave,{
  ...sceneInput,lux:'701.5',measuredAtLocal:'2026-10-11T16:20'
});
const afterFirstInheritedWave=core.createCameraGrayCardWaveformRevision(
  afterFirstInheritedMeter,{
    ...waveformV2Input,waveformIre:'46.0',measuredAtLocal:'2026-10-11T16:23'
  });
const inheritedFirstChain=[...carriedHistory,afterFirstInheritedMeter,afterFirstInheritedWave];
assert.deepEqual(core.listGrayCardWaveformCaptures(inheritedFirstChain).captureRevisionIds,
  [waveformV2Rev.revisionId,afterFirstInheritedWave.revisionId]);
assert.equal(core.compareGrayCardWaveformRevisions(inheritedFirstChain,
  carriedOldWave.revisionId,afterFirstInheritedWave.revisionId).reason,
  'INHERITED_WAVEFORM_NOT_A_NEW_OBSERVATION',
  'an inherited first endpoint is not an independent earlier measurement');
assert.equal(core.compareGrayCardWaveformRevisions(inheritedFirstChain,
  waveformV2Rev.revisionId,afterFirstInheritedWave.revisionId).deltaIrePoints,3.5);
const noActiveWave=core.listGrayCardWaveformCaptures(twoTakeHistory.slice(0,-1));
assert.equal(noActiveWave.currentWaveformPresent,false);
assert.equal(noActiveWave.activeCaptureRevisionId,null);
assert.equal(noActiveWave.currentWaveformInherited,false);
assert.deepEqual(noActiveWave.captureRevisionIds,[waveformV2Rev.revisionId]);
assert.throws(()=>core.listGrayCardWaveformCaptures(twoTakeHistory.slice(1)),
  /Broken revision history/i,'capture indexing must reject truncated history');
const invalidCaptureRecord=JSON.parse(JSON.stringify(inheritedAfterSecond));
invalidCaptureRecord.plan.cameraGrayCardWaveformReading.waveformIre=5;
assert.throws(()=>core.listGrayCardWaveformCaptures([
  ...afterSecondHistory.slice(0,-1),invalidCaptureRecord]),
  /integrity|Invalid|mismatch/i,'an inherited snapshot cannot bypass SHA integrity');

function secondTakeCompare(overrides,sceneOverrides){
  const metered=core.createSceneIncidentLuxRevision(waveformV2Rev,{
    ...sceneInput,lux:'701.5',measuredAtLocal:'2026-10-11T16:20',
    ...(sceneOverrides||{})
  });
  const captured=core.createCameraGrayCardWaveformRevision(metered,{
    ...waveformV2Input,waveformIre:'46.0',measuredAtLocal:'2026-10-11T16:23',
    ...(overrides||{})
  });
  return core.compareGrayCardWaveformRevisions([
    ratioPlan,ratioA,ratioB,ratioC,ratioD,sceneRev,waveformV2Rev,
    metered,captured],waveformV2Rev.revisionId,captured.revisionId);
}
assert.equal(secondTakeCompare({waveformIre:37.5}).deltaIrePoints,-5,
  'a darker second gray card must preserve negative signed IRE delta');
assert.equal(secondTakeCompare({waveformIre:42.5}).deltaIrePoints,0);
assert.equal(secondTakeCompare({...displayV2Input,waveformIre:46,
  measuredAtLocal:'2026-10-11T16:23'}).reason,'DIFFERENT_WAVEFORM_SIGNAL_CONTEXT',
  'recording and display LUT signal paths cannot be compared');
assert.equal(secondTakeCompare({grayCardIdentifier:'New card'}).reason,
  'DIFFERENT_GRAY_CARD_IDENTIFIERS');
assert.equal(secondTakeCompare({recordingProfile:'Another gamma profile'}).reason,
  'DIFFERENT_CAMERA_PROFILE');
assert.equal(secondTakeCompare({measurementPoint:'Second subject mark'},
  {measurementPoint:'Second subject mark'}).reason,'DIFFERENT_MEASUREMENT_POINTS');
assert.equal(secondTakeCompare({measuredAtLocal:'2026-10-11T16:12'}).reason,
  'MEASUREMENT_TIMES_NOT_CHRONOLOGICAL');
assert.equal(secondTakeCompare({measuredAtLocal:'2026-10-11T16:11'}).reason,
  'MEASUREMENT_TIMES_NOT_CHRONOLOGICAL');
const unknownSecondMeter=core.createSceneIncidentLuxRevision(observedOnlyV2,{
  ...sceneInput,measuredAtLocal:'2026-10-11T16:20'
});
const unknownSecondWave=core.createCameraGrayCardWaveformRevision(unknownSecondMeter,{
  ...waveformV2Input,signalPath:'UNKNOWN',signalCodeRange:'UNKNOWN',
  observedTransferLabel:'Signal chain not confirmed by operator',
  userReferenceIre:'',referenceBasis:'',referenceContextConfirmed:false,
  waveformIre:45,measuredAtLocal:'2026-10-11T16:23'
});
assert.equal(core.compareGrayCardWaveformRevisions([
  ratioPlan,ratioA,ratioB,ratioC,ratioD,sceneRev,observedOnlyV2,
  unknownSecondMeter,unknownSecondWave],
  observedOnlyV2.revisionId,unknownSecondWave.revisionId).reason,
  'INCOMPLETE_WAVEFORM_SIGNAL_CONTEXT');
const V1SecondMeter=core.createSceneIncidentLuxRevision(waveRev,{
  ...sceneInput,measuredAtLocal:'2026-10-11T16:20'
});
const V1SecondWave=core.createCameraGrayCardWaveformRevision(V1SecondMeter,{
  ...waveformV2Input,measuredAtLocal:'2026-10-11T16:23'
});
assert.equal(core.compareGrayCardWaveformRevisions([
  ratioPlan,ratioA,ratioB,ratioC,ratioD,sceneRev,waveRev,
  V1SecondMeter,V1SecondWave],waveRev.revisionId,V1SecondWave.revisionId).reason,
  'V2_SIGNAL_CONTEXT_REQUIRED','legacy V1 remains readable but cannot be paired as V2');
assert.equal(core.compareGrayCardWaveformRevisions(twoTakeHistory,
  secondTake.revisionId,waveformV2Rev.revisionId).reason,
  'REVISIONS_NOT_CHRONOLOGICAL');
assert.equal(core.compareGrayCardWaveformRevisions(twoTakeHistory,
  'rev-'+'0'.repeat(64),secondTake.revisionId).reason,'UNKNOWN_REVISION');
assert.equal(core.compareGrayCardWaveformRevisions(twoTakeHistory,
  waveformV2Rev.revisionId,meterForSecondTake.revisionId).reason,
  'MISSING_GRAY_CARD_WAVEFORM');
const refusedSignal=secondTakeCompare({recordingProfile:'Different gamma'});
assert.equal(refusedSignal.status,'NOT_COMPARABLE');
assert.equal(refusedSignal.beforeIre,null);
assert.equal(refusedSignal.afterIre,null);
assert.equal(refusedSignal.deltaIrePoints,null);
assert.equal(refusedSignal.minutesBetween,null);
assert.equal(refusedSignal.cameraExposureVerified,false);
const incompleteTakeHistory=twoTakeHistory.filter(r=>r.revisionId!==meterForSecondTake.revisionId);
assert.throws(()=>core.compareGrayCardWaveformRevisions(incompleteTakeHistory,
  waveformV2Rev.revisionId,secondTake.revisionId),
  /Broken revision history/i,'missing history link must never create a comparison');
const tamperedTake=JSON.parse(JSON.stringify(secondTake));
tamperedTake.plan.cameraGrayCardWaveformReading.waveformIre=99;
assert.throws(()=>core.compareGrayCardWaveformRevisions([
  ...twoTakeHistory.slice(0,-1),tamperedTake],
  waveformV2Rev.revisionId,tamperedTake.revisionId),/integrity|Invalid|mismatch/i,
  'tampered final reading cannot be used for a revision comparison');

for(const badContext of [
  {signalCodeRange:'UNKNOWN'},
  {signalCodeRange:'STUDIO_UNSPECIFIED'},
  {signalCodeRange:'full_data'},
  {signalCodeRange:''},
  {observedTransferLabel:''},
  {observedTransferLabel:'<fake>'},
  {observedTransferLabel:'B'.repeat(121)},
  {signalPath:'UNKNOWN'},
  {signalPath:'DISPLAY_LUT_SIGNAL',monitoringTransformId:''},
  {signalPath:'DISPLAY_LUT_SIGNAL',monitoringTransformId:'<fake>'},
  {signalPath:'DISPLAY_LUT_SIGNAL',monitoringTransformId:'B'.repeat(121)},
  {signalPath:'RECORDING_SIGNAL',monitoringTransformId:'Unexpected LUT'},
  {referenceContextConfirmed:false},
  {referenceContextConfirmed:'true'},
  {referenceContextConfirmed:null},
  {userReferenceIre:'',referenceContextConfirmed:true,referenceBasis:''},
  {userReferenceIre:'',referenceContextConfirmed:false,referenceBasis:'still supplied'},
  {userReferenceIre:50,referenceBasis:''}
]){
  assert.throws(()=>core.createCameraGrayCardWaveformRevision(sceneRev,{
    ...waveformV2Input,...badContext
  }),/V2|waveform|reference|signal/i,
  'invalid V2 signal chain must fail closed: '+JSON.stringify(badContext));
}
assert.throws(()=>core.createCameraGrayCardWaveformRevision(sceneRev,{
  ...waveInput,signalCodeRange:'FULL_DATA'
}),/V2 signal metadata/i,'V2-only fields cannot silently become V1 records');
const forgedV1=JSON.parse(JSON.stringify(waveRev));
forgedV1.plan.cameraGrayCardWaveformReading.signalCodeRange='FULL_DATA';
assert.throws(()=>core.verifyRevision(forgedV1),/V1 camera waveform cannot assert V2/i);
const forgedRange=JSON.parse(JSON.stringify(waveformV2Rev));
forgedRange.plan.cameraGrayCardWaveformReading.signalCodeRange='VIDEO_LEGAL';
assert.throws(()=>core.verifyRevision(forgedRange),/Invalid V2|integrity|Invalid/i,
  'changing camera signal range must invalidate its recorded signal context');
const forgedDigest=JSON.parse(JSON.stringify(waveformV2Rev));
forgedDigest.plan.cameraGrayCardWaveformReading.signalContextHash='0'.repeat(64);
assert.throws(()=>core.verifyRevision(forgedDigest),/Invalid V2/i);
const forgedReferenceHash=JSON.parse(JSON.stringify(displayV2));
forgedReferenceHash.plan.cameraGrayCardWaveformReading.referenceContextHash='0'.repeat(64);
assert.throws(()=>core.verifyRevision(forgedReferenceHash),/V2 waveform reference/i);
const orphanV2=JSON.parse(JSON.stringify(waveformV2Rev));
delete orphanV2.plan.cameraGrayCardWaveformReading;
assert.throws(()=>core.verifyRevision(orphanV2),/Orphaned/i);
const invalidatedV2=core.createSceneIncidentLuxRevision(waveformV2Rev,sceneInput);
assert.equal(invalidatedV2.plan.cameraGrayCardWaveformReading,undefined);
assert.equal(waveformV2Rev.plan.cameraGrayCardWaveformReading.signalCodeRange,'FULL_DATA');

const lowWave=core.createCameraGrayCardWaveformRevision(waveRev,{
  ...waveInput,waveformIre:37.5
});
assert.equal(core.analyzeMeteredExposureContext(lowWave,'L1','L2')
  .cameraWaveformEvidence.referenceDifferenceIrePoints,-2.5,
  'preserve sign of IRE point difference; not an exposure stop');
const noReferenceWave=core.createCameraGrayCardWaveformRevision(sceneRev,{
  ...waveInput,signalPath:'UNKNOWN',userReferenceIre:'',referenceBasis:''
});
assert.equal(noReferenceWave.plan.cameraGrayCardWaveformReading.userReferenceIre,null);
assert.equal(noReferenceWave.plan.cameraGrayCardWaveformReading.referenceBasis,null);
assert.equal(core.analyzeMeteredExposureContext(noReferenceWave,'L1','L2')
  .cameraWaveformEvidence.referenceDifferenceIrePoints,null);
assert.equal(core.analyzeMeteredExposureContext(sceneRev,'L1','L2')
  .cameraWaveformEvidence.status,'NOT_RECORDED');
assert.equal(core.analyzeMeteredExposureContext(sceneRev,'L1','L2')
  .cameraWaveformEvidence.waveformIre,null);
for(const val of [0,109]){
  const edge=core.createCameraGrayCardWaveformRevision(sceneRev,{
    ...waveInput,waveformIre:val,userReferenceIre:'',referenceBasis:''
  });
  assert.equal(edge.plan.cameraGrayCardWaveformReading.waveformIre,val);
}
const fifteenWave=core.createCameraGrayCardWaveformRevision(sceneRev,{
  ...waveInput,measuredAtLocal:'2026-10-11T16:20'
});
assert.equal(core.analyzeMeteredExposureContext(fifteenWave,'L1','L2')
  .cameraWaveformEvidence.sceneMeterMinutesApart,15);
assert.throws(()=>core.createCameraGrayCardWaveformRevision(sceneRev,{
  ...waveInput,measuredAtLocal:'2026-10-11T16:21'
}),/15 minutes/i,'do not compare readings beyond the same short metering session');
for(const bad of [
  {confirmed:false},{grayCardPlacedConfirmed:false},{cameraSettingsMatchedConfirmed:false},
  {allSourcesActiveConfirmed:false},
  {waveformIre:-1},{waveformIre:109.1},{waveformIre:'1e2'},
  {waveformIre:'not IRE'},{waveformIre:'50.15'},
  {cameraModel:'<'},{recordingProfile:''},{grayCardIdentifier:' '},
  {waveformSource:'FABRICATED_CAMERA'},{signalPath:'HDR_ASSUMED'},
  {measurementPoint:'Different mark'}, {measuredAtLocal:'2026-02-30T16:12'},
  {measuredUtcOffset:'Z'}, {measuredUtcOffset:'+14:15'},
  {signalPath:'UNKNOWN'}, {userReferenceIre:'',referenceBasis:'still claims a reference'},
  {userReferenceIre:55,referenceBasis:''},
  {userReferenceIre:'',referenceBasis:waveInput.referenceBasis},
  {userReferenceIre:'110'},
  {userReferenceIre:'41.234'}
]){
  assert.throws(()=>core.createCameraGrayCardWaveformRevision(sceneRev,{
    ...waveInput,...bad
  }),/camera|card|lighting|waveform|reference|15 minutes/i,
  'invalid/missing waveform evidence must fail closed: '+JSON.stringify(bad));
}
const movedAfterWave=core.createDistanceMeasurementRevision(waveRev,{
  lightId:'L1',distanceM:4,confirmed:true
});
assert.equal(movedAfterWave.plan.sceneIncidentLuxReading,undefined);
assert.equal(movedAfterWave.plan.cameraGrayCardWaveformReading,undefined);
assert.equal(movedAfterWave.plan.dataStatus.cameraGrayCardWaveformReading,undefined);
assert.equal(waveRev.plan.cameraGrayCardWaveformReading.waveformIre,42.5);
const newSceneAfterWave=core.createSceneIncidentLuxRevision(waveRev,sceneInput);
assert.equal(newSceneAfterWave.plan.cameraGrayCardWaveformReading,undefined,
  'even a new scene reading at equal nominal lux invalidates old camera waveform');
const opticWaveBase=core.createSceneIncidentLuxRevision(meterRevision,sceneInput);
const waveOnOptic=core.createCameraGrayCardWaveformRevision(opticWaveBase,waveInput);
const opticAfterWave=core.createMountedOpticRevision(waveOnOptic,{
  lightId:'L1',opticId:'HYPER_REFLECTOR_55',confirmed:true
});
assert.equal(opticAfterWave.plan.cameraGrayCardWaveformReading,undefined);
assert.equal(waveOnOptic.plan.cameraGrayCardWaveformReading.waveformIre,42.5);
const rereadKeyAfterWave=core.createIncidentLuxRevision(waveRev,{
  ...commonContext,lightId:'L1',lux:250,confirmed:true,fixtureIsolated:true
});
assert.equal(rereadKeyAfterWave.plan.cameraGrayCardWaveformReading.waveformIre,42.5,
  'a new isolated reading cannot invent a change in the whole-scene camera state');
const aiAfterWave=core.createRevision(generated.plan,raw,'ai',waveRev,'ratio-demo');
assert.equal(aiAfterWave.plan.cameraGrayCardWaveformReading,undefined);
const alteredWave=JSON.parse(JSON.stringify(waveRev));
alteredWave.plan.cameraGrayCardWaveformReading.waveformIre=90;
assert.throws(()=>core.verifyRevision(alteredWave),/integrity|Invalid|mismatch/i);
const alteredCamera=JSON.parse(JSON.stringify(waveRev));
alteredCamera.plan.cameraSettings.iso=alteredCamera.plan.cameraSettings.iso===800?1600:800;
assert.throws(()=>core.verifyRevision(alteredCamera),
  /stale|integrity|Invalid/i,'waveform must bind to exact camera setting fingerprint');
const fakeReference=JSON.parse(JSON.stringify(waveRev));
fakeReference.plan.cameraGrayCardWaveformReading.referenceBasis='INTERNATIONAL STANDARD WITHOUT BASIS';
assert.throws(()=>core.verifyRevision(fakeReference),/integrity|Invalid|mismatch/i);
const orphanedWave=JSON.parse(JSON.stringify(sceneRev));
orphanedWave.plan.dataStatus.cameraGrayCardWaveformReading='user-reported-not-independently-verified';
assert.throws(()=>core.verifyRevision(orphanedWave),/Orphaned/i);
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

// The three-state comparison is METADATA ALIGNMENT, not additive photometry.
const noCombined=core.assessSceneMeterAlignment(v3B,'L1','L2');
assert.equal(noCombined.status,'NOT_ALIGNED');
assert.equal(noCombined.reason,'MISSING_ALL_SOURCES_ON_READING');
assert.equal(noCombined.sceneLux,null);
assert.equal(noCombined.keyLux,null);
assert.equal(noCombined.minutesSpan,null);
const sameSessionSceneInput={...sceneInput,
  meterModel:v3context.meterModel,meterIdentifier:v3context.meterIdentifier,
  measurementPoint:v3context.measurementPoint,
  measuredAtLocal:'2026-10-25T02:10',measuredUtcOffset:'+01:00'
};
const alignedThreeState=core.createSceneIncidentLuxRevision(v3B,sameSessionSceneInput);
const aligned=core.assessSceneMeterAlignment(alignedThreeState,'L1','L2');
assert.equal(aligned.contract,'lightingai-three-state-meter-alignment/1');
assert.equal(aligned.revisionId,alignedThreeState.revisionId);
assert.equal(aligned.planHash,alignedThreeState.planHash);
assert.equal(aligned.status,'ALIGNED_BY_USER_REPORTED_METADATA_ONLY');
assert.equal(aligned.reason,null);
assert.equal(aligned.minutesSpan,15,'DST transition and inclusive fifteen-minute bound');
assert.deepEqual([aligned.keyLux,aligned.fillLux,aligned.sceneLux],[400,100,650.125]);
assert.equal(aligned.meterModel,v3context.meterModel);
assert.equal(aligned.meterIdentifier,v3context.meterIdentifier);
assert.equal(aligned.measurementPoint,v3context.measurementPoint);
assert.equal(Object.isFrozen(aligned),true);
for(const check of ['cameraExposureVerified','meterCalibrationVerified',
  'physicalSetupVerified','ambientStabilityVerified','additiveLuxDecompositionSupported']){
  assert.equal(aligned[check],false,'three-state metadata never establishes '+check);
}
for(const missingResult of ['derivedAmbientLux','derivedSceneEv100',
  'recommendedAperture','recommendedIso']){
  assert.equal(aligned[missingResult],null,'do not infer '+missingResult+' from three states');
}
assert.ok(aligned.bookGuidance.every(card=>
  alignedThreeState.plan.knowledgeBasis.cards.some(c=>c.id===card.id &&
    c.validation===card.validation && c.limitations===card.limitations)),
  'three-state advice must come from the current validated book cards only');
const meteredThree=core.analyzeMeteredExposureContext(alignedThreeState,'L1','L2');
assert.equal(meteredThree.sceneMeterAlignment.status,'ALIGNED_BY_USER_REPORTED_METADATA_ONLY');
assert.equal(meteredThree.sceneMeterAlignment.minutesSpan,15);
assert.equal(meteredThree.sceneMeterAlignment.sceneLux,650.125);
assert.equal(meteredThree.sceneIncidentEvidence.userReportedLux,650.125);
assert.equal(meteredThree.derivedSceneLux,null);
assert.equal(meteredThree.measuredSceneEv100,null);
assert.equal(meteredThree.recommendedAperture,null);
assert.equal(meteredThree.recommendedIso,null);
assert.equal(meteredThree.cameraExposureVerified,false);
assert.equal(core.restoreRevisions([ratioPlan,ratioA,ratioB,v3A,v3B,alignedThreeState]).length,6);

const threeStateReason=(input)=>core.assessSceneMeterAlignment(
  core.createSceneIncidentLuxRevision(v3B,{...sameSessionSceneInput,...input}),
  'L1','L2').reason;
assert.equal(threeStateReason({meterModel:'Different meter model'}),'DIFFERENT_METER_MODELS');
assert.equal(threeStateReason({meterIdentifier:'METER-02'}),'DIFFERENT_METER_IDENTIFIERS');
assert.equal(threeStateReason({measurementPoint:'Another face mark'}),'DIFFERENT_MEASUREMENT_POINTS');
assert.equal(threeStateReason({measuredAtLocal:'2026-10-25T02:11'}),
  'MEASUREMENT_SESSION_EXCEEDS_15_MIN');
assert.equal(threeStateReason({measuredAtLocal:'2026-10-25T02:09'}),null);
assert.equal(core.assessSceneMeterAlignment(sceneRev,'L1','L2').reason,
  'ISOLATED_READINGS_REQUIRE_V3_METADATA',
  'legacy V2 readings must never be treated as an identified three-state session');
assert.equal(core.assessSceneMeterAlignment(alignedThreeState,'L2','L1').reason,
  'INVALID_KEY_FILL_PAIR');
const withoutFill=core.createSceneIncidentLuxRevision(v3A,sameSessionSceneInput);
assert.equal(core.assessSceneMeterAlignment(withoutFill,'L1','L2').reason,
  'MISSING_ISOLATED_KEY_FILL_READINGS');
const rotatedV3=core.createIncidentLuxRevision(v3A,{
  ...v3context,lightId:'L2',lux:100,confirmed:true,fixtureIsolated:true,
  measuredAtLocal:'2026-10-25T02:05',measuredUtcOffset:'+01:00',
  receptorOrientation:'RECEPTOR_TOWARD_FIXTURE'
});
const rotatedThree=core.createSceneIncidentLuxRevision(rotatedV3,sameSessionSceneInput);
assert.equal(core.assessSceneMeterAlignment(rotatedThree,'L1','L2').reason,
  'SENSOR_ORIENTATION_NOT_COMMON_CAMERA_AXIS');
const zeroV3=core.createIncidentLuxRevision(v3A,{
  ...v3context,lightId:'L2',lux:0,confirmed:true,fixtureIsolated:true,
  measuredAtLocal:'2026-10-25T02:05',measuredUtcOffset:'+01:00'
});
const zeroThree=core.createSceneIncidentLuxRevision(zeroV3,{
  ...sameSessionSceneInput,lux:0
});
assert.equal(core.assessSceneMeterAlignment(zeroThree,'L1','L2').status,
  'ALIGNED_BY_USER_REPORTED_METADATA_ONLY',
  'zero meter values are valid observations, though ratio may be blocked');
assert.equal(core.compareKeyFillMeasurements(zeroThree,'L1','L2').reason,
  'ZERO_READING_NO_FINITE_RATIO');
const movedThree=core.createDistanceMeasurementRevision(alignedThreeState,{
  lightId:'L1',distanceM:4,confirmed:true
});
assert.equal(core.assessSceneMeterAlignment(movedThree,'L1','L2').reason,
  'MISSING_ALL_SOURCES_ON_READING');
assert.equal(alignedThreeState.plan.sceneIncidentLuxReading.lux,650.125);
const damagedThree=JSON.parse(JSON.stringify(alignedThreeState));
damagedThree.plan.sceneIncidentLuxReading.measurementPoint='Forged point';
assert.throws(()=>core.assessSceneMeterAlignment(damagedThree,'L1','L2'),
  /integrity|Invalid|mismatch/i,'tampered three-state record is never analyzed');
const incompatibleThree=core.assessSceneMeterAlignment(
  core.createSceneIncidentLuxRevision(v3B,{
    ...sameSessionSceneInput,meterIdentifier:'METER-02'
  }),'L1','L2');
assert.equal(incompatibleThree.status,'NOT_ALIGNED');
assert.equal(incompatibleThree.keyLux,null);
assert.equal(incompatibleThree.fillLux,null);
assert.equal(incompatibleThree.sceneLux,null);
assert.equal(incompatibleThree.minutesSpan,null);
assert.equal(core.analyzeMeteredExposureContext(v3B,'L1','L2').sceneMeterAlignment.reason,
  'MISSING_ALL_SOURCES_ON_READING');

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
assert.match(uiSource,/sceneMeterAlignment/,'alignment gate must be exposed in UI');
assert.match(uiSource,/createCameraGrayCardWaveformRevision\(revisions/);
assert.match(uiSource,/sp-waveform-ire/);
assert.match(uiSource,/sp-waveform-card-confirmed/);
assert.match(uiSource,/sp-waveform-camera-confirmed/);
assert.match(uiSource,/sp-waveform-lights-confirmed/);
assert.match(uiSource,/sp-waveform-target/);
assert.match(uiSource,/sp-waveform-code-range/);
assert.match(uiSource,/sp-waveform-transfer/);
assert.match(uiSource,/sp-waveform-lut/);
assert.match(uiSource,/sp-waveform-reference-confirmed/);
assert.match(uiSource,/protocolVersion:2/,'new UI uses documented V2 waveform protocol');
assert.match(uiSource,/referenceContextConfirmed:el\(/);
assert.match(uiSource,/monitoringTransformId:el\(/);
assert.match(uiSource,/cameraWaveformEvidence/);
assert.match(uiSource,/referenceDifferenceIrePoints/);
assert.match(uiSource,/Korisnički zadat referentni nivo/);
assert.match(uiSource,/compareGrayCardWaveformRevisions\(/,
  'user-visible history comparison must use revision-validated core');
assert.match(uiSource,/listGrayCardWaveformCaptures\(revisions\)/,
  'DoP panel and export must select actual capture events, not every inherited revision');
assert.doesNotMatch(uiSource,/revisions\.filter\(function\(r\)\{\s*return r\.plan&&r\.plan\.cameraGrayCardWaveformReading;/,
  'UI may not count carried-forward waveforms as independent readings');
assert.match(uiSource,/currentWaveformInherited/);
assert.match(uiSource,/activeCaptureRevisionId/);
assert.match(uiSource,/POREĐENJE DVA WAVEFORM OČITAVANJA/);
assert.match(uiSource,/deltaIrePoints/);
assert.match(uiSource,/plannedSetupFingerprintMatches/);
assert.match(uiSource,/Praktična provera: /);
assert.match(uiSource,/METAPODACI TRI MERENJA/,'specific in-app alignment explanation is required');
assert.match(uiSource,/aditivno|sabirati/i,'cannot imply addition of different lighting states');
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
