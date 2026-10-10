import {PGlite} from "@electric-sql/pglite";
import {PostgresVideoJobStore,VIDEO_JOB_SCHEMA} from "./scene-planner-job-store.js";

// Synthetic sample-table fixture, never private footage. Tests container validation,
// not codec decoding or visual quality. One contiguous sample per second.
export function testMp4(seconds=12){
  const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n);return b;};
  const box=(name,...parts)=>{const data=Buffer.concat(parts);return Buffer.concat([u32(data.length+8),Buffer.from(name),data]);};
  const full=(name,...parts)=>box(name,u32(0),...parts);
  const ftyp=box("ftyp",Buffer.from("isom"),u32(0),Buffer.from("isom"));
  const data=Buffer.alloc(seconds*64,0x11);
  const mdat=box("mdat",data);
  const mdhd=full("mdhd",u32(0),u32(0),u32(1000),u32(seconds*1000),u32(0));
  const hdlr=full("hdlr",u32(0),Buffer.from("vide"),Buffer.alloc(16));
  const desc=Buffer.alloc(78);desc.writeUInt16BE(1,6);
  const stbl=box("stbl",full("stsd",u32(1),box("avc1",desc)),
    full("stts",u32(1),u32(seconds),u32(1000)),
    full("stsz",u32(64),u32(seconds)),
    full("stsc",u32(1),u32(1),u32(seconds),u32(1)),
    full("stco",u32(1),u32(ftyp.length+8)));
  const dinf=box("dinf",full("dref",u32(1),box("url ",u32(1))));
  const tkhd=Buffer.alloc(84);tkhd.writeUInt32BE(seconds*1000,20);tkhd.writeUInt32BE(16*65536,76);tkhd.writeUInt32BE(16*65536,80);
  const mvhd=full("mvhd",u32(0),u32(0),u32(1000),u32(seconds*1000),Buffer.alloc(80));
  const moov=box("moov",mvhd,box("trak",box("tkhd",tkhd),box("mdia",mdhd,hdlr,box("minf",dinf,stbl))));
  return Buffer.concat([ftyp,mdat,moov,box("free",Buffer.alloc(512))]);
}

export async function testStore(directory){
  const db=new PGlite(directory);
  await db.exec(VIDEO_JOB_SCHEMA);
  // PGlite runs one connection. Serialize transactions as its documented runtime
  // requires; production's cross-process gate is SELECT ... FOR UPDATE in PostgreSQL.
  let tail=Promise.resolve();
  async function lock(){let release;const next=new Promise(r=>{release=r;});const before=tail;tail=next;await before;return release;}
  const pool={
    async query(sql,params){const release=await lock();try{return await db.query(sql,params);}finally{release();}},
    async connect(){const release=await lock();return {query:(sql,params)=>db.query(sql,params),release};},
    async end(){await tail;await db.close();}
  };
  return new PostgresVideoJobStore(pool);
}
