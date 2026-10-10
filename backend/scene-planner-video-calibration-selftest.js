import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {measureYuv420p,compareVisualFrames,analyzeOriginalVideo} from './scene-planner-video-visual.js';
import {CALIBRATION_PROFILE,estimateVisualEvents,scoreVisualEvents,createCalibrationReport,verifyCalibrationReport,evaluateCalibrationSet} from './scene-planner-video-calibration.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const revision=core.createRevision({lights:[{fixtureName:'Offline LED',fixtureId:'offline',role:'key'}]},
  {description:'Calibration offline',cameraOverrides:{iso:400}},'ai',null,'calibration-test');
const event=(kind,ptsTick)=>({kind,ptsTick});
function pixels(y,u=128,v=128,pattern='flat',phase=0){
  const p=Buffer.alloc(1536);p.fill(y,0,1024);p.fill(u,1024,1280);p.fill(v,1280);
  for(let row=0;row<32;row++)for(let x=0;x<32;x++){
    if(pattern==='bars')p[row*32+x]=(x+phase)%32<16?24:224;
    if(pattern==='object')p[row*32+x]=row>=8&&row<24&&x>=phase&&x<phase+8?224:24;
    if(pattern==='dark')p[row*32+x]=(x+row)%2?32:8;
  }return p;
}
// Labels are declared by the scenario author BEFORE decoding/estimation. None
// are derived from detector output. Tuning scenarios never enter validation.
const cases=[
  {id:'static',split:'tuning',make:i=>pixels(96),truth:[]},
  {id:'ramp-up',split:'tuning',make:i=>pixels(32+Math.max(0,Math.min(i-3,12))*6),truth:[event('gradual-change',400)]},
  {id:'ramp-down',split:'validation',make:i=>pixels(200-Math.max(0,Math.min(i-3,12))*6),truth:[event('gradual-change',400)]},
  {id:'flash',split:'validation',make:i=>pixels(i===10?235:16),truth:[event('flash-like',1000)]},
  {id:'illumination-step',split:'validation',make:i=>pixels(i<10?32:224),truth:[event('illumination-change',1000)]},
  {id:'editorial-cut',split:'validation',make:i=>i<10?pixels(32):pixels(0,128,128,'bars'),truth:[event('cut-candidate',1000),event('image-change',1000)]},
  {id:'similar-scene-cut',split:'validation',make:i=>pixels(i<10?100:104),truth:[event('cut-candidate',1000)]},
  {id:'dissolve',split:'validation',make:i=>{
    const a=pixels(32),b=pixels(0,128,128,'bars'),t=Math.max(0,Math.min(i-3,12))/12;
    return Buffer.from(a.map((v,k)=>Math.round(v*(1-t)+b[k]*t)));
  },truth:[event('gradual-change',400)]},
  {id:'fast-pan',split:'validation',make:i=>pixels(0,128,128,'bars',i<10?0:16),truth:[event('image-change',1000)]},
  {id:'moving-object',split:'validation',make:i=>pixels(0,128,128,'object',i<10?0:24),truth:[event('image-change',1000)]},
  {id:'color-temperature-proxy',split:'validation',make:i=>pixels(96,i<10?80:176,i<10?176:80),truth:[event('color-change',1000)]},
  {id:'dark-contrast',split:'validation',make:i=>pixels(0,128,128,'dark'),truth:[]},
  {id:'vfr-cut',split:'validation',vfr:true,make:i=>i<10?pixels(32):pixels(0,128,128,'bars'),truth:[event('cut-candidate',1000),event('image-change',1000)]}
];
const scenarios=cases.map(c=>({...c,pixels:Array.from({length:20},(_,i)=>c.make(i))}));
assert.equal(new Set(cases.map(c=>c.id)).size,cases.length);
function synthetic(c){
  const indices=Array.from({length:20},(_,i)=>i).filter(i=>!c.vfr||i!==1);
  const frames=indices.map((index,i)=>({index:i,ptsTick:index*100,measurements:measureYuv420p(c.pixels[index],32,32)}));
  const changes=frames.slice(1).map((f,i)=>({ptsTick:f.ptsTick,...compareVisualFrames(frames[i].measurements,f.measurements)}));
  for(let i=0;i<changes.length-1;i++)if(changes[i].candidate&&changes[i+1].candidate&&
    !compareVisualFrames(frames[i].measurements,frames[i+2].measurements).candidate){
    changes[i].interpretation=changes[i+1].interpretation='TRANSIENT_FLASH_OR_OTHER_CHANGE';
  }return {frames,changes};
}
function predicted(a){return estimateVisualEvents(a).map(({kind,ptsTick})=>({kind,ptsTick}));}
function summary(label,rows){
  for(const split of ['tuning','validation']){
    const selected=rows.filter(r=>r.split===split);let tp=0,fp=0,fn=0;const errors=[];
    selected.forEach(r=>{const s=r.score.total;tp+=s.truePositives;fp+=s.falsePositives;fn+=s.falseNegatives;errors.push(...s.localizationErrorsTicks);});
    const precision=tp+fp?tp/(tp+fp):null,recall=tp+fn?tp/(tp+fn):null;
    console.log(JSON.stringify({label,split,scenarios:selected.length,tp,fp,fn,precision,recall,
      f1:precision!==null&&recall!==null?(precision+recall?2*precision*recall/(precision+recall):0):null,
      meanAbsoluteErrorMs:errors.length?errors.reduce((s,e)=>s+Math.abs(e),0)/errors.length:null}));
  }
  rows.filter(r=>r.score.total.falsePositives||r.score.total.falseNegatives).forEach(r=>console.log(JSON.stringify({label,scenario:r.id,
    falsePositives:r.score.total.falsePositives,falseNegatives:r.score.total.falseNegatives,perKind:r.score.perKind})));
}
let groups=0;function test(name,fn){fn();groups++;console.log('PASS CALIBRATION CONTRACT '+name);}
test('profile is versioned, frozen and never auto-tuned',()=>{
  assert.equal(CALIBRATION_PROFILE.version,1);assert.throws(()=>{CALIBRATION_PROFILE.lumaJump=0;});
});
test('known TP/FP/FN and undefined metrics',()=>{
  const r=scoreVisualEvents([event('cut-candidate',100),event('cut-candidate',900)],
    [event('cut-candidate',110),event('cut-candidate',500)],20).total;
  assert.deepEqual([r.truePositives,r.falsePositives,r.falseNegatives,r.precision,r.recall,r.f1],[1,1,1,0.5,0.5,0.5]);
  assert.deepEqual(r.localizationErrorsTicks,[-10]);assert.equal(scoreVisualEvents([],[],0).total.f1,null);
  assert.equal(scoreVisualEvents([],[event('flash-like',0)],0).total.recall,0);
});
test('maximum-cardinality matching, deterministic ties and inclusive tolerance',()=>{
  const a=[event('cut-candidate',0),event('cut-candidate',10)],b=[event('cut-candidate',9),event('cut-candidate',19)];
  assert.equal(scoreVisualEvents(a,b,9).total.truePositives,2);
  assert.equal(core.canonicalJson(scoreVisualEvents(a,b,9)),core.canonicalJson(scoreVisualEvents([...a].reverse(),b,9)));
  assert.deepEqual(scoreVisualEvents([event('cut-candidate',100),event('cut-candidate',110)],
    [event('cut-candidate',108)],20).total.localizationErrorsTicks,[2]);
});
test('wrong class, duplicates, unknown keys and resource limits rejected',()=>{
  assert.equal(scoreVisualEvents([event('flash-like',0)],[event('cut-candidate',0)],0).total.falseNegatives,1);
  for(const fn of [()=>scoreVisualEvents([event('cut-candidate',0),event('cut-candidate',0)],[],0),
    ()=>scoreVisualEvents([{...event('cut-candidate',0),provenance:'decoded-video'}],[],0),
    ()=>scoreVisualEvents(Array(257).fill(event('flash-like',0)),[],0),()=>scoreVisualEvents([],[],-1)])assert.throws(fn);
});
const syntheticRows=scenarios.map(c=>({id:c.id,split:c.split,score:scoreVisualEvents(predicted(synthetic(c)),c.truth,100)}));
test('malformed feature and original timestamp sequences fail closed',()=>{
  const a=synthetic(scenarios[0]);a.changes[0].colorDistance=NaN;assert.throws(()=>estimateVisualEvents(a));
  const b=synthetic(scenarios[0]);b.frames[1].ptsTick=0;assert.throws(()=>estimateVisualEvents(b));
});
test('13 independently labelled synthetic scenarios, split separation and honest failures',()=>{
  assert.equal(syntheticRows.length,13);
  assert.ok(syntheticRows.find(r=>r.id==='similar-scene-cut').score.total.falseNegatives>0);
  assert.ok(syntheticRows.find(r=>r.id==='fast-pan').score.perKind['cut-candidate'].falsePositives>0);
  assert.ok(estimateVisualEvents(synthetic(scenarios[3])).every(e=>!e.confirmed));
});
summary('SYNTHETIC PIXELS',syntheticRows);console.log(`${groups} calibration contract groups passed.`);
console.log('REAL FILM CALIBRATION: NOT EXECUTED.');
const decoderPath=process.env.SCENE_PLANNER_TEST_FFMPEG;
if(!decoderPath)console.log('REAL PROCEDURAL CALIBRATION: NOT EXECUTED (no explicitly selected existing FFmpeg).');
else{
  const temp=await fs.realpath(os.tmpdir()),root=await fs.mkdtemp(path.join(temp,'lightingai-calibration-tests-'));
  const dirs=async()=> (await fs.readdir(temp)).filter(n=>n.startsWith('lightingai-ingestion-')).sort();
  const baseline=await dirs(),revisionBefore=core.canonicalJson(revision),realRows=[],reports=[];let checks=0;
  try{
    for(const c of scenarios){
      const filePath=path.join(root,c.id+'.mp4');
      const generation=spawnSync(decoderPath,['-hide_banner','-loglevel','error','-nostdin','-f','rawvideo',
        '-pixel_format','yuv420p','-video_size','32x32','-framerate','10','-i','pipe:0',
        ...(c.vfr?['-vf','select=not(eq(n\\,1))','-vsync','vfr']:[]),'-c:v','libopenh264','-threads','1','-bf','0',
        '-pix_fmt','yuv420p','-an','-use_editlist','0','-video_track_timescale','1000',filePath],
        {input:Buffer.concat(c.pixels),shell:false,windowsHide:true,timeout:15000,maxBuffer:1024*1024});
      assert.equal(generation.status,0,'Procedural calibration fixture generation failed');
      const original=await fs.readFile(filePath),opts={filePath,root,mime:'video/mp4',decoderPath};
      const bundle=await analyzeOriginalVideo(opts,revision),before=core.canonicalJson(bundle);
      const reference={scenarioId:c.id,split:c.split,provenance:'procedural-script-v1',sourceIdentity:bundle.analysis.sourceIdentity,
        timeBase:{numerator:1,denominator:1000},events:c.truth,toleranceTicks:100};
      const report=createCalibrationReport(bundle,revision,reference);
      assert.equal(verifyCalibrationReport(report,bundle,revision),true);assert.ok(Object.isFrozen(report.scoring.perKind));
      assert.equal(core.canonicalJson(bundle),before);assert.equal(core.canonicalJson(revision),revisionBefore);
      assert.equal(report.calibrationHash,createCalibrationReport(bundle,revision,reference).calibrationHash);
      assert.throws(()=>verifyCalibrationReport(JSON.parse(core.canonicalJson(report)),bundle,revision));
      assert.throws(()=>createCalibrationReport(JSON.parse(core.canonicalJson(bundle)),revision,reference));
      assert.throws(()=>createCalibrationReport(bundle,revision,{...reference,sourceIdentity:'sha256:'+'0'.repeat(64)}));
      assert.throws(()=>createCalibrationReport(bundle,revision,{...reference,timeBase:{numerator:1,denominator:25}}));
      const child=core.createRevision(revision.plan,{description:'ISO',cameraOverrides:{iso:800}},'ai',revision,'calibration-test');
      assert.throws(()=>verifyCalibrationReport(report,bundle,child));
      assert.deepEqual(await fs.readFile(filePath),original);assert.deepEqual(await dirs(),baseline);
      if(c.vfr){assert.equal(bundle.analysis.frames.length,19);assert.equal(bundle.analysis.frames[1].ptsTick,200);}
      if(c.id==='static'){
        await assert.rejects(()=>analyzeOriginalVideo({...opts,timeoutMs:1},revision),/DECODER_TIMEOUT/);
        await assert.rejects(()=>analyzeOriginalVideo({...opts,signal:AbortSignal.abort()},revision),/ABORTED/);
        assert.deepEqual(await dirs(),baseline);checks++;
      }
      realRows.push({id:c.id,split:c.split,score:report.scoring});
      reports.push(report);
      if(c.id==='static'){
        const leaked=createCalibrationReport(bundle,revision,{...reference,scenarioId:'duplicate-source',split:'validation'});
        assert.throws(()=>evaluateCalibrationSet([report,leaked]));
        assert.throws(()=>evaluateCalibrationSet([JSON.parse(core.canonicalJson(report))]));
      }
    }
    const dataset=evaluateCalibrationSet(reports);assert.equal(dataset.splits.tuning.scenarioCount,2);
    assert.equal(dataset.splits.validation.scenarioCount,11);
    assert.equal(dataset.datasetHash,evaluateCalibrationSet([...reports].reverse()).datasetHash);
    assert.throws(()=>evaluateCalibrationSet([reports[0],reports[0]]));
    console.log('PASS REAL calibration dataset: disjoint scenario/source identities, deterministic aggregate and no threshold fitting.');
    summary('REAL DECODED PROCEDURAL PIXELS',realRows);
    console.log(`PASS ${realRows.length} real procedural calibration scenarios plus ${checks} failure/abort cleanup group; no real film claim.`);
  }finally{
    const resolved=await fs.realpath(root);assert.equal(path.dirname(resolved),temp);
    assert.ok(path.basename(resolved).startsWith('lightingai-calibration-tests-'));await fs.rm(resolved,{recursive:true,force:true});
  }
}
