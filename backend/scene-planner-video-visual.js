// Offline pixel measurements. No renderer, HTTP route, database or device I/O.
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {ingestOriginalVideo,verifyVideoIngestion,streamVerifiedVideoPixels} from './scene-planner-video-ingestion.js';
const core=createRequire(import.meta.url)('../app/src/main/assets/scene-planner-core.js');
export const VISUAL_METHOD='yuv420p-code-statistics-v1';
const fail=()=>{throw new Error('Invalid or untrusted visual analysis');};
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}

// Pure measurement helper has no decoded-video authority. Tests may use actual
// synthetic pixel buffers here; production provenance is issued below only.
export function measureYuv420p(pixels,width,height){
  if(!Buffer.isBuffer(pixels)||!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||width>1920||height>1080)fail();
  const ySize=width*height,cSize=Math.ceil(width/2)*Math.ceil(height/2);
  if(pixels.length!==ySize+2*cSize||pixels.length>8*1024*1024)fail();
  function stats(start,n,histogram=false){
    let sum=0,squares=0,min=255,max=0,dark=0,bright=0;const bins=Array(16).fill(0);
    for(let i=start;i<start+n;i++){
      const v=pixels[i];sum+=v;squares+=v*v;min=Math.min(min,v);max=Math.max(max,v);
      if(v<64)dark++;if(v>=192)bright++;bins[v>>4]++;
    }
    const mean=sum/n;
    return {mean,min,max,stddev:Math.sqrt(Math.max(0,squares/n-mean*mean)),
      ...(histogram?{histogram:bins.map(v=>v/n),darkFraction:dark/n,brightFraction:bright/n}: {})};
  }
  // Spatial luma grid helps distinguish spatial change from a global code shift.
  const grid=Array.from({length:16},()=>({sum:0,n:0}));
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const cell=grid[Math.floor(y*4/height)*4+Math.floor(x*4/width)];cell.sum+=pixels[y*width+x];cell.n++;
  }
  return freeze({y:stats(0,ySize,true),u:stats(ySize,cSize),v:stats(ySize+cSize,cSize),
    lumaGrid:grid.map(g=>g.n?g.sum/g.n:null),measurementConfidence:'HIGH_FOR_DECODED_CODE_VALUES',
    physicalInterpretationConfidence:'UNKNOWN',colorimetry:{matrix:'UNKNOWN',range:'UNKNOWN',transfer:'UNKNOWN',primaries:'UNKNOWN'}});
}

export function compareVisualFrames(a,b){
  if(!a?.y?.histogram||!b?.y?.histogram||a.lumaGrid.length!==16||b.lumaGrid.length!==16)fail();
  const lumaDelta=b.y.mean-a.y.mean,colorDistance=Math.hypot(b.u.mean-a.u.mean,b.v.mean-a.v.mean)/255;
  const histogramDistance=a.y.histogram.reduce((s,v,i)=>s+Math.abs(v-b.y.histogram[i]),0)/2;
  const residual=a.lumaGrid.reduce((s,v,i)=>s+(v===null||b.lumaGrid[i]===null?0:Math.abs((b.lumaGrid[i]-v)-lumaDelta)),0)/(16*255);
  const large=Math.abs(lumaDelta)/255>0.20||histogramDistance>0.45||colorDistance>0.12||residual>0.12;
  const uniform=large&&residual<0.035&&colorDistance<0.06;
  return freeze({lumaDelta,colorDistance,histogramDistance,spatialResidual:residual,
    measurementConfidence:'HIGH_FOR_DECODED_CODE_VALUES',
    candidate:large,status:large?'REQUIRES_HUMAN_CONFIRMATION':'UNKNOWN',confirmedCut:false,
    interpretation:uniform?'ILLUMINATION_CHANGE_OR_FLASH':large?'CUT_OR_MOTION_OR_LIGHTING':'NO_LARGE_CHANGE',
    confidence:large?'LOW_UNCALIBRATED_HEURISTIC':'UNKNOWN'});
}


