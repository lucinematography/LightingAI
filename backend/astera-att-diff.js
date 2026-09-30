#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function normalizePeerAddress(value) {
  return String(value || '').trim().replace(/-/g, ':').toUpperCase();
}

function capturePeerAddress(input) {
  if (!input || typeof input !== 'object') return '';
  const explicit = input.filter && input.filter.address
    ? normalizePeerAddress(input.filter.address)
    : '';
  if (explicit) return explicit;

  const addresses = new Set();
  const collect = rows => {
    for (const row of Array.isArray(rows) ? rows : []) {
      const address = normalizePeerAddress(row && row.peerAddress);
      if (address) addresses.add(address);
    }
  };
  collect(input.connections);
  collect(input.candidateAsteraSessionWrites);
  collect(input.attEvents);

  if (addresses.size > 1) {
    throw new Error('capture_contains_multiple_peer_addresses');
  }
  return addresses.size === 1 ? [...addresses][0] : '';
}

function stableAttributeIdentity(event) {
  const uuid = String(event && event.attributeUuid || '').toLowerCase();
  if (uuid) return 'uuid:' + uuid;
  return 'handle:' + (event && event.handle != null ? String(event.handle) : '');
}

function stableEndpointSignature(event) {
  return [
    String(event && event.direction || ''),
    String(event && event.opcodeName || ''),
    String(event && event.serviceUuid || '').toLowerCase(),
    stableAttributeIdentity(event)
  ].join('|');
}

function stableWriteSignature(event) {
  return [
    stableEndpointSignature(event),
    String(event && event.valueHex || '').toUpperCase()
  ].join('|');
}

function countBySignature(events) {
  const map = new Map();
  for (const event of Array.isArray(events) ? events : []) {
    const signature = stableWriteSignature(event);
    const row = map.get(signature) || {signature, count:0, sample:event};
    row.count++;
    map.set(signature, row);
  }
  return map;
}

function subtractCounts(primary, secondary) {
  const out = [];
  for (const [signature, row] of primary.entries()) {
    const other = secondary.get(signature);
    const remaining = Math.max(0, row.count - (other ? other.count : 0));
    if (remaining > 0) {
      out.push({
        signature,
        count: remaining,
        sample: row.sample
      });
    }
  }
  return out;
}

function commonCounts(a, b) {
  const out = [];
  for (const [signature, row] of a.entries()) {
    const other = b.get(signature);
    if (!other) continue;
    const count = Math.min(row.count, other.count);
    if (count > 0) out.push({signature, count, sample:row.sample});
  }
  return out;
}

function payloadSetByEndpoint(events) {
  const map = new Map();
  for (const event of Array.isArray(events) ? events : []) {
    const endpoint = stableEndpointSignature(event);
    const payload = String(event && event.valueHex || '').toUpperCase();
    if (!map.has(endpoint)) {
      map.set(endpoint, {
        endpoint,
        sample:event,
        payloads:new Set()
      });
    }
    map.get(endpoint).payloads.add(payload);
  }
  return map;
}

function changedEndpointPayloads(referenceEvents, testEvents) {
  const reference = payloadSetByEndpoint(referenceEvents);
  const test = payloadSetByEndpoint(testEvents);
  const out = [];
  for (const [endpoint, testRow] of test.entries()) {
    const refRow = reference.get(endpoint);
    if (!refRow) continue;
    const referencePayloads = [...refRow.payloads].sort();
    const testPayloads = [...testRow.payloads].sort();
    if (JSON.stringify(referencePayloads) === JSON.stringify(testPayloads)) continue;
    out.push({
      endpoint,
      sample:testRow.sample,
      referencePayloads,
      testPayloads
    });
  }
  return out;
}

function normalizeCapture(input, label = 'capture') {
  if (!input || typeof input !== 'object') {
    throw new Error('invalid_capture_json');
  }
  const mappingWarning = input.analysisCoverage &&
    typeof input.analysisCoverage.mappingWarning === 'string'
      ? input.analysisCoverage.mappingWarning
      : '';
  if (mappingWarning) {
    throw new Error(
      label + '_gatt_mapping_incomplete_' + mappingWarning
    );
  }
  const writes = Array.isArray(input.candidateAsteraSessionWrites)
    ? input.candidateAsteraSessionWrites
    : [];
  const notifications = Array.isArray(input.attEvents)
    ? input.attEvents.filter(e =>
        e && (e.opcodeName === 'HANDLE_VALUE_NOTIFICATION' ||
              e.opcodeName === 'HANDLE_VALUE_INDICATION'))
    : [];
  return {
    writes,
    notifications,
    peerAddress:capturePeerAddress(input)
  };
}

