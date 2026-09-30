#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeSessionCaptures } from './astera-att-session-consensus.js';
import { filterSessionBaseline } from './astera-att-session-filter.js';
import { compareCaptures } from './astera-att-diff.js';
import { buildConsensus } from './astera-att-consensus.js';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file,'utf8'));
}

function ensureCaptureList(name, rows) {
  if (!Array.isArray(rows) || rows.length < 3) {
    throw new Error(name + '_requires_at_least_3_captures');
  }
  return rows;
}

function analyzeAction(reference, captures, session, label) {
  const filteredReference = filterSessionBaseline(reference, session);
  const diffs = captures.map((capture,index) => {
    const filtered = filterSessionBaseline(capture, session);
    return compareCaptures(filteredReference, filtered, {
      reference:'connect-only',
      test:label + '-' + String(index + 1).padStart(2,'0')
    });
  });
  const consensus = buildConsensus(diffs,{minimumRuns:3});
  return {diffs,consensus};
}

function analyzeCaptureSet(input) {
  if (!input || typeof input !== 'object') throw new Error('invalid_capture_set_manifest');

  const connectOnly=ensureCaptureList('connect_only',input.connectOnly);
  const dim=ensureCaptureList('dim',input.dim);
  const cct=ensureCaptureList('cct',input.cct);

  const session=analyzeSessionCaptures(connectOnly,{minimumRuns:3});
  const reference=connectOnly[0];

  const dimResult=analyzeAction(reference,dim,session,'dim');
  const cctResult=analyzeAction(reference,cct,session,'cct');

  return {
    kind:'LightingAI-Astera-physical-capture-set-analysis',
    captureIdentity:session.captureIdentity,
    summary:{
      connectOnlyRuns:connectOnly.length,
      dimRuns:dim.length,
      cctRuns:cct.length,
      dimRepeatableCandidateEndpoints:dimResult.consensus.summary.repeatableCandidateEndpoints,
      cctRepeatableCandidateEndpoints:cctResult.consensus.summary.repeatableCandidateEndpoints
    },
    sessionConsensus:session,
    dim:{consensus:dimResult.consensus,diffs:dimResult.diffs},
    cct:{consensus:cctResult.consensus,diffs:cctResult.diffs},
    interpretation:{
      confidence:'candidate_only',
      note:'This tool only validates repeatable physical-capture evidence. It never verifies command semantics and never transmits a Bluetooth packet.'
    }
  };
}

function parseManifest(file) {
  const raw=readJson(file);
  const base=path.dirname(path.resolve(file));
  const loadList=(name)=>{
    const rows=ensureCaptureList(name,raw[name]);
    return rows.map(entry=>{
      if (typeof entry !== 'string' || !entry.trim()) throw new Error(name+'_capture_path_invalid');
      return readJson(path.resolve(base,entry));
    });
  };
  return {
    connectOnly:loadList('connectOnly'),
    dim:loadList('dim'),
    cct:loadList('cct')
  };
}

function parseArgs(argv) {
  const rest=argv.slice(2);
  const args={manifest:'',json:''};
  while(rest.length){
    const token=rest.shift();
    if(token==='--json') args.json=rest.shift()||'';
    else if(!args.manifest) args.manifest=token;
    else throw new Error('unknown_argument_'+token);
  }
  if(!args.manifest) throw new Error('usage: node backend/astera-physical-capture-set.js <manifest.json> [--json out.json]');
  return args;
}

function main(){
  const args=parseArgs(process.argv);
  const result=analyzeCaptureSet(parseManifest(args.manifest));
  const body=JSON.stringify(result,null,2)+'\n';
  if(args.json) fs.writeFileSync(args.json,body);
  else process.stdout.write(body);
}

const currentFile=fileURLToPath(import.meta.url);
const invokedFile=process.argv[1]?path.resolve(process.argv[1]):'';
if(invokedFile && path.resolve(currentFile)===invokedFile){
  try{main();}
  catch(error){
    process.stderr.write(String(error&&error.message?error.message:error)+'\n');
    process.exit(1);
  }
}

export { analyzeCaptureSet, parseManifest, parseArgs };