// Pure offline grouping of changes across ALL supplied frame records. A raw
// JSON object passed to this helper does NOT gain decoder/source provenance.
export function summarizeDecodedCodeContinuity(input){
  const frames=input?.frames,changes=input?.changes,timeBase=input?.timeBase;
  if(!Array.isArray(frames)||frames.length<2||frames.length>1800||
     !Array.isArray(changes)||changes.length!==frames.length-1||
     !timeBase||!Number.isSafeInteger(timeBase.numerator)||timeBase.numerator<1||
     !Number.isSafeInteger(timeBase.denominator)||timeBase.denominator<1)fail();
  frames.forEach((f,i)=>{
    if(!f||f.index!==i||!Number.isSafeInteger(f.ptsTick)||f.ptsTick<0||
       !Number.isSafeInteger(f.durationTicks)||f.durationTicks<1||
       !Number.isSafeInteger(f.ptsTick+f.durationTicks)||
       (i===0&&f.ptsTick!==0)||
       (i>0&&f.ptsTick!==frames[i-1].ptsTick+frames[i-1].durationTicks)||
       typeof f.decodedPixelHash!=='string'||!/^[a-f0-9]{64}$/.test(f.decodedPixelHash)||
       !f.measurements||!Number.isFinite(f.measurements.y?.mean)||
       f.measurements.y.mean<0||f.measurements.y.mean>255||
       !Array.isArray(f.measurements.y?.histogram)||
       f.measurements.y.histogram.length!==16||
       !Array.isArray(f.measurements.lumaGrid)||
       f.measurements.lumaGrid.length!==16)fail();
  });
  const expected=frames.slice(1).map((f,i)=>({
    fromIndex:i,toIndex:i+1,fromPixelHash:frames[i].decodedPixelHash,
    toPixelHash:f.decodedPixelHash,ptsTick:f.ptsTick,
    ...compareVisualFrames(frames[i].measurements,f.measurements)
  }));
  // Match exactly the look-ahead heuristic of analyzeOriginalVideo; neither
  // a flash nor an editorial cut may be upgraded to a proven observation.
  for(let i=0;i<expected.length-1;i++)if(expected[i].candidate&&expected[i+1].candidate&&
    !compareVisualFrames(frames[i].measurements,frames[i+2].measurements).candidate){
    expected[i].interpretation=expected[i+1].interpretation='TRANSIENT_FLASH_OR_OTHER_CHANGE';
  }
  changes.forEach((change,i)=>{
    if(!change||core.canonicalJson(change)!==core.canonicalJson(expected[i]))fail();
  });
  const intervals=[];let flagged=0,flashWindows=0;
  for(let start=0;start<changes.length;){
    const candidate=changes[start].candidate===true;
    let end=start;
    while(end+1<changes.length&&(changes[end+1].candidate===true)===candidate)end++;
    const transitions=changes.slice(start,end+1);
    const means=frames.slice(start,end+2).map(f=>f.measurements.y.mean);
    const flashLike=transitions.some(c=>c.interpretation==='TRANSIENT_FLASH_OR_OTHER_CHANGE');
    if(candidate){flagged+=transitions.length;if(flashLike)flashWindows++;}
    intervals.push({
      kind:candidate?'POSSIBLE_CODE_CHANGE_NEEDS_DOP_REVIEW':
        'NO_HEURISTIC_CHANGE_FLAG_NOT_PROOF_OF_CONTINUITY',
      firstTransitionIndex:start,lastTransitionIndex:end,
      fromFrameIndex:start,toFrameIndex:end+1,
      startPtsTick:frames[start].ptsTick,
      endPtsTickExclusive:frames[end+1].ptsTick+frames[end+1].durationTicks,
      transitionCount:transitions.length,
      rangeOfFrameMeanYCode:Number((Math.max(...means)-Math.min(...means)).toFixed(4)),
      maxAbsAdjacentMeanYCodeDelta:Number(Math.max(...transitions.map(c=>Math.abs(c.lumaDelta))).toFixed(4)),
      maxHistogramDistance:Number(Math.max(...transitions.map(c=>c.histogramDistance)).toFixed(4)),
      hasTransientFlashLikeCandidate:flashLike,
      confirmedCut:false,confirmedFlicker:false,confirmedPhysicalLightChange:false
    });
    start=end+1;
  }
  return freeze({
    contract:'lightingai-untrusted-all-decoded-frame-code-continuity-summary/1',
    authority:'UNTRUSTED_METRIC_INPUT_NOT_A_DECODER_RECEIPT',
    sampleFrameCount:frames.length,transitionCount:changes.length,
    timeBase:{numerator:timeBase.numerator,denominator:timeBase.denominator},
    startPtsTick:frames[0].ptsTick,
    endPtsTickExclusive:frames.at(-1).ptsTick+frames.at(-1).durationTicks,
    candidateTransitionCount:flagged,
    candidateIntervalCount:intervals.filter(x=>x.kind==='POSSIBLE_CODE_CHANGE_NEEDS_DOP_REVIEW').length,
    flashLikeCandidateIntervalCount:flashWindows,
    intervals:intervals,
    canProveTemporalVisualStability:false,
    humanShotAndMotionReviewRequired:true,
    videoRelightGenerated:false
  });
}

