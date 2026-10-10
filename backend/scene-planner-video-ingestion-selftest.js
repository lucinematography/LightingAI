import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {testMp4} from './scene-planner-video-test-support.js';
import {inspectOriginalVideo,ingestOriginalVideo,validateSuppliedTimeline,verifyVideoIngestion,decoderCapabilities,INGESTION_LIMITS} from './scene-planner-video-ingestion.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const revision=core.createRevision({lights:[{fixtureName:'Offline LED',fixtureId:'offline',role:'key'}]},
  {description:'Offline ingestion',cameraOverrides:{iso:400}},'ai',null,'ingestion-test');
const root=await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()),'lightingai-ingestion-tests-'));
const filePath=path.join(root,'synthetic-tables.mp4');
const opts={filePath,root,mime:'video/mp4'};
let bytes=testMp4(2);
// A real, valid synthetic VFR sample table (not decodable H.264 content).
const tableStart=bytes.indexOf(Buffer.from('stts'))-4,oldSize=bytes.readUInt32BE(tableStart),table=Buffer.alloc(32);
table.writeUInt32BE(32,0);table.write('stts',4);table.writeUInt32BE(2,12);
table.writeUInt32BE(1,16);table.writeUInt32BE(800,20);table.writeUInt32BE(1,24);table.writeUInt32BE(1200,28);
bytes=Buffer.concat([bytes.subarray(0,tableStart),table,bytes.subarray(tableStart+oldSize)]);
for(const tag of ['moov','trak','mdia','minf','stbl']){const p=bytes.indexOf(Buffer.from(tag))-4;bytes.writeUInt32BE(bytes.readUInt32BE(p)+8,p);}
const desc=bytes.indexOf(Buffer.from('avc1'))+4;
bytes.writeUInt16BE(16,desc+24);bytes.writeUInt16BE(16,desc+26);
await fs.writeFile(filePath,bytes);
let passed=0;
async function test(name,run){await run();passed++;console.log('PASS '+name);}
const clone=x=>JSON.parse(JSON.stringify(x));
const timeline={sourceIdentity:'',timeBase:{numerator:1,denominator:1000},startTick:0,durationTicks:2000,
  frames:[{index:0,ptsTick:0,durationTicks:800},{index:1,ptsTick:800,durationTicks:1200}],
  packets:[{index:0,ptsTick:0,dtsTick:0},{index:1,ptsTick:800,dtsTick:800}],audio:null};
