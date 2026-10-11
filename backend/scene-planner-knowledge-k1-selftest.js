import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {retrieveKnowledge,KNOWLEDGE_SHA256} from './scene-planner-knowledge.js';
import {createKnowledgeRecommendation} from './scene-planner-knowledge-adapter.js';
import {createKnowledgeAudit,verifyKnowledgeAudit,createReferenceCorrectionProposal,createKnowledgeExpansionDraft,SOURCE_REVIEW_STATUSES,DOP_REVIEW_STATUSES} from './scene-planner-knowledge-review.js';
import {createK1Brief,verifyK1Brief,createK1DoPDecision,reconsiderK1Brief} from './scene-planner-knowledge-k1.js';
import {analyzeOriginalVideo} from './scene-planner-video-visual.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const seed=JSON.parse(readFileSync(new URL('./scene-planner-knowledge-seed-v1.json',import.meta.url),'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
const revision=core.createRevision({lights:[{id:'L1',fixtureId:'offline-key',fixtureName:'Offline key',role:'key'}]},
  {description:'Dvoje glumaca razgovara',dopRequest:'Kontrolisan kontrast'},'local',null,'k1-test');
const history=core.canonicalJson(revision);
const request={sceneBrief:'Dvoje glumaca razgovor cross key prozor fill negative fill',intent:'Napet dijalog, citljiva lica',
  context:{production:'narrative',location:'interior',timeOfDay:'day',actorCount:2}};
const first=seed.cards[0],ref=first.evidence[0],source=seed.sources.find(s=>s.source_id===ref.source_id);
const proposalInput={cardId:first.id,sourceId:source.source_id,originalPdfPage:ref.pdf_page,expectedKnowledgeHash:KNOWLEDGE_SHA256,
  expectedSourceHash:source.original_sha256,claimedSourceHash:source.original_sha256,claimedEdition:source.edition??'UNKNOWN',
  claimedPdfPageCount:source.physical_pdf_pages,proposedPdfPage:ref.pdf_page,proposedPrintedPage:ref.printed_page,reason:'Pending original-copy comparison'};
