#!/usr/bin/env node
'use strict';

import assert from 'node:assert';
import * as analyzer from './astera-btsnoop-analyzer.js';

const EPOCH = 0x00dcddb30f2f8000n;

function record(packet, flags, ms) {
  const offsetUs = Math.round(Number(ms) * 1000);
  if (!Number.isSafeInteger(offsetUs)) {
    throw new Error('invalid_test_timestamp_ms');
  }
  const header = Buffer.alloc(24);
  header.writeUInt32BE(packet.length, 0);
  header.writeUInt32BE(packet.length, 4);
  header.writeUInt32BE(flags >>> 0, 8);
  header.writeUInt32BE(0, 12);
  header.writeBigUInt64BE(EPOCH + BigInt(offsetUs), 16);
  return Buffer.concat([header, packet]);
}

function hciLeConnection(handle, address) {
  const addr = Buffer.from(address.split(':').map(x => parseInt(x, 16)).reverse());
  const params = Buffer.alloc(19);
  params[0] = 0x01;
  params[1] = 0x00;
  params.writeUInt16LE(handle, 2);
  params[4] = 0x00;
  params[5] = 0x01;
  addr.copy(params, 6);
  params.writeUInt16LE(24, 12);
  params.writeUInt16LE(0, 14);
  params.writeUInt16LE(200, 16);
  params[18] = 0;
  return Buffer.concat([Buffer.from([0x04, 0x3e, params.length]), params]);
}

function hciEncryptionChangeV2(handle, enabled = 1, keySize = 16, status = 0) {
  const params = Buffer.alloc(5);
  params[0] = status;
  params.writeUInt16LE(handle, 1);
  params[3] = enabled;
  params[4] = keySize;
  return Buffer.concat([Buffer.from([0x04, 0x59, params.length]), params]);
}

function hciLongTermKeyRequest(handle) {
  const params = Buffer.alloc(13);
  params[0] = 0x05;
  params.writeUInt16LE(handle, 1);
  Buffer.alloc(8, 0xaa).copy(params, 3);
  params.writeUInt16LE(0x1234, 11);
  return Buffer.concat([Buffer.from([0x04, 0x3e, params.length]), params]);
}

function hciDisconnect(handle, reason) {
  const params = Buffer.alloc(4);
  params[0] = 0;
  params.writeUInt16LE(handle, 1);
  params[3] = reason;
  return Buffer.concat([Buffer.from([0x04, 0x05, params.length]), params]);
}

function acl(handle, cid, payload, incoming) {
  const l2 = Buffer.alloc(4);
  l2.writeUInt16LE(payload.length, 0);
  l2.writeUInt16LE(cid, 2);
  const body = Buffer.concat([l2, payload]);
  const packet = Buffer.alloc(5 + body.length);
  packet[0] = 0x02;
  packet.writeUInt16LE((handle & 0x0fff) | (0x02 << 12), 1);
  packet.writeUInt16LE(body.length, 3);
  body.copy(packet, 5);
  return {packet, flags: incoming ? 1 : 0};
}

function exchangeMtu(opcode, mtu) {
  const out = Buffer.alloc(3);
  out[0] = opcode;
  out.writeUInt16LE(mtu, 1);
  return out;
}

function readByGroupTypeRequest(start, end, type16 = 0x2800) {
  const out = Buffer.alloc(7);
  out[0] = 0x10;
  out.writeUInt16LE(start, 1);
  out.writeUInt16LE(end, 3);
  out.writeUInt16LE(type16, 5);
  return out;
}

function readByTypeRequest(start, end, type16 = 0x2803) {
  const out = Buffer.alloc(7);
  out[0] = 0x08;
  out.writeUInt16LE(start, 1);
  out.writeUInt16LE(end, 3);
  out.writeUInt16LE(type16, 5);
  return out;
}

function readByTypeValueResponse(handle, valueBytes) {
  const value = Buffer.from(valueBytes);
  const entry = Buffer.alloc(2 + value.length);
  entry.writeUInt16LE(handle, 0);
  value.copy(entry, 2);
  return Buffer.concat([Buffer.from([0x09, entry.length]), entry]);
}

function readByGroupTypeResponse(start, end, uuid128) {
  const uuidBytes = Buffer.from(uuid128.replace(/-/g, ''), 'hex').reverse();
  const entry = Buffer.alloc(4 + 16);
  entry.writeUInt16LE(start, 0);
  entry.writeUInt16LE(end, 2);
  uuidBytes.copy(entry, 4);
  return Buffer.concat([Buffer.from([0x11, entry.length]), entry]);
}

