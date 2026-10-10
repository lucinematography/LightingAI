// Offline contract only: no decoder, I/O, provider, database or device control.
import {createRequire} from 'node:module';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
export const TEMPORAL_MODEL_VERSION=1;
const fail=()=>{throw new Error('Invalid or unverified temporal metadata');};
function shape(x,keys){
  if(!x||Object.getPrototypeOf(x)!==Object.prototype||Object.keys(x).some(k=>!keys.includes(k)))fail();
}
function integer(n,min,max){if(!Number.isSafeInteger(n)||n<min||n>max)fail();return n;}
function choice(x,values){if(!values.includes(x))fail();return x;}
function id(x){if(typeof x!=='string'||!/^([A-Za-z][A-Za-z0-9_-]{0,47})$/.test(x))fail();return x;}
function list(x,max=90000){if(!Array.isArray(x)||x.length>max)fail();return x;}
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
function copy(x){return JSON.parse(core.canonicalJson(x));}
function digest(x){if(typeof x!=='string'||!/^sha256:[a-f0-9]{64}$/.test(x))fail();return x;}
function provenance(x){return choice(x,['decoded-video','manual-verified','synthetic']);}
function range(x,time){shape(x,['startTick','endTick']);integer(x.startTick,0,time.durationTicks-1);integer(x.endTick,x.startTick+1,time.durationTicks);return copy(x);}

