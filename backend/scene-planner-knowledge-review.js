// K1 offline audit overlay. No original PDFs available; no page verification authority.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {KNOWLEDGE_SHA256,validateKnowledgeCatalog} from './scene-planner-knowledge.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
const fail=()=>{throw new Error('Invalid K1 review metadata or unsupported verification claim');};
function shape(x,keys){if(!x||Object.getPrototypeOf(x)!==Object.prototype||Object.keys(x).some(k=>!keys.includes(k)))fail();}
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
const copy=x=>JSON.parse(core.canonicalJson(x));
function text(x,max){if(typeof x!=='string'||!x.trim()||x.length>max||/[\x00-\x1f]/.test(x))fail();return x.trim();}
function integer(x,min,max){if(!Number.isSafeInteger(x)||x<min||x>max)fail();return x;}
function digest(x){if(typeof x!=='string'||!/^([a-f0-9]{64})$/.test(x))fail();return x;}
const bytes=readFileSync(new URL('./scene-planner-knowledge-seed-v1.json',import.meta.url));
if(createHash('sha256').update(bytes).digest('hex')!==KNOWLEDGE_SHA256)fail();
const seed=JSON.parse(bytes.toString('utf8'));validateKnowledgeCatalog(seed);freeze(seed);
const sources=new Map(seed.sources.map(s=>[s.source_id,s])),cards=new Map(seed.cards.map(c=>[c.id,c]));
export const SOURCE_REVIEW_STATUSES=freeze(['SOURCE_VERIFIED','PARTIALLY_SUPPORTED','SOURCE_MISMATCH','UNVERIFIED']);
export const DOP_REVIEW_STATUSES=freeze(['NEEDS_DOP_REVIEW','DOP_APPROVED','DOP_REJECTED']);
export const K1_DOMAINS=freeze(['story-emotion','motivation-stylization','face','light-quality','contrast-shadows',
  'lighting-roles','daylight-windows','night-practicals-effects','color-exposure','movement','continuity','multicam-studio',
  'modifiers-grip','photometry-equipment','electrical-mechanical-safety']);