let passed=0;function test(name,fn){fn();passed++;console.log('PASS KNOWLEDGE K1 '+name);}
test('all 53 cards and every reference inventoried without independent source claims',()=>{
  const a=createKnowledgeAudit();assert.equal(verifyKnowledgeAudit(a),true);assert.equal(a.records.length,53);
  assert.equal(a.summary.references,seed.cards.reduce((n,c)=>n+c.evidence.length,0));assert.equal(a.summary.unverified,53);
  assert.equal(a.summary.sourceVerified,0);assert.equal(a.summary.needsDoPReview,53);assert.equal(a.summary.reviewedOriginalPages,0);
  for(const c of a.records){assert.equal(c.sourceStatus,'UNVERIFIED');assert.equal(c.dopStatus,'NEEDS_DOP_REVIEW');assert.ok(c.limitations&&c.validationNeeded);
    for(const e of c.references){assert.equal(e.printedPage,e.pdfPage-e.printedOffsetInK0);assert.equal(e.actualReviewedPage,null);}}
  assert.deepEqual(createKnowledgeAudit(),a);assert.equal(a.gaps.length,15);
});
test('forged source verification and forged audit with recomputed hash rejected',()=>{
  assert.throws(()=>createKnowledgeAudit({sourceStatus:'SOURCE_VERIFIED'}));
  const a=clone(createKnowledgeAudit());a.records[0].sourceStatus='SOURCE_VERIFIED';const {auditHash,...record}=a;a.auditHash=core.planHash(record);
  assert.throws(()=>verifyKnowledgeAudit(a));assert.throws(()=>createK1Brief(request,revision,{audit:a}));
  assert.equal(SOURCE_REVIEW_STATUSES.includes('NEEDS_DOP_REVIEW'),false);assert.ok(DOP_REVIEW_STATUSES.includes('NEEDS_DOP_REVIEW'));
});
test('PDF and printed numbering stay separate and copy counts stay unresolved',()=>{
  const a=createKnowledgeAudit(),landau=a.sourceInventory.find(s=>s.sourceId==='landau-2014'),popovic=a.sourceInventory.find(s=>s.sourceId==='popovic-tv');
  assert.equal(landau.k0PdfPageCount,286);assert.equal(landau.reportedConversationPageCount,285);
  assert.equal(popovic.k0PdfPageCount,151);assert.equal(popovic.reportedConversationPageCount,150);
  assert.equal(landau.concretePdfPageCount,null);assert.equal(landau.concreteFileHash,null);assert.equal(a.summary.sourceMismatch,0);
  assert.ok(a.records.flatMap(c=>c.references).some(e=>e.pdfPage!==e.printedPage));
});
test('changed source/version, nonexistent page and quotation cannot silently correct K0',()=>{
  for(const change of [r=>r.expectedKnowledgeHash='0'.repeat(64),r=>r.expectedSourceHash='0'.repeat(64),r=>r.originalPdfPage=9999,
    r=>r.proposedPdfPage=r.claimedPdfPageCount+1,r=>r.quote='Invented quote',r=>r.sourceStatus='SOURCE_VERIFIED']){
    const r=clone(proposalInput);change(r);assert.throws(()=>createReferenceCorrectionProposal(r));}
  const p=createReferenceCorrectionProposal({...proposalInput,claimedSourceHash:'0'.repeat(64),claimedEdition:'Different user-reported copy'});
  const a=createKnowledgeAudit({proposals:[p]});assert.equal(p.appliesToK0,false);assert.equal(p.automaticPageShift,false);
  assert.equal(p.sourceStatus,'UNVERIFIED');assert.match(p.sourceIdentityComparison,/NOT_PROVEN_SOURCE_MISMATCH/);
  assert.equal(a.records[0].references[0].pdfPage,ref.pdf_page);assert.equal(a.summary.unverified,53);
  assert.throws(()=>createKnowledgeAudit({proposals:[clone(p)]}));assert.throws(()=>createKnowledgeAudit({proposals:[p,p]}));
});
test('expansion drafts record gaps without fabricated principles or searchable new cards',()=>{
  const draft=createKnowledgeExpansionDraft({id:'K1-face-review',domain:'face',sourceIds:['landau-2014','brown-2019'],questions:['Which original page supports this face-modeling context?']});
  const a=createKnowledgeAudit({drafts:[draft]});assert.equal(draft.principle,null);assert.equal(draft.retrievable,false);assert.equal(a.summary.newKnowledgeCards,0);
  assert.throws(()=>createKnowledgeExpansionDraft({id:'K1-fake',domain:'face',sourceIds:['fake'],questions:['Question']}));
  assert.throws(()=>createKnowledgeExpansionDraft({...clone(draft),principle:'Invented principle'}));
  assert.throws(()=>createKnowledgeAudit({drafts:[draft,draft]}));
});
test('dialogue and conflicting methods retain author, context, conditions and limitations',()=>{
  const b=createK1Brief(request,revision);assert.equal(verifyK1Brief(b,revision),true);assert.equal(b.alternativeStatus,'MULTIPLE_CONDITIONAL_APPROACHES');
  assert.ok(b.alternatives.some(a=>a.id==='cross-key'));assert.ok(b.alternatives.some(a=>a.id==='soft-fill'));
  const cross=b.alternatives.find(a=>a.id==='cross-key');assert.ok(cross.authorMethods.length>=2);
  assert.ok(cross.authorMethods.every(g=>g.records.every(c=>c.sourceStatus==='UNVERIFIED'&&c.dopStatus==='NEEDS_DOP_REVIEW')));
  assert.ok(b.comparison.some(c=>c.alternatives.includes('cross-key')));assert.ok(b.excludedAlternatives.some(a=>a.alternativeId==='practical-night'));
  assert.ok(b.alternatives.every(a=>a.conditions.length&&a.whenUnsuitable.length));
});
test('moving actors/camera, limited equipment and unknown measurements are explicit',()=>{
  const b=createK1Brief({...request,inventory:[{fixtureId:'unreliable-lamp',qty:1}],context:{...request.context,cameraMotion:'moving',actorMotion:'moving',budget:'limited'}},revision);
  assert.ok(b.alternatives.every(a=>a.whenUnsuitable.some(s=>/camera move/.test(s))&&a.whenUnsuitable.some(s=>/actor path/.test(s))));
  assert.equal(b.knownData.context.evidenceType,'USER_SUPPLIED_FACT');assert.equal(b.knownData.inventory[0].catalogMatch,false);
  assert.equal(b.unknowns.actorTracking,'UNKNOWN');assert.equal(b.unknowns.physicalGeometry,'UNKNOWN');assert.equal(b.physicalCalculation,'NOT_EXECUTED');
  assert.ok(b.alternatives.every(a=>a.lux===null&&a.distanceM===null&&a.cameraParameters==='UNKNOWN'));
});
test('day window, night interior/exterior, multicam, documentary and concert contexts',()=>{
  for(const [scene,context,id] of [
    ['Prozor dnevno svetlo',{production:'narrative',location:'interior',timeOfDay:'day'},'motivated-window'],
    ['Nocni praktikal svetlo',{production:'narrative',location:'interior',timeOfDay:'night'},'practical-night'],
    ['Mesecina nocni eksterijer',{production:'narrative',location:'exterior',timeOfDay:'night'},'layered-night'],
    ['Tri kamere studio razgovor',{production:'tv-multicam',location:'studio'},'multicam-common'],
    ['Dokumentarni intervju meko fill svetlo',{production:'documentary',location:'interior'},'soft-fill'],
    ['Muzicki koncert cue promene',{production:'music-concert',location:'studio'},'music-cues']]){
    const b=createK1Brief({sceneBrief:scene,intent:'Profesionalni kreativni brief',context},revision);assert.ok(b.alternatives.some(a=>a.id===id),id);
    assert.equal(b.historicalTechniques,'NOT_CURRENT_LED_CAMERA_OR_SAFETY_CERTIFICATION');}
});
test('single actor and unknown scene never force two alternatives',()=>{
  const single=createK1Brief({...request,context:{...request.context,actorCount:1}},revision);assert.ok(!single.alternatives.some(a=>a.id==='cross-key'));
  const empty=createK1Brief({sceneBrief:'zzzzqqqq',intent:'zzzzqqqq'},revision);assert.equal(empty.alternatives.length,0);
  assert.equal(empty.alternativeStatus,'INSUFFICIENT_MATCHING_EVIDENCE');assert.equal(empty.knownData.video,null);
});
test('DoP acceptance is not source approval; rejection and changes preserve history',()=>{
  const b=createK1Brief(request,revision),before=core.canonicalJson(b);
  const accepted=createK1DoPDecision(b,revision,{action:'accept',alternativeId:b.alternatives[0].id});assert.equal(accepted.sourceReviewUnaffected,true);
  assert.equal(createK1DoPDecision(b,revision,{action:'reject'}).planMutation,false);
  const decision=createK1DoPDecision(b,revision,{action:'reconsider',changes:{...request,contrast:'Manji kontrast',intent:'Smirenije, mekse svetlo'}});
  const next=reconsiderK1Brief(decision,b,revision);assert.equal(next.parentBriefHash,b.briefHash);assert.notEqual(next.briefHash,b.briefHash);
  assert.equal(next.recommendation.parentRecommendationHash,b.recommendation.recommendationHash);assert.equal(next.audit.summary.unverified,53);
  assert.equal(core.canonicalJson(b),before);assert.equal(core.canonicalJson(revision),history);assert.throws(()=>reconsiderK1Brief(clone(decision),b,revision));
});
test('wrong light plot/revision/hash and untrusted video fail closed',()=>{
  const b=createK1Brief(request,revision),binding=clone(core.videoRevisionBinding(revision));binding.lightPlotRevisionId='plot-'+ '0'.repeat(64);
  assert.throws(()=>createK1Brief(request,revision,{expectedBinding:binding}));
  const next=core.createRevision(revision.plan,{description:'Changed ISO',cameraOverrides:{iso:1600}},'local',revision);
  assert.throws(()=>verifyK1Brief(b,next));assert.throws(()=>verifyK1Brief(clone(b),revision));
  assert.throws(()=>createK1Brief(request,revision,{video:{ingestion:{decodeStatus:'decoded-video'}}}));
  assert.throws(()=>createK1Brief({...request,context:{cameraMotion:'PIXEL_MEASUREMENT'}},revision));
});
test('K0 corpus, retrieval, recommendations and previous revisions remain unchanged',()=>{
  const before=retrieveKnowledge('cross key prozor fill'),old=createKnowledgeRecommendation({sceneBrief:request.sceneBrief,intent:request.intent},revision);
  createK1Brief(request,revision);assert.deepEqual(retrieveKnowledge('cross key prozor fill'),before);
  assert.deepEqual(createKnowledgeRecommendation({sceneBrief:request.sceneBrief,intent:request.intent},revision),old);
  assert.equal(createHash('sha256').update(readFileSync(new URL('./scene-planner-knowledge-seed-v1.json',import.meta.url))).digest('hex'),KNOWLEDGE_SHA256);
  assert.equal(core.canonicalJson(revision),history);assert.throws(()=>createKnowledgeAudit().records[0].references[0].pdfPage=2,TypeError);
});
console.log(`${passed} K1 offline regression groups passed. ORIGINAL BOOK PAGE REVIEW: NOT EXECUTED; 0 SOURCE_VERIFIED, 53 UNVERIFIED. No new knowledge cards.`);
const decoderPath=process.env.SCENE_PLANNER_TEST_FFMPEG;
if(!decoderPath)console.log('REAL K1 VIDEO BINDING: NOT EXECUTED (no explicitly selected existing FFmpeg).');
else{
  const temp=await fs.realpath(os.tmpdir()),root=await fs.mkdtemp(path.join(temp,'lightingai-k1-tests-'));
  try{
    const filePath=path.join(root,'procedural.mp4'),pixels=Buffer.alloc(32*32*3/2,128);
    const generated=spawnSync(decoderPath,['-hide_banner','-loglevel','error','-nostdin','-f','rawvideo','-pixel_format','yuv420p',
      '-video_size','32x32','-framerate','10','-i','pipe:0','-c:v','libopenh264','-threads','1','-bf','0','-pix_fmt','yuv420p','-an',
      '-use_editlist','0','-video_track_timescale','1000',filePath],{input:Buffer.concat(Array(20).fill(pixels)),shell:false,windowsHide:true,timeout:15000,maxBuffer:1024*1024});
    assert.equal(generated.status,0,'Procedural fixture generation failed');
    const video=await analyzeOriginalVideo({filePath,root,mime:'video/mp4',decoderPath},revision);
    const brief=createK1Brief(request,revision,{video});assert.equal(brief.knownData.video.visualHash,video.analysis.visualHash);
    assert.equal(brief.knownData.video.sourceIdentity,video.ingestion.sourceIdentity);assert.equal(brief.knownData.video.temporalHash,video.ingestion.temporal.temporalHash);
    assert.equal(brief.knownData.video.pixelEvidence.evidenceType,'PIXEL_MEASUREMENT');assert.equal(brief.unknowns.actorTracking,'UNKNOWN');
    const decision=createK1DoPDecision(brief,revision,{action:'reconsider',changes:{...request,intent:'Meksa alternativa'}});
    assert.throws(()=>reconsiderK1Brief(decision,brief,revision));
    const next=reconsiderK1Brief(decision,brief,revision,{video});assert.equal(next.parentBriefHash,brief.briefHash);
    assert.equal(next.knownData.video.sourceIdentity,brief.knownData.video.sourceIdentity);
    assert.throws(()=>createK1Brief(request,revision,{video:clone(video)}));assert.equal(core.canonicalJson(revision),history);
    console.log('PASS REAL K1 VIDEO BINDING: 20 procedural decoded frames; verified source/temporal/visual hashes, immutable DoP reconsideration, forged receipts rejected. Not real film or book review.');
  }finally{const resolved=await fs.realpath(root);assert.equal(path.dirname(resolved),temp);assert.ok(path.basename(resolved).startsWith('lightingai-k1-tests-'));await fs.rm(resolved,{recursive:true});}
}
