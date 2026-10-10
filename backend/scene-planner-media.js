// Bounded ISO-BMFF analysis. No shell, native tools, network, or client duration.
// Unsupported fragmented files, edit lists and compressed metadata fail closed.
const invalid=()=>Object.assign(new Error("Video container or sample timing cannot be verified. Export a non-fragmented MP4/MOV without edit lists."),{status:422});
function boxes(b,start=0,end=b.length){
  const result=[];
  for(let p=start;p<end;){
    if(end-p<8||result.length>=10000)throw invalid();
    let size=b.readUInt32BE(p),header=8;
    if(size===1){if(end-p<16)throw invalid();size=Number(b.readBigUInt64BE(p+8));header=16;}
    if(size===0)size=end-p;
    if(!Number.isSafeInteger(size)||size<header||p+size>end)throw invalid();
    result.push({type:b.toString("ascii",p+4,p+8),start:p+header,end:p+size});p+=size;
  }
  return result;
}
function one(list,type){const entries=list.filter(x=>x.type===type);if(entries.length!==1)throw invalid();return entries[0];}
function bytes(box,n){if(box.end-box.start<n)throw invalid();}
function table(b,box,width){
  bytes(box,8);if(b.readUInt32BE(box.start)!==0)throw invalid();
  const count=b.readUInt32BE(box.start+4);
  if(count>90000||box.end-box.start!==8+count*width)throw invalid();
  return Array.from({length:count},(_,i)=>box.start+8+i*width);
}
export function analyzeIsoVideo(b){
  try{
    const root=boxes(b),ftyp=one(root,"ftyp"),moov=one(root,"moov");bytes(ftyp,8);
    if(root.some(x=>["moof","mfra"].includes(x.type)))throw invalid();
    const mdats=root.filter(x=>x.type==="mdat");if(!mdats.length)throw invalid();
    const movie=boxes(b,moov.start,moov.end);
    if(movie.some(x=>["mvex","cmov"].includes(x.type)))throw invalid();
    const tracks=movie.filter(x=>x.type==="trak");if(!tracks.length||tracks.length>16)throw invalid();
    const mvhd=one(movie,"mvhd");bytes(mvhd,24);
    if(b[mvhd.start]!==0)throw invalid();
    const movieScale=b.readUInt32BE(mvhd.start+12),movieTicks=b.readUInt32BE(mvhd.start+16);
    if(!movieScale)throw invalid();
    const occupied=[];let videoSeconds=null,maxSeconds=0;
    for(const track of tracks){
      const children=boxes(b,track.start,track.end);
      const tkhd=one(children,"tkhd");bytes(tkhd,84);
      if(b[tkhd.start]!==0)throw invalid();
      if(children.some(x=>x.type==="edts"))throw invalid();
      const mdia=one(children,"mdia"),media=boxes(b,mdia.start,mdia.end);
      const handler=one(media,"hdlr");bytes(handler,12);
      const kind=b.toString("ascii",handler.start+8,handler.start+12);
      if(!["vide","soun"].includes(kind))throw invalid();
      const mdhd=one(media,"mdhd");bytes(mdhd,24);
      const version=b[mdhd.start];if(version!==0&&version!==1)throw invalid();
      if(version===1)bytes(mdhd,36);
      const timescale=b.readUInt32BE(mdhd.start+(version===1?20:12));
      const declared=version===1?Number(b.readBigUInt64BE(mdhd.start+24)):b.readUInt32BE(mdhd.start+16);
      if(!timescale||!Number.isSafeInteger(declared))throw invalid();
      const minf=one(media,"minf"),stbl=one(boxes(b,minf.start,minf.end),"stbl");
      const tables=boxes(b,stbl.start,stbl.end);
      // External data references could claim timing for media not present in this file.
      const dinf=one(boxes(b,minf.start,minf.end),"dinf"),dref=one(boxes(b,dinf.start,dinf.end),"dref");bytes(dref,8);
      if(b.readUInt32BE(dref.start)!==0||b.readUInt32BE(dref.start+4)!==1)throw invalid();
      const reference=one(boxes(b,dref.start+8,dref.end),"url ");bytes(reference,4);
      if(reference.end-reference.start!==4||b.readUInt32BE(reference.start)!==1)throw invalid();
      const stsd=one(tables,"stsd");bytes(stsd,8);
      if(b.readUInt32BE(stsd.start)!==0||b.readUInt32BE(stsd.start+4)!==1)throw invalid();
      const desc=boxes(b,stsd.start+8,stsd.end);if(desc.length!==1)throw invalid();bytes(desc[0],8);
      if(b.readUInt16BE(desc[0].start+6)!==1)throw invalid();
      if(kind==="vide"&&!['avc1','hvc1','hev1','mp4v'].includes(desc[0].type))throw invalid();
      const stsz=one(tables,"stsz");bytes(stsz,12);
      if(b.readUInt32BE(stsz.start)!==0)throw invalid();
      const fixed=b.readUInt32BE(stsz.start+4),count=b.readUInt32BE(stsz.start+8);
      if(!count||count>90000||stsz.end-stsz.start!==12+(fixed?0:count*4))throw invalid();
      const sizes=Array.from({length:count},(_,i)=>fixed||b.readUInt32BE(stsz.start+12+i*4));
      if(sizes.some(n=>!n||n>b.length))throw invalid();
      let samples=0,ticks=0;
      for(const p of table(b,one(tables,"stts"),8)){
        const n=b.readUInt32BE(p),delta=b.readUInt32BE(p+4);
        if(!n||!delta)throw invalid();samples+=n;ticks+=n*delta;
      }
      if(samples!==count||!Number.isSafeInteger(ticks)||ticks!==declared)throw invalid();
      if(tables.some(x=>x.type==="ctts")){
        let compositionSamples=0;
        const ctts=one(tables,"ctts");
        // Only unsigned composition offsets whose presented end stays inside declared timing.
        for(const p of table(b,ctts,8)){compositionSamples+=b.readUInt32BE(p);if(b.readUInt32BE(p+4)!==0)throw invalid();}
        if(compositionSamples!==count)throw invalid();
      }
      const map=table(b,one(tables,"stsc"),12).map(p=>[b.readUInt32BE(p),b.readUInt32BE(p+4),b.readUInt32BE(p+8)]);
      if(!map.length||map[0][0]!==1||map.some((r,i)=>!r[1]||r[2]!==1||(i>0&&r[0]<=map[i-1][0])))throw invalid();
      const offsets=tables.filter(x=>x.type==="stco"||x.type==="co64");if(offsets.length!==1)throw invalid();
      const wide=offsets[0].type==="co64";
      const chunks=table(b,offsets[0],wide?8:4).map(p=>wide?Number(b.readBigUInt64BE(p)):b.readUInt32BE(p));
      if(!chunks.length||map[map.length-1][0]>chunks.length)throw invalid();
      let sample=0,mapping=0;
      for(let i=0;i<chunks.length;i++){
        if(mapping+1<map.length&&map[mapping+1][0]===i+1)mapping++;
        const n=map[mapping][1];if(sample+n>count)throw invalid();
        let length=0;for(let j=0;j<n;j++)length+=sizes[sample++];
        const start=chunks[i],end=start+length;
        if(!Number.isSafeInteger(start)||!mdats.some(x=>start>=x.start&&end<=x.end))throw invalid();
        occupied.push([start,end]);
      }
      if(sample!==count)throw invalid();
      const seconds=ticks/timescale;
      if(!Number.isFinite(seconds)||seconds<=0||seconds>30)throw invalid();
      if(Math.abs(b.readUInt32BE(tkhd.start+20)/movieScale-seconds)>0.05)throw invalid();
      maxSeconds=Math.max(maxSeconds,seconds);
      if(kind==="vide"){
        if(videoSeconds!==null||!b.readUInt32BE(tkhd.start+76)||!b.readUInt32BE(tkhd.start+80))throw invalid();
        videoSeconds=seconds;
      }
    }
    occupied.sort((a,c)=>a[0]-c[0]);
    if(occupied.some((r,i)=>i&&r[0]<occupied[i-1][1]))throw invalid();
    if(videoSeconds===null||Math.abs(maxSeconds-videoSeconds)>0.05||Math.abs(movieTicks/movieScale-maxSeconds)>0.05)throw invalid();
    return maxSeconds;
  }catch{throw invalid();}
}
