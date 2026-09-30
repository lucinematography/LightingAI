#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BTSNOOP_MAGIC = Buffer.from('btsnoop\0', 'binary');
const BTSNOOP_VERSION = 1;
const BTSNOOP_DATALINK_H4 = 1002;
const BTSNOOP_EPOCH_DELTA_US = 0x00dcddb30f2f8000n;
const ATT_CID = 0x0004;
const SMP_CID = 0x0006;
const ASTERA_BTB_PRIVATE_SERVICE = '0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65';
const CCCD_UUID = '00002902-0000-1000-8000-00805f9b34fb';

const ATT_NAMES = {
  0x01: 'ERROR_RESPONSE',
  0x02: 'EXCHANGE_MTU_REQUEST',
  0x03: 'EXCHANGE_MTU_RESPONSE',
  0x04: 'FIND_INFORMATION_REQUEST',
  0x05: 'FIND_INFORMATION_RESPONSE',
  0x08: 'READ_BY_TYPE_REQUEST',
  0x09: 'READ_BY_TYPE_RESPONSE',
  0x0a: 'READ_REQUEST',
  0x0b: 'READ_RESPONSE',
  0x10: 'READ_BY_GROUP_TYPE_REQUEST',
  0x11: 'READ_BY_GROUP_TYPE_RESPONSE',
  0x12: 'WRITE_REQUEST',
  0x13: 'WRITE_RESPONSE',
  0x16: 'PREPARE_WRITE_REQUEST',
  0x17: 'PREPARE_WRITE_RESPONSE',
  0x18: 'EXECUTE_WRITE_REQUEST',
  0x19: 'EXECUTE_WRITE_RESPONSE',
  0x1b: 'HANDLE_VALUE_NOTIFICATION',
  0x1d: 'HANDLE_VALUE_INDICATION',
  0x1e: 'HANDLE_VALUE_CONFIRMATION',
  0x52: 'WRITE_COMMAND'
};

const HCI_REASON_NAMES = {
  0x08: 'connection_timeout',
  0x13: 'remote_user_terminated_connection',
  0x14: 'remote_device_terminated_low_resources',
  0x15: 'remote_device_terminated_power_off',
  0x16: 'connection_terminated_by_local_host'
};

function hex(buffer) {
  return buffer && buffer.length ? buffer.toString('hex').toUpperCase() : '';
}

function normalizeAddress(value) {
  return String(value || '').trim().replace(/-/g, ':').toUpperCase();
}

function formatAddressLe(bytes) {
  return Array.from(bytes || []).reverse().map(v => v.toString(16).padStart(2, '0')).join(':').toUpperCase();
}

function uuid16(value) {
  return '0000' + value.toString(16).padStart(4, '0') + '-0000-1000-8000-00805f9b34fb';
}

function uuid128Le(bytes) {
  const h = Buffer.from(bytes).reverse().toString('hex');
  if (h.length !== 32) return h;
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    h.slice(12, 16),
    h.slice(16, 20),
    h.slice(20)
  ].join('-');
}

function uuidFromAtt(bytes) {
  if (!bytes) return '';
  if (bytes.length === 2) return uuid16(bytes.readUInt16LE(0));
  if (bytes.length === 16) return uuid128Le(bytes);
  return hex(bytes);
}

