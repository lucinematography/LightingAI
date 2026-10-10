// LightingAI offline knowledge prototype: advisory, source cited, NO PDF payloads.
// Standalone ESM prototype only. Not wired to production routes, Android, fixtures or AI APIs.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const KNOWLEDGE_SHA256='53f3b96d0f7e231a2c5a6a1c7c2e7e4b3b31a7baa4a8232b5d2ddf9e9319ad02';
const fail=()=>{throw new Error('Invalid knowledge corpus or reference');};
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
export function validateKnowledgeCatalog(data){
  if(data?.schema_version!=='lightingai-knowledge-seed/1.0.0'||data.coverage_status!=='PILOT_CURATED_CARDS_NOT_FULL_BOOK_INGESTION'||
    data.sources?.length!==3||data.cards?.length!==53||data.chapter_index?.length!==35||data.scene_casebooks?.length!==9||
    data.license_policy?.raw_books_included!==false||data.license_policy.book_figures_included!==false||data.license_policy.long_book_quotes_included!==false)fail();
  const ids=new Set(),sources=new Map();
  const bibliography={
    'landau-2014':['David Landau','2014 electronic edition',2014,286,10],
    'brown-2019':['Blain Brown','3rd edition',2019,369,1],
    'popovic-tv':['Boris Popovic (priredio)',null,null,151,0]
  };
  for(const s of data.sources){
    if(!['landau-2014','brown-2019','popovic-tv'].includes(s.source_id)||sources.has(s.source_id)||
      typeof s.title!=='string'||typeof s.author!=='string'||!Number.isInteger(s.physical_pdf_pages)||s.physical_pdf_pages<1||
      !Number.isInteger(s.printed_offset)||!/^([a-f0-9]{64})$/.test(s.original_sha256)||s.original_in_repository!==false)fail();
    if(JSON.stringify([s.author,s.edition,s.year,s.physical_pdf_pages,s.printed_offset])!==JSON.stringify(bibliography[s.source_id]))fail();
    sources.set(s.source_id,s);
  }
  const page=(source,pdf,printed)=>{const s=sources.get(source);if(!s||!Number.isInteger(pdf)||pdf<1||pdf>s.physical_pdf_pages||printed!==pdf-s.printed_offset)fail();};
  for(const c of data.cards){
    if(!/^[A-Z]+-\d{3}$/.test(c.id)||ids.has(c.id)||c.authority!=='SOURCE_DERIVED_PARAPHRASE'||!Array.isArray(c.evidence)||!c.evidence.length||!Array.isArray(c.scene_types))fail();
    ids.add(c.id);
    for(const key of ['title','principle','application','validation','limitations','keywords','domain'])if(typeof c[key]!=='string'||!c[key]||c[key].length>1800)fail();
    for(const e of c.evidence){if(Object.keys(e).some(k=>!['source_id','pdf_page','printed_page'].includes(k)))fail();page(e.source_id,e.pdf_page,e.printed_page);}
  }
  for(const c of data.chapter_index){page(c.source_id,c.pdf_page_start,c.printed_page_start);page(c.source_id,c.pdf_page_end,c.printed_page_end);if(c.pdf_page_end<c.pdf_page_start)fail();}
  const cases=new Set();for(const c of data.scene_casebooks){if(cases.has(c.id)||!c.cards?.length||c.cards.some(id=>!ids.has(id)))fail();cases.add(c.id);}
  return true;
}
const bytes=readFileSync(new URL('./scene-planner-knowledge-seed-v1.json',import.meta.url));
if(bytes.length>128*1024||createHash('sha256').update(bytes).digest('hex')!==KNOWLEDGE_SHA256)fail();
const catalog=JSON.parse(bytes.toString('utf8'));validateKnowledgeCatalog(catalog);freeze(catalog);
const sourceMap=new Map(catalog.sources.map(s=>[s.source_id,s]));
const stop=new Set('i u na po sa za iz da je su od do se kao koje koji koja koje sam dok ili sto gde sto li and the with for from into your are this that have then them when use one two all some what how their than over but not'.split(' '));
const expansions={
  noc:['night','mesecina','moonlight','mrak'],nocna:['night','moonlight'],nocni:['night','moonlight'],
  dan:['day','daylight'],dnevno:['day','daylight'],danju:['day','daylight'],
  svetlo:['svjetlo','light','rasveta','rasvjeta'],svetla:['svjetla','light'],svetlom:['svjetlom','lighting'],
  rasveta:['rasvjeta','lighting','svetlo'],rasvete:['rasvjete','lighting'],
  glumac:['glumca','actor','subjekt'],glumica:['actor','subjekt'],
  prozor:['window','windows'],prozori:['window','windows'],
  kamera:['camera','multicam'],kamere:['camera','multicam'],
  pokret:['movement','tracking','blocking'],kretanje:['movement','tracking'],
  boja:['color','colour','kelvin'],boje:['color','colour'],
  razgovor:['dialogue','interview','talk'],govor:['interview','talk'],
  koncert:['music','cue'],muzika:['music','cue'],
  reflektor:['light','fixture'],reflektori:['light','fixture'],
  blendu:['blenda','aperture','exposure'],blenda:['aperture','exposure'],
  kontura:['rim','edge','backlight'],senka:['shadow','contrast'],senke:['shadow','contrast'],
  dokumentarac:['documentary','interview']};
