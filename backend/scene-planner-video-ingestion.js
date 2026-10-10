// Local/offline ingestion only. Never imported by paid routes or Android UI.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {constants} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {analyzeIsoVideo} from './scene-planner-media.js';
import {createTemporalPlan,verifyTemporalPlan} from './scene-planner-temporal.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
export const INGESTION_LIMITS=Object.freeze({maxBytes:40*1024*1024,maxSeconds:30,
  maxWidth:1920,maxHeight:1080,maxFrames:1800,maxDecodedBytes:512*1024*1024,
  maxProcessOutputBytes:2*1024*1024,timeoutMs:15000,maxAllocationBytes:64*1024*1024});
const error=code=>Object.assign(new Error('Video ingestion: '+code),{code});
function assert(ok,code='INVALID_METADATA'){if(!ok)throw error(code);}
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
function copy(x){return JSON.parse(core.canonicalJson(x));}
function integer(x,min=0,max=Number.MAX_SAFE_INTEGER){assert(Number.isSafeInteger(x)&&x>=min&&x<=max);return x;}
function shape(x,keys){assert(x&&Object.getPrototypeOf(x)===Object.prototype&&Object.keys(x).length===keys.length&&Object.keys(x).every(k=>keys.includes(k)));}
function aborted(signal){if(signal?.aborted)throw error('ABORTED');}
function localPath(value){assert(typeof value==='string'&&path.isAbsolute(value)&&!value.startsWith('\\\\')&&!value.startsWith('//')&&!value.includes('\0'),'LOCAL_FILE_REQUIRED');return value;}
function inside(root,file){const relative=path.relative(root,file);return relative!==''&&!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative);}

async function readOriginal(options){
  const filePath=localPath(options.filePath),root=await fs.realpath(localPath(options.root));
  const resolved=await fs.realpath(filePath);
  localPath(root);localPath(resolved);
  assert(inside(root,resolved),'OUTSIDE_INPUT_ROOT');
  const lst=await fs.lstat(filePath);assert(lst.isFile()&&!lst.isSymbolicLink(),'REGULAR_FILE_REQUIRED');
  aborted(options.signal);
  const handle=await fs.open(resolved,constants.O_RDONLY|(constants.O_NOFOLLOW||0));
  try{
    const before=await handle.stat();assert(before.isFile()&&before.size>=512&&before.size<=INGESTION_LIMITS.maxBytes,'INPUT_SIZE_LIMIT');
    const bytes=Buffer.alloc(before.size);let offset=0;
    while(offset<bytes.length){aborted(options.signal);const r=await handle.read(bytes,offset,Math.min(1024*1024,bytes.length-offset),offset);assert(r.bytesRead>0,'SOURCE_CHANGED');offset+=r.bytesRead;}
    const after=await handle.stat();
    assert(before.size===after.size&&before.mtimeMs===after.mtimeMs&&before.ctimeMs===after.ctimeMs,'SOURCE_CHANGED');
    aborted(options.signal);
    return {bytes,sourceIdentity:'sha256:'+createHash('sha256').update(bytes).digest('hex')};
  }catch(e){throw e.code&&e.message.startsWith('Video ingestion:')?e:error('LOCAL_READ_FAILED');}
  finally{await handle.close();}
}

