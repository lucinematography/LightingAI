import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {GRADE_METHOD,createDayForNightGradeRecipe,gradeDayForNightYuv420p,
  gradeVerifiedDayForNightFrames,verifyDayForNightFrameReceipt,
  summarizeDayForNightGradeCodeConsistency,createVerifiedDayForNightGradeQc,
  verifyDayForNightGradeQc,proposeUntrustedDayForNightMp4FrameSchedule,
  createVerifiedDayForNightMp4Handoff,verifyDayForNightMp4Handoff,
  proposeUntrustedDayForNightScratchEncode,
  runExperimentalDayForNightScratchMp4} from './scene-planner-video-visual.js';
import {measureYuv420p,compareVisualFrames,analyzeOriginalVideo,verifyVisualAnalysis,
  summarizeDecodedCodeContinuity,createVerifiedDecodedContinuityAudit,
  verifyDecodedContinuityAudit} from './scene-planner-video-visual.js';
import {ingestOriginalVideo,streamVerifiedVideoPixels} from './scene-planner-video-ingestion.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const revision=core.createRevision({lights:[{fixtureName:'Offline LED',fixtureId:'offline',role:'key'}]},
  {description:'Visual offline',cameraOverrides:{iso:400}},'ai',null,'visual-test');
const clone=x=>JSON.parse(JSON.stringify(x));
function pixels(y,u=128,v=128,pattern=false){
  const p=Buffer.alloc(32*32*3/2);p.fill(y,0,1024);p.fill(u,1024,1280);p.fill(v,1280);
  if(pattern)for(let i=0;i<1024;i++)p[i]=(i%32<16)?32:224;
  return p;
}
let groups=0;
function test(name,fn){fn();groups++;console.log('PASS SYNTHETIC PIXELS '+name);}
const dark=measureYuv420p(pixels(16),32,32),bright=measureYuv420p(pixels(235),32,32);
test('dark, bright and uniform code statistics',()=>{
  assert.equal(dark.y.mean,16);assert.equal(dark.y.darkFraction,1);assert.equal(dark.y.stddev,0);
  assert.equal(bright.y.brightFraction,1);assert.equal(bright.y.histogram.reduce((a,b)=>a+b),1);
});
test('contrast and spatial histogram from actual supplied bytes',()=>{
  const r=measureYuv420p(pixels(0,128,128,true),32,32);
  assert.equal(r.y.mean,128);assert.equal(r.y.stddev,96);assert.equal(r.y.darkFraction,0.5);
});
test('illumination shift stays ambiguous, never confirmed cut',()=>{
  const r=compareVisualFrames(dark,bright);assert.equal(r.interpretation,'ILLUMINATION_CHANGE_OR_FLASH');
  assert.equal(r.confirmedCut,false);assert.equal(r.status,'REQUIRES_HUMAN_CONFIRMATION');
});
test('chroma change produces low-confidence candidate',()=>{
  const r=compareVisualFrames(dark,measureYuv420p(pixels(16,40,210),32,32));
  assert.ok(r.colorDistance>0.12);assert.equal(r.confidence,'LOW_UNCALIBRATED_HEURISTIC');
});
test('camera-like spatial motion never claims tracking or confirmed cut',()=>{
  const a=pixels(0,128,128,true),b=Buffer.from(a);
  for(let i=0;i<1024;i++)b[i]=256-a[i];
  const r=compareVisualFrames(measureYuv420p(a,32,32),measureYuv420p(b,32,32));
  assert.ok(r.candidate);assert.equal(r.confirmedCut,false);
});
test('unknown colorimetry and physical interpretation are explicit',()=>{
  assert.ok(Object.values(dark.colorimetry).every(v=>v==='UNKNOWN'));
  assert.equal(dark.physicalInterpretationConfidence,'UNKNOWN');assert.ok(Object.isFrozen(dark.y.histogram));
});
test('corrupt buffer, unsupported format and memory dimensions rejected',()=>{
  for(const fn of [()=>measureYuv420p(Buffer.alloc(5),32,32),()=>measureYuv420p(new Uint8Array(1536),32,32),
    ()=>measureYuv420p(Buffer.alloc(1),1921,1080),()=>measureYuv420p(Buffer.alloc(1),Infinity,1)])assert.throws(fn);
});

