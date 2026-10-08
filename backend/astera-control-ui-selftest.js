import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const source = fs.readFileSync(new URL('../app/src/main/assets/ble-control.js', import.meta.url), 'utf8');
function harness() {
  const requests = [], saved = [], timers = new Map(); let next = 1;
  const scan = { disabled: false }, status = { textContent: '', style: {} };
  const Android = {
    bleDiscover() {},
    asteraBtbReplayCapturedColor(id, address, preset, timeout) { requests.push({ id, address, preset, timeout }); },
    asteraBtbSaveTestSession(value) { saved.push(JSON.parse(value)); }
  };
  const window = { Android };
  const context = { window, Android, console, Date, CSS: { escape: s => s },
    localStorage: { getItem: () => 'sr' },
    document: { getElementById: id => id === 'bleScan' ? scan : id === 'bleStatus' ? status : null, querySelector: () => null, querySelectorAll: () => [] },
    setInterval: () => 1, clearInterval() {},
    setTimeout: (fn, delay) => { const id = next++; timers.set(id, { fn, delay }); return id; },
    clearTimeout: id => timers.delete(id)
  };
  vm.runInNewContext(source, context, { timeout: 1000, filename: fileURLToPath(new URL('../app/src/main/assets/ble-control.js', import.meta.url)) });
  const api = window.LightingAIBleControl;
  const finish = (request, error = '') => window.LightingAIAsteraBtbColorProbeResult(request.id, {address:request.address,preset:request.preset,writeStarted:true,writeCallbackObserved:true,deviceAppliedColorVerified:false,sessionVerified:false}, error);
  return { api, window, Android, requests, saved, timers, scan, status, finish };
}

let h = harness();
h.api.replayCapturedColor('AA:BB:CC:DD:EE:FF', 'CONNECT');
assert.equal(h.requests[0].preset, 'CONNECT'); assert.equal(h.requests[0].timeout, 45000);
h.api.replayCapturedColor('AA:BB:CC:DD:EE:FF', 'RED'); assert.equal(h.requests.length, 1, 'No concurrent native operations');
h.window.LightingAIBleLifecyclePause(); h.window.LightingAIBleLifecycleResume();
assert.equal(h.scan.disabled, true, 'Pending color/session request survives Activity pause');
h.finish(h.requests[0]); assert.equal(h.scan.disabled, false);
for (const preset of ['RED','WHITE','GREEN','BLUE']) { h.api.replayCapturedColor('AA:BB:CC:DD:EE:FF', preset); h.finish(h.requests.at(-1)); }
assert.deepEqual(h.saved.at(-1).tests.map(t => t.preset), ['CONNECT','RED','WHITE','GREEN','BLUE']);
assert.ok(h.saved.at(-1).tests.every(t => t.fixtureColorVerified === false && t.operatorObservation === 'NOT_RECORDED'), 'Local write callbacks never prove lamp color');
assert.equal(h.status.style.color, '#ffb5b5', 'Unverified transmission must not show green success');
const count = h.saved.length; h.finish(h.requests[0]); assert.equal(h.saved.length, count, 'Stale callback ignored');
h.api.replayCapturedColor('AA:BB:CC:DD:EE:FF','RED'); h.finish(h.requests.at(-1),'astera_capture_connect_status_133_attempt_3');
assert.equal(h.saved.at(-1).tests.at(-1).error,'astera_capture_connect_status_133_attempt_3');
assert.equal(h.requests.length,6,'No UI automatically replays after an uncertain write');
h.api.replayCapturedColor('AA:BB:CC:DD:EE:FF','BLUE');
const watchdog = [...h.timers.values()].find(t => t.delay === 50000); assert.ok(watchdog); watchdog.fn();
assert.equal(h.scan.disabled,false); assert.equal(h.saved.at(-1).tests.at(-1).error,'ble_native_callback_timeout');
h = harness(); h.Android.asteraBtbReplayCapturedColor = () => { throw new Error('bridge failure'); };
h.api.replayCapturedColor('AA:BB:CC:DD:EE:FF','RED'); assert.equal(h.scan.disabled,false); assert.equal(h.timers.size,0,'Bridge failure clears watchdog');
console.log('Astera Control UI execution tests passed: pause/resume, serialization, four presets, history, no invented ACK, stale callbacks, failure recovery and watchdog');