function parseBtsnoop(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16) {
    throw new Error('btsnoop_file_too_short');
  }
  if (!buffer.subarray(0, 8).equals(BTSNOOP_MAGIC)) {
    throw new Error('invalid_btsnoop_magic');
  }
  const version = buffer.readUInt32BE(8);
  const datalinkType = buffer.readUInt32BE(12);
  if (version !== BTSNOOP_VERSION) throw new Error('unsupported_btsnoop_version_' + version);
  if (datalinkType !== BTSNOOP_DATALINK_H4) throw new Error('unsupported_btsnoop_datalink_' + datalinkType);

  const records = [];
  let offset = 16;
  while (offset + 24 <= buffer.length) {
    const originalLength = buffer.readUInt32BE(offset);
    const includedLength = buffer.readUInt32BE(offset + 4);
    const flags = buffer.readUInt32BE(offset + 8);
    const drops = buffer.readUInt32BE(offset + 12);
    const timestampUs = buffer.readBigUInt64BE(offset + 16);
    offset += 24;
    if (includedLength > buffer.length - offset) {
      throw new Error('truncated_btsnoop_record');
    }
    const packet = buffer.subarray(offset, offset + includedLength);
    offset += includedLength;
    records.push({
      originalLength,
      includedLength,
      flags,
      drops,
      timestampUs,
      packet
    });
  }
  return {version, datalinkType, records};
}

function parseServiceDiscovery(att, services) {
  if (att.length < 3 || att[0] !== 0x11) return;
  const entryLen = att[1];
  if (entryLen < 6) return;
  for (let at = 2; at + entryLen <= att.length; at += entryLen) {
    const startHandle = att.readUInt16LE(at);
    const endHandle = att.readUInt16LE(at + 2);
    const uuidBytes = att.subarray(at + 4, at + entryLen);
    services.push({
      startHandle,
      endHandle,
      uuid: uuidFromAtt(uuidBytes)
    });
  }
}

function parseCharacteristicDiscovery(att, handleToUuid) {
  if (att.length < 3 || att[0] !== 0x09) return;
  const entryLen = att[1];
  if (entryLen < 7) return;
  for (let at = 2; at + entryLen <= att.length; at += entryLen) {
    const valueHandle = att.readUInt16LE(at + 3);
    const uuidBytes = att.subarray(at + 5, at + entryLen);
    handleToUuid.set(valueHandle, uuidFromAtt(uuidBytes));
  }
}

function parseDescriptorDiscovery(att, handleToUuid) {
  if (att.length < 2 || att[0] !== 0x05) return;
  const format = att[1];
  const entryLen = format === 0x01 ? 4 : format === 0x02 ? 18 : 0;
  if (!entryLen) return;
  for (let at = 2; at + entryLen <= att.length; at += entryLen) {
    const handle = att.readUInt16LE(at);
    const uuidBytes = att.subarray(at + 2, at + entryLen);
    handleToUuid.set(handle, uuidFromAtt(uuidBytes));
  }
}

function serviceForHandle(services, handle) {
  const match = services.find(s => handle >= s.startHandle && handle <= s.endHandle);
  return match ? match.uuid : '';
}

function attHandleAndValue(att) {
  const opcode = att[0];
  if ([0x0a, 0x12, 0x16, 0x1b, 0x1d, 0x52].includes(opcode) && att.length >= 3) {
    const handle = att.readUInt16LE(1);
    let value = Buffer.alloc(0);
    if ([0x12, 0x1b, 0x1d, 0x52].includes(opcode)) value = att.subarray(3);
    if (opcode === 0x16 && att.length >= 5) value = att.subarray(5);
    return {handle, value};
  }
  return {handle: null, value: Buffer.alloc(0)};
}

