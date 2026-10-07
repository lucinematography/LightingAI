#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ASTERA_BTB_PRIVATE_SERVICE='0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65';

function normalizePeerAddress(value) {
  return String(value || '').trim().replace(/-/g, ':').toUpperCase();
}

function capturePeerAddress(capture) {
  if (!capture || typeof capture !== 'object') return '';
  if (capture.filter && capture.filter.address) {
    return normalizePeerAddress(capture.filter.address);
  }
  const addresses = new Set();
  for (const row of Array.isArray(capture.connections) ? capture.connections : []) {
    const address = normalizePeerAddress(row && (row.peerAddress || row.address));
    if (address) addresses.add(address);
  }
  if (addresses.size > 1) throw new Error('capture_contains_multiple_peer_addresses');
  return addresses.size === 1 ? [...addresses][0] : '';
}

function endpointIdentity(event) {
  const attribute = event && event.attributeUuid
    ? 'uuid:' + String(event.attributeUuid).toLowerCase()
    : 'handle:' + (event && event.handle != null ? String(event.handle) : '');
  return [
    String(event && event.direction || ''),
    String(event && event.opcodeName || ''),
    String(event && event.serviceUuid || '').toLowerCase(),
    attribute
  ].join('|');
}

function payloadBytes(value) {
  const hex = String(value || '').trim().toUpperCase();
  if (!hex || hex.length % 2 !== 0 || !/^[0-9A-F]+$/.test(hex)) return null;
  return Buffer.from(hex,'hex');
}

function byteConsensus(values) {
  const payloads = values
    .map(v => String(v || '').trim().toUpperCase())
    .filter(Boolean);
  const buffers = payloads.map(payloadBytes).filter(Boolean);
  if (!buffers.length) {
    return {
      payloadLength:null,
      observedLengths:[],
      stableBytes:[],
      variableByteIndexes:[],
      exactPayloadRepeat:false
    };
  }

  const lengths = [...new Set(buffers.map(b=>b.length))].sort((a,b)=>a-b);
  if (lengths.length !== 1) {
    return {
      payloadLength:null,
      observedLengths:lengths,
      stableBytes:[],
      variableByteIndexes:[],
      exactPayloadRepeat:new Set(payloads).size === 1
    };
  }

  const length = lengths[0];
  const stableBytes = [];
  const variableByteIndexes = [];
  for (let index = 0; index < length; index++) {
    const valuesAtIndex = [...new Set(buffers.map(b=>b[index]))];
    if (valuesAtIndex.length === 1) {
      stableBytes.push({
        index,
        hex:valuesAtIndex[0].toString(16).padStart(2,'0').toUpperCase()
      });
    } else {
      variableByteIndexes.push(index);
    }
  }

  return {
    payloadLength:length,
    observedLengths:lengths,
    stableBytes,
    variableByteIndexes,
    exactPayloadRepeat:new Set(payloads).size === 1
  };
}

function median(values) {
  const rows = values.slice().sort((a,b)=>a-b);
  if (!rows.length) return null;
  const mid = Math.floor(rows.length / 2);
  return rows.length % 2 ? rows[mid] : (rows[mid - 1] + rows[mid]) / 2;
}

function intervalStats(events) {
  const times = events
    .map(e=>Number(e && e.elapsedMs))
    .filter(Number.isFinite)
    .sort((a,b)=>a-b);
  if (times.length < 3) return null;
  const intervals = [];
  for (let i=1;i<times.length;i++) intervals.push(times[i]-times[i-1]);
  if (intervals.some(v=>v<=0)) return null;
  const mean = intervals.reduce((n,v)=>n+v,0)/intervals.length;
  const variance = intervals.reduce((n,v)=>n+(v-mean)**2,0)/intervals.length;
  const stddev = Math.sqrt(variance);
  const coefficientOfVariation = mean === 0 ? Infinity : stddev/mean;
  return {
    count:times.length,
    intervalsMs:intervals,
    medianIntervalMs:median(intervals),
    meanIntervalMs:Number(mean.toFixed(3)),
    coefficientOfVariation:Number(coefficientOfVariation.toFixed(6)),
    stablePeriodic:coefficientOfVariation <= 0.2
  };
}