// Group every presentation-adjacent decoded frame, not six spaced WebView
// previews. Pure synthetic inputs NEVER grant verified decoder provenance.
function syntheticContinuityInput(codeValues,durations){
  const frames=[];let tick=0;
  codeValues.forEach((value,index)=>{
    const framePixels=pixels(value),durationTicks=durations[index];
    frames.push({index,ptsTick:tick,durationTicks,
      decodedPixelHash:createHash('sha256').update(framePixels).digest('hex'),
      measurements:measureYuv420p(framePixels,32,32)});
    tick+=durationTicks;
  });
  const changes=frames.slice(1).map((f,i)=>({
    fromIndex:i,toIndex:i+1,fromPixelHash:frames[i].decodedPixelHash,
    toPixelHash:f.decodedPixelHash,ptsTick:f.ptsTick,
    ...compareVisualFrames(frames[i].measurements,f.measurements)
  }));
  for(let i=0;i<changes.length-1;i++)if(changes[i].candidate&&changes[i+1].candidate&&
    !compareVisualFrames(frames[i].measurements,frames[i+2].measurements).candidate)
    changes[i].interpretation=changes[i+1].interpretation='TRANSIENT_FLASH_OR_OTHER_CHANGE';
  return {frames,changes,timeBase:{numerator:1,denominator:1000}};
}
test('decoded-frame candidate intervals preserve every original PTS and VFR duration',()=>{
  const fixture=syntheticContinuityInput([16,16,235,16,16],[100,200,50,150,300]);
  const before=core.canonicalJson(fixture),audit=summarizeDecodedCodeContinuity(fixture);
  assert.equal(audit.authority,'UNTRUSTED_METRIC_INPUT_NOT_A_DECODER_RECEIPT');
  assert.equal(audit.sampleFrameCount,5);
  assert.equal(audit.transitionCount,4);
  assert.equal(audit.startPtsTick,0);
  assert.equal(audit.endPtsTickExclusive,800);
  assert.equal(audit.candidateTransitionCount,2);
  assert.equal(audit.candidateIntervalCount,1);
  assert.equal(audit.flashLikeCandidateIntervalCount,1);
  assert.deepEqual(audit.intervals.map(x=>x.kind),[
    'NO_HEURISTIC_CHANGE_FLAG_NOT_PROOF_OF_CONTINUITY',
    'POSSIBLE_CODE_CHANGE_NEEDS_DOP_REVIEW',
    'NO_HEURISTIC_CHANGE_FLAG_NOT_PROOF_OF_CONTINUITY'
  ]);
  assert.deepEqual(audit.intervals.map(x=>[x.startPtsTick,x.endPtsTickExclusive]),
    [[0,300],[100,500],[350,800]]);
  assert.deepEqual(audit.intervals.map(x=>x.transitionCount),[1,2,1]);
  assert.equal(audit.intervals[1].hasTransientFlashLikeCandidate,true);
  assert.equal(audit.intervals[1].maxAbsAdjacentMeanYCodeDelta,219);
  assert.equal(audit.canProveTemporalVisualStability,false);
  assert.ok(audit.intervals.every(x=>!x.confirmedCut&&!x.confirmedFlicker&&!x.confirmedPhysicalLightChange));
  assert.ok(Object.isFrozen(audit)&&Object.isFrozen(audit.intervals)&&Object.isFrozen(audit.intervals[1]));
  assert.equal(core.canonicalJson(fixture),before,'pure audit must not rewrite original frames');
  assert.doesNotMatch(JSON.stringify(audit),/decodedPixelHash|base64|filePath|private/i);
});
test('no candidate event is not temporal stability or a relit MP4',()=>{
  const quiet=summarizeDecodedCodeContinuity(syntheticContinuityInput([24,24,24,24],[100,100,200,50]));
  assert.equal(quiet.candidateTransitionCount,0);
  assert.equal(quiet.candidateIntervalCount,0);
  assert.equal(quiet.intervals.length,1);
  assert.equal(quiet.intervals[0].transitionCount,3);
  assert.equal(quiet.intervals[0].rangeOfFrameMeanYCode,0);
  assert.equal(quiet.canProveTemporalVisualStability,false);
  assert.equal(quiet.videoRelightGenerated,false);
});
test('pure grouping fails closed on malformed timing and forged frame changes',()=>{
  const a=syntheticContinuityInput([16,16,235,16,16],[100,100,100,100,100]);
  const edit=fn=>{const v=clone(a);fn(v);assert.throws(()=>summarizeDecodedCodeContinuity(v));};
  edit(x=>x.frames[1].ptsTick+=1);
  edit(x=>x.frames[0].durationTicks=0);
  edit(x=>x.frames[2].index=1);
  edit(x=>x.frames[2].decodedPixelHash='fake');
  edit(x=>x.frames[2].measurements.y.mean=NaN);
  edit(x=>x.changes[1].lumaDelta=0);
  edit(x=>x.changes[1].candidate=false);
  edit(x=>x.changes[1].interpretation='NO_LARGE_CHANGE');
  edit(x=>x.changes[1].toPixelHash='a'.repeat(64));
  edit(x=>x.changes.pop());
  edit(x=>x.timeBase.denominator=0);
  assert.throws(()=>summarizeDecodedCodeContinuity(syntheticContinuityInput([30],[100])));
  assert.throws(()=>createVerifiedDecodedContinuityAudit({analysis:a,ingestion:{}},revision),
    'untrusted handmade visual JSON must never acquire a verified receipt');
});


const nightRevision=core.createRevision(
  {lights:[{fixtureName:'Offline LED',fixtureId:'offline',role:'key'}]},
  {description:'Day for night pilot',look:'Day for Night',captureLighting:'day',cameraOverrides:{iso:400}},
  'local',null,'night-grade-demo');
