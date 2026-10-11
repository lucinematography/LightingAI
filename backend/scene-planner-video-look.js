// Isolated, offline Day-for-Night pixel grade. No HTTP, DB, device I/O,
// encoder or MP4 output. This is NOT photometrically accurate relighting.
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {streamVerifiedVideoPixels} from './scene-planner-video-ingestion.js';
import {verifyVisualAnalysis,measureYuv420p} from './scene-planner-video-visual.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');

export const GRADE_METHOD='fixed-unmanaged-yuv420p-code-grade-v1';
const trustedRecipes=new WeakSet(),trustedReceipts=new WeakSet();
const reject=()=>{throw new Error('Invalid or untrusted offline Day-for-Night grade');};
function freeze(value){
  if(value&&typeof value==='object'){
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function matchesRevision(object,revision){
  const binding=core.videoRevisionBinding(revision);
  return Object.keys(binding).every(key=>object[key]===binding[key]);
}
function verifyRecipe(recipe,revision){
  if(!recipe||!trustedRecipes.has(recipe)||!Object.isFrozen(recipe)||
     !matchesRevision(recipe,revision))reject();
  const {recipeHash,...body}=recipe;
  if(recipeHash!==core.planHash(body)||recipe.method!==GRADE_METHOD||
     recipe.renderClass!=='UNMANAGED_CREATIVE_PIXEL_GRADE_ONLY')reject();
  return true;
}
export function createDayForNightGradeRecipe(revision,controls){
  const binding=core.videoRevisionBinding(revision);
  if(revision.plan.look!=='Day for Night'||revision.plan.captureLighting!=='day')reject();
  if(!controls||Object.getPrototypeOf(controls)!==Object.prototype||
     Object.keys(controls).length!==2||
     !Object.keys(controls).every(key=>['darkenPct','coolPct'].includes(key))||
     !Number.isInteger(controls.darkenPct)||controls.darkenPct<1||controls.darkenPct>80||
     !Number.isInteger(controls.coolPct)||controls.coolPct<0||controls.coolPct>100)reject();
  const record={
    contract:'lightingai-offline-day-for-night-grade-recipe/1',
    ...binding,method:GRADE_METHOD,
    renderClass:'UNMANAGED_CREATIVE_PIXEL_GRADE_ONLY',
    darkenPct:controls.darkenPct,coolPct:controls.coolPct,
    transferFunction:'UNKNOWN',yuvRange:'UNKNOWN',matrixCoefficients:'UNKNOWN',
    physicallyBasedRelighting:false,fixtureLightingSimulated:false,
    actualExposureVerified:false,whiteBalanceCalibrated:false
  };
  const recipe=freeze({...record,recipeHash:core.planHash(record)});
  trustedRecipes.add(recipe);
  return recipe;
}
function codeByteSize(width,height){
  if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||
     width<2||height<2||width>1920||height>1080)reject();
  const y=width*height,c=Math.ceil(width/2)*Math.ceil(height/2),length=y+2*c;
  if(length>8*1024*1024)reject();
  return {y,c,length};
}
function clip(value){return Math.max(0,Math.min(255,Math.round(value)));}
// A fixed transform is applied to original decoded pixels, not a CSS filter.
// It intentionally ignores fixtures, 3D shadows and exposure calculations.
export function gradeDayForNightYuv420p(source,width,height,recipe){
  if(!recipe||!trustedRecipes.has(recipe)||!Object.isFrozen(recipe))reject();
  const {y,c,length}=codeByteSize(width,height);
  if(!Buffer.isBuffer(source)||source.length!==length)reject();
  const out=Buffer.alloc(length);
  const gain=1-0.8*recipe.darkenPct/100;
  const saturation=1-0.30*recipe.darkenPct/100;
  const cool=18*recipe.coolPct/100;
  for(let i=0;i<y;i++)out[i]=clip(source[i]*gain);
  for(let i=0;i<c;i++){
    out[y+i]=clip(128+(source[y+i]-128)*saturation+cool);
    out[y+c+i]=clip(128+(source[y+c+i]-128)*saturation-cool*0.55);
  }
  return out; // ephemeral raw YUV420p, not a video container
}
// Reuses the trusted original decoder: source file and each original YUV
// pixel SHA-256 are rechecked. Callback must be synchronous, not a writer
// automatically invoked by this module. The original source is untouched.
export async function gradeVerifiedDayForNightFrames(options,revision,bundle,recipe,consume){
  verifyRecipe(recipe,revision);
  if(typeof consume!=='function'||!bundle?.analysis||!bundle?.ingestion)reject();
  verifyVisualAnalysis(bundle.analysis,bundle.ingestion,revision);
  const {analysis,ingestion}=bundle,rows=[];
  const count=await streamVerifiedVideoPixels(options,revision,ingestion,(pixels,frame,video)=>{
    const expected=analysis.frames[rows.length];
    if(!expected||frame.index!==rows.length||frame.index!==expected.index||
       frame.ptsTick!==expected.ptsTick||frame.durationTicks!==expected.durationTicks||
       frame.decodedPixelHash!==expected.decodedPixelHash)reject();
    const rendered=gradeDayForNightYuv420p(pixels,video.width,video.height,recipe);
    const originalStats=measureYuv420p(pixels,video.width,video.height);
    const renderStats=measureYuv420p(rendered,video.width,video.height);
    const row=freeze({
      index:frame.index,ptsTick:frame.ptsTick,durationTicks:frame.durationTicks,
      sourceDecodedPixelHash:frame.decodedPixelHash,
      gradedPixelHash:createHash('sha256').update(rendered).digest('hex'),
      sourceMeanYCode:Number(originalStats.y.mean.toFixed(4)),
      gradedMeanYCode:Number(renderStats.y.mean.toFixed(4)),
      width:video.width,height:video.height,
      colorimetryVerified:false,sourceExposureMeasured:false
    });
    const accepted=consume(rendered,row);
    if(accepted===false||(accepted&&typeof accepted.then==='function'))reject();
    rows.push(row);
    return true;
  });
  if(count!==ingestion.frames.length||rows.length!==analysis.frames.length)reject();
  const record={
    contract:'lightingai-offline-graded-raw-frame-receipt/1',
    ...core.videoRevisionBinding(revision),
    method:GRADE_METHOD,recipeHash:recipe.recipeHash,
    sourceIdentity:ingestion.sourceIdentity,ingestionHash:ingestion.ingestionHash,
    visualHash:analysis.visualHash,temporalHash:analysis.temporalHash,
    decoderVersion:ingestion.decoder.version,timeBase:analysis.timeBase,
    frameCount:rows.length,frames:rows,
    output:'EPHEMERAL_RAW_GRADED_YUV420P_FRAMES_ONLY',
    originalSourceBytesUnchanged:true,encodedMp4Created:false,
    videoRelightGenerated:false,fixtureLightFieldSimulated:false,
    colorManagedOutput:false,perFrameAutoGainUsed:false,
    sourceColorimetryVerified:false,sceneLuxMeasured:false,
    cameraExposureVerified:false
  };
  const result=freeze({...record,receiptHash:core.planHash(record)});
  trustedReceipts.add(result);
  return result;
}
export function verifyDayForNightFrameReceipt(receipt,revision,bundle,recipe){
  verifyRecipe(recipe,revision);
  if(!trustedReceipts.has(receipt)||!bundle?.analysis||!bundle?.ingestion)reject();
  verifyVisualAnalysis(bundle.analysis,bundle.ingestion,revision);
  const {receiptHash,...body}=receipt;
  if(receiptHash!==core.planHash(body)||!matchesRevision(receipt,revision)||
     receipt.recipeHash!==recipe.recipeHash||
     receipt.sourceIdentity!==bundle.ingestion.sourceIdentity||
     receipt.ingestionHash!==bundle.ingestion.ingestionHash||
     receipt.visualHash!==bundle.analysis.visualHash||
     receipt.temporalHash!==bundle.analysis.temporalHash||
     receipt.frameCount!==bundle.analysis.frames.length||
     receipt.output!=='EPHEMERAL_RAW_GRADED_YUV420P_FRAMES_ONLY')reject();
  return true;
}