// Reuse the unchanged fail-closed paid parser's container subset, then project
// original sample timing. These are container facts, never decoded frame counts.
function containerMetadata(bytes,mime){
  assert(['video/mp4','video/quicktime'].includes(mime),'UNSUPPORTED_FORMAT');
  assert(bytes.toString('ascii',4,8)==='ftyp','UNSUPPORTED_FORMAT');
  let seconds;try{seconds=analyzeIsoVideo(bytes);}catch{throw error('UNSUPPORTED_CONTAINER_OR_TIMING');}
  assert(seconds>=2&&seconds<=30,'DURATION_LIMIT');
  function boxes(start,end){const result=[];for(let p=start;p<end;){let size=bytes.readUInt32BE(p),header=8;if(size===1){size=Number(bytes.readBigUInt64BE(p+8));header=16;}if(!size)size=end-p;result.push({type:bytes.toString('ascii',p+4,p+8),start:p+header,end:p+size});p+=size;}return result;}
  function one(parent,type){const matches=boxes(parent.start,parent.end).filter(b=>b.type===type);assert(matches.length===1);return matches[0];}
  const root={start:0,end:bytes.length},moov=one(root,'moov');
  const tracks=boxes(moov.start,moov.end).filter(b=>b.type==='trak').map(trak=>{
    const mdia=one(trak,'mdia'),mdhd=one(mdia,'mdhd'),hdlr=one(mdia,'hdlr'),stbl=one(one(mdia,'minf'),'stbl');
    const kind=bytes.toString('ascii',hdlr.start+8,hdlr.start+12),version=bytes[mdhd.start];
    const timescale=bytes.readUInt32BE(mdhd.start+(version?20:12));
    const durationTicks=version?Number(bytes.readBigUInt64BE(mdhd.start+24)):bytes.readUInt32BE(mdhd.start+16);
    const stsd=one(stbl,'stsd'),desc=boxes(stsd.start+8,stsd.end)[0];
    const stts=one(stbl,'stts'),entryCount=bytes.readUInt32BE(stts.start+4);
    let tick=0;const samples=[];
    for(let i=0;i<entryCount;i++){
      const count=bytes.readUInt32BE(stts.start+8+i*8),duration=bytes.readUInt32BE(stts.start+12+i*8);
      if(kind==='vide'){
        assert(samples.length+count<=INGESTION_LIMITS.maxFrames,'FRAME_LIMIT');
        for(let j=0;j<count;j++){samples.push({index:samples.length,ptsTick:tick,dtsTick:tick,durationTicks:duration});tick+=duration;}
      }
    }
    const result={kind,codecTag:desc.type,timeBase:{numerator:1,denominator:timescale},startTick:0,durationTicks};
    if(kind==='vide'){
      assert(desc.type==='avc1','UNSUPPORTED_VIDEO_CODEC');
      assert(desc.end-desc.start>=78);
      const width=bytes.readUInt16BE(desc.start+24),height=bytes.readUInt16BE(desc.start+26);
      assert(width>0&&height>0&&width<=INGESTION_LIMITS.maxWidth&&height<=INGESTION_LIMITS.maxHeight,'RESOLUTION_LIMIT');
      assert(width*height*3*samples.length<=INGESTION_LIMITS.maxDecodedBytes,'DECODED_BYTE_LIMIT');
      return {...result,width,height,samples,sampleCount:samples.length,codec:'h264'};
    }
    assert(['mp4a','sowt'].includes(desc.type),'UNSUPPORTED_AUDIO_CODEC');
    return {...result,codec:desc.type==='mp4a'?'aac-declared':'pcm-s16le-declared'};
  });
  assert(tracks.length<=2&&tracks.filter(t=>t.kind==='vide').length===1,'STREAM_LIMIT');
  return {container:'iso-bmff',declaredMime:mime,durationSeconds:seconds,
    video:tracks.find(t=>t.kind==='vide'),audio:tracks.find(t=>t.kind==='soun')||null};
}
export async function inspectOriginalVideo(options){
  try{
    const {bytes,sourceIdentity}=await readOriginal(options);
    return freeze({ingestionVersion:1,sourceIdentity,byteLength:bytes.length,...containerMetadata(bytes,options.mime),
      evidence:'container-metadata',decodeStatus:'not-executed',decodedFrameCount:null});
  }catch(e){throw e.message?.startsWith('Video ingestion:')?e:error('INGESTION_FAILED');}
}