const recipe=createDayForNightGradeRecipe(nightRevision,{darkenPct:60,coolPct:40});
test('night grade recipe rejects invalid or wrong source plans',()=>{
  assert.equal(recipe.method,GRADE_METHOD);
  assert.equal(recipe.renderClass,'UNMANAGED_CREATIVE_PIXEL_GRADE_ONLY');
  assert.equal(recipe.planHash,nightRevision.planHash);
  assert.equal(recipe.recipeHash,core.planHash(Object.fromEntries(Object.entries(recipe).filter(([k])=>k!=='recipeHash'))));
  assert.equal(recipe.physicallyBasedRelighting,false);
  assert.ok(Object.isFrozen(recipe));
  assert.throws(()=>createDayForNightGradeRecipe(revision,{darkenPct:60,coolPct:40}));
  for(const bad of [{darkenPct:0,coolPct:40},{darkenPct:81,coolPct:40},
    {darkenPct:60,coolPct:101},{darkenPct:'60',coolPct:40},
    {darkenPct:60,coolPct:NaN},{darkenPct:60},{darkenPct:60,coolPct:40,fixture:'other'},null])
    assert.throws(()=>createDayForNightGradeRecipe(nightRevision,bad));
});
test('night grade transforms actual copied YUV pixels with fixed transfer-unknown look',()=>{
  const original=pixels(160,144,112),saved=Buffer.from(original);
  const after=gradeDayForNightYuv420p(original,32,32,recipe);
  assert.notStrictEqual(after,original);
  assert.deepEqual(original,saved);
  assert.equal(after.length,original.length);
  assert.ok(after[0]<original[0]);
  assert.ok(after[1024]>original[1024]);
  assert.ok(after[1280]<original[1280]);
  assert.deepEqual(after,gradeDayForNightYuv420p(original,32,32,recipe));
  assert.equal(measureYuv420p(after,32,32).y.mean,83);
  for(const params of [[new Uint8Array(original),32,32,recipe],[Buffer.alloc(2),32,32,recipe],
    [original,0,32,recipe],[original,1921,32,recipe],[original,32,32,null],
    [original,32,32,clone(recipe)]])assert.throws(()=>gradeDayForNightYuv420p(...params));
  assert.deepEqual(gradeDayForNightYuv420p(pixels(200),32,32,recipe),
    gradeDayForNightYuv420p(pixels(200),32,32,recipe));
  assert.ok(gradeDayForNightYuv420p(pixels(128),32,32,recipe)[0]<
    gradeDayForNightYuv420p(pixels(200),32,32,recipe)[0]);
  assert.throws(()=>verifyDayForNightFrameReceipt({receiptHash:'x'},nightRevision,
    {analysis:{},ingestion:{}},recipe));
});


// Pure scalar QC must not manufacture decoder provenance. Actual calibrated
// quality, flicker-free operation and per-light shadow geometry stay UNKNOWN.
function syntheticGradedCodeRows(yCodes,durations){
  let pts=0;
  return yCodes.map((value,i)=>{
    const input=pixels(value),output=gradeDayForNightYuv420p(input,32,32,recipe);
    const record={
      index:i,ptsTick:pts,durationTicks:durations[i],
      sourceDecodedPixelHash:createHash('sha256').update(input).digest('hex'),
      gradedPixelHash:createHash('sha256').update(output).digest('hex'),
      sourceMeanYCode:Number(measureYuv420p(input,32,32).y.mean.toFixed(4)),
      gradedMeanYCode:Number(measureYuv420p(output,32,32).y.mean.toFixed(4)),
      width:32,height:32,colorimetryVerified:false,sourceExposureMeasured:false
    };
    pts+=durations[i];return record;
  });
}
test('all-frame VFR QC requests DoP review without inventing stable relighting',()=>{
  const rows=syntheticGradedCodeRows([16,16,235,16,16],[100,200,50,150,300]);
  const unchanged=core.canonicalJson(rows);
  const report=summarizeDayForNightGradeCodeConsistency(rows,recipe.darkenPct);
  assert.equal(report.authority,'UNTRUSTED_SCALAR_METRICS_NO_PIXEL_OR_SOURCE_PROOF');
  assert.equal(report.frameCount,5);
  assert.equal(report.transitionCount,4);
  assert.equal(report.gradedMeanJumpReviewCount,2);
  assert.deepEqual(report.reviewTransitions.map(x=>x.ptsTick),[300,350]);
  assert.deepEqual(report.reviewTransitions.map(x=>x.gradedMeanYDeltaCode),[114,-114]);
  assert.equal(report.constantYCodeGain,0.52);
  assert.ok(report.maxAbsPerFrameGainResidualCode<=0.5003);
  assert.ok(report.maxAbsInterframeGainResidualCode<=1.0006);
  assert.equal(report.constantCodeGainWithinQuantizationTolerance,true);
  assert.equal(report.flickerFreeVerified,false);
  assert.equal(report.visualQualityApproved,false);
  assert.equal(report.encodedMp4Created,false);
  assert.ok(Object.isFrozen(report)&&Object.isFrozen(report.reviewTransitions));
  assert.equal(core.canonicalJson(rows),unchanged);
  assert.doesNotMatch(JSON.stringify(report),/data:image|base64|filePath|decodedPixelHash/i);
});
test('unflagged constant Y code changes never prove flicker freedom',()=>{
  const rows=syntheticGradedCodeRows([24,24,24],[100,100,200]);
  const check=summarizeDayForNightGradeCodeConsistency(rows,recipe.darkenPct);
  assert.equal(check.gradedMeanJumpReviewCount,0);
  assert.equal(check.transitionCount,2);
  assert.deepEqual(check.sourceMeanYCodeRange,[24,24]);
  assert.deepEqual(check.gradedMeanYCodeRange,[12,12]);
  assert.equal(check.flickerFreeVerified,false);
  assert.equal(summarizeDayForNightGradeCodeConsistency(
    syntheticGradedCodeRows([128],[100]),recipe.darkenPct).transitionCount,0);
});
test('fail closed on forged grade means, PTS, source hashes and private bytes',()=>{
  const rows=syntheticGradedCodeRows([16,235,16],[100,50,200]);
  function tamper(change){
    const forged=clone(rows);change(forged);
    assert.throws(()=>summarizeDayForNightGradeCodeConsistency(forged,recipe.darkenPct));
  }
  tamper(r=>r[1].gradedMeanYCode=5);
  tamper(r=>r[1].gradedMeanYCode=NaN);
  tamper(r=>r[1].gradedMeanYCode=236);
  tamper(r=>r[1].sourceMeanYCode=20);
  tamper(r=>r[1].ptsTick+=1);
  tamper(r=>r[1].durationTicks=0);
  tamper(r=>r[1].index=0);
  tamper(r=>r[1].sourceDecodedPixelHash='not-a-sha');
  tamper(r=>r[1].gradedPixelHash='A'.repeat(64));
  tamper(r=>r[1].sourceExposureMeasured=true);
  tamper(r=>r[1].rawPixels=[1,2,3]);
  tamper(r=>r[1].width=160);
  assert.throws(()=>summarizeDayForNightGradeCodeConsistency(rows,0));
  assert.throws(()=>summarizeDayForNightGradeCodeConsistency(rows,100));
  assert.throws(()=>summarizeDayForNightGradeCodeConsistency([],recipe.darkenPct));
  assert.throws(()=>createVerifiedDayForNightGradeQc(
    {frames:rows},nightRevision,{analysis:{},ingestion:{}},recipe));
});