function readByTypeCharacteristicResponse(declHandle, valueHandle, uuid128) {
  const uuidBytes = Buffer.from(uuid128.replace(/-/g, ''), 'hex').reverse();
  const entry = Buffer.alloc(5 + 16);
  entry.writeUInt16LE(declHandle, 0);
  entry[2] = 0x1c;
  entry.writeUInt16LE(valueHandle, 3);
  uuidBytes.copy(entry, 5);
  return Buffer.concat([Buffer.from([0x09, entry.length]), entry]);
}

function findInformationCccd(handle) {
  const entry = Buffer.alloc(4);
  entry.writeUInt16LE(handle, 0);
  entry.writeUInt16LE(0x2902, 2);
  return Buffer.concat([Buffer.from([0x05, 0x01]), entry]);
}

function writeRequest(handle, valueHex) {
  const value = Buffer.from(valueHex, 'hex');
  const out = Buffer.alloc(3 + value.length);
  out[0] = 0x12;
  out.writeUInt16LE(handle, 1);
  value.copy(out, 3);
  return out;
}

function writeResponse() {
  return Buffer.from([0x13]);
}

function prepareWrite(handle, offset, valueHex) {
  const value = Buffer.from(valueHex, 'hex');
  const out = Buffer.alloc(5 + value.length);
  out[0] = 0x16;
  out.writeUInt16LE(handle, 1);
  out.writeUInt16LE(offset, 3);
  value.copy(out, 5);
  return out;
}

function prepareWriteResponse(handle, offset, valueHex) {
  const out = prepareWrite(handle, offset, valueHex);
  out[0] = 0x17;
  return out;
}

function executeWrite(flag = 0x01) {
  return Buffer.from([0x18, flag]);
}

function executeWriteResponse() {
  return Buffer.from([0x19]);
}

function attErrorResponse(requestOpcode, handle, errorCode) {
  const out = Buffer.alloc(5);
  out[0] = 0x01;
  out[1] = requestOpcode;
  out.writeUInt16LE(handle, 2);
  out[4] = errorCode;
  return out;
}

function smpPairingRequest({
  ioCapability=0x03,
  oobDataFlag=0x00,
  authReq=0x0d,
  maxEncryptionKeySize=0x10,
  initiatorKeyDistribution=0x01,
  responderKeyDistribution=0x01
} = {}) {
  return Buffer.from([
    0x01,
    ioCapability,
    oobDataFlag,
    authReq,
    maxEncryptionKeySize,
    initiatorKeyDistribution,
    responderKeyDistribution
  ]);
}

function smpSecurityRequest(authReq=0x09) {
  return Buffer.from([0x0b,authReq]);
}

const connectionHandle = 0x000b;
const address = '11:22:33:44:55:66';
const asteraService = analyzer.ASTERA_BTB_PRIVATE_SERVICE;
const vendorCharacteristic = '12345678-1234-5678-9abc-def012345678';
const valueHandle = 0x0025;
const cccdHandle = 0x0026;

const packets = [];
packets.push(record(hciLeConnection(connectionHandle, address), 1, 0));
packets.push(record(hciLongTermKeyRequest(connectionHandle), 1, 1));
packets.push(record(hciEncryptionChangeV2(connectionHandle, 1, 16, 0), 1, 2));

let p = acl(connectionHandle, 0x0004, exchangeMtu(0x02, 247), false);
packets.push(record(p.packet, p.flags, 3));

p = acl(connectionHandle, 0x0004, exchangeMtu(0x03, 185), true);
packets.push(record(p.packet, p.flags, 4));

p = acl(connectionHandle, 0x0004, readByGroupTypeRequest(0x0001, 0xffff), false);
packets.push(record(p.packet, p.flags, 5));

p = acl(connectionHandle, 0x0004, readByGroupTypeResponse(0x0020, 0x002f, asteraService), true);
packets.push(record(p.packet, p.flags, 10));

p = acl(connectionHandle, 0x0004, readByTypeRequest(0x0020, 0x002f), false);
packets.push(record(p.packet, p.flags, 15));

p = acl(connectionHandle, 0x0004, readByTypeCharacteristicResponse(0x0024, valueHandle, vendorCharacteristic), true);
packets.push(record(p.packet, p.flags, 20));

// A non-characteristic Read By Type response with entry length >= 7 must not
// be misinterpreted as a characteristic declaration.
p = acl(connectionHandle, 0x0004, readByTypeRequest(0x0001, 0xffff, 0x2a00), false);
packets.push(record(p.packet, p.flags, 22));