// Exact, separately testable rational-time contract. No caller can obtain a
// decoded-video receipt from this validator or submit a provenance field.
export function validateSuppliedTimeline(raw,source){
  shape(raw,['sourceIdentity','timeBase','startTick','durationTicks','frames','packets','audio']);
  assert(raw.sourceIdentity===source.sourceIdentity,'SOURCE_IDENTITY_MISMATCH');
  shape(raw.timeBase,['numerator','denominator']);integer(raw.timeBase.numerator,1,1000000);integer(raw.timeBase.denominator,1,1000000000);
  assert(raw.startTick===0,'UNSUPPORTED_PTS_ORIGIN');integer(raw.durationTicks,1);
  const scaled=raw.durationTicks*raw.timeBase.numerator;integer(scaled,1);
  assert(Math.abs(scaled/raw.timeBase.denominator-source.durationSeconds)<0.000001,'DURATION_MISMATCH');
  assert(Array.isArray(raw.frames)&&raw.frames.length>0&&raw.frames.length<=INGESTION_LIMITS.maxFrames,'FRAME_LIMIT');
  const frames=raw.frames.map((f,i)=>{
    shape(f,['index','ptsTick','durationTicks']);assert(f.index===i);integer(f.ptsTick);integer(f.durationTicks,1);
    assert(i?f.ptsTick===raw.frames[i-1].ptsTick+raw.frames[i-1].durationTicks:f.ptsTick===0,'PTS_CONTINUITY');
    integer(f.ptsTick*raw.timeBase.numerator);integer(f.durationTicks*raw.timeBase.numerator,1);
    return copy(f);
  });
  assert(frames.at(-1).ptsTick+frames.at(-1).durationTicks===raw.durationTicks,'PTS_CONTINUITY');
  assert(Array.isArray(raw.packets)&&raw.packets.length===frames.length,'PACKET_COUNT');
  const pts=new Set(frames.map(f=>f.ptsTick)),seen=new Set();
  raw.packets.forEach((p,i)=>{
    shape(p,['index','ptsTick','dtsTick']);assert(p.index===i);integer(p.ptsTick);integer(p.dtsTick,-Number.MAX_SAFE_INTEGER);
    assert(!i||p.dtsTick>raw.packets[i-1].dtsTick,'DTS_ORDER');
    assert(pts.has(p.ptsTick)&&!seen.has(p.ptsTick),'PACKET_PTS_MISMATCH');seen.add(p.ptsTick);
  });
  if(source.video?.samples){
    assert(source.video.samples.length===frames.length,'TIMELINE_SOURCE_MISMATCH');
    const packetByPts=new Map(raw.packets.map(p=>[p.ptsTick,p]));
    frames.forEach((f,i)=>{
      const original=source.video.samples[i],scale=raw.timeBase.numerator;
      // Compare exact rational values without introducing floating-point FPS.
      assert(BigInt(f.ptsTick)*BigInt(scale)*BigInt(source.video.timeBase.denominator)===
        BigInt(original.ptsTick)*BigInt(raw.timeBase.denominator),'TIMELINE_SOURCE_MISMATCH');
      assert(BigInt(f.durationTicks)*BigInt(scale)*BigInt(source.video.timeBase.denominator)===
        BigInt(original.durationTicks)*BigInt(raw.timeBase.denominator),'TIMELINE_SOURCE_MISMATCH');
      if(original.dtsTick!=null)assert(BigInt(packetByPts.get(f.ptsTick).dtsTick)*BigInt(scale)*BigInt(source.video.timeBase.denominator)===
        BigInt(original.dtsTick)*BigInt(raw.timeBase.denominator),'TIMELINE_SOURCE_MISMATCH');
    });
  }
  if(raw.audio!==null){
    shape(raw.audio,['codec','timeBase','startTick','durationTicks']);assert(['aac','pcm-s16le'].includes(raw.audio.codec));
    shape(raw.audio.timeBase,['numerator','denominator']);integer(raw.audio.timeBase.numerator,1,1000000);integer(raw.audio.timeBase.denominator,1,1000000000);
    integer(raw.audio.startTick,-Number.MAX_SAFE_INTEGER);integer(raw.audio.durationTicks,1);
    assert(Math.abs(raw.audio.startTick*raw.audio.timeBase.numerator/raw.audio.timeBase.denominator)<=5,'AUDIO_OFFSET_LIMIT');
    assert(raw.audio.durationTicks*raw.audio.timeBase.numerator/raw.audio.timeBase.denominator<=30,'AUDIO_DURATION_LIMIT');
  }
  return freeze({...copy(raw),evidence:'unverified-metadata',decodeStatus:'not-executed',
    transformation:{version:1,method:'exact-integer-tick-scaling',numerator:raw.timeBase.numerator,offsetTicks:0},
    mappedFrames:frames.map(f=>({index:f.index,ptsTick:f.ptsTick*raw.timeBase.numerator,durationTicks:f.durationTicks*raw.timeBase.numerator})),
    audioVideoOffsetSeconds:raw.audio?raw.audio.startTick*raw.audio.timeBase.numerator/raw.audio.timeBase.denominator:null});
}

