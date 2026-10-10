import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {createTemporalPlan,verifyTemporalPlan,resolveTemporalPlan} from './scene-planner-temporal.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const input={description:'Offline Day for Night',cameraOverrides:{iso:400},dopRequest:'Hold moonlight'};
const rawPlan={lights:[{id:'L1',fixtureId:'offline-led',fixtureName:'LED',role:'key',intensityPct:50}]};
const revision=core.createRevision(rawPlan,input,'ai',null,'temporal-test');
const bytes=Buffer.from('synthetic original video bytes, NOT an MP4');
const originalBytes=Buffer.from(bytes);
const sourceIdentity='sha256:'+createHash('sha256').update(bytes).digest('hex');
const base={sourceIdentity,timing:{ticksPerSecond:1000,durationTicks:160,origin:'original-pts',provenance:'synthetic'},
  frames:[{index:0,ptsTick:0,durationTicks:40},{index:1,ptsTick:40,durationTicks:60},{index:2,ptsTick:100,durationTicks:60}],
  shots:[{id:'shot1',range:{startTick:0,endTick:100},provenance:'synthetic'},
    {id:'shot2',range:{startTick:100,endTick:160},provenance:'synthetic'}],observations:[],lighting:[]};
const clone=x=>JSON.parse(JSON.stringify(x));
const make=(x=base,r=revision,p=null)=>createTemporalPlan(x,r,p,p?revision:null);
let passed=0;
function test(name,run){run();passed++;console.log('PASS '+name);}
function rejects(change){const x=clone(base);change(x);assert.throws(()=>make(x));}
const intent=(startTick,endTick,transition='hold')=>({range:{startTick,endTick},transition,targets:['actor1'],
  exposureStops:-2,whiteBalanceK:4300,keyDirectionDeg:45,keySoftness:'soft',moonBacklight:'on',lightLevels:[{lightId:'L1',intensityPct:50,kelvin:4300,color:null}]});
