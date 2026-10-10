// K0 local advisory boundary. No routes, provider calls, database or fixture control.
import {createRequire} from 'node:module';
import {retrieveKnowledge,getKnowledgeCoverage} from './scene-planner-knowledge.js';
import {buildRuntimeCatalog} from './catalog-runtime.js';
import {verifyVideoIngestion} from './scene-planner-video-ingestion.js';
import {verifyVisualAnalysis} from './scene-planner-video-visual.js';
import {verifyCalibrationReport} from './scene-planner-video-calibration.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const fail=()=>{throw new Error('Invalid knowledge recommendation, evidence or revision binding');};
const copy=x=>JSON.parse(core.canonicalJson(x));
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
function shape(x,keys){if(!x||Object.getPrototypeOf(x)!==Object.prototype||Object.keys(x).some(k=>!keys.includes(k)))fail();}
function text(x,max,optional=false){if(optional&&(x===undefined||x===''))return '';if(typeof x!=='string'||!x.trim()||x.length>max||/[\x00-\x1f]/.test(x))fail();return x.trim();}
export const EVIDENCE_TYPES=freeze(['BOOK_DERIVED_PRINCIPLE','PIXEL_MEASUREMENT','VERIFIED_CALCULATION','USER_SUPPLIED_FACT','CREATIVE_RECOMMENDATION','UNKNOWN']);
const trusted=new WeakSet(),decisions=new WeakSet();
const strategies=freeze([
  {id:'cross-key',cards:['SET-003','TV-002'],roles:['key','backlight'],benefit:'Uzajamno modelovanje dva lica i odvajanje planova.',tradeOff:'Proveriti oba smera kamere, zaklanjanje i vidljivost opreme.'},
  {id:'motivated-window',cards:['PHY-004','DAY-001','DAY-002','DAY-003'],roles:['key','negative-fill'],benefit:'Pravac svetla prati prozor ili sunce i podrzava prirodan izgled.',tradeOff:'Promene dnevnog svetla i clipping prozora mogu ugroziti kontinuitet.'},
  {id:'soft-fill',cards:['SET-005','PHY-003','PHY-006'],roles:['key','fill'],benefit:'Meksi prelazi i citljivost lica iz vise uglova.',tradeOff:'Preveliki fill moze smanjiti kontrast, dubinu i dramaticnost.'},
  {id:'negative-fill',cards:['PHY-007','PHY-008'],roles:['negative-fill'],benefit:'Smanjenje spill-a i dublje senke bez obaveznog dodatnog izvora.',tradeOff:'Potrebni grip i kontrola senki pri celom pokretu.'},
  {id:'practical-night',cards:['NIGHT-003','NAR-002','FX-002'],roles:['key','ambient'],benefit:'Praktikal daje motivaciju; dodatni izvor moze diskretno podrzati radnju.',tradeOff:'Izlaz, flicker i boja praktikalnog izvora moraju se proveriti na setu.'},
  {id:'layered-night',cards:['NIGHT-001','NIGHT-002','SET-001','SET-006'],roles:['key','backlight','ambient'],benefit:'Selektivna citljivost i odvajanje osobe od pozadine u nocnoj konvenciji.',tradeOff:'Stilizovana mesecina i kontura zahtevaju DoP izbor; nema univerzalnog Kelvina.'},
  {id:'multicam-common',cards:['TV-001','TV-003','SET-007'],roles:['key','fill'],benefit:'Zajednicka postavka podrzava simultane uglove kamera.',tradeOff:'Kompromis u modelovanju u odnosu na zasebno osvetljen filmski kadar.'},
  {id:'music-cues',cards:['TV-004'],roles:['key','backlight','ambient'],benefit:'Vremenske promene podrzavaju muzicku dramaturgiju.',tradeOff:'Cue ideja zahteva odobrene vremenske oznake; nije DMX nalog.'},
  {id:'neutral-color',cards:['COL-003','COL-004'],roles:['key'],benefit:'Provera neutralnosti i spektralne kompatibilnosti izvora sa kamerom.',tradeOff:'Neutralnost moze ukloniti zeljeni kreativni toplo-hladni kontrast.'},
  {id:'mixed-color',cards:['COL-001','COL-002'],roles:['key','backlight'],benefit:'Motivisana razlika boja moze podrzati emociju i odvajanje.',tradeOff:'Tonovi koze, gubici kroz gel i white balance zahtevaju probu.'}
]);
function videoEvidence(video,revision){
  if(video===undefined)return null;
  shape(video,['ingestion','analysis','calibration']);
  verifyVideoIngestion(video.ingestion,revision);
  // Metadata-only JSON cannot claim a verified original or decoded provenance.
  if(video.ingestion.decodeStatus!=='decoded-video')fail();
  if(video.analysis)verifyVisualAnalysis(video.analysis,video.ingestion,revision);
  if(video.calibration){if(!video.analysis)fail();verifyCalibrationReport(video.calibration,video,revision);}
  return {sourceIdentity:video.ingestion.sourceIdentity,ingestionHash:video.ingestion.ingestionHash,
    temporalHash:video.ingestion.temporal.temporalHash,decodeStatus:video.ingestion.decodeStatus,
    visualHash:video.analysis?.visualHash??null,calibrationHash:video.calibration?.calibrationHash??null,
    pixelEvidence:video.analysis?{evidenceType:'PIXEL_MEASUREMENT',method:video.analysis.method,
      frameCount:video.analysis.frames.length,timeBase:copy(video.analysis.timeBase),
      interpretation:'Decoded code-value statistics only; not lux, WB, depth, actor tracking or shadows.'}:null};
}
function request(raw){
  shape(raw,['sceneBrief','intent','style','contrast','sceneType','inventory']);
  const r={sceneBrief:text(raw.sceneBrief,800),intent:text(raw.intent,300),style:text(raw.style,100,true),
    contrast:text(raw.contrast,100,true),sceneType:text(raw.sceneType,40,true),inventory:[]};
  if(r.sceneType&&!['day','night','interior','exterior','dialogue','studio','multicam','music','concert','narrative'].includes(r.sceneType))fail();
  const inventory=raw.inventory??[];
  if(!Array.isArray(inventory)||inventory.length>150)fail();
  const ids=new Set();r.inventory=inventory.map(x=>{shape(x,['fixtureId','qty']);const fixtureId=text(x.fixtureId,150);
    if(ids.has(fixtureId)||!Number.isInteger(x.qty)||x.qty<1||x.qty>99)fail();ids.add(fixtureId);return {fixtureId,qty:x.qty};});
  r.inventory.sort((a,b)=>a.fixtureId<b.fixtureId?-1:a.fixtureId>b.fixtureId?1:0);return r;
}
export function createKnowledgeRecommendation(raw,revision,options={}){
  shape(options,['expectedBinding','video','previous']);
  const binding=core.videoRevisionBinding(revision);
  if(options.expectedBinding&&core.canonicalJson(options.expectedBinding)!==core.canonicalJson(binding))fail();
  const previous=options.previous??null;
  if(previous)verifyKnowledgeRecommendation(previous,revision);
  const video=videoEvidence(options.video,revision);
  if(previous?.video&&(!video||previous.video.sourceIdentity!==video.sourceIdentity||previous.video.temporalHash!==video.temporalHash))fail();
  const r=request(raw),coverage=getKnowledgeCoverage();
  const sourceCards=retrieveKnowledge([r.sceneBrief,r.intent,r.style,r.contrast].filter(Boolean).join(' ').slice(0,1200),
    {maxResults:25,sceneType:r.sceneType||null});
  const selected=new Map(sourceCards.map(c=>[c.id,c]));
  const catalog=new Map(buildRuntimeCatalog().fixtures.map(f=>[f.id,f]));
  const inventory=r.inventory.map(x=>{const fixture=catalog.get(x.fixtureId);return {...x,
    evidenceType:'USER_SUPPLIED_FACT',ownership:'USER_DECLARED_NOT_INDEPENDENTLY_VERIFIED',
    catalogMatch:!!fixture,model:fixture?[fixture.manufacturer,fixture.model].filter(Boolean).join(' '):null,
    physicalOutput:'UNKNOWN'};});
  const alternatives=strategies.flatMap(s=>{
    const cards=s.cards.filter(id=>selected.has(id));if(!cards.length)return [];
    return [{id:s.id,evidenceType:'CREATIVE_RECOMMENDATION',title:cards.map(id=>selected.get(id).title).join(' / '),
      cardIds:cards,roles:s.roles,motivation:r.intent,expectedLook:s.benefit,tradeOff:s.tradeOff,
      rationale:cards.map(id=>({recordId:id,principle:selected.get(id).principle,application:selected.get(id).application,
        mustValidate:selected.get(id).validation,limitations:selected.get(id).limitations,
        citations:selected.get(id).evidence,evidenceType:'BOOK_DERIVED_PRINCIPLE'})),
      prerequisites:['Confirm blocking and every camera angle','Confirm fixture, modifiers, grip, power and safe rigging on set'],
      equipmentStatus:inventory.length?'USER_DECLARED_REQUIRES_TECHNICAL_MATCH':'UNKNOWN_MISSING_INVENTORY',
      placement:'UNKNOWN',distanceM:null,lux:null,cameraParameters:'UNKNOWN',applicability:'CONDITIONAL_REQUIRES_DOP_REVIEW'}];
  });
  const pair=(a,b,reason)=>alternatives.some(x=>x.id===a)&&alternatives.some(x=>x.id===b)?[{alternatives:[a,b],reason,evidenceType:'CREATIVE_RECOMMENDATION'}]:[];
  const comparison=[...pair('cross-key','soft-fill','Cross-key favors directional modeling; soft fill favors multi-angle readability. Blocking decides.'),
    ...pair('soft-fill','negative-fill','Adding fill and subtracting bounce serve different contrast intentions. Neither is universal.'),
    ...pair('neutral-color','mixed-color','Neutral color matching and motivated warm/cool separation serve different aesthetic intentions.')];
  const refs=new Map();for(const c of sourceCards)for(const e of c.evidence)refs.set(`${e.source_id}:${e.pdf_page}`,e);
  const record={contract:'lightingai-knowledge-recommendation/1',...binding,
    parentRecommendationHash:previous?.recommendationHash??null,knowledgeVersion:coverage.knowledgeVersion,knowledgeHash:coverage.knowledgeHash,
    request:r,requestEvidenceType:'USER_SUPPLIED_FACT',selectedCardIds:sourceCards.map(c=>c.id),sourceCards,
    sourceCitations:[...refs.values()],alternatives,comparison,inventory,video,
    existingLightIds:revision.plan.lights.map(l=>l.id),
    revisionContext:{lightSettings:'ESTIMATED_PLAN_NOT_MEASUREMENTS',geometry:revision.plan.dataStatus.geometry,
      camera:copy(revision.plan.dataStatus.cameraSettings),blocking:'UNKNOWN_PHYSICAL_TRAJECTORY'},
    considerations:['Story, emotion and viewer attention','Motivation and intentional stylization','Camera angles and shot continuity',
      'Reliable actor movement only','Key, fill, backlight, negative fill and source softness','Contrast, shadows and depth separation',
      'Color, WB and measured exposure','Equipment, modifiers, grip, electricity and on-set safety'],
    unknowns:{physicalGeometry:'UNKNOWN',photometry:'UNKNOWN',cameraCalibration:'UNKNOWN',actorTracking:'UNKNOWN',shadowContinuity:'UNKNOWN',powerAndRigging:'UNKNOWN'},
    calculationStatus:'NOT_EXECUTED_NO_VERIFIED_PHOTOMETRY',doPApprovalRequired:true,
    lightPlotModified:false,renderedVideo:false,decisionStatus:'PROPOSED'};
  const result=freeze({...record,recommendationHash:core.planHash(record)});trusted.add(result);return result;
}
export function verifyKnowledgeRecommendation(report,revision){
  if(!trusted.has(report))fail();
  const binding=core.videoRevisionBinding(revision),{recommendationHash,...record}=report;
  if(recommendationHash!==core.planHash(record)||Object.keys(binding).some(k=>report[k]!==binding[k])||
    report.knowledgeHash!==getKnowledgeCoverage().knowledgeHash)fail();return true;
}
export function createDoPDecision(report,revision,raw){
  verifyKnowledgeRecommendation(report,revision);shape(raw,['action','alternativeId','changes']);
  if(!['accept','reject','reconsider'].includes(raw.action))fail();
  let alternativeId=null,changes=null;
  if(raw.action==='accept'){alternativeId=text(raw.alternativeId,60);if(!report.alternatives.some(a=>a.id===alternativeId)||raw.changes!==undefined)fail();}
  else if(raw.alternativeId!==undefined)fail();
  if(raw.action==='reconsider')changes=request(raw.changes);else if(raw.changes!==undefined)fail();
  const record={contract:'lightingai-knowledge-dop-decision/1',...core.videoRevisionBinding(revision),
    recommendationHash:report.recommendationHash,action:raw.action,alternativeId,changes,evidenceType:'USER_SUPPLIED_FACT',
    planMutation:false,nextStep:raw.action==='reconsider'?'CREATE_NEW_ADVISORY_THEN_SEPARATELY_APPROVED_IMMUTABLE_PLAN_REVISION':
      raw.action==='accept'?'DOP_ACCEPTED_CONCEPT_NOT_PHYSICALLY_VALIDATED_PLAN':'REJECTED_NO_PLAN_CHANGE'};
  const result=freeze({...record,decisionHash:core.planHash(record)});decisions.add(result);return result;
}
export function reconsiderKnowledgeRecommendation(decision,previous,revision,options={}){
  if(!decisions.has(decision)||decision.action!=='reconsider'||decision.recommendationHash!==previous.recommendationHash)fail();
  const {decisionHash,...record}=decision;if(core.planHash(record)!==decisionHash)fail();
  shape(options,['expectedBinding','video']);return createKnowledgeRecommendation(decision.changes,revision,{...options,previous});
}