// shell:false, no stdin, bounded stdout/stderr, bounded wall time and one child
// at a time. Tool errors never expose input paths or raw media metadata in logs.
let activeProcess=false;
async function runLocal(executable,args,{signal,timeoutMs=INGESTION_LIMITS.timeoutMs}={},sink=null){
  aborted(signal);assert(!activeProcess,'DECODER_BUSY');integer(timeoutMs,1,INGESTION_LIMITS.timeoutMs);
  activeProcess=true;
  try{return await new Promise((resolve,reject)=>{
    let child,reason=null,total=0,stderrBytes=0;const chunks=[];
    try{child=spawn(executable,args,{shell:false,windowsHide:true,stdio:['ignore','pipe','pipe']});}
    catch{reject(error('DECODER_START_FAILED'));return;}
    function stop(code){if(!reason){reason=code;child.kill('SIGKILL');}}
    const timer=setTimeout(()=>stop('DECODER_TIMEOUT'),timeoutMs);
    const cancel=()=>stop('ABORTED');signal?.addEventListener('abort',cancel,{once:true});
    child.stdout.on('data',chunk=>{
      total+=chunk.length;
      if(sink?total>INGESTION_LIMITS.maxDecodedBytes:total+stderrBytes>INGESTION_LIMITS.maxProcessOutputBytes)stop('DECODER_OUTPUT_LIMIT');
      else if(!reason){try{if(sink)sink(chunk);else chunks.push(chunk);}catch{stop('PIXEL_STREAM_REJECTED');}}
    });
    child.stderr.on('data',chunk=>{stderrBytes+=chunk.length;if(sink?stderrBytes>INGESTION_LIMITS.maxProcessOutputBytes:total+stderrBytes>INGESTION_LIMITS.maxProcessOutputBytes)stop('DECODER_OUTPUT_LIMIT');});
    child.on('error',()=>{reason='DECODER_START_FAILED';});
    child.on('close',code=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);if(reason||code!==0)reject(error(reason||'DECODER_FAILED'));else resolve(Buffer.concat(chunks).toString('utf8'));});
    if(signal?.aborted)cancel();
  });}finally{activeProcess=false;}
}
export async function decoderCapabilities(executable,options={}){
  const resolved=await fs.realpath(localPath(executable));assert((await fs.stat(resolved)).isFile(),'DECODER_UNAVAILABLE');
  const version=await runLocal(resolved,['-version'],options);
  assert(/^ffmpeg version [^\r\n]+/.test(version),'UNSUPPORTED_DECODER');
  const decoders=await runLocal(resolved,['-hide_banner','-decoders'],options);
  const formats=await runLocal(resolved,['-hide_banner','-demuxers'],options);
  assert(/V[^\r\n]*\bh264\s/m.test(decoders)&&/\bmov,mp4,/m.test(formats),'DECODER_CAPABILITY_MISSING');
  return freeze({version:version.split(/\r?\n/)[0],videoCodec:'h264',container:'iso-bmff',
    frameOutput:'rawvideo-sha256',pixelFormat:'yuv420p',measurementMethod:'ffmpeg-framehash-sha256',
    audioDecoding:'not-executed',network:'protocols-file-pipe-only'});
}

function decodedFrames(text,video){
  assert(text.includes('#hash: SHA256')&&text.includes('#tb 0: 1/'+video.timeBase.denominator),'DECODER_TIMEBASE_MISMATCH');
  assert(text.includes('#dimensions 0: '+video.width+'x'+video.height),'DECODER_DIMENSION_MISMATCH');
  const rows=text.split(/\r?\n/).filter(line=>line.trim()&&!line.startsWith('#'));
  assert(rows.length===video.sampleCount,'DECODED_FRAME_COUNT_MISMATCH');let decodedBytes=0;
  return rows.map((line,index)=>{
    const fields=line.split(',').map(s=>s.trim());assert(fields.length===6&&fields[0]==='0'&&/^[a-f0-9]{64}$/.test(fields[5]),'INVALID_DECODER_OUTPUT');
    const dts=Number(fields[1]),pts=Number(fields[2]),duration=Number(fields[3]),size=Number(fields[4]);
    integer(dts);integer(pts);integer(duration,1);integer(size,1,video.width*video.height*3);
    assert(pts===video.samples[index].ptsTick&&dts===pts,'DECODER_TIMESTAMP_MISMATCH');
    decodedBytes+=size;assert(decodedBytes<=INGESTION_LIMITS.maxDecodedBytes,'DECODED_BYTE_LIMIT');
    return {...video.samples[index],decodedPixelHash:fields[5],decodedByteLength:size,
      // Encoder packet duration is not promoted to the original frame duration.
      decoderOutputDurationTicks:duration};
  });
}