// Strict untrusted raw-frame -> MP4 timeline proposal; does NOT claim output.
// Existing ingress does not yet decode or validate audio/color primaries.
function syntheticMp4Schedule(yCodes,durations,audioDeclared=false){
  const frames=syntheticGradedCodeRows(yCodes,durations),endTick=frames.at(-1).ptsTick+frames.at(-1).durationTicks;
  return {frames,
    video:{codec:'h264',width:32,height:32,
      timeBase:{numerator:1,denominator:1000},durationTicks:endTick,
      sampleCount:frames.length,
      samples:frames.map(f=>({index:f.index,ptsTick:f.ptsTick,
        dtsTick:f.ptsTick,durationTicks:f.durationTicks}))},
    audioDeclared};
}
test('MP4 timing handoff preserves exact VFR and source/graded identities without writing video',()=>{
  const input=syntheticMp4Schedule([16,16,235,16,16],[500,600,400,700,300]);
  const before=core.canonicalJson(input);
  const proposal=proposeUntrustedDayForNightMp4FrameSchedule(input);
  assert.equal(proposal.contract,'lightingai-untrusted-day-for-night-mp4-timing-proposal/1');
  assert.equal(proposal.status,'UNTRUSTED_UNENCODED_EXACT_ORIGINAL_PTS_PROPOSAL');
  assert.equal(proposal.sourceDurationTicks,2500);
  assert.equal(proposal.durationSeconds,2.5);
  assert.equal(proposal.frameCount,5);
  assert.deepEqual(proposal.frameMap.map(f=>f.originalPtsTick),[0,500,1100,1500,2200]);
  assert.deepEqual(proposal.frameMap.map(f=>f.originalDurationTicks),[500,600,400,700,300]);
  assert.equal(proposal.frameMap.at(-1).endPtsTickExclusive,2500);
  assert.equal(proposal.frameMap[0].gradedRawPixelSha256,input.frames[0].gradedPixelHash);
  assert.equal(proposal.frameMap[0].originalDecodedPixelSha256,input.frames[0].sourceDecodedPixelHash);
  assert.equal(proposal.originalAudioTrackDeclared,false);
  assert.equal(proposal.requiresPtsAwareEncoderAndMuxer,true);
  assert.equal(proposal.noFpsResamplingAllowed,true);
  assert.equal(proposal.encodedMp4Created,false);
  assert.equal(proposal.videoExportAuthorized,false);
  assert.ok(Object.isFrozen(proposal)&&Object.isFrozen(proposal.frameMap)&&Object.isFrozen(proposal.frameMap[0]));
  assert.equal(core.canonicalJson(input),before,'timing manifest does not mutate source pixels or metrics');
  assert.doesNotMatch(JSON.stringify(proposal),/base64|filePath|sourceUrl|accessToken/i);
});
test('audio cannot be silently dropped by an MP4 export proposal',()=>{
  const data=syntheticMp4Schedule([128,128,128],[800,700,800],true);
  const result=proposeUntrustedDayForNightMp4FrameSchedule(data);
  assert.equal(result.originalAudioTrackDeclared,true);
  assert.equal(result.audioHandlingStatus,'BLOCKED_AUDIO_DECODING_AND_SYNC_UNVALIDATED');
  assert.equal(result.encodedMp4Created,false);
});
test('MP4 proposal rejects forged source timeline, guessed FPS and malformed pixel attestations',()=>{
  const input=syntheticMp4Schedule([16,128,235],[600,900,1000]);
  function damage(change){
    const tampered=clone(input);change(tampered);
    assert.throws(()=>proposeUntrustedDayForNightMp4FrameSchedule(tampered));
  }
  damage(x=>x.frames[1].ptsTick+=1);
  damage(x=>x.frames[1].durationTicks=0);
  damage(x=>x.video.samples[1].dtsTick=0);
  damage(x=>x.video.samples[2].durationTicks=5);
  damage(x=>x.video.durationTicks+=1);
  damage(x=>x.video.timeBase.numerator=2);
  damage(x=>x.video.timeBase.denominator=0);
  damage(x=>x.video.codec='hevc');
  damage(x=>x.video.width=31);
  damage(x=>x.video.width=1940);
  damage(x=>x.video.sampleCount=2);
  damage(x=>x.frames[0].gradedPixelHash='not sha256');
  damage(x=>x.frames[0].sourceMeanYCode=NaN);
  damage(x=>x.frames[0].colorimetryVerified=true);
  damage(x=>x.frames[1].sourceVideoPath='/secret.mov');
  damage(x=>x.video.samples[1].fileName='private.mp4');
  damage(x=>x.audioDeclared=null);
  damage(x=>x.frames.pop());
  assert.throws(()=>proposeUntrustedDayForNightMp4FrameSchedule(
    syntheticMp4Schedule([16,128,235],[100,100,100])),
    'under 2s not supported');
  assert.throws(()=>proposeUntrustedDayForNightMp4FrameSchedule({
    ...input,video:{...input.video,durationTicks:31000}}),
    'over 30s not supported');
  assert.throws(()=>createVerifiedDayForNightMp4Handoff(
    {frames:input.frames},{},nightRevision,{ingestion:{},analysis:{}},recipe),
    'untrusted supplied metrics cannot create a verified handoff');
});