// Only a genuinely decoded and hash-verified, in-process visual bundle can
// receive the strong provenance below. This neither decodes again nor renders.
const trustedContinuityAudits=new WeakSet();
export function createVerifiedDecodedContinuityAudit(bundle,revision){
  if(!bundle||!bundle.analysis||!bundle.ingestion)fail();
  verifyVisualAnalysis(bundle.analysis,bundle.ingestion,revision);
  const a=bundle.analysis,summary=summarizeDecodedCodeContinuity(a);
  const record={
    contract:'lightingai-verified-decoded-code-continuity-audit/1',
    ...core.videoRevisionBinding(revision),
    sourceIdentity:a.sourceIdentity,ingestionHash:a.ingestionHash,
    visualHash:a.visualHash,temporalHash:a.temporalHash,
    evidence:'LOCALLY_HASH_VERIFIED_ALL_DECODED_YUV420P_FRAMES',
    decoderVersion:bundle.ingestion.decoder.version,
    timeBase:summary.timeBase,
    frameCount:summary.sampleFrameCount,
    frameTransitionCount:summary.transitionCount,
    candidateTransitionCount:summary.candidateTransitionCount,
    candidateIntervalCount:summary.candidateIntervalCount,
    flashLikeCandidateIntervalCount:summary.flashLikeCandidateIntervalCount,
    startPtsTick:summary.startPtsTick,
    endPtsTickExclusive:summary.endPtsTickExclusive,
    reviewIntervals:summary.intervals,
    decision:summary.candidateTransitionCount?
      'REVIEW_POTENTIAL_VISUAL_DISCONTINUITIES':
      'NO_HEURISTIC_FLAGS_NOT_VERIFIED_STABLE',
    actualVideoCutConfirmed:false,flickerConfirmed:false,
    opticalFlowVerified:false,actorMotionVerified:false,
    sourceColorimetryVerified:false,physicalIlluminanceVerified:false,
    cameraExposureVerified:false,videoRelightGenerated:false
  };
  const audit=freeze({...record,continuityHash:core.planHash(record)});
  trustedContinuityAudits.add(audit);return audit;
}
export function verifyDecodedContinuityAudit(audit,bundle,revision){
  if(!trustedContinuityAudits.has(audit)||!bundle?.analysis||!bundle?.ingestion)fail();
  verifyVisualAnalysis(bundle.analysis,bundle.ingestion,revision);
  const {continuityHash,...record}=audit;
  if(continuityHash!==core.planHash(record)||
     audit.visualHash!==bundle.analysis.visualHash||
     audit.ingestionHash!==bundle.analysis.ingestionHash||
     audit.temporalHash!==bundle.analysis.temporalHash||
     audit.sourceIdentity!==bundle.analysis.sourceIdentity)fail();
  const binding=core.videoRevisionBinding(revision);
  if(Object.keys(binding).some(k=>audit[k]!==binding[k]))fail();
  return true;
}

