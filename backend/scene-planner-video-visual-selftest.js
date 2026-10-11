import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
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
