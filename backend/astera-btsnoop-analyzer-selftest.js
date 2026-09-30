#!/usr/bin/env node
'use strict';

const assert = require('assert');
const analyzer = require('./astera-btsnoop-analyzer');

const EPOCH = 0x00dcddb30f2f8000n;

function record(packet, flags, ms) {
  const header = Buffer.alloc(24);
  header.writeUInt32BE(packet.length, 0);
  header.writeUInt32BE(packet.length, 4);
  header.writeUInt32BE(flags >>> 0, 8);
  header.writeUInt32BE(0, 12);
  header.writeBigUInt64BE(EPOCH + BigInt(ms) * 1000n, 16);
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

const connectionHandle = 0x000b;
const address = '11:22:33:44:55:66';
const asteraService = analyzer.ASTERA_BTB_PRIVATE_SERVICE;
const vendorCharacteristic = '12345678-1234-5678-9abc-def012345678';
const valueHandle = 0x0025;
const cccdHandle = 0x0026;

const packets = [];
packets.push(record(hciLeConnection(connectionHandle, address), 1, 0));

let p = acl(connectionHandle, 0x0004, readByGroupTypeResponse(0x0020, 0x002f, asteraService), true);
packets.push(record(p.packet, p.flags, 10));

p = acl(connectionHandle, 0x0004, readByTypeCharacteristicResponse(0x0024, valueHandle, vendorCharacteristic), true);
packets.push(record(p.packet, p.flags, 20));

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

const notify = Buffer.concat([
  Buffer.from([0x1b, valueHandle & 0xff, valueHandle >> 8]),
  Buffer.from('010203', 'hex')
]);
p = acl(connectionHandle, 0x0004, notify, true);
packets.push(record(p.packet, p.flags, 60));

packets.push(record(hciDisconnect(connectionHandle, 0x13), 1, 70));

const header = Buffer.alloc(16);
Buffer.from('btsnoop\0', 'binary').copy(header, 0);
header.writeUInt32BE(1, 8);
header.writeUInt32BE(1002, 12);

const capture = Buffer.concat([header, ...packets]);
const result = analyzer.parseCapture(capture, {address});

assert.strictEqual(result.format.version, 1);
assert.strictEqual(result.format.datalinkType, 1002);
assert.strictEqual(result.connections.length, 1);
assert.strictEqual(result.connections[0].address, address);
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

const notification = result.attEvents.find(e => e.opcode === 0x1b);
assert.ok(notification, 'notification missing');
assert.strictEqual(notification.valueHex, '010203');
assert.strictEqual(notification.serviceUuid, asteraService);

assert.strictEqual(result.disconnects.length, 1);
assert.strictEqual(result.disconnects[0].reason, 0x13);
assert.strictEqual(result.disconnects[0].reasonName, 'remote_user_terminated_connection');

const filteredOut = analyzer.parseCapture(capture, {address:'AA:BB:CC:DD:EE:FF'});
assert.strictEqual(filteredOut.attEvents.length, 0);
assert.strictEqual(filteredOut.disconnects.length, 0);

process.stdout.write(JSON.stringify({
  ok: true,
  attEvents: result.attEvents.length,
  candidateAsteraSessionWrites: result.candidateAsteraSessionWrites.length,
  disconnectReason: result.disconnects[0].reasonName
}, null, 2) + '\n');