// A test-only two-pass EOS sentinel is needed to preserve final VFR sample
// duration; ordinary setpts FFmpeg encoding drops that final duration.
test('MP4 scratch encoder plan exactly maps original VFR ticks plus EOS sentinel',()=>{
  const input=syntheticMp4Schedule([16,16,235,16,16],[500,600,400,700,300]);
  const before=core.canonicalJson(input);
  const p=proposeUntrustedDayForNightScratchEncode(input);
  assert.equal(p.authority,'UNTRUSTED_PROCEDURAL_DIAGNOSTIC_ONLY');
  assert.equal(p.contract,'lightingai-untrusted-scratch-day-for-night-mp4-pilot/1');
  assert.equal(p.originalFrameCount,5);
  assert.equal(p.intermediateFrameCountWithSentinel,6);
  assert.equal(p.finalFrameCountWithoutSentinel,5);
  assert.equal(p.frameByteSize,1536);
  assert.deepEqual(p.ptsTicksIncludingEosSentinel,[0,500,1100,1500,2200,2500]);
  assert.equal(p.sourceDurationTicks,2500);
  assert.ok(p.setPtsFilter.startsWith('settb=expr=1/1000,setpts=if('));
  assert.ok(p.setPtsFilter.includes('eq(N\\,4)\\,2200'));
  assert.ok(p.setPtsFilter.endsWith('2500)))))'));
  assert.equal(p.requiresEosSentinelThenCopyRemux,true);
  assert.equal(p.mustDecodeAndVerifyFinalMp4,true);
  assert.equal(p.videoExportAuthorized,false);
  assert.ok(Object.isFrozen(p)&&Object.isFrozen(p.ptsTicksIncludingEosSentinel));
  assert.equal(core.canonicalJson(input),before);
  assert.doesNotMatch(JSON.stringify(p),/filePath|data:image|privateUrl|accessToken/i);
});
test('scratch MP4 experiment rejects sound and exceeds no-production budgets',()=>{
  assert.throws(()=>proposeUntrustedDayForNightScratchEncode(
    syntheticMp4Schedule([16,128,128],[900,800,800],true)));
  const sixtyOne=Array(61).fill(32);
  assert.throws(()=>proposeUntrustedDayForNightScratchEncode(
    syntheticMp4Schedule(sixtyOne,Array(61).fill(100))));
  assert.throws(()=>proposeUntrustedDayForNightScratchEncode(
    syntheticMp4Schedule([16,128,128],[2000,2000,3000])));
  const changed=syntheticMp4Schedule([16,128,128],[900,800,800]);
  changed.video.width=322;
  assert.throws(()=>proposeUntrustedDayForNightScratchEncode(changed));
  const highTimeBase=syntheticMp4Schedule([16,128,128],[900,800,800]);
  highTimeBase.video.timeBase.denominator=1000001;
  assert.throws(()=>proposeUntrustedDayForNightScratchEncode(highTimeBase));
  assert.throws(()=>runExperimentalDayForNightScratchMp4(
    {},nightRevision,{},recipe,{}, {}, {},{
      nonProductionScratchOnly:false,encoder:'libx264'
    }));
});

console.log(`${groups} synthetic visual pixel groups passed; no decoder provenance granted.`);