p = acl(
  connectionHandle,
  0x0004,
  readByTypeValueResponse(0x0030, Buffer.from([0x00,0x44,0x00,0x29,0x2a])),
  true
);
packets.push(record(p.packet, p.flags, 24));

p = acl(connectionHandle, 0x0004, findInformationCccd(cccdHandle), true);
packets.push(record(p.packet, p.flags, 30));

const cccdWrite = Buffer.alloc(5);
cccdWrite[0] = 0x12;
cccdWrite.writeUInt16LE(cccdHandle, 1);
cccdWrite.writeUInt16LE(0x0001, 3);
p = acl(connectionHandle, 0x0004, cccdWrite, false);
packets.push(record(p.packet, p.flags, 40));

const vendorWrite = Buffer.concat([
  Buffer.from([0x52, valueHandle & 0xff, valueHandle >> 8]),
  Buffer.from('A1B2C3D4', 'hex')
]);
p = acl(connectionHandle, 0x0004, vendorWrite, false);
packets.push(record(p.packet, p.flags, 50));

const noiseWrite = Buffer.concat([
  Buffer.from([0x52, 0x44, 0x00]),
  Buffer.from('BEEF', 'hex')
]);
p = acl(connectionHandle, 0x0004, noiseWrite, false);
packets.push(record(p.packet, p.flags, 55));

const protectedRead = Buffer.alloc(3);
protectedRead[0] = 0x0a;
protectedRead.writeUInt16LE(valueHandle,1);
p = acl(connectionHandle, 0x0004, protectedRead, false);
packets.push(record(p.packet,p.flags,56));

p = acl(connectionHandle, 0x0004, attErrorResponse(0x0a,valueHandle,0x05), true);
packets.push(record(p.packet,p.flags,57));

p = acl(connectionHandle, 0x0004, prepareWrite(valueHandle, 0, '1122'), false);
packets.push(record(p.packet, p.flags, 58));

p = acl(connectionHandle, 0x0004, prepareWriteResponse(valueHandle, 0, '1122'), true);
packets.push(record(p.packet, p.flags, 59));

p = acl(connectionHandle, 0x0004, prepareWrite(valueHandle, 2, '3344'), false);
packets.push(record(p.packet, p.flags, 60));

p = acl(connectionHandle, 0x0004, prepareWriteResponse(valueHandle, 2, '3344'), true);
packets.push(record(p.packet, p.flags, 61));

p = acl(connectionHandle, 0x0004, executeWrite(0x01), false);
packets.push(record(p.packet, p.flags, 62));

p = acl(connectionHandle, 0x0004, executeWriteResponse(), true);
packets.push(record(p.packet, p.flags, 63));

const notify = Buffer.concat([
  Buffer.from([0x1b, valueHandle & 0xff, valueHandle >> 8]),
  Buffer.from('010203', 'hex')
]);
p = acl(connectionHandle, 0x0004, notify, true);
packets.push(record(p.packet, p.flags, 64));

packets.push(record(hciDisconnect(connectionHandle, 0x13), 1, 70));

// Reuse the same HCI handle for a second logical connection.
// Service/characteristic maps must stay isolated per connection instance.
packets.push(record(hciLeConnection(connectionHandle, address), 1, 80));

p = acl(connectionHandle, 0x0004, readByGroupTypeRequest(0x0001, 0xffff), false);
packets.push(record(p.packet, p.flags, 85));

p = acl(connectionHandle, 0x0004, readByGroupTypeResponse(0x0020, 0x002f, '11111111-2222-3333-4444-555555555555'), true);
packets.push(record(p.packet, p.flags, 90));

p = acl(connectionHandle, 0x0004, readByTypeRequest(0x0020, 0x002f), false);
packets.push(record(p.packet, p.flags, 95));