const domainPrefixes={
  'story-emotion':['NAR'],'motivation-stylization':['NAR','NIGHT'],'face':['PHY','SET','TV'],
  'light-quality':['PHY'],'contrast-shadows':['PHY','SET'],'lighting-roles':['SET'],'daylight-windows':['DAY'],
  'night-practicals-effects':['NIGHT','FX'],'color-exposure':['COL','EXP'],'movement':['MOV','OPS'],
  'continuity':['MOV','SET','TV'],'multicam-studio':['TV'],'modifiers-grip':['EQ','PHY'],
  'photometry-equipment':['PHY','EQ','EXP'],'electrical-mechanical-safety':['SAFE','EQ']
};
const trustedAudits=new WeakSet(),trustedProposals=new WeakSet(),trustedDrafts=new WeakSet();
/** User/editor correction proposals are quarantined. They never verify a page or replace K0. */
export function createReferenceCorrectionProposal(raw){
  shape(raw,['cardId','sourceId','originalPdfPage','expectedKnowledgeHash','expectedSourceHash',
    'claimedSourceHash','claimedEdition','claimedPdfPageCount','proposedPdfPage','proposedPrintedPage','reason']);
  const card=cards.get(raw.cardId),source=sources.get(raw.sourceId);
  if(!card||!source||raw.expectedKnowledgeHash!==KNOWLEDGE_SHA256||raw.expectedSourceHash!==source.original_sha256||
    !card.evidence.some(e=>e.source_id===raw.sourceId&&e.pdf_page===raw.originalPdfPage))fail();
  const count=integer(raw.claimedPdfPageCount,1,5000);
  const record={contract:'lightingai-knowledge-reference-proposal/1',knowledgeHash:KNOWLEDGE_SHA256,
    cardId:raw.cardId,sourceId:raw.sourceId,originalPdfPage:raw.originalPdfPage,expectedSourceHash:raw.expectedSourceHash,
    claimedSourceHash:digest(raw.claimedSourceHash),claimedEdition:text(raw.claimedEdition,150),claimedPdfPageCount:count,
    proposedPdfPage:integer(raw.proposedPdfPage,1,count),proposedPrintedPage:integer(raw.proposedPrintedPage,0,5000),reason:text(raw.reason,500),
    evidenceType:'USER_SUPPLIED_FACT',sourceStatus:'UNVERIFIED',approvalStatus:'PENDING_INDEPENDENT_PAGE_REVIEW',
    sourceIdentityComparison:raw.claimedSourceHash===source.original_sha256?'CLAIMED_HASH_MATCH_NOT_FILE_VERIFIED':'CLAIMED_DIFFERENT_COPY_NOT_PROVEN_SOURCE_MISMATCH',
    appliesToK0:false,automaticPageShift:false};
  const result=freeze({...record,proposalHash:core.planHash(record)});trustedProposals.add(result);return result;
}
export function createKnowledgeExpansionDraft(raw){
  shape(raw,['id','domain','sourceIds','questions']);
  const id=text(raw.id,60);if(!/^K1-[A-Za-z0-9_-]+$/.test(id)||cards.has(id)||!K1_DOMAINS.includes(raw.domain))fail();
  if(!Array.isArray(raw.sourceIds)||!raw.sourceIds.length||raw.sourceIds.length>3||new Set(raw.sourceIds).size!==raw.sourceIds.length||raw.sourceIds.some(id=>!sources.has(id)))fail();
  if(!Array.isArray(raw.questions)||!raw.questions.length||raw.questions.length>10)fail();
  const record={contract:'lightingai-knowledge-expansion-draft/1',id,domain:raw.domain,baseKnowledgeHash:KNOWLEDGE_SHA256,
    sourceIds:[...raw.sourceIds].sort(),questions:raw.questions.map(q=>text(q,300)),principle:null,citations:[],
    sourceStatus:'UNVERIFIED',dopStatus:'NEEDS_DOP_REVIEW',retrievable:false,
    nextStep:'AUTHORIZED_ORIGINAL_PAGE_REVIEW_BEFORE_AUTHORING_AND_REGISTERING_NEW_CARD'};
  const result=freeze({...record,draftHash:core.planHash(record)});trustedDrafts.add(result);return result;
}
export function createKnowledgeAudit(options={}){
  shape(options,['proposals','drafts']);const proposals=options.proposals??[],drafts=options.drafts??[];
  if(!Array.isArray(proposals)||proposals.length>100||!Array.isArray(drafts)||drafts.length>100)fail();
  const proposalIds=new Set(),draftIds=new Set();
  for(const p of proposals){const {proposalHash,...record}=p;if(!trustedProposals.has(p)||proposalHash!==core.planHash(record)||proposalIds.has(proposalHash))fail();proposalIds.add(proposalHash);}
  for(const d of drafts){const {draftHash,...record}=d;if(!trustedDrafts.has(d)||draftHash!==core.planHash(record)||draftIds.has(d.id))fail();draftIds.add(d.id);}
  const sourceInventory=seed.sources.map(s=>({sourceId:s.source_id,title:s.title,author:s.author,edition:s.edition,
    expectedK0Hash:s.original_sha256,k0PdfPageCount:s.physical_pdf_pages,k0PrintedOffset:s.printed_offset,
    reportedConversationPageCount:s.source_id==='landau-2014'?285:s.source_id==='popovic-tv'?150:null,
    reportedCountProvenance:'USER_SUPPLIED_FACT_NOT_PARSED_PDF',availability:'NOT AVAILABLE FOR INDEPENDENT REVIEW',
    concreteFileHash:null,concreteEdition:null,concretePdfPageCount:null,reviewedPages:[],
    pageCountComparison:s.source_id==='brown-2019'?'NOT_COMPARED':'UNRESOLVED_REQUIRES_CONCRETE_COPY_COMPARISON'}));
  const records=seed.cards.map(c=>({id:c.id,title:c.title,domain:c.domain,sceneTypes:copy(c.scene_types),
    sourceStatus:'UNVERIFIED',dopStatus:'NEEDS_DOP_REVIEW',metadataStatus:'VALIDATED_K0_REFERENCE_INVENTORY_ONLY',
    references:c.evidence.map(e=>{const s=sources.get(e.source_id);return {sourceId:e.source_id,author:s.author,title:s.title,edition:s.edition,
      pdfPage:e.pdf_page,printedPage:e.printed_page,expectedSourceHash:s.original_sha256,
      printedOffsetInK0:s.printed_offset,sourceStatus:'UNVERIFIED',actualReviewedPage:null};}),
    limitations:c.limitations,validationNeeded:c.validation,reviewedOriginalPages:[],
    contemporaryValidationRequired:['safety','equipment','exposure','color','photometry','source_quality'].includes(c.domain),
    nextChecks:['Compare concrete file SHA-256 and edition separately','Locate printed page and PDF page independently',
      'Review whether original page supports all or part of the paraphrase','Obtain separate DoP context/creative review'],
    correctionProposalHashes:proposals.filter(p=>p.cardId===c.id).map(p=>p.proposalHash).sort()}));
  const gaps=K1_DOMAINS.map(domain=>({domain,existingCardIds:records.filter(c=>domainPrefixes[domain].includes(c.id.split('-')[0])).map(c=>c.id),
    sourceVerifiedCards:0,status:'NO_INDEPENDENTLY_REVIEWED_SOURCE_COVERAGE',newCardsAdded:0}));
  const record={contract:'lightingai-knowledge-audit/1',auditVersion:1,knowledgeVersion:seed.schema_version,knowledgeHash:KNOWLEDGE_SHA256,
    sourceInventory,records,gaps,proposals:[...proposals].sort((a,b)=>a.proposalHash<b.proposalHash?-1:1),drafts:[...drafts].sort((a,b)=>a.id<b.id?-1:1),
    summary:{cards:53,references:records.reduce((n,c)=>n+c.references.length,0),sourceVerified:0,partiallySupported:0,sourceMismatch:0,
      unverified:53,needsDoPReview:53,reviewedOriginalPages:0,newKnowledgeCards:0},
    limitations:['No original PDFs reviewed','Metadata consistency is not source verification','DoP approval and source support are separate',
      'No automatic page-number correction or altered original hashes','No historical safety statement is current certification']};
  const result=freeze({...record,auditHash:core.planHash(record)});trustedAudits.add(result);return result;
}
export function verifyKnowledgeAudit(audit){
  if(!trustedAudits.has(audit))fail();const {auditHash,...record}=audit;
  if(auditHash!==core.planHash(record)||audit.knowledgeHash!==KNOWLEDGE_SHA256)fail();return true;
}