function compareCaptures(referenceInput, testInput, labels = {}) {
  const reference = normalizeCapture(referenceInput, 'reference');
  const test = normalizeCapture(testInput, 'test');

  if (reference.peerAddress && test.peerAddress &&
      reference.peerAddress !== test.peerAddress) {
    throw new Error(
      'capture_peer_address_mismatch_' +
      reference.peerAddress + '_vs_' + test.peerAddress
    );
  }

  const peerAddress = reference.peerAddress || test.peerAddress || '';
  const identityWarning =
    reference.peerAddress && test.peerAddress
      ? ''
      : 'peer_address_unavailable_in_one_or_both_captures';

  const refCounts = countBySignature(reference.writes);
  const testCounts = countBySignature(test.writes);

  const onlyInReference = subtractCounts(refCounts, testCounts);
  const onlyInTest = subtractCounts(testCounts, refCounts);
  const common = commonCounts(refCounts, testCounts);

  const refNotificationCounts = countBySignature(reference.notifications);
  const testNotificationCounts = countBySignature(test.notifications);
  const notificationOnlyInTest = subtractCounts(
    testNotificationCounts,
    refNotificationCounts
  );
  const changedWritePayloadEndpoints = changedEndpointPayloads(
    reference.writes,
    test.writes
  );
  const changedNotificationPayloadEndpoints = changedEndpointPayloads(
    reference.notifications,
    test.notifications
  );

  return {
    kind: 'LightingAI-Astera-ATT-diff',
    referenceLabel: labels.reference || 'reference',
    testLabel: labels.test || 'test',
    captureIdentity:{
      peerAddress,
      referencePeerAddress:reference.peerAddress,
      testPeerAddress:test.peerAddress,
      verifiedMatch:!!(
        reference.peerAddress &&
        test.peerAddress &&
        reference.peerAddress === test.peerAddress
      ),
      warning:identityWarning
    },
    summary: {
      referenceCandidateWrites: reference.writes.length,
      testCandidateWrites: test.writes.length,
      commonCandidateWrites: common.reduce((n, x) => n + x.count, 0),
      referenceOnlyCandidateWrites: onlyInReference.reduce((n, x) => n + x.count, 0),
      testOnlyCandidateWrites: onlyInTest.reduce((n, x) => n + x.count, 0),
      testOnlyNotificationPatterns: notificationOnlyInTest.reduce((n, x) => n + x.count, 0),
      changedWritePayloadEndpoints: changedWritePayloadEndpoints.length,
      changedNotificationPayloadEndpoints: changedNotificationPayloadEndpoints.length
    },
    commonCandidateWrites: common,
    onlyInReference,
    onlyInTest,
    candidateParameterSpecificWrites: onlyInTest,
    changedWritePayloadEndpoints,
    notificationOnlyInTest,
    changedNotificationPayloadEndpoints,
    interpretation: {
      confidence:'candidate_only',
      note:'A test-only or changed payload is not a verified DIM/CCT/COLOR/FX command until it repeats across controlled captures with one operator parameter changed at a time.'
    }
  };
}

function parseArgs(argv) {
  const rest = argv.slice(2);
  const args = {
    reference:'',
    test:'',
    json:'',
    referenceLabel:'reference',
    testLabel:'test'
  };
  while (rest.length) {
    const token = rest.shift();
    if (token === '--json') args.json = rest.shift() || '';
    else if (token === '--reference-label') args.referenceLabel = rest.shift() || 'reference';
    else if (token === '--test-label') args.testLabel = rest.shift() || 'test';
    else if (!args.reference) args.reference = token;
    else if (!args.test) args.test = token;
    else throw new Error('unknown_argument_' + token);
  }
  if (!args.reference || !args.test) {
    throw new Error(
      'usage: node backend/astera-att-diff.js <reference.json> <test.json> ' +
      '[--reference-label connect-only] [--test-label dim-change] [--json out.json]'
    );
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const reference = JSON.parse(fs.readFileSync(args.reference, 'utf8'));
  const test = JSON.parse(fs.readFileSync(args.test, 'utf8'));
  const result = compareCaptures(reference, test, {
    reference: args.referenceLabel,
    test: args.testLabel
  });
  const body = JSON.stringify(result, null, 2) + '\n';
  if (args.json) fs.writeFileSync(args.json, body);
  else process.stdout.write(body);
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedFile && path.resolve(currentFile) === invokedFile) {
  try {
    main();
  } catch (error) {
    process.stderr.write(String(error && error.message ? error.message : error) + '\n');
    process.exit(1);
  }
}

export {
  normalizePeerAddress,
  capturePeerAddress,
  stableAttributeIdentity,
  stableEndpointSignature,
  stableWriteSignature,
  compareCaptures
};
