import assert from 'node:assert/strict';
import { analyzeControlEvidence, inspectCapturedEnvelope, summarizeReplyFragments } from './astera-control-evidence.js';

const white = '0A107EDF36000000007D63130DD30E960CFFBE0F';
assert.equal(inspectCapturedEnvelope(white).valid, true);
assert.equal(inspectCapturedEnvelope(white).crcHex, 'BE0F');
assert.equal(inspectCapturedEnvelope(white.slice(0, -2) + '00').valid, false);
assert.equal(inspectCapturedEnvelope('zz').reason, 'invalid_hex');
// Do not strip the duplicated 0A in the captured stage: escaping is unknown.
assert.equal(inspectCapturedEnvelope('0A057F932700020A0A09').reason, 'unescaped_length_mismatch');
const reportedFailure = {
  kind: 'LightingAI-Astera-BTB-captured-color-replay', preset: 'WHITE',
  address: 'C0:49:EF:F8:05:0A', operatorObservation: 'UNCHANGED',
  payload: { frame: white, writeType: 'WRITE_WITHOUT_RESPONSE', writeCallbackObserved: true,
    writeCallbackStatus: 0, postColorNotificationCount: 9, sessionVerified: false,
    deviceAppliedColorVerified: false }
};
let result = analyzeControlEvidence(reportedFailure).tests[0];
assert.equal(result.physicalOutcome, 'requested_color_not_observed');
assert.equal(result.localWriteStatusZero, true);
assert.equal(result.sessionVerified, false);
assert.equal(result.deviceAppliedColorVerified, false);
assert.deepEqual(result.missingEvidence, ['complete_post_write_notification_bytes_and_timestamps']);
const synthetic = structuredClone(reportedFailure);
synthetic.operatorObservation = 'COLOR_CHANGED';
synthetic.payload.sessionVerified = true;
synthetic.payload.deviceAppliedColorVerified = true;
synthetic.payload.notificationSamples = Array.from({ length: 9 }, (_, i) => ({ hex: '0102', atMs: i, afterColorWrite: true }));
result = analyzeControlEvidence(synthetic).tests[0];
assert.equal(result.physicalOutcome, 'operator_reported_requested_color');
assert.equal(result.sessionVerified, false, 'Imported success claims never become a decoded ACK');
assert.equal(result.deviceAppliedColorVerified, false);
assert.deepEqual(result.missingEvidence, []);
synthetic.payload.notificationSamples[0].hex = 'invalid';
assert.ok(analyzeControlEvidence(synthetic).tests[0].missingEvidence.includes('valid_notification_bytes_and_timestamps'));
const noObservation = { preset: 'WHITE', payload: {} };
assert.equal(analyzeControlEvidence(noObservation).tests[0].physicalOutcome, 'physical_result_missing');
assert.equal(analyzeControlEvidence({ preset: 'CONNECT' }).tests[0].physicalOutcome, 'not_a_color_test');
assert.equal(analyzeControlEvidence({ preset: 'WHITE', error: 'ble_native_callback_timeout' }).tests[0].failure, 'ble_native_callback_timeout');
assert.equal(analyzeControlEvidence({ preset: 'WHITE', payload: { eventTimeline: [{ type: 'write_start', label: 'color', hex: white }, { type: 'write_callback', label: 'color', status: 0 }] } }).tests[0].localWriteStatusZero, true);
assert.equal(analyzeControlEvidence({ preset: 'WHITE', payload: { eventTimeline: [{ type: 'write_callback', label: 'wake', status: 0 }] } }).tests[0].localWriteStatusZero, false);
assert.equal(analyzeControlEvidence({ preset: 'WHITE', payload: { eventTimeline: [{ type: 'write_callback', label: 'color', status: 0 }, { type: 'operation_start', operation: 'WHITE' }] } }).tests[0].localWriteStatusZero, false, 'A prior operation callback cannot prove this write');
assert.equal(analyzeControlEvidence({ kind: 'LightingAI-Astera-control-test-session', tests: [reportedFailure, synthetic] }).tests.length, 2);
assert.throws(() => analyzeControlEvidence(null), /control_export_required/);
assert.throws(() => analyzeControlEvidence({ kind: 'LightingAI-Astera-control-test-session', tests: [] }), /control_tests_required/);
// Exact nine benign fragments supplied in the 2026-10-09 failed WHITE export.
// No private session/config capture is embedded in this test.
const observedFragments = ['3C3F786D6C','2076657273','696F6E3D22','312E302220','3F3E0A3C72','65706C793E','0A','3C2F726570','6C793E0A']
  .map((hex, i) => ({ hex, atMs: 1530565 + i, afterColorWrite: true }));
const reply = summarizeReplyFragments(observedFragments, 9);
assert.equal(reply.fragmentCount, 9);
assert.equal(reply.byteCount, 40);
assert.equal(reply.completeReplyCount, 1);
assert.equal(reply.emptyReplyCount, 1);
assert.equal(reply.unassembledTextPresent, false);
assert.equal(reply.ackVerified, false);
assert.equal(summarizeReplyFragments(observedFragments.slice(1), 9).available, false);
assert.equal(summarizeReplyFragments([{ hex: 'FF', atMs: 1 }]).available, false);
assert.equal(summarizeReplyFragments([{ hex: '3C', atMs: 2 }, { hex: '3E', atMs: 1 }]).available, false);
assert.equal(summarizeReplyFragments([{ hex: Buffer.from('</reply>\n').toString('hex'), atMs: 1 }]).unassembledTextPresent, true);
const text = '<?xml version="1.0" ?>\n<reply>\n</reply>\n<reply><sh1002>   V5.12.96.U</sh1002></reply>';
for (const size of [1, 5, 20, 100]) {
  const bytes = Buffer.from(text);
  const parts = [];
  for (let i = 0; i < bytes.length; i += size) parts.push({ hex: bytes.subarray(i, i + size).toString('hex'), atMs: i });
  const assembled = summarizeReplyFragments(parts);
  assert.equal(assembled.completeReplyCount, 2);
  assert.equal(assembled.emptyReplyCount, 1);
  assert.equal(assembled.nonemptyReplyCount, 1);
  assert.equal(assembled.ackVerified, false);
}
const physicalExport = structuredClone(reportedFailure);
physicalExport.operatorObservation = 'NOT_RECORDED'; // Actual JSON omitted operator feedback; owner's chat reports red unchanged.
physicalExport.payload.notificationSamples = observedFragments;
result = analyzeControlEvidence(physicalExport).tests[0];
assert.equal(result.postWriteResponses.completeReplyCount, 1);
assert.equal(result.physicalOutcome, 'physical_result_missing');
assert.deepEqual(result.missingEvidence, ['operator_observation']);
console.log('Astera evidence triage passed: reported WHITE failure, missing notifications, CRC, unknown escaping, callback attribution, no inferred session/ACK, aggregate exports');