test('deterministic canonical hash and explicit synthetic provenance',()=>{
  const m=make();assert.deepEqual(make(Object.fromEntries(Object.entries(base).reverse())),m);
  const {temporalHash,...body}=m;
  assert.equal(temporalHash,createHash('sha256').update(core.canonicalJson(body)).digest('hex'));
  assert.equal(m.measurementStatus,'synthetic');assert.equal(verifyTemporalPlan(m,revision),true);
});
test('VFR original PTS and complete timing do not claim decoded analysis',()=>{
  const m=make();assert.deepEqual(m.frames,base.frames);assert.equal(m.coverage,'complete-timing-only');
  assert.equal(m.evaluationStatus,'not-executed');assert.ok(m.unknowns.includes('physical-shadows'));
});
test('reject duplicate, reversed, fractional, overlapping and out-of-bounds timestamps',()=>{
  for(const value of [0,20,-1,NaN,Infinity,40.5,161])rejects(x=>{x.frames[1].ptsTick=value;});
  rejects(x=>{x.frames.reverse();});rejects(x=>{x.frames[1].index=0;});
  rejects(x=>{x.frames[2].durationTicks=61;});rejects(x=>{x.frames[0].durationTicks=0;});
});
test('missing metadata remains unknown; sampled frames remain partial',()=>{
  const m=make({sourceIdentity});assert.equal(m.coverage,'unknown');assert.equal(m.timing,null);
  assert.equal(m.cameraMotionStatus,'unknown');assert.equal(m.actorTrackingStatus,'unknown');
  const partial=clone(base);partial.frames.splice(1,1);assert.equal(make(partial).coverage,'partial-timing');
  rejects(x=>{x.timing=null;});rejects(x=>{x.timing.ticksPerSecond=0;});
  rejects(x=>{x.timing.origin='estimated-fps';});rejects(x=>{x.timing.provenance='ai-guessed';});
});
test('shot boundaries reject overlap, duplicate identity and cuts inside frames',()=>{
  rejects(x=>{x.shots[1].range.startTick=40;});rejects(x=>{x.shots[1].id='shot1';});
  rejects(x=>{x.shots[0].range.endTick=99;});rejects(x=>{x.shots[1].provenance='guessed';});
});
test('supplied camera, actor, visibility and reference lights retain provenance only',()=>{
  const x=clone(base),range={startTick:0,endTick:40};
  x.observations=[{kind:'camera-motion',subjectId:'camera',range,value:'pan',provenance:'synthetic'},
    {kind:'actor-position',subjectId:'actor1',range,value:{x:0.3,y:0.5,coordinateSpace:'normalized-image'},provenance:'synthetic'},
    {kind:'visibility',subjectId:'actor1',range,value:'occluded',provenance:'synthetic'},
    {kind:'reference-light',subjectId:'source1',range,value:'sun',provenance:'synthetic'}];
  const m=make(x);assert.deepEqual(m.observations,x.observations);assert.equal(m.actorTrackingStatus,'supplied');
  const bad=clone(x);bad.observations[1].value.x=2;assert.throws(()=>make(bad));
  bad.observations[1].value.x=0.3;bad.observations[1].provenance='inferred';assert.throws(()=>make(bad));
  const conflicting=clone(x);conflicting.observations.push(clone(x.observations[1]));assert.throws(()=>make(conflicting));
});
test('creative lighting holds across cuts with exact half-open intervals',()=>{
  const x=clone(base);x.lighting=[intent(0,100),intent(100,160)];const m=make(x);
  assert.equal(m.intentStatus,'creative-intent');assert.deepEqual(m.lighting,x.lighting);
  x.lighting[1].whiteBalanceK=5600;assert.throws(()=>make(x));
  x.lighting[1].transition='cut-exception';assert.equal(make(x).lighting[1].whiteBalanceK,5600);
  x.lighting[1].range.startTick=101;assert.throws(()=>make(x));
});
test('explicit interval edits validate bounds, light identity and unknown intent',()=>{
  const x=clone(base);x.lighting=[intent(0,40),{...intent(40,100,'dop-edit'),exposureStops:null,keySoftness:'unknown'}];
  assert.equal(make(x).lighting[1].exposureStops,null);
  for(const change of [l=>l.lightLevels[0].lightId='L2',l=>l.lightLevels[0].intensityPct=101,
    l=>l.lightLevels.push(clone(l.lightLevels[0])),l=>l.whiteBalanceK=Infinity,l=>l.range.endTick=161]){
    const bad=clone(x);change(bad.lighting[1]);assert.throws(()=>make(bad));
  }
});
test('deep freezing and caller isolation protect model, revision and original bytes',()=>{
  const x=clone(base),before=core.canonicalJson(revision),m=make(x);x.frames[0].ptsTick=10;
  assert.equal(m.frames[0].ptsTick,0);assert.throws(()=>{m.frames[0].ptsTick=5;});
  assert.equal(core.canonicalJson(revision),before);assert.deepEqual(bytes,originalBytes);
});
test('DoP updates require new child revision and retain earlier temporal hash',()=>{
  const first=make(),before=core.canonicalJson(first);
  assert.throws(()=>make(base,revision,first));
  const child=core.createRevision(rawPlan,{...input,cameraOverrides:{iso:800},dopRequest:'Raise ISO'},'ai',revision,'temporal-test');
  const next=make(base,child,first);assert.equal(next.parentTemporalHash,first.temporalHash);
  assert.throws(()=>createTemporalPlan(base,child,first));
  assert.notEqual(next.planHash,first.planHash);assert.notEqual(next.temporalHash,first.temporalHash);
  assert.equal(core.canonicalJson(first),before);assert.equal(verifyTemporalPlan(next,child),true);
  const bad=clone(base);bad.sourceIdentity='sha256:'+'b'.repeat(64);assert.throws(()=>make(bad,child,first));
});
test('reject revision, plan hash, plot identity, model hash and version mismatches',()=>{
  const m=make();
  for(const key of ['revisionId','planHash','lightPlotRevisionId','sceneId','temporalHash','temporalModelVersion']){
    const bad=clone(m);bad[key]=key==='temporalModelVersion'?2:'wrong';assert.throws(()=>verifyTemporalPlan(bad,revision));
  }
  const forged=clone(m);forged.lightPlotRevisionId='wrong';const {temporalHash,...body}=forged;
  forged.temporalHash=core.planHash(body);assert.throws(()=>verifyTemporalPlan(forged,revision));
  const badRevision=clone(revision);badRevision.plan.cameraSettings.iso=900;assert.throws(()=>verifyTemporalPlan(m,badRevision));
});
test('technical cards and light plot resolve exactly the same frozen plan',()=>{
  const resolved=resolveTemporalPlan(make(),revision);
  assert.deepEqual(resolved.plan,revision.plan);assert.equal(core.planHash(resolved.plan),resolved.binding.planHash);
  const technical=resolved.plan,plot=resolved.plan;assert.equal(technical,plot);assert.ok(Object.isFrozen(plot.lights[0]));
});
test('strict metadata schema excludes media, filenames, URLs and secrets',()=>{
  for(const key of ['video','url','token','filename','apiKey'])rejects(x=>{x[key]='private';});
  rejects(x=>{x.sourceIdentity='file:///private.mp4';});rejects(x=>{x.timing.url='https://private';});
  rejects(x=>{x.frames[0].image='data:video/mp4;base64,private';});
  const code=fs.readFileSync(new URL('./scene-planner-temporal.js',import.meta.url),'utf8');
  assert.doesNotMatch(code,/\bfetch\s*\(|writeFile|readFile|runwayRequest|createVideoRouter/);
});
console.log(`${passed} temporal architecture regression groups passed; decoded-video visual evaluation NOT EXECUTED.`);