function normalizeCapture(input, index) {
  if (!input || typeof input !== 'object') {
    throw new Error('capture_' + index + '_invalid_json');
  }
  const warning = input.analysisCoverage &&
    typeof input.analysisCoverage.mappingWarning === 'string'
      ? input.analysisCoverage.mappingWarning
      : '';
  if (warning) {
    throw new Error('capture_' + index + '_gatt_mapping_incomplete_' + warning);
  }

  const peerAddress = capturePeerAddress(input);
  if (!peerAddress) {
    throw new Error('capture_' + index + '_peer_address_missing');
  }

  const writes = Array.isArray(input.candidateAsteraSessionWrites)
    ? input.candidateAsteraSessionWrites.slice()
    : [];
  writes.sort((a,b) =>
    Number(a && a.elapsedMs || 0) - Number(b && b.elapsedMs || 0) ||
    Number(a && a.recordIndex || 0) - Number(b && b.recordIndex || 0)
  );

  const notifications = Array.isArray(input.attEvents)
    ? input.attEvents.filter(event =>
        event &&
        (event.opcodeName === 'HANDLE_VALUE_NOTIFICATION' ||
         event.opcodeName === 'HANDLE_VALUE_INDICATION') &&
        String(event.serviceUuid || '').toLowerCase() === ASTERA_BTB_PRIVATE_SERVICE
      ).slice()
    : [];
  notifications.sort((a,b) =>
    Number(a && a.elapsedMs || 0) - Number(b && b.elapsedMs || 0) ||
    Number(a && a.recordIndex || 0) - Number(b && b.recordIndex || 0)
  );

  return {
    peerAddress,
    writes,
    notifications
  };
}

function commonEndpointPrefix(captures) {
  if (!captures.length) return [];
  const minLength = Math.min(...captures.map(c=>c.writes.length));
  const out = [];
  for (let index=0; index<minLength; index++) {
    const endpoints = captures.map(c=>endpointIdentity(c.writes[index]));
    if (new Set(endpoints).size !== 1) break;
    const rows = captures.map(c=>c.writes[index]);
    const payloads = rows.map(r=>String(r && r.valueHex || '').toUpperCase());
    const times = rows.map(r=>Number(r && r.elapsedMs)).filter(Number.isFinite);
    out.push({
      position:index,
      endpoint:endpoints[0],
      payloadConsensus:byteConsensus(payloads),
      timingMs:{
        min:times.length ? Math.min(...times) : null,
        max:times.length ? Math.max(...times) : null,
        median:times.length ? median(times) : null
      },
      samples:rows
    });
  }
  return out;
}

function firstResponseAfter(write, notifications, windowMs, beforeMs=Infinity) {
  const writeTime = Number(write && write.elapsedMs);
  if (!Number.isFinite(writeTime)) return null;
  const cutoff = Number.isFinite(Number(beforeMs))
    ? Number(beforeMs)
    : Infinity;
  for (const event of Array.isArray(notifications) ? notifications : []) {
    const eventTime = Number(event && event.elapsedMs);
    if (!Number.isFinite(eventTime) || eventTime < writeTime) continue;
    if (eventTime >= cutoff) break;
    const latencyMs = eventTime - writeTime;
    if (latencyMs > windowMs) break;
    return {
      event,
      latencyMs
    };
  }
  return null;
}

function repeatableResponsePairs(captures, prefix, windowMs=750) {
  const out = [];
  for (const position of prefix) {
    const responses = captures.map(capture => {
      const write = capture.writes[position.position];
      const nextWrite = capture.writes[position.position + 1];
      const beforeMs = nextWrite && Number.isFinite(Number(nextWrite.elapsedMs))
        ? Number(nextWrite.elapsedMs)
        : Infinity;
      return firstResponseAfter(
        write,
        capture.notifications,
        windowMs,
        beforeMs
      );
    });
    if (responses.some(row => !row)) continue;

    const endpoints = responses.map(row => endpointIdentity(row.event));
    if (new Set(endpoints).size !== 1) continue;

    const latencies = responses.map(row => row.latencyMs);
    const payloads = responses.map(row =>
      String(row.event && row.event.valueHex || '').toUpperCase()
    );

    out.push({
      writePosition:position.position,
      writeEndpoint:position.endpoint,
      responseEndpoint:endpoints[0],
      responseLatencyMs:{
        min:Math.min(...latencies),
        max:Math.max(...latencies),
        median:median(latencies)
      },
      responsePayloadConsensus:byteConsensus(payloads),
      samples:responses.map((row,index)=>({
        runIndex:index,
        latencyMs:row.latencyMs,
        event:row.event
      })),
      interpretation:{
        confidence:'candidate_only',
        note:'A repeatable notification/indication following the same startup write is only an ACK/response candidate. Temporal proximity does not prove protocol semantics.'
      }
    });
  }
  return out;
}