function parseCapture(buffer, options = {}) {
  const parsed = parseBtsnoop(buffer);
  const addressFilter = normalizeAddress(options.address);
  const connections = new Map();
  const servicesByConnection = new Map();
  const handleMapsByConnection = new Map();
  const fragments = new Map();
  const timeline = [];
  const attEvents = [];
  const smpEvents = [];
  const disconnects = [];

  const firstTimestamp = parsed.records.length ? parsed.records[0].timestampUs : BTSNOOP_EPOCH_DELTA_US;

  function elapsedMs(ts) {
    const delta = ts >= firstTimestamp ? ts - firstTimestamp : 0n;
    return Number(delta / 1000n);
  }

  function direction(flags) {
    return (flags & 1) ? 'controller_to_host' : 'host_to_controller';
  }

  function connectionServices(handle) {
    if (!servicesByConnection.has(handle)) servicesByConnection.set(handle, []);
    return servicesByConnection.get(handle);
  }

  function connectionHandleMap(handle) {
    if (!handleMapsByConnection.has(handle)) handleMapsByConnection.set(handle, new Map());
    return handleMapsByConnection.get(handle);
  }

  function keepConnection(handle) {
    if (!addressFilter) return true;
    const conn = connections.get(handle);
    return !!(conn && normalizeAddress(conn.address) === addressFilter);
  }

  function consumeL2cap(connectionHandle, cid, payload, dir, ts, recordIndex) {
    if (cid === ATT_CID) {
      if (!keepConnection(connectionHandle)) return;
      const services = connectionServices(connectionHandle);
      const handleMap = connectionHandleMap(connectionHandle);
      parseServiceDiscovery(payload, services);
      parseCharacteristicDiscovery(payload, handleMap);
      parseDescriptorDiscovery(payload, handleMap);

      const opcode = payload.length ? payload[0] : -1;
      const hv = attHandleAndValue(payload);
      const event = {
        recordIndex,
        elapsedMs: elapsedMs(ts),
        direction: dir,
        connectionHandle,
        peerAddress: connections.get(connectionHandle)?.address || '',
        opcode,
        opcodeName: ATT_NAMES[opcode] || ('ATT_0x' + opcode.toString(16).padStart(2, '0')),
        handle: hv.handle,
        valueHex: hex(hv.value),
        packetHex: hex(payload)
      };
      attEvents.push(event);
      timeline.push({kind:'att', ...event});
      return;
    }
    if (cid === SMP_CID) {
      if (!keepConnection(connectionHandle)) return;
      const event = {
        recordIndex,
        elapsedMs: elapsedMs(ts),
        direction: dir,
        connectionHandle,
        peerAddress: connections.get(connectionHandle)?.address || '',
        opcode: payload.length ? payload[0] : -1,
        packetHex: hex(payload)
      };
      smpEvents.push(event);
      timeline.push({kind:'smp', ...event});
    }
  }

  function consumeAcl(packet, dir, ts, recordIndex) {
    if (packet.length < 5 || packet[0] !== 0x02) return;
    const handleFlags = packet.readUInt16LE(1);
    const connectionHandle = handleFlags & 0x0fff;
    const pb = (handleFlags >> 12) & 0x03;
    const aclLength = packet.readUInt16LE(3);
    const aclData = packet.subarray(5, Math.min(packet.length, 5 + aclLength));
    const fragmentKey = dir + ':' + connectionHandle;

    if (pb === 0x01) {
      const pending = fragments.get(fragmentKey);
      if (!pending) return;
      pending.chunks.push(aclData);
      pending.collected += aclData.length;
      if (pending.collected >= pending.expected) {
        const full = Buffer.concat(pending.chunks).subarray(0, pending.expected);
        fragments.delete(fragmentKey);
        consumeL2cap(connectionHandle, pending.cid, full, dir, ts, recordIndex);
      }
      return;
    }

    if (aclData.length < 4) return;
    const l2Length = aclData.readUInt16LE(0);
    const cid = aclData.readUInt16LE(2);
    const body = aclData.subarray(4);
    if (body.length >= l2Length) {
      consumeL2cap(connectionHandle, cid, body.subarray(0, l2Length), dir, ts, recordIndex);
    } else {
      fragments.set(fragmentKey, {
        cid,
        expected: l2Length,
        collected: body.length,
        chunks: [body]
      });
    }
  }

  function consumeEvent(packet, dir, ts, recordIndex) {
    if (packet.length < 3 || packet[0] !== 0x04) return;
    const eventCode = packet[1];
    const params = packet.subarray(3);

    if (eventCode === 0x3e && params.length >= 12) {
      const subevent = params[0];
      if (subevent === 0x01 || subevent === 0x0a) {
        const status = params[1];
        const handle = params.readUInt16LE(2);
        const role = params[4];
        const addressType = params[5];
        const address = formatAddressLe(params.subarray(6, 12));
        const conn = {handle, address, addressType, role, status, elapsedMs: elapsedMs(ts)};
        connections.set(handle, conn);
        timeline.push({kind:'le_connection', recordIndex, direction:dir, ...conn});
      }
      return;
    }

    if (eventCode === 0x05 && params.length >= 4) {
      const status = params[0];
      const handle = params.readUInt16LE(1);
      const reason = params[3];
      if (!keepConnection(handle)) return;
      const event = {
        recordIndex,
        elapsedMs: elapsedMs(ts),
        direction: dir,
        connectionHandle: handle,
        peerAddress: connections.get(handle)?.address || '',
        status,
        reason,
        reasonName: HCI_REASON_NAMES[reason] || ('hci_reason_0x' + reason.toString(16).padStart(2, '0'))
      };
      disconnects.push(event);
      timeline.push({kind:'disconnect', ...event});
    }
  }

  parsed.records.forEach((record, index) => {
    const dir = direction(record.flags);
    if (!record.packet.length) return;
    if (record.packet[0] === 0x02) consumeAcl(record.packet, dir, record.timestampUs, index);
    else if (record.packet[0] === 0x04) consumeEvent(record.packet, dir, record.timestampUs, index);
  });

  for (const event of attEvents) {
    if (event.handle == null) continue;
    const map = handleMapsByConnection.get(event.connectionHandle);
    const services = servicesByConnection.get(event.connectionHandle) || [];
    event.attributeUuid = map?.get(event.handle) || '';
    event.serviceUuid = serviceForHandle(services, event.handle);
    if ((event.opcode === 0x12 || event.opcode === 0x52) &&
        event.direction === 'host_to_controller') {
      if (event.attributeUuid === CCCD_UUID) event.writeClass = 'standard_cccd';
      else if (event.serviceUuid === ASTERA_BTB_PRIVATE_SERVICE) event.writeClass = 'candidate_astera_session_write';
      else event.writeClass = 'other_write';
    }
  }

  const serviceList = [];
  for (const [connectionHandle, services] of servicesByConnection.entries()) {
    if (!keepConnection(connectionHandle)) continue;
    for (const service of services) {
      serviceList.push({connectionHandle, ...service});
    }
  }

  const candidateAsteraSessionWrites = attEvents.filter(e =>
    e.writeClass === 'candidate_astera_session_write'
  );

  return {
    format: {
      magic: 'btsnoop',
      version: parsed.version,
      datalinkType: parsed.datalinkType,
      recordCount: parsed.records.length
    },
    filter: {
      address: addressFilter || null
    },
    connections: Array.from(connections.values()).filter(c =>
      !addressFilter || normalizeAddress(c.address) === addressFilter
    ),
    services: serviceList,
    attEvents,
    smpEvents,
    disconnects,
    candidateAsteraSessionWrites,
    timeline
  };
}

function parseArgs(argv) {
  const args = {input:'', address:'', json:''};
  const rest = argv.slice(2);
  while (rest.length) {
    const token = rest.shift();
    if (token === '--address') args.address = rest.shift() || '';
    else if (token === '--json') args.json = rest.shift() || '';
    else if (!args.input) args.input = token;
    else throw new Error('unknown_argument_' + token);
  }
  if (!args.input) {
    throw new Error('usage: node backend/astera-btsnoop-analyzer.js <btsnoop_hci.log> [--address AA:BB:CC:DD:EE:FF] [--json out.json]');
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const input = fs.readFileSync(args.input);
  const result = parseCapture(input, {address:args.address});
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
  parseBtsnoop,
  parseCapture,
  uuidFromAtt,
  ASTERA_BTB_PRIVATE_SERVICE,
  CCCD_UUID
};