p = acl(connectionHandle, 0x0004, readByTypeCharacteristicResponse(0x0024, valueHandle, 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'), true);
packets.push(record(p.packet, p.flags, 100));

const secondWrite = Buffer.concat([
  Buffer.from([0x52, valueHandle & 0xff, valueHandle >> 8]),
  Buffer.from('DEADBEEF', 'hex')
]);
p = acl(connectionHandle, 0x0004, secondWrite, false);
packets.push(record(p.packet, p.flags, 110));

p = acl(connectionHandle, 0x0006, smpPairingRequest(), false);
packets.push(record(p.packet,p.flags,118));

p = acl(connectionHandle, 0x0006, smpSecurityRequest(0x09), true);
packets.push(record(p.packet,p.flags,119));

// Key-bearing SMP content must be redacted from derived JSON.
const smpEncryptionInformation = Buffer.concat([
  Buffer.from([0x06]),
  Buffer.alloc(16, 0xaa)
]);
p = acl(connectionHandle, 0x0006, smpEncryptionInformation, false);
packets.push(record(p.packet, p.flags, 120));

const header = Buffer.alloc(16);
Buffer.from('btsnoop\0', 'binary').copy(header, 0);
header.writeUInt32BE(1, 8);
header.writeUInt32BE(1002, 12);

const capture = Buffer.concat([header, ...packets]);
const result = analyzer.parseCapture(capture, {address});

assert.strictEqual(result.format.version, 1);
assert.strictEqual(result.format.datalinkType, 1002);
assert.strictEqual(result.connections.length, 2);
assert.strictEqual(result.connections[0].address, address);
assert.strictEqual(result.connections[1].address, address);
assert.notStrictEqual(result.connections[0].connectionId, result.connections[1].connectionId);
assert.ok(result.services.some(s => s.uuid === asteraService));

const cccd = result.attEvents.find(e => e.handle === cccdHandle && e.opcode === 0x12);
assert.ok(cccd, 'CCCD write missing');
assert.strictEqual(cccd.attributeUuid, analyzer.CCCD_UUID);
assert.strictEqual(cccd.writeClass, 'standard_cccd');

const candidate = result.candidateAsteraSessionWrites[0];
assert.ok(candidate, 'candidate Astera session write missing');
assert.strictEqual(candidate.handle, valueHandle);
assert.strictEqual(candidate.attributeUuid, vendorCharacteristic);
assert.strictEqual(candidate.serviceUuid, asteraService);
assert.strictEqual(candidate.valueHex, 'A1B2C3D4');
assert.strictEqual(candidate.writeClass, 'candidate_astera_session_write');
assert.strictEqual(result.candidateAsteraSessionWrites.length, 2);

const prepared = result.preparedWriteTransactions.find(e => e.opcodeName === 'PREPARED_WRITE_EXECUTE');
assert.ok(prepared, 'prepared write transaction missing');
assert.strictEqual(prepared.handle, valueHandle);
assert.strictEqual(prepared.complete, true);
assert.strictEqual(prepared.deviceConfirmed, true);
assert.strictEqual(prepared.executeConfirmed, true);
assert.ok(Number.isInteger(prepared.executeResponseRecordIndex));
assert.strictEqual(prepared.valueHex, '11223344');
assert.strictEqual(prepared.fragments.length, 2);
assert.deepStrictEqual(prepared.fragments.map(x=>x.offset), [0,2]);
assert.strictEqual(prepared.attributeUuid, vendorCharacteristic);
assert.strictEqual(prepared.serviceUuid, asteraService);
assert.strictEqual(prepared.writeClass, 'candidate_astera_session_write');
assert.ok(result.candidateAsteraSessionWrites.includes(prepared));

const prepareFragments = result.attEvents.filter(e => e.opcode === 0x16);
assert.strictEqual(prepareFragments.length, 2);
assert.deepStrictEqual(prepareFragments.map(e=>e.prepareOffset), [0,2]);
assert.ok(prepareFragments.every(e => !e.writeClass));

const noise = result.attEvents.find(e => e.valueHex === 'BEEF');
assert.ok(noise, 'non-characteristic Read By Type noise write missing');
assert.strictEqual(noise.handle, 0x0044);
assert.strictEqual(noise.attributeUuid, '');
assert.strictEqual(noise.writeClass, 'other_write');

const secondConnectionWrite = result.attEvents.find(e => e.valueHex === 'DEADBEEF');
assert.ok(secondConnectionWrite, 'second connection write missing');
assert.strictEqual(secondConnectionWrite.serviceUuid, '11111111-2222-3333-4444-555555555555');
assert.strictEqual(secondConnectionWrite.attributeUuid, 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
assert.strictEqual(secondConnectionWrite.writeClass, 'other_write');
assert.notStrictEqual(secondConnectionWrite.connectionId, candidate.connectionId);

const notification = result.attEvents.find(e => e.opcode === 0x1b);
assert.ok(notification, 'notification missing');
assert.strictEqual(notification.valueHex, '010203');
assert.strictEqual(notification.serviceUuid, asteraService);

assert.strictEqual(result.disconnects.length, 1);
assert.strictEqual(result.disconnects[0].reason, 0x13);
assert.strictEqual(result.disconnects[0].reasonName, 'remote_user_terminated_connection');

assert.strictEqual(result.smpEvents.length, 3);
const pairingRequest = result.smpEvents.find(e => e.opcodeName === 'PAIRING_REQUEST');
assert.ok(pairingRequest, 'SMP Pairing Request metadata missing');
assert.strictEqual(pairingRequest.ioCapability, 0x03);
assert.strictEqual(pairingRequest.authReq, 0x0d);
assert.strictEqual(pairingRequest.bondingFlags, 0x01);
assert.strictEqual(pairingRequest.mitmRequested, true);
assert.strictEqual(pairingRequest.secureConnectionsRequested, true);
assert.strictEqual(pairingRequest.maxEncryptionKeySize, 16);
assert.strictEqual(pairingRequest.initiatorKeyDistribution, 0x01);
assert.strictEqual(pairingRequest.responderKeyDistribution, 0x01);
assert.strictEqual(Object.prototype.hasOwnProperty.call(pairingRequest, 'packetHex'), false);

const securityRequest = result.smpEvents.find(e => e.opcodeName === 'SECURITY_REQUEST');
assert.ok(securityRequest, 'SMP Security Request metadata missing');
assert.strictEqual(securityRequest.authReq, 0x09);
assert.strictEqual(securityRequest.secureConnectionsRequested, true);

const encryptionInformation = result.smpEvents.find(e => e.opcodeName === 'ENCRYPTION_INFORMATION');
assert.ok(encryptionInformation, 'SMP Encryption Information event missing');
assert.strictEqual(encryptionInformation.sensitivePayloadRedacted, true);
assert.strictEqual(Object.prototype.hasOwnProperty.call(encryptionInformation, 'packetHex'), false);
assert.strictEqual(result.privacy.smpKeyMaterialRedacted, true);
assert.strictEqual(result.privacy.smpPairingMetadataOnly, true);
assert.strictEqual(result.privacy.securityKeyMaterialRedacted, true);
assert.strictEqual(result.privacy.addressFilterRequiredByCli, true);

assert.strictEqual(result.attErrors.length, 1);
assert.strictEqual(result.attErrors[0].requestOpcodeName, 'READ_REQUEST');
assert.strictEqual(result.attErrors[0].errorHandle, valueHandle);
assert.strictEqual(result.attErrors[0].errorCode, 0x05);
assert.strictEqual(result.attErrors[0].errorName, 'insufficient_authentication');
assert.strictEqual(result.attErrors[0].attributeUuid, vendorCharacteristic);
assert.strictEqual(result.attErrors[0].serviceUuid, asteraService);

assert.strictEqual(result.mtuEvents.length, 2);
assert.strictEqual(result.mtuEvents[0].opcodeName, 'EXCHANGE_MTU_REQUEST');
assert.strictEqual(result.mtuEvents[0].mtu, 247);
assert.strictEqual(result.mtuEvents[1].opcodeName, 'EXCHANGE_MTU_RESPONSE');
assert.strictEqual(result.mtuEvents[1].mtu, 185);
assert.strictEqual(result.mtuExchanges.length, 1);
assert.strictEqual(result.mtuExchanges[0].requestMtu, 247);
assert.strictEqual(result.mtuExchanges[0].responseMtu, 185);
assert.strictEqual(result.mtuExchanges[0].effectiveMtu, 185);

const ltkRequest = result.securityEvents.find(e => e.eventName === 'le_long_term_key_request');
assert.ok(ltkRequest, 'LE long term key request metadata missing');
assert.strictEqual(ltkRequest.sensitivePayloadRedacted, true);
assert.strictEqual(Object.prototype.hasOwnProperty.call(ltkRequest, 'random'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(ltkRequest, 'ediv'), false);

const encryption = result.securityEvents.find(e => e.eventName === 'encryption_change_v2');
assert.ok(encryption, 'Encryption Change v2 metadata missing');
assert.strictEqual(encryption.status, 0);
assert.strictEqual(encryption.encrypted, true);
assert.strictEqual(encryption.encryptionKeySize, 16);

assert.throws(
  () => analyzer.parseArgs(['node', 'astera-btsnoop-analyzer.js', 'capture.log']),
  /address_filter_required/
);
assert.strictEqual(
  analyzer.parseArgs(['node', 'astera-btsnoop-analyzer.js', 'capture.log', '--address', address]).address,
  address
);
assert.strictEqual(
  analyzer.parseArgs(['node', 'astera-btsnoop-analyzer.js', 'capture.log', '--allow-all']).allowAll,
  true
);

const filteredOut = analyzer.parseCapture(capture, {address:'AA:BB:CC:DD:EE:FF'});
assert.strictEqual(filteredOut.attEvents.length, 0);
assert.strictEqual(filteredOut.disconnects.length, 0);

assert.strictEqual(result.analysisCoverage.asteraPrivateServiceMapped, true);
assert.ok(result.analysisCoverage.attributeUuidMappings >= 2);
assert.strictEqual(result.analysisCoverage.mappingWarning, '');
assert.ok(result.attributes.some(x => x.handle === valueHandle && x.uuid === vendorCharacteristic));

// Simulate an Android cached-GATT capture where writes are visible but service/
// characteristic discovery PDUs are absent. The analyzer must flag missing mapping
// instead of interpreting zero strict candidates as proof of zero vendor traffic.
const cachedPackets = [];
cachedPackets.push(record(hciLeConnection(connectionHandle, address), 1, 0));
const cachedWrite = Buffer.concat([
  Buffer.from([0x52, valueHandle & 0xff, valueHandle >> 8]),
  Buffer.from('CAFEBABE', 'hex')
]);
p = acl(connectionHandle, 0x0004, cachedWrite, false);
cachedPackets.push(record(p.packet, p.flags, 5));
const cachedCapture = Buffer.concat([header, ...cachedPackets]);
const cachedResult = analyzer.parseCapture(cachedCapture, {address});
assert.strictEqual(cachedResult.services.length, 0);
assert.strictEqual(cachedResult.attributes.length, 0);
assert.strictEqual(cachedResult.candidateAsteraSessionWrites.length, 0);
assert.strictEqual(cachedResult.unmappedHostWrites.length, 1);
assert.strictEqual(cachedResult.unmappedHostWrites[0].valueHex, 'CAFEBABE');
assert.strictEqual(
  cachedResult.analysisCoverage.mappingWarning,
  'gatt_mapping_incomplete_capture_may_use_cached_handles'
);
assert.strictEqual(cachedResult.analysisCoverage.unmappedHostWriteCount, 1);

const firstConnectionId = result.connections[0].connectionId;
const explicitProfile = {
  analysisCoverage:{mappingWarning:''},
  services:result.services.filter(x => x.connectionId === firstConnectionId),
  attributes:result.attributes.filter(x => x.connectionId === firstConnectionId)
};
const cachedProfiled = analyzer.parseCapture(cachedCapture, {
  address,
  profile:explicitProfile
});
assert.strictEqual(cachedProfiled.analysisCoverage.explicitProfileProvided, true);
assert.strictEqual(cachedProfiled.analysisCoverage.explicitProfileUsed, true);
assert.strictEqual(cachedProfiled.analysisCoverage.mappingSource, 'explicit_profile');
assert.strictEqual(
  cachedProfiled.analysisCoverage.profileAssumption,
  'same_fixture_and_firmware_must_be_verified'
);
assert.strictEqual(cachedProfiled.analysisCoverage.mappingWarning, '');
assert.strictEqual(cachedProfiled.candidateAsteraSessionWrites.length, 1);
assert.strictEqual(cachedProfiled.candidateAsteraSessionWrites[0].valueHex, 'CAFEBABE');
assert.strictEqual(cachedProfiled.candidateAsteraSessionWrites[0].serviceUuid, asteraService);
assert.strictEqual(cachedProfiled.candidateAsteraSessionWrites[0].attributeUuid, vendorCharacteristic);
assert.ok(cachedProfiled.services.every(x => x.mappingSource === 'explicit_profile'));
assert.ok(cachedProfiled.attributes.every(x => x.mappingSource === 'explicit_profile'));

// Prepared Write must fail closed unless every fragment and the final Execute
// are confirmed by the device.
function parsePreparedOnly(attPayloads) {
  const rows = [record(hciLeConnection(connectionHandle, address), 1, 0)];
  let tick = 1;
  for (const row of attPayloads) {
    const wrapped = acl(connectionHandle, 0x0004, row.payload, row.incoming);
    rows.push(record(wrapped.packet, wrapped.flags, tick++));
  }
  return analyzer.parseCapture(Buffer.concat([header, ...rows]), {
    address,
    profile:explicitProfile
  });
}

const missingPrepareAck = parsePreparedOnly([
  {payload:prepareWrite(valueHandle,0,'AA55'),incoming:false},
  {payload:executeWrite(0x01),incoming:false},
  {payload:executeWriteResponse(),incoming:true}
]);
assert.strictEqual(missingPrepareAck.candidateAsteraSessionWrites.length, 0);
assert.strictEqual(missingPrepareAck.preparedWriteTransactions.length, 0);

const overlappingPrepareRequests = parsePreparedOnly([
  {payload:prepareWrite(valueHandle,0,'AA55'),incoming:false},
  {payload:prepareWrite(valueHandle,2,'BB66'),incoming:false},
  {payload:prepareWriteResponse(valueHandle,2,'BB66'),incoming:true},
  {payload:executeWrite(0x01),incoming:false},
  {payload:executeWriteResponse(),incoming:true}
]);
assert.strictEqual(overlappingPrepareRequests.candidateAsteraSessionWrites.length,0);
assert.strictEqual(overlappingPrepareRequests.preparedWriteTransactions.length,0);

const overlappingExecuteRequests = parsePreparedOnly([
  {payload:prepareWrite(valueHandle,0,'AA55'),incoming:false},
  {payload:prepareWriteResponse(valueHandle,0,'AA55'),incoming:true},
  {payload:executeWrite(0x01),incoming:false},
  {payload:executeWrite(0x01),incoming:false},
  {payload:executeWriteResponse(),incoming:true}
]);
assert.strictEqual(overlappingExecuteRequests.candidateAsteraSessionWrites.length,0);
assert.strictEqual(overlappingExecuteRequests.preparedWriteTransactions.length,0);

const rejectedPrepare = parsePreparedOnly([
  {payload:prepareWrite(valueHandle,0,'AA55'),incoming:false},
  {payload:attErrorResponse(0x16,valueHandle,0x09),incoming:true},
  {payload:executeWrite(0x01),incoming:false},
  {payload:executeWriteResponse(),incoming:true}
]);
assert.strictEqual(rejectedPrepare.candidateAsteraSessionWrites.length, 0);
assert.strictEqual(rejectedPrepare.preparedWriteTransactions.length, 0);

const rejectedExecute = parsePreparedOnly([
  {payload:prepareWrite(valueHandle,0,'AA55'),incoming:false},
  {payload:prepareWriteResponse(valueHandle,0,'AA55'),incoming:true},
  {payload:executeWrite(0x01),incoming:false},
  {payload:attErrorResponse(0x18,valueHandle,0x0e),incoming:true}
]);
assert.strictEqual(rejectedExecute.candidateAsteraSessionWrites.length, 0);
assert.strictEqual(rejectedExecute.preparedWriteTransactions.length, 0);

const missingExecuteAck = parsePreparedOnly([
  {payload:prepareWrite(valueHandle,0,'AA55'),incoming:false},
  {payload:prepareWriteResponse(valueHandle,0,'AA55'),incoming:true},
  {payload:executeWrite(0x01),incoming:false}
]);
assert.strictEqual(missingExecuteAck.candidateAsteraSessionWrites.length, 0);
assert.strictEqual(missingExecuteAck.preparedWriteTransactions.length, 0);

// ATT Write Request must be confirmed by the device before it can become
// protocol evidence. Write Command remains unacknowledged by ATT design.
const acceptedWriteRequest = parsePreparedOnly([
  {payload:writeRequest(valueHandle,'CAFE'),incoming:false},
  {payload:writeResponse(),incoming:true}
]);
assert.strictEqual(acceptedWriteRequest.candidateAsteraSessionWrites.length, 1);
assert.strictEqual(acceptedWriteRequest.candidateAsteraSessionWrites[0].opcode, 0x12);
assert.strictEqual(acceptedWriteRequest.candidateAsteraSessionWrites[0].deviceConfirmed, true);

const rejectedWriteRequest = parsePreparedOnly([
  {payload:writeRequest(valueHandle,'CAFE'),incoming:false},
  {payload:attErrorResponse(0x12,valueHandle,0x03),incoming:true}
]);
assert.strictEqual(rejectedWriteRequest.candidateAsteraSessionWrites.length, 0);
const rejectedDirect = rejectedWriteRequest.attEvents.find(e=>e.opcode===0x12);
assert.ok(rejectedDirect);
assert.strictEqual(rejectedDirect.deviceConfirmed, false);
assert.strictEqual(rejectedDirect.rejected, true);

const missingWriteResponse = parsePreparedOnly([
  {payload:writeRequest(valueHandle,'CAFE'),incoming:false}
]);
assert.strictEqual(missingWriteResponse.candidateAsteraSessionWrites.length, 0);

const overlappingWriteRequests = parsePreparedOnly([
  {payload:writeRequest(valueHandle,'CAFE'),incoming:false},
  {payload:writeRequest(valueHandle,'BABE'),incoming:false},
  {payload:writeResponse(),incoming:true}
]);
assert.strictEqual(overlappingWriteRequests.candidateAsteraSessionWrites.length, 0);
const overlappingDirect = overlappingWriteRequests.attEvents.filter(e=>e.opcode===0x12);
assert.strictEqual(overlappingDirect.length, 2);
assert.ok(overlappingDirect.every(e=>e.protocolSequenceInvalid===true));
assert.ok(overlappingDirect.every(e=>e.deviceConfirmed!==true));

// A stale pending request from a disconnected logical connection must not be
// confirmable after the same HCI handle is reused.
const reconnectRows = [
  record(hciLeConnection(connectionHandle,address),1,0)
];
let reconnectPacket = acl(connectionHandle,0x0004,writeRequest(valueHandle,'CAFE'),false);
reconnectRows.push(record(reconnectPacket.packet,reconnectPacket.flags,1));
reconnectRows.push(record(hciDisconnect(connectionHandle,0x13),1,2));
reconnectRows.push(record(hciLeConnection(connectionHandle,address),1,3));
reconnectPacket = acl(connectionHandle,0x0004,writeResponse(),true);
reconnectRows.push(record(reconnectPacket.packet,reconnectPacket.flags,4));
const reconnectWriteState = analyzer.parseCapture(
  Buffer.concat([header,...reconnectRows]),
  {address,profile:explicitProfile}
);
assert.strictEqual(reconnectWriteState.candidateAsteraSessionWrites.length,0);
const staleRequest = reconnectWriteState.attEvents.find(e=>e.opcode===0x12);
assert.ok(staleRequest);
assert.strictEqual(staleRequest.deviceConfirmed,undefined);

// Prepared fragments must also die with the logical connection.
const preparedReconnectRows = [
  record(hciLeConnection(connectionHandle,address),1,0)
];
let preparedReconnectPacket = acl(
  connectionHandle,0x0004,prepareWrite(valueHandle,0,'AA55'),false
);
preparedReconnectRows.push(record(preparedReconnectPacket.packet,preparedReconnectPacket.flags,1));
preparedReconnectPacket = acl(
  connectionHandle,0x0004,prepareWriteResponse(valueHandle,0,'AA55'),true
);
preparedReconnectRows.push(record(preparedReconnectPacket.packet,preparedReconnectPacket.flags,2));
preparedReconnectRows.push(record(hciDisconnect(connectionHandle,0x13),1,3));
preparedReconnectRows.push(record(hciLeConnection(connectionHandle,address),1,4));
preparedReconnectPacket = acl(connectionHandle,0x0004,executeWrite(0x01),false);
preparedReconnectRows.push(record(preparedReconnectPacket.packet,preparedReconnectPacket.flags,5));
preparedReconnectPacket = acl(connectionHandle,0x0004,executeWriteResponse(),true);
preparedReconnectRows.push(record(preparedReconnectPacket.packet,preparedReconnectPacket.flags,6));
const preparedReconnectState = analyzer.parseCapture(
  Buffer.concat([header,...preparedReconnectRows]),
  {address,profile:explicitProfile}
);
assert.strictEqual(preparedReconnectState.candidateAsteraSessionWrites.length,0);
assert.strictEqual(preparedReconnectState.preparedWriteTransactions.length,0);

assert.throws(
  () => analyzer.normalizeGattProfile({
    analysisCoverage:{
      mappingWarning:'gatt_mapping_incomplete_capture_may_use_cached_handles'
    },
    services:explicitProfile.services,
    attributes:explicitProfile.attributes
  }),
  /gatt_profile_incomplete/
);

assert.strictEqual(
  analyzer.parseArgs([
    'node','astera-btsnoop-analyzer.js','capture.log',
    '--address',address,'--profile','reference.json'
  ]).profile,
  'reference.json'
);

process.stdout.write(JSON.stringify({
  ok: true,
  attEvents: result.attEvents.length,
  candidateAsteraSessionWrites: result.candidateAsteraSessionWrites.length,
  preparedWriteTransactions: result.preparedWriteTransactions.length,
  mtuEffective: result.mtuExchanges[0].effectiveMtu,
  securityEvents: result.securityEvents.length,
  attErrors: result.attErrors.length,
  smpPairingMetadataEvents: result.smpEvents.length,
  attributeUuidMappings: result.analysisCoverage.attributeUuidMappings,
  cachedUnmappedWrites: cachedResult.unmappedHostWrites.length,
  profiledCachedCandidates: cachedProfiled.candidateAsteraSessionWrites.length,
  connections: result.connections.length,
  smpEventsRedacted: result.smpEvents.length,
  disconnectReason: result.disconnects[0].reasonName
}, null, 2) + '\n');