const translit=Object.fromEntries(Object.entries({
  'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'dj','е':'e','ж':'z','з':'z','и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m','н':'n','њ':'nj','о':'o','п':'p','р':'r','с':'s','т':'t','ћ':'c','у':'u','ф':'f','х':'h','ц':'c','ч':'c','џ':'dz','ш':'s'}));
function norm(s){
  return String(s).toLowerCase().replace(/[а-яёђћљњџ]/g,c=>translit[c]||c)
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'dj')
    .replace(/[^a-z0-9\s]+/g,' ').replace(/\s+/g,' ').trim();
}
function terms(q){
  const seen=new Set();const result=[];
  for(const x of norm(q).split(' ')){
    if(x.length<2||stop.has(x))continue;
    for(const t of [x,...(expansions[x]||[])]){const n=norm(t);if(n.length<2||stop.has(n)||seen.has(n))continue;seen.add(n);result.push(n);}
  }
  return result.slice(0,64);
}
const include=(text,t)=>{const x=norm(text);return x.split(' ').some(word=>word===t||(t.length>=4&&word.startsWith(t)));};
function cite(e){
  const s=sourceMap.get(e.source_id);
  if(!s)throw new Error('Invalid knowledge source');
  return Object.freeze({source_id:s.source_id,title:s.title,author:s.author,year:s.year,edition:s.edition,
    pdf_page:e.pdf_page,printed_page:e.printed_page,source_sha256:s.original_sha256,
    recordVerification:'PACKAGE_REFERENCE_NOT_INDEPENDENTLY_RECHECKED'});
}
function scoreCard(card,q,scene){
  let score=0;const matched=[];
  const fields=[[card.title,5],[card.keywords,4],[card.domain,3],[card.scene_types.join(' '),3],
    [card.principle,2],[card.application,1],[card.validation,0.7]];
  for(const token of q){for(const [txt,weight] of fields){if(include(txt,token)){score+=weight;matched.push(token);break;}}}
  if(scene&&card.scene_types.some(x=>x==='all'||x===scene))score+=2;
  return {score,matched:[...new Set(matched)]};
}
/**
 * Deterministic local metadata/card retriever. This is not an LLM, a trained model,
 * full book search or a photometric engine. Never use results as measured evidence.
 */
export function retrieveKnowledge(query,options={}){
  if(!options||Object.getPrototypeOf(options)!==Object.prototype||Object.keys(options).some(k=>!['maxResults','sceneType','domain'].includes(k)))fail();
  const {maxResults=7,sceneType=null,domain=null}=options;
  if(typeof query!=='string'||query.length>1200||!Number.isSafeInteger(maxResults)||maxResults<1||maxResults>25)
    throw new Error('Invalid knowledge query');
  if(sceneType!==null&&(typeof sceneType!=='string'||sceneType.length>50))throw new Error('Invalid scene type');
  if(domain!==null&&(typeof domain!=='string'||domain.length>50))throw new Error('Invalid domain');
  const q=terms(query);if(!q.length)return Object.freeze([]);
  const results=[];
  for(const card of catalog.cards){
    if(domain&&card.domain!==domain)continue;
    const hit=scoreCard(card,q,sceneType);
    if(hit.score<=0||!hit.matched.length)continue;
    results.push(Object.freeze({id:card.id,title:card.title,domain:card.domain,
      score:Number(hit.score.toFixed(2)),matchedTerms:Object.freeze(hit.matched),
      principle:card.principle,application:card.application,validation:card.validation,
      limitations:card.limitations,sceneTypes:card.scene_types,
      evidence:Object.freeze(card.evidence.map(cite)),
      epistemicStatus:'LITERATURE_DERIVED_ADVICE_NOT_SCENE_MEASUREMENT',evidenceType:'BOOK_DERIVED_PRINCIPLE',
      requiresDoPApproval:true}));
  }
  return freeze(results.sort((a,b)=>b.score-a.score||(a.id<b.id?-1:a.id>b.id?1:0)).slice(0,maxResults));
}
export function getKnowledgeCoverage(){
  return freeze({knowledgeVersion:catalog.schema_version,knowledgeHash:KNOWLEDGE_SHA256,status:catalog.coverage_status,sources:catalog.sources.length,
    indexedChapterRanges:catalog.chapter_index.length,curatedCards:catalog.cards.length,
    exampleScenePlaybooks:catalog.scene_casebooks.length,
    rights:catalog.license_policy,limits:Object.freeze([
    'No copyright book pages or figures embedded',
    'Pilot cards do not cover every passage in three books',
    'No video decoding, scene tracking, photometric measurements or Day-for-Night renderer',
    'Not imported by LightingAI production routes or Android UI',
    'K0 adapter is local/offline only; no production UI or routes',
    'Original book pages and bibliographic assertions not independently rechecked here'])});
}
export function getReferenceSceneCase(id){
  if(typeof id!=='string')return null;
  const v=catalog.scene_casebooks.find(x=>x.id===id);if(!v)return null;
  return freeze(JSON.parse(JSON.stringify(v)));
}
/**
 * An auditable bridge for a future DoP assistant. This prepares evidence, not a
 * physically valid fixture placement or a rendered video. No automatic action.
 */
export function createEvidenceBrief(sceneDescription,{intent='predlog profesionalne rasvete',sceneType=null}={}){
  if(typeof sceneDescription!=='string'||!sceneDescription.trim()||sceneDescription.length>1200)
    throw new Error('Invalid scene brief');
  if(typeof intent!=='string'||!intent.trim()||intent.length>600)
    throw new Error('Invalid intent');
  const knowledge=retrieveKnowledge(`${sceneDescription} ${intent}`.slice(0,1200),{maxResults:9,sceneType});
  const refs=new Map();
  for(const hit of knowledge)for(const e of hit.evidence){refs.set(`${e.source_id}:${e.pdf_page}`,e);}
  return freeze({
    contract:'lightingai-knowledge-advisory-brief/1',sceneDescription,intent,sceneType,
    evidenceStatus:knowledge.length?'BOOK_DERIVED_ADVISORY_ONLY':'INSUFFICIENT_MATCHING_EVIDENCE',
    sourceCards:knowledge,sourceReferences:Object.freeze([...refs.values()]),
    decisionFramework:Object.freeze([
      'Cilj price, emocija i fokus pogleda',
      'Verovatni ili namerno stilizovani izvori svetla',
      'Blocking glumaca, planovi i sve aktivne kamere',
      'Kvalitet svetla, senke, boje, ekspozicija i fotometrija',
      'Izbor iz potvrdenog inventara i ogranicenja lokacije',
      'Bezbednost, realizacija i potvrda direktora fotografije']),
    mustVerify:Object.freeze(['Vrsta scene i kreativna namera',
      'Polozaji kamera, glumaca i prozora',
      'Fotometrija i podaci stvarnih uredjaja',
      'Kamera, profil, ISO, WB i merenje ekspozicije',
      'Bezbednosna provera struje, rigging-a i radnih uslova']),
    uncertainPhysicalValues:'UNKNOWN',doPFinalApprovalRequired:true,
    lightPlotGenerated:false,cinematicVideoRendered:false,
  });
}