function periodicEndpoints(captures) {
  const perCapture = captures.map(capture => {
    const map = new Map();
    for (const event of capture.writes) {
      const endpoint = endpointIdentity(event);
      if (!map.has(endpoint)) map.set(endpoint,[]);
      map.get(endpoint).push(event);
    }
    const out = new Map();
    for (const [endpoint,events] of map.entries()) {
      const stats = intervalStats(events);
      if (stats && stats.stablePeriodic) out.set(endpoint,{events,stats});
    }
    return out;
  });

  if (!perCapture.length) return [];
  const commonEndpoints = [...perCapture[0].keys()].filter(endpoint =>
    perCapture.every(map=>map.has(endpoint))
  );

  const out = [];
  for (const endpoint of commonEndpoints) {
    const rows = perCapture.map(map=>map.get(endpoint));
    const medians = rows.map(row=>row.stats.medianIntervalMs);
    const minMedian = Math.min(...medians);
    const maxMedian = Math.max(...medians);
    const intervalSpreadRatio = minMedian > 0 ? maxMedian/minMedian : Infinity;
    if (intervalSpreadRatio > 1.25) continue;

    const payloads = rows.flatMap(row =>
      row.events.map(event=>String(event && event.valueHex || '').toUpperCase())
    );

    out.push({
      endpoint,
      presentRuns:rows.length,
      medianIntervalMs:Number(median(medians).toFixed(3)),
      intervalSpreadRatio:Number(intervalSpreadRatio.toFixed(6)),
      perRun:rows.map((row,index)=>({
        runIndex:index,
        count:row.stats.count,
        medianIntervalMs:row.stats.medianIntervalMs,
        coefficientOfVariation:row.stats.coefficientOfVariation
      })),
      payloadConsensus:byteConsensus(payloads),
      interpretation:{
        confidence:'candidate_only',
        note:'A stable repeated interval on the same Astera endpoint is only a keepalive/session candidate until additional controlled captures confirm its role.'
      }
    });
  }

  return out.sort((a,b)=>a.endpoint.localeCompare(b.endpoint));
}

function analyzeSessionCaptures(inputs, options={}) {
  const minimumRuns = Math.max(3,Number(options.minimumRuns || 3));
  if (!Array.isArray(inputs) || inputs.length < minimumRuns) {
    throw new Error('at_least_' + minimumRuns + '_connect_only_captures_required');
  }

  const captures = inputs.map((input,index)=>normalizeCapture(input,index));
  const addresses = new Set(captures.map(c=>c.peerAddress));
  if (addresses.size !== 1) {
    throw new Error('peer_address_mismatch_across_connect_only_captures');
  }
  const peerAddress = [...addresses][0];

  const prefix = commonEndpointPrefix(captures);
  const responsePairs = repeatableResponsePairs(captures,prefix,750);
  const periodic = periodicEndpoints(captures);
  const writeCounts = captures.map(c=>c.writes.length);

  return {
    kind:'LightingAI-Astera-ATT-session-consensus',
    minimumRuns,
    analyzedRuns:captures.length,
    captureIdentity:{
      peerAddress,
      verifiedAcrossRuns:true,
      warning:''
    },
    summary:{
      minVendorWriteCount:Math.min(...writeCounts),
      maxVendorWriteCount:Math.max(...writeCounts),
      commonEndpointPrefixLength:prefix.length,
      repeatableWriteResponseCandidates:responsePairs.length,
      repeatablePeriodicEndpointCandidates:periodic.length
    },
    commonEndpointPrefix:prefix,
    repeatableWriteResponsePairs:responsePairs,
    periodicEndpointCandidates:periodic,
    interpretation:{
      confidence:'candidate_only',
      note:'Stable startup positions, variable auth/session bytes and periodic endpoints are protocol evidence only. They are not authenticated Astera session semantics and must never be replayed until separately verified.'
    }
  };
}

function parseArgs(argv) {
  const rest = argv.slice(2);
  const args={inputs:[],json:'',minimumRuns:3};
  while(rest.length){
    const token=rest.shift();
    if(token==='--json') args.json=rest.shift()||'';
    else if(token==='--minimum-runs') args.minimumRuns=Number(rest.shift()||3);
    else if(token.startsWith('--')) throw new Error('unknown_argument_'+token);
    else args.inputs.push(token);
  }
  if(args.inputs.length < Math.max(3,args.minimumRuns)){
    throw new Error(
      'usage: node backend/astera-att-session-consensus.js <connect1.json> <connect2.json> <connect3.json> [...] [--minimum-runs 3] [--json out.json]'
    );
  }
  return args;
}

function main(){
  const args=parseArgs(process.argv);
  const captures=args.inputs.map(file=>JSON.parse(fs.readFileSync(file,'utf8')));
  const result=analyzeSessionCaptures(captures,{minimumRuns:args.minimumRuns});
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

export {
  normalizePeerAddress,
  capturePeerAddress,
  endpointIdentity,
  byteConsensus,
  intervalStats,
  commonEndpointPrefix,
  firstResponseAfter,
  repeatableResponsePairs,
  periodicEndpoints,
  analyzeSessionCaptures,
  parseArgs
};
