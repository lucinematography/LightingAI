import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {retrieveKnowledge,getKnowledgeCoverage,getReferenceSceneCase,createEvidenceBrief} from './scene-planner-knowledge.js';
const data=JSON.parse(readFileSync(new URL('./scene-planner-knowledge-seed-v1.json',import.meta.url),'utf8'));
let pass=0;
const test=(name,fn)=>{fn();pass++;console.log('PASS KNOWLEDGE SEED '+name);};
test('three sources and no full PDF reproduction',()=>{
  const s=getKnowledgeCoverage();assert.equal(s.sources,3);assert.ok(s.curatedCards>=50);
  assert.equal(data.license_policy.raw_books_included,false);
  assert.equal(data.license_policy.book_figures_included,false);
  assert.equal(s.status,'PILOT_CURATED_CARDS_NOT_FULL_BOOK_INGESTION');
});
test('all cards point to valid sources and pages',()=>{
  const ids=new Set(), sources=new Map(data.sources.map(s=>[s.source_id,s]));
  for(const x of data.cards){
    assert.ok(!ids.has(x.id));ids.add(x.id);assert.ok(x.evidence.length);
    assert.ok(x.principle.length>20);assert.ok(x.application.length>20);
    assert.ok(x.authority==='SOURCE_DERIVED_PARAPHRASE');
    for(const e of x.evidence){const s=sources.get(e.source_id);assert.ok(s);
      assert.equal(e.printed_page,e.pdf_page-s.printed_offset);
      assert.ok(e.pdf_page>=1&&e.pdf_page<=s.physical_pdf_pages);}
  }
});
test('cross-key dialogue retrieval and source citation',()=>{
  const r=retrieveKnowledge('Dvoje glumaca razgovor cross key', {maxResults:15});
  assert.ok(r.some(x=>x.id==='SET-003'));
  const x=r.find(x=>x.id==='SET-003');assert.ok(x.evidence.length>=2);
  assert.equal(x.epistemicStatus,'LITERATURE_DERIVED_ADVICE_NOT_SCENE_MEASUREMENT');
});
test('daytime window and exposure',()=>{
  const r=retrieveKnowledge('Prozor dnevno svetlo i ekspozicija glumica');
  assert.ok(r.some(x=>/DAY-|EXP-/.test(x.id)));
});
test('night relighting stays advisory only',()=>{
  const r=retrieveKnowledge('nocna scena mesecina i glumac hoda', {maxResults:15});
  assert.ok(r.some(x=>x.id==='NIGHT-002'));
  assert.ok(r.every(x=>x.requiresDoPApproval));
});
test('multicamera studio and temporal music cues',()=>{
  assert.ok(retrieveKnowledge('tri kamere studio intervju',{maxResults:20}).some(x=>x.id==='TV-001'));
  assert.ok(retrieveKnowledge('muzika koncert cue svetlosna promena',{maxResults:20}).some(x=>x.id==='TV-004'));
});
test('known example case cites card IDs',()=>{
  for(const v of data.scene_casebooks){const result=getReferenceSceneCase(v.id);assert.equal(result.id,v.id);
    for(const id of result.cards)assert.ok(data.cards.find(x=>x.id===id));}
  assert.equal(getReferenceSceneCase('unavailable'),null);
});
test('input limits, empty results and deterministic response',()=>{
  assert.equal(retrieveKnowledge('').length,0);
  assert.throws(()=>retrieveKnowledge('x'.repeat(1201)));
  assert.throws(()=>retrieveKnowledge('night',{maxResults:1000}));
  const a=retrieveKnowledge('green screen lighting');const b=retrieveKnowledge('green screen lighting');
  assert.deepEqual(a,b);
});
test('specific recommendation never claims ownership, measurements or production API',()=>{
  assert.ok(!('videoRenderer' in getKnowledgeCoverage()));
  const r=retrieveKnowledge('lux svetlo', {maxResults:20});
  assert.ok(r.some(x=>x.id==='META-002'));
  assert.ok(r.every(x=>x.epistemicStatus!=='MEASURED'));
});
test('auditable DoP evidence brief stays advisory',()=>{
  const r=createEvidenceBrief('Glumica hoda kraj prozora, dnevna scena', {intent:'prirodno svetlo'});
  assert.ok(r.sourceCards.length>0);assert.ok(r.sourceReferences.length>0);
  assert.equal(r.uncertainPhysicalValues,'UNKNOWN');
  assert.equal(r.doPFinalApprovalRequired,true);
  assert.equal(r.lightPlotGenerated,false);assert.equal(r.cinematicVideoRendered,false);
});
console.log(`${pass} offline knowledge groups passed; pilot corpus, no full books or renderer.`);