const trustedReceipts=new WeakSet();
let activeIngestion=false;
export async function ingestOriginalVideo(options,revision){
  const binding=core.videoRevisionBinding(revision);aborted(options.signal);
  assert(Object.keys(options).every(k=>['filePath','root','mime','decoderPath','signal','timeoutMs'].includes(k)),'UNTRUSTED_OPTIONS');
  assert(!activeIngestion,'INGESTION_BUSY');activeIngestion=true;
  let directory=null;
  try{
    const {bytes,sourceIdentity}=await readOriginal(options),metadata=containerMetadata(bytes,options.mime);
    let decoder=null,frames=[];
    if(options.decoderPath){
      decoder=await decoderCapabilities(options.decoderPath,{signal:options.signal});
      directory=await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()),'lightingai-ingestion-'));
      const snapshot=path.join(directory,'input.mp4');await fs.writeFile(snapshot,bytes,{flag:'wx',mode:0o400});
      const text=await runLocal(await fs.realpath(options.decoderPath),['-hide_banner','-loglevel','error','-nostdin',
        '-max_alloc',String(INGESTION_LIMITS.maxAllocationBytes),'-protocol_whitelist','file,pipe',
        '-filter_threads','1','-filter_complex_threads','1','-threads','1','-hwaccel','none',
        // H.264 allocation includes stride/edge padding beyond visible pixels.
        '-max_pixels',String((Math.ceil(metadata.video.width/64)+1)*64*(Math.ceil(metadata.video.height/64)+1)*64),
        '-f','mov','-i',snapshot,'-map','0:v:0','-an','-sn','-dn','-copyts','-vsync','0',
        '-c:v','rawvideo','-pix_fmt','yuv420p','-threads','1','-enc_time_base','1:'+metadata.video.timeBase.denominator,
        '-frames:v',String(INGESTION_LIMITS.maxFrames),'-f','framehash','-hash','sha256','pipe:1'],options);
      frames=decodedFrames(text,metadata.video);
    }
    const after=await readOriginal(options);assert(after.sourceIdentity===sourceIdentity,'SOURCE_CHANGED');
    const temporal=createTemporalPlan({sourceIdentity,...(decoder?{
      timing:{ticksPerSecond:metadata.video.timeBase.denominator,durationTicks:metadata.video.durationTicks,origin:'original-pts',provenance:'decoded-video'},
      frames:frames.map(({index,ptsTick,durationTicks})=>({index,ptsTick,durationTicks}))}: {})},revision);
    const record={ingestionVersion:1,...binding,sourceIdentity,byteLength:bytes.length,metadata,decoder,frames,temporal,
      decodeStatus:decoder?'decoded-video':'not-executed',decodedFrameCount:decoder?frames.length:null,
      analysis:{cuts:'UNKNOWN',exposure:'UNKNOWN',color:'UNKNOWN',whiteBalance:'UNKNOWN',cameraMotion:'UNKNOWN',actors:'UNKNOWN',occlusion:'UNKNOWN',visibleLights:'UNKNOWN',shadows:'UNKNOWN'},
      audioEvidence:metadata.audio?'container-metadata':'absent',audioDecoding:'not-executed'};
    const receipt=freeze({...record,ingestionHash:core.planHash(record)});
    if(decoder)trustedReceipts.add(receipt);
    return receipt;
  }catch(e){throw e.message?.startsWith('Video ingestion:')?e:error('INGESTION_FAILED');}
  finally{
    try{
      if(directory){
        const tempRoot=await fs.realpath(os.tmpdir()),resolved=await fs.realpath(directory);
        assert(resolved===path.resolve(directory)&&inside(tempRoot,resolved)&&
          /^lightingai-ingestion-/.test(path.basename(resolved)),'CLEANUP_PATH_REJECTED');
        await fs.rm(resolved,{recursive:true,force:true});
      }
    }finally{activeIngestion=false;}
  }
}
export function verifyVideoIngestion(record,revision){
  const {ingestionHash,...content}=record;assert(record.ingestionVersion===1&&ingestionHash===core.planHash(content),'INGESTION_HASH_MISMATCH');
  verifyTemporalPlan(record.temporal,revision);
  const binding=core.videoRevisionBinding(revision);
  Object.keys(binding).forEach(k=>assert(record[k]===binding[k],'REVISION_MISMATCH'));
  assert(record.sourceIdentity===record.temporal.sourceIdentity,'SOURCE_IDENTITY_MISMATCH');
  assert(['decoded-video','not-executed'].includes(record.decodeStatus),'INVALID_DECODE_STATUS');
  if(record.decodeStatus==='decoded-video'){
    assert(trustedReceipts.has(record),'UNTRUSTED_DECODE_RECEIPT');
    assert(record.frames.length===record.decodedFrameCount&&record.frames.length===record.temporal.frames.length,'DECODED_FRAME_COUNT_MISMATCH');
    record.frames.forEach((f,i)=>assert(f.ptsTick===record.temporal.frames[i].ptsTick&&f.durationTicks===record.temporal.frames[i].durationTicks,'DECODER_TIMESTAMP_MISMATCH'));
  }else assert(record.frames.length===0&&record.decoder===null&&record.decodedFrameCount===null&&
    record.temporal.frames.length===0&&record.temporal.timing===null,'UNTRUSTED_DECODE_RECEIPT');
  return true; // imported decoded receipts require trusted re-decoding
}

