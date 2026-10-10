// Offline evaluation only; never tunes thresholds from caller data.
import {createRequire} from 'node:module';
import {verifyVisualAnalysis} from './scene-planner-video-visual.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
function assert(ok){if(!ok)throw new Error('Invalid or untrusted calibration data');}
function shape(x,keys){assert(x&&Object.getPrototypeOf(x)===Object.prototype&&Object.keys(x).length===keys.length&&Object.keys(x).every(k=>keys.includes(k)));}
export const EVENT_KINDS=freeze(['cut-candidate','illumination-change','flash-like','gradual-change','color-change','image-change']);
export const CALIBRATION_PROFILE=freeze({id:'offline-event-baseline-v1',version:1,
  lumaJump:51,histogramJump:0.45,chromaJump:0.12,spatialJump:0.12,
  uniformResidual:0.035,uniformChroma:0.06,gradualMinStep:2,gradualMaxStep:24,gradualMinSteps:3});

// Measurement input is not proof of decoding. Only createCalibrationReport can
// issue a source-bound result, after checking the genuine visual capability.
export function estimateVisualEvents(analysis){
  assert(analysis&&Array.isArray(analysis.frames)&&analysis.frames.length>=1&&analysis.frames.length<=1800&&
    Array.isArray(analysis.changes)&&analysis.changes.length===analysis.frames.length-1);
  analysis.frames.forEach((f,i)=>assert(f.index===i&&Number.isSafeInteger(f.ptsTick)&&f.ptsTick>=0&&
    (i?f.ptsTick>analysis.frames[i-1].ptsTick:f.ptsTick===0)));
  const p=CALIBRATION_PROFILE,events=[];
  const emit=(kind,i)=>events.push({kind,ptsTick:analysis.frames[i].ptsTick,index:i,
    confidence:'LOW_UNCALIBRATED_HEURISTIC',confirmed:false});
  for(let i=0;i<analysis.changes.length;i++){
    const c=analysis.changes[i];
    for(const key of ['lumaDelta','colorDistance','histogramDistance','spatialResidual'])assert(Number.isFinite(c[key]));
    assert(Math.abs(c.lumaDelta)<=255&&c.colorDistance>=0&&c.colorDistance<=Math.SQRT2&&
      c.histogramDistance>=0&&c.histogramDistance<=1&&c.spatialResidual>=0&&c.spatialResidual<=2);
    assert(Number.isSafeInteger(c.ptsTick)&&c.ptsTick===analysis.frames[i+1].ptsTick);
    if(c.interpretation==='TRANSIENT_FLASH_OR_OTHER_CHANGE'){
      if(!i||analysis.changes[i-1].interpretation!==c.interpretation)emit('flash-like',i+1);
      continue;
    }
    const uniform=c.spatialResidual<p.uniformResidual&&c.colorDistance<p.uniformChroma;
    if(Math.abs(c.lumaDelta)>p.lumaJump&&uniform)emit('illumination-change',i+1);
    if(c.colorDistance>p.chromaJump)emit('color-change',i+1);
    if(c.spatialResidual>p.spatialJump)emit('image-change',i+1);
    if(!uniform&&(c.histogramDistance>p.histogramJump||c.spatialResidual>p.spatialJump||
      (c.colorDistance>p.chromaJump&&Math.abs(c.lumaDelta)>p.lumaJump)))emit('cut-candidate',i+1);
  }
  // A run of monotonic small Y changes is a gradual code-value change, not
  // proof of physical lighting change or of an editorial dissolve.
  for(let i=0;i<analysis.changes.length;){
    const start=i,sign=Math.sign(analysis.changes[i].lumaDelta);
    while(i<analysis.changes.length&&Math.sign(analysis.changes[i].lumaDelta)===sign&&
      Math.abs(analysis.changes[i].lumaDelta)>=p.gradualMinStep&&Math.abs(analysis.changes[i].lumaDelta)<=p.gradualMaxStep)i++;
    if(i-start>=p.gradualMinSteps)emit('gradual-change',start+1);
    if(i===start)i++;
  }
  return freeze(events.sort((a,b)=>a.ptsTick-b.ptsTick||EVENT_KINDS.indexOf(a.kind)-EVENT_KINDS.indexOf(b.kind)));
}