const hash=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
async function tempDirectories(){return (await fs.readdir(await fs.realpath(os.tmpdir()))).filter(n=>n.startsWith('lightingai-ingestion-')&&!n.startsWith('lightingai-ingestion-tests-')).sort();}
try{
  const source=await inspectOriginalVideo(opts);timeline.sourceIdentity=source.sourceIdentity;
  await test('real file byte hashing and container facts never claim codec decoding',async()=>{
    assert.equal(source.sourceIdentity,hash(bytes));assert.equal(source.byteLength,bytes.length);
    assert.equal(source.video.codec,'h264');assert.equal(source.video.sampleCount,2);
    assert.equal(source.decodedFrameCount,null);assert.equal(source.decodeStatus,'not-executed');
    assert.equal(source.audio,null);assert.ok(Object.isFrozen(source.video.samples));
    assert.deepEqual(await fs.readFile(filePath),bytes);
  });
  await test('separate PTS presentation and reordered packet PTS / ordered DTS',()=>{
    const x=clone(timeline);x.packets=[{index:0,ptsTick:800,dtsTick:-40},{index:1,ptsTick:0,dtsTick:0}];
    // Future B-frame contract only, with explicitly synthetic source timing.
    const mockSource={...source,video:{...source.video,samples:source.video.samples.map(f=>({...f,dtsTick:f.ptsTick===800?-40:0}))}};
    const r=validateSuppliedTimeline(x,mockSource);assert.deepEqual(r.packets,x.packets);
    assert.equal(r.evidence,'unverified-metadata');assert.equal(r.decodeStatus,'not-executed');
    assert.throws(()=>validateSuppliedTimeline(x,source),/TIMELINE_SOURCE_MISMATCH/);
    const bad=clone(x);bad.packets.reverse();assert.throws(()=>validateSuppliedTimeline(bad,mockSource));
  });
  await test('VFR and exact rational scaling preserve original values',()=>{
    const x=clone(timeline);x.timeBase={numerator:2,denominator:1000};x.durationTicks=1000;
    x.frames.forEach(f=>{f.ptsTick/=2;f.durationTicks/=2;});x.packets.forEach(p=>{p.ptsTick/=2;p.dtsTick/=2;});
    const r=validateSuppliedTimeline(x,source);assert.deepEqual(r.frames,x.frames);
    assert.deepEqual(r.mappedFrames,timeline.frames);assert.equal(r.transformation.offsetTicks,0);
  });
  await test('reject negative and nonzero original PTS without normalization',()=>{
    for(const startTick of [-40,40]){const x=clone(timeline);x.startTick=startTick;assert.throws(()=>validateSuppliedTimeline(x,source),/UNSUPPORTED_PTS_ORIGIN/);}
    const x=clone(timeline);x.frames[0].ptsTick=-1;assert.throws(()=>validateSuppliedTimeline(x,source));
  });
  await test('reject missing, duplicate, fractional, nonfinite and discontinuous frames',()=>{
    for(const modify of [x=>delete x.frames[0].ptsTick,x=>x.frames[1].ptsTick=0,x=>x.frames[1].index=0,
      x=>x.frames[1].ptsTick=801,x=>x.frames[1].ptsTick=NaN,x=>x.frames[1].durationTicks=1199,
      x=>x.timeBase.numerator=0,x=>x.frames[1].ptsTick=800.5]){
      const x=clone(timeline);modify(x);assert.throws(()=>validateSuppliedTimeline(x,source));
    }
    const x=clone(timeline);x.packets[1].ptsTick=0;assert.throws(()=>validateSuppliedTimeline(x,source));
  });
  await test('explicit audio offset and independent audio rational clock',()=>{
    const x=clone(timeline);x.audio={codec:'aac',timeBase:{numerator:1,denominator:48000},startTick:-4800,durationTicks:96000};
    const r=validateSuppliedTimeline(x,source);assert.equal(r.audioVideoOffsetSeconds,-0.1);
    assert.deepEqual(r.audio,x.audio);x.audio.startTick=480000;assert.throws(()=>validateSuppliedTimeline(x,source));
  });
  await test('corrupt, truncated, unsupported media and container duration fail closed',async()=>{
    for(const bad of [Buffer.alloc(600),bytes.subarray(0,550),testMp4(1),testMp4(31)]){
      await fs.writeFile(filePath,bad);await assert.rejects(()=>inspectOriginalVideo(opts));
    }
    await fs.writeFile(filePath,bytes);await assert.rejects(()=>inspectOriginalVideo({...opts,mime:'video/webm'}));
  });
  await test('size, frame count, resolution and decoded-byte budgets are enforced',async()=>{
    const oversized=await fs.open(filePath,'w');await oversized.truncate(INGESTION_LIMITS.maxBytes+1);await oversized.close();
    await assert.rejects(()=>inspectOriginalVideo(opts),/INPUT_SIZE_LIMIT/);
    const large=Buffer.from(bytes);large.writeUInt16BE(1921,desc+24);await fs.writeFile(filePath,large);
    await assert.rejects(()=>inspectOriginalVideo(opts),/RESOLUTION_LIMIT/);
    const x=clone(timeline);x.frames=Array(1801).fill(timeline.frames[0]);assert.throws(()=>validateSuppliedTimeline(x,source),/FRAME_LIMIT/);
    const budget=testMp4(90);budget.writeUInt16BE(1920,budget.indexOf(Buffer.from('avc1'))+28);
    budget.writeUInt16BE(1080,budget.indexOf(Buffer.from('avc1'))+30);
    // Use a <=30-second duration with 90 samples (three per second).
    const stts=budget.indexOf(Buffer.from('stts'))+4;budget.writeUInt32BE(333,stts+12);
    for(const [tag,offset] of [['mdhd',16],['mvhd',16],['tkhd',20]])budget.writeUInt32BE(29970,budget.indexOf(Buffer.from(tag))+4+offset);
    await fs.writeFile(filePath,budget);await assert.rejects(()=>inspectOriginalVideo(opts),/DECODED_BYTE_LIMIT/);await fs.writeFile(filePath,bytes);
  });
  await test('local root containment, URL/UNC rejection and abort leave originals unchanged',async()=>{
    await assert.rejects(()=>inspectOriginalVideo({...opts,filePath:'https://private/input.mp4'}));
    await assert.rejects(()=>inspectOriginalVideo({...opts,filePath:'\\\\server\\private.mp4'}));
    const outside=path.join(await fs.realpath(os.tmpdir()),'lightingai-outside-'+path.basename(root)+'.mp4');
    try{await fs.writeFile(outside,bytes);await assert.rejects(()=>inspectOriginalVideo({...opts,filePath:outside}),/OUTSIDE_INPUT_ROOT/);}finally{await fs.rm(outside,{force:true});}
    const signal=AbortSignal.abort();await assert.rejects(()=>ingestOriginalVideo({...opts,signal},revision),/ABORTED/);
    const first=ingestOriginalVideo(opts,revision);
    await assert.rejects(()=>ingestOriginalVideo(opts,revision),/INGESTION_BUSY/);await first;
    assert.deepEqual(await fs.readFile(filePath),bytes);
  });
  await test('no decoder means unknown analysis and frozen revision binding',async()=>{
    const before=core.canonicalJson(revision),r=await ingestOriginalVideo(opts,revision);
    assert.equal(r.decodeStatus,'not-executed');assert.equal(r.temporal.coverage,'unknown');
    assert.ok(Object.values(r.analysis).every(v=>v==='UNKNOWN'));assert.equal(verifyVideoIngestion(r,revision),true);
    assert.equal(core.canonicalJson(revision),before);assert.throws(()=>{r.metadata.video.startTick=3;});
    assert.ok(!core.canonicalJson(r).includes(filePath));
  });
  await test('reject untrusted provenance, mismatched source, revision and hashes',async()=>{
    const bad=clone(timeline);bad.provenance='decoded-video';assert.throws(()=>validateSuppliedTimeline(bad,source));
    delete bad.provenance;bad.sourceIdentity='sha256:'+'f'.repeat(64);assert.throws(()=>validateSuppliedTimeline(bad,source),/SOURCE_IDENTITY_MISMATCH/);
    await assert.rejects(()=>ingestOriginalVideo({...opts,frames:timeline.frames},revision),/UNTRUSTED_OPTIONS/);
    const r=await ingestOriginalVideo(opts,revision),forged=clone(r);forged.decodeStatus='decoded-video';
    const {ingestionHash,...body}=forged;forged.ingestionHash=core.planHash(body);
    assert.throws(()=>verifyVideoIngestion(forged,revision),/UNTRUSTED_DECODE_RECEIPT/);
    const mutated=clone(r);mutated.planHash='wrong';assert.throws(()=>verifyVideoIngestion(mutated,revision));
    const changedSource=clone(r);changedSource.sourceIdentity='sha256:'+'b'.repeat(64);
    const {ingestionHash:ignored,...changedBody}=changedSource;changedSource.ingestionHash=core.planHash(changedBody);
    assert.throws(()=>verifyVideoIngestion(changedSource,revision),/SOURCE_IDENTITY_MISMATCH/);
    const child=core.createRevision(revision.plan,{description:'New ISO',cameraOverrides:{iso:800}},'ai',revision,'ingestion-test');
    assert.throws(()=>verifyVideoIngestion(r,child));assert.equal(verifyVideoIngestion(r,revision),true);
  });
  await test('non-FFmpeg executable cannot obtain decoder trust',async()=>{
    await assert.rejects(()=>decoderCapabilities(process.execPath),/UNSUPPORTED_DECODER|DECODER_FAILED/);
  });
  console.log(`${passed} ingestion contract groups passed (synthetic tables, no claimed decoding).`);

  const decoderPath=process.env.SCENE_PLANNER_TEST_FFMPEG;
  if(!decoderPath){console.log('REAL LOCAL DECODE: NOT EXECUTED (no explicitly selected existing FFmpeg).');}
  else{
    const realFile=path.join(root,'procedural-real-codec.mp4');
    const generated=spawnSync(decoderPath,['-hide_banner','-loglevel','error','-nostdin','-f','lavfi','-i',
      'testsrc2=size=32x32:rate=25:duration=2','-c:v','libopenh264','-threads','1','-bf','0','-pix_fmt','yuv420p',
      '-an','-use_editlist','0','-video_track_timescale','1000',realFile],{shell:false,windowsHide:true,timeout:15000,maxBuffer:1024*1024});
    assert.equal(generated.status,0,'Procedural H.264 fixture generation failed; no private media used');
    const realOpts={...opts,filePath:realFile,decoderPath};
    const original=await fs.readFile(realFile),dirs=await tempDirectories();
    const result=await ingestOriginalVideo(realOpts,revision);
    assert.equal(result.decodeStatus,'decoded-video');assert.equal(result.decodedFrameCount,50);
    assert.equal(result.temporal.coverage,'complete-timing-only');assert.equal(verifyVideoIngestion(result,revision),true);
    assert.equal(result.temporal.timing.provenance,'decoded-video');assert.deepEqual(await fs.readFile(realFile),original);
    assert.deepEqual(await tempDirectories(),dirs);assert.throws(()=>verifyVideoIngestion(clone(result),revision),/UNTRUSTED_DECODE_RECEIPT/);
    console.log('PASS REAL LOCAL DECODE: generated procedural H.264, 50 decoded frames, PTS match, source unchanged, temp cleanup. Visual scene analysis NOT EXECUTED.');
    const vfrFile=path.join(root,'procedural-vfr.mp4');
    const vfrGeneration=spawnSync(decoderPath,['-hide_banner','-loglevel','error','-nostdin','-f','lavfi','-i',
      'testsrc2=size=32x32:rate=25:duration=2','-vf','select=not(eq(n\\,1))','-vsync','vfr',
      '-c:v','libopenh264','-threads','1','-bf','0','-pix_fmt','yuv420p','-an','-use_editlist','0',
      '-video_track_timescale','1000',vfrFile],{shell:false,windowsHide:true,timeout:15000,maxBuffer:1024*1024});
    assert.equal(vfrGeneration.status,0,'Procedural VFR fixture generation failed');
    const vfr=await ingestOriginalVideo({...realOpts,filePath:vfrFile},revision);
    assert.equal(vfr.decodedFrameCount,49);assert.equal(vfr.frames[0].durationTicks,80);
    assert.equal(vfr.frames[1].ptsTick,80);assert.equal(vfr.frames[1].durationTicks,40);
    assert.equal(vfr.temporal.coverage,'complete-timing-only');assert.equal(verifyVideoIngestion(vfr,revision),true);
    console.log('PASS REAL LOCAL VFR DECODE: 49 frames, original 80/40 tick durations and presentation order.');
    // Synthetic tables claim H.264 but contain invalid compressed bytes.
    await assert.rejects(()=>ingestOriginalVideo({...opts,decoderPath},revision),/DECODER_FAILED/);
    assert.deepEqual(await tempDirectories(),dirs);
    await assert.rejects(()=>ingestOriginalVideo({...realOpts,timeoutMs:1},revision),/DECODER_TIMEOUT/);
    assert.deepEqual(await tempDirectories(),dirs);
    const controller=new AbortController();const pending=ingestOriginalVideo({...realOpts,signal:controller.signal},revision);
    // Observe creation of the private snapshot, then cancel during that decode
    // boundary. Attach the rejection handler immediately to avoid races.
    const rejected=assert.rejects(()=>pending,/ABORTED/);
    let observed=false;const deadline=Date.now()+5000;
    while(Date.now()<deadline){if((await tempDirectories()).length>dirs.length){observed=true;controller.abort();break;}await new Promise(r=>setTimeout(r,1));}
    if(!observed)controller.abort();await rejected;assert.ok(observed,'Cancellation must reach the snapshot/decode boundary');
    assert.deepEqual(await tempDirectories(),dirs);
    console.log('PASS REAL PROCESS FAILURE/TIMEOUT/ABORT: rejection, child completion and temporary-directory cleanup.');
    const changing=ingestOriginalVideo(realOpts,revision);
    const changedRejection=assert.rejects(()=>changing,/SOURCE_CHANGED/);
    let changed=false;const changeDeadline=Date.now()+5000;
    while(Date.now()<changeDeadline){if((await tempDirectories()).length>dirs.length){
      const altered=Buffer.from(original);altered[altered.length-1]^=1;await fs.writeFile(realFile,altered);changed=true;break;
    }await new Promise(r=>setTimeout(r,1));}
    try{await changedRejection;assert.ok(changed);}finally{await fs.writeFile(realFile,original);}
    assert.deepEqual(await tempDirectories(),dirs);
    console.log('PASS SOURCE CHANGE DURING DECODE: altered source rejected, private snapshot cleaned.');
  }
}finally{
  const resolved=await fs.realpath(root),temp=await fs.realpath(os.tmpdir());
  assert(path.dirname(resolved)===temp&&path.basename(resolved).startsWith('lightingai-ingestion-tests-'));
  await fs.rm(resolved,{recursive:true,force:true});
}