// Trusted local second pass only: every raw frame must match the first pass's
// pixel hash before its synchronous consumer can measure it. No frame files.
// The reusable buffer belongs to this function; consumers must not retain it.
export async function streamVerifiedVideoPixels(options,revision,receipt,consume){
  verifyVideoIngestion(receipt,revision);
  assert(receipt.decodeStatus==='decoded-video'&&typeof consume==='function','VERIFIED_DECODE_REQUIRED');
  assert(Object.keys(options).every(k=>['filePath','root','mime','decoderPath','signal','timeoutMs'].includes(k)),'UNTRUSTED_OPTIONS');
  assert(!activeIngestion,'INGESTION_BUSY');activeIngestion=true;
  let directory=null;
  try{
    const {bytes,sourceIdentity}=await readOriginal(options);
    assert(sourceIdentity===receipt.sourceIdentity,'SOURCE_IDENTITY_MISMATCH');
    const video=receipt.metadata.video;
    const size=video.width*video.height+2*Math.ceil(video.width/2)*Math.ceil(video.height/2);
    assert(size<=8*1024*1024&&size*receipt.frames.length<=INGESTION_LIMITS.maxDecodedBytes,'PIXEL_MEMORY_LIMIT');
    const decoder=await decoderCapabilities(options.decoderPath,{signal:options.signal});
    assert(decoder.version===receipt.decoder.version,'DECODER_MISMATCH');
    directory=await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()),'lightingai-ingestion-'));
    const snapshot=path.join(directory,'input.mp4');await fs.writeFile(snapshot,bytes,{flag:'wx',mode:0o400});
    const buffer=Buffer.alloc(size);let offset=0,index=0;
    await runLocal(await fs.realpath(options.decoderPath),['-hide_banner','-loglevel','error','-nostdin',
      '-max_alloc',String(INGESTION_LIMITS.maxAllocationBytes),'-protocol_whitelist','file,pipe',
      '-filter_threads','1','-filter_complex_threads','1','-threads','1','-hwaccel','none',
      '-max_pixels',String((Math.ceil(video.width/64)+1)*64*(Math.ceil(video.height/64)+1)*64),
      '-f','mov','-i',snapshot,'-map','0:v:0','-an','-sn','-dn','-copyts','-vsync','0',
      '-c:v','rawvideo','-pix_fmt','yuv420p','-threads','1','-enc_time_base','1:'+video.timeBase.denominator,
      '-frames:v',String(INGESTION_LIMITS.maxFrames),'-f','rawvideo','pipe:1'],options,chunk=>{
      let pos=0;
      while(pos<chunk.length){
        const n=Math.min(size-offset,chunk.length-pos);chunk.copy(buffer,offset,pos,pos+n);offset+=n;pos+=n;
        if(offset===size){
          const frame=receipt.frames[index];
          assert(frame&&createHash('sha256').update(buffer).digest('hex')===frame.decodedPixelHash,'PIXEL_HASH_MISMATCH');
          assert(consume(buffer,frame,video)!==false,'PIXEL_CONSUMER_REJECTED');
          index++;offset=0;
        }
      }
    });
    assert(offset===0&&index===receipt.frames.length,'PIXEL_FRAME_COUNT_MISMATCH');
    assert((await readOriginal(options)).sourceIdentity===sourceIdentity,'SOURCE_CHANGED');
    return index;
  }catch(e){
    throw e.message?.startsWith('Video ingestion:')?e:error('PIXEL_INGESTION_FAILED');
  }finally{
    try{if(directory){
      const tempRoot=await fs.realpath(os.tmpdir()),resolved=await fs.realpath(directory);
      assert(resolved===path.resolve(directory)&&inside(tempRoot,resolved)&&/^lightingai-ingestion-/.test(path.basename(resolved)),'CLEANUP_PATH_REJECTED');
      await fs.rm(resolved,{recursive:true,force:true});
    }}finally{activeIngestion=false;}
  }
}
