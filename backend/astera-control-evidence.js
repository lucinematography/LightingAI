// Offline triage of existing Control exports. Never sends BLE or decodes an ACK.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function summarizeReplyFragments(samples, expectedFragments = samples.length) {
  // Notification boundaries are not application-message boundaries. Preserve order.
  // Recognize only the observed ASCII wrapper, never assign proprietary ACK meaning.
  const valid = samples.every((s, i) => s && Number.isFinite(s.atMs) &&
    /^(?:[0-9a-f]{2})+$/i.test(String(s.hex || '')) &&
    (i === 0 || s.atMs >= samples[i - 1].atMs));
  if (!valid || expectedFragments !== samples.length) return {
    available: false, reason: 'missing_invalid_or_unordered_fragments', ackVerified: false
  };
  const byteCount = samples.reduce((n, s) => n + s.hex.length / 2, 0);
  if (byteCount > 256000) return { available: false, reason: 'stream_size_limit', ackVerified: false };
  const bytes = Buffer.concat(samples.map(s => Buffer.from(s.hex, 'hex')));
  if ([...bytes].some(b => b > 126 || (b < 32 && ![9, 10, 13].includes(b)))) return {
    available: false, reason: 'not_observed_ascii_reply_format', ackVerified: false
  };
  const text = bytes.toString('ascii');
  const replies = [...text.matchAll(/<reply>([\s\S]*?)<\/reply>/g)];
  const remainder = text.replace(/<reply>[\s\S]*?<\/reply>/g, '')
    .replace(/<\?xml[^<>]*\?>/g, '').trim();
  return {
    available: true, fragmentCount: samples.length, byteCount,
    completeReplyCount: replies.length,
    emptyReplyCount: replies.filter(r => !r[1].trim()).length,
    nonemptyReplyCount: replies.filter(r => r[1].trim()).length,
    unassembledTextPresent: remainder.length > 0,
    ackVerified: false
  };
}

export function inspectCapturedEnvelope(hex) {
  if (typeof hex !== 'string' || !/^(?:[0-9a-f]{2})+$/i.test(hex)) return { valid: false, reason: 'invalid_hex' };
  const bytes = Buffer.from(hex, 'hex');
  if (bytes.length < 4 || bytes[0] !== 10) return { valid: false, reason: 'unrecognized_envelope' };
  // Applies only the unescaped framing relation already used for the four captures.
  // A mismatch is NOT proof of corruption: byte stuffing is not documented.
  if (bytes.length !== bytes[1] + 4) return { valid: false, reason: 'unescaped_length_mismatch', wireBytes: bytes.length, declaredBytes: bytes[1] + 4 };
  let crc = 0xffff;
  for (const byte of bytes.subarray(1, -2)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
  }
  const expected = bytes.readUInt16BE(bytes.length - 2);
  return { valid: crc === expected, reason: crc === expected ? 'captured_envelope_crc_matches' : 'unescaped_crc_mismatch', wireBytes: bytes.length, crcHex: crc.toString(16).padStart(4, '0').toUpperCase(), semanticsVerified: false };
}

export function analyzeControlEvidence(input) {
  if (!input || typeof input !== 'object') throw new Error('control_export_required');
  const tests = input.kind === 'LightingAI-Astera-control-test-session' ? input.tests : [input];
  if (!Array.isArray(tests) || !tests.length) throw new Error('control_tests_required');
  return {
    kind: 'LightingAI-Astera-control-evidence-analysis',
    sessionVerified: false,
    deviceAppliedColorVerified: false,
    protocolDecoded: false,
    tests: tests.map(test => {
      if (!test || typeof test !== 'object') throw new Error('invalid_control_test');
      const payload = test.payload || test;
      const preset = test.preset || payload.preset || '';
      const samples = Array.isArray(payload.notificationSamples) ? payload.notificationSamples : [];
      const fullTimeline = Array.isArray(payload.eventTimeline) ? payload.eventTimeline : [];
      const operationStart = fullTimeline.findLastIndex(e => e?.type === 'operation_start');
      const timeline = fullTimeline.slice(Math.max(0, operationStart));
      const postSamples = samples.filter(s => s?.afterColorWrite === true);
      const frame = payload.frame || timeline.findLast(e => e?.type === 'write_start' && e.label === 'color')?.hex || '';
      const writes = timeline.filter(e => e?.type === 'write_start' && e.label === 'color');
      const colorCallbacks = timeline.filter(e => e?.type === 'write_callback' && e.label === 'color');
      const localWriteStatusZero = (payload.writeCallbackObserved === true && payload.writeCallbackStatus === 0) || colorCallbacks.some(e => e.status === 0);
      const operatorObservation = test.operatorObservation || 'NOT_RECORDED';
      const failure = test.error || payload.error || '';
      const physicalOutcome = preset === 'CONNECT' ? 'not_a_color_test'
        : operatorObservation === 'UNCHANGED' ? 'requested_color_not_observed'
        : operatorObservation === 'COLOR_CHANGED' ? 'operator_reported_requested_color'
        : 'physical_result_missing';
      const missing = [];
      if (!frame && preset !== 'CONNECT') missing.push('exact_color_write_bytes');
      if (preset !== 'CONNECT' && physicalOutcome === 'physical_result_missing') missing.push('operator_observation');
      const count = Number.isInteger(payload.postColorNotificationCount) ? payload.postColorNotificationCount : postSamples.length;
      if (count > postSamples.length) missing.push('complete_post_write_notification_bytes_and_timestamps');
      if (postSamples.some(s => !Number.isFinite(s.atMs) || !/^(?:[0-9a-f]{2})+$/i.test(String(s.hex || '')))) missing.push('valid_notification_bytes_and_timestamps');
      // A timeline may span operations; do not associate a disconnect by proximity.
      return {
        address: test.address || payload.address || '', preset, failure, physicalOutcome,
        localWriteStatusZero, writeMode: payload.writeType || 'unknown',
        envelope: frame ? inspectCapturedEnvelope(frame) : null,
        colorWritesInTimeline: writes.length,
        postWriteNotificationCount: count, retainedPostWriteSamples: postSamples.length,
        postWriteResponses: summarizeReplyFragments(postSamples, count),
        missingEvidence: [...new Set(missing)],
        sessionVerificationReason: 'no_confirmed_astera_session_response_decoder',
        fixtureVerificationReason: 'no_confirmed_command_response_decoder',
        nextEvidence: 'existing_Control_export_and_successful_official_AsteraApp_fresh_session_HCI_capture',
        // Neither Android callbacks, notifications, payload claims nor operator feedback prove protocol semantics.
        sessionVerified: false, deviceAppliedColorVerified: false
      };
    })
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error('usage: node backend/astera-control-evidence.js <private-control-export.json>');
    // Output contains counts/outcomes, never copies raw session/notification bytes.
    console.log(JSON.stringify(analyzeControlEvidence(JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