const trusted=new WeakSet();
export async function analyzeOriginalVideo(options,revision){
  const ingestion=await ingestOriginalVideo(options,revision);
  if(ingestion.decodeStatus!=='decoded-video')throw new Error('Visual analysis requires an explicitly selected decoder');
  const frames=[];
  await streamVerifiedVideoPixels(options,revision,ingestion,(pixels,frame,video)=>{
    frames.push({...frame,measurements:measureYuv420p(pixels,video.width,video.height)});
  });
  const changes=frames.slice(1).map((frame,i)=>({fromIndex:i,toIndex:i+1,fromPixelHash:frames[i].decodedPixelHash,
    toPixelHash:frame.decodedPixelHash,ptsTick:frame.ptsTick,...compareVisualFrames(frames[i].measurements,frame.measurements)}));
  // A return to the preceding frame after one-frame change is flash-like, never
  // proof of flash or a confirmed cut. Lookahead is one frame, also valid for VFR.
  for(let i=0;i<changes.length-1;i++)if(changes[i].candidate&&changes[i+1].candidate&&
    !compareVisualFrames(frames[i].measurements,frames[i+2].measurements).candidate){
    changes[i].interpretation=changes[i+1].interpretation='TRANSIENT_FLASH_OR_OTHER_CHANGE';
  }
  const record={visualVersion:1,method:VISUAL_METHOD,pixelFormat:'yuv420p',provenance:'verified-decoded-pixels',
    ...core.videoRevisionBinding(revision),sourceIdentity:ingestion.sourceIdentity,ingestionHash:ingestion.ingestionHash,
    temporalHash:ingestion.temporal.temporalHash,timeBase:ingestion.metadata.video.timeBase,frames,changes,
    unknown:{exposureStops:'UNKNOWN',whiteBalanceK:'UNKNOWN',physicalScene:'UNKNOWN'},
    notImplemented:['actor-identification','actor-tracking','optical-flow','depth','geometry','shadow-directions','day-for-night-rendering']};
  const result=freeze({...record,visualHash:core.planHash(record)});trusted.add(result);
  return freeze({analysis:result,ingestion});
}
export function verifyVisualAnalysis(analysis,ingestion,revision){
  verifyVideoIngestion(ingestion,revision);
  if(!trusted.has(analysis))fail();
  const {visualHash,...record}=analysis;if(visualHash!==core.planHash(record))fail();
  const binding=core.videoRevisionBinding(revision);
  if(Object.keys(binding).some(k=>analysis[k]!==binding[k])||analysis.sourceIdentity!==ingestion.sourceIdentity||
    analysis.ingestionHash!==ingestion.ingestionHash||analysis.temporalHash!==ingestion.temporal.temporalHash||
    analysis.frames.length!==ingestion.frames.length)fail();
  analysis.frames.forEach((f,i)=>{const original=ingestion.frames[i];
    if(f.index!==original.index||f.ptsTick!==original.ptsTick||f.durationTicks!==original.durationTicks||f.decodedPixelHash!==original.decodedPixelHash)fail();
  });return true;
}


// Bounded offline raw pixel grade, no AI requests or MP4 export.
// Isolated, offline Day-for-Night pixel grade. No HTTP, DB, device I/O,
// encoder or MP4 output. This is NOT photometrically accurate relighting.

