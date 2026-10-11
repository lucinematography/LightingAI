// K1 isolated decision structure over unchanged K0. Advisory only; no production wiring.
import {createRequire} from 'node:module';
import {createKnowledgeAudit,verifyKnowledgeAudit} from './scene-planner-knowledge-review.js';
import {createKnowledgeRecommendation,verifyKnowledgeRecommendation,createDoPDecision,reconsiderKnowledgeRecommendation} from './scene-planner-knowledge-adapter.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const fail=()=>{throw new Error('Invalid K1 brief, decision or revision');};
function shape(x,keys){if(!x||Object.getPrototypeOf(x)!==Object.prototype||Object.keys(x).some(k=>!keys.includes(k)))fail();}
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
const copy=x=>JSON.parse(core.canonicalJson(x));
function text(x,max,optional=false){if(optional&&(x===undefined||x===''))return '';if(typeof x!=='string'||!x.trim()||x.length>max||/[\x00-\x1f]/.test(x))fail();return x.trim();}
const choices={production:['narrative','documentary','tv-multicam','music-concert','UNKNOWN'],
  location:['interior','exterior','studio','UNKNOWN'],timeOfDay:['day','night','UNKNOWN'],
  cameraMotion:['static','moving','UNKNOWN'],actorMotion:['static','moving','UNKNOWN'],budget:['limited','flexible','UNKNOWN']};
