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
const PRIMARY_SERVICE_UUID = '00002800-0000-1000-8000-00805f9b34fb';
const SECONDARY_SERVICE_UUID = '00002801-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_DECLARATION_UUID = '00002803-0000-1000-8000-00805f9b34fb';

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

const ATT_ERROR_NAMES = {
  0x01:'invalid_handle',
  0x02:'read_not_permitted',
  0x03:'write_not_permitted',
  0x04:'invalid_pdu',
  0x05:'insufficient_authentication',
  0x06:'request_not_supported',
  0x07:'invalid_offset',
  0x08:'insufficient_authorization',
  0x09:'prepare_queue_full',
  0x0a:'attribute_not_found',
  0x0b:'attribute_not_long',
  0x0c:'insufficient_encryption_key_size',
  0x0d:'invalid_attribute_value_length',
  0x0e:'unlikely_error',
  0x0f:'insufficient_encryption',
  0x10:'unsupported_group_type',
  0x11:'insufficient_resources',
  0x12:'database_out_of_sync',
  0x13:'value_not_allowed'
};

const SMP_FAILURE_NAMES = {
  0x01:'passkey_entry_failed',
  0x02:'oob_not_available',
  0x03:'authentication_requirements',
  0x04:'confirm_value_failed',
  0x05:'pairing_not_supported',
  0x06:'encryption_key_size',
  0x07:'command_not_supported',
  0x08:'unspecified_reason',
  0x09:'repeated_attempts',
  0x0a:'invalid_parameters',
  0x0b:'dhkey_check_failed',
  0x0c:'numeric_comparison_failed',
  0x0d:'br_edr_pairing_in_progress',
  0x0e:'cross_transport_key_derivation_not_allowed',
  0x0f:'key_rejected'
};

const HCI_REASON_NAMES = {
  0x08: 'connection_timeout',
  0x13: 'remote_user_terminated_connection',
  0x14: 'remote_device_terminated_low_resources',
  0x15: 'remote_device_terminated_power_off',
  0x16: 'connection_terminated_by_local_host'
};

const SMP_NAMES = {
  0x01: 'PAIRING_REQUEST',
  0x02: 'PAIRING_RESPONSE',
  0x03: 'PAIRING_CONFIRM',
  0x04: 'PAIRING_RANDOM',
  0x05: 'PAIRING_FAILED',
  0x06: 'ENCRYPTION_INFORMATION',
  0x07: 'MASTER_IDENTIFICATION',
  0x08: 'IDENTITY_INFORMATION',
  0x09: 'IDENTITY_ADDRESS_INFORMATION',
  0x0a: 'SIGNING_INFORMATION',
  0x0b: 'SECURITY_REQUEST',
  0x0c: 'PAIRING_PUBLIC_KEY',
  0x0d: 'PAIRING_DHKEY_CHECK',
  0x0e: 'PAIRING_KEYPRESS_NOTIFICATION'
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

function safeSmpMetadata(payload) {
  if (!payload || payload.length < 1) return {};
  const opcode = payload[0];
  if ((opcode === 0x01 || opcode === 0x02) && payload.length >= 7) {
    const authReq = payload[3];
    return {
      ioCapability:payload[1],
      oobDataFlag:payload[2],
      authReq,
      bondingFlags:authReq & 0x03,
      mitmRequested:(authReq & 0x04) !== 0,
      secureConnectionsRequested:(authReq & 0x08) !== 0,
      keypressRequested:(authReq & 0x10) !== 0,
      ct2Requested:(authReq & 0x20) !== 0,
      maxEncryptionKeySize:payload[4],
      initiatorKeyDistribution:payload[5],
      responderKeyDistribution:payload[6]
    };
  }
  if (opcode === 0x05 && payload.length >= 2) {
    const failureReason = payload[1];
    return {
      failureReason,
      failureReasonName:SMP_FAILURE_NAMES[failureReason] ||
        ('smp_failure_0x' + failureReason.toString(16).padStart(2,'0'))
    };
  }
  if (opcode === 0x0b && payload.length >= 2) {
    const authReq = payload[1];
    return {
      authReq,
      bondingFlags:authReq & 0x03,
      mitmRequested:(authReq & 0x04) !== 0,
      secureConnectionsRequested:(authReq & 0x08) !== 0,
      keypressRequested:(authReq & 0x10) !== 0,
      ct2Requested:(authReq & 0x20) !== 0
    };
  }
  return {};
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

function normalizeGattProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    throw new Error('invalid_gatt_profile');
  }
  const warning = profile.analysisCoverage &&
    typeof profile.analysisCoverage.mappingWarning === 'string'
      ? profile.analysisCoverage.mappingWarning
      : '';
  if (warning) {
    throw new Error('gatt_profile_incomplete_' + warning);
  }

  const serviceRanges = new Map();
  for (const row of Array.isArray(profile.services) ? profile.services : []) {
    if (!row || !Number.isInteger(row.startHandle) ||
        !Number.isInteger(row.endHandle) || !row.uuid) continue;
    const uuid = String(row.uuid).toLowerCase();
    const key = row.startHandle + ':' + row.endHandle;
    const existing = serviceRanges.get(key);
    if (existing && existing.uuid !== uuid) {
      throw new Error('gatt_profile_service_range_conflict_' + key);
    }
    serviceRanges.set(key,{
      startHandle:row.startHandle,
      endHandle:row.endHandle,
      uuid
    });
  }

  const attributes = new Map();
  for (const row of Array.isArray(profile.attributes) ? profile.attributes : []) {
    if (!row || !Number.isInteger(row.handle) || !row.uuid) continue;
    const uuid = String(row.uuid).toLowerCase();
    const existing = attributes.get(row.handle);
    if (existing && existing !== uuid) {
      throw new Error('gatt_profile_attribute_handle_conflict_' + row.handle);
    }
    attributes.set(row.handle,uuid);
  }

  const services = [...serviceRanges.values()];
  if (!services.some(s => s.uuid === ASTERA_BTB_PRIVATE_SERVICE)) {
    throw new Error('gatt_profile_missing_astera_private_service');
  }
  if (!attributes.size) {
    throw new Error('gatt_profile_missing_attribute_uuid_map');
  }

  return {
    services,
    attributes:[...attributes.entries()].map(([handle,uuid])=>({handle,uuid}))
  };
}