const decoderPath=process.env.SCENE_PLANNER_TEST_FFMPEG;
if(!decoderPath)console.log('REAL VISUAL PIXEL ANALYSIS: NOT EXECUTED (no explicitly selected existing FFmpeg).');
else{
  const temp=await fs.realpath(os.tmpdir()),root=await fs.mkdtemp(path.join(temp,'lightingai-visual-tests-'));
  const beforeRevision=core.canonicalJson(revision);
  const dirs=async()=> (await fs.readdir(temp)).filter(n=>n.startsWith('lightingai-ingestion-')).sort();
  const baseline=await dirs();let real=0;
  async function run(name,fn){await fn();real++;console.log('PASS REAL VISUAL '+name);}
  async function generate(name,frames,vfr=false){
    const filePath=path.join(root,name+'.mp4');
    const args=['-hide_banner','-loglevel','error','-nostdin','-f','rawvideo','-pixel_format','yuv420p',
      '-video_size','32x32','-framerate','10','-i','pipe:0',
      ...(vfr?['-vf','select=not(eq(n\\,1))','-vsync','vfr']:[]),
      '-c:v','libopenh264','-threads','1','-bf','0','-pix_fmt','yuv420p','-an','-use_editlist','0','-video_track_timescale','1000',filePath];
    const r=spawnSync(decoderPath,args,{input:Buffer.concat(frames),shell:false,windowsHide:true,timeout:15000,maxBuffer:1024*1024});
    assert.equal(r.status,0,'Procedural visual fixture generation failed');return {filePath,root,mime:'video/mp4',decoderPath};
  }
  async function verifyScratchEncodedPts(handoff,graded,qc,originalOpts,originalBundle){
    const result=await runExperimentalDayForNightScratchMp4(
      originalOpts,nightRevision,originalBundle,recipe,graded,qc,handoff,
      {nonProductionScratchOnly:true,encoder:'libopenh264'});
    assert.equal(result.contract,'lightingai-ephemeral-scratch-mp4-probe/1');
    assert.equal(result.originalFrames,graded.frameCount);
    assert.equal(result.finalDecodedFrames,graded.frameCount);
    assert.equal(result.intermediateFramesWithEosSentinel,graded.frameCount+1);
    assert.equal(result.finalDurationTicks,handoff.schedule.sourceDurationTicks);
    assert.equal(result.exactOriginalPtsAndLastDurationVerified,true);
    assert.equal(result.mp4DeliveredToUser,false);
    assert.equal(result.videoExportAuthorized,false);
    assert.equal(result.physicallyAccurateRelighting,false);
    assert.equal(result.scratchMp4CreatedThenDeleted,true);
    assert.match(result.outputSha256,/^sha256:[a-f0-9]{64}$/);
    assert.ok(Object.isFrozen(result));
    assert.equal((await dirs()).join(','),baseline.join(','));
  }
  try{
    const sequence=Array.from({length:20},(_,i)=>pixels(i<10?16:235));
    const opts=await generate('illumination',sequence);
    const original=await fs.readFile(opts.filePath);
    const result=await analyzeOriginalVideo(opts,revision);
    await run('decoded dark/bright/contrast, CFR timestamps and exact source binding',async()=>{
      assert.equal(result.analysis.frames.length,20);assert.equal(result.analysis.frames[10].ptsTick,1000);
      assert.ok(result.analysis.frames[0].measurements.y.mean<20);
      assert.ok(result.analysis.frames[10].measurements.y.mean>230);
      assert.equal(result.analysis.frames[0].measurements.y.stddev,0);
      assert.equal(result.analysis.changes[9].interpretation,'ILLUMINATION_CHANGE_OR_FLASH');
      assert.equal(verifyVisualAnalysis(result.analysis,result.ingestion,revision),true);
      const qc=createVerifiedDecodedContinuityAudit(result,revision);
      assert.equal(qc.contract,'lightingai-verified-decoded-code-continuity-audit/1');
      assert.equal(qc.frameCount,20);assert.equal(qc.frameTransitionCount,19);
      assert.equal(qc.candidateTransitionCount,1);assert.equal(qc.candidateIntervalCount,1);
      assert.equal(qc.reviewIntervals.find(x=>x.kind==='POSSIBLE_CODE_CHANGE_NEEDS_DOP_REVIEW').firstTransitionIndex,9);
      assert.equal(qc.sourceIdentity,result.ingestion.sourceIdentity);
      assert.equal(qc.visualHash,result.analysis.visualHash);
      assert.equal(qc.videoRelightGenerated,false);assert.equal(qc.actualVideoCutConfirmed,false);
      assert.equal(verifyDecodedContinuityAudit(qc,result,revision),true);
      assert.throws(()=>verifyDecodedContinuityAudit(clone(qc),result,revision));
      const repeated=await analyzeOriginalVideo(opts,revision);
      assert.equal(repeated.analysis.visualHash,result.analysis.visualHash);
      const nightBundle=await analyzeOriginalVideo(opts,nightRevision);
      let delivered=0;
      const graded=await gradeVerifiedDayForNightFrames(opts,nightRevision,nightBundle,recipe,(raw,frame)=>{
        assert.ok(Buffer.isBuffer(raw));assert.equal(frame.index,delivered++);
        assert.ok(frame.gradedMeanYCode<=frame.sourceMeanYCode);return true;
      });
      assert.equal(delivered,20);assert.equal(graded.frameCount,20);
      assert.equal(graded.frames[10].ptsTick,1000);
      assert.equal(graded.encodedMp4Created,false);
      assert.equal(graded.videoRelightGenerated,false);
      assert.equal(graded.perFrameAutoGainUsed,false);
      assert.equal(verifyDayForNightFrameReceipt(graded,nightRevision,nightBundle,recipe),true);
      assert.throws(()=>verifyDayForNightFrameReceipt(clone(graded),nightRevision,nightBundle,recipe));
      const gradeQc=createVerifiedDayForNightGradeQc(graded,nightRevision,nightBundle,recipe);
      assert.equal(gradeQc.frameCount,20);
      assert.equal(gradeQc.frameTransitionCount,19);
      assert.equal(gradeQc.sourceCandidateTransitionCount,1);
      assert.equal(gradeQc.codeConsistency.gradedMeanJumpReviewCount,1);
      assert.equal(gradeQc.decision,'REVIEW_ORIGINAL_OR_GRADED_CODE_CHANGE');
      assert.match(gradeQc.sourceContinuityAuditHash,/^[a-f0-9]{64}$/);
      assert.equal(gradeQc.flickerFreeVerified,false);
      assert.equal(gradeQc.mp4ExportAuthorized,false);
      assert.equal(gradeQc.encodedMp4Created,false);
      assert.equal(verifyDayForNightGradeQc(gradeQc,graded,nightRevision,nightBundle,recipe),true);
      assert.throws(()=>verifyDayForNightGradeQc(clone(gradeQc),graded,nightRevision,nightBundle,recipe));
      const handoff=createVerifiedDayForNightMp4Handoff(graded,gradeQc,nightRevision,nightBundle,recipe);
      assert.equal(handoff.schedule.frameCount,20);
      assert.equal(handoff.schedule.sourceDurationTicks,nightBundle.ingestion.metadata.video.durationTicks);
      assert.equal(handoff.schedule.frameMap[10].originalPtsTick,1000);
      assert.equal(handoff.gradeReceiptHash,graded.receiptHash);
      assert.equal(handoff.gradeQcHash,gradeQc.qcHash);
      assert.ok(handoff.pendingBlockers.includes('PTS_AWARE_ENCODER_AND_MP4_MUXER_NOT_IMPLEMENTED'));
      assert.ok(handoff.pendingBlockers.includes('SOURCE_COLORIMETRY_AND_RANGE_UNVERIFIED'));
      assert.equal(handoff.encodedMp4Created,false);
      assert.equal(verifyDayForNightMp4Handoff(handoff,graded,gradeQc,nightRevision,nightBundle,recipe),true);
      assert.throws(()=>verifyDayForNightMp4Handoff(clone(handoff),graded,gradeQc,nightRevision,nightBundle,recipe));
      assert.throws(()=>createVerifiedDayForNightMp4Handoff(graded,gradeQc,revision,nightBundle,recipe));
      await verifyScratchEncodedPts(handoff,graded,gradeQc,opts,nightBundle);
      await assert.rejects(()=>gradeVerifiedDayForNightFrames(opts,revision,result,recipe,()=>true));
    });
    await run('one-frame flash candidate requires confirmation',async()=>{
      const f=await generate('flash',Array.from({length:20},(_,i)=>pixels(i===10?235:16)));
      const r=await analyzeOriginalVideo(f,revision);
      assert.equal(r.analysis.changes[9].interpretation,'TRANSIENT_FLASH_OR_OTHER_CHANGE');
      assert.equal(r.analysis.changes[10].interpretation,'TRANSIENT_FLASH_OR_OTHER_CHANGE');
      assert.ok(r.analysis.changes.every(c=>!c.confirmedCut));
      const audit=createVerifiedDecodedContinuityAudit(r,revision);
      assert.equal(audit.flashLikeCandidateIntervalCount,1);
      assert.ok(audit.reviewIntervals.some(x=>x.hasTransientFlashLikeCandidate));
      assert.equal(audit.flickerConfirmed,false);
    });
    await run('gradual illumination and chroma measurements from decoded bytes',async()=>{
      const f=await generate('ramp',Array.from({length:20},(_,i)=>pixels(32+i*8,64+i*5,192-i*5)));
      const r=await analyzeOriginalVideo(f,revision);
      assert.ok(r.analysis.changes.every(c=>c.lumaDelta>0&&c.colorDistance>0));
      assert.ok(Object.values(r.analysis.frames[0].measurements.colorimetry).every(v=>v==='UNKNOWN'));
    });
    await run('procedural editorial cut and camera-like motion remain candidates',async()=>{
      const f=await generate('cut',Array.from({length:20},(_,i)=>pixels(i<10?16:120,i<10?128:40,i<10?128:210,i>=10)));
      const r=await analyzeOriginalVideo(f,revision);assert.ok(r.analysis.changes[9].candidate);
      assert.equal(r.analysis.changes[9].confirmedCut,false);
      const a=pixels(0,128,128,true),b=Buffer.from(a);for(let i=0;i<1024;i++)b[i]=256-a[i];
      const m=await generate('motion',Array.from({length:20},(_,i)=>i<10?a:b));
      const mr=await analyzeOriginalVideo(m,revision);assert.ok(mr.analysis.changes[9].candidate);
      assert.equal(mr.analysis.changes[9].status,'REQUIRES_HUMAN_CONFIRMATION');
    });
    await run('VFR keeps original PTS, duration and pixel identity',async()=>{
      const f=await generate('vfr',sequence,true),r=await analyzeOriginalVideo(f,revision);
      assert.equal(r.analysis.frames.length,19);assert.equal(r.analysis.frames[0].durationTicks,200);
      assert.equal(r.analysis.frames[1].ptsTick,200);assert.equal(verifyVisualAnalysis(r.analysis,r.ingestion,revision),true);
      const qc=createVerifiedDecodedContinuityAudit(r,revision);
      assert.equal(qc.frameCount,19);
      const nightVfr=await analyzeOriginalVideo(f,nightRevision);
      const gradedVfr=await gradeVerifiedDayForNightFrames(f,nightRevision,nightVfr,recipe,()=>true);
      assert.equal(gradedVfr.frameCount,19);
      assert.equal(gradedVfr.frames[0].durationTicks,200);
      assert.equal(gradedVfr.frames[1].ptsTick,200);
      const vfrQc=createVerifiedDayForNightGradeQc(gradedVfr,nightRevision,nightVfr,recipe);
      assert.equal(vfrQc.frameCount,19);
      assert.equal(vfrQc.lastEndPtsTickExclusive,
        nightVfr.analysis.frames.at(-1).ptsTick+nightVfr.analysis.frames.at(-1).durationTicks);
      assert.equal(vfrQc.frameTransitionCount,18);
      const vfrHandoff=createVerifiedDayForNightMp4Handoff(gradedVfr,vfrQc,nightRevision,nightVfr,recipe);
      assert.equal(vfrHandoff.schedule.frameCount,19);
      assert.equal(vfrHandoff.schedule.frameMap[0].originalDurationTicks,200);
      assert.equal(vfrHandoff.schedule.frameMap[1].originalPtsTick,200);
      assert.equal(vfrHandoff.schedule.frameMap.at(-1).endPtsTickExclusive,
        nightVfr.ingestion.metadata.video.durationTicks);
      assert.equal(vfrHandoff.exportDecision,'BLOCKED_NO_MP4_FILE_AND_UNRESOLVED_PROOFS');
      await verifyScratchEncodedPts(vfrHandoff,gradedVfr,vfrQc,f,nightVfr);
      assert.equal(qc.reviewIntervals.at(-1).endPtsTickExclusive,
        r.analysis.frames.at(-1).ptsTick+r.analysis.frames.at(-1).durationTicks);
    });
    await run('wrong source/revision, forged JSON, historical immutability',async()=>{
      assert.throws(()=>verifyVisualAnalysis(clone(result.analysis),result.ingestion,revision));
      const child=core.createRevision(revision.plan,{description:'ISO',cameraOverrides:{iso:800}},'ai',revision,'visual-test');
      assert.throws(()=>verifyVisualAnalysis(result.analysis,result.ingestion,child));
      assert.throws(()=>{result.analysis.frames[0].ptsTick=4;});
      const f=await generate('other',Array(20).fill(pixels(120))),other=await ingestOriginalVideo(f,revision);
      await assert.rejects(()=>streamVerifiedVideoPixels(f,revision,result.ingestion,()=>{}),/SOURCE_IDENTITY_MISMATCH/);
      assert.throws(()=>verifyVisualAnalysis(result.analysis,other,revision));
      const sourceAudit=createVerifiedDecodedContinuityAudit(result,revision);
      assert.throws(()=>verifyDecodedContinuityAudit(sourceAudit,{analysis:result.analysis,ingestion:other},revision));
      assert.throws(()=>createVerifiedDecodedContinuityAudit(result,child));
      const nightBundle=await analyzeOriginalVideo(opts,nightRevision);
      const graded=await gradeVerifiedDayForNightFrames(opts,nightRevision,nightBundle,recipe,()=>true);
      const qc=createVerifiedDayForNightGradeQc(graded,nightRevision,nightBundle,recipe);
      assert.throws(()=>verifyDayForNightGradeQc(qc,graded,nightRevision,result,recipe));
      assert.throws(()=>verifyDayForNightGradeQc(qc,graded,revision,nightBundle,recipe));
      assert.equal(core.canonicalJson(revision),beforeRevision);
    });
    await run('consumer failure, timeout, abort, corrupt source and cleanup',async()=>{
      await assert.rejects(()=>streamVerifiedVideoPixels(opts,revision,result.ingestion,()=>{throw new Error('stop');}),/PIXEL_STREAM_REJECTED/);
      await assert.rejects(()=>streamVerifiedVideoPixels({...opts,timeoutMs:1},revision,result.ingestion,()=>{}),/DECODER_TIMEOUT/);
      await assert.rejects(()=>streamVerifiedVideoPixels({...opts,signal:AbortSignal.abort()},revision,result.ingestion,()=>{}),/ABORTED/);
      const controller=new AbortController();let observed=false;
      await assert.rejects(()=>streamVerifiedVideoPixels({...opts,signal:controller.signal},revision,result.ingestion,()=>{
        observed=true;controller.abort();
      }),/ABORTED/);assert.ok(observed,'Abort must reach actual measured pixel boundary');
      await assert.rejects(()=>analyzeOriginalVideo({...opts,mime:'video/webm'},revision));
      const bad=path.join(root,'corrupt.mp4');await fs.writeFile(bad,original.subarray(0,600));
      await assert.rejects(()=>analyzeOriginalVideo({...opts,filePath:bad},revision));
      assert.deepEqual(await dirs(),baseline);assert.deepEqual(await fs.readFile(opts.filePath),original);
    });
    await run('second pixel pass detects concurrent original change and cleans snapshot',async()=>{
      let changed=false;
      try{await assert.rejects(()=>streamVerifiedVideoPixels(opts,revision,result.ingestion,()=>{
        if(!changed){const altered=Buffer.from(original);altered[altered.length-1]^=1;writeFileSync(opts.filePath,altered);changed=true;}
      }),/SOURCE_CHANGED/);assert.ok(changed);}
      finally{await fs.writeFile(opts.filePath,original);}
      assert.deepEqual(await dirs(),baseline);assert.deepEqual(await fs.readFile(opts.filePath),original);
    });
    console.log(`${real} real visual decode groups passed; procedural pixels only, no scene-quality or relighting claim.`);
  }finally{
    const resolved=await fs.realpath(root);assert.equal(path.dirname(resolved),temp);
    assert.ok(path.basename(resolved).startsWith('lightingai-visual-tests-'));await fs.rm(resolved,{recursive:true,force:true});
  }
}
