import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {retrieveKnowledge,getKnowledgeCoverage,getReferenceSceneCase,validateKnowledgeCatalog} from './scene-planner-knowledge.js';
import {buildRuntimeCatalog} from './catalog-runtime.js';
import {createKnowledgeRecommendation as make,verifyKnowledgeRecommendation as verify,createDoPDecision,reconsiderKnowledgeRecommendation,EVIDENCE_TYPES} from './scene-planner-knowledge-adapter.js';
import {analyzeOriginalVideo} from './scene-planner-video-visual.js';
import {createCalibrationReport} from './scene-planner-video-calibration.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const revision=core.createRevision({lights:[{id:'L1',fixtureId:'offline-key',fixtureName:'Offline key',role:'key'}]},
  {description:'Dvoje glumaca kraj prozora',dopRequest:'Napet razgovor'},'local',null,'knowledge-test');
const history=core.canonicalJson(revision),clone=x=>JSON.parse(JSON.stringify(x));
const base={sceneBrief:'Dvoje glumaca razgovor cross key prozor dnevno svetlo fill negative fill',intent:'Napet dijalog sa prirodnim motivisanim svetlom',sceneType:'dialogue'};
let passed=0;function test(name,fn){fn();passed++;console.log('PASS KNOWLEDGE K0 '+name);}
test('three books searchable with complete edition/page/record provenance',()=>{
  const hits=retrieveKnowledge('cross key studio svetlo white balance ekspozicija',{maxResults:25});
  assert.equal(new Set(hits.flatMap(h=>h.evidence.map(e=>e.source_id))).size,3);
  for(const h of hits)for(const e of h.evidence){assert.ok(e.title&&e.author&&Number.isInteger(e.pdf_page));
    assert.equal(e.recordVerification,'PACKAGE_REFERENCE_NOT_INDEPENDENTLY_RECHECKED');assert.match(e.source_sha256,/^[a-f0-9]{64}$/);}
  assert.equal(getKnowledgeCoverage().indexedChapterRanges,35);assert.equal(getKnowledgeCoverage().curatedCards,53);
});
test('day, night, window, multicam and music retrieve grounded alternatives',()=>{
  for(const [query,id] of [['prozor dnevno svetlo','motivated-window'],['nocna mesecina','layered-night'],
    ['tri kamere studio multicam kontinuitet','multicam-common'],['muzika koncert cue svetlosna promena','music-cues']]){
    const r=make({sceneBrief:query,intent:'Kreativni predlog'},revision);assert.ok(r.alternatives.some(a=>a.id===id),id);
    assert.ok(r.sourceCitations.length);assert.equal(r.renderedVideo,false);
  }
});
test('cross-key and softer dialogue approach, contrast and color conflicts',()=>{
  const r=make(base,revision);assert.ok(r.alternatives.some(x=>x.id==='cross-key'));assert.ok(r.alternatives.some(x=>x.id==='soft-fill'));
  assert.ok(r.comparison.some(c=>c.alternatives.includes('cross-key')));
  const color=make({sceneBrief:'white balance neutralnost LED boja color hladno toplo gel',intent:'Uporedi neutralno i mesano svetlo'},revision);
  assert.ok(color.comparison.some(c=>c.alternatives.includes('neutral-color')&&c.alternatives.includes('mixed-color')));
  assert.ok(r.alternatives.every(a=>a.applicability==='CONDITIONAL_REQUIRES_DOP_REVIEW'));
});
test('deterministic hashes, Cyrillic retrieval and complete deep immutability',()=>{
  const r=make(base,revision);assert.deepEqual(make(base,revision),r);assert.equal(verify(r,revision),true);
  assert.throws(()=>r.sourceCards[0].sceneTypes.push('spoof'),TypeError);
  assert.throws(()=>r.alternatives[0].rationale[0].principle='invented',TypeError);
  assert.throws(()=>getReferenceSceneCase('case-dialogue-two').cards.push('fake'),TypeError);
  assert.deepEqual(retrieveKnowledge('ноћна сцена месечина'),retrieveKnowledge('nocna scena mesecina'));
});
test('false sources, page ranges, quotes and case IDs are rejected',()=>{
  const data=JSON.parse(awaitlessSeed());
  for(const change of [d=>d.cards[0].evidence[0].source_id='fake',d=>d.cards[0].evidence[0].pdf_page=999,
    d=>d.cards[0].evidence[0].printed_page=-1,d=>d.cards[0].evidence[0].quote='Invented quote',
    d=>d.cards[0].id=d.cards[1].id,d=>d.scene_casebooks[0].cards=['fake'],d=>d.license_policy.raw_books_included=true,
    d=>d.sources[1].edition='fictional edition',d=>d.sources[2].year=2026]){
    const d=clone(data);change(d);assert.throws(()=>validateKnowledgeCatalog(d));}
  assert.throws(()=>make({...base,citations:[{page:999}]},revision));
  const r=clone(make(base,revision));r.sourceCitations[0].printed_page=999;
  const {recommendationHash,...record}=r;r.recommendationHash=core.planHash(record);assert.throws(()=>verify(r,revision));
});
function awaitlessSeed(){return readFileSync(new URL('./scene-planner-knowledge-seed-v1.json',import.meta.url),'utf8');}
test('wrong light plot, stale revision and broken hash fail closed',()=>{
  const r=make(base,revision),binding=clone(core.videoRevisionBinding(revision));binding.lightPlotRevisionId='plot-'+ '0'.repeat(64);
  assert.throws(()=>make(base,revision,{expectedBinding:binding}));
  const next=core.createRevision(revision.plan,{description:'ISO change',cameraOverrides:{iso:1600}},'local',revision);
  assert.throws(()=>verify(r,next));assert.throws(()=>make(base,{...revision,planHash:'0'.repeat(64)}));
  assert.equal(core.canonicalJson(revision),history);
});
test('inventory joins catalog without inventing ownership, geometry or lux',()=>{
  const id=buildRuntimeCatalog().fixtures[0].id;
  const r=make({...base,inventory:[{fixtureId:id,qty:2},{fixtureId:'missing-lamp',qty:1}]},revision);
  assert.equal(r.inventory.find(x=>x.fixtureId===id).catalogMatch,true);assert.equal(r.inventory.find(x=>x.fixtureId==='missing-lamp').catalogMatch,false);
  assert.ok(r.inventory.every(x=>x.evidenceType==='USER_SUPPLIED_FACT'&&x.physicalOutput==='UNKNOWN'));
  assert.ok(r.alternatives.every(x=>x.lux===null&&x.distanceM===null&&x.placement==='UNKNOWN'&&x.cameraParameters==='UNKNOWN'));
  assert.equal(make(base,revision).alternatives[0].equipmentStatus,'UNKNOWN_MISSING_INVENTORY');
  assert.throws(()=>make({...base,inventory:[{fixtureId:id,qty:1,powerDrawW:999}]},revision));
});
test('DoP acceptance, rejection and changed intent preserve both histories',()=>{
  const r=make(base,revision),before=core.canonicalJson(r);
  assert.equal(createDoPDecision(r,revision,{action:'accept',alternativeId:r.alternatives[0].id}).planMutation,false);
  assert.equal(createDoPDecision(r,revision,{action:'reject'}).nextStep,'REJECTED_NO_PLAN_CHANGE');
  const d=createDoPDecision(r,revision,{action:'reconsider',changes:{...base,intent:'Mekse, smirenije, manji kontrast',inventory:[]}});
  const next=reconsiderKnowledgeRecommendation(d,r,revision);assert.equal(next.parentRecommendationHash,r.recommendationHash);
  assert.notEqual(next.recommendationHash,r.recommendationHash);assert.equal(core.canonicalJson(r),before);assert.equal(core.canonicalJson(revision),history);
  assert.throws(()=>reconsiderKnowledgeRecommendation(clone(d),r,revision));
  assert.throws(()=>createDoPDecision(r,revision,{action:'accept',alternativeId:'invented'}));
});
test('strict bounds, unknown queries and no claimed calculations or pixel analysis',()=>{
  assert.throws(()=>make({...base,sceneBrief:'x'.repeat(801)},revision));assert.throws(()=>retrieveKnowledge('night',{source:'fake'}));
  const r=make({sceneBrief:'zzzzqqqq',intent:'zzzzqqqq'},revision);assert.equal(r.alternatives.length,0);assert.equal(r.video,null);
  assert.equal(r.calculationStatus,'NOT_EXECUTED_NO_VERIFIED_PHOTOMETRY');assert.equal(EVIDENCE_TYPES.length,6);
  assert.throws(()=>make(base,revision,{video:{ingestion:{decodeStatus:'decoded-video',sourceIdentity:'sha256:'+ '0'.repeat(64)}}}));
});
console.log(`${passed} K0 adapter contract groups passed; no real video analysis claimed by these groups.`);
const decoderPath=process.env.SCENE_PLANNER_TEST_FFMPEG;
if(!decoderPath)console.log('REAL KNOWLEDGE VIDEO BINDING: NOT EXECUTED (no explicitly selected existing FFmpeg).');
else{
  const temp=await fs.realpath(os.tmpdir()),root=await fs.mkdtemp(path.join(temp,'lightingai-knowledge-tests-'));
  try{
    const filePath=path.join(root,'procedural.mp4'),pixels=Buffer.alloc(32*32*3/2,128);
    const r=spawnSync(decoderPath,['-hide_banner','-loglevel','error','-nostdin','-f','rawvideo','-pixel_format','yuv420p',
      '-video_size','32x32','-framerate','10','-i','pipe:0','-c:v','libopenh264','-threads','1','-bf','0','-pix_fmt','yuv420p','-an',
      '-use_editlist','0','-video_track_timescale','1000',filePath],{input:Buffer.concat(Array(20).fill(pixels)),shell:false,windowsHide:true,timeout:15000,maxBuffer:1024*1024});
    assert.equal(r.status,0,'Procedural fixture generation failed');
    const video=await analyzeOriginalVideo({filePath,root,mime:'video/mp4',decoderPath},revision);
    const calibration=createCalibrationReport(video,revision,{scenarioId:'knowledge-static',split:'validation',provenance:'procedural-script-v1',
      sourceIdentity:video.analysis.sourceIdentity,timeBase:video.analysis.timeBase,events:[],toleranceTicks:100});
    const report=make(base,revision,{video:{...video,calibration}});
    assert.equal(report.video.sourceIdentity,video.analysis.sourceIdentity);assert.equal(report.video.visualHash,video.analysis.visualHash);
    assert.equal(report.video.temporalHash,video.ingestion.temporal.temporalHash);assert.equal(report.video.pixelEvidence.evidenceType,'PIXEL_MEASUREMENT');
    assert.equal(report.video.pixelEvidence.frameCount,20);assert.equal(report.video.calibrationHash,calibration.calibrationHash);
    const decision=createDoPDecision(report,revision,{action:'reconsider',changes:{...base,intent:'Drugaciji kontrast'}});
    assert.throws(()=>reconsiderKnowledgeRecommendation(decision,report,revision));
    const reconsidered=reconsiderKnowledgeRecommendation(decision,report,revision,{video:{...video,calibration}});
    assert.equal(reconsidered.video.sourceIdentity,report.video.sourceIdentity);
    assert.throws(()=>make(base,revision,{video:clone(video)}));
    assert.throws(()=>make(base,revision,{video:{...video,analysis:{...video.analysis,sourceIdentity:'sha256:'+ '0'.repeat(64)}}}));
    const next=core.createRevision(revision.plan,{description:'Other ISO',cameraOverrides:{iso:1600}},'local',revision);
    assert.throws(()=>make(base,next,{video}));assert.equal(core.canonicalJson(revision),history);
    console.log('PASS REAL KNOWLEDGE VIDEO BINDING: 20 procedural decoded frames, genuine ingestion/visual/calibration hashes; forged source/revision rejected. Not real film.');
  }finally{const resolved=await fs.realpath(root);assert.equal(path.dirname(resolved),temp);assert.ok(path.basename(resolved).startsWith('lightingai-knowledge-tests-'));await fs.rm(resolved,{recursive:true});}
}