function events(input){
  assert(Array.isArray(input)&&input.length<=256);
  const seen=new Set();return input.map(e=>{
    shape(e,['kind','ptsTick']);assert(EVENT_KINDS.includes(e.kind)&&Number.isSafeInteger(e.ptsTick)&&e.ptsTick>=0);
    const key=e.kind+':'+e.ptsTick;assert(!seen.has(key));seen.add(key);return {...e};
  }).sort((a,b)=>a.ptsTick-b.ptsTick);
}
function metrics(tp,fp,fn,errors){
  const precision=tp+fp?tp/(tp+fp):null,recall=tp+fn?tp/(tp+fn):null;
  return {truePositives:tp,falsePositives:fp,falseNegatives:fn,precision,recall,
    f1:precision!==null&&recall!==null?(precision+recall?2*precision*recall/(precision+recall):0):null,
    localizationErrorsTicks:errors,meanAbsoluteErrorTicks:errors.length?errors.reduce((s,e)=>s+Math.abs(e),0)/errors.length:null};
}
// Per-kind ordered one-to-one dynamic programming: maximize matches first,
// minimize total absolute timing error second. No double counting or greedy
// matching that loses available true positives. Bound: 257x257 cells per kind.
export function scoreVisualEvents(predicted,reference,toleranceTicks){
  const predictions=events(predicted),truth=events(reference);
  assert(Number.isSafeInteger(toleranceTicks)&&toleranceTicks>=0&&toleranceTicks<=1000000);
  const perKind={};let tp=0,fp=0,fn=0;const allErrors=[];
  for(const kind of EVENT_KINDS){
    const a=predictions.filter(e=>e.kind===kind),b=truth.filter(e=>e.kind===kind),cols=b.length+1;
    const n=(a.length+1)*cols,count=new Uint16Array(n),cost=new Float64Array(n),action=new Uint8Array(n);
    for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
      const k=i*cols+j,up=k-cols,left=k-1,diagonal=k-cols-1;
      let best=count[up],distance=cost[up],move=1;
      if(count[left]>best||(count[left]===best&&cost[left]<distance)){best=count[left];distance=cost[left];move=2;}
      const delta=Math.abs(a[i-1].ptsTick-b[j-1].ptsTick);
      if(delta<=toleranceTicks&&(count[diagonal]+1>best||(count[diagonal]+1===best&&cost[diagonal]+delta<=distance))){
        best=count[diagonal]+1;distance=cost[diagonal]+delta;move=3;
      }count[k]=best;cost[k]=distance;action[k]=move;
    }
    let i=a.length,j=b.length;const errors=[];
    while(i&&j){const move=action[i*cols+j];if(move===3){errors.push(a[i-1].ptsTick-b[j-1].ptsTick);i--;j--;}else if(move===1)i--;else j--;}
    errors.reverse();const hits=errors.length,extra=a.length-hits,miss=b.length-hits;
    perKind[kind]=metrics(hits,extra,miss,errors);tp+=hits;fp+=extra;fn+=miss;allErrors.push(...errors);
  }
  return freeze({scoringVersion:1,toleranceTicks,matching:'per-kind ordered maximum-cardinality minimum-absolute-error',
    perKind,total:metrics(tp,fp,fn,allErrors)});
}