function parseCapture(buffer, options = {}) {
  const parsed = parseBtsnoop(buffer);
  const addressFilter = normalizeAddress(options.address);
  const explicitProfile = options.profile ? normalizeGattProfile(options.profile) : null;
  const profileAppliedConnectionIds = new Set();
  const connections = [];
  const activeConnections = new Map();
  const connectionById = new Map();
  const servicesByConnection = new Map();
  const handleMapsByConnection = new Map();
  const pendingDiscoveryByConnection = new Map();
  let connectionSequence = 0;
  const fragments = new Map();
  const timeline = [];
  const attEvents = [];
  const smpEvents = [];
  const attErrors = [];
  const disconnects = [];
  const preparedWriteFragmentsByConnection = new Map();
  const preparedWriteTransactions = [];
  const mtuEvents = [];
  const mtuStateByConnection = new Map();
  const securityEvents = [];

  const firstTimestamp = parsed.records.length ? parsed.records[0].timestampUs : BTSNOOP_EPOCH_DELTA_US;

  function elapsedMs(ts) {
    const delta = ts >= firstTimestamp ? ts - firstTimestamp : 0n;
    return Number(delta / 1000n);
  }

  function direction(flags) {
    return (flags & 1) ? 'controller_to_host' : 'host_to_controller';
  }

  function activeConnection(handle) {
    return activeConnections.get(handle) || null;
  }

  function connectionKey(handle) {
    const conn = activeConnection(handle);
    return conn ? conn.connectionId : 'untracked:' + handle;
  }

  function connectionServices(handle) {
    const key = connectionKey(handle);
    if (!servicesByConnection.has(key)) servicesByConnection.set(key, []);
    return servicesByConnection.get(key);
  }

  function connectionHandleMap(handle) {
    const key = connectionKey(handle);
    if (!handleMapsByConnection.has(key)) handleMapsByConnection.set(key, new Map());
    return handleMapsByConnection.get(key);
  }

  function keepConnection(handle) {
    if (!addressFilter) return true;
    const conn = activeConnection(handle);
    return !!(conn && normalizeAddress(conn.address) === addressFilter);
  }

  function discoveryState(handle) {
    const key = connectionKey(handle);
    if (!pendingDiscoveryByConnection.has(key)) {
      pendingDiscoveryByConnection.set(key, {
        readByTypeUuid:'',
        readByGroupTypeUuid:''
      });
    }
    return pendingDiscoveryByConnection.get(key);
  }

  function rememberDiscoveryRequest(handle, payload, dir) {
    if (dir !== 'host_to_controller' || !payload || payload.length < 1) return;
    const opcode = payload[0];
    const state = discoveryState(handle);
    if (opcode === 0x08 && payload.length >= 7) {
      state.readByTypeUuid = uuidFromAtt(payload.subarray(5));
    } else if (opcode === 0x10 && payload.length >= 7) {
      state.readByGroupTypeUuid = uuidFromAtt(payload.subarray(5));
    }
  }

  function applyDiscoveryResponse(handle, payload, dir, services, handleMap) {
    if (dir !== 'controller_to_host' || !payload || payload.length < 1) return;
    const opcode = payload[0];
    const state = discoveryState(handle);

    if (opcode === 0x09) {
      if (state.readByTypeUuid === CHARACTERISTIC_DECLARATION_UUID) {
        parseCharacteristicDiscovery(payload, handleMap);
      }
      state.readByTypeUuid = '';
      return;
    }

    if (opcode === 0x11) {
      if (state.readByGroupTypeUuid === PRIMARY_SERVICE_UUID ||
          state.readByGroupTypeUuid === SECONDARY_SERVICE_UUID) {
        parseServiceDiscovery(payload, services);
      }
      state.readByGroupTypeUuid = '';
      return;
    }

    if (opcode === 0x01 && payload.length >= 2) {
      const requestOpcode = payload[1];
      if (requestOpcode === 0x08) state.readByTypeUuid = '';
      if (requestOpcode === 0x10) state.readByGroupTypeUuid = '';
    }
  }

  function preparedQueue(handle) {
    const key = connectionKey(handle);
    if (!preparedWriteFragmentsByConnection.has(key)) {
      preparedWriteFragmentsByConnection.set(key, new Map());
    }
    return preparedWriteFragmentsByConnection.get(key);
  }

  function rememberPreparedWrite(handle, payload, dir, ts, recordIndex) {
    if (dir !== 'host_to_controller' || !payload || payload.length < 1) return;
    const opcode = payload[0];
    const conn = activeConnection(handle);
    if (!conn) return;

    if (opcode === 0x16 && payload.length >= 5) {
      const attributeHandle = payload.readUInt16LE(1);
      const offset = payload.readUInt16LE(3);
      const value = payload.subarray(5);
      const queue = preparedQueue(handle);
      if (!queue.has(attributeHandle)) queue.set(attributeHandle, []);
      queue.get(attributeHandle).push({
        offset,
        valueHex:hex(value),
        recordIndex,
        elapsedMs:elapsedMs(ts)
      });
      return;
    }

    if (opcode === 0x18 && payload.length >= 2) {
      const executeFlag = payload[1];
      const queue = preparedQueue(handle);
      if (executeFlag === 0x01) {
        for (const [attributeHandle, rawFragments] of queue.entries()) {
          const fragments = rawFragments.slice().sort((a,b)=>a.offset-b.offset);
          let expectedOffset = 0;
          let complete = true;
          const parts = [];
          for (const fragment of fragments) {
            const bytes = payloadBytesFromHex(fragment.valueHex);
            if (!bytes || fragment.offset !== expectedOffset) {
              complete = false;
              break;
            }
            parts.push(bytes);
            expectedOffset += bytes.length;
          }
          const value = complete ? Buffer.concat(parts) : Buffer.alloc(0);
          const transaction = {
            recordIndex,
            elapsedMs:elapsedMs(ts),
            direction:dir,
            connectionId:conn.connectionId,
            connectionHandle:handle,
            peerAddress:conn.address,
            opcode:0x18,
            opcodeName:'PREPARED_WRITE_EXECUTE',
            handle:attributeHandle,
            valueHex:hex(value),
            complete,
            fragments
          };
          preparedWriteTransactions.push(transaction);
          timeline.push({kind:'prepared_write', ...transaction});
        }
      }
      queue.clear();
    }
  }

  function payloadBytesFromHex(value) {
    const text = String(value || '').trim();
    if (!text || text.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(text)) return null;
    return Buffer.from(text,'hex');
  }

  function consumeL2cap(connectionHandle, cid, payload, dir, ts, recordIndex) {
    if (cid === ATT_CID) {
      if (!keepConnection(connectionHandle)) return;
      const services = connectionServices(connectionHandle);
      const handleMap = connectionHandleMap(connectionHandle);
      rememberDiscoveryRequest(connectionHandle, payload, dir);
      applyDiscoveryResponse(connectionHandle, payload, dir, services, handleMap);
      parseDescriptorDiscovery(payload, handleMap);
      rememberPreparedWrite(connectionHandle, payload, dir, ts, recordIndex);

      const opcode = payload.length ? payload[0] : -1;
      const hv = attHandleAndValue(payload);
      const conn = activeConnection(connectionHandle);
      const event = {
        recordIndex,
        elapsedMs: elapsedMs(ts),
        direction: dir,
        connectionId: conn?.connectionId || '',
        connectionHandle,
        peerAddress: conn?.address || '',
        opcode,
        opcodeName: ATT_NAMES[opcode] || ('ATT_0x' + opcode.toString(16).padStart(2, '0')),
        handle: hv.handle,
        valueHex: hex(hv.value),
        packetHex: hex(payload)
      };
      if (opcode === 0x01 && payload.length >= 5) {
        event.requestOpcode = payload[1];
        event.requestOpcodeName = ATT_NAMES[event.requestOpcode] ||
          ('ATT_0x' + event.requestOpcode.toString(16).padStart(2,'0'));
        event.errorHandle = payload.readUInt16LE(2);
        event.errorCode = payload[4];
        event.errorName = ATT_ERROR_NAMES[event.errorCode] ||
          ('att_error_0x' + event.errorCode.toString(16).padStart(2,'0'));
        attErrors.push(event);
      }
      if (opcode === 0x16 && payload.length >= 5) {
        event.prepareOffset = payload.readUInt16LE(3);
      }
      if (opcode === 0x18 && payload.length >= 2) {
        event.executeWriteFlag = payload[1];
      }
      if ((opcode === 0x02 || opcode === 0x03) && payload.length >= 3) {
        const mtu = payload.readUInt16LE(1);
        event.mtu = mtu;
        const key = event.connectionId || ('untracked:' + connectionHandle);
        if (!mtuStateByConnection.has(key)) {
          mtuStateByConnection.set(key, {
            connectionId:event.connectionId || '',
            connectionHandle,
            peerAddress:event.peerAddress || '',
            requestMtu:null,
            responseMtu:null,
            effectiveMtu:null
          });
        }
        const state = mtuStateByConnection.get(key);
        if (opcode === 0x02) state.requestMtu = mtu;
        if (opcode === 0x03) state.responseMtu = mtu;
        if (state.requestMtu != null && state.responseMtu != null) {
          state.effectiveMtu = Math.min(state.requestMtu, state.responseMtu);
        }
        mtuEvents.push({
          recordIndex,
          elapsedMs:event.elapsedMs,
          direction:dir,
          connectionId:event.connectionId,
          connectionHandle,
          peerAddress:event.peerAddress,
          opcode,
          opcodeName:event.opcodeName,
          mtu
        });
      }
      attEvents.push(event);
      timeline.push({kind:'att', ...event});
      return;
    }
    if (cid === SMP_CID) {
      if (!keepConnection(connectionHandle)) return;
      const conn = activeConnection(connectionHandle);
      const opcode = payload.length ? payload[0] : -1;
      const event = {
        recordIndex,
        elapsedMs: elapsedMs(ts),
        direction: dir,
        connectionId: conn?.connectionId || '',
        connectionHandle,
        peerAddress: conn?.address || '',
        opcode,
        opcodeName: SMP_NAMES[opcode] || ('SMP_0x' + opcode.toString(16).padStart(2, '0')),
        packetLength: payload.length,
        sensitivePayloadRedacted: true,
        ...safeSmpMetadata(payload)
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

    if ((eventCode === 0x08 && params.length >= 4) ||
        (eventCode === 0x59 && params.length >= 5)) {
      const status = params[0];
      const handle = params.readUInt16LE(1);
      if (!keepConnection(handle)) return;
      const conn = activeConnection(handle);
      const encryptionEnabled = params[3];
      const event = {
        recordIndex,
        elapsedMs:elapsedMs(ts),
        direction:dir,
        connectionId:conn?.connectionId || '',
        connectionHandle:handle,
        peerAddress:conn?.address || '',
        eventCode,
        eventName:eventCode === 0x59 ? 'encryption_change_v2' : 'encryption_change_v1',
        status,
        encryptionEnabled,
        encrypted:encryptionEnabled !== 0
      };
      if (eventCode === 0x59) event.encryptionKeySize = params[4];
      securityEvents.push(event);
      timeline.push({kind:'security', ...event});
      return;
    }

    if (eventCode === 0x30 && params.length >= 3) {
      const status = params[0];
      const handle = params.readUInt16LE(1);
      if (!keepConnection(handle)) return;
      const conn = activeConnection(handle);
      const event = {
        recordIndex,
        elapsedMs:elapsedMs(ts),
        direction:dir,
        connectionId:conn?.connectionId || '',
        connectionHandle:handle,
        peerAddress:conn?.address || '',
        eventCode,
        eventName:'encryption_key_refresh_complete',
        status
      };
      securityEvents.push(event);
      timeline.push({kind:'security', ...event});
      return;
    }

    if (eventCode === 0x3e && params.length >= 1) {
      const subevent = params[0];
      if ((subevent === 0x01 || subevent === 0x0a) && params.length >= 12) {
        const status = params[1];
        const handle = params.readUInt16LE(2);
        const role = params[4];
        const addressType = params[5];
        const address = formatAddressLe(params.subarray(6, 12));
        const connectionId = 'conn_' + (++connectionSequence);
        const conn = {
          connectionId,
          handle,
          address,
          addressType,
          role,
          status,
          elapsedMs: elapsedMs(ts)
        };
        connections.push(conn);
        activeConnections.set(handle, conn);
        connectionById.set(connectionId, conn);
        servicesByConnection.set(connectionId, []);
        handleMapsByConnection.set(connectionId, new Map());
        pendingDiscoveryByConnection.set(connectionId, {
          readByTypeUuid:'',
          readByGroupTypeUuid:''
        });
        fragments.delete('host_to_controller:' + handle);
        fragments.delete('controller_to_host:' + handle);
        timeline.push({kind:'le_connection', recordIndex, direction:dir, ...conn});
        return;
      }
      if (subevent === 0x05 && params.length >= 3) {
        const handle = params.readUInt16LE(1);
        if (!keepConnection(handle)) return;
        const conn = activeConnection(handle);
        const event = {
          recordIndex,
          elapsedMs:elapsedMs(ts),
          direction:dir,
          connectionId:conn?.connectionId || '',
          connectionHandle:handle,
          peerAddress:conn?.address || '',
          eventCode,
          subevent,
          eventName:'le_long_term_key_request',
          sensitivePayloadRedacted:true
        };
        securityEvents.push(event);
        timeline.push({kind:'security', ...event});
      }
      return;
    }

    if (eventCode === 0x05 && params.length >= 4) {
      const status = params[0];
      const handle = params.readUInt16LE(1);
      const reason = params[3];
      if (!keepConnection(handle)) return;
      const conn = activeConnection(handle);
      const event = {
        recordIndex,
        elapsedMs: elapsedMs(ts),
        direction: dir,
        connectionId: conn?.connectionId || '',
        connectionHandle: handle,
        peerAddress: conn?.address || '',
        status,
        reason,
        reasonName: HCI_REASON_NAMES[reason] || ('hci_reason_0x' + reason.toString(16).padStart(2, '0'))
      };
      disconnects.push(event);
      timeline.push({kind:'disconnect', ...event});
      activeConnections.delete(handle);
    }
  }

  parsed.records.forEach((record, index) => {
    const dir = direction(record.flags);
    if (!record.packet.length) return;
    if (record.packet[0] === 0x02) consumeAcl(record.packet, dir, record.timestampUs, index);
    else if (record.packet[0] === 0x04) consumeEvent(record.packet, dir, record.timestampUs, index);
  });

  if (explicitProfile) {
    for (const conn of connections) {
      if (addressFilter && normalizeAddress(conn.address) !== addressFilter) continue;
      const services = servicesByConnection.get(conn.connectionId) || [];
      const map = handleMapsByConnection.get(conn.connectionId) || new Map();
      if (services.length === 0 && map.size === 0) {
        servicesByConnection.set(
          conn.connectionId,
          explicitProfile.services.map(s => ({
            ...s,
            mappingSource:'explicit_profile'
          }))
        );
        const seededMap = new Map();
        for (const row of explicitProfile.attributes) {
          seededMap.set(row.handle,row.uuid);
        }
        handleMapsByConnection.set(conn.connectionId,seededMap);
        profileAppliedConnectionIds.add(conn.connectionId);
      }
    }
  }

  function annotateWrite(event) {
    if (!event || event.handle == null) return;
    const map = handleMapsByConnection.get(event.connectionId);
    const services = servicesByConnection.get(event.connectionId) || [];
    event.attributeUuid = map?.get(event.handle) || '';
    event.serviceUuid = serviceForHandle(services, event.handle);
    if (event.attributeUuid === CCCD_UUID) event.writeClass = 'standard_cccd';
    else if (event.serviceUuid === ASTERA_BTB_PRIVATE_SERVICE) event.writeClass = 'candidate_astera_session_write';
    else event.writeClass = 'other_write';
  }

  for (const event of attEvents) {
    if (event.handle == null) continue;
    const map = handleMapsByConnection.get(event.connectionId);
    const services = servicesByConnection.get(event.connectionId) || [];
    event.attributeUuid = map?.get(event.handle) || '';
    event.serviceUuid = serviceForHandle(services, event.handle);
    if ((event.opcode === 0x12 || event.opcode === 0x52) &&
        event.direction === 'host_to_controller') {
      annotateWrite(event);
    }
  }

  for (const event of preparedWriteTransactions) {
    annotateWrite(event);
  }

  for (const event of attErrors) {
    const map = handleMapsByConnection.get(event.connectionId);
    const services = servicesByConnection.get(event.connectionId) || [];
    event.attributeUuid = map?.get(event.errorHandle) || '';
    event.serviceUuid = serviceForHandle(services,event.errorHandle);
  }

  const serviceList = [];
  for (const [connectionId, services] of servicesByConnection.entries()) {
    const conn = connectionById.get(connectionId);
    if (!conn) continue;
    if (addressFilter && normalizeAddress(conn.address) !== addressFilter) continue;
    for (const service of services) {
      serviceList.push({
        connectionId,
        connectionHandle: conn.handle,
        peerAddress: conn.address,
        mappingSource:service.mappingSource || 'capture',
        ...service
      });
    }
  }

  const candidateAsteraSessionWrites = [
    ...attEvents.filter(e =>
      e.writeClass === 'candidate_astera_session_write'
    ),
    ...preparedWriteTransactions.filter(e =>
      e.writeClass === 'candidate_astera_session_write' && e.complete
    )
  ].sort((a,b)=>a.recordIndex-b.recordIndex);

  const attributeList = [];
  for (const [connectionId, map] of handleMapsByConnection.entries()) {
    const conn = connectionById.get(connectionId);
    if (!conn) continue;
    if (addressFilter && normalizeAddress(conn.address) !== addressFilter) continue;
    const services = servicesByConnection.get(connectionId) || [];
    for (const [handle, uuid] of map.entries()) {
      attributeList.push({
        connectionId,
        connectionHandle:conn.handle,
        peerAddress:conn.address,
        handle,
        uuid,
        serviceUuid:serviceForHandle(services,handle),
        mappingSource:profileAppliedConnectionIds.has(connectionId)
          ? 'explicit_profile'
          : 'capture'
      });
    }
  }
  attributeList.sort((x,y)=>
    x.connectionId.localeCompare(y.connectionId) ||
    x.handle-y.handle
  );

  const directHostWrites = attEvents.filter(e =>
    e.direction === 'host_to_controller' &&
    (e.opcode === 0x12 || e.opcode === 0x52)
  );
  const hostWriteEvents = [
    ...directHostWrites,
    ...preparedWriteTransactions
  ].sort((x,y)=>x.recordIndex-y.recordIndex);
  const unmappedHostWrites = hostWriteEvents.filter(e =>
    e.writeClass === 'other_write' && !e.serviceUuid
  );
  const asteraPrivateServiceMapped = serviceList.some(s =>
    String(s.uuid || '').toLowerCase() === ASTERA_BTB_PRIVATE_SERVICE
  );
  const capturedServiceCount = serviceList.filter(s =>
    s.mappingSource === 'capture'
  ).length;
  const capturedAttributeCount = attributeList.filter(x =>
    x.mappingSource === 'capture'
  ).length;
  const analysisCoverage = {
    serviceDiscoveryObserved:capturedServiceCount > 0,
    characteristicMappingObserved:capturedAttributeCount > 0,
    explicitProfileProvided:!!explicitProfile,
    explicitProfileUsed:profileAppliedConnectionIds.size > 0,
    explicitProfileConnectionCount:profileAppliedConnectionIds.size,
    mappingSource:profileAppliedConnectionIds.size > 0
      ? 'explicit_profile'
      : (capturedServiceCount > 0 || capturedAttributeCount > 0 ? 'capture' : 'none'),
    profileAssumption:profileAppliedConnectionIds.size > 0
      ? 'same_fixture_and_firmware_must_be_verified'
      : '',
    asteraPrivateServiceMapped,
    attributeUuidMappings:attributeList.length,
    hostWriteCount:hostWriteEvents.length,
    strictAsteraCandidateCount:candidateAsteraSessionWrites.length,
    unmappedHostWriteCount:unmappedHostWrites.length,
    mappingWarning:unmappedHostWrites.length > 0 && !asteraPrivateServiceMapped
      ? 'gatt_mapping_incomplete_capture_may_use_cached_handles'
      : ''
  };

  return {
    format: {
      magic: 'btsnoop',
      version: parsed.version,
      datalinkType: parsed.datalinkType,
      recordCount: parsed.records.length
    },
    filter: {
      address: addressFilter || null,
      profileProvided:!!explicitProfile
    },
    privacy: {
      addressFilterRequiredByCli: true,
      smpKeyMaterialRedacted: true,
      vendorPayloadsMayContainSensitiveSessionData: true,
      securityKeyMaterialRedacted: true,
      smpPairingMetadataOnly: true
    },
    connections: connections.filter(c =>
      !addressFilter || normalizeAddress(c.address) === addressFilter
    ),
    services: serviceList,
    attributes: attributeList,
    analysisCoverage,
    unmappedHostWrites,
    attEvents,
    attErrors,
    smpEvents,
    disconnects,
    preparedWriteTransactions,
    candidateAsteraSessionWrites,
    mtuEvents,
    mtuExchanges:Array.from(mtuStateByConnection.values()),
    securityEvents,
    timeline
  };
}

function parseArgs(argv) {
  const args = {input:'', address:'', json:'', profile:'', allowAll:false};
  const rest = argv.slice(2);
  while (rest.length) {
    const token = rest.shift();
    if (token === '--address') args.address = rest.shift() || '';
    else if (token === '--json') args.json = rest.shift() || '';
    else if (token === '--profile') args.profile = rest.shift() || '';
    else if (token === '--allow-all') args.allowAll = true;
    else if (!args.input) args.input = token;
    else throw new Error('unknown_argument_' + token);
  }
  if (!args.input) {
    throw new Error('usage: node backend/astera-btsnoop-analyzer.js <btsnoop_hci.log> --address AA:BB:CC:DD:EE:FF [--profile mapped-reference.json] [--json out.json]');
  }
  if (!args.address && !args.allowAll) {
    throw new Error('address_filter_required_use_--address_or_explicit_--allow-all');
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const input = fs.readFileSync(args.input);
  const profile = args.profile
    ? JSON.parse(fs.readFileSync(args.profile,'utf8'))
    : null;
  const result = parseCapture(input, {address:args.address,profile});
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
  parseArgs,
  normalizeGattProfile,
  uuidFromAtt,
  ASTERA_BTB_PRIVATE_SERVICE,
  CCCD_UUID,
  PRIMARY_SERVICE_UUID,
  SECONDARY_SERVICE_UUID,
  CHARACTERISTIC_DECLARATION_UUID
};