const trusted=new WeakSet(),decisionState=new WeakMap();
function request(raw){
  shape(raw,['sceneBrief','intent','style','contrast','inventory','context']);const supplied=raw.context??{};shape(supplied,Object.keys(choices).concat('actorCount'));
  const context={};for(const [k,values] of Object.entries(choices)){context[k]=supplied[k]??'UNKNOWN';if(!values.includes(context[k]))fail();}
  context.actorCount=supplied.actorCount??null;if(context.actorCount!==null&&(!Number.isInteger(context.actorCount)||context.actorCount<0||context.actorCount>20))fail();
  if(raw.inventory!==undefined&&(!Array.isArray(raw.inventory)||raw.inventory.length>150))fail();
  return {sceneBrief:text(raw.sceneBrief,640),intent:text(raw.intent,250),style:text(raw.style,80,true),contrast:text(raw.contrast,80,true),
    inventory:raw.inventory===undefined?[]:copy(raw.inventory),context};
}
function k0Request(r){
  const c=r.context,keywords=[c.production==='tv-multicam'?'multicam studio':c.production==='music-concert'?'music koncert cue':c.production,
    c.location,c.timeOfDay,c.cameraMotion==='moving'?'camera movement':null,c.actorMotion==='moving'?'actor blocking movement':null].filter(x=>x&&x!=='UNKNOWN');
  return {sceneBrief:[r.sceneBrief,...keywords].join(' '),intent:r.intent,style:r.style,contrast:r.contrast,inventory:r.inventory,
    sceneType:c.production==='tv-multicam'?'multicam':c.production==='music-concert'?'music':
      c.production==='narrative'?'narrative':c.location!=='UNKNOWN'?c.location:undefined};
}
function assemble(r,revision,recommendation,audit,previous=null){
  verifyKnowledgeRecommendation(recommendation,revision);verifyKnowledgeAudit(audit);
  if(previous)verifyK1Brief(previous,revision);
  const statuses=new Map(audit.records.map(c=>[c.id,c])),context=r.context;
  const excluded=[];
  const alternatives=recommendation.alternatives.flatMap(a=>{
    let reason=null;
    if(['layered-night','practical-night'].includes(a.id)&&context.timeOfDay==='day')reason='Night strategy conflicts with declared daytime intent';
    if(a.id==='motivated-window'&&context.timeOfDay==='night')reason='Day/window family requires a separately justified nighttime source';
    if(a.id==='cross-key'&&context.actorCount!==null&&context.actorCount<2)reason='Cross-key dialogue requires two or more participants';
    if(a.id==='music-cues'&&!['music-concert','UNKNOWN'].includes(context.production))reason='Music cue strategy conflicts with declared production context';
    if(reason){excluded.push({alternativeId:a.id,reason,evidenceType:'CREATIVE_RECOMMENDATION'});return [];}
    const byAuthor=new Map();
    for(const item of a.rationale)for(const citation of item.citations){
      const key=citation.source_id;if(!byAuthor.has(key))byAuthor.set(key,{sourceId:key,author:citation.author,edition:citation.edition,records:[]});
      const group=byAuthor.get(key);if(!group.records.some(x=>x.recordId===item.recordId&&x.pdfPage===citation.pdf_page))group.records.push({recordId:item.recordId,
        pdfPage:citation.pdf_page,printedPage:citation.printed_page,principle:item.principle,application:item.application,
        limitations:item.limitations,sourceStatus:statuses.get(item.recordId).sourceStatus,dopStatus:statuses.get(item.recordId).dopStatus});
    }
    const risks=[a.tradeOff];if(context.cameraMotion==='moving')risks.push('Confirm fixture visibility, reflections and lighting continuity over the complete camera move');
    if(context.actorMotion==='moving')risks.push('Confirm faces, spill and occlusion throughout the declared actor path; no tracking result is available');
    if(context.budget==='limited')risks.push('Do not assume rental or additional equipment; assess declared inventory and grip before feasibility');
    if(!recommendation.inventory.length||recommendation.inventory.some(i=>!i.catalogMatch))risks.push('Equipment is absent or contains unmatched catalog IDs; technical feasibility UNKNOWN');
    return [{...a,authorMethods:[...byAuthor.values()],whenAppropriate:{production:context.production,location:context.location,timeOfDay:context.timeOfDay,
      evidenceType:'CREATIVE_RECOMMENDATION',qualification:'Conditional literature comparison, not verified scene suitability'},
      whenUnsuitable:risks,conditions:a.prerequisites,preferenceBasis:'DoP goal and on-set checks decide; retrieval score is not professional approval'}];
  });
  const used=new Set(alternatives.map(a=>a.id));
  const record={contract:'lightingai-knowledge-k1-brief/1',...core.videoRevisionBinding(revision),
    knowledgeVersion:'lightingai-knowledge-k1/1',baseKnowledgeVersion:recommendation.knowledgeVersion,baseKnowledgeHash:recommendation.knowledgeHash,
    auditHash:audit.auditHash,knowledgeHash:core.planHash({baseHash:recommendation.knowledgeHash,auditHash:audit.auditHash,rulesVersion:1}),
    request:r,recommendation,audit,parentBriefHash:previous?.briefHash??null,
    creativeGoal:{scene:r.sceneBrief,intent:r.intent,style:r.style,contrast:r.contrast,evidenceType:'USER_SUPPLIED_FACT'},
    knownData:{revisionIntegrity:'VERIFIED_HASH_BINDING_NOT_PHYSICAL_MEASUREMENT',context:{...context,evidenceType:'USER_SUPPLIED_FACT'},
      inventory:recommendation.inventory,video:recommendation.video},
    unknowns:recommendation.unknowns,relevantPrinciples:recommendation.sourceCards.map(c=>({...c,
      sourceStatus:statuses.get(c.id).sourceStatus,dopStatus:statuses.get(c.id).dopStatus})),
    alternatives,excludedAlternatives:excluded,comparison:recommendation.comparison.filter(c=>c.alternatives.every(id=>used.has(id))),
    alternativeStatus:alternatives.length>=2?'MULTIPLE_CONDITIONAL_APPROACHES':alternatives.length===1?'ONE_SUPPORTED_CANDIDATE_ONLY':'INSUFFICIENT_MATCHING_EVIDENCE',
    onSetChecks:['Verify camera angles and actual blocking','Compare hard, soft and directional soft light on real faces',
      'Meter exposure and confirm camera/WB/color rendition','Confirm photometry, modifiers, grip, power and qualified safety review',
      'Review every shot and movement for shadow/color continuity'],
    doPRequestedChanges:r.style||r.contrast?{style:r.style,contrast:r.contrast,evidenceType:'USER_SUPPLIED_FACT'}:null,
    historicalTechniques:'NOT_CURRENT_LED_CAMERA_OR_SAFETY_CERTIFICATION',doPApprovalRequired:true,
    sourceVerification:'UNVERIFIED_NO_ORIGINAL_PAGES_REVIEWED',physicalCalculation:'NOT_EXECUTED',planMutation:false,renderedVideo:false};
  const result=freeze({...record,briefHash:core.planHash(record)});trusted.add(result);return result;
}
export function createK1Brief(raw,revision,options={}){
  shape(options,['audit','video','expectedBinding']);const r=request(raw),audit=options.audit??createKnowledgeAudit();
  return assemble(r,revision,createKnowledgeRecommendation(k0Request(r),revision,
    {video:options.video,expectedBinding:options.expectedBinding}),audit);
}
export function verifyK1Brief(brief,revision){
  if(!trusted.has(brief))fail();verifyKnowledgeAudit(brief.audit);verifyKnowledgeRecommendation(brief.recommendation,revision);
  const {briefHash,...record}=brief,binding=core.videoRevisionBinding(revision);
  if(briefHash!==core.planHash(record)||Object.keys(binding).some(k=>brief[k]!==binding[k]))fail();return true;
}
export function createK1DoPDecision(brief,revision,raw){
  verifyK1Brief(brief,revision);shape(raw,['action','alternativeId','changes']);let changes=null;
  if(raw.action==='accept'&&!brief.alternatives.some(a=>a.id===raw.alternativeId))fail();
  if(raw.action==='reconsider')changes=request(raw.changes);
  const decision=createDoPDecision(brief.recommendation,revision,{...raw,...(changes?{changes:k0Request(changes)}:{})});
  const record={contract:'lightingai-knowledge-k1-decision/1',...core.videoRevisionBinding(revision),briefHash:brief.briefHash,
    action:decision.action,alternativeId:decision.alternativeId,changes,doPDecisionHash:decision.decisionHash,
    sourceReviewUnaffected:true,planMutation:false,nextStep:decision.nextStep};
  const result=freeze({...record,decisionHash:core.planHash(record)});decisionState.set(result,{decision,changes});return result;
}
export function reconsiderK1Brief(decision,previous,revision,options={}){
  shape(options,['audit','video','expectedBinding']);verifyK1Brief(previous,revision);
  const state=decisionState.get(decision);if(!state||decision.action!=='reconsider'||decision.briefHash!==previous.briefHash)fail();
  const {decisionHash,...record}=decision;if(core.planHash(record)!==decisionHash)fail();
  const recommendation=reconsiderKnowledgeRecommendation(state.decision,previous.recommendation,revision,{video:options.video,expectedBinding:options.expectedBinding});
  return assemble(state.changes,revision,recommendation,options.audit??previous.audit,previous);
}