export const GRADE_METHOD='fixed-unmanaged-yuv420p-code-grade-v1';
const trustedRecipes=new WeakSet(),trustedReceipts=new WeakSet();
const reject=()=>{throw new Error('Invalid or untrusted offline Day-for-Night grade');};
function freezeGrade(value){
  if(value&&typeof value==='object'){
    Object.values(value).forEach(freezeGrade);
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
  const recipe=freezeGrade({...record,recipeHash:core.planHash(record)});
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
    const row=freezeGrade({
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
  const result=freezeGrade({...record,receiptHash:core.planHash(record)});
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



// This deterministic scalar checker can be called on user-crafted JSON and
// therefore grants NO decoder, grade, physical or output-file provenance.
// The receipt-bound function below is the only verified QC entry point.
export function summarizeDayForNightGradeCodeConsistency(frames,darkenPct){
  if(!Array.isArray(frames)||frames.length<1||frames.length>1800||
     !Number.isInteger(darkenPct)||darkenPct<1||darkenPct>80)reject();
  const allowed=['index','ptsTick','durationTicks','sourceDecodedPixelHash',
    'gradedPixelHash','sourceMeanYCode','gradedMeanYCode','width','height',
    'colorimetryVerified','sourceExposureMeasured'];
  const gain=1-0.8*darkenPct/100;
  const reviewTransitions=[];
  let maxGainError=0,maxAdjacentError=0,srcMin=255,srcMax=0,outMin=255,outMax=0;
  for(let i=0;i<frames.length;i++){
    const row=frames[i],previous=frames[i-1];
    if(!row||Object.getPrototypeOf(row)!==Object.prototype||
       Object.keys(row).length!==allowed.length||
       Object.keys(row).some(k=>!allowed.includes(k))||
       row.index!==i||
       !Number.isSafeInteger(row.ptsTick)||row.ptsTick<0||
       !Number.isSafeInteger(row.durationTicks)||row.durationTicks<1||
       !Number.isSafeInteger(row.ptsTick+row.durationTicks)||
       (i===0&&row.ptsTick!==0)||
       (i>0&&row.ptsTick!==previous.ptsTick+previous.durationTicks)||
       !/^[a-f0-9]{64}$/.test(row.sourceDecodedPixelHash)||
       !/^[a-f0-9]{64}$/.test(row.gradedPixelHash)||
       !Number.isSafeInteger(row.width)||!Number.isSafeInteger(row.height)||
       row.width<2||row.height<2||row.width>1920||row.height>1080||
       (i>0&&(row.width!==previous.width||row.height!==previous.height))||
       row.colorimetryVerified!==false||row.sourceExposureMeasured!==false)reject();
    for(const k of ['sourceMeanYCode','gradedMeanYCode']){
      const v=row[k];
      if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>255||
         Number(v.toFixed(4))!==v)reject();
    }
    if(row.gradedMeanYCode>row.sourceMeanYCode+0.0002)reject();
    const error=Math.abs(row.gradedMeanYCode-row.sourceMeanYCode*gain);
    // Each 8-bit Y pixel is rounded independently; mean error is <=0.5
    // code units, plus two decimal-storage rounding errors.
    if(error>0.5003)reject();
    maxGainError=Math.max(maxGainError,error);
    srcMin=Math.min(srcMin,row.sourceMeanYCode);
    srcMax=Math.max(srcMax,row.sourceMeanYCode);
    outMin=Math.min(outMin,row.gradedMeanYCode);
    outMax=Math.max(outMax,row.gradedMeanYCode);
    if(i>0){
      const sourceDelta=row.sourceMeanYCode-previous.sourceMeanYCode;
      const gradedDelta=row.gradedMeanYCode-previous.gradedMeanYCode;
      const deltaError=Math.abs(gradedDelta-gain*sourceDelta);
      if(deltaError>1.0006)reject();
      maxAdjacentError=Math.max(maxAdjacentError,deltaError);
      // Fixed threshold for a REQUEST TO REVIEW, not a flicker/cut detector.
      if(Math.abs(gradedDelta)>=24){
        reviewTransitions.push({
          fromIndex:i-1,toIndex:i,ptsTick:row.ptsTick,
          sourceMeanYDeltaCode:Number(sourceDelta.toFixed(4)),
          gradedMeanYDeltaCode:Number(gradedDelta.toFixed(4)),
          reason:'LARGE_GRADED_MEAN_CODE_CHANGE_UNCLASSIFIED',
          confirmedCut:false,confirmedFlicker:false
        });
      }
    }
  }
  return freezeGrade({
    contract:'lightingai-untrusted-day-for-night-code-qc/1',
    authority:'UNTRUSTED_SCALAR_METRICS_NO_PIXEL_OR_SOURCE_PROOF',
    frameCount:frames.length,transitionCount:frames.length-1,
    constantYCodeGain:Number(gain.toFixed(5)),
    maxAbsPerFrameGainResidualCode:Number(maxGainError.toFixed(4)),
    maxAbsInterframeGainResidualCode:Number(maxAdjacentError.toFixed(4)),
    sourceMeanYCodeRange:[srcMin,srcMax],
    gradedMeanYCodeRange:[outMin,outMax],
    gradedMeanJumpReviewThresholdCode:24,
    gradedMeanJumpReviewCount:reviewTransitions.length,
    reviewTransitions,
    constantCodeGainWithinQuantizationTolerance:true,
    sourceColorimetryVerified:false,
    flickerFreeVerified:false,sceneLightingVerified:false,
    visualQualityApproved:false,encodedMp4Created:false
  });
}

// A QC certificate requires the exact trusted in-process decoded bundle,
// immutable renderer receipt and matching DoP revision/creative recipe. It is
// a code-metric audit, not an approval to encode, publish or control fixtures.
const trustedGradeQc=new WeakSet();
export function createVerifiedDayForNightGradeQc(receipt,revision,bundle,recipe){
  verifyDayForNightFrameReceipt(receipt,revision,bundle,recipe);
  const scalar=summarizeDayForNightGradeCodeConsistency(receipt.frames,recipe.darkenPct);
  const sourceChanges=bundle.analysis.changes.filter(c=>c.candidate===true).length;
  const sourceAudit=receipt.frameCount>=2?
    createVerifiedDecodedContinuityAudit(bundle,revision):null;
  // The grade never erases the original source review candidates.
  const reviewRequired=sourceChanges>0||scalar.gradedMeanJumpReviewCount>0;
  const record={
    contract:'lightingai-verified-day-for-night-grade-qc/1',
    ...core.videoRevisionBinding(revision),
    recipeHash:recipe.recipeHash,gradeReceiptHash:receipt.receiptHash,
    sourceIdentity:receipt.sourceIdentity,
    ingestionHash:receipt.ingestionHash,visualHash:receipt.visualHash,
    temporalHash:receipt.temporalHash,
    sourceContinuityAuditHash:sourceAudit?sourceAudit.continuityHash:null,
    frameCount:receipt.frameCount,
    frameTransitionCount:scalar.transitionCount,
    timeBase:receipt.timeBase,
    firstPtsTick:receipt.frames[0].ptsTick,
    lastEndPtsTickExclusive:receipt.frames.at(-1).ptsTick+
      receipt.frames.at(-1).durationTicks,
    sourceCandidateTransitionCount:sourceChanges,
    codeConsistency:scalar,
    decision:reviewRequired?
      'REVIEW_ORIGINAL_OR_GRADED_CODE_CHANGE':
      'NO_HEURISTIC_FLAGS_NOT_EVIDENCE_OF_FLICKER_FREEDOM',
    colorimetryVerified:false,physicalRelightingVerified:false,
    visualQualityApproved:false,flickerFreeVerified:false,
    mp4ExportAuthorized:false,encodedMp4Created:false,
    fixtureCommandsPerformed:false,paidAiProviderUsed:false
  };
  const qc=freezeGrade({...record,qcHash:core.planHash(record)});
  trustedGradeQc.add(qc);
  return qc;
}
export function verifyDayForNightGradeQc(qc,receipt,revision,bundle,recipe){
  verifyDayForNightFrameReceipt(receipt,revision,bundle,recipe);
  if(!trustedGradeQc.has(qc)||!matchesRevision(qc,revision))reject();
  const {qcHash,...record}=qc;
  if(qcHash!==core.planHash(record)||
     qc.recipeHash!==recipe.recipeHash||
     qc.gradeReceiptHash!==receipt.receiptHash||
     qc.sourceIdentity!==receipt.sourceIdentity||
     qc.ingestionHash!==receipt.ingestionHash||
     qc.visualHash!==receipt.visualHash||
     qc.temporalHash!==receipt.temporalHash||
     qc.frameCount!==receipt.frameCount||
     qc.firstPtsTick!==receipt.frames[0].ptsTick||
     qc.lastEndPtsTickExclusive!==receipt.frames.at(-1).ptsTick+
        receipt.frames.at(-1).durationTicks)reject();
  return true;
}