// Trust boundary: only a trusted local decoder/verified operator may supply
// provenance. Validation checks consistency, never proves those assertions.
export function createTemporalPlan(raw,revision,previous=null,previousRevision=null){
  const binding=core.videoRevisionBinding(revision);
  shape(raw,['sourceIdentity','timing','frames','shots','observations','lighting']);
  const sourceIdentity=digest(raw.sourceIdentity); // opaque content SHA, no path/URL/media
  let timing=null;
  if(raw.timing!=null){
    shape(raw.timing,['ticksPerSecond','durationTicks','origin','provenance']);
    integer(raw.timing.ticksPerSecond,1,1000000000);
    integer(raw.timing.durationTicks,1,Number.MAX_SAFE_INTEGER);
    choice(raw.timing.origin,['original-pts']);provenance(raw.timing.provenance);
    timing=copy(raw.timing);
  }
  const frames=list(raw.frames??[]).map((f,i)=>{
    if(!timing)fail();shape(f,['index','ptsTick','durationTicks']);
    integer(f.index,0,90000);integer(f.ptsTick,0,timing.durationTicks-1);
    integer(f.durationTicks,1,timing.durationTicks-f.ptsTick);
    if(i&&(f.index<=raw.frames[i-1].index||f.ptsTick<raw.frames[i-1].ptsTick+raw.frames[i-1].durationTicks))fail();
    return copy(f);
  });
  const full=!!timing&&frames.length>0&&frames[0].ptsTick===0&&frames[0].index===0&&
    frames.every((f,i)=>!i||(f.index===frames[i-1].index+1&&f.ptsTick===frames[i-1].ptsTick+frames[i-1].durationTicks))&&
    frames.at(-1).ptsTick+frames.at(-1).durationTicks===timing.durationTicks;
  function splitsFrame(tick){
    let low=0,high=frames.length;
    while(low<high){const mid=Math.floor((low+high)/2);if(frames[mid].ptsTick<tick)low=mid+1;else high=mid;}
    const f=frames[low-1];return !!f&&tick<f.ptsTick+f.durationTicks;
  }
  const shotIds=new Set();
  const shots=list(raw.shots??[],10000).map((s,i)=>{
    if(!timing)fail();shape(s,['id','range','provenance']);id(s.id);provenance(s.provenance);range(s.range,timing);
    if(i&&s.range.startTick<raw.shots[i-1].range.endTick)fail();
    if(shotIds.has(s.id))fail();shotIds.add(s.id);
    // A cut cannot be asserted inside a supplied frame.
    if(splitsFrame(s.range.startTick)||splitsFrame(s.range.endTick))fail();
    return copy(s);
  });
  const observationEnds=new Map();
  const observations=list(raw.observations??[],90000).map(o=>{
    if(!timing)fail();shape(o,['kind','subjectId','range','value','provenance']);
    range(o.range,timing);provenance(o.provenance);
    choice(o.kind,['camera-motion','actor-position','visibility','reference-light']);
    if(o.kind==='camera-motion'){
      if(o.subjectId!=='camera')fail();choice(o.value,['static','pan','tilt','translation','rotation','mixed','unknown']);
    }else if(o.kind==='actor-position'){
      id(o.subjectId);shape(o.value,['x','y','coordinateSpace']);
      choice(o.value.coordinateSpace,['normalized-image']);
      for(const v of [o.value.x,o.value.y])if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1)fail();
    }else if(o.kind==='visibility'){
      id(o.subjectId);choice(o.value,['visible','partial','occluded','unknown']);
    }else{
      id(o.subjectId);choice(o.value,['sun','sky','practical','key','fill','moon-backlight','unknown']);
    }
    const key=o.kind+':'+o.subjectId;
    if(observationEnds.has(key)&&o.range.startTick<observationEnds.get(key))fail();
    observationEnds.set(key,o.range.endTick);
    return copy(o);
  });
  const lights=revision.plan.lights;
  const cutTicks=new Set(shots.filter((s,i)=>i&&s.range.startTick===shots[i-1].range.endTick).map(s=>s.range.startTick));
  const lighting=list(raw.lighting??[],10000).map((l,i)=>{
    if(!timing)fail();shape(l,['range','transition','targets','exposureStops','whiteBalanceK','keyDirectionDeg','keySoftness','moonBacklight','lightLevels']);
    range(l.range,timing);choice(l.transition,['hold','dop-edit','cut-exception']);
    if(i&&l.range.startTick<raw.lighting[i-1].range.endTick)fail();
    if(l.transition==='cut-exception'&&!cutTicks.has(l.range.startTick))fail();
    list(l.targets,32).forEach(id);if(new Set(l.targets).size!==l.targets.length)fail();
    for(const [key,min,max] of [['exposureStops',-20,20],['whiteBalanceK',1000,20000],['keyDirectionDeg',0,360]]){
      if(l[key]!==null&&(typeof l[key]!=='number'||!Number.isFinite(l[key])||l[key]<min||l[key]>max))fail();
    }
    choice(l.keySoftness,['hard','soft','unknown']);choice(l.moonBacklight,['on','off','unknown']);
    list(l.lightLevels,16).forEach((v,k)=>{
      shape(v,['lightId','intensityPct','kelvin','color']);if(!lights.some(light=>light.id===v.lightId)||
        l.lightLevels.slice(0,k).some(p=>p.lightId===v.lightId))fail();
      if(typeof v.intensityPct!=='number'||!Number.isFinite(v.intensityPct)||v.intensityPct<0||v.intensityPct>100)fail();
      if(v.kelvin!==null&&(typeof v.kelvin!=='number'||!Number.isFinite(v.kelvin)||v.kelvin<1000||v.kelvin>20000))fail();
      if(v.color!==null&&(typeof v.color!=='string'||!/^#[a-fA-F0-9]{6}$/.test(v.color)))fail();
    });
    if(i&&l.transition==='hold'){
      const state=v=>Object.fromEntries(Object.entries(v).filter(([k])=>!['range','transition'].includes(k)));
      if(core.canonicalJson(state(l))!==core.canonicalJson(state(raw.lighting[i-1])))fail();
    }
    return copy(l);
  });
  let parentTemporalHash=null;
  if(previous){
    if(!previousRevision)fail();verifyTemporalPlan(previous,previousRevision);
    if(previous.sourceIdentity!==sourceIdentity||previous.sceneId!==binding.sceneId||
      revision.parentRevisionId!==previous.revisionId)fail();
    parentTemporalHash=previous.temporalHash;
  }
  const model={temporalModelVersion:TEMPORAL_MODEL_VERSION,...binding,sourceIdentity,parentTemporalHash,
    timing,frames,shots,observations,lighting,
    coverage:full?'complete-timing-only':frames.length?'partial-timing':'unknown',
    lightingCoverage:!lighting.length?'unknown':lighting[0].range.startTick===0&&
      lighting.at(-1).range.endTick===timing.durationTicks&&lighting.every((l,i)=>!i||l.range.startTick===lighting[i-1].range.endTick)?'complete-intent':'partial-intent',
    measurementStatus:!timing?'unknown':timing.provenance==='synthetic'?'synthetic':'caller-asserted',
    cameraMotionStatus:observations.some(o=>o.kind==='camera-motion')?'supplied':'unknown',
    actorTrackingStatus:observations.some(o=>o.kind==='actor-position')?'supplied':'unknown',
    unknowns:['depth','optical-flow','physical-shadows','decoded-pixel-quality'],
    intentStatus:'creative-intent',evaluationStatus:'not-executed'};
  return freeze({...model,temporalHash:core.planHash(model)});
}
function verifyIntegrity(model){
  const {temporalHash,...content}=model;
  if(model.temporalModelVersion!==TEMPORAL_MODEL_VERSION||temporalHash!==core.planHash(content))fail();
}
export function verifyTemporalPlan(model,revision){
  verifyIntegrity(model);
  const expected=createTemporalPlan(Object.fromEntries(['sourceIdentity','timing','frames','shots','observations','lighting'].map(k=>[k,model[k]])),revision);
  const {temporalHash:unused,parentTemporalHash:parent,...actual}=model;
  const {temporalHash:unused2,parentTemporalHash:parent2,...wanted}=expected;
  if(parent!==null&&(typeof parent!=='string'||!/^[a-f0-9]{64}$/.test(parent)))fail();
  if(core.canonicalJson(actual)!==core.canonicalJson(wanted))fail();
  return true;
}
export function resolveTemporalPlan(model,revision){
  verifyTemporalPlan(model,revision);
  // The frozen revision is the single source for technical cards and 2D plot.
  return freeze({binding:core.videoRevisionBinding(revision),plan:copy(revision.plan),temporal:copy(model)});
}