const trusted=new WeakSet();
export function createCalibrationReport(bundle,revision,reference){
  shape(reference,['scenarioId','split','provenance','sourceIdentity','timeBase','events','toleranceTicks']);
  assert(typeof reference.scenarioId==='string'&&/^[a-z][a-z0-9-]{0,47}$/.test(reference.scenarioId));
  assert(['tuning','validation'].includes(reference.split)&&reference.provenance==='procedural-script-v1');
  const {analysis,ingestion}=bundle;verifyVisualAnalysis(analysis,ingestion,revision);
  assert(reference.sourceIdentity===analysis.sourceIdentity&&core.canonicalJson(reference.timeBase)===core.canonicalJson(analysis.timeBase));
  events(reference.events).forEach(e=>assert(e.ptsTick<ingestion.metadata.video.durationTicks));
  const predictions=estimateVisualEvents(analysis),scoring=scoreVisualEvents(predictions.map(({kind,ptsTick})=>({kind,ptsTick})),reference.events,reference.toleranceTicks);
  const record={calibrationVersion:1,method:CALIBRATION_PROFILE.id,profile:CALIBRATION_PROFILE,profileHash:core.planHash(CALIBRATION_PROFILE),
    ...core.videoRevisionBinding(revision),sourceIdentity:analysis.sourceIdentity,temporalHash:analysis.temporalHash,
    ingestionHash:analysis.ingestionHash,visualHash:analysis.visualHash,timeBase:analysis.timeBase,
    frameIdentities:analysis.frames.map(({index,ptsTick,durationTicks,decodedPixelHash})=>({index,ptsTick,durationTicks,decodedPixelHash})),
    reference:JSON.parse(core.canonicalJson(reference)),referenceHash:core.planHash(reference),predictions,scoring,
    provenance:'verified-decoded-procedural-evaluation',realFilmCalibration:'NOT EXECUTED',
    unknown:['camera-versus-object-motion','actor-identity','optical-flow','depth','geometry','physical-shadows','color-temperature','exposure-stops']};
  const result=freeze({...record,calibrationHash:core.planHash(record)});trusted.add(result);return result;
}
export function verifyCalibrationReport(report,bundle,revision){
  assert(trusted.has(report));verifyVisualAnalysis(bundle.analysis,bundle.ingestion,revision);
  const {calibrationHash,...record}=report;assert(calibrationHash===core.planHash(record));
  assert(report.visualHash===bundle.analysis.visualHash&&report.sourceIdentity===bundle.analysis.sourceIdentity);
  assert(core.canonicalJson(core.videoRevisionBinding(revision))===core.canonicalJson(Object.fromEntries(
    Object.keys(core.videoRevisionBinding(revision)).map(k=>[k,report[k]]))));return true;
}

// Prevent leakage of a labelled scenario OR identical video across splits.
// Aggregate only already-scored scenarios; never match events across videos.
export function evaluateCalibrationSet(reports){
  assert(Array.isArray(reports)&&reports.length>0&&reports.length<=128);
  const ids=new Set(),sources=new Set(),clock=core.canonicalJson(reports[0].timeBase);
  reports.forEach(r=>{
    assert(trusted.has(r)&&!ids.has(r.reference.scenarioId)&&!sources.has(r.sourceIdentity));
    assert(core.canonicalJson(r.timeBase)===clock);ids.add(r.reference.scenarioId);sources.add(r.sourceIdentity);
  });
  const splits={};
  for(const split of ['tuning','validation']){
    const rows=reports.filter(r=>r.reference.split===split).sort((a,b)=>a.reference.scenarioId<b.reference.scenarioId?-1:1),perKind={};let tp=0,fp=0,fn=0;const errors=[];
    for(const kind of EVENT_KINDS){
      let hit=0,extra=0,miss=0;const e=[];
      rows.forEach(r=>{const s=r.scoring.perKind[kind];hit+=s.truePositives;extra+=s.falsePositives;miss+=s.falseNegatives;e.push(...s.localizationErrorsTicks);});
      perKind[kind]=metrics(hit,extra,miss,e);tp+=hit;fp+=extra;fn+=miss;errors.push(...e);
    }
    splits[split]={scenarioCount:rows.length,perKind,total:metrics(tp,fp,fn,errors)};
  }
  const record={datasetVersion:1,method:CALIBRATION_PROFILE.id,timeBase:reports[0].timeBase,
    scenarioHashes:reports.map(r=>r.calibrationHash).sort(),splits,thresholdFitting:'NOT EXECUTED',realFilmCalibration:'NOT EXECUTED'};
  return freeze({...record,datasetHash:core.planHash(record)});
}
